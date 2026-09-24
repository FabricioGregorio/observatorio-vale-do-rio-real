/**
 * Catálogo documental: o que se deriva de um item do inventário.
 *
 * Estas funções moravam em `scripts/catalogar-documentos.ts`, que convertia o
 * inventário em linhas de `documento` e as ligava aos binários espelhados. O
 * script foi removido com o PostgreSQL; a derivação em si não tem nada de
 * banco — recebe um item do inventário e devolve campos — e por isso ficou.
 *
 * Nada aqui escreve, lê disco, lê ambiente ou fala com a rede: é vocabulário
 * documental, do qual o fluxo editorial de publicação depende para dizer
 * qual é o tipo, a natureza, a ordem e a chave de um item.
 */
import type { NaturezaDocumento } from "../lib/espelhamento";
import {
  categoriaDoItem,
  type ItemInventario,
  slugDoItem,
} from "../lib/espelhamento";
import { TIPOS_DOCUMENTO, type TipoDocumento } from "./tipo-documento";

/** A primeira catalogação usa v1, como a chave gravada no espelhamento. */
export const VERSAO = 1;

/**
 * Valores de `tipo_documento`.
 *
 * A lista existia em duas cópias — aqui e no enum do schema — que divergiriam
 * no dia em que alguém acrescentasse um tipo e esquecesse a outra. A fonte
 * passou a ser `src/dados/tipo-documento.ts`, e com o schema removido ela é a
 * única. A reexportação mantém o endereço conhecido funcionando.
 */
export { TIPOS_DOCUMENTO, type TipoDocumento };

/** Valida a coluna `Tipo (enum)` do inventário. Não inventa valor. */
export function tipoDocumentoDoItem(item: ItemInventario): TipoDocumento {
  const valor = item.tipo.trim();
  const valido = TIPOS_DOCUMENTO.find((t) => t === valor);
  if (!valido) {
    throw new Error(
      `Tipo "${item.tipo}" não existe em tipo_documento. ` +
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
 * `natureza` do item, coerente com `Exigido pelo edital` por construção.
 *
 * A coerência entre os dois era exigida também por restrição do modelo
 * documental; ela continua sendo garantida aqui, na derivação, e não
 * descoberta adiante.
 *
 * Coluna vazia deriva do booleano, sempre para o valor conservador:
 * `item_nao_exigido` não infla o denominador dos 28 itens exigidos. Evidência
 * complementar exige marcação explícita — não se deduz.
 */
export function naturezaDoItem(item: ItemInventario): NaturezaDocumento {
  const exigido = exigidoPeloEdital(item);
  const declarada = item.natureza.trim().toLowerCase();

  if (declarada === "") {
    return exigido ? "item_exigido" : "item_nao_exigido";
  }

  if (
    declarada !== "item_exigido" &&
    declarada !== "evidencia_complementar" &&
    declarada !== "item_nao_exigido"
  ) {
    throw new Error(
      `"Natureza" com valor inesperado em ${item.id}: "${item.natureza}". ` +
        "Use item_exigido, evidencia_complementar ou item_nao_exigido.",
    );
  }

  if ((declarada === "item_exigido") !== exigido) {
    throw new Error(
      `${item.id}: "Natureza" (${declarada}) contradiz "Exigido pelo edital" ` +
        `("${item.exigidoPeloEdital}"). Corrija o inventário antes de publicar.`,
    );
  }

  return declarada;
}

/**
 * `ordemAnexo` de 1 a N, pela ordem dos `ID` — prefixo de letra e depois o
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
 * Prefixo da chave de storage que identifica os arquivos deste documento.
 * O literal `-v1.` ancora o fim do slug: um slug mais curto não captura outro
 * mais longo. A extensão fica em aberto porque só é conhecida no espelhamento.
 */
export function prefixoChaveStorage(item: ItemInventario): string {
  return `arquivos/${categoriaDoItem(item)}/${slugDoItem(item)}-v${VERSAO}.`;
}

/** Campos do documento que a catalogação controla. O resto fica como está. */
export type CamposDocumento = {
  slug: string;
  titulo: string;
  tipo: TipoDocumento;
  exigidoPeloEdital: boolean;
  /** Coerente com exigidoPeloEdital por construção. */
  natureza: NaturezaDocumento;
  ordemAnexo: number;
};

/** Deriva do item tudo o que descreve o documento. Lança em dado inválido. */
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
    natureza: naturezaDoItem(item),
    ordemAnexo,
  };
}
