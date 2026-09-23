/**
 * Registro central dos lotes de publicação.
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
 * Os JSON são registro histórico e **não mudam**: cada um descreve o que foi
 * publicado naquela data, com os hashes daquela data.
 *
 * ## Duas naturezas, e por que a distinção é necessária
 *
 * O registro responde a duas perguntas diferentes, e até 2026-09-23 só sabia
 * responder a primeira:
 *
 * - **o que o executor pode rodar?** — `exigirLote`, consumido por
 *   `publicar-acervo.ts`;
 * - **quais lotes compõem a publicação atual?** — `IDS_DOS_LOTES`, consumido
 *   pelo gerador do snapshot para preencher a proveniência do release.
 *
 * Um lote `executavel` responde às duas. Um lote `historico` responde só à
 * segunda: ele aconteceu, seus objetos estão no acervo, e ele não pode ser
 * reexecutado. Tratar os dois como a mesma coisa obrigaria ou a esconder um
 * lote real da proveniência, ou a inventar campos para fazê-lo caber no
 * contrato do executor. Nenhuma das duas é aceitável.
 */
import { z } from "zod";
import {
  CODIGOS_DO_LOTE,
  type EntradaDoLote,
  type EntradaRegistrada,
  entradaDoLoteSchema,
  entradaRegistradaSchema,
  TOTAL_DO_LOTE,
} from "./lote-publicacao";
import bruto08 from "./lote-publicacao-2026-09-08.json";
import bruto16 from "./lote-publicacao-2026-09-16.json";
import bruto18 from "./lote-publicacao-2026-09-18.json";

type Nucleo = {
  /** Identificador estável do lote; é o que se passa em `--lote`. */
  readonly id: string;
  readonly total: number;
  /** Documentos que este lote toca, e nenhum outro. */
  readonly codigos: readonly string[];
};

/** Lote que o executor pode rodar: declara tudo que `publicar-acervo.ts` usa. */
export type LoteDeclarado = Nucleo & {
  readonly natureza: "executavel";
  readonly entradas: readonly EntradaDoLote[];
};

/**
 * Lote que aconteceu e não pode ser reexecutado.
 *
 * Registra o núcleo de cada objeto — origem, chave, hash, tamanho, tipo — e
 * não registra rótulo, preferência nem proveniência, porque a declaração
 * original não os tinha. Completá-los agora seria escrever, com aparência de
 * fato, valores que ninguém declarou na época.
 */
export type LoteHistorico = Nucleo & {
  readonly natureza: "historico";
  readonly entradas: readonly EntradaRegistrada[];
  /** Por que não é executável. Aparece na mensagem de recusa de `exigirLote`. */
  readonly motivo: string;
};

export type LoteDoRegistro = LoteDeclarado | LoteHistorico;

/**
 * Invariantes comuns às duas naturezas.
 *
 * Chave repetida seria dois objetos disputando o mesmo endereço; código fora
 * do autorizado seria um lote tocando documento que ele não declara.
 */
function conferirNucleo(
  id: string,
  codigos: readonly string[],
  entradas: readonly EntradaRegistrada[],
): void {
  const chaves = new Set(entradas.map((entrada) => entrada.chave));
  if (chaves.size !== entradas.length)
    throw new Error(`Lote ${id} com chave de storage repetida.`);

  for (const entrada of entradas)
    if (!codigos.includes(entrada.codigo))
      throw new Error(
        `Lote ${id}: código fora do autorizado: ${entrada.codigo}.`,
      );
}

function validarExecutavel(
  declaracao: Nucleo & { readonly bruto: unknown },
): LoteDeclarado {
  const { id, total, codigos } = declaracao;
  const entradas = z
    .array(entradaDoLoteSchema)
    .length(total)
    .parse(declaracao.bruto);

  conferirNucleo(id, codigos, entradas);

  for (const codigo of new Set(entradas.map((entrada) => entrada.codigo))) {
    const principais = entradas.filter(
      (entrada) => entrada.codigo === codigo && entrada.principal,
    ).length;
    if (principais > 1)
      throw new Error(
        `Lote ${id}: mais de um arquivo principal para ${codigo}.`,
      );
  }

  return { natureza: "executavel", id, total, codigos, entradas };
}

function validarHistorico(
  declaracao: Nucleo & { readonly bruto: unknown; readonly motivo: string },
): LoteHistorico {
  const { id, total, codigos, motivo } = declaracao;
  const entradas = z
    .array(entradaRegistradaSchema)
    .length(total)
    .parse(declaracao.bruto);

  conferirNucleo(id, codigos, entradas);

  return { natureza: "historico", id, total, codigos, entradas, motivo };
}

/**
 * Ordem cronológica. É ela que o snapshot grava como proveniência do release.
 */
