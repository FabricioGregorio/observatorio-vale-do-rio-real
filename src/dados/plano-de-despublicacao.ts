/**
 * Plano declarado de despublicação.
 *
 * Retirar objeto do acervo é operação irreversível sobre prova documental, e
 * por isso ela não aceita alvo calculado em tempo de execução. O plano é um
 * artefato versionado: cada objeto aparece com `arquivoId`, chave, URL pública,
 * SHA-256, bytes, MIME e documento. A ferramenta confere os sete contra o banco
 * antes de tocar em qualquer coisa e aborta tudo na primeira divergência.
 *
 * Nada de prefixo, nada de padrão, nada de "todos os objetos de tal pasta".
 * Só as chaves escritas aqui podem ser alvo, e o `arquivoId` existe justamente
 * para que uma chave reaproveitada no futuro não faça a ferramenta apagar o
 * objeto errado.
 */
import { z } from "zod";
import { chavePublicaSchema } from "./lote-publicacao";
import bruto18 from "./plano-despublicacao-2026-09-18.json";

export const itemDoPlanoSchema = z.object({
  arquivoId: z.uuid(),
  chave: chavePublicaSchema,
  urlPublica: z.url().startsWith("https://acervo."),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  bytes: z.number().int().positive(),
  mimeType: z.string().min(1),
  /** Slug do documento que hoje publica o objeto. */
  documento: z.string().min(1),
  motivo: z.string().min(1),
});

export type ItemDoPlano = z.infer<typeof itemDoPlanoSchema>;

export type PlanoDeclarado = {
  readonly id: string;
  readonly total: number;
  readonly itens: readonly ItemDoPlano[];
};

type Declaracao = {
  readonly id: string;
  readonly total: number;
  readonly bruto: unknown;
};

const DECLARACOES: readonly Declaracao[] = [
  {
    // 6 substituições de Ilha Grande e 13 fotografias cuja fonte saiu da
    // seleção do responsável. Contrapartida do lote 2026-09-18.
    id: "2026-09-18",
    total: 19,
    bruto: bruto18,
  },
];

function validar({ id, total, bruto }: Declaracao): PlanoDeclarado {
  const itens = z.array(itemDoPlanoSchema).length(total).parse(bruto);

  const chaves = new Set(itens.map((i) => i.chave));
  if (chaves.size !== itens.length)
    throw new Error(`Plano ${id} com chave repetida.`);
  const ids = new Set(itens.map((i) => i.arquivoId));
  if (ids.size !== itens.length)
    throw new Error(`Plano ${id} com arquivoId repetido.`);

  for (const item of itens)
    if (!item.urlPublica.endsWith(item.chave))
      throw new Error(
        `Plano ${id}: URL e chave não descrevem o mesmo objeto: ${item.chave}.`,
      );

  return { id, total, itens };
}

export const PLANOS_DECLARADOS: ReadonlyMap<string, PlanoDeclarado> = new Map(
  DECLARACOES.map((d) => [d.id, validar(d)]),
);

export const IDS_DOS_PLANOS: readonly string[] = [...PLANOS_DECLARADOS.keys()];

/** O plano pedido, ou erro. Sem padrão e sem detecção automática. */
export function exigirPlano(id: string | undefined | null): PlanoDeclarado {
  if (!id?.trim())
    throw new Error(
      "Plano não informado. Use --plano <id>; declarados: " +
        `${IDS_DOS_PLANOS.join(", ")}.`,
    );
  const plano = PLANOS_DECLARADOS.get(id.trim());
  if (!plano)
    throw new Error(
      `Plano desconhecido: ${id}. Declarados: ${IDS_DOS_PLANOS.join(", ")}.`,
    );
  return plano;
}

/** Lê `--plano <id>` de um argv já sem o nome do programa. */
export function idDoPlanoEmArgv(argv: readonly string[]): string | undefined {
  const posicao = argv.indexOf("--plano");
  return posicao === -1 ? undefined : argv[posicao + 1];
}
