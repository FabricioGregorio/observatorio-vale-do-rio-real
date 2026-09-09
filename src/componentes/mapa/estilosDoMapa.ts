import type { RelacaoTerritorial } from "../../dados/territorio/tipos";

/**
 * Estilo do mapa — Tarefa 10B.3.3.
 *
 * O CSS vai num `<style>` junto do componente, e não em `tokens.css`: é estilo
 * de componente, não token, e `tokens.css` continua sendo só a fonte de cor,
 * tipografia e raio. Nenhum valor novo é criado aqui — todos saem de tokens já
 * existentes.
 *
 * **Tudo é escopado por `.mapa-territorio`.** Um `<style>` em documento HTML
 * não é escopado, nem dentro de SVG inline: sem o prefixo, classes de uma letra
 * como `.m` valeriam para a página inteira.
 *
 * Mapeamento aprovado pelo responsável em 2026-09-03:
 *
 * | camada | canal visual |
 * |---|---|
 * | base | preenchimento pedra, traço texto-suave |
 * | Vale do Rio Real | preenchimento milho, traço mata |
 * | pesquisa de campo | hachura diagonal em mata, sobreposta |
 * | comparação | traço tracejado em anil |
 *
 * Os três canais são **independentes** — preenchimento, padrão e traço —, e é
 * isso que faz o modelo de camadas funcionar visualmente: Tobias Barreto lê
 * como Vale *e* pesquisa; São Cristóvão lê como pesquisa *e* comparação, sem
 * preenchimento de Vale. Nenhuma camada depende só de cor, o que atende à WCAG
 * 1.4.1.
 *
 * **Espessura de traço como escala de estado.** Os valores crescem de forma
 * monotônica, então os estados se distinguem por espessura mesmo sem cor:
 *
 * | estado | traço |
 * |---|---|
 * | base | 0,5 |
 * | Vale | 1,2 |
 * | foco | 2,4 |
 * | selecionado | 3,5 |
 *
 * A borda da camada base passou de `--color-borda` 0,6 para
 * `--color-texto-suave` 0,5 na revisão de interação: em `--color-borda` sobre
 * pedra as 75 fronteiras eram quase invisíveis. O traço ficou **mais escuro e
 * mais fino**, o que torna a fronteira perceptível sem que a base dispute
 * atenção com o milho do Vale — que continua com o traço duas vezes mais
 * grosso e em mata.
 */

/** Classe que envolve o mapa e a lista, e escopa todo o CSS abaixo. */
export const CLASSE_RAIZ = "mapa-territorio";

/** Id do padrão de hachura, declarado uma vez no `<defs>` do SVG. */
export const ID_HACHURA = "hachura-pesquisa";

/** Id do SVG, usado pela ilha de interação para encontrá-lo. */
export const ID_DO_SVG = "mapa-svg-sergipe";

/** Id da lista territorial, que a ilha realça ao selecionar. */
export const ID_DA_LISTA = "lista-territorial-itens";

/** Classe do polígono de cada município, conforme suas relações. */
export function classesDoMunicipio(
  relacoes: readonly RelacaoTerritorial[],
): string {
  const classes = ["m"];
  if (relacoes.includes("vale-rio-real")) classes.push("v");
  if (relacoes.includes("comparacao")) classes.push("c");
  return classes.join(" ");
}

export function temHachura(relacoes: readonly RelacaoTerritorial[]): boolean {
  return relacoes.includes("pesquisa-campo");
}

/**
 * CSS do mapa.
 *
 * Nomes de classe curtos de propósito: cada um se repete até 75 vezes num
 * documento que é servido inteiro.
 *
 * `cursor:pointer` só aparece quando a ilha marca o SVG com
 * `data-interativo`: sem JavaScript o polígono não é clicável, e um cursor de
 * mão prometeria o que não acontece.
 *
 * ## O mapa é invariante de tema — Fase H0
 *
 * Todo valor aqui vem da **paleta bruta**, nunca de papel semântico. Não é
 * detalhe de estilo: os papéis trocam de valor no tema escuro, e o mapa não
 * pode trocar junto enquanto a camada cartográfica não for redesenhada (H3).
 *
 * Três referências foram corrigidas na H0, todas sem efeito nenhum no tema
 * claro — os valores novos são exatamente os que os papéis já resolviam ali:
 *
 * | era | virou | o que aconteceria no escuro |
 * |---|---|---|
 * | `--color-texto-suave` | `--color-carvao-suave` | a fronteira dos 75 municípios clarearia sobre o preenchimento pedra e sumiria — desfazendo em silêncio a correção registrada na ADR-010 |
 * | `--color-fundo-elevado` | `--color-branco` | o contorno do marcador escureceria e deixaria de separar o pino do preenchimento claro |
 * | herdava `--color-texto` | `--color-texto-sobre-destaque` | o texto do item realçado viraria pedra sobre milho: 1,5:1 |
 *
 * O preenchimento da camada base é `--color-pedra`, que é bruto e continua
 * claro nos dois temas. Enquanto for assim, o traço por cima dele também
 * precisa ser escuro nos dois temas.
 */
export const CSS_DO_MAPA = `
.${CLASSE_RAIZ} .m{fill:var(--color-pedra);stroke:var(--color-carvao-suave);stroke-width:.5;transition:fill .15s}
.${CLASSE_RAIZ} .v{fill:var(--color-milho);stroke:var(--color-mata);stroke-width:1.2}
.${CLASSE_RAIZ} .c{stroke:var(--color-anil);stroke-width:1.2;stroke-dasharray:5 2.5}
.${CLASSE_RAIZ} .h{fill:url(#${ID_HACHURA});stroke:none;pointer-events:none}
.${CLASSE_RAIZ} [data-interativo] .m{cursor:pointer}
.${CLASSE_RAIZ} .m:hover{fill:var(--color-mata-claro)}
.${CLASSE_RAIZ} .m:focus{outline:none}
.${CLASSE_RAIZ} .m:focus-visible{stroke:var(--color-destaque);stroke-width:2.4;fill:var(--color-mata-claro)}
.${CLASSE_RAIZ} .m[aria-selected="true"]{stroke:var(--color-mata);stroke-width:3.5;fill:var(--color-mata-claro)}
.${CLASSE_RAIZ} .m[aria-selected="true"]:focus-visible{stroke:var(--color-destaque);stroke-width:3.5}
.${CLASSE_RAIZ} .p{fill:var(--color-barro);stroke:var(--color-branco);stroke-width:1.5}
.${CLASSE_RAIZ} .f[data-selecionado="true"]{background-color:var(--color-destaque);color:var(--color-texto-sobre-destaque);outline:2px solid var(--color-mata)}
@media (prefers-reduced-motion:reduce){.${CLASSE_RAIZ} .m{transition:none}}
`.trim();
