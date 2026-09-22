/**
 * Lote de publicação pública de 2026-09-16.
 *
 * A decisão humana desta data autorizou a publicação dos materiais da pesquisa
 * dos quatro lugares e concluiu a revisão de privacidade: somente CPF,
 * telefone e assinatura exigiriam tratamento, e a varredura sobre os arquivos
 * que realmente vão ao ar não encontrou nenhum dos três.
 *
 * O lote é **declarado**, nunca inferido em tempo de execução: código,
 * caminho de origem, chave pública, SHA-256 e papel de cada objeto estão
 * fixados em `lote-publicacao-2026-09-16.json`. O executor confere a fonte
 * contra esse hash e aborta na primeira divergência — é isso que impede que
 * uma troca silenciosa no corpus entre no acervo público.
 *
 * ## Proveniência física
 *
 * - `relacao: "replica"` — o mesmo binário já espelhado no bucket privado.
 *   O executor liga `replica_de_id` à linha privada de mesmo SHA-256.
 * - `derivadoSemOrigemRegistrada: true` — derivado web de uma fotografia que
 *   nunca foi espelhada. O CHECK `arquivo_derivacao_completa` proíbe declarar
 *   `derivacao_metodo` sem `derivado_de_id`, e inventar uma linha de origem
 *   seria fabricar prova. A cadeia original → hash → derivado → hash fica em
 *   na publicação do acervo de 2026-09-16 e no manifesto gerado por
 *   `scripts/derivar-fotos-campo.py`.
 * - ambos falsos — objeto publicado a partir da fonte canônica, sem
 *   intermediário.
 *
 * ## Autoria de terceiro
 *
 * `autor` carrega o crédito das duas fotografias de terceiro que a decisão
 * humana manteve públicas. Ele vem do manifesto de B01, que por sua vez o
 * declara em `scripts/derivar-fotos-campo.py` com a fonte da atribuição — uma
 * declaração só, propagada até a exibição.
 */
import { z } from "zod";

import bruto from "./lote-publicacao-2026-09-16.json";

/**
 * Chave pública de um objeto do acervo.
 *
 * O sufixo de versão passou de `-v1` fixo para `-v\d+` na sincronização de
 * 2026-09-18. Quando uma fotografia é **substituída** por outra, o objeto novo
 * precisa de chave própria: a antiga vai ser apagada do bucket, e reaproveitar
 * a mesma chave faria o novo correr o risco de sair junto. `-v2` é a menor
 * convenção coerente com o `-v1` que o projeto já usava.
 */
export const chavePublicaSchema = z
  .string()
  .regex(
    /^arquivos\/[a-z0-9-]+\/[a-z0-9-]+-v\d+\.(pdf|webp|svg|xlsx|m4a|mp3|md)$/,
  );

export const entradaDoLoteSchema = z
  .object({
    /** Código do inventário canônico; define o documento de destino. */
    codigo: z.string().regex(/^[A-E]\d{2}$/),
    /** Caminho relativo a `OBSERVATORIO_FONTES_DIR`. */
    origem: z.string().min(1),
    chave: chavePublicaSchema,
    sha256: z.string().regex(/^[a-f0-9]{64}$/),
    bytes: z.number().int().positive(),
    mimeType: z.enum([
      "application/pdf",
      "image/webp",
      "image/svg+xml",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "audio/mp4",
      "audio/mpeg",
      "text/markdown",
    ]),
    tipoMidia: z.enum(["pdf", "imagem", "planilha", "audio", "outro"]),
    rotulo: z.string().min(1),
    /**
     * Autoria de terceiro, quando existe. O rótulo gravado em
     * `documento_arquivo` é composto por `montarRotulo`; ninguém escreve a
     * forma com crédito à mão.
     */
    autor: z.string().min(1).nullable(),
    relacao: z.enum(["replica", "derivado"]).nullable(),
    /** Chave do objeto público original quando esta entrada é derivada. */
    derivadoDeChave: chavePublicaSchema
      .nullish()
      .transform((valor) => valor ?? null),
    derivacaoMetodo: z
      .literal("transcricao_leitura_visual")
      .nullish()
      .transform((valor) => valor ?? null),
    principal: z.boolean(),
    derivadoSemOrigemRegistrada: z.boolean(),
  })
  .superRefine((entrada, contexto) => {
    const derivadoCompleto =
      entrada.relacao === "derivado" &&
      entrada.derivadoDeChave !== null &&
      entrada.derivacaoMetodo !== null;
    const semDerivacaoDeclarada =
      entrada.relacao !== "derivado" &&
      entrada.derivadoDeChave === null &&
      entrada.derivacaoMetodo === null;
    if (!derivadoCompleto && !semDerivacaoDeclarada) {
      contexto.addIssue({
        code: "custom",
        message:
          "Derivado exige chave de origem e método; os demais não os declaram.",
      });
    }
  });

export type EntradaDoLote = z.infer<typeof entradaDoLoteSchema>;

export const TOTAL_DO_LOTE = 101;

/** Documentos promovidos a `PUBLICAVEL` por este lote, em ordem de anexo. */
export const CODIGOS_DO_LOTE = [
  "A02",
  "A03",
  "A04",
  "A09",
  "A10",
  "A11",
  "B01",
  "B02",
  "B03",
  "B04",
  "B05",
  "B06",
  "B08",
  "B13",
  "B14",
  "D01",
] as const;

function validar(): readonly EntradaDoLote[] {
  const lote = z.array(entradaDoLoteSchema).length(TOTAL_DO_LOTE).parse(bruto);
  const chaves = new Set(lote.map((e) => e.chave));
  if (chaves.size !== lote.length)
    throw new Error("Lote de publicação com chave de storage repetida.");
  const codigos = new Set(lote.map((e) => e.codigo));
  for (const codigo of codigos)
    if (!CODIGOS_DO_LOTE.includes(codigo as (typeof CODIGOS_DO_LOTE)[number]))
      throw new Error(`Código fora do lote autorizado: ${codigo}.`);
  for (const codigo of codigos) {
    const principais = lote.filter(
      (e) => e.codigo === codigo && e.principal,
    ).length;
    if (principais > 1)
      throw new Error(`Mais de um arquivo principal para ${codigo}.`);
  }
  return lote;
}

export const LOTE_PUBLICACAO = validar();
