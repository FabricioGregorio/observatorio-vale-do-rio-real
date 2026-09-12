"use client";

import { useEffect } from "react";

/** Ilha DEV mínima: CSS não garante entrada única com duração temporal fixa.
 * O conteúdo nasce visível; o observador apenas acrescenta resposta de 240 ms.
 *
 * A H4.5 reaproveita esta mesma ilha em vez de criar uma segunda: os padrões
 * preservam o comportamento do laboratório de linguagem, e quem precisa de
 * outra raiz ou outro escopo passa por propriedade. Uma infraestrutura de
 * revelação por projeto, não uma por seção.
 */
export function RevelacaoVisual({
  raiz = "linguagem-visual",
  escopo = '[data-preset="B"] ',
}: {
  /** `id` do elemento que contém os blocos reveláveis. */
  readonly raiz?: string;
  /** Prefixo de seletor aplicado antes de `.lv-revelar`. Pode ser vazio. */
  readonly escopo?: string;
} = {}) {
  useEffect(() => {
    const elementoRaiz = document.getElementById(raiz);
    const preferencia = window.matchMedia("(prefers-reduced-motion: reduce)");
    let observador: IntersectionObserver | undefined;
    const atualizar = () => {
      observador?.disconnect();
      if (
        !elementoRaiz ||
        preferencia.matches ||
        !("IntersectionObserver" in window)
      )
        return;
      observador = new IntersectionObserver(
        (entradas) => {
          for (const entrada of entradas) {
            if (!entrada.isIntersecting) continue;
            entrada.target.setAttribute("data-revelado", "true");
            observador?.unobserve(entrada.target);
          }
        },
        { threshold: 0.12 },
      );
      for (const elemento of elementoRaiz.querySelectorAll(
        `${escopo}.lv-revelar:not([data-revelado])`,
      ))
        observador.observe(elemento);
    };
    atualizar();
    preferencia.addEventListener("change", atualizar);
    return () => {
      observador?.disconnect();
      preferencia.removeEventListener("change", atualizar);
    };
  }, [raiz, escopo]);
  return null;
}
