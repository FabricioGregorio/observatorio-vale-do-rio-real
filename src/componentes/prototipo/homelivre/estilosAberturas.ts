/**
 * Estilos das três variações da abertura. Escopados por `.ab-*`; não tocam
 * nenhuma regra de `estilos.ts`, que continua valendo para o resto da página.
 * Só papéis de `tokens.css`. Nenhuma animação; hover usa `--duracao-hover`.
 */
export const CSS_DAS_ABERTURAS = `
/* Seletor DEV */
.ab-seletor{display:flex;flex-wrap:wrap;align-items:center;gap:.4rem 1rem;padding:.45rem var(--hl-margem);border-bottom:1px dashed var(--color-acento);font-family:var(--font-mono);font-size:var(--text-xs);letter-spacing:var(--tracking-mono);text-transform:uppercase}
.ab-seletor ul{display:flex;flex-wrap:wrap;gap:.35rem}
.home-livre .ab-seletor a{display:inline-block;padding:.3rem .55rem;border:1px solid var(--color-borda-forte);border-radius:var(--radius-ficha);color:var(--color-texto);text-decoration:none}
.home-livre .ab-seletor a[aria-current="page"]{background:var(--color-texto);border-color:var(--color-texto);color:var(--color-fundo)}

/* Peças comuns */
.ab-assinatura{display:flex;flex-wrap:wrap;align-items:baseline;gap:.2rem .55rem;margin:0;font-family:var(--font-display);font-size:var(--text-sm);font-weight:600;line-height:1.4}
.ab-seta{font-family:var(--font-mono);font-weight:400;color:var(--color-marca)}
.ab-nota{display:inline-flex;flex-direction:column;gap:.15rem;max-width:21rem;padding:.6rem .8rem;background:var(--color-fundo);border:1px solid var(--color-borda-forte);border-radius:var(--radius-ficha);font-size:var(--text-xs);line-height:1.4}
.ab-nota strong{font-family:var(--font-display);font-size:var(--text-sm)}
.ab-nota__meta{font-family:var(--font-mono);letter-spacing:var(--tracking-mono);text-transform:uppercase;color:var(--color-texto-suave)}
.ab-nota__pendente{font-family:var(--font-mono);letter-spacing:var(--tracking-mono);color:var(--color-acento)}
.ab-cta{display:flex;flex-wrap:wrap;align-items:center;gap:.75rem 1.25rem}
.home-livre .ab-botao{align-items:center}
.home-livre .ab-discreto{font-family:var(--font-mono);font-size:var(--text-xs);letter-spacing:var(--tracking-mono);text-transform:uppercase;color:var(--color-texto-suave)}
.home-livre .ab-discreto:hover{color:var(--color-texto)}
.ab-secao .hl-fontes{margin-top:1.75rem}

/* ============================== A ============================== */
.ab-a{display:grid;grid-template-areas:"cab" "foto" "texto";overflow-x:clip;padding-bottom:var(--hl-capitulo)}
.ab-a__cab{grid-area:cab;padding:clamp(1.75rem,6vw,4rem) var(--hl-margem) 1.5rem}
.ab-a__titulo{margin-top:.85rem;max-width:11ch;font-size:clamp(2.2rem,5.8vw,5.4rem);line-height:1;letter-spacing:-.035em;font-weight:700}
.ab-a__oficial{display:flex;flex-direction:column;gap:.2rem;margin-top:1rem;max-width:42ch}
.ab-a__oficial span:last-child{font-family:var(--font-display);font-weight:600;line-height:1.3}
.ab-a__foto{grid-area:foto;position:relative;margin:0}
.ab-a__foto img{display:block;width:100%;height:auto;aspect-ratio:16/10;object-fit:cover;object-position:50% 58%}
.ab-a__foto figcaption{position:absolute;left:var(--hl-margem);bottom:-2.25rem}
.ab-a__texto{grid-area:texto;display:flex;flex-direction:column;align-items:flex-start;gap:1.25rem;padding:3.75rem var(--hl-margem) 0}
.ab-a__proposito{max-width:30ch;font-size:clamp(var(--text-lg),2vw,var(--text-xl));line-height:1.42}
.ab-a__lede{max-width:46ch;color:var(--color-texto-suave)}
.ab-a__assinatura{display:flex;align-items:center;gap:.9rem;align-self:stretch;padding-top:1rem;border-top:1px solid var(--color-texto)}
.ab-selo.hl-selo{flex:0 0 2.75rem;height:2.75rem}
@media (min-width:960px){
  .ab-a{grid-template-columns:minmax(0,57fr) minmax(0,43fr);grid-template-rows:auto 1fr;grid-template-areas:"cab foto" "texto foto";column-gap:clamp(2.5rem,5vw,5rem);padding-left:max(var(--hl-margem),calc((100% - var(--largura-conteudo)) / 2 + var(--hl-margem)))}
  .ab-a__cab{padding:clamp(3rem,6vw,5rem) 0 0}
  .ab-a__texto{padding:2.25rem 0 0}
  .ab-a__foto img{height:100%;min-height:min(84svh,50rem);aspect-ratio:auto;object-position:50% 40%}
  .ab-a__foto figcaption{left:-3rem;bottom:3rem}
}

/* ============================== B ============================== */
.ab-b{padding-bottom:var(--hl-capitulo)}
.ab-b__foto{position:relative;margin:0}
.ab-b__foto img{display:block;width:100%;height:clamp(20rem,50svh,26rem);object-fit:cover;object-position:50% 35%}
.home-livre .ab-b__legenda{position:absolute;top:1rem;right:0;left:0;display:flex;justify-content:flex-end}
.ab-b__base{position:relative;display:grid;gap:2.25rem;margin-top:-4rem}
.ab-b__folha{display:flex;flex-direction:column;align-items:flex-start;gap:1.1rem;margin-right:1.5rem;padding:1.25rem 1.25rem 0;background:var(--color-fundo);border-top:2px solid var(--color-texto)}
.ab-b__titulo{display:flex;flex-direction:column;gap:.2rem;margin-top:.1rem}
.ab-b__t1,.ab-b__t3{font-size:clamp(var(--text-base),1.7vw,var(--text-xl));font-weight:600}
.ab-b__t2{max-width:14ch;font-size:clamp(2.05rem,5vw,4.4rem);line-height:.98;letter-spacing:-.035em;font-weight:700}
.ab-b__proposito{max-width:40ch;font-size:clamp(var(--text-base),1.5vw,var(--text-lg));line-height:1.45}
.ab-b__lado{display:flex;flex-direction:column;gap:1.25rem}
.ab-contagens{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border-top:2px solid var(--color-texto)}
.ab-contagens li{display:flex;flex-direction:column;gap:.3rem;padding:.9rem .9rem .9rem 0;border-bottom:1px solid var(--hl-fio)}
.ab-contagens strong{font-family:var(--font-display);font-size:clamp(var(--text-2xl),3.4vw,var(--text-4xl));font-weight:var(--peso-numeral);line-height:1;color:var(--color-marca)}
.ab-contagens span{font-size:var(--text-xs);line-height:1.35}
.ab-b__lede{color:var(--color-texto-suave)}
@media (min-width:960px){
  .ab-b__foto img{height:clamp(24rem,56svh,36rem);object-position:50% 45%}
  .home-livre .ab-b__legenda{top:auto;bottom:-1.5rem}
  .ab-b__base{grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:clamp(2.5rem,5vw,5rem);margin-top:-10rem}
  .ab-b__folha{margin-right:0;padding:2rem 2.5rem 0}
  .ab-b__lado{padding-top:13rem}
}

/* ============================== B2 ============================== */
/* A borda de conteúdo da página, medida no próprio container: é o que deixa
   a folha nascer na borda da janela e ainda alinhar o texto com as seções. */
.ab-b2{container-type:inline-size;position:relative;overflow-x:clip;padding-bottom:var(--hl-capitulo)}
.ab-b2 *{--ab-b2-borda:max(var(--hl-margem),calc((100cqw - var(--largura-conteudo)) / 2 + var(--hl-margem)))}
.ab-b2__foto{position:relative;margin:0}
.ab-b2__foto img{display:block;width:100%;height:clamp(15rem,36svh,18rem);object-fit:cover;object-position:50% 65%}
.ab-b2__legenda{display:flex;flex-direction:column;padding:.5rem var(--hl-margem) 0;font-family:var(--font-mono);font-size:var(--text-xs);letter-spacing:var(--tracking-mono);line-height:1.5;color:var(--color-texto-suave)}
.ab-b2__linha>span+span::before{content:" · ";color:var(--color-texto-suave)}
.ab-b2__legenda-titulo{font-family:var(--font-display);font-weight:600;letter-spacing:0;color:var(--color-texto)}
.ab-b2__base{display:grid;gap:2rem}
.ab-b2__folha{position:relative;isolation:isolate;display:flex;flex-direction:column;align-items:flex-start;gap:1rem;padding:1.5rem var(--hl-margem) 0;background:var(--color-fundo)}
.ab-b2__folha::before{content:"";position:absolute;z-index:-1;inset:0;background:var(--color-grafismo-territorial);opacity:var(--opacidade-grafismo-topografia);pointer-events:none;mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 720 360'%3E%3Cg fill='none' stroke='white' stroke-width='1.2'%3E%3Cpath d='M-30 71C81 6 166 26 222 83s119 63 188 3 181-76 340-8'/%3E%3Cpath d='M-44 112C72 41 163 57 216 109s120 59 191 7 181-61 354-9'/%3E%3Cpath d='M-55 157C62 84 154 90 211 138s124 56 196 15 181-48 365-14'/%3E%3Cpath d='M-61 207C54 132 147 126 209 168s128 54 201 24 180-36 373-21'/%3E%3Cpath d='M-66 263C50 181 143 166 210 202s132 55 207 36 180-22 378-25'/%3E%3Cpath d='M-72 325C48 232 140 207 213 237s136 57 214 49 181-6 381-31'/%3E%3C/g%3E%3C/svg%3E") center/cover no-repeat}
.ab-b2__titulo{display:flex;flex-direction:column;gap:.15rem}
.ab-b2__t1,.ab-b2__t3{font-size:clamp(var(--text-base),1.5vw,var(--text-lg));font-weight:600}
.ab-b2__t2{font-size:clamp(2.1rem,4.6vw,4.25rem);line-height:.98;letter-spacing:-.035em;font-weight:700}
.ab-b2__proposito{max-width:44ch;font-size:clamp(var(--text-base),1.4vw,var(--text-lg));line-height:1.45}
.ab-b2__lado{display:flex;flex-direction:column;gap:1rem;padding:0 var(--hl-margem)}
.ab-b2__provas-rotulo{margin:0;font-family:var(--font-mono);font-size:var(--text-xs);letter-spacing:var(--tracking-mono);text-transform:uppercase;color:var(--color-texto-suave)}
.ab-b2__provas{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border-top:1px solid var(--color-texto)}
.ab-b2__provas li{display:flex;flex-direction:column;gap:.25rem;padding:.7rem .75rem .7rem 0;border-bottom:1px solid var(--hl-fio)}
.ab-b2__provas strong{font-family:var(--font-display);font-size:clamp(var(--text-xl),2vw,var(--text-2xl));font-weight:var(--peso-numeral);line-height:1;color:var(--color-marca)}
.ab-b2__provas span{font-size:var(--text-xs);line-height:1.35}
.ab-b2 .ab-b2__assinatura{font-size:var(--text-xs);color:var(--color-texto-suave)}
@media (max-width:767px){
  .ab-seletor{flex-wrap:nowrap}
  .ab-seletor ul{flex-wrap:nowrap;overflow-x:auto}
  .ab-seletor li{flex:0 0 auto}
}
@media (min-width:960px){
  .ab-b2__foto img{height:clamp(24rem,54svh,36rem);object-position:50% 73%}
  .ab-b2__legenda{position:absolute;top:100%;right:var(--ab-b2-borda);align-items:flex-end;padding:.6rem 0 0;text-align:right}
  .ab-b2__t2{max-width:13ch}
  .ab-b2__base{grid-template-columns:calc(var(--ab-b2-borda) + (100cqw - 2 * var(--ab-b2-borda)) * .56) minmax(0,1fr);column-gap:clamp(2.5rem,5vw,4.5rem);margin-top:-8rem;padding-right:var(--ab-b2-borda)}
  .ab-b2__folha{padding:2.25rem clamp(2rem,4vw,3.5rem) 0 var(--ab-b2-borda)}
  .ab-b2__lado{padding:11.5rem 0 0}
}

/* ============================== C ============================== */
.ab-c{padding-block:clamp(1.5rem,4vw,3rem) var(--hl-capitulo)}
.ab-c__regua{display:flex;flex-wrap:wrap;justify-content:space-between;gap:.25rem 1rem;margin:0;padding-bottom:.55rem;border-bottom:1px solid var(--color-texto);font-family:var(--font-mono);font-size:var(--text-xs);letter-spacing:var(--tracking-mono);text-transform:uppercase;color:var(--color-texto-suave)}
.ab-c__letreiro{display:flex;flex-direction:column;margin:clamp(.75rem,2.5vw,1.75rem) 0 0;font-family:var(--font-display);font-size:clamp(3.1rem,11.5vw,10.5rem);font-weight:700;line-height:.86;letter-spacing:-.05em}
.ab-c__letreiro span:last-child{padding-left:.9em}
.ab-c__grade{display:grid;gap:2rem;margin-top:clamp(1.5rem,3vw,2.5rem)}
.ab-c__coluna{display:flex;flex-direction:column;align-items:flex-start;gap:1.25rem}
.ab-c__cartucho{display:flex;flex-direction:column;gap:.5rem;align-self:stretch;padding:.9rem 1rem;border:1px solid var(--color-texto)}
.ab-c__cartucho h1{font-size:clamp(var(--text-lg),1.9vw,var(--text-2xl));line-height:1.15}
.ab-c__proposito{font-size:clamp(var(--text-base),1.6vw,var(--text-lg));line-height:1.45}
.ab-c__rota{align-self:stretch;border-top:1px solid var(--color-texto)}
.ab-c__rota>div{position:relative;display:grid;grid-template-columns:6.5rem 1fr;gap:.75rem;padding:.55rem 0;border-bottom:1px solid var(--hl-fio);font-size:var(--text-sm)}
.ab-c__rota dt{font-family:var(--font-mono);font-size:var(--text-xs);letter-spacing:var(--tracking-mono);text-transform:uppercase;color:var(--color-texto-suave)}
.ab-c__rota dd{margin:0;font-family:var(--font-display);font-weight:600}
.ab-c__rota>div+div dt::before{content:"↓ ";color:var(--color-marca)}
.ab-c__mapa{margin:0}
.ab-c__mapa svg{display:block;width:100%;height:auto;max-height:24rem}
.ab-c__mapa path{fill:color-mix(in srgb,var(--color-fundo) 45%,var(--color-marca));stroke:var(--color-fundo);stroke-width:1.2;vector-effect:non-scaling-stroke}
.ab-c__mapa path[data-campo="true"]{fill:var(--color-marca)}
.ab-c__grade-carto line{stroke:var(--hl-fio);stroke-width:1;stroke-dasharray:2 4;vector-effect:non-scaling-stroke}
.ab-c__mapa circle{fill:var(--color-fundo);stroke:var(--color-texto);stroke-width:1;vector-effect:non-scaling-stroke}
.ab-c__mapa text{font-family:var(--font-mono);fill:var(--color-texto)}
.ab-c__municipios{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.1rem 1rem;margin-top:.75rem;counter-reset:municipio;font-size:var(--text-xs)}
.ab-c__municipios li{display:flex;flex-wrap:wrap;gap:0 .4rem;counter-increment:municipio;padding:.3rem 0;border-bottom:1px solid var(--hl-fio)}
.ab-c__municipios li::before{content:counter(municipio);min-width:1rem;font-family:var(--font-mono);color:var(--color-marca)}
.ab-c__campo{font-family:var(--font-mono);color:var(--color-texto-suave)}
.ab-c__prova{display:grid;grid-template-columns:7rem minmax(0,1fr);gap:.75rem;align-items:end;margin:0}
.ab-c__prova img{display:block;width:100%;height:auto;aspect-ratio:3/4;object-fit:cover;object-position:50% 45%;padding:.3rem;background:var(--color-fundo-elevado);border:1px solid var(--color-borda-forte)}
.ab-c__prova .ab-nota{max-width:none;padding:0;border:0;background:none}
.ab-c__sumario{align-self:stretch}
.ab-c__sumario ol{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 1rem;margin-top:.4rem;border-top:1px solid var(--color-texto)}
.home-livre .ab-c__sumario a{display:flex;gap:.5rem;padding:.4rem 0;border-bottom:1px solid var(--hl-fio);color:var(--color-texto);font-family:var(--font-display);font-size:var(--text-sm);text-decoration:none}
.home-livre .ab-c__sumario a:hover{text-decoration:underline}
.ab-c__sumario-n{min-width:1.6rem;font-family:var(--font-mono);color:var(--color-marca)}
.ab-c__lede{max-width:52ch;font-size:var(--text-sm);color:var(--color-texto-suave)}
@media (min-width:960px){
  .ab-c__grade{grid-template-columns:minmax(0,4fr) minmax(0,4.5fr) minmax(0,3.5fr);gap:clamp(2rem,3.5vw,3.5rem);align-items:start}
  .ab-c__letreiro span:last-child{padding-left:1.6em}
  .ab-c__prova{grid-template-columns:1fr;align-items:start}
  .ab-c__prova img{max-height:18rem}
  .ab-c__sumario ol{grid-template-columns:1fr}
}
`.trim();
