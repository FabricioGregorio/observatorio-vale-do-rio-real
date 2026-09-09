import type { DadosDoMapa } from "../../../dados/territorio/mapa";
import { DEFINICAO_VALE_DO_RIO_REAL } from "../../../dados/territorio/recorte";
import {
  CLASSE_RAIZ,
  CSS_DO_MAPA,
  classesDoMunicipio,
  temHachura,
} from "../../mapa/estilosDoMapa";
import {
  nomeAcessivelDoMunicipio,
  rotulosDasRelacoes,
} from "../../mapa/identificacao";
import { MapaInterativo } from "../../mapa/MapaInterativo";
import { MarcadorNoMapa } from "../../mapa/MarcadorNoMapa";
import { CSS_DO_TERRITORIO_PROTOTIPO } from "./estilosDoTerritorio";

export type ProfundidadeDoTerritorio = "minima" | "moderada";

const ROTULO_DO_PRESET: Readonly<Record<ProfundidadeDoTerritorio, string>> = {
  minima: "A — profundidade mínima",
  moderada: "B — profundidade moderada",
};

function MunicipioNoPrototipo({
  municipio,
  idDaHachura,
}: {
  municipio: DadosDoMapa["municipios"][number];
  idDaHachura: string;
}) {
  return (
    <g>
      <title>{municipio.nome}</title>
      <path
        aria-label={nomeAcessivelDoMunicipio(municipio)}
        className={classesDoMunicipio(municipio.relacoesTerritoriais)}
        d={municipio.caminho}
        data-codigo={municipio.codigoIbge}
      />
      {temHachura(municipio.relacoesTerritoriais) ? (
        <path
          className="h"
          d={municipio.caminho}
          style={{ fill: `url(#${idDaHachura})` }}
        />
      ) : null}
    </g>
  );
}

