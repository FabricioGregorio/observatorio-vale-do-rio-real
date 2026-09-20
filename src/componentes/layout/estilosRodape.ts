/**
 * CSS do rodapé público compartilhado.
 *
 * Vive numa string, e não numa folha de rota, pela mesma razão do cabeçalho: o
 * rodapé é servido em toda rota, e a Home monta a sua própria árvore. Uma
 * folha de rota não a alcançaria, e duas folhas seriam duas verdades.
 *
 * Cor, família, raio e espessura saem de `tokens.css`; nenhum hex entra aqui,
 * com uma exceção declarada — o painel das marcas é branco puro, e é branco
 * puro porque é isso que o manual do Governo Federal chama de "aplicação em
 * box branco". Um branco de token que mudasse com o tema alteraria o fundo da
 * marca, que os três manuais proíbem.
 *
 * ## A grade
 *
 * Quatro faixas empilhadas no telefone; no desktop, identidade e navegação
 * dividem a largura, e a régua de marcas ocupa a linha inteira — ela tem 260 px
 * de marca federal e não cabe numa coluna estreita sem descer do mínimo de
 * redução, que o manual proíbe.
 */
export const CSS_DO_RODAPE = `
.rd{position:relative;isolation:isolate;overflow:hidden;background:var(--color-fundo-inverso);color:var(--color-texto-inverso)}
.rd__tracado{position:absolute;inset:0;z-index:-1;width:100%;height:100%;fill:none;stroke:var(--color-texto-inverso);stroke-width:1;opacity:.14;pointer-events:none}
.rd__tracado circle{fill:var(--color-destaque);stroke:none}
.rd__tracado circle:last-of-type{fill:none;stroke:var(--color-destaque);stroke-width:1.5;opacity:.7}
.rd__interior{display:grid;grid-template-columns:1fr;gap:2.25rem;width:min(100% - 2rem,var(--largura-conteudo));margin-inline:auto;padding-block:clamp(2.5rem,6vw,4rem)}
.rd h2{margin:0}
.rd__identidade{display:flex;flex-direction:column;gap:.55rem}
.rd__nome{margin:0;max-width:26ch;font-family:var(--font-display);font-size:clamp(var(--text-lg),2.4vw,var(--text-2xl));line-height:1.18;letter-spacing:var(--tracking-display)}
.rd__realizacao{margin:0;font-size:var(--text-sm)}
.rd__permanencia{margin:.35rem 0 0;max-width:46ch;font-size:var(--text-sm);line-height:1.55;color:var(--color-texto-inverso);opacity:.82}
.rd__secoes ul,.rd__institucional ul{display:flex;flex-direction:column;gap:.45rem;margin:.65rem 0 0;padding:0;list-style:none}
.rd__institucional ul{font-size:var(--text-sm);opacity:.82}
.rd a{color:var(--color-texto-inverso);text-decoration:none}
.rd a:hover{color:var(--color-destaque);text-decoration:underline;text-underline-offset:.22em}
.rd :focus-visible{outline:3px solid var(--color-destaque);outline-offset:3px}
.rd__secoes a,.rd__institucional a{display:inline-block;padding-block:.15rem}
.rd__creditos{display:flex;flex-direction:column;gap:.75rem}

/* Aplicação em box branco — manual do Governo Federal, p. 14. O respiro é
   muito maior que a caixa de proteção exigida, que é a espessura do "I" de
   BRASIL. */
.rd__painel{background:#fff;border-radius:var(--radius-ficha);padding:clamp(.9rem,3vw,2rem)}

@media (width >= 48rem){
  .rd__interior{grid-template-columns:minmax(0,1.35fr) minmax(0,1fr) minmax(0,1fr);gap:2.5rem 2rem}
  .rd__creditos{grid-column:1 / -1}
}
@media (width >= 64rem){
  .rd__interior{gap:3rem 3rem}
}
`;
