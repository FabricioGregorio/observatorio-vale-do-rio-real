import { describe, expect, test, vi } from "vitest";

import { exigirAmbienteDeDesenvolvimento } from "../src/app/dev/estilos/page";

describe("proteção da referência visual", () => {
  test("interrompe a renderização com 404 em produção", () => {
    const interromper = vi.fn((): never => {
      throw new Error("404 nativo");
    });

    expect(() =>
      exigirAmbienteDeDesenvolvimento("production", interromper),
    ).toThrow("404 nativo");
    expect(interromper).toHaveBeenCalledOnce();
  });

  test.each(["development", "test", undefined])(
    "permite o ambiente %s",
    (ambiente) => {
      const interromper = vi.fn((): never => {
        throw new Error("não deveria interromper");
      });

      exigirAmbienteDeDesenvolvimento(ambiente, interromper);
      expect(interromper).not.toHaveBeenCalled();
    },
  );
});
