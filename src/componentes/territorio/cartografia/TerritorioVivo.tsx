import type { ArquivosPublicados } from "../../../dados/materiais-de-campo";
import { DEFINICAO_VALE_DO_RIO_REAL } from "../../../dados/territorio/recorte";
import { caminhoDoPin } from "../../mapa/caminhoDoPin";
import { CSS_DO_TERRITORIO_VIVO } from "./estilos";
import {
  aplicar,
  barraDeEscala,
  compor,
  type Enquadramento,
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
 */

const ID_RAIZ = "territorio-vivo";
const FOCO_GERAL = "vale";
const SEM_LOCAL = "sem-local";
const IDENTIDADE: Enquadramento = { s: 1, tx: 0, ty: 0 };

const focoDoLugar = (id: string) => `lugar-${id}`;
const urlDaCamada = (base: string, id: string) => `${base}/${id}`;
const px = (n: number) => `${n.toFixed(2)}px`;
const transformacao = (e: Enquadramento) =>
  `translate(${px(e.tx)},${px(e.ty)}) scale(${e.s.toFixed(4)})`;
const varsDoMundo = (e: Enquadramento) =>
  `--tv-tx:${px(e.tx)};--tv-ty:${px(e.ty)};--tv-s:${e.s.toFixed(4)}`;

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

  const porMunicipio = new Map<string, LugarNoMapa[]>();
  for (const lugar of lugares) {
    if (lugar.municipioId === null) continue;
    const lista = porMunicipio.get(lugar.municipioId) ?? [];
    lista.push(lugar);
    porMunicipio.set(lugar.municipioId, lista);
  }

  function estadosDoRotulo(codigo: string, doRecorte: boolean): string {
    const estados: string[] = doRecorte ? [FOCO_GERAL, SEM_LOCAL] : [];
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
    ".tv{--tv-tx:0px;--tv-ty:0px;--tv-s:1}",
    `.tv[data-foco="${FOCO_GERAL}"] .tv-rot[data-estados~="${FOCO_GERAL}"],.tv[data-foco="${SEM_LOCAL}"] .tv-rot[data-estados~="${SEM_LOCAL}"]{opacity:1}`,
    `.tv[data-foco="${FOCO_GERAL}"] .escala[data-foco="${FOCO_GERAL}"],.tv[data-foco="${SEM_LOCAL}"] .escala[data-foco="${FOCO_GERAL}"]{opacity:1}`,
    `.tv[data-foco="${SEM_LOCAL}"] .tv-semlocal{opacity:1}`,
    `.tv[data-foco="${SEM_LOCAL}"] .m,.tv[data-foco="${SEM_LOCAL}"] .h{opacity:.5}`,
  ];
  for (const l of posicionados) {
    const foco = focoDoLugar(l.id);
    const noFoco = `.tv[data-foco="${foco}"]`;
    const pinSelecionado = `.tv[data-lugar="${l.id}"] .tv-pin[data-pin="${l.id}"]`;
    css.push(
      `${noFoco}{${varsDoMundo(l.regional)}}`,
      `${noFoco} .tv-rot[data-estados~="${foco}"]{opacity:1}`,
      `${noFoco}:not([data-escala="local"]) .escala[data-foco="${foco}"]{opacity:1}`,
      `${noFoco} .tv-pin .nome{opacity:1}`,
      `${pinSelecionado}{--tv-pin-escala:1.4}`,
      `${pinSelecionado} .forma{fill:var(--tv-pin-selecionado);stroke:var(--tv-contorno-foco);stroke-width:2.5px}`,
      `${pinSelecionado} .miolo{fill:var(--tv-contorno-foco)}`,
      `${pinSelecionado} .nome{opacity:1;font-weight:700}`,
      `${pinSelecionado} .sel{display:inline}`,
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
        `${local} .escala[data-foco="local-${l.id}"]{opacity:1}`,
      );
    }
  }
  css.push(
    ".tv-contra{transform:scale(calc(1 / var(--tv-s)));transition:transform var(--tv-duracao) var(--easing-padrao)}",
    ".tv-pin .tv-contra{transform:scale(calc(var(--tv-pin-escala, 1) / var(--tv-s)))}",
  );

  const tituloGeral =
    posicionados.length === 0
      ? `Mapa do Vale do Rio Real: ${doVale.length} municípios do recorte. Nenhum lugar posicionado: sem coordenadas confirmadas disponíveis.`
      : `Mapa do Vale do Rio Real: ${doVale.length} municípios do recorte e ${noVale.length} lugares de campo nas posições confirmadas.${
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
              foco: `local-${l.id}`,
              barra: barraDeEscala(kmU, l.local.enquadramento.s, vw * 0.22),
            },
          ],
    ),
  ];

  return (
    <div
      className="tv"
      data-foco={FOCO_GERAL}
      data-lugar={FOCO_GERAL}
      data-tv-coordenadas={posicionados.length > 0 ? "confirmadas" : "ausentes"}
      id={ID_RAIZ}
    >
      <style>{CSS_DO_TERRITORIO_VIVO}</style>
      <style>{css.join("\n")}</style>

      <div className="tv__cab">
        <p className="meta-ficha">Território da pesquisa</p>
        <h1>Cartografia Viva</h1>
        {/* Proposta editorial — aguarda aprovação humana para integração. */}
        <p className="tv__abertura" data-copy-editorial="proposta">
          Uma leitura espacial dos lugares, equipamentos e evidências que
          fizeram parte da pesquisa do Observatório.
        </p>
        <p className="tv__instrucao" data-copy-editorial="proposta">
          Escolha um lugar para aproximar o mapa e consultar seus registros
          públicos.
        </p>
        <div className="tv__contexto" data-copy-editorial="proposta">
          <p>
            <strong>Cinco municípios</strong> formam o recorte do Vale do Rio
            Real.
          </p>
          <p>
            <strong>Ilha Grande</strong> integra a pesquisa em São Cristóvão,
            fora desse recorte.
          </p>
        </div>
      </div>

      <p aria-live="polite" className="sr-only" data-tv-regiao-anuncio="" />

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

              <g className="tv-mundo">
                {visiveis.map((m) => (
                  <path
                    className={
                      m.relacoesTerritoriais.includes("vale-rio-real")
                        ? "m v"
                        : "m"
                    }
                    d={m.caminho}
                    data-codigo={m.codigoIbge}
                    key={m.codigoIbge}
                  />
                ))}
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
                  <path
                    d={`M0 ${fs * 1.6} L0 0 M${-fs * 0.4} ${fs * 0.5} L0 0 L${fs * 0.4} ${fs * 0.5}`}
                    strokeWidth={fs * 0.12}
                  />
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
                      <path
                        d={`M${x} ${y - fs * 0.35} L${x} ${y} L${x + barra.unidades} ${y} L${x + barra.unidades} ${y - fs * 0.35}`}
                        strokeWidth={fs * 0.1}
                      />
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

          <figcaption className="tv__nota tv__nota--geral">
            Base cartográfica: IBGE. Os pins usam coordenadas confirmadas em
            campo. Ilha Grande aparece ao selecionar o lugar, pois está fora do
            enquadramento do Vale.
          </figcaption>
          <p className="tv__nota tv__nota--local">
            Base cartográfica: IBGE + OpenStreetMap. Vias e cursos d'água:{" "}
            <a href="https://www.openstreetmap.org/copyright">
              {FONTES_DAS_CAMADAS.vias}
            </a>
            . O pin mantém a coordenada humana confirmada.
          </p>
          <ul
            aria-label="Legenda do mapa"
            className="tv__legenda tv__legenda--geral"
          >
            <li>
              <span aria-hidden="true" className="tv__amostra" />
              Recorte do Vale
            </li>
            <li>
              <span
                aria-hidden="true"
                className="tv__amostra tv__amostra--campo"
              />
              Pesquisa de campo no município
            </li>
            <li>
              <span aria-hidden="true" className="tv__amostra--pin" />
              Lugar da pesquisa (posição confirmada)
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
        </figure>

        <nav aria-labelledby="tv-lista-titulo" className="tv__lista">
          <div className="tv__lista-cab">
            <p className="meta-ficha">Percurso</p>
            <h2 id="tv-lista-titulo">Explore os lugares</h2>
            <p data-copy-editorial="proposta">
              Veja o território inteiro ou escolha um ponto da pesquisa.
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
                <span className="meta">Visão geral</span>
              </a>
            </li>
            {lugares.map((lugar) => {
              const municipio = nomeDe(lugar.municipioId);
              const p = estaPosicionado(lugar) ? lugar : null;
              const fora = p !== null && !p.dentroDoVale;
              const rotulo =
                p === null
                  ? `Mapa do Vale do Rio Real. ${lugar.nome} não está posicionado: sem coordenada confirmada disponível.`
                  : `Mapa aproximado na posição confirmada de ${lugar.nome}${municipio !== null ? `, em ${municipio}` : ""}${fora ? ", fora do recorte do Vale" : ""}.`;
              const rotuloLocal =
                p === null || p.local === null
                  ? undefined
                  : lugar.camadaLocal?.localidadeIbge !== null &&
                      lugar.localidade !== null &&
                      municipio !== null
                    ? `Mapa detalhado do entorno do ${lugar.localidade.texto}, em ${municipio}: pin de ${lugar.nome} na posição confirmada e, com outro símbolo, a localidade segundo o IBGE. Vias e cursos d'água do OpenStreetMap; localidades do IBGE.`
                    : lugar.camadaLocal?.referenciaCartografica != null
                      ? `Mapa detalhado do entorno de ${lugar.nome}: pin na posição confirmada da comunidade visitada. ${lugar.camadaLocal.referenciaCartografica.rotulo} aparece apenas como referência cartográfica próxima e não representa o lugar visitado. Vias e cursos d'água do OpenStreetMap; localidades do IBGE.`
                      : `Mapa detalhado do entorno de ${lugar.nome}, com o pin na posição confirmada. Vias e cursos d'água do OpenStreetMap; localidades do IBGE.`;
              const anuncio =
                p === null
                  ? `${lugar.nome} selecionado. Este lugar não está posicionado no mapa.`
                  : `${lugar.nome} selecionado. O mapa se desloca até a posição confirmada${fora ? ", fora do recorte do Vale" : ""}.`;
              const meta = [
                municipio ?? "Município não publicado",
                fora ? "fora do recorte do Vale" : null,
              ]
                .filter(Boolean)
                .join(" · ");
              return (
                <li key={lugar.id}>
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
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="tv__paineis">
          <section
            aria-labelledby="tv-painel-vale-titulo"
            data-tv-painel=""
            id={`tv-painel-${FOCO_GERAL}`}
          >
            <p className="meta-ficha">Visão geral</p>
            <h2 id="tv-painel-vale-titulo">Vale do Rio Real</h2>
            <p className="tv__resumo">{DEFINICAO_VALE_DO_RIO_REAL}</p>
            <section>
              <h3>O recorte</h3>
              <p>{doVale.map((m) => m.nome).join(", ")}.</p>
            </section>
            <section>
              <h3>A pesquisa no território</h3>
              <p>
                Os quatro lugares desta cartografia podem ser explorados
                individualmente. Três estão em Tobias Barreto, dentro do recorte
                principal.
              </p>
            </section>
            <section>
              <h3>Ilha Grande</h3>
              <p>
                Faz parte da pesquisa e está em São Cristóvão. Sua presença
                amplia a leitura documental, sem incluir São Cristóvão entre os
                cinco municípios do Vale.
              </p>
            </section>
          </section>

          {lugares.map((lugar) => (
            <FichaDoLugar
              key={lugar.id}
              lugar={lugar}
              municipio={nomeDe(lugar.municipioId)}
            />
          ))}
        </div>
      </div>

      <section className="tv__fecho" data-copy-editorial="proposta">
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

function FichaDoLugar({
  lugar,
  municipio,
}: {
  lugar: LugarNoMapa;
  municipio: string | null;
}) {
  const idTitulo = `tv-painel-${lugar.id}-titulo`;
  const materiaisPublicos = lugar.materiais.filter(
    (material) => material.estado === "publico",
  );
  const posicao = lugar.posicao;
  const temComoChegar = lugar.comoChegar !== null || posicao !== null;

  return (
    <section
      aria-labelledby={idTitulo}
      data-tv-painel=""
      id={`tv-painel-${lugar.id}`}
    >
      <p className="meta-ficha">
        {["Lugar visitado", municipio].filter(Boolean).join(" · ")}
      </p>
      <h2 id={idTitulo}>{lugar.nome}</h2>
      {lugar.nomeCompleto !== null && lugar.nomeCompleto !== lugar.nome ? (
        <p className="tv__subtitulo">{lugar.nomeCompleto}</p>
      ) : null}

      {lugar.localidade !== null ? (
        <div className="tv__identificacao">
          <p className="fonte">Localização</p>
          <p>
            <strong>{lugar.localidade.texto}</strong>
            {municipio !== null ? ` · ${municipio} (SE)` : ""}
          </p>
          <p className="tv__vinculo">
            Lugar visitado em campo
            {lugar.dentroDoVale ? "." : "; fora do recorte principal do Vale."}
          </p>
        </div>
      ) : null}

      {lugar.lacunaDeLocalizacao !== null ? (
        <p className="lacuna">{lugar.lacunaDeLocalizacao}</p>
      ) : null}

      {lugar.descricao !== null ? (
        <section>
          <p>{lugar.descricao.texto}</p>
          <p className="fonte">Fonte: {lugar.descricao.fonte}</p>
        </section>
      ) : null}

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
          <p className="fonte">Fonte: {lugar.dados[0]?.fonte}</p>
        </section>
      ) : null}

      {lugar.fotos.length > 0 ? (
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
      ) : null}

      {temComoChegar ? (
        <section className="tv__acesso">
          <h3>Como chegar</h3>
          {lugar.localidade !== null || lugar.comoChegar?.referencia != null ? (
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
          ) : null}
          {posicao !== null ? (
            <div className="rota">
              <p className="fonte">
                Consulta externa opcional. Nenhum serviço de mapas é carregado
                antes do clique.
              </p>
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
            </div>
          ) : (
            <p>
              Rota externa indisponível: não há destino geográfico confirmado.
            </p>
          )}
        </section>
      ) : null}

      <a className="tv__voltar" data-tv-voltar="" href="#tv-painel-vale">
        ← Voltar à visão do território
      </a>
    </section>
  );
}
