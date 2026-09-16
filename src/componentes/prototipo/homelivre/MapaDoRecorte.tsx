import {
  type DadosDoMapa,
  montarDadosDoMapa,
} from "../../../dados/territorio/mapa";
import type { RelacaoTerritorial } from "../../../dados/territorio/tipos";
import {
  centroDoCaminho,
  DEFINICOES,
  enquadramentoDoRecorte,
  municipiosDoRecorte,
} from "./recortes";

const CLASSE_DA_RELACAO: Readonly<Record<RelacaoTerritorial, string>> = {
  "vale-rio-real": "vale",
  "pesquisa-campo": "campo",
  comparacao: "comparacao",
};

export const ID_DO_MAPA = "hl-mapa";
export const ID_DO_PAINEL_DO_MAPA = "hl-mapa-painel";
export const ID_DA_LISTA_DO_RECORTE = "hl-municipios";
export const ID_DO_QUADRO_DO_MAPA = "hl-mapa-quadro";

/**
 * Mapa do recorte — Server Component, sem ilha cliente própria.
 *
 * Desenha a malha oficial de Sergipe com a mesma projeção e os mesmos dados de
 * sempre. O estado inteiro é **contexto**: nenhum dos 75 municípios é opção, e
 * nenhum deles é nomeado no desenho.
 *
 * ## Estado inicial
 *
 * Nada em destaque. Os dois recortes exploráveis existem no DOM como grupos,
 * mas sem preenchimento especial, sem contorno de seleção e sem rótulo — a
 * regra é que foco não é seleção, e que nada pode parecer já escolhido antes
 * de alguém escolher. O que revela o recorte é a seleção, e só ela.
 *
 * ## Por que os atributos de interação não vêm daqui
 *
 * Mesmo princípio da cartografia anterior: `role="listbox"`, `tabindex` e
 * `aria-selected` entram depois da montagem da ilha. Vindo do servidor, o mapa
 * prometeria navegação por teclado antes de o JavaScript existir — e, para
 * quem o mantém desligado, prometeria para sempre. Sem JavaScript o desenho é
 * imagem, com `role="img"`, e a informação editorial está inteira na lista
 * textual ao lado.
 *
 * ## Reenquadramento
 *
 * Cada recorte traz a sua transformação já calculada em build, numa custom
 * property. Em runtime a ilha só troca `data-selecionado` na raiz; o CSS faz o
 * resto, com duração vinda de `--duracao-painel`, que a H0 zera sob
 * `prefers-reduced-motion`.
 */
export function MapaDoRecorte({
  dados = montarDadosDoMapa(),
}: {
  dados?: DadosDoMapa;
}) {
  const { projecao, municipios } = dados;

  const daqui = new Set<string>();
  const grupos = DEFINICOES.map((definicao) => {
    const membros = municipiosDoRecorte(municipios, definicao);
    for (const membro of membros) daqui.add(membro.codigoIbge);
    return {
      definicao,
      membros,
      enquadramento: enquadramentoDoRecorte(dados, definicao),
    };
  });

  const contexto = municipios.filter(
    (municipio) => !daqui.has(municipio.codigoIbge),
  );

  /*
    As duas transformações entram como regra literal, e não como custom
    property lida por `var()` dentro da folha: o valor é conhecido no build,
    então não há nada a resolver em runtime, e uma regra literal se comporta
    igual em qualquer motor. Continua sem cálculo geométrico no cliente.
  */
  const enquadramentos = grupos
    .filter((grupo) => grupo.enquadramento !== null)
    .map(
      (grupo) =>
        `#${ID_DO_QUADRO_DO_MAPA}[data-selecionado="${grupo.definicao.chave}"] .hl-mapa__palco{transform:${grupo.enquadramento?.transformacao}}`,
    )
    .join("\n");

  return (
    <div className="hl-mapa__janela">
      <style>{enquadramentos}</style>
      <div className="hl-mapa__palco">
        <svg
          aria-labelledby="hl-mapa-titulo hl-mapa-descricao"
          className="hl-mapa__svg"
          id={ID_DO_MAPA}
          role="img"
          viewBox={`0 0 ${projecao.largura} ${Math.ceil(projecao.altura)}`}
        >
          <title id="hl-mapa-titulo">
            Sergipe e o recorte do Vale do Rio Real
          </title>
          <desc id="hl-mapa-descricao">
            {`Os ${municipios.length} municípios de Sergipe. Em destaque, quando selecionados, os municípios do recorte do Vale do Rio Real e São Cristóvão, pesquisado como referência de comparação. A lista ao lado descreve cada vínculo.`}
          </desc>

          <g>
            {contexto.map((municipio) => (
              <path d={municipio.caminho} key={municipio.codigoIbge} />
            ))}

            {grupos.map(({ definicao, membros, enquadramento }) => (
              <g
                aria-label={definicao.rotulo}
                className="hl-mapa__recorte"
                data-recorte={definicao.chave}
                key={definicao.chave}
              >
                {membros.map((municipio) => (
                  <path
                    d={municipio.caminho}
                    data-rel={municipio.relacoesTerritoriais
                      .map((relacao) => CLASSE_DA_RELACAO[relacao])
                      .join(" ")}
                    key={municipio.codigoIbge}
                  />
                ))}

                {/*
              Rótulos do desenho: reforço visual do estado selecionado, e só
              isso. Ficam invisíveis até a seleção. Não precisam de
              `aria-hidden`: sem JavaScript o `role="img"` já torna a subárvore
              apresentacional, e com a ilha montada o `aria-label` do grupo é o
              nome acessível da opção. A informação em texto está na lista de
              municípios e no painel.
            */}
                {membros.map((municipio) => {
                  const centro = centroDoCaminho(municipio.caminho);
                  if (centro === null || enquadramento === null) return null;
                  return (
                    <text
                      className="hl-mapa__rotulo"
                      fontSize={enquadramento.corpoDoRotulo}
                      key={`rotulo-${municipio.codigoIbge}`}
                      x={centro.x}
                      y={centro.y}
                    >
                      {municipio.nome}
                    </text>
                  );
                })}
              </g>
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
}
