/**
 * Publicação do acervo — lote autorizado de 2026-09-16.
 *
 * Padrão seguro: sem `--executar` o script apenas planeja, confere hashes da
 * fonte canônica e consulta o bucket público. Nenhum `PutObject` e nenhum
 * INSERT acontecem fora de `--executar`.
 *
 * ## Ordem das operações, e por que ela é essa
 *
 * 1. Confere o SHA-256 de cada origem contra o lote declarado. Divergência
 *    aborta antes de qualquer escrita: publicar conteúdo diferente do
 *    aprovado é o pior erro possível num site de prestação de contas.
 * 2. `HeadObject` em cada chave. Ausente → envia. Presente com o mesmo
 *    SHA-256 → reaproveita, sem sobrescrever. Presente com hash diferente →
 *    aborta nomeando a chave.
 * 3. Depois do envio, baixa o objeto de volta por acesso autenticado e
 *    recalcula SHA-256 e bytes, conferindo também `Content-Type` e
 *    `Cache-Control`. ETag não é prova de integridade.
 * 4. Só então, em **uma transação**, insere as linhas de `arquivo`, cria os
 *    vínculos em `documento_arquivo` e promove os documentos do lote.
 *
 * O upload é idempotente por chave, então repetir o comando depois de uma
 * falha de rede não duplica objeto nem registro.
 *
 * ## Uso
 *
 * O lote é obrigatório e explícito. Não há padrão, não há "último lote" e não
 * há detecção por data: ver `src/dados/lotes-de-publicacao.ts`.
 *
 *     node --import tsx scripts/publicar-acervo.ts --lote 2026-09-18
 *     node --import tsx scripts/publicar-acervo.ts --lote 2026-09-18 --executar
 */
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile, realpath } from "node:fs/promises";
import { isAbsolute, join, relative, resolve, sep } from "node:path";
import { loadEnvFile } from "node:process";
import { pathToFileURL } from "node:url";
import {
  GetObjectCommand,
  HeadObjectCommand,
  type S3Client,
} from "@aws-sdk/client-s3";
import { z } from "zod";

import type { EntradaDoLote } from "../src/dados/lote-publicacao";
import {
  exigirLote,
  idDoLoteEmArgv,
  type LoteDeclarado,
} from "../src/dados/lotes-de-publicacao";
import { montarRotulo } from "../src/dados/pesquisa/credito-fotografico";
import { lerInventario, slugDoItem } from "../src/lib/espelhamento";
import {
  CACHE_CONTROL_PUBLICO,
  cliente,
  enviarObjeto,
  urlPublica,
} from "../src/lib/storage";
import { exigirConfiguracao as exigir } from "../src/lib/storage-configuracao";

export class FalhaPublicacao extends Error {}

export function modoReal(argv: string[]): boolean {
  const flags = z
    .array(z.enum(["--dry-run", "--executar"]))
    .max(1)
    .parse(argv);
  return flags[0] === "--executar";
}

/**
 * Opções da execução. O lote é obrigatório e não tem padrão.
 *
 * `--lote` e seu valor são retirados antes de `modoReal`, que continua
 * recusando qualquer argumento que não conheça — argumento estranho aqui
 * costuma ser erro de digitação em algo que publica.
 */
export function opcoes(argv: readonly string[]): {
  executar: boolean;
  lote: LoteDeclarado;
} {
  const posicao = argv.indexOf("--lote");
  const restante =
    posicao === -1
      ? [...argv]
      : [...argv.slice(0, posicao), ...argv.slice(posicao + 2)];
  return {
    executar: modoReal(restante),
    lote: exigirLote(idDoLoteEmArgv(argv)),
  };
}

/** Impede escape por `..`, caminho absoluto ou link para fora da fonte. */
export async function lerFonte(raiz: string, caminho: string): Promise<Buffer> {
  if (isAbsolute(caminho))
    throw new FalhaPublicacao(`Origem fora da fonte canônica: ${caminho}.`);
  const base = await realpath(raiz);
  const destino = await realpath(join(base, caminho));
  const rel = relative(base, destino);
  if (isAbsolute(rel) || rel === ".." || rel.startsWith(`..${sep}`))
    throw new FalhaPublicacao(`Origem fora da fonte canônica: ${caminho}.`);
  return readFile(destino);
}

