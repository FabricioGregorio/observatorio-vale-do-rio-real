import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  dataLonga,
  dataMaquina,
  duracaoLegivel,
  duracaoMaquina,
  numeroDoEpisodio,
} from "../../../../componentes/podobservar/formato";
import {
  AssistirNoYoutube,
  OuvirNoSpotify,
} from "../../../../componentes/podobservar/LinkDeEscuta";
import {
  SobreEstaTranscricao,
  Transcricao,
} from "../../../../componentes/podobservar/Transcricao";
import {
  type EpisodioPublico,
  interpretarSegmentoDeTemporada,
  listarEpisodiosPublicos,
  selecionarPorTemporadaESlug,
} from "../../../../dados/consultas/podobservar";
import { metadadosDaRota } from "../../../../lib/site-url";
import "../../podobservar.css";

/**
 * `/podobservar/t1/[episodio]` — a página de um episódio.
 *
 * O segmento da temporada é dinâmico, e não um diretório `t1` literal: a URL
 * resultante é exatamente a mesma, e a segunda temporada passa a existir sem
 * uma pasta nova. É também o que dá uso real a
 * `interpretarSegmentoDeTemporada`, escrita na P0.2A justamente para que
 * `t01`, `T1` e `t0` não virem endereços alternativos do mesmo episódio.
 *
 * ## Fail-closed
 *
 * `dynamicParams = false` restringe as páginas às geradas em build, e
 * `generateStaticParams` lê a view pública. Três consequências, todas
 * indistinguíveis entre si do lado de fora:
 *
 * - slug inexistente → 404;
 * - slug real em temporada errada → 404;
 * - episódio em rascunho, em revisão, arquivado ou datado no futuro → 404,
 *   porque nunca esteve na view.
 *
 * Nenhuma delas diz por quê. "Existe, mas não está publicado" seria vazar
 * estado editorial para quem adivinhou uma URL.
 */

type Props = { params: Promise<{ temporada: string; episodio: string }> };

export const dynamicParams = false;

async function resolver(
  temporada: string,
  episodio: string,
): Promise<EpisodioPublico | null> {
  const numero = interpretarSegmentoDeTemporada(temporada);
  if (numero === null) return null;
  return selecionarPorTemporadaESlug(
    await listarEpisodiosPublicos(),
    numero,
    episodio,
  );
}

export async function generateStaticParams() {
  return (await listarEpisodiosPublicos()).map((episodio) => ({
    temporada: `t${episodio.temporadaNumero}`,
    episodio: episodio.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { temporada, episodio: slug } = await params;
  const episodio = await resolver(temporada, slug);
  if (!episodio) notFound();
  return metadadosDaRota({
    pathname: `/podobservar/${temporada}/${slug}`,
    titulo: `${episodio.titulo} — PodObservar`,
    descricao: episodio.resumo,
  });
}

export default async function PaginaEpisodio({ params }: Props) {
  const { temporada, episodio: slug } = await params;
  const episodio = await resolver(temporada, slug);
  if (!episodio) notFound();

  return (
    <article className="pod pod-episodio-pagina mx-auto flex flex-col gap-8 px-4 py-10 md:py-16">
      <nav aria-label="Trilha de navegação" className="pod-migalha">
        <Link href="/podobservar">PodObservar</Link>
        {" / "}
        {episodio.temporadaTitulo}
      </nav>

      <header className="flex flex-col gap-4">
        <p className="meta-ficha">
          Episódio {numeroDoEpisodio(episodio.numero)} ·{" "}
          {episodio.temporadaTitulo}
        </p>
        <h1 className="text-3xl md:text-4xl">{episodio.titulo}</h1>
        <p className="pod-episodio__meta">
          <time dateTime={dataMaquina(episodio.publicadoEm)}>
            {dataLonga(episodio.publicadoEm)}
          </time>
          {" · "}
          <time dateTime={duracaoMaquina(episodio.duracaoSeg)}>
            {duracaoLegivel(episodio.duracaoSeg)}
          </time>
        </p>
        <p className="max-w-prose text-lg">{episodio.resumo}</p>
        <p className="pod-acoes">
          <OuvirNoSpotify
            href={episodio.urlSpotify}
            id="pod-spotify-episodio"
          />
          <AssistirNoYoutube
            href={episodio.urlYoutube}
            id="pod-youtube-episodio"
          />
        </p>
      </header>

      <SobreEstaTranscricao />

      <section aria-labelledby="pod-transcricao-titulo">
        <h2 className="text-2xl" id="pod-transcricao-titulo">
          Transcrição
        </h2>
        <Transcricao texto={episodio.transcricao} />
      </section>

      <p>
        <Link href="/podobservar">Todos os episódios →</Link>
      </p>
    </article>
  );
}
