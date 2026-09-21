import { SERIE_MENSAL } from "../../dados/indicadores/derivados";
import {
  formatarContagem,
  formatarReais,
} from "../../dados/indicadores/formato";

/** Escala comum a todos os meses; zero e teto nunca dependem da seleção. */
const TETO = Math.max(
  1_000,
  Math.ceil(
    Math.max(...SERIE_MENSAL.flatMap((mes) => [mes.receita, mes.despesa])) /
      1_000,
  ) * 1_000,
);

/**
 * Pares de pontos em uma escala compartilhada. A largura do intervalo mostra
 * a distância entre receita e despesa, sem interpolar dias não observados.
 * HTML permite rótulos no tamanho de leitura em qualquer largura. O traçado
 * é decorativo: valores exatos estão no resumo e na tabela equivalente.
 * Details nativo oferece contexto por mês com toque, Enter ou Espaço, sem JS.
 */
export function GraficoDaSerie() {
  return (
    <div className="dd-serie">
      <p className="dd-nota">
        Uma escala para todos os meses. Abra um mês para consultar registros e
        contratações.
      </p>
      <div aria-hidden="true" className="dd-serie__eixo">
        <div className="dd-serie__regua">
          <span>{formatarReais(0, 0)}</span>
          <span>{formatarReais(TETO / 2, 0)}</span>
          <span>{formatarReais(TETO, 0)}</span>
        </div>
      </div>
      <ol className="dd-serie__meses">
        {SERIE_MENSAL.map((mes, indice) => (
          <li key={mes.rotulo}>
            <details className="dd-mes">
              <summary>
                <span className="dd-mes__nome">
                  {mes.rotulo}
                  {indice === 0 || indice === SERIE_MENSAL.length - 1 ? (
                    <small>Coleta parcial</small>
                  ) : null}
                </span>
                <span aria-hidden="true" className="dd-comparacao">
                  <span
                    className="dd-comparacao__intervalo"
                    style={{
                      left: `${(Math.min(mes.receita, mes.despesa) / TETO) * 100}%`,
                      width: `${(Math.abs(mes.receita - mes.despesa) / TETO) * 100}%`,
                    }}
                  />
                  <span
                    className="dd-comparacao__ponto"
                    data-serie="receita"
                    style={{ left: `${(mes.receita / TETO) * 100}%` }}
                  />
                  <span
                    className="dd-comparacao__ponto"
                    data-serie="despesa"
                    style={{ left: `${(mes.despesa / TETO) * 100}%` }}
                  />
                </span>
                <span className="dd-mes__valores">
                  <span>
                    <small>Receita</small>
                    {formatarReais(mes.receita)}
                  </span>
                  <span>
                    <small>Despesa</small>
                    {formatarReais(mes.despesa)}
                  </span>
                </span>
                <span aria-hidden="true" className="dd-mes__abrir">
                  +
                </span>
              </summary>
              <p className="dd-mes__contexto">
                <strong>{formatarContagem(mes.registros)}</strong> registros de
                funcionamento ·{" "}
                <strong>{formatarContagem(mes.contratacoes)}</strong>{" "}
                contratações de trabalho.
                <span>
                  Contratações não são pessoas distintas: a mesma pessoa pode
                  aparecer em dias diferentes.
                </span>
              </p>
            </details>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function TabelaDaSerie() {
  return (
    <table className="dd-tabela">
      <caption>Série mensal consolidada dos dois equipamentos</caption>
      <thead>
        <tr>
          <th scope="col">Mês</th>
          <th data-numero="" scope="col">
            Receita
          </th>
          <th data-numero="" scope="col">
            Despesa
          </th>
          <th data-numero="" scope="col">
            Registros
          </th>
          <th data-numero="" scope="col">
            Contratações
          </th>
        </tr>
      </thead>
      <tbody>
        {SERIE_MENSAL.map((mes) => (
          <tr key={mes.rotulo}>
            <th scope="row">{mes.rotulo}</th>
            {/*
              `data-rotulo` só é lido pelo CSS, e só abaixo de 34rem, quando a
              tabela troca de forma e o cabeçalho sai do fluxo visual. Ele não
              substitui o `<th scope="col">`, que continua no DOM e é o que o
              leitor de tela usa.
            */}
            <td data-numero="" data-rotulo="Receita">
              {formatarReais(mes.receita)}
            </td>
            <td data-numero="" data-rotulo="Despesa">
              {formatarReais(mes.despesa)}
            </td>
            <td data-numero="" data-rotulo="Registros">
              {formatarContagem(mes.registros)}
            </td>
            <td data-numero="" data-rotulo="Contratações">
              {formatarContagem(mes.contratacoes)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function SerieMensal() {
  const mesesComDespesaMaior = SERIE_MENSAL.filter(
    (mes) => mes.despesa > mes.receita,
  ).length;
  return (
    <figure className="dd-figura">
      <figcaption className="dd-serie__leitura">
        Em{" "}
        <strong>
          {mesesComDespesaMaior} dos {SERIE_MENSAL.length} meses
        </strong>{" "}
        a despesa registrada supera a receita registrada.
      </figcaption>
      <ul className="dd-legenda">
        <li>
          <span
            aria-hidden="true"
            className="dd-marca-serie"
            data-serie="receita"
          />
          Receita
        </li>
        <li>
          <span
            aria-hidden="true"
            className="dd-marca-serie"
            data-serie="despesa"
          />
          Despesa
        </li>
      </ul>
      <GraficoDaSerie />
      <details className="dd-detalhes dd-serie__tabela">
        <summary>Consultar a tabela completa da série mensal</summary>
        <TabelaDaSerie />
      </details>
    </figure>
  );
}
