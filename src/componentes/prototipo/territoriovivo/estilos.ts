/**
 * Estilos do laboratório territorial.
 *
 * ## Tokens locais da Cartografia
 *
 * Os papéis globais de `tokens.css` não mudam. Aqui nascem **nomes locais**
 * (`--tv-*`), escopados em `.tv`, todos derivados de papéis existentes por
 * `color-mix` — nenhuma cor literal. O bloco escuro repete a cascata do
 * `tokens.css` (sistema, `data-tema="escuro"`), porque o mapa perde definição
 * justamente onde o tema troca: a placa clara com sombra carvão some sobre a
 * noite.
 *
 * No escuro, a separação entre mapa e fundo **não depende de preto**: a placa
 * ganha borda mais clara e um filete interno claro; os limites municipais
 * sobem de contraste (melhoria aprovada na Tarefa 17).
 *
 * ## Símbolos (Tarefas 18 e 19)
 *
 * - **Lugar da pesquisa:** pin em gota. Selecionado: maior, milho, contorno
 *   grosso e etiqueta com "▸" — forma, contorno e texto, não só cor.
 * - **Localidade do lugar (IBGE):** quadrado em anel tracejado, sem milho.
 * - **Referência cartográfica próxima (IBGE):** quadrado vazado e rótulo
 *   explícito; nunca substitui o pin.
 * - **Sede:** quadrado cheio. **Outras localidades:** quadrado vazado.
 * - **Rodovia:** traço grosso com casco; estrada vicinal, traço fino e claro,
 *   para não competir com o pin.
 *
 * Nenhuma informação só por cor: Vale é preenchimento, pesquisa de campo é
 * hachura, foco é espessura, selecionado é forma mais marca textual.
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
  --tv-local-municipio:color-mix(in srgb,var(--color-marca) 9%,var(--color-fundo-elevado));
  --tv-via-rodovia:color-mix(in srgb,var(--color-texto) 84%,var(--color-fundo-elevado));
  --tv-via-casco:var(--tv-plano);
  --tv-via-estrada:color-mix(in srgb,var(--color-texto) 36%,var(--color-fundo-elevado));
  --tv-via-urbana:color-mix(in srgb,var(--color-texto) 24%,var(--color-fundo-elevado));
  --tv-agua:color-mix(in srgb,var(--color-link) 62%,var(--color-fundo-elevado));
  --tv-localidade:var(--color-texto);
  --tv-duracao:calc(var(--duracao-painel) * 2.75);
  --tv-duracao-local:calc(var(--duracao-painel) * 4.5);
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
    --tv-local-municipio:color-mix(in srgb,var(--color-marca) 14%,var(--color-fundo-elevado));
    --tv-via-rodovia:color-mix(in srgb,var(--color-texto) 88%,var(--color-fundo-elevado));
    --tv-via-estrada:color-mix(in srgb,var(--color-texto) 42%,var(--color-fundo-elevado));
    --tv-via-urbana:color-mix(in srgb,var(--color-texto) 30%,var(--color-fundo-elevado));
    --tv-agua:color-mix(in srgb,var(--color-link) 70%,var(--color-fundo-elevado));
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
  --tv-local-municipio:color-mix(in srgb,var(--color-marca) 14%,var(--color-fundo-elevado));
  --tv-via-rodovia:color-mix(in srgb,var(--color-texto) 88%,var(--color-fundo-elevado));
  --tv-via-estrada:color-mix(in srgb,var(--color-texto) 42%,var(--color-fundo-elevado));
  --tv-via-urbana:color-mix(in srgb,var(--color-texto) 30%,var(--color-fundo-elevado));
  --tv-agua:color-mix(in srgb,var(--color-link) 70%,var(--color-fundo-elevado));
}

.tv ul,.tv ol{list-style:none;margin:0;padding:0}
.tv__cab{display:grid;gap:.75rem;max-width:var(--largura-leitura)}
.tv__cab h1{font-size:clamp(var(--text-3xl),5vw,var(--text-4xl));line-height:.98}
.tv__abertura{max-width:42rem;font-size:clamp(var(--text-lg),2vw,var(--text-xl));line-height:1.45}
.tv__instrucao{max-width:38rem;color:var(--color-texto-suave)}
.tv__contexto{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.75rem;margin-top:.5rem;padding-top:1rem;border-top:1px solid var(--color-borda)}
.tv__contexto p{font-size:var(--text-sm)}
.tv__grade{display:grid;gap:1.5rem;margin-top:clamp(1.5rem,4vw,2.5rem)}

/* Placa do mapa */
.tv__mapa{margin:0;display:grid;gap:.6rem;min-width:0}
.tv__plano{position:relative;overflow:hidden;background:var(--tv-plano);border:1px solid var(--tv-borda-plano);border-radius:var(--radius-ficha);box-shadow:inset 0 1px 0 var(--tv-filete),0 1.25rem 2.5rem -1.5rem var(--tv-sombra)}
.tv__plano svg{display:block;width:100%;height:auto;max-height:min(70svh,40rem)}
.tv-mundo{transform-box:view-box;transform-origin:0 0;transform:translate(var(--tv-tx),var(--tv-ty)) scale(var(--tv-s));transition-property:transform,opacity;transition-duration:var(--tv-duracao);transition-timing-function:var(--easing-padrao),linear}
.tv .m{fill:var(--tv-terra);stroke:var(--tv-stroke-interno);stroke-width:1;vector-effect:non-scaling-stroke;transition:opacity var(--tv-duracao) var(--easing-padrao)}
.tv .m.v{fill:var(--tv-vale);stroke:var(--tv-limite);stroke-width:1.4}
.tv .h{fill:url(#tv-hachura);stroke:none;pointer-events:none;transition:opacity var(--tv-duracao) var(--easing-padrao)}
.tv #tv-hachura line{stroke:var(--tv-hachura)}
.tv .anel{fill:none;stroke:var(--tv-contorno-foco);stroke-width:3;stroke-dasharray:7 4;vector-effect:non-scaling-stroke;opacity:0;transition:opacity var(--tv-duracao) var(--easing-padrao)}
.tv-rot{opacity:0;transition:opacity var(--tv-duracao) var(--easing-padrao);pointer-events:none}
.tv-rot text,.tv-fixo text,.tv-pin text{font-family:var(--font-display)}
.tv-rot text{fill:var(--tv-rotulo);font-weight:600;paint-order:stroke;stroke:var(--tv-plano);stroke-linejoin:round}
.tv-contagem text{font-family:var(--font-mono);font-weight:400}
.tv-fixo text{fill:var(--tv-rotulo)}
.tv-fixo line,.tv-fixo path{stroke:var(--tv-rotulo);fill:none}
.tv-fixo .escala{opacity:0}
.tv-semlocal{opacity:0;transition:opacity var(--tv-duracao) var(--easing-padrao)}
.tv-semlocal rect{fill:var(--tv-plano);stroke:var(--tv-borda-plano)}

/* Pins na malha: ponta exatamente na coordenada confirmada */
.tv-pin{pointer-events:none}
.tv-pin .forma{fill:var(--tv-pin);stroke:var(--tv-plano);stroke-width:1.5px;vector-effect:non-scaling-stroke}
.tv-pin .miolo{fill:var(--tv-plano)}
.tv-pin .nome{opacity:0;font-weight:600;fill:var(--tv-rotulo);paint-order:stroke;stroke:var(--tv-plano);stroke-linejoin:round;transition:opacity var(--tv-duracao) var(--easing-padrao)}
.tv-pin .sel{display:none}

/* Camada local: outra representação, carregada sob demanda */
.tv-local{opacity:0;pointer-events:none;transform-box:view-box;transform-origin:0 0;transition-property:transform,opacity;transition-duration:var(--tv-duracao-local),calc(var(--tv-duracao-local) * .3);transition-timing-function:var(--easing-padrao),linear}
.tv-local .fundo{fill:var(--tv-terra)}
.tv-local .mun{fill:var(--tv-terra);stroke:none}
.tv-local .mun.v{fill:var(--tv-local-municipio)}
.tv-local .mun-h{fill:url(#tv-hachura);stroke:none;opacity:.2}
.tv-local .lim{fill:none;stroke:var(--tv-limite);stroke-width:2.4;stroke-dasharray:10 3 2 3;vector-effect:non-scaling-stroke}
.tv-local path.l{fill:none;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke}
.tv-local .agua{stroke:var(--tv-agua);stroke-width:1.1}
.tv-local .agua.rio{stroke-width:2.4}
.tv-local .urbana{stroke:var(--tv-via-urbana);stroke-width:.8}
.tv-local .estrada{stroke:var(--tv-via-estrada);stroke-width:1}
.tv-local .casco{stroke:var(--tv-via-casco);stroke-width:6}
.tv-local .rodovia{stroke:var(--tv-via-rodovia);stroke-width:2.8}
.tv-local .rodovia.terra{stroke-dasharray:7 4}
.tv-local .escudo rect{fill:var(--tv-plano);stroke:var(--tv-via-rodovia);stroke-width:1.2;vector-effect:non-scaling-stroke}
.tv-local .escudo text{font-family:var(--font-mono);font-weight:500;fill:var(--tv-rotulo)}
.tv-local .loc rect{fill:var(--tv-plano);stroke:var(--tv-localidade);stroke-width:1.4;vector-effect:non-scaling-stroke}
.tv-local .loc.sede rect{fill:var(--tv-localidade)}
.tv-local .loc text{font-family:var(--font-display);font-weight:500;fill:var(--tv-rotulo);paint-order:stroke;stroke:var(--tv-plano);stroke-width:.32em;stroke-linejoin:round}
.tv-local .loc.sede text{font-weight:700}
.tv-local .loc.outra text{font-weight:400}
.tv-local .loc.referencia-cartografica text{font-style:italic;font-weight:500}
.tv-local .ref .anel-ref{fill:none;stroke:var(--tv-contorno-foco);stroke-width:1.6;stroke-dasharray:4 3;vector-effect:non-scaling-stroke}
.tv-local .ref .nucleo-ref{fill:var(--tv-plano);stroke:var(--tv-localidade);stroke-width:1.4;vector-effect:non-scaling-stroke}
.tv-local .ref-rotulo{font-family:var(--font-display);font-style:italic;font-weight:500;fill:var(--tv-rotulo);paint-order:stroke;stroke:var(--tv-plano);stroke-width:.32em;stroke-linejoin:round}
.tv-local .pin .forma{fill:var(--tv-pin);stroke:var(--tv-plano);stroke-width:1.5;vector-effect:non-scaling-stroke}
.tv-local .pin .miolo{fill:var(--tv-plano)}
.tv-local .pin[data-selecionado="true"] .forma{fill:var(--tv-pin-selecionado);stroke:var(--tv-contorno-foco);stroke-width:2.5}
.tv-local .pin[data-selecionado="true"] .miolo{fill:var(--tv-contorno-foco)}
.tv-local text.pin-rotulo{font-family:var(--font-display);font-weight:600;fill:var(--tv-rotulo);paint-order:stroke;stroke:var(--tv-plano);stroke-width:.3em;stroke-linejoin:round}
.tv-local .pin-rotulo.selecionado rect{fill:var(--tv-pin-selecionado);stroke:var(--tv-contorno-foco);stroke-width:1.5;vector-effect:non-scaling-stroke}
.tv-local .pin-rotulo.selecionado text{font-family:var(--font-display);font-weight:700;fill:var(--tv-pin-selecionado-texto)}

.tv__legenda{display:flex;flex-wrap:wrap;gap:.4rem 1.1rem;font-family:var(--font-mono);font-size:var(--text-xs);letter-spacing:var(--tracking-mono);color:var(--color-texto-suave)}
.tv__legenda li{display:flex;align-items:center;gap:.45rem}
.tv__amostra{display:inline-block;width:1.1rem;height:.8rem;border:1px solid var(--tv-limite);background:var(--tv-vale)}
.tv__amostra--campo{background:repeating-linear-gradient(45deg,var(--tv-vale),var(--tv-vale) .15rem,var(--tv-hachura) .15rem,var(--tv-hachura) .25rem)}
.tv__amostra--pin{display:inline-block;width:.7rem;height:.7rem;margin-inline:.2rem;background:var(--tv-pin);border-radius:50% 50% 50% 0;transform:rotate(-45deg)}
.tv__amostra--referencia{width:.6rem;height:.6rem;background:var(--tv-plano);border:1.5px solid var(--tv-localidade);outline:1.5px dashed var(--tv-contorno-foco);outline-offset:2px}
.tv__amostra--sede{width:.6rem;height:.6rem;background:var(--tv-localidade);border-color:var(--tv-localidade)}
.tv__amostra--localidade{width:.6rem;height:.6rem;background:var(--tv-plano);border:1.5px solid var(--tv-localidade)}
.tv__traco{display:inline-block;width:1.5rem;height:0;border-top:3px solid var(--tv-via-rodovia)}
.tv__traco--terra{border-top-style:dashed}
.tv__traco--estrada{border-top:1px solid var(--tv-via-estrada)}
.tv__traco--agua{border-top:2px solid var(--tv-agua)}
.tv__traco--limite{border-top:2px dashed var(--tv-limite)}
.tv__nota{max-width:54rem;font-size:var(--text-xs);line-height:1.55;color:var(--color-texto-suave)}
.tv__legenda--local,.tv__nota--local{display:none}
.tv[data-escala="local"] .tv__legenda--local{display:flex}
.tv[data-escala="local"] .tv__nota--local{display:block}
.tv[data-escala="local"] .tv__legenda--geral,.tv[data-escala="local"] .tv__nota--geral{display:none}

/* Lista de lugares */
.tv__lista{display:grid;gap:.5rem;align-content:start;min-width:0}
.tv__lista h2{font-size:var(--text-lg)}
.tv__lista-cab{display:grid;gap:.2rem;margin-bottom:.25rem}
.tv__lista-cab>p:last-child{font-size:var(--text-sm);color:var(--color-texto-suave)}
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
.tv [data-tv-painel]{display:grid;gap:1.15rem;padding:clamp(1rem,3vw,1.5rem) 0;border-top:3px solid var(--tv-contorno-foco)}
.tv [data-tv-painel] h2{font-size:clamp(var(--text-xl),2.4vw,var(--text-2xl))}
.tv [data-tv-painel] h3{font-family:var(--font-mono);font-size:var(--text-xs);font-weight:500;letter-spacing:var(--tracking-mono);text-transform:uppercase;color:var(--color-texto-suave)}
.tv [data-tv-painel] section{display:grid;gap:.45rem}
.tv__resumo{font-size:var(--text-lg);line-height:1.5}
.tv__subtitulo{color:var(--color-texto-suave)}
.tv__identificacao{display:grid;gap:.2rem;padding:.8rem 0;border-block:1px solid var(--color-borda)}
.tv__vinculo{font-size:var(--text-sm);color:var(--color-texto-suave)}
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
.tv__acesso{padding-top:.85rem;border-top:1px solid var(--color-borda)}
.tv .rota{display:grid;gap:.45rem}
.tv .rota ul{display:flex;flex-wrap:wrap;gap:.5rem}
.tv .rota__link{display:inline-block;padding:.35rem 0;border-bottom:1px solid currentColor;font-family:var(--font-display);font-size:var(--text-sm);font-weight:600;text-decoration:none}
.tv .rota__link:hover{background:var(--tv-hover)}
.tv__voltar{justify-self:start;margin-top:.25rem;font-family:var(--font-display);font-size:var(--text-sm);font-weight:600;text-decoration:none}
.tv__fecho{display:grid;gap:.5rem;max-width:var(--largura-leitura);margin-top:clamp(2.5rem,7vw,5rem);padding-top:clamp(1.5rem,4vw,2.5rem);border-top:1px solid var(--color-borda)}
.tv__fecho h2{font-size:clamp(var(--text-xl),3vw,var(--text-2xl))}

/*
  Movimento reduzido: troca instantânea de verdade. A regra global de
  tokens.css encurta a duração para 0,01 ms, mas uma transição de 10 µs ainda
  existe — no quadro da troca o mapa segue no estado anterior. Aqui a
  propriedade de transição é anulada; as regras de estado só mexem em duração
  e atraso, então não a reativam.
*/
@media (prefers-reduced-motion:reduce){
  .tv.tv[data-foco] :is(.tv-mundo,.tv-local,.m,.h,.anel,.tv-rot,.tv-contra,.tv-semlocal,.escala,.tv-pin .nome){transition-property:none}
}

@media (min-width:960px){
  .tv__grade{grid-template-columns:minmax(0,7fr) minmax(0,5fr);grid-template-areas:"mapa lista" "mapa paineis";align-items:start;column-gap:clamp(1.5rem,3vw,2.5rem)}
  .tv__mapa{grid-area:mapa;position:sticky;top:1rem}
  .tv__lista{grid-area:lista}
  .tv__paineis{grid-area:paineis}
}
/* Celular: mapa grande → faixa compacta de lugares → ficha */
@media (max-width:767px){
  .tv__grade{gap:1rem}
  .tv__contexto{grid-template-columns:1fr;gap:.4rem}
  .tv__plano svg{max-height:none}
  .tv__lista-cab>p:last-child{display:none}
  .tv__lista h2{font-size:var(--text-sm);font-family:var(--font-mono);font-weight:500;letter-spacing:var(--tracking-mono);text-transform:uppercase;color:var(--color-texto-suave)}
  .tv__lista ul{display:flex;gap:.4rem;overflow-x:auto;overscroll-behavior-x:contain;scroll-snap-type:x proximity;padding-bottom:.4rem}
  .tv__lista li{flex:0 0 auto;max-width:15rem;scroll-snap-align:start}
  .tv [data-tv-aba]{padding:.45rem .7rem}
  .tv [data-tv-aba] .nome{font-size:var(--text-sm);white-space:nowrap}
  .tv [data-tv-aba] .meta{white-space:nowrap}
  .tv__nota{font-size:var(--text-xs)}
  .tv__legenda{gap:.35rem .8rem}
  .tv [data-tv-painel]{padding-top:1rem}
  /*
    Na placa estreita cada unidade do SVG vale ~0,6 do que vale no desktop:
    os nomes de "outras localidades" cairiam para ~7 px. Eles saem, e os
    povoados e códigos de rodovia sobem, porque são o que orienta a chegada.
  */
  .tv-local .loc.outra{display:none}
  .tv-local .loc.referencia-cartografica{display:initial}
  .tv-local .loc.referencia-cartografica text{font-size:11px}
  .tv-local .loc.povoado text{font-size:11px}
  .tv-local .escudo text{font-size:8px}
}
`.trim();
