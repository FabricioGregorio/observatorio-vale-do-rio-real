import {
  type MesDaSerie,
  SERIE_MENSAL,
} from "../../../dados/indicadores/derivados";
import { formatarReais } from "../../../dados/indicadores/formato";

/**
 * Receita e despesa mês a mês — H4.0.
 *
 * ## Por que um dot plot, e não barras
 *
 * A pergunta que estes seis meses respondem não é "quanto entrou" nem "quanto
 * saiu", é **a distância entre os dois**. Um par de barras empilha duas
 * grandezas que o olho tem de comparar por comprimento; dois pontos ligados por
 * uma linha desenham a diferença diretamente, e a linha muda de lado quando o
 * sinal do saldo muda. Pizza, rosca e velocímetro não respondem nada disso.
 *
 * ## Por que SVG no servidor
 *
 * Marcas posicionadas em escala contínua com eixo próprio. É o caso em que o
 * SVG ganha de HTML e CSS, e ele é desenhado no servidor: zero JavaScript,
 * zero dependência, zero requisição extra.
 *
 * ## Acessibilidade
 *
 * O desenho não é a única forma do dado. A tabela abaixo dele carrega os
 * valores exatos, está sempre no DOM e é a fonte para quem não vê o gráfico —
 * e também para quem vê e precisa do número, porque três linhas de grade não
 * dão precisão de centavo. Abaixo de 40rem de container o SVG some e a tabela
 * fica sozinha: texto de 12 unidades num viewBox de 720 vira ilegível antes
 * disso.
 */

const LARGURA = 720;
const MARGEM_ESQUERDA = 104;
const MARGEM_DIREITA = 20;
const TOPO = 46;
const ALTURA_DA_FAIXA = 36;
const RAIO = 5.5;

/** Teto da escala, acima do maior valor da série e em número redondo. */
const TETO = 5_000;
const MARCAS_DO_EIXO = [0, 2_500, 5_000] as const;

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

export function GraficoDaSerieMensal({ prefixo }: { prefixo: string }) {
  const idDoTitulo = `${prefixo}-serie-titulo`;
  const idDaDescricao = `${prefixo}-serie-descricao`;

  return (
    <svg
      aria-labelledby={`${idDoTitulo} ${idDaDescricao}`}
      className="painel-dados__grafico"
      role="img"
      viewBox={`0 0 ${LARGURA} ${ALTURA}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title id={idDoTitulo}>
        Receita e despesa mês a mês, de julho a dezembro de 2025
      </title>
      <desc id={idDaDescricao}>
        Cada mês tem dois pontos numa escala de zero a cinco mil reais: um
        círculo para a receita e um losango para a despesa. Os valores exatos
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
 * Três colunas, e não cinco: registros e contratações por mês existem no
 * dataset e aparecem como indicadores próprios, mas aqui empurrariam a tabela
 * para rolagem horizontal em 320 px. Tabela que rola precisa de parada de Tab
 * própria para ser alcançável por teclado; tabela que cabe não precisa de
 * nada. A segunda é melhor.
 */
export function TabelaDaSerieMensal() {
  return (
    <table>
      <caption>Série mensal consolidada</caption>
      <thead>
        <tr>
          <th scope="col">Mês</th>
          <th data-numero="" scope="col">
            Receita
          </th>
          <th data-numero="" scope="col">
            Despesa
          </th>
        </tr>
      </thead>
      <tbody>
        {SERIE_MENSAL.map((mes) => (
          <tr key={mes.rotulo}>
            <th scope="row">{mes.rotulo}</th>
            <td data-numero="">{formatarReais(mes.receita)}</td>
            <td data-numero="">{formatarReais(mes.despesa)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function SerieMensal({ prefixo }: { prefixo: string }) {
  const mesesComDespesaMaior = SERIE_MENSAL.filter(
    (mes) => mes.despesa > mes.receita,
  ).length;

  return (
    <figure className="painel-dados__figura">
      <GraficoDaSerieMensal prefixo={prefixo} />
      <ul className="painel-dados__legenda">
        <li>
          <span className="painel-dados__marca-serie" data-serie="receita" />
          Receita
        </li>
        <li>
          <span className="painel-dados__marca-serie" data-serie="despesa" />
          Despesa
        </li>
      </ul>
      <TabelaDaSerieMensal />
      <figcaption className="meta-ficha">
        Em {mesesComDespesaMaior} dos {SERIE_MENSAL.length} meses a despesa
        registrada supera a receita registrada.
      </figcaption>
    </figure>
  );
}
