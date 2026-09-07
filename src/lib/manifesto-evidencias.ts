import { z } from "zod";

const sha256 = z.string().regex(/^[a-f0-9]{64}$/);
const url = z.string().url();

/**
 * Natureza do item na Prestação de Contas.
 *
 * O denominador dos 28 itens exigidos conta apenas `item_exigido`. Evidência
 * complementar é material descoberto na pesquisa: enriquece a comprovação e
 * **não** é exigência da FUNCAP. `item_nao_exigido` é o item que já estava no
 * inventário original sem ser exigido pelo edital — o caso de D01 e D02.
 */
export const naturezaSchema = z.enum([
  "item_exigido",
  "evidencia_complementar",
  "item_nao_exigido",
]);

/** Estado documental oficial (plano de execução §4). */
export const estadoSchema = z.enum([
  "PUBLICAVEL",
  "RESTRITO",
  "ESPELHAVEL",
  "IMPEDIDO",
  "PENDENTE",
]);

/** Eixo independente do estado. `bloqueada` é veto, não pendência. */
export const revisaoSchema = z.enum(["pendente", "concluida", "bloqueada"]);

export const metodoDerivacaoSchema = z.enum([
  "transcricao_leitura_visual",
  "ocr_estatistico",
  "redacao_versao_publica",
  "tarjamento_privacidade",
  "sanitizacao_metadados",
  "extracao_secao",
  "conversao_formato",
]);

/** Contrato derivado do inventário/banco; não é fonte editorial nem persistência. */
export const evidenciaManifestoSchema = z
  .object({
    codigo: z.string().min(1),
    entregavel: z.string().min(1),
    natureza: naturezaSchema.nullish().transform((v) => v ?? null),
    obrigatorio: z
      .boolean()
      .nullish()
      .transform((v) => v ?? null),
    estado: estadoSchema.nullish().transform((v) => v ?? null),
    revisao_privacidade: revisaoSchema.nullish().transform((v) => v ?? null),
    url: url.nullish().transform((v) => v ?? null),
    sha256: sha256.nullish().transform((v) => v ?? null),
    doi: z
      .string()
      .min(1)
      .nullish()
      .transform((v) => v ?? null),
    observacao: z
      .string()
      .nullish()
      .transform((v) => v ?? null),
    /**
     * Proveniência: de onde este artefato veio, em rótulos `documento:slug` e
     * `origem:url`. Exige ao menos uma entrada — publicar sem proveniência
     * declarada não é aceitável numa prestação de contas.
     *
     * Não confundir com `derivado_de_documento`, que é o vínculo
     * original → derivado entre dois documentos distintos.
     */
    derivado_de: z.array(z.string().min(1)).min(1),
    /**
     * Slug do documento **original** do qual este é derivado, quando houver —
     * A05 deriva de A02, A06 deriva de A03. `null` para original.
     */
    derivado_de_documento: z
      .string()
      .min(1)
      .nullish()
      .transform((v) => v ?? null),
    /**
     * Como o derivado foi produzido. `transcricao_leitura_visual` e
     * `ocr_estatistico` são técnicas diferentes e o contrato não deixa uma ser
     * registrada como a outra.
     */
    derivacao_metodo: metodoDerivacaoSchema
      .nullish()
      .transform((v) => v ?? null),
    /** Proveniência do objeto físico, independente da derivação documental. */
    arquivo_origem_id: z
      .string()
      .uuid()
      .nullish()
      .transform((v) => v ?? null),
    arquivo_relacao: z
      .enum(["derivado", "replica"])
      .nullish()
      .transform((v) => v ?? null),
    arquivo_derivacao_metodo: metodoDerivacaoSchema
      .nullish()
      .transform((v) => v ?? null),
    arquivo_existe: z.boolean().default(false),
  })
  .superRefine((item, contexto) => {
    const derivadoCompleto =
      item.arquivo_relacao === "derivado" &&
      item.arquivo_origem_id !== null &&
      item.arquivo_derivacao_metodo !== null;
    const replicaCompleta =
      item.arquivo_relacao === "replica" &&
      item.arquivo_origem_id !== null &&
      item.arquivo_derivacao_metodo === null;
    const semRelacao =
      item.arquivo_relacao === null &&
      item.arquivo_origem_id === null &&
      item.arquivo_derivacao_metodo === null;
    if (!derivadoCompleto && !replicaCompleta && !semRelacao) {
      contexto.addIssue({
        code: "custom",
        message: "Proveniência de arquivo incompleta ou contraditória.",
        path: ["arquivo_relacao"],
      });
    }
  });

export type EvidenciaManifesto = z.infer<typeof evidenciaManifestoSchema>;

/**
 * Gate canônico, fail-closed, para toda saída pública do acervo.
 *
 * Item sem classificação não publica, item sem revisão não publica, e
 * `bloqueada` nunca passa. O gate automatizado pode vetar; jamais aprovar
 * sozinho — a aprovação vem da revisão humana registrada em
 * `revisao_privacidade`.
 */
export function podePublicar(item: EvidenciaManifesto): boolean {
  return (
    item.estado === "PUBLICAVEL" &&
    item.revisao_privacidade === "concluida" &&
    item.natureza !== null &&
    item.arquivo_existe &&
    item.url !== null &&
    item.sha256 !== null &&
    item.derivado_de.length > 0
  );
}

/** Nome histórico mantido para consumidores existentes. */
export const ehPublico = podePublicar;

export function manifestoPublico(
  itens: readonly EvidenciaManifesto[],
): EvidenciaManifesto[] {
  return itens.filter(podePublicar);
}

/**
 * Denominador da Prestação de Contas: só `item_exigido` conta.
 *
 * Existe para que evidência complementar nunca infle nem dilua o total de
 * itens que o edital exige.
 */
export function contarItensExigidos(
  itens: readonly EvidenciaManifesto[],
): number {
  return itens.filter((i) => i.natureza === "item_exigido").length;
}

/** Agrupa por natureza, para a página distinguir os três conjuntos. */
export function porNatureza(itens: readonly EvidenciaManifesto[]): {
  exigidos: EvidenciaManifesto[];
  complementares: EvidenciaManifesto[];
  naoExigidos: EvidenciaManifesto[];
  semClassificacao: EvidenciaManifesto[];
} {
  return {
    exigidos: itens.filter((i) => i.natureza === "item_exigido"),
    complementares: itens.filter(
      (i) => i.natureza === "evidencia_complementar",
    ),
    naoExigidos: itens.filter((i) => i.natureza === "item_nao_exigido"),
    semClassificacao: itens.filter((i) => i.natureza === null),
  };
}
