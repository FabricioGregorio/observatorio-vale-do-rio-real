/**
 * Funções puras do espelhamento de anexos (Tarefa 06).
 *
 * Ficam separadas do script para poderem ser testadas sem rede, sem banco e
 * sem storage. Nenhuma delas faz I/O.
 *
 * Referências:
 * - docs/tarefas/06-espelhamento-de-arquivos.md (políticas operacionais)
 * - docs/tarefas/07-catalogo-documental.md (regra de slug)
 * - doc 01 §6 (padrão de URL), doc 02 §3 e §5 (enums e tabela `arquivo`)
 */

/** Colunas da aba Inventário, exportada em CSV (artefato intermediário). */
export type ItemInventario = {
  id: string;
  categoria: string;
  item: string;
  tipo: string;
  exigidoPeloEdital: string;
  status: string;
  fonteAtual: string;
  linkAtual: string;
  slugProposto: string;
};

/** Categorias de storage — vocabulário fechado do inventário (Tarefa 06). */
export const CATEGORIAS_STORAGE = [
  "analise-de-dados",
  "comprovacao-de-campo",
  "conformidade",
  "produto-final",
  "publicidade",
] as const;

export type CategoriaStorage = (typeof CATEGORIAS_STORAGE)[number];

/**
 * Vocabulário de `origem_sistema` (doc 02 §5). A coluna é `text`, não enum:
 * o vocabulário é acordo documental, não constraint do banco.
 */
export const ORIGEM_SISTEMA: Record<string, string> = {
  "google drive": "google_drive",
  "google docs": "google_docs",
  "google forms": "google_forms",
  figma: "figma",
  "arquivo local": "upload",
  instagram: "instagram",
};

/**
 * Normalização determinística para slug e categoria (Tarefa 07 § Regra de slug).
 * Conjunto ASCII: minúsculas, sem acento, `[^a-z0-9]+` vira hífen, sem hífen
 * nas pontas. O conjunto é ASCII de propósito — em `1ª temporada`, uma regra
 * Unicode preservaria o `ª` e violaria o padrão de URL do doc 01 §6.
 */
export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Slug do item: `Slug proposto` quando existir, senão derivado de `Item`. */
export function slugDoItem(item: ItemInventario): string {
  const proposto = item.slugProposto.trim();
  return proposto ? normalizar(proposto) : normalizar(item.item);
}

/** Categoria de storage a partir da coluna `Categoria` do inventário. */
export function categoriaDoItem(item: ItemInventario): CategoriaStorage {
  const normalizada = normalizar(item.categoria);
  const valida = CATEGORIAS_STORAGE.find((c) => c === normalizada);
  if (!valida) {
    throw new Error(
      `Categoria "${item.categoria}" fora do vocabulário. ` +
        `Esperado um de: ${CATEGORIAS_STORAGE.join(", ")}.`,
    );
  }
  return valida;
}

/** `origem_sistema` a partir da coluna `Fonte atual`. */
export function origemSistemaDoItem(item: ItemInventario): string {
  const chave = item.fonteAtual.trim().toLowerCase();
  const valor = ORIGEM_SISTEMA[chave];
  if (!valor) {
    throw new Error(
      `Fonte "${item.fonteAtual}" fora do vocabulário de origem_sistema. ` +
        `Esperado um de: ${Object.keys(ORIGEM_SISTEMA).join(", ")}.`,
    );
  }
  return valor;
}

/** Valores do enum `tipo_midia` (doc 02 §3). */
export type TipoMidia =
  | "pdf"
  | "audio"
  | "imagem"
  | "video"
  | "planilha"
  | "apresentacao"
  | "dataset"
  | "outro";

/**
 * MIME → `tipo_midia` (doc 02 §3). Determinístico e sem catch-all: item que
 * não cair em nenhuma regra falha explicitamente, em vez de virar `outro`.
 */
