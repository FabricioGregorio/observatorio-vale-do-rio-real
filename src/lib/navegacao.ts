/**
 * Navegação do site — fonte única para cabeçalho e rodapé.
 *
 * Os destinos, rótulos e a ordem vêm da emenda de 2026-09-15 à ADR-017.
 */

export type ItemNavegacao = {
  readonly href: Route;
  readonly rotulo: string;
};

/** Menu principal (ADR-017, emenda de 2026-09-15). Sete itens, nesta ordem. */
export const MENU_PRINCIPAL: readonly ItemNavegacao[] = [
  { href: "/observatorio", rotulo: "O Observatório" },
  { href: "/pesquisa", rotulo: "A Pesquisa" },
  { href: "/territorio", rotulo: "Território" },
  { href: "/dados", rotulo: "Dados" },
  { href: "/campo", rotulo: "Diário de Campo" },
  { href: "/podobservar", rotulo: "PodObservar" },
  { href: "/acervo", rotulo: "Acervo" },
] as const;

/** Links do rodapé (doc 01 §3). O bloco de créditos é separado. */
export const MENU_RODAPE: readonly ItemNavegacao[] = [
  { href: "/prestacao-de-contas", rotulo: "Prestação de Contas" },
  { href: "/imprensa", rotulo: "Imprensa" },
  { href: "/acessibilidade", rotulo: "Acessibilidade" },
  { href: "/privacidade", rotulo: "Privacidade" },
  { href: "/contato", rotulo: "Contato" },
] as const;

/** Âncora do conteúdo principal, alvo do link de pular. */
export const ID_CONTEUDO = "conteudo";

/**
 * Identificador do cabeçalho servido na Home pública.
 *
 * Vive aqui, e não no componente, porque desde a promoção da Home v2
 * (2026-09-16) duas cascas podem ocupar esse lugar — a do protótipo H1 e a da
 * Home v2 — e o contrato verificado pelos testes de navegação é o
 * identificador, não qual componente o renderiza.
 */
export const ID_CABECALHO_HOME = "cabecalho-home";

import type { Route } from "next";
