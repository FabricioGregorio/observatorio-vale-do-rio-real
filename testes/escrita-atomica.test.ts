/**
 * Escrita do conjunto de arquivos de uma publicação.
 *
 * Roda inteiramente sobre um diretório temporário do sistema. Nada aqui toca
 * `src/dados/publicado/`, banco ou rede.
 */
import { createHash } from "node:crypto";
import { mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

import {
  escreverConjuntoAtomico,
  FalhaDeEscrita,
} from "../scripts/lib/escrita-atomica";

let destino = "";

beforeEach(async () => {
  destino = await mkdtemp(join(tmpdir(), "publicado-"));
});

afterEach(async () => {
  await rm(destino, { recursive: true, force: true });
});

const CONJUNTO = [
  { nome: "acervo.json", conteudo: '[\n  "a"\n]\n' },
  { nome: "episodios.json", conteudo: "[]\n" },
  { nome: "release.json", conteudo: '{\n  "id": "x"\n}\n' },
];

function sha(texto: string): string {
  return createHash("sha256").update(texto, "utf8").digest("hex");
}

describe("ensaio", () => {
  test("não grava nada e ainda assim calcula o plano", async () => {
    const resultado = await escreverConjuntoAtomico(destino, CONJUNTO, {
      escrever: false,
    });

    expect(resultado.escrito).toBe(false);
    expect(await readdir(destino)).toEqual([]);
    expect(resultado.arquivos.map((a) => a.nome)).toEqual([
      "acervo.json",
      "episodios.json",
      "release.json",
    ]);
    expect(resultado.arquivos[0]?.sha256).toBe(
      sha(CONJUNTO[0]?.conteudo ?? ""),
    );
    expect(resultado.arquivos[0]?.bytes).toBe(
      Buffer.byteLength(CONJUNTO[0]?.conteudo ?? "", "utf8"),
    );
  });

  test("relata que tudo mudaria quando o destino está vazio", async () => {
    const resultado = await escreverConjuntoAtomico(destino, CONJUNTO, {
      escrever: false,
    });
    expect(resultado.arquivos.every((a) => a.mudou)).toBe(true);
  });
});

describe("gravação", () => {
  test("grava o conjunto inteiro com o conteúdo exato", async () => {
    const resultado = await escreverConjuntoAtomico(destino, CONJUNTO, {
      escrever: true,
    });

    expect(resultado.escrito).toBe(true);
    for (const arquivo of CONJUNTO) {
      expect(await readFile(join(destino, arquivo.nome), "utf8")).toBe(
        arquivo.conteudo,
      );
    }
  });

  test("não deixa diretório temporário para trás", async () => {
    await escreverConjuntoAtomico(destino, CONJUNTO, { escrever: true });
    expect((await readdir(destino)).sort()).toEqual([
      "acervo.json",
      "episodios.json",
      "release.json",
    ]);
  });

  test("substitui uma publicação anterior", async () => {
    await escreverConjuntoAtomico(destino, CONJUNTO, { escrever: true });
    const novo = CONJUNTO.map((a) =>
      a.nome === "acervo.json" ? { ...a, conteudo: '[\n  "b"\n]\n' } : a,
    );
    const resultado = await escreverConjuntoAtomico(destino, novo, {
      escrever: true,
    });

    expect(await readFile(join(destino, "acervo.json"), "utf8")).toBe(
      '[\n  "b"\n]\n',
    );
    expect(
      resultado.arquivos.find((a) => a.nome === "acervo.json")?.mudou,
    ).toBe(true);
    expect(
      resultado.arquivos.find((a) => a.nome === "episodios.json")?.mudou,
    ).toBe(false);
  });

  test("regravar o mesmo conteúdo é reconhecido como sem mudança", async () => {
    await escreverConjuntoAtomico(destino, CONJUNTO, { escrever: true });
    const resultado = await escreverConjuntoAtomico(destino, CONJUNTO, {
      escrever: true,
    });
    expect(resultado.arquivos.every((a) => a.mudou)).toBe(false);
  });
});

describe("falha antes de tocar o destino", () => {
  test("conteúdo vazio aborta e preserva a publicação anterior", async () => {
    await escreverConjuntoAtomico(destino, CONJUNTO, { escrever: true });

    const quebrado = CONJUNTO.map((a) =>
      a.nome === "episodios.json" ? { ...a, conteudo: "" } : a,
    );
    await expect(
      escreverConjuntoAtomico(destino, quebrado, { escrever: true }),
    ).rejects.toThrow(FalhaDeEscrita);

    for (const arquivo of CONJUNTO) {
      expect(await readFile(join(destino, arquivo.nome), "utf8")).toBe(
        arquivo.conteudo,
      );
    }
    expect((await readdir(destino)).sort()).toEqual([
      "acervo.json",
      "episodios.json",
      "release.json",
    ]);
  });

  test("recusa nome repetido no conjunto", async () => {
    await expect(
      escreverConjuntoAtomico(
        destino,
        [CONJUNTO[0] ?? CONJUNTO[1], CONJUNTO[0] ?? CONJUNTO[1]].filter(
          (a): a is { nome: string; conteudo: string } => Boolean(a),
        ),
        { escrever: true },
      ),
    ).rejects.toThrow(/repetido/);
  });

  test.each(["../fora.json", "sub/dentro.json", ".oculto", "Acervo.json"])(
    "recusa o nome %s",
    async (nome) => {
      await expect(
        escreverConjuntoAtomico(destino, [{ nome, conteudo: "x" }], {
          escrever: true,
        }),
      ).rejects.toThrow(FalhaDeEscrita);
      expect(await readdir(destino)).toEqual([]);
    },
  );

  test("recusa conjunto vazio", async () => {
    await expect(
      escreverConjuntoAtomico(destino, [], { escrever: true }),
    ).rejects.toThrow(/vazio/);
  });
});

describe("conferência depois da gravação", () => {
  test("acusa se o destino não contiver o que foi planejado", async () => {
    await escreverConjuntoAtomico(destino, CONJUNTO, { escrever: true });

    // Simula corrupção externa entre a gravação e a leitura de conferência.
    await writeFile(join(destino, "acervo.json"), "corrompido", "utf8");
    expect(await readFile(join(destino, "acervo.json"), "utf8")).toBe(
      "corrompido",
    );

    const resultado = await escreverConjuntoAtomico(destino, CONJUNTO, {
      escrever: true,
    });
    expect(resultado.escrito).toBe(true);
    expect(await readFile(join(destino, "acervo.json"), "utf8")).toBe(
      CONJUNTO[0]?.conteudo,
    );
  });
});
