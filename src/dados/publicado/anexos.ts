/**
 * Anexos públicos lidos do snapshot — a fonte do Acervo, do `/anexos.json` e
 * das fichas de material.
 *
 * Substituiu a consulta ao banco no grafo do site. A diferença é de fonte,
 * e só: os mesmos objetos, os mesmos UUID, a mesma ordem. O que saiu é a
 * dependência de rede — nenhuma página do site abre conexão para montar uma
 * lista que o repositório já carrega.
 *
 * ## Por que as funções continuam `async`
 *
 * Ler o snapshot é síncrono. As assinaturas continuam devolvendo `Promise`
 * porque cada página já as consome com `await`, e trocar isso obrigaria a
 * mexer em toda chamada para não ganhar nada. Uma função `async` que não
 * espera nada é honesta aqui: o contrato de quem chama não mudou.
 */
import type { AnexoPublico } from "../anexo-publico";
import type {
  ArquivoPublicado,
  ArquivosPublicados,
} from "../materiais-de-campo";
import { lerAcervoPublicado } from "./leitura";

/** A definição vive em `dados/anexo-publico.ts`; aqui só se reexporta. */
export type { AnexoPublico };

/**
 * Arquivos públicos indexados pelo slug do documento.
 *
 * Alimenta as fichas da Home e do Território: a página lê o snapshot, esta
 * função agrupa, e a resolução do estado de cada material é pura
 * (`dados/materiais-de-campo.ts`).
 */
export function indexarPorDocumento(
  anexos: readonly AnexoPublico[],
): ArquivosPublicados {
  const mapa = new Map<string, ArquivoPublicado[]>();
  for (const anexo of anexos) {
    const lista = mapa.get(anexo.slug) ?? [];
    lista.push({
      url: anexo.linkPermanente,
      rotulo: anexo.rotuloArquivo,
      principal: anexo.principal,
      mimeType: anexo.mimeType,
      bytes: anexo.bytes,
    });
    mapa.set(anexo.slug, lista);
  }
  return mapa;
}

/** Anexos publicados, na ordem gravada no snapshot. */
export async function listarAnexosPublicos(): Promise<AnexoPublico[]> {
  return [...lerAcervoPublicado()];
}

/** Atalho de build: lê o snapshot e indexa por documento. */
export async function listarArquivosPorDocumento(): Promise<ArquivosPublicados> {
  return indexarPorDocumento(lerAcervoPublicado());
}
