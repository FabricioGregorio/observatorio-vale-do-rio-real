import {
  type MesDaSerie,
  SERIE_MENSAL,
} from "../../../dados/indicadores/derivados";
import { formatarReais } from "../../../dados/indicadores/formato";

/**
 * Receita e despesa mês a mês — H4.5.
 *
 * ## O que não mudou
 *
 * A forma continua sendo a mesma da H4.0, e pela mesma razão: a pergunta que
 * estes seis meses respondem é **a distância entre receita e despesa**, e dois
 * pontos ligados desenham a diferença diretamente. Os valores são os mesmos, a
 * escala é a mesma, o teto é o mesmo e o desenho continua sendo SVG montado no
 * servidor, sem biblioteca e sem JavaScript de gráfico.
 *
 * ## O que mudou
 *
 * O eixo ganhou marcas técnicas curtas em vez de linhas de grade inteiras, que
 * competiam com o dado. Cada mês virou um registro endereçável: passar o mouse
 * sobre ele atenua os demais, engrossa o conector daquele mês e **acende a
 * linha correspondente na tabela**, onde os valores exatos já estão. A ligação
 * nos dois sentidos é feita com `:has()` e `data-mes`, sem uma linha de
 * JavaScript.
 *
 * O reforço do valor é a linha da tabela, e não um rótulo dentro do desenho:
 * repetir o número no SVG custaria margem, empurraria os pontos para dentro e
 * criaria uma segunda cópia do dado para manter em sincronia.
 *
 * ## Acessibilidade
 *
 * O desenho continua não sendo a única forma do dado. A tabela carrega os
 * valores exatos, está sempre no DOM e é a fonte para quem não vê o gráfico. O
 * realce é ênfase, nunca informação: nada existe só no gráfico. Abaixo de
 * 40rem de container o SVG some e a tabela fica sozinha, como na H4.0.
 *
 * O desenho **não** recebe parada de teclado. `role="img"` torna o interior do
 * SVG presentacional: um `tabindex` ali criaria um ponto de foco que anuncia o
 * mesmo título e a mesma descrição que a tecnologia assistiva já lê, e que não
 * opera nada. O caminho de teclado para o mês a mês é a tabela, que carrega
 * todos os valores, tem `caption` e `scope`, e está sempre no DOM. O realce é
 * ênfase de leitura, nunca informação: nada existe só no gráfico.
 */

const LARGURA = 720;
const MARGEM_ESQUERDA = 104;
const MARGEM_DIREITA = 40;
const TOPO = 44;
const ALTURA_DA_FAIXA = 36;
const RAIO = 5;

/** Teto da escala, acima do maior valor da série e em número redondo. */
const TETO = 5_000;
const MARCAS_DO_EIXO = [0, 1_250, 2_500, 3_750, 5_000] as const;
const MARCAS_ROTULADAS = new Set<number>([0, 2_500, 5_000]);

const ALTURA = TOPO + SERIE_MENSAL.length * ALTURA_DA_FAIXA;
const LARGURA_UTIL = LARGURA - MARGEM_ESQUERDA - MARGEM_DIREITA;

export const MESES_DA_SERIE = SERIE_MENSAL.length;

function posicaoNoEixo(valor: number): number {
  return MARGEM_ESQUERDA + (valor / TETO) * LARGURA_UTIL;
}

function Registro({ mes, indice }: { mes: MesDaSerie; indice: number }) {
  const y = TOPO + indice * ALTURA_DA_FAIXA;
  const xReceita = posicaoNoEixo(mes.receita);
  const xDespesa = posicaoNoEixo(mes.despesa);

  return (
    <g className="dv-registro" data-mes={indice}>
      {/* Faixa de captura: o alvo de hover é o mês inteiro, não o ponto. */}
      <rect
        className="dv-captura"
        height={ALTURA_DA_FAIXA}
        width={LARGURA}
        x={0}
        y={y - ALTURA_DA_FAIXA / 2}
      />
      <text
        className="dv-mes"
        textAnchor="end"
        x={MARGEM_ESQUERDA - 18}
        y={y + 4}
      >
        {mes.rotulo}
      </text>
      <line
        className="dv-tique-mes"
        x1={MARGEM_ESQUERDA - 10}
        x2={MARGEM_ESQUERDA - 4}
        y1={y}
        y2={y}
      />
      <line
        className="dv-conector"
        pathLength={1}
        x1={Math.min(xReceita, xDespesa)}
        x2={Math.max(xReceita, xDespesa)}
        y1={y}
        y2={y}
      />
      <circle className="dv-ponto" cx={xReceita} cy={y} r={RAIO} />
      {/* Losango: a despesa se distingue por forma antes de se distinguir por cor. */}
      <rect
        className="dv-ponto dv-ponto--despesa"
        height={RAIO * 1.9}
        transform={`rotate(45 ${xDespesa} ${y})`}
        width={RAIO * 1.9}
        x={xDespesa - RAIO * 0.95}
        y={y - RAIO * 0.95}
      />
    </g>
  );
}

