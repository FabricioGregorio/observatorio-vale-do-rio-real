/**
 * Estilos da Cartografia Viva.
 *
 * ## Três materiais
 *
 * - **A mesa** — a abertura, escura nos dois temas, como o Hero da Home. Nela
 *   a carta não é uma placa: o território é desenhado direto sobre a mesa, e
 *   o que fica fora de Sergipe é a própria mesa, sem papel. O Vale acende em
 *   milho; o resto do estado é sombra; São Cristóvão, em traço anil.
 * - **O papel** — as pranchas e o capítulo do Vale, na superfície de leitura
 *   do site (e no escuro, a do tema escuro).
 * - **A placa** — o mapa de cada prancha, papel claro nos dois temas. A
 *   geometria é invariante de tema desde a Fase H0; o que é vazado sobre o
 *   mapa usa `--tv-sinal`, o mesmo branco.
 *
 * ## Símbolos
 *
 * - **Lugar da pesquisa:** pin em gota, com a ponta na coordenada.
 * - **Vale:** preenchimento em milho. **Pesquisa de campo:** hachura.
 *   **Comparação:** traço anil tracejado. Nenhuma informação só por cor.
 * - Nas pranchas, a camada local mantém o vocabulário de antes: localidade do
 *   lugar em anel tracejado, referência IBGE em quadrado vazado com rótulo
 *   explícito, sede em quadrado cheio, rodovia com casco.
 *
 * ## Fotografia sem corte
 *
 * Nenhuma imagem usa `object-fit: cover`. A altura é limitada e a largura
 * acompanha a proporção original: a fotografia é documento.
 *
 * ## Interação e movimento
 *
 * A carta responde a um estado só, "lugar apontado" (ver `TerritorioVivo`):
 * o pin cresce e ganha halo, o nome acende, o município que contém o lugar
 * ganha contorno claro, o resto recua sem sumir, e o item da faixa responde.
 * Tudo por opacidade, cor, traço e transformações curtas — nada de zoom, pan
 * ou animação contínua. Ao chegar a uma prancha, a rolagem é suave, um filete
 * de milho marca o título por um instante e o "você está aqui" acende no
 * mapa local e no localizador. A camada local entra em fade.
 *
 * Sob `prefers-reduced-motion` a propriedade de transição é anulada, e não só
 * a duração; a rolagem fica imediata e a marca de destino fica parada. O
 * realce continua: nenhum estado depende de animação.
 */
