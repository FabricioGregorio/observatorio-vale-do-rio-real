import { INDICADORES, type IndicadorDerivado } from "./derivados";

/**
 * Seleção editorial da H4.5.2 — o que a Home mostra, e em que ordem.
 *
 * ## O que esta decisão é, e o que ela não é
 *
 * É hierarquia de leitura, e não julgamento de qualidade. Os oito indicadores
 * continuam auditados, publicáveis e inteiros no dataset; três deles saem da
 * leitura resumida da Home e continuam pertencendo ao conjunto completo e à
 * futura página de dados. Nenhum foi invalidado, rebaixado ou apagado.
 *
 * A H4.5.1 montou a comparação entre sete e quatro posições de apoio e deixou
 * a escolha em aberto, porque ela era humana. A escolha veio, e é esta.
 *
 * ## A sequência
 *
 * A ordem não é a do arquivo: ela conta uma frase.
 *
 *     quanto saiu → quanto entrou → quanto disso foi trabalho → de onde veio
 *                                                                quem trabalhou
 *
 * Despesa e receita abrem porque são as duas grandezas que o leitor procura
 * primeiro. A participação do trabalho é a leitura que qualifica a despesa: ela
 * diz que parte do dinheiro virou remuneração. As localidades fecham porque
 * ligam o dinheiro a território, que é o assunto do Observatório.
 */

/** Rótulo alternativo de um indicador na composição da Home. */
export type ApoioDaHome = {
  readonly id: string;
  /**
   * Rótulo aprovado apenas para a interface. O dataset não muda: ele é a
   * autoridade factual da H4.0 e não é editado por uma fase de composição.
   */
  readonly rotulo: string;
  /** Justificativa factual quando o rótulo evita ampliar o significado. */
  readonly motivoDoRotulo?: string;
};

export const APOIO_DA_HOME = [
  { id: "H4-003", rotulo: "Despesa total registrada" },
  { id: "H4-004", rotulo: "Receita registrada" },
  { id: "H4-005", rotulo: "Participação do trabalho na despesa" },
  {
    id: "H4-008",
    rotulo: "Localidades de origem registradas",
    // O `titulo` no dataset diz "Localidades alcançadas pela renda do
    // trabalho". "Alcançadas" sugere que a renda chegou a um território, que é
    // afirmação de alcance — e o indicador não mede isso. A regra declarada é
    // "contagem distinta de localidades de origem declaradas pelos
    // trabalhadores contratados": ele conta de onde vem quem foi contratado,
    // e não aonde o dinheiro chegou. O rótulo novo diz o que a regra diz.
    motivoDoRotulo:
      'o dataset registra "alcançadas", que sugere alcance territorial; a regra declarada conta localidades de origem de quem foi contratado',
  },
] as const satisfies readonly ApoioDaHome[];

/**
 * Os três que saem da leitura resumida da Home.
 *
 * Despesa média por registro, registros de funcionamento e contratações
 * registradas são leitura de operação: eles respondem "como o equipamento
 * funcionou", e não "para onde o recurso foi". São os primeiros que a página
 * de dados vai querer, e os últimos de que a Home precisa.
 */
export const RESERVADOS_AO_CONJUNTO = ["H4-002", "H4-006", "H4-007"] as const;

function porId(id: string): IndicadorDerivado {
  const achado = INDICADORES.find((indicador) => indicador.id === id);
  if (achado === undefined) throw new Error(`indicador ausente: ${id}`);
  return achado;
}

export type RegistroDeApoio = {
  readonly indicador: IndicadorDerivado;
  /** O que aparece na tela: o rótulo próprio, quando existe. */
  readonly rotulo: string;
};

export const REGISTROS_DE_APOIO: readonly RegistroDeApoio[] = (
  APOIO_DA_HOME as readonly ApoioDaHome[]
).map((apoio) => {
  const indicador = porId(apoio.id);
  return { indicador, rotulo: apoio.rotulo };
});

/** Os que ficam fora da Home, na ordem do dataset. */
export const REGISTROS_RESERVADOS: readonly IndicadorDerivado[] =
  RESERVADOS_AO_CONJUNTO.map(porId);
