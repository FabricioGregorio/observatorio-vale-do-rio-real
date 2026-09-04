import type { Route } from "next";

/**
 * Caminhos prioritários da Home (Tarefa 10A).
 *
 * A lista traduz o critério de navegação do doc 01 §2 — cada público chega ao
 * seu destino em no máximo dois cliques a partir da Home — e a ordem de
 * prioridade registrada no planejamento: Prestação de Contas como ação
 * principal; A Pesquisa e PodObservar como caminhos secundários prioritários;
 * Dados como caminho secundário opcional.
 *
 * Vive em módulo próprio, sem JSX, para poder ser verificado em teste de
 * unidade sem renderizar nada.
 *
 * Os rótulos são os mesmos de `src/lib/navegacao.ts`: o mesmo nome atravessa o
 * fluxo inteiro (doc 03 §3). Não são redefinidos aqui por escolha estética — a
 * igualdade é verificada em `testes/home.test.ts`.
 */

/**
 * Estado do destino.
 *
 * `publicado` — a rota já entrega conteúdo real.
 * `em-preparacao` — a rota existe, mas ainda é estrutura sem conteúdo.
 */
export type EstadoDoCaminho = "publicado" | "em-preparacao";

export type Caminho = {
  readonly href: Route;
  readonly rotulo: string;
  /**
   * Descrição do que existe no destino. É `null` quando o destino ainda não
   * publicou conteúdo: estado vazio explícito, nunca texto plausível
   * (AGENTS.md, "criar dado fictício"). Descrever uma seção vazia como se ela
   * já entregasse algo é, num site de prestação de contas, afirmação falsa.
   */
  readonly descricao: string | null;
  readonly estado: EstadoDoCaminho;
};

export const CAMINHOS_PRIORITARIOS: readonly Caminho[] = [
  {
    href: "/prestacao-de-contas",
    rotulo: "Prestação de Contas",
    // Descrição factual do que a página já faz (doc 01 §4), na mesma redação
    // usada pela própria Sala do Avaliador. Sem quantidade: o número de anexos
    // é lido do acervo, não escrito aqui.
    descricao:
      "Anexos do projeto com endereço permanente neste domínio, data de publicação e hash SHA-256.",
    estado: "publicado",
  },
  {
    href: "/pesquisa",
    rotulo: "A Pesquisa",
    descricao: null,
    estado: "em-preparacao",
  },
  {
    href: "/podobservar",
    rotulo: "PodObservar",
    descricao: null,
    estado: "em-preparacao",
  },
  {
    href: "/dados",
    rotulo: "Dados",
    descricao: null,
    estado: "em-preparacao",
  },
];
