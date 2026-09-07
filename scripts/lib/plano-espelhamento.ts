import { createHash } from "node:crypto";
import { readdir, readFile, realpath } from "node:fs/promises";
import { isAbsolute, join, relative, sep } from "node:path";
import { z } from "zod";
import { classificacaoDe } from "../../src/dados/classificacao-documental";
import { LOTE_PRIVADO_INICIAL } from "../../src/dados/lote-privado-inicial";
import {
  categoriaDoItem,
  lerCsv,
  lerInventario,
  origemSistemaDoItem,
  slugDoItem,
} from "../../src/lib/espelhamento";
import { FalhaEspelhamento } from "../../src/lib/espelhamento-privado";

export const operacaoSchema = z.object({
  codigo: z.enum(["A02", "A04", "D01"]),
  caminho: z.string().min(1),
  chave: z
    .string()
    .regex(/^arquivos\/[a-z0-9-]+\/[a-z0-9-]+-v1\.(pdf|png|svg)$/),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  bytes: z.number().int().positive(),
  mimeType: z.enum(["application/pdf", "image/png", "image/svg+xml"]),
  bucket: z.literal("observatorio-privado"),
  visibilidade: z.literal("privado"),
  urlPublica: z.null(),
  principal: z.boolean(),
  slugDocumento: z.string().min(1),
  origemUrl: z.string().url().nullable(),
  origemSistema: z.string().min(1),
  fonteHash: z.string().min(1),
  hashHistoricoAnterior: z.enum(["conferido", "nao_disponivel"]),
});
export type OperacaoPrivada = z.infer<typeof operacaoSchema>;

export function validarLote(entrada: unknown): OperacaoPrivada[] {
  const lote = z.array(operacaoSchema).length(10).parse(entrada);
  for (const [i, op] of lote.entries()) {
    const aprovado = LOTE_PRIVADO_INICIAL[i];
    if (
      !aprovado ||
      op.codigo !== aprovado[0] ||
      op.caminho !== aprovado[1] ||
      op.chave !== aprovado[2] ||
      op.sha256 !== aprovado[3] ||
      op.principal !== aprovado[4]
    )
      throw new FalhaEspelhamento("Lote diverge dos dez vínculos aprovados.");
    const c = classificacaoDe(op.codigo);
    if (c.estado !== "ESPELHAVEL" || c.revisao !== "pendente")
      throw new FalhaEspelhamento(`Classificação alterada: ${op.codigo}.`);
  }
  return lote;
}

/** Impede escape por .., caminho absoluto ou link para fora da fonte. */
export async function lerFonte(raiz: string, caminho: string): Promise<Buffer> {
  if (isAbsolute(caminho))
    throw new FalhaEspelhamento("Arquivo fora da fonte canônica.");
  const base = await realpath(raiz);
  const destino = await realpath(join(base, caminho));
  const rel = relative(base, destino);
  if (
    isAbsolute(caminho) ||
    isAbsolute(rel) ||
    rel === ".." ||
    rel.startsWith(`..${sep}`)
  )
    throw new FalhaEspelhamento("Arquivo fora da fonte canônica.");
  return readFile(destino);
}

export function metadados(corpo: Buffer, caminho: string) {
  const ext = caminho.split(".").pop();
  let mimeType: OperacaoPrivada["mimeType"];
  if (ext === "pdf" && corpo.subarray(0, 5).toString() === "%PDF-")
    mimeType = "application/pdf";
  else if (
    ext === "png" &&
    corpo.subarray(0, 8).equals(Buffer.from("89504e470d0a1a0a", "hex"))
  )
    mimeType = "image/png";
  else if (
    ext === "svg" &&
    /<svg\b[^>]*\bxmlns=["']http:\/\/www\.w3\.org\/2000\/svg["']/.test(
      corpo.toString("utf8"),
    )
  )
    mimeType = "image/svg+xml";
  else throw new FalhaEspelhamento(`Formato incompatível: ${caminho}.`);
  return {
    sha256: createHash("sha256").update(corpo).digest("hex"),
    bytes: corpo.length,
    mimeType,
  };
}

export async function prepararPlano(
  raiz: string,
  csv: string,
): Promise<OperacaoPrivada[]> {
  const itens = lerInventario(csv);
  if (itens.length !== 33 || new Set(itens.map((i) => i.id)).size !== 33)
    throw new FalhaEspelhamento(
      "Inventário deve conter os 33 códigos distintos.",
    );
  const linhas = lerCsv(csv);
  const cabecalho = linhas[0] ?? [];
  const indiceHash = cabecalho.indexOf("SHA-256");
  if (indiceHash < 0)
    throw new FalhaEspelhamento("Inventário sem coluna de hash.");
  const arquivosD01 = (
    await readdir(join(raiz, "identidade-visual"), {
      recursive: true,
      withFileTypes: true,
    })
  )
    .filter((f) => !f.isDirectory())
    .map((f) => relative(raiz, join(f.parentPath, f.name)).split(sep).join("/"))
    .sort();
  const esperadosD01 = LOTE_PRIVADO_INICIAL.filter((r) => r[0] === "D01")
    .map((r) => r[1])
    .sort();
  if (JSON.stringify(arquivosD01) !== JSON.stringify(esperadosD01))
    throw new FalhaEspelhamento(
      "Conjunto D01 diverge dos oito arquivos aprovados.",
    );
  const plano: OperacaoPrivada[] = [];
  for (const [
    codigo,
    caminho,
    chave,
    registrado,
    principal,
  ] of LOTE_PRIVADO_INICIAL) {
    const item = itens.find((i) => i.id === codigo);
    if (!item) throw new FalhaEspelhamento(`Documento ausente: ${codigo}.`);
    const meta = metadados(await lerFonte(raiz, caminho), caminho);
    const hashInventario =
      linhas[itens.indexOf(item) + 1]?.[indiceHash]?.trim() ?? "";
    if (
      meta.sha256 !== registrado ||
      (hashInventario && meta.sha256 !== hashInventario)
    )
      throw new FalhaEspelhamento(
        `Hash canônico divergente: ${codigo} / ${caminho}.`,
      );
    const slug = slugDoItem(item);
    if (!chave.startsWith(`arquivos/${categoriaDoItem(item)}/${slug}-`))
      throw new FalhaEspelhamento(`Chave diverge do inventário: ${codigo}.`);
    plano.push(
      operacaoSchema.parse({
        codigo,
        caminho,
        chave,
        ...meta,
        principal,
        slugDocumento: slug,
        bucket: "observatorio-privado",
        visibilidade: "privado",
        urlPublica: null,
        origemUrl: item.linkAtual || null,
        origemSistema: origemSistemaDoItem(item),
        fonteHash: hashInventario
          ? "inventario-de-anexos.xlsx / SHA-256"
          : "fonte canônica atual; VERIFICACAO_PRE_UPLOAD_2026-09-07.md",
        hashHistoricoAnterior: hashInventario ? "conferido" : "nao_disponivel",
      }),
    );
  }
  return validarLote(plano);
}
