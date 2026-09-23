import { runInNewContext } from "node:vm";
import { describe, expect, test } from "vitest";
import {
  CHAVE_MOVIMENTO,
  CHAVE_TEXTO,
  SCRIPT_PREFERENCIAS_INICIAIS,
} from "../src/lib/preferencias-interface";
import { CHAVE_TEMA } from "../src/lib/tema";

describe("preferências antes da primeira pintura", () => {
  test("aplica somente valores reconhecidos, sem escrever no armazenamento", () => {
    const atributos = new Map<string, string>();
    const valores = new Map([
      [CHAVE_TEMA, "escuro"],
      [CHAVE_MOVIMENTO, "reduzido"],
      [CHAVE_TEXTO, "maior"],
    ]);
    runInNewContext(SCRIPT_PREFERENCIAS_INICIAIS, {
      document: {
        documentElement: {
          setAttribute: (nome: string, valor: string) =>
            atributos.set(nome, valor),
        },
      },
      localStorage: { getItem: (chave: string) => valores.get(chave) },
    });
    expect(Object.fromEntries(atributos)).toEqual({
      "data-tema": "escuro",
      "data-movimento": "reduzido",
      "data-texto": "maior",
    });
  });
  test.each([null, "inválido", "sistema"])(
    "ignora %s sem alterar os padrões",
    (valor) => {
      const atributos: string[] = [];
      runInNewContext(SCRIPT_PREFERENCIAS_INICIAIS, {
        document: {
          documentElement: {
            setAttribute: (nome: string) => atributos.push(nome),
          },
        },
        localStorage: { getItem: () => valor },
      });
      expect(atributos).toEqual([]);
    },
  );
  test("armazenamento bloqueado não interrompe a página", () => {
    expect(() =>
      runInNewContext(SCRIPT_PREFERENCIAS_INICIAIS, {
        document: { documentElement: {} },
        localStorage: {
          getItem: () => {
            throw new Error("bloqueado");
          },
        },
      }),
    ).not.toThrow();
  });
});
