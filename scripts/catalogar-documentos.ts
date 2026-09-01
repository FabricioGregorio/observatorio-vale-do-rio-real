/**
 * Catálogo documental — Tarefa 07.
 *
 * Converte os itens do inventário em linhas de `documento` e os liga aos
 * binários que a Tarefa 06 já espelhou, por `documento_arquivo`.
 *
 * Sem esta tarefa a `vw_anexo_publico` retorna vazio: ela faz
 * `documento JOIN documento_arquivo JOIN arquivo`, e a Tarefa 06 popula só
 * `arquivo`.
 *
 * Decisões que este script aplica (docs/tarefas/07-catalogo-documental.md):
 * - `ordem_anexo` é 1…30, pela ordem dos `ID` do inventário;
 * - o vínculo com `arquivo` é encontrado pela `chave_storage`, nunca por
 *   `origem_url` — três URLs do inventário são compartilhadas por vários itens;
 * - documento sem arquivo correspondente não recebe vínculo;
 * - nada é publicado: todo documento nasce e permanece em `rascunho`.
 *
 * Uso:
 *   pnpm tsx scripts/catalogar-documentos.ts --dry-run
 *   pnpm tsx scripts/catalogar-documentos.ts --csv caminho/inventario.csv
 */
import { readFile } from "node:fs/promises";

import { and, eq, like } from "drizzle-orm";

import { arquivo, documento, documentoArquivo } from "../db/schema";
import {
  categoriaDoItem,
  type ItemInventario,
  lerInventario,
  slugDoItem,
} from "../src/lib/espelhamento";

/** A primeira catalogação usa v1, como a chave gravada pela Tarefa 06. */
export const VERSAO = 1;

/** Valores do enum `tipo_documento` (doc 02 §3). */
export const TIPOS_DOCUMENTO = [
  "relatorio_tecnico",
  "diagnostico_interno",
  "relato_campo",
  "formulario_modelo",
  "relatorio_parcial",
  "documento_final",
  "modelagem_estatistica",
  "entrevista_transcricao",
  "plano_aula",
  "identidade_visual",
  "painel_dados",
  "outro",
] as const;

export type TipoDocumento = (typeof TIPOS_DOCUMENTO)[number];

/** Valida a coluna `Tipo (enum)` contra o enum do banco. Não inventa valor. */
export function tipoDocumentoDoItem(item: ItemInventario): TipoDocumento {
  const valor = item.tipo.trim();
  const valido = TIPOS_DOCUMENTO.find((t) => t === valor);
  if (!valido) {
    throw new Error(
      `Tipo "${item.tipo}" não existe no enum tipo_documento. ` +
        `Esperado um de: ${TIPOS_DOCUMENTO.join(", ")}.`,
    );
  }
  return valido;
}

/** `Sim`/`Não` da coluna do inventário. Qualquer outra coisa falha. */
export function exigidoPeloEdital(item: ItemInventario): boolean {
  const v = item.exigidoPeloEdital.trim().toLowerCase();
  if (v === "sim") return true;
  if (v === "não" || v === "nao") return false;
  throw new Error(
    `"Exigido pelo edital" com valor inesperado: "${item.exigidoPeloEdital}".`,
  );
}

/**
 * `ordem_anexo` de 1 a N, pela ordem dos `ID` — prefixo de letra e depois o
 * número. Ordenar em vez de usar a posição da linha torna o resultado estável
 * mesmo que a planilha seja reordenada.
 */
export function calcularOrdemAnexo(
  itens: ItemInventario[],
): Map<string, number> {
  const chave = (id: string) => {
    const m = id.trim().match(/^([A-Za-z]*)(\d*)$/);
    return { letra: (m?.[1] ?? "").toUpperCase(), numero: Number(m?.[2] ?? 0) };
  };
  const ordenados = [...itens].sort((a, b) => {
    const ka = chave(a.id);
    const kb = chave(b.id);
    return ka.letra === kb.letra
      ? ka.numero - kb.numero
      : ka.letra.localeCompare(kb.letra);
  });
  return new Map(ordenados.map((i, n) => [i.id, n + 1]));
}

