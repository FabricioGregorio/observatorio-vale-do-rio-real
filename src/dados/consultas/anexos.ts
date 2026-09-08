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
 * Em produção, porém, a ausência é erro explícito: um build publicável não
 * pode gerar Sala, Manifesto e `/anexos.json` vazios por configuração faltante.
 */

export type AnexoPublico = {
  codigo: string;
  estado: "PUBLICAVEL";
  revisaoPrivacidade: "concluida";
  derivadoDe: string[];
  derivadoDeDocumento: string | null;
  arquivoOrigemId: string | null;
  arquivoRelacao: "derivado" | "replica" | null;
  arquivoDerivacaoMetodo:
    | "transcricao_leitura_visual"
    | "ocr_estatistico"
    | "redacao_versao_publica"
    | "tarjamento_privacidade"
    | "sanitizacao_metadados"
    | "extracao_secao"
    | "conversao_formato"
    | null;
  ordemAnexo: number | null;
  slug: string;
  rotuloArquivo: string | null;
  principal: boolean;
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
    | "codigo"
    | "estado"
    | "revisaoPrivacidade"
    | "derivadoDe"
    | "derivadoDeDocumento"
  >;
  /** Compatibilidade histórica; nunca concede autorização pública. */
  publicadoLegado: boolean;
};

export type LinhaAnexoPublico = typeof vwAnexoPublico.$inferSelect;

/**
 * Decide se a consulta pode prosseguir sem contaminar testes com mutação de
 * NODE_ENV. Produção falha fechada; development e test preservam o estado vazio.
 */
export function databaseUrlDisponivel(
  ambiente: string | undefined,
  databaseUrl: string | undefined,
): boolean {
  const configurada = Boolean(databaseUrl?.trim());
  if (ambiente === "production" && !configurada) {
    throw new Error(
      "DATABASE_URL ausente: builds de produção exigem a credencial read-only para gerar o acervo público.",
    );
  }
  return configurada;
}

/**
 * Uma linha pública da view produz uma evidência. Assim um documento com sete
 * objetos públicos permanece com sete entradas; `principal` é informação de
 * preferência e não colapsa o conjunto.
 */
export function adaptarLinhasDaView(
  linhas: readonly LinhaAnexoPublico[],
): EvidenciaDeAnexo[] {
  return linhas.flatMap((l) => {
    if (
      !l.slug ||
      !l.titulo ||
      !l.tipo ||
      !l.licenca ||
      !l.linkPermanente ||
      !l.mimeType ||
      !l.sha256 ||
      l.bytes === null ||
      l.natureza === null ||
      l.obrigatorio === null ||
      l.estadoDocumental === null ||
      l.revisaoPrivacidade === null ||
      l.principal === null
    ) {
      return [];
    }
    const derivadoDe = [
      `documento:${l.slug}`,
      ...(l.linkOrigem ? [`origem:${l.linkOrigem}`] : []),
      ...(l.arquivoOrigemId ? [`arquivo:${l.arquivoOrigemId}`] : []),
    ];
    return [
      {
        manifesto: evidenciaManifestoSchema.parse({
          codigo: l.ordemAnexo === null ? l.slug : String(l.ordemAnexo),
          entregavel: l.titulo,
          natureza: l.natureza,
          obrigatorio: l.obrigatorio,
          estado: l.estadoDocumental,
          revisao_privacidade: l.revisaoPrivacidade,
          url: l.linkPermanente,
          sha256: l.sha256,
          doi: null,
          observacao: null,
          derivado_de: derivadoDe,
          derivado_de_documento: l.derivadoDeSlug,
          derivacao_metodo: null,
          arquivo_origem_id: l.arquivoOrigemId,
          arquivo_relacao: l.arquivoRelacao,
          arquivo_derivacao_metodo: l.arquivoDerivacaoMetodo,
          arquivo_existe: true,
        }),
        anexo: {
          ordemAnexo: l.ordemAnexo,
          slug: l.slug,
          rotuloArquivo: l.rotuloArquivo,
          principal: l.principal,
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
          arquivoOrigemId: l.arquivoOrigemId,
          arquivoRelacao:
            l.arquivoRelacao === "derivado" || l.arquivoRelacao === "replica"
              ? l.arquivoRelacao
              : null,
          arquivoDerivacaoMetodo: l.arquivoDerivacaoMetodo,
        },
        publicadoLegado: true,
      },
    ];
  });
}

export async function listarEvidenciasDeAnexos(): Promise<EvidenciaDeAnexo[]> {
  if (!databaseUrlDisponivel(process.env.NODE_ENV, process.env.DATABASE_URL)) {
    return [];
  }
  const { db } = await import("../cliente");
  const linhas = await db
    .select()
    .from(vwAnexoPublico)
    .where(eq(vwAnexoPublico.espelhado, true));
  return adaptarLinhasDaView(linhas);
}

export function selecionarAnexosPublicos(
  evidencias: readonly EvidenciaDeAnexo[],
): AnexoPublico[] {
  return evidencias.flatMap(({ manifesto, anexo }) =>
    podePublicar(manifesto)
      ? [
          {
            ...anexo,
            codigo: manifesto.codigo,
            estado: "PUBLICAVEL",
            revisaoPrivacidade: "concluida",
            derivadoDe: manifesto.derivado_de,
            derivadoDeDocumento: manifesto.derivado_de_documento,
          },
        ]
      : [],
  );
}

/** Anexos publicados e efetivamente espelhados, na ordem da Sala do Avaliador. */
export async function listarAnexosPublicos(): Promise<AnexoPublico[]> {
  if (!databaseUrlDisponivel(process.env.NODE_ENV, process.env.DATABASE_URL)) {
    console.warn(
      "[anexos] DATABASE_URL ausente: a Sala do Avaliador será gerada vazia. " +
        "Isto é permitido somente em development e test.",
    );
    return [];
  }

  const evidencias = await listarEvidenciasDeAnexos();
  return selecionarAnexosPublicos(evidencias);
}
