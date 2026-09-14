import { describe, expect, test, vi } from "vitest";

import { exigirDesenvolvimentoDoTerritorioVivo } from "../src/app/dev/territorio-vivo/page";
import {
  aplicar,
  barraDeEscala,
  caixaDoCaminho,
  enquadrar,
  kmPorUnidade,
} from "../src/componentes/prototipo/territoriovivo/geometria";
import { LUGARES_DE_CAMPO } from "../src/componentes/prototipo/territoriovivo/lugares";
import { montarDadosDoMapa } from "../src/dados/territorio/mapa";
import { PONTOS_DE_VISITA_PREVISTOS } from "../src/dados/territorio/pontos";

/**
 * Laboratório territorial — proteção da rota, geometria e limites de dado.
 */

describe("proteção da rota do laboratório territorial", () => {
  test("interrompe a renderização com 404 em produção", () => {
    const interromper = vi.fn((): never => {
      throw new Error("404 nativo");
    });
    expect(() =>
      exigirDesenvolvimentoDoTerritorioVivo("production", interromper),
    ).toThrow("404 nativo");
  });

  test.each(["development", "test", undefined])(
    "permite o ambiente %s",
    (ambiente) => {
      const interromper = vi.fn((): never => {
        throw new Error("não deveria interromper");
      });
      exigirDesenvolvimentoDoTerritorioVivo(ambiente, interromper);
      expect(interromper).not.toHaveBeenCalled();
    },
  );
});

describe("geometria do enquadramento", () => {
  test("o centro do alvo vai ao centro da vista, e o alvo cabe nela", () => {
    const alvo = { x0: 10, y0: 20, x1: 30, y1: 60 };
    const vista = { x0: 0, y0: 0, x1: 200, y1: 100 };
    const e = enquadrar(alvo, vista);
    const [cx, cy] = aplicar(e, 20, 40);
    expect(cx).toBeCloseTo(100);
    expect(cy).toBeCloseTo(50);
    expect((alvo.y1 - alvo.y0) * e.s).toBeLessThanOrEqual(100 + 1e-9);
    expect((alvo.x1 - alvo.x0) * e.s).toBeLessThanOrEqual(200 + 1e-9);
  });

  test("a escala sai da projeção: Sergipe inteiro tem largura plausível", () => {
    const { projecao } = montarDadosDoMapa();
    const larguraKm = kmPorUnidade(projecao) * projecao.largura;
    expect(larguraKm).toBeGreaterThan(150);
    expect(larguraKm).toBeLessThan(300);
  });

  test("a barra de escala nunca afirma mais quilômetros do que cabem", () => {
    const barra = barraDeEscala(0.2, 3, 40);
    expect(barra.unidades).toBeLessThanOrEqual(40);
    expect([1, 2, 5, 10, 20, 50]).toContain(barra.km);
  });

  test("o centro de rótulo de Tobias Barreto fica dentro da sua caixa", () => {
    const tobias = montarDadosDoMapa().municipios.find(
      (m) => m.codigoIbge === "2807402",
    );
    expect(tobias).toBeDefined();
    const c = caixaDoCaminho(tobias?.caminho ?? "");
    expect(c.cx).toBeGreaterThan(c.x0);
    expect(c.cx).toBeLessThan(c.x1);
    expect(c.cy).toBeGreaterThan(c.y0);
    expect(c.cy).toBeLessThan(c.y1);
  });
});

describe("limites de dado dos lugares", () => {
  test("são exatamente os quatro lugares confirmados, na ordem", () => {
    expect(LUGARES_DE_CAMPO.map((l) => l.id)).toEqual([
      "recanto-da-serra",
      "borda-da-mata",
      "serra-dos-macacos",
      "ilha-grande",
    ]);
  });

  test("município da ficha não contradiz pontos.ts; a posição fica fora da ficha", () => {
    for (const lugar of LUGARES_DE_CAMPO) {
      const ponto = PONTOS_DE_VISITA_PREVISTOS.find((p) => p.id === lugar.id);
      // pontos.ts (dado da Home) só declara município onde já havia documento;
      // onde declara, a referência territorial autorizada coincide.
      if (ponto?.municipioId != null) {
        expect(lugar.municipioId).toBe(ponto.municipioId);
      }
      expect(lugar.municipioId, lugar.id).not.toBeNull();
      expect(ponto?.coordenadas ?? null).toBeNull();
      // A posição vem de local/referencias.ts, anexada em build.
      expect(Object.keys(lugar)).not.toContain("posicao");
      expect(Object.keys(lugar.comoChegar ?? {})).not.toContain("coordenadas");
    }
  });

  test("material restrito ou em revisão nunca tem link", () => {
    for (const lugar of LUGARES_DE_CAMPO) {
      for (const material of lugar.materiais) {
        if (material.estado !== "publico") expect(material.href).toBeNull();
      }
    }
  });

  test("lugar sem município publicado declara a lacuna; com município, não", () => {
    for (const lugar of LUGARES_DE_CAMPO) {
      if (lugar.municipioId === null) {
        expect(lugar.lacunaDeLocalizacao).not.toBeNull();
      } else {
        expect(lugar.lacunaDeLocalizacao).toBeNull();
      }
    }
  });
});
