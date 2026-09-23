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
        {/*
          A utilidade do cabeçalho é uma só desde 2026-09-23. A ação
          institucional que ficava aqui levava à Prestação de Contas, que
          deixou de existir como área pública — e o Acervo, para onde a
          consulta documental foi centralizada, já é item do menu. Um segundo
          botão apontando para o mesmo destino do menu seria ocupação de
          espaço, não navegação.
        */}
        <div className="hl-topo__util">
          <CentralAcessibilidade />
        </div>
      </div>
    </header>
  );
}
