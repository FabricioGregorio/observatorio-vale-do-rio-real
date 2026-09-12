/**
 * Gramática de grafismos — H3.5.1.
 *
 * A H3.5 mostrou que inserir um carcará não é ter linguagem visual. O que
 * sustenta a identidade é um conjunto pequeno de famílias com papel declarado,
 * e uma regra de frequência que impede qualquer uma delas de virar maneirismo.
 *
 * Este módulo é a forma executável dessa gramática: ele nomeia as quatro
 * famílias, diz o que cada uma resolve e fixa quantas vezes cada uma pode
 * aparecer numa página. Os testes leem daqui, e não de um número repetido à
 * mão no componente.
 */

export type IdDeGrafismo =
  | "identidade"
  | "cartografico"
  | "documental"
  | "transicao";

export type CategoriaDeGrafismo = {
  readonly id: IdDeGrafismo;
  /** Classe-raiz da família no CSS do laboratório. */
  readonly classe: string;
  readonly papel: string;
  /**
   * Quantas vezes a família pode aparecer em **escala editorial** numa página.
   * `null` significa que a família é estrutural e não tem teto: ela é a régua
   * do sistema, e reprimi-la produziria página sem sistema nenhum.
   */
  readonly maximoEmEscalaEditorial: number | null;
  readonly exemplos: readonly string[];
};

export const GRAMATICA_DE_GRAFISMOS = [
  {
    id: "identidade",
    classe: "lv-g-identidade",
    papel:
      "assinatura da identidade visual; aparece para lembrar de quem é a página, não para ilustrar o assunto",
    // Um por página, e só em passagem. É o que separa assinatura de mascote:
    // repetir o animal a cada seção transforma identidade em personagem, e
    // personagem é exatamente o que este projeto não pode ter.
    maximoEmEscalaEditorial: 1,
    exemplos: ["carcará"],
  },
  {
    id: "cartografico",
    classe: "lv-g-cartografico",
    papel:
      "régua do sistema; traz para a página a precisão do desenho de mapa sem desenhar um mapa",
    maximoEmEscalaEditorial: null,
    exemplos: [
      "fio de continuidade",
      "cruz de registro",
      "eixo",
      "linha de escala",
    ],
  },
  {
    id: "documental",
    classe: "lv-g-documental",
    papel:
      "prova de que o conteúdo é registro; numeração, ficha e metadado dizem de onde a informação veio",
    maximoEmEscalaEditorial: null,
    exemplos: [
      "numeração de seção",
      "ficha de metadados",
      "legenda de fonte",
      "divisor de registro",
    ],
  },
  {
    id: "transicao",
    classe: "lv-g-transicao",
    papel:
      "liga uma seção à seguinte; existe para a página deixar de parecer uma pilha de blocos independentes",
    maximoEmEscalaEditorial: null,
    exemplos: ["passagem TERRITÓRIO → CAMPO", "passagem CAMPO → LEITURA"],
  },
] as const satisfies readonly CategoriaDeGrafismo[];

/**
 * Guia de densidade visual — H3.5.1 §13.
 *
 * Sem isto, toda fase seguinte tende a aplicar o mesmo tratamento em tudo, e o
 * resultado é uma página uniformemente carregada, que é o oposto de hierarquia.
 * A densidade é escolhida pelo tipo de leitura que a faixa pede, não pelo
 * gosto de quem implementa.
 */
export const DENSIDADE_VISUAL = [
  {
    nivel: "baixa",
    ondeSeAplica: "texto longo, manifesto, transcrição, nota metodológica",
    // Leitura contínua. Qualquer grafismo aqui disputa com a frase.
    grafismosPermitidos: ["documental"],
    movimento: "somente resposta a hover e foco",
  },
  {
    nivel: "media",
    ondeSeAplica:
      "seções institucionais, pesquisa em campo, dados e indicadores",
    grafismosPermitidos: ["documental", "cartografico"],
    movimento: "resposta a hover e foco, mais entrada única de bloco",
  },
  {
    nivel: "alta",
    ondeSeAplica: "abertura, mapa e passagens entre capítulos",
    grafismosPermitidos: [
      "documental",
      "cartografico",
      "transicao",
      "identidade",
    ],
    movimento:
      "entrada única de bloco e, no mapa, interação de intensidade própria",
  },
] as const;

/** A recomendação da H3.5.1. O A permanece como controle, não como candidato. */
export const PRESET_RECOMENDADO = "B" as const;

export const PAPEL_DOS_PRESETS = {
  A: "controle contido; existe para medir o que o sistema gráfico acrescenta",
  B: "B refinado; é a direção recomendada pela H3.5.1",
} as const;
