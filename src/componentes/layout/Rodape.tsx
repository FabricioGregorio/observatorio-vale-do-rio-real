import Link from "next/link";

import { MENU_RODAPE } from "../../lib/navegacao";

/**
 * Rodapé do site.
 *
 * O bloco de créditos de fomento — PNAB / Lei Aldir Blanc, Ministério da
 * Cultura, Governo Federal, Governo de Sergipe, FUNCAP — **não** é
 * implementado aqui. Ele depende do manual de aplicação de marcas do edital,
 * item E02 do inventário, hoje com status `Pendente` e sem link.
 *
 * O manual define proporção e ordem das marcas, e crédito de fomento errado é
 * causa recorrente de ressalva em prestação de contas. Por isso o espaço fica
 * reservado e vazio, sem logo, sem proporção e sem texto de crédito
 * aproximado: um bloco falso seria pior do que a ausência declarada.
 *
 * Ver `docs/tarefas/03-layout-base.md`, seção "Fatiamento".
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
export function Rodape() {
  return (
    <footer
      style={{
        backgroundColor: "var(--color-fundo-inverso)",
        color: "var(--color-texto-inverso)",
      }}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
        <nav aria-label="Rodapé">
          <ul className="flex list-none flex-wrap gap-x-6 gap-y-2 p-0">
            {MENU_RODAPE.map((item) => (
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

        {/*
          Bloco de créditos de fomento — PENDENTE do manual de marcas (E02).
          Não preencher por estimativa: proporção, ordem e texto vêm do manual.
        */}
        <section aria-labelledby="creditos-fomento">
          <h2 id="creditos-fomento" className="meta-ficha">
            Créditos de fomento
          </h2>
          <p style={{ color: "var(--color-texto-inverso)" }}>
            Bloco de marcas e créditos pendente do manual de aplicação de marcas
            do edital.
          </p>
        </section>
      </div>
    </footer>
  );
}
