import {
  type DadosDoMapa,
  montarDadosDoMapa,
} from "../../dados/territorio/mapa";
import { posicaoNoSvg } from "../../dados/territorio/projecao";
import { REFERENCIAS_TERRITORIAIS } from "../../dados/territorio/referencias";
import { caminhoDoPin } from "../mapa/caminhoDoPin";
import {
  CLASSE_RAIZ,
  CSS_DO_MAPA,
  classesDoMunicipio,
  temHachura,
} from "../mapa/estilosDoMapa";
import { CSS_DO_TERRITORIO } from "../territorio/estilosDoTerritorio";
import {
  ALVOS_EDITORIAIS,
  DEFINICOES,
  municipiosDoRecorte,
  recorteDoMunicipio,
} from "./recortes";

export const ID_DO_MAPA = "hl-mapa";
export const ID_DO_PAINEL_DO_MAPA = "hl-mapa-painel";
export const ID_DA_LISTA_DO_RECORTE = "hl-municipios";
export const ID_DA_HACHURA = "hl-mapa-hachura-pesquisa";

/**
 * Raio do pin, em unidades do `viewBox`: acompanha a escala do mapa.
 *
 * O desenho é o mesmo de `/territorio` — `caminhoDoPin` é a única definição da
 * gota no projeto, e a ponta cai exatamente sobre a coordenada confirmada.
 */
const RAIO_DO_LUGAR = 9;

/**
 * Raio do alvo de toque de cada lugar, em unidades do `viewBox`.
 *
 * A gota tem 9 unidades; num `viewBox` de 1000 servido a 317 px — o mapa em
 * viewport de 375 px — ela mede menos de 6 px e seria intocável no telefone.
 * Este círculo é transparente, não aparece no desenho e existe só para dar
 * alvo: 40 unidades viram ~25 px de diâmetro no telefone e ~53 px em 1440 px.
 *
 * O valor é o maior que cabe sem que dois alvos se sobreponham: os dois lugares
 * mais próximos, Recanto da Serra e Serra dos Macacos, ficam a ~80 unidades um
 * do outro.
 */
const RAIO_DO_ALVO = 40;

/** Rótulo acessível de cada lugar, da tabela editorial única. */
const ROTULO_DO_LUGAR = new Map(
  ALVOS_EDITORIAIS.map((alvo) => [alvo.chave, alvo.rotulo]),
);

/**
 * Semântica explícita dos recortes e dos lugares rotulados dentro do SVG.
 *
 * O valor vem de uma constante, e não de um literal escrito no atributo, para
 * que o analisador JSX não trate `<g>` como um controle HTML convertido. O
 * markup entregue é o mesmo: o DOM continua recebendo exatamente
 * `role="group"`, como o axe exige para aceitar `aria-label`.
 *
 * Até 2026-09-24 a constante era um objeto espalhado com `{...}` no elemento.
 * Isso tinha um efeito que não estava à vista: com um spread nas props, o
 * compilador JSX não consegue emitir a forma otimizada e chama o runtime sem
 * declarar que os filhos são estáticos. React passa a tratar os quatro filhos
 * fixos de cada `<g>` como uma lista dinâmica e cobra `key` de todos —
 * "Each child in a list should have a unique key prop", apontando `<circle>`
 * no servidor e `<g>` no cliente. Um atributo com valor de constante não tem
 * esse efeito, e o desenho não muda em nada.
 */
const PAPEL_DE_GRUPO = "group";

