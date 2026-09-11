import { readFileSync } from "node:fs";
import { describe, expect, test, vi } from "vitest";

import { exigirAmbienteDeDesenvolvimentoDosDados } from "../src/app/dev/dados/page";

describe("proteção da rota de laboratório dos dados", () => {
  test("interrompe a renderização com 404 em produção", () => {
    const interromper = vi.fn((): never => {
      throw new Error("404 nativo");
    });

    expect(() =>
      exigirAmbienteDeDesenvolvimentoDosDados("production", interromper),
    ).toThrow("404 nativo");
    expect(interromper).toHaveBeenCalledOnce();
  });

  test.each(["development", "test", undefined])(
    "permite o ambiente %s",
    (ambiente) => {
      const interromper = vi.fn((): never => {
        throw new Error("não deveria interromper");
      });
      exigirAmbienteDeDesenvolvimentoDosDados(ambiente, interromper);
      expect(interromper).not.toHaveBeenCalled();
    },
  );
});

/**
 * A H4.0 termina no laboratório. Integrar a seção na Home exige escolha humana
 * entre os presets, e o guarda contra a integração acidental é este teste: ele
 * falha no minuto em que alguém importar o painel na página inicial.
 */
describe("isolamento da H4 em relação à Home", () => {
  test("a Home não importa o painel de dados", () => {
    const home = readFileSync("src/app/page.tsx", "utf8");
    expect(home).not.toContain("PainelDeDados");
    expect(home).not.toContain("dados/indicadores");
    // A Home cita "painel de indicadores" num comentário, para registrar que a
    // seção está ausente de propósito. Citar não é importar.
    expect(home).not.toMatch(/^import .*indicadores/m);
  });

  test("o painel não tem entrada pública fora do laboratório", () => {
    const painel = readFileSync(
      "src/componentes/prototipo/dados/PainelDeDados.tsx",
      "utf8",
    );
    expect(painel).not.toContain('contexto="home"');
    expect(painel).toContain("somente DEV");
  });
});
