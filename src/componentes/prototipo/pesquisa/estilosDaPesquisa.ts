/**
 * Direção visual dos presets A/B da H3.
 *
 * Cores, tipografias e raios vêm exclusivamente de `tokens.css`. As duas
 * composições compartilham conteúdo e linguagem; variam somente a densidade
 * editorial e a distribuição no grid.
 */
export const CSS_DA_PESQUISA = `
.pesquisa-campo{container-type:inline-size;display:flex;flex-direction:column;gap:clamp(2.5rem,6vw,5rem);padding-block:clamp(4.5rem,9vw,8rem);border-top:1px solid var(--color-borda)}
.pesquisa-campo__cabecalho{display:grid;gap:1rem;max-width:var(--largura-leitura)}
.pesquisa-campo__cabecalho h2{font-size:clamp(var(--text-3xl),5vw,var(--text-5xl));max-width:15ch}
.pesquisa-campo__cabecalho>p:last-child{font-size:var(--text-lg);max-width:58ch}
.pesquisa-campo__proposta{display:inline-flex;width:fit-content;max-width:100%;flex-wrap:wrap;align-items:center;gap:.5rem;border-bottom:2px solid var(--color-marca);padding-bottom:.25rem}
.pesquisa-campo figure{margin:0}
.pesquisa-campo img{display:block;width:100%;height:auto;border-radius:var(--radius-ficha);background:var(--color-borda)}
.pesquisa-campo__imagem{overflow:hidden;border-radius:var(--radius-ficha);background:var(--color-borda)}
.pesquisa-campo__legenda{display:grid;gap:.4rem;padding-top:.85rem;color:var(--color-texto)}
.pesquisa-campo__legenda strong{font-family:var(--font-display);font-size:var(--text-lg)}
.pesquisa-campo__ficha{display:grid;gap:.65rem;margin:0}
.pesquisa-campo__ficha>div{display:grid;grid-template-columns:minmax(7.5rem,.7fr) 1fr;gap:1rem;padding-block:.65rem;border-top:1px solid var(--color-borda)}
.pesquisa-campo__ficha dt{font-family:var(--font-mono);font-size:var(--text-xs);letter-spacing:var(--tracking-mono);text-transform:uppercase;color:var(--color-texto-suave)}
.pesquisa-campo__ficha dd{margin:0}
.pesquisa-campo__texto{display:flex;flex-direction:column;gap:1.4rem;max-width:var(--largura-leitura)}
.pesquisa-campo__texto p{margin:0}
.pesquisa-campo__texto h3{font-size:clamp(var(--text-2xl),3vw,var(--text-3xl));max-width:15ch}
.pesquisa-campo__metodo{padding-top:1.4rem;border-top:1px solid var(--color-borda)}
.pesquisa-campo__aviso{padding-left:1rem;border-left:3px solid var(--color-marca);color:var(--color-texto-suave)}

.pesquisa-campo[data-composicao="documental-aberto"] .pesquisa-campo__corpo{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:clamp(1.25rem,3vw,2.5rem);align-items:start}
.pesquisa-campo[data-composicao="documental-aberto"] .pesquisa-campo__principal{grid-column:1/span 8}
.pesquisa-campo[data-composicao="documental-aberto"] .pesquisa-campo__texto{grid-column:10/-1;padding-top:clamp(1rem,5vw,5rem)}
.pesquisa-campo[data-composicao="documental-aberto"] .pesquisa-campo__secundarias{grid-column:2/-1;display:grid;grid-template-columns:repeat(10,minmax(0,1fr));gap:clamp(1.25rem,3vw,2.5rem);margin-top:clamp(1rem,5vw,4rem)}
.pesquisa-campo[data-composicao="documental-aberto"] .pesquisa-campo__secundarias figure:first-child{grid-column:1/span 4}
.pesquisa-campo[data-composicao="documental-aberto"] .pesquisa-campo__secundarias figure:last-child{grid-column:6/span 4;margin-top:clamp(3rem,8vw,8rem)}

.pesquisa-campo[data-composicao="caderno-tecnico"]{gap:clamp(2.5rem,5vw,4rem)}
.pesquisa-campo[data-composicao="caderno-tecnico"] .pesquisa-campo__cabecalho{display:grid;grid-template-columns:1fr 2fr;max-width:none;align-items:end}
.pesquisa-campo[data-composicao="caderno-tecnico"] .pesquisa-campo__cabecalho>div{grid-column:1/-1}
.pesquisa-campo[data-composicao="caderno-tecnico"] .pesquisa-campo__cabecalho h2{max-width:11ch}
.pesquisa-campo[data-composicao="caderno-tecnico"] .pesquisa-campo__cabecalho>p:last-child{border-left:1px solid var(--color-borda);padding-left:clamp(1rem,3vw,2.5rem)}
.pesquisa-campo[data-composicao="caderno-tecnico"] .pesquisa-campo__corpo{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:clamp(1.25rem,2.5vw,2rem);align-items:start}
.pesquisa-campo[data-composicao="caderno-tecnico"] .pesquisa-campo__principal{grid-column:1/span 7}
.pesquisa-campo[data-composicao="caderno-tecnico"] .pesquisa-campo__texto{grid-column:9/-1}
.pesquisa-campo[data-composicao="caderno-tecnico"] .pesquisa-campo__secundarias{grid-column:1/-1;display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:clamp(1.25rem,2.5vw,2rem);padding-top:clamp(2rem,5vw,4rem);border-top:1px solid var(--color-borda)}
.pesquisa-campo[data-composicao="caderno-tecnico"] .pesquisa-campo__secundarias figure:first-child{grid-column:2/span 4}
.pesquisa-campo[data-composicao="caderno-tecnico"] .pesquisa-campo__secundarias figure:last-child{grid-column:7/span 4}

@container (max-width: 47.99rem){
  .pesquisa-campo{gap:2.75rem;padding-block:4.5rem}
  .pesquisa-campo__cabecalho h2{font-size:clamp(var(--text-2xl),11vw,var(--text-4xl))}
  .pesquisa-campo__cabecalho>p:last-child{font-size:var(--text-base)}
  .pesquisa-campo__ficha>div{grid-template-columns:1fr;gap:.2rem}
  .pesquisa-campo[data-composicao="documental-aberto"] .pesquisa-campo__corpo,
  .pesquisa-campo[data-composicao="caderno-tecnico"] .pesquisa-campo__corpo{display:flex;flex-direction:column;gap:2.5rem}
  .pesquisa-campo[data-composicao="documental-aberto"] .pesquisa-campo__texto,
  .pesquisa-campo[data-composicao="caderno-tecnico"] .pesquisa-campo__texto{order:2;padding-top:0}
  .pesquisa-campo[data-composicao="documental-aberto"] .pesquisa-campo__principal,
  .pesquisa-campo[data-composicao="caderno-tecnico"] .pesquisa-campo__principal{order:1;width:100%}
  .pesquisa-campo[data-composicao="documental-aberto"] .pesquisa-campo__secundarias,
  .pesquisa-campo[data-composicao="caderno-tecnico"] .pesquisa-campo__secundarias{order:3;display:flex;flex-direction:column;gap:2.5rem;width:100%;margin:0;padding-top:2.5rem}
  .pesquisa-campo[data-composicao="documental-aberto"] .pesquisa-campo__secundarias figure,
  .pesquisa-campo[data-composicao="caderno-tecnico"] .pesquisa-campo__secundarias figure{width:min(88%,28rem);margin:0}
  .pesquisa-campo[data-composicao="documental-aberto"] .pesquisa-campo__secundarias figure:last-child,
  .pesquisa-campo[data-composicao="caderno-tecnico"] .pesquisa-campo__secundarias figure:last-child{align-self:flex-end;margin:0}
  .pesquisa-campo[data-composicao="caderno-tecnico"] .pesquisa-campo__cabecalho{display:flex;flex-direction:column;align-items:stretch}
  .pesquisa-campo[data-composicao="caderno-tecnico"] .pesquisa-campo__cabecalho>p:last-child{border-left:0;padding-left:0}
}
`.trim();
