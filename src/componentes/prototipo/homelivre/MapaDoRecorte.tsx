import {
  type DadosDoMapa,
  montarDadosDoMapa,
} from "../../../dados/territorio/mapa";
import type { RelacaoTerritorial } from "../../../dados/territorio/tipos";

const CLASSE_DA_RELACAO: Readonly<Record<RelacaoTerritorial, string>> = {
  "vale-rio-real": "vale",
  "pesquisa-campo": "campo",
  comparacao: "comparacao",
};

/**
 * Mapa estático do recorte — Server Component, sem ilha cliente.
 *
 * A Home pública tem o mapa exploratório da H2. Aqui o território é uma
 * **prova de lugar**, não uma ferramenta: a malha oficial é desenhada no
 * servidor com os mesmos dados e a mesma projeção, sem índice sincronizado e
 * sem painel. A leitura detalhada fica na lista textual ao lado, que é também
 * a alternativa acessível ao desenho.
 *
 * Sem pins: nenhum ponto de visita tem coordenada aprovada.
 */
export function MapaDoRecorte({
  dados = montarDadosDoMapa(),
}: {
  dados?: DadosDoMapa;
}) {
  const { projecao, municipios } = dados;

  return (
    <svg
      aria-labelledby="hl-mapa-titulo hl-mapa-descricao"
      className="hl-mapa__svg"
      role="img"
      viewBox={`0 0 ${projecao.largura} ${Math.ceil(projecao.altura)}`}
    >
      <title id="hl-mapa-titulo">Sergipe e o recorte do Vale do Rio Real</title>
      <desc id="hl-mapa-descricao">
        {`Os ${municipios.length} municípios de Sergipe. Em destaque, os municípios do recorte do Vale do Rio Real e São Cristóvão, pesquisado como referência de comparação. A lista ao lado descreve cada vínculo.`}
      </desc>
      {municipios.map((municipio) => (
        <path
          d={municipio.caminho}
          data-rel={municipio.relacoesTerritoriais
            .map((relacao) => CLASSE_DA_RELACAO[relacao])
            .join(" ")}
          key={municipio.codigoIbge}
        />
      ))}
    </svg>
  );
}
