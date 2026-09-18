/**
 * Registro dos lotes de publicação declarados.
 *
 * Existe porque o executor passou a publicar mais de um lote e não pode
 * escolher sozinho qual. Até 2026-09-18 `publicar-acervo.ts` importava o lote
 * de 16/09 direto, com `TOTAL_DO_LOTE` e `CODIGOS_DO_LOTE` no módulo: publicar
 * outro conjunto exigia editar o código, e reexecutar o script depois de uma
 * mudança no corpus reprocessava o lote histórico inteiro.
 *
 * ## Seleção é explícita, sempre
 *
 * `exigirLote` falha sem `id`. Não há lote padrão, não há "último lote", não
 * há detecção por data e não há fallback: num site de prestação de contas, um
 * executor que adivinha o que publicar é pior que um executor que não roda.
 * Quem executa escreve a data do lote na linha de comando.
 *
 * ## Cada lote carrega o próprio contrato
 *
 * Total de entradas e códigos autorizados são declarados **por lote**. Antes
 * eram constantes globais, e por isso publicar o lote de 18/09 — que só toca
 * `B01` — tentaria resolver e promover os dezesseis documentos do lote de
 * 16/09. O contrato local mantém o efeito de cada execução restrito ao que
 * aquele lote declara.
 *
 * O JSON de 16/09 é registro histórico e **não muda**: ele descreve o que foi
 * publicado naquela data, com os hashes daquela data.
 */
import { z } from "zod";
import {
  CODIGOS_DO_LOTE,
  type EntradaDoLote,
  entradaDoLoteSchema,
  TOTAL_DO_LOTE,
} from "./lote-publicacao";
import bruto16 from "./lote-publicacao-2026-09-16.json";
import bruto18 from "./lote-publicacao-2026-09-18.json";

export type LoteDeclarado = {
  /** Identificador estável do lote; é o que se passa em `--lote`. */
  readonly id: string;
  readonly total: number;
  /** Documentos que este lote pode promover, e nenhum outro. */
  readonly codigos: readonly string[];
  readonly entradas: readonly EntradaDoLote[];
};

type Declaracao = {
  readonly id: string;
  readonly total: number;
  readonly codigos: readonly string[];
  readonly bruto: unknown;
};

const DECLARACOES: readonly Declaracao[] = [
  {
    id: "2026-09-16",
    total: TOTAL_DO_LOTE,
    codigos: CODIGOS_DO_LOTE,
    bruto: bruto16,
  },
  {
    // Sincronização do acervo com a seleção fotográfica atual: 6 substituições
    // de Ilha Grande e 13 fotografias novas, todas do documento B01.
    id: "2026-09-18",
    total: 19,
    codigos: ["B01"],
    bruto: bruto18,
  },
];

function validar(declaracao: Declaracao): LoteDeclarado {
  const { id, total, codigos } = declaracao;
  const entradas = z
    .array(entradaDoLoteSchema)
    .length(total)
    .parse(declaracao.bruto);

  const chaves = new Set(entradas.map((e) => e.chave));
  if (chaves.size !== entradas.length)
    throw new Error(`Lote ${id} com chave de storage repetida.`);

  for (const entrada of entradas)
    if (!codigos.includes(entrada.codigo))
      throw new Error(
        `Lote ${id}: código fora do autorizado: ${entrada.codigo}.`,
      );

  for (const codigo of new Set(entradas.map((e) => e.codigo))) {
    const principais = entradas.filter(
      (e) => e.codigo === codigo && e.principal,
    ).length;
    if (principais > 1)
      throw new Error(
        `Lote ${id}: mais de um arquivo principal para ${codigo}.`,
      );
  }

  return { id, total, codigos, entradas };
}

export const LOTES_DECLARADOS: ReadonlyMap<string, LoteDeclarado> = new Map(
  DECLARACOES.map((d) => [d.id, validar(d)]),
);

export const IDS_DOS_LOTES: readonly string[] = [...LOTES_DECLARADOS.keys()];

/** O lote pedido, ou erro. Nunca devolve um lote que ninguém escolheu. */
export function exigirLote(id: string | undefined | null): LoteDeclarado {
  if (!id?.trim())
    throw new Error(
      "Lote não informado. Use --lote <id>; declarados: " +
        `${IDS_DOS_LOTES.join(", ")}.`,
    );
  const lote = LOTES_DECLARADOS.get(id.trim());
  if (!lote)
    throw new Error(
      `Lote desconhecido: ${id}. Declarados: ${IDS_DOS_LOTES.join(", ")}.`,
    );
  return lote;
}

/** Lê `--lote <id>` de um argv já sem o nome do programa. */
export function idDoLoteEmArgv(argv: readonly string[]): string | undefined {
  const posicao = argv.indexOf("--lote");
  return posicao === -1 ? undefined : argv[posicao + 1];
}
