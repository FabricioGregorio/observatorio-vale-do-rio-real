"use client";

/**
 * Menu principal em telas estreitas.
 *
 * `"use client"` é justificado: o painel abre e fecha, responde a `Esc` e
 * devolve o foco ao gatilho — comportamento que exige estado e eventos no
 * navegador. É o único componente cliente do layout base.
 *
 * Em telas largas o menu do `Cabecalho` fica visível e este componente some,
 * então nada aqui é a única forma de navegar.
 *
 * O foco recebe `focus-visible:outline-destaque`: o contorno padrão é anil, e
 * anil sobre mata fica em torno de 1,25:1 — o indicador some justamente onde
 * quem navega por teclado precisa dele. Milho sobre mata dá 7,4:1, já
 * verificado em `tokens.css`. Nenhum token novo, nenhuma cor nova.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import { type ItemNavegacao, MENU_PRINCIPAL } from "../../lib/navegacao";

const DESCRICOES_DE_CONTEUDO = {
  "/campo": "Registros das visitas e do trabalho em território",
  "/podobservar": "Conversas e narrativas do Vale",
  "/acervo": "Fotografias, documentos e memória",
} as const;

type RotaDeConteudo = keyof typeof DESCRICOES_DE_CONTEUDO;

function itemEhConteudo(
  item: ItemNavegacao,
): item is ItemNavegacao & { readonly href: RotaDeConteudo } {
  return item.href in DESCRICOES_DE_CONTEUDO;
}

const ITENS_PRINCIPAIS = MENU_PRINCIPAL.filter((item) => !itemEhConteudo(item));

const ITENS_DE_CONTEUDO = MENU_PRINCIPAL.filter(itemEhConteudo);

function rotaEstaAtiva(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Navegação larga da Home v2.
 *
 * `"use client"` é necessário apenas nesta ilha: o painel editorial controla
 * abertura, clique externo, `Esc`, devolução de foco e o estado da rota atual.
 * A marca e as utilidades permanecem no Server Component do cabeçalho.
 */
