"use client";

import { useEffect } from "react";

/**
 * Ilha da Cartografia Viva.
 *
 * Justificativa do `"use client"`: o servidor não sabe onde a leitura está,
 * de onde o visitante saiu, nem quando uma prancha se aproxima da tela.
 *
 * 1. **Mapas detalhados sob demanda.** Cada prancha declara, em
 *    `data-tv-camada`, a rota da sua camada local. Ela só é buscada quando a
 *    prancha chega perto da tela; a primeira carga da página não pede
 *    nenhuma. Até lá — e para sempre, sem JavaScript — a prancha mostra a
 *    malha do entorno e o pin, que já vêm no HTML.
 * 2. **Altura do cabeçalho.** A faixa presa encosta nele, e ele muda de
 *    altura com a largura da tela.
 * 3. **Capítulo em leitura.** Uma linha de leitura fixa, logo abaixo da faixa;
 *    o capítulo que a contém é o atual. Na abertura, o atual é o Vale — a
 *    carta geral é a leitura do conjunto. `aria-current="location"` na faixa
 *    e `data-em-leitura` na prancha seguem esse estado, e só ele.
 * 4. **Destino.** Ao seguir uma âncora de lugar, o destino vale desde o
 *    clique: a faixa marca o capítulo de chegada, e a carta mantém o lugar
 *    aceso enquanto a página rola. Sem isso, a rolagem suave atravessaria os
 *    capítulos do meio e a faixa piscaria por todos eles.
 * 5. **Origem.** Ao voltar à carta — pelo link de volta ou pelo Voltar do
 *    navegador —, o último lugar lido fica aceso por um instante antes de a
 *    carta voltar ao estado geral. Pelo teclado, o foco volta ao item da
 *    faixa desse lugar: é de lá que a pessoa saiu.
 *
 * O teclado na faixa é o dos links nativos: Tab e Shift+Tab entre eles,
 * Enter segue a âncora. Nenhuma tecla é interceptada — a faixa é navegação,
 * e não um padrão de tablist ou menu.
 *
 * O resto — navegação, conteúdo, realce entre faixa e carta — é HTML e CSS.
 * Os estados daqui são atributos na raiz; `estilos.ts` e o CSS gerado em
 * `TerritorioVivo` decidem o que eles significam visualmente.
 */

/** Quanto a carta mostra o lugar de origem antes de voltar ao estado geral. */
const DURACAO_DA_ORIGEM = 1600;
/** Quanto a janela do localizador fica realçada quando o mapa chega. */
const DURACAO_DA_CHEGADA_DA_CAMADA = 1400;
/** Rede de segurança para navegador sem `scrollend`. */
const ESPERA_SEM_SCROLLEND = 900;
/** Teto para uma rolagem suave que nunca anuncie o próprio fim. */
const ESPERA_MAXIMA_DA_ROLAGEM = 3000;
/** Linha de leitura: esta fração da área visível abaixo do topo fixo. */
const LINHA_DE_LEITURA = 0.3;

