import { z } from "zod";

import bruto from "./marcas-derivadas.json";

/**
 * As marcas institucionais derivadas para a web.
 *
 * O manifesto é escrito por `scripts/derivar-marcas-institucionais.py` e lido
 * aqui sob validação. Ele registra, por marca: o arquivo de origem no corpus,
 * o hash do original, o hash do derivado, as dimensões da arte antes e depois,
 * a transformação aplicada e **a regra do manual que justifica a escolha**.
 *
 * A regra fica no dado, e não num comentário, porque ela é a resposta à
 * pergunta que uma prestação de contas faz: por que esta variante, deste
 * tamanho, nesta posição. `testes/marcas-institucionais.test.ts` confere que
 * cada arquivo existe, tem os bytes e o hash declarados, e respeita os limites
 * dos manuais.
 */

const sha256 = z.string().regex(/^[a-f0-9]{64}$/);
const texto = z.string().trim().min(1);

export const marcaDerivadaSchema = z.strictObject({
  id: texto,
  /** Nome da entidade, como ela deve ser escrita. */
  entidade: texto,
  /** Bloco da régua, no vocabulário do manual da PNAB Sergipe. */
  bloco: z.enum(["apoio", "realizacao"]),
  arquivo: texto,
  /** Largura de exibição, em CSS px. */
  largura: z.number().int().positive(),
  /** Altura de exibição, em CSS px. */
  altura: z.number().int().positive(),
  /** Fator de densidade do arquivo gerado. */
  escala: z.number().int().positive(),
  bytes: z.number().int().positive(),
  sha256,
  regra: texto,
  original: z.strictObject({
    arquivo: texto,
    largura: z.number().int().positive(),
    altura: z.number().int().positive(),
    larguraDaArte: z.number().int().positive(),
    alturaDaArte: z.number().int().positive(),
    bytes: z.number().int().positive(),
    sha256,
    pagina: z.number().int().positive().optional(),
    recorte: z
      .strictObject({
        esquerda: z.number().nonnegative(),
        inferior: z.number().nonnegative(),
        direita: z.number().nonnegative(),
        superior: z.number().nonnegative(),
        unidade: z.literal("ponto_pdf"),
      })
      .optional(),
  }),
  transformacao: texto,
});

export type MarcaDerivada = z.infer<typeof marcaDerivadaSchema>;

export const MARCAS_DERIVADAS: readonly MarcaDerivada[] = z
  .array(marcaDerivadaSchema)
  .length(5)
  .parse(bruto);

/** Caminho público das marcas, servido de `public/media/marcas`. */
export const CAMINHO_DAS_MARCAS_INSTITUCIONAIS = "/media/marcas";

/**
 * A marca do Governo Federal é a referência dimensional do bloco.
 *
 * O manual da PNAB Sergipe é explícito: "as logomarcas que pertencem ao bloco
 * não devem ultrapassar a altura e a largura total da marca nominativa do
 * Governo Federal". Quem precisa desse limite — o componente e o teste — o
 * busca aqui, e não numa constante repetida.
 */
export const MARCA_FEDERAL: MarcaDerivada = (() => {
  const federal = MARCAS_DERIVADAS.find(
    (marca) => marca.id === "mincultura-governo-federal",
  );
  if (federal === undefined)
    throw new Error(
      "Marcas: a assinatura do Governo Federal não está no manifesto.",
    );
  return federal;
})();

/**
 * Redução máxima da marca do Governo Federal em meios eletrônicos, em px.
 *
 * Manual de uso da marca do Governo Federal, v1.2, "LIMITE DE REDUÇÃO": em
 * meios eletrônicos a redução máxima é de 200 px; abaixo disso só em casos
 * excepcionais, com 110 px como piso absoluto. O projeto não usa a exceção.
 */
export const LARGURA_MINIMA_FEDERAL = 200;

export function marcaPorId(id: string): MarcaDerivada {
  const marca = MARCAS_DERIVADAS.find((candidata) => candidata.id === id);
  if (marca === undefined)
    throw new Error(`Marca institucional ausente: ${id}.`);
  return marca;
}
