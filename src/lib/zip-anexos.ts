/**
 * Identidade do pacote "Baixar tudo (.zip)".
 *
 * Fica em módulo próprio porque duas partes precisam concordar sobre o mesmo
 * objeto: o script que o gera em build e a página que o oferece. Se cada uma
 * montasse o caminho por conta própria, o botão apontaria para um lugar e o
 * arquivo estaria em outro — e link quebrado é exatamente o problema que a
 * Sala do Avaliador existe para resolver (doc 01 §0.2).
 *
 * O pacote vive no R2, nunca em `public/` (ADR-006).
 */

/** Chave do objeto no bucket. */
export const CHAVE_ZIP_ANEXOS = "prestacao-de-contas/anexos.zip";

/**
 * URL pública do pacote, ou `null` quando `STORAGE_PUBLIC_URL` não está
 * definida — caso em que a página informa que o pacote ainda não foi
 * publicado, em vez de oferecer um link que não abre.
 */
export function urlDoZipDeAnexos(): string | null {
  const base = process.env.STORAGE_PUBLIC_URL?.replace(/\/+$/, "");
  return base ? `${base}/${CHAVE_ZIP_ANEXOS}` : null;
}

/**
 * Nome do arquivo dentro do pacote. Usa o slug do documento e a extensão que
 * a chave de storage já carrega, para o avaliador reconhecer o item pelo mesmo
 * nome que vê na tabela.
 */
export function nomeNoPacote(slug: string, linkPermanente: string): string {
  const semQuery = linkPermanente.split("?")[0] ?? "";
  const ultimo = semQuery.split("/").pop() ?? "";
  const ponto = ultimo.lastIndexOf(".");
  const extensao = ponto >= 0 ? ultimo.slice(ponto) : "";
  return `${slug}${extensao}`;
}
