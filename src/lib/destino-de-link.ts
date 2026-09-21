/**
 * Política de nova guia — decidida pela **função** do link, não pelo domínio.
 *
 * Abre em nova guia:
 *
 * - `documento`: o clique abre um arquivo para consulta — PDF, planilha,
 *   JSON, ZIP, imagem, áudio. Vale para arquivo do próprio site
 *   (`/anexos.json`) e para arquivo do Acervo (`https://acervo.…`).
 * - `externo`: o destino é outro site — Spotify, YouTube, OpenStreetMap,
 *   Google Maps, IBGE.
 *
 * Fica na mesma guia (`interno`): toda rota HTML do Observatório, inclusive
 * `/acervo/<documento>/arquivo/<id>`, que é a ficha do arquivo e não o arquivo;
 * âncoras (`#…`); `mailto:` e `tel:`, que não abrem página nenhuma.
 *
 * Esta função é a única fonte da política. `LinkDeDestino` a aplica na
 * interface e o teste de regressão a aplica ao HTML renderizado — os dois
 * lados leem a mesma regra.
 */

export type Destino = "interno" | "documento" | "externo";

/** Origens em que um endereço absoluto ainda é o próprio site. */
export const HOSTS_DO_SITE: readonly string[] = [
  "observatoriotobiassoueu.com.br",
  "www.observatoriotobiassoueu.com.br",
];

/**
 * Extensões que caracterizam arquivo aberto para consulta. Rota HTML do site
 * nunca termina assim — o App Router não gera `.html` nas URLs.
 */
const EXTENSOES_DOCUMENTAIS =
  /\.(pdf|json|csv|tsv|xlsx?|ods|docx?|odt|pptx?|odp|txt|zip|jpe?g|png|webp|avif|gif|svg|mp3|m4a|ogg|opus|wav|mp4|webm)$/i;

export function classificarDestino(
  href: string,
  hostsDoSite: readonly string[] = HOSTS_DO_SITE,
): Destino {
  const valor = href.trim();
  if (valor === "" || valor.startsWith("#") || /^(mailto|tel):/i.test(valor)) {
    return "interno";
  }

  if (/^[a-z][a-z0-9+.-]*:/i.test(valor) || valor.startsWith("//")) {
    const url = new URL(valor, "https://observatoriotobiassoueu.com.br");
    if (EXTENSOES_DOCUMENTAIS.test(url.pathname)) return "documento";
    return hostsDoSite.includes(url.hostname) ? "interno" : "externo";
  }

  const caminho = valor.split(/[?#]/)[0] ?? "";
  return EXTENSOES_DOCUMENTAIS.test(caminho) ? "documento" : "interno";
}
