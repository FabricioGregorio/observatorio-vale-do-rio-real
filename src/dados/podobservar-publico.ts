/**
 * Contrato público de um episódio do PodObservar.
 *
 * Módulo deliberadamente sem dependência de banco: não importa `db/schema`,
 * nem `drizzle-orm`, nem cliente PostgreSQL, nem nada de `consultas/`, e não
 * lê `DATABASE_URL`. Só Zod.
 *
 * ## Por que ele existe separado
 *
 * Este schema nasceu dentro de `consultas/podobservar.ts`, ao lado da consulta
 * que o usa. Fazia sentido enquanto havia um consumidor só. A partir do
 * snapshot versionado passam a existir dois — a consulta ao banco, que valida
 * o que a view devolveu, e `dados/publicado/tipos.ts`, que valida o que está
 * em disco — e o segundo não pode arrastar o schema Drizzle junto só para
 * chegar a um objeto Zod.
 *
 * O grafo desejado é:
 *
 *     podobservar-publico.ts
 *        ↑                ↑
 *     consultas/      publicado/
 *
 * e não `publicado/ → consultas/ → db/schema`.
 *
 * A definição é **uma só**. `consultas/podobservar.ts` reexporta o que está
 * aqui, para que nenhum consumidor existente precise mudar de import e para
 * que não exista uma segunda versão "de snapshot" do mesmo contrato.
 *
 * ## O que este módulo não faz
 *
 * Não conhece view, não conhece rota, não ordena e não seleciona. As funções
 * de ordenação e busca continuam em `consultas/podobservar.ts`: elas operam
 * sobre este tipo, mas não fazem parte do contrato que define o que é um
 * episódio público.
 */
import { z } from "zod";

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
