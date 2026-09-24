import { readFile } from "node:fs/promises";
import { describe, expect, test } from "vitest";

import { exigirAutorizacaoPublicacaoZip } from "../src/lib/zip-anexos";

describe("build sem efeitos de publicação", () => {
  test("pnpm build chama somente o compilador do Next.js", async () => {
    const pacote = JSON.parse(await readFile("package.json", "utf8")) as {
      scripts: Record<string, string>;
    };

    expect(pacote.scripts.build).toBe("next build");
    expect(pacote.scripts.build).not.toMatch(/zip|tsx|publicar|upload/i);
  });

  test("nenhum comando do pacote publica nada por conta própria", async () => {
    const pacote = JSON.parse(await readFile("package.json", "utf8")) as {
      scripts: Record<string, string>;
    };

    /*
      O empacotador do ZIP montava o pacote a partir das evidências do banco e
      foi removido com ele; o do Lote C seleciona pelo catálogo canônico de
      `acervo.json`. Enquanto ele não existe, nenhum comando do pacote pode
      parecer um publicador — um comando que só quebra é pior que comando
      nenhum.
    */
    for (const [nome, comando] of Object.entries(pacote.scripts)) {
      expect(nome, nome).not.toMatch(/^publicar/);
      expect(comando, nome).not.toMatch(/--publicar/);
    }
  });

  test("a autorização recusa ausência, erro de digitação e argumentos extras", () => {
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
