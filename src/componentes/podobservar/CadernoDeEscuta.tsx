import Image from "next/image";
import { LOGO_PODOBSERVAR } from "../../dados/podobservar-artes";
import type { EpisodioPublico } from "../../dados/podobservar-publico";
import { ActionLink } from "../ui/ActionLink";
import {
  dataCurta,
  dataMaquina,
  duracaoLegivel,
  duracaoMaquina,
  numeroDoEpisodio,
} from "./formato";

function EntradaDeEscuta({
  episodio,
  destaque = false,
}: {
  episodio: EpisodioPublico;
  destaque?: boolean;
}) {
  const Titulo = destaque ? "h2" : "h3";
  return (
    <article
      className={`pod-entrada${destaque ? " pod-entrada--principal" : ""}`}
      aria-labelledby={`titulo-${episodio.slug}`}
    >
      <div className="pod-entrada__edicao">
        <p className="pod-rubrica">
          {destaque ? "Episódio mais recente" : "Episódio"}
        </p>
        <span className="pod-entrada__numero" aria-hidden="true">
          {numeroDoEpisodio(episodio.numero)}
        </span>
      </div>
      {episodio.capaUrl && episodio.capaLarguraPx && episodio.capaAlturaPx ? (
        <Image
          alt=""
          className="pod-entrada__capa"
          height={episodio.capaAlturaPx}
          width={episodio.capaLarguraPx}
          src={episodio.capaUrl}
          priority={destaque}
          sizes={
            destaque
              ? "(min-width: 1280px) 560px, (min-width: 960px) 45vw, (min-width: 640px) 60vw, calc(100vw - 32px)"
              : "(min-width: 1280px) 360px, (min-width: 960px) 30vw, (min-width: 640px) 60vw, calc(100vw - 32px)"
          }
        />
      ) : null}
      <div className="pod-entrada__texto">
        <p className="pod-rubrica">{episodio.temporadaTitulo}</p>
        <Titulo id={`titulo-${episodio.slug}`}>
          <span className="sr-only">Episódio {episodio.numero}: </span>
          {episodio.titulo}
        </Titulo>
        <p className="pod-entrada__resumo">{episodio.resumo}</p>
        <div className="pod-entrada__acoes">
          <ActionLink
            variant={destaque ? "primary" : "text"}
            href={episodio.urlSpotify}
            id={`pod-spotify-${episodio.slug}`}
          >
            Ouvir no Spotify
          </ActionLink>
          {episodio.urlYoutube ? (
            <ActionLink
              variant={destaque ? "secondary" : "text"}
              href={episodio.urlYoutube}
              id={`pod-youtube-${episodio.slug}`}
            >
              Assistir no YouTube
            </ActionLink>
          ) : null}
          <ActionLink
            variant="document"
            className="pod-entrada__transcricao"
            href={`/podobservar/t${episodio.temporadaNumero}/${episodio.slug}`}
          >
            <span className="sr-only">{episodio.titulo}: </span>
            Ler transcrição e detalhes →
          </ActionLink>
        </div>
        <p className="pod-entrada__meta">
          <time dateTime={dataMaquina(episodio.publicadoEm)}>
            {dataCurta(episodio.publicadoEm)}
          </time>
          <span aria-hidden="true"> / </span>
          <time dateTime={duracaoMaquina(episodio.duracaoSeg)}>
            {duracaoLegivel(episodio.duracaoSeg)}
          </time>
        </p>
      </div>
    </article>
  );
}

/** Composição visual; recebe a ordem pública, sem selecionar ou consultar dados. */
export function CadernoDeEscuta({
  episodios,
}: {
  episodios: readonly EpisodioPublico[];
}) {
  const [recente, ...anteriores] = episodios;
  return (
    <div className="pod pod-caderno">
      <header className="pod-masthead">
        <div className="pod-masthead__regua pod-rubrica">
          <span>Observatório do Vale do Rio Real</span>
          <span>Arquivo sonoro</span>
        </div>
        <p className="pod-masthead__nome">
          <span className="sr-only">PodObservar</span>
          <span aria-hidden="true">
            Pod<span>Observar</span>
          </span>
        </p>
        <div className="pod-masthead__abertura">
          <h1>A pesquisa também se escuta.</h1>
          <p>
            O PodObservar leva a pesquisa do Observatório para o áudio, reunindo
            vozes, entrevistas, dados e experiências do território em uma
            linguagem clara e acessível.
          </p>
        </div>
        <div className="pod-masthead__rodape">
          <p className="pod-rubrica">
            {recente?.temporadaTitulo ?? "1ª Temporada"}
            <span>Novo episódio toda segunda-feira</span>
          </p>
          {anteriores.length > 0 ? (
            <ActionLink variant="text" href="#pod-episodios-titulo">
              Percorrer episódios <span aria-hidden="true">↓</span>
            </ActionLink>
          ) : null}
        </div>
      </header>

      {recente ? (
        <EntradaDeEscuta episodio={recente} destaque />
      ) : (
        <p className="pod-vazio">
          Nenhum episódio publicado no site até agora.
        </p>
      )}

      <section className="pod-indice" aria-labelledby="pod-episodios-titulo">
        <div className="pod-indice__abertura">
          <div>
            <p className="pod-rubrica">O percurso da pesquisa</p>
            <h2 id="pod-episodios-titulo">
              {anteriores.length > 0
                ? "Continue a escuta."
                : "Sobre a temporada"}
            </h2>
          </div>
          <p>
            A primeira temporada acompanha a primeira pesquisa do Observatório:
            os potenciais ecoturísticos e culturais do Vale do Rio Real, lidos
            pela economia solidária, pela preservação ambiental e pela cultura
            local. Ela começa pelo território e pelo coletivo que o pesquisa, e
            segue pelos lugares acompanhados de perto.
          </p>
        </div>
        {anteriores.length > 0 ? (
          <ol
            className="pod-indice__lista"
            aria-label="Demais episódios publicados"
          >
            {anteriores.map((episodio) => (
              <li key={episodio.slug}>
                <EntradaDeEscuta episodio={episodio} />
              </li>
            ))}
          </ol>
        ) : null}
      </section>

      <section className="pod-colofao" aria-labelledby="pod-sobre-titulo">
        <Image
          alt="Marca do PodObservar"
          className="pod-colofao__logo"
          height={LOGO_PODOBSERVAR.altura}
          width={LOGO_PODOBSERVAR.largura}
          src={LOGO_PODOBSERVAR.src}
          sizes="(min-width: 960px) 192px, 112px"
        />
        <div>
          <p className="pod-rubrica">Voz, memória e território</p>
          <h2 id="pod-sobre-titulo">Outro caminho para a pesquisa.</h2>
          <p>
            Nem todo mundo chega a uma pesquisa por um relatório técnico. O
            PodObservar abre outro caminho: transforma parte do percurso do
            Observatório em narrativa sonora — as estradas, os povoados e os
            encontros que o campo produziu.
          </p>
        </div>
        <p className="pod-colofao__leitura">
          Os episódios são ouvidos no Spotify. Aqui ficam a apresentação de cada
          um e a transcrição revisada completa, para quem prefere ler ou não
          pode ouvir.
        </p>
      </section>
    </div>
  );
}
