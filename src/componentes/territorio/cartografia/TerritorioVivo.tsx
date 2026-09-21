import type { ArquivosPublicados } from "../../../dados/materiais-de-campo";
import { RESUMO_PUBLICO_DO_VALE } from "../../../dados/territorio/recorte";
import { caminhoDoPin } from "../../mapa/caminhoDoPin";
import { CSS_DO_TERRITORIO_VIVO } from "./estilos";
import {
  barraDeEscala,
  type Caixa,
  expandir,
  seCruzam,
  unirCaixas,
} from "./geometria";
import { InteracaoTerritorioVivo } from "./InteracaoTerritorioVivo";
import {
  estaPosicionado,
  type LugarNoMapa,
  montarBaseDoTerritorio,
} from "./local/composicao";
import { PranchaDoLugar } from "./PranchaDoLugar";

/**
 * Cartografia Viva — o território da pesquisa, como atlas.
 *
 * Server Component. Malha, projeção e recorte são os da cartografia pública;
 * os lugares de campo têm posição e publicação autorizadas, lidas da fonte
 * versionada `referencias.ts`.
 *
 * ## A forma da página
 *
 * 1. **A abertura** é a carta do território, em faixa escura e largura
 *    total. O quadro não é o dos cinco municípios: ele se estende até
 *    Ilha Grande, e por isso o único ponto fora do Vale aparece fora do
 *    milho na primeira tela, sem legenda que precise explicar. O título
 *    ocupa o chão vazio a oeste da malha — fora de Sergipe não há desenho.
 * 2. **A faixa dos lugares** fecha a abertura e fica presa ao topo durante a
 *    leitura. É navegação comum por âncoras, com o capítulo em leitura
 *    marcado; sem JavaScript continua sendo o sumário.
 * 3. **O Vale** é o primeiro capítulo: a frase do recorte, os cinco
 *    municípios desenhados com a própria forma e Sergipe inteiro, em escala.
 * 4. **Cada lugar é uma prancha** (`PranchaDoLugar`): fotografia, narrativa
 *    e o mapa do próprio entorno, lado a lado. A ordem dos capítulos é a das
 *    fichas; nenhuma ordem de visita é afirmada.
 *
 * Todo o conteúdo está no HTML: nada fica escondido atrás de uma seleção.
 * A ilha cliente só busca o mapa detalhado de cada prancha quando ela se
 * aproxima da tela e marca, na faixa, o capítulo em leitura.
 *
 * ## A geometria continua sendo dado
 *
 * Os quadros saem das caixas dos municípios e das posições confirmadas; a
 * escala, da mesma projeção. Nenhum traço liga um lugar a outro — percurso
 * exigiria fonte de percurso, e não há.
 */

const ID_RAIZ = "territorio-vivo";
const ID_DO_VALE = "o-vale";
const idDoCapitulo = (id: string) => `lugar-${id}`;
const idDoMunicipio = (codigo: string) => `tv-m-${codigo}`;

const n = (v: number) => v.toFixed(1);
const caixaEmViewBox = (c: Caixa) =>
  `${n(c.x0)} ${n(c.y0)} ${n(c.x1 - c.x0)} ${n(c.y1 - c.y0)}`;

/** Largura de um quadro em quilômetros, arredondada para leitura. */
const larguraEmKm = (unidades: number, kmPorUnidade: number) =>
  Math.round(unidades * kmPorUnidade);

