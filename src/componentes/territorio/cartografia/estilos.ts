/**
 * Estilos da Cartografia Viva.
 *
 * ## Tokens locais da Cartografia
 *
 * Os papéis globais de `tokens.css` não mudam. Os nomes locais (`--tv-*`)
 * reutilizam a paleta da Home. A geometria mantém pedra, milho, mata, anil e
 * barro nos dois temas; moldura, sombra e controles acompanham o tema.
 *
 * No escuro, a separação entre mapa e fundo **não depende de preto**: a placa
 * ganha borda mais clara e um filete interno claro.
 *
 * ## Placa e papel são coisas diferentes
 *
 * `--tv-plano` é a **placa** — o fundo do quadro, que acompanha o tema — e só
 * o quadro pode usá-la. O que é vazado *sobre o mapa* (escudo de rodovia,
 * quadrado de localidade, núcleo da referência, miolo do pin) é papel, não
 * placa, e usa `--tv-sinal`. A distinção não existia enquanto a geometria
 * também acompanhava o tema; passou a existir quando ela virou invariante,
 * como em `estilosDoMapa.ts` (Fase H0). `--tv-sinal` é exatamente o valor que
 * `--tv-plano` já resolvia no tema claro, então o claro não muda — o escuro
 * deixa de pintar de noite os sinais que deveriam ser vazados.
 *
 * Pela mesma razão, a rosa dos ventos e a barra de escala ganham casco claro:
 * elas são anotações da placa e podem cair fora da malha.
 *
 * ## Símbolos (Tarefas 18, 19 e 28)
 *
 * - **Lugar da pesquisa:** pin em gota. Selecionado: maior, milho, contorno
 *   grosso e etiqueta com "▸" — forma, contorno e texto, não só cor.
 * - **Janela do mapa detalhado:** retângulo vazado com o envelope real do
 *   derivado local. Selecionado: traço mais grosso e opacidade cheia.
 * - **Localidade do lugar (IBGE):** quadrado em anel tracejado, sem milho.
 * - **Referência cartográfica próxima (IBGE):** quadrado vazado e rótulo
 *   explícito; nunca substitui o pin.
 * - **Sede:** quadrado cheio. **Outras localidades:** quadrado vazado.
 * - **Rodovia:** traço grosso com casco; estrada vicinal, traço fino e claro,
 *   para não competir com o pin.
 *
 * Nenhuma informação só por cor: Vale é preenchimento, pesquisa de campo é
 * hachura, foco é espessura, selecionado é forma mais marca textual.
 *
 * ## Composição (Tarefa 28)
 *
 * A página é uma carta, e uma carta tem margem. A abertura traz o mapa de
 * situação e a informação de margem; a régua declara as três escalas; a placa
 * leva o mapa grande com o índice territorial ao lado; o dossiê ocupa a
 * largura inteira em duas colunas, narrativa e aparato documental. Não há
 * coluna vazia esperando a outra rolar.
 */