export function InteracaoTerritorioVivo({ idRaiz }: { idRaiz: string }) {
  useEffect(() => {
    const encontrada = document.getElementById(idRaiz);
    if (encontrada === null) return;
    // Constante já não nula: as funções internas herdam o tipo.
    const raiz: HTMLElement = encontrada;
    raiz.setAttribute("data-interativo", "true");

    const temporizadores = new Set<number>();
    const depois = (ms: number, fazer: () => void) => {
      const id = window.setTimeout(() => {
        temporizadores.delete(id);
        fazer();
      }, ms);
      temporizadores.add(id);
      return id;
    };

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
          // O mapa detalhado chegou: o localizador diz, por um instante, de
          // que pedaço da carta maior ele é.
          carta.setAttribute("data-tv-recem", "");
          depois(DURACAO_DA_CHEGADA_DA_CAMADA, () =>
            carta.removeAttribute("data-tv-recem"),
          );
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

    const faixa = raiz.querySelector<HTMLElement>(".tv-faixa");
    const links = new Map<string, HTMLAnchorElement>();
    for (const link of Array.from(
      raiz.querySelectorAll<HTMLAnchorElement>("[data-tv-faixa] [data-tv-ir]"),
    )) {
      links.set(link.dataset.tvIr ?? "", link);
    }
    const capitulos = Array.from(
      raiz.querySelectorAll<HTMLElement>("[data-tv-capitulo]"),
    );
    const idDe = (capitulo: HTMLElement) => capitulo.dataset.tvCapitulo ?? "";
    const ehLugar = (id: string | null): id is string =>
      id !== null && id !== "vale" && links.has(id);

    /*
      Linha de leitura: 30% da área que sobra abaixo do cabeçalho e, quando a
      faixa está presa, abaixo dela também. Uma âncora deixa o título do
      capítulo logo abaixo desse topo — acima da linha —, então quem chega por
      link já está "dentro"; quem rola só troca de capítulo quando o próximo
      ocupa a maior parte da tela. Um limite só, sem banda: não há como dois
      capítulos disputarem a marca.
    */
    function linhaDeLeitura(): number {
      let fixo = topo?.offsetHeight ?? 0;
      if (faixa !== null && getComputedStyle(faixa).position === "sticky") {
        fixo += faixa.offsetHeight;
      }
      return fixo + (window.innerHeight - fixo) * LINHA_DE_LEITURA;
    }

    /**
     * `vale` enquanto a abertura está na linha; o capítulo que contém a linha
     * depois disso; `null` no fecho, que não é capítulo de lugar.
     */
    function capituloNaLinha(): string | null {
      const linha = linhaDeLeitura();
      const primeiro = capitulos[0];
      if (primeiro === undefined) return null;
      if (primeiro.getBoundingClientRect().top > linha) return "vale";
      for (const capitulo of capitulos) {
        const caixa = capitulo.getBoundingClientRect();
        if (caixa.top <= linha && caixa.bottom > linha) return idDe(capitulo);
      }
      return null;
    }

    let atual: string | null | undefined;
    let ultimoLugar: string | null = null;
    function aplicar(id: string | null) {
      if (id === atual) return;
      atual = id;
      for (const [chave, link] of links) {
        if (chave === id) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      }
      // A prancha em leitura acende o próprio "você está aqui" (só CSS lê).
      for (const capitulo of capitulos) {
        capitulo.toggleAttribute("data-em-leitura", idDe(capitulo) === id);
      }
      if (ehLugar(id)) ultimoLugar = id;
    }

    /* --- 3. Destino e origem ------------------------------------------- */

    let destino: string | null = null;
    let origemPendente: { lugar: string; foco: boolean } | null = null;
    let esperaDoFim: number | null = null;
    /*
      O Chrome dispara um `scrollend` logo depois do clique numa âncora, antes
      de a rolagem suave começar. Só vale o `scrollend` que vem depois de a
      página ter de fato rolado.
    */
    let rolouDesdeANavegacao = false;
    /*
      Seguir uma âncora também dispara `popstate` no Chrome, logo depois do
      clique. Esse não é o Voltar do navegador e não pode desfazer o destino.
    */
    let cliqueEm = Number.NEGATIVE_INFINITY;

    function limparOrigem() {
      raiz.removeAttribute("data-tv-origem");
    }

    function mostrarOrigem(lugar: string, foco: boolean) {
      /*
        Foco explícito só para quem voltou pelo teclado. Sem isso a próxima
        parada de Tab seria o primeiro item da faixa, e não o lugar de onde a
        pessoa saiu. Ponteiro e toque não recebem foco artificial. O foco vem
        antes do realce porque focar a faixa conta como explorar a carta.
      */
      if (foco) links.get(lugar)?.focus({ preventScroll: true });
      raiz.setAttribute("data-tv-origem", lugar);
      depois(DURACAO_DA_ORIGEM, limparOrigem);
    }

    /** A rolagem terminou: o estado volta a ser o da linha de leitura. */
    function assentar() {
      if (esperaDoFim !== null) {
        window.clearTimeout(esperaDoFim);
        temporizadores.delete(esperaDoFim);
        esperaDoFim = null;
      }
      destino = null;
      raiz.removeAttribute("data-tv-destino");
      aplicar(capituloNaLinha());
      if (origemPendente !== null && atual === "vale") {
        mostrarOrigem(origemPendente.lugar, origemPendente.foco);
      } else if (origemPendente !== null) {
        // A volta não pousou na carta: nada de origem acesa fora dela.
        limparOrigem();
      }
      origemPendente = null;
    }

    const temScrollend = "onscrollend" in window;
    function esperarAssentar() {
      rolouDesdeANavegacao = false;
      if (esperaDoFim !== null) {
        window.clearTimeout(esperaDoFim);
        temporizadores.delete(esperaDoFim);
      }
      /*
        Com `scrollend`, este prazo só cobre a âncora que não rola (o destino
        já está na tela). Sem ele, cada evento de rolagem adia o prazo.
      */
      esperaDoFim = depois(ESPERA_SEM_SCROLLEND, assentar);
    }

    /** Capítulo (ou carta) a que uma âncora desta página leva. */
    function alvoDaAncora(href: string): string | null {
      if (!href.startsWith("#")) return null;
      const alvo = document.getElementById(decodeURIComponent(href.slice(1)));
      if (alvo === null || !raiz.contains(alvo)) return null;
      if (alvo.id === "tv-carta") return "carta";
      return (
        alvo.closest<HTMLElement>("[data-tv-capitulo]")?.dataset.tvCapitulo ??
        null
      );
    }

    function aoClicar(evento: MouseEvent) {
      if (
        evento.defaultPrevented ||
        evento.button !== 0 ||
        evento.metaKey ||
        evento.ctrlKey ||
        evento.shiftKey ||
        evento.altKey
      ) {
        return;
      }
      const link =
        evento.target instanceof Element
          ? evento.target.closest<HTMLAnchorElement | SVGAElement>("a[href]")
          : null;
      if (link === null) return;
      const alvo = alvoDaAncora(link.getAttribute("href") ?? "");
      if (alvo === null) return;
      limparOrigem();
      cliqueEm = performance.now();
      if (alvo === "carta") {
        /*
          Volta à carta: a faixa já marca o conjunto, e o último lugar lido
          fica aceso enquanto a carta sobe. Ele se apaga um instante depois
          da chegada (ver `assentar`).
        */
        destino = null;
        raiz.removeAttribute("data-tv-destino");
        origemPendente =
          ultimoLugar === null
            ? null
            : { lugar: ultimoLugar, foco: evento.detail === 0 };
        if (origemPendente !== null) {
          raiz.setAttribute("data-tv-origem", origemPendente.lugar);
        }
        aplicar("vale");
      } else {
        // Vale é uma escolha: apaga qualquer lugar aceso e vale por si.
        destino = alvo;
        raiz.setAttribute("data-tv-destino", alvo);
        aplicar(alvo);
      }
      esperarAssentar();
    }

    /* Voltar e Avançar: o navegador restaura a rolagem; a origem acende se
       a volta pousar na carta. */
    function aoNavegarNoHistorico() {
      if (performance.now() - cliqueEm < 100) return;
      limparOrigem();
      destino = null;
      raiz.removeAttribute("data-tv-destino");
      origemPendente =
        ultimoLugar === null ? null : { lugar: ultimoLugar, foco: false };
      esperarAssentar();
    }

    let quadroPendente = 0;
    function aoRolar() {
      if (destino !== null || origemPendente !== null) {
        if (!temScrollend) {
          esperarAssentar();
        } else if (!rolouDesdeANavegacao) {
          // A rolagem começou: o fim dela decide. O prazo longo só existe
          // para o caso de o `scrollend` nunca chegar.
          rolouDesdeANavegacao = true;
          if (esperaDoFim !== null) {
            window.clearTimeout(esperaDoFim);
            temporizadores.delete(esperaDoFim);
          }
          esperaDoFim = depois(ESPERA_MAXIMA_DA_ROLAGEM, assentar);
        }
        return;
      }
      if (quadroPendente !== 0) return;
      quadroPendente = window.requestAnimationFrame(() => {
        quadroPendente = 0;
        aplicar(capituloNaLinha());
      });
    }
    function aoTerminarDeRolar() {
      if (
        (destino !== null || origemPendente !== null) &&
        rolouDesdeANavegacao
      ) {
        assentar();
      }
    }
    function aoRedimensionar() {
      aplicar(capituloNaLinha());
    }

    /* A carta volta ao estado geral assim que a pessoa a explora de novo. */
    function aoExplorar() {
      if (raiz.hasAttribute("data-tv-origem")) limparOrigem();
    }

    aplicar(capituloNaLinha());
    window.addEventListener("scroll", aoRolar, { passive: true });
    window.addEventListener("scrollend", aoTerminarDeRolar);
    window.addEventListener("resize", aoRedimensionar);
    window.addEventListener("popstate", aoNavegarNoHistorico);
    raiz.addEventListener("click", aoClicar);
    raiz.addEventListener("pointerdown", aoExplorar);
    faixa?.addEventListener("focusin", aoExplorar);

    return () => {
      for (const id of temporizadores) window.clearTimeout(id);
      if (quadroPendente !== 0) window.cancelAnimationFrame(quadroPendente);
      window.removeEventListener("scroll", aoRolar);
      window.removeEventListener("scrollend", aoTerminarDeRolar);
      window.removeEventListener("resize", aoRedimensionar);
      window.removeEventListener("popstate", aoNavegarNoHistorico);
      raiz.removeEventListener("click", aoClicar);
      raiz.removeEventListener("pointerdown", aoExplorar);
      faixa?.removeEventListener("focusin", aoExplorar);
      for (const link of links.values()) link.removeAttribute("aria-current");
      for (const capitulo of capitulos) {
        capitulo.removeAttribute("data-em-leitura");
      }
      observadorDoTopo.disconnect();
      raiz.style.removeProperty("--tv-topo");
      observadorDeCartas.disconnect();
      for (const atributo of [
        "data-interativo",
        "data-tv-destino",
        "data-tv-origem",
      ]) {
        raiz.removeAttribute(atributo);
      }
    };
  }, [idRaiz]);

  return null;
}
