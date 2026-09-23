/** Troca do corpus documental, sem migração de schema. Dry-run por padrão.
 * --preparar copia e confere originais no bucket público, sem tocar no banco.
 * --aplicar exige todos os objetos já conferidos e faz uma única transação.
 * Objetos derivados antigos são removidos em etapa separada, após o deploy.
 */
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { basename, extname } from "node:path";
import { loadEnvFile } from "node:process";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { Pool, type PoolClient } from "pg";

import corpus from "../src/dados/pesquisa/corpus-b01-autorizado.json";
import { FOTO_DA_PLACA } from "../src/dados/pesquisa/excecao-placa";
import {
  baixarObjeto,
  consultarObjeto,
  enviarObjeto,
  urlPublica,
} from "../src/lib/storage";
import { exigirConfiguracao } from "../src/lib/storage-configuracao";
import { bucketPrivado, clientePrivado } from "../src/lib/storage-privado";
import { lerFonte } from "./publicar-acervo";

if (existsSync(".env.local")) loadEnvFile(".env.local");

type Linha = {
  id: string;
  documento_id: string;
  chave_storage: string;
  rotulo: string;
  origem_id: string | null;
  sha256: string;
  mime_type: string;
  bytes: string;
  nome_original: string | null;
};
type Candidato = {
  codigo: "B01" | "D01";
  origem: Linha;
  chave: string;
  nome: string;
  mime: string;
  bytes: Buffer;
  sha256: string;
};

const hash = (bytes: Buffer) =>
  createHash("sha256").update(bytes).digest("hex");
const mimeFotografia = (nome: string) => {
  const extensao = extname(nome).toLowerCase();
  if (extensao === ".heic") return "image/heic";
  if (extensao === ".jpg" || extensao === ".jpeg") return "image/jpeg";
  if (extensao === ".png") return "image/png";
  throw new Error(`Formato fotográfico inesperado: ${nome}`);
};

async function candidatos(c: PoolClient): Promise<Candidato[]> {
  const fotos = (
    await c.query<Linha>(`
    select a.id::text, d.id::text documento_id, a.chave_storage, da.rotulo,
           a.derivado_de_id::text origem_id, a.sha256, a.mime_type,
           a.bytes::text, a.nome_original
      from arquivo a join documento_arquivo da on da.arquivo_id=a.id
      join documento d on d.id=da.documento_id
     where d.slug='fotografias-visitas-i-vii' and a.visibilidade='publico'
       and a.mime_type='image/webp' order by a.chave_storage
  `)
  ).rows;
  if (fotos.length !== 58)
    throw new Error(`Esperados 58 WebPs; ${fotos.length}.`);
  const declarados = new Map(corpus.map((item) => [item.arquivo, item.sha256]));
  const privados = clientePrivado();
  try {
    const identidade = (
      await c.query<Linha>(`
      select a.id::text, d.id::text documento_id, a.chave_storage, da.rotulo,
             a.derivado_de_id::text origem_id, a.sha256, a.mime_type,
             a.bytes::text, a.nome_original
        from arquivo a join documento_arquivo da on da.arquivo_id=a.id
        join documento d on d.id=da.documento_id
       where d.slug='identidade-visual' and a.visibilidade='publico'
         and a.derivacao_metodo='sanitizacao_metadados'
       order by a.chave_storage
    `)
    ).rows;
    if (identidade.length !== 5)
      throw new Error(`Esperados cinco D01; ${identidade.length}.`);
    const resultado: Candidato[] = [];
    for (const foto of fotos) {
      const caminho = `fotos/${foto.rotulo.replace(/^B01 · /, "").split(" — Foto: ")[0]}`;
      const esperado = declarados.get(caminho);
      if (!esperado) throw new Error(`Original não declarado: ${caminho}`);
      if (caminho === FOTO_DA_PLACA.original) {
        if (
          foto.id !== FOTO_DA_PLACA.arquivoPublicoId ||
          foto.sha256 !== FOTO_DA_PLACA.sha256Publico ||
          esperado !== FOTO_DA_PLACA.sha256Original ||
          foto.origem_id
        ) {
          throw new Error("Exceção da placa divergente.");
        }
        continue;
      }
      const bytes = await lerFonte(
        exigirConfiguracao("OBSERVATORIO_FONTES_DIR"),
        caminho,
      );
      if (hash(bytes) !== esperado)
        throw new Error(`SHA da fonte diverge: ${caminho}`);
      resultado.push({
        codigo: "B01",
        origem: foto,
        chave: `arquivos/comprovacao-de-campo/originais/${caminho.slice(6)}`,
        nome: basename(caminho),
        mime: mimeFotografia(caminho),
        bytes,
        sha256: esperado,
      });
    }
    for (const derivado of identidade) {
      if (!derivado.origem_id)
        throw new Error(`D01 sem origem: ${derivado.id}`);
      const [original] = (
        await c.query<Linha>(
          `
        select id::text, chave_storage, sha256, mime_type, bytes::text, nome_original
          from arquivo where id=$1 and visibilidade='privado'
      `,
          [derivado.origem_id],
        )
      ).rows;
      if (!original?.nome_original)
        throw new Error(`Original D01 ausente: ${derivado.id}`);
      const objeto = await privados.send(
        new GetObjectCommand({
          Bucket: bucketPrivado(),
          Key: original.chave_storage,
        }),
      );
      if (!objeto.Body) throw new Error(`Original D01 vazio: ${original.id}`);
      const bytes = Buffer.from(await objeto.Body.transformToByteArray());
      if (
        hash(bytes) !== original.sha256 ||
        bytes.length !== Number(original.bytes)
      )
        throw new Error(`Original D01 divergente: ${original.id}`);
      const codigo = derivado.rotulo.toLowerCase();
      resultado.push({
        codigo: "D01",
        origem: derivado,
        chave: `arquivos/publicidade/originais/${codigo}-${original.nome_original}`,
        nome: original.nome_original,
        mime: original.mime_type,
        bytes,
        sha256: original.sha256,
      });
    }
    if (
      resultado.length !== 62 ||
      new Set(resultado.map((x) => x.chave)).size !== 62
    )
      throw new Error(
        "Conjunto canônico não contém 57 fotos + 5 identidades únicas.",
      );
    return resultado;
  } finally {
    privados.destroy();
  }
}