export const CSS_DO_TERRITORIO_VIVO = `
.tv{
  --tv-plano:var(--color-fundo-elevado);
  --tv-sinal:var(--color-branco);
  --tv-borda-plano:color-mix(in srgb,var(--color-texto) 22%,var(--color-fundo));
  --tv-filete:color-mix(in srgb,var(--color-texto) 0%,transparent);
  --tv-sombra:color-mix(in srgb,var(--color-carvao) 16%,transparent);
  --tv-terra:var(--color-pedra);
  --tv-vale:var(--color-milho);
  --tv-hachura:var(--color-mata);
  --tv-limite:var(--color-mata);
  --tv-limite-externo:var(--color-carvao-suave);
  --tv-stroke-interno:var(--color-carvao-suave);
  --tv-rotulo:var(--color-carvao);
  --tv-pin:var(--color-barro);
  --tv-pin-texto:var(--color-branco);
  --tv-pin-selecionado:var(--color-destaque);
  --tv-pin-selecionado-texto:var(--color-texto-sobre-destaque);
  --tv-contorno-foco:var(--color-mata);
  --tv-hover:color-mix(in srgb,var(--color-marca) 14%,var(--color-fundo-elevado));
  --tv-local-municipio:color-mix(in srgb,var(--color-milho) 14%,var(--color-pedra));
  --tv-via-rodovia:var(--color-carvao);
  --tv-via-casco:var(--color-pedra);
  --tv-via-estrada:var(--color-carvao-suave);
  --tv-via-urbana:var(--color-carvao-suave);
  --tv-agua:var(--color-anil);
  --tv-localidade:var(--color-carvao);
  --tv-fio:color-mix(in srgb,var(--color-borda-forte) 45%,var(--color-fundo));
  --tv-papel:color-mix(in srgb,var(--color-fundo) 95%,var(--color-marca));
  --tv-respiro:clamp(2.25rem,5vw,3.75rem);
  --tv-duracao:calc(var(--duracao-painel) * 2.75);
  --tv-duracao-local:calc(var(--duracao-painel) * 4.5);
  max-width:var(--largura-conteudo);margin-inline:auto;padding:clamp(1.5rem,4vw,3rem) clamp(1rem,4vw,3rem) clamp(3rem,7vw,6rem);
}
@media (prefers-color-scheme:dark){
  :root:not([data-tema="claro"]) .tv{
    --tv-borda-plano:color-mix(in srgb,var(--color-texto) 42%,var(--color-fundo));
    --tv-filete:color-mix(in srgb,var(--color-texto) 14%,transparent);
    --tv-sombra:color-mix(in srgb,var(--color-carvao) 70%,transparent);
    --tv-hover:color-mix(in srgb,var(--color-marca) 24%,var(--color-fundo-elevado));
  }
}
:root[data-tema="escuro"] .tv{
  --tv-borda-plano:color-mix(in srgb,var(--color-texto) 42%,var(--color-fundo));
  --tv-filete:color-mix(in srgb,var(--color-texto) 14%,transparent);
  --tv-sombra:color-mix(in srgb,var(--color-carvao) 70%,transparent);
  --tv-hover:color-mix(in srgb,var(--color-marca) 24%,var(--color-fundo-elevado));
}

.tv ul,.tv ol{list-style:none;margin:0;padding:0}
.tv p{margin:0}
.tv a{color:var(--color-link)}
.tv__nota a{text-decoration:underline}

/* --- Abertura: título, mapa de situação e informação de margem ------------ */

.tv__abertura{display:grid;gap:clamp(1.5rem,4vw,2.5rem);align-items:end;padding-bottom:var(--tv-respiro)}
.tv__abertura-texto{display:grid;gap:.75rem;align-content:end;min-width:0}
.tv__abertura h1{margin:0;font-size:clamp(var(--text-3xl),7vw,var(--text-5xl));line-height:.95;max-width:11ch}
.tv__lead{max-width:40ch;font-size:clamp(var(--text-base),2.2vw,var(--text-lg));line-height:1.45}
.tv__instrucao{max-width:44ch;font-size:var(--text-sm);color:var(--color-texto-suave)}

.tv__situacao{display:grid;gap:1rem;margin:0;min-width:0;align-content:end}
.tv__escala-territorial{display:flex;align-items:flex-end;gap:1rem;margin:0;padding:0}
.tv__escala-territorial svg{display:block;flex:none;width:clamp(5rem,14vw,7.5rem);height:auto}
.tv__escala-territorial figcaption{display:grid;gap:.2rem;font-size:var(--text-sm);min-width:0}
.tv__escala-territorial strong{font-family:var(--font-display)}
/* A referência estadual mostra 1000 unidades de projeção em ~110 px: sem traço
   de espessura de tela, o contorno do Vale e o tracejado de São Cristóvão
   ficam abaixo de 0,2 px e o texto ao lado apontaria para o que não se vê. O
   prefixo .tv é o que vence a especificidade das regras da placa. */
.tv .tv__escala-territorial .m{stroke-width:.5;vector-effect:non-scaling-stroke}
.tv .tv__escala-territorial .m.v{stroke-width:1}
.tv .tv__escala-territorial .m.c{stroke-width:1.5;stroke-dasharray:2 1.5}
.tv .tv__escala-territorial .h{fill:url(#tv-hachura-estado)}

/* Informação de margem: o que a carta cobre, em pares curtos. */
.tv__carta{display:grid;gap:0;margin:0;border-top:2px solid var(--color-marca)}
.tv__carta>div{display:grid;gap:.1rem;padding-block:.5rem;border-bottom:1px solid var(--tv-fio)}
.tv__carta dt{font-family:var(--font-mono);font-size:var(--text-xs);letter-spacing:var(--tracking-mono);text-transform:uppercase;color:var(--color-texto-suave)}
.tv__carta dd{margin:0;min-width:0;font-size:var(--text-sm);text-wrap:pretty}

/* --- Régua de escala ------------------------------------------------------ */

/*
  Três degraus, e o traço que os liga. A posição do marcador vem de
  "--tv-passo", escrito pelas regras de estado geradas no componente: sem
  JavaScript ele fica no recorte, que é a escala da visão geral.
*/
.tv__regua{position:relative;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));grid-template-rows:auto auto auto;gap:.15rem 1rem;padding-top:1.1rem;border-top:1px solid var(--tv-fio)}
.tv__regua::before{content:"";position:absolute;top:0;left:0;width:100%;height:2px;background:var(--tv-fio)}
.tv__regua::after{content:"";position:absolute;top:-2px;left:0;width:calc(100% / 3);height:6px;background:var(--color-marca);transform:translateX(calc((var(--tv-passo) - 1) * 100%));transition:transform var(--tv-duracao) var(--easing-padrao)}
.tv__regua li{display:grid;grid-row:span 3;grid-template-rows:subgrid;gap:.15rem;align-content:start;min-width:0}
.tv__regua-nivel{font-family:var(--font-mono);font-size:var(--text-xs);letter-spacing:var(--tracking-mono);text-transform:uppercase;color:var(--color-texto-suave)}
.tv__regua-nome{font-family:var(--font-display);font-weight:600;font-size:var(--text-base);text-wrap:balance}
.tv__regua-medida{font-family:var(--font-mono);font-size:var(--text-xs);line-height:1.4;letter-spacing:var(--tracking-mono);color:var(--color-texto-suave)}
.tv__regua [data-foco]{display:none}
/* A marca de escala em uso é texto, e não só a barra colorida acima. */
.tv__regua .sel{font-family:var(--font-mono);font-weight:400;font-size:var(--text-xs);letter-spacing:var(--tracking-mono);color:var(--color-marca)}
.tv__regua li:not([data-passo="recorte"]) .sel{display:none}
.tv[data-foco]:not([data-foco="vale"]):not([data-foco="sem-local"]) .tv__regua li[data-passo="recorte"] .sel{display:none}
.tv[data-foco]:not([data-foco="vale"]):not([data-foco="sem-local"]) .tv__regua li[data-passo="lugar"] .sel{display:inline}
.tv__regua li[data-passo="estado"]{opacity:.72}

/* --- Placa do mapa e índice territorial ----------------------------------- */

.tv__grade{display:grid;gap:clamp(1.25rem,3vw,2rem);margin-top:var(--tv-respiro)}
.tv__mapa{margin:0;display:grid;gap:.6rem;min-width:0}
.tv__plano{position:relative;overflow:hidden;background:var(--tv-plano);border:1px solid var(--tv-borda-plano);border-radius:var(--radius-ficha);box-shadow:inset 0 1px 0 var(--tv-filete),0 1.25rem 2.5rem -1.5rem var(--tv-sombra)}
.tv__plano{aspect-ratio:var(--tv-proporcao-mapa,1)}
.tv__plano svg{display:block;width:100%;height:100%}
.tv__aparato{display:grid;gap:.5rem;min-width:0}
.tv-mundo{transform-box:view-box;transform-origin:0 0;transform:translate(var(--tv-tx),var(--tv-ty)) scale(var(--tv-s));transition-property:transform,opacity;transition-duration:var(--tv-duracao);transition-timing-function:var(--easing-padrao),linear}
.tv .m{fill:var(--tv-terra);stroke:var(--tv-stroke-interno);stroke-width:.5;vector-effect:non-scaling-stroke;transition:opacity var(--tv-duracao) var(--easing-padrao)}
.tv .m.v{fill:var(--tv-vale);stroke:var(--tv-limite);stroke-width:1.4}
.tv .m.c{stroke:var(--color-anil);stroke-width:1.4;stroke-dasharray:5 2.5}
.tv .h{fill:url(#tv-hachura);stroke:none;pointer-events:none;transition:opacity var(--tv-duracao) var(--easing-padrao)}
.tv #tv-hachura line{stroke:var(--tv-hachura)}
.tv .anel{fill:none;stroke:var(--tv-contorno-foco);stroke-width:3;stroke-dasharray:7 4;vector-effect:non-scaling-stroke;opacity:0;transition:opacity var(--tv-duracao) var(--easing-padrao)}
/* Janela do mapa detalhado: o envelope real do derivado local. */
.tv-janela{fill:none;stroke:var(--tv-contorno-foco);stroke-width:1.2;stroke-dasharray:6 3;vector-effect:non-scaling-stroke;opacity:.5;pointer-events:none;transition-property:opacity,stroke-width;transition-duration:var(--tv-duracao);transition-timing-function:var(--easing-padrao)}
.tv-rot{opacity:0;transition:opacity var(--tv-duracao) var(--easing-padrao);pointer-events:none}
.tv-rot text,.tv-fixo text,.tv-pin text{font-family:var(--font-display)}
.tv-rot text{fill:var(--tv-rotulo);font-weight:600;paint-order:stroke;stroke:var(--color-pedra);stroke-linejoin:round}
.tv-contagem text{font-family:var(--font-mono);font-weight:400}
.tv-fixo text{fill:var(--tv-rotulo);paint-order:stroke;stroke:var(--tv-terra);stroke-width:.3em;stroke-linejoin:round}
.tv-fixo line,.tv-fixo path{stroke:var(--tv-rotulo);fill:none}
.tv-fixo .casco{stroke:var(--tv-terra);stroke-linecap:round;stroke-linejoin:round}
.tv-fixo .escala{opacity:0}
.tv-semlocal{opacity:0;transition:opacity var(--tv-duracao) var(--easing-padrao)}
.tv-semlocal rect{fill:var(--tv-sinal);stroke:var(--tv-limite-externo)}

/* Pins na malha: a ponta marca a localização do lugar */
.tv-pin{pointer-events:none}
.tv-pin .forma{fill:var(--tv-pin);stroke:var(--tv-pin-texto);stroke-width:1.5px;vector-effect:non-scaling-stroke}
.tv-pin .miolo{fill:var(--tv-pin-texto)}
.tv-pin .nome{opacity:0;font-weight:600;fill:var(--tv-rotulo);paint-order:stroke;stroke:var(--color-pedra);stroke-linejoin:round;transition:opacity var(--tv-duracao) var(--easing-padrao)}
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
.tv-local .escudo rect{fill:var(--tv-sinal);stroke:var(--tv-via-rodovia);stroke-width:1.2;vector-effect:non-scaling-stroke}
.tv-local .escudo text{font-family:var(--font-mono);font-weight:500;fill:var(--tv-rotulo)}
.tv-local .loc rect{fill:var(--tv-sinal);stroke:var(--tv-localidade);stroke-width:1.4;vector-effect:non-scaling-stroke}
.tv-local .loc.sede rect{fill:var(--tv-localidade)}
.tv-local .loc text{font-family:var(--font-display);font-weight:500;fill:var(--tv-rotulo);paint-order:stroke;stroke:var(--color-pedra);stroke-width:.32em;stroke-linejoin:round}
.tv-local .loc.sede text{font-weight:700}
.tv-local .loc.outra text{font-weight:400}
.tv-local .loc.referencia-cartografica text{font-style:italic;font-weight:500}
.tv-local .ref .anel-ref{fill:none;stroke:var(--tv-contorno-foco);stroke-width:1.6;stroke-dasharray:4 3;vector-effect:non-scaling-stroke}
.tv-local .ref .nucleo-ref{fill:var(--tv-sinal);stroke:var(--tv-localidade);stroke-width:1.4;vector-effect:non-scaling-stroke}
.tv-local .ref-rotulo{font-family:var(--font-display);font-style:italic;font-weight:500;fill:var(--tv-rotulo);paint-order:stroke;stroke:var(--color-pedra);stroke-width:.32em;stroke-linejoin:round}
.tv-local .pin .forma{fill:var(--tv-pin);stroke:var(--tv-pin-texto);stroke-width:1.5;vector-effect:non-scaling-stroke}
.tv-local .pin .miolo{fill:var(--tv-pin-texto)}
.tv-local .pin[data-selecionado="true"] .forma{fill:var(--tv-pin-selecionado);stroke:var(--tv-contorno-foco);stroke-width:2.5}
.tv-local .pin[data-selecionado="true"] .miolo{fill:var(--tv-contorno-foco)}
.tv-local text.pin-rotulo{font-family:var(--font-display);font-weight:600;fill:var(--tv-rotulo);paint-order:stroke;stroke:var(--color-pedra);stroke-width:.3em;stroke-linejoin:round}
.tv-local .pin-rotulo.selecionado rect{fill:var(--tv-pin-selecionado);stroke:var(--tv-contorno-foco);stroke-width:1.5;vector-effect:non-scaling-stroke}
.tv-local .pin-rotulo.selecionado text{font-family:var(--font-display);font-weight:700;fill:var(--tv-pin-selecionado-texto)}

.tv__legenda{display:flex;flex-wrap:wrap;gap:.4rem 1.1rem;font-family:var(--font-mono);font-size:var(--text-xs);letter-spacing:var(--tracking-mono);color:var(--color-texto-suave)}
.tv__legenda li{display:flex;align-items:center;gap:.45rem}
/* Cada amostra é um pedaço da folha, e leva o chão de papel junto — é o que a
   legenda da Home já faz ao assentar toda amostra sobre pedra. Sem esse chão,
   sinal em carvão, mata ou anil sumiria no tema escuro, porque a geometria do
   mapa é invariante de tema e o fundo da página não. No claro o chão coincide
   com o fundo e não se vê. */
.tv__amostra,.tv__amostra--pin,.tv__traco{box-shadow:0 0 0 2px var(--tv-terra)}
.tv__amostra{display:inline-block;width:1.1rem;height:.8rem;border:1px solid var(--tv-limite);background:var(--tv-vale)}
.tv__amostra--estado{border-color:var(--color-carvao-suave);background:var(--color-pedra)}
.tv__amostra--campo{background:repeating-linear-gradient(45deg,var(--tv-vale),var(--tv-vale) .15rem,var(--tv-hachura) .15rem,var(--tv-hachura) .25rem)}
.tv__amostra--comparacao{border:2px dashed var(--color-anil);background:var(--color-pedra)}
.tv__amostra--janela{width:.9rem;height:.9rem;border:1.5px dashed var(--tv-contorno-foco);background:var(--color-pedra)}
.tv__amostra--pin{display:inline-block;width:.7rem;height:.7rem;margin-inline:.2rem;background:var(--tv-pin);border-radius:50% 50% 50% 0;transform:rotate(-45deg)}
.tv__amostra--referencia{width:.6rem;height:.6rem;background:var(--tv-sinal);border:1.5px solid var(--tv-localidade);outline:1.5px dashed var(--tv-contorno-foco);outline-offset:2px}
.tv__amostra--sede{width:.6rem;height:.6rem;background:var(--tv-localidade);border-color:var(--tv-localidade)}
.tv__amostra--localidade{width:.6rem;height:.6rem;background:var(--tv-sinal);border:1.5px solid var(--tv-localidade)}
.tv__traco{display:inline-block;width:1.5rem;height:0;border-top:3px solid var(--tv-via-rodovia)}
.tv__traco--terra{border-top-style:dashed}
.tv__traco--estrada{border-top:1px solid var(--tv-via-estrada)}
.tv__traco--agua{border-top:2px solid var(--tv-agua)}
.tv__traco--limite{border-top:2px dashed var(--tv-limite)}
.tv__nota{max-width:60ch;font-size:var(--text-xs);line-height:1.55;color:var(--color-texto-suave)}
.tv__legenda--local,.tv__nota--local{display:none}
.tv[data-escala="local"] .tv__legenda--local{display:flex}
.tv[data-escala="local"] .tv__nota--local{display:block}
.tv[data-escala="local"] .tv__legenda--geral,.tv[data-escala="local"] .tv__nota--geral{display:none}

/* --- Índice territorial --------------------------------------------------- */

.tv__trilha{display:grid;gap:.75rem;align-content:start;min-width:0}
.tv__trilha-cab{display:grid;gap:.2rem}
.tv__trilha h2{margin:0;font-size:var(--text-xl)}
.tv__trilha-cab>p:last-child{max-width:44ch;font-size:var(--text-sm);color:var(--color-texto-suave)}
.tv__trilha ul{display:grid;gap:.3rem;margin-top:.35rem}
/*
  Filete de agrupamento: lugares do mesmo município se encostam. O fato em
  palavras já está no parágrafo acima da lista, então o filete é reforço, e
  nunca a única forma de saber que eles se relacionam.
*/
.tv__trilha li[data-municipio]{position:relative;padding-left:.85rem}
.tv__trilha li[data-municipio]::before{content:"";position:absolute;left:.25rem;top:0;bottom:0;width:2px;background:var(--tv-fio)}
.tv__trilha li[data-municipio]:first-of-type::before{top:.5rem;border-radius:2px 2px 0 0}
.tv__trilha li[data-municipio]:last-of-type::before{bottom:.5rem;border-radius:0 0 2px 2px}
.tv [data-tv-aba]{display:grid;gap:.1rem;padding:.7rem .85rem;border:1px solid var(--color-borda);border-left:4px solid transparent;border-radius:var(--radius-ficha);background:var(--color-fundo-elevado);color:var(--color-texto);text-decoration:none;transition:background-color var(--duracao-hover) var(--easing-padrao),border-color var(--duracao-hover) var(--easing-padrao)}
.tv [data-tv-aba]:hover{background:var(--tv-hover)}
.tv [data-tv-aba] .nome{font-family:var(--font-display);font-weight:600}
.tv [data-tv-aba] .meta,.tv [data-tv-aba] .coord{font-family:var(--font-mono);font-size:var(--text-xs);letter-spacing:var(--tracking-mono);color:var(--color-texto-suave)}
.tv [data-tv-aba] .coord{margin-top:.15rem;overflow-wrap:anywhere}
.tv [data-tv-aba][aria-selected="true"]{border-color:var(--tv-contorno-foco);border-left-color:var(--color-destaque);background:var(--tv-hover)}
.tv [data-tv-aba][aria-selected="true"] .nome::after{content:" · selecionado";font-family:var(--font-mono);font-weight:400;font-size:var(--text-xs);letter-spacing:var(--tracking-mono)}

/* --- Dossiê do lugar ------------------------------------------------------ */

.tv__paineis{display:grid;gap:var(--tv-respiro);margin-top:var(--tv-respiro);min-width:0}
.tv [data-tv-painel]{display:grid;gap:1.25rem;padding-top:clamp(1rem,3vw,1.5rem);border-top:3px solid var(--tv-contorno-foco)}
.tv [data-tv-painel] h2{margin:0;font-size:clamp(var(--text-2xl),4vw,var(--text-4xl));line-height:1.05}
.tv [data-tv-painel] h3{margin:0;font-family:var(--font-mono);font-size:var(--text-xs);font-weight:500;letter-spacing:var(--tracking-mono);text-transform:uppercase;color:var(--color-texto-suave)}
.tv [data-tv-painel] section{display:grid;gap:.45rem}
.tv__ficha-cab{display:grid;gap:.35rem;min-width:0}
.tv__resumo{max-width:var(--largura-leitura);font-size:clamp(var(--text-base),2.2vw,var(--text-lg));line-height:1.45}
.tv__subtitulo{color:var(--color-texto-suave)}
/*
  Linha de identificação do dossiê: a coordenada primeiro, porque é o dado
  mais territorial da ficha, e ela não se repete mais em "Como chegar".
*/
.tv__identificacao{display:grid;gap:.15rem;margin-top:.5rem;padding:.8rem 0 .8rem 1rem;border-left:3px solid var(--color-destaque)}
.tv .coordenada{font-family:var(--font-mono);font-size:clamp(var(--text-base),2.4vw,var(--text-lg));letter-spacing:var(--tracking-mono);overflow-wrap:anywhere}
.tv__localizacao{font-size:var(--text-sm)}
.tv__procedencia{font-size:var(--text-xs);line-height:1.45;color:var(--color-texto-suave)}
.tv__ficha-corpo{display:grid;gap:clamp(1.25rem,3vw,2.5rem);align-items:start;min-width:0}
.tv__ficha-texto{display:grid;gap:1.25rem;max-width:var(--largura-leitura);min-width:0}
.tv__narrativa p:first-child{font-size:clamp(var(--text-base),2vw,var(--text-lg));line-height:1.55;text-wrap:pretty}
/* Procedência documental: legenda da fonte, não recado de sistema. */
.tv__credito-fonte{padding-top:.4rem;border-top:1px solid var(--tv-fio);font-family:var(--font-mono);font-size:var(--text-xs);letter-spacing:var(--tracking-mono);color:var(--color-texto-suave)}
.tv__ficha-margem{display:grid;gap:1.25rem;align-content:start;min-width:0;padding-top:.35rem;border-top:2px solid var(--color-marca)}
.tv .fonte{font-family:var(--font-mono);font-size:var(--text-xs);letter-spacing:var(--tracking-mono);color:var(--color-texto-suave)}
.tv .materiais li,.tv__municipios li{display:flex;justify-content:space-between;gap:1rem;padding:.4rem 0;border-bottom:1px solid var(--tv-fio);font-size:var(--text-sm)}
.tv .estado{font-family:var(--font-mono);font-size:var(--text-xs);letter-spacing:var(--tracking-mono);text-transform:uppercase;white-space:nowrap;color:var(--color-texto-suave)}
.tv .dados{display:grid;gap:.75rem}
.tv .dados dd{margin:0;font-family:var(--font-display);font-size:var(--text-xl);font-weight:var(--peso-numeral)}
.tv .dados dt{font-size:var(--text-xs);color:var(--color-texto-suave)}
.tv .fotos{display:grid;grid-template-columns:repeat(auto-fill,minmax(8rem,1fr));gap:.6rem}
.tv .fotos figure{margin:0}
.tv .fotos img{display:block;width:100%;height:auto;aspect-ratio:3/4;object-fit:cover;border-radius:var(--radius-ficha)}
.tv .fotos figcaption{margin-top:.3rem;font-size:var(--text-xs);line-height:1.4}
/* Crédito de autoria: discreto, em linha própria sob a fotografia, nunca
   sobreposto à imagem. */
.tv .credito{display:block;margin-top:.2rem;color:var(--color-texto-suave);font-family:var(--font-mono);font-size:var(--text-xs);letter-spacing:var(--tracking-mono)}
.tv .pendencia{display:inline-block;margin-top:.2rem;padding:.1rem .35rem;border:1px dashed var(--color-acento);color:var(--color-acento);font-family:var(--font-mono);font-size:var(--text-xs)}
.tv .lacuna{padding:.75rem;border:1px dashed var(--color-borda-forte);border-radius:var(--radius-ficha);font-size:var(--text-sm)}
.tv .chegar{display:grid;gap:0}
.tv .chegar div{display:grid;gap:.1rem;padding:.35rem 0;border-bottom:1px solid var(--tv-fio);font-size:var(--text-sm)}
.tv .chegar dd{margin:0}
.tv__acesso{gap:.6rem}
.tv .rota{display:grid;gap:.45rem}
.tv .rota ul{display:flex;flex-wrap:wrap;gap:.5rem}
.tv .rota__link{display:inline-block;padding:.35rem 0;border-bottom:1px solid currentColor;font-family:var(--font-display);font-size:var(--text-sm);font-weight:600;text-decoration:none}
.tv .rota__link:hover{background:var(--tv-hover)}
.tv__voltar{justify-self:start;font-family:var(--font-display);font-size:var(--text-sm);font-weight:600;text-decoration:none}
.tv__fecho{display:grid;gap:.5rem;max-width:var(--largura-leitura);margin-top:var(--tv-respiro);padding-top:clamp(1.5rem,4vw,2.5rem);border-top:1px solid var(--color-borda)}
.tv__fecho h2{margin:0;font-size:clamp(var(--text-xl),3vw,var(--text-2xl))}

/*
  Entrada da ficha: aparece de baixo, uma vez, quando a seleção a revela. É
  troca sem salto, e não recompensa de clique — a ficha não se move depois.
*/
@keyframes tv-entrada{from{opacity:0;transform:translateY(.75rem)}to{opacity:1;transform:none}}
.tv[data-interativo="true"] [data-tv-painel]:not([hidden]){animation:tv-entrada var(--duracao-revelacao) var(--easing-entrada) both}

/*
  Movimento reduzido: troca instantânea de verdade. A regra global de
  tokens.css encurta a duração para 0,01 ms, mas uma transição de 10 µs ainda
  existe — no quadro da troca o mapa segue no estado anterior. Aqui a
  propriedade de transição é anulada; as regras de estado só mexem em duração
  e atraso, então não a reativam. A animação de entrada é desligada pelo nome,
  e não pela duração, para não deixar nome de animação vivo com tempo zero.
*/
@media (prefers-reduced-motion:reduce){
  .tv.tv[data-foco] :is(.tv-mundo,.tv-local,.m,.h,.anel,.tv-janela,.tv-rot,.tv-contra,.tv-semlocal,.escala,.tv-pin .nome){transition-property:none}
  .tv.tv .tv__regua::after{transition-property:none}
  .tv.tv[data-interativo="true"] [data-tv-painel]:not([hidden]){animation-name:none}
}

/* --- Tablet: o mapa ocupa a largura e o índice vira duas colunas ---------- */

@media (min-width:640px){
  .tv__abertura{grid-template-columns:minmax(0,1.15fr) minmax(17rem,.85fr)}
  .tv__ficha-corpo{grid-template-columns:minmax(0,1.55fr) minmax(15rem,1fr)}
}
@media (min-width:640px) and (max-width:1023px){
  .tv__trilha ul{grid-template-columns:repeat(2,minmax(0,1fr))}
  /* Em duas colunas o filete vertical não agrupa nada: ele sai, e o
     agrupamento fica por conta do parágrafo acima da lista. */
  .tv__trilha li[data-municipio]{padding-left:0}
  .tv__trilha li[data-municipio]::before{display:none}
  .tv [data-tv-aba]{height:100%}
}

/* --- Desktop: placa e índice lado a lado ---------------------------------- */

@media (min-width:1024px){
  .tv__grade{grid-template-columns:minmax(0,1.3fr) minmax(19rem,1fr);align-items:start;column-gap:clamp(1.5rem,3vw,2.5rem)}
  .tv__trilha{position:sticky;top:calc(var(--altura-cabecalho) + 1rem)}
  .tv__ficha-corpo{grid-template-columns:minmax(0,1.7fr) minmax(17rem,1fr)}
}

/* --- Celular: mapa grande → faixa de lugares → dossiê --------------------- */

@media (max-width:639px){
  .tv{--tv-respiro:2rem}
  .tv__abertura{gap:1.25rem}
  .tv__situacao{gap:.75rem}
  .tv__escala-territorial{align-items:center}
  .tv__regua{grid-template-columns:repeat(3,minmax(0,1fr));gap:.5rem}
  .tv__regua-nome{font-size:var(--text-sm);line-height:1.2}
  /* O número da escala fica; o qualificador sai, porque em 375 px ele
     quebraria o degrau em quatro linhas sem acrescentar escala nenhuma. */
  .tv__regua-medida .q{display:none}
  .tv__trilha-cab>p:last-child{font-size:var(--text-xs)}
  .tv__trilha h2{font-size:var(--text-lg)}
  .tv__trilha ul{display:flex;gap:.4rem;overflow-x:auto;overscroll-behavior-x:contain;scroll-snap-type:x proximity;padding-bottom:.4rem}
  .tv__trilha li{flex:0 0 auto;max-width:16rem;scroll-snap-align:start}
  /* Na faixa horizontal o filete vertical não agrupa nada: ele vira um traço
     solto entre cartões. O parágrafo acima continua dizendo o agrupamento. */
  .tv__trilha li[data-municipio]{padding-left:0}
  .tv__trilha li[data-municipio]::before{display:none}
  .tv [data-tv-aba]{height:100%;padding:.5rem .7rem}
  .tv [data-tv-aba] .nome{font-size:var(--text-sm);white-space:nowrap}
  .tv [data-tv-aba] .meta{white-space:nowrap}
  .tv [data-tv-aba] .coord{white-space:nowrap}
  .tv__nota{font-size:var(--text-xs)}
  .tv__legenda{gap:.35rem .8rem}
  .tv__ficha-margem{padding-top:.75rem}
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
