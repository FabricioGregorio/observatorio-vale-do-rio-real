import { eq } from "drizzle-orm";

import { vwAnexoPublico } from "../../../db/schema";
import {
  type EvidenciaManifesto,
  evidenciaManifestoSchema,
  podePublicar,
} from "../../lib/manifesto-evidencias";

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
  codigo: string;
  estado: "PUBLICAVEL";
  revisaoPrivacidade: "concluida";
  derivadoDe: string[];
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

export type EvidenciaDeAnexo = {
  manifesto: EvidenciaManifesto;
  anexo: Omit<
    AnexoPublico,
    "codigo" | "estado" | "revisaoPrivacidade" | "derivadoDe"
  >;
  /** Compatibilidade histórica; nunca concede autorização pública. */
  publicadoLegado: boolean;
};

/**
 * Adapta a view legada ao Manifesto. O banco atual ainda não possui estado nem
 * revisão de privacidade, portanto ambos ficam ausentes e falham fechados.
 */
export async function listarEvidenciasDeAnexos(): Promise<EvidenciaDeAnexo[]> {
  if (!process.env.DATABASE_URL) return [];
  const { db } = await import("../cliente");
  const linhas = await db
    .select()
    .from(vwAnexoPublico)
    .where(eq(vwAnexoPublico.espelhado, true));

  return linhas.flatMap((l) => {
    if (
      !l.slug ||
      !l.titulo ||
      !l.tipo ||
      !l.licenca ||
      !l.linkPermanente ||
      !l.mimeType ||
      !l.sha256 ||
      l.bytes === null
    ) {
      return [];
    }
    const derivadoDe = [
      `documento:${l.slug}`,
      ...(l.linkOrigem ? [`origem:${l.linkOrigem}`] : []),
    ];
    return [
      {
        manifesto: evidenciaManifestoSchema.parse({
          codigo: l.ordemAnexo === null ? l.slug : String(l.ordemAnexo),
          entregavel: l.titulo,
          estado: null,
          revisao_privacidade: null,
          url: l.linkPermanente,
          sha256: l.sha256,
          doi: null,
          observacao: null,
          derivado_de: derivadoDe,
          arquivo_existe: true,
        }),
        anexo: {
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
        publicadoLegado: true,
      },
    ];
  });
}

/** Anexos publicados e efetivamente espelhados, na ordem da Sala do Avaliador. */
export async function listarAnexosPublicos(): Promise<AnexoPublico[]> {
  if (!process.env.DATABASE_URL) {
    console.warn(
      "[anexos] DATABASE_URL ausente: a Sala do Avaliador será gerada vazia. " +
        "Isto é esperado em máquina sem credencial; o CI define a variável.",
    );
    return [];
  }

  const evidencias = await listarEvidenciasDeAnexos();
  return evidencias.flatMap(({ manifesto, anexo }) =>
    podePublicar(manifesto)
      ? [
          {
            ...anexo,
            codigo: manifesto.codigo,
            estado: "PUBLICAVEL",
            revisaoPrivacidade: "concluida",
            derivadoDe: manifesto.derivado_de,
          },
        ]
      : [],
  );
}
