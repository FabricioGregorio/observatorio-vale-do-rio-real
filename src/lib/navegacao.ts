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

/**
 * Links institucionais do rodapé (doc 01 §3).
 *
 * `MENU_RODAPE` chamava-se assim quando o rodapé era só esta lista. Com o
 * rodapé definitivo ele passou a ser a **faixa institucional** dele: as
 * seções do site vêm de `MENU_PRINCIPAL`, e a Prestação de Contas entra ao
 * lado delas, porque é seção e não página institucional.
 *
 */
export const MENU_INSTITUCIONAL: readonly ItemNavegacao[] = [
  { href: "/acessibilidade", rotulo: "Acessibilidade" },
  { href: "/privacidade", rotulo: "Privacidade" },
  { href: "/contato", rotulo: "Contato" },
] as const;

/**
 * Descrição de uma linha para as rotas de conteúdo, no painel "Conteúdos" do
 * cabeçalho.
 *
 * Mora aqui, junto do resto da navegação, e não dentro do componente cliente:
 * o teste de navegação precisa lê-la, e importar o componente arrasta
 * `next/link` para dentro do runner. Antes o teste repetia cada descrição
 * palavra por palavra, e uma revisão editorial quebrava um teste de
 * navegação sem que nada de navegação tivesse mudado.
 */
export const DESCRICOES_DE_CONTEUDO = {
  "/campo": "Registros das visitas e do trabalho em território",
  "/podobservar": "A pesquisa em áudio, com transcrição de cada episódio",
  "/acervo": "Fotografias, documentos e memória",
} as const;

/** Âncora do conteúdo principal, alvo do link de pular. */
export const ID_CONTEUDO = "conteudo";

/**
 * Identificador do cabeçalho público.
 *
 * Vive aqui, e não no componente, porque o contrato verificado pelos testes de
 * navegação é o identificador, não qual componente o renderiza.
 */
export const ID_CABECALHO_HOME = "cabecalho-home";

import type { Route } from "next";
