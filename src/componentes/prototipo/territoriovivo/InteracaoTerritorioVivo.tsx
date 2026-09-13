"use client";

import { useEffect } from "react";

/**
 * Ilha de interação do laboratório territorial.
 *
 * `"use client"` justificado: trocar de lugar muda estado (mapa, ficha, anúncio
 * e URL) sem recarregar. Como `MapaInterativo`, **não renderiza nada**: o
 * servidor já desenhou o mapa, a lista e todas as fichas. Sem JavaScript, a
 * lista é de âncoras e todas as fichas ficam visíveis em sequência.
 *
 * Com JavaScript, a lista vira `tablist` e as fichas viram `tabpanel`, com
 * ativação manual: setas movem o foco, Enter ou Espaço selecionam. A troca do
 * mapa é só um atributo na raiz — o enquadramento e a transição são CSS, e
 * `prefers-reduced-motion` já zera a duração nos tokens.
 */
export function InteracaoTerritorioVivo({ idRaiz }: { idRaiz: string }) {
  useEffect(() => {
    const raiz = document.getElementById(idRaiz);
    if (raiz === null) return;
    const lista = raiz.querySelector<HTMLElement>("[data-tv-lista]");
    const mapa = raiz.querySelector<SVGSVGElement>("[data-tv-mapa]");
    const tituloDoMapa = mapa?.querySelector("title") ?? null;
    const anuncio = raiz.querySelector<HTMLElement>("[data-tv-regiao-anuncio]");
    const abas = Array.from(
      raiz.querySelectorAll<HTMLAnchorElement>("[data-tv-aba]"),
    );
    if (lista === null || abas.length === 0) return;

    const paineis = new Map<string, HTMLElement>();
    for (const aba of abas) {
      const id = aba.dataset.tvAba ?? "";
      const painel = document.getElementById(`tv-painel-${id}`);
      if (painel !== null) paineis.set(id, painel);
    }

    raiz.setAttribute("data-interativo", "true");
    lista.setAttribute("role", "tablist");
    lista.setAttribute("aria-orientation", "vertical");
    for (const item of Array.from(lista.children)) {
      item.setAttribute("role", "presentation");
    }
    for (const aba of abas) {
      const id = aba.dataset.tvAba ?? "";
      aba.setAttribute("role", "tab");
      aba.setAttribute("id", `tv-aba-${id}`);
      aba.setAttribute("aria-controls", `tv-painel-${id}`);
      const painel = paineis.get(id);
      painel?.setAttribute("role", "tabpanel");
      painel?.setAttribute("aria-labelledby", `tv-aba-${id}`);
      painel?.setAttribute("tabindex", "0");
    }

    let ativo = 0;

    function selecionar(indice: number, anunciar: boolean) {
      const escolhida = abas[indice];
      if (escolhida === undefined || raiz === null) return;
      const id = escolhida.dataset.tvAba ?? "";
      raiz.setAttribute("data-lugar", id);
      raiz.setAttribute("data-foco", escolhida.dataset.tvFoco ?? "vale");
      for (const [i, aba] of abas.entries()) {
        const sim = i === indice;
        aba.setAttribute("aria-selected", sim ? "true" : "false");
        aba.setAttribute("tabindex", sim ? "0" : "-1");
        const painel = paineis.get(aba.dataset.tvAba ?? "");
        if (painel !== undefined) painel.hidden = !sim;
      }
      ativo = indice;
      const rotulo = escolhida.dataset.tvRotuloMapa ?? "";
      if (tituloDoMapa !== null) tituloDoMapa.textContent = rotulo;
      if (anunciar && anuncio !== null) {
        anuncio.textContent = escolhida.dataset.tvAnuncio ?? "";
      }
      history.replaceState(null, "", `#lugar-${id}`);
    }

    function aoTeclar(evento: KeyboardEvent) {
      const alvo = evento.target;
      if (!(alvo instanceof HTMLAnchorElement)) return;
      const indice = abas.indexOf(alvo);
      if (indice < 0) return;
      let destino: number | null = null;
      if (evento.key === "ArrowDown" || evento.key === "ArrowRight") {
        destino = Math.min(indice + 1, abas.length - 1);
      } else if (evento.key === "ArrowUp" || evento.key === "ArrowLeft") {
        destino = Math.max(indice - 1, 0);
      } else if (evento.key === "Home") {
        destino = 0;
      } else if (evento.key === "End") {
        destino = abas.length - 1;
      } else if (evento.key === "Enter" || evento.key === " ") {
        evento.preventDefault();
        selecionar(indice, true);
        return;
      }
      if (destino !== null) {
        evento.preventDefault();
        abas[destino]?.focus();
      }
    }

    function aoClicar(evento: MouseEvent) {
      const alvo = evento.target;
      if (!(alvo instanceof Element)) return;
      const aba = alvo.closest<HTMLAnchorElement>("[data-tv-aba]");
      if (aba === null) return;
      evento.preventDefault();
      selecionar(abas.indexOf(aba), true);
    }

    function aoClicarNoMapa(evento: MouseEvent) {
      const alvo = evento.target;
      if (!(alvo instanceof Element)) return;
      const chip = alvo.closest<SVGGElement>("[data-tv-chip]");
      if (chip === null) return;
      const indice = abas.findIndex(
        (aba) => aba.dataset.tvAba === chip.dataset.tvChip,
      );
      if (indice >= 0) selecionar(indice, true);
    }

    lista.addEventListener("keydown", aoTeclar);
    lista.addEventListener("click", aoClicar);
    mapa?.addEventListener("click", aoClicarNoMapa);

    const inicial = abas.findIndex(
      (aba) => `#lugar-${aba.dataset.tvAba}` === window.location.hash,
    );
    selecionar(inicial >= 0 ? inicial : ativo, false);

    return () => {
      lista.removeEventListener("keydown", aoTeclar);
      lista.removeEventListener("click", aoClicar);
      mapa?.removeEventListener("click", aoClicarNoMapa);
    };
  }, [idRaiz]);

  return null;
}
