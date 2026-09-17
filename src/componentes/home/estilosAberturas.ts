/**
 * Estilos da abertura da Home. Escopados por `.ab-*`; não tocam nenhuma regra
 * de `estilos.ts`, que continua valendo para o resto da página. Só papéis de
 * `tokens.css`. Nenhuma animação; hover usa `--duracao-hover`.
 */
export const CSS_DAS_ABERTURAS = `
/* Peças comuns */
.ab-cta{display:flex;flex-wrap:wrap;align-items:center;gap:.75rem 1.25rem}
.home-observatorio .ab-botao{align-items:center}

/* ============================== B2 ============================== */
/* A fotografia é o plano integral; toda a leitura acontece sobre ela. */
.ab-b2{container-type:inline-size;position:relative;isolation:isolate;overflow:hidden;background:var(--hero-fundo-editorial);color:var(--color-texto-inverso)}
.ab-b2__foto{position:absolute;z-index:-1;inset:0;margin:0}
.ab-b2__foto picture{position:absolute;inset:0;display:block}
.ab-b2__foto img{display:block;width:100%;height:100%;object-fit:cover;object-position:0 28%}
.ab-b2__foto picture::after{content:"";position:absolute;inset:0;background:linear-gradient(to bottom,var(--hero-base),var(--hero-meio) 28%,var(--hero-veu-superior) 52%,var(--hero-base)),linear-gradient(to right,var(--hero-sombra-lateral),transparent 75%);pointer-events:none}
.ab-b2__legenda{position:absolute;right:var(--hl-margem);bottom:var(--hero-base-legenda);left:var(--hl-margem);display:flex;flex-direction:column;align-items:flex-end;font-family:var(--font-mono);font-size:var(--text-xs);letter-spacing:var(--tracking-mono);line-height:1.5;text-align:right;color:var(--color-texto-inverso)}
.ab-b2__linha>span+span::before{content:" · ";color:var(--color-texto-inverso)}
.ab-b2__legenda-titulo{font-family:var(--font-display);font-weight:600;letter-spacing:0;color:var(--color-texto-inverso)}
.ab-b2__base{display:flex;flex-direction:column;justify-content:space-between;gap:var(--hero-gap-editorial);min-height:var(--hero-altura-mobile);max-width:var(--largura-conteudo);margin-inline:auto;padding:var(--hero-respiro-foto-mobile) var(--hl-margem) var(--hero-rodape-mobile)}
.ab-b2__folha{display:flex;flex-direction:column;align-items:flex-start;gap:var(--hero-espaco-texto);max-width:44rem}
.ab-b2__titulo{display:flex;flex-direction:column;gap:var(--hero-espaco-titulo);text-wrap:balance}
.ab-b2__t1{color:var(--hero-acento-editorial)}
.ab-b2__t1,.ab-b2__t3{font-size:clamp(var(--text-base),1.5vw,var(--text-lg));font-weight:600}
.ab-b2__t2{font-size:var(--hero-titulo-editorial);line-height:1.02;letter-spacing:-.035em;font-weight:700}
.ab-b2__proposito{max-width:44ch;font-size:clamp(var(--text-base),1.4vw,var(--text-lg));line-height:1.45}
.home-observatorio .ab-b2 .ab-botao{border-color:var(--hero-acento-editorial);background:var(--hero-acento-editorial);color:var(--color-texto-sobre-destaque)}
.home-observatorio .ab-b2 .ab-botao:hover{background:var(--hero-fundo-editorial);color:var(--color-texto-inverso)}
@media (min-width:960px){
  .ab-b2__foto img{object-position:35% 36%}
  .ab-b2__foto picture::after{background:linear-gradient(to bottom,var(--hero-veu-superior),transparent 24%,var(--hero-meio) 66%,var(--hero-base) 100%),linear-gradient(to right,var(--hero-sombra-lateral),transparent 75%)}
  .ab-b2__base{display:grid;min-height:0;grid-template-columns:minmax(0,1.55fr) minmax(19rem,.9fr);padding-top:var(--hero-respiro-foto-desktop);padding-bottom:var(--hero-rodape-desktop)}
}
`.trim();
