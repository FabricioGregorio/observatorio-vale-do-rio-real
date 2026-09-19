import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

import {
  DERIVADOS_DO_HERO,
  PASTA_DOS_DERIVADOS,
  SIMBOLO_OBSERVATORIO,
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

test("o símbolo de apoio conserva o derivado conferido e seu orçamento", () => {
  const simbolo = SIMBOLO_OBSERVATORIO;
  const bytes = readFileSync(join("public/media/logos", simbolo.arquivo));
  expect(createHash("sha256").update(bytes).digest("hex")).toBe(simbolo.sha256);
  expect(bytes.length).toBe(simbolo.bytes);
  expect(bytes.length).toBeLessThan(15_000);
  expect(bytes.readUInt32BE(16)).toBe(simbolo.largura);
  expect(bytes.readUInt32BE(20)).toBe(simbolo.altura);
});

describe("derivados do Hero", () => {
  test.each(DERIVADOS_DO_HERO)("$arquivo existe", ({ arquivo }) => {
    expect(statSync(join(PASTA, arquivo)).isFile()).toBe(true);
  });

  test.each(DERIVADOS_DO_HERO)(
    "$arquivo conserva o hash declarado",
    ({ arquivo, sha256 }) => {
      const bytes = readFileSync(join(PASTA, arquivo));
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(sha256);
    },
  );

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
      expect(bytes.subarray(4, 12).toString("latin1")).toContain("ftyp");
      expect(bytes.toString("latin1")).not.toContain("Exif");
      expect(bytes.toString("latin1")).not.toContain("xmpmeta");
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
    /*
      Qualquer mídia, não só a extensão do formato atual: a regra é que a
      pasta contenha exatamente os derivados declarados. Filtrar pelo formato
      corrente faria a troca de codec deixar o formato anterior para trás sem
      que ninguém notasse — foi o que quase aconteceu na passagem para AVIF.
    */
    const naPasta = readdirSync(PASTA)
      .filter((n) => /\.(avif|webp|png|jpe?g)$/i.test(n))
      .sort();
    const declarados = DERIVADOS_DO_HERO.map((d) => d.arquivo).sort();
    expect(naPasta).toEqual(declarados);
  });
});
