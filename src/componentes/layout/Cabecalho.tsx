import Link from "next/link";

import {
  CAMINHO_DAS_MARCAS,
  ICONE_OBSERVATORIO_CABECALHO,
} from "../../dados/hero/derivados";
import { ID_CABECALHO_HOME } from "../../lib/navegacao";
import { CentralAcessibilidade } from "./CentralAcessibilidade";
import { MarcaCabecalho } from "./MarcaCabecalho";
import { MenuMobile } from "./MenuMobile";
import { NavegacaoPrincipal } from "./NavegacaoPrincipal";

/** Cabeçalho público único; na Home fica sobre a fotografia. */
export function Cabecalho() {
  return (
    <header className="hl-topo" id={ID_CABECALHO_HOME}>
      <div className="hl-quadro hl-topo__linha">
        <MarcaCabecalho
          imagem={`${CAMINHO_DAS_MARCAS}/${ICONE_OBSERVATORIO_CABECALHO.arquivo}`}
          largura={ICONE_OBSERVATORIO_CABECALHO.largura}
          altura={ICONE_OBSERVATORIO_CABECALHO.altura}
        />
        <NavegacaoPrincipal />
        <nav
          aria-label="Principal (telas estreitas)"
          className="hl-topo__nav-estreita"
        >
          <MenuMobile classeResponsiva="" />
        </nav>
        <div className="hl-topo__util">
          <CentralAcessibilidade />
          <Link
            className="hl-botao hl-botao--curto hl-topo__prestacao"
            href="/prestacao-de-contas"
            prefetch={false}
          >
            Prestação de contas <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
