/**
 * Episódios públicos lidos do snapshot — a fonte de `/podobservar`.
 *
 * Substituiu a consulta ao banco no grafo do site. Os seletores puros moram
 * aqui, junto do snapshot que os alimenta: a definição é uma só, e quem
 * precisa dela não arrasta mais nada junto para obtê-la.
 */
import type { EpisodioPublico } from "../podobservar-publico";
import { lerEpisodiosPublicados } from "./leitura";

/** A definição vive em `dados/podobservar-publico.ts`; aqui só se reexporta. */
export type { EpisodioPublico };

/**
 * Ordem canônica do PodObservar: data de publicação decrescente.
 *
 * O desempate é `numero` decrescente, e existe só para tornar a ordem
 * determinística quando dois episódios compartilham o instante de publicação.
 * Nunca se ordena por número, nome de arquivo, posição no array, mtime ou data
 * de upload: nenhum deles é a data pública do episódio.
 */
export function ordenarPorPublicacao(
  episodios: readonly EpisodioPublico[],
): EpisodioPublico[] {
  return [...episodios].sort((a, b) => {
    const diferenca = b.publicadoEm.getTime() - a.publicadoEm.getTime();
    return diferenca !== 0 ? diferenca : b.numero - a.numero;
  });
}

/** O episódio mais recente entre os já públicos, ou `null` se não houver. */
export function selecionarMaisRecente(
  episodios: readonly EpisodioPublico[],
): EpisodioPublico | null {
  return ordenarPorPublicacao(episodios)[0] ?? null;
}

/**
 * Resolução conjunta de temporada e slug.
 *
 * Slug válido em temporada errada devolve `null` — o mesmo `null` de slug
 * inexistente. A camada pública não distingue os dois casos, e por isso a rota
 * `/podobservar/t2/slug-real-da-t1` termina no mesmo 404 de
 * `/podobservar/t1/slug-inexistente`. Não revelar "existe, mas em outra
 * temporada" é parte do contrato.
 */
export function selecionarPorTemporadaESlug(
  episodios: readonly EpisodioPublico[],
  temporadaNumero: number,
  slug: string,
): EpisodioPublico | null {
  return (
    episodios.find(
      (episodio) =>
        episodio.temporadaNumero === temporadaNumero && episodio.slug === slug,
    ) ?? null
  );
}

/**
 * Lê o segmento `t1` da rota `/podobservar/t1/[episodio]`.
 *
 * Aceita exatamente `t` seguido de inteiro positivo sem zero à esquerda —
 * `t01`, `T1`, `t0` e `t-1` não são a mesma rota e devolvem `null`, que a
 * página traduz em 404. Manter a forma canônica única evita duas URLs para o
 * mesmo episódio.
 */
export function interpretarSegmentoDeTemporada(
  segmento: string,
): number | null {
  const correspondencia = /^t([1-9]\d*)$/.exec(segmento);
  return correspondencia ? Number(correspondencia[1]) : null;
}

/** Episódios já públicos, do mais recente ao mais antigo. */
export async function listarEpisodiosPublicos(): Promise<EpisodioPublico[]> {
  return [...lerEpisodiosPublicados()];
}

/** O episódio público mais recente, ou `null` quando nenhum foi publicado. */
export async function obterEpisodioMaisRecente(): Promise<EpisodioPublico | null> {
  return selecionarMaisRecente(lerEpisodiosPublicados());
}

/**
 * Busca por temporada e slug.
 *
 * Entrada inválida e episódio ausente produzem o mesmo `null` — o filtro que
 * antes ia para a view agora percorre o snapshot, e a distinção continua sem
 * vazar para a rota.
 */
export async function buscarEpisodioPorTemporadaESlug(
  temporadaNumero: number,
  slug: string,
): Promise<EpisodioPublico | null> {
  if (!Number.isInteger(temporadaNumero) || temporadaNumero <= 0) return null;
  if (!slug.trim()) return null;
  return selecionarPorTemporadaESlug(
    lerEpisodiosPublicados(),
    temporadaNumero,
    slug,
  );
}
