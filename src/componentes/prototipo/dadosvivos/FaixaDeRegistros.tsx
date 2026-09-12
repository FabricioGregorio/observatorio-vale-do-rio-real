import type { IndicadorDerivado } from "../../../dados/indicadores/derivados";
import { exibirIndicador } from "../../../dados/indicadores/formato";

/**
 * Indicadores secundários como faixa de registros — H4.5.
 *
 * ## Por que não uma grade de cartões
 *
 * Quatro cartões lado a lado é a forma que todo painel administrativo usa, e
 * ela diz "ferramenta de consulta" antes de dizer qualquer número. A faixa diz
 * outra coisa: os valores **pendem de um mesmo eixo**, como marcas numa régua
 * cartográfica, e a linha que os liga é a afirmação de que eles vêm do mesmo
 * levantamento, no mesmo período, no mesmo recorte.
 *
 * O eixo é um grafismo da família cartográfica da H3.5.1. Cada registro tem
 * seu tique, e o tique é o que substitui a moldura do cartão: ele marca sem
 * cercar.
 *
 * ## Período e recorte saem daqui
 *
 * Os oito indicadores compartilham período e recorte — eles são constantes do
 * dataset. Repeti-los em cada registro seria ruído com aparência de rigor. Eles
 * sobem uma vez para a ficha de contexto da seção, e cada registro fica com o
 * que só ele tem: a base e a regra de cálculo.
 *
 * ## `variante`, na H4.5.1
 *
 * A faixa é montada duas vezes na mesma página — completa e reduzida — e a
 * alternância é CSS. A versão reduzida existe para medir **quanta faixa a
 * Home aguenta**, e não para eleger indicadores: os quatro que ela mostra são
 * os quatro primeiros do dataset, em ordem de arquivo, sem critério editorial.
 * A ressalva vive no cabeçalho do laboratório, fora da área de pré-visualização.
 */
export function FaixaDeRegistros({
  indicadores,
  variante,
}: {
  readonly indicadores: readonly IndicadorDerivado[];
  readonly variante: "completa" | "reduzida";
}) {
  return (
    <div className="dv-faixa lv-revelar" data-variante={variante}>
      <ol className="dv-faixa__lista">
        {indicadores.map((indicador) => (
          <li className="dv-registro-indicador" key={indicador.id}>
            <span
              aria-hidden="true"
              className="dv-registro-indicador__tique lv-g-cartografico"
            />
            <p className="dv-registro-indicador__valor">
              {exibirIndicador(indicador)}
            </p>
            <h3>{indicador.titulo}</h3>
            {/*
              Campo sem valor na fonte não vira linha. A regra da H4.0 vale
              igual aqui: metadado vazio só para dar aparência técnica é
              cenografia, e repetido sete vezes vira ruído.
            */}
            {indicador.base === null ? null : (
              <p className="meta-ficha lv-g-documental">{indicador.base}</p>
            )}
            <p className="dv-registro-indicador__regra">{indicador.regra}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