export type Situacao = "ausente" | "identico" | "divergente";

export async function situacaoDaChave(
  chave: string,
  sha256: string,
): Promise<Situacao> {
  const s3: S3Client = cliente();
  try {
    const cabeca = await s3.send(
      new HeadObjectCommand({
        Bucket: exigir("STORAGE_PUBLIC_BUCKET"),
        Key: chave,
      }),
    );
    return cabeca.Metadata?.sha256 === sha256 ? "identico" : "divergente";
  } catch (erro) {
    const status = (erro as { $metadata?: { httpStatusCode?: number } })
      .$metadata?.httpStatusCode;
    if (status === 404) return "ausente";
    throw erro;
  }
}

/** Releitura autenticada: hash do corpo remoto, nunca do ETag declarado. */
export async function conferirRemoto(entrada: EntradaDoLote): Promise<void> {
  const resposta = await cliente().send(
    new GetObjectCommand({
      Bucket: exigir("STORAGE_PUBLIC_BUCKET"),
      Key: entrada.chave,
    }),
  );
  if (!resposta.Body)
    throw new FalhaPublicacao(`Objeto sem corpo: ${entrada.chave}.`);
  const corpo = Buffer.from(await resposta.Body.transformToByteArray());
  const sha256 = createHash("sha256").update(corpo).digest("hex");
  const problemas: string[] = [];
  if (sha256 !== entrada.sha256) problemas.push("sha256");
  if (corpo.byteLength !== entrada.bytes) problemas.push("bytes");
  if (resposta.ContentType !== entrada.mimeType) problemas.push("content-type");
  if (resposta.CacheControl !== CACHE_CONTROL_PUBLICO)
    problemas.push("cache-control");
  if (problemas.length)
    throw new FalhaPublicacao(
      `Conferência remota falhou em ${entrada.chave}: ${problemas.join(", ")}.`,
    );
}

type Conexao = {
  query(sql: string, valores?: unknown[]): Promise<{ rows: unknown[] }>;
  release(destruir?: boolean): void;
};

const documentoSchema = z.object({ id: z.string(), slug: z.string() });
const arquivoPrivadoSchema = z.object({ id: z.string() });

/**
 * Mapa código do inventário → id do documento, **pelo slug canônico**.
 *
 * `ordem_anexo` parece uma chave e não é: a ordem do banco não é a ordem das
 * linhas do CSV, porque `A11`, `B13` e `B14` foram acrescentados ao fim da
 * planilha e recebem no banco a posição semântica que lhes cabe. Resolver por
 * posição liga arquivo ao documento errado sem que nada falhe — foi o que
 * aconteceu na primeira execução de 2026-09-16, corrigida em seguida. O slug
 * é a chave pública de `documento` e vem da mesma coluna do inventário que
 * `slugDoItem` já usava no espelhamento privado.
 */
async function documentosDoLote(
  c: Conexao,
  slugs: ReadonlyMap<string, string>,
  codigos: readonly string[],
): Promise<Map<string, { id: string; slug: string }>> {
  const mapa = new Map<string, { id: string; slug: string }>();
  for (const codigo of codigos) {
    const slug = slugs.get(codigo);
    if (slug === undefined)
      throw new FalhaPublicacao(`Sem slug de inventário para ${codigo}.`);
    const linhas = z
      .array(documentoSchema)
      .parse(
        (
          await c.query(
            "select id::text, slug::text from documento where slug = $1",
            [slug],
          )
        ).rows,
      );
    const documento = linhas[0];
    if (!documento || linhas.length !== 1)
      throw new FalhaPublicacao(
        `Documento de ${codigo} (slug ${slug}) não é único no banco.`,
      );
    mapa.set(codigo, documento);
  }
  return mapa;
}

async function idDaReplica(c: Conexao, sha256: string): Promise<string> {
  const linhas = z.array(arquivoPrivadoSchema).parse(
    (
      await c.query(
        `select id::text from arquivo
          where sha256 = $1 and visibilidade = 'privado'`,
        [sha256],
      )
    ).rows,
  );
  const linha = linhas[0];
  if (!linha || linhas.length !== 1)
    throw new FalhaPublicacao(
      `Réplica sem origem privada única para o hash ${sha256}.`,
    );
  return linha.id;
}

