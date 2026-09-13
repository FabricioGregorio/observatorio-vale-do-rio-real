import { describe, expect, test, vi } from "vitest";

import { exigirDesenvolvimentoDaHomeLivre } from "../src/app/dev/home-livre/page";
import {
  lerVarianteDaAbertura,
  NOME_OFICIAL_EM_PARTES,
} from "../src/componentes/prototipo/homelivre/abertura";
import {
  ENTREVISTAS,
  NOME_OFICIAL,
  PODOBSERVAR,
  REGUA_DE_MARCAS,
} from "../src/componentes/prototipo/homelivre/conteudo";

/**
 * Experimento `/dev/home-livre` — proteção da rota e limites de conteúdo.
 *
 * O experimento tem liberdade de composição, não de fato: estes testes
 * seguram as três fronteiras que ele não pode cruzar.
 */

describe("proteção da rota do experimento", () => {
  test("interrompe a renderização com 404 em produção", () => {
    const interromper = vi.fn((): never => {
      throw new Error("404 nativo");
    });

    expect(() =>
      exigirDesenvolvimentoDaHomeLivre("production", interromper),
    ).toThrow("404 nativo");
    expect(interromper).toHaveBeenCalledOnce();
  });

  test.each(["development", "test", undefined])(
    "permite o ambiente %s",
    (ambiente) => {
      const interromper = vi.fn((): never => {
        throw new Error("não deveria interromper");
      });

      exigirDesenvolvimentoDaHomeLivre(ambiente, interromper);
      expect(interromper).not.toHaveBeenCalled();
    },
  );
});

describe("variações da abertura", () => {
  test.each([
    ["a", "a"],
    ["b", "b"],
    ["b2", "b2"],
    ["c", "c"],
    ["atual", "atual"],
    [undefined, "b2"],
    ["x", "b2"],
    [["b", "c"], "b"],
  ] as const)("?hero=%s resolve para %s", (valor, esperado) => {
    expect(lerVarianteDaAbertura(valor as string | string[] | undefined)).toBe(
      esperado,
    );
  });

  test("a partição tipográfica não altera o nome oficial", () => {
    expect(NOME_OFICIAL_EM_PARTES.join(" ")).toBe(NOME_OFICIAL);
  });
});

describe("limites de conteúdo do experimento", () => {
  test("PodObservar não traz título, duração, link ou transcrição sugeridos", () => {
    expect(PODOBSERVAR.episodios).toHaveLength(PODOBSERVAR.episodiosPublicados);
    for (const episodio of PODOBSERVAR.episodios) {
      expect(episodio.titulo).toBeNull();
      expect(episodio.duracao).toBeNull();
      expect(episodio.url).toBeNull();
      expect(episodio.transcricao).toBeNull();
    }
  });

  test("a régua segue a hierarquia pedida, com Governo Federal fechando", () => {
    expect(REGUA_DE_MARCAS.map((grupo) => grupo.grupo)).toEqual([
      "projeto",
      "apoio",
      "fomento",
    ]);
    const ultimaMarca = REGUA_DE_MARCAS.at(-1)?.marcas.at(-1)?.nome ?? "";
    expect(ultimaMarca.endsWith("Governo Federal")).toBe(true);
  });

  test("nenhuma marca de terceiro é servida sem arquivo oficial versionado", () => {
    const terceiros = REGUA_DE_MARCAS.filter((g) => g.grupo !== "projeto");
    for (const grupo of terceiros) {
      for (const marca of grupo.marcas) {
        expect(marca.arquivo).toBeNull();
      }
    }
  });

  test("as entrevistas são identificadas por instituição ou lugar", () => {
    expect(ENTREVISTAS.map((e) => e.numero)).toEqual([
      "01",
      "02",
      "03",
      "04",
      "05",
      "06",
      "07",
      "08",
    ]);
  });
});
