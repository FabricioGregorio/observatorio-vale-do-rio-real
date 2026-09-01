import Link from "next/link";

import { MENU_PRINCIPAL } from "../../lib/navegacao";
import { MenuMobile } from "./MenuMobile";

/**
 * Cabeçalho do site: identificação e menu principal.
 *
 * Em telas largas a lista de seis itens fica visível; abaixo de `md` ela dá
 * lugar ao `MenuMobile`. As duas versões leem a mesma fonte, `navegacao.ts`,
 * para não divergirem.
 */
export function Cabecalho() {
  return (
    <header
      style={{
        backgroundColor: "var(--color-fundo-inverso)",
        color: "var(--color-texto-inverso)",
      }}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <Link
          href="/"
          className="font-semibold text-lg"
          style={{
            color: "var(--color-texto-inverso)",
            fontFamily: "var(--font-display)",
          }}
        >
          Observatório do Vale do Rio Real
        </Link>

        <nav aria-label="Principal" className="hidden md:block">
          <ul className="flex list-none flex-wrap items-center gap-4 p-0">
            {MENU_PRINCIPAL.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  style={{ color: "var(--color-texto-inverso)" }}
                >
                  {item.rotulo}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Principal (telas estreitas)">
          <MenuMobile />
        </nav>
      </div>
    </header>
  );
}