async function idDaOrigemPublica(c: Conexao, chave: string): Promise<string> {
  const linhas = z.array(arquivoPrivadoSchema).parse(
    (
      await c.query(
        `select id::text from arquivo
          where bucket = $1 and chave_storage = $2 and visibilidade = 'publico'`,
        [exigir("STORAGE_PUBLIC_BUCKET"), chave],
      )
    ).rows,
  );
  const linha = linhas[0];
  if (!linha || linhas.length !== 1)
    throw new FalhaPublicacao(
      `Origem pública não é única para o derivado: ${chave}.`,
    );
  return linha.id;
}

async function persistir(
  c: Conexao,
  lote: LoteDeclarado,
  slugs: ReadonlyMap<string, string>,
): Promise<{ inseridos: number; promovidos: number }> {
  const documentos = await documentosDoLote(c, slugs, lote.codigos);
  let inseridos = 0;
  for (const entrada of lote.entradas) {
    const documento = documentos.get(entrada.codigo);
    if (!documento)
      throw new FalhaPublicacao(`Documento ausente para ${entrada.codigo}.`);
    const existente = (
      await c.query(
        "select id::text from arquivo where bucket = $1 and chave_storage = $2",
        [exigir("STORAGE_PUBLIC_BUCKET"), entrada.chave],
      )
    ).rows;
    if (existente.length) continue;
    const replicaDeId =
      entrada.relacao === "replica"
        ? await idDaReplica(c, entrada.sha256)
        : null;
    const derivadoDeId =
      entrada.relacao === "derivado" && entrada.derivadoDeChave !== null
        ? await idDaOrigemPublica(c, entrada.derivadoDeChave)
        : null;
    const [arquivo] = z.array(z.object({ id: z.string() })).parse(
      (
        await c.query(
          `insert into arquivo (
             chave_storage, bucket, visibilidade, url_publica, nome_original,
             tipo_midia, mime_type, bytes, sha256, origem_sistema,
             espelhado_em, replica_de_id, derivado_de_id,
             derivacao_metodo, derivacao_em
           ) values (
             $1,$2,'publico',$3,$4,$5,$6,$7,$8,'upload',now(),$9,$10,$11,
             case when $10::uuid is null then null else now() end
           )
           returning id::text`,
          [
            entrada.chave,
            exigir("STORAGE_PUBLIC_BUCKET"),
            urlPublica(entrada.chave),
            entrada.origem.split("/").pop() ?? null,
            entrada.tipoMidia,
            entrada.mimeType,
            entrada.bytes,
            entrada.sha256,
            replicaDeId,
            derivadoDeId,
            entrada.derivacaoMetodo,
          ],
        )
      ).rows,
    );
    if (!arquivo)
      throw new FalhaPublicacao(`INSERT sem retorno: ${entrada.chave}.`);
    await c.query(
      `insert into documento_arquivo (documento_id, arquivo_id, versao, rotulo, principal)
       values ($1,$2,1,$3,$4)`,
      [
        documento.id,
        arquivo.id,
        montarRotulo(entrada.rotulo, entrada.autor),
        entrada.principal,
      ],
    );
    inseridos += 1;
  }
  const promovidos = (
    await c.query(
      `update documento
          set estado_documental = 'PUBLICAVEL',
              revisao_privacidade = 'concluida',
              status = 'publicado',
              publicado_em = coalesce(publicado_em, now()),
              atualizado_em = now()
        where slug = any($1::citext[])
          and (estado_documental <> 'PUBLICAVEL' or status <> 'publicado')
        returning id`,
      [lote.codigos.map((codigo) => slugs.get(codigo))],
    )
  ).rows.length;
  return { inseridos, promovidos };
}

/** Slug canônico de cada código, lido do inventário derivado. */
export function slugsDoInventario(csv: string): Map<string, string> {
  const itens = lerInventario(csv);
  if (itens.length !== 33)
    throw new FalhaPublicacao("Inventário deve conter os 33 códigos.");
  return new Map(itens.map((item) => [item.id, slugDoItem(item)]));
}

