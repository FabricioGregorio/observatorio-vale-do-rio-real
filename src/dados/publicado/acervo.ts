import { z } from "zod";

import { mapaB01, reconciliarMapaB01 } from "../editorial/mapa-b01";
import { type AnexoPublico, listarAnexosPublicos } from "./anexos";

export type DocumentoDoAcervo = {
  slug: string;
  titulo: string;
  tipo: string;
  resumo: string | null;
  licenca: string;
  arquivos: AnexoPublico[];
};

/** A fonte de autorização é sempre a lista já filtrada pela view e manifesto. */
export function organizarDocumentosPublicos(
  anexos: readonly AnexoPublico[],
): DocumentoDoAcervo[] {
  const documentos = new Map<string, DocumentoDoAcervo>();
  for (const arquivo of anexos) {
    const documento = documentos.get(arquivo.slug);
    if (documento) documento.arquivos.push(arquivo);
    else
      documentos.set(arquivo.slug, {
        slug: arquivo.slug,
        titulo: arquivo.titulo,
        tipo: arquivo.tipo,
        resumo: arquivo.resumo,
        licenca: arquivo.licenca,
        arquivos: [arquivo],
      });
  }
  return [...documentos.values()];
}

export function validarAcervoPublico(anexos: readonly AnexoPublico[]) {
  const ids = new Set(anexos.map((item) => item.arquivoId));
  if (ids.size !== anexos.length)
    throw new Error("Acervo: arquivo documental duplicado.");
  const documentos = organizarDocumentosPublicos(anexos);
  if (documentos.length !== 16)
    throw new Error(
      `Acervo: esperado 16 documentos; recebidos ${documentos.length}.`,
    );
  reconciliarMapaB01(anexos);
  return documentos;
}

/**
 * Os documentos públicos, sempre validados.
 *
 * Enquanto a fonte era o banco, a validação integral rodava só em produção:
 * uma máquina de desenvolvimento sem credencial recebia lista vazia, e exigir
 * 16 documentos dela seria exigir que ninguém programasse sem banco.
 *
 * Com o snapshot versionado essa assimetria perdeu sentido — e virou risco. O
 * acervo agora é o mesmo arquivo em toda máquina, então um `acervo.json`
 * editado errado precisa falhar no primeiro `pnpm teste`, e não só no build de
 * produção. Validar sempre também é o que permite a esta camada não ler
 * variável de ambiente alguma.
 */
export async function listarDocumentosPublicos(): Promise<DocumentoDoAcervo[]> {
  return validarAcervoPublico(await listarAnexosPublicos());
}

export function selecionarDocumentoPublico(
  documentos: readonly DocumentoDoAcervo[],
  slug: string,
): DocumentoDoAcervo | null {
  return documentos.find((documento) => documento.slug === slug) ?? null;
}

export function selecionarArquivoPublico(
  documentos: readonly DocumentoDoAcervo[],
  slug: string,
  arquivoId: string,
): AnexoPublico | null {
  if (!z.uuid().safeParse(arquivoId).success) return null;
  const documento = selecionarDocumentoPublico(documentos, slug);
  return (
    documento?.arquivos.find((arquivo) => arquivo.arquivoId === arquivoId) ??
    null
  );
}

export function tituloDoArquivoPublico(arquivo: AnexoPublico): string {
  if (arquivo.slug === "fotografias-visitas-i-vii") {
    const entrada = mapaB01.arquivos.find(
      (item) =>
        item.arquivoId === (arquivo.previewArquivoId ?? arquivo.arquivoId),
    );
    if (!entrada)
      throw new Error(`B01: entrada editorial ausente ${arquivo.arquivoId}.`);
    return entrada.tituloPublico;
  }
  return arquivo.rotuloArquivo?.split(" — Foto: ")[0]?.trim() || arquivo.titulo;
}
