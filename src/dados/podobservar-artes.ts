import { z } from "zod";

import manifestoBruto from "./podobservar-artes.json";

const arteSchema = z.object({
  id: z.enum(["logo", "ep01", "ep02", "ep03"]),
  papel: z.enum(["logo", "capa_episodio"]),
  origem: z.string().min(1),
  sha256_original: z.string().regex(/^[a-f0-9]{64}$/),
  arquivo: z.string().endsWith(".webp"),
  chave_privada: z.string().min(1),
  chave_publica: z.string().min(1),
  slug_episodio: z.string().min(1).nullable(),
  original: z.object({
    largura: z.number().int().positive(),
    altura: z.number().int().positive(),
    bytes: z.number().int().positive(),
    sha256: z.string().regex(/^[a-f0-9]{64}$/),
    alpha: z.literal(false),
    formato: z.literal("JPEG"),
  }),
  derivado: z.object({
    largura: z.number().int().positive(),
    altura: z.number().int().positive(),
    bytes: z.number().int().positive(),
    sha256: z.string().regex(/^[a-f0-9]{64}$/),
    mime_type: z.literal("image/webp"),
    metadados_removidos: z.array(z.string()),
    transformacao: z.string().min(1),
  }),
});

export const ARTES_PODOBSERVAR = z
  .array(arteSchema)
  .length(4)
  .parse(manifestoBruto);

export const LOGO_PODOBSERVAR = (() => {
  const logo = ARTES_PODOBSERVAR.find((arte) => arte.papel === "logo");
  if (!logo)
    throw new Error("Logo oficial do PodObservar ausente do manifesto.");
  return {
    src: `/media/podobservar/${logo.arquivo}`,
    largura: logo.derivado.largura,
    altura: logo.derivado.altura,
  } as const;
})();