export function TerritorioVivo({
  baseDasCamadas,
  publicados = new Map(),
}: {
  baseDasCamadas: string;
  /** Arquivos públicos por documento, buscados pela rota em build. */
  publicados?: ArquivosPublicados;
}) {
  const base = montarBaseDoTerritorio({ publicados });
  const { dados, caixaDe, vista, vw, fs, raio, kmU, doVale } = base;
  const lugares = base.lugares;
  const nomeDe = (codigo: string | null) =>
    codigo === null
      ? null
      : (dados.municipios.find((m) => m.codigoIbge === codigo)?.nome ?? null);

  const posicionados = lugares.filter(estaPosicionado);

  /*
    Pertencer ao recorte é relação declarada em `recorte.ts`, e não o acaso de
    o ponto cair dentro de um quadro.
  */
  const codigosDoRecorte = new Set(doVale.map((m) => m.codigoIbge));
  const doRecorte = (lugar: LugarNoMapa) =>
    lugar.municipioId !== null && codigosDoRecorte.has(lugar.municipioId);
  const dentroDoRecorte = lugares.filter(doRecorte);
  const foraDoRecorte = lugares.filter((l) => !doRecorte(l));
  const comparacao = dados.municipios.filter((m) =>
    m.relacoesTerritoriais.includes("comparacao"),
  );

  const porMunicipio = new Map<string, LugarNoMapa[]>();
  for (const lugar of lugares) {
    if (lugar.municipioId === null) continue;
    const lista = porMunicipio.get(lugar.municipioId) ?? [];
    lista.push(lugar);
    porMunicipio.set(lugar.municipioId, lista);
  }

  /*
    Dois quadros para a carta geral, ambos derivados.

    - `caixaDoVale`: os cinco municípios, com a folga da vista.
    - `quadro`: o Vale mais todo lugar posicionado e o município de
      comparação, com espaço a leste para o nome do ponto mais afastado.

    No celular a carta mostra só o primeiro (o segundo encolheria o Vale a
    um terço da tela); a figura diz em texto quem ficou fora do quadro.
  */
  const caixaDoVale = expandir(
    unirCaixas(doVale.map((m) => caixaDe(m.codigoIbge))),
    0.06,
  );
  const folga = (caixaDoVale.y1 - caixaDoVale.y0) * 0.02;
  const pontos = posicionados.map((l) => l.xy);
  const quadro: Caixa = {
    x0: caixaDoVale.x0,
    y0: Math.min(caixaDoVale.y0, ...pontos.map(([, y]) => y - fs * 3)),
    x1: Math.max(
      caixaDoVale.x1,
      ...comparacao.map((m) => caixaDe(m.codigoIbge).x1 + folga),
      ...pontos.map(([x]) => x + fs * 7.5),
    ),
    y1: Math.max(caixaDoVale.y1, ...pontos.map(([, y]) => y + fs)),
  };
  const qw = quadro.x1 - quadro.x0;
  const qh = quadro.y1 - quadro.y0;
  const cw = caixaDoVale.x1 - caixaDoVale.x0;
  const ch = caixaDoVale.y1 - caixaDoVale.y0;
  const noQuadro = dados.municipios.filter((m) =>
    seCruzam(caixaDe(m.codigoIbge), quadro),
  );
  const malha = dados.municipios.map((m) => ({
    codigo: m.codigoIbge,
    classe: m.relacoesTerritoriais.includes("vale-rio-real")
      ? "m v"
      : m.relacoesTerritoriais.includes("comparacao")
        ? "m c"
        : "m",
    caixa: caixaDe(m.codigoIbge),
  }));
  const lugaresForaDoVale = posicionados.filter((l) => {
    const [x, y] = l.xy;
    return (
      x < caixaDoVale.x0 ||
      x > caixaDoVale.x1 ||
      y < caixaDoVale.y0 ||
      y > caixaDoVale.y1
    );
  });

  /* Na projeção, x cresce para leste: a direção sai da coordenada. */
  const aLeste = lugaresForaDoVale.every((l) => l.xy[0] > caixaDoVale.x1);

  const barraGeral = barraDeEscala(kmU, 1, qw * 0.16);
  const kmDoEstado = larguraEmKm(dados.projecao.largura, kmU);
  const kmDoRecorte = larguraEmKm(vw, kmU);

  const raioDoPin = raio * 0.72;
  const nomesDoRecorte = [
    ...new Set(
      dentroDoRecorte
        .map((l) => nomeDe(l.municipioId))
        .filter((m): m is string => m !== null),
    ),
  ];
  const nomesFora = [
    ...new Set(
      foraDoRecorte.map(
        (l) => nomeDe(l.municipioId) ?? "município não publicado",
      ),
    ),
  ];
  const descricaoDaCarta = `Mapa do Vale do Rio Real e dos lugares da pesquisa: ${doVale.length} municípios do recorte, ${dentroDoRecorte.length} lugares em ${nomesDoRecorte.join(", ")}${
    foraDoRecorte.length > 0
      ? ` e ${foraDoRecorte.map((l) => l.nome).join(", ")}, em ${nomesFora.join(", ")}, fora do recorte`
      : ""
  }.`;

  /*
    Lugar apontado — o estado que liga faixa, pin, município e capítulo.

    Apontar um lugar (ponteiro sobre o item da faixa ou sobre o pin, foco de
    teclado no item, toque no pin) acende, por `:has()`, duas variáveis na
    raiz: `--ap` (algum lugar está apontado) e `--ap-<id>` (qual). Cada
    elemento declara em `--eu` o quanto pertence ao lugar apontado — o pin e
    o item da faixa do próprio lugar, o município que o contém — e o CSS de
    `estilos.ts` faz o resto: o que pertence ganha peso, o que não pertence
    recua. "Vale do Rio Real" acende `--ap-vale`, que é outra coisa: o recorte
    inteiro volta ao primeiro plano, com todos os lugares no mesmo nível.

    O município vem de `municipioId`, a relação declarada; nenhuma relação
    espacial é inferida do desenho. Tudo isso é CSS: sem JavaScript o realce
    continua, e sem `:has()` a página só perde o realce.
  */
  const lugaresPorMunicipio = new Map<string, string[]>();
  for (const l of posicionados) {
    if (l.municipioId === null) continue;
    lugaresPorMunicipio.set(l.municipioId, [
      ...(lugaresPorMunicipio.get(l.municipioId) ?? []),
      l.id,
    ]);
  }
  const css = [
    `.tv{--tv-placa-proporcao:${(vw / (vista.y1 - vista.y0)).toFixed(4)};--tv-quadro-proporcao:${(qw / qh).toFixed(4)};--tv-vale-proporcao:${(cw / ch).toFixed(4)};--tv-quadro-escala:${(qw / cw).toFixed(4)};--tv-quadro-x:${(((quadro.x0 - caixaDoVale.x0) / cw) * 100).toFixed(3)}%;--tv-quadro-y:${(((quadro.y0 - caixaDoVale.y0) / ch) * 100).toFixed(3)}%}`,
    `.tv:has(.tv-faixa [data-tv-ir="vale"]:is(:hover,:focus-visible)){--ap-vale:1}`,
    `.tv-faixa [data-tv-ir="vale"]{--eu:var(--ap-vale,0)}`,
    ...posicionados.map(
      (l) =>
        `.tv:has(.tv-faixa [data-tv-ir="${l.id}"]:is(:hover,:focus-visible)),.tv:has(.tv-geral [data-pin="${l.id}"]:is(:hover,:active)){--ap:1;--ap-${l.id}:1}` +
        `.tv-geral [data-pin="${l.id}"],.tv-faixa [data-tv-ir="${l.id}"]{--eu:var(--ap-${l.id},0)}`,
    ),
    ...[...lugaresPorMunicipio].map(
      ([codigo, ids]) =>
        `.tv-geral [data-codigo="${codigo}"]{--eu:max(${ids.map((id) => `var(--ap-${id},0)`).join(",")})}`,
    ),
  ].join("\n");

  return (
    <div className="tv" data-tv-raiz="" id={ID_RAIZ}>
      <style>{CSS_DO_TERRITORIO_VIVO}</style>
      <style>{css}</style>

      {/*
        Geometria compartilhada. Cada município é desenhado uma vez aqui e
        reaproveitado por `<use>` na carta geral, nas pranchas, na situação
        do estado e nas silhuetas do recorte: o HTML leva a malha uma vez só.
      */}
      <svg aria-hidden="true" className="tv-defs" focusable="false">
        <defs>
          <pattern
            height={vw * 0.012}
            id="tv-hachura"
            patternTransform="rotate(45)"
            patternUnits="userSpaceOnUse"
            width={vw * 0.012}
          >
            <line
              strokeWidth={vw * 0.0035}
              x1={0}
              x2={0}
              y1={0}
              y2={vw * 0.012}
            />
          </pattern>
          {dados.municipios.map((m) => (
            <path
              d={m.caminho}
              id={idDoMunicipio(m.codigoIbge)}
              key={m.codigoIbge}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </defs>
      </svg>

      {/* --- Abertura: a carta do território ---------------------------- */}
      <header className="tv-abertura">
        <div className="tv-abertura__grade">
          <div className="tv-abertura__texto">
            <p className="tv-sobrescrito">Território da pesquisa</p>
            <h1>Cartografia Viva</h1>
            <p className="tv-abertura__lead">
              Uma leitura espacial dos lugares, equipamentos e evidências que
              fizeram parte da pesquisa do Observatório.
            </p>
            <p className="tv-abertura__sintese">
              <span>{doVale.length} municípios de recorte.</span>{" "}
              <span>
                {lugares.length} lugares de campo
                {foraDoRecorte.length > 0
                  ? `, ${foraDoRecorte.length === 1 ? "um" : foraDoRecorte.length} deles fora do Vale.`
                  : "."}
              </span>
            </p>
          </div>

          <figure className="tv-geral" id="tv-carta">
            <div className="tv-geral__janela">
              <svg
                aria-hidden="true"
                className="tv-geral__svg"
                focusable="false"
                preserveAspectRatio="xMaxYMid meet"
                viewBox={caixaEmViewBox(quadro)}
              >
                <g data-camada="malha-estadual">
                  {noQuadro.map((m) => (
                    <use
                      className={
                        m.relacoesTerritoriais.includes("vale-rio-real")
                          ? "m v"
                          : m.relacoesTerritoriais.includes("comparacao")
                            ? "m c"
                            : "m"
                      }
                      data-codigo={m.codigoIbge}
                      href={`#${idDoMunicipio(m.codigoIbge)}`}
                      key={m.codigoIbge}
                    />
                  ))}
                  {noQuadro
                    .filter((m) =>
                      m.relacoesTerritoriais.includes("pesquisa-campo"),
                    )
                    .map((m) => (
                      <use
                        className="h"
                        data-codigo={m.codigoIbge}
                        href={`#${idDoMunicipio(m.codigoIbge)}`}
                        key={`h-${m.codigoIbge}`}
                      />
                    ))}
                </g>

                <g className="tv-geral__municipios">
                  {[...doVale, ...comparacao].map((m) => {
                    const c = caixaDe(m.codigoIbge);
                    const deslocamento = ROTULO_DO_MUNICIPIO[m.nome] ?? [0, 0];
                    return (
                      <text
                        className={
                          m.relacoesTerritoriais.includes("vale-rio-real")
                            ? "rm"
                            : "rm rm--fora"
                        }
                        data-codigo={m.codigoIbge}
                        key={`rot-${m.codigoIbge}`}
                        textAnchor="middle"
                        x={n(c.cx + deslocamento[0] * fs)}
                        y={n(c.cy + deslocamento[1] * fs)}
                      >
                        {m.nome}
                      </text>
                    );
                  })}
                </g>

                {/* Pins: ponta exatamente na coordenada confirmada. */}
                {posicionados.map((l) => {
                  const lado = LADO_DO_ROTULO[l.id] ?? "direita";
                  const xDoNome =
                    lado === "direita" ? raioDoPin * 1.5 : -raioDoPin * 1.5;
                  const municipioDoPin = nomeDe(l.municipioId);
                  return (
                    <a
                      className="tv-pin"
                      data-pin={l.id}
                      href={`#${idDoCapitulo(l.id)}`}
                      key={`pin-${l.id}`}
                      tabIndex={-1}
                    >
                      <g
                        transform={`translate(${l.xy[0].toFixed(3)} ${l.xy[1].toFixed(3)})`}
                      >
                        {/*
                          Alvo de toque: um círculo invisível de 44 px ou mais
                          em volta da gota. A gota tem 13–18 px; sem ele,
                          acertar o pin no celular era questão de sorte.
                        */}
                        <circle
                          className="tv-pin__alvo"
                          cy={-raioDoPin}
                          r={raioDoPin * 3.6}
                        />
                        {/*
                          Halo em dois traços, escuro por baixo e claro por
                          cima: aparece sobre o milho do Vale e sobre a mesa.
                        */}
                        {["tv-pin__halo", "tv-pin__halo tv-pin__halo--luz"].map(
                          (classe) => (
                            <circle
                              className={classe}
                              cy={-2 * raioDoPin}
                              key={classe}
                              r={raioDoPin * 1.9}
                            />
                          ),
                        )}
                        <g className="tv-pin__corpo">
                          <path className="forma" d={caminhoDoPin(raioDoPin)} />
                          <circle
                            className="miolo"
                            cy={-2 * raioDoPin}
                            r={raioDoPin * 0.36}
                          />
                        </g>
                        <text
                          className="nome"
                          textAnchor={lado === "direita" ? "start" : "end"}
                          x={xDoNome}
                          y={-2 * raioDoPin + fs * 0.4}
                        >
                          {l.nome}
                        </text>
                        {/*
                          Para quem está fora do recorte, a segunda linha diz
                          onde fica. Ela ganha corpo quando o lugar é
                          apontado; o mesmo fato está escrito na faixa e na
                          prancha, então nada depende do ponteiro.
                        */}
                        {doRecorte(l) ? null : (
                          <text
                            className="tv-pin__fora"
                            dy="1.2em"
                            textAnchor="middle"
                            x={0}
                            y={raioDoPin * 0.4}
                          >
                            {municipioDoPin ?? "Município não publicado"} · fora
                            do recorte
                          </text>
                        )}
                      </g>
                    </a>
                  );
                })}

                <g
                  className="tv-geral__fixo"
                  transform={`translate(${n(quadro.x1 - qw * 0.03)} ${n(quadro.y0 + qh * 0.05)})`}
                >
                  <path
                    d={`M0 ${n(fs * 1.6)}V0M${n(-fs * 0.4)} ${n(fs * 0.5)}L0 0L${n(fs * 0.4)} ${n(fs * 0.5)}`}
                  />
                  <text textAnchor="middle" y={n(fs * 2.7)}>
                    N
                  </text>
                  <g transform={`translate(0 ${n(fs * 5)})`}>
                    <path
                      d={`M${n(-barraGeral.unidades)} ${n(-fs * 0.35)}V0H0V${n(-fs * 0.35)}`}
                    />
                    <text textAnchor="end" x={0} y={n(-fs * 0.7)}>
                      {barraGeral.km} km
                    </text>
                  </g>
                </g>
              </svg>
            </div>

            <figcaption>
              <span className="sr-only">{descricaoDaCarta} </span>
              <ul aria-label="Legenda do mapa" className="tv-legenda">
                <li>
                  <span aria-hidden="true" className="tv-amostra" />
                  Vale do Rio Real
                </li>
                <li>
                  <span
                    aria-hidden="true"
                    className="tv-amostra tv-amostra--campo"
                  />
                  Pesquisa de campo
                </li>
                {comparacao.map((m) => (
                  <li key={`leg-${m.codigoIbge}`}>
                    <span
                      aria-hidden="true"
                      className="tv-amostra tv-amostra--comparacao"
                    />
                    {m.nome}, comparação
                  </li>
                ))}
                <li>
                  <span aria-hidden="true" className="tv-amostra--pin" />
                  Lugar da pesquisa
                </li>
              </ul>
              <span className="tv-geral__fonte">
                Base cartográfica: IBGE. Pontos nas posições registradas pelo
                Observatório.
              </span>
              {/*
                Só aparece quando o quadro fecha no Vale (tela estreita). A
                descrição para leitor de tela já diz o mesmo, por isso esta
                linha é visual.
              */}
              {lugaresForaDoVale.length > 0 ? (
                <span aria-hidden="true" className="tv-geral__fora">
                  {lugaresForaDoVale.map((l) => l.nome).join(", ")}{" "}
                  {lugaresForaDoVale.length === 1 ? "fica" : "ficam"} fora deste
                  quadro{aLeste ? ", a leste" : ""}.
                </span>
              ) : null}
            </figcaption>
          </figure>
        </div>
      </header>

      {/*
        A faixa dos lugares: sumário na abertura, orientação durante a
        leitura. É uma lista de âncoras; a ilha marca com `aria-current` o
        capítulo que está na tela.
      */}
      <nav aria-labelledby="tv-faixa-titulo" className="tv-faixa">
        <h2 className="sr-only" id="tv-faixa-titulo">
          Os lugares da pesquisa
        </h2>
        <p className="sr-only">
          {dentroDoRecorte.length} lugares em {nomesDoRecorte.join(", ")},
          dentro do recorte
          {foraDoRecorte.length > 0
            ? `; ${foraDoRecorte.length} em ${nomesFora.join(", ")}, fora dele`
            : ""}
          .
        </p>
        <ul data-tv-faixa="">
          <li>
            <a data-tv-ir="vale" href={`#${ID_DO_VALE}`}>
              <span className="nome">Vale do Rio Real</span>
              <span className="meta">{doVale.length} municípios</span>
            </a>
          </li>
          {lugares.map((lugar) => (
            <li
              data-fora={doRecorte(lugar) ? undefined : "sim"}
              key={`faixa-${lugar.id}`}
            >
              <a data-tv-ir={lugar.id} href={`#${idDoCapitulo(lugar.id)}`}>
                <span className="nome">{lugar.nome}</span>
                <span className="meta">
                  {nomeDe(lugar.municipioId) ?? "Município não publicado"}
                  {doRecorte(lugar) ? "" : " · fora do recorte"}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* --- O Vale ------------------------------------------------------- */}
      <section
        aria-labelledby="tv-vale-titulo"
        className="tv-vale"
        data-tv-capitulo="vale"
        id={ID_DO_VALE}
      >
        <div className="tv-vale__grade">
          <header className="tv-vale__cab">
            <p className="tv-sobrescrito">O recorte</p>
            <h2 id="tv-vale-titulo">Vale do Rio Real</h2>
          </header>

          <div className="tv-vale__leitura">
            <p className="tv-vale__frase">{RESUMO_PUBLICO_DO_VALE}</p>
            <div className="tv-vale__notas">
              <section>
                <h3>A pesquisa no território</h3>
                <p>
                  Três dos quatro lugares desta cartografia ficam em Tobias
                  Barreto, dentro do recorte: dois equipamentos culturais
                  acompanhados mês a mês e uma comunidade agrícola entre serras,
                  onde a pesquisa terminou com uma oficina aberta aos moradores.
                </p>
              </section>
              <section>
                <h3>Ilha Grande</h3>
                <p>
                  O quarto ponto está em São Cristóvão, fora do Vale. A pesquisa
                  chegou até lá porque o próprio portal da prefeitura
                  apresentava a povoação como território ecoturístico aberto à
                  visitação — e foi conferir. Isso não inclui São Cristóvão
                  entre os cinco municípios do recorte.
                </p>
              </section>
            </div>
          </div>

          <section
            aria-labelledby="tv-recorte-titulo"
            className="tv-vale__recorte"
          >
            <h3 id="tv-recorte-titulo">Os cinco municípios</h3>
            <ul className="tv-municipios">
              {doVale.map((m) => {
                const c = caixaDe(m.codigoIbge);
                const contagem = porMunicipio.get(m.codigoIbge)?.length ?? 0;
                /*
                  Três estados, e não dois. Tomar do Geru tem pesquisa de campo
                  declarada no recorte e nenhum lugar posicionado: chamá-lo de
                  "sem ponto de campo" transformaria a ausência de pin numa
                  afirmação sobre a pesquisa, que a fonte não sustenta.
                */
                const estado =
                  contagem > 0
                    ? contagem === 1
                      ? "1 lugar no mapa"
                      : `${contagem} lugares no mapa`
                    : m.relacoesTerritoriais.includes("pesquisa-campo")
                      ? "pesquisa de campo"
                      : "sem ponto de campo";
                return (
                  <li
                    data-campo={
                      m.relacoesTerritoriais.includes("pesquisa-campo")
                        ? "sim"
                        : undefined
                    }
                    key={m.codigoIbge}
                  >
                    <svg
                      aria-hidden="true"
                      className="tv-silhueta"
                      focusable="false"
                      viewBox={caixaEmViewBox(expandir(c, 0.04))}
                    >
                      <use
                        className="m v"
                        href={`#${idDoMunicipio(m.codigoIbge)}`}
                      />
                      {m.relacoesTerritoriais.includes("pesquisa-campo") ? (
                        <use
                          className="h"
                          href={`#${idDoMunicipio(m.codigoIbge)}`}
                        />
                      ) : null}
                    </svg>
                    <span className="nome">{m.nome}</span>
                    <span className="estado">{estado}</span>
                  </li>
                );
              })}
            </ul>
            <p className="tv-nota">
              Lugares posicionados nesta cartografia e a relação de cada
              município com o recorte.
              {comparacao.length > 0
                ? ` ${comparacao.map((m) => m.nome).join(", ")} entra como referência de comparação em políticas públicas, fora do recorte.`
                : ""}
            </p>
          </section>

          <figure className="tv-situacao">
            <svg
              aria-hidden="true"
              focusable="false"
              viewBox={`0 0 ${dados.projecao.largura} ${Math.ceil(dados.projecao.altura)}`}
            >
              {dados.municipios.map((m) => (
                <use
                  className={`m${m.relacoesTerritoriais.includes("vale-rio-real") ? " v" : ""}${m.relacoesTerritoriais.includes("comparacao") ? " c" : ""}`}
                  href={`#${idDoMunicipio(m.codigoIbge)}`}
                  key={`sit-${m.codigoIbge}`}
                />
              ))}
              <rect
                className="tv-situacao__quadro"
                height={n(vista.y1 - vista.y0)}
                width={n(vw)}
                x={n(vista.x0)}
                y={n(vista.y0)}
              />
            </svg>
            <figcaption>
              <span className="tv-sobrescrito">Situação</span>
              <strong>Sergipe → Vale do Rio Real</strong>
              <span>
                Sergipe tem {kmDoEstado} km de largura nesta projeção; o quadro
                do recorte, {kmDoRecorte} km. O Vale aparece em milho; São
                Cristóvão, em traço anil, fica fora dele.
              </span>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* --- As pranchas -------------------------------------------------- */}
      <div className="tv-pranchas">
        {lugares.map((lugar, indice) => (
          <PranchaDoLugar
            baseDasCamadas={baseDasCamadas}
            comparacao={comparacao.map((m) => m.codigoIbge)}
            doVale={doVale.map((m) => m.codigoIbge)}
            fs={fs}
            idDoCapitulo={idDoCapitulo(lugar.id)}
            idDoMunicipio={idDoMunicipio}
            key={lugar.id}
            kmU={kmU}
            lado={indice % 2 === 0 ? "direita" : "esquerda"}
            lugar={lugar}
            malha={malha}
            municipio={nomeDe(lugar.municipioId)}
            noRecorte={doRecorte(lugar)}
            quadro={quadro}
            raio={raio}
            vista={vista}
          />
        ))}
      </div>

      <section aria-labelledby="tv-fecho-titulo" className="tv-fecho">
        <div>
          <p className="tv-sobrescrito">Sobre a cartografia</p>
          <h2 id="tv-fecho-titulo">Uma leitura espacial da pesquisa</h2>
          <p>
            Os pontos não formam um roteiro turístico. Eles situam lugares,
            equipamentos e registros que compõem a documentação pública do
            Observatório.
          </p>
          <p className="tv-fecho__links">
            <a href="/pesquisa">Como a pesquisa foi feita</a>
            <a href="/acervo">Os documentos no Acervo</a>
          </p>
        </div>
      </section>

      <InteracaoTerritorioVivo idRaiz={ID_RAIZ} />
    </div>
  );
}

/**
 * Ajustes de rótulo da carta geral, em múltiplos do corpo da carta.
 *
 * O centro da caixa de Tobias Barreto cai entre os três pins do município;
 * o nome desce para o sul do território, onde não disputa com eles. É
 * tipografia, e só: nenhum ponto se move.
 */
const ROTULO_DO_MUNICIPIO: Readonly<Record<string, readonly [number, number]>> =
  {
    "Tobias Barreto": [4.6, 3.6],
    Cristinápolis: [-0.8, 0],
    "Poço Verde": [-0.4, -0.6],
    "São Cristóvão": [0, -3.2],
  };

/**
 * Lado do nome de cada pin. Todos à direita hoje; o mapa existe para o dia em
 * que um lugar novo encostar em outro.
 */
const LADO_DO_ROTULO: Readonly<Record<string, "direita" | "esquerda">> = {};
