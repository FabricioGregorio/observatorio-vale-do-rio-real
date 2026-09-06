/**
 * Empacotamento do "Baixar tudo (.zip)" — Tarefa 08.
 *
 * Roda **antes** do `next build`, monta um único ZIP com as evidências elegíveis
 * pelo Manifesto e o publica no R2. Nunca inclui item sem estado, revisão,
 * proveniência, hash ou arquivo comprovado.
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

import { listarEvidenciasDeAnexos } from "../src/dados/consultas/anexos";
import {
  baixarObjeto,
  credenciaisDeStoragePresentes,
  enviarObjeto,
} from "../src/lib/storage";
import { CHAVE_ZIP_ANEXOS } from "../src/lib/zip-anexos";
import { gerarZipPublico } from "../src/lib/zip-publico";

const ehProducao = process.env.NODE_ENV === "production";

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

  const evidencias = await listarEvidenciasDeAnexos();
  const base = process.env.STORAGE_PUBLIC_URL?.replace(/\/+$/, "") ?? "";
  const resultado = await gerarZipPublico(
    evidencias,
    {
      baixar: async (chave) => baixarObjeto(chave),
      enviar: async (chave, corpo, mime, sha256) =>
        enviarObjeto(chave, corpo, mime, sha256),
    },
    CHAVE_ZIP_ANEXOS,
    base,
  );
  if (resultado.estado === "sem_candidatos") {
    console.warn(
      "[zip-anexos] nenhum anexo publicado e espelhado: nada a empacotar. " +
        "O pacote anterior, se existir, permanece intocado no R2.",
    );
    return;
  }

  console.log(
    `[zip-anexos] publicado ${CHAVE_ZIP_ANEXOS} — ${resultado.quantidade} arquivo(s), sha ${resultado.sha256.slice(0, 12)}…`,
  );
}

principal().catch((erro) => {
  console.error(erro instanceof Error ? erro.message : String(erro));
  process.exit(1);
});
