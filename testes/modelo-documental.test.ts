import { describe, expect, test } from "vitest";

import {
  contarItensExigidos,
  evidenciaManifestoSchema,
  podePublicar,
  porNatureza,
} from "../src/lib/manifesto-evidencias";

/**
 * Modelo documental da migração 0004: natureza, fail-closed e derivação.
 *
 * Nenhum snapshot: cada teste afirma uma regra, para que a falha diga qual
 * regra quebrou.
 */

function evidencia(over: Record<string, unknown> = {}) {
  return evidenciaManifestoSchema.parse({
    codigo: "X01",
    entregavel: "Item de teste",
    natureza: "item_exigido",
    obrigatorio: true,
    estado: "PUBLICAVEL",
    revisao_privacidade: "concluida",
    url: "https://exemplo.invalid/x01.pdf",
    sha256: "a".repeat(64),
    doi: null,
    observacao: null,
    derivado_de: ["documento:X01"],
    derivado_de_documento: null,
    derivacao_metodo: null,
    arquivo_existe: true,
    ...over,
  });
}

describe("natureza do item", () => {
  test("aceita os três valores oficiais", () => {
    for (const natureza of [
      "item_exigido",
      "evidencia_complementar",
      "item_nao_exigido",
    ] as const) {
      expect(evidencia({ natureza }).natureza).toBe(natureza);
    }
  });

  test("recusa valor fora do vocabulário", () => {
    expect(() => evidencia({ natureza: "item_bonus" })).toThrow();
  });

  test("ausente vira null, e null não publica", () => {
    const item = evidencia({ natureza: null });
    expect(item.natureza).toBeNull();
    expect(podePublicar(item)).toBe(false);
  });
});

describe("denominador dos 28 itens exigidos", () => {
  const acervo = [
    ...Array.from({ length: 28 }, (_, i) =>
      evidencia({
        codigo: `E${i}`,
        natureza: "item_exigido",
        obrigatorio: true,
      }),
    ),
    evidencia({
      codigo: "B13",
      natureza: "evidencia_complementar",
      obrigatorio: false,
    }),
    evidencia({
      codigo: "B14",
      natureza: "evidencia_complementar",
      obrigatorio: false,
    }),
    evidencia({
      codigo: "A11",
      natureza: "evidencia_complementar",
      obrigatorio: false,
    }),
    evidencia({
      codigo: "D01",
      natureza: "item_nao_exigido",
      obrigatorio: false,
    }),
    evidencia({
      codigo: "D02",
      natureza: "item_nao_exigido",
      obrigatorio: false,
    }),
  ];

  test("conta 28, com 33 itens no acervo", () => {
    expect(acervo).toHaveLength(33);
    expect(contarItensExigidos(acervo)).toBe(28);
  });

  test("evidência complementar não entra no denominador", () => {
    const semComplementares = acervo.filter(
      (i) => i.natureza !== "evidencia_complementar",
    );
    expect(contarItensExigidos(semComplementares)).toBe(28);
  });

  test("separa os três conjuntos", () => {
    const g = porNatureza(acervo);
    expect(g.exigidos).toHaveLength(28);
    expect(g.complementares.map((i) => i.codigo)).toEqual([
      "B13",
      "B14",
      "A11",
    ]);
    expect(g.naoExigidos.map((i) => i.codigo)).toEqual(["D01", "D02"]);
    expect(g.semClassificacao).toHaveLength(0);
  });

  test("B13 não ocupa o lugar de B07 no denominador", () => {
    const comB07 = [
      ...acervo,
      evidencia({ codigo: "B07", natureza: "item_exigido", obrigatorio: true }),
    ];
    expect(contarItensExigidos(comB07)).toBe(29);
    const g = porNatureza(comB07);
    expect(g.exigidos.some((i) => i.codigo === "B07")).toBe(true);
    expect(g.complementares.some((i) => i.codigo === "B13")).toBe(true);
  });

  test("A11 não substitui A01: são itens de naturezas diferentes", () => {
    const a01 = evidencia({
      codigo: "A01",
      natureza: "item_exigido",
      obrigatorio: true,
    });
    const a11 = evidencia({
      codigo: "A11",
      natureza: "evidencia_complementar",
      obrigatorio: false,
    });
    expect(a01.codigo).not.toBe(a11.codigo);
    expect(a01.natureza).not.toBe(a11.natureza);
    expect(contarItensExigidos([a01, a11])).toBe(1);
  });
});

