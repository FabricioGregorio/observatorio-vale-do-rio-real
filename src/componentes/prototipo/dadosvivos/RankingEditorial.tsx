import {
  ATIVIDADES,
  CONTEXTO_DOS_DADOS,
} from "../../../dados/indicadores/derivados";
import {
  formatarContagem,
  formatarPercentual,
} from "../../../dados/indicadores/formato";

/**
 * Recorte editorial do ranking de atividades — H4.5.
 *
 * ## O corte precisa ser derivável, não confortável
 *
 * A H4.0 mostrou as dezesseis atividades. O ranking completo é útil e pesado
 * demais para uma seção de Home. Cortar "as oito primeiras" seria escolher um
 * número porque ele cabe, e número escolhido porque cabe é arbitragem
 * disfarçada de critério.
 *
 * O corte aqui é um **limiar declarado**: atividades registradas em dez ou
 * mais dos quarenta dias de funcionamento. Quem lê pode reproduzi-lo, a
 * legenda diz qual é, e o texto diz quantas atividades ficaram de fora e para
 * onde elas vão. Nenhuma atividade some sem ser contada.
 *
 * O limiar não cai em cima de um empate: a oitava atividade tem dez dias e a
 * nona tem oito. Um teste conserva essa folga, porque limiar que separa dois
 * valores iguais deixa de ser critério e vira sorteio.
 *
 * ## A barra continua sendo apoio
 *
 * Ela tem `aria-hidden`; o número e a proporção vivem no texto da célula.
 * Nenhuma informação depende de cor: "receita direta" e "receita indireta"
 * estão escritas ao lado do nome.
 */

/** Dias mínimos de registro para a atividade entrar no recorte editorial. */
export const LIMIAR_DE_DIAS = 10;

export const ATIVIDADES_ACIMA_DO_LIMIAR = ATIVIDADES.filter(
  (atividade) => atividade.diasComAtividade >= LIMIAR_DE_DIAS,
);

export const ATIVIDADES_ABAIXO_DO_LIMIAR =
  ATIVIDADES.length - ATIVIDADES_ACIMA_DO_LIMIAR.length;

export function RankingEditorial() {
  const totalDeRegistros = CONTEXTO_DOS_DADOS.registrosDeFuncionamento;

  return (
    <div className="dv-ranking lv-revelar">
      <table className="dv-tabela">
        <caption>
          Atividades registradas em {LIMIAR_DE_DIAS} ou mais dos{" "}
          {totalDeRegistros} dias de funcionamento
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
          {ATIVIDADES_ACIMA_DO_LIMIAR.map((atividade) => {
            const proporcao = atividade.diasComAtividade / totalDeRegistros;
            return (
              <tr key={atividade.nome}>
                <th scope="row">
                  {atividade.nome}
                  <span className="meta-ficha dv-qualificador lv-g-documental">
                    {atividade.tipo} · receita{" "}
                    {atividade.receita === "direta" ? "direta" : "indireta"}
                  </span>
                </th>
                <td>
                  <div className="dv-barra">
                    <div aria-hidden="true" className="dv-trilho">
                      <div
                        className="dv-preenchimento"
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
      <p className="dv-ranking__nota meta-ficha lv-g-documental">
        Recorte editorial · proposta. O levantamento registrou{" "}
        {ATIVIDADES.length} atividades; as outras {ATIVIDADES_ABAIXO_DO_LIMIAR}{" "}
        ficaram abaixo do limiar de {LIMIAR_DE_DIAS} dias e entram no ranking
        completo, reservado para a página de dados.
      </p>
    </div>
  );
}
