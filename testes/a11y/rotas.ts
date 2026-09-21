/**
 * As rotas públicas do site, em um lugar só.
 *
 * A lista vivia dentro de `titulos.spec.ts`, e as demais suítes mantinham
 * recortes próprios. Rota nova entrava numa lista e faltava nas outras — que
 * é exatamente como uma página vai ao ar sem passar por um dos contratos.
 *
 * Aqui ela é declarada uma vez, com o título esperado, e as suítes a
 * importam. Não é helper de teste: é a definição de quais endereços o site
 * promete servir.
 *
 * Rotas dinâmicas (`/acervo/[documento]`, `/podobservar/t1/[episodio]`) ficam
 * fora: elas são cobertas pelas suítes do Acervo e do PodObservar, que as
 * resolvem contra o acervo real em vez de fixar um identificador.
 */

export const ROTAS_PUBLICAS = [
  ["/", "Observatório do Vale do Rio Real"],
  ["/observatorio", "O Observatório — Observatório do Vale do Rio Real"],
  ["/pesquisa", "A Pesquisa — Observatório do Vale do Rio Real"],
  ["/territorio", "Território — Observatório do Vale do Rio Real"],
  ["/dados", "Dados — Observatório do Vale do Rio Real"],
  ["/campo", "Diário de Campo — Observatório do Vale do Rio Real"],
  ["/podobservar", "PodObservar — Observatório do Vale do Rio Real"],
  ["/acervo", "Acervo — Observatório do Vale do Rio Real"],
  ["/prestacao-de-contas", "Prestação de Contas — Sala do Avaliador"],
  ["/prestacao-de-contas/imprimir", "Prestação de Contas — versão imprimível"],
  ["/acessibilidade", "Acessibilidade — Observatório do Vale do Rio Real"],
  ["/privacidade", "Privacidade — Observatório do Vale do Rio Real"],
  ["/contato", "Contato — Observatório do Vale do Rio Real"],
] as const;

/** Só os endereços, para as suítes que não conferem título. */
export const ENDERECOS_PUBLICOS: readonly string[] = ROTAS_PUBLICAS.map(
  ([rota]) => rota,
);

/**
 * Frases que uma superfície pública não pode mais conter.
 *
 * Cada uma existiu de fato no site: a primeira era o corpo dos seis stubs de
 * rota, e as outras duas rotulavam seções que hoje estão publicadas. Um
 * `merge` que as trouxesse de volta não quebraria mais nada — só voltaria a
 * dizer, para quem lê, que o projeto não entregou o que entregou.
 */
export const FRASES_PROIBIDAS: readonly RegExp[] = [
  /esta seção ainda não tem conteúdo publicado/i,
  /em preparação/i,
  /em breve/i,
  /lorem ipsum/i,
  /\bplaceholder\b/i,
  /conteúdo provisório/i,
];
