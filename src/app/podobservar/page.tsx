import { CadernoDeEscuta } from "../../componentes/podobservar/CadernoDeEscuta";
import { LOGO_PODOBSERVAR } from "../../dados/podobservar-artes";
import { listarEpisodiosPublicos } from "../../dados/publicado/podobservar";
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
 * Lê `listarEpisodiosPublicos()`, que lê `episodios.json`. Rascunho, em
 * revisão, arquivado e episódio datado no futuro não chegam aqui porque não
 * entram no snapshot — não há filtro nesta página, e não poderia haver: o
 * gate mora na view.
 *
 * A ordem é a da consulta, `publicado_em DESC`. Nada nesta página conhece a
 * quantidade de episódios; com o EP04 a lista cresce sozinha.
 *
 * Sem player, sem embed, sem download. O destino de escuta é o Spotify.
 */
export default async function PaginaPodObservar() {
  const episodios = await listarEpisodiosPublicos();
  return <CadernoDeEscuta episodios={episodios} />;
}
