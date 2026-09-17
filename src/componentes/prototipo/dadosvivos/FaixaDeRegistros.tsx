import { exibirIndicador } from "../../../dados/indicadores/formato";
import type { RegistroDeApoio } from "../../../dados/indicadores/selecaoEditorial";

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
 * ## O rótulo pode não ser o `titulo` do dataset — H4.5.2
 *
 * A faixa recebe registros já resolvidos, com os rótulos editoriais aprovados
 * para a interface. Corrigir esses nomes no dataset mudaria a H4.0, que é a
 * autoridade factual e não é editada por uma fase de composição. A separação
 * fica explícita em `selecaoEditorial.ts`: o ID resolve valor, base e regra no
 * dataset; a camada editorial fornece somente o rótulo apresentado.
 */
export function FaixaDeRegistros({
  registros,
  variante,
}: {
  readonly registros: readonly RegistroDeApoio[];
  readonly variante: "candidata" | "reservados";
}) {
  return (
    <div className="dv-faixa lv-revelar" data-variante={variante}>
      <ol className="dv-faixa__lista">
        {registros.map(({ indicador, rotulo }) => (
          <li className="dv-registro-indicador" key={indicador.id}>
            <span
              aria-hidden="true"
              className="dv-registro-indicador__tique lv-g-cartografico"
            />
            <p className="dv-registro-indicador__valor">
              {exibirIndicador(indicador)}
            </p>
            <h3>{rotulo}</h3>
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
