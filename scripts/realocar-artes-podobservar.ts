/** Realocação única das artes públicas para fora do namespace dos masters. */
import { createHash } from "node:crypto";
import { loadEnvFile } from "node:process";
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";

import { ARTES_PODOBSERVAR } from "../src/dados/podobservar-artes";
import { cliente, urlPublica } from "../src/lib/storage";
import { exigirConfiguracao as exigir } from "../src/lib/storage-configuracao";

class FalhaRealocacao extends Error {}

const PREFIXO_ANTIGO = "arquivos/podobservar/artes/";
const PREFIXO_NOVO = "arquivos/podobservar-artes/";

const sha256 = (bytes: Buffer) =>
  createHash("sha256").update(bytes).digest("hex");

function chaveAntiga(nova: string): string {
  if (!nova.startsWith(PREFIXO_NOVO))
    throw new FalhaRealocacao(`Chave fora do namespace novo: ${nova}.`);
  return `${PREFIXO_ANTIGO}${nova.slice(PREFIXO_NOVO.length)}`;
}

async function cabeca(chave: string) {
  try {
    return await cliente().send(
      new HeadObjectCommand({
        Bucket: exigir("STORAGE_PUBLIC_BUCKET"),
        Key: chave,
      }),
    );
  } catch (erro) {
    const status = (erro as { $metadata?: { httpStatusCode?: number } })
      .$metadata?.httpStatusCode;
    if (status === 404) return null;
    throw erro;
  }
}

async function copiarEConferir(): Promise<void> {
  const bucket = exigir("STORAGE_PUBLIC_BUCKET");
  for (const arte of ARTES_PODOBSERVAR) {
    const nova = arte.chave_publica;
    const antiga = chaveAntiga(nova);
    const origem = await cabeca(antiga);
    if (!origem) throw new FalhaRealocacao(`Objeto antigo ausente: ${antiga}.`);
    if (await cabeca(nova))
      throw new FalhaRealocacao(`Destino já existe; zero overwrite: ${nova}.`);
    await cliente().send(
      new CopyObjectCommand({
        Bucket: bucket,
        Key: nova,
        CopySource: `${bucket}/${antiga.split("/").map(encodeURIComponent).join("/")}`,
        MetadataDirective: "COPY",
      }),
    );
    const resposta = await cliente().send(
      new GetObjectCommand({ Bucket: bucket, Key: nova }),
    );
    if (!resposta.Body) throw new FalhaRealocacao(`Cópia sem corpo: ${nova}.`);
    const bytes = Buffer.from(await resposta.Body.transformToByteArray());
    if (
      bytes.length !== arte.derivado.bytes ||
      sha256(bytes) !== arte.derivado.sha256 ||
      resposta.ContentType !== arte.derivado.mime_type
    )
      throw new FalhaRealocacao(`Cópia divergente: ${nova}.`);
    console.log(
      JSON.stringify({
        etapa: "copia_verificada",
        antiga,
        nova,
        bytes: bytes.length,
        sha256: sha256(bytes),
        mime: resposta.ContentType,
      }),
    );
  }
}

