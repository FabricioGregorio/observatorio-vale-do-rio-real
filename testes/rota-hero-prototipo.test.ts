import { describe, expect, test, vi } from "vitest";

import { exigirAmbienteDeDesenvolvimento } from "../src/app/dev/hero/page";
import {
  ITENS_COM_DESTINO,
  ITENS_EM_DEMONSTRACAO,
  MENU_ALVO,
} from "../src/componentes/prototipo/menuAlvo";

/**
 * Protótipo do Hero — proteção da rota e contrato do menu. Fase H1.
 *
 * Mesma proteção de `/dev/estilos`, e pelo mesmo motivo: um protótipo
 * alcançável de fora seria conteúdo publicado, e conteúdo publicado num site
 * de prestação de contas é afirmação. Este ainda é rascunho.
 */

describe("proteção da rota do protótipo", () => {
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

describe("menu alvo do protótipo", () => {
  test("tem exatamente os seis itens aprovados, na ordem", () => {
    expect(MENU_ALVO.map((item) => item.rotulo)).toEqual([
      "Observatório",
      "Território",
      "Pesquisa",
      "Dados",
      "PodObservar",
      "Acervo",
    ]);
  });

  /**
   * A trava da ADR-017: nenhuma rota falsa. Território e Acervo ainda não
   * existem, e por isso têm `href: null` — que o componente renderiza como
   * texto, nunca como link.
   */
  test("Território e Acervo continuam sem destino", () => {
    expect(ITENS_EM_DEMONSTRACAO.map((i) => i.rotulo)).toEqual([
      "Território",
      "Acervo",
    ]);
  });

  test("os quatro itens restantes apontam para rotas que existem", () => {
    expect(ITENS_COM_DESTINO.map((i) => [i.rotulo, i.href])).toEqual([
      ["Observatório", "/observatorio"],
      ["Pesquisa", "/pesquisa"],
      ["Dados", "/dados"],
      ["PodObservar", "/podobservar"],
    ]);
  });

  test("nenhum destino aponta para rota inexistente", () => {
    const rotasQueExistem = new Set([
      "/observatorio",
      "/pesquisa",
      "/dados",
      "/podobservar",
      "/campo",
      "/prestacao-de-contas",
    ]);

    for (const item of MENU_ALVO) {
      if (item.href === null) continue;
      expect(rotasQueExistem.has(item.href)).toBe(true);
    }
  });
});
