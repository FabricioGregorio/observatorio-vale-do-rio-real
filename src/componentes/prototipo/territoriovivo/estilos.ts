/**
 * Estilos do laboratório territorial.
 *
 * ## Tokens locais da Cartografia
 *
 * Os papéis globais de `tokens.css` não mudam. Aqui nascem **nomes locais**
 * (`--tv-*`), escopados em `.tv`, todos derivados de papéis existentes por
 * `color-mix` — nenhuma cor literal. O bloco escuro repete a cascata do
 * `tokens.css` (sistema, `data-tema="escuro"`), porque o mapa atual perde
 * definição justamente onde o tema troca: a placa clara com sombra carvão some
 * sobre a noite.
 *
 * No escuro, a separação entre mapa e fundo **não depende de preto**: a placa
 * ganha borda mais clara e um filete interno claro; os limites municipais
 * sobem de contraste.
 *
 * Nenhuma informação só por cor: Vale é preenchimento, pesquisa de campo é
 * hachura, foco é espessura, selecionado é anel tracejado mais marca textual.
 */
export const CSS_DO_TERRITORIO_VIVO = `
.tv{
  --tv-plano:var(--color-fundo-elevado);
  --tv-borda-plano:color-mix(in srgb,var(--color-texto) 22%,var(--color-fundo));
  --tv-filete:color-mix(in srgb,var(--color-texto) 0%,transparent);
  --tv-sombra:color-mix(in srgb,var(--color-carvao) 16%,transparent);
  --tv-terra:color-mix(in srgb,var(--color-texto) 7%,var(--color-fundo-elevado));
  --tv-vale:color-mix(in srgb,var(--color-marca) 26%,var(--color-fundo-elevado));
  --tv-hachura:color-mix(in srgb,var(--color-marca) 70%,var(--color-texto));
  --tv-limite:color-mix(in srgb,var(--color-texto) 62%,var(--color-fundo-elevado));
  --tv-limite-externo:color-mix(in srgb,var(--color-texto) 26%,var(--color-fundo-elevado));
  --tv-stroke-interno:var(--color-fundo-elevado);
  --tv-rotulo:var(--color-texto);
  --tv-pin:var(--color-texto);
  --tv-pin-texto:var(--color-fundo-elevado);
  --tv-pin-selecionado:var(--color-destaque);
  --tv-pin-selecionado-texto:var(--color-texto-sobre-destaque);
  --tv-contorno-foco:var(--color-texto);
  --tv-hover:color-mix(in srgb,var(--color-marca) 14%,var(--color-fundo-elevado));
  --tv-duracao:calc(var(--duracao-painel) * 2.75);
  max-width:var(--largura-conteudo);margin-inline:auto;padding:clamp(1.5rem,4vw,3rem) clamp(1rem,4vw,3rem) clamp(3rem,7vw,6rem);
}
@media (prefers-color-scheme:dark){
  :root:not([data-tema="claro"]) .tv{
    --tv-borda-plano:color-mix(in srgb,var(--color-texto) 42%,var(--color-fundo));
    --tv-filete:color-mix(in srgb,var(--color-texto) 14%,transparent);
    --tv-sombra:color-mix(in srgb,var(--color-carvao) 70%,transparent);
    --tv-terra:color-mix(in srgb,var(--color-texto) 10%,var(--color-fundo-elevado));
    --tv-vale:color-mix(in srgb,var(--color-marca) 38%,var(--color-fundo-elevado));
    --tv-hachura:color-mix(in srgb,var(--color-marca) 55%,var(--color-texto));
    --tv-limite:color-mix(in srgb,var(--color-texto) 82%,var(--color-fundo-elevado));
    --tv-limite-externo:color-mix(in srgb,var(--color-texto) 40%,var(--color-fundo-elevado));
    --tv-stroke-interno:color-mix(in srgb,var(--color-texto) 30%,var(--color-fundo-elevado));
    --tv-hover:color-mix(in srgb,var(--color-marca) 24%,var(--color-fundo-elevado));
  }
}
:root[data-tema="escuro"] .tv{
  --tv-borda-plano:color-mix(in srgb,var(--color-texto) 42%,var(--color-fundo));
  --tv-filete:color-mix(in srgb,var(--color-texto) 14%,transparent);
  --tv-sombra:color-mix(in srgb,var(--color-carvao) 70%,transparent);
  --tv-terra:color-mix(in srgb,var(--color-texto) 10%,var(--color-fundo-elevado));
  --tv-vale:color-mix(in srgb,var(--color-marca) 38%,var(--color-fundo-elevado));
  --tv-hachura:color-mix(in srgb,var(--color-marca) 55%,var(--color-texto));
  --tv-limite:color-mix(in srgb,var(--color-texto) 82%,var(--color-fundo-elevado));
  --tv-limite-externo:color-mix(in srgb,var(--color-texto) 40%,var(--color-fundo-elevado));
  --tv-stroke-interno:color-mix(in srgb,var(--color-texto) 30%,var(--color-fundo-elevado));
  --tv-hover:color-mix(in srgb,var(--color-marca) 24%,var(--color-fundo-elevado));
}

.tv-dev{margin:0;padding:.45rem clamp(1rem,4vw,3rem);background:var(--color-destaque);color:var(--color-texto-sobre-destaque);font-family:var(--font-mono);font-size:var(--text-xs);letter-spacing:var(--tracking-mono);text-transform:uppercase}
.tv ul,.tv ol{list-style:none;margin:0;padding:0}
.tv__cab{display:grid;gap:.6rem;max-width:var(--largura-leitura)}
.tv__cab h1{font-size:clamp(var(--text-2xl),4vw,var(--text-4xl))}
.tv__grade{display:grid;gap:1.5rem;margin-top:clamp(1.5rem,4vw,2.5rem)}

/* Placa do mapa */
.tv__mapa{margin:0;display:grid;gap:.6rem;min-width:0}
.tv__plano{position:relative;overflow:hidden;background:var(--tv-plano);border:1px solid var(--tv-borda-plano);border-radius:var(--radius-ficha);box-shadow:inset 0 1px 0 var(--tv-filete),0 1.25rem 2.5rem -1.5rem var(--tv-sombra)}
.tv__plano svg{display:block;width:100%;height:auto;max-height:min(70svh,40rem)}
.tv-mundo{transform-box:view-box;transform-origin:0 0;transform:translate(var(--tv-tx),var(--tv-ty)) scale(var(--tv-s));transition:transform var(--tv-duracao) var(--easing-padrao)}
.tv .m{fill:var(--tv-terra);stroke:var(--tv-stroke-interno);stroke-width:1;vector-effect:non-scaling-stroke;transition:opacity var(--tv-duracao) var(--easing-padrao)}
.tv .m.v{fill:var(--tv-vale);stroke:var(--tv-limite);stroke-width:1.4}
.tv .h{fill:url(#tv-hachura);stroke:none;pointer-events:none;transition:opacity var(--tv-duracao) var(--easing-padrao)}
.tv #tv-hachura line{stroke:var(--tv-hachura)}
.tv .anel{fill:none;stroke:var(--tv-contorno-foco);stroke-width:3;stroke-dasharray:7 4;vector-effect:non-scaling-stroke;opacity:0;transition:opacity var(--tv-duracao) var(--easing-padrao)}
.tv-escala{transform-box:view-box;transform-origin:0 0}
.tv-rot{opacity:0;transition:opacity var(--tv-duracao) var(--easing-padrao);pointer-events:none}
.tv-rot text,.tv-fixo text,.tv-marca text{font-family:var(--font-display)}
.tv-rot text{fill:var(--tv-rotulo);font-weight:600;paint-order:stroke;stroke:var(--tv-plano);stroke-linejoin:round}
.tv-marca circle.base{fill:var(--tv-pin);stroke:var(--tv-plano)}
.tv-marca text.n{fill:var(--tv-pin-texto);font-weight:700}
.tv-marca circle.anel-marca{fill:none;stroke:var(--tv-contorno-foco);stroke-dasharray:3 2;opacity:0;transition:opacity var(--tv-duracao)}
.tv-chips{opacity:0;pointer-events:none;transition:opacity var(--tv-duracao) var(--easing-padrao)}
.tv-chip rect{fill:var(--tv-plano);stroke:var(--tv-limite)}
.tv-chip text{fill:var(--tv-rotulo);font-weight:600}
.tv[data-interativo] .tv-chip{cursor:pointer}
.tv[data-interativo] .tv-chip:hover rect{fill:var(--tv-hover)}
.tv-chips text.nota{font-family:var(--font-mono);font-weight:400;fill:var(--tv-rotulo);paint-order:stroke;stroke:var(--tv-plano);stroke-width:.3em;stroke-linejoin:round}
.tv-fixo text{fill:var(--tv-rotulo)}
.tv-fixo line,.tv-fixo path{stroke:var(--tv-rotulo);fill:none}
.tv-fixo .escala{opacity:0}
.tv-semlocal{opacity:0;transition:opacity var(--tv-duracao) var(--easing-padrao)}
.tv-semlocal rect{fill:var(--tv-plano);stroke:var(--tv-borda-plano)}
.tv__legenda{display:flex;flex-wrap:wrap;gap:.4rem 1.1rem;font-family:var(--font-mono);font-size:var(--text-xs);letter-spacing:var(--tracking-mono);color:var(--color-texto-suave)}
.tv__legenda li{display:flex;align-items:center;gap:.45rem}
.tv__amostra{display:inline-block;width:1.1rem;height:.8rem;border:1px solid var(--tv-limite);background:var(--tv-vale)}
.tv__amostra--campo{background:repeating-linear-gradient(45deg,var(--tv-vale),var(--tv-vale) .15rem,var(--tv-hachura) .15rem,var(--tv-hachura) .25rem)}
.tv__amostra--marca{width:.9rem;height:.9rem;border-radius:50%;background:var(--tv-pin);border-color:var(--tv-pin)}
.tv__nota{font-size:var(--text-sm);color:var(--color-texto-suave)}

/* Lista de lugares */
.tv__lista{display:grid;gap:.5rem;align-content:start;min-width:0}
.tv__lista h2{font-size:var(--text-lg)}
.tv__lista ul{display:grid;gap:.4rem}
.tv a{color:var(--color-link)}
.tv [data-tv-aba]{display:grid;gap:.1rem;padding:.65rem .85rem;border:1px solid var(--color-borda);border-left:4px solid transparent;border-radius:var(--radius-ficha);background:var(--color-fundo-elevado);color:var(--color-texto);text-decoration:none;transition:background-color var(--duracao-hover) var(--easing-padrao)}
.tv [data-tv-aba]:hover{background:var(--tv-hover)}
.tv [data-tv-aba] .nome{font-family:var(--font-display);font-weight:600}
.tv [data-tv-aba] .meta{font-family:var(--font-mono);font-size:var(--text-xs);letter-spacing:var(--tracking-mono);color:var(--color-texto-suave)}
.tv [data-tv-aba][aria-selected="true"]{border-color:var(--tv-contorno-foco);border-left-color:var(--color-destaque);background:var(--tv-hover)}
.tv [data-tv-aba][aria-selected="true"] .nome::after{content:" · selecionado";font-family:var(--font-mono);font-weight:400;font-size:var(--text-xs);letter-spacing:var(--tracking-mono)}

/* Fichas */
.tv__paineis{display:grid;gap:1.5rem;min-width:0}
.tv [data-tv-painel]{display:grid;gap:1rem;padding:clamp(1rem,3vw,1.5rem);background:var(--color-fundo-elevado);border:1px solid var(--color-borda);border-top:3px solid var(--tv-contorno-foco);border-radius:var(--radius-ficha)}
.tv [data-tv-painel] h2{font-size:clamp(var(--text-xl),2.4vw,var(--text-2xl))}
.tv [data-tv-painel] h3{font-family:var(--font-mono);font-size:var(--text-xs);font-weight:500;letter-spacing:var(--tracking-mono);text-transform:uppercase;color:var(--color-texto-suave)}
.tv [data-tv-painel] section{display:grid;gap:.45rem}
.tv .fonte{font-family:var(--font-mono);font-size:var(--text-xs);letter-spacing:var(--tracking-mono);color:var(--color-texto-suave)}
.tv .materiais li{display:flex;justify-content:space-between;gap:1rem;padding:.4rem 0;border-bottom:1px solid var(--color-borda);font-size:var(--text-sm)}
.tv .estado{font-family:var(--font-mono);font-size:var(--text-xs);letter-spacing:var(--tracking-mono);text-transform:uppercase;white-space:nowrap;color:var(--color-texto-suave)}
.tv .estado[data-estado="publico"]{color:var(--color-marca)}
.tv .dados{display:grid;grid-template-columns:repeat(auto-fit,minmax(10rem,1fr));gap:.75rem}
.tv .dados dd{margin:0;font-family:var(--font-display);font-size:var(--text-xl);font-weight:var(--peso-numeral)}
.tv .dados dt{font-size:var(--text-xs)}
.tv .fotos{display:grid;grid-template-columns:repeat(auto-fill,minmax(7rem,10rem));gap:.6rem}
.tv .fotos figure{margin:0}
.tv .fotos img{display:block;width:100%;height:auto;aspect-ratio:3/4;object-fit:cover;border-radius:var(--radius-ficha)}
.tv .fotos figcaption{margin-top:.3rem;font-size:var(--text-xs);line-height:1.4}
.tv .pendencia{display:inline-block;margin-top:.2rem;padding:.1rem .35rem;border:1px dashed var(--color-acento);color:var(--color-acento);font-family:var(--font-mono);font-size:var(--text-xs)}
.tv .lacuna{padding:.75rem;border:1px dashed var(--color-borda-forte);border-radius:var(--radius-ficha);font-size:var(--text-sm)}
.tv .chegar dd{margin:0}
.tv .chegar div{display:grid;gap:.1rem;padding:.35rem 0;border-bottom:1px solid var(--color-borda);font-size:var(--text-sm)}

@media (min-width:960px){
  .tv__grade{grid-template-columns:minmax(0,7fr) minmax(0,5fr);grid-template-areas:"mapa lista" "mapa paineis";align-items:start;column-gap:clamp(1.5rem,3vw,2.5rem)}
  .tv__mapa{grid-area:mapa;position:sticky;top:1rem}
  .tv__lista{grid-area:lista}
  .tv__paineis{grid-area:paineis}
}
@media (max-width:767px){
  .tv__lista ul{grid-template-columns:repeat(2,minmax(0,1fr))}
  .tv__plano svg{max-height:none}
}
`.trim();
