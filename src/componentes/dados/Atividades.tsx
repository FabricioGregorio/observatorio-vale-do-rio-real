import {
  ATIVIDADES,
  CONTEXTO_DOS_DADOS,
} from "../../dados/indicadores/derivados";
import {
  formatarContagem,
  formatarPercentual,
} from "../../dados/indicadores/formato";

/**
 * Atividades acionadas no período, por dias com registro.
 *
 * ## Linhagem
 *
 * Mesma forma do laboratório da H4.0 (`prototipo/dados/RankingDeAtividades`),
 * que segue intacto em `/dev/dados`. Os dados são os de `ATIVIDADES`, e
 * existem uma vez só.
 *
 * ## Por que tabela com barra, e não gráfico à parte
 *
 * São dezesseis categorias nominais com uma medida só. Barra horizontal é a
 * forma certa, e a forma certa aqui já é uma tabela: o rótulo precisa de
 * espaço horizontal, a ordem é o próprio dado, e quem lê vai querer o número
 * exato ao lado da barra. Um SVG à parte custaria uma alternativa textual que
 * a tabela já é.
 *
 * A barra é apoio de leitura, não é o dado: ela tem `aria-hidden`, e o valor
 * vive no texto da célula.
 *
 * ## O denominador aparece
 *
 * O percentual é sempre sobre os registros de funcionamento do período, e o
 * número está escrito na legenda da tabela. Percentual sem base é o defeito
 * que a direção editorial deste lote proíbe por nome.
 *
 * ## Cor
 *
 * O preenchimento distingue atividade de receita direta da de receita
 * indireta, e a distinção também está escrita ao lado do nome. Nenhuma
 * informação depende só de cor.
 */
export function Atividades() {
  const totalDeRegistros = CONTEXTO_DOS_DADOS.registrosDeFuncionamento;

  return (
    <table className="dd-tabela dd-tabela--ranking">
      <caption>
        Atividades acionadas, por dias com registro em {totalDeRegistros}{" "}
        registros de funcionamento
      </caption>
      <thead>
        <tr>
          <th scope="col">Atividade</th>
          <th data-numero="" scope="col">
            Dias com a atividade
          </th>
        </tr>
      </thead>
      <tbody>
        {ATIVIDADES.map((atividade) => {
          const proporcao = atividade.diasComAtividade / totalDeRegistros;
          return (
            <tr key={atividade.nome}>
              <th scope="row">
                {atividade.nome}
                <span className="meta-ficha dd-qualificador">
                  {atividade.tipo} · receita {atividade.receita}
                </span>
              </th>
              <td>
                <div className="dd-barra">
                  <div aria-hidden="true" className="dd-trilho">
                    <div
                      className="dd-preenchimento"
                      data-receita={atividade.receita}
                      style={{ width: `${proporcao * 100}%` }}
                    />
                  </div>
                  <span>
                    {formatarContagem(atividade.diasComAtividade)} de{" "}
                    {totalDeRegistros} · {formatarPercentual(proporcao)}
                  </span>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
