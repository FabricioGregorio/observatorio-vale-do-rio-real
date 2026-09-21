import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

import {
  ARTES_PODOBSERVAR,
  LOGO_PODOBSERVAR,
} from "../src/dados/podobservar-artes";
import { metadadosDaRota } from "../src/lib/site-url";

const sha256 = (bytes: Buffer) =>
  createHash("sha256").update(bytes).digest("hex");

describe("artes oficiais do PodObservar", () => {
  test("o mapeamento liga cada capa a um único episódio", () => {
    expect(
      ARTES_PODOBSERVAR.map(({ id, slug_episodio }) => [id, slug_episodio]),
    ).toEqual([
      ["logo", null],
      ["ep01", "01-o-que-e-o-vale-do-rio-real"],
      ["ep02", "02-conheca-o-recanto-da-serra"],
      ["ep03", "03-conheca-o-museu-borda-da-mata"],
      ["ep04", "04-entre-dados-e-fatos"],
    ]);
  });

  test("todos os derivados têm dimensões e peso controlados", () => {
    for (const arte of ARTES_PODOBSERVAR) {
      expect(arte.derivado.largura).toBe(1200);
      expect(arte.derivado.altura).toBe(1200);
      expect(arte.derivado.bytes).toBeLessThan(300_000);
      expect(arte.derivado.metadados_removidos).toEqual(["EXIF", "XMP", "ICC"]);
    }
  });

  test("originais quadrados de 3000 px, exceto a capa 4:5 do EP04", () => {
    expect(
      ARTES_PODOBSERVAR.map((arte) => [
        arte.id,
        arte.original.largura,
        arte.original.altura,
      ]),
    ).toEqual([
      ["logo", 3000, 3000],
      ["ep01", 3000, 3000],
      ["ep02", 3000, 3000],
      ["ep03", 3000, 3000],
      ["ep04", 1080, 1350],
    ]);
  });

  test("a capa do EP04 é encaixada inteira, sem recorte", () => {
    const ep04 = ARTES_PODOBSERVAR.find((arte) => arte.id === "ep04");
    expect(ep04?.derivado.transformacao).toContain("arte inteira");
    expect(ep04?.derivado.transformacao).toContain("sem recorte");
    expect(ep04?.derivado.transformacao).toContain("960x1200");
    expect(ep04?.derivado.transformacao).not.toMatch(/\bcrop|recortad/i);
  });

  test("o logo local é exatamente o derivado declarado e não o original", () => {
    const logo = ARTES_PODOBSERVAR[0];
    if (!logo) throw new Error("Manifesto sem logo.");
    const bytes = readFileSync(`public${LOGO_PODOBSERVAR.src}`);
    expect(bytes.length).toBe(logo.derivado.bytes);
    expect(sha256(bytes)).toBe(logo.derivado.sha256);
    expect(bytes.length).toBeLessThan(logo.original.bytes);
    expect(bytes.includes(Buffer.from("EXIF"))).toBe(false);
    expect(bytes.includes(Buffer.from("XMP "))).toBe(false);
  });

  test("metadata aceita a arte oficial sem duplicar fonte editorial", () => {
    const metadata = metadadosDaRota({
      pathname: "/podobservar",
      titulo: "PodObservar",
      imagens: [LOGO_PODOBSERVAR.src],
    });
    expect(metadata.openGraph?.images).toEqual([LOGO_PODOBSERVAR.src]);
  });

  test("as superfícies recebem capa pela linha pública, sem mapa de slug", () => {
    for (const [caminho, acesso] of [
      ["src/componentes/home/PodObservar.tsx", "recente.capaUrl"],
      ["src/app/podobservar/page.tsx", "episodio.capaUrl"],
      [
        "src/app/podobservar/[temporada]/[episodio]/page.tsx",
        "episodio.capaUrl",
      ],
    ] as const) {
      const fonte = readFileSync(caminho, "utf8");
      expect(fonte).toContain(acesso);
      expect(fonte).not.toContain("01-o-que-e-o-vale-do-rio-real");
      expect(fonte).not.toContain("02-conheca-o-recanto-da-serra");
      expect(fonte).not.toContain("03-conheca-o-museu-borda-da-mata");
      expect(fonte).not.toContain("04-entre-dados-e-fatos");
    }
  });
});