async function conferirObjeto(item: Candidato, enviar: boolean) {
  const atual = await consultarObjeto(item.chave);
  if (
    atual &&
    (atual.sha256 !== item.sha256 || atual.bytes !== item.bytes.length)
  )
    throw new Error(`Chave conflitante: ${item.chave}`);
  if (!atual && enviar)
    await enviarObjeto(item.chave, item.bytes, item.mime, item.sha256);
  if (atual || enviar) {
    const remoto = await baixarObjeto(item.chave);
    if (hash(remoto) !== item.sha256 || remoto.length !== item.bytes.length)
      throw new Error(`Objeto público divergente: ${item.chave}`);
  }
  return atual ? "existente" : enviar ? "enviado" : "pendente";
}

async function aplicar(c: PoolClient, itens: Candidato[]) {
  await c.query("begin");
  try {
    const trava = (
      await c.query(
        "select pg_try_advisory_xact_lock(hashtext('publicacao-acervo')) obtido",
      )
    ).rows[0];
    if (!trava?.obtido) throw new Error("Outro publicador está ativo.");
    for (const item of itens) {
      const existente = (
        await c.query<{ id: string; sha256: string }>(
          "select id::text, sha256 from arquivo where bucket=$1 and chave_storage=$2",
          [exigirConfiguracao("STORAGE_PUBLIC_BUCKET"), item.chave],
        )
      ).rows[0];
      if (existente && existente.sha256 !== item.sha256)
        throw new Error(`Registro conflitante: ${item.chave}`);
      let id = existente?.id;
      if (!id) {
        const origemId = item.codigo === "D01" ? item.origem.origem_id : null;
        const novo = await c.query<{ id: string }>(
          `
          insert into arquivo (chave_storage,bucket,visibilidade,url_publica,nome_original,
            tipo_midia,mime_type,bytes,sha256,espelhado_em,replica_de_id)
          values ($1,$2,'publico',$3,$4,$9,$5,$6,$7,now(),$8)
          returning id::text
        `,
          [
            item.chave,
            exigirConfiguracao("STORAGE_PUBLIC_BUCKET"),
            urlPublica(item.chave),
            item.nome,
            item.mime,
            item.bytes.length,
            item.sha256,
            origemId,
            item.mime === "application/pdf" ? "pdf" : "imagem",
          ],
        );
        id = novo.rows[0]?.id;
        if (!id) throw new Error(`INSERT sem ID: ${item.chave}`);
        await c.query(
          `insert into documento_arquivo
          (documento_id,arquivo_id,versao,rotulo,principal)
          values ($1,$2,1,$3,false)`,
          [item.origem.documento_id, id, item.origem.rotulo],
        );
      }
      if (item.codigo === "B01") {
        await c.query(
          `update arquivo set derivado_de_id=$1,
          derivacao_metodo='conversao_formato' where id=$2
          and (derivado_de_id is null or derivado_de_id=$1)`,
          [id, item.origem.id],
        );
      }
    }
    const antigos = (
      await c.query<{ id: string }>(`
      select a.id::text from arquivo a join documento_arquivo da on da.arquivo_id=a.id
      join documento d on d.id=da.documento_id
      where (d.slug='relatorio-tecnico-recanto-da-serra' and a.derivacao_metodo='tarjamento_privacidade')
         or (d.slug='relatorio-tecnico-borda-da-mata' and a.derivacao_metodo='transcricao_leitura_visual')
         or (d.slug='identidade-visual' and a.derivacao_metodo='sanitizacao_metadados')
    `)
    ).rows.map((x) => x.id);
    if (antigos.length !== 7)
      throw new Error(
        `Esperados sete derivados documentais; ${antigos.length}.`,
      );
    for (const id of antigos) {
      const refs = (
        await c.query(
          `select
        (select count(*) from arquivo where derivado_de_id=$1 or replica_de_id=$1) +
        (select count(*) from episodio where audio_id=$1 or capa_id=$1) +
        (select count(*) from temporada where capa_id=$1) +
        (select count(*) from pessoa where foto_id=$1) +
        (select count(*) from consentimento where termo_id=$1) n`,
          [id],
        )
      ).rows[0];
      if (Number(refs?.n) !== 0)
        throw new Error(`Derivado ainda referenciado: ${id}`);
      await c.query("delete from documento_arquivo where arquivo_id=$1", [id]);
      await c.query("delete from arquivo where id=$1", [id]);
    }
    await c.query(
      `update documento_arquivo set principal=false
      where arquivo_id=(select id from arquivo where bucket=$1 and chave_storage=$2)`,
      [
        exigirConfiguracao("STORAGE_PRIVATE_BUCKET"),
        "arquivos/analise-de-dados/relatorio-tecnico-recanto-da-serra-v1.pdf",
      ],
    );
    await c.query(
      `update documento_arquivo set principal=true
      where arquivo_id=(select id from arquivo where bucket=$1 and chave_storage=$2)`,
      [
        exigirConfiguracao("STORAGE_PUBLIC_BUCKET"),
        "arquivos/analise-de-dados/a02-relatorio-tecnico-recanto-da-serra-integral-v1.pdf",
      ],
    );
    const contagens = (
      await c.query<{
        total: number;
        fotos_originais: number;
        webps: number;
        identidades: number;
        derivados_documentais: number;
        placa_original: number;
      }>(
        `select
      count(*)::int total,
      count(*) filter (where slug='fotografias-visitas-i-vii'
        and mime_type in ('image/jpeg','image/heic','image/png'))::int fotos_originais,
      count(*) filter (where slug='fotografias-visitas-i-vii'
        and mime_type='image/webp')::int webps,
      count(*) filter (where slug='identidade-visual')::int identidades,
      count(*) filter (where arquivo_derivacao_metodo in
        ('tarjamento_privacidade','transcricao_leitura_visual','sanitizacao_metadados'))::int derivados_documentais,
      count(*) filter (where sha256=$1)::int placa_original
      from vw_anexo_publico`,
        [FOTO_DA_PLACA.sha256Original],
      )
    ).rows[0];
    if (
      !contagens ||
      contagens.total !== 164 ||
      contagens.fotos_originais !== 57 ||
      contagens.webps !== 58 ||
      contagens.identidades !== 8 ||
      contagens.derivados_documentais !== 0 ||
      contagens.placa_original !== 0
    ) {
      throw new Error(
        `Corpus pós-transação divergente: ${JSON.stringify(contagens)}`,
      );
    }
    await c.query("commit");
    console.log(
      JSON.stringify({
        originaisPublicados: itens.length,
        derivadosRemovidos: antigos,
      }),
    );
  } catch (erro) {
    await c.query("rollback");
    throw erro;
  }
}

async function principal() {
  const modo = process.argv[2] ?? "--dry-run";
  if (
    !["--dry-run", "--preparar", "--aplicar"].includes(modo) ||
    process.argv.length > 3
  )
    throw new Error("Uso: --dry-run | --preparar | --aplicar");
  const pool = new Pool({
    connectionString: exigirConfiguracao("DATABASE_URL_MANUTENCAO"),
  });
  const c = await pool.connect();
  try {
    const itens = await candidatos(c);
    const estados = [];
    for (const item of itens)
      estados.push(await conferirObjeto(item, modo === "--preparar"));
    const pendentes = estados.filter((x) => x === "pendente").length;
    console.log(
      JSON.stringify({
        modo,
        total: itens.length,
        pendentes,
        existentes: estados.filter((x) => x === "existente").length,
        enviados: estados.filter((x) => x === "enviado").length,
      }),
    );
    if (modo === "--aplicar") {
      if (pendentes)
        throw new Error(
          `${pendentes} originais ainda fora do storage público.`,
        );
      await aplicar(c, itens);
    }
  } finally {
    c.release();
    await pool.end();
  }
}

principal().catch((erro: unknown) => {
  console.error(erro instanceof Error ? erro.message : erro);
  process.exitCode = 1;
});
