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
  idDoPainel,
  promoverLista = false,
  seletorDasOpcoes = "path[data-codigo]",
  chave = "codigo",
  rotuloDaLista = "Índice dos municípios de Sergipe",
  idDoEstado,
  seletorDoQueRevelar,
  idDoBotaoVoltar,
}: {
  idDoSvg: string;
  idDaLista: string;
  idDoPainel?: string;
  promoverLista?: boolean;
  /**
   * O que é opção dentro do desenho. O laboratório usa município; a Home usa
   * recorte, que é um `<g>` com vários municípios dentro. A ilha não precisa
   * saber a diferença — só precisa saber o que selecionar.
   */
  seletorDasOpcoes?: string;
  /** Chave de `dataset` que liga a opção aos seus itens na lista textual. */
  chave?: string;
  rotuloDaLista?: string;
  /**
   * Elemento que recebe `data-selecionado` com a chave escolhida. É por ele
   * que o CSS reenquadra o mapa: nenhuma geometria é calculada em runtime.
   */
  idDoEstado?: string;
  /**
   * Elementos servidos com `hidden` que só fazem sentido havendo interação:
   * a orientação de uso, o painel e a ação de voltar. A ilha os revela ao
   * montar e os esconde ao desmontar. Sem JavaScript continuam fora da árvore
   * de acessibilidade — nenhum botão morto, nenhuma promessa que ninguém pode
   * cumprir.
   */
  seletorDoQueRevelar?: string;
  /** Volta à visão geral, com o mesmo efeito de `Esc`. */
  idDoBotaoVoltar?: string;
}) {
  useEffect(() => {
    const svg = document.getElementById(idDoSvg);
    const lista = document.getElementById(idDaLista);
    const painel =
      idDoPainel === undefined ? null : document.getElementById(idDoPainel);
    if (svg === null) return;

    const estado =
      idDoEstado === undefined ? null : document.getElementById(idDoEstado);

    const opcoes = Array.from(
      svg.querySelectorAll<SVGElement>(seletorDasOpcoes),
    );
    if (opcoes.length === 0) return;

    // O SVG deixa de ser imagem e passa a ser uma lista de opções.
    svg.removeAttribute("role");
    svg.setAttribute("role", "listbox");
    svg.setAttribute("data-interativo", "true");

    let ativo = 0;
    let ativoNaLista = 0;
    let selecionado: number | null = null;

    const itensDaLista =
      lista === null
        ? []
        : Array.from(
            lista.querySelectorAll<HTMLElement>(`:scope > [data-${chave}]`),
          );

    for (const [indice, opcao] of opcoes.entries()) {
      opcao.setAttribute("role", "option");
      opcao.setAttribute("aria-selected", "false");
      opcao.setAttribute("tabindex", indice === 0 ? "0" : "-1");
      if (idDoPainel !== undefined) {
        opcao.setAttribute("aria-controls", idDoPainel);
      }
    }

    if (promoverLista && lista !== null) {
      lista.setAttribute("role", "listbox");
      lista.setAttribute("aria-label", rotuloDaLista);
      lista.setAttribute("data-interativo", "true");
      for (const [indice, item] of itensDaLista.entries()) {
        item.setAttribute("role", "option");
        item.setAttribute("aria-selected", "false");
        item.setAttribute("tabindex", indice === 0 ? "0" : "-1");
        if (idDoPainel !== undefined) {
          item.setAttribute("aria-controls", idDoPainel);
        }
      }
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

    function valorDa(indice: number): string | undefined {
      return opcoes[indice]?.dataset[chave];
    }

    /**
     * Um recorte marca vários municípios na lista; um município marca um só.
     * Os dois casos são o mesmo código, e por isso a ilha devolve sempre uma
     * coleção.
     */
    function itensLigados(indice: number): HTMLElement[] {
      const valor = valorDa(indice);
      if (valor === undefined || lista === null) return [];
      return Array.from(
        lista.querySelectorAll<HTMLElement>(`[data-${chave}="${valor}"]`),
      );
    }

    function atualizarPainel(item: HTMLElement | null, valor?: string) {
      if (painel === null) return;

      /*
        Modo por blocos: o servidor já escreveu o texto de cada opção e a ilha
        só decide qual aparece. Nenhuma copy é montada em JavaScript — num site
        de prestação de contas, texto não nasce no cliente.
      */
      const blocos = Array.from(
        painel.querySelectorAll<HTMLElement>("[data-painel-de]"),
      );
      if (blocos.length > 0) {
        const semSelecao = painel.querySelector<HTMLElement>(
          "[data-painel-vazio]",
        );
        for (const bloco of blocos) {
          bloco.hidden = bloco.dataset.painelDe !== valor;
        }
        if (semSelecao !== null) semSelecao.hidden = valor !== undefined;
        return;
      }

      const vazio = painel.querySelector<HTMLElement>("[data-painel-vazio]");
      const conteudo = painel.querySelector<HTMLElement>(
        "[data-painel-conteudo]",
      );
      if (item === null) {
        if (vazio !== null) vazio.hidden = false;
        if (conteudo !== null) conteudo.hidden = true;
        return;
      }

      if (vazio !== null) vazio.hidden = true;
      if (conteudo !== null) conteudo.hidden = false;

      const nome = painel.querySelector<HTMLElement>("[data-painel-nome]");
      const classificacao = painel.querySelector<HTMLElement>(
        "[data-painel-classificacao]",
      );
      const evidencias = painel.querySelector<HTMLUListElement>(
        "[data-painel-evidencias]",
      );

      if (nome !== null) nome.textContent = item.dataset.nome ?? "";
      if (classificacao !== null) {
        classificacao.textContent =
          item.dataset.classificacao ?? "Sem vínculo declarado";
      }
      if (evidencias !== null) {
        const textos = Array.from(
          item.querySelectorAll<HTMLElement>("[data-evidencia]"),
        ).map((evidencia) => evidencia.textContent ?? "");
        evidencias.replaceChildren();
        if (textos.length === 0) {
          const semEvidencia = document.createElement("li");
          semEvidencia.textContent = "Sem evidência de pesquisa declarada";
          evidencias.append(semEvidencia);
        } else {
          for (const texto of textos) {
            const evidencia = document.createElement("li");
            evidencia.textContent = texto;
            evidencias.append(evidencia);
          }
        }
      }
    }

    function selecionar(indice: number) {
      if (selecionado !== null) {
        opcoes[selecionado]?.setAttribute("aria-selected", "false");
        for (const anterior of itensLigados(selecionado)) {
          anterior.removeAttribute("data-selecionado");
          if (promoverLista) anterior.setAttribute("aria-selected", "false");
        }
      }
      selecionado = indice;
      opcoes[indice]?.setAttribute("aria-selected", "true");

      const itens = itensLigados(indice);
      for (const item of itens) {
        item.setAttribute("data-selecionado", "true");
        if (promoverLista) item.setAttribute("aria-selected", "true");
      }
      // `nearest` e sem animação: rolagem brusca atrapalha, e
      // `prefers-reduced-motion` não deve ser contrariado.
      itens[0]?.scrollIntoView({ block: "nearest", behavior: "auto" });

      const valor = valorDa(indice);
      if (estado !== null && valor !== undefined) {
        estado.setAttribute("data-selecionado", valor);
      }
      atualizarPainel(itens[0] ?? null, valor);
    }

    function limparSelecao() {
      if (selecionado === null) return;
      opcoes[selecionado]?.setAttribute("aria-selected", "false");
      for (const item of itensLigados(selecionado)) {
        item.removeAttribute("data-selecionado");
        if (promoverLista) item.setAttribute("aria-selected", "false");
      }
      selecionado = null;
      estado?.removeAttribute("data-selecionado");
      atualizarPainel(null);
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
      const opcao = alvo.closest(seletorDasOpcoes);
      if (opcao === null) return;
      const indice = opcoes.indexOf(opcao as SVGElement);
      if (indice < 0) return;
      mover(indice, false);
      selecionar(indice);
    }

    /** Tab para dentro cai no ativo, não no primeiro por acidente. */
    function aoFocar(evento: FocusEvent) {
      const alvo = evento.target;
      if (!(alvo instanceof Element)) return;
      const indice = opcoes.indexOf(alvo as SVGElement);
      if (indice >= 0) ativo = indice;
    }

    function moverNaLista(destino: number, focar: boolean) {
      const anterior = itensDaLista[ativoNaLista];
      const proximo = itensDaLista[destino];
      if (proximo === undefined) return;
      if (anterior !== undefined) anterior.setAttribute("tabindex", "-1");
      proximo.setAttribute("tabindex", "0");
      ativoNaLista = destino;
      if (focar) proximo.focus();
    }

    function selecionarPeloItem(indiceDaLista: number) {
      const codigo = itensDaLista[indiceDaLista]?.dataset[chave];
      if (codigo === undefined) return;
      const indiceDoMapa = opcoes.findIndex(
        (opcao) => opcao.dataset[chave] === codigo,
      );
      if (indiceDoMapa < 0) return;
      mover(indiceDoMapa, false);
      selecionar(indiceDoMapa);
    }

    function aoTeclarLista(evento: KeyboardEvent) {
      if (AVANCA.has(evento.key)) {
        evento.preventDefault();
        moverNaLista(Math.min(ativoNaLista + 1, itensDaLista.length - 1), true);
        return;
      }
      if (RECUA.has(evento.key)) {
        evento.preventDefault();
        moverNaLista(Math.max(ativoNaLista - 1, 0), true);
        return;
      }
      if (evento.key === "Home") {
        evento.preventDefault();
        moverNaLista(0, true);
        return;
      }
      if (evento.key === "End") {
        evento.preventDefault();
        moverNaLista(itensDaLista.length - 1, true);
        return;
      }
      if (evento.key === "Enter" || evento.key === " ") {
        evento.preventDefault();
        selecionarPeloItem(ativoNaLista);
        return;
      }
      if (evento.key === "Escape") limparSelecao();
    }

    function aoClicarNaLista(evento: Event) {
      const alvo = evento.target;
      if (!(alvo instanceof Element)) return;
      const item = alvo.closest<HTMLElement>(`[data-${chave}]`);
      if (item === null || !itensDaLista.includes(item)) return;
      const indice = itensDaLista.indexOf(item);
      moverNaLista(indice, false);
      selecionarPeloItem(indice);
    }

    function aoFocarNaLista(evento: FocusEvent) {
      const alvo = evento.target;
      if (!(alvo instanceof HTMLElement)) return;
      const indice = itensDaLista.indexOf(alvo);
      if (indice >= 0) ativoNaLista = indice;
    }

    const revelados =
      seletorDoQueRevelar === undefined
        ? []
        : Array.from(
            document.querySelectorAll<HTMLElement>(seletorDoQueRevelar),
          ).filter((elemento) => elemento.hidden);
    for (const elemento of revelados) elemento.hidden = false;

    const voltar =
      idDoBotaoVoltar === undefined
        ? null
        : document.getElementById(idDoBotaoVoltar);

    /** Voltar devolve o foco ao alvo ativo: ninguém fica perdido no documento. */
    function aoVoltar() {
      limparSelecao();
      opcoes[ativo]?.focus();
    }

    svg.addEventListener("keydown", aoTeclar);
    svg.addEventListener("click", aoClicar);
    svg.addEventListener("focusin", aoFocar);
    voltar?.addEventListener("click", aoVoltar);
    if (promoverLista && lista !== null) {
      lista.addEventListener("keydown", aoTeclarLista);
      lista.addEventListener("click", aoClicarNaLista);
      lista.addEventListener("focusin", aoFocarNaLista);
    }

    return () => {
      for (const elemento of revelados) elemento.hidden = true;
      voltar?.removeEventListener("click", aoVoltar);
      svg.removeEventListener("keydown", aoTeclar);
      svg.removeEventListener("click", aoClicar);
      svg.removeEventListener("focusin", aoFocar);
      if (promoverLista && lista !== null) {
        lista.removeEventListener("keydown", aoTeclarLista);
        lista.removeEventListener("click", aoClicarNaLista);
        lista.removeEventListener("focusin", aoFocarNaLista);
        lista.removeAttribute("role");
        lista.removeAttribute("aria-label");
        lista.removeAttribute("data-interativo");
      }
      svg.removeAttribute("data-interativo");
      estado?.removeAttribute("data-selecionado");
      for (const opcao of opcoes) {
        opcao.removeAttribute("role");
        opcao.removeAttribute("aria-selected");
        opcao.removeAttribute("tabindex");
        opcao.removeAttribute("aria-controls");
      }
      for (const item of itensDaLista) {
        item.removeAttribute("role");
        item.removeAttribute("aria-selected");
        item.removeAttribute("tabindex");
        item.removeAttribute("aria-controls");
        item.removeAttribute("data-selecionado");
      }
    };
  }, [
    idDoSvg,
    idDaLista,
    idDoPainel,
    promoverLista,
    seletorDasOpcoes,
    chave,
    rotuloDaLista,
    idDoEstado,
    seletorDoQueRevelar,
    idDoBotaoVoltar,
  ]);

  return null;
}
