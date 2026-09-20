/**
 * Régua de créditos institucionais.
 *
 * ## Por que a ordem é dado, e não composição
 *
 * A ordem das assinaturas de fomento não é escolha gráfica: ela é normativa.
 * A decisão humana registrada em `docs/tarefas/16-home-v2-candidata-editorial
 * -experimental.md` §2, item 5, fixa a régua —
 *
 *     Projeto → FUNCAP + Governo de Sergipe → PNAB → separador →
 *     Ministério da Cultura + Governo Federal
 *
 * — e o "Manual de uso da marca do Governo Federal" (v1.2, ago/2025), lido na
 * mesma tarefa §8.3, estabelece o que a sustenta: ordem ascendente de
 * importância da esquerda para a direita, Governo Federal sempre por último, e
 * selo de programa de governo — a PNAB — separado por linha quando entra na
 * assinatura. Por isso `separadorAntes` é um campo, e não uma borda decidida
 * no CSS.
 *
 * A mesma decisão determina **Governo de Sergipe**, e não "Secretaria de
 * Cultura + Governo de Sergipe".
 *
 * ## O que esta régua entrega, e o que ela não entrega
 *
 * Entrega o **crédito textual**: quem financia, quem acompanha e sob que
 * política, em ordem correta e em toda página que a renderiza. Isso é
 * verificável contra documento e não depende de nenhum ativo gráfico.
 *
 * **Não entrega as marcas.** Os 23 PNG oficiais existem fora do Git
 * (tarefa 16 §8.2), nenhum derivado web foi produzido, o manual específico da
 * PNAB e o da FUNCAP não foram localizados (§8.5) e o item E02 do inventário
 * segue `PENDENTE`. Proporção, área de não interferência e largura mínima
 * saem do manual, não de estimativa — crédito de fomento errado é causa
 * recorrente de ressalva em prestação de contas (doc 01 §7, item 2). As
 * marcas entram por `CreditosInstitucionais`, que continua devolvendo `null`
 * enquanto não houver ativo aprovado.
 *
 * Nenhum nome aqui foi inventado. A forma expandida da FUNCAP é a registrada
 * em `docs/auditorias/AUDITORIA_FONTES_CANONICAS_2026-09-05.md`; a grafia
 * "PNAB / Lei Aldir Blanc" é a do doc 01 §7.
 *
 * O topo da régua — quem realiza — não é escrito aqui: ele é reexportado de
 * `home/conteudo.ts`, a declaração única do nome oficial e do Coletivo. Duas
 * grafias do mesmo nome institucional em duas superfícies é exatamente o tipo
 * de divergência que uma prestação de contas não pode ter.
 */

import { COLETIVO, NOME_OFICIAL } from "../home/conteudo";

export type NivelDeCredito = {
  readonly id: string;
  /** Papel na régua. Rótulo curto, em `meta-ficha`. */
  readonly papel: string;
  /** Instituições do nível, na ordem em que assinam. */
  readonly instituicoes: readonly string[];
  /**
   * Linha separadora antes deste nível — a do selo de programa de governo
   * exigida pelo manual federal. Só a assinatura federal a recebe.
   */
  readonly separadorAntes: boolean;
};

export const REGUA_DE_CREDITOS: readonly NivelDeCredito[] = [
  {
    id: "realizacao",
    papel: "Realização",
    instituicoes: [NOME_OFICIAL, COLETIVO],
    separadorAntes: false,
  },
  {
    id: "apoio",
    papel: "Apoio e acompanhamento",
    instituicoes: [
      "FUNCAP — Fundação de Cultura e Arte Aperipê de Sergipe",
      "Governo de Sergipe",
    ],
    separadorAntes: false,
  },
  {
    id: "politica",
    papel: "Política de fomento",
    instituicoes: ["PNAB / Lei Aldir Blanc"],
    separadorAntes: false,
  },
  {
    id: "federal",
    papel: "Assinatura federal",
    instituicoes: ["Ministério da Cultura", "Governo Federal"],
    separadorAntes: true,
  },
];

/**
 * A pendência declarada, em uma frase.
 *
 * Ela fica visível na superfície pública de propósito: o leitor precisa saber
 * que o que está ali é o crédito textual, e que o bloco de marcas ainda
 * depende da validação técnica do manual.
 */
export const PENDENCIA_DAS_MARCAS =
  "As marcas oficiais não são aplicadas aqui: proporção, ordem gráfica e área " +
  "de reserva dependem do manual de aplicação de marcas do edital, que segue " +
  "pendente. O crédito textual acima é o que está documentalmente confirmado.";
