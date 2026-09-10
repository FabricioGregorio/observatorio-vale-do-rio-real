/**
 * Tratamento visual compartilhado da cartografia H2.
 *
 * A profundidade atua no composto final do SVG, sem clonar a geometria. A
 * variante moderada contém exatamente os valores congelados na H2.0.1.
 */
export const CSS_DO_TERRITORIO = `
.territorio-cartografico{--territorio-pitch:3deg;--territorio-giro:-1deg;--territorio-espessura:.22rem;--territorio-sombra:.7rem;--territorio-desfoque-sombra:.7rem;--territorio-forca-sombra:22%;--territorio-opacidade-ambiente:.55;display:grid;gap:2rem;width:100%;padding-block:clamp(3rem,7vw,6rem);border-top:1px solid var(--color-borda)}
.territorio-cartografico[data-profundidade="moderada"]{--territorio-pitch:7deg;--territorio-giro:-1.75deg;--territorio-espessura:.37rem;--territorio-sombra:.88rem;--territorio-desfoque-sombra:.95rem;--territorio-forca-sombra:17%;--territorio-opacidade-ambiente:.42}
.territorio-cartografico__cabecalho{display:grid;gap:.5rem;max-width:var(--largura-leitura)}
.territorio-cartografico__grade{display:grid;gap:clamp(1.5rem,4vw,3.5rem);align-items:start}
.territorio-cartografico__mapa{display:grid;gap:1rem;min-width:0}
.territorio-cartografico__moldura{position:relative;isolation:isolate;overflow:clip;min-width:0;padding:clamp(1rem,4vw,2.5rem);border:1px solid var(--color-borda);background:radial-gradient(circle at 46% 42%,var(--color-fundo-elevado),var(--color-fundo));border-radius:var(--radius-ficha)}
.territorio-cartografico__moldura::after{position:absolute;z-index:-1;right:9%;bottom:8%;left:12%;height:12%;content:"";background:color-mix(in srgb,var(--color-mata) 20%,transparent);filter:blur(1.25rem);transform:skewX(-12deg);opacity:var(--territorio-opacidade-ambiente)}
.territorio-cartografico__svg{display:block;width:100%;height:auto;overflow:visible;transform-origin:50% 58%;transform:perspective(70rem) rotateX(var(--territorio-pitch)) rotateZ(var(--territorio-giro)) translateY(calc(var(--territorio-espessura) * -1));filter:drop-shadow(0 var(--territorio-espessura) 0 var(--color-mata)) drop-shadow(0 var(--territorio-sombra) var(--territorio-desfoque-sombra) color-mix(in srgb,var(--color-carvao) var(--territorio-forca-sombra),transparent));transition:transform var(--duracao-painel) var(--easing-padrao),filter var(--duracao-painel) var(--easing-padrao)}
.territorio-cartografico .m[data-codigo="2807402"]{stroke-width:1.8}
.territorio-cartografico .m[aria-selected="true"],.territorio-cartografico .m[data-codigo="2807402"][aria-selected="true"]{stroke-width:3.5}
.territorio-cartografico__legenda{display:flex;flex-wrap:wrap;gap:.65rem 1rem;margin:0;padding:0;list-style:none;font-family:var(--font-mono);font-size:var(--text-xs);letter-spacing:var(--tracking-mono);text-transform:uppercase;color:var(--color-texto-suave)}
.territorio-cartografico__legenda li{display:flex;align-items:center;gap:.4rem}
.territorio-cartografico__amostra{display:inline-block;width:1.35rem;height:.8rem;border:1px solid var(--color-carvao-suave);background:var(--color-pedra)}
.territorio-cartografico__amostra--vale{border-color:var(--color-mata);background:var(--color-milho)}
.territorio-cartografico__amostra--pesquisa{background:repeating-linear-gradient(45deg,var(--color-pedra),var(--color-pedra) .18rem,var(--color-mata) .2rem,var(--color-mata) .28rem)}
.territorio-cartografico__amostra--comparacao{border:2px dashed var(--color-anil)}
.territorio-cartografico__editorial{display:grid;gap:1.5rem;min-width:0;padding-left:clamp(1rem,3vw,2rem);border-left:.2rem solid var(--color-milho)}
.territorio-cartografico[data-contexto="prototipo"] .territorio-cartografico__editorial{padding:clamp(1.25rem,3vw,2rem);border-left-width:.3rem;background:var(--color-fundo-elevado)}
.territorio-cartografico__editorial p{max-width:var(--largura-leitura)}
.territorio-cartografico__introducao{display:grid;gap:.75rem}
.territorio-cartografico__assinatura{padding-top:.25rem;color:var(--color-texto-suave)}
.territorio-cartografico__painel{display:grid;gap:1rem;padding-top:1.25rem;border-top:1px solid var(--color-borda)}
.territorio-cartografico__painel [data-painel-conteudo]{display:grid;gap:1rem}
.territorio-cartografico__painel [data-painel-conteudo][hidden],.territorio-cartografico__painel [data-painel-vazio][hidden]{display:none}
.territorio-cartografico__painel dl{display:grid;gap:.9rem}
.territorio-cartografico__painel dd{margin:0}
.territorio-cartografico__painel ul{margin:0;padding-left:1.2rem}
.territorio-cartografico__pontos{display:grid;gap:.65rem;padding-top:1.25rem;border-top:1px solid var(--color-borda);color:var(--color-texto-suave)}
.territorio-cartografico__pontos h3{color:var(--color-texto)}
.territorio-cartografico__pontos ul{display:grid;gap:.35rem;margin:0;padding:0;list-style:none}
.territorio-cartografico__indice{grid-column:1/-1;display:grid;gap:1rem;min-width:0;padding-block:1rem;border-block:1px solid var(--color-borda)}
.territorio-cartografico__indice summary{cursor:pointer;font-family:var(--font-display);font-size:var(--text-lg);font-weight:var(--peso-titulo)}
.territorio-cartografico__lista{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,13rem),1fr));gap:.5rem;max-height:25rem;margin:1rem 0 0;padding:.25rem;overflow:auto;list-style:none}
.territorio-cartografico__item{display:grid;align-content:start;gap:.3rem;padding:.75rem;border:1px solid var(--color-borda);background:var(--color-fundo);border-radius:var(--radius-ficha)}
.territorio-cartografico__lista[data-interativo] .territorio-cartografico__item{cursor:pointer}
.territorio-cartografico__item:hover{border-color:var(--color-borda-forte)}
.territorio-cartografico__item:focus-visible{outline:3px solid var(--color-foco);outline-offset:2px}
.territorio-cartografico__item[data-selecionado="true"]{border-color:var(--color-mata);background:var(--color-destaque);color:var(--color-texto-sobre-destaque)}
.territorio-cartografico__item[data-selecionado="true"] .meta-ficha{color:var(--color-texto-sobre-destaque)}
@media(min-width:64rem){.territorio-cartografico__grade{grid-template-columns:minmax(0,1.38fr) minmax(19rem,1fr)}.territorio-cartografico__mapa{position:sticky;top:2rem}}
@media(max-width:40rem){.territorio-cartografico{--territorio-pitch:1.5deg;--territorio-giro:-.5deg;--territorio-espessura:.16rem;--territorio-sombra:.5rem;gap:1.5rem}.territorio-cartografico[data-profundidade="moderada"]{--territorio-pitch:3.5deg;--territorio-giro:-.8deg;--territorio-espessura:.22rem;--territorio-sombra:.56rem;--territorio-desfoque-sombra:.72rem;--territorio-forca-sombra:16%;--territorio-opacidade-ambiente:.36}.territorio-cartografico__moldura{padding:.8rem}.territorio-cartografico__editorial,.territorio-cartografico[data-contexto="prototipo"] .territorio-cartografico__editorial{padding:0 0 0 1rem;background:transparent}.territorio-cartografico__lista{max-height:21rem}}
@media(prefers-reduced-motion:reduce){.territorio-cartografico__svg{transition:none}}
`.trim();
