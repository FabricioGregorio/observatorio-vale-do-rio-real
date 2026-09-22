"use client";

import { useEffect } from "react";

/**
 * Hide-on-scroll do cabeçalho — Fase H1, protótipo.
 *
 * `"use client"` justificado: direção de rolagem é evento do navegador.
 *
 * **Não renderiza nada.** Encontra o cabeçalho pelo `id` e alterna um atributo;
 * quem esconde e mostra é o CSS. É o mesmo padrão já validado em
 * `MapaInterativo`, e mantém o custo em JavaScript proporcional ao
 * comportamento, não ao conteúdo.
 *
 * ## As quatro travas
 *
 * Um cabeçalho que some é uma armadilha de acessibilidade se sumir na hora
 * errada. Quatro condições impedem isso:
 *
 * 1. **foco dentro do cabeçalho** — reaparece na hora e não some enquanto o
 *    foco estiver lá. Quem navega por teclado não persegue alvo em movimento
 *    (WCAG 2.2 — 2.4.11, foco não obscurecido);
 * 2. **painel aberto** — se a Central de Acessibilidade está aberta, o
 *    cabeçalho fica. Esconder um `dialog` aberto o desconectaria do gatilho;
 *    detectado por `aria-expanded`, sem acoplar os dois componentes;
 * 3. **viewport curta** — abaixo de 480 px de altura, ou com zoom alto, a área
 *    útil é pequena demais para um elemento que entra e sai;
 * 4. **`prefers-reduced-motion`** — a troca continua acontecendo, mas sem
 *    transição. É o CSS que resolve, com os tokens de duração que a H0 já zera
 *    sob a preferência.
 *
 * O limiar de 8 px evita que o cabeçalho pisque com rolagem trêmula, de mouse
 * de precisão ou de trackpad.
 */

const LIMIAR = 8;
const ALTURA_MINIMA_DA_JANELA = 480;

export function CabecalhoReativo({ idDoCabecalho }: { idDoCabecalho: string }) {
  useEffect(() => {
    const cabecalho = document.getElementById(idDoCabecalho);
    if (cabecalho === null) return;

    let anterior = window.scrollY;

    function mostrar() {
      cabecalho?.setAttribute("data-recolhido", "false");
    }

    function aoRolar() {
      if (cabecalho === null) return;

      const atual = window.scrollY;
      const desceu = atual > anterior;
      const andou = Math.abs(atual - anterior) > LIMIAR;
      anterior = atual;

      if (!andou) return;

      const focoDentro = cabecalho.contains(document.activeElement);
      const painelAberto =
        cabecalho.querySelector('[aria-expanded="true"]') !== null;
      const janelaCurta = window.innerHeight < ALTURA_MINIMA_DA_JANELA;

      if (focoDentro || painelAberto || janelaCurta || atual <= 0) {
        mostrar();
        return;
      }

      cabecalho.setAttribute("data-recolhido", desceu ? "true" : "false");
    }

    window.addEventListener("scroll", aoRolar, { passive: true });
    cabecalho.addEventListener("focusin", mostrar);

    return () => {
      window.removeEventListener("scroll", aoRolar);
      cabecalho.removeEventListener("focusin", mostrar);
      cabecalho.removeAttribute("data-recolhido");
    };
  }, [idDoCabecalho]);

  return null;
}
