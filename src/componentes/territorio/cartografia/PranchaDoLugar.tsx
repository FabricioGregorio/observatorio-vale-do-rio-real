import Image from "next/image";

import type { PosicaoConfirmada } from "../../../dados/territorio/referencias";
import { caminhoDoPin } from "../../mapa/caminhoDoPin";
import {
  aplicar,
  barraDeEscala,
  type Caixa,
  type Enquadramento,
} from "./geometria";
import { estaPosicionado, type LugarNoMapa } from "./local/composicao";
import { FONTES_DAS_CAMADAS } from "./local/entorno";
import { destinosDeRota } from "./local/rota";
import type { FotoDoLugar } from "./lugares";

/**
 * Prancha de um lugar: a página dupla do atlas.
 *
 * De um lado, o que a pesquisa viu — nome, fotografia, narrativa e as
 * evidências. Do outro, o mapa do entorno, que acompanha a leitura enquanto a
 * prancha está na tela. Os lados alternam de uma prancha para a outra; é
 * ritmo de página, e não hierarquia.
 *
 * ## Cada lugar com o que tem
 *
 * - Recanto da Serra traz registros do período: eles ganham numeral grande,
 *   como dado que são.
 * - Serra dos Macacos não tem fotografia pública nesta ficha. A prancha não
 *   simula uma: o mapa ocupa o lugar do retrato, e a ausência é dita.
 * - Ilha Grande está fora do recorte, e a prancha muda de papel — o anil é a
 *   cor da comparação na carta geral. O localizador mostra o ponto fora do
 *   milho.
 *
 * ## O mapa da prancha
 *
 * O `viewBox` é a vista do Vale, que é também o sistema de coordenadas da
 * camada local servida por `/territorio/camada-local/<id>`. No HTML inicial
 * vai a malha do entorno — os municípios, por `<use>`, sob o enquadramento
 * local — e o pin na coordenada confirmada. Vias, cursos d'água e
 * localidades chegam sob demanda, quando a prancha se aproxima da tela.
 *
 * O localizador no canto é a carta geral em miniatura: o Vale, a comparação e
 * o retângulo real da janela da prancha. Ele diz de onde a prancha foi
 * recortada — e mais nada.
 */

const n = (v: number) => v.toFixed(1);
const matriz = (e: Enquadramento) =>
  `matrix(${e.s.toFixed(5)} 0 0 ${e.s.toFixed(5)} ${e.tx.toFixed(3)} ${e.ty.toFixed(3)})`;

/**
 * Coordenada para leitura, em grau decimal com seis casas — cerca de 11 cm.
 *
 * As quinze casas de `referencias.ts` são artefato de ponto flutuante, não
 * precisão de campo. Isto é formatação, e só: o destino das rotas externas
 * continua saindo do valor canônico, intacto.
 */
const coordenada = (p: PosicaoConfirmada) =>
  `${p.latitude.toFixed(6)}, ${p.longitude.toFixed(6)}`;

/**
 * Retrato de abertura e as demais fotografias, nessa ordem.
 *
 * A marca `principal` vem do manifesto do corpus. Onde a fonte não marca
 * nenhuma — os três derivados da pesquisa em Ilha Grande —, abre a primeira
 * da lista. Nenhuma fotografia é descartada.
 */
function retratoEDemais(fotos: readonly FotoDoLugar[]): {
  readonly retrato: FotoDoLugar | null;
  readonly demais: readonly FotoDoLugar[];
} {
  const retrato = fotos.find((f) => f.principal) ?? fotos[0] ?? null;
  return { retrato, demais: fotos.filter((foto) => foto !== retrato) };
}

export type MunicipioDaMalha = {
  readonly codigo: string;
  readonly classe: string;
  readonly caixa: Caixa;
};

