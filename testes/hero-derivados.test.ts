import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

import {
  DERIVADOS_DO_HERO,
  PASTA_DOS_DERIVADOS,
} from "../src/dados/hero/derivados";

/**
 * Derivados do Hero — Fase H1.
 *
 * A fotografia original carrega **GPS**, marca e modelo do aparelho, versão de
 * firmware, data, hora, miniatura embutida e um bloco XMP. Nada disso pode
 * chegar ao site: `public/` é conteúdo publicado, e metadado de origem não é
 * conteúdo — é vazamento.
 *
 * Estes testes leem os arquivos que estão de fato no repositório. Eles não
 * confiam no script que os gerou: quem trocar um derivado à mão, regenerar com
 * outra ferramenta ou copiar o original por engano falha aqui.
 */

const PASTA = join(process.cwd(), PASTA_DOS_DERIVADOS);

/** Lê os "chunks" de um contêiner RIFF/WebP. */
function chunksDoWebp(bytes: Buffer): { nome: string; tamanho: number }[] {
  expect(bytes.subarray(0, 4).toString("latin1")).toBe("RIFF");
  expect(bytes.subarray(8, 12).toString("latin1")).toBe("WEBP");

  const chunks: { nome: string; tamanho: number }[] = [];
  let i = 12;
  while (i + 8 <= bytes.length) {
    const nome = bytes.subarray(i, i + 4).toString("latin1");
    const tamanho = bytes.readUInt32LE(i + 4);
    chunks.push({ nome, tamanho });
    i += 8 + tamanho + (tamanho % 2);
  }
  return chunks;
}

describe("derivados do Hero", () => {
  test.each(DERIVADOS_DO_HERO)("$arquivo existe", ({ arquivo }) => {
    expect(statSync(join(PASTA, arquivo)).isFile()).toBe(true);
  });

  /**
   * O original tem 6,86 MB. Ele mora no corpus, fora do repositório, e é o
   * `.gitignore` do bom senso que o mantém lá: nenhum arquivo em `public/`
   * pode ter esse tamanho.
   */
  test("o original de 6,86 MB não foi copiado para o repositório", () => {
    for (const nome of readdirSync(PASTA)) {
      const caminho = join(PASTA, nome);
      if (!statSync(caminho).isFile()) continue;
      expect(statSync(caminho).size).toBeLessThan(1_000_000);
      expect(nome).not.toBe("home.jpg");
    }
  });

  test.each(DERIVADOS_DO_HERO)(
    "$arquivo não carrega EXIF nem XMP",
    ({ arquivo }) => {
      const bytes = readFileSync(join(PASTA, arquivo));
      const nomes = chunksDoWebp(bytes).map((c) => c.nome);

      expect(nomes).not.toContain("EXIF");
      expect(nomes).not.toContain("XMP ");
    },
  );

  /**
   * A varredura textual pega o caso que a leitura de chunk não pegaria: um
   * derivado gerado por outra ferramenta que embuta metadado fora do lugar
   * previsto pelo formato.
   */
  test.each(DERIVADOS_DO_HERO)(
    "$arquivo não guarda vestígio do aparelho, da data nem de GPS",
    ({ arquivo }) => {
      const bytes = readFileSync(join(PASTA, arquivo));
      const texto = bytes.toString("latin1");

      for (const vestigio of [
        "Exif",
        "GPS",
        "samsung",
        "Galaxy",
        "xmpmeta",
        "2026:04:05",
      ]) {
        expect(texto).not.toContain(vestigio);
      }
    },
  );

  /**
   * O único metadado tolerado é o perfil de cor, e ele é tolerado porque não
   * identifica nada: é um sRGB mínimo, sem fabricante e sem nome de
   * dispositivo. Sem ele a fotografia mudaria de cor entre navegadores.
   */
  test.each(DERIVADOS_DO_HERO)(
    "$arquivo carrega no máximo um perfil de cor pequeno",
    ({ arquivo }) => {
      const bytes = readFileSync(join(PASTA, arquivo));
      const icc = chunksDoWebp(bytes).filter((c) => c.nome === "ICCP");

      expect(icc.length).toBeLessThanOrEqual(1);
      for (const c of icc) expect(c.tamanho).toBeLessThan(2000);
    },
  );

  /**
   * O teto não é estético: a Home tem orçamento de 500 kB (doc 01 §7). Estes
   * derivados são de **protótipo** e já ocupam boa parte dele — o que está
   * registrado como bloqueio na H1. O teto impede que a situação piore sem
   * ninguém perceber.
   */
  test.each(DERIVADOS_DO_HERO)(
    "$arquivo cabe no teto declarado",
    ({ arquivo, tetoBytes }) => {
      expect(statSync(join(PASTA, arquivo)).size).toBeLessThanOrEqual(
        tetoBytes,
      );
    },
  );

  test("nenhum derivado listado ficou de fora da pasta, e vice-versa", () => {
    const naPasta = readdirSync(PASTA)
      .filter((n) => n.endsWith(".webp"))
      .sort();
    const declarados = DERIVADOS_DO_HERO.map((d) => d.arquivo).sort();
    expect(naPasta).toEqual(declarados);
  });
});
