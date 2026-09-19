/** Publica as artes derivadas do PodObservar e vincula as três capas. */
import { createHash, randomUUID } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { loadEnvFile } from "node:process";

import { ARTES_PODOBSERVAR } from "../src/dados/podobservar-artes";
import {
  baixarObjeto,
  consultarObjeto,
  enviarObjeto,
  urlPublica,
} from "../src/lib/storage";
import {
  descreverObjetoPrivado,
  enviarMasterPrivado,
} from "../src/lib/storage-privado-grande";

class FalhaPublicacao extends Error {}

function sha256(bytes: Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}

async function conferirEEnviar(executar: boolean): Promise<void> {
  const raiz = process.env.OBSERVATORIO_FONTES_DIR;
  if (!raiz) throw new FalhaPublicacao("OBSERVATORIO_FONTES_DIR ausente.");
  const derivados = join(raiz, "derivados-publicos", "podobservar");

  for (const arte of ARTES_PODOBSERVAR) {
    const original = resolve(raiz, arte.origem);
    const derivado = resolve(derivados, arte.arquivo);
    const bytesOriginais = readFileSync(original);
    const bytesDerivados = readFileSync(derivado);
    if (
      statSync(original).size !== arte.original.bytes ||
      sha256(bytesOriginais) !== arte.original.sha256
    )
      throw new FalhaPublicacao(`Original divergente: ${arte.origem}.`);
    if (
      statSync(derivado).size !== arte.derivado.bytes ||
      sha256(bytesDerivados) !== arte.derivado.sha256
    )
      throw new FalhaPublicacao(`Derivado divergente: ${arte.arquivo}.`);

    const privado = await descreverObjetoPrivado(arte.chave_privada);
    if (
      privado &&
      (privado.sha256 !== arte.original.sha256 ||
        privado.bytes !== arte.original.bytes)
    )
      throw new FalhaPublicacao(
        `Chave privada divergente: ${arte.chave_privada}.`,
      );
    if (!privado && executar) {
      await enviarMasterPrivado(
        arte.chave_privada,
        original,
        "image/jpeg",
        arte.original.sha256,
        randomUUID(),
      );
    }

    const publico = await consultarObjeto(arte.chave_publica);
    if (
      publico &&
      (publico.sha256 !== arte.derivado.sha256 ||
        publico.bytes !== arte.derivado.bytes)
    )
      throw new FalhaPublicacao(
        `Chave pública divergente: ${arte.chave_publica}.`,
      );
    if (!publico && executar) {
      await enviarObjeto(
        arte.chave_publica,
        bytesDerivados,
        arte.derivado.mime_type,
        arte.derivado.sha256,
      );
    }
    if (executar) {
      const remoto = await baixarObjeto(arte.chave_publica);
      if (
        remoto.length !== arte.derivado.bytes ||
        sha256(remoto) !== arte.derivado.sha256
      )
        throw new FalhaPublicacao(
          `Conferência remota falhou: ${arte.chave_publica}.`,
        );
    }
    console.log(
      JSON.stringify({
        id: arte.id,
        original: privado ? "presente" : executar ? "enviado" : "ausente",
        derivado: publico ? "presente" : executar ? "enviado" : "ausente",
      }),
    );
  }
}

