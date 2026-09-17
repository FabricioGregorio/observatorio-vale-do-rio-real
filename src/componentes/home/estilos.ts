/**
 * Estilos da Home.
 *
 * Tudo escopado em `.home-observatorio`. Nenhuma cor literal: só papéis de
 * `tokens.css` e misturas entre eles, que acompanham o tema. Movimento só em
 * hover/foco, com `--duracao-hover`, que o `tokens.css` zera sob
 * `prefers-reduced-motion`. Nenhuma animação de rolagem.
 */
export const CSS_DA_HOME = `
.home-observatorio{
  --hl-margem:clamp(1rem,4vw,3.5rem);
  --hl-capitulo:clamp(4rem,9vw,7.5rem);
  --hl-fio:color-mix(in srgb,var(--color-borda-forte) 45%,var(--color-fundo));
  --hero-texto:var(--color-texto);
  background:var(--color-fundo);
  color:var(--color-texto);
}
.home-observatorio a{color:var(--color-link);text-underline-offset:.18em}
.home-observatorio a:hover{color:var(--color-link-hover)}
:where(.home-observatorio) :where(ul,ol){list-style:none;margin:0;padding:0}
.hl-quadro{max-width:var(--largura-conteudo);margin-inline:auto;padding-inline:var(--hl-margem)}

.hl-pendente{display:inline-block;margin-top:.5rem;padding:.2rem .45rem;border:1px dashed var(--color-acento);border-radius:var(--radius-ficha);color:var(--color-acento);font-family:var(--font-mono);font-size:var(--text-xs);letter-spacing:var(--tracking-mono);line-height:1.4}


/* Botões */
.home-observatorio .hl-botao{display:inline-flex;flex-wrap:wrap;align-items:baseline;gap:.25rem .75rem;padding:.8rem 1.15rem;border:1px solid var(--color-texto);border-radius:var(--radius-ficha);color:var(--color-texto);font-family:var(--font-display);font-weight:600;text-decoration:none;transition:background-color var(--duracao-hover) var(--easing-padrao),color var(--duracao-hover) var(--easing-padrao)}
.home-observatorio .hl-botao:hover{background:var(--color-texto);color:var(--color-fundo)}
.home-observatorio .hl-botao--cheio{background:var(--color-texto);color:var(--color-fundo)}
.home-observatorio .hl-botao--cheio:hover{background:var(--color-fundo);color:var(--color-texto)}
.home-observatorio .hl-botao--curto{padding:.5rem .8rem;font-size:var(--text-sm)}
.hl-botao__meta{font-family:var(--font-mono);font-weight:400;font-size:var(--text-xs);letter-spacing:var(--tracking-mono)}
.hl-acoes{display:flex;flex-wrap:wrap;gap:.75rem;margin-top:2rem}

/* Síntese da pesquisa, entre Origem e Território. */
.hl-faixa-pesquisa{padding-block:var(--faixa-respiro);border-top:1px solid var(--hl-fio)}
.hl-faixa-pesquisa__lista{display:grid;margin-top:var(--faixa-espaco)}
.hl-faixa-pesquisa__lista li{display:grid;grid-template-columns:var(--faixa-coluna-numero) minmax(0,1fr);align-items:center;gap:var(--faixa-espaco);padding-block:var(--faixa-espaco)}
.hl-faixa-pesquisa__lista li+li{border-top:1px solid var(--hl-fio)}
.hl-faixa-pesquisa__lista strong{font-family:var(--font-display);font-size:var(--text-4xl);font-weight:var(--peso-numeral);line-height:1;color:var(--color-marca)}
.hl-faixa-pesquisa__lista span{font-size:var(--text-base);line-height:var(--leading-leitura)}
@media (min-width:768px){.hl-faixa-pesquisa__lista{grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--faixa-espaco)}.hl-faixa-pesquisa__lista li+li{border-top:0;border-left:1px solid var(--hl-fio);padding-left:var(--faixa-espaco)}}

/* Capítulos */
.hl-capitulo{padding-block:var(--hl-capitulo);border-top:1px solid var(--hl-fio)}
.hl-capitulo--rio,.hl-capitulo--serra{position:relative;overflow:clip}
.hl-capitulo--rio>.hl-quadro,.hl-capitulo--serra>.hl-quadro{position:relative;isolation:isolate}
.hl-grafismo{position:absolute;z-index:-1;display:block;color:var(--color-grafismo-territorial);pointer-events:none}
.hl-grafismo--rio{right:calc(var(--hl-margem) * -1);bottom:calc(var(--hl-capitulo) * -.72);width:min(64rem,88vw);height:clamp(6rem,14vw,10rem);opacity:var(--opacidade-grafismo-rio)}
.hl-grafismo--rio path{stroke-width:1.25}
.hl-grafismo--serra{right:50%;bottom:calc(var(--hl-capitulo) * -.82);width:100vw;height:clamp(7rem,15vw,11rem);opacity:var(--opacidade-grafismo-serra);transform:translateX(50%)}
.hl-grafismo--serra path:first-child{stroke-width:1.2}
.hl-grafismo--serra path:last-child{stroke-width:.65}
@media (max-width:767px){.hl-grafismo--rio{width:105vw;opacity:calc(var(--opacidade-grafismo-rio) * .8)}.hl-grafismo--serra{opacity:calc(var(--opacidade-grafismo-serra) * .8)}}
.hl-rotulo{display:flex;align-items:baseline;gap:.85rem;margin:0}
.hl-num{font-family:var(--font-display);font-weight:var(--peso-numeral);font-stretch:125%;color:var(--color-marca)}
.hl-antes{margin:1.25rem 0 0;max-width:40ch;font-size:var(--text-base);font-style:italic}
@media (min-width:768px){.hl-antes{font-size:var(--text-lg)}}
.hl-capitulo h2{margin-top:.85rem;max-width:20ch;font-size:clamp(var(--text-xl),3.6vw,var(--text-4xl))}
.hl-texto{max-width:var(--largura-leitura)}
.hl-texto p+p{margin-top:1rem}
.hl-intro{margin-top:1.5rem;font-size:var(--text-lg);line-height:1.5}
.hl-nota{margin-top:1.25rem;font-size:var(--text-sm);color:var(--color-texto-suave)}
.hl-ponte{display:flex;align-items:center;gap:1rem;margin-top:3rem;font-size:var(--text-lg);font-style:italic}
.hl-ponte::before{content:"";flex:0 0 3rem;height:1px;background:currentColor}


/* I Origem */
.hl-origem{display:grid;gap:2rem;margin-top:2rem;align-items:start}
.hl-origem .hl-texto{font-size:var(--text-lg);line-height:1.55}
.hl-cadeia{display:grid;margin-top:3.5rem}
.hl-elo{position:relative;padding:1.75rem 1.5rem 1.5rem 0;border-top:2px solid var(--color-texto)}
.hl-elo::before{content:"";position:absolute;top:-.45rem;left:0;width:.75rem;height:.75rem;border:2px solid var(--color-texto);border-radius:50%;background:var(--color-fundo)}
.hl-elo h3{margin-top:.5rem;font-size:var(--text-xl)}
.hl-elo p:last-child{margin-top:.6rem;color:var(--color-texto-suave)}
.hl-elo__nome{display:flex;align-items:center;gap:.85rem}
.hl-elo__nome h3{margin-top:0}
.hl-selo{flex:0 0 3.5rem;height:3.5rem;overflow:hidden;clip-path:circle(50% at 50% 50%)}
.hl-selo img{width:100%;height:100%;object-fit:cover}
@media (min-width:960px){
  .hl-cadeia{grid-template-columns:repeat(3,minmax(0,1fr))}
  .hl-elo+.hl-elo{padding-left:1.5rem}
  .hl-elo+.hl-elo::before{left:1.5rem}
}

/* II Território */
.hl-territorio{display:grid;gap:3rem;margin-top:2rem;align-items:start}
@media (min-width:960px){.hl-territorio{grid-template-columns:minmax(0,5fr) minmax(0,7fr)}}
.hl-mapa{position:relative}
.hl-mapa__svg{display:block;width:100%;height:auto}
.hl-mapa__janela{overflow:hidden}
.hl-mapa__palco{transform-origin:0 0;transition:transform var(--duracao-painel) var(--easing-padrao);will-change:transform}
.hl-mapa__svg path{fill:color-mix(in srgb,var(--color-fundo) 86%,var(--color-texto));stroke:var(--color-fundo);stroke-width:1;vector-effect:non-scaling-stroke}
[data-amostra]{background:color-mix(in srgb,var(--color-fundo) 86%,var(--color-texto))}
[data-amostra="vale"]{background:color-mix(in srgb,var(--color-fundo) 45%,var(--color-marca))}
[data-amostra="vale campo"]{background:var(--color-marca)}
[data-amostra="comparacao"]{background:var(--color-acento)}
[data-amostra="lugar"]{position:relative;background:var(--color-barro);border-radius:50% 50% 50% 0;transform:rotate(-45deg)}
.hl-mapa__svg[data-interativo="true"] g[data-recorte]{cursor:pointer}
.hl-mapa__svg[data-interativo="true"] g[data-recorte]:hover path{fill:color-mix(in srgb,var(--color-fundo) 76%,var(--color-texto))}
.hl-mapa__svg g[data-recorte]:focus{outline:none}
.hl-mapa__svg g[data-recorte]:focus-visible path{stroke:var(--color-destaque);stroke-width:3;stroke-dasharray:6 4}
.hl-mapa__svg g[data-recorte][aria-selected="true"] path{stroke:var(--color-texto);stroke-width:2.4}
.hl-mapa[data-selecionado="vale"] g[data-recorte="vale"] path[data-rel~="vale"]{fill:color-mix(in srgb,var(--color-fundo) 45%,var(--color-marca))}
.hl-mapa[data-selecionado="vale"] g[data-recorte="vale"] path[data-rel~="vale"][data-rel~="campo"]{fill:var(--color-marca)}
.hl-mapa[data-selecionado="comparacao"] g[data-recorte="comparacao"] path{fill:var(--color-acento)}
.hl-mapa__rotulo{fill:var(--color-texto);font-family:var(--font-display);font-weight:600;opacity:0;paint-order:stroke;stroke:var(--color-fundo);stroke-width:4;text-anchor:middle;transition:opacity var(--duracao-painel) var(--easing-padrao)}
.hl-mapa[data-selecionado="vale"] g[data-recorte="vale"] .hl-mapa__rotulo,.hl-mapa[data-selecionado="comparacao"] g[data-recorte="comparacao"] .hl-mapa__rotulo{opacity:1}
.hl-mapa__pin{display:none;pointer-events:none}.hl-mapa__pin circle{fill:var(--color-barro);stroke:var(--color-branco);stroke-width:2}.hl-mapa__pin .hl-mapa__pin-miolo{fill:var(--color-branco);stroke:none}.hl-mapa__pin text{fill:var(--color-texto);font-family:var(--font-display);font-size:18px;font-weight:600;paint-order:stroke;stroke:var(--color-fundo);stroke-width:5}.hl-mapa[data-selecionado="vale"] .hl-mapa__pin[data-pin-do-recorte="vale"],.hl-mapa[data-selecionado="comparacao"] .hl-mapa__pin[data-pin-do-recorte="comparacao"]{display:block}
.hl-mapa__orientacao{margin:0 0 .75rem;font-size:var(--text-sm);color:var(--color-texto-suave)}
.hl-mapa__painel{margin-top:1rem;padding:.9rem 1rem;border:1px solid var(--hl-fio);border-radius:var(--radius-ficha);font-size:var(--text-sm)}
.hl-mapa__painel p{margin:0 0 .35rem}
.hl-mapa__painel-titulo{font-family:var(--font-display);font-weight:600}
.hl-mapa__painel-lista{color:var(--color-texto-suave)}
.hl-mapa__voltar{margin-top:.75rem;padding:.45rem .9rem;border:1px solid var(--color-texto);border-radius:var(--radius-ficha);background:none;color:var(--color-texto);font-family:var(--font-display);font-size:var(--text-sm);cursor:pointer}
.hl-municipios>div[data-selecionado]{border-left:3px solid var(--color-marca);padding-left:.6rem;background:color-mix(in srgb,var(--color-fundo) 90%,var(--color-marca))}
.hl-legenda-mapa{display:grid;gap:.4rem;margin-top:1.75rem;font-size:var(--text-sm)}
.hl-legenda-mapa li{display:flex;align-items:center;gap:.6rem}
.hl-legenda-mapa span{flex:0 0 1rem;height:1rem;border-radius:var(--radius-ficha)}
.hl-municipios{margin-top:1.5rem;border-top:1px solid var(--color-texto)}
.hl-municipios>div{display:grid;grid-template-columns:minmax(8rem,1fr) 2fr;gap:1rem;padding:.6rem 0;border-bottom:1px solid var(--hl-fio);font-size:var(--text-sm)}
.hl-municipios dt{font-family:var(--font-display);font-weight:600}
.hl-municipios dd{margin:0;color:var(--color-texto-suave)}
.hl-municipios__nota{display:block;color:var(--color-texto)}

/* III Lugares */
.hl-dupla{display:grid;gap:2rem;margin-top:3rem}
@media (min-width:960px){.hl-dupla{grid-template-columns:repeat(2,minmax(0,1fr))}}
.hl-equip{display:flex;flex-direction:column;background:var(--color-fundo-elevado);border:1px solid var(--color-borda);border-radius:var(--radius-ficha);overflow:hidden}
.hl-equip__imagem{position:relative;margin:0;aspect-ratio:4/3;overflow:hidden;background:color-mix(in srgb,var(--color-fundo) 90%,var(--color-texto))}
/* Crédito de autoria: discreto, sobre a base da fotografia, nunca sobre a
   área principal da imagem. */
.hl-credito{position:absolute;right:0;bottom:0;padding:.15rem .4rem;background:color-mix(in srgb,var(--color-fundo) 82%,transparent);color:var(--color-texto-suave);font-family:var(--font-mono);font-size:var(--text-xs);letter-spacing:var(--tracking-mono)}
.hl-equip__imagem img{display:block;width:100%;height:100%;object-fit:cover;object-position:50% 60%}
.hl-equip__corpo{display:flex;flex:1;flex-direction:column;align-items:flex-start;gap:1rem;padding:clamp(1.25rem,3vw,2rem)}
.hl-equip h3{font-size:clamp(var(--text-xl),2.4vw,var(--text-2xl))}
.hl-reuniu{align-self:stretch;border-top:1px solid var(--hl-fio)}
.hl-reuniu li{display:flex;justify-content:space-between;gap:1rem;padding:.55rem 0;border-bottom:1px solid var(--hl-fio);font-size:var(--text-sm)}
.hl-estado{font-family:var(--font-mono);font-size:var(--text-xs);letter-spacing:var(--tracking-mono);text-transform:uppercase;white-space:nowrap;color:var(--color-texto-suave)}
.hl-estado[data-estado="publicado"]{color:var(--color-marca);font-weight:500}

/* IV Leitura — faixa inversa */
.hl-leitura{background:var(--color-fundo-inverso);color:var(--color-texto-inverso);border-top:0}
.hl-leitura .meta-ficha,.hl-leitura .hl-num{color:color-mix(in srgb,var(--color-texto-inverso) 85%,var(--color-fundo-inverso))}
.home-observatorio .hl-leitura a{color:var(--color-texto-inverso)}
.hl-leitura :focus-visible{outline-color:var(--color-destaque)}
.hl-protagonista{display:grid;gap:2rem;margin-top:3rem;align-items:end}
@media (min-width:960px){.hl-protagonista{grid-template-columns:minmax(0,6fr) minmax(0,5fr)}}
.hl-numero{margin:0;font-family:var(--font-display);font-weight:var(--peso-numeral);font-stretch:125%;font-size:clamp(4.5rem,15vw,10.5rem);line-height:.9;letter-spacing:-.03em;color:var(--color-destaque)}
.hl-numero__rotulo{margin-top:.75rem;font-family:var(--font-display);font-size:var(--text-xl);font-weight:600}
.hl-protagonista__leitura h3{font-size:var(--text-lg)}
.hl-protagonista__leitura>p{margin-top:.6rem}
.hl-ficha{display:grid;gap:.45rem;margin-top:1.25rem;padding-top:1rem;border-top:1px solid color-mix(in srgb,var(--color-texto-inverso) 35%,var(--color-fundo-inverso));font-size:var(--text-sm)}
.hl-ficha>div{display:grid;grid-template-columns:5.5rem 1fr;gap:.75rem}
.hl-ficha dt{font-family:var(--font-mono);font-size:var(--text-xs);letter-spacing:var(--tracking-mono);text-transform:uppercase;padding-top:.15rem}
.hl-ficha dd{margin:0}
.hl-apoios{display:grid;grid-template-columns:repeat(auto-fit,minmax(14rem,1fr));margin-top:3.5rem;border-top:2px solid var(--color-texto-inverso)}
.hl-apoio{padding:1.25rem 1.5rem 1.25rem 0;border-bottom:1px solid color-mix(in srgb,var(--color-texto-inverso) 35%,var(--color-fundo-inverso))}
.hl-apoio dt{font-size:var(--text-sm)}
.hl-apoio__valor{margin:.35rem 0 0;font-family:var(--font-display);font-weight:var(--peso-numeral);font-size:clamp(var(--text-xl),2.6vw,var(--text-2xl))}
.hl-apoio__regra{margin:.4rem 0 0;font-size:var(--text-xs);line-height:1.5}

/* V Escuta */
.hl-escuta{display:grid;gap:3rem;margin-top:2rem;align-items:start}
@media (min-width:960px){.hl-escuta{grid-template-columns:minmax(0,5fr) minmax(0,6fr)}}
.hl-metodo{padding-left:1rem;border-left:2px solid var(--color-marca)}
.hl-entrevistas{border-top:2px solid var(--color-texto)}
.hl-entrevistas li{display:grid;grid-template-columns:2.5rem minmax(0,1fr);gap:.1rem 1rem;padding:.8rem 0;border-bottom:1px solid var(--hl-fio);align-items:baseline}
.hl-entrevistas li .meta-ficha{grid-column:2}
.hl-entrevistas__n{font-family:var(--font-mono);color:var(--color-marca)}
.hl-entrevistas__onde{font-family:var(--font-display);font-weight:600}
@media (min-width:600px){
  .hl-entrevistas li{grid-template-columns:2.5rem minmax(0,1fr) auto}
  .hl-entrevistas li .meta-ficha{grid-column:auto;text-align:right}
}
.hl-ilha{display:grid;gap:1.5rem;margin-top:4.5rem;padding-top:2rem;border-top:1px solid var(--hl-fio);align-items:start}
@media (min-width:960px){.hl-ilha{grid-template-columns:minmax(0,3fr) minmax(0,8fr)}}
.hl-ilha h3{font-size:var(--text-lg)}
.hl-ilha__texto p{margin-top:.5rem;font-size:var(--text-sm);color:var(--color-texto-suave)}
.hl-ilha__fotos{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.75rem}
.hl-ilha__fotos figure{margin:0}
.hl-ilha__fotos img{display:block;width:100%;height:auto;aspect-ratio:3/4;object-fit:cover;border-radius:var(--radius-ficha)}
.hl-ilha__fotos figcaption{display:flex;flex-direction:column;margin-top:.4rem;font-size:var(--text-xs);line-height:1.4}

/* VI Produtos */
.hl-pod{display:grid;gap:2rem;margin-top:3rem;padding:clamp(1.5rem,4vw,3rem);background:var(--color-fundo-elevado);border:1px solid var(--color-borda);border-left:6px solid var(--color-marca);border-radius:var(--radius-ficha)}
@media (min-width:960px){.hl-pod{grid-template-columns:minmax(0,5fr) minmax(0,6fr);align-items:center}}
.hl-pod h3{margin-top:.5rem;font-size:clamp(var(--text-2xl),4.5vw,var(--text-4xl))}
.hl-pod__fato{margin-top:.75rem;font-size:var(--text-lg);font-weight:600}
.hl-pod p+p{margin-top:.5rem}
.hl-episodios{display:grid;gap:.75rem}
.hl-episodio{display:flex;align-items:center;gap:1rem;padding:1rem;border:1px dashed var(--color-borda-forte);border-radius:var(--radius-ficha)}
.hl-episodio__n{font-family:var(--font-display);font-weight:var(--peso-numeral);font-stretch:125%;font-size:var(--text-2xl);line-height:1;color:var(--color-marca)}
.hl-episodio__vazio{font-family:var(--font-mono);font-size:var(--text-xs);letter-spacing:var(--tracking-mono);color:var(--color-texto-suave)}
.hl-catalogo{display:grid;grid-template-columns:repeat(auto-fit,minmax(16rem,1fr));margin-top:3rem;border-top:2px solid var(--color-texto)}
.hl-catalogo li{display:flex;flex-direction:column;align-items:flex-start;gap:.45rem;padding:1.25rem 1.5rem 1.25rem 0;border-bottom:1px solid var(--hl-fio)}
.hl-catalogo h3{font-size:var(--text-lg)}
.hl-catalogo p{font-size:var(--text-sm);color:var(--color-texto-suave)}
.hl-secoes{display:flex;flex-wrap:wrap;align-items:baseline;gap:.5rem 1.5rem;margin-top:2rem}
.hl-secoes ul{display:flex;flex-wrap:wrap;gap:.5rem 1.25rem}

/* VII Conferência */
.hl-conferencia{display:grid;gap:2.5rem;margin-top:2rem;align-items:end}
@media (min-width:960px){.hl-conferencia{grid-template-columns:minmax(0,6fr) minmax(0,5fr)}}
.hl-conferencia .hl-texto{font-size:var(--text-lg)}
.hl-hash{margin:0;padding:1.25rem;border-left:3px solid var(--color-marca);background:var(--color-fundo-elevado)}
.hl-hash code{display:block;margin-top:.5rem;font-family:var(--font-mono);font-size:var(--text-sm);overflow-wrap:anywhere}

/* Rodapé */
.hl-rodape{background:var(--color-fundo-inverso);color:var(--color-texto-inverso)}
.hl-rodape__linha{display:flex;flex-wrap:wrap;justify-content:space-between;gap:1rem 2rem;padding-block:2rem;font-size:var(--text-sm)}
.hl-rodape ul{display:flex;flex-wrap:wrap;gap:.5rem 1.5rem}
.home-observatorio .hl-rodape a{color:var(--color-texto-inverso)}
.hl-rodape :focus-visible{outline-color:var(--color-destaque)}
`.trim();
