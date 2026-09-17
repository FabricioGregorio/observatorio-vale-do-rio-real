import Link from "next/link";

import {
  CAMINHO_DAS_MARCAS,
  SIMBOLO_OBSERVATORIO,
} from "../../dados/hero/derivados";
import { ID_CABECALHO_HOME, MENU_PRINCIPAL } from "../../lib/navegacao";
import { CentralAcessibilidade } from "../layout/CentralAcessibilidade";
import { MenuMobile } from "../layout/MenuMobile";
import { CabecalhoReativo } from "./CabecalhoReativo";
import { MENU_ALVO } from "./menuAlvo";

/**
 * Cabeçalho do protótipo — casca visual. Fase H1.
 *
 * Server Component. As duas ilhas cliente são folhas: uma não renderiza nada
 * (`CabecalhoReativo`), a outra é o painel de acessibilidade.
 *
 * Sobreposto ao Hero, sem faixa própria: a fotografia é o fundo. É o que a
 * Direção Visual §8.2 descreve — marca pequena à esquerda, menu horizontal
 * minimalista, utilidades isoladas à direita.
 *
 * Na Home pública, a navegação vem da mesma fonte canônica do layout. O modo
 * de protótipo preserva a demonstração histórica da H1.
 *
 * ## As duas utilidades
 *
 * `Acessibilidade` e `Prestação de Contas` ficam separadas do menu por uma
 * régua vertical e têm peso visual equivalente entre si — Direção Visual §13.1
 * e §13.2. Prestação de Contas é a única com contorno preenchido: é a ação
 * institucional do projeto, e continua apontando para a rota real.
 */

export const ID_DO_CABECALHO = "cabecalho-prototipo";

/**
 * Estilo do recolhimento, escopado pela classe do cabeçalho.
 *
 * Mesmo padrão de `estilosDoMapa.ts`: CSS de componente vive junto do
 * componente, e `tokens.css` continua sendo só a fonte de cor, tipografia e
 * raio. Nenhum valor de cor aparece aqui.
 *
 * `translateY(-100%)` não muda o fluxo — o cabeçalho é `fixed` —, então
 * recolher não causa deslocamento de layout.
 *
 * A duração vem de `--duracao-hover`, que a H0 **zera** sob
 * `prefers-reduced-motion`. Com a preferência ligada a troca é instantânea, e
 * continua acontecendo: o que sai é a animação, não o comportamento.
 */
const CSS_DO_CABECALHO = `
.cabecalho-prototipo{transition:transform var(--duracao-hover) var(--easing-padrao)}
.cabecalho-prototipo[data-recolhido="true"]{transform:translateY(-100%)}
.cabecalho-prototipo[data-recolhido="false"]{transform:translateY(0)}
.cabecalho-prototipo :focus-visible{outline-color:var(--color-destaque)}
`.trim();

export function CabecalhoPrototipo({
  contexto = "prototipo",
}: {
  contexto?: "prototipo" | "home";
}) {
  const idDoCabecalho =
    contexto === "home" ? ID_CABECALHO_HOME : ID_DO_CABECALHO;
  const itensDoMenu = contexto === "home" ? MENU_PRINCIPAL : MENU_ALVO;

  return (
    <header
      className="cabecalho-prototipo fixed inset-x-0 top-0"
      id={idDoCabecalho}
      style={{ zIndex: "var(--z-cabecalho)" }}
    >
      <style>{CSS_DO_CABECALHO}</style>
      <CabecalhoReativo idDoCabecalho={idDoCabecalho} />

      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-4">
        <Link
          className="shrink-0"
          aria-label="Observatório — página inicial"
          href="/"
          prefetch={false}
          style={{ borderRadius: "var(--radius-ficha)" }}
        >
          <img
            alt=""
            className="h-9 w-auto sm:h-10"
            height={SIMBOLO_OBSERVATORIO.altura}
            src={`${CAMINHO_DAS_MARCAS}/${SIMBOLO_OBSERVATORIO.arquivo}`}
            width={SIMBOLO_OBSERVATORIO.largura}
          />
        </Link>

        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex list-none flex-wrap items-center gap-5 p-0">
            {itensDoMenu.map((item) => (
              <li key={item.rotulo}>
                {item.href === null ? (
                  /*
                    Sem rota, sem link. O atributo marca o estado para o teste
                    e para a inspeção visual; ele não pode sobreviver à Home.
                  */
                  <span
                    className="text-sm"
                    data-demonstracao="true"
                    style={{
                      color: "var(--hero-metadado)",
                      fontFamily: "var(--font-display)",
                    }}
                    title="Rota ainda não existe — item em demonstração"
                  >
                    {item.rotulo}
                  </span>
                ) : (
                  <Link
                    className="text-sm"
                    href={item.href}
                    prefetch={false}
                    style={{
                      color: "var(--hero-texto)",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    {item.rotulo}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {contexto === "home" ? (
          <nav
            aria-label="Principal (telas estreitas)"
            className="order-3 w-full lg:hidden [&_[id]]:rounded-[var(--radius-ficha)] [&_[id]]:bg-[var(--color-fundo-inverso)] [&_[id]]:p-3"
          >
            <MenuMobile />
          </nav>
        ) : null}

        <div className="ml-auto flex items-center gap-3">
          <span
            aria-hidden="true"
            className="hidden h-6 w-px lg:block"
            style={{ backgroundColor: "var(--hero-metadado)" }}
          />
          <CentralAcessibilidade />
          <Link
            className="meta-ficha px-3 py-2"
            href="/prestacao-de-contas"
            prefetch={false}
            style={{
              backgroundColor: "var(--hero-texto)",
              color: "var(--color-carvao)",
              borderRadius: "var(--radius-ficha)",
            }}
          >
            Prestação de Contas
          </Link>
        </div>
      </div>
    </header>
  );
}
