import { describe, expect, it } from "vitest";

import { SEMANTICA_FORMULARIOS } from "../scripts/corrigir-semantica-formularios";

describe("semântica de A09 e A10", () => {
  it("descreve planilhas de respostas sem chamá-las de formulário modelo", () => {
    expect(SEMANTICA_FORMULARIOS).toHaveLength(2);
    for (const item of SEMANTICA_FORMULARIOS) {
      expect(item.titulo.toLowerCase()).toContain("respostas");
      expect(item.titulo.toLowerCase()).not.toContain("modelo");
      expect(item.resumo.length).toBeGreaterThan(40);
    }
  });
});
