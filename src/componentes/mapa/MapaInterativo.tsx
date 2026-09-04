"use client";

import { useEffect } from "react";

/**
 * Ilha de interação do mapa — Tarefa 10B.3.3.
 *
 * **Único Client Component do mapa, e ele não renderiza nada.** Só
 * comportamento: encontra o SVG que o servidor já desenhou e promove os
 * polígonos a opções selecionáveis.
 *
 * ## Por que ela não recebe o SVG como `children`
 *
 * Passar o SVG server-renderizado como `children` de um Client Component
 * pareceria mais idiomático, mas os 75 caminhos seriam serializados também no
 * payload RSC — os mesmos ~48 kB de geometria apareceriam duas vezes no
 * documento. A ilha alcança o SVG pelo `id`, e o custo em JavaScript fica
 * sendo só o desta função.
 *
 * ## Por que o servidor não manda os atributos interativos
 *
 * Client Component também renderiza no servidor. Se `role="listbox"` e
 * `tabindex` viessem do HTML, o mapa prometeria navegação por teclado antes de
 * o JavaScript existir — e para quem tem JavaScript desligado, prometeria para
 * sempre. Os atributos entram depois da montagem. Sem JavaScript, o mapa é
 * ilustração e a informação está na lista territorial, que é completa.
 *
 * ## Padrão
 *
 * `listbox` com **roving tabindex**: o mapa é **uma** parada de Tab, não 75.
 * Dentro dele, setas movem, Home e End vão às pontas, Enter e Espaço
 * selecionam, Esc limpa a seleção. Mouse e toque continuam funcionando pelo
 * mesmo caminho de seleção.
 */

/** Teclas que movem para o próximo e para o anterior. */
const AVANCA = new Set(["ArrowRight", "ArrowDown"]);
const RECUA = new Set(["ArrowLeft", "ArrowUp"]);

export function MapaInterativo({
  idDoSvg,
  idDaLista,
}: {
  idDoSvg: string;
  idDaLista: string;
}) {
  useEffect(() => {
    const svg = document.getElementById(idDoSvg);
    const lista = document.getElementById(idDaLista);
    if (svg === null) return;

    const opcoes = Array.from(
      svg.querySelectorAll<SVGPathElement>("path[data-codigo]"),
    );
    if (opcoes.length === 0) return;

    // O SVG deixa de ser imagem e passa a ser uma lista de opções.
    svg.removeAttribute("role");
    svg.setAttribute("role", "listbox");
    svg.setAttribute("data-interativo", "true");

    let ativo = 0;
    let selecionado: number | null = null;

    for (const [indice, opcao] of opcoes.entries()) {
      opcao.setAttribute("role", "option");
      opcao.setAttribute("aria-selected", "false");
      opcao.setAttribute("tabindex", indice === 0 ? "0" : "-1");
    }

    /** Roving tabindex: só o ativo é alcançável por Tab. */
    function mover(destino: number, focar: boolean) {
      const anterior = opcoes[ativo];
      const proximo = opcoes[destino];
      if (proximo === undefined) return;
      if (anterior !== undefined) anterior.setAttribute("tabindex", "-1");
      proximo.setAttribute("tabindex", "0");
      ativo = destino;
      if (focar) proximo.focus();
    }

    function itemDaLista(indice: number): HTMLElement | null {
      const codigo = opcoes[indice]?.dataset.codigo;
      if (codigo === undefined || lista === null) return null;
      return lista.querySelector<HTMLElement>(`[data-codigo="${codigo}"]`);
    }

    function selecionar(indice: number) {
      if (selecionado !== null) {
        opcoes[selecionado]?.setAttribute("aria-selected", "false");
        itemDaLista(selecionado)?.removeAttribute("data-selecionado");
      }
      selecionado = indice;
      opcoes[indice]?.setAttribute("aria-selected", "true");

      const item = itemDaLista(indice);
      if (item !== null) {
        item.setAttribute("data-selecionado", "true");
        // `nearest` e sem animação: rolagem brusca atrapalha, e
        // `prefers-reduced-motion` não deve ser contrariado.
        item.scrollIntoView({ block: "nearest", behavior: "auto" });
      }
    }

    function limparSelecao() {
      if (selecionado === null) return;
      opcoes[selecionado]?.setAttribute("aria-selected", "false");
      itemDaLista(selecionado)?.removeAttribute("data-selecionado");
      selecionado = null;
    }

    function aoTeclar(evento: KeyboardEvent) {
      if (AVANCA.has(evento.key)) {
        evento.preventDefault();
        mover(Math.min(ativo + 1, opcoes.length - 1), true);
        return;
      }
      if (RECUA.has(evento.key)) {
        evento.preventDefault();
        mover(Math.max(ativo - 1, 0), true);
        return;
      }
      if (evento.key === "Home") {
        evento.preventDefault();
        mover(0, true);
        return;
      }
      if (evento.key === "End") {
        evento.preventDefault();
        mover(opcoes.length - 1, true);
        return;
      }
      if (evento.key === "Enter" || evento.key === " ") {
        evento.preventDefault();
        selecionar(ativo);
        return;
      }
      if (evento.key === "Escape") {
        limparSelecao();
      }
    }

    function aoClicar(evento: Event) {
      const alvo = evento.target;
      if (!(alvo instanceof Element)) return;
      const opcao = alvo.closest("path[data-codigo]");
      if (opcao === null) return;
      const indice = opcoes.indexOf(opcao as SVGPathElement);
      if (indice < 0) return;
      mover(indice, false);
      selecionar(indice);
    }

    /** Tab para dentro cai no ativo, não no primeiro por acidente. */
    function aoFocar(evento: FocusEvent) {
      const alvo = evento.target;
      if (!(alvo instanceof Element)) return;
      const indice = opcoes.indexOf(alvo as SVGPathElement);
      if (indice >= 0) ativo = indice;
    }

    svg.addEventListener("keydown", aoTeclar);
    svg.addEventListener("click", aoClicar);
    svg.addEventListener("focusin", aoFocar);

    return () => {
      svg.removeEventListener("keydown", aoTeclar);
      svg.removeEventListener("click", aoClicar);
      svg.removeEventListener("focusin", aoFocar);
      svg.removeAttribute("data-interativo");
      for (const opcao of opcoes) {
        opcao.removeAttribute("role");
        opcao.removeAttribute("aria-selected");
        opcao.removeAttribute("tabindex");
      }
    };
  }, [idDoSvg, idDaLista]);

  return null;
}
