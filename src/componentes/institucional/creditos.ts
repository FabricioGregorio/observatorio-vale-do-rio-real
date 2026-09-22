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
 * da decisão humana de 2026-09-17. Nesta
 * rodada os três manuais oficiais foram localizados em
 * `OBSERVATORIO_FONTES_DIR/marcas/` e lidos, e a régua passa a ser o que eles
 * determinam:
 *
 * - **Manual de uso da marca PNAB Sergipe.** É obrigatória a veiculação da
 *   régua de marcas em toda divulgação do projeto — sites inclusive. O bloco
 *   se divide em **Apoio** (FUNCAP, Secretaria Especial da Cultura e Governo
 *   de Sergipe) e **Realização** (Sistema Nacional de Cultura, PNAB e a
 *   assinatura conjunta Ministério da Cultura/Governo Federal, separada da
 *   PNAB por um traço e fechando o bloco à extrema direita). Nenhuma marca do
 *   bloco pode ultrapassar a altura e a largura total da marca nominativa do
 *   Governo Federal.
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
 * O manual da PNAB chama o bloco federal de **Realização**. A obrigação de
 * submissão da arte-final à Funcap e à Secult continua registrada na
 * documentação interna do projeto; ela não é texto editorial da régua.
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
  readonly tracoAntesDaMarca: string | null;
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
      "FUNCAP — Fundação de Cultura e Arte Aperipê de Sergipe",
      "Secretaria Especial da Cultura",
      "Governo do Estado de Sergipe",
    ],
    marcas: marcas("funcap", "secretaria-sergipe"),
    tracoAntesDaMarca: null,
  },
  {
    id: "fomento",
    papel: "Realização",
    instituicoes: [
      "Sistema Nacional de Cultura",
      "Política Nacional Aldir Blanc",
      "Ministério da Cultura",
      "Governo do Brasil",
    ],
    marcas: marcas("snc", "pnab", "mincultura-governo-federal"),
    tracoAntesDaMarca: "mincultura-governo-federal",
  },
];

export { CAMINHO_DAS_MARCAS_INSTITUCIONAIS };

/**
 * Assinatura textual padrão, transcrita do manual de uso da marca PNAB
 * Sergipe, item 5 das orientações gerais.
 *
 * Não é redação do projeto: é o texto que o manual determina para releases e
 * textos de divulgação.
 */
export const ASSINATURA_PADRAO =
  "Este projeto foi contemplado nos Editais da Política Nacional Aldir Blanc " +
  "Sergipe e tem apoio do Governo do Estado de Sergipe, por meio da Fundação " +
  "de Cultura e Arte Aperipê de Sergipe e da Secretaria Especial da Cultura, " +
  "direcionada pelo Ministério da Cultura — Governo Federal.";