/**
 * Mapa do recorte — Server Component, sem ilha cliente própria.
 *
 * Desenha a malha oficial de Sergipe com a projeção e os dados de sempre, no
 * tratamento cartográfico da composição original: quatro camadas visuais
 * independentes, todas legíveis de uma vez, e nenhuma delas dependente de
 * seleção.
 *
 * | camada | canal visual |
 * |---|---|
 * | Sergipe | preenchimento pedra, fronteira carvão-suave |
 * | Vale do Rio Real | preenchimento milho, traço mata |
 * | pesquisa de campo | hachura diagonal em mata, sobreposta |
 * | comparação | traço tracejado em anil |
 *
 * Os três canais — preenchimento, padrão e traço — são independentes, e é isso
 * que faz Tobias Barreto ler como Vale *e* pesquisa, e São Cristóvão ler como
 * pesquisa *e* comparação sem nunca ler como Vale. Nenhuma camada depende só
 * de cor (WCAG 1.4.1). O tratamento vem de `CSS_DO_MAPA` e `CSS_DO_TERRITORIO`,
 * que são a folha cartográfica compartilhada com o laboratório — a Home não
 * tem uma segunda paleta de mapa.
 *
 * ## O que é opção, e o que é contexto
 *
 * Nenhum dos 75 municípios é opção. São opções os **seis alvos editoriais**:
 * os dois recortes que o Observatório declarou, que são grupos de municípios,
 * e os quatro lugares onde a pesquisa esteve em campo, que são pins. Todos
 * carregam `data-recorte` com o seu identificador, e é por ele que a ilha os
 * promove a opções de uma listbox só — ela não precisa distinguir um grupo de
 * cinco municípios de um ponto.
 *
 * Selecionar reforça o traço, nomeia os lugares envolvidos e troca a leitura
 * editorial ao lado.
 *
 * ## Por que os atributos de interação não vêm daqui
 *
 * `role="listbox"`, `tabindex` e `aria-selected` entram depois da montagem da
 * ilha. Vindo do servidor, o mapa prometeria navegação por teclado antes de o
 * JavaScript existir — e, para quem o mantém desligado, prometeria para
 * sempre. Sem JavaScript o desenho é imagem, com `role="img"`, e a informação
 * editorial continua inteira na leitura em texto abaixo.
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
    return { definicao, membros };
  });

  const contexto = municipios.filter(
    (municipio) => !daqui.has(municipio.codigoIbge),
  );
  const doVale = grupos[0]?.membros ?? [];

  return (
    <figure className="territorio-cartografico__mapa">
      <div className="territorio-cartografico__moldura">
        <svg
          aria-labelledby="hl-mapa-titulo hl-mapa-descricao"
          className="territorio-cartografico__svg"
          id={ID_DO_MAPA}
          role="img"
          viewBox={`0 0 ${projecao.largura} ${Math.ceil(projecao.altura)}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <title id="hl-mapa-titulo">
            Sergipe e o recorte do Vale do Rio Real
          </title>
          <desc id="hl-mapa-descricao">
            {`Os ${municipios.length} municípios de Sergipe. Em milho, os municípios do recorte do Vale do Rio Real; em hachura, os que foram objeto de pesquisa de campo; em traço tracejado, São Cristóvão, pesquisado como referência de comparação. A leitura em texto abaixo descreve cada vínculo.`}
          </desc>

          <defs>
            <pattern
              height={8}
              id={ID_DA_HACHURA}
              patternTransform="rotate(45)"
              patternUnits="userSpaceOnUse"
              width={8}
            >
              <line
                stroke="var(--color-mata)"
                strokeWidth={1.6}
                x1={0}
                x2={0}
                y1={0}
                y2={8}
              />
            </pattern>
          </defs>

          {contexto.map((municipio) => (
            <path
              className="m"
              d={municipio.caminho}
              key={municipio.codigoIbge}
            />
          ))}

          {grupos.map(({ definicao, membros }) => (
            <g
              aria-label={definicao.rotulo}
              className="territorio-cartografico__recorte"
              data-recorte={definicao.chave}
              key={definicao.chave}
              role={PAPEL_DE_GRUPO}
            >
              {membros.map((municipio) => (
                <path
                  className={classesDoMunicipio(municipio.relacoesTerritoriais)}
                  d={municipio.caminho}
                  key={municipio.codigoIbge}
                />
              ))}

              {membros.filter(temHachuraNoMunicipio).map((municipio) => (
                <path
                  className="h"
                  d={municipio.caminho}
                  key={`hachura-${municipio.codigoIbge}`}
                  style={{ fill: `url(#${ID_DA_HACHURA})` }}
                />
              ))}
            </g>
          ))}

          {/*
            Os quatro lugares visitados, nas posições documentadas pela pesquisa.
            O ponto aparece sempre — é a pesquisa no desenho; o
            nome só aparece quando o lugar, ou o recorte em que ele cai, está
            selecionado, para que a visão geral continue sendo a malha e não uma
            lista de etiquetas. O nome de cada lugar está em texto no bloco
            Pontos de pesquisa, e a subárvore é apresentacional enquanto o SVG
            for `role="img"`.

            Cada lugar é também um alvo editorial: leva `data-recorte` com o seu
            próprio id, o que o torna opção do mesmo listbox dos dois recortes,
            sem que a ilha precise saber a diferença entre um `<g>` de cinco
            municípios e um pin.
          */}
          {REFERENCIAS_TERRITORIAIS.map((lugar) => {
            const [x, y] = posicaoNoSvg(
              [lugar.longitude, lugar.latitude],
              projecao,
            );
            const municipio = municipios.find(
              (candidato) => candidato.codigoIbge === lugar.municipioIbge,
            );
            const recorte =
              municipio === undefined
                ? undefined
                : recorteDoMunicipio(municipio.relacoesTerritoriais);

            return (
              <g
                aria-label={ROTULO_DO_LUGAR.get(lugar.id) ?? lugar.nome}
                className="territorio-cartografico__lugar"
                data-lugar-do-recorte={recorte}
                data-recorte={lugar.id}
                key={lugar.id}
                role={PAPEL_DE_GRUPO}
                transform={`translate(${x} ${y})`}
              >
                <circle className="alvo" cy={-RAIO_DO_LUGAR} r={RAIO_DO_ALVO} />
                <path className="forma" d={caminhoDoPin(RAIO_DO_LUGAR)} />
                <circle
                  className="miolo"
                  cy={-2 * RAIO_DO_LUGAR}
                  r={RAIO_DO_LUGAR * 0.38}
                />
                <text
                  x={RAIO_DO_LUGAR * 1.5}
                  y={-2 * RAIO_DO_LUGAR + RAIO_DO_LUGAR * 0.55}
                >
                  {lugar.nome}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <figcaption className="meta-ficha">
        Nota cartográfica — IBGE, Malhas Territoriais, malha municipal. Sergipe
        inteiro; {doVale.length} municípios no recorte do Vale.
      </figcaption>

      <ul
        aria-label="Legenda do mapa"
        className="territorio-cartografico__legenda"
      >
        <li>
          <span
            aria-hidden="true"
            className="territorio-cartografico__amostra"
          />
          Sergipe
        </li>
        <li>
          <span
            aria-hidden="true"
            className="territorio-cartografico__amostra territorio-cartografico__amostra--vale"
          />
          Vale
        </li>
        <li>
          <span
            aria-hidden="true"
            className="territorio-cartografico__amostra territorio-cartografico__amostra--pesquisa"
          />
          Pesquisa
        </li>
      </ul>
    </figure>
  );
}

/** A hachura é uma segunda passada sobre o mesmo caminho, e vem depois dele. */
function temHachuraNoMunicipio(
  municipio: DadosDoMapa["municipios"][number],
): boolean {
  return temHachura(municipio.relacoesTerritoriais);
}

/** Classe que escopa toda a folha cartográfica; a seção a veste. */
export const CLASSE_DO_MAPA = CLASSE_RAIZ;

/** Folha cartográfica compartilhada, servida junto da seção. */
export const CSS_CARTOGRAFICO = `${CSS_DO_MAPA}\n${CSS_DO_TERRITORIO}`;
