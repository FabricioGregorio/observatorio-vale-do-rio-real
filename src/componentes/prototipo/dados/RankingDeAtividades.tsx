import {
  ATIVIDADES,
  CONTEXTO_DOS_DADOS,
} from "../../../dados/indicadores/derivados";
import {
  formatarContagem,
  formatarPercentual,
} from "../../../dados/indicadores/formato";

/**
 * Atividades acionadas no período, por dias com registro — H4.0.
 *
 * ## Por que tabela com barra, e não gráfico separado
 *
 * São dezesseis categorias nominais com uma medida só. Barra horizontal é a
 * forma certa, e a forma certa aqui já é uma tabela: o rótulo precisa de
 * espaço horizontal, a ordem é o próprio dado e o leitor vai querer o número
 * exato ao lado da barra. Desenhar isso num SVG à parte custaria uma
 * alternativa textual que a tabela já é.
 *
 * A barra é apoio de leitura, não é o dado: ela tem `aria-hidden`, e o valor
 * vive no texto da própria célula.
 *
 * ## Duas colunas, de propósito
 *
 * Tipo e natureza da receita ficam junto do nome da atividade, e não em
 * colunas próprias. Quatro colunas obrigariam a tabela a rolar na horizontal
 * em 320 px, e região rolável precisa de parada de Tab só para ser alcançável
 * por teclado. Duas colunas cabem, e o que cabe não precisa de muleta.
 *
 * ## Cor
 *
 * O preenchimento distingue atividade que gera receita direta da que não gera,
 * mas a distinção também está escrita ao lado do nome. Nenhuma informação
 * depende só de cor.
 */
export function RankingDeAtividades() {
  const totalDeRegistros = CONTEXTO_DOS_DADOS.registrosDeFuncionamento;

  return (
    <table>
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
                <span className="meta-ficha painel-dados__qualificador">
                  {atividade.tipo} · receita{" "}
                  {atividade.receita === "direta" ? "direta" : "indireta"}
                </span>
              </th>
              <td>
                <div className="painel-dados__barra">
                  <div aria-hidden="true" className="painel-dados__trilho">
                    <div
                      className="painel-dados__preenchimento"
                      data-receita={atividade.receita}
                      style={{ width: `${proporcao * 100}%` }}
                    />
                  </div>
                  <span>
                    {formatarContagem(atividade.diasComAtividade)} ·{" "}
                    {formatarPercentual(proporcao)}
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
