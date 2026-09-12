/** Seletores DEV explícitos: o CSS não alcança Home nem os laboratórios H1–H4.
 *
 * A H3.5.1 organiza este arquivo pelas quatro famílias de grafismo declaradas
 * em `gramatica.ts`. Cada família tem uma classe-raiz `lv-g-*`, e é por ela que
 * os testes contam ocorrência — não por nome de elemento.
 */
export const CSS_DA_LINGUAGEM = `
.linguagem-visual { max-width: var(--largura-conteudo); margin-inline: auto; }
.lv-abertura { padding: var(--lv-capitulo) var(--lv-margem); }
.lv-abertura h1 { font-size: var(--text-4xl); margin-block: calc(var(--spacing) * 4); }
.lv-controles { display: flex; flex-wrap: wrap; align-items: end; gap: var(--lv-respiro); margin-top: calc(var(--spacing) * 6); }
.lv-controles fieldset { display: flex; flex-wrap: wrap; gap: calc(var(--spacing) * 4); }
.lv-controles label, .lv-controles button { cursor: pointer; padding: calc(var(--spacing) * 3); border: 1px solid var(--color-borda-forte); }
.lv-controles input { accent-color: var(--color-marca); margin-right: calc(var(--spacing) * 2); }
.lv-controles label:has(:checked) { background: var(--color-fundo-inverso); color: var(--color-texto-inverso); }
.lv-recomendado { flex: 0 0 100%; order: 1; font-family: var(--font-mono); font-size: var(--text-sm); color: var(--color-texto-suave); border-top: 1px solid var(--lv-linha); padding-top: calc(var(--spacing) * 3); }
.linguagem-visual:has(input[value="A"]:checked) [data-preset="B"],
.linguagem-visual:has(input[value="B"]:checked) [data-preset="A"] { display: none; }

/* ---- estrutura de capítulo ---------------------------------------------- */
.lv-preset { position: relative; --lv-escala-foto: var(--lv-escala-a); }
[data-preset="B"] { --lv-escala-foto: var(--lv-escala-b); }
.lv-capitulo { padding: var(--lv-capitulo) var(--lv-margem); }
.lv-territorio { background: var(--lv-superficie-territorio); border-top: 1px solid var(--lv-linha); }
.lv-campo { background: var(--lv-superficie-campo); }
.lv-ensaio { background: var(--lv-superficie-ensaio); }
.lv-grade { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); gap: var(--lv-respiro); align-items: center; }
.lv-leitura { display: flex; flex-direction: column; align-items: start; gap: calc(var(--spacing) * 5); min-width: 0; }
.lv-leitura h2, .lv-heading h2 { font-size: clamp(var(--text-2xl), 3.4vw, var(--text-4xl)); }
.lv-leitura h3, .lv-ensaio h2 { font-size: var(--text-2xl); }
.lv-leitura details { width: 100%; border-block: 1px solid var(--lv-linha); padding-block: calc(var(--spacing) * 3); }
.lv-leitura summary { cursor: pointer; font-family: var(--font-mono); }
.lv-leitura ul { padding: calc(var(--spacing) * 4); list-style: disc inside; }

/* ---- família cartográfica ------------------------------------------------ */
.lv-g-cartografico { pointer-events: none; }
.lv-mapa svg { display: block; width: 100%; height: auto; }
.lv-mapa path { fill: var(--color-fundo); stroke: var(--color-borda-forte); stroke-width: 1; }
.lv-mapa path[data-vale] { fill: var(--color-marca); stroke: var(--color-texto); }
.lv-fio { width: calc(var(--spacing) * 3); align-self: stretch; border-left: 1px solid var(--lv-linha); display: flex; flex-direction: column; justify-content: space-around; }
.lv-fio span { width: calc(var(--spacing) * 3); border-top: 1px solid var(--lv-linha); }
.lv-cruz { display: block; width: var(--lv-cruz); height: var(--lv-cruz); flex: none; }
.lv-cruz line { stroke: var(--lv-linha); stroke-width: 1; }
.lv-eixos { align-self: stretch; min-height: calc(var(--spacing) * 32); border-left: 1px solid var(--lv-linha); border-bottom: 1px solid var(--lv-linha); display: flex; flex-direction: column; justify-content: space-around; }
.lv-eixos span { border-top: 1px dotted var(--lv-linha); }

/* ---- família documental -------------------------------------------------- */
.lv-registro dl { width: 100%; font-family: var(--font-mono); font-size: var(--text-sm); }
.lv-registro dl > div { display: grid; grid-template-columns: 1fr 2fr; gap: calc(var(--spacing) * 4); border-top: 1px solid var(--lv-linha); border-left: 1px solid transparent; padding-block: calc(var(--spacing) * 3); padding-left: calc(var(--spacing) * 3); margin-left: calc(var(--spacing) * -3); transition: border-left-color var(--duracao-hover) var(--easing-padrao), background-color var(--duracao-hover) var(--easing-padrao); }
.lv-registro dl > div:hover { border-left-color: var(--lv-linha); background: var(--lv-realce-ficha); }
.lv-registro dt { text-transform: uppercase; color: var(--color-texto-suave); }
.lv-fotografia figcaption { border-top: 1px solid var(--lv-linha); padding-top: calc(var(--spacing) * 4); display: flex; flex-direction: column; gap: calc(var(--spacing) * 2); transition: border-top-color var(--duracao-hover) var(--easing-padrao); }
.lv-fotografia strong { font-family: var(--font-display); font-size: var(--text-lg); }
.lv-mapa figcaption { border-top: 1px solid var(--lv-linha); padding-top: calc(var(--spacing) * 3); }

/* ---- família de transição ------------------------------------------------ */
.lv-g-transicao { position: relative; display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: var(--lv-respiro); align-items: center; min-height: var(--lv-passagem); padding: calc(var(--spacing) * 6) var(--lv-margem); border-block: 1px solid var(--lv-linha); }
.lv-g-transicao[data-passagem="leitura"] { min-height: var(--lv-passagem-curta); }
.lv-ponte { max-width: 40ch; }
.lv-ponte > p:last-child { font-size: var(--text-xl); margin-top: calc(var(--spacing) * 3); }
.lv-origem { grid-column: 2 / -1; font-size: var(--text-sm); }

/* ---- família de identidade ----------------------------------------------- */
.lv-g-identidade { width: var(--lv-ave-contida); pointer-events: none; }
.lv-g-identidade img { width: 100%; height: auto; }

/* ---- microinterações ----------------------------------------------------- */
.lv-foto-link { display: block; overflow: clip; }
.lv-foto-link img { width: 100%; height: auto; transition: transform var(--duracao-hover) var(--easing-padrao); }
.lv-foto-link:is(:hover, :focus-visible) img { transform: scale(var(--lv-escala-foto)); }
.lv-fotografia:has(.lv-foto-link:is(:hover, :focus-visible)) figcaption { border-top-color: var(--color-marca); }
.lv-link { display: inline-flex; align-items: center; gap: calc(var(--spacing) * 3); padding-block: calc(var(--spacing) * 3); color: var(--color-link); text-decoration: underline; text-underline-offset: calc(var(--spacing)); transition: color var(--duracao-hover) var(--easing-padrao), text-underline-offset var(--duracao-hover) var(--easing-padrao); }
.lv-link span { transition: transform var(--duracao-hover) var(--easing-padrao); }
.lv-link:is(:hover, :focus-visible) { color: var(--color-link-hover); text-underline-offset: calc(var(--spacing) * 1.5); }
.lv-link:is(:hover, :focus-visible) span { transform: translateX(calc(var(--spacing))); }

/* ---- ensaio de leitura de dado ------------------------------------------- */
.lv-heading { display: flex; flex-direction: column; gap: calc(var(--spacing) * 4); max-width: 62ch; margin-bottom: var(--lv-respiro); }
.lv-fotografia { max-width: var(--lv-foto-largura); }
.lv-ensaio h2 { margin-block: calc(var(--spacing) * 4) var(--lv-respiro); }
.lv-ensaio table { width: 100%; border-collapse: collapse; font-size: var(--text-sm); text-align: left; }
.lv-ensaio th, .lv-ensaio td { border-bottom: 1px solid var(--lv-linha); padding: calc(var(--spacing) * 3); }
.lv-ensaio caption { text-align: left; padding-bottom: calc(var(--spacing) * 3); font-family: var(--font-mono); }

/* ---- preset B refinado ---------------------------------------------------
   A continuidade é o que a H3.5 não tinha: um fio único desce a página inteira
   e as passagens o engrossam, em vez de cada capítulo começar do zero. */
[data-preset="B"]::before { content: ""; position: absolute; inset-block: 0; left: calc(var(--lv-margem) / 2); border-left: 1px solid var(--lv-linha); pointer-events: none; }
[data-preset="B"] .lv-g-transicao { border-left: calc(var(--spacing)) solid var(--color-marca); }
[data-preset="B"] .lv-g-identidade { width: var(--lv-ave-viva); height: var(--lv-passagem); overflow: clip; align-self: end; }
[data-preset="B"] .lv-fio { border-color: var(--color-marca); }
[data-preset="B"] .lv-registro { border-left: 1px solid var(--color-marca); padding-left: calc(var(--spacing) * 6); }
[data-preset="B"] .lv-heading { border-left: 1px solid var(--color-marca); padding-left: calc(var(--spacing) * 6); }

@keyframes lv-entrada { from { transform: translateY(var(--lv-revelar-distancia)); opacity: .65; } to { transform: none; opacity: 1; } }
@media (prefers-reduced-motion: no-preference) {
  [data-preset="B"] .lv-revelar[data-revelado] { animation: lv-entrada var(--duracao-revelacao) var(--easing-entrada) both; }
}
@media (max-width: 767px) {
  .lv-grade { grid-template-columns: minmax(0, 1fr); }
  .lv-abertura h1 { font-size: var(--text-3xl); }
  .lv-mapa { order: 2; }
  .lv-fotografia { width: 100%; }
  .lv-g-transicao { gap: calc(var(--spacing) * 3); }
  .lv-ponte > p:last-child { font-size: var(--text-lg); }
  [data-preset="B"]::before { content: none; }
  [data-preset="B"] .lv-g-identidade { height: auto; }
  .lv-eixos { min-height: calc(var(--spacing) * 16); }
}
@media (prefers-reduced-motion: reduce) {
  .lv-preset .lv-foto-link:is(:hover, :focus-visible) img, .lv-preset .lv-link:is(:hover, :focus-visible) span { transform: none; }
  .lv-preset .lv-revelar { animation: none; transform: none; opacity: 1; }
}
`;
