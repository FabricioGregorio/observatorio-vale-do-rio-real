import { z } from "zod";
import type { AnexoPublico } from "../consultas/anexos";
import { separarCredito } from "../pesquisa/credito-fotografico";
import { IDS_DOS_LUGARES } from "../territorio/referencias";
import dados from "./b01.json";

const uuid = z.uuid();
const texto = z.string().trim().min(1);
const grupoSchema = z.strictObject({
  id: texto,
  tituloPublico: texto,
  natureza: z.enum(["LUGAR", "PESSOA", "CONTEXTO_INSTITUCIONAL"]),
  ordem: z.number().int().positive().nullable(),
  descricao: texto.nullable(),
  representanteArquivoId: uuid.nullable(),
  lugarCanonicoId: z.enum(IDS_DOS_LUGARES).nullable(),
});
const arquivoSchema = z.strictObject({
  arquivoId: uuid,
  grupoId: texto,
  ordem: z.number().int().positive(),
  tituloPublico: texto,
  alt: texto,
  legenda: texto.nullable(),
  credito: texto.nullable(),
  largura: z.number().int().positive(),
  altura: z.number().int().positive(),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
});

export const mapaB01Schema = z.strictObject({
  versao: z.literal(1),
  grupos: z.array(grupoSchema).length(10),
  arquivos: z.array(arquivoSchema).length(59),
});

export const mapaB01 = mapaB01Schema.parse(dados);
export type EntradaEditorialB01 = (typeof mapaB01.arquivos)[number];

/** Valida estrutura e a vinculação com o universo público, em build time. */
export function reconciliarMapaB01(anexos: readonly AnexoPublico[]) {
  const publicos = anexos.filter(
    (item) => item.slug === "fotografias-visitas-i-vii",
  );
  if (publicos.length !== 59)
    throw new Error("B01: conjunto público diferente de 59 objetos.");

  const grupos = new Set<string>();
  const lugares = new Set<string>();
  for (const grupo of mapaB01.grupos) {
    if (grupos.has(grupo.id))
      throw new Error(`B01: grupo duplicado ${grupo.id}.`);
    grupos.add(grupo.id);
    if (grupo.natureza === "LUGAR") {
      if (grupo.lugarCanonicoId === null || grupo.ordem !== null)
        throw new Error(`B01: grupo territorial inválido ${grupo.id}.`);
      lugares.add(grupo.lugarCanonicoId);
    } else if (grupo.lugarCanonicoId !== null || grupo.ordem === null) {
      throw new Error(`B01: ordem ou relação canônica inválida ${grupo.id}.`);
    }
  }
  if (IDS_DOS_LUGARES.some((id) => !lugares.has(id)))
    throw new Error("B01: ordem territorial não cobre os lugares canônicos.");

  const idsPublicos = new Map(
    publicos.map((item) => [item.previewArquivoId ?? item.arquivoId, item]),
  );
  if (idsPublicos.size !== 59)
    throw new Error("B01: arquivo público duplicado.");
  const idsEditoriais = new Set<string>();
  const ordens = new Set<string>();
  let webp = 0;
  let svg = 0;
  for (const entrada of mapaB01.arquivos) {
    if (!grupos.has(entrada.grupoId))
      throw new Error(`B01: grupo inexistente ${entrada.grupoId}.`);
    if (idsEditoriais.has(entrada.arquivoId))
      throw new Error("B01: arquivo em dois grupos.");
    idsEditoriais.add(entrada.arquivoId);
    const chaveOrdem = `${entrada.grupoId}:${entrada.ordem}`;
    if (ordens.has(chaveOrdem))
      throw new Error(`B01: ordem duplicada ${chaveOrdem}.`);
    ordens.add(chaveOrdem);
    const publico = idsPublicos.get(entrada.arquivoId);
    if (!publico)
      throw new Error(
        `B01: arquivo editorial sem objeto público ${entrada.arquivoId}.`,
      );
    if ((publico.previewSha256 ?? publico.sha256) !== entrada.sha256)
      throw new Error(`B01: SHA divergente ${entrada.arquivoId}.`);
    if (publico.previewArquivoId || publico.mimeType === "image/webp") webp++;
    else if (publico.mimeType === "image/svg+xml") svg++;
    else throw new Error(`B01: MIME inesperado ${publico.mimeType}.`);
    const creditoOperacional = separarCredito(publico.rotuloArquivo).credito;
    const creditoEditorial =
      entrada.credito === null ? null : `Foto: ${entrada.credito}`;
    if (creditoOperacional !== creditoEditorial)
      throw new Error(`B01: crédito divergente ${entrada.arquivoId}.`);
  }
  if (webp !== 58 || svg !== 1)
    throw new Error("B01: composição de mídia divergente.");
  if (
    publicos.some(
      (item) => !idsEditoriais.has(item.previewArquivoId ?? item.arquivoId),
    )
  )
    throw new Error("B01: objeto público sem entrada editorial.");

  for (const grupo of mapaB01.grupos) {
    if (
      grupo.representanteArquivoId &&
      !mapaB01.arquivos.some(
        (item) =>
          item.arquivoId === grupo.representanteArquivoId &&
          item.grupoId === grupo.id,
      )
    )
      throw new Error(`B01: representante fora do grupo ${grupo.id}.`);
  }

  const obrigatorios = new Map([
    ["d0af646c-e6b0-423d-9edc-d5ffc74b246a", "Dani Santos"],
    ["0780c902-bb26-4004-ac50-86247c139cc2", "Iago de Andrade Santos"],
  ]);
  for (const [id, credito] of obrigatorios) {
    if (
      mapaB01.arquivos.find((item) => item.arquivoId === id)?.credito !==
        credito ||
      !idsPublicos.has(id)
    )
      throw new Error(`B01: crédito obrigatório ausente ${id}.`);
  }
  return { publicos, webp, svg };
}

export function gruposB01NaOrdemTerritorial() {
  return [...mapaB01.grupos].sort((a, b) => {
    const ordem = (grupo: typeof a) =>
      grupo.lugarCanonicoId
        ? IDS_DOS_LUGARES.indexOf(grupo.lugarCanonicoId) + 1
        : (grupo.ordem ?? Number.MAX_SAFE_INTEGER);
    return ordem(a) - ordem(b);
  });
}
