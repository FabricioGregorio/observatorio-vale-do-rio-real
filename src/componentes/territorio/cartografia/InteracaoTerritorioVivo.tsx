"use client";

import { useEffect } from "react";

/**
 * Ilha da Cartografia Viva.
 *
 * Justificativa do `"use client"`: duas coisas que o servidor não sabe —
 * onde a leitura está e quando uma prancha se aproxima da tela.
 *
 * 1. **Mapas detalhados sob demanda.** Cada prancha declara, em
 *    `data-tv-camada`, a rota da sua camada local. Ela só é buscada quando a
 *    prancha chega perto da tela; a primeira carga da página não pede
 *    nenhuma. Até lá — e para sempre, sem JavaScript — a prancha mostra a
 *    malha do entorno e o pin, que já vêm no HTML.
 * 2. **Altura do cabeçalho.** A faixa presa encosta nele, e ele muda de
 *    altura com a largura da tela.
 * 3. **Capítulo em leitura.** A faixa dos lugares é uma lista de âncoras; a
 *    ilha marca com `aria-current="location"` a que corresponde ao capítulo
 *    na tela, e com `data-em-leitura` a própria prancha, que acende o seu
 *    "você está aqui". Nada muda de lugar, nada se esconde.
 *
 * O resto — navegação, conteúdo, realce entre faixa e carta — é HTML e CSS.
 */
export function InteracaoTerritorioVivo({ idRaiz }: { idRaiz: string }) {
  useEffect(() => {
    const raiz = document.getElementById(idRaiz);
    if (raiz === null) return;
    raiz.setAttribute("data-interativo", "true");

    /*
      O cabeçalho do site tem uma linha no desktop e duas no tablet e no
      celular. A faixa presa e as âncoras precisam da altura real; sem
      JavaScript vale o token `--altura-cabecalho`.
    */
    const topo = document.querySelector<HTMLElement>("body > .hl-topo");
    const medirTopo = () => {
      if (topo !== null) {
        raiz.style.setProperty("--tv-topo", `${topo.offsetHeight}px`);
      }
    };
    medirTopo();
    const observadorDoTopo = new ResizeObserver(medirTopo);
    if (topo !== null) observadorDoTopo.observe(topo);

    /* --- 1. Camadas locais --------------------------------------------- */

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
          const nome = atributo.name.toLowerCase();
          if (
            nome.startsWith("on") ||
            nome === "href" ||
            nome.endsWith(":href")
          ) {
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

    const pedidos = new Set<string>();
    function carregar(carta: HTMLElement) {
      const url = carta.dataset.tvCamada;
      const id = carta.dataset.tvCarta ?? "";
      if (url === undefined || pedidos.has(id)) return;
      const alvo = carta.querySelector<SVGGElement>("[data-tv-camada-local]");
      if (alvo === null) return;
      pedidos.add(id);
      carta.setAttribute("data-camada", "carregando");
      fetch(url, { credentials: "same-origin" })
        .then((resposta) => {
          if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
          return resposta.text();
        })
        .then((texto) => {
          importarSvg(alvo, texto);
          carta.setAttribute("data-camada", "local");
        })
        .catch(() => {
          // A prancha continua com a malha e o pin do HTML: nada some.
          carta.setAttribute("data-camada", "indisponivel");
        });
    }

    const cartas = Array.from(
      raiz.querySelectorAll<HTMLElement>("[data-tv-camada]"),
    );
    const observadorDeCartas = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (!entrada.isIntersecting) continue;
          const carta = entrada.target;
          if (carta instanceof HTMLElement) carregar(carta);
          observadorDeCartas.unobserve(carta);
        }
      },
      { rootMargin: "240px 0px" },
    );
    for (const carta of cartas) observadorDeCartas.observe(carta);

    /* --- 2. Capítulo em leitura ---------------------------------------- */

    const links = new Map<string, HTMLAnchorElement>();
    for (const link of Array.from(
      raiz.querySelectorAll<HTMLAnchorElement>("[data-tv-faixa] [data-tv-ir]"),
    )) {
      links.set(link.dataset.tvIr ?? "", link);
    }
    const capitulos = Array.from(
      raiz.querySelectorAll<HTMLElement>("[data-tv-capitulo]"),
    );
    const visiveis = new Set<string>();
    function marcar() {
      // O primeiro capítulo, na ordem da página, que cruza a linha de leitura.
      const atual =
        capitulos.find((c) => visiveis.has(c.dataset.tvCapitulo ?? ""))?.dataset
          .tvCapitulo ?? null;
      for (const [id, link] of links) {
        if (id === atual) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      }
      // A prancha em leitura acende o próprio "você está aqui" (só CSS lê).
      for (const capitulo of capitulos) {
        capitulo.toggleAttribute(
          "data-em-leitura",
          capitulo.dataset.tvCapitulo === atual,
        );
      }
    }
    /*
      A linha de leitura é uma faixa fina a 35% da altura: um capítulo conta
      como "em leitura" enquanto a cruza. Assim só um fica marcado de cada vez,
      e a abertura — que não é capítulo — não marca nenhum.
    */
    const observadorDeLeitura = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          const id =
            entrada.target instanceof HTMLElement
              ? (entrada.target.dataset.tvCapitulo ?? "")
              : "";
          if (entrada.isIntersecting) visiveis.add(id);
          else visiveis.delete(id);
        }
        marcar();
      },
      { rootMargin: "-35% 0px -64% 0px" },
    );
    for (const capitulo of capitulos) observadorDeLeitura.observe(capitulo);

    return () => {
      for (const capitulo of capitulos) {
        capitulo.removeAttribute("data-em-leitura");
      }
      observadorDoTopo.disconnect();
      raiz.style.removeProperty("--tv-topo");
      observadorDeCartas.disconnect();
      observadorDeLeitura.disconnect();
      raiz.removeAttribute("data-interativo");
    };
  }, [idRaiz]);

  return null;
}
