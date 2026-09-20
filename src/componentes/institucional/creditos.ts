import {
  CAMINHO_DAS_MARCAS_INSTITUCIONAIS,
  MARCAS_DERIVADAS,
  type MarcaDerivada,
} from "../../dados/institucional/marcas";

/**
 * Régua de créditos institucionais — fonte única do rodapé e da Prestação.
 *
 * ## A ordem é dado, e vem de manual
 *
 * Até 2026-09-20 este módulo carregava só o crédito textual, e a ordem vinha
 * da decisão humana registrada em `docs/tarefas/16-…` §2, item 5. Nesta
 * rodada os três manuais oficiais foram localizados em
 * `OBSERVATORIO_FONTES_DIR/marcas/` e lidos, e a régua passa a ser o que eles
 * determinam:
 *
 * - **Manual de uso da marca PNAB Sergipe.** É obrigatória a veiculação da
 *   régua de marcas em toda divulgação do projeto — sites inclusive. O bloco
 *   se divide em **Apoio** (Governo de Sergipe, Secretaria Especial da
 *   Cultura, FUNCAP) e **Realização** (PNAB ao lado da assinatura conjunta
 *   Ministério da Cultura/Governo Federal, separada por um traço, fechando o
 *   bloco à extrema direita). Nenhuma marca do bloco pode ultrapassar a altura
 *   e a largura total da marca nominativa do Governo Federal.
 * - **Manual de uso da marca do Governo Federal, v1.2.** Ordem ascendente de
 *   importância da esquerda para a direita; a marca federal é sempre a última
 *   à direita. Versão completa em cores sólidas (RGB) para toda peça não
 *   impressa. Redução máxima em meios eletrônicos: 200 px. Caixa de proteção
 *   em volta da marca. Proibido rotacionar, distorcer, alterar cores, aplicar
 *   moldura ou marca-d'água, e aplicar sobre fundo instável.
 * - **Manual de uso Governo de Sergipe.** Versão positiva do brasão, sem
 *   alteração de cor, diagramação ou proporção; área de segurança preservada;
 *   quando a legibilidade estiver comprometida pelo fundo, usar caixa.
 *
 * ## Duas divergências registradas, não corrigidas em silêncio
 *
 * 1. A decisão humana de 2026-09-13 determinou usar **Governo de Sergipe**, e
 *    não o lockup "Secretaria de Cultura + Governo de Sergipe". O manual da
 *    PNAB, localizado depois dessa decisão, exige divulgar também o apoio da
 *    **Secretaria Especial da Cultura**. A instrução humana é o item 1 da
 *    hierarquia de fontes e foi preservada na escolha do ativo gráfico; a
 *    exigência do manual é atendida pela **assinatura textual padrão**, que é
 *    a redação do próprio manual e nomeia a Secretaria. O ponto está no
 *    relatório para decisão.
 * 2. A régua textual anterior chamava a PNAB de "política de fomento" e o
 *    bloco federal de "assinatura federal". O manual da PNAB chama os dois,
 *    juntos, de **Realização**. O vocabulário do manual prevalece.
 *
 * ## O que continua pendente
 *
 * O manual da PNAB Sergipe exige que todo material em arte-final seja
 * submetido à aprovação da Funcap e da Secult com no mínimo 10 dias úteis de
 * antecedência. Essa aprovação — o "nada a opor" — **não foi obtida**, e a
 * régua declara isso na própria superfície.
 *
 * ## Uma fonte, dois consumidores
 *
 * O rodapé de todas as rotas e a Prestação de Contas leem daqui. Entidades,
 * rótulos, ordem e ativos são os mesmos nos dois; o que muda é só a escala.
 */

