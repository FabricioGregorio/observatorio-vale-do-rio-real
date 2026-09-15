"use client";

import { useEffect } from "react";

/**
 * Ilha de interação do laboratório territorial.
 *
 * `"use client"` justificado: trocar de lugar muda estado (mapa, ficha,
 * anúncio e URL) sem recarregar, e a camada local de cada lugar é **buscada
 * sob demanda**. O servidor já desenhou malha, pins, lista e fichas; a ilha
 * não renderiza componente nenhum.
 *
 * ## Camada local sob demanda
 *
 * - Nada é buscado na visão geral.
 * - Ao selecionar um lugar com entorno, a ilha pede o SVG à rota DEV do
 *   próprio site **uma vez**; pedidos simultâneos compartilham a mesma
 *   promessa, e o resultado fica em memória. Voltar ao lugar não repete o
 *   pedido.
 * - O SVG é lido com `DOMParser` e importado para o grupo vazio da página.
 *   Por defesa, `script`, `foreignObject` e atributos `on*` são removidos antes.
 * - Só quando a camada está no DOM a raiz ganha `data-escala="local"`; até lá,
 *   o mapa fica na aproximação regional. Falha de rede mantém a aproximação e
 *   é anunciada.
 *
 * Sem JavaScript, a lista é de âncoras e todas as fichas ficam visíveis.
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
    const voltas = Array.from(
      raiz.querySelectorAll<HTMLAnchorElement>("[data-tv-voltar]"),
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
    // No celular o seletor é uma faixa horizontal; a orientação anunciada acompanha.
    const estreita = window.matchMedia("(max-width: 767px)");
    const orientar = () =>
      lista.setAttribute(
        "aria-orientation",
        estreita.matches ? "horizontal" : "vertical",
      );
    orientar();
    estreita.addEventListener("change", orientar);
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

    const carregadas = new Set<string>();
    const pendentes = new Map<string, Promise<boolean>>();
    let geracao = 0;
    let ativo = 0;

    function importarSvg(alvo: SVGGElement, texto: string) {
      const documento = new DOMParser().parseFromString(texto, "image/svg+xml");
      if (documento.querySelector("parsererror") !== null) {
        throw new Error("SVG da camada local inválido.");
      }
      for (const perigoso of Array.from(
        documento.querySelectorAll("script, foreignObject"),
      )) {
        perigoso.remove();
      }
      for (const elemento of Array.from(documento.querySelectorAll("*"))) {
        for (const atributo of Array.from(elemento.attributes)) {
          if (atributo.name.toLowerCase().startsWith("on")) {
            elemento.removeAttribute(atributo.name);
          }
        }
      }
      const fragmento = document.createDocumentFragment();
      for (const no of Array.from(documento.documentElement.childNodes)) {
        fragmento.appendChild(document.importNode(no, true));
      }
      alvo.replaceChildren(fragmento);
    }

    function carregarCamada(id: string, url: string): Promise<boolean> {
      if (carregadas.has(id)) return Promise.resolve(true);
      const pendente = pendentes.get(id);
      if (pendente !== undefined) return pendente;
      const alvo =
        raiz?.querySelector<SVGGElement>(
          `[data-tv-camada-local="${CSS.escape(id)}"]`,
        ) ?? null;
      if (alvo === null) return Promise.resolve(false);

      const pedido = fetch(url, { credentials: "same-origin" })
        .then((resposta) => {
          if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
          return resposta.text();
        })
        .then((texto) => {
          importarSvg(alvo, texto);
          alvo.removeAttribute("data-erro");
          carregadas.add(id);
          return true;
        })
        .catch(() => {
          alvo.setAttribute("data-erro", "true");
          return false;
        })
        .finally(() => {
          pendentes.delete(id);
        });
      pendentes.set(id, pedido);
      return pedido;
    }

    function selecionar(indice: number, anunciar: boolean) {
      const escolhida = abas[indice];
      if (escolhida === undefined || raiz === null) return;
      const id = escolhida.dataset.tvAba ?? "";
      geracao += 1;
      const estaSelecao = geracao;

      raiz.removeAttribute("data-escala");
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
      if (estreita.matches && lista !== null) {
        const esquerda =
          escolhida.offsetLeft -
          (lista.clientWidth - escolhida.offsetWidth) / 2;
        lista.scrollTo({ left: Math.max(0, esquerda), behavior: "auto" });
      }
      const textoDoAnuncio = escolhida.dataset.tvAnuncio ?? "";
      if (tituloDoMapa !== null) {
        tituloDoMapa.textContent = escolhida.dataset.tvRotuloMapa ?? "";
      }
      if (anunciar && anuncio !== null) anuncio.textContent = textoDoAnuncio;
      history.replaceState(null, "", `#lugar-${id}`);

      const url = escolhida.dataset.tvCamada;
      if (url === undefined) return;
      void carregarCamada(id, url).then((ok) => {
        // Outra seleção aconteceu enquanto a camada chegava: não mexe no mapa.
        if (estaSelecao !== geracao || raiz === null) return;
        if (ok) {
          raiz.setAttribute("data-escala", "local");
          const rotuloLocal = escolhida.dataset.tvRotuloLocal;
          if (tituloDoMapa !== null && rotuloLocal !== undefined) {
            tituloDoMapa.textContent = rotuloLocal;
          }
          if (anunciar && anuncio !== null) {
            anuncio.textContent = `${textoDoAnuncio} Mapa detalhado do entorno exibido.`;
          }
        } else if (anunciar && anuncio !== null) {
          anuncio.textContent = `${textoDoAnuncio} Mapa detalhado indisponível; o mapa segue na aproximação.`;
        }
      });
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

    function voltarAoTerritorio(evento: MouseEvent) {
      evento.preventDefault();
      selecionar(0, true);
      abas[0]?.focus({ preventScroll: true });
    }

    lista.addEventListener("keydown", aoTeclar);
    lista.addEventListener("click", aoClicar);
    for (const voltar of voltas) {
      voltar.addEventListener("click", voltarAoTerritorio);
    }

    const inicial = abas.findIndex(
      (aba) => `#lugar-${aba.dataset.tvAba}` === window.location.hash,
    );
    selecionar(inicial >= 0 ? inicial : ativo, false);

    return () => {
      geracao += 1;
      lista.removeEventListener("keydown", aoTeclar);
      lista.removeEventListener("click", aoClicar);
      for (const voltar of voltas) {
        voltar.removeEventListener("click", voltarAoTerritorio);
      }
      estreita.removeEventListener("change", orientar);
    };
  }, [idRaiz]);

  return null;
}
