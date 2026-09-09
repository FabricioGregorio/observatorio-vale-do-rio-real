import { describe, expect, test, vi } from "vitest";

import { exigirAmbienteDeDesenvolvimentoDoTerritorio } from "../src/app/dev/territorio/page";

describe("proteção da rota do protótipo territorial", () => {
  test("interrompe a renderização com 404 em produção", () => {
    const interromper = vi.fn((): never => {
      throw new Error("404 nativo");
    });

    expect(() =>
      exigirAmbienteDeDesenvolvimentoDoTerritorio("production", interromper),
    ).toThrow("404 nativo");
    expect(interromper).toHaveBeenCalledOnce();
  });

  test.each(["development", "test", undefined])(
    "permite o ambiente %s",
    (ambiente) => {
      const interromper = vi.fn((): never => {
        throw new Error("não deveria interromper");
      });

      exigirAmbienteDeDesenvolvimentoDoTerritorio(ambiente, interromper);
      expect(interromper).not.toHaveBeenCalled();
    },
  );
});