export type NivelDeCredito = {
  readonly id: string;
  /** Papel na régua, no vocabulário do manual. Rótulo em `meta-ficha`. */
  readonly papel: string;
  /** Entidades do nível, na ordem em que assinam. */
  readonly instituicoes: readonly string[];
  /** Marcas oficiais deste nível, na mesma ordem. */
  readonly marcas: readonly MarcaDerivada[];
  /**
   * O traço que o manual da PNAB desenha **entre as marcas** deste bloco.
   *
   * A frase do manual é literal: "a marca Política Nacional Aldir Blanc de
   * Fomento à Cultura está ao lado de Ministério da Cultura/Governo Federal,
   * separada por um traço". O traço fica dentro do bloco de Realização,
   * separando a marca da política da assinatura conjunta federal — não antes
   * do bloco inteiro.
   */
  readonly tracoEntreMarcas: boolean;
};

function marcas(...ids: readonly string[]): readonly MarcaDerivada[] {
  return ids.map((id) => {
    const marca = MARCAS_DERIVADAS.find((candidata) => candidata.id === id);
    if (marca === undefined)
      throw new Error(`Régua de créditos: marca ausente no manifesto — ${id}.`);
    return marca;
  });
}

/**
 * A régua, com os dois blocos que o manual da PNAB Sergipe define.
 *
 * O projeto não tem nível próprio aqui. Ele teve, por um tempo, e o resultado
 * era "Realização" duas vezes lado a lado — uma para o Coletivo e outra para o
 * bloco federal, que é como o manual chama o seu. Quem realiza o projeto já
 * está declarado ao lado da régua, no bloco de identidade do rodapé e na ficha
 * da Prestação de Contas; repeti-lo aqui só desfazia o vocabulário do manual.
 */
export const REGUA_DE_CREDITOS: readonly NivelDeCredito[] = [
  {
    id: "apoio",
    papel: "Apoio",
    instituicoes: [
      "Governo do Estado de Sergipe",
      "Secretaria Especial da Cultura",
      "FUNCAP — Fundação de Cultura e Arte Aperipê de Sergipe",
    ],
    marcas: marcas("funcap", "governo-sergipe"),
    tracoEntreMarcas: false,
  },
  {
    id: "fomento",
    papel: "Realização",
    instituicoes: [
      "Política Nacional Aldir Blanc",
      "Ministério da Cultura",
      "Governo Federal",
    ],
    marcas: marcas("pnab", "mincultura-governo-federal"),
    tracoEntreMarcas: true,
  },
];

export { CAMINHO_DAS_MARCAS_INSTITUCIONAIS };

/**
 * Assinatura textual padrão, transcrita do manual de uso da marca PNAB
 * Sergipe, item 5 das orientações gerais.
 *
 * Não é redação do projeto: é o texto que o manual determina para releases e
 * textos de divulgação. Ele é a forma pela qual a exigência de citar a
 * Secretaria Especial da Cultura é cumprida, já que o ativo gráfico adotado é
 * o do Governo de Sergipe isolado, por decisão humana anterior.
 */
export const ASSINATURA_PADRAO =
  "Este projeto foi contemplado nos Editais da Política Nacional Aldir Blanc " +
  "Sergipe e tem apoio do Governo do Estado de Sergipe, por meio da Fundação " +
  "de Cultura e Arte Aperipê de Sergipe e da Secretaria Especial da Cultura, " +
  "direcionada pelo Ministério da Cultura — Governo Federal.";

/**
 * O que ainda depende de validação, dito na própria superfície.
 *
 * O manual da PNAB Sergipe condiciona a arte-final à aprovação da Funcap e da
 * Secult. As marcas já estão aplicadas conforme os manuais lidos; o que falta
 * é o aceite formal, e quem lê precisa saber a diferença entre as duas coisas.
 */
export const PENDENCIA_DAS_MARCAS =
  "Aplicação conforme os manuais oficiais de uso de marca da PNAB Sergipe, do " +
  "Governo Federal e do Governo de Sergipe. A aprovação prévia da arte-final " +
  "pela FUNCAP e pela Secretaria Especial da Cultura, prevista no manual da " +
  "PNAB, ainda não foi registrada.";
