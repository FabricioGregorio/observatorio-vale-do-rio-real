"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

import {
  ATRIBUTO_TEMA,
  atributoDoTema,
  CHAVE_TEMA,
  TEMAS,
  type Tema,
  temaArmazenado,
} from "../../lib/tema";

/**
 * Central de Acessibilidade — versão mínima funcional. Fase H1, protótipo.
 *
 * `"use client"` justificado: o painel abre e fecha, prende o foco, responde a
 * `Esc` e grava preferência no navegador. É comportamento, e comportamento não
 * existe no servidor.
 *
 * ## Só mostra o que existe
 *
 * A instrução da H1 §18 é categórica: **nada de controle falso**. A H0
 * implementou tema e movimento; escala de texto, alto contraste e narração
 * ainda não existem. Então esta central tem exatamente dois grupos.
 *
 * Um painel com `A+`, `A−` e "alto contraste" desligados seria pior que um
 * painel pequeno: prometeria recurso que não chega, justamente a quem mais
 * depende dele.
 *
 * ## Movimento é leitura, não ajuste
 *
 * O grupo de movimento **relata** o que o sistema pede e não oferece override.
 * A H0 fez `prefers-reduced-motion` valer sozinho, sem configuração; um
 * controle aqui daria a impressão de que é preciso ligá-lo para ele funcionar.
 * Quando o override manual existir, o grupo vira ajuste de verdade.
 *
 * ## Acessibilidade do próprio painel
 *
 * `role="dialog"` com `aria-modal`, rótulo por `aria-labelledby`, foco inicial
 * no primeiro controle, foco preso enquanto aberto, `Esc` fecha e devolve o
 * foco ao gatilho. Sem biblioteca: `Tab` cíclico é uma função de dez linhas.
 */

const ROTULOS: Record<Tema, string> = {
  sistema: "Sistema",
  claro: "Claro",
  escuro: "Escuro",
};

