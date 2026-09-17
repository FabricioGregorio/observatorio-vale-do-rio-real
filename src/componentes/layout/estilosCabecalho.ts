/** CSS do cabeçalho público compartilhado. */
export const CSS_DO_CABECALHO = `
/* Topo */
html:has(.home-observatorio){scroll-padding-top:var(--topo-reserva-rolagem)}
html:has(.home-observatorio) body > .hl-topo{position:fixed;inset:0 0 auto;background:var(--topo-fundo-translucido);backdrop-filter:blur(var(--topo-desfoque))}
.home-observatorio .ab-b2__base{min-height:100vh;min-height:var(--hero-altura-tela);justify-content:flex-end;gap:var(--hero-espaco-texto);padding-top:calc(var(--hero-espaco-texto) + var(--topo-reserva-rolagem));padding-bottom:var(--hero-rodape-tela)}
@media (min-width:960px){.home-observatorio .ab-b2__base{align-items:end;column-gap:var(--hero-gap-editorial)}}
@media (min-width:1280px){html:has(.home-observatorio){--topo-reserva-rolagem:calc(var(--altura-cabecalho) + var(--topo-espaco-editorial))}}
@media (max-width:1279px){html:has(.home-observatorio) body > .hl-topo:has(.hl-topo__nav-estreita button[aria-expanded="true"]){max-height:100svh;overflow-y:auto;overscroll-behavior:contain}}
body > .hl-topo{position:sticky;top:0;z-index:var(--z-cabecalho);border-bottom:1px solid var(--color-cabecalho-borda);background:var(--topo-fundo-translucido);backdrop-filter:blur(var(--topo-desfoque));color:var(--color-cabecalho-texto);isolation:isolate;--hero-texto:var(--color-cabecalho-texto)}
.hl-topo::after{content:"";position:absolute;z-index:-1;right:0;bottom:-1px;left:0;height:.75rem;background:var(--color-cabecalho-acento);opacity:.13;pointer-events:none;mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 12' preserveAspectRatio='none'%3E%3Cpath d='M0 8C105 1 176 11 282 6s190-4 286 1 184 2 278-2 192 5 291 1 184-2 303 2' fill='none' stroke='white' stroke-width='1'/%3E%3Cpath d='M0 11c112-5 183 1 291-3s183 3 283 1 185-5 278-1 190-2 290 1 185-4 298 0' fill='none' stroke='white' stroke-width='.6'/%3E%3C/svg%3E") center bottom/100% 100% no-repeat}
.hl-topo__linha{display:flex;min-height:var(--altura-cabecalho);flex-wrap:wrap;align-items:center;gap:var(--topo-espaco-editorial);max-width:var(--largura-cabecalho);padding-block:.7rem}
.hl-topo .hl-topo__marca{display:flex;align-items:center;gap:.65rem;color:var(--color-cabecalho-texto);text-decoration:none}
.hl-topo .hl-topo__marca:hover span,.hl-topo .hl-topo__marca:focus-visible span{color:var(--color-cabecalho-acento)}
.hl-topo .hl-topo__marca[aria-current="page"] span{color:var(--color-cabecalho-acento)}
.hl-topo__marca img{display:block;width:2.9rem;height:2.9rem;object-fit:contain}
.hl-topo__marca span{max-width:var(--topo-marca-largura);font-family:var(--font-leitura);font-size:var(--text-base);font-weight:600;letter-spacing:var(--tracking-display);line-height:1.12}
.hl-topo__nav{order:3;flex-basis:100%;overflow-x:auto}
.hl-topo__nav>ul{display:flex;align-items:center;gap:var(--topo-espaco-editorial);white-space:nowrap}
.hl-topo__sem-script{margin-left:var(--espaco-links-cabecalho)}
.hl-topo .hl-topo__nav>ul>li>a,.hl-conteudos__gatilho{position:relative;display:inline-block;padding:var(--topo-padding-link);border:0;background:transparent;color:var(--color-cabecalho-texto);font-family:var(--font-display);font-size:var(--text-nav);font-weight:600;letter-spacing:.015em;line-height:1.2;text-decoration:none;cursor:pointer;transition:color var(--duracao-hover-cabecalho) var(--easing-padrao)}
.hl-topo .hl-topo__nav>ul>li>a::after,.hl-conteudos__gatilho::after{content:"";position:absolute;right:0;bottom:.25rem;left:0;height:1px;background:var(--color-cabecalho-acento);transform:scaleX(0);transform-origin:right;transition:transform var(--duracao-hover-cabecalho) var(--easing-padrao)}
.hl-topo .hl-topo__nav>ul>li>a:hover,.hl-conteudos__gatilho:hover{color:var(--color-cabecalho-acento)}
.hl-topo .hl-topo__nav>ul>li>a:hover::after,.hl-topo .hl-topo__nav>ul>li>a:focus-visible::after,.hl-topo .hl-topo__nav>ul>li>a[aria-current="page"]::after,.hl-conteudos__gatilho:hover::after,.hl-conteudos__gatilho:focus-visible::after,.hl-conteudos__gatilho[aria-expanded="true"]::after,.hl-conteudos[data-ativo] .hl-conteudos__gatilho::after{transform:scaleX(1);transform-origin:left}
body > .hl-topo :focus-visible{outline:3px solid var(--color-destaque);outline-offset:3px}
.hl-capitulo a:not(.hl-botao,.territorio-cartografico__ir){text-decoration:underline;text-underline-offset:.18em}
.hl-topo__util{display:flex;align-items:center;gap:.75rem;margin-left:auto}
.hl-conteudos{position:relative}
.hl-conteudos__gatilho span{display:inline-block;margin-left:.2rem;font-size:var(--text-sm);transition:transform var(--duracao-hover-cabecalho) var(--easing-padrao)}
.hl-conteudos__gatilho[aria-expanded="true"] span{transform:rotate(180deg)}
.hl-conteudos__painel{position:absolute;z-index:var(--z-painel);top:calc(100% + .75rem);right:0;width:min(32rem,calc(100vw - 2rem));padding:var(--espaco-painel-cabecalho);border:1px solid var(--color-cabecalho-borda);background:var(--color-cabecalho-painel);color:var(--color-cabecalho-texto)}
.hl-conteudos__titulo,.hl-menu-estreito__grupo{margin:0 0 1rem;font-family:var(--font-mono);font-size:var(--text-xs);font-weight:500;letter-spacing:var(--tracking-mono);text-transform:uppercase;color:var(--color-cabecalho-texto-suave)}
.hl-conteudos__painel ul{display:grid;gap:0;white-space:normal}
.hl-conteudos__painel li+li{border-top:1px solid var(--color-cabecalho-borda)}
.hl-conteudos__painel a{display:grid;gap:.25rem;padding:1rem 0;color:var(--color-cabecalho-texto);text-decoration:none;transition:color var(--duracao-hover-cabecalho) var(--easing-padrao)}
.hl-conteudos__painel a:hover{color:var(--color-cabecalho-acento)}
.hl-conteudos__painel strong{font-family:var(--font-display);font-size:var(--text-base)}
.hl-conteudos__painel a span{color:var(--color-cabecalho-texto-suave);font-family:var(--font-leitura);font-size:var(--text-sm);line-height:1.5}
@media (min-width:1280px){.hl-topo__linha{flex-wrap:nowrap}.hl-topo__nav{order:0;flex-basis:auto;overflow:visible;margin-inline:auto}}
.hl-topo__nav-estreita{order:3;flex-basis:100%}
.hl-topo .hl-topo__nav{display:none}
.hl-topo__nav-estreita{--borda-menu-mobile:var(--color-cabecalho-borda);--texto-menu-mobile:var(--color-cabecalho-texto)}
@media (min-width:1280px){.hl-topo .hl-topo__nav{display:block}.hl-topo .hl-topo__nav-estreita{display:none}}
.hl-menu-estreito__grupo{margin:1rem .5rem .25rem;padding-top:1rem;border-top:1px solid var(--color-cabecalho-borda)}
.hl-menu-estreito__lista a{font-family:var(--font-display);font-size:var(--text-nav);font-weight:600;letter-spacing:.015em;text-decoration:none}
.hl-menu-estreito__lista a[aria-current="page"]{border-left:2px solid var(--color-cabecalho-acento)}
 .hl-topo .hl-topo__acessibilidade{background:transparent;transition:background-color var(--duracao-hover) var(--easing-padrao),color var(--duracao-hover) var(--easing-padrao)}
 .hl-topo .hl-topo__acessibilidade:hover{--fundo-acessibilidade:var(--color-cabecalho-texto);--texto-acessibilidade:var(--color-cabecalho-fundo)}
 .hl-topo .hl-topo__acessibilidade{text-transform:none;font-family:var(--font-display);font-size:var(--text-sm);letter-spacing:.01em}
.hl-topo .hl-topo__prestacao:focus-visible, .hl-topo .hl-topo__acessibilidade:focus-visible{outline-width:3px;outline-offset:3px}
/*
  Acessibilidade e Prestação de contas são a mesma utilidade do cabeçalho e
  precisam da mesma altura. A hierarquia entre as duas fica por cor, borda,
  fundo e tipografia — nunca por diferença de altura.

  A altura divergia porque só o botão de Prestação quebrava o rótulo em duas
  linhas quando a linha do cabeçalho apertava: mesmo padding, mesma borda e
  mesmo corpo de texto, o dobro de linhas. white-space:nowrap mantém o rótulo
  inteiro e min-height fixa o mesmo piso nos dois, em qualquer largura.
*/
.hl-topo .hl-topo__acessibilidade,.hl-topo .hl-topo__prestacao{display:inline-flex;align-items:center;justify-content:center;min-height:var(--topo-altura-utilidade);white-space:nowrap}
@media (max-width:639px){.hl-topo__linha{align-items:center;display:grid;grid-template-columns:minmax(0,1fr) auto}.hl-topo__marca span{max-width:10.5rem;font-size:var(--text-sm)}.hl-topo__nav-estreita,.hl-topo__nav-estreita>div{display:contents}.hl-topo__nav-estreita button{grid-column:2;grid-row:1;width:var(--topo-botao-mobile);padding:var(--topo-padding-mobile)}.hl-topo__nav-estreita [tabindex="-1"]{grid-column:1/-1;grid-row:3}.hl-topo__util{grid-column:1/-1;width:100%;justify-content:space-between;padding-top:var(--topo-padding-mobile);border-top:1px solid var(--color-cabecalho-borda)} .hl-topo .hl-topo__acessibilidade,.hl-topo .hl-topo__prestacao{font-size:var(--text-xs)}}


.hl-topo .hl-botao{display:inline-flex;align-items:center;gap:.75rem;padding:.5rem .8rem;border:1px solid var(--color-cabecalho-acento);border-radius:var(--radius-ficha);font-family:var(--font-display);font-size:var(--text-sm);font-weight:600;text-decoration:none}
.hl-topo .hl-topo__marca{color:var(--color-cabecalho-texto)}
.hl-topo .hl-topo__marca[aria-current="page"] span{color:var(--color-cabecalho-acento)}
.hl-topo .hl-topo__nav>ul{list-style:none;margin:0;padding:0}
.hl-topo .hl-conteudos__painel ul{list-style:none;margin:0;padding:0}
.hl-topo .hl-menu-estreito__lista{list-style:none;margin:0;padding:0}
.hl-topo .hl-topo__linha{width:100%;max-width:var(--largura-conteudo);margin-inline:auto;padding-inline:clamp(1rem,4vw,3.5rem)}
.hl-topo .hl-botao.hl-topo__prestacao{border-color:var(--color-cabecalho-acento);background:var(--color-cabecalho-acento);color:var(--color-cabecalho-fundo)}
.hl-topo .hl-botao.hl-topo__prestacao:hover{background:transparent;color:var(--color-cabecalho-acento)}
@media (max-width:1279px){.hl-topo .hl-topo__nav{display:none}}
@media (min-width:1280px){.hl-topo .hl-topo__nav{display:block}.hl-topo .hl-topo__nav-estreita{display:none}}
`;