/**
 * Prefixo da `chave_storage` que identifica os arquivos deste documento.
 * O literal `-v1.` ancora o fim do slug: um slug mais curto não captura outro
 * mais longo. A extensão fica em aberto porque só é conhecida no espelhamento.
 */
export function prefixoChaveStorage(item: ItemInventario): string {
  return `arquivos/${categoriaDoItem(item)}/${slugDoItem(item)}-v${VERSAO}.`;
}

type Categoria = "catalogado" | "no_op" | "sem_arquivo" | "erro";

type Registro = { id: string; categoria: Categoria; detalhe: string };

const ROTULOS: Record<Categoria, string> = {
  catalogado: "catalogados",
  no_op: "sem alteração (no-op)",
  sem_arquivo: "sem arquivo espelhado",
  erro: "erros",
};

const mensagem = (e: unknown) => (e instanceof Error ? e.message : String(e));

/** Campos de `documento` que este script controla. O resto fica como está. */
type CamposDocumento = {
  slug: string;
  titulo: string;
  tipo: TipoDocumento;
  exigidoPeloEdital: boolean;
  ordemAnexo: number;
};

/** Deriva do item tudo o que vai para `documento`. Lança em dado inválido. */
export function camposDoItem(
  item: ItemInventario,
  ordemAnexo: number,
): CamposDocumento {
  const slug = slugDoItem(item);
  if (!slug) throw new Error("slug vazio após normalização");
  const titulo = item.item.trim();
  if (!titulo) throw new Error("item sem título");
  return {
    slug,
    titulo,
    tipo: tipoDocumentoDoItem(item),
    exigidoPeloEdital: exigidoPeloEdital(item),
    ordemAnexo,
  };
}

