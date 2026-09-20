import type { IndicadorDerivado } from "../../dados/indicadores/derivados";
import { exibirIndicador } from "../../dados/indicadores/formato";

/**
 * Ficha de um indicador auditado.
 *
 * ## O que a ficha obriga
 *
 * Nenhum valor aparece sozinho. Cada um carrega, no mesmo bloco, a regra de
 * cálculo, a base sobre a qual foi apurado, o período, o recorte e a fonte
 * pública — e a nota metodológica quando a fonte declara uma. É isso que
 * separa um indicador documental de um KPI: o número e o seu denominador não
 * se soltam um do outro.
 *
 * Campo sem valor na fonte não vira linha. Metadado vazio só para dar
 * aparência técnica é cenografia, e `base` é anulável justamente para que a
 * ausência apareça como ausência.
 *
 * ## O que a ficha nunca mostra
 *
 * `procedencia` — aba, linha e código interno da fonte de cálculo. O cabeçalho
 * de `dados/indicadores/derivados.ts` proíbe publicá-los, e a proibição vale
 * aqui: o componente recebe o indicador inteiro e escolhe o que serve.
 */
export function FichaDoIndicador({
  indicador,
}: {
  indicador: IndicadorDerivado;
}) {
  const idDoTitulo = `dd-indicador-${indicador.id}`;

  return (
    <article aria-labelledby={idDoTitulo} className="dd-indicador">
      <p className="dd-indicador__valor">{exibirIndicador(indicador)}</p>
      <h3 id={idDoTitulo}>{indicador.titulo}</h3>
      <dl className="dd-ficha">
        <div>
          <dt>Cálculo</dt>
          <dd>{indicador.regra}</dd>
        </div>
        {indicador.base === null ? null : (
          <div>
            <dt>Base</dt>
            <dd>{indicador.base}</dd>
          </div>
        )}
        <div>
          <dt>Período</dt>
          <dd>{indicador.periodo}</dd>
        </div>
        <div>
          <dt>Recorte</dt>
          <dd>{indicador.recorte}</dd>
        </div>
        <div>
          <dt>Fonte</dt>
          <dd>{indicador.fontePublica}</dd>
        </div>
      </dl>
      {indicador.notaMetodologica === null ? null : (
        <p className="dd-indicador__nota">{indicador.notaMetodologica}</p>
      )}
    </article>
  );
}
