import { ID_CONTEUDO } from "../../lib/navegacao";

/**
 * Link de pular para o conteúdo — primeiro elemento focável da página.
 *
 * A classe `.pular-conteudo` vive no `tokens.css`: fica fora da tela até
 * receber foco, quando aparece fixa no topo. Sem ele, quem navega por teclado
 * atravessa o menu inteiro em toda página.
 */
export function PularConteudo() {
  return (
    <a className="pular-conteudo" href={`#${ID_CONTEUDO}`}>
      Pular para o conteúdo
    </a>
  );
}
