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
    ]);
  });

  test("todos os derivados têm dimensões e peso controlados", () => {
    for (const arte of ARTES_PODOBSERVAR) {
      expect(arte.original.largura).toBe(3000);
      expect(arte.original.altura).toBe(3000);
      expect(arte.derivado.largura).toBe(1200);
      expect(arte.derivado.altura).toBe(1200);
      expect(arte.derivado.bytes).toBeLessThan(300_000);
      expect(arte.derivado.metadados_removidos).toEqual(["EXIF", "XMP", "ICC"]);
    }
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
    }
  });
});
