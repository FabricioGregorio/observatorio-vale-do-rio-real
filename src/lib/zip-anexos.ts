/**
 * Identidade do pacote "Baixar tudo (.zip)".
 *
 * Fica em módulo próprio porque duas partes precisam concordar sobre o mesmo
 * objeto: o script que o gera em build e a página que o oferece. Se cada uma
 * montasse o caminho por conta própria, o botão apontaria para um lugar e o
 * arquivo estaria em outro — e link quebrado é exatamente o problema que a
 * Prestação de Contas existe para resolver (doc 01 §0.2).
 *
 * O pacote vive no R2, nunca em `public/` (ADR-006).
 */

/** Chave do objeto no bucket. */
export const CHAVE_ZIP_ANEXOS = "prestacao-de-contas/anexos.zip";

/**
 * Declaração explícita de que o objeto do ZIP existe no bucket público.
 *
 * Só quem executou `pnpm publicar-zip` sabe disso; a chave sozinha não prova
 * nada, e derivar a URL a partir de `STORAGE_PUBLIC_URL` provava apenas que o
 * domínio do acervo está configurado. Foi exatamente esse o defeito do primeiro
 * deployment: os oito anexos existiam, o domínio existia, o pacote não — e a
 * Prestação de Contas oferecia um download que respondia 404.
 *
 * Fail-closed, como todo gate do projeto: ausente, vazia ou com qualquer outro
 * valor significa **não publicado**. Nenhuma verificação remota é feita para
 * responder isso; o R2 não é consultado para renderizar a página.
 */
export function zipDeAnexosPublicado(): boolean {
  return process.env.ZIP_ANEXOS_PUBLICADO?.trim().toLowerCase() === "true";
}

/**
 * URL pública do pacote, ou `null` enquanto não houver pacote publicado.
 *
 * Exige as duas condições ao mesmo tempo: domínio público configurado **e**
 * publicação declarada. Faltando qualquer uma, a Prestação de Contas não oferece
 * o download — em vez de oferecer um link que não abre.
 */
export function urlDoZipDeAnexos(): string | null {
  if (!zipDeAnexosPublicado()) return null;
  const base = process.env.STORAGE_PUBLIC_URL?.replace(/\/+$/, "");
  return base ? `${base}/${CHAVE_ZIP_ANEXOS}` : null;
}

/**
 * Nome do arquivo dentro do pacote. Cada documento recebe uma pasta e o nome
 * físico do objeto é preservado; assim sete arquivos de D01 não colidem entre
 * si, inclusive quando compartilham a mesma extensão.
 */
export function nomeNoPacote(slug: string, linkPermanente: string): string {
  const semQuery = linkPermanente.split("?")[0] ?? "";
  const ultimo = semQuery.split("/").pop() ?? "";
  return `${slug}/${ultimo || "arquivo"}`;
}
