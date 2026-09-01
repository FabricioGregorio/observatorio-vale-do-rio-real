import { eq } from "drizzle-orm";

import { vwAnexoPublico } from "../../../db/schema";

/**
 * Consulta dos anexos públicos — alimenta a Sala do Avaliador, a versão
 * imprimível, o `/anexos.json` e o ZIP.
 *
 * Lê `vw_anexo_publico` (migração 0002) e **filtra `espelhado = true`**. A view
 * expõe a coluna mas não filtra por ela: a Sala do Avaliador só mostra anexo
 * com espelho próprio, porque o site existe justamente para substituir os
 * links frágeis de Drive e Figma (doc 01 §0.2).
 *
 * Sem `DATABASE_URL` — máquina de desenvolvimento sem credencial — a função
 * avisa e devolve lista vazia, e a página renderiza o estado vazio explícito.
 * `next build` define `NODE_ENV=production` sempre, então essa distinção não
 * poderia vir dali. O pipeline real não cai neste ramo: o `ci.yml` define a
 * variável.
 */

export type AnexoPublico = {
  ordemAnexo: number | null;
  slug: string;
  titulo: string;
  tipo: string;
  resumo: string | null;
  dataReferencia: string | null;
  licenca: string;
  linkPermanente: string;
  linkOrigem: string | null;
  mimeType: string;
  bytes: number;
  sha256: string;
  publicadoEm: Date | null;
};

/** Anexos publicados e efetivamente espelhados, na ordem da Sala do Avaliador. */
export async function listarAnexosPublicos(): Promise<AnexoPublico[]> {
  if (!process.env.DATABASE_URL) {
    console.warn(
      "[anexos] DATABASE_URL ausente: a Sala do Avaliador será gerada vazia. " +
        "Isto é esperado em máquina sem credencial; o CI define a variável.",
    );
    return [];
  }

  // Importado sob demanda: `src/dados/cliente.ts` lança ao ser carregado sem a
  // variável, e um import estático derrubaria o build antes da checagem acima.
  const { db } = await import("../cliente");

  const linhas = await db
    .select()
    .from(vwAnexoPublico)
    .where(eq(vwAnexoPublico.espelhado, true));

  // A view garante NOT NULL nestas colunas por construção — vêm de colunas
  // obrigatórias de `arquivo` e `documento`. O filtro deixa isso explícito em
  // vez de confiar numa asserção de tipo.
  return linhas.flatMap((l) =>
    l.slug &&
    l.titulo &&
    l.tipo &&
    l.licenca &&
    l.linkPermanente &&
    l.mimeType &&
    l.sha256 &&
    l.bytes !== null
      ? [
          {
            ordemAnexo: l.ordemAnexo,
            slug: l.slug,
            titulo: l.titulo,
            tipo: l.tipo,
            resumo: l.resumo,
            dataReferencia: l.dataReferencia,
            licenca: l.licenca,
            linkPermanente: l.linkPermanente,
            linkOrigem: l.linkOrigem,
            mimeType: l.mimeType,
            bytes: l.bytes,
            sha256: l.sha256,
            publicadoEm: l.publicadoEm,
          },
        ]
      : [],
  );
}
