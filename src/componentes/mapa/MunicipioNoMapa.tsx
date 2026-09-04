import type { MunicipioDoMapa } from "../../dados/territorio/mapa";
import { classesDoMunicipio, temHachura } from "./estilosDoMapa";
import { nomeAcessivelDoMunicipio } from "./identificacao";

/**
 * Um município desenhado no mapa — Tarefa 10B.3.3.
 *
 * Server Component. **Não é link.** Não existe página de município aprovada, e
 * um `href` para uma âncora da própria página só para tornar o polígono
 * clicável seria semântica de link emprestada — o elemento não navega para
 * lugar nenhum. Quando houver página territorial, este componente vira `<a>`
 * de verdade.
 *
 * O que ele é: um polígono que carrega a sua identidade em `data-codigo` e o
 * seu nome acessível em `aria-label`. Nenhum atributo interativo vem do
 * servidor — nem `role`, nem `tabindex`. É `MapaInterativo` que promove estes
 * polígonos a opções selecionáveis **depois** que o JavaScript carrega. Sem
 * JavaScript não há interatividade prometida e não cumprida: o mapa é
 * ilustração, e quem carrega a informação é a lista territorial.
 *
 * Município com pesquisa de campo recebe um segundo `<path>` com a hachura. O
 * `d` é repetido de propósito: `<use>` não funcionaria, porque o `fill` da
 * classe do polígono original venceria a herança e a hachura não apareceria.
 * São três municípios hoje, não 75.
 */
export function MunicipioNoMapa({ municipio }: { municipio: MunicipioDoMapa }) {
  return (
    <g>
      <title>{municipio.nome}</title>
      <path
        aria-label={nomeAcessivelDoMunicipio(municipio)}
        className={classesDoMunicipio(municipio.relacoesTerritoriais)}
        d={municipio.caminho}
        data-codigo={municipio.codigoIbge}
      />
      {temHachura(municipio.relacoesTerritoriais) ? (
        <path className="h" d={municipio.caminho} />
      ) : null}
    </g>
  );
}
