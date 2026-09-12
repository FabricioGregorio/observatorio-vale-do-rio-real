"use client";

import { useEffect } from "react";

/** Ilha DEV mínima: CSS não garante entrada única com duração temporal fixa.
 * O conteúdo nasce visível; o observador apenas acrescenta resposta de 240 ms. */
export function RevelacaoVisual() {
  useEffect(() => {
    const raiz = document.getElementById("linguagem-visual");
    const preferencia = window.matchMedia("(prefers-reduced-motion: reduce)");
    let observador: IntersectionObserver | undefined;
    const atualizar = () => {
      observador?.disconnect();
      if (!raiz || preferencia.matches || !("IntersectionObserver" in window))
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
      for (const elemento of raiz.querySelectorAll(
        '[data-preset="B"] .lv-revelar:not([data-revelado])',
      ))
        observador.observe(elemento);
    };
    atualizar();
    preferencia.addEventListener("change", atualizar);
    return () => {
      observador?.disconnect();
      preferencia.removeEventListener("change", atualizar);
    };
  }, []);
  return null;
}
