/** Seletores DEV explícitos: o CSS não alcança Home nem os laboratórios H1–H4. */
export const CSS_DA_LINGUAGEM = `
.linguagem-visual { max-width: var(--largura-conteudo); margin-inline: auto; }
.lv-abertura { padding: var(--lv-capitulo) var(--lv-margem); }
.lv-abertura h1 { font-size: var(--text-4xl); margin-block: calc(var(--spacing) * 4); }
.lv-controles { display: flex; flex-wrap: wrap; align-items: end; gap: var(--lv-respiro); margin-top: calc(var(--spacing) * 6); }
.lv-controles fieldset { display: flex; flex-wrap: wrap; gap: calc(var(--spacing) * 4); }
.lv-controles label, .lv-controles button { cursor: pointer; padding: calc(var(--spacing) * 3); border: 1px solid var(--color-borda-forte); }
.lv-controles input { accent-color: var(--color-marca); margin-right: calc(var(--spacing) * 2); }
.lv-controles label:has(:checked) { background: var(--color-fundo-inverso); color: var(--color-texto-inverso); }
.linguagem-visual:has(input[value="A"]:checked) [data-preset="B"],
.linguagem-visual:has(input[value="B"]:checked) [data-preset="A"] { display: none; }
.lv-capitulo { padding: var(--lv-capitulo) var(--lv-margem); }
.lv-territorio { background: var(--lv-superficie-territorio); border-top: 1px solid var(--lv-linha); }
.lv-campo { background: var(--lv-superficie-campo); }
.lv-ensaio { background: var(--lv-superficie-ensaio); border-top: 1px solid var(--lv-linha); }
.lv-grade { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); gap: var(--lv-respiro); align-items: center; }
.lv-leitura { display: flex; flex-direction: column; align-items: start; gap: calc(var(--spacing) * 5); min-width: 0; }
.lv-leitura h2, .lv-heading h2 { font-size: clamp(var(--text-2xl), 3.4vw, var(--text-4xl)); }
.lv-leitura h3, .lv-ensaio h2 { font-size: var(--text-2xl); }
.lv-leitura details { width: 100%; border-block: 1px solid var(--lv-linha); padding-block: calc(var(--spacing) * 3); }
.lv-leitura summary { cursor: pointer; font-family: var(--font-mono); }
.lv-leitura ul { padding: calc(var(--spacing) * 4); list-style: disc inside; }
.lv-mapa svg { display: block; width: 100%; height: auto; }
.lv-mapa path { fill: var(--color-fundo); stroke: var(--color-borda-forte); stroke-width: 1; }
.lv-mapa path[data-vale] { fill: var(--color-marca); stroke: var(--color-texto); }
.lv-mapa figcaption { border-top: 1px solid var(--lv-linha); padding-top: calc(var(--spacing) * 3); }
.lv-passagem { position: relative; display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: var(--lv-respiro); align-items: center; min-height: var(--lv-passagem); padding: calc(var(--spacing) * 6) var(--lv-margem); border-block: 1px solid var(--lv-linha); }
.lv-ponte { max-width: 40ch; }
.lv-ponte > p:last-child { font-size: var(--text-xl); margin-top: calc(var(--spacing) * 3); }
.lv-fio { width: calc(var(--spacing) * 3); align-self: stretch; border-left: 1px solid var(--lv-linha); display: flex; flex-direction: column; justify-content: space-around; pointer-events: none; }
.lv-fio span { width: calc(var(--spacing) * 3); border-top: 1px solid var(--lv-linha); }
.lv-assinatura { width: var(--lv-ave-contida); pointer-events: none; }
.lv-assinatura img { width: 100%; height: auto; }
.lv-origem { grid-column: 2 / -1; font-size: var(--text-sm); }
.lv-heading { display: flex; flex-direction: column; gap: calc(var(--spacing) * 4); max-width: 62ch; margin-bottom: var(--lv-respiro); }
.lv-fotografia { max-width: var(--lv-foto-largura); }
.lv-foto-link { display: block; overflow: clip; }
.lv-foto-link img { width: 100%; height: auto; transition: transform var(--duracao-hover) var(--easing-padrao); }
.lv-foto-link:is(:hover, :focus-visible) img { transform: scale(var(--lv-escala-a)); }
.lv-fotografia figcaption { border-top: 1px solid var(--lv-linha); padding-top: calc(var(--spacing) * 4); display: flex; flex-direction: column; gap: calc(var(--spacing) * 2); }
.lv-fotografia strong { font-family: var(--font-display); font-size: var(--text-lg); }
.lv-registro dl { width: 100%; font-family: var(--font-mono); font-size: var(--text-sm); }
.lv-registro dl > div { display: grid; grid-template-columns: 1fr 2fr; gap: calc(var(--spacing) * 4); border-top: 1px solid var(--lv-linha); padding-block: calc(var(--spacing) * 3); }
.lv-registro dt { text-transform: uppercase; color: var(--color-texto-suave); }
.lv-link { display: inline-flex; align-items: center; gap: calc(var(--spacing) * 3); padding-block: calc(var(--spacing) * 3); color: var(--color-link); text-decoration: underline; text-underline-offset: calc(var(--spacing)); transition: color var(--duracao-hover) var(--easing-padrao); }
.lv-link span { transition: transform var(--duracao-hover) var(--easing-padrao); }
.lv-link:is(:hover, :focus-visible) { color: var(--color-link-hover); }
.lv-link:is(:hover, :focus-visible) span { transform: translateX(calc(var(--spacing))); }
.lv-ensaio h2 { margin-block: calc(var(--spacing) * 4) var(--lv-respiro); }
.lv-eixos { align-self: stretch; min-height: calc(var(--spacing) * 32); border-left: 1px solid var(--lv-linha); border-bottom: 1px solid var(--lv-linha); display: flex; flex-direction: column; justify-content: space-around; pointer-events: none; }
.lv-eixos span { border-top: 1px dotted var(--lv-linha); }
.lv-ensaio table { width: 100%; border-collapse: collapse; font-size: var(--text-sm); text-align: left; }
.lv-ensaio th, .lv-ensaio td { border-bottom: 1px solid var(--lv-linha); padding: calc(var(--spacing) * 3); }
.lv-ensaio caption { text-align: left; padding-bottom: calc(var(--spacing) * 3); font-family: var(--font-mono); }
[data-preset="B"] .lv-passagem { border-left: calc(var(--spacing)) solid var(--color-marca); }
[data-preset="B"] .lv-assinatura { width: var(--lv-ave-viva); height: var(--lv-passagem); overflow: clip; align-self: end; }
[data-preset="B"] .lv-fio { border-color: var(--color-marca); }
[data-preset="B"] .lv-registro { border-left: 1px solid var(--color-marca); padding-left: calc(var(--spacing) * 6); }
[data-preset="B"] .lv-foto-link:is(:hover, :focus-visible) img { transform: scale(var(--lv-escala-b)); }
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
  .lv-passagem { gap: calc(var(--spacing) * 3); }
  .lv-ponte > p:last-child { font-size: var(--text-lg); }
  [data-preset="B"] .lv-assinatura { height: auto; }
  .lv-eixos { min-height: calc(var(--spacing) * 16); }
}
@media (prefers-reduced-motion: reduce) {
  .lv-preset .lv-foto-link:is(:hover, :focus-visible) img, .lv-preset .lv-link:is(:hover, :focus-visible) span { transform: none; }
  .lv-preset .lv-revelar { animation: none; transform: none; opacity: 1; }
}
`;
