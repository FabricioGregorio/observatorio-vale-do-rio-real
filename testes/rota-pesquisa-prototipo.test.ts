import { describe, expect, test, vi } from "vitest";

import { exigirAmbienteDeDesenvolvimentoDaPesquisa } from "../src/app/dev/pesquisa/page";
import { REGISTROS_DOS_PROTOTIPOS } from "../src/dados/pesquisa/derivados";

describe("proteção e conteúdo do protótipo Pesquisa em Campo", () => {
  test("interrompe a renderização com 404 em produção", () => {
    const interromper = vi.fn((): never => {
      throw new Error("404 nativo");
    });

    expect(() =>
      exigirAmbienteDeDesenvolvimentoDaPesquisa("production", interromper),
    ).toThrow("404 nativo");
    expect(interromper).toHaveBeenCalledOnce();
  });

  test.each(["development", "test", undefined])(
    "permite o ambiente %s",
    (ambiente) => {
      const interromper = vi.fn((): never => {
        throw new Error("não deveria interromper");
      });
      exigirAmbienteDeDesenvolvimentoDaPesquisa(ambiente, interromper);
      expect(interromper).not.toHaveBeenCalled();
    },
  );

  test("os três registros são fotográficos, de 11/04/2026 e sem pessoa descrita", () => {
    expect(REGISTROS_DOS_PROTOTIPOS).toHaveLength(3);
    for (const registro of REGISTROS_DOS_PROTOTIPOS) {
      expect(registro.tipo).toBe("registro fotográfico");
      expect(registro.local).toBe("Ilha Grande");
      expect(registro.data).toBe("2026-04-11");
      expect(registro.alt).not.toMatch(
        /pesquisador|entrevistad|morador|pessoa/i,
      );
    }
  });
});
