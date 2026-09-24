import { eq, inArray } from "drizzle-orm";

import { arquivo as tabelaArquivo, vwAnexoPublico } from "../../../db/schema";
import {
  type EvidenciaManifesto,
  evidenciaManifestoSchema,
  podePublicar,
} from "../../lib/manifesto-evidencias";
import type { AnexoPublico } from "../anexo-publico";
import { FOTO_DA_PLACA } from "../pesquisa/excecao-placa";

/**
 * Consulta dos anexos públicos — alimenta o Acervo, o `/anexos.json` e o ZIP.
 *
 * Até 2026-09-23 alimentava também a Prestação de Contas e a versão
 * imprimível dela. As duas saíram, e a consulta não mudou: era sempre a mesma
 * lista, e o Acervo, que já a consumia, passou a ser a única superfície de
 * consulta documental.
 *
 * Lê `vw_anexo_publico` (migração 0002) e **filtra `espelhado = true`**. A view
 * expõe a coluna mas não filtra por ela: o acervo público só mostra anexo com
 * espelho próprio, porque o site existe justamente para substituir os links
 * frágeis de Drive e Figma.
 *
 * Sem `DATABASE_URL` — máquina de desenvolvimento sem credencial — a função
 * avisa e devolve lista vazia, e a página renderiza o estado vazio explícito.
 * Em produção, porém, a ausência é erro explícito: um build publicável não
 * pode gerar Acervo, Manifesto e `/anexos.json` vazios por configuração
 * faltante.
 */

/**
 * O contrato público do anexo mora em `dados/anexo-publico.ts`.
 *
 * Ele saiu daqui quando passou a ter dois lados: esta consulta, que o
 * **produz** a partir de `vw_anexo_publico`, e `dados/publicado/tipos.ts`,
 * que **valida** o mesmo contrato a partir do arquivo em disco. A camada
 * publicada não deve depender da camada de consultas nem por um tipo.
 *
 * A reexportação mantém o endereço antigo funcionando: quem já importava
 * `AnexoPublico` daqui continua importando daqui. Não há segunda definição.
 */
export type { AnexoPublico };

export type EvidenciaDeAnexo = {
  manifesto: EvidenciaManifesto;
  anexo: Omit<
    AnexoPublico,
    "codigo" | "estado" | "revisaoPrivacidade" | "derivadoDe"
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
  nomesOriginais: ReadonlyMap<string, string | null> = new Map(),
): EvidenciaDeAnexo[] {
  const publicosPorId = new Map(
    linhas.map((linha) => [linha.arquivoId, linha]),
  );
  const replicasPublicas = new Set(
    linhas
      .filter((linha) => linha.arquivoRelacao === "replica")
      .map((linha) => linha.arquivoOrigemId),
  );
  const previewPorOriginal = new Map<string, LinhaAnexoPublico>();
  const haOriginaisFotograficos = linhas.some(
    (linha) =>
      linha.slug === "fotografias-visitas-i-vii" &&
      ["image/jpeg", "image/heic", "image/png"].includes(linha.mimeType ?? ""),
  );
  for (const linha of linhas) {
    if (
      linha.slug === "fotografias-visitas-i-vii" &&
      linha.sha256 === FOTO_DA_PLACA.sha256Original
    ) {
      throw new Error("Original com placa não pode integrar o acervo público.");
    }
    if (
      haOriginaisFotograficos &&
      linha.slug === "fotografias-visitas-i-vii" &&
      linha.mimeType === "image/webp" &&
      !linha.arquivoOrigemId &&
      (linha.arquivoId !== FOTO_DA_PLACA.arquivoPublicoId ||
        linha.sha256 !== FOTO_DA_PLACA.sha256Publico)
    ) {
      throw new Error(`WebP sem original canônico: ${linha.arquivoId}`);
    }
    if (
      linha.slug === "fotografias-visitas-i-vii" &&
      linha.mimeType === "image/webp" &&
      linha.arquivoOrigemId &&
      publicosPorId.has(linha.arquivoOrigemId)
    ) {
      if (previewPorOriginal.has(linha.arquivoOrigemId)) {
        throw new Error(
          `Fotografia com mais de um WebP: ${linha.arquivoOrigemId}`,
        );
      }
      previewPorOriginal.set(linha.arquivoOrigemId, linha);
    }
  }
  return linhas.flatMap((l) => {
    const originalPublicado =
      l.arquivoRelacao === "derivado" &&
      l.arquivoOrigemId !== null &&
      (publicosPorId.has(l.arquivoOrigemId) ||
        replicasPublicas.has(l.arquivoOrigemId));
    // WebP continua na view para a apresentação, mas não é outro anexo.
    // A única foto tarjada não tem original público e permanece documental.
    if (originalPublicado) return [];
    if (
      !l.slug ||
      !l.titulo ||
      !l.tipo ||
      !l.licenca ||
      !l.linkPermanente ||
      !l.mimeType ||
      !l.sha256 ||
      !l.arquivoId ||
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
          arquivoId: l.arquivoId,
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
          nomeOriginal: nomesOriginais.get(l.arquivoId),
          ...(previewPorOriginal.has(l.arquivoId)
            ? {
                previewUrl:
                  previewPorOriginal.get(l.arquivoId)?.linkPermanente ??
                  undefined,
                previewArquivoId:
                  previewPorOriginal.get(l.arquivoId)?.arquivoId ?? undefined,
                previewSha256:
                  previewPorOriginal.get(l.arquivoId)?.sha256 ?? undefined,
              }
            : {}),
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
  const nomes = linhas.length
    ? await db
        .select({ id: tabelaArquivo.id, nome: tabelaArquivo.nomeOriginal })
        .from(tabelaArquivo)
        .where(
          inArray(
            tabelaArquivo.id,
            linhas
              .map((linha) => linha.arquivoId)
              .filter((id): id is string => id !== null),
          ),
        )
    : [];
  return adaptarLinhasDaView(
    linhas,
    new Map(nomes.map((item) => [item.id, item.nome])),
  );
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
          },
        ]
      : [],
  );
}

/** Anexos publicados e efetivamente espelhados, na ordem do acervo. */
export async function listarAnexosPublicos(): Promise<AnexoPublico[]> {
  if (!databaseUrlDisponivel(process.env.NODE_ENV, process.env.DATABASE_URL)) {
    console.warn(
      "[anexos] DATABASE_URL ausente: o acervo público será gerado vazio. " +
        "Isto é permitido somente em development e test.",
    );
    return [];
  }

  const evidencias = await listarEvidenciasDeAnexos();
  return selecionarAnexosPublicos(evidencias);
}

/*
  `indexarPorDocumento` e `listarArquivosPorDocumento` moraram aqui enquanto o
  banco era a fonte. Agora vivem em `publicado/anexos.ts`, junto do snapshot
  que os alimenta; a reexportação existe para que a definição continue sendo
  uma só e para não quebrar quem já importava daqui.
*/
export {
  indexarPorDocumento,
  listarArquivosPorDocumento,
} from "../publicado/anexos";