async function persistir(): Promise<void> {
  const { poolManutencao, encerrarManutencao } = await import(
    "../src/dados/clienteManutencao"
  );
  const c = await poolManutencao.connect();
  try {
    await c.query("begin");
    let capas = 0;
    for (const arte of ARTES_PODOBSERVAR) {
      const origemExistente = await c.query<{ id: string; sha256: string }>(
        "select id::text, sha256 from arquivo where bucket=$1 and chave_storage=$2",
        [process.env.STORAGE_PRIVATE_BUCKET, arte.chave_privada],
      );
      let origemId = origemExistente.rows[0]?.id;
      if (
        origemExistente.rows[0] &&
        origemExistente.rows[0].sha256 !== arte.original.sha256
      )
        throw new FalhaPublicacao(`Registro privado divergente: ${arte.id}.`);
      if (!origemId) {
        const inserida = await c.query<{ id: string }>(
          `insert into arquivo (chave_storage,bucket,visibilidade,url_publica,nome_original,tipo_midia,mime_type,bytes,sha256,largura_px,altura_px,origem_sistema,espelhado_em)
           values ($1,$2,'privado',null,$3,'imagem','image/jpeg',$4,$5,$6,$7,'fonte_humana_local',now()) returning id::text`,
          [
            arte.chave_privada,
            process.env.STORAGE_PRIVATE_BUCKET,
            arte.origem.split("/").pop(),
            arte.original.bytes,
            arte.original.sha256,
            arte.original.largura,
            arte.original.altura,
          ],
        );
        origemId = inserida.rows[0]?.id;
      }
      if (!origemId)
        throw new FalhaPublicacao(`Original não registrado: ${arte.id}.`);

      const derivadoExistente = await c.query<{ id: string; sha256: string }>(
        "select id::text, sha256 from arquivo where bucket=$1 and chave_storage=$2",
        [process.env.STORAGE_PUBLIC_BUCKET, arte.chave_publica],
      );
      let derivadoId = derivadoExistente.rows[0]?.id;
      if (
        derivadoExistente.rows[0] &&
        derivadoExistente.rows[0].sha256 !== arte.derivado.sha256
      )
        throw new FalhaPublicacao(`Registro público divergente: ${arte.id}.`);
      if (!derivadoId) {
        const inserida = await c.query<{ id: string }>(
          `insert into arquivo (chave_storage,bucket,visibilidade,url_publica,nome_original,tipo_midia,mime_type,bytes,sha256,largura_px,altura_px,origem_sistema,espelhado_em,derivado_de_id,derivacao_metodo,derivacao_em)
           values ($1,$2,'publico',$3,$4,'imagem',$5,$6,$7,$8,$9,'upload',now(),$10,'conversao_formato',now()) returning id::text`,
          [
            arte.chave_publica,
            process.env.STORAGE_PUBLIC_BUCKET,
            urlPublica(arte.chave_publica),
            arte.arquivo,
            arte.derivado.mime_type,
            arte.derivado.bytes,
            arte.derivado.sha256,
            arte.derivado.largura,
            arte.derivado.altura,
            origemId,
          ],
        );
        derivadoId = inserida.rows[0]?.id;
      }
      if (!derivadoId)
        throw new FalhaPublicacao(`Derivado não registrado: ${arte.id}.`);

      if (arte.slug_episodio) {
        const episodio = await c.query<{ capa_id: string | null }>(
          "select capa_id::text from episodio where slug=$1 for update",
          [arte.slug_episodio],
        );
        const atual = episodio.rows[0]?.capa_id;
        if (episodio.rowCount !== 1 || (atual !== null && atual !== derivadoId))
          throw new FalhaPublicacao(
            `Capa preexistente divergente: ${arte.slug_episodio}.`,
          );
        if (atual === null) {
          await c.query("update episodio set capa_id=$1 where slug=$2", [
            derivadoId,
            arte.slug_episodio,
          ]);
          capas += 1;
        }
      }
    }
    const prova = await c.query<{ capas: number; publicos: number }>(
      "select count(*) filter (where capa_url is not null)::int capas, count(*)::int publicos from vw_episodio_publico",
    );
    if (prova.rows[0]?.capas !== 3 || prova.rows[0]?.publicos !== 3)
      throw new FalhaPublicacao(
        `Gate final divergente: ${JSON.stringify(prova.rows[0])}`,
      );
    await c.query("commit");
    console.log(
      JSON.stringify({
        resultado: "COMMIT",
        capas_vinculadas: capas,
        ...prova.rows[0],
      }),
    );
  } catch (erro) {
    await c.query("rollback");
    throw erro;
  } finally {
    c.release();
    await encerrarManutencao();
  }
}

async function principal(): Promise<void> {
  if (process.env.NODE_ENV !== "test") loadEnvFile(".env.local");
  const executar = process.argv.slice(2).join(" ") === "--executar";
  if (!executar && process.argv.length > 2)
    throw new FalhaPublicacao("Use sem argumento ou --executar.");
  await conferirEEnviar(executar);
  if (!executar) return console.log("DRY-RUN: nenhuma escrita realizada.");
  await persistir();
}

principal().catch((erro) => {
  console.error(erro instanceof Error ? erro.message : String(erro));
  process.exit(1);
});