const REGISTRO: readonly LoteDoRegistro[] = [
  /*
    A primeira publicação. Oito objetos: o PDF público de A02 e sete arquivos
    de identidade visual (D01-01 a D01-07).

    ## Por que está aqui

    Ele compõe a publicação atual, e há três provas versionadas disso:

    - `scripts/auditar-integridade-publicacao.ts` o nomeia "as oito entradas da
      primeira publicação" e reconcilia acervo esperado somando estas oito às
      101 de 16/09 — `esperados.length !== 109` é erro;
    - `docs/carga/FECHAMENTO_INTEGRIDADE_PUBLICACAO_2026-09-16.md` fecha em
      108/108 objetos com D01 = 8 e A02 = 2, contas que só somam com estas
      entradas;
    - `plano-despublicacao-2026-09-18.json` retira dezenove objetos, todos de
      B01, e portanto nada daqui.

    Dois destes objetos — `d01-04-horizontal-monocromatica-escura-v1.svg` e
    `d01-06-icon-v1.svg` — continuam públicos hoje e **não são declarados em
    nenhum outro lugar versionado**. Sem este registro, eles não teriam
    proveniência declarada nenhuma.

    ## Por que é histórico e não executável

    Três motivos independentes, qualquer um deles bastando:

    - seis dos oito objetos foram substituídos na migração para os originais
      (`scripts/publicar-originais-acervo.ts`), então as chaves declaradas
      aqui não são as chaves vivas;
    - duas fontes não existem mais na raiz canônica, como o fechamento de
      16/09 registra: `horizontal-monocromatica-escura.svg` e `icon.svg`.
      `publicar-acervo.ts` abortaria na conferência de hash da origem;
    - as entradas não declaram rótulo, preferência nem proveniência, que é o
      que o executor precisa para escrever `documento_arquivo`.
  */
  validarHistorico({
    id: "2026-09-08",
    total: 8,
    codigos: ["A02", "D01"],
    bruto: bruto08,
    motivo:
      "primeira publicação: seis dos oito objetos foram substituídos na " +
      "migração para os originais, duas fontes não existem mais na raiz " +
      "canônica, e as entradas não declaram rótulo nem proveniência",
  }),
  validarExecutavel({
    id: "2026-09-16",
    total: TOTAL_DO_LOTE,
    codigos: CODIGOS_DO_LOTE,
    bruto: bruto16,
  }),
  // Sincronização do acervo com a seleção fotográfica atual: 6 substituições
  // de Ilha Grande e 13 fotografias novas, todas do documento B01.
  validarExecutavel({
    id: "2026-09-18",
    total: 19,
    codigos: ["B01"],
    bruto: bruto18,
  }),
];

/** Todos os lotes que compõem a publicação, executáveis ou não. */
export const LOTES_DECLARADOS: ReadonlyMap<string, LoteDoRegistro> = new Map(
  REGISTRO.map((lote) => [lote.id, lote]),
);

/** Ids de todos os lotes, em ordem cronológica. Proveniência do release. */
export const IDS_DOS_LOTES: readonly string[] = [...LOTES_DECLARADOS.keys()];

/** Ids que `--lote` aceita. Subconjunto: histórico não roda. */
export const IDS_EXECUTAVEIS: readonly string[] = REGISTRO.filter(
  (lote) => lote.natureza === "executavel",
).map((lote) => lote.id);

/**
 * O lote pedido, ou erro. Nunca devolve um lote que ninguém escolheu.
 *
 * Lote histórico é recusado nomeando o motivo. A alternativa — deixá-lo cair
 * em "Lote desconhecido" — diria que ele não existe, quando ele existe e está
 * registrado; e devolvê-lo entregaria ao executor um lote sem os campos que
 * ele precisa, para falhar mais adiante e com menos contexto.
 */
export function exigirLote(id: string | undefined | null): LoteDeclarado {
  if (!id?.trim())
    throw new Error(
      "Lote não informado. Use --lote <id>; executáveis: " +
        `${IDS_EXECUTAVEIS.join(", ")}.`,
    );

  const lote = LOTES_DECLARADOS.get(id.trim());
  if (!lote)
    throw new Error(
      `Lote desconhecido: ${id}. Executáveis: ${IDS_EXECUTAVEIS.join(", ")}.`,
    );

  if (lote.natureza === "historico")
    throw new Error(
      `Lote ${lote.id} é histórico e não pode ser executado: ${lote.motivo}. ` +
        `Executáveis: ${IDS_EXECUTAVEIS.join(", ")}.`,
    );

  return lote;
}

/** Lê `--lote <id>` de um argv já sem o nome do programa. */
export function idDoLoteEmArgv(argv: readonly string[]): string | undefined {
  const posicao = argv.indexOf("--lote");
  return posicao === -1 ? undefined : argv[posicao + 1];
}