/** Elementos focáveis dentro do painel, para o ciclo de `Tab`. */
const FOCAVEIS =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function CentralAcessibilidade() {
  const [aberto, setAberto] = useState(false);
  const [tema, setTema] = useState<Tema>("sistema");
  const [movimentoReduzido, setMovimentoReduzido] = useState(false);

  const gatilho = useRef<HTMLButtonElement>(null);
  const painel = useRef<HTMLDivElement>(null);
  const raiz = useRef<HTMLDivElement>(null);
  const idPainel = useId();
  const idTitulo = useId();

  // O tema real só é conhecido no navegador: o HTML sai do servidor sem saber
  // o que este aparelho salvou. Ler na montagem mantém o botão coerente com o
  // que a página já está mostrando.
  useEffect(() => {
    try {
      setTema(temaArmazenado(localStorage.getItem(CHAVE_TEMA)));
    } catch {
      // Armazenamento bloqueado: segue o padrão, que é `sistema`.
    }
    const consulta = window.matchMedia("(prefers-reduced-motion: reduce)");
    setMovimentoReduzido(consulta.matches);
    const aoMudar = (e: MediaQueryListEvent) => setMovimentoReduzido(e.matches);
    consulta.addEventListener("change", aoMudar);
    return () => consulta.removeEventListener("change", aoMudar);
  }, []);

  const aplicarTema = useCallback((escolhido: Tema) => {
    setTema(escolhido);
    const atributo = atributoDoTema(escolhido);
    if (atributo === null) {
      document.documentElement.removeAttribute(ATRIBUTO_TEMA);
    } else {
      document.documentElement.setAttribute(ATRIBUTO_TEMA, atributo);
    }
    try {
      localStorage.setItem(CHAVE_TEMA, escolhido);
    } catch {
      // Sem armazenamento a escolha vale para esta visita. Melhor que falhar.
    }
  }, []);

  const fechar = useCallback(() => {
    setAberto(false);
    gatilho.current?.focus();
  }, []);

  // Foco inicial: o primeiro controle do painel, não o painel em si — assim o
  // leitor de tela anuncia o grupo e já está em cima de algo operável.
  useEffect(() => {
    if (!aberto) return;
    painel.current?.querySelector<HTMLElement>(FOCAVEIS)?.focus();
  }, [aberto]);

  useEffect(() => {
    if (!aberto) return;

    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        evento.preventDefault();
        fechar();
        return;
      }
      if (evento.key !== "Tab") return;

      const alvos = painel.current?.querySelectorAll<HTMLElement>(FOCAVEIS);
      if (alvos === undefined || alvos.length === 0) return;
      const primeiro = alvos[0] as HTMLElement;
      const ultimo = alvos[alvos.length - 1] as HTMLElement;

      if (evento.shiftKey && document.activeElement === primeiro) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primeiro.focus();
      }
    }

    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [aberto, fechar]);

  useEffect(() => {
    if (!aberto) return;
    function aoApontarFora(evento: PointerEvent) {
      if (!raiz.current?.contains(evento.target as Node)) fechar();
    }
    document.addEventListener("pointerdown", aoApontarFora);
    return () => document.removeEventListener("pointerdown", aoApontarFora);
  }, [aberto, fechar]);

  return (
    <div className="relative" ref={raiz}>
      <button
        aria-controls={idPainel}
        aria-expanded={aberto}
        className="meta-ficha hl-topo__acessibilidade border px-3 py-2"
        onClick={() => setAberto((estava) => !estava)}
        ref={gatilho}
        style={{
          borderColor: "var(--hero-texto)",
          backgroundColor: "var(--fundo-acessibilidade, transparent)",
          color: "var(--texto-acessibilidade, var(--hero-texto))",
          borderRadius: "var(--radius-ficha)",
        }}
        type="button"
      >
        Acessibilidade
      </button>

      {aberto ? (
        <div
          aria-labelledby={idTitulo}
          aria-modal="true"
          className="absolute right-0 z-10 mt-2 flex w-72 flex-col gap-5 border p-4"
          id={idPainel}
          ref={painel}
          role="dialog"
          style={{
            backgroundColor: "var(--color-fundo-elevado)",
            borderColor: "var(--color-borda-forte)",
            borderRadius: "var(--radius-ficha)",
            zIndex: "var(--z-painel)",
          }}
        >
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="meta-ficha" id={idTitulo}>
              Acessibilidade
            </h2>
            <button
              className="meta-ficha underline"
              onClick={fechar}
              style={{ color: "var(--color-link)" }}
              type="button"
            >
              Fechar
            </button>
          </div>

          <fieldset className="flex flex-col gap-2 border-0 p-0">
            <legend className="meta-ficha mb-1">Tema</legend>
            <div className="flex flex-wrap gap-2">
              {TEMAS.map((opcao) => {
                const ativo = tema === opcao;
                return (
                  <button
                    aria-pressed={ativo}
                    className="border px-3 py-2 text-sm"
                    key={opcao}
                    onClick={() => aplicarTema(opcao)}
                    style={{
                      borderColor: ativo
                        ? "var(--color-marca)"
                        : "var(--color-borda-forte)",
                      backgroundColor: ativo
                        ? "var(--color-marca)"
                        : "transparent",
                      color: ativo
                        ? "var(--color-branco)"
                        : "var(--color-texto)",
                      borderRadius: "var(--radius-ficha)",
                    }}
                    type="button"
                  >
                    {ROTULOS[opcao]}
                  </button>
                );
              })}
            </div>
            {/*
              O estado aparece em texto, e não só pela cor do botão ativo:
              depender de cor sozinha reprova em WCAG 1.4.1.
            */}
            <p className="meta-ficha">Em uso: {ROTULOS[tema]}</p>
          </fieldset>

          <div className="flex flex-col gap-1">
            <h3 className="meta-ficha">Movimento</h3>
            <p className="text-sm">
              {movimentoReduzido
                ? "Seu sistema pede menos animação, e o site já respeita isso."
                : "O site segue a preferência de animação do seu sistema."}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
