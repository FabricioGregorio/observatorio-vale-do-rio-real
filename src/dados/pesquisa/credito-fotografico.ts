/**
 * Crédito de autoria de fotografia de terceiro.
 *
 * ## Onde o crédito é guardado, e por quê
 *
 * A decisão humana de 2026-09-16 manteve públicas as duas fotografias com
 * autoria de terceiro e tornou o crédito **obrigatório**. O modelo documental
 * não tem campo de autoria por objeto físico: `documento.autoria` é da obra
 * inteira, e B01 é um documento só com 59 fotografias — atribuir o conjunto a
 * um autor seria falso. O único texto por arquivo que a arquitetura oferece é
 * `documento_arquivo.rotulo`.
 *
 * Então o crédito viaja **dentro do rótulo**, com separador declarado, e este
 * módulo é o único lugar que compõe e desfaz essa forma. Produtor e consumidor
 * usam as mesmas duas funções; ninguém escreve a string à mão.
 *
 * Isso é um acordo de texto, não um campo tipado. A proposta de uma coluna
 * `arquivo.credito` própria está em `docs/decisoes/ADR-018-credito-de-autoria-
 * de-arquivo.md` e depende de decisão humana — mudar schema não é atribuição
 * do agente.
 */

/** Separador entre a identidade do arquivo e o crédito. Nunca inline. */
export const SEPARADOR_DE_CREDITO = " — Foto: ";

/** Rótulo com crédito acoplado; sem autor, devolve o rótulo intacto. */
export function montarRotulo(base: string, autor: string | null): string {
  return autor === null ? base : `${base}${SEPARADOR_DE_CREDITO}${autor}`;
}

export type RotuloSeparado = {
  /** Identidade do arquivo, sem o crédito. */
  readonly rotulo: string;
  /** Texto de exibição do crédito, já na forma final, ou `null`. */
  readonly credito: string | null;
};

/**
 * Desfaz `montarRotulo`. O crédito volta pronto para exibição — `Foto: Dani
 * Santos` — para que nenhuma interface precise reescrever o prefixo e correr
 * o risco de perdê-lo.
 */
export function separarCredito(rotulo: string | null): RotuloSeparado {
  if (rotulo === null) return { rotulo: "", credito: null };
  const corte = rotulo.indexOf(SEPARADOR_DE_CREDITO);
  if (corte < 0) return { rotulo, credito: null };
  const autor = rotulo.slice(corte + SEPARADOR_DE_CREDITO.length).trim();
  if (autor.length === 0) return { rotulo, credito: null };
  return { rotulo: rotulo.slice(0, corte), credito: `Foto: ${autor}` };
}