describe("fail-closed do gate público", () => {
  test("PUBLICAVEL exige revisão concluída", () => {
    expect(podePublicar(evidencia({ revisao_privacidade: "pendente" }))).toBe(
      false,
    );
    expect(podePublicar(evidencia({ revisao_privacidade: "bloqueada" }))).toBe(
      false,
    );
    expect(podePublicar(evidencia({ revisao_privacidade: null }))).toBe(false);
    expect(podePublicar(evidencia())).toBe(true);
  });

  test("revisão concluída não publica estado que não seja PUBLICAVEL", () => {
    for (const estado of [
      "RESTRITO",
      "ESPELHAVEL",
      "IMPEDIDO",
      "PENDENTE",
    ] as const) {
      expect(podePublicar(evidencia({ estado }))).toBe(false);
    }
  });

  test("item sem classificação de estado não publica", () => {
    expect(podePublicar(evidencia({ estado: null }))).toBe(false);
  });

  test("RESTRITO nunca é elegível, mesmo com arquivo, URL e hash", () => {
    const restrito = evidencia({ estado: "RESTRITO" });
    expect(restrito.url).not.toBeNull();
    expect(restrito.sha256).not.toBeNull();
    expect(restrito.arquivo_existe).toBe(true);
    expect(podePublicar(restrito)).toBe(false);
  });

  test("falta de arquivo, URL ou hash bloqueia", () => {
    expect(podePublicar(evidencia({ arquivo_existe: false }))).toBe(false);
    expect(podePublicar(evidencia({ url: null }))).toBe(false);
    expect(podePublicar(evidencia({ sha256: null }))).toBe(false);
  });

  test("proveniência vazia é recusada pelo contrato", () => {
    expect(() => evidencia({ derivado_de: [] })).toThrow();
  });
});

describe("original e derivado", () => {
  test("original não declara pai nem método", () => {
    const original = evidencia();
    expect(original.derivado_de_documento).toBeNull();
    expect(original.derivacao_metodo).toBeNull();
  });

  test("derivado registra pai e método", () => {
    const a05 = evidencia({
      codigo: "A05",
      derivado_de_documento: "A02",
      derivacao_metodo: "extracao_secao",
    });
    expect(a05.derivado_de_documento).toBe("A02");
    expect(a05.derivacao_metodo).toBe("extracao_secao");
  });

  test("leitura visual e OCR estatístico são métodos distintos", () => {
    const leitura = evidencia({
      derivado_de_documento: "A03",
      derivacao_metodo: "transcricao_leitura_visual",
    });
    expect(leitura.derivacao_metodo).toBe("transcricao_leitura_visual");
    expect(leitura.derivacao_metodo).not.toBe("ocr_estatistico");
  });

  test("método fora do vocabulário é recusado", () => {
    expect(() =>
      evidencia({ derivado_de_documento: "A03", derivacao_metodo: "ocr" }),
    ).toThrow();
  });

  test("derivado não publica sem satisfazer o gate", () => {
    const a06 = evidencia({
      codigo: "A06",
      estado: "PENDENTE",
      derivado_de_documento: "A03",
      derivacao_metodo: "extracao_secao",
      arquivo_existe: false,
      url: null,
      sha256: null,
    });
    expect(podePublicar(a06)).toBe(false);
  });
});