export function NavegacaoDoCabecalho() {
  const [aberto, setAberto] = useState(false);
  const pathname = usePathname();
  const raiz = useRef<HTMLDivElement>(null);
  const gatilho = useRef<HTMLButtonElement>(null);
  const painel = useRef<HTMLDivElement>(null);
  const idPainel = useId();
  const conteudoAtivo = ITENS_DE_CONTEUDO.some((item) =>
    rotaEstaAtiva(pathname, item.href),
  );

  useEffect(() => {
    if (!aberto) return;
    painel.current?.querySelector<HTMLAnchorElement>("a")?.focus();
  }, [aberto]);

  useEffect(() => {
    if (!aberto) return;

    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key !== "Escape") return;
      evento.preventDefault();
      setAberto(false);
      gatilho.current?.focus();
    }

    function aoApontarFora(evento: PointerEvent) {
      if (!raiz.current?.contains(evento.target as Node)) setAberto(false);
    }

    document.addEventListener("keydown", aoTeclar);
    document.addEventListener("pointerdown", aoApontarFora);
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.removeEventListener("pointerdown", aoApontarFora);
    };
  }, [aberto]);

  return (
    <nav aria-label="Principal" className="hl-topo__nav">
      <ul>
        {ITENS_PRINCIPAIS.map((item) => (
          <li key={item.href}>
            <Link
              aria-current={
                rotaEstaAtiva(pathname, item.href) ? "page" : undefined
              }
              href={item.href}
              prefetch={false}
            >
              {item.rotulo}
            </Link>
          </li>
        ))}
        <li className="hl-conteudos" data-ativo={conteudoAtivo || undefined}>
          <div ref={raiz}>
            <button
              aria-controls={idPainel}
              aria-expanded={aberto}
              className="hl-conteudos__gatilho"
              onClick={() => setAberto((estava) => !estava)}
              ref={gatilho}
              type="button"
            >
              Conteúdos <span aria-hidden="true">⌄</span>
            </button>
            {aberto ? (
              <div className="hl-conteudos__painel" id={idPainel} ref={painel}>
                <p className="hl-conteudos__titulo">
                  Conteúdos do Observatório
                </p>
                <ul>
                  {ITENS_DE_CONTEUDO.map((item) => (
                    <li key={item.href}>
                      <Link
                        aria-current={
                          rotaEstaAtiva(pathname, item.href)
                            ? "page"
                            : undefined
                        }
                        href={item.href}
                        onClick={() => setAberto(false)}
                        prefetch={false}
                      >
                        <strong>{item.rotulo}</strong>
                        <span>{DESCRICOES_DE_CONTEUDO[item.href]}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </li>
      </ul>
      <noscript>
        <ul className="hl-topo__sem-script">
          {ITENS_DE_CONTEUDO.map((item) => (
            <li key={item.href}>
              <Link href={item.href} prefetch={false}>
                {item.rotulo}
              </Link>
            </li>
          ))}
        </ul>
      </noscript>
    </nav>
  );
}

export function MenuMobile({
  classeResponsiva = "lg:hidden",
}: {
  readonly classeResponsiva?: string;
}) {
  const [aberto, setAberto] = useState(false);
  const pathname = usePathname();
  const gatilho = useRef<HTMLButtonElement>(null);
  const painel = useRef<HTMLDivElement>(null);
  const raiz = useRef<HTMLDivElement>(null);
  const idPainel = useId();

  // Esc fecha e o foco volta ao gatilho — senão quem usa teclado fica preso.
  useEffect(() => {
    if (!aberto) return;
    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        setAberto(false);
        gatilho.current?.focus();
      }
    }
    function aoApontarFora(evento: PointerEvent) {
      if (!raiz.current?.contains(evento.target as Node)) setAberto(false);
    }
    document.addEventListener("keydown", aoTeclar);
    document.addEventListener("pointerdown", aoApontarFora);
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.removeEventListener("pointerdown", aoApontarFora);
    };
  }, [aberto]);

  // Ao abrir, o foco entra no painel; sem isso o leitor de tela não é levado
  // para o menu que acabou de surgir.
  useEffect(() => {
    if (aberto) painel.current?.focus();
  }, [aberto]);

  return (
    <div className={classeResponsiva} ref={raiz}>
      <button
        ref={gatilho}
        type="button"
        aria-expanded={aberto}
        aria-controls={idPainel}
        onClick={() => setAberto((estava) => !estava)}
        className="meta-ficha border px-3 py-2 focus-visible:outline-destaque"
        style={{
          borderColor: "var(--borda-menu-mobile, var(--color-texto-inverso))",
          color: "var(--texto-menu-mobile, var(--color-texto-inverso))",
          borderRadius: "var(--radius-ficha)",
        }}
      >
        {aberto ? "Fechar menu" : "Menu"}
      </button>

      {aberto ? (
        <div
          ref={painel}
          id={idPainel}
          // O painel recebe foco programático ao abrir, para levar o leitor
          // de tela até o menu que acabou de surgir.
          tabIndex={-1}
          className="mt-3"
        >
          <ul className="hl-menu-estreito__lista flex list-none flex-col gap-1 p-0">
            {ITENS_PRINCIPAIS.map((item) => (
              <li key={item.href}>
                <Link
                  aria-current={
                    rotaEstaAtiva(pathname, item.href) ? "page" : undefined
                  }
                  href={item.href}
                  prefetch={false}
                  onClick={() => setAberto(false)}
                  className="block px-2 py-2 focus-visible:outline-destaque"
                  style={{
                    color:
                      "var(--texto-menu-mobile, var(--color-texto-inverso))",
                  }}
                >
                  {item.rotulo}
                </Link>
              </li>
            ))}
          </ul>
          <p className="hl-menu-estreito__grupo">Conteúdos do Observatório</p>
          <ul className="hl-menu-estreito__lista flex list-none flex-col gap-1 p-0">
            {ITENS_DE_CONTEUDO.map((item) => (
              <li key={item.href}>
                <Link
                  aria-current={
                    rotaEstaAtiva(pathname, item.href) ? "page" : undefined
                  }
                  href={item.href}
                  prefetch={false}
                  onClick={() => setAberto(false)}
                  className="block px-2 py-2 focus-visible:outline-destaque"
                  style={{
                    color:
                      "var(--texto-menu-mobile, var(--color-texto-inverso))",
                  }}
                >
                  {item.rotulo}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
