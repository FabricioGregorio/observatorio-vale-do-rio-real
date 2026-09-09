import type { Route } from "next";

/**
 * Menu alvo do frontend — casca visual do protótipo. Fase H1.
 *
 * A composição aprovada está na Direção Visual §8.3 e registrada na
 * [ADR-017](../../../docs/decisoes/ADR-017-navegacao-alvo-do-frontend.md):
 *
 *     Observatório · Território · Pesquisa · Dados · PodObservar · Acervo
 *
 * ## Por que os destinos são separados do rótulo
 *
 * `/territorio` e `/acervo` **não existem**. A ADR-017 é explícita: nenhuma
 * rota falsa, nenhuma página "em breve", nenhum link quebrado. E
 * `typedRoutes: true` reprovaria em `pnpm tipos` qualquer `<Link>` para rota
 * inexistente — a checagem do projeto é o que impede o atalho.
 *
 * O protótipo precisa mostrar os seis nomes para que a composição do cabeçalho
 * possa ser avaliada. A saída é distinguir os dois casos no próprio dado:
 *
 * - item com `href` → link de verdade, para rota que existe;
 * - item sem `href` → **estado de demonstração**, que o componente renderiza
 *   como texto e nunca como link.
 *
 * Isso não pode chegar à Home pública nessa forma. Quando `/territorio` e
 * `/acervo` existirem, os dois itens ganham `href` e este módulo deixa de
 * precisar da distinção.
 */

export type ItemDoMenuAlvo = {
  readonly rotulo: string;
  /** `null` quando a rota ainda não existe. Nunca inventar destino. */
  readonly href: Route | null;
};

export const MENU_ALVO: readonly ItemDoMenuAlvo[] = [
  { rotulo: "Observatório", href: "/observatorio" },
  { rotulo: "Território", href: null },
  { rotulo: "Pesquisa", href: "/pesquisa" },
  { rotulo: "Dados", href: "/dados" },
  { rotulo: "PodObservar", href: "/podobservar" },
  { rotulo: "Acervo", href: null },
];

/** Itens que já têm destino verdadeiro. Usado em teste e no relatório. */
export const ITENS_COM_DESTINO = MENU_ALVO.filter((item) => item.href !== null);

/** Itens em estado de demonstração — sem destino, e por isso sem link. */
export const ITENS_EM_DEMONSTRACAO = MENU_ALVO.filter(
  (item) => item.href === null,
);