function PainelContextual({ id }: { id: string }) {
  return (
    <section
      aria-atomic="true"
      aria-live="polite"
      className="territorio-prototipo__painel"
      id={id}
    >
      <p className="meta-ficha">Leitura do território</p>

      <div data-painel-vazio="">
        <p>
          Selecione um município no mapa ou no índice para consultar as relações
          declaradas com o projeto.
        </p>
      </div>

      <div data-painel-conteudo="" hidden>
        <h3 className="text-xl" data-painel-nome="">
          Município selecionado
        </h3>
        <dl>
          <div>
            <dt className="meta-ficha">Classificação</dt>
            <dd data-painel-classificacao="" />
          </div>
          <div>
            <dt className="meta-ficha">Evidências</dt>
            <dd>
              <ul data-painel-evidencias="" />
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

function IndiceTerritorial({
  dados,
  idDaLista,
  idDoTitulo,
}: {
  dados: DadosDoMapa;
  idDaLista: string;
  idDoTitulo: string;
}) {
  return (
    <details className="territorio-prototipo__indice" open>
      <summary id={idDoTitulo}>
        Índice acessível — {dados.municipios.length} municípios
      </summary>
      <p>
        Com JavaScript, use as setas para percorrer o índice e Enter ou Espaço
        para selecionar. Sem JavaScript, a lista completa continua disponível.
      </p>
      <ul
        aria-labelledby={idDoTitulo}
        className="territorio-prototipo__lista"
        id={idDaLista}
      >
        {dados.municipios.map((municipio) => {
          const rotulos = rotulosDasRelacoes(municipio.relacoesTerritoriais);
          const classificacao =
            rotulos.length === 0
              ? "Sem vínculo declarado"
              : rotulos.join(" · ");

          return (
            <li
              className="territorio-prototipo__item"
              data-classificacao={classificacao}
              data-codigo={municipio.codigoIbge}
              data-nome={municipio.nome}
              key={municipio.codigoIbge}
            >
              <span className="font-semibold">{municipio.nome}</span>
              <span className="meta-ficha">{classificacao}</span>
              {municipio.evidenciasDePesquisa.length === 0 ? null : (
                <ul className="sr-only">
                  {municipio.evidenciasDePesquisa.map((evidencia) => (
                    <li data-evidencia="" key={evidencia}>
                      {evidencia}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </details>
  );
}

/**
 * Seção cartográfica completa da H2, ainda restrita ao laboratório DEV.
 *
 * A geometria, o recorte e a projeção continuam no servidor. Esta composição
 * reaproveita a mesma ilha leve do mapa público e só habilita, por opção, a
 * promoção do índice textual para uma segunda listbox sincronizada.
 */
export function TerritorioPrototipo({
  dados,
  profundidade,
}: {
  dados: DadosDoMapa;
  profundidade: ProfundidadeDoTerritorio;
}) {
  if (dados.municipios.length === 0) return null;

  const prefixo = `territorio-${profundidade}`;
  const idDoTitulo = `${prefixo}-titulo`;
  const idDoSvg = `${prefixo}-svg`;
  const idDaHachura = `${prefixo}-hachura-pesquisa`;
  const idDaLista = `${prefixo}-lista`;
  const idDoTituloDaLista = `${prefixo}-lista-titulo`;
  const idDoPainel = `${prefixo}-painel`;
  const doVale = dados.municipios.filter((municipio) =>
    municipio.relacoesTerritoriais.includes("vale-rio-real"),
  );

  return (
    <section
      aria-labelledby={idDoTitulo}
      className={`${CLASSE_RAIZ} territorio-prototipo`}
      data-profundidade={profundidade}
      data-testid={`preset-${profundidade}`}
      id={prefixo}
    >
      <style>{`${CSS_DO_MAPA}\n${CSS_DO_TERRITORIO_PROTOTIPO}`}</style>

      <header className="territorio-prototipo__cabecalho">
        <p className="meta-ficha">01 — TERRITÓRIO</p>
        <h2 className="text-3xl" id={idDoTitulo}>
          Cartografia viva do Vale do Rio Real
        </h2>
        <p className="meta-ficha">Preset {ROTULO_DO_PRESET[profundidade]}</p>
      </header>

      <div className="territorio-prototipo__grade">
        <figure className="territorio-prototipo__mapa">
          <div className="territorio-prototipo__moldura">
            <svg
              aria-label="Mapa dos 75 municípios de Sergipe"
              className="territorio-prototipo__svg"
              id={idDoSvg}
              role="img"
              viewBox={`0 0 ${dados.projecao.largura} ${Math.round(dados.projecao.altura)}`}
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern
                  height={8}
                  id={idDaHachura}
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

              {dados.municipios.map((municipio) => (
                <MunicipioNoPrototipo
                  idDaHachura={idDaHachura}
                  key={municipio.codigoIbge}
                  municipio={municipio}
                />
              ))}

              {dados.pontosPosicionados.map((posicionado) => (
                <MarcadorNoMapa
                  key={posicionado.ponto.id}
                  posicionado={posicionado}
                />
              ))}
            </svg>
          </div>

          <figcaption className="meta-ficha">
            Fonte: IBGE — Malhas Territoriais, malha municipal. Sergipe inteiro;{" "}
            {doVale.length} municípios no recorte do Vale.
          </figcaption>

          <ul
            aria-label="Legenda do mapa"
            className="territorio-prototipo__legenda"
          >
            <li>
              <span
                aria-hidden="true"
                className="territorio-prototipo__amostra"
              />
              Sergipe
            </li>
            <li>
              <span
                aria-hidden="true"
                className="territorio-prototipo__amostra territorio-prototipo__amostra--vale"
              />
              Vale
            </li>
            <li>
              <span
                aria-hidden="true"
                className="territorio-prototipo__amostra territorio-prototipo__amostra--pesquisa"
              />
              Pesquisa
            </li>
            <li>
              <span
                aria-hidden="true"
                className="territorio-prototipo__amostra territorio-prototipo__amostra--comparacao"
              />
              Comparação
            </li>
          </ul>
        </figure>

        <aside className="territorio-prototipo__editorial">
          <div className="flex flex-col gap-3">
            <p className="meta-ficha">Proposta editorial</p>
            <h3 className="text-2xl">Observatório</h3>
            <p>
              O Observatório reúne pesquisa, cultura e memória do Vale do Rio
              Real em um arquivo público. A cartografia parte de Sergipe inteiro
              e evidencia as relações territoriais já documentadas.
            </p>
            <p>{DEFINICAO_VALE_DO_RIO_REAL}</p>
            <p className="meta-ficha">
              Uma iniciativa do Coletivo Cultural “Tobias, sou Eu!”
            </p>
          </div>

          <PainelContextual id={idDoPainel} />

          <section className="territorio-prototipo__pontos">
            <h3 className="text-lg">Pontos de pesquisa</h3>
            <p>
              Permanecem fora do desenho enquanto não houver coordenada
              conferida.
            </p>
            <ul>
              {dados.pontosSemPosicao.map((ponto) => (
                <li key={ponto.id}>
                  {ponto.nome} —{" "}
                  <span className="meta-ficha">sem coordenada</span>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>

      <IndiceTerritorial
        dados={dados}
        idDaLista={idDaLista}
        idDoTitulo={idDoTituloDaLista}
      />

      <MapaInterativo
        idDaLista={idDaLista}
        idDoPainel={idDoPainel}
        idDoSvg={idDoSvg}
        promoverLista
      />
    </section>
  );
}
