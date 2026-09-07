import { basename } from "node:path";
import { z } from "zod";
import {
  FalhaEspelhamento,
  PersistenciaDesfeita,
} from "../../src/lib/espelhamento-privado";
import type { OperacaoPrivada } from "./plano-espelhamento";

export interface Conexao {
  query(sql: string, valores?: unknown[]): Promise<{ rows: unknown[] }>;
  release(destruir?: boolean): void;
}

const registroSchema = z.object({
  bucket: z.string(),
  visibilidade: z.string(),
  url_publica: z.string().nullable(),
  sha256: z.string(),
  bytes: z.coerce.number(),
  mime_type: z.string(),
  origem_url: z.string().nullable(),
  origem_sistema: z.string().nullable(),
  espelhado: z.boolean(),
  slug: z.string().nullable(),
  principal: z.boolean().nullable(),
  versao: z.number().nullable(),
});

/** Apenas DML/SELECT, sempre pela credencial de manutenção. */
export class BancoEspelhamento {
  constructor(private readonly conectar: () => Promise<Conexao>) {}

  async usar<T>(acao: (c: Conexao) => Promise<T>): Promise<T> {
    const c = await this.conectar();
    let destruir = false;
    try {
      return await acao(c);
    } catch (erro) {
      destruir = true;
      throw erro;
    } finally {
      c.release(destruir);
    }
  }

  async comExclusividade<T>(acao: () => Promise<T>): Promise<T> {
    return this.usar(async (c) => {
      // Transação mantém a trava também em conexões com pooler transacional.
      await c.query("begin");
      const [linha] = z
        .array(z.object({ obtido: z.boolean() }))
        .parse(
          (
            await c.query(
              "select pg_try_advisory_xact_lock(hashtext('primeiro-espelhamento-privado')) as obtido",
            )
          ).rows,
        );
      if (!linha?.obtido)
        throw new FalhaEspelhamento(
          "Outro executor já está processando o lote.",
        );
      try {
        return await acao();
      } finally {
        await c.query("rollback");
      }
    });
  }

  async conferirContexto(): Promise<number> {
    return this.usar(async (c) => {
      const [r] = z
        .array(
          z.object({
            documentos: z.literal(33),
            pessoas: z.literal(0),
            consentimentos: z.literal(0),
            publicaveis: z.literal(0),
            publicos: z.literal(0),
            arquivos: z.number().int().min(0).max(10),
            vinculos: z.number().int().min(0).max(10),
          }),
        )
        .length(1)
        .parse(
          (
            await c.query(`select
        (select count(*)::int from documento) documentos,
        (select count(*)::int from pessoa) pessoas,
        (select count(*)::int from consentimento) consentimentos,
        (select count(*)::int from documento where estado_documental='PUBLICAVEL') publicaveis,
        (select count(*)::int from vw_anexo_publico) publicos,
        (select count(*)::int from arquivo) arquivos,
        (select count(*)::int from documento_arquivo) vinculos`)
          ).rows,
        );
      if (!r || r.arquivos !== r.vinculos)
        throw new FalhaEspelhamento("Contagens do banco divergentes.");
      return r.arquivos;
    });
  }

  private async documento(
    c: Conexao,
    op: OperacaoPrivada,
    bloquear = false,
  ): Promise<string> {
    const [d] = z
      .array(
        z.object({
          id: z.string().uuid(),
          estado_documental: z.literal("ESPELHAVEL"),
          revisao_privacidade: z.literal("pendente"),
          status: z.literal("rascunho"),
          arquivado_em: z.null(),
        }),
      )
      .length(1)
      .parse(
        (
          await c.query(
            `select id, estado_documental, revisao_privacidade, status, arquivado_em
       from documento where slug=$1${bloquear ? " for share" : ""}`,
            [op.slugDocumento],
          )
        ).rows,
      );
    if (!d) throw new FalhaEspelhamento(`Documento inválido: ${op.codigo}.`);
    return d.id;
  }

