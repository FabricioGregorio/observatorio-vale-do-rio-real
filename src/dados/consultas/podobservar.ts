import { and, desc, eq } from "drizzle-orm";

import { vwEpisodioPublico } from "../../../db/schema";
import {
  type EpisodioPublico,
  episodioPublicoSchema,
} from "../podobservar-publico";
import { selecionarMaisRecente } from "../publicado/podobservar";
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
 * O contrato público do episódio mora em `dados/podobservar-publico.ts`.
 *
 * Ele saiu daqui quando passou a ter dois consumidores: esta consulta, que
 * valida o que a view devolveu, e `dados/publicado/tipos.ts`, que valida o
 * que está em disco. O segundo não pode arrastar `db/schema` junto só para
 * chegar a um objeto Zod, e é por isso que a definição vive num módulo sem
 * dependência de banco.
 *
 * A reexportação mantém o endereço antigo funcionando: quem já importava
 * `EpisodioPublico` ou `episodioPublicoSchema` daqui continua importando
 * daqui. Não há segunda definição, e a regra do destino de escuta no Spotify
 * continua declarada num lugar só.
 */
export {
  type EpisodioPublico,
  episodioPublicoSchema,
} from "../podobservar-publico";

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

/*
  Os seletores puros moram em `publicado/podobservar.ts`, junto do snapshot
  que os alimenta. A reexportação mantém a definição única e preserva quem já
  importava daqui — a mesma postura de `AnexoPublico`.
*/
export {
  interpretarSegmentoDeTemporada,
  ordenarPorPublicacao,
  selecionarMaisRecente,
  selecionarPorTemporadaESlug,
} from "../publicado/podobservar";

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
