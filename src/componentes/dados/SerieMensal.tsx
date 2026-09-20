import {
  type MesDaSerie,
  SERIE_MENSAL,
} from "../../dados/indicadores/derivados";
import {
  formatarContagem,
  formatarReais,
} from "../../dados/indicadores/formato";

/**
 * Receita e despesa mês a mês, na superfície pública de `/dados`.
 *
 * ## Linhagem
 *
 * A forma vem do laboratório da H4.0 (`prototipo/dados/SerieMensal.tsx`), que
 * continua servindo a comparação A/B em `/dev/dados` e não foi tocado. O que
 * se repete aqui é **desenho**, nunca dado: os valores saem de
 * `SERIE_MENSAL`, e é lá que eles existem uma vez só.
 *
 * ## Por que dot plot, e não barras
 *
 * A pergunta que estes seis meses respondem não é "quanto entrou" nem "quanto
 * saiu": é a **distância entre os dois**. Um par de barras obriga o olho a
 * comparar comprimentos; dois pontos ligados por uma linha desenham a
 * diferença, e a linha troca de lado quando o saldo troca de sinal.
 *
 * ## Por que SVG no servidor
 *
 * Marcas em escala contínua com eixo próprio. Desenhado no servidor: zero
 * JavaScript, zero dependência, zero requisição extra — e a página continua
 * inteira sem script, como o doc 01 §7 exige das páginas de leitura.
 *
 * ## Acessibilidade
 *
 * O desenho não é a única forma do dado. A tabela carrega os valores exatos,
 * está sempre no DOM e é a fonte para quem não vê o gráfico — e para quem vê e
 * precisa do centavo. Abaixo de 40rem de container o SVG some e a tabela fica
 * sozinha: texto de 12 unidades num viewBox de 720 vira ilegível antes disso.
 */

const LARGURA = 720;
const MARGEM_ESQUERDA = 104;
const MARGEM_DIREITA = 20;
const TOPO = 46;
const ALTURA_DA_FAIXA = 36;
const RAIO = 5.5;

/**
 * Teto da escala — múltiplo de mil imediatamente acima do maior valor da
 * série, calculado e não escrito. Um teto fixo mentiria em silêncio no dia em
 * que a série crescesse.
 */
const MAIOR_VALOR = Math.max(
  ...SERIE_MENSAL.flatMap((mes) => [mes.receita, mes.despesa]),
);
const TETO = Math.ceil(MAIOR_VALOR / 1_000) * 1_000;
const MARCAS_DO_EIXO = [0, TETO / 2, TETO] as const;

const ALTURA = TOPO + SERIE_MENSAL.length * ALTURA_DA_FAIXA;
const LARGURA_UTIL = LARGURA - MARGEM_ESQUERDA - MARGEM_DIREITA;

function posicaoNoEixo(valor: number): number {
  return MARGEM_ESQUERDA + (valor / TETO) * LARGURA_UTIL;
}

function Faixa({ mes, indice }: { mes: MesDaSerie; indice: number }) {
  const y = TOPO + indice * ALTURA_DA_FAIXA;
  const xReceita = posicaoNoEixo(mes.receita);
  const xDespesa = posicaoNoEixo(mes.despesa);

  return (
    <g>
      <text
        fill="var(--color-texto-suave)"
        fontFamily="var(--font-mono)"
        fontSize={12}
        textAnchor="end"
        x={MARGEM_ESQUERDA - 16}
        y={y + 4}
      >
        {mes.rotulo}
      </text>
      <line
        stroke="var(--color-borda-forte)"
        strokeWidth={1.5}
        x1={Math.min(xReceita, xDespesa)}
        x2={Math.max(xReceita, xDespesa)}
        y1={y}
        y2={y}
      />
      <circle cx={xReceita} cy={y} fill="var(--color-marca)" r={RAIO} />
      {/* Losango: a despesa se distingue por forma antes de se distinguir por cor. */}
      <rect
        fill="var(--color-acento)"
        height={RAIO * 1.9}
        transform={`rotate(45 ${xDespesa} ${y})`}
        width={RAIO * 1.9}
        x={xDespesa - RAIO * 0.95}
        y={y - RAIO * 0.95}
      />
    </g>
  );
}

export function GraficoDaSerie() {
  return (
    <svg
      aria-labelledby="dd-serie-titulo dd-serie-descricao"
      className="dd-grafico"
      role="img"
      viewBox={`0 0 ${LARGURA} ${ALTURA}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title id="dd-serie-titulo">
        Receita e despesa registradas mês a mês, de julho a dezembro de 2025
      </title>
      <desc id="dd-serie-descricao">
        Cada mês tem dois pontos numa escala de zero a {formatarReais(TETO, 0)}:
        um círculo para a receita e um losango para a despesa. Os valores exatos
        estão na tabela abaixo do gráfico.
      </desc>

      {MARCAS_DO_EIXO.map((marca) => (
        <g key={marca}>
          <line
            stroke="var(--color-borda)"
            strokeWidth={1}
            x1={posicaoNoEixo(marca)}
            x2={posicaoNoEixo(marca)}
            y1={TOPO - 22}
            y2={ALTURA - 12}
          />
          <text
            fill="var(--color-texto-suave)"
            fontFamily="var(--font-mono)"
            fontSize={11}
            textAnchor={
              marca === 0 ? "start" : marca === TETO ? "end" : "middle"
            }
            x={posicaoNoEixo(marca)}
            y={TOPO - 30}
          >
            {formatarReais(marca, 0)}
          </text>
        </g>
      ))}

      {SERIE_MENSAL.map((mes, indice) => (
        <Faixa indice={indice} key={mes.rotulo} mes={mes} />
      ))}
    </svg>
  );
}

/**
 * Valores exatos da série, sempre no DOM.
 *
 * Quatro colunas aqui, e não três como no laboratório: `/dados` é a página do
 * conjunto, e registros e contratações são justamente o que ela deve carregar.
 * Em telas estreitas a tabela troca de forma no CSS, sem região rolável —
 * região que rola precisa de parada de Tab só para ser alcançável por teclado.
 */
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
      <GraficoDaSerie />
      <ul className="dd-legenda">
        <li>
          <span className="dd-marca-serie" data-serie="receita" />
          Receita
        </li>
        <li>
          <span className="dd-marca-serie" data-serie="despesa" />
          Despesa
        </li>
      </ul>
      <TabelaDaSerie />
      <figcaption className="meta-ficha">
        Em {mesesComDespesaMaior} dos {SERIE_MENSAL.length} meses a despesa
        registrada supera a receita registrada.
      </figcaption>
    </figure>
  );
}
