import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import {
  dataCurta,
  dataMaquina,
  duracaoLegivel,
  duracaoMaquina,
  numeroDoEpisodio,
} from "../../componentes/podobservar/formato";
import {
  AssistirNoYoutube,
  OuvirNoSpotify,
} from "../../componentes/podobservar/LinkDeEscuta";
import { listarEpisodiosPublicos } from "../../dados/consultas/podobservar";
import { LOGO_PODOBSERVAR } from "../../dados/podobservar-artes";
import { metadadosDaRota } from "../../lib/site-url";
import "./podobservar.css";

export const metadata = metadadosDaRota({
  pathname: "/podobservar",
  titulo: "PodObservar — Observatório do Vale do Rio Real",
  descricao:
    "O podcast do Observatório do Vale do Rio Real: vozes, entrevistas, " +
    "dados e experiências do território, com transcrição de cada episódio.",
  imagens: [LOGO_PODOBSERVAR.src],
});

/**
 * `/podobservar` — a página editorial do podcast.
 *
 * Lê `listarEpisodiosPublicos()`, que lê `vw_episodio_publico`. Rascunho,
 * em revisão, arquivado e episódio datado no futuro não chegam aqui porque
 * não passam do banco — não há filtro nesta página, e não poderia haver: o
 * gate mora na view.
 *
 * A ordem é a da consulta, `publicado_em DESC`. Nada nesta página conhece a
 * quantidade de episódios; com o EP04 a lista cresce sozinha.
 *
 * Sem player, sem embed, sem download. O destino de escuta é o Spotify.
 */
export default async function PaginaPodObservar() {
  const episodios = await listarEpisodiosPublicos();
  const temporada = episodios[0]?.temporadaTitulo ?? "1ª Temporada";

  return (
    <div className="pod mx-auto flex max-w-5xl flex-col gap-12 px-4 py-10 md:py-16">
      <header className="pod-abertura">
        <div aria-hidden="true" className="pod-abertura__tracado" />
        <div className="pod-abertura__composicao">
          <Image
            alt=""
            className="pod-abertura__logo"
            height={LOGO_PODOBSERVAR.altura}
            priority
            src={LOGO_PODOBSERVAR.src}
            width={LOGO_PODOBSERVAR.largura}
          />
          <div>
            <p className="meta-ficha">PodObservar</p>
            <h1 className="mt-5 max-w-3xl text-4xl md:text-5xl">
              A pesquisa também se escuta.
            </h1>
            <p className="mt-5 max-w-prose text-lg">
              O PodObservar leva a pesquisa do Observatório para o áudio,
              reunindo vozes, entrevistas, dados e experiências do território em
              uma linguagem clara e acessível.
            </p>
            <p className="mt-4 max-w-prose">
              Nem todo mundo chega a uma pesquisa por um relatório técnico. O
              PodObservar abre outro caminho: transforma parte do percurso do
              Observatório em narrativa sonora — as estradas, os povoados e os
              encontros que o campo produziu.
            </p>
            <p className="mt-4 max-w-prose">
              Os episódios são ouvidos no Spotify. Aqui ficam a apresentação de
              cada um e a transcrição revisada completa, para quem prefere ler
              ou não pode ouvir.
            </p>
            <p className="pod-abertura__selos">
              <span>{temporada}</span>
              <span>Novo episódio toda segunda-feira</span>
            </p>
          </div>
        </div>
      </header>

      <section aria-labelledby="pod-episodios-titulo">
        <p className="meta-ficha">Episódios</p>
        <h2 className="mt-2 text-2xl" id="pod-episodios-titulo">
          Todos os episódios publicados
        </h2>
        <p className="mt-4 max-w-prose">
          A primeira temporada acompanha a primeira pesquisa do Observatório: os
          potenciais ecoturísticos e culturais do Vale do Rio Real, lidos pela
          economia solidária, pela preservação ambiental e pela cultura local.
          Ela começa pelo território e pelo coletivo que o pesquisa, e segue
          pelos lugares acompanhados de perto.
        </p>

        {episodios.length === 0 ? (
          <p className="pod-vazio mt-6">
            Nenhum episódio publicado no site até agora.
          </p>
        ) : (
          <ol className="pod-lista mt-6">
            {episodios.map((episodio) => (
              <li className="pod-episodio" key={episodio.slug}>
                {episodio.capaUrl &&
                episodio.capaLarguraPx &&
                episodio.capaAlturaPx ? (
                  <Image
                    alt=""
                    className="pod-episodio__capa"
                    height={episodio.capaAlturaPx}
                    loading="lazy"
                    sizes="(min-width: 768px) 18rem, 100vw"
                    src={episodio.capaUrl}
                    width={episodio.capaLarguraPx}
                  />
                ) : null}
                <div className="pod-episodio__conteudo">
                  <p aria-hidden="true" className="pod-episodio__numero">
                    {numeroDoEpisodio(episodio.numero)}
                  </p>
                  <h3>
                    <span className="sr-only">
                      Episódio {episodio.numero}:{" "}
                    </span>
                    {episodio.titulo}
                  </h3>
                  <p className="pod-episodio__meta">
                    <time dateTime={dataMaquina(episodio.publicadoEm)}>
                      {dataCurta(episodio.publicadoEm)}
                    </time>
                    {" · "}
                    <time dateTime={duracaoMaquina(episodio.duracaoSeg)}>
                      {duracaoLegivel(episodio.duracaoSeg)}
                    </time>
                  </p>
                  <p className="pod-episodio__resumo">{episodio.resumo}</p>
                  <p className="pod-acoes">
                    <OuvirNoSpotify
                      href={episodio.urlSpotify}
                      id={`pod-spotify-${episodio.slug}`}
                    />
                    <AssistirNoYoutube
                      href={episodio.urlYoutube}
                      id={`pod-youtube-${episodio.slug}`}
                    />
                    <Link
                      /* Mesmo padrão do Acervo para rota dinâmica com typedRoutes. */
                      href={
                        `/podobservar/t${episodio.temporadaNumero}/${episodio.slug}` as Route
                      }
                    >
                      <span className="sr-only">{episodio.titulo}: </span>
                      Ler transcrição e detalhes →
                    </Link>
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
