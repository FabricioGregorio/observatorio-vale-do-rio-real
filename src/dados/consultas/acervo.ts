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
  if (anexos.length !== 109)
    throw new Error(
      `Acervo: esperado 109 objetos públicos; recebidos ${anexos.length}.`,
    );
  const documentos = organizarDocumentosPublicos(anexos);
  if (documentos.length !== 16)
    throw new Error(
      `Acervo: esperado 16 documentos; recebidos ${documentos.length}.`,
    );
  reconciliarMapaB01(anexos);
  return documentos;
}

export async function listarDocumentosPublicos(): Promise<DocumentoDoAcervo[]> {
  const anexos = await listarAnexosPublicos();
  return process.env.NODE_ENV === "production"
    ? validarAcervoPublico(anexos)
    : organizarDocumentosPublicos(anexos);
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
      (item) => item.arquivoId === arquivo.arquivoId,
    );
    if (!entrada)
      throw new Error(`B01: entrada editorial ausente ${arquivo.arquivoId}.`);
    return entrada.tituloPublico;
  }
  return arquivo.rotuloArquivo?.split(" — Foto: ")[0]?.trim() || arquivo.titulo;
}
