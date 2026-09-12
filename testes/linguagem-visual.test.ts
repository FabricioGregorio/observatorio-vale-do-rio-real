import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";
import { exigirDesenvolvimentoVisual } from "../src/app/dev/linguagem-visual/page";
import { PresetVisual } from "../src/componentes/prototipo/linguagem/PresetVisual";
import {
  GRAFISMOS_DA_IDENTIDADE,
  PASTA_DOS_DERIVADOS_DE_GRAFISMOS,
} from "../src/dados/grafismos/derivados";
import { DERIVADOS_DA_PESQUISA } from "../src/dados/pesquisa/derivados";
import { montarDadosDoMapa } from "../src/dados/territorio/mapa";

describe("H3.5: isolamento, procedência e conteúdo", () => {
  test("produção interrompe antes de renderizar; desenvolvimento permite", () => {
    const interromper = vi.fn((): never => {
      throw new Error("404");
    });
    expect(() =>
      exigirDesenvolvimentoVisual("production", interromper),
    ).toThrow("404");
    exigirDesenvolvimentoVisual("development", interromper);
    expect(interromper).toHaveBeenCalledOnce();
  });

  test.each(["A", "B"] as const)(
    "preset %s só projeta fatos aprovados e geometria original",
    (preset) => {
      const dados = montarDadosDoMapa();
      const html = renderToStaticMarkup(
        createElement(PresetVisual, { dados, preset }),
      );
      expect((html.match(/<path /g) ?? []).length).toBe(75);
      for (const municipio of dados.municipios)
        expect(html).toContain(municipio.caminho);
      expect(html).toContain(DERIVADOS_DA_PESQUISA[2].titulo);
      expect(html).toContain("Não informada");
      expect(html).toContain("Nenhum indicador é apresentado");
      expect(html).not.toMatch(
        /B01|A04|D01-08|primeiro-post|OBSERVATORIO_FONTES_DIR|latitud|longitud|data:image|https?:\/\//,
      );
      expect(html).not.toMatch(/carcara[^<]*avistad|lorem ipsum|<circle/);
    },
  );

  test("a pasta de grafismos contém somente o que está declarado", () => {
    expect(readdirSync(PASTA_DOS_DERIVADOS_DE_GRAFISMOS).sort()).toEqual(
      GRAFISMOS_DA_IDENTIDADE.map((grafismo) => grafismo.arquivo).sort(),
    );
  });

  /**
   * O teste lê o arquivo que está no repositório, e não o script que o gerou.
   * Quem trocar o binário à mão, regenerar com outra ferramenta ou copiar o
   * SVG original de 91 KB para `public/` falha aqui.
   */
  test.each(GRAFISMOS_DA_IDENTIDADE)(
    "$arquivo conserva hash, peso, alfa e ausência de EXIF/XMP",
    ({ arquivo, bytes: peso, sha256, largura, altura }) => {
      const bytes = readFileSync(
        join(PASTA_DOS_DERIVADOS_DE_GRAFISMOS, arquivo),
      );
      expect(bytes.subarray(0, 4).toString("latin1")).toBe("RIFF");
      expect(bytes.subarray(8, 12).toString("latin1")).toBe("WEBP");
      expect(bytes.length).toBe(peso);
      expect(bytes.length).toBeLessThan(60_000);
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(sha256);

      const chunks: string[] = [];
      let indice = 12;
      while (indice + 8 <= bytes.length) {
        chunks.push(bytes.subarray(indice, indice + 4).toString("latin1"));
        const tamanho = bytes.readUInt32LE(indice + 4);
        indice += 8 + tamanho + (tamanho % 2);
      }
      expect(chunks).not.toContain("EXIF");
      expect(chunks).not.toContain("XMP ");
      // O grafismo é recortado do fundo; sem o canal alfa ele chega como
      // retângulo branco sobre a superfície da passagem.
      expect(chunks).toContain("ALPH");

      // VP8X grava a dimensão do canvas menos um, em 24 bits little-endian.
      const vp8x = bytes.indexOf(Buffer.from("VP8X"));
      expect(vp8x).toBeGreaterThan(0);
      expect(bytes.readUIntLE(vp8x + 12, 3) + 1).toBe(largura);
      expect(bytes.readUIntLE(vp8x + 15, 3) + 1).toBe(altura);
    },
  );

  /**
   * O carcará é ilustração da identidade visual, não registro de campo.
   * Nenhum documento do projeto afirma avistamento da ave no recorte, e a
   * legenda não pode sugerir que afirme.
   */
  test("o grafismo entra como marca, decorativo e sem alegação de avistamento", () => {
    for (const grafismo of GRAFISMOS_DA_IDENTIDADE) {
      expect(grafismo.alt).toBe("");
      expect(grafismo.fonte).toBe("identidade visual do Observatório");
      expect(grafismo.legenda).not.toMatch(
        /avista|registro|fotograf|espécie|habitat|observad/i,
      );
      expect(grafismo.transformacao).toMatch(/sem recorte, recoloração/);
    }
  });
});
