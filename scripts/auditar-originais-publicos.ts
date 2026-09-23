/** Auditoria read-only do binário servido no domínio público. Sem relatório no repo. */
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";

import { listarAnexosPublicos } from "../src/dados/consultas/anexos";
import { FOTO_DA_PLACA } from "../src/dados/pesquisa/excecao-placa";

if (existsSync(".env.local")) loadEnvFile(".env.local");

async function principal() {
  const anexos = await listarAnexosPublicos();
  const erros: string[] = [];
  let indice = 0;
  let bytesPublicos = 0;
  async function trabalhador() {
    while (indice < anexos.length) {
      const item = anexos[indice++];
      if (!item) break;
      try {
        const resposta = await fetch(item.linkPermanente, {
          redirect: "error",
        });
        const corpo = Buffer.from(await resposta.arrayBuffer());
        const tipo = resposta.headers.get("content-type")?.split(";")[0];
        const hash = createHash("sha256").update(corpo).digest("hex");
        if (
          resposta.status !== 200 ||
          corpo.length !== item.bytes ||
          hash !== item.sha256 ||
          tipo !== item.mimeType
        ) {
          erros.push(
            `${item.arquivoId}: HTTP ${resposta.status}, MIME ${tipo}, bytes ${corpo.length}, SHA ${hash}`,
          );
        } else {
          bytesPublicos += corpo.length;
        }
      } catch (erro) {
        erros.push(
          `${item.arquivoId}: ${erro instanceof Error ? erro.message : erro}`,
        );
      }
    }
  }
  await Promise.all(Array.from({ length: 4 }, () => trabalhador()));
  const fotos = anexos.filter((a) => a.slug === "fotografias-visitas-i-vii");
  const placa = fotos.filter(
    (a) => a.arquivoId === FOTO_DA_PLACA.arquivoPublicoId,
  );
  if (
    anexos.length !== 107 ||
    fotos.length !== 59 ||
    placa.length !== 1 ||
    placa[0]?.sha256 !== FOTO_DA_PLACA.sha256Publico ||
    anexos.some((a) => a.sha256 === FOTO_DA_PLACA.sha256Original)
  ) {
    erros.push("Coleção canônica ou exceção da placa divergente.");
  }
  console.log(
    JSON.stringify(
      {
        anexos: anexos.length,
        fotografias: fotos.length,
        validos: anexos.length - erros.length,
        bytesPublicos,
        erros,
      },
      null,
      2,
    ),
  );
  if (erros.length) process.exitCode = 1;
}

principal().catch((erro: unknown) => {
  console.error(erro instanceof Error ? erro.message : erro);
  process.exitCode = 1;
});
