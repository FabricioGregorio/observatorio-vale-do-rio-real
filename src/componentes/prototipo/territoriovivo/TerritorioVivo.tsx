import { montarDadosDoMapa } from "../../../dados/territorio/mapa";
import {
  DEFINICAO_VALE_DO_RIO_REAL,
  RECORTE_TERRITORIAL,
} from "../../../dados/territorio/recorte";
import { CSS_DO_TERRITORIO_VIVO } from "./estilos";
import {
  aplicar,
  barraDeEscala,
  caixaDoCaminho,
  enquadrar,
  expandir,
  kmPorUnidade,
  seCruzam,
  unirCaixas,
} from "./geometria";
import { InteracaoTerritorioVivo } from "./InteracaoTerritorioVivo";
import {
  LUGARES_DE_CAMPO,
  type LugarDeCampo,
  ROTULO_DO_ESTADO,
} from "./lugares";

/**
 * Cartografia Viva — laboratório da experiência territorial.
 *
 * Server Component. A malha, a projeção e o recorte são os mesmos da
 * cartografia pública (`montarDadosDoMapa`); o que muda é o papel: o mapa
 * deixa de ilustrar municípios e passa a ser a interface espacial dos lugares
 * da pesquisa.
 *
 * ## Estados
 *
 * - `vale` — visão geral dos cinco municípios do recorte;
 * - `<código IBGE>` — aproximação do município de um lugar selecionado;
 * - `sem-local` — lugar sem localização publicada: o mapa não finge saber.
 *
 * Os enquadramentos são calculados aqui, em tempo de build, e entram como CSS.
 * A ilha cliente só troca atributos na raiz.
 *
 * ## O que o mapa NÃO afirma
 *
 * Nenhum lugar tem coordenada publicada. A marca numérica fica no **município**
 * e diz quantos lugares de campo ele reúne; a posição exata é declarada como
 * não confirmada no próprio desenho.
 */

const ID_RAIZ = "territorio-vivo";
const FOCO_GERAL = "vale";
const SEM_LOCAL = "sem-local";

