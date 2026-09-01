/**
 * Empacotamento do "Baixar tudo (.zip)" — Tarefa 08.
 *
 * Roda **antes** do `next build`, monta um único ZIP com todos os anexos
 * espelhados e o publica no R2. Nunca sob demanda, nunca em request, nunca por
 * proxy, nunca em `public/` (ADR-006).
 *
 * Comportamento sem credenciais, decidido em 2026-08-31:
 *
 * - fora de produção: **não gera** e **termina com sucesso**, dizendo o que
 *   deixou de fazer — assim `pnpm build` funciona na máquina de quem não tem
 *   acesso ao storage;
 * - em produção: **falha explícita**, com código diferente de zero. Publicar a
 *   Sala do Avaliador com o botão apontando para um objeto inexistente seria
 *   pior do que não publicar.
 *
 * Aqui `NODE_ENV` serve como discriminador porque o script roda fora do
 * `next build` — dentro dele, `NODE_ENV` é sempre `production`.
 *
 * Uso:
 *   pnpm tsx scripts/gerar-zip-anexos.ts
 */

import { createHash } from "node:crypto";
import { zipSync } from "fflate";
import { listarAnexosPublicos } from "../src/dados/consultas/anexos";
import {
  baixarObjeto,
  credenciaisDeStoragePresentes,
  enviarObjeto,
} from "../src/lib/storage";
import { CHAVE_ZIP_ANEXOS, nomeNoPacote } from "../src/lib/zip-anexos";

const ehProducao = process.env.NODE_ENV === "production";

/** Chave do objeto no R2 a partir da URL pública gravada em `arquivo`. */
function chaveDaUrl(linkPermanente: string): string {
  const base = process.env.STORAGE_PUBLIC_URL?.replace(/\/+$/, "") ?? "";
  return base && linkPermanente.startsWith(base)
    ? linkPermanente.slice(base.length + 1)
    : linkPermanente;
}

async function principal(): Promise<void> {
  if (!credenciaisDeStoragePresentes() || !process.env.STORAGE_PUBLIC_URL) {
    const recado =
      "credenciais do R2 ausentes: o pacote .zip não foi gerado nem publicado.";
    if (ehProducao) {
      throw new Error(
        `${recado} Em produção isso é erro: a Sala do Avaliador ofereceria um ` +
          "download que não existe.",
      );
    }
    console.warn(
      `[zip-anexos] ${recado} Seguindo sem gerar, como previsto fora de produção.`,
    );
    return;
  }

  const anexos = await listarAnexosPublicos();
  if (anexos.length === 0) {
    console.warn(
      "[zip-anexos] nenhum anexo publicado e espelhado: nada a empacotar. " +
        "O pacote anterior, se existir, permanece intocado no R2.",
    );
    return;
  }

  console.log(`[zip-anexos] empacotando ${anexos.length} anexo(s)…`);
  const conteudo: Record<string, Uint8Array> = {};
  for (const anexo of anexos) {
    const bytes = await baixarObjeto(chaveDaUrl(anexo.linkPermanente));
    conteudo[nomeNoPacote(anexo.slug, anexo.linkPermanente)] = new Uint8Array(
      bytes,
    );
    console.log(`  + ${anexo.slug} (${bytes.byteLength} bytes)`);
  }

  // `level: 0` armazena sem recomprimir: PDF, MP3 e imagens já vêm
  // comprimidos, e deflacioná-los de novo gasta CPU para ganho perto de zero.
  const pacote = Buffer.from(zipSync(conteudo, { level: 0 }));
  const sha256 = createHash("sha256").update(pacote).digest("hex");

  await enviarObjeto(CHAVE_ZIP_ANEXOS, pacote, "application/zip", sha256);
  console.log(
    `[zip-anexos] publicado ${CHAVE_ZIP_ANEXOS} — ${pacote.byteLength} bytes, sha ${sha256.slice(0, 12)}…`,
  );
}

principal().catch((erro) => {
  console.error(erro instanceof Error ? erro.message : String(erro));
  process.exit(1);
});
