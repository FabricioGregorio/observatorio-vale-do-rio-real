import type { ArquivosPublicados } from "../../../dados/materiais-de-campo";
import { RESUMO_PUBLICO_DO_VALE } from "../../../dados/territorio/recorte";
import type { PosicaoConfirmada } from "../../../dados/territorio/referencias";
import { caminhoDoPin } from "../../mapa/caminhoDoPin";
import { CSS_DO_TERRITORIO_VIVO } from "./estilos";
import {
  aplicar,
  barraDeEscala,
  compor,
  type Enquadramento,
  projetarContinuo,
} from "./geometria";
import { InteracaoTerritorioVivo } from "./InteracaoTerritorioVivo";
import {
  estaPosicionado,
  type LugarNoMapa,
  montarBaseDoTerritorio,
} from "./local/composicao";
import { FONTES_DAS_CAMADAS } from "./local/entorno";
import { destinosDeRota } from "./local/rota";

/**
 * Cartografia Viva — apresentação pública aprofundada do território.
 *
 * Server Component. A malha, a projeção e o recorte são os da cartografia
 * pública; os lugares de campo têm **posição confirmada** e publicação
 * autorizada, lidas da fonte versionada `local/referencias.ts` (Tarefa 20).
 *
 * ## Uma cartografia que se transforma
 *
 * - `vale` — os cinco municípios do recorte e os pins que caem neles;
 * - `lugar-<id>` — aproximação regional centrada no pin (2×). Se o lugar tem
 *   entorno derivado, a ilha busca a camada local **sob demanda** e, quando
 *   ela chega, a raiz ganha `data-escala="local"`: a malha continua a
 *   aproximação e se apaga, e o mapa detalhado entra no mesmo lugar;
 * - `sem-local` — só quando não há coordenada disponível.
 *
 * Nenhum ponto é forçado para dentro do recorte: um lugar fora da vista do
 * Vale fica fora dela, e a seleção desloca o mapa até ele.
 *
 * O HTML inicial leva pins e enquadramentos. Vias, cursos d'água e localidades
 * não vão nele.
 *
 * ## Três escalas, e não um mapa com texto ao lado (Tarefa 28)
 *
 * A pesquisa opera em três escalas, e as três já existiam como número nos
 * dados: o estado onde o recorte se situa, o recorte, e o entorno de cada
 * lugar. A régua do topo apenas **declara** onde a leitura está, com a largura
 * de cada enquadramento em quilômetros calculada pela própria projeção — não
 * há número escrito à mão.
 *
 * Pelo mesmo critério, a visão geral desenha a **janela** de cada mapa
 * detalhado: o retângulo é o envelope real do derivado local, o mesmo que a
 * seleção usa para aproximar. Ele diz onde a pesquisa abriu escala, e não
 * afirma percurso nenhum entre os pontos — rota exigiria fonte de rota, e não
 * existe.
 */

const ID_RAIZ = "territorio-vivo";
const FOCO_GERAL = "vale";
const SEM_LOCAL = "sem-local";
const IDENTIDADE: Enquadramento = { s: 1, tx: 0, ty: 0 };

const focoDoLugar = (id: string) => `lugar-${id}`;
const focoLocalDoLugar = (id: string) => `local-${id}`;
const urlDaCamada = (base: string, id: string) => `${base}/${id}`;
const px = (n: number) => `${n.toFixed(2)}px`;
const transformacao = (e: Enquadramento) =>
  `translate(${px(e.tx)},${px(e.ty)}) scale(${e.s.toFixed(4)})`;
const varsDoMundo = (e: Enquadramento) =>
  `--tv-tx:${px(e.tx)};--tv-ty:${px(e.ty)};--tv-s:${e.s.toFixed(4)}`;

/**
 * Coordenada para leitura, em grau decimal com seis casas — cerca de 11 cm.
 *
 * As quinze casas de `referencias.ts` são artefato de ponto flutuante, não
 * precisão de campo: o ponto veio de confirmação humana sobre o mapa, e exibi-
 * las declararia uma exatidão que a fonte não tem. Isto é formatação, e só:
 * o destino das rotas externas continua saindo do valor canônico, intacto.
 */
const coordenada = (p: PosicaoConfirmada) =>
  `${p.latitude.toFixed(6)}, ${p.longitude.toFixed(6)}`;

