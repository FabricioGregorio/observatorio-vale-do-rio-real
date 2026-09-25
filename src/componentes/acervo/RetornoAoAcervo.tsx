"use client";

import type { Route } from "next";
import { useSearchParams } from "next/navigation";

import { ActionLink } from "../ui/ActionLink";

/**
 * Destino do retorno ao Acervo, a partir da query da ficha.
 *
 * Quem abre um documento a partir de uma busca chega com `?q=` e `&tipo=` —
 * o card do resultado os leva junto. Aqui eles voltam ao índice. A URL é a
 * única memória: sem `history.back()`, sem armazenamento no navegador, sem
 * estado global. Entrada direta, nova aba ou Google chegam sem query, e o
 * destino é simplesmente `/acervo`.
 *
 * `q` passa pelo mesmo corte de 120 caracteres da busca; `tipo` só volta se
 * for um tipo que o Acervo conhece — o resto é descartado, e não repassado.
 */
export function destinoDoRetorno(
  parametros: { get(nome: string): string | null },
  tipos: readonly string[],
): { href: string; comContexto: boolean } {
  const consulta = new URLSearchParams();
  const q = parametros.get("q")?.trim().slice(0, 120) ?? "";
  const tipo = parametros.get("tipo") ?? "";
  if (q) consulta.set("q", q);
  if (tipo && tipos.includes(tipo)) consulta.set("tipo", tipo);
  return consulta.size > 0
    ? { href: `/acervo?${consulta.toString()}`, comContexto: true }
    : { href: "/acervo", comContexto: false };
}

export function RetornoAoAcervo({ tipos }: { tipos: readonly string[] }) {
  const { href, comContexto } = destinoDoRetorno(useSearchParams(), tipos);
  return (
    <ActionLink variant="text" href={href as Route} voltar>
      {comContexto ? "Voltar aos resultados do Acervo" : "Voltar ao Acervo"}
    </ActionLink>
  );
}

/** O mesmo link sem query: é o que existe antes da hidratação, e sem JS. */
export function RetornoSemContexto() {
  return (
    <ActionLink variant="text" href="/acervo" voltar>
      Voltar ao Acervo
    </ActionLink>
  );
}