export function tipoMidiaDeMime(mime: string): TipoMidia {
  const m = (mime.split(";")[0] ?? "").trim().toLowerCase();
  if (m === "application/pdf") return "pdf";
  if (m.startsWith("audio/")) return "audio";
  if (m.startsWith("image/")) return "imagem";
  if (m.startsWith("video/")) return "video";
  if (
    m === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    m === "application/vnd.ms-excel" ||
    m === "application/vnd.oasis.opendocument.spreadsheet"
  ) {
    return "planilha";
  }
  if (
    m ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
    m === "application/vnd.ms-powerpoint" ||
    m === "application/vnd.oasis.opendocument.presentation"
  ) {
    return "apresentacao";
  }
  // Decisão semântica do projeto, tomada em 2026-08-31 e registrada na
  // Tarefa 06: formato de dados abertos é `dataset`; formato de planilha de
  // escritório é `planilha`. A distinção não vinha da documentação anterior.
  if (
    m === "text/csv" ||
    m === "text/tab-separated-values" ||
    m === "application/json"
  ) {
    return "dataset";
  }
  throw new Error(
    `MIME "${mime}" não corresponde a nenhum valor de tipo_midia.`,
  );
}

/** Extensão → MIME, usado como fallback quando a origem não informa Content-Type. */
const MIME_POR_EXTENSAO: Record<string, string> = {
  pdf: "application/pdf",
  mp3: "audio/mpeg",
  wav: "audio/wav",
  m4a: "audio/mp4",
  ogg: "audio/ogg",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
  mp4: "video/mp4",
  webm: "video/webm",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  xls: "application/vnd.ms-excel",
  ods: "application/vnd.oasis.opendocument.spreadsheet",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ppt: "application/vnd.ms-powerpoint",
  odp: "application/vnd.oasis.opendocument.presentation",
  csv: "text/csv",
  tsv: "text/tab-separated-values",
  json: "application/json",
};

/** Extensão do arquivo a partir da URL de origem, sem o ponto. */
export function extensaoDaUrl(url: string): string {
  const semQuery = (url.split("?")[0] ?? "").split("#")[0] ?? "";
  const ultimo = semQuery.split("/").pop() ?? "";
  const ponto = ultimo.lastIndexOf(".");
  if (ponto < 0) return "";
  return ultimo.slice(ponto + 1).toLowerCase();
}

/**
 * `mime_type` final: Content-Type da origem quando reconhecido, extensão como
 * fallback (política da Tarefa 06). Falha explícita quando nenhum dos dois
 * resolve.
 */
export function resolverMime(contentType: string | null, url: string): string {
  const declarado = (contentType?.split(";")[0] ?? "").trim().toLowerCase();
  if (declarado && declarado !== "application/octet-stream") {
    // valida antes de aceitar: se não mapear para tipo_midia, cai no fallback
    try {
      tipoMidiaDeMime(declarado);
      return declarado;
    } catch {
      // segue para a extensão
    }
  }
  const porExtensao = MIME_POR_EXTENSAO[extensaoDaUrl(url)];
  if (porExtensao) return porExtensao;
  throw new Error(
    `Não foi possível determinar o MIME: Content-Type="${contentType ?? ""}", url sem extensão conhecida.`,
  );
}

/** Extensão canônica derivada do MIME, para compor a chave de storage. */
export function extensaoDeMime(mime: string): string {
  const m = (mime.split(";")[0] ?? "").trim().toLowerCase();
  for (const [ext, valor] of Object.entries(MIME_POR_EXTENSAO)) {
    if (valor === m) return ext;
  }
  throw new Error(`Sem extensão canônica para o MIME "${mime}".`);
}

/**
 * Chave de storage: `arquivos/<categoria>/<slug>-v<n>.<ext>`.
 * A Tarefa 06 sempre usa v1 — versões posteriores são da Tarefa 07.
 */
export function chaveStorage(
  categoria: CategoriaStorage,
  slug: string,
  versao: number,
  extensao: string,
): string {
  return `arquivos/${categoria}/${slug}-v${versao}.${extensao}`;
}

/** Motivo pelo qual um item não pode ser espelhado. */
export type Pendencia = { motivo: string };

/**
 * Item sem origem utilizável: sem link, ou com link/fonte que a planilha ainda
 * não corrigiu. Não é falha de rede — é pendência de origem (Tarefa 06).
 * Nunca adivinhar URL.
 */
