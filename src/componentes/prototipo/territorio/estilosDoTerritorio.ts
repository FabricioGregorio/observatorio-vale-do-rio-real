/**
 * Tratamento visual do protótipo H2.
 *
 * A profundidade é produzida no composto final do SVG, por transformação e
 * `drop-shadow`. A geometria não é clonada: continuam existindo somente os 75
 * paths municipais e as três hachuras de pesquisa. Todos os tons vêm dos
 * tokens H0; as duas variantes alteram apenas ângulo, espessura e sombra.
 */
export const CSS_DO_TERRITORIO_PROTOTIPO = `
.territorio-prototipo{--territorio-pitch:3deg;--territorio-giro:-1deg;--territorio-espessura:.22rem;--territorio-sombra:.7rem;--territorio-desfoque-sombra:.7rem;--territorio-forca-sombra:22%;--territorio-opacidade-ambiente:.55;display:grid;gap:2rem;padding-block:clamp(3rem,7vw,6rem);border-top:1px solid var(--color-borda)}
.territorio-prototipo[data-profundidade="moderada"]{--territorio-pitch:7deg;--territorio-giro:-1.75deg;--territorio-espessura:.37rem;--territorio-sombra:.88rem;--territorio-desfoque-sombra:.95rem;--territorio-forca-sombra:17%;--territorio-opacidade-ambiente:.42}
.territorio-prototipo__cabecalho{display:grid;gap:.5rem;max-width:var(--largura-leitura)}
.territorio-prototipo__grade{display:grid;gap:clamp(1.5rem,4vw,3.5rem);align-items:start}
.territorio-prototipo__mapa{display:grid;gap:1rem;min-width:0}
.territorio-prototipo__moldura{position:relative;isolation:isolate;overflow:clip;min-width:0;padding:clamp(1rem,4vw,2.5rem);border:1px solid var(--color-borda);background:radial-gradient(circle at 46% 42%,var(--color-fundo-elevado),var(--color-fundo));border-radius:var(--radius-ficha)}
.territorio-prototipo__moldura::after{position:absolute;z-index:-1;right:9%;bottom:8%;left:12%;height:12%;content:"";background:color-mix(in srgb,var(--color-mata) 20%,transparent);filter:blur(1.25rem);transform:skewX(-12deg);opacity:var(--territorio-opacidade-ambiente)}
.territorio-prototipo__svg{display:block;width:100%;height:auto;overflow:visible;transform-origin:50% 58%;transform:perspective(70rem) rotateX(var(--territorio-pitch)) rotateZ(var(--territorio-giro)) translateY(calc(var(--territorio-espessura) * -1));filter:drop-shadow(0 var(--territorio-espessura) 0 var(--color-mata)) drop-shadow(0 var(--territorio-sombra) var(--territorio-desfoque-sombra) color-mix(in srgb,var(--color-carvao) var(--territorio-forca-sombra),transparent));transition:transform var(--duracao-painel) var(--easing-padrao),filter var(--duracao-painel) var(--easing-padrao)}
.territorio-prototipo .m[data-codigo="2807402"]{stroke-width:1.8}
.territorio-prototipo .m[aria-selected="true"],.territorio-prototipo .m[data-codigo="2807402"][aria-selected="true"]{stroke-width:3.5}
.territorio-prototipo__legenda{display:flex;flex-wrap:wrap;gap:.65rem 1rem;margin:0;padding:0;list-style:none;font-family:var(--font-mono);font-size:var(--text-xs);letter-spacing:var(--tracking-mono);text-transform:uppercase;color:var(--color-texto-suave)}
.territorio-prototipo__legenda li{display:flex;align-items:center;gap:.4rem}
.territorio-prototipo__amostra{display:inline-block;width:1.35rem;height:.8rem;border:1px solid var(--color-carvao-suave);background:var(--color-pedra)}
.territorio-prototipo__amostra--vale{border-color:var(--color-mata);background:var(--color-milho)}
.territorio-prototipo__amostra--pesquisa{background:repeating-linear-gradient(45deg,var(--color-pedra),var(--color-pedra) .18rem,var(--color-mata) .2rem,var(--color-mata) .28rem)}
.territorio-prototipo__amostra--comparacao{border:2px dashed var(--color-anil)}
.territorio-prototipo__editorial{display:grid;gap:1.5rem;min-width:0;padding:clamp(1.25rem,3vw,2rem);border-left:.3rem solid var(--color-milho);background:var(--color-fundo-elevado)}
.territorio-prototipo__editorial p{max-width:var(--largura-leitura)}
.territorio-prototipo__painel{display:grid;gap:1rem;padding-top:1.25rem;border-top:1px solid var(--color-borda)}
.territorio-prototipo__painel [data-painel-conteudo]{display:grid;gap:1rem}
.territorio-prototipo__painel [data-painel-conteudo][hidden],.territorio-prototipo__painel [data-painel-vazio][hidden]{display:none}
.territorio-prototipo__painel dl{display:grid;gap:.9rem}
.territorio-prototipo__painel dd{margin:0}
.territorio-prototipo__painel ul{margin:0;padding-left:1.2rem}
.territorio-prototipo__pontos{display:grid;gap:.65rem;padding-top:1.25rem;border-top:1px solid var(--color-borda)}
.territorio-prototipo__pontos ul{display:grid;gap:.35rem;margin:0;padding:0;list-style:none}
.territorio-prototipo__indice{grid-column:1/-1;display:grid;gap:1rem;min-width:0;padding-top:1rem;border-top:1px solid var(--color-borda)}
.territorio-prototipo__indice summary{cursor:pointer;font-family:var(--font-display);font-size:var(--text-lg);font-weight:var(--peso-titulo)}
.territorio-prototipo__lista{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,13rem),1fr));gap:.5rem;max-height:25rem;margin:1rem 0 0;padding:.25rem;overflow:auto;list-style:none}
.territorio-prototipo__item{display:grid;align-content:start;gap:.3rem;padding:.75rem;border:1px solid var(--color-borda);background:var(--color-fundo);border-radius:var(--radius-ficha)}
.territorio-prototipo__lista[data-interativo] .territorio-prototipo__item{cursor:pointer}
.territorio-prototipo__item:hover{border-color:var(--color-borda-forte)}
.territorio-prototipo__item:focus-visible{outline:3px solid var(--color-foco);outline-offset:2px}
.territorio-prototipo__item[data-selecionado="true"]{border-color:var(--color-mata);background:var(--color-destaque);color:var(--color-texto-sobre-destaque)}
.territorio-prototipo__item[data-selecionado="true"] .meta-ficha{color:var(--color-texto-sobre-destaque)}
.territorio-prototipo__evidencias{margin:0;padding-left:1rem;font-size:var(--text-sm)}
@media(min-width:64rem){.territorio-prototipo__grade{grid-template-columns:minmax(0,1.38fr) minmax(19rem,1fr)}.territorio-prototipo__mapa{position:sticky;top:2rem}}
@media(max-width:40rem){.territorio-prototipo{--territorio-pitch:1.5deg;--territorio-giro:-.5deg;--territorio-espessura:.16rem;--territorio-sombra:.5rem;gap:1.5rem}.territorio-prototipo[data-profundidade="moderada"]{--territorio-pitch:3.5deg;--territorio-giro:-.8deg;--territorio-espessura:.22rem;--territorio-sombra:.56rem;--territorio-desfoque-sombra:.72rem;--territorio-forca-sombra:16%;--territorio-opacidade-ambiente:.36}.territorio-prototipo__moldura{padding:.8rem}.territorio-prototipo__editorial{padding:1rem}.territorio-prototipo__lista{max-height:21rem}}
@media(prefers-reduced-motion:reduce){.territorio-prototipo__svg{transition:none}}
`.trim();
