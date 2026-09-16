import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

import {
  BYTES_TOTAIS_DA_PESQUISA,
  DERIVADOS_DA_PESQUISA,
  DERIVADOS_DOS_LUGARES,
  PASTA_DOS_DERIVADOS_DA_PESQUISA,
} from "../src/dados/pesquisa/derivados";

const PASTA = join(process.cwd(), PASTA_DOS_DERIVADOS_DA_PESQUISA);

function chunksDoWebp(bytes: Buffer): string[] {
  expect(bytes.subarray(0, 4).toString("latin1")).toBe("RIFF");
  expect(bytes.subarray(8, 12).toString("latin1")).toBe("WEBP");

  const nomes: string[] = [];
  let indice = 12;
  while (indice + 8 <= bytes.length) {
    const nome = bytes.subarray(indice, indice + 4).toString("latin1");
    const tamanho = bytes.readUInt32LE(indice + 4);
    nomes.push(nome);
    indice += 8 + tamanho + (tamanho % 2);
  }
  return nomes;
}

describe("derivados seguros da Pesquisa em Campo", () => {
  test("a pasta pública contém somente derivados declarados", () => {
    const declarados = [
      ...DERIVADOS_DA_PESQUISA.map((d) => d.arquivo),
      ...DERIVADOS_DOS_LUGARES.map((d) => d.arquivo),
    ].sort();
    expect(readdirSync(PASTA).sort()).toEqual(declarados);
  });

  test.each(DERIVADOS_DA_PESQUISA)(
    "$arquivo conserva hash, peso e orçamento",
    ({ arquivo, bytes: peso, sha256 }) => {
      const caminho = join(PASTA, arquivo);
      expect(statSync(caminho).isFile()).toBe(true);
      const bytes = readFileSync(caminho);
      expect(bytes.length).toBe(peso);
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(sha256);
      expect(bytes.length).toBeLessThan(200_000);
    },
  );

  test.each(DERIVADOS_DA_PESQUISA)(
    "$arquivo não carrega EXIF, XMP, GPS ou vestígio de dispositivo",
    ({ arquivo }) => {
      const bytes = readFileSync(join(PASTA, arquivo));
      const chunks = chunksDoWebp(bytes);
      expect(chunks).not.toContain("EXIF");
      expect(chunks).not.toContain("XMP ");
      expect(bytes.toString("latin1")).not.toMatch(
        /GPS|Exif|xmpmeta|Samsung|Galaxy|2026:04:/i,
      );
    },
  );

  test("o conjunto mantém orçamento abaixo de 250 kB", () => {
    expect(BYTES_TOTAIS_DA_PESQUISA).toBe(242_766);
    expect(BYTES_TOTAIS_DA_PESQUISA).toBeLessThan(250_000);
  });

  test.each(DERIVADOS_DOS_LUGARES)(
    "$arquivo das fichas conserva hash e peso declarados",
    ({ arquivo, bytes: peso, sha256 }) => {
      const bytes = readFileSync(join(PASTA, arquivo));
      expect(bytes.length).toBe(peso);
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(sha256);
    },
  );

  /**
   * As fotografias das fichas entram com `loading="lazy"`, abaixo da dobra, e
   * por isso não dividem o orçamento dos derivados da abertura. O que elas
   * compartilham é o contrato de privacidade: nenhum metadado sobrevive.
   */
  test.each(DERIVADOS_DOS_LUGARES)(
    "$arquivo das fichas não carrega EXIF, XMP, GPS ou vestígio de dispositivo",
    ({ arquivo }) => {
      const bytes = readFileSync(join(PASTA, arquivo));
      const chunks = chunksDoWebp(bytes);
      expect(chunks).not.toContain("EXIF");
      expect(chunks).not.toContain("XMP ");
      expect(bytes.toString("latin1")).not.toMatch(
        /GPS|Exif|xmpmeta|Samsung|Galaxy|2026:04:/i,
      );
    },
  );

  test("cada fotografia de ficha declara alt e lugar", () => {
    for (const derivado of DERIVADOS_DOS_LUGARES) {
      expect(derivado.alt.length, derivado.arquivo).toBeGreaterThan(10);
      expect(derivado.local, derivado.arquivo).toMatch(
        /^(Recanto da Serra|Borda da Mata)$/,
      );
    }
  });

  test("há exatamente uma fotografia principal por ficha", () => {
    for (const local of ["Recanto da Serra", "Borda da Mata"]) {
      const principais = DERIVADOS_DOS_LUGARES.filter(
        (d) => d.local === local && d.principal,
      );
      expect(principais, local).toHaveLength(1);
    }
  });

  test("nenhum original ou formato privado entrou na pasta pública", () => {
    for (const arquivo of readdirSync(PASTA)) {
      expect(arquivo).toMatch(/\.webp$/);
      expect(arquivo).not.toMatch(/\.heic|\.jpe?g|\.png$/i);
    }
  });
});
