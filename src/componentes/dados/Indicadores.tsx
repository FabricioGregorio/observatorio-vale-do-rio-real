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
    <article
      aria-labelledby={idDoTitulo}
      className="dd-indicador"
      data-unidade={indicador.unidade}
      data-indicador={indicador.id}
    >
      <div className="dd-indicador__medida">
        <p className="dd-indicador__valor">{exibirIndicador(indicador)}</p>
        <h3 id={idDoTitulo}>{indicador.titulo}</h3>
        {indicador.unidade === "percentual" ? (
          <div aria-hidden="true" className="dd-proporcao">
            <div className="dd-proporcao__trilho">
              <span style={{ width: `${indicador.valorBruto * 100}%` }} />
            </div>
            <div className="dd-proporcao__eixo">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        ) : null}
      </div>
      <div className="dd-indicador__contexto">
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
            <dt>Fonte</dt>
            <dd>{indicador.fontePublica}</dd>
          </div>
        </dl>
        {indicador.notaMetodologica === null ? null : (
          <p className="dd-indicador__nota">{indicador.notaMetodologica}</p>
        )}
        <details className="dd-detalhes">
          <summary>
            Período e recorte
            <span className="sr-only"> — {indicador.titulo}</span>
          </summary>
          <dl className="dd-ficha">
            <div>
              <dt>Período</dt>
              <dd>{indicador.periodo}</dd>
            </div>
            <div>
              <dt>Recorte</dt>
              <dd>{indicador.recorte}</dd>
            </div>
          </dl>
        </details>
      </div>
    </article>
  );
}
