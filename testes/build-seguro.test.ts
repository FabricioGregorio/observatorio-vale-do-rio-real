import { readFile } from "node:fs/promises";
import { describe, expect, test } from "vitest";

import { exigirAutorizacaoPublicacaoZip } from "../scripts/gerar-zip-anexos";

describe("build sem efeitos de publicação", () => {
  test("pnpm build chama somente o compilador do Next.js", async () => {
    const pacote = JSON.parse(await readFile("package.json", "utf8")) as {
      scripts: Record<string, string>;
    };

    expect(pacote.scripts.build).toBe("next build");
    expect(pacote.scripts.build).not.toMatch(/zip|tsx|publicar|upload/i);
  });

  test("publicação do ZIP é um comando separado com flag explícita", async () => {
    const pacote = JSON.parse(await readFile("package.json", "utf8")) as {
      scripts: Record<string, string>;
    };

    expect(pacote.scripts["publicar-zip"]).toBe(
      "tsx scripts/gerar-zip-anexos.ts --publicar",
    );
  });

  test("executor recusa ausência, erro de digitação e argumentos extras", () => {
    expect(() => exigirAutorizacaoPublicacaoZip([])).toThrow(
      /publicação do ZIP não autorizada/,
    );
    expect(() => exigirAutorizacaoPublicacaoZip(["--dry-run"])).toThrow(
      /publicação do ZIP não autorizada/,
    );
    expect(() =>
      exigirAutorizacaoPublicacaoZip(["--publicar", "--outro"]),
    ).toThrow(/publicação do ZIP não autorizada/);
    expect(() => exigirAutorizacaoPublicacaoZip(["--publicar"])).not.toThrow();
  });
});