export const CSS_DO_TERRITORIO_VIVO = `
.tv{
  --tv-mesa:var(--color-mata);
  --tv-mesa-funda:color-mix(in srgb,var(--color-mata) 72%,var(--color-noite));
  --tv-mesa-texto:var(--color-pedra);
  --tv-mesa-suave:color-mix(in srgb,var(--color-pedra) 80%,var(--color-mata));
  --tv-mesa-fio:color-mix(in srgb,var(--color-pedra) 22%,transparent);
  --tv-sombra-terra:color-mix(in srgb,var(--color-pedra) 8%,var(--color-mata));
  --tv-sombra-limite:color-mix(in srgb,var(--color-pedra) 26%,var(--color-mata));
  --tv-plano:var(--color-branco);
  --tv-sinal:var(--color-branco);
  --tv-terra:var(--color-pedra);
  --tv-vale:var(--color-milho);
  --tv-hachura:var(--color-mata);
  --tv-limite:var(--color-mata);
  --tv-stroke-interno:var(--color-carvao-suave);
  --tv-rotulo:var(--color-carvao);
  --tv-pin:var(--color-barro);
  --tv-pin-texto:var(--color-branco);
  --tv-pin-selecionado:var(--color-destaque);
  --tv-pin-selecionado-texto:var(--color-texto-sobre-destaque);
  --tv-contorno-foco:var(--color-mata);
  --tv-local-municipio:color-mix(in srgb,var(--color-milho) 14%,var(--color-pedra));
  --tv-via-rodovia:var(--color-carvao);
  --tv-via-casco:var(--color-pedra);
  --tv-via-estrada:var(--color-carvao-suave);
  --tv-via-urbana:var(--color-carvao-suave);
  --tv-agua:var(--color-anil);
  --tv-localidade:var(--color-carvao);
  --tv-fio:color-mix(in srgb,var(--color-borda-forte) 45%,var(--color-fundo));
  --tv-fora:color-mix(in srgb,var(--color-fundo) 91%,var(--color-anil));
  --tv-gutter:clamp(1rem,4.5vw,4rem);
  --tv-respiro:clamp(3rem,6vw,5.5rem);
  --tv-topo:var(--altura-cabecalho);
  --tv-faixa:4.25rem;
  --tv-duracao:var(--duracao-revelacao);
  --tv-duracao-camada:calc(var(--duracao-revelacao) * 2.5);
  --tv-realce:var(--duracao-hover-cabecalho);
  position:relative;
}

.tv ul,.tv ol{list-style:none;margin:0;padding:0}
.tv :where(p,dl,dd,figure,blockquote,h1,h2,h3){margin:0}
.tv-defs{position:absolute;width:0;height:0;overflow:hidden}
.tv [id]{scroll-margin-top:calc(var(--tv-topo) + var(--tv-faixa) + .5rem)}

.tv-sobrescrito{
  font-family:var(--font-mono);font-size:var(--text-xs);font-weight:500;
  letter-spacing:.12em;text-transform:uppercase;color:var(--color-texto-suave);
}
.tv-fonte{
  display:block;font-family:var(--font-mono);font-size:var(--text-xs);
  letter-spacing:var(--tracking-mono);line-height:1.5;color:var(--color-texto-suave);
}
.tv-nota{font-size:var(--text-sm);line-height:1.55;color:var(--color-texto-suave)}
.tv .lacuna{font-family:var(--font-mono);font-size:var(--text-sm);letter-spacing:var(--tracking-mono);color:var(--color-texto-suave);border-left:3px solid var(--color-borda-forte);padding:.35rem 0 .35rem .8rem}

/* =========================================================================
   A MALHA — os mesmos papéis em toda superfície de papel
   ========================================================================= */

.tv .m{fill:var(--tv-terra);stroke:var(--tv-stroke-interno);stroke-width:.5}
.tv .m.v{fill:var(--tv-vale);stroke:var(--tv-limite);stroke-width:1.2}
.tv .m.c{stroke:var(--color-anil);stroke-width:1.4;stroke-dasharray:5 2.5}
.tv .h{fill:url(#tv-hachura);stroke:none;pointer-events:none}
.tv #tv-hachura line{stroke:var(--tv-hachura)}

/* =========================================================================
   A ABERTURA — a carta sobre a mesa
   ========================================================================= */

.tv-abertura{
  overflow:hidden;
  background:var(--tv-mesa);color:var(--tv-mesa-texto);
  --color-texto-suave:var(--tv-mesa-suave);
}
.tv-abertura a{color:var(--tv-mesa-texto)}
/* Sobre a mata, o anil do foco sumiria: milho é o foco das superfícies escuras. */
.tv :is(.tv-abertura,.tv-faixa) :is(a,summary):focus-visible{outline-color:var(--color-destaque)}

.tv-abertura__grade{
  display:grid;gap:1.5rem;
  max-width:var(--largura-cabecalho);margin-inline:auto;
  padding:clamp(2rem,5vw,3rem) var(--tv-gutter) 1.5rem;
}
.tv-abertura__texto{display:grid;gap:1rem;align-content:start;min-width:0}
.tv-abertura h1{
  font-size:clamp(3.35rem,14.5vw,7.25rem);
  line-height:.86;letter-spacing:-.045em;font-weight:600;
  max-width:8ch;text-wrap:balance;
}
.tv-abertura__lead{
  max-width:34ch;font-size:clamp(var(--text-base),1.6vw,var(--text-lg));
  line-height:1.5;color:var(--tv-mesa-suave);
}
.tv-abertura__sintese{
  display:flex;flex-wrap:wrap;gap:.15rem .5rem;max-width:34ch;
  font-family:var(--font-mono);font-size:var(--text-sm);letter-spacing:var(--tracking-mono);
  color:var(--tv-mesa-texto);
  padding-top:.85rem;border-top:1px solid var(--tv-mesa-fio);
}

/* --- A carta geral ------------------------------------------------------- */

.tv-geral{display:grid;gap:.9rem;min-width:0}
.tv-geral__janela{position:relative;min-width:0}
.tv-geral__svg{display:block;width:100%;height:auto;overflow:hidden}
.tv-geral{--u-pin:13px;--u-mun:8.5px;--u-fixo:8px}
.tv-geral .m{fill:var(--tv-sombra-terra);stroke:var(--tv-sombra-limite);stroke-width:.7}
.tv-geral .m.v{fill:var(--tv-vale);stroke:var(--tv-mesa);stroke-width:1.1}
.tv-geral .m.c{fill:color-mix(in srgb,var(--color-anil-claro) 16%,var(--tv-mesa));stroke:var(--color-anil-claro);stroke-width:1.6;stroke-dasharray:5 3}
.tv-geral .h{opacity:.55}
.tv-geral .rm{
  font-family:var(--font-mono);font-size:var(--u-mun);font-weight:500;
  letter-spacing:.14em;text-transform:uppercase;fill:var(--color-carvao);pointer-events:none;
}
.tv-geral .rm--fora{fill:var(--color-anil-claro);paint-order:stroke;stroke:var(--tv-mesa);stroke-width:.4em;stroke-linejoin:round}
.tv-geral .tv-pin{cursor:pointer}
.tv-geral .tv-pin:focus{outline:none}
.tv-pin__alvo{fill:transparent;stroke:none}
.tv-pin__corpo{
  transform-box:fill-box;transform-origin:50% 100%;
  transform:scale(calc(1 + var(--eu,0) * .4));
  transition:transform var(--tv-realce) var(--easing-padrao);
}
.tv-geral .tv-pin .forma{fill:var(--color-pedra);stroke:var(--color-carvao);stroke-width:1.6px;vector-effect:non-scaling-stroke}
.tv-geral .tv-pin .miolo{fill:var(--color-carvao)}
.tv-geral .tv-pin .nome{
  font-family:var(--font-display);font-size:var(--u-pin);font-weight:600;letter-spacing:-.01em;
  fill:color-mix(in srgb,var(--color-destaque) calc(var(--eu,0) * 100%),var(--color-pedra));
  paint-order:stroke;stroke:var(--tv-mesa);stroke-width:.34em;stroke-linejoin:round;
  font-weight:calc(600 + var(--eu,0) * 100);
  transition:fill var(--tv-realce) var(--easing-padrao);
}
.tv-pin__fora{
  font-family:var(--font-mono);font-size:var(--u-mun);letter-spacing:.06em;
  fill:var(--color-anil-claro);paint-order:stroke;stroke:var(--tv-mesa);stroke-width:.45em;stroke-linejoin:round;
  opacity:calc(.72 + var(--eu,0) * .28);
}

/*
  Lugar apontado. "--ap" diz que algum lugar está apontado; "--eu", que este
  elemento pertence a ele. O que pertence ganha peso, o resto recua — sem
  sumir: a carta continua legível inteira. "--ap-vale" traz o recorte à
  frente, com todos os lugares no mesmo nível.
*/
.tv-geral :is(.m,.h,.rm,.tv-pin){
  transition:opacity var(--tv-realce) var(--easing-padrao),stroke var(--tv-realce) var(--easing-padrao),stroke-width var(--tv-realce) var(--easing-padrao),fill var(--tv-realce) var(--easing-padrao);
}
.tv-geral :is(.m:not(.v),.rm--fora){--fora-do-vale:1}
.tv-geral .m{opacity:calc(1 - .3 * var(--ap,0) * (1 - var(--eu,0)) - .45 * var(--ap-vale,0) * var(--fora-do-vale,0))}
.tv-geral .rm--fora{opacity:calc(1 - .45 * var(--ap-vale,0))}
.tv-geral .h{opacity:calc(.55 * (1 - .3 * var(--ap,0) * (1 - var(--eu,0))))}
.tv-geral .m.v{
  stroke:color-mix(in srgb,var(--color-pedra) calc(max(var(--eu,0),var(--ap-vale,0) * .8) * 100%),var(--tv-mesa));
  stroke-width:calc(1.1px + 1.4px * max(var(--eu,0),var(--ap-vale,0) * .6));
}
.tv-geral .m.c{
  fill:color-mix(in srgb,var(--color-anil-claro) calc(16% + 22% * var(--eu,0)),var(--tv-mesa));
  stroke-width:calc(1.6px + 1.2px * var(--eu,0));
}
.tv-geral .tv-pin{opacity:calc(1 - .55 * var(--ap,0) * (1 - var(--eu,0)))}
.tv-pin__halo{
  fill:none;stroke:var(--tv-mesa);stroke-width:5px;vector-effect:non-scaling-stroke;
  opacity:var(--eu,0);transform-box:fill-box;transform-origin:center;
  transform:scale(calc(.55 + var(--eu,0) * .45));
  transition:opacity var(--tv-realce) var(--easing-padrao),transform var(--tv-realce) var(--easing-padrao);
}
.tv-pin__halo--luz{stroke:var(--color-pedra);stroke-width:2px}
.tv-geral__fixo path{fill:none;stroke:var(--tv-mesa-suave);stroke-width:1.2px;vector-effect:non-scaling-stroke}
.tv-geral__fixo text{font-family:var(--font-mono);font-size:var(--u-fixo);fill:var(--tv-mesa-suave)}

.tv-geral figcaption{display:grid;gap:.5rem;justify-items:start}
.tv-legenda{
  display:flex;flex-wrap:wrap;gap:.35rem 1.1rem;
  font-family:var(--font-mono);font-size:var(--text-xs);letter-spacing:var(--tracking-mono);
  color:var(--color-texto-suave);
}
.tv-legenda li{display:flex;align-items:center;gap:.45rem}
.tv-amostra{display:inline-block;width:1.05rem;height:.75rem;background:var(--tv-vale);border:1px solid var(--tv-limite)}
.tv-amostra--campo{background:repeating-linear-gradient(45deg,var(--tv-vale),var(--tv-vale) .15rem,var(--tv-hachura) .15rem,var(--tv-hachura) .25rem)}
.tv-amostra--comparacao{background:transparent;border:2px dashed var(--color-anil-claro)}
.tv-amostra--pin{display:inline-block;width:.7rem;height:.7rem;margin-inline:.2rem;background:var(--color-pedra);border:1.5px solid var(--color-carvao);border-radius:50% 50% 50% 0;transform:rotate(-45deg)}
.tv-geral__fonte{font-family:var(--font-mono);font-size:var(--text-xs);letter-spacing:var(--tracking-mono);color:var(--color-texto-suave)}
.tv-geral__fora{display:none;font-family:var(--font-mono);font-size:var(--text-xs);letter-spacing:var(--tracking-mono);color:var(--color-anil-claro)}

/* --- A faixa dos lugares ------------------------------------------------- */

.tv-faixa{
  position:sticky;top:var(--tv-topo);z-index:calc(var(--z-cabecalho) - 1);
  background:var(--tv-mesa-funda);color:var(--tv-mesa-texto);
  border-top:1px solid var(--tv-mesa-fio);border-bottom:1px solid var(--tv-mesa-fio);
}
.tv-faixa ul{
  display:grid;grid-auto-flow:column;grid-auto-columns:minmax(0,1fr);
  max-width:var(--largura-cabecalho);margin-inline:auto;padding-inline:var(--tv-gutter);
}
.tv-faixa li + li{border-left:1px solid var(--tv-mesa-fio)}
.tv-faixa a{
  --tv-faixa-realce:var(--eu,0);
  display:grid;align-content:center;gap:.1rem;min-height:calc(var(--tv-faixa) - 2px);min-width:44px;
  padding:.55rem .9rem .55rem 1rem;text-decoration:none;color:var(--tv-mesa-texto);
  box-shadow:inset 0 3px 0 0 transparent;
  background:color-mix(in srgb,var(--color-pedra) calc(var(--tv-faixa-realce) * 8%),transparent);
  transition:box-shadow var(--duracao-painel) var(--easing-padrao),background-color var(--duracao-hover) var(--easing-padrao);
}
.tv-faixa a:hover{--tv-faixa-realce:1}
.tv-faixa .nome{
  font-family:var(--font-display);font-weight:600;font-size:var(--text-base);line-height:1.15;letter-spacing:-.01em;
  text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:.22em;
  text-decoration-color:color-mix(in srgb,var(--color-pedra) calc(var(--tv-faixa-realce) * 70%),transparent);
}
.tv-faixa .meta{font-family:var(--font-mono);font-size:var(--text-xs);letter-spacing:var(--tracking-mono);color:var(--tv-mesa-suave)}
.tv-faixa [data-fora] .meta{color:var(--color-anil-claro)}
/* Capítulo em leitura: filete de milho no topo e o nome sublinhado — forma, e não só cor. */
.tv-faixa a[aria-current]{box-shadow:inset 0 3px 0 0 var(--color-destaque);background:color-mix(in srgb,var(--color-pedra) 7%,transparent)}
.tv-faixa a[aria-current] .nome{text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:.22em;text-decoration-color:var(--color-destaque)}

/* =========================================================================
   O VALE — o primeiro capítulo
   ========================================================================= */

.tv-vale{padding:var(--tv-respiro) var(--tv-gutter);border-bottom:1px solid var(--tv-fio)}
.tv-vale__grade{
  max-width:var(--largura-cabecalho);margin-inline:auto;
  display:grid;gap:clamp(2rem,4vw,3.5rem);
  grid-template-areas:"cab" "leitura" "recorte" "situacao";
}
.tv-vale__cab{grid-area:cab;display:grid;gap:.6rem}
.tv-vale h2,.tv-prancha h2{
  font-size:clamp(2.6rem,7vw,5.25rem);line-height:.92;letter-spacing:-.04em;font-weight:600;
  text-wrap:balance;
}
.tv-vale__leitura{grid-area:leitura;display:grid;gap:2.25rem;align-content:start}
.tv-vale__frase{
  font-family:var(--font-leitura);font-size:clamp(1.45rem,3vw,2.3rem);line-height:1.28;
  letter-spacing:-.01em;max-width:28ch;text-wrap:pretty;
}
.tv-vale__notas{display:grid;gap:1.75rem;max-width:var(--largura-leitura)}
.tv h3{
  font-family:var(--font-mono);font-size:var(--text-xs);font-weight:500;
  letter-spacing:.12em;text-transform:uppercase;color:var(--color-texto-suave);
  margin-bottom:.6rem;
}
.tv-vale__notas p{font-size:var(--text-base);line-height:1.65;max-width:60ch}

.tv-vale__recorte{grid-area:recorte;display:grid;align-content:start;gap:.2rem}
.tv-municipios{border-top:2px solid var(--color-texto)}
.tv-municipios li{
  display:grid;grid-template-columns:2.6rem minmax(0,1fr) auto;align-items:center;gap:.85rem;
  padding:.55rem 0;border-bottom:1px solid var(--tv-fio);
}
.tv-silhueta{width:2.6rem;height:2.6rem;display:block}
.tv-silhueta .m.v{stroke-width:1}
.tv-municipios .nome{font-family:var(--font-display);font-weight:600;font-size:var(--text-lg);letter-spacing:-.01em}
.tv-municipios .estado{font-family:var(--font-mono);font-size:var(--text-xs);letter-spacing:var(--tracking-mono);color:var(--color-texto-suave);text-align:right}
.tv-municipios [data-campo] .estado{color:var(--color-texto)}
.tv-vale__recorte .tv-nota{margin-top:.8rem;max-width:52ch}

.tv-situacao{grid-area:situacao;display:grid;grid-template-columns:minmax(6rem,9rem) minmax(0,1fr);gap:1.1rem;align-items:end;align-self:start}
.tv-situacao svg{display:block;width:100%;height:auto}
.tv-situacao .m{fill:var(--color-pedra-borda);stroke:var(--color-fundo);stroke-width:.4}
.tv-situacao .m.v{fill:var(--tv-vale);stroke:var(--tv-limite);stroke-width:.6}
.tv-situacao .m.c{fill:var(--color-pedra-borda);stroke:var(--color-anil);stroke-width:1;stroke-dasharray:2 1.5}
.tv-situacao__quadro{fill:none;stroke:var(--color-texto);stroke-width:1px;stroke-dasharray:3 2;vector-effect:non-scaling-stroke}
.tv-situacao figcaption{display:grid;gap:.3rem;font-size:var(--text-sm);line-height:1.5;color:var(--color-texto-suave)}
.tv-situacao strong{font-family:var(--font-display);color:var(--color-texto);font-size:var(--text-base)}

/* =========================================================================
   AS PRANCHAS
   ========================================================================= */

.tv-prancha{padding:var(--tv-respiro) var(--tv-gutter);border-bottom:1px solid var(--tv-fio)}
.tv-prancha[data-fora]{background:var(--tv-fora);border-top:2px dashed var(--color-link)}
.tv-prancha__grade{
  max-width:var(--largura-cabecalho);margin-inline:auto;
  display:grid;gap:clamp(1.75rem,3.5vw,2.75rem);
  grid-template-columns:minmax(0,1fr);
  grid-template-areas:"cab" "retrato" "leitura" "carta" "contato" "ficha";
}
.tv-prancha__cab{grid-area:cab;display:grid;gap:.7rem;align-content:start}
.tv-prancha[data-fora] .tv-prancha__cab .tv-sobrescrito{color:var(--color-link)}
.tv-prancha__nome-completo{font-family:var(--font-leitura);font-style:italic;font-size:var(--text-lg);color:var(--color-texto-suave)}

.tv-retrato{grid-area:retrato;display:grid;gap:.6rem;justify-items:start;min-width:0}
.tv-retrato img{display:block;width:auto;height:auto;max-width:100%;max-height:min(78svh,44rem)}
.tv figcaption{font-size:var(--text-sm);line-height:1.45;color:var(--color-texto-suave);max-width:46ch}
.tv figcaption .credito,.tv figcaption .pendencia{display:block;font-family:var(--font-mono);font-size:var(--text-xs);letter-spacing:var(--tracking-mono)}

.tv-prancha__leitura{grid-area:leitura;display:grid;gap:2.25rem;align-content:start;min-width:0}
.tv-prancha__relato{display:grid;gap:.8rem;border-left:3px solid var(--color-marca);padding-left:clamp(1rem,2vw,1.5rem)}
.tv-prancha__relato p{font-family:var(--font-leitura);font-size:clamp(1.2rem,2.1vw,1.6rem);line-height:1.42;max-width:34ch;text-wrap:pretty}

.tv-registros dl{display:flex;flex-wrap:wrap;gap:1.25rem 2.5rem;border-top:2px solid var(--color-texto);padding-top:1rem}
.tv-registros dl > div{display:flex;flex-direction:column-reverse;gap:.25rem}
.tv-registros dd{font-family:var(--font-display);font-weight:var(--peso-numeral);font-size:clamp(var(--text-2xl),3.6vw,var(--text-4xl));line-height:1;letter-spacing:-.03em;color:var(--color-marca);font-variant-numeric:tabular-nums}
.tv-registros dt{font-family:var(--font-mono);font-size:var(--text-xs);letter-spacing:var(--tracking-mono);color:var(--color-texto-suave);max-width:22ch}
.tv-registros .tv-fonte{margin-top:.7rem}

.tv-evidencias ul{border-top:1px solid var(--tv-fio)}
.tv-evidencias li{border-bottom:1px solid var(--tv-fio)}
.tv-evidencias :is(a,span){display:flex;align-items:center;justify-content:space-between;gap:1rem;min-height:2.75rem;padding:.35rem 0;font-family:var(--font-display);font-weight:500}
.tv-evidencias a{color:var(--color-link);text-decoration:none}
.tv-evidencias a::after{content:"→";font-family:var(--font-mono);transition:transform var(--duracao-hover) var(--easing-padrao)}
.tv-evidencias a:hover{text-decoration:underline;text-underline-offset:.2em}
.tv-evidencias a:hover::after{transform:translateX(.25rem)}

/* Prova de contato: altura única, largura da proporção original, sem corte. */
.tv-contato{grid-area:contato;min-width:0}
.tv-contato__folha{display:flex;flex-wrap:wrap;gap:1.5rem 1.25rem;align-items:flex-start}
/* A figura tem a largura da imagem; a legenda quebra dentro dela, sem alargá-la. */
.tv-contato__foto{display:grid;gap:.45rem}
.tv-contato__foto img{display:block;height:var(--tv-h-contato,13rem);width:auto;max-width:none}
.tv-contato__foto figcaption{font-size:var(--text-xs);line-height:1.45;contain:inline-size}

.tv-ficha{grid-area:ficha;border-top:1px solid var(--tv-fio);border-bottom:1px solid var(--tv-fio);max-width:44rem}
.tv-ficha summary{
  display:flex;align-items:center;gap:.6rem;min-height:2.75rem;cursor:pointer;
  font-family:var(--font-mono);font-size:var(--text-xs);letter-spacing:.12em;text-transform:uppercase;
  list-style:none;
}
.tv-ficha summary::-webkit-details-marker{display:none}
.tv-ficha summary::before{content:"+";font-size:var(--text-base);width:1rem;text-align:center}
.tv-ficha[open] summary::before{content:"−"}
.tv-ficha__corpo{display:grid;gap:1rem;padding:.25rem 0 1.25rem}
.tv-ficha .coordenada{font-family:var(--font-mono);font-size:var(--text-base);letter-spacing:var(--tracking-mono)}
.tv-ficha dl{display:grid;gap:.75rem}
.tv-ficha dt{font-family:var(--font-mono);font-size:var(--text-xs);letter-spacing:var(--tracking-mono);color:var(--color-texto-suave)}
.tv-ficha dd{font-size:var(--text-sm);line-height:1.5}
.tv-ficha__rota ul{display:flex;flex-wrap:wrap;gap:.5rem}
.tv-ficha__rota a{display:inline-flex;align-items:center;min-height:2.75rem;padding:0 .9rem;border:1px solid var(--color-borda-forte);font-family:var(--font-display);font-size:var(--text-sm);text-decoration:none;color:var(--color-link)}
.tv-ficha__rota a:hover{background:color-mix(in srgb,var(--color-marca) 10%,transparent)}
.tv-ficha__rota .tv-fonte{margin-top:.5rem}

/* --- O mapa da prancha --------------------------------------------------- */

.tv-carta{grid-area:carta;display:grid;gap:.7rem;align-content:start;min-width:0}
.tv-carta__placa{
  position:relative;container-type:inline-size;
  width:min(100%,calc((100svh - var(--tv-topo) - var(--tv-faixa) - 7rem) * var(--tv-placa-proporcao)));
  min-width:min(100%,17rem);
  aspect-ratio:var(--tv-placa-proporcao);
  background:var(--tv-plano);
  border:1px solid color-mix(in srgb,var(--color-carvao) 22%,var(--color-branco));
  box-shadow:0 1.25rem 2.5rem -1.75rem color-mix(in srgb,var(--color-carvao) 55%,transparent);
  overflow:hidden;
}
.tv-carta__placa > svg[role="img"]{display:block;width:100%;height:100%}
.tv-carta__papel{fill:var(--tv-terra)}
.tv-carta__base .m{fill:var(--tv-terra);stroke:var(--tv-stroke-interno);stroke-width:.6}
.tv-carta__base .m.v{fill:var(--tv-local-municipio);stroke:var(--tv-limite);stroke-width:2}
.tv-carta__base .m.c{fill:var(--tv-terra);stroke:var(--color-anil);stroke-width:2;stroke-dasharray:8 4}
.tv-carta__pin .forma{fill:var(--tv-pin-selecionado);stroke:var(--tv-contorno-foco);stroke-width:2.5px;vector-effect:non-scaling-stroke}
.tv-carta__pin .miolo{fill:var(--tv-contorno-foco)}
.tv-carta__pin text{font-family:var(--font-display);font-weight:700;font-size:13px;fill:var(--tv-rotulo);paint-order:stroke;stroke:var(--color-pedra);stroke-width:.32em;stroke-linejoin:round}
.tv-carta__fixo text{font-family:var(--font-display);fill:var(--tv-rotulo);paint-order:stroke;stroke:var(--tv-terra);stroke-width:.3em;stroke-linejoin:round}
.tv-carta__fixo path{stroke:var(--tv-rotulo);fill:none}
.tv-carta__fixo .casco{stroke:var(--tv-terra);stroke-linecap:round;stroke-linejoin:round}
.tv-carta :is(.tv-carta__base,.tv-carta__pin){transition:opacity var(--tv-duracao-camada) var(--easing-padrao)}
.tv-carta[data-camada="local"] :is(.tv-carta__base,.tv-carta__pin){opacity:0}

.tv-localizador{
  position:absolute;left:.6rem;top:.6rem;width:clamp(4.5rem,24cqi,7.5rem);height:auto;
  background:color-mix(in srgb,var(--color-pedra) 94%,transparent);
  border:1px solid color-mix(in srgb,var(--color-carvao) 30%,var(--color-pedra));
  padding:.25rem;
}
.tv-localizador .m.v{fill:var(--tv-vale);stroke:var(--tv-limite);stroke-width:.6}
.tv-localizador .m.c{fill:none;stroke:var(--color-anil);stroke-width:1;stroke-dasharray:2 1.5}
.tv-localizador .janela{fill:color-mix(in srgb,var(--color-carvao) 12%,transparent);stroke:var(--color-carvao);stroke-width:1.4px;vector-effect:non-scaling-stroke}
.tv-localizador .ponto{fill:var(--tv-pin);stroke:var(--color-branco);stroke-width:1px;vector-effect:non-scaling-stroke;transform-box:fill-box;transform-origin:center}
/*
  Você está aqui. Quando a prancha entra em leitura, a janela do localizador
  ganha a cor do pin e o anel acende em volta da gota no mapa ao lado — os
  dois dizem a mesma coisa em escalas diferentes.
*/
.tv-localizador{transform-origin:0 0;transition:transform var(--tv-realce) var(--easing-padrao)}
.tv-localizador:hover{transform:scale(1.6)}
.tv-localizador :is(.janela,.ponto){transition:fill var(--tv-realce) var(--easing-padrao),stroke var(--tv-realce) var(--easing-padrao),transform var(--tv-realce) var(--easing-padrao)}
.tv-prancha[data-em-leitura] .tv-localizador .janela{fill:color-mix(in srgb,var(--tv-pin) 28%,transparent);stroke:var(--tv-pin);stroke-width:2px}
.tv-prancha[data-em-leitura] .tv-localizador .ponto{transform:scale(1.35)}
.tv-carta__halo .anel{fill:none;stroke:var(--color-carvao);stroke-width:5px;vector-effect:non-scaling-stroke}
.tv-carta__halo .tv-carta__halo--luz{stroke:var(--tv-pin-selecionado);stroke-width:2.5px}
.tv-carta__halo{
  --anel:0;opacity:var(--anel);pointer-events:none;
  transition:opacity var(--duracao-painel) var(--easing-padrao);
}
.tv-carta__halo .anel{transform-box:fill-box;transform-origin:center;transform:scale(calc(1.5 - var(--anel) * .5));transition:transform var(--duracao-painel) var(--easing-entrada)}
.tv-prancha[data-em-leitura] .tv-carta__halo{--anel:1}
/* A ficha de localização aponta para o mesmo ponto: o anel engrossa. */
.tv-prancha:has(.tv-ficha :is(a,summary,.coordenada):is(:hover,:focus-visible)) .tv-carta__halo{--anel:1}
.tv-prancha:has(.tv-ficha :is(a,summary,.coordenada):is(:hover,:focus-visible)) .tv-carta__halo--luz{stroke-width:4px}

.tv-carta figcaption{display:grid;gap:.35rem;max-width:none}

/* --- Chegada a um capítulo ---------------------------------------------- */

/* O link continua sendo link: a rolagem só fica suave, e só para quem não pediu menos movimento. */
@media (prefers-reduced-motion:no-preference){
  html:has(#territorio-vivo){scroll-behavior:smooth}
}
/*
  Destino marcado por um instante: um filete de milho sob o título, que se
  apaga sozinho. Com movimento reduzido ele fica, parado, enquanto o
  capítulo for o destino.
*/
@keyframes tv-chegada{
  from{box-shadow:inset 0 -.14em 0 0 var(--color-destaque)}
  to{box-shadow:inset 0 -.14em 0 0 transparent}
}
.tv :is(.tv-prancha,.tv-vale):target h2{animation:tv-chegada 2.2s var(--easing-saida) .45s both}

.tv-prancha__voltar{display:none;grid-area:voltar}
.tv-prancha__voltar a{display:inline-flex;align-items:center;min-height:2.75rem;font-family:var(--font-display);font-weight:600;color:var(--color-link)}
.tv-carta__escala{font-family:var(--font-mono);font-size:var(--text-xs);letter-spacing:var(--tracking-mono);color:var(--color-texto)}
.tv-carta__escala .nivel{text-transform:uppercase;letter-spacing:.12em;color:var(--color-texto-suave)}
.tv-carta .tv-fonte a{color:inherit;text-decoration:underline}
.tv-carta__legenda summary{
  display:inline-flex;align-items:center;gap:.4rem;min-height:2.75rem;cursor:pointer;
  font-family:var(--font-mono);font-size:var(--text-xs);letter-spacing:.12em;text-transform:uppercase;color:var(--color-texto)
}
.tv-carta__legenda summary{list-style:none}
.tv-carta__legenda summary::-webkit-details-marker{display:none}
.tv-carta__legenda summary::before{content:"+";font-size:var(--text-base);width:1rem;text-align:center}
.tv-carta__legenda[open] summary::before{content:"−"}
.tv-carta__legenda ul{
  display:flex;flex-wrap:wrap;gap:.4rem 1rem;padding:.35rem 0 .25rem;
  font-family:var(--font-mono);font-size:var(--text-xs);letter-spacing:var(--tracking-mono);color:var(--color-texto-suave);
}
.tv-carta__legenda li{display:flex;align-items:center;gap:.45rem}
.tv-carta__legenda .tv-amostra,.tv-carta__legenda .tv-amostra--pin,.tv-carta__legenda .tv-traco{box-shadow:0 0 0 2px var(--tv-terra)}
.tv-carta__legenda .tv-amostra--pin{background:var(--tv-pin-selecionado);border-color:var(--tv-contorno-foco)}
.tv-amostra--referencia{width:.6rem;height:.6rem;background:var(--tv-sinal);border:1.5px solid var(--tv-localidade);outline:1.5px dashed var(--tv-contorno-foco);outline-offset:2px}
.tv-amostra--sede{width:.6rem;height:.6rem;background:var(--tv-localidade);border-color:var(--tv-localidade)}
.tv-amostra--localidade{width:.6rem;height:.6rem;background:var(--tv-sinal);border:1.5px solid var(--tv-localidade)}
.tv-traco{display:inline-block;width:1.5rem;height:0;border-top:3px solid var(--tv-via-rodovia)}
.tv-traco--agua{border-top-width:2px;border-top-color:var(--tv-agua)}
.tv-carta--sem-posicao{align-content:center;min-height:12rem}

/* --- Camada local, servida sob demanda ----------------------------------- */

.tv-local{opacity:0;transition:opacity var(--tv-duracao-camada) var(--easing-padrao)}
.tv-carta[data-camada="local"] .tv-local{opacity:1}
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
/*
  Na placa estreita cada unidade do SVG vale pouco: os nomes de "outras
  localidades" cairiam para ~7 px. Eles saem; povoados, referência e códigos
  de rodovia sobem, porque são o que orienta.
*/
@container (max-width:26rem){
  .tv-local .loc.outra{display:none}
  .tv-local .loc.referencia-cartografica{display:initial}
  .tv-local .loc.referencia-cartografica text,.tv-local .loc.povoado text{font-size:11px}
  .tv-local .escudo text{font-size:8px}
}

/* --- Fecho --------------------------------------------------------------- */

.tv-fecho{padding:var(--tv-respiro) var(--tv-gutter)}
.tv-fecho > div{max-width:var(--largura-cabecalho);margin-inline:auto;display:grid;gap:1rem}
.tv-fecho h2{font-size:clamp(var(--text-2xl),4vw,var(--text-4xl));line-height:1.05;letter-spacing:-.03em;max-width:18ch}
.tv-fecho p{max-width:52ch;font-size:var(--text-lg);line-height:1.55}
.tv-fecho__links{display:flex;flex-wrap:wrap;gap:.5rem 1.5rem}
.tv-fecho__links a{display:inline-flex;align-items:center;min-height:2.75rem;font-family:var(--font-display);font-weight:600;font-size:var(--text-base);color:var(--color-link)}

/* =========================================================================
   CELULAR — até 699 px
   ========================================================================= */

@media (max-width:699px){
  .tv{--tv-faixa:3.5rem}
  .tv-abertura__grade{padding-top:1.75rem;gap:1.25rem}
  /* O quadro fecha no Vale: a carta inteira encolheria o recorte a um terço. */
  .tv-geral__janela{aspect-ratio:var(--tv-vale-proporcao);overflow:hidden;margin-inline:calc(var(--tv-gutter) * -.5)}
  .tv-geral__svg{position:absolute;width:calc(100% * var(--tv-quadro-escala));left:var(--tv-quadro-x);top:var(--tv-quadro-y)}
  .tv-geral{--u-pin:15px;--u-mun:10.5px;--u-fixo:10px}
  .tv-geral__fixo{display:none}
  .tv-geral__fora{display:block}
  .tv-faixa{position:relative;top:auto}
  .tv-faixa ul{grid-auto-columns:max-content;overflow-x:auto;overscroll-behavior-x:contain;scrollbar-width:thin;padding-inline:0}
  .tv-faixa li:first-child{padding-left:calc(var(--tv-gutter) - 1rem)}
  .tv-faixa a{padding-inline:1rem}
  .tv [id]{scroll-margin-top:calc(var(--tv-topo) + .5rem)}
  .tv-prancha__grade{grid-template-areas:"cab" "retrato" "leitura" "carta" "contato" "ficha" "voltar"}
  .tv-prancha__voltar{display:block}
  .tv-retrato img{max-height:none;width:100%}
  .tv{--tv-h-contato:9.5rem}
  .tv-situacao{grid-template-columns:6rem minmax(0,1fr)}
}

/* =========================================================================
   TABLET — 700 a 1099 px: a página dupla vira díptico
   ========================================================================= */

@media (min-width:700px) and (max-width:1099px){
  .tv-abertura h1{max-width:none;font-size:clamp(4.5rem,11vw,6.5rem)}

  .tv-abertura__texto{grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);align-items:end;column-gap:2rem}
  .tv-abertura__texto .tv-sobrescrito,.tv-abertura h1{grid-column:1 / -1}
  .tv-abertura__sintese{align-self:end}
  .tv-geral{--u-pin:14px;--u-mun:9.5px;--u-fixo:9px}
  .tv-vale__grade{grid-template-columns:minmax(0,1fr) minmax(0,1fr);grid-template-areas:"cab cab" "leitura leitura" "recorte situacao"}
  .tv-situacao{grid-template-columns:minmax(0,1fr);align-items:start}
  .tv-situacao svg{max-width:11rem}
  /* Fotografia e mapa lado a lado: o par é o que dá identidade à prancha. */
  .tv-prancha__grade{
    grid-template-columns:minmax(0,1fr) minmax(0,1fr);
    grid-template-areas:"cab cab" "retrato carta" "leitura leitura" "contato contato" "ficha ficha";
    align-items:start;
  }
  .tv-prancha[data-lado="esquerda"] .tv-prancha__grade{grid-template-areas:"cab cab" "carta retrato" "leitura leitura" "contato contato" "ficha ficha"}
  .tv-prancha[data-retrato="nao"] .tv-prancha__grade{grid-template-areas:"cab cab" "leitura carta" "contato contato" "ficha ficha"}
  .tv-carta__placa{width:100%}
  .tv-retrato img{max-height:none;width:100%}
  .tv-prancha__leitura{grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);column-gap:2.5rem;align-items:start}
  .tv-prancha__relato{grid-row:span 3}
  .tv-prancha[data-retrato="nao"] .tv-prancha__leitura{grid-template-columns:minmax(0,1fr)}
  .tv{--tv-h-contato:11rem}
}

/* =========================================================================
   DESKTOP — 1100 px em diante: a mesa e a página dupla
   ========================================================================= */

@media (min-width:1100px){
  /* A mesa não tem margem de conteúdo: a carta vai até a borda da janela. */
  .tv-abertura__grade{
    max-width:none;
    grid-template-columns:minmax(21rem,31rem) minmax(0,1fr);
    grid-template-rows:auto;align-items:stretch;
    min-height:calc(100svh - var(--tv-topo) - var(--tv-faixa));
    padding-block:clamp(2rem,4svh,3.5rem) 1.25rem;
  }
  /* O título ocupa o chão a oeste da malha, onde não há desenho. */
  .tv-abertura__texto{grid-column:1;grid-row:1;align-self:end;z-index:1;padding-bottom:3.25rem}
  .tv-geral{grid-column:1 / -1;grid-row:1;justify-self:end;align-self:center;position:relative;
    width:min(100%,calc((100svh - var(--tv-topo) - var(--tv-faixa) - 4.5rem) * var(--tv-quadro-proporcao)))}
  /* A legenda pousa no canto sudeste da carta, sobre o resto do estado. */
  .tv-geral__svg{overflow:visible}
  .tv-geral figcaption{
    position:absolute;right:0;bottom:0;justify-items:end;text-align:right;
    padding:.75rem .9rem;background:color-mix(in srgb,var(--tv-mesa) 86%,transparent);
    border:1px solid var(--tv-mesa-fio);max-width:21rem;
  }

  .tv-vale__grade{
    grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);
    grid-template-areas:"cab cab" "leitura recorte" "leitura situacao";
    column-gap:clamp(3rem,6vw,6rem);
  }
  .tv-vale__notas{grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:2.5rem}

  .tv{--tv-largura-carta:min(36rem,calc((100svh - var(--tv-topo) - var(--tv-faixa) - 6.5rem) * var(--tv-placa-proporcao)))}
  /*
    A página dupla em três colunas: retrato, relato e mapa. O retrato ocupa a
    largura que a própria proporção pede; o relato fica com o resto.
  */
  .tv-prancha__grade{
    grid-template-columns:auto minmax(17rem,1fr) var(--tv-largura-carta);
    grid-template-areas:"cab cab carta" "retrato leitura carta" "contato contato carta" "ficha ficha carta";
    grid-template-rows:auto auto auto 1fr;
    column-gap:clamp(2rem,3.5vw,4rem);
  }
  .tv-prancha[data-lado="esquerda"] .tv-prancha__grade{
    grid-template-columns:var(--tv-largura-carta) auto minmax(17rem,1fr);
    grid-template-areas:"carta cab cab" "carta retrato leitura" "carta contato contato" "carta ficha ficha";
  }
  /* Sem retrato, o mapa ganha o espaço da fotografia e deixa de acompanhar a rolagem. */
  .tv-prancha[data-retrato="nao"] .tv-prancha__grade{
    grid-template-columns:minmax(0,1fr) minmax(0,min(40rem,46vw));
    grid-template-areas:"cab carta" "leitura carta" "contato carta" "ficha carta";
  }
  .tv-carta{position:sticky;top:calc(var(--tv-topo) + var(--tv-faixa) + 1.5rem);align-self:start}
  .tv-carta__placa{width:100%}
  .tv-prancha[data-retrato="nao"] .tv-carta{position:static}
  .tv-retrato img{max-height:min(70svh,44rem);max-width:min(30vw,32rem)}
  .tv-prancha__leitura{align-self:end}
  .tv{--tv-h-contato:11.5rem}
  .tv-prancha__relato p{font-size:clamp(1.2rem,1.55vw,1.45rem)}
  .tv-abertura h1{font-size:clamp(4.75rem,6.4vw,6.4rem)}
  .tv-prancha__leitura{grid-template-columns:minmax(0,1fr)}
}

/* =========================================================================
   Movimento reduzido: anula a propriedade, e não só a duração.
   ========================================================================= */

@media (prefers-reduced-motion:reduce){
  .tv *,.tv *::before,.tv *::after{transition-property:none !important;animation:none !important}
  .tv :is(.tv-prancha,.tv-vale):target h2{box-shadow:inset 0 -.14em 0 0 var(--color-destaque)}
}
`
  // Os comentários servem a quem lê este arquivo; o HTML servido não os leva.
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/\n\s*\n/g, "\n")
  .trim();
