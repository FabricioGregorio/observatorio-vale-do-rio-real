import Link from "next/link";

import { MENU_RODAPE } from "../../lib/navegacao";
import { ReguaDeCreditos } from "../institucional/ReguaDeCreditos";

/**
 * Rodapé do site.
 *
 * ## Créditos de fomento
 *
 * O bloco deixou de ser um espaço vazio. O que o mantinha vazio era o manual
 * de aplicação de marcas — item E02 do inventário, ainda `PENDENTE` —, e o
 * manual governa **a aplicação gráfica**: proporção, ordem visual e área de
 * reserva. Ele não governa quem financia o projeto, que é fato documental
 * desde o edital.
 *
 * Então a página publica agora o crédito **textual**, na ordem normativa
 * fixada pela decisão humana registrada na tarefa 16 §2, item 5, e segue sem
 * publicar as marcas. A separação está explicada em
 * `componentes/institucional/creditos.ts`; a pendência continua declarada na
 * própria superfície, agora nomeando o que exatamente falta.
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
          Crédito textual publicado; bloco de marcas ainda PENDENTE do manual
          de aplicação (E02). Nenhuma logo é aplicada por estimativa.
        */}
        <section aria-labelledby="creditos-fomento">
          <h2 id="creditos-fomento" className="meta-ficha meta-ficha--inversa">
            Créditos de fomento
          </h2>
          <ReguaDeCreditos inversa />
        </section>
      </div>
    </footer>
  );
}