async function principal(): Promise<void> {
  const { executar, lote } = opcoes(process.argv.slice(2));
  if (existsSync(".env.local")) loadEnvFile(".env.local");
  if (exigir("STORAGE_PUBLIC_BUCKET") !== "observatorio-publico")
    throw new FalhaPublicacao("Bucket público inesperado.");
  if (!exigir("STORAGE_PUBLIC_URL").startsWith("https://acervo."))
    throw new FalhaPublicacao("STORAGE_PUBLIC_URL não é o domínio próprio.");

  const raiz = await realpath(
    z.string().min(1).parse(process.env.OBSERVATORIO_FONTES_DIR),
  );
  const rel = relative(await realpath(process.cwd()), raiz);
  if (!isAbsolute(rel) && rel !== ".." && !rel.startsWith(`..${sep}`))
    throw new FalhaPublicacao(
      "Fonte canônica precisa estar fora do repositório.",
    );

  const { execFile } = await import("node:child_process");
  const { promisify } = await import("node:util");
  const { stdout: csv } = await promisify(execFile)(
    "python",
    ["-B", "scripts/derivar-inventario.py", "--stdout"],
    { encoding: "utf8", maxBuffer: 4 * 1024 * 1024 },
  );
  const slugs = slugsDoInventario(csv);

  let enviados = 0;
  let reaproveitados = 0;
  for (const entrada of lote.entradas) {
    const corpo = await lerFonte(raiz, entrada.origem);
    const sha256 = createHash("sha256").update(corpo).digest("hex");
    if (sha256 !== entrada.sha256 || corpo.byteLength !== entrada.bytes)
      throw new FalhaPublicacao(
        `Fonte divergente do lote aprovado: ${entrada.origem}.`,
      );
    const situacao = await situacaoDaChave(entrada.chave, entrada.sha256);
    if (situacao === "divergente")
      throw new FalhaPublicacao(
        `Chave pública já ocupada por conteúdo diferente: ${entrada.chave}.`,
      );
    if (situacao === "ausente" && executar) {
      await enviarObjeto(
        entrada.chave,
        corpo,
        entrada.mimeType,
        entrada.sha256,
      );
      await conferirRemoto(entrada);
      enviados += 1;
    } else if (situacao === "identico") {
      if (executar) await conferirRemoto(entrada);
      reaproveitados += 1;
    }
    console.log(
      JSON.stringify({
        lote: lote.id,
        codigo: entrada.codigo,
        origem: entrada.origem,
        chave: entrada.chave,
        sha256: entrada.sha256,
        bytes: entrada.bytes,
        mime: entrada.mimeType,
        principal: entrada.principal,
        url: urlPublica(entrada.chave),
        acao: executar
          ? situacao === "ausente"
            ? "enviado"
            : "ja_publicado"
          : situacao,
      }),
    );
  }

  if (!executar) {
    console.log(
      `DRY-RUN lote ${lote.id}: ${lote.entradas.length} objetos planejados; ` +
        `${reaproveitados} já no bucket. Nenhum upload, nenhum INSERT.`,
    );
    return;
  }

  const { poolManutencao, encerrarManutencao } = await import(
    "../src/dados/clienteManutencao"
  );
  const conexao = (await poolManutencao.connect()) as unknown as Conexao;
  let destruir = false;
  try {
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
      throw new FalhaPublicacao("Outro executor já está publicando.");
    const { inseridos, promovidos } = await persistir(conexao, lote, slugs);
    const [total] = z
      .array(z.object({ n: z.coerce.number() }))
      .parse(
        (await conexao.query("select count(*)::int n from vw_anexo_publico"))
          .rows,
      );
    await conexao.query("commit");
    console.log(
      `EXECUÇÃO lote ${lote.id}: ${enviados} enviados, ${reaproveitados} reaproveitados, ` +
        `${inseridos} arquivos inseridos, ${promovidos} documentos promovidos, ` +
        `vw_anexo_publico = ${total?.n}.`,
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
      "Publicação interrompida. Conferir fonte, lote, bucket e banco; " +
        "não repetir com --executar sem resolver a falha.",
    );
    process.exitCode = 1;
  });
}
