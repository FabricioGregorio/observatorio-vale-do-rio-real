/**
 * Despublicação de objetos do acervo — contrapartida de `publicar-acervo.ts`.
 *
 * Ferramenta própria, e não uma flag no publicador: publicar e despublicar têm
 * pré-condições opostas, e um executor que faz as duas coisas conforme o
 * argumento é um executor em que ninguém confia na hora de apagar prova.
 *
 * Padrão seguro: sem `--executar` nada é gravado e nada é apagado. O plano é
 * obrigatório e explícito (`--plano`), declarado em
 * `src/dados/plano-despublicacao-*.json`.
 *
 * ## Banco e storage não são uma transação
 *
 * PostgreSQL e R2 não compartilham transação, e fingir atomicidade seria pior
 * que admitir a falta dela. O processo é dividido em fases idempotentes:
 *
 * - **A — validar.** Confere cada item do plano contra o banco: `arquivoId`,
 *   chave, SHA-256, bytes, MIME, documento e visibilidade. Divergência em
 *   qualquer campo aborta **toda** a execução, antes de qualquer escrita.
 * - **B — banco.** Numa transação, retira a referência pública: `visibilidade`
 *   vai a `privado`, `url_publica` e `espelhado_em` a `NULL`. A linha
 *   permanece, para não quebrar integridade referencial — o §8 da decisão
 *   permite registro interno não público.
 * - **C — storage.** Apaga **uma chave por vez**, e somente as chaves do
 *   plano. Não existe remoção por prefixo neste arquivo.
 * - **D — verificar.** Reconsulta banco e bucket e diz o que ficou.
 *
 * Se C falhar depois de B, o estado intermediário é relatado e **não** é
 * revertido: reverter republicaria objeto que a decisão humana retirou. A
 * reexecução termina o serviço, porque cada fase reconhece o que já está
 * feito — linha já privada e chave já ausente contam como concluídas.
 *
 * ## Uso
 *
 *     node --import tsx scripts/despublicar-acervo.ts --plano 2026-09-18
 *     node --import tsx scripts/despublicar-acervo.ts --plano 2026-09-18 --executar
 */
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { loadEnvFile } from "node:process";
import { pathToFileURL } from "node:url";
import { DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { z } from "zod";

import {
  exigirPlano,
  type ItemDoPlano,
  idDoPlanoEmArgv,
  type PlanoDeclarado,
} from "../src/dados/plano-de-despublicacao";
import { cliente } from "../src/lib/storage";
import { exigirConfiguracao as exigir } from "../src/lib/storage-configuracao";

export class FalhaDespublicacao extends Error {}

/** Estado de um item, apurado na fase A. */
export type EstadoDoItem =
  | "publicado" /** no banco como público; precisa sair */
  | "ja_privado" /** já retirado do banco numa execução anterior */;

export type SituacaoNoBucket = "presente" | "ausente";

export function opcoes(argv: readonly string[]): {
  executar: boolean;
  plano: PlanoDeclarado;
} {
  const posicao = argv.indexOf("--plano");
  const restante =
    posicao === -1
      ? [...argv]
      : [...argv.slice(0, posicao), ...argv.slice(posicao + 2)];
  const flags = z
    .array(z.enum(["--dry-run", "--executar"]))
    .max(1)
    .parse(restante);
  return {
    executar: flags[0] === "--executar",
    plano: exigirPlano(idDoPlanoEmArgv(argv)),
  };
}

type Conexao = {
  query(sql: string, valores?: unknown[]): Promise<{ rows: unknown[] }>;
  release(destruir?: boolean): void;
};

const linhaSchema = z.object({
  id: z.string(),
  chave_storage: z.string(),
  sha256: z.string(),
  bytes: z.coerce.number(),
  mime_type: z.string(),
  visibilidade: z.string(),
  url_publica: z.string().nullable(),
  documentos: z.array(z.string()),
  dependentes: z.coerce.number(),
});

export type LinhaDoBanco = z.infer<typeof linhaSchema>;

/**
 * Confere um item contra a linha do banco e devolve seu estado.
 *
 * Pura de propósito: é a regra que decide se a execução segue, e regra assim
 * precisa ser testável sem banco.
 */
export function conferir(
  item: ItemDoPlano,
  linha: LinhaDoBanco | undefined,
): EstadoDoItem {
  if (!linha)
    throw new FalhaDespublicacao(
      `Sem linha de arquivo para ${item.arquivoId} (${item.chave}).`,
    );

  const divergencias: string[] = [];
  if (linha.id !== item.arquivoId) divergencias.push("arquivoId");
  if (linha.chave_storage !== item.chave) divergencias.push("chave_storage");
  if (linha.sha256 !== item.sha256) divergencias.push("sha256");
  if (linha.bytes !== item.bytes) divergencias.push("bytes");
  if (linha.mime_type !== item.mimeType) divergencias.push("mime_type");
  if (!linha.documentos.includes(item.documento))
    divergencias.push("documento");
  if (linha.dependentes > 0) divergencias.push("dependentes");
  if (divergencias.length)
    throw new FalhaDespublicacao(
      `${item.chave}: divergência em ${divergencias.join(", ")}. ` +
        "Nada foi alterado.",
    );

  if (linha.visibilidade === "privado") {
    if (linha.url_publica !== null)
      throw new FalhaDespublicacao(
        `${item.chave}: privado com url_publica preenchida. Nada foi alterado.`,
      );
    return "ja_privado";
  }
  if (linha.visibilidade !== "publico")
    throw new FalhaDespublicacao(
      `${item.chave}: visibilidade inesperada "${linha.visibilidade}". ` +
        "Nada foi alterado.",
    );
  if (linha.url_publica !== item.urlPublica)
    throw new FalhaDespublicacao(
      `${item.chave}: url_publica divergente do plano. Nada foi alterado.`,
    );
  return "publicado";
}

async function linhasDoPlano(
  c: Conexao,
  plano: PlanoDeclarado,
): Promise<Map<string, LinhaDoBanco>> {
  const linhas = z.array(linhaSchema).parse(
    (
      await c.query(
        `select a.id::text id,
                a.chave_storage,
                a.sha256,
                a.bytes,
                a.mime_type,
                a.visibilidade::text visibilidade,
                a.url_publica,
                coalesce(
                  (select array_agg(d.slug::text order by d.slug)
                     from documento_arquivo da
                     join documento d on d.id = da.documento_id
                    where da.arquivo_id = a.id),
                  '{}'::text[]
                ) documentos,
                (select count(*)::int
                   from arquivo o
                  where o.derivado_de_id = a.id
                     or o.replica_de_id = a.id) dependentes
           from arquivo a
          where a.id = any($1::uuid[])`,
        [plano.itens.map((i) => i.arquivoId)],
      )
    ).rows,
  );
  return new Map(linhas.map((l) => [l.id, l]));
}

async function situacaoNoBucket(chave: string): Promise<SituacaoNoBucket> {
  try {
    await cliente().send(
      new HeadObjectCommand({
        Bucket: exigir("STORAGE_PUBLIC_BUCKET"),
        Key: chave,
      }),
    );
    return "presente";
  } catch (erro) {
    const status = (erro as { $metadata?: { httpStatusCode?: number } })
      .$metadata?.httpStatusCode;
    if (status === 404) return "ausente";
    throw erro;
  }
}

/** Apaga exatamente uma chave. Não existe variante por prefixo. */
async function apagarChave(chave: string): Promise<void> {
  await cliente().send(
    new DeleteObjectCommand({
      Bucket: exigir("STORAGE_PUBLIC_BUCKET"),
      Key: chave,
    }),
  );
}

async function principal(): Promise<void> {
  const { executar, plano } = opcoes(process.argv.slice(2));
  if (existsSync(".env.local")) loadEnvFile(".env.local");
  if (exigir("STORAGE_PUBLIC_BUCKET") !== "observatorio-publico")
    throw new FalhaDespublicacao("Bucket público inesperado.");

  const { poolManutencao, encerrarManutencao } = await import(
    "../src/dados/clienteManutencao"
  );
  const conexao = (await poolManutencao.connect()) as unknown as Conexao;
  let destruir = false;
  try {
    // ── FASE A — validar tudo antes de escrever qualquer coisa ──────────
    const linhas = await linhasDoPlano(conexao, plano);
    const estados = new Map<string, EstadoDoItem>();
    for (const item of plano.itens)
      estados.set(item.chave, conferir(item, linhas.get(item.arquivoId)));

    const noBucket = new Map<string, SituacaoNoBucket>();
    for (const item of plano.itens)
      noBucket.set(item.chave, await situacaoNoBucket(item.chave));

    const aRetirarDoBanco = plano.itens.filter(
      (i) => estados.get(i.chave) === "publicado",
    );
    const aApagarDoStorage = plano.itens.filter(
      (i) => noBucket.get(i.chave) === "presente",
    );

    for (const item of plano.itens)
      console.log(
        JSON.stringify({
          plano: plano.id,
          chave: item.chave,
          arquivoId: item.arquivoId,
          documento: item.documento,
          banco: estados.get(item.chave),
          bucket: noBucket.get(item.chave),
          motivo: item.motivo,
        }),
      );

    if (!executar) {
      console.log(
        `DRY-RUN plano ${plano.id}: ${plano.itens.length} itens conferidos; ` +
          `${aRetirarDoBanco.length} a retirar do banco, ` +
          `${aApagarDoStorage.length} a apagar do storage. ` +
          "Nenhum UPDATE, nenhum DELETE.",
      );
      return;
    }

    // ── FASE B — banco, em transação ────────────────────────────────────
    let retirados = 0;
    if (aRetirarDoBanco.length) {
      await conexao.query("begin");
      const [trava] = z
        .array(z.object({ obtido: z.boolean() }))
        .parse(
          (
            await conexao.query(
              "select pg_try_advisory_xact_lock(hashtext('publicacao-acervo')) as obtido",
            )
          ).rows,
        );
      if (!trava?.obtido)
        throw new FalhaDespublicacao("Outro executor está operando o acervo.");
      retirados = (
        await conexao.query(
          `update arquivo
              set visibilidade = 'privado',
                  url_publica = null,
                  espelhado_em = null,
                  atualizado_em = now()
            where id = any($1::uuid[])
              and visibilidade = 'publico'
            returning id`,
          [aRetirarDoBanco.map((i) => i.arquivoId)],
        )
      ).rows.length;
      if (retirados !== aRetirarDoBanco.length) {
        await conexao.query("rollback");
        throw new FalhaDespublicacao(
          `UPDATE afetou ${retirados} de ${aRetirarDoBanco.length}. ` +
            "Transação revertida.",
        );
      }
      await conexao.query("commit");
    }

    // ── FASE C — storage, chave por chave ───────────────────────────────
    const apagadas: string[] = [];
    try {
      for (const item of aApagarDoStorage) {
        await apagarChave(item.chave);
        apagadas.push(item.chave);
      }
    } catch (erro) {
      console.error(
        `Banco já concluído (${retirados} retirados); storage parcial: ` +
          `${apagadas.length} de ${aApagarDoStorage.length} apagadas. ` +
          "Reexecutar com --executar termina a remoção; não reverter o banco.",
      );
      throw erro;
    }

    // ── FASE D — verificar ──────────────────────────────────────────────
    const depois = await linhasDoPlano(conexao, plano);
    const aindaPublicos = plano.itens.filter(
      (i) => depois.get(i.arquivoId)?.visibilidade === "publico",
    );
    const aindaNoBucket: string[] = [];
    for (const item of plano.itens)
      if ((await situacaoNoBucket(item.chave)) === "presente")
        aindaNoBucket.push(item.chave);

    console.log(
      `EXECUÇÃO plano ${plano.id}: ${retirados} retirados do banco, ` +
        `${apagadas.length} apagadas do storage, ` +
        `${aindaPublicos.length} ainda públicos no banco, ` +
        `${aindaNoBucket.length} ainda no bucket.`,
    );
    if (aindaPublicos.length || aindaNoBucket.length)
      throw new FalhaDespublicacao(
        "Estado final incompleto; ver linhas acima e reexecutar.",
      );
  } catch (erro) {
    destruir = true;
    await conexao.query("rollback").catch(() => {});
    throw erro;
  } finally {
    conexao.release(destruir);
    await encerrarManutencao();
  }
}

if (
  process.argv[1] &&
  pathToFileURL(resolve(process.argv[1])).href === import.meta.url
) {
  principal().catch((erro) => {
    console.error(erro instanceof Error ? erro.message : erro);
    console.error(
      "Despublicação interrompida. Conferir plano, banco e bucket; " +
        "não repetir com --executar sem resolver a falha.",
    );
    process.exitCode = 1;
  });
}