export function TerritorioVivo() {
  const dados = montarDadosDoMapa();
  const caixas = new Map(
    dados.municipios.map((m) => [m.codigoIbge, caixaDoCaminho(m.caminho)]),
  );
  const caixaDe = (codigo: string) => {
    const caixa = caixas.get(codigo);
    if (caixa === undefined) throw new Error(`Município sem caixa: ${codigo}`);
    return caixa;
  };
  const nomeDe = (codigo: string | null) =>
    codigo === null
      ? null
      : (dados.municipios.find((m) => m.codigoIbge === codigo)?.nome ?? null);

  const doVale = dados.municipios.filter((m) =>
    m.relacoesTerritoriais.includes("vale-rio-real"),
  );
  const vista = expandir(
    unirCaixas(doVale.map((m) => caixaDe(m.codigoIbge))),
    0.08,
  );
  const vw = vista.x1 - vista.x0;
  const vh = vista.y1 - vista.y0;
  const visiveis = dados.municipios.filter((m) =>
    seCruzam(caixaDe(m.codigoIbge), vista),
  );

  const lugaresPorMunicipio = new Map<string, LugarDeCampo[]>();
  for (const lugar of LUGARES_DE_CAMPO) {
    if (lugar.municipioId === null) continue;
    const lista = lugaresPorMunicipio.get(lugar.municipioId) ?? [];
    lista.push(lugar);
    lugaresPorMunicipio.set(lugar.municipioId, lista);
  }
  /*
    Enquadramento de aproximação: uma janela centrada no rótulo do município,
    com lado proporcional à maior dimensão dele. Enquadrar o município inteiro
    quase não aproximava — Tobias Barreto ocupa boa parte do recorte — e a
    mudança de estado não se lia como mudança de escala.
  */
  const focos = [...lugaresPorMunicipio.keys()].map((codigo) => {
    const c = caixaDe(codigo);
    const meio = Math.max(c.x1 - c.x0, c.y1 - c.y0) * 0.36;
    const janela = {
      x0: c.cx - meio,
      y0: c.cy - meio,
      x1: c.cx + meio,
      y1: c.cy + meio,
    };
    return { codigo, e: enquadrar(janela, vista) };
  });

  const kmU = kmPorUnidade(dados.projecao);
  const fs = vw * 0.028;
  const raio = vw * 0.024;
  const escalaGeral = barraDeEscala(kmU, 1, vw * 0.22);

  function estadosDoRotulo(codigo: string, doRecorte: boolean): string {
    const estados: string[] = doRecorte ? [FOCO_GERAL, SEM_LOCAL] : [];
    const c = caixaDe(codigo);
    for (const foco of focos) {
      const [x, y] = aplicar(foco.e, c.cx, c.cy);
      const dentro =
        x > vista.x0 + vw * 0.08 &&
        x < vista.x1 - vw * 0.08 &&
        y > vista.y0 + vh * 0.08 &&
        y < vista.y1 - vh * 0.1;
      if (dentro) estados.push(foco.codigo);
    }
    return estados.join(" ");
  }

  const cssDosEstados = [
    ".tv{--tv-tx:0px;--tv-ty:0px;--tv-s:1}",
    `.tv[data-foco="${FOCO_GERAL}"] .tv-rot[data-estados~="${FOCO_GERAL}"],.tv[data-foco="${SEM_LOCAL}"] .tv-rot[data-estados~="${SEM_LOCAL}"]{opacity:1}`,
    `.tv[data-foco="${FOCO_GERAL}"] .escala[data-foco="${FOCO_GERAL}"],.tv[data-foco="${SEM_LOCAL}"] .escala[data-foco="${FOCO_GERAL}"]{opacity:1}`,
    `.tv[data-foco="${SEM_LOCAL}"] .tv-semlocal{opacity:1}`,
    `.tv[data-foco="${SEM_LOCAL}"] .m,.tv[data-foco="${SEM_LOCAL}"] .h{opacity:.5}`,
    ...focos.map(({ codigo, e }) =>
      [
        `.tv[data-foco="${codigo}"]{--tv-tx:${e.tx.toFixed(2)}px;--tv-ty:${e.ty.toFixed(2)}px;--tv-s:${e.s.toFixed(4)}}`,
        `.tv[data-foco="${codigo}"] .m:not([data-codigo="${codigo}"]),.tv[data-foco="${codigo}"] .h:not([data-codigo="${codigo}"]){opacity:.42}`,
        `.tv[data-foco="${codigo}"] .anel[data-codigo="${codigo}"],.tv[data-foco="${codigo}"] .tv-marca[data-codigo="${codigo}"] .anel-marca{opacity:1}`,
        `.tv[data-foco="${codigo}"] .tv-marca[data-codigo="${codigo}"] circle.base{fill:var(--tv-pin-selecionado);stroke:var(--tv-contorno-foco)}`,
        `.tv[data-foco="${codigo}"] .tv-marca[data-codigo="${codigo}"] text.n{fill:var(--tv-pin-selecionado-texto)}`,
        `.tv[data-foco="${codigo}"] .tv-chips[data-codigo="${codigo}"]{opacity:1;pointer-events:auto}`,
        `.tv[data-foco="${codigo}"] .tv-rot[data-estados~="${codigo}"]{opacity:1}`,
        `.tv[data-foco="${codigo}"] .escala[data-foco="${codigo}"]{opacity:1}`,
      ].join(""),
    ),
    ...LUGARES_DE_CAMPO.map(
      (l) =>
        `.tv[data-lugar="${l.id}"] .tv-chip[data-tv-chip="${l.id}"] rect{fill:var(--tv-pin-selecionado);stroke:var(--tv-contorno-foco);stroke-width:${(raio * 0.12).toFixed(2)}}.tv[data-lugar="${l.id}"] .tv-chip[data-tv-chip="${l.id}"] text{fill:var(--tv-pin-selecionado-texto)}.tv[data-lugar="${l.id}"] .tv-chip[data-tv-chip="${l.id}"] .sel{fill-opacity:1}`,
    ),
    `.tv-contra{transform:scale(calc(1 / var(--tv-s)));transition:transform var(--tv-duracao) var(--easing-padrao)}`,
    ".tv-chip .sel{fill-opacity:0}",
  ].join("\n");

  const tituloGeral = `Mapa do Vale do Rio Real: ${doVale.length} municípios do recorte. ${[
    ...lugaresPorMunicipio,
  ]
    .map(
      ([codigo, lugares]) =>
        `${nomeDe(codigo)} reúne ${lugares.length} lugares visitados em campo`,
    )
    .join("; ")}. Posição exata dos lugares não confirmada.`;

  const campoNoVale = doVale.filter((m) =>
    m.relacoesTerritoriais.includes("pesquisa-campo"),
  );
  const comparacao = RECORTE_TERRITORIAL.filter((m) =>
    m.relacoesTerritoriais.includes("comparacao"),
  );

  return (
    <div
      className="tv"
      data-foco={FOCO_GERAL}
      data-lugar={FOCO_GERAL}
      id={ID_RAIZ}
    >
      <style>{CSS_DO_TERRITORIO_VIVO}</style>
      <style>{cssDosEstados}</style>

      <p className="tv-dev">
        Laboratório · /dev/territorio-vivo · somente DEV · candidata à futura
        /territorio · não publicar
      </p>

      <div className="tv__cab">
        <p className="meta-ficha">Território</p>
        <h1>Cartografia viva do Vale do Rio Real</h1>
        <p>
          Os lugares visitados pela pesquisa e o que existe publicado sobre cada
          um.
        </p>
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
                {focos.map(({ codigo }) => (
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
                  const temMarca = lugaresPorMunicipio.has(m.codigoIbge);
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
                          y={temMarca ? -raio * 1.55 : fs * 0.35}
                        >
                          {m.nome}
                        </text>
                      </g>
                    </g>
                  );
                })}

                {[...lugaresPorMunicipio].map(([codigo, lugares]) => {
                  const c = caixaDe(codigo);
                  const alturaChip = fs * 1.75;
                  return (
                    <g
                      className="tv-marca"
                      data-codigo={codigo}
                      key={`marca-${codigo}`}
                      transform={`translate(${c.cx.toFixed(1)} ${c.cy.toFixed(1)})`}
                    >
                      <g className="tv-contra">
                        <circle
                          className="anel-marca"
                          r={raio * 1.45}
                          strokeWidth={raio * 0.1}
                        />
                        <circle
                          className="base"
                          r={raio}
                          strokeWidth={raio * 0.14}
                        />
                        <text
                          className="n"
                          dominantBaseline="central"
                          fontSize={raio * 1.15}
                          textAnchor="middle"
                        >
                          {lugares.length}
                        </text>
                        <g className="tv-chips" data-codigo={codigo}>
                          {lugares.map((lugar, i) => {
                            const largura =
                              (lugar.nome.length + 2) * fs * 0.56 + fs * 1.2;
                            const y = raio * 1.9 + i * (alturaChip + fs * 0.35);
                            return (
                              <g
                                className="tv-chip"
                                data-tv-chip={lugar.id}
                                key={lugar.id}
                                transform={`translate(${(-largura / 2).toFixed(1)} ${y.toFixed(1)})`}
                              >
                                <rect
                                  height={alturaChip}
                                  rx={fs * 0.2}
                                  strokeWidth={raio * 0.07}
                                  width={largura}
                                />
                                <text
                                  dominantBaseline="central"
                                  fontSize={fs}
                                  x={fs * 0.6}
                                  y={alturaChip / 2}
                                >
                                  <tspan className="sel">▸ </tspan>
                                  {lugar.nome}
                                </text>
                              </g>
                            );
                          })}
                          <text
                            className="nota"
                            fontSize={fs * 0.72}
                            textAnchor="middle"
                            y={
                              raio * 1.9 +
                              lugares.length * (alturaChip + fs * 0.35) +
                              fs * 0.7
                            }
                          >
                            posição no município não confirmada
                          </text>
                        </g>
                      </g>
                    </g>
                  );
                })}
              </g>

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
                {[
                  { foco: FOCO_GERAL, barra: escalaGeral },
                  ...focos.map(({ codigo, e }) => ({
                    foco: codigo,
                    barra: barraDeEscala(kmU, e.s, vw * 0.22),
                  })),
                ].map(({ foco, barra }) => {
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
                    Sem localização publicada
                  </text>
                  <text fontSize={fs * 0.75} x={fs * 0.7} y={fs * 2.55}>
                    O mapa não posiciona este lugar.
                  </text>
                </g>
              </g>
            </svg>
          </div>

          <figcaption className="tv__nota">
            Malha municipal IBGE; recorte do Vale definido pelo projeto. O mapa
            marca municípios, não pontos: nenhum lugar tem coordenada publicada.
          </figcaption>
          <ul aria-label="Legenda do mapa" className="tv__legenda">
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
              <span
                aria-hidden="true"
                className="tv__amostra tv__amostra--marca"
              />
              Nº de lugares visitados no município
            </li>
          </ul>
        </figure>

        <nav aria-labelledby="tv-lista-titulo" className="tv__lista">
          <h2 id="tv-lista-titulo">Lugares</h2>
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
            {LUGARES_DE_CAMPO.map((lugar) => {
              const municipio = nomeDe(lugar.municipioId);
              const foco = lugar.municipioId ?? SEM_LOCAL;
              const rotulo =
                municipio === null
                  ? `Mapa do Vale do Rio Real. ${lugar.nome} ainda não tem localização publicada.`
                  : `Mapa aproximado no município de ${municipio}, onde fica ${lugar.nome}. Posição exata não confirmada.`;
              const anuncio =
                municipio === null
                  ? `${lugar.nome} selecionado. Este lugar ainda não tem localização publicada.`
                  : `${lugar.nome} selecionado. O mapa aproxima o município de ${municipio}.`;
              return (
                <li key={lugar.id}>
                  <a
                    data-tv-aba={lugar.id}
                    data-tv-anuncio={anuncio}
                    data-tv-foco={foco}
                    data-tv-rotulo-mapa={rotulo}
                    href={`#tv-painel-${lugar.id}`}
                  >
                    <span className="nome">{lugar.nome}</span>
                    <span className="meta">
                      {municipio ?? "Município não publicado"}
                    </span>
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
            <p>{DEFINICAO_VALE_DO_RIO_REAL}</p>
            <section>
              <h3>Recorte</h3>
              <p>{doVale.map((m) => m.nome).join(", ")}.</p>
              <p className="fonte">
                Pesquisa de campo registrada em{" "}
                {campoNoVale.map((m) => m.nome).join(" e ")}.
              </p>
            </section>
            <section>
              <h3>Lugares visitados em campo</h3>
              <p>
                {LUGARES_DE_CAMPO.length} lugares:{" "}
                {LUGARES_DE_CAMPO.map((l) => l.nome).join(", ")}.
              </p>
            </section>
            <section>
              <h3>Fora desta vista</h3>
              <ul>
                {comparacao.map((m) => (
                  <li key={m.codigoIbge}>
                    {m.nome} — pesquisa de campo e comparação de políticas
                    públicas; não pertence ao recorte do Vale.
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h3>Evidências de pesquisa declaradas por município</h3>
              <ul>
                {RECORTE_TERRITORIAL.filter(
                  (m) => m.evidenciasDePesquisa.length > 0,
                ).map((m) => (
                  <li key={m.codigoIbge}>
                    <strong>{m.nome}:</strong>{" "}
                    {m.evidenciasDePesquisa.join("; ")}
                  </li>
                ))}
              </ul>
            </section>
          </section>

          {LUGARES_DE_CAMPO.map((lugar) => (
            <FichaDoLugar
              key={lugar.id}
              lugar={lugar}
              municipio={nomeDe(lugar.municipioId)}
            />
          ))}
        </div>
      </div>

      <InteracaoTerritorioVivo idRaiz={ID_RAIZ} />
    </div>
  );
}

function FichaDoLugar({
  lugar,
  municipio,
}: {
  lugar: LugarDeCampo;
  municipio: string | null;
}) {
  const idTitulo = `tv-painel-${lugar.id}-titulo`;
  const contagem = lugar.materiais.reduce<Record<string, number>>((acc, m) => {
    acc[m.estado] = (acc[m.estado] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <section
      aria-labelledby={idTitulo}
      data-tv-painel=""
      id={`tv-painel-${lugar.id}`}
    >
      <p className="meta-ficha">
        {[lugar.tipo?.texto, municipio].filter(Boolean).join(" · ") ||
          "Lugar visitado em campo"}
      </p>
      <h2 id={idTitulo}>{lugar.nome}</h2>
      {lugar.nomeCompleto !== null && lugar.nomeCompleto !== lugar.nome ? (
        <p className="fonte">{lugar.nomeCompleto}</p>
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

      <section>
        <h3>Relação com a pesquisa</h3>
        <p>Lugar visitado em campo.</p>
        <ul className="materiais">
          {lugar.materiais.map((m) => (
            <li key={m.material}>
              <span>
                {m.href !== null ? (
                  <a href={m.href}>{m.material}</a>
                ) : (
                  m.material
                )}
              </span>
              <span className="estado" data-estado={m.estado}>
                {ROTULO_DO_ESTADO[m.estado]}
              </span>
            </li>
          ))}
        </ul>
        <p className="fonte">
          Status documental:{" "}
          {Object.entries(contagem)
            .map(
              ([estado, n]) =>
                `${n} ${ROTULO_DO_ESTADO[estado as keyof typeof ROTULO_DO_ESTADO].toLowerCase()}`,
            )
            .join(" · ")}
        </p>
      </section>

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
                  {foto.pendencia !== null ? (
                    <span className="pendencia">{foto.pendencia}</span>
                  ) : null}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      {lugar.comoChegar !== null ? (
        <section>
          <h3>Como chegar</h3>
          <dl className="chegar">
            {lugar.localidade !== null ? (
              <div>
                <dt className="fonte">Localidade</dt>
                <dd>
                  {lugar.localidade.texto}
                  {municipio !== null ? `, ${municipio} (SE)` : ""}
                </dd>
              </div>
            ) : null}
            {lugar.comoChegar.referencia !== null ? (
              <div>
                <dt className="fonte">Referência de acesso</dt>
                <dd>{lugar.comoChegar.referencia.texto}</dd>
              </div>
            ) : null}
            <div>
              <dt className="fonte">Rota externa</dt>
              <dd>
                Indisponível: a coordenada deste lugar ainda não foi confirmada.
              </dd>
            </div>
          </dl>
          <p className="fonte">
            Fonte:{" "}
            {lugar.localidade?.fonte ?? lugar.comoChegar.referencia?.fonte}
          </p>
        </section>
      ) : null}
    </section>
  );
}
