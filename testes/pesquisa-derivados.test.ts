import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

import {
  DERIVADOS_DOS_LUGARES,
  exibirDataDaFotografia,
  FOTOGRAFIAS_DA_HOME,
  fotografiasDaHome,
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
    const declarados = DERIVADOS_DOS_LUGARES.map((d) => d.arquivo).sort();
    expect(readdirSync(PASTA).sort()).toEqual(declarados);
  });

  /* Os três derivados da H3 foram removidos em 2026-09-21. */
  test("os derivados antigos da H3 não voltam", () => {
    const pasta = readdirSync(PASTA);
    for (const antigo of [
      "ilha-grande-chegada-barco-410.webp",
      "ilha-grande-forno-lenha-412.webp",
      "ilha-grande-igrejinha-1280.webp",
    ])
      expect(pasta).not.toContain(antigo);
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
        /^(Recanto da Serra|Borda da Mata|Serra dos Macacos|Ilha Grande)$/,
      );
    }
  });

  test("há exatamente uma fotografia principal por ficha", () => {
    for (const local of [
      "Recanto da Serra",
      "Borda da Mata",
      "Serra dos Macacos",
      "Ilha Grande",
    ]) {
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

describe("data das fotografias", () => {
  const doLugar = (lugar: string) =>
    DERIVADOS_DOS_LUGARES.filter((f) => f.lugar === lugar);

  test("todas as de Ilha Grande são de 11/04/2026", () => {
    const ilha = doLugar("ilha-grande");
    expect(ilha.length).toBeGreaterThanOrEqual(8);
    for (const foto of ilha) {
      expect(foto.data, foto.arquivo).toBe("2026-04-11");
      expect(exibirDataDaFotografia(foto.data)).toBe("11/04/2026");
    }
  });

  /*
    A data da Serra vem do EXIF do original e só vale quando coincide com uma
    visita registrada. Nenhuma outra data é aceitável.
  */
  test("as da Serra dos Macacos têm a data de uma das duas visitas", () => {
    const serra = doLugar("serra-dos-macacos");
    expect(serra).toHaveLength(8);
    for (const foto of serra) {
      expect(["2025-08-02", "2026-04-05"], foto.arquivo).toContain(foto.data);
    }
  });

  test("sem data na fonte, a formatação diz que não há data", () => {
    expect(exibirDataDaFotografia(null)).toBe("data não informada");
  });
});

describe("fotografias da Home", () => {
  test.each(Object.keys(FOTOGRAFIAS_DA_HOME))(
    "%s tem três fotografias distintas, do próprio lugar e com título",
    (lugar) => {
      const fotos = fotografiasDaHome(
        lugar as keyof typeof FOTOGRAFIAS_DA_HOME,
      );
      expect(fotos).toHaveLength(3);
      expect(new Set(fotos.map((f) => f.sha256)).size).toBe(3);
      expect(new Set(fotos.map((f) => f.titulo)).size).toBe(3);
      for (const foto of fotos) {
        expect(foto.lugar).toBe(lugar);
        expect(foto.data).not.toBeNull();
        expect(foto.alt).not.toMatch(/\.webp|imagem de|foto de/i);
        expect(statSync(join(PASTA, foto.arquivo)).isFile()).toBe(true);
      }
    },
  );
});
