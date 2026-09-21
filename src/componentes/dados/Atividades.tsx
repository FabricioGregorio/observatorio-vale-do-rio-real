import {
  ATIVIDADES,
  CONTEXTO_DOS_DADOS,
} from "../../dados/indicadores/derivados";
import {
  formatarContagem,
  formatarPercentual,
} from "../../dados/indicadores/formato";

/**
 * Frequência de cada atividade dentro dos registros de funcionamento.
 * Marcas inteiras reforçam que a unidade é um registro, não uma pessoa.
 * A ordem das marcas não representa datas nem permite cruzar atividades.
 * O denominador comum permite comparar frequências, nunca somar públicos.
 * Dois padrões SVG por linha evitam um nó por registro; a tabela mantém
 * nome, categoria original, tipo de receita, valor e proporção em texto.
 */
export function Atividades() {
  const totalDeRegistros = CONTEXTO_DOS_DADOS.registrosDeFuncionamento;

  return (
    <table className="dd-tabela dd-tabela--ranking">
      <caption>
        Atividades acionadas, por dias com registro em {totalDeRegistros}{" "}
        registros de funcionamento. Cada marca preenchida representa um registro
        com a atividade; a posição das marcas não indica uma data.
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
        {ATIVIDADES.map((atividade, indice) => {
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
                  <svg
                    aria-hidden="true"
                    className="dd-marcas"
                    viewBox={`0 0 ${totalDeRegistros * 10} 16`}
                  >
                    <defs>
                      <pattern
                        id={`dd-vazio-${indice}`}
                        width={10}
                        height={16}
                        patternUnits="userSpaceOnUse"
                      >
                        <path d="M5 5V11" />
                      </pattern>
                      <pattern
                        id={`dd-cheio-${indice}`}
                        width={10}
                        height={16}
                        patternUnits="userSpaceOnUse"
                      >
                        <path d="M5 1V15" data-preenchida="true" />
                      </pattern>
                    </defs>
                    <rect
                      width={totalDeRegistros * 10}
                      height={16}
                      fill={`url(#dd-vazio-${indice})`}
                    />
                    <rect
                      width={atividade.diasComAtividade * 10}
                      height={16}
                      fill={`url(#dd-cheio-${indice})`}
                    />
                  </svg>
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
