import { z } from "zod";

import type { Fonte } from "./conteudo";

/**
 * Variações da abertura do experimento `/dev/home-livre`.
 *
 * Só a abertura varia. Tudo que vem depois dela é o mesmo componente, com o
 * mesmo DOM, em qualquer variação. A escolha vem de `?hero=` na URL: é entrada
 * externa, e por isso passa por Zod; valor desconhecido cai na abertura atual.
 */

export const VARIANTES_DA_ABERTURA = ["atual", "a", "b", "b2", "c"] as const;
export type VarianteDaAbertura = (typeof VARIANTES_DA_ABERTURA)[number];

/**
 * Onde a Home v2 está sendo renderizada.
 *
 * Desde a decisão humana de 2026-09-16 a candidata deixou de ser alternativa
 * experimental e passou a servir `/`. A mesma implementação atende os dois
 * lugares — duplicar a Home para publicá-la criaria exatamente a divergência
 * que a decisão veio encerrar. O que muda entre eles é só a casca:
 *
 * - `dev`: mantém o aviso de experimento e o seletor de abertura, que são
 *   instrumentos do laboratório e não podem aparecer em conteúdo público;
 * - `publico`: usa a navegação canônica de sete itens (`MENU_PRINCIPAL`) com
 *   o menu de telas estreitas, e nenhum rótulo de desenvolvimento.
 *
 * Nada da composição editorial varia com este parâmetro.
 */
export type ContextoDaHome = "dev" | "publico";

const ESQUEMA_DA_VARIANTE = z.enum(VARIANTES_DA_ABERTURA);

export function lerVarianteDaAbertura(
  valor: string | string[] | undefined,
): VarianteDaAbertura {
  const unico = Array.isArray(valor) ? valor[0] : valor;
  const lido = ESQUEMA_DA_VARIANTE.safeParse(unico);
  // Rodada 4: B2 é a abertura candidata. As demais seguem acessíveis por
  // `?hero=` apenas como registro da exploração encerrada.
  return lido.success ? lido.data : "b2";
}

export const ROTULO_DA_VARIANTE: Readonly<Record<VarianteDaAbertura, string>> =
  {
    atual: "Atual",
    a: "A · Editorial institucional",
    b: "B · Fotográfica/documental",
    b2: "B2 · Refinamento da B",
    c: "C · Tipográfica/cartográfica",
  };

/** Nome curto já usado pelo site nos metadados (`src/app/layout.tsx`). */
export const NOME_CURTO = "Observatório do Vale do Rio Real";

/** Partição tipográfica do nome oficial — o texto continua literal. */
export const NOME_OFICIAL_EM_PARTES = [
  "Observatório de",
  "Cultura e Economia Criativa",
  "da Região do Vale do Rio Real",
] as const;

/** Texto aprovado na H1 §12, o mesmo do Hero público. */
export const INICIATIVA = "Uma iniciativa do";

export const TERRITORIO = "Vale do Rio Real, Sergipe";

/** PROPOSTA editorial — requer aprovação humana. */
export const PROPOSTA_PROPOSITO =
  "Um observatório que foi a campo para registrar a cultura e a economia criativa do Vale do Rio Real — e tornar público o que encontrou.";

/** PROPOSTA editorial — requer aprovação humana. */
export const PROPOSTA_LEDE =
  "A pesquisa esteve em equipamentos culturais, conversou com gestores públicos e reuniu os registros de quem mantém esses lugares funcionando.";

/** PROPOSTA editorial — descritor curto de régua. */
export const PROPOSTA_DESCRITOR =
  "Pesquisa territorial · cultura e economia criativa";

export const CTA_DA_PESQUISA = "Conhecer a pesquisa";

/**
 * Nota documental da fotografia. O pertencimento ao conjunto de campo do
 * Recanto da Serra está sustentado pelo hash idêntico e foi reconhecido pelo
 * responsável; a atribuição formal de local continua pendente.
 */
export const NOTA_DA_FOTOGRAFIA = {
  titulo: "Caminho de chegada",
  conjunto: "Recanto da Serra",
  data: "05/04/2026",
} as const;

/** Sumário: a estrutura real desta página, com as âncoras que já existem. */
export const SUMARIO = [
  { numero: "I", rotulo: "Origem", href: "#hl-origem" },
  { numero: "II", rotulo: "Território", href: "#hl-territorio" },
  { numero: "III", rotulo: "Lugares", href: "#hl-lugares" },
  { numero: "IV", rotulo: "Onde o recurso circula", href: "#hl-leitura" },
  { numero: "V", rotulo: "Escuta", href: "#hl-escuta" },
  { numero: "VI", rotulo: "Produtos", href: "#hl-produtos" },
  { numero: "VII", rotulo: "Prestação de Contas", href: "#hl-conferencia" },
] as const;

export const FONTES_DAS_VARIACOES: readonly Fonte[] = [
  {
    afirmacao: "Nome oficial e nome curto",
    base: "Nome oficial: Direção Visual §8.4. Nome curto: título já usado nos metadados do site (src/app/layout.tsx). Nenhum nome novo.",
  },
  {
    afirmacao: "“Uma iniciativa do Coletivo Cultural “Tobias, sou Eu!””",
    base: "Texto aprovado na H1 §12, o mesmo do Hero público.",
  },
  {
    afirmacao: "Edital PNAB nº 02/2025; Vale do Rio Real, Sergipe",
    base: "docs/01-arquitetura-informacao.md, cabeçalho; src/dados/territorio/recorte.ts.",
  },
  {
    afirmacao: "Contagens (equipamentos, entrevistas, municípios)",
    base: "Derivadas no componente de EQUIPAMENTOS, ENTREVISTAS e RECORTE_TERRITORIAL. Nenhuma escrita à mão.",
  },
  {
    afirmacao: "Fotografia",
    base: "Derivado público já existente. SHA-256 do original idêntico ao de um arquivo do conjunto de campo do Recanto da Serra. Atribuição formal de local pendente.",
  },
  {
    afirmacao: "Fragmento cartográfico",
    base: "Malha IBGE e recorte.ts. Marcadores numerados são rótulos de município, não pontos de visita.",
  },
  {
    afirmacao: "Frase de propósito, parágrafo de apoio e descritor",
    base: "PROPOSTAS editoriais novas. Sustentação: entrevistas, formulários de funcionamento e A02 público. Requerem aprovação humana.",
  },
];

/**
 * Fontes da B2. A frase de propósito foi aprovada pelo responsável como base
 * editorial do experimento em 2026-09-13; B2 não usa mapa, descritor nem o
 * parágrafo de apoio, e por isso essas entradas não se repetem aqui.
 */
export const FONTES_DA_B2: readonly Fonte[] = [
  {
    afirmacao: "Frase de propósito",
    base: "Aprovada pelo responsável em 2026-09-13 como base editorial do experimento. Não autoriza outras afirmações.",
  },
  ...FONTES_DAS_VARIACOES.filter(
    (fonte) =>
      fonte.afirmacao !== "Fragmento cartográfico" &&
      fonte.afirmacao !== "Frase de propósito, parágrafo de apoio e descritor",
  ),
];
