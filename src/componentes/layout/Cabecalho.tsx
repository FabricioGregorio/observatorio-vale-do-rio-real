import Link from "next/link";

import { MENU_PRINCIPAL } from "../../lib/navegacao";
import { MenuMobile } from "./MenuMobile";

/**
 * Cabeçalho do site: identificação e menu principal.
 *
 * Em telas largas a lista de seis itens fica visível; abaixo de `md` ela dá
 * lugar ao `MenuMobile`. As duas versões leem a mesma fonte, `navegacao.ts`,
 * para não divergirem.
 *
 * O foco recebe `focus-visible:outline-destaque`: o contorno padrão é anil, e
 * anil sobre mata fica em torno de 1,25:1 — o indicador some justamente onde
 * quem navega por teclado precisa dele. Milho sobre mata dá 7,4:1, já
 * verificado em `tokens.css`. Nenhum token novo, nenhuma cor nova. *
 * Os links não pré-carregam: `prefetch={false}`. A auditoria 10B.3.2 mediu
 * 28.691 bytes por visita em requisições `?_rsc=` para pré-carregar os oito
 * destinos do menu — páginas que hoje são stubs. O menu está em toda rota, então
 * o custo se repetia em todas.
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
          prefetch={false}
          className="font-semibold text-lg focus-visible:outline-destaque"
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
                  prefetch={false}
                  className="focus-visible:outline-destaque"
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
