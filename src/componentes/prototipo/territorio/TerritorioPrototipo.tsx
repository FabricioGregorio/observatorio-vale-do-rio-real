import type { DadosDoMapa } from "../../../dados/territorio/mapa";
import { RESUMO_PUBLICO_DO_VALE } from "../../../dados/territorio/recorte";
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
import { CSS_DO_TERRITORIO } from "../../territorio/estilosDoTerritorio";

export type ProfundidadeDoTerritorio = "minima" | "moderada";
export type ContextoDoTerritorio = "home" | "prototipo";

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
      className="territorio-cartografico__painel"
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
            <dt className="meta-ficha">Relação com o projeto</dt>
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
  aberto,
}: {
  dados: DadosDoMapa;
  idDaLista: string;
  idDoTitulo: string;
  aberto: boolean;
}) {
  return (
    <details className="territorio-cartografico__indice" open={aberto}>
      <summary id={idDoTitulo}>
        Índice acessível — {dados.municipios.length} municípios
      </summary>
      <p>
        Com JavaScript, use as setas para percorrer o índice e Enter ou Espaço
        para selecionar. Sem JavaScript, a lista completa continua disponível.
      </p>
      <ul
        aria-labelledby={idDoTitulo}
        className="territorio-cartografico__lista"
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
              className="territorio-cartografico__item"
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
  contexto = "prototipo",
}: {
  dados: DadosDoMapa;
  profundidade: ProfundidadeDoTerritorio;
  contexto?: ContextoDoTerritorio;
}) {
  if (dados.municipios.length === 0) return null;

  const prefixo =
    contexto === "home" ? "territorio-home" : `territorio-${profundidade}`;
  const idDoTitulo = `${prefixo}-titulo`;
  const idDoSvg = `${prefixo}-svg`;
  const idDaHachura = `${prefixo}-hachura-pesquisa`;
  const idDaLista = `${prefixo}-lista`;
  const idDoTituloDaLista = `${prefixo}-lista-titulo`;
  const idDoPainel = `${prefixo}-painel`;
  const idDosPontos = `${prefixo}-pontos-titulo`;
  const doVale = dados.municipios.filter((municipio) =>
    municipio.relacoesTerritoriais.includes("vale-rio-real"),
  );

  return (
    <section
      aria-labelledby={idDoTitulo}
      className={`${CLASSE_RAIZ} territorio-cartografico`}
      data-contexto={contexto}
      data-profundidade={profundidade}
      data-testid={
        contexto === "prototipo" ? `preset-${profundidade}` : "territorio-home"
      }
      id={prefixo}
    >
      <style>{`${CSS_DO_MAPA}\n${CSS_DO_TERRITORIO}`}</style>

      <div className="territorio-cartografico__cabecalho">
        <p className="meta-ficha">01 — TERRITÓRIO</p>
        <h2 className="text-3xl" id={idDoTitulo}>
          Cartografia viva do Vale do Rio Real
        </h2>
        {contexto === "prototipo" ? (
          <p className="meta-ficha">Preset {ROTULO_DO_PRESET[profundidade]}</p>
        ) : null}
      </div>

      <div className="territorio-cartografico__grade">
        <figure className="territorio-cartografico__mapa">
          <div className="territorio-cartografico__moldura">
            <svg
              aria-label="Mapa dos 75 municípios de Sergipe"
              className="territorio-cartografico__svg"
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
            Nota cartográfica — IBGE, Malhas Territoriais, malha municipal.{" "}
            Sergipe inteiro; {doVale.length} municípios no recorte do Vale.
          </figcaption>

          <ul
            aria-label="Legenda do mapa"
            className="territorio-cartografico__legenda"
          >
            <li>
              <span
                aria-hidden="true"
                className="territorio-cartografico__amostra"
              />
              Sergipe
            </li>
            <li>
              <span
                aria-hidden="true"
                className="territorio-cartografico__amostra territorio-cartografico__amostra--vale"
              />
              Vale
            </li>
            <li>
              <span
                aria-hidden="true"
                className="territorio-cartografico__amostra territorio-cartografico__amostra--pesquisa"
              />
              Pesquisa
            </li>
            <li>
              <span
                aria-hidden="true"
                className="territorio-cartografico__amostra territorio-cartografico__amostra--comparacao"
              />
              Comparação
            </li>
          </ul>
        </figure>

        <aside className="territorio-cartografico__editorial">
          {contexto === "prototipo" ? (
            <div className="territorio-cartografico__introducao">
              <p className="meta-ficha">Proposta editorial</p>
              <h3 className="text-2xl">Observatório</h3>
              <p>
                O Observatório reúne pesquisa, cultura e memória do Vale do Rio
                Real em um arquivo público. A cartografia parte de Sergipe
                inteiro e evidencia as relações territoriais já documentadas.
              </p>
              <p>{RESUMO_PUBLICO_DO_VALE}</p>
              <p className="meta-ficha">
                Uma iniciativa do Coletivo Cultural “Tobias, sou Eu!”
              </p>
            </div>
          ) : (
            <div className="territorio-cartografico__introducao">
              <p className="meta-ficha">Leitura cartográfica</p>
              <h3 className="text-2xl">Território em camadas</h3>
              <p>
                A cartografia apresenta os 75 municípios de Sergipe e distingue
                as relações territoriais declaradas no projeto.
              </p>
              <p>{RESUMO_PUBLICO_DO_VALE}</p>
              <p className="meta-ficha territorio-cartografico__assinatura">
                Idealizado e realizado pelo Coletivo Cultural “Tobias, sou Eu!”
              </p>
            </div>
          )}

          <PainelContextual id={idDoPainel} />

          <section
            aria-labelledby={idDosPontos}
            className="territorio-cartografico__pontos"
          >
            <h3 className="text-lg" id={idDosPontos}>
              Pontos de pesquisa
            </h3>
            <p>Registros sem posição conferida permanecem fora do desenho.</p>
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
        aberto={contexto === "prototipo"}
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