export function PranchaDoLugar({
  lugar,
  municipio,
  noRecorte,
  baseDasCamadas,
  vista,
  fs,
  raio,
  kmU,
  quadro,
  malha,
  doVale,
  comparacao,
  lado,
  idDoCapitulo,
  idDoMunicipio,
}: {
  lugar: LugarNoMapa;
  municipio: string | null;
  noRecorte: boolean;
  baseDasCamadas: string;
  vista: Caixa;
  fs: number;
  raio: number;
  kmU: number;
  /** Quadro da carta geral, reaproveitado pelo localizador. */
  quadro: Caixa;
  malha: readonly MunicipioDaMalha[];
  doVale: readonly string[];
  comparacao: readonly string[];
  lado: "direita" | "esquerda";
  idDoCapitulo: string;
  idDoMunicipio: (codigo: string) => string;
}) {
  const idTitulo = `${idDoCapitulo}-titulo`;
  const materiaisPublicos = lugar.materiais.filter(
    (material) => material.estado === "publico",
  );
  const posicao = lugar.posicao;
  const { retrato, demais } = retratoEDemais(lugar.fotos);
  const semRetrato = retrato === null;
  const situacao = [
    lugar.tipo?.texto ?? null,
    municipio ?? "Município não publicado",
    noRecorte ? "no recorte" : "fora do recorte",
  ].filter((parte): parte is string => parte !== null);

  return (
    <section
      aria-labelledby={idTitulo}
      className="tv-prancha"
      data-fora={noRecorte ? undefined : "sim"}
      data-lado={lado}
      data-retrato={semRetrato ? "nao" : "sim"}
      data-tv-capitulo={lugar.id}
      id={idDoCapitulo}
    >
      <div className="tv-prancha__grade">
        <header className="tv-prancha__cab">
          <p className="tv-sobrescrito">{situacao.join(" · ")}</p>
          <h2 id={idTitulo}>{lugar.nome}</h2>
          {lugar.nomeCompleto !== null && lugar.nomeCompleto !== lugar.nome ? (
            <p className="tv-prancha__nome-completo">{lugar.nomeCompleto}</p>
          ) : null}
          {lugar.lacunaDeLocalizacao !== null ? (
            <p className="lacuna">{lugar.lacunaDeLocalizacao}</p>
          ) : null}
        </header>

        {retrato === null ? null : (
          <figure className="tv-retrato">
            <Image
              alt={retrato.alt}
              height={retrato.altura}
              sizes="(min-width: 1100px) 32vw, (min-width: 700px) 46vw, 92vw"
              src={retrato.src}
              width={retrato.largura}
            />
            <Legenda foto={retrato} />
          </figure>
        )}

        <div className="tv-prancha__leitura">
          {lugar.descricao !== null ? (
            <blockquote className="tv-prancha__relato">
              <p>{lugar.descricao.texto}</p>
              <footer className="tv-fonte">{lugar.descricao.fonte}</footer>
            </blockquote>
          ) : null}

          {semRetrato ? (
            /*
              A frase descreve o estado **da ficha**, e nada além dele. Não
              afirma que o lugar não tem fotografia — o acervo de origem tem —
              nem anuncia material fora do universo público.
            */
            <p className="lacuna">
              Esta ficha ainda não reúne fotografia pública.
            </p>
          ) : null}

          {lugar.dados.length > 0 ? (
            <section className="tv-registros">
              <h3>Registros do período</h3>
              <dl>
                {lugar.dados.map((d) => (
                  <div key={d.rotulo}>
                    <dt>{d.rotulo}</dt>
                    <dd>{d.valor}</dd>
                  </div>
                ))}
              </dl>
              <p className="tv-fonte">{lugar.dados[0]?.fonte}</p>
            </section>
          ) : null}

          {materiaisPublicos.length > 0 ? (
            <section className="tv-evidencias">
              <h3>Evidências públicas</h3>
              <ul>
                {materiaisPublicos.map((m) => (
                  <li key={m.material}>
                    {m.href !== null ? (
                      <a href={m.href}>{m.material}</a>
                    ) : (
                      <span>{m.material}</span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        {demais.length > 0 ? (
          <section className="tv-contato">
            <h3>Fotografias de campo</h3>
            <div className="tv-contato__folha">
              {demais.map((foto) => (
                <figure className="tv-contato__foto" key={foto.src}>
                  <Image
                    alt={foto.alt}
                    height={foto.altura}
                    sizes="(min-width: 1100px) 16vw, (min-width: 700px) 24vw, 46vw"
                    src={foto.src}
                    width={foto.largura}
                  />
                  <Legenda foto={foto} />
                </figure>
              ))}
            </div>
          </section>
        ) : null}

        {posicao !== null || lugar.localidade !== null ? (
          <details className="tv-ficha">
            <summary>Localização e acesso</summary>
            <div className="tv-ficha__corpo">
              {posicao !== null ? (
                <p className="coordenada">{coordenada(posicao)}</p>
              ) : null}
              <dl>
                {lugar.localidade !== null ? (
                  <div>
                    <dt>Localização documental</dt>
                    <dd>
                      {lugar.localidade.texto}
                      {municipio !== null ? `, ${municipio} (SE)` : ""}
                    </dd>
                  </div>
                ) : null}
                {posicao !== null ? (
                  /*
                    Duas frases, e não uma: a data de confirmação da
                    coordenada não é data de visita, que este projeto não
                    possui para nenhum dos quatro lugares.
                  */
                  <div>
                    <dt>Procedência do ponto</dt>
                    <dd>
                      Ponto do próprio lugar, não do município. Coordenada:{" "}
                      {posicao.fonteDaCoordenada}.
                    </dd>
                  </div>
                ) : null}
                {lugar.camadaLocal?.referenciaCartografica != null ? (
                  <div>
                    <dt>Referência cartográfica</dt>
                    <dd>
                      {lugar.camadaLocal.referenciaCartografica.rotulo} —
                      referência territorial próxima; não representa o lugar
                      visitado.
                    </dd>
                  </div>
                ) : null}
                {lugar.comoChegar?.referencia != null ? (
                  <div>
                    <dt>Referência de acesso</dt>
                    <dd>{lugar.comoChegar.referencia.texto}</dd>
                  </div>
                ) : null}
              </dl>
              {posicao !== null ? (
                <div className="tv-ficha__rota">
                  <ul>
                    {destinosDeRota(posicao).map((destino) => (
                      <li key={destino.servico}>
                        <a
                          href={destino.href}
                          referrerPolicy="no-referrer"
                          rel="noopener noreferrer external"
                          target="_blank"
                        >
                          {destino.servico}
                        </a>
                      </li>
                    ))}
                  </ul>
                  <p className="tv-fonte">
                    Consulta externa opcional. Nenhum serviço de mapas é
                    carregado antes do clique.
                  </p>
                </div>
              ) : null}
            </div>
          </details>
        ) : null}

        <CartaDaPrancha
          baseDasCamadas={baseDasCamadas}
          comparacao={comparacao}
          doVale={doVale}
          fs={fs}
          idDoMunicipio={idDoMunicipio}
          kmU={kmU}
          lugar={lugar}
          malha={malha}
          municipio={municipio}
          quadro={quadro}
          raio={raio}
          vista={vista}
        />

        {/*
          No celular a faixa dos lugares não fica presa ao topo: este link é o
          caminho curto de volta à carta. Nas telas maiores a faixa está
          sempre à vista, e ele sai (inclusive da ordem de Tab).
        */}
        <p className="tv-prancha__voltar">
          <a href="#tv-carta">↑ Voltar à carta dos lugares</a>
        </p>
      </div>
    </section>
  );
}

function Legenda({ foto }: { foto: FotoDoLugar }) {
  return (
    <figcaption>
      {foto.legenda}
      {foto.qualificador !== null ? (
        <span className="credito">{foto.qualificador}</span>
      ) : null}
      {foto.credito !== null ? (
        <span className="credito">{foto.credito}</span>
      ) : null}
      {foto.pendencia !== null ? (
        <span className="pendencia">{foto.pendencia}</span>
      ) : null}
    </figcaption>
  );
}

function CartaDaPrancha({
  lugar,
  municipio,
  baseDasCamadas,
  vista,
  fs,
  raio,
  kmU,
  quadro,
  malha,
  doVale,
  comparacao,
  idDoMunicipio,
}: {
  lugar: LugarNoMapa;
  municipio: string | null;
  baseDasCamadas: string;
  vista: Caixa;
  fs: number;
  raio: number;
  kmU: number;
  quadro: Caixa;
  malha: readonly MunicipioDaMalha[];
  doVale: readonly string[];
  comparacao: readonly string[];
  idDoMunicipio: (codigo: string) => string;
}) {
  if (!estaPosicionado(lugar)) {
    return (
      <figure className="tv-carta tv-carta--sem-posicao">
        <p className="lacuna">O mapa não posiciona este lugar.</p>
      </figure>
    );
  }

  const vw = vista.x1 - vista.x0;
  const vh = vista.y1 - vista.y0;
  const local = lugar.local;
  const e = local?.enquadramento ?? lugar.regional;
  /* A janela da prancha, de volta ao sistema da malha. */
  const janela: Caixa = {
    x0: (vista.x0 - e.tx) / e.s,
    y0: (vista.y0 - e.ty) / e.s,
    x1: (vista.x1 - e.tx) / e.s,
    y1: (vista.y1 - e.ty) / e.s,
  };
  const naJanela = malha.filter(
    (m) =>
      m.caixa.x0 <= janela.x1 &&
      m.caixa.x1 >= janela.x0 &&
      m.caixa.y0 <= janela.y1 &&
      m.caixa.y1 >= janela.y0,
  );
  const [px, py] = aplicar(e, lugar.xy[0], lugar.xy[1]);
  const raioDoPin = raio * 0.95;
  const barra = barraDeEscala(kmU, e.s, vw * 0.22);
  const km = Math.round((vw / e.s) * kmU);

  /*
    O retângulo do localizador é a própria janela da prancha, levada de volta
    ao sistema da malha: exatamente o que o mapa ao lado mostra.
  */
  const retangulo = janela;

  const rotulo =
    local === null
      ? `Mapa da região de ${lugar.nome}${municipio !== null ? `, em ${municipio}` : ""}, com o pin na sua localização.`
      : lugar.camadaLocal?.localidadeIbge !== null &&
          lugar.localidade !== null &&
          municipio !== null
        ? `Mapa do entorno do ${lugar.localidade.texto}, em ${municipio}: pin de ${lugar.nome} na sua localização e, com outro símbolo, a localidade segundo o IBGE. Vias e cursos d'água do OpenStreetMap; localidades do IBGE.`
        : lugar.camadaLocal?.referenciaCartografica != null
          ? `Mapa do entorno de ${lugar.nome}: pin na localização da comunidade visitada. ${lugar.camadaLocal.referenciaCartografica.rotulo} aparece apenas como referência cartográfica próxima e não representa o lugar visitado. Vias e cursos d'água do OpenStreetMap; localidades do IBGE.`
          : `Mapa do entorno de ${lugar.nome}, com o pin na sua localização. Vias e cursos d'água do OpenStreetMap; localidades do IBGE.`;
  const idDoTitulo = `tv-carta-${lugar.id}-titulo`;
  const valeDoLocalizador = new Set(doVale);

  return (
    <figure
      className="tv-carta"
      data-tv-camada={
        local !== null ? `${baseDasCamadas}/${lugar.id}` : undefined
      }
      data-tv-carta={lugar.id}
    >
      <div className="tv-carta__placa">
        <svg
          aria-labelledby={idDoTitulo}
          role="img"
          viewBox={`${n(vista.x0)} ${n(vista.y0)} ${n(vw)} ${n(vh)}`}
        >
          <title id={idDoTitulo}>{rotulo}</title>
          <rect
            className="tv-carta__papel"
            height={n(vh)}
            width={n(vw)}
            x={n(vista.x0)}
            y={n(vista.y0)}
          />
          <g className="tv-carta__base" transform={matriz(e)}>
            {naJanela.map((m) => (
              <use
                className={m.classe}
                href={`#${idDoMunicipio(m.codigo)}`}
                key={m.codigo}
              />
            ))}
          </g>
          <g
            className="tv-carta__pin"
            transform={`translate(${n(px)} ${n(py)})`}
          >
            <path className="forma" d={caminhoDoPin(raioDoPin)} />
            <circle
              className="miolo"
              cy={-2 * raioDoPin}
              r={raioDoPin * 0.38}
            />
            <text x={raioDoPin * 1.5} y={-2 * raioDoPin + fs * 0.35}>
              {lugar.nome}
            </text>
          </g>
          {local !== null ? (
            <g className="tv-local" data-tv-camada-local={lugar.id} />
          ) : null}
          {/*
            "Você está aqui": anel em volta da gota, por cima da camada local.
            Acende quando a prancha entra em leitura e quando a leitura chega
            à localização do lugar na ficha.
          */}
          <g
            className="tv-carta__halo"
            transform={`translate(${n(px)} ${n(py - 2 * raioDoPin)})`}
          >
            {["", " tv-carta__halo--luz"].map((variante) => (
              <circle
                className={`anel${variante}`}
                key={variante}
                r={n(raioDoPin * 2.1)}
              />
            ))}
          </g>
          <g className="tv-carta__fixo">
            <g
              transform={`translate(${n(vista.x1 - vw * 0.07)} ${n(vista.y0 + vh * 0.05)})`}
            >
              {[true, false].map((casco) => (
                <path
                  className={casco ? "casco" : undefined}
                  d={`M0 ${n(fs * 1.6)} L0 0 M${n(-fs * 0.4)} ${n(fs * 0.5)} L0 0 L${n(fs * 0.4)} ${n(fs * 0.5)}`}
                  key={casco ? "casco" : "traco"}
                  strokeWidth={fs * (casco ? 0.42 : 0.12)}
                />
              ))}
              <text fontSize={fs * 0.9} textAnchor="middle" y={fs * 2.6}>
                N
              </text>
            </g>
            <g
              transform={`translate(${n(vista.x0 + vw * 0.05)} ${n(vista.y1 - vh * 0.05)})`}
            >
              {[true, false].map((casco) => (
                <path
                  className={casco ? "casco" : undefined}
                  d={`M0 ${n(-fs * 0.35)} L0 0 L${n(barra.unidades)} 0 L${n(barra.unidades)} ${n(-fs * 0.35)}`}
                  key={casco ? "casco" : "traco"}
                  strokeWidth={fs * (casco ? 0.4 : 0.1)}
                />
              ))}
              <text fontSize={fs * 0.8} y={-fs * 0.6}>
                {barra.km} km
              </text>
            </g>
          </g>
        </svg>

        {/* Localizador: a carta geral em miniatura, com a janela desta prancha. */}
        <svg
          aria-hidden="true"
          className="tv-localizador"
          focusable="false"
          viewBox={`${n(quadro.x0)} ${n(quadro.y0)} ${n(quadro.x1 - quadro.x0)} ${n(quadro.y1 - quadro.y0)}`}
        >
          {[...doVale, ...comparacao].map((codigo) => (
            <use
              className={valeDoLocalizador.has(codigo) ? "m v" : "m c"}
              href={`#${idDoMunicipio(codigo)}`}
              key={codigo}
            />
          ))}
          <rect
            className="janela"
            height={n(retangulo.y1 - retangulo.y0)}
            width={n(retangulo.x1 - retangulo.x0)}
            x={n(retangulo.x0)}
            y={n(retangulo.y0)}
          />
          <circle
            className="ponto"
            cx={n(lugar.xy[0])}
            cy={n(lugar.xy[1])}
            r={n(fs * 1.3)}
          />
        </svg>
      </div>

      <figcaption>
        <span className="tv-carta__escala">
          <span className="nivel">{local !== null ? "Entorno" : "Região"}</span>{" "}
          {km} km de largura{municipio !== null ? ` · ${municipio}` : ""}
        </span>
        <span className="tv-fonte">
          {local !== null ? (
            <>
              Base: IBGE e{" "}
              <a href="https://www.openstreetmap.org/copyright">
                {FONTES_DAS_CAMADAS.vias}
              </a>
              . Ponto na posição registrada pelo Observatório.
            </>
          ) : (
            "Base cartográfica: IBGE. Ponto na posição registrada pelo Observatório."
          )}
        </span>
        {local !== null ? (
          <details className="tv-carta__legenda">
            <summary>Legenda</summary>
            <ul aria-label={`Legenda do mapa de ${lugar.nome}`}>
              <li>
                <span aria-hidden="true" className="tv-amostra--pin" />
                Lugar da pesquisa
              </li>
              <li>
                <span
                  aria-hidden="true"
                  className="tv-amostra tv-amostra--referencia"
                />
                Localidade do lugar
              </li>
              <li>
                <span
                  aria-hidden="true"
                  className="tv-amostra tv-amostra--sede"
                />
                Sede municipal
              </li>
              <li>
                <span
                  aria-hidden="true"
                  className="tv-amostra tv-amostra--localidade"
                />
                Outra localidade ou referência IBGE
              </li>
              <li>
                <span aria-hidden="true" className="tv-traco" />
                Rodovia
              </li>
              <li>
                <span aria-hidden="true" className="tv-traco tv-traco--agua" />
                Curso d'água
              </li>
            </ul>
          </details>
        ) : null}
      </figcaption>
    </figure>
  );
}