export function pendenciaDeOrigem(item: ItemInventario): Pendencia | null {
  const link = item.linkAtual.trim();
  if (!link) return { motivo: "sem Link atual no inventário" };
  if (!/^https?:\/\//i.test(link)) {
    return { motivo: `Link atual não é uma URL http(s): "${link}"` };
  }
  const fonte = item.fonteAtual.trim();
  if (!fonte) return { motivo: "sem Fonte atual no inventário" };
  if (!ORIGEM_SISTEMA[fonte.toLowerCase()]) {
    return { motivo: `Fonte atual fora do vocabulário: "${fonte}"` };
  }
  if (!item.slugProposto.trim() && !normalizar(item.item)) {
    return { motivo: "sem slug e sem título aproveitável" };
  }
  return null;
}

/**
 * Item de origem Figma não é baixado: o doc 01 §6 o define como captura
 * estática em PDF/PNG, que é ato humano. Sem integração com a API do Figma.
 */
export function exigeCapturaManual(item: ItemInventario): boolean {
  return normalizar(item.fonteAtual) === "figma";
}

/** Erro HTTP que não adianta repetir: 4xx exceto 408 e 429. */
export function ehRetentavel(status: number): boolean {
  if (status === 408 || status === 429) return true;
  return status < 400 || status >= 500;
}

/** Backoff determinístico entre tentativas, em milissegundos. */
export function backoffMs(tentativa: number): number {
  return 1000 * 2 ** (tentativa - 1);
}

/**
 * Leitor de CSV conforme RFC 4180: aspas duplas, `""` como escape, vírgula e
 * quebra de linha dentro de campo entre aspas. Pequeno de propósito — não vale
 * uma dependência.
 */
export function lerCsv(texto: string): string[][] {
  const linhas: string[][] = [];
  let campo = "";
  let linha: string[] = [];
  let entreAspas = false;
  const conteudo = texto.replace(/^﻿/, "");

  for (let i = 0; i < conteudo.length; i++) {
    const c = conteudo[i];
    if (entreAspas) {
      if (c === '"') {
        if (conteudo[i + 1] === '"') {
          campo += '"';
          i++;
        } else {
          entreAspas = false;
        }
      } else {
        campo += c;
      }
      continue;
    }
    if (c === '"') {
      entreAspas = true;
    } else if (c === ",") {
      linha.push(campo);
      campo = "";
    } else if (c === "\n") {
      linha.push(campo);
      linhas.push(linha);
      linha = [];
      campo = "";
    } else if (c !== "\r") {
      campo += c;
    }
  }
  if (campo !== "" || linha.length > 0) {
    linha.push(campo);
    linhas.push(linha);
  }
  return linhas.filter((l) => l.some((v) => v.trim() !== ""));
}

const COLUNAS_ESPERADAS = [
  "ID",
  "Categoria",
  "Item",
  "Tipo (enum)",
  "Exigido pelo edital",
  "Status",
  "Fonte atual",
  "Link atual",
  "Slug proposto",
] as const;

/** Converte o CSV da aba Inventário em itens tipados. */
export function lerInventario(csv: string): ItemInventario[] {
  const linhas = lerCsv(csv);
  if (linhas.length === 0) throw new Error("Inventário vazio.");
  const cabecalho = (linhas[0] ?? []).map((c) => c.trim());
  const indice: Record<string, number> = {};
  for (const nome of COLUNAS_ESPERADAS) {
    const i = cabecalho.indexOf(nome);
    if (i < 0)
      throw new Error(`Coluna "${nome}" ausente no CSV do inventário.`);
    indice[nome] = i;
  }
  const valor = (l: string[], nome: string) =>
    (l[indice[nome] ?? -1] ?? "").trim();
  return linhas.slice(1).map((l) => ({
    id: valor(l, "ID"),
    categoria: valor(l, "Categoria"),
    item: valor(l, "Item"),
    tipo: valor(l, "Tipo (enum)"),
    exigidoPeloEdital: valor(l, "Exigido pelo edital"),
    status: valor(l, "Status"),
    fonteAtual: valor(l, "Fonte atual"),
    linkAtual: valor(l, "Link atual"),
    slugProposto: valor(l, "Slug proposto"),
  }));
}