  private async registro(
    c: Conexao,
    op: OperacaoPrivada,
  ): Promise<"ausente" | "completo"> {
    const linhas = z.array(registroSchema).parse(
      (
        await c.query(
          `select
      a.bucket, a.visibilidade, a.url_publica, a.sha256, a.bytes, a.mime_type,
      a.origem_url, a.origem_sistema, (a.espelhado_em is not null) espelhado,
      d.slug, da.principal, da.versao
      from arquivo a left join documento_arquivo da on da.arquivo_id=a.id
      left join documento d on d.id=da.documento_id
      where a.bucket=$1 and a.chave_storage=$2`,
          [op.bucket, op.chave],
        )
      ).rows,
    );
    if (linhas.length === 0) return "ausente";
    const [r] = linhas;
    if (
      linhas.length !== 1 ||
      !r ||
      r.bucket !== op.bucket ||
      r.visibilidade !== "privado" ||
      r.url_publica !== null ||
      r.sha256 !== op.sha256 ||
      r.bytes !== op.bytes ||
      r.mime_type !== op.mimeType ||
      r.origem_url !== op.origemUrl ||
      r.origem_sistema !== op.origemSistema ||
      !r.espelhado ||
      r.slug !== op.slugDocumento ||
      r.principal !== op.principal ||
      r.versao !== 1
    )
      throw new FalhaEspelhamento(
        `Registro ou vínculo divergente: ${op.codigo} / ${op.chave}.`,
      );
    return "completo";
  }

  async consultar(op: OperacaoPrivada): Promise<"ausente" | "completo"> {
    return this.usar(async (c) => {
      await this.documento(c, op);
      return this.registro(c, op);
    });
  }

  private async iniciar(c: Conexao, op: OperacaoPrivada): Promise<void> {
    await c.query("begin");
    await c.query("set local lock_timeout = '15s'");
    await c.query("set local statement_timeout = '20s'");
    // A reconciliação usa a mesma trava e aguarda o término da transação
    // anterior; SELECT isolado poderia observar ausência antes do COMMIT.
    await c.query("select pg_advisory_xact_lock(hashtext($1))", [
      `${op.bucket}/${op.chave}`,
    ]);
  }

  async persistir(op: OperacaoPrivada): Promise<void> {
    const c = await this.conectar();
    let commitIniciado = false;
    let destruir = false;
    try {
      await this.iniciar(c, op);
      const documentoId = await this.documento(c, op, true);
      if ((await this.registro(c, op)) !== "ausente")
        throw new FalhaEspelhamento("Registro apareceu durante a operação.");
      const [a] = z
        .array(z.object({ id: z.string().uuid() }))
        .length(1)
        .parse(
          (
            await c.query(
              `insert into arquivo (bucket, chave_storage, visibilidade, url_publica,
         nome_original, tipo_midia, mime_type, bytes, sha256, origem_url, origem_sistema, espelhado_em)
         values ($1,$2,'privado',NULL,$3,$4,$5,$6,$7,$8,$9,now()) returning id`,
              [
                op.bucket,
                op.chave,
                basename(op.caminho),
                op.mimeType === "application/pdf" ? "pdf" : "imagem",
                op.mimeType,
                op.bytes,
                op.sha256,
                op.origemUrl,
                op.origemSistema,
              ],
            )
          ).rows,
        );
      if (!a) throw new FalhaEspelhamento("INSERT sem identificador.");
      await c.query(
        `insert into documento_arquivo (documento_id, arquivo_id, versao, principal)
        values ($1,$2,1,$3)`,
        [documentoId, a.id, op.principal],
      );
      commitIniciado = true;
      await c.query("commit");
    } catch {
      if (commitIniciado) {
        destruir = true;
        throw new FalhaEspelhamento(
          "COMMIT incerto; reconciliar antes de qualquer exclusão.",
        );
      }
      try {
        await c.query("rollback");
      } catch {
        destruir = true;
        throw new FalhaEspelhamento(
          "ROLLBACK incerto; reconciliar antes de qualquer exclusão.",
        );
      }
      throw new PersistenciaDesfeita(
        "Persistência recusada; ROLLBACK confirmado.",
      );
    } finally {
      c.release(destruir);
    }
  }

  async reconciliar(
    op: OperacaoPrivada,
  ): Promise<"confirmada" | "desfeita" | "incerta"> {
    try {
      return await this.usar(async (c) => {
        await this.iniciar(c, op);
        try {
          return (await this.registro(c, op)) === "completo"
            ? "confirmada"
            : "desfeita";
        } finally {
          await c.query("rollback");
        }
      });
    } catch {
      return "incerta";
    }
  }
}
