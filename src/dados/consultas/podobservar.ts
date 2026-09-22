import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { vwEpisodioPublico } from "../../../db/schema";
import { databaseUrlDisponivel } from "./anexos";

/**
 * Consulta pública do PodObservar — fundação da futura seção `/podobservar`.
 *
 * Lê **somente** `vw_episodio_publico` (migração 0010, substituída pela
 * 0011). A view é o gate: ela já exclui rascunho, em_revisão, arquivado,
 * episódio sem `publicado_em`, episódio datado no futuro, transcrição em
 * branco e episódio sem destino de escuta no Spotify. Nada aqui repete esse
 * filtro, e nada aqui pode afrouxá-lo — as tabelas privadas `episodio` e
 * `temporada` não são consultadas por este módulo.
 *
 * **Este módulo não devolve áudio.** Por decisão humana registrada na
 * Por decisão de arquitetura, o site é descoberta, apresentação editorial, metadata e
 * transcrição; a escuta acontece no Spotify. Não há `audioUrl`,
 * `audioMimeType` nem `audioBytes` — e a ausência é arquitetura, não lacuna
 * temporária a ser preenchida depois. O master continua existindo e
 * referenciado por `episodio.audio_id`, do lado privado.
 *
 * Sem `DATABASE_URL` — máquina de desenvolvimento sem credencial — as funções
 * devolvem lista vazia, como em `anexos.ts`. Em produção a ausência é erro
 * explícito, levantado por `databaseUrlDisponivel`.
 *
 * Este módulo não renderiza nada e não conhece rota: ele oferece as primitivas
 * que a Home, `/podobservar`, `/podobservar/t1/[episodio]` e o sitemap vão
 * consumir depois. RSS não está entre elas: foi suspenso.
 */

/** Uma linha crua da view, como o Drizzle a tipa (todas as colunas anuláveis). */
export type LinhaEpisodioPublico = typeof vwEpisodioPublico.$inferSelect;

/**
 * Destino primário de escuta.
 *
 * Escopado por domínio, como `plano-de-despublicacao.ts` faz com
 * `https://acervo.`. Não é decoração: o gate da view só sabe que a coluna não
 * está vazia, e é aqui que se verifica que o valor é mesmo um link do
 * Spotify. Publicar um CTA "Ouvir no Spotify ↗" apontando para outro lugar
 * seria afirmação falsa na superfície pública.
 *
 * Nenhuma requisição externa é feita: valida-se a forma do valor existente,
 * nunca a existência remota do episódio.
 */
const urlSpotify = z.url().startsWith("https://open.spotify.com/");

/**
 * Fronteira pública validada. As colunas da view são `NOT NULL` na origem,
 * mas o Drizzle tipa view como tudo anulável: a validação aqui é o que
 * transforma essa promessa em garantia, sem `as` e sem `!`.
 *
 * `urlSpotify` não é anulável: a view já recusa episódio sem ele, então uma
 * linha pública sem Spotify não deveria existir — e, se existir, esta
 * validação a descarta em vez de renderizar um episódio sem como ouvir.
 *
 * `urlYoutube` continua opcional e fora do gate. É `z.url()` genérica, sem
 * escopo de domínio, para que `youtu.be` e endereços de canal também passem:
 * ele é CTA secundário, e estreitar o formato aqui derrubaria o episódio
 * inteiro por causa de um link acessório.
 */
export const episodioPublicoSchema = z.object({
  slug: z.string().min(1),
  temporadaNumero: z.number().int().positive(),
  temporadaTitulo: z.string().min(1),
  numero: z.number().int().positive(),
  titulo: z.string().min(1),
  resumo: z.string().min(1),
  publicadoEm: z.date(),
  duracaoSeg: z.number().int().positive(),
  transcricao: z.string().min(1),
  explicito: z.boolean(),
  urlSpotify,
  urlYoutube: z.url().nullable(),
  capaUrl: z.url().nullable(),
  capaLarguraPx: z.number().int().positive().nullable(),
  capaAlturaPx: z.number().int().positive().nullable(),
});

export type EpisodioPublico = z.infer<typeof episodioPublicoSchema>;

/**
 * Linha incompleta é descartada, nunca completada por suposição — mesma
 * postura de `adaptarLinhasDaView` em `anexos.ts`. Um episódio sem
 * transcrição, sem data ou sem destino de escuta não vira entrada
 * meia-boca: some.
 */
export function adaptarLinhasDaView(
  linhas: readonly LinhaEpisodioPublico[],
): EpisodioPublico[] {
  return linhas.flatMap((linha) => {
    const analise = episodioPublicoSchema.safeParse(linha);
    return analise.success ? [analise.data] : [];
  });
}

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
  if (!databaseUrlDisponivel(process.env.NODE_ENV, process.env.DATABASE_URL)) {
    console.warn(
      "[podobservar] DATABASE_URL ausente: a listagem de episódios será vazia. " +
        "Isto é permitido somente em development e test.",
    );
    return [];
  }
  const { db } = await import("../cliente");
  const linhas = await db
    .select()
    .from(vwEpisodioPublico)
    .orderBy(
      desc(vwEpisodioPublico.publicadoEm),
      desc(vwEpisodioPublico.numero),
    );
  return adaptarLinhasDaView(linhas);
}

/** O episódio público mais recente, ou `null` quando nenhum foi publicado. */
export async function obterEpisodioMaisRecente(): Promise<EpisodioPublico | null> {
  return selecionarMaisRecente(await listarEpisodiosPublicos());
}

/**
 * Busca por temporada e slug com o filtro no banco, não em memória.
 *
 * O `WHERE` vai para a view — que já é o gate — e não para o frontend. Linha
 * ausente e linha retida pelo gate produzem o mesmo resultado: `null`.
 */
export async function buscarEpisodioPorTemporadaESlug(
  temporadaNumero: number,
  slug: string,
): Promise<EpisodioPublico | null> {
  if (!Number.isInteger(temporadaNumero) || temporadaNumero <= 0) return null;
  if (!slug.trim()) return null;
  if (!databaseUrlDisponivel(process.env.NODE_ENV, process.env.DATABASE_URL)) {
    return null;
  }
  const { db } = await import("../cliente");
  const linhas = await db
    .select()
    .from(vwEpisodioPublico)
    .where(
      and(
        eq(vwEpisodioPublico.temporadaNumero, temporadaNumero),
        eq(vwEpisodioPublico.slug, slug),
      ),
    );
  return adaptarLinhasDaView(linhas)[0] ?? null;
}