async function principal(): Promise<void> {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes("--dry-run");
  const iCsv = argv.indexOf("--csv");
  const caminhoCsv =
    iCsv >= 0 ? (argv[iCsv + 1] ?? "") : "inventario-de-anexos.csv";
  if (!caminhoCsv) throw new Error("--csv exige um caminho.");

  let csv: string;
  try {
    csv = await readFile(caminhoCsv, "utf8");
  } catch {
    throw new Error(
      `Não foi possível ler "${caminhoCsv}". Exporte a aba Inventário do ` +
        "inventario-de-anexos.xlsx como CSV (artefato intermediário, não versionado).",
    );
  }

  const itens = lerInventario(csv);
  const ordens = calcularOrdemAnexo(itens);

  // Importado sob demanda: assim as funções puras acima podem ser testadas
  // sem DATABASE_URL no ambiente.
  const { db } = await import("../src/dados/cliente");

  const registros: Registro[] = [];
  for (const item of itens) {
    const reg = (categoria: Categoria, detalhe: string) =>
      registros.push({ id: item.id, categoria, detalhe });

    let campos: CamposDocumento;
    let prefixo: string;
    try {
      campos = camposDoItem(item, ordens.get(item.id) ?? 0);
      if (campos.ordemAnexo < 1) throw new Error("ordem_anexo não determinada");
      prefixo = prefixoChaveStorage(item);
    } catch (erro) {
      reg("erro", mensagem(erro));
      continue;
    }

    if (dryRun) {
      reg(
        "catalogado",
        `[dry-run] ${campos.slug} · ordem ${campos.ordemAnexo} · ${campos.tipo} · buscaria ${prefixo}<ext>`,
      );
      continue;
    }

    // 1. documento — identidade é o slug. Status nunca é tocado.
    let documentoId: string;
    let alterouDocumento: boolean;
    try {
      const [existente] = await db
        .select({
          id: documento.id,
          titulo: documento.titulo,
          tipo: documento.tipo,
          exigido: documento.exigidoPeloEdital,
          ordem: documento.ordemAnexo,
        })
        .from(documento)
        .where(eq(documento.slug, campos.slug));

      if (!existente) {
        const [criado] = await db
          .insert(documento)
          .values({
            slug: campos.slug,
            titulo: campos.titulo,
            tipo: campos.tipo,
            exigidoPeloEdital: campos.exigidoPeloEdital,
            ordemAnexo: campos.ordemAnexo,
          })
          .returning({ id: documento.id });
        if (!criado) throw new Error("insert de documento não devolveu id");
        documentoId = criado.id;
        alterouDocumento = true;
      } else {
        documentoId = existente.id;
        alterouDocumento =
          existente.titulo !== campos.titulo ||
          existente.tipo !== campos.tipo ||
          existente.exigido !== campos.exigidoPeloEdital ||
          existente.ordem !== campos.ordemAnexo;
        if (alterouDocumento) {
          await db
            .update(documento)
            .set({
              titulo: campos.titulo,
              tipo: campos.tipo,
              exigidoPeloEdital: campos.exigidoPeloEdital,
              ordemAnexo: campos.ordemAnexo,
            })
            .where(eq(documento.id, documentoId));
        }
      }
    } catch (erro) {
      reg("erro", `documento: ${mensagem(erro)}`);
      continue;
    }

    // 2. arquivos correspondentes, pela chave_storage. Nunca por origem_url.
    let chaves: { id: string; chave: string }[];
    try {
      chaves = await db
        .select({ id: arquivo.id, chave: arquivo.chaveStorage })
        .from(arquivo)
        .where(like(arquivo.chaveStorage, `${prefixo}%`));
    } catch (erro) {
      reg("erro", `busca de arquivo: ${mensagem(erro)}`);
      continue;
    }

    if (chaves.length === 0) {
      reg(
        "sem_arquivo",
        `documento ${campos.slug} ${alterouDocumento ? "gravado" : "já existente"}, sem arquivo em ${prefixo}<ext>`,
      );
      continue;
    }

    // 3. vínculos. principal = o primeiro por chave_storage crescente.
    chaves.sort((a, b) => a.chave.localeCompare(b.chave));
    const vinculos: string[] = [];
    let conflito = "";
    try {
      for (const [i, arq] of chaves.entries()) {
        const principalEsperado = i === 0;
        const [existente] = await db
          .select({
            versao: documentoArquivo.versao,
            principal: documentoArquivo.principal,
          })
          .from(documentoArquivo)
          .where(
            and(
              eq(documentoArquivo.documentoId, documentoId),
              eq(documentoArquivo.arquivoId, arq.id),
            ),
          );

        if (!existente) {
          await db.insert(documentoArquivo).values({
            documentoId,
            arquivoId: arq.id,
            versao: VERSAO,
            principal: principalEsperado,
          });
          vinculos.push(
            `+${arq.chave}${principalEsperado ? " (principal)" : ""}`,
          );
        } else if (
          existente.versao !== VERSAO ||
          existente.principal !== principalEsperado
        ) {
          // Nunca sobrescrever silenciosamente um vínculo incompatível.
          conflito =
            `vínculo existente para ${arq.chave} diverge: ` +
            `versao=${existente.versao} principal=${existente.principal}, ` +
            `esperado versao=${VERSAO} principal=${principalEsperado}. Nada foi alterado.`;
          break;
        }
      }
    } catch (erro) {
      reg("erro", `vínculo: ${mensagem(erro)}`);
      continue;
    }

    if (conflito) {
      reg("erro", conflito);
    } else if (alterouDocumento || vinculos.length > 0) {
      reg(
        "catalogado",
        `${campos.slug} · ordem ${campos.ordemAnexo} · ${vinculos.length || "nenhum"} vínculo(s) novo(s) ${vinculos.join(", ")}`.trim(),
      );
    } else {
      reg("no_op", `${campos.slug} já catalogado e vinculado`);
    }
  }

  relatorio(registros);
}

function relatorio(registros: Registro[]): void {
  const porCategoria = new Map<Categoria, Registro[]>();
  for (const r of registros) {
    porCategoria.set(r.categoria, [
      ...(porCategoria.get(r.categoria) ?? []),
      r,
    ]);
  }

  console.log(`\nInventário: ${registros.length} itens\n`);
  for (const categoria of Object.keys(ROTULOS) as Categoria[]) {
    const lista = porCategoria.get(categoria) ?? [];
    console.log(`${ROTULOS[categoria]}: ${lista.length}`);
    for (const r of lista) console.log(`  ${r.id.padEnd(5)} ${r.detalhe}`);
  }
  console.log(`\nerros: ${(porCategoria.get("erro") ?? []).length}`);
}

if (process.argv[1]?.includes("catalogar-documentos")) {
  principal().catch((erro) => {
    console.error(mensagem(erro));
    process.exit(1);
  });
}
