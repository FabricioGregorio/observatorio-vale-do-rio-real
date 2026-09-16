/**
 * Estilos do experimento `/dev/home-livre`.
 *
 * Tudo escopado em `.home-livre`. Nenhuma cor literal: só papéis de
 * `tokens.css` e misturas entre eles, que acompanham o tema. Movimento só em
 * hover/foco, com `--duracao-hover`, que o `tokens.css` zera sob
 * `prefers-reduced-motion`. Nenhuma animação de rolagem.
 */
export const CSS_DA_HOME_LIVRE = `
.home-livre{
  --hl-margem:clamp(1rem,4vw,3.5rem);
  --hl-capitulo:clamp(4rem,9vw,7.5rem);
  --hl-fio:color-mix(in srgb,var(--color-borda-forte) 45%,var(--color-fundo));
  --hero-texto:var(--color-texto);
  background:var(--color-fundo);
  color:var(--color-texto);
}
.home-livre a{color:var(--color-link);text-underline-offset:.18em}
.home-livre a:hover{color:var(--color-link-hover)}
:where(.home-livre) :where(ul,ol){list-style:none;margin:0;padding:0}
.hl-quadro{max-width:var(--largura-conteudo);margin-inline:auto;padding-inline:var(--hl-margem)}

.hl-dev{margin:0;padding:.5rem var(--hl-margem);background:var(--color-destaque);color:var(--color-texto-sobre-destaque);font-family:var(--font-mono);font-size:var(--text-xs);letter-spacing:var(--tracking-mono);text-transform:uppercase}
.hl-pendente{display:inline-block;margin-top:.5rem;padding:.2rem .45rem;border:1px dashed var(--color-acento);border-radius:var(--radius-ficha);color:var(--color-acento);font-family:var(--font-mono);font-size:var(--text-xs);letter-spacing:var(--tracking-mono);line-height:1.4}

/* Topo */
.hl-topo{border-bottom:1px solid var(--hl-fio)}
.hl-topo__linha{display:flex;flex-wrap:wrap;align-items:center;gap:.75rem 2rem;padding-block:1rem}
.home-livre .hl-topo__marca{display:flex;align-items:center;gap:.75rem;color:var(--color-texto);text-decoration:none;font-family:var(--font-display);font-weight:600;font-size:var(--text-sm)}
.hl-topo__marca img{height:2.5rem;width:auto;border-radius:var(--radius-ficha)}
.hl-topo__nav{order:3;flex-basis:100%;overflow-x:auto}
.hl-topo__nav ul{display:flex;gap:1.5rem;white-space:nowrap}
.home-livre .hl-topo__nav a{color:var(--color-texto);font-family:var(--font-display);font-size:var(--text-sm);text-decoration:none}
.home-livre .hl-topo__nav a:hover{text-decoration:underline}
.home-livre .hl-topo :focus-visible{outline-color:var(--color-destaque)}
.home-livre .hl-capitulo a:not(.hl-botao),.home-livre .hl-abertura a:not(.hl-botao),.home-livre .hl-mapa__painel a{text-decoration:underline;text-underline-offset:.18em}
.hl-topo__util{display:flex;align-items:center;gap:.75rem;margin-left:auto}
@media (min-width:1024px){.hl-topo__nav{order:0;flex-basis:auto}}
.hl-topo__nav-estreita{order:3;flex-basis:100%}
.home-livre[data-contexto="publico"] .hl-topo__nav{display:none}
.home-livre[data-contexto="publico"] .hl-topo__nav-estreita button,.home-livre[data-contexto="publico"] .hl-topo__nav-estreita a{color:var(--color-texto)}
.home-livre[data-contexto="publico"] .hl-topo__nav-estreita button{border-color:var(--color-texto)}
@media (min-width:1024px){.home-livre[data-contexto="publico"] .hl-topo__nav{display:block}.hl-topo__nav-estreita{display:none}}

/* Botões */
.home-livre .hl-botao{display:inline-flex;flex-wrap:wrap;align-items:baseline;gap:.25rem .75rem;padding:.8rem 1.15rem;border:1px solid var(--color-texto);border-radius:var(--radius-ficha);color:var(--color-texto);font-family:var(--font-display);font-weight:600;text-decoration:none;transition:background-color var(--duracao-hover) var(--easing-padrao),color var(--duracao-hover) var(--easing-padrao)}
.home-livre .hl-botao:hover{background:var(--color-texto);color:var(--color-fundo)}
.home-livre .hl-botao--cheio{background:var(--color-texto);color:var(--color-fundo)}
.home-livre .hl-botao--cheio:hover{background:var(--color-fundo);color:var(--color-texto)}
.home-livre .hl-botao--curto{padding:.5rem .8rem;font-size:var(--text-sm)}
.hl-botao__meta{font-family:var(--font-mono);font-weight:400;font-size:var(--text-xs);letter-spacing:var(--tracking-mono)}
.hl-acoes{display:flex;flex-wrap:wrap;gap:.75rem;margin-top:2rem}

/* Abertura */
.hl-abertura{display:grid;gap:clamp(2rem,5vw,4.5rem);padding-block:clamp(2.5rem,7vw,5.5rem) var(--hl-capitulo)}
.hl-abertura h1{margin-top:1rem;font-size:clamp(var(--text-2xl),4.3vw,var(--text-5xl));max-width:17ch}
.hl-lede{margin-top:1.5rem;max-width:34ch;font-size:clamp(var(--text-lg),2.1vw,var(--text-xl));line-height:1.45}
.hl-tres{display:grid;grid-template-columns:repeat(auto-fit,minmax(12rem,1fr));margin-top:2.5rem;border-top:2px solid var(--color-texto)}
.hl-tres>div{padding:1rem 1.25rem 1rem 0;border-bottom:1px solid var(--hl-fio)}
.hl-tres dd{margin:.35rem 0 0;font-family:var(--font-display);font-weight:600;line-height:var(--leading-titulo)}
.hl-abertura__foto{margin:0}
.hl-abertura__foto img{display:block;width:100%;height:auto;aspect-ratio:4/5;object-fit:cover;object-position:50% 30%;border-radius:var(--radius-ficha)}
.hl-legenda{display:flex;flex-direction:column;gap:.2rem;margin-top:.75rem;font-size:var(--text-sm)}
.hl-legenda strong{font-family:var(--font-display)}
@media (min-width:960px){
  .hl-abertura{grid-template-columns:minmax(0,7fr) minmax(0,4fr);align-items:end}
  .hl-abertura__foto img{aspect-ratio:auto;max-height:78svh}
}

/* Capítulos */
.hl-capitulo{padding-block:var(--hl-capitulo);border-top:1px solid var(--hl-fio)}
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

.hl-fontes{margin-top:2.5rem;padding-top:.75rem;border-top:1px dashed var(--hl-fio);max-width:var(--largura-leitura);font-size:var(--text-sm)}
.hl-fontes summary{cursor:pointer;color:var(--color-acento);font-family:var(--font-mono);font-size:var(--text-xs);letter-spacing:var(--tracking-mono);text-transform:uppercase}
.hl-fontes dl{display:grid;gap:.6rem;margin-top:.75rem}
.hl-fontes dt{font-weight:600}
.hl-fontes dd{margin:0;color:var(--color-texto-suave)}

/* I Origem */
.hl-origem{display:grid;gap:2rem;margin-top:2rem;align-items:start}
.hl-origem .hl-texto{font-size:var(--text-lg);line-height:1.55}
.hl-assinatura{display:flex;flex-direction:column;align-items:flex-start;gap:.5rem}
.hl-assinatura img{width:auto;height:6.5rem}
@media (max-width:767px){.hl-assinatura img{height:2.75rem}}
@media (min-width:960px){.hl-origem{grid-template-columns:minmax(0,1fr) auto}}
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
.hl-equip__imagem{aspect-ratio:4/3;overflow:hidden;background:color-mix(in srgb,var(--color-fundo) 90%,var(--color-texto))}
.hl-equip__imagem img{display:block;width:100%;height:100%;object-fit:cover;object-position:50% 25%}
.hl-folha{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.6rem;height:100%;padding:clamp(1rem,3vw,1.75rem);align-content:center}
.hl-folha li{display:grid;place-items:center;aspect-ratio:3/4;border:1px dashed var(--color-borda-forte);border-radius:var(--radius-ficha);color:var(--color-texto-suave);font-family:var(--font-mono);font-size:var(--text-xs)}
.hl-folha .hl-folha__nota{aspect-ratio:auto;align-self:stretch;border-style:solid;padding:.5rem;text-align:center;line-height:1.35;color:var(--color-texto)}
.hl-equip__corpo{display:flex;flex:1;flex-direction:column;align-items:flex-start;gap:1rem;padding:clamp(1.25rem,3vw,2rem)}
.hl-equip h3{font-size:clamp(var(--text-xl),2.4vw,var(--text-2xl))}
.hl-reuniu{align-self:stretch;border-top:1px solid var(--hl-fio)}
.hl-reuniu li{display:flex;justify-content:space-between;gap:1rem;padding:.55rem 0;border-bottom:1px solid var(--hl-fio);font-size:var(--text-sm)}
.hl-estado{font-family:var(--font-mono);font-size:var(--text-xs);letter-spacing:var(--tracking-mono);text-transform:uppercase;white-space:nowrap;color:var(--color-texto-suave)}
.hl-estado[data-estado="publicado"]{color:var(--color-marca);font-weight:500}

/* IV Leitura — faixa inversa */
.hl-leitura{background:var(--color-fundo-inverso);color:var(--color-texto-inverso);border-top:0}
.hl-leitura .meta-ficha,.hl-leitura .hl-num{color:color-mix(in srgb,var(--color-texto-inverso) 85%,var(--color-fundo-inverso))}
.hl-leitura .hl-ponte,.hl-leitura .hl-fontes dd{color:var(--color-texto-inverso)}
.home-livre .hl-leitura a{color:var(--color-texto-inverso)}
.hl-leitura :focus-visible{outline-color:var(--color-destaque)}
.hl-leitura .hl-fontes summary{color:var(--color-destaque)}
.hl-leitura .hl-fontes{border-color:color-mix(in srgb,var(--color-texto-inverso) 35%,var(--color-fundo-inverso))}
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

/* Créditos */
.hl-creditos{padding-block:3rem;border-top:1px solid var(--hl-fio)}
.hl-aviso{margin-top:1rem;max-width:var(--largura-leitura);padding:.75rem 1rem;border:1px dashed var(--color-acento);border-radius:var(--radius-ficha);font-size:var(--text-sm)}
.hl-regua{display:flex;flex-wrap:wrap;gap:1.5rem 2rem;margin-top:1.5rem;padding:1.25rem;background:var(--color-fundo-elevado);border:1px solid var(--color-borda);border-radius:var(--radius-ficha)}
.hl-regua__grupo{display:flex;flex-direction:column;gap:.6rem}
.hl-regua__grupo[data-grupo="fomento"]{margin-left:auto}
.hl-regua__marcas{display:flex;flex-wrap:wrap;gap:.75rem}
.hl-slot{display:flex;align-items:center;justify-content:center;height:4rem}
.hl-regua__marcas{gap:.6rem}
.hl-slot__vazio{max-width:10rem}
.home-livre .hl-slot img{display:block;height:4rem;width:auto;max-width:none;border-radius:var(--radius-ficha)}
.hl-slot__vazio{display:flex;flex-direction:column;justify-content:center;height:100%;padding:0 .75rem;border:1px dashed var(--color-borda-forte);border-radius:var(--radius-ficha);font-size:var(--text-xs);line-height:1.35;color:var(--color-texto-suave);text-align:center}
.hl-slot__vazio strong{color:var(--color-texto);font-family:var(--font-display)}
.hl-regras{display:grid;gap:.3rem;margin-top:1rem;font-size:var(--text-sm);color:var(--color-texto-suave)}
.hl-regras li::before{content:"— "}

/* Rodapé */
.hl-rodape{background:var(--color-fundo-inverso);color:var(--color-texto-inverso)}
.hl-rodape__linha{display:flex;flex-wrap:wrap;justify-content:space-between;gap:1rem 2rem;padding-block:2rem;font-size:var(--text-sm)}
.hl-rodape ul{display:flex;flex-wrap:wrap;gap:.5rem 1.5rem}
.home-livre .hl-rodape a{color:var(--color-texto-inverso)}
.hl-rodape :focus-visible{outline-color:var(--color-destaque)}
`.trim();