async function atualizarBanco(): Promise<{
  ids: string[];
  capasAntes: Record<string, string>;
}> {
  const { poolManutencao, encerrarManutencao } = await import(
    "../src/dados/clienteManutencao"
  );
  const c = await poolManutencao.connect();
  try {
    await c.query("begin");
    const ids: string[] = [];
    const capasAntes: Record<string, string> = {};
    for (const arte of ARTES_PODOBSERVAR) {
      const nova = arte.chave_publica;
      const antiga = chaveAntiga(nova);
      const atual = await c.query<{
        id: string;
        sha256: string;
        bytes: string;
      }>(
        "select id::text,sha256,bytes::text from arquivo where bucket=$1 and chave_storage=$2 for update",
        [exigir("STORAGE_PUBLIC_BUCKET"), antiga],
      );
      const linha = atual.rows[0];
      if (atual.rowCount !== 1 || !linha)
        throw new FalhaRealocacao(`Registro antigo não único: ${antiga}.`);
      if (
        linha.sha256 !== arte.derivado.sha256 ||
        Number(linha.bytes) !== arte.derivado.bytes
      )
        throw new FalhaRealocacao(
          `Registro divergente antes do UPDATE: ${antiga}.`,
        );
      ids.push(linha.id);
      if (arte.slug_episodio) {
        const ep = await c.query<{ capa_id: string }>(
          "select capa_id::text from episodio where slug=$1",
          [arte.slug_episodio],
        );
        const capaId = ep.rows[0]?.capa_id;
        if (capaId !== linha.id)
          throw new FalhaRealocacao(
            `capa_id divergente antes: ${arte.slug_episodio}.`,
          );
        capasAntes[arte.slug_episodio] = capaId;
      }
      const alterado = await c.query<{ id: string }>(
        "update arquivo set chave_storage=$1,url_publica=$2 where id=$3 and chave_storage=$4 returning id::text",
        [nova, urlPublica(nova), linha.id, antiga],
      );
      if (alterado.rowCount !== 1 || alterado.rows[0]?.id !== linha.id)
        throw new FalhaRealocacao(`UPDATE não preservou ID: ${antiga}.`);
    }
    const prova = await c.query<{
      novos: number;
      publicos: number;
      capas: number;
      anexos: number;
      pendencias: number;
    }>(
      `select
        (select count(*)::int from arquivo where chave_storage like 'arquivos/podobservar-artes/%') novos,
        (select count(*)::int from vw_episodio_publico) publicos,
        (select count(*)::int from vw_episodio_publico where capa_url like '%/arquivos/podobservar-artes/%') capas,
        (select count(*)::int from vw_anexo_publico) anexos,
        (select count(*)::int from vw_pendencia_publicacao) pendencias`,
    );
    const v = prova.rows[0];
    if (
      v?.novos !== 4 ||
      v.publicos !== 3 ||
      v.capas !== 3 ||
      v.anexos !== 109 ||
      v.pendencias !== 0
    )
      throw new FalhaRealocacao(
        `Views divergentes; ROLLBACK: ${JSON.stringify(v)}.`,
      );
    for (const [slug, antes] of Object.entries(capasAntes)) {
      const ep = await c.query<{ capa_id: string }>(
        "select capa_id::text from episodio where slug=$1",
        [slug],
      );
      if (ep.rows[0]?.capa_id !== antes)
        throw new FalhaRealocacao(`capa_id mudou: ${slug}.`);
    }
    await c.query("commit");
    console.log(
      JSON.stringify({ etapa: "banco_confirmado", ids, capasAntes, views: v }),
    );
    return { ids, capasAntes };
  } catch (erro) {
    await c.query("rollback");
    throw erro;
  } finally {
    c.release();
    await encerrarManutencao();
  }
}

async function removerAntigas(): Promise<void> {
  const bucket = exigir("STORAGE_PUBLIC_BUCKET");
  for (const arte of ARTES_PODOBSERVAR) {
    const antiga = chaveAntiga(arte.chave_publica);
    await cliente().send(
      new DeleteObjectCommand({ Bucket: bucket, Key: antiga }),
    );
    if (await cabeca(antiga))
      throw new FalhaRealocacao(`Chave antiga sobreviveu: ${antiga}.`);
    if (!(await cabeca(arte.chave_publica)))
      throw new FalhaRealocacao(`Chave nova sumiu: ${arte.chave_publica}.`);
    console.log(JSON.stringify({ etapa: "antiga_removida", chave: antiga }));
  }
}

async function principal(): Promise<void> {
  loadEnvFile(".env.local");
  await copiarEConferir();
  await atualizarBanco();
  await removerAntigas();
}

principal().catch((erro) => {
  console.error(erro instanceof Error ? erro.message : String(erro));
  process.exit(1);
});
