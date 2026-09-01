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
 */
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

import { MENU_PRINCIPAL } from "../../lib/navegacao";

export function MenuMobile() {
  const [aberto, setAberto] = useState(false);
  const gatilho = useRef<HTMLButtonElement>(null);
  const painel = useRef<HTMLDivElement>(null);
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
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [aberto]);

  // Ao abrir, o foco entra no painel; sem isso o leitor de tela não é levado
  // para o menu que acabou de surgir.
  useEffect(() => {
    if (aberto) painel.current?.focus();
  }, [aberto]);

  return (
    <div className="md:hidden">
      <button
        ref={gatilho}
        type="button"
        aria-expanded={aberto}
        aria-controls={idPainel}
        onClick={() => setAberto((estava) => !estava)}
        className="meta-ficha border px-3 py-2"
        style={{
          borderColor: "var(--color-texto-inverso)",
          color: "var(--color-texto-inverso)",
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
          <ul className="flex list-none flex-col gap-1 p-0">
            {MENU_PRINCIPAL.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setAberto(false)}
                  className="block px-2 py-2"
                  style={{ color: "var(--color-texto-inverso)" }}
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
