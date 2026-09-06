import { describe, expect, test } from "vitest";

import {
  evidenciaManifestoSchema,
  manifestoPublico,
  podePublicar,
} from "../src/lib/manifesto-evidencias";

const base = {
  codigo: "A01",
  entregavel: "Relatório",
  natureza: "item_exigido" as const,
  obrigatorio: true,
  estado: "PUBLICAVEL" as const,
  revisao_privacidade: "concluida" as const,
  url: "https://exemplo.invalid/a01.pdf",
  sha256: "a".repeat(64),
  doi: null,
  observacao: null,
  derivado_de: ["documento:A01"],
  arquivo_existe: true,
};

describe("contrato do Manifesto de Evidências", () => {
  test("publica somente item publicável com revisão concluída e URL", () => {
    const item = evidenciaManifestoSchema.parse(base);
    expect(podePublicar(item)).toBe(true);
    expect(manifestoPublico([item])).toEqual([item]);
  });

  test("estado ou revisão ausente mantém o item não público", () => {
    const semEstado = evidenciaManifestoSchema.parse(
      Object.fromEntries(
        Object.entries(base).filter(([key]) => key !== "estado"),
      ),
    );
    const semRevisao = evidenciaManifestoSchema.parse({
      ...base,
      revisao_privacidade: "pendente",
    });
    const semUrl = evidenciaManifestoSchema.parse({ ...base, url: null });
    expect(manifestoPublico([semEstado, semRevisao, semUrl])).toEqual([]);
  });

  test.each(["RESTRITO", "PENDENTE", "IMPEDIDO", "ESPELHAVEL"] as const)(
    "estado %s nunca é público",
    (estado) => {
      expect(
        podePublicar(evidenciaManifestoSchema.parse({ ...base, estado })),
      ).toBe(false);
    },
  );

  test("estado legado publicado não autoriza RESTRITO", () => {
    const item = evidenciaManifestoSchema.parse({
      ...base,
      estado: "RESTRITO",
      publicado: true,
    });
    expect(podePublicar(item)).toBe(false);
  });

  test("publicado legado não autoriza item sem revisão", () => {
    const item = evidenciaManifestoSchema.parse({
      ...base,
      revisao_privacidade: null,
      publicado: true,
    });
    expect(podePublicar(item)).toBe(false);
  });

  test("exige proveniência e não inventa URL ou hash", () => {
    expect(() =>
      evidenciaManifestoSchema.parse({ ...base, derivado_de: [] }),
    ).toThrow();
    expect(() =>
      evidenciaManifestoSchema.parse({ ...base, url: "[Inserir link aqui]" }),
    ).toThrow();
    expect(
      podePublicar(
        evidenciaManifestoSchema.parse({ ...base, arquivo_existe: false }),
      ),
    ).toBe(false);
    expect(
      podePublicar(evidenciaManifestoSchema.parse({ ...base, sha256: null })),
    ).toBe(false);
  });
});
