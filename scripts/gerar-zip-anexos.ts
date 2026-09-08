/**
 * Empacotamento do "Baixar tudo (.zip)" — Tarefa 08.
 *
 * Operação externa deliberadamente separada do `next build`: monta um único
 * ZIP com as evidências elegíveis pelo Manifesto e o publica no R2. Nunca
 * inclui item sem estado, revisão, proveniência, hash ou arquivo comprovado.
 *
 * A publicação exige a flag literal `--publicar`. Sem ela, o processo falha
 * antes de consultar banco ou storage. Isso impede que compilação, CI ou uma
 * invocação acidental causem `PutObject`.
 *
 * Comportamento sem credenciais, decidido em 2026-08-31 e preservado para a
 * operação explícita:
 *
 * - fora de produção: **não gera** e **termina com sucesso**, dizendo o que
 *   deixou de fazer;
 * - em produção: **falha explícita**, com código diferente de zero. Publicar a
 *   Sala do Avaliador com o botão apontando para um objeto inexistente seria
 *   pior do que não publicar.
 *
 * Uso:
 *   pnpm publicar-zip
 */

import { pathToFileURL } from "node:url";

import { listarEvidenciasDeAnexos } from "../src/dados/consultas/anexos";
import {
  baixarObjeto,
  credenciaisDeStoragePresentes,
  enviarObjeto,
} from "../src/lib/storage";
import { CHAVE_ZIP_ANEXOS } from "../src/lib/zip-anexos";
import { gerarZipPublico } from "../src/lib/zip-publico";

const ehProducao = process.env.NODE_ENV === "production";

export function exigirAutorizacaoPublicacaoZip(
  argumentos: readonly string[],
): void {
  if (argumentos.length !== 1 || argumentos[0] !== "--publicar") {
    throw new Error(
      "publicação do ZIP não autorizada: use pnpm publicar-zip, que fornece a flag explícita --publicar.",
    );
  }
}

export async function principal(
  argumentos: readonly string[] = process.argv.slice(2),
): Promise<void> {
  exigirAutorizacaoPublicacaoZip(argumentos);

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
  console.log(
    "[zip-anexos] a Sala do Avaliador só oferece o download depois de " +
      "ZIP_ANEXOS_PUBLICADO=true no ambiente do build. Enquanto a variável não " +
      "for definida, o pacote existe no R2 mas o botão continua oculto.",
  );
}

const caminhoExecutado = process.argv[1];
if (
  caminhoExecutado &&
  import.meta.url === pathToFileURL(caminhoExecutado).href
) {
  principal().catch((erro) => {
    console.error(erro instanceof Error ? erro.message : String(erro));
    process.exit(1);
  });
}
