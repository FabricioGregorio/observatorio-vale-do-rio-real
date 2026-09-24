/**
 * Contrato público de um episódio do PodObservar.
 *
 * Módulo puro: só Zod. Não lê ambiente, não faz I/O e não conhece storage.
 *
 * ## Por que ele existe separado
 *
 * Este schema nasceu ao lado da consulta que lia a projeção pública do
 * PostgreSQL. A consulta saiu com o banco; o contrato ficou, porque é ele
 * que define o que é um episódio público — e `dados/publicado/tipos.ts`
 * valida com ele o que está em disco, sem depender de mais nada.
 *
 * A definição é **uma só**: não existe uma segunda versão "de snapshot" do
 * mesmo contrato.
 *
 * ## O que este módulo não faz
 *
 * Não conhece rota, não ordena e não seleciona. As funções de ordenação e
 * busca vivem em `publicado/podobservar.ts`: elas operam sobre este tipo,
 * mas não fazem parte do contrato que define o que é um episódio público.
 */
import { z } from "zod";

/**
 * Destino primário de escuta.
 *
 * Escopado por domínio, como `plano-de-despublicacao.ts` faz com
 * `https://acervo.`. Não é decoração: é aqui que se verifica que o valor é
 * mesmo um link do Spotify. Publicar um CTA "Ouvir no Spotify ↗" apontando
 * para outro lugar seria afirmação falsa na superfície pública.
 *
 * Nenhuma requisição externa é feita: valida-se a forma do valor existente,
 * nunca a existência remota do episódio.
 */
const urlSpotify = z.url().startsWith("https://open.spotify.com/");

/**
 * Fronteira pública validada. O que está em disco é JSON, e JSON não traz
 * garantia nenhuma: a validação aqui é o que transforma o arquivo em
 * contrato, sem `as` e sem `!`.
 *
 * `urlSpotify` não é anulável: episódio sem destino de escuta não é
 * publicável — e, se aparecer um, esta validação o descarta em vez de
 * renderizar um episódio sem como ouvir.
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