/** Largura de um enquadramento em quilômetros, arredondada para leitura. */
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
  const { dados, caixaDe, vista, vw, vh, fs, raio, kmU, doVale, visiveis } =
    base;
  const lugares = base.lugares;
  const nomeDe = (codigo: string | null) =>
    codigo === null
      ? null
      : (dados.municipios.find((m) => m.codigoIbge === codigo)?.nome ?? null);

  const posicionados = lugares.filter(estaPosicionado);
  const noVale = posicionados.filter((l) => l.dentroDoVale);
  const foraDoVale = posicionados.filter((l) => !l.dentroDoVale);
  const raioDoPin = raio * 0.62;

  /*
    Pertencer ao recorte é relação declarada em `recorte.ts`, e não o acaso de
    o ponto cair dentro do enquadramento. As duas coisas coincidem nos quatro
    lugares de hoje; misturá-las faria o primeiro lugar fora do quadro herdar
    uma afirmação editorial que ninguém escreveu.
  */
  const codigosDoRecorte = new Set(doVale.map((m) => m.codigoIbge));
  const doRecorte = (lugar: LugarNoMapa) =>
    lugar.municipioId !== null && codigosDoRecorte.has(lugar.municipioId);
  const dentroDoRecorte = lugares.filter(doRecorte);
  const foraDoRecorte = lugares.filter((l) => !doRecorte(l));
  const municipioDeComparacao = dados.municipios.find((m) =>
    m.relacoesTerritoriais.includes("comparacao"),
  );

  const porMunicipio = new Map<string, LugarNoMapa[]>();
  for (const lugar of lugares) {
    if (lugar.municipioId === null) continue;
    const lista = porMunicipio.get(lugar.municipioId) ?? [];
    lista.push(lugar);
    porMunicipio.set(lugar.municipioId, lista);
  }

  function estadosDoRotulo(codigo: string, noRecorte: boolean): string {
    const estados: string[] = noRecorte ? [FOCO_GERAL, SEM_LOCAL] : [];
    const c = caixaDe(codigo);
    for (const l of posicionados) {
      const [x, y] = aplicar(l.regional, c.cx, c.cy);
      const dentro =
        x > vista.x0 + vw * 0.08 &&
        x < vista.x1 - vw * 0.08 &&
        y > vista.y0 + vh * 0.1 &&
        y < vista.y1 - vh * 0.1;
      if (dentro) estados.push(focoDoLugar(l.id));
    }
    return estados.join(" ");
  }

  /*
    Estados em CSS, calculados aqui. Nas regras de estado só se trocam
    duração e atraso das transições, nunca a propriedade: assim a regra de
    movimento reduzido de `estilos.ts` continua anulando a transição.
  */
  const duracaoLocal = "var(--tv-duracao-local)";
  const css: string[] = [
    /*
      A placa toma a proporção do próprio enquadramento. Sem isso ela era um
      retângulo arbitrário com a carta encolhida e centrada dentro: cerca de um
      terço da largura sobrava em papel liso no desktop, e o mapa — a peça
      principal da página — aparecia menor do que a coluna que o segurava.
    */
    `.tv{--tv-tx:0px;--tv-ty:0px;--tv-s:1;--tv-passo:2;--tv-proporcao-mapa:${(vw / vh).toFixed(4)}}`,
    `.tv[data-foco="${FOCO_GERAL}"] .tv-rot[data-estados~="${FOCO_GERAL}"],.tv[data-foco="${SEM_LOCAL}"] .tv-rot[data-estados~="${SEM_LOCAL}"]{opacity:1}`,
    `.tv[data-foco="${FOCO_GERAL}"] .escala[data-foco="${FOCO_GERAL}"],.tv[data-foco="${SEM_LOCAL}"] .escala[data-foco="${FOCO_GERAL}"]{opacity:1}`,
    `.tv[data-foco="${SEM_LOCAL}"] .tv-semlocal{opacity:1}`,
    `.tv[data-foco="${SEM_LOCAL}"] .m,.tv[data-foco="${SEM_LOCAL}"] .h{opacity:.5}`,
    /* A régua nasce no recorte: é a escala de trabalho da visão geral. */
    `.tv__regua [data-foco="${FOCO_GERAL}"]{display:block}`,
  ];
  for (const l of posicionados) {
    const foco = focoDoLugar(l.id);
    const focoLocal = focoLocalDoLugar(l.id);
    const noFoco = `.tv[data-foco="${foco}"]`;
    const pinSelecionado = `.tv[data-lugar="${l.id}"] .tv-pin[data-pin="${l.id}"]`;
    css.push(
      `${noFoco}{${varsDoMundo(l.regional)};--tv-passo:3}`,
      `${noFoco} .tv-rot[data-estados~="${foco}"]{opacity:1}`,
      `${noFoco}:not([data-escala="local"]) .escala[data-foco="${foco}"]{opacity:1}`,
      `${noFoco} .tv-pin .nome{opacity:1}`,
      `${noFoco} .tv-janela[data-janela="${l.id}"]{opacity:1;stroke-width:2.2}`,
      `${pinSelecionado}{--tv-pin-escala:1.4}`,
      `${pinSelecionado} .forma{fill:var(--tv-pin-selecionado);stroke:var(--tv-contorno-foco);stroke-width:2.5px}`,
      `${pinSelecionado} .miolo{fill:var(--tv-contorno-foco)}`,
      `${pinSelecionado} .nome{opacity:1;font-weight:700}`,
      `${pinSelecionado} .sel{display:inline}`,
      /* Régua: a variante do lugar substitui a do recorte, sem JavaScript. */
      `${noFoco} .tv__regua [data-foco="${FOCO_GERAL}"]{display:none}`,
      `${noFoco} .tv__regua [data-foco="${foco}"]{display:block}`,
    );
    if (l.municipioId !== null) {
      const m = l.municipioId;
      css.push(
        `${noFoco} .m:not([data-codigo="${m}"]),${noFoco} .h:not([data-codigo="${m}"]){opacity:.42}`,
        `${noFoco} .anel[data-codigo="${m}"],${noFoco} .tv-contagem[data-codigo="${m}"]{opacity:1}`,
      );
    }
    if (l.local !== null) {
      const eL = l.local.enquadramento;
      const camada = `.tv-local[data-tv-camada-local="${l.id}"]`;
      const local = `${noFoco}[data-escala="local"]`;
      css.push(
        `${camada}{transform:${transformacao(compor(IDENTIDADE, eL))}}`,
        `${noFoco} ${camada}{transform:${transformacao(compor(l.regional, eL))}}`,
        `${local}{${varsDoMundo(eL)}}`,
        `${local} .tv-mundo{opacity:0;transition-duration:${duracaoLocal},calc(${duracaoLocal} * .35);transition-delay:0s,calc(${duracaoLocal} * .5)}`,
        `${local} .tv-contra{transition-duration:${duracaoLocal}}`,
        `${local} ${camada}{opacity:1;pointer-events:auto;transform:${transformacao(IDENTIDADE)};transition-duration:${duracaoLocal},calc(${duracaoLocal} * .4);transition-delay:0s,calc(${duracaoLocal} * .4)}`,
        `${local} .escala[data-foco="${focoLocal}"]{opacity:1}`,
        `${local} .tv__regua [data-foco="${foco}"]{display:none}`,
        `${local} .tv__regua [data-foco="${focoLocal}"]{display:block}`,
      );
    }
  }
  css.push(
    ".tv-contra{transform:scale(calc(1 / var(--tv-s)));transition:transform var(--tv-duracao) var(--easing-padrao)}",
    ".tv-pin .tv-contra{transform:scale(calc(var(--tv-pin-escala, 1) / var(--tv-s)))}",
  );

  const tituloGeral =
    posicionados.length === 0
      ? `Mapa do Vale do Rio Real: ${doVale.length} municípios do recorte. Nenhum lugar aparece neste mapa.`
      : `Mapa do Vale do Rio Real: ${doVale.length} municípios do recorte e ${noVale.length} lugares de campo.${
          foraDoVale.length > 0
            ? ` ${foraDoVale.map((l) => l.nome).join(", ")} fica fora deste enquadramento.`
            : ""
        }`;

  const escalas = [
    { foco: FOCO_GERAL, barra: barraDeEscala(kmU, 1, vw * 0.22) },
    ...posicionados.map((l) => ({
      foco: focoDoLugar(l.id),
      barra: barraDeEscala(kmU, l.regional.s, vw * 0.22),
    })),
    ...posicionados.flatMap((l) =>
      l.local === null
        ? []
        : [
            {
              foco: focoLocalDoLugar(l.id),
              barra: barraDeEscala(kmU, l.local.enquadramento.s, vw * 0.22),
            },
          ],
    ),
  ];

  /*
    Larguras da régua. Todas saem da mesma projeção que desenha a malha: a do
    estado é o envelope inteiro; a do recorte, a vista dos cinco municípios; a
    de cada lugar, o quadro que a seleção usa. Nenhuma é digitada.
  */
  const kmDoEstado = larguraEmKm(dados.projecao.largura, kmU);
  const kmDoRecorte = larguraEmKm(vw, kmU);
  const kmDoEnquadramento = (e: Enquadramento) => larguraEmKm(vw / e.s, kmU);

  /**
   * Variantes do degrau "Lugar", trocadas por CSS conforme a seleção.
   *
   * A medida vem partida em duas: o número, que o celular sempre mostra, e o
   * qualificador, que ele esconde. Assim a régua continua dizendo a escala
   * numa tela de 375 px sem quebrar em quatro linhas.
   */
  const degrausDoLugar = [
    {
      foco: FOCO_GERAL,
      nome: "Entorno de um lugar",
      medida: "Escolha um ponto",
      qualificador: " para descer de escala",
    },
    ...posicionados.map((l) => ({
      foco: focoDoLugar(l.id),
      nome: l.nome,
      medida: `${kmDoEnquadramento(l.regional)} km`,
      qualificador: " de largura · aproximação",
    })),
    ...posicionados.flatMap((l) =>
      l.local === null
        ? []
        : [
            {
              foco: focoLocalDoLugar(l.id),
              nome: l.nome,
              medida: `${kmDoEnquadramento(l.local.enquadramento)} km`,
              qualificador: " de largura · entorno detalhado",
            },
          ],
    ),
  ];

  return (
    <div
      className="tv"
      data-foco={FOCO_GERAL}
      data-lugar={FOCO_GERAL}
      data-tv-coordenadas={posicionados.length > 0 ? "disponiveis" : "ausentes"}
      id={ID_RAIZ}
    >
      <style>{CSS_DO_TERRITORIO_VIVO}</style>
      <style>{css.join("\n")}</style>

      <header className="tv__abertura">
        <div className="tv__abertura-texto">
          <p className="meta-ficha">Território da pesquisa</p>
          <h1>Cartografia Viva</h1>
          <p className="tv__lead">
            Uma leitura espacial dos lugares, equipamentos e evidências que
            fizeram parte da pesquisa do Observatório.
          </p>
          <p className="tv__instrucao">
            Escolha um lugar para aproximar o mapa e consultar seus registros
            públicos.
          </p>
        </div>

        <figure className="tv__situacao">
          <div className="tv__escala-territorial">
            <svg
              aria-hidden="true"
              viewBox={`0 0 ${dados.projecao.largura} ${Math.ceil(dados.projecao.altura)}`}
            >
              <defs>
                <pattern
                  height={8}
                  id="tv-hachura-estado"
                  patternTransform="rotate(45)"
                  patternUnits="userSpaceOnUse"
                  width={8}
                >
                  <line
                    stroke="var(--color-mata)"
                    strokeWidth={1.6}
                    x1={0}
                    x2={0}
                    y1={0}
                    y2={8}
                  />
                </pattern>
              </defs>
              {dados.municipios.map((m) => (
                <path
                  className={`m${m.relacoesTerritoriais.includes("vale-rio-real") ? " v" : ""}${m.relacoesTerritoriais.includes("comparacao") ? " c" : ""}`}
                  d={m.caminho}
                  key={m.codigoIbge}
                />
              ))}
              {dados.municipios
                .filter((m) =>
                  m.relacoesTerritoriais.includes("pesquisa-campo"),
                )
                .map((m) => (
                  <path
                    className="h"
                    d={m.caminho}
                    key={`estado-h-${m.codigoIbge}`}
                  />
                ))}
            </svg>
            <figcaption>
              <span className="fonte">Situação</span>
              <strong>Sergipe → Vale do Rio Real</strong>
              <span>
                O recorte aparece em milho. São Cristóvão, em traço anil, fica
                fora dele.
              </span>
            </figcaption>
          </div>

          {/* Informação de margem da carta: o que este mapa cobre, e de onde vem. */}
          <dl className="tv__carta">
            <div>
              <dt>Recorte do Vale</dt>
              <dd>
                {doVale.length} municípios ·{" "}
                {doVale.map((m) => m.nome).join(", ")}
              </dd>
            </div>
            {municipioDeComparacao === undefined ? null : (
              <div>
                <dt>Fora do recorte</dt>
                <dd>
                  {municipioDeComparacao.nome} · referência de comparação em
                  políticas públicas
                </dd>
              </div>
            )}
            <div>
              <dt>Lugares no mapa</dt>
              <dd>
                {posicionados.length} lugares · {dentroDoRecorte.length} no
                recorte, {foraDoRecorte.length} fora
              </dd>
            </div>
            <div>
              <dt>Base cartográfica</dt>
              <dd>IBGE; os entornos acrescentam OpenStreetMap</dd>
            </div>
          </dl>
        </figure>
      </header>

      <p aria-live="polite" className="sr-only" data-tv-regiao-anuncio="" />

      {/*
        Régua de escala. Não é enfeite de margem: os três degraus são os três
        enquadramentos que esta página realmente desenha, e a largura de cada
        um vem da projeção. O degrau ativo acompanha a seleção por CSS, então
        ele continua correto sem JavaScript.
      */}
      <ol aria-label="Escalas desta cartografia" className="tv__regua">
        <li data-passo="estado">
          <p className="tv__regua-nivel">Estado</p>
          <p className="tv__regua-nome">Sergipe</p>
          <p className="tv__regua-medida">
            {kmDoEstado} km
            <span className="q"> de largura · contexto</span>
          </p>
        </li>
        <li data-passo="recorte">
          <p className="tv__regua-nivel">Recorte</p>
          <p className="tv__regua-nome">
            Vale do Rio Real
            <span className="sel"> · escala em uso</span>
          </p>
          <p className="tv__regua-medida">
            {kmDoRecorte} km
            <span className="q"> de largura · {doVale.length} municípios</span>
          </p>
        </li>
        <li data-passo="lugar">
          <p className="tv__regua-nivel">Lugar</p>
          {degrausDoLugar.map((degrau) => (
            <p
              className="tv__regua-nome"
              data-foco={degrau.foco}
              key={`nome-${degrau.foco}`}
            >
              {degrau.nome}
              <span className="sel"> · escala em uso</span>
            </p>
          ))}
          {degrausDoLugar.map((degrau) => (
            <p
              className="tv__regua-medida"
              data-foco={degrau.foco}
              key={`medida-${degrau.foco}`}
            >
              {degrau.medida}
              <span className="q">{degrau.qualificador}</span>
            </p>
          ))}
        </li>
      </ol>

      <div className="tv__grade">
        <figure className="tv__mapa">
          <div className="tv__plano">
            <svg
              aria-labelledby="tv-mapa-titulo"
              data-tv-mapa=""
              role="img"
              viewBox={`${vista.x0.toFixed(1)} ${vista.y0.toFixed(1)} ${vw.toFixed(1)} ${vh.toFixed(1)}`}
            >
              <title id="tv-mapa-titulo">{tituloGeral}</title>
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
              </defs>

              <g className="tv-mundo" data-camada="malha-estadual">
                {visiveis.map((m) => (
                  <path
                    className={
                      m.relacoesTerritoriais.includes("vale-rio-real")
                        ? "m v"
                        : m.relacoesTerritoriais.includes("comparacao")
                          ? "m c"
                          : "m"
                    }
                    d={m.caminho}
                    data-codigo={m.codigoIbge}
                    key={m.codigoIbge}
                  />
                ))}
                <g data-camada="pesquisa-de-campo">
                  {visiveis
                    .filter((m) =>
                      m.relacoesTerritoriais.includes("pesquisa-campo"),
                    )
                    .map((m) => (
                      <path
                        className="h"
                        d={m.caminho}
                        data-codigo={m.codigoIbge}
                        key={`h-${m.codigoIbge}`}
                      />
                    ))}
                </g>
                {[...porMunicipio.keys()].map((codigo) => (
                  <path
                    className="anel"
                    d={
                      dados.municipios.find((m) => m.codigoIbge === codigo)
                        ?.caminho
                    }
                    data-codigo={codigo}
                    key={`anel-${codigo}`}
                  />
                ))}

                {/*
                  Janelas da pesquisa: o retângulo é o envelope do derivado
                  local — a mesma caixa que a seleção usa para aproximar. Ele
                  mostra onde a pesquisa desceu de escala e não liga um ponto
                  ao outro: ligação exigiria fonte de percurso, que não há.
                */}
                <g data-camada="janelas-dos-entornos">
                  {posicionados.flatMap((l) => {
                    if (l.local === null) return [];
                    const g = l.local.geografico;
                    const [x0, y0] = projetarContinuo(
                      g.lonMin,
                      g.latMax,
                      dados.projecao,
                    );
                    const [x1, y1] = projetarContinuo(
                      g.lonMax,
                      g.latMin,
                      dados.projecao,
                    );
                    return [
                      <rect
                        className="tv-janela"
                        data-janela={l.id}
                        height={(y1 - y0).toFixed(2)}
                        key={`janela-${l.id}`}
                        width={(x1 - x0).toFixed(2)}
                        x={x0.toFixed(2)}
                        y={y0.toFixed(2)}
                      />,
                    ];
                  })}
                </g>

                {visiveis.map((m) => {
                  const c = caixaDe(m.codigoIbge);
                  const estados = estadosDoRotulo(
                    m.codigoIbge,
                    m.relacoesTerritoriais.includes("vale-rio-real"),
                  );
                  if (estados === "") return null;
                  return (
                    <g
                      className="tv-rot"
                      data-estados={estados}
                      key={`rot-${m.codigoIbge}`}
                      transform={`translate(${c.cx.toFixed(1)} ${c.cy.toFixed(1)})`}
                    >
                      <g className="tv-contra">
                        <text
                          fontSize={fs}
                          strokeWidth={fs * 0.28}
                          textAnchor="middle"
                          y={fs * 0.35}
                        >
                          {m.nome}
                        </text>
                      </g>
                    </g>
                  );
                })}

                {/* Complemento dos pins: quantos lugares o município reúne. */}
                {[...porMunicipio].map(([codigo, doMunicipio]) => {
                  const c = caixaDe(codigo);
                  return (
                    <g
                      className="tv-rot tv-contagem"
                      data-codigo={codigo}
                      key={`conta-${codigo}`}
                      transform={`translate(${c.cx.toFixed(1)} ${c.cy.toFixed(1)})`}
                    >
                      <g className="tv-contra">
                        <text
                          fontSize={fs * 0.66}
                          strokeWidth={fs * 0.24}
                          textAnchor="middle"
                          y={fs * 1.4}
                        >
                          {doMunicipio.length === 1
                            ? "1 lugar visitado neste município"
                            : `${doMunicipio.length} lugares visitados neste município`}
                        </text>
                      </g>
                    </g>
                  );
                })}

                {/* Pins: ponta exatamente na coordenada confirmada. */}
                {posicionados.map((l) => (
                  <g
                    className="tv-pin"
                    data-dentro-do-vale={l.dentroDoVale ? "sim" : "nao"}
                    data-pin={l.id}
                    data-tipo="lugar"
                    key={`pin-${l.id}`}
                    transform={`translate(${l.xy[0].toFixed(3)} ${l.xy[1].toFixed(3)})`}
                  >
                    <g className="tv-contra">
                      <path className="forma" d={caminhoDoPin(raioDoPin)} />
                      <circle
                        className="miolo"
                        cy={-2 * raioDoPin}
                        r={raioDoPin * 0.38}
                      />
                      <text
                        className="nome"
                        fontSize={fs * 0.74}
                        strokeWidth={fs * 0.26}
                        x={raioDoPin * 1.45}
                        y={-2 * raioDoPin + fs * 0.26}
                      >
                        <tspan className="sel">▸ </tspan>
                        {l.nome}
                      </text>
                    </g>
                  </g>
                ))}
              </g>

              {/* Camadas locais: vazias no HTML; a ilha as preenche sob demanda. */}
              {posicionados
                .filter((l) => l.local !== null)
                .map((l) => (
                  <g
                    className="tv-local"
                    data-tv-camada-local={l.id}
                    key={`local-${l.id}`}
                  />
                ))}

              <g className="tv-fixo">
                <g
                  transform={`translate(${(vista.x1 - vw * 0.06).toFixed(1)} ${(vista.y0 + vh * 0.06).toFixed(1)})`}
                >
                  {/*
                    Casco claro antes do traço, como nas rodovias da camada
                    local: a rosa e a barra de escala são anotações da placa,
                    e a placa acompanha o tema enquanto a geometria do mapa é
                    invariante. Sem o casco, o traço em carvão desaparecia
                    sobre a placa escura.
                  */}
                  {[true, false].map((casco) => (
                    <path
                      className={casco ? "casco" : undefined}
                      d={`M0 ${fs * 1.6} L0 0 M${-fs * 0.4} ${fs * 0.5} L0 0 L${fs * 0.4} ${fs * 0.5}`}
                      key={casco ? "casco" : "traco"}
                      strokeWidth={fs * (casco ? 0.42 : 0.12)}
                    />
                  ))}
                  <text fontSize={fs * 0.9} textAnchor="middle" y={fs * 2.6}>
                    N
                  </text>
                </g>
                {escalas.map(({ foco, barra }) => {
                  const x = vista.x0 + vw * 0.05;
                  const y = vista.y1 - vh * 0.05;
                  return (
                    <g
                      className="escala"
                      data-foco={foco}
                      key={`escala-${foco}`}
                    >
                      {[true, false].map((casco) => (
                        <path
                          className={casco ? "casco" : undefined}
                          d={`M${x} ${y - fs * 0.35} L${x} ${y} L${x + barra.unidades} ${y} L${x + barra.unidades} ${y - fs * 0.35}`}
                          key={casco ? "casco" : "traco"}
                          strokeWidth={fs * (casco ? 0.4 : 0.1)}
                        />
                      ))}
                      <text fontSize={fs * 0.8} x={x} y={y - fs * 0.6}>
                        {barra.km} km
                      </text>
                    </g>
                  );
                })}
                <g
                  className="tv-semlocal"
                  transform={`translate(${(vista.x0 + vw * 0.15).toFixed(1)} ${(vista.y1 - vh * 0.3).toFixed(1)})`}
                >
                  <rect
                    height={fs * 3.4}
                    rx={fs * 0.2}
                    strokeWidth={fs * 0.06}
                    width={vw * 0.7}
                  />
                  <text fontSize={fs} x={fs * 0.7} y={fs * 1.35}>
                    Sem posição disponível
                  </text>
                  <text fontSize={fs * 0.75} x={fs * 0.7} y={fs * 2.55}>
                    O mapa não posiciona este lugar.
                  </text>
                </g>
              </g>
            </svg>
          </div>

          <figcaption className="tv__aparato">
            <ul
              aria-label="Legenda do mapa"
              className="tv__legenda tv__legenda--geral"
            >
              <li>
                <span
                  aria-hidden="true"
                  className="tv__amostra tv__amostra--estado"
                />
                Sergipe
              </li>
              <li>
                <span aria-hidden="true" className="tv__amostra" />
                Vale
              </li>
              <li>
                <span
                  aria-hidden="true"
                  className="tv__amostra tv__amostra--campo"
                />
                Pesquisa
              </li>
              <li>
                <span
                  aria-hidden="true"
                  className="tv__amostra tv__amostra--comparacao"
                />
                Comparação · São Cristóvão
              </li>
              <li>
                <span aria-hidden="true" className="tv__amostra--pin" />
                Lugar da pesquisa
              </li>
              <li>
                <span
                  aria-hidden="true"
                  className="tv__amostra tv__amostra--janela"
                />
                Janela do mapa detalhado
              </li>
            </ul>
            <ul
              aria-label="Legenda do mapa detalhado"
              className="tv__legenda tv__legenda--local"
            >
              <li>
                <span aria-hidden="true" className="tv__amostra--pin" />
                Lugar visitado
              </li>
              <li>
                <span
                  aria-hidden="true"
                  className="tv__amostra tv__amostra--referencia"
                />
                Localidade do lugar
              </li>
              <li>
                <span
                  aria-hidden="true"
                  className="tv__amostra tv__amostra--sede"
                />
                Sede
              </li>
              <li>
                <span
                  aria-hidden="true"
                  className="tv__amostra tv__amostra--localidade"
                />
                Outra localidade ou referência IBGE
              </li>
              <li>
                <span aria-hidden="true" className="tv__traco" />
                Rodovia principal
              </li>
            </ul>
            <p className="tv__nota tv__nota--geral">
              Base cartográfica: IBGE. Os pontos representam localizações
              registradas pelo Observatório em campo. Ilha Grande aparece ao
              selecionar o lugar, pois está fora do enquadramento do Vale.
            </p>
            <p className="tv__nota tv__nota--local">
              Base cartográfica: IBGE + OpenStreetMap. Vias e cursos d'água:{" "}
              <a href="https://www.openstreetmap.org/copyright">
                {FONTES_DAS_CAMADAS.vias}
              </a>
              . O ponto usa a localização registrada pelo Observatório.
            </p>
          </figcaption>
        </figure>

        <nav aria-labelledby="tv-lista-titulo" className="tv__trilha">
          <div className="tv__trilha-cab">
            <p className="meta-ficha">Índice territorial</p>
            <h2 id="tv-lista-titulo">Os lugares da pesquisa</h2>
            {/*
              Equivalente textual do agrupamento que a lista desenha com um
              filete: quem não vê o filete recebe o mesmo fato em palavras.
            */}
            <p>
              {dentroDoRecorte.length} lugares em{" "}
              {[...new Set(dentroDoRecorte.map((l) => nomeDe(l.municipioId)))]
                .filter((n): n is string => n !== null)
                .join(", ")}
              , dentro do recorte
              {foraDoRecorte.length > 0
                ? `; ${foraDoRecorte.length} em ${[
                    ...new Set(
                      foraDoRecorte.map(
                        (l) =>
                          nomeDe(l.municipioId) ?? "município não publicado",
                      ),
                    ),
                  ].join(", ")}, fora dele`
                : ""}
              .
            </p>
          </div>
          <ul data-tv-lista="">
            <li>
              <a
                data-tv-aba={FOCO_GERAL}
                data-tv-anuncio="Visão geral do Vale do Rio Real."
                data-tv-foco={FOCO_GERAL}
                data-tv-rotulo-mapa={tituloGeral}
                href={`#tv-painel-${FOCO_GERAL}`}
              >
                <span className="nome">Vale do Rio Real</span>
                <span className="meta">
                  Visão geral · {doVale.length} municípios
                </span>
              </a>
            </li>
            {lugares.map((lugar) => {
              const municipio = nomeDe(lugar.municipioId);
              const p = estaPosicionado(lugar) ? lugar : null;
              const fora = p !== null && !p.dentroDoVale;
              const noRecorte = doRecorte(lugar);
              const rotulo =
                p === null
                  ? `Mapa do Vale do Rio Real. ${lugar.nome} não aparece neste mapa.`
                  : `Mapa do entorno de ${lugar.nome}${municipio !== null ? `, em ${municipio}` : ""}${fora ? ", fora do recorte do Vale" : ""}.`;
              const rotuloLocal =
                p === null || p.local === null
                  ? undefined
                  : lugar.camadaLocal?.localidadeIbge !== null &&
                      lugar.localidade !== null &&
                      municipio !== null
                    ? `Mapa detalhado do entorno do ${lugar.localidade.texto}, em ${municipio}: pin de ${lugar.nome} na sua localização e, com outro símbolo, a localidade segundo o IBGE. Vias e cursos d'água do OpenStreetMap; localidades do IBGE.`
                    : lugar.camadaLocal?.referenciaCartografica != null
                      ? `Mapa detalhado do entorno de ${lugar.nome}: pin na localização da comunidade visitada. ${lugar.camadaLocal.referenciaCartografica.rotulo} aparece apenas como referência cartográfica próxima e não representa o lugar visitado. Vias e cursos d'água do OpenStreetMap; localidades do IBGE.`
                      : `Mapa detalhado do entorno de ${lugar.nome}, com o pin na sua localização. Vias e cursos d'água do OpenStreetMap; localidades do IBGE.`;
              const anuncio =
                p === null
                  ? `${lugar.nome} selecionado. Este lugar não está posicionado no mapa.`
                  : `${lugar.nome} selecionado. O mapa se aproxima de ${lugar.nome}${fora ? ", fora do recorte do Vale" : ""}.`;
              const meta = [
                municipio ?? "Município não publicado",
                noRecorte ? "no recorte do Vale" : "fora do recorte do Vale",
              ].join(" · ");
              return (
                <li
                  data-municipio={lugar.municipioId ?? "sem-municipio"}
                  key={lugar.id}
                >
                  <a
                    data-tv-aba={lugar.id}
                    data-tv-anuncio={anuncio}
                    data-tv-camada={
                      p !== null && p.local !== null
                        ? urlDaCamada(baseDasCamadas, lugar.id)
                        : undefined
                    }
                    data-tv-foco={
                      p === null ? SEM_LOCAL : focoDoLugar(lugar.id)
                    }
                    data-tv-rotulo-local={rotuloLocal}
                    data-tv-rotulo-mapa={rotulo}
                    href={`#tv-painel-${lugar.id}`}
                  >
                    <span className="nome">{lugar.nome}</span>
                    <span className="meta">{meta}</span>
                    {p === null ? (
                      <span className="coord">sem ponto no mapa</span>
                    ) : (
                      <span className="coord">{coordenada(p.posicao)}</span>
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div className="tv__paineis">
        <section
          aria-labelledby="tv-painel-vale-titulo"
          data-tv-painel=""
          id={`tv-painel-${FOCO_GERAL}`}
        >
          <header className="tv__ficha-cab">
            <p className="meta-ficha">Visão geral · recorte da pesquisa</p>
            <h2 id="tv-painel-vale-titulo">Vale do Rio Real</h2>
            <p className="tv__resumo">{RESUMO_PUBLICO_DO_VALE}</p>
          </header>
          <div className="tv__ficha-corpo">
            <div className="tv__ficha-texto">
              <section>
                <h3>A pesquisa no território</h3>
                <p>
                  Três dos quatro lugares desta cartografia ficam em Tobias
                  Barreto, dentro do recorte: dois equipamentos culturais
                  acompanhados mês a mês e uma comunidade agrícola entre serras,
                  onde a pesquisa terminou com uma oficina aberta aos moradores.
                  Cada ponto abre a sua própria ficha.
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
            <aside className="tv__ficha-margem">
              <section>
                <h3>O recorte</h3>
                <ul className="tv__municipios">
                  {doVale.map((m) => {
                    const contagem =
                      porMunicipio.get(m.codigoIbge)?.length ?? 0;
                    /*
                      Três estados, e não dois. Tomar do Geru tem pesquisa de
                      campo declarada no recorte e nenhum lugar posicionado:
                      chamá-lo de "sem ponto de campo" transformaria a ausência
                      de pin numa afirmação sobre a pesquisa, que a fonte não
                      sustenta.
                    */
                    const rotulo =
                      contagem > 0
                        ? contagem === 1
                          ? "1 lugar no mapa"
                          : `${contagem} lugares no mapa`
                        : m.relacoesTerritoriais.includes("pesquisa-campo")
                          ? "pesquisa de campo"
                          : "sem ponto de campo";
                    return (
                      <li key={m.codigoIbge}>
                        <span>{m.nome}</span>
                        <span className="estado">{rotulo}</span>
                      </li>
                    );
                  })}
                </ul>
                <p className="fonte">
                  Lugares posicionados nesta cartografia e a relação de cada
                  município com o recorte.
                </p>
              </section>
            </aside>
          </div>
        </section>

        {lugares.map((lugar) => (
          <FichaDoLugar
            key={lugar.id}
            lugar={lugar}
            municipio={nomeDe(lugar.municipioId)}
            noRecorte={doRecorte(lugar)}
          />
        ))}
      </div>

      <section className="tv__fecho">
        <p className="meta-ficha">Sobre a cartografia</p>
        <h2>Uma leitura espacial da pesquisa</h2>
        <p>
          Os pontos não formam um roteiro turístico. Eles situam lugares,
          equipamentos e registros que compõem a documentação pública do
          Observatório.
        </p>
      </section>

      <InteracaoTerritorioVivo idRaiz={ID_RAIZ} />
    </div>
  );
}

/**
 * Dossiê territorial de um lugar.
 *
 * A coordenada sobe para a linha de identificação — é o dado mais territorial
 * da ficha e estava no rodapé de um `dl`. "Como chegar" deixa de repeti-la e
 * fica com o que é referência documental. O aparato — evidências, registros,
 * acesso — vai para a margem; a narrativa e as fotografias ficam na coluna de
 * leitura. Fichas com mais fonte ocupam mais margem, e nenhuma é preenchida
 * para alcançar a outra.
 */
function FichaDoLugar({
  lugar,
  municipio,
  noRecorte,
}: {
  lugar: LugarNoMapa;
  municipio: string | null;
  noRecorte: boolean;
}) {
  const idTitulo = `tv-painel-${lugar.id}-titulo`;
  const materiaisPublicos = lugar.materiais.filter(
    (material) => material.estado === "publico",
  );
  const posicao = lugar.posicao;
  const temComoChegar =
    lugar.localidade !== null ||
    lugar.comoChegar?.referencia != null ||
    lugar.camadaLocal?.referenciaCartografica != null ||
    posicao !== null;

  return (
    <section
      aria-labelledby={idTitulo}
      data-tv-painel=""
      id={`tv-painel-${lugar.id}`}
    >
      <header className="tv__ficha-cab">
        <p className="meta-ficha">
          {[
            "Lugar visitado",
            municipio,
            noRecorte ? "no recorte" : "fora do recorte",
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <h2 id={idTitulo}>{lugar.nome}</h2>
        {lugar.nomeCompleto !== null && lugar.nomeCompleto !== lugar.nome ? (
          <p className="tv__subtitulo">{lugar.nomeCompleto}</p>
        ) : null}

        {posicao !== null || lugar.localidade !== null ? (
          <div className="tv__identificacao">
            {posicao !== null ? (
              <p className="coordenada">{coordenada(posicao)}</p>
            ) : null}
            {lugar.localidade !== null ? (
              <p className="tv__localizacao">
                <strong>{lugar.localidade.texto}</strong>
                {municipio !== null ? ` · ${municipio} (SE)` : ""}
              </p>
            ) : null}
            {posicao !== null ? (
              /*
                Duas frases, e não uma. A primeira diz de que ponto se trata; a
                segunda prende a data ao que ela de fato data — a confirmação
                da coordenada, evento editorial. Emendadas, a data encostaria
                em "lugar" e se leria como data de visita, que este projeto não
                possui para nenhum dos quatro lugares.
              */
              <p className="tv__procedencia">
                Ponto do próprio lugar, não do município.
                <br />
                {`Coordenada: ${posicao.fonteDaCoordenada}.`}
              </p>
            ) : null}
          </div>
        ) : null}

        {lugar.lacunaDeLocalizacao !== null ? (
          <p className="lacuna">{lugar.lacunaDeLocalizacao}</p>
        ) : null}
      </header>

      <div className="tv__ficha-corpo">
        <div className="tv__ficha-texto">
          {lugar.descricao !== null ? (
            <section className="tv__narrativa">
              <p>{lugar.descricao.texto}</p>
              <p className="tv__credito-fonte">{lugar.descricao.fonte}</p>
            </section>
          ) : null}

          {lugar.fotos.length === 0 ? (
            /*
              A frase descreve o estado **da ficha**, e nada além dele.
              "Nenhuma fotografia pública está vinculada a este lugar", que
              estava aqui antes, afirmava mais do que se podia provar: dizia do
              acervo inteiro a partir do que a ficha reúne. Serra dos Macacos
              tem fotografias de origem que nunca foram derivadas nem
              publicadas — o que não torna a ficha errada, torna a frase
              anterior errada.

              Também não se diz o contrário. Anunciar que existe material ainda
              não publicado exporia a existência de acervo fora do universo
              público, e o fail-closed vale nos dois sentidos.
            */
            <section>
              <h3>Fotografias</h3>
              <p className="lacuna">
                Esta ficha ainda não reúne fotografia pública.
              </p>
            </section>
          ) : (
            <section>
              <h3>Fotografias</h3>
              <div className="fotos">
                {lugar.fotos.map((foto) => (
                  <figure key={foto.src}>
                    <img
                      alt={foto.alt}
                      decoding="async"
                      height={foto.altura}
                      loading="lazy"
                      src={foto.src}
                      width={foto.largura}
                    />
                    <figcaption>
                      {foto.legenda}
                      {foto.credito !== null ? (
                        <span className="credito">{foto.credito}</span>
                      ) : null}
                      {foto.pendencia !== null ? (
                        <span className="pendencia">{foto.pendencia}</span>
                      ) : null}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="tv__ficha-margem">
          {materiaisPublicos.length > 0 ? (
            <section>
              <h3>Evidências públicas</h3>
              <ul className="materiais">
                {materiaisPublicos.map((m) => (
                  <li key={m.material}>
                    <span>
                      {m.href !== null ? (
                        <a href={m.href}>{m.material}</a>
                      ) : (
                        m.material
                      )}
                    </span>
                    <span className="estado">Disponível</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {lugar.dados.length > 0 ? (
            <section>
              <h3>Registros do período</h3>
              <dl className="dados">
                {lugar.dados.map((d) => (
                  <div key={d.rotulo}>
                    <dd>{d.valor}</dd>
                    <dt>{d.rotulo}</dt>
                  </div>
                ))}
              </dl>
              <p className="tv__credito-fonte">{lugar.dados[0]?.fonte}</p>
            </section>
          ) : null}

          {temComoChegar ? (
            <section className="tv__acesso">
              <h3>Como chegar</h3>
              <dl className="chegar">
                {lugar.localidade !== null ? (
                  <div>
                    <dt className="fonte">Localização documental</dt>
                    <dd>
                      {lugar.localidade.texto}
                      {municipio !== null ? `, ${municipio} (SE)` : ""}
                    </dd>
                  </div>
                ) : null}
                {lugar.camadaLocal?.referenciaCartografica != null ? (
                  <div>
                    <dt className="fonte">Referência cartográfica</dt>
                    <dd>
                      {lugar.camadaLocal.referenciaCartografica.rotulo} —
                      referência territorial próxima; não representa o lugar
                      visitado.
                    </dd>
                  </div>
                ) : null}
                {lugar.comoChegar?.referencia != null ? (
                  <div>
                    <dt className="fonte">Referência de acesso</dt>
                    <dd>{lugar.comoChegar.referencia.texto}</dd>
                  </div>
                ) : null}
              </dl>
              {posicao !== null ? (
                <div className="rota">
                  <ul>
                    {destinosDeRota(posicao).map((destino) => (
                      <li key={destino.servico}>
                        <a
                          className="rota__link"
                          href={destino.href}
                          referrerPolicy="no-referrer"
                          rel="noopener noreferrer external"
                          target="_blank"
                        >
                          {destino.servico}
                        </a>
                      </li>
                    ))}
                  </ul>
                  <p className="fonte">
                    Consulta externa opcional. Nenhum serviço de mapas é
                    carregado antes do clique.
                  </p>
                </div>
              ) : (
                <p className="fonte">
                  Rota externa indisponível para este lugar.
                </p>
              )}
            </section>
          ) : null}
        </aside>
      </div>

      <a className="tv__voltar" data-tv-voltar="" href="#tv-painel-vale">
        ← Voltar à visão do território
      </a>
    </section>
  );
}
