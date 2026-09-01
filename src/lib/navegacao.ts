/**
 * Navegação do site — fonte única para cabeçalho e rodapé.
 *
 * Os destinos e rótulos vêm do mapa do site do doc 01 §3. Nenhum item é
 * inventado aqui: acrescentar entrada exige alterar o doc 01 antes.
 *
 * O menu principal tem **exatamente seis** itens — é o teto cognitivo que a
 * arquitetura de informação fixou, não um limite estético.
 */

export type ItemNavegacao = {
  readonly href: string;
  readonly rotulo: string;
};

/** Menu principal (doc 01 §3). Seis itens, nem mais nem menos. */
export const MENU_PRINCIPAL = [
  { href: "/observatorio", rotulo: "O Observatório" },
  { href: "/pesquisa", rotulo: "A Pesquisa" },
  { href: "/dados", rotulo: "Dados" },
  { href: "/campo", rotulo: "Diário de Campo" },
  { href: "/podobservar", rotulo: "PodObservar" },
  { href: "/educacao", rotulo: "Educação" },
] as const;

/** Links do rodapé (doc 01 §3). O bloco de créditos é separado. */
export const MENU_RODAPE = [
  { href: "/prestacao-de-contas", rotulo: "Prestação de Contas" },
  { href: "/imprensa", rotulo: "Imprensa" },
  { href: "/acessibilidade", rotulo: "Acessibilidade" },
  { href: "/privacidade", rotulo: "Privacidade" },
  { href: "/contato", rotulo: "Contato" },
] as const;

/** Âncora do conteúdo principal, alvo do link de pular. */
export const ID_CONTEUDO = "conteudo";
