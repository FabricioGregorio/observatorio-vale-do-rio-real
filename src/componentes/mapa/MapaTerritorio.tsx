import type { DadosDoMapa } from "../../dados/territorio/mapa";
import { DEFINICAO_VALE_DO_RIO_REAL } from "../../dados/territorio/recorte";
import {
  CLASSE_RAIZ,
  CSS_DO_MAPA,
  ID_DA_LISTA,
  ID_DO_SVG,
  ID_HACHURA,
} from "./estilosDoMapa";
import { MapaInterativo } from "./MapaInterativo";
import { MarcadorNoMapa } from "./MarcadorNoMapa";
import { MarcadorVisita } from "./MarcadorVisita";
import { Municipio } from "./Municipio";
import { MunicipioNoMapa } from "./MunicipioNoMapa";

/**
 * Mapa territorial — Tarefa 10B.3.3, Cenário C.
 *
 * SVG renderizado no servidor, a partir da malha oficial do IBGE. **Zero
 * JavaScript, zero WebGL, zero dependência de tiles ou de serviço externo.**
 * A escolha e a medição que a sustentam estão na auditoria 10B.3.2: a
 * biblioteca custaria 295 kB comprimidos; este mapa custa cerca de 17 kB.
 *
 * Recebe tudo por props e não busca nada — quem lê e valida o dado é
 * `montarDadosDoMapa`, em tempo de build.
 *
 * A estrutura tem duas metades que dizem a mesma coisa por meios diferentes:
 *
 * 1. o **desenho**, onde cada município é um `<a>` do SVG, focável por teclado,
 *    apontando para a sua entrada na lista;
 * 2. a **lista territorial**, que é a alternativa textual — funciona sem
 *    JavaScript, sem WebGL e por leitor de tela, e é também o destino dos links
 *    do desenho.
 *
 * A lista não está escondida atrás de um `<details>` de propósito: ela é a
 * alternativa textual, e sem JavaScript é o **único** caminho para a
 * informação — o desenho, nesse caso, é ilustração.
 *
 * A interação por teclado, mouse e toque vem de `MapaInterativo`, uma ilha
 * cliente que não renderiza nada e promove os polígonos a opções depois da
 * montagem. Com ela, o mapa é **uma** parada de Tab, não 75.
 *
 * Não renderiza cabeçalho: quem integra decide o enquadramento e o título.
 */
export function MapaTerritorio({ dados }: { dados: DadosDoMapa }) {
  const { projecao, municipios, pontosPosicionados, pontosSemPosicao } = dados;

  if (municipios.length === 0) return null;

  const doVale = municipios.filter((municipio) =>
    municipio.relacoesTerritoriais.includes("vale-rio-real"),
  );

  // Todos os pontos, posicionados ou não: a ficha de um município mostra os
  // pontos dele independentemente de haver coordenada para desenhar.
  const todosOsPontos = [
    ...pontosPosicionados.map((posicionado) => posicionado.ponto),
    ...pontosSemPosicao,
  ];

  return (
    <div className={`${CLASSE_RAIZ} flex flex-col gap-6`}>
      <style>{CSS_DO_MAPA}</style>

      {/*
        Sem JavaScript o desenho é imagem, e é o que ele anuncia. A ilha
        substitui este papel por `listbox` depois da montagem, quando a
        navegação passa a existir de verdade.
      */}
      <svg
        aria-label="Mapa dos municípios de Sergipe"
        className="h-auto w-full"
        id={ID_DO_SVG}
        role="img"
        viewBox={`0 0 ${projecao.largura} ${Math.round(projecao.altura)}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/*
            Hachura da camada de pesquisa de campo. Padrão do próprio SVG:
            nenhum arquivo, nenhuma imagem, nada externo.
          */}
          <pattern
            height={8}
            id={ID_HACHURA}
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

        {municipios.map((municipio) => (
          <MunicipioNoMapa key={municipio.codigoIbge} municipio={municipio} />
        ))}

        {pontosPosicionados.map((posicionado) => (
          <MarcadorNoMapa
            key={posicionado.ponto.id}
            posicionado={posicionado}
          />
        ))}
      </svg>

      <MapaInterativo idDaLista={ID_DA_LISTA} idDoSvg={ID_DO_SVG} />

      <p className="meta-ficha">
        Fonte: IBGE — Malhas Territoriais, malha municipal. {municipios.length}{" "}
        municípios de Sergipe.
      </p>

      <section
        aria-labelledby="lista-territorial"
        className="flex flex-col gap-3"
      >
        <h3 className="text-lg" id="lista-territorial">
          Municípios
        </h3>
        <p>
          {doVale.length} municípios formam o recorte do Vale do Rio Real.{" "}
          {DEFINICAO_VALE_DO_RIO_REAL}
        </p>
        <ul
          className="grid list-none gap-2 p-0 sm:grid-cols-2 lg:grid-cols-3"
          id={ID_DA_LISTA}
        >
          {municipios.map((municipio) => (
            <Municipio
              key={municipio.codigoIbge}
              municipio={municipio}
              pontos={todosOsPontos}
            />
          ))}
        </ul>
      </section>

      {pontosSemPosicao.length === 0 ? null : (
        <section
          aria-labelledby="pontos-sem-posicao"
          className="flex flex-col gap-2"
        >
          <h3 className="text-lg" id="pontos-sem-posicao">
            Pontos de visita ainda não posicionados
          </h3>
          <p>
            Estes pontos não aparecem no desenho porque ainda não têm coordenada
            conferida. Ficam listados para que nenhum registro de campo
            desapareça do mapa em silêncio.
          </p>
          <ul className="flex list-none flex-col gap-1 p-0">
            {pontosSemPosicao.map((ponto) => (
              <MarcadorVisita key={ponto.id} ponto={ponto} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