export function GraficoDaSerieViva({ prefixo }: { prefixo: string }) {
  const idDoTitulo = `${prefixo}-serie-titulo`;
  const idDaDescricao = `${prefixo}-serie-descricao`;

  return (
    <svg
      aria-labelledby={`${idDoTitulo} ${idDaDescricao}`}
      className="dv-grafico"
      role="img"
      viewBox={`0 0 ${LARGURA} ${ALTURA}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title id={idDoTitulo}>
        Receita e despesa mês a mês, de julho a dezembro de 2025
      </title>
      <desc id={idDaDescricao}>
        Cada mês tem dois pontos numa escala de zero a cinco mil reais: um
        círculo para a receita e um losango para a despesa. A linha entre eles é
        a diferença do mês. Os valores exatos estão na tabela abaixo do gráfico.
      </desc>

      <line
        className="dv-eixo"
        x1={MARGEM_ESQUERDA}
        x2={LARGURA - MARGEM_DIREITA}
        y1={TOPO - 20}
        y2={TOPO - 20}
      />
      {MARCAS_DO_EIXO.map((marca) => (
        <g key={marca}>
          <line
            className="dv-tique"
            x1={posicaoNoEixo(marca)}
            x2={posicaoNoEixo(marca)}
            y1={TOPO - 20}
            y2={TOPO - 14}
          />
          {MARCAS_ROTULADAS.has(marca) ? (
            <text
              className="dv-escala"
              textAnchor={
                marca === 0 ? "start" : marca === TETO ? "end" : "middle"
              }
              x={posicaoNoEixo(marca)}
              y={TOPO - 28}
            >
              {formatarReais(marca, 0)}
            </text>
          ) : null}
        </g>
      ))}

      {SERIE_MENSAL.map((mes, indice) => (
        <Registro indice={indice} key={mes.rotulo} mes={mes} />
      ))}
    </svg>
  );
}

/**
 * Valores exatos da série, sempre no DOM.
 *
 * Três colunas, e não cinco: registros e contratações por mês existem no
 * dataset e aparecem como indicadores próprios, mas aqui empurrariam a tabela
 * para rolagem horizontal em 320 px.
 *
 * Cada linha carrega o mesmo `data-mes` do grupo correspondente no desenho. É
 * esse par que permite a ligação nos dois sentidos, por CSS.
 */
export function TabelaDaSerieViva() {
  return (
    <table className="dv-tabela">
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
        {SERIE_MENSAL.map((mes, indice) => (
          <tr data-mes={indice} key={mes.rotulo}>
            <th scope="row">{mes.rotulo}</th>
            <td data-numero="">{formatarReais(mes.receita)}</td>
            <td data-numero="">{formatarReais(mes.despesa)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function SerieViva({ prefixo }: { prefixo: string }) {
  const mesesComDespesaMaior = SERIE_MENSAL.filter(
    (mes) => mes.despesa > mes.receita,
  ).length;

  return (
    <figure className="dv-serie lv-revelar">
      <figcaption className="dv-serie__abertura">
        <p className="meta-ficha lv-g-documental">Série mensal</p>
        <p>
          Em {mesesComDespesaMaior} dos {SERIE_MENSAL.length} meses a despesa
          registrada supera a receita registrada. A linha de cada mês é a
          diferença entre as duas.
        </p>
      </figcaption>
      <GraficoDaSerieViva prefixo={prefixo} />
      <ul className="dv-legenda lv-g-documental">
        <li>
          <span className="dv-marca-serie" data-serie="receita" />
          Receita
        </li>
        <li>
          <span className="dv-marca-serie" data-serie="despesa" />
          Despesa
        </li>
      </ul>
      <TabelaDaSerieViva />
    </figure>
  );
}
