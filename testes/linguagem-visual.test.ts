import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";
import { exigirDesenvolvimentoVisual } from "../src/app/dev/linguagem-visual/page";
import {
  DENSIDADE_VISUAL,
  GRAMATICA_DE_GRAFISMOS,
  PAPEL_DOS_PRESETS,
  PRESET_RECOMENDADO,
} from "../src/componentes/prototipo/linguagem/gramatica";
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

/** Nenhum nome de família é prefixo de outro, então contar literal basta. */
function ocorrencias(html: string, classe: string): number {
  return html.split(classe).length - 1;
}

function renderizar(preset: "A" | "B"): string {
  return renderToStaticMarkup(
    createElement(PresetVisual, { dados: montarDadosDoMapa(), preset }),
  );
}

describe("H3.5.1: gramática de grafismos e regra de frequência", () => {
  test("as quatro famílias estão declaradas, com classe e papel próprios", () => {
    expect(GRAMATICA_DE_GRAFISMOS.map((familia) => familia.id)).toEqual([
      "identidade",
      "cartografico",
      "documental",
      "transicao",
    ]);
    const classes = new Set<string>();
    for (const familia of GRAMATICA_DE_GRAFISMOS) {
      expect(familia.classe).toMatch(/^lv-g-/);
      expect(familia.papel.length).toBeGreaterThan(20);
      expect(familia.exemplos.length).toBeGreaterThan(0);
      classes.add(familia.classe);
    }
    expect(classes.size).toBe(GRAMATICA_DE_GRAFISMOS.length);
  });

  /**
   * O teto de frequência é o que separa assinatura de mascote. Sem ele, a
   * tentação de repetir a ave a cada seção volta na primeira fase seguinte, e
   * o Observatório passa a ter um personagem em vez de uma identidade.
   */
  test.each(["A", "B"] as const)(
    "preset %s respeita o teto de frequência de cada família",
    (preset) => {
      const html = renderizar(preset);
      for (const familia of GRAMATICA_DE_GRAFISMOS) {
        const vezes = ocorrencias(html, familia.classe);
        expect(vezes, `${familia.classe} não é usada`).toBeGreaterThan(0);
        if (familia.maximoEmEscalaEditorial !== null) {
          expect(vezes).toBeLessThanOrEqual(familia.maximoEmEscalaEditorial);
        }
      }
    },
  );

  /**
   * Duas passagens, e só a primeira carrega identidade. A segunda prova que a
   * continuidade entre capítulos é feita pelo sistema cartográfico, e não
   * depende do carcará.
   */
  test.each(["A", "B"] as const)(
    "preset %s liga três capítulos por duas passagens, e só a primeira assina",
    (preset) => {
      const html = renderizar(preset);
      expect(ocorrencias(html, "lv-g-transicao")).toBe(2);
      expect(html).toContain('data-passagem="campo"');
      expect(html).toContain('data-passagem="leitura"');

      const passagemDeLeitura = html.slice(
        html.indexOf('data-passagem="leitura"'),
      );
      expect(passagemDeLeitura).not.toContain("lv-g-identidade");
      expect(passagemDeLeitura).toContain("lv-cruz");
    },
  );

  test("a identidade entra decorativa, sem alt e sem interceptar ponteiro", () => {
    const html = renderizar("B");
    const assinatura = html.slice(html.indexOf("lv-g-identidade"));
    expect(assinatura).toContain('aria-hidden="true"');
    expect(assinatura.slice(0, 400)).toMatch(/alt=""/);
  });
});

describe("H3.5.1: presets e guia de densidade", () => {
  test("A continua disponível como controle, e a recomendação é o B refinado", () => {
    expect(PRESET_RECOMENDADO).toBe("B");
    expect(PAPEL_DOS_PRESETS.A).toMatch(/controle/i);
    expect(PAPEL_DOS_PRESETS.B).toMatch(/recomenda/i);

    const pagina = readFileSync(
      "src/app/dev/linguagem-visual/page.tsx",
      "utf8",
    );
    expect(pagina).toContain('value="A"');
    expect(pagina).toContain('value="B"');
    // O B refinado é o estado inicial: o laboratório abre na recomendação.
    expect(pagina).toMatch(/defaultChecked[^/]*value="B"/);
  });

  /**
   * A identidade só pode aparecer na faixa de alta densidade. Se ela vazar
   * para a faixa de leitura longa, o grafismo passa a disputar com a frase.
   */
  test("o guia de densidade reserva a identidade para a faixa alta", () => {
    expect(DENSIDADE_VISUAL.map((faixa) => faixa.nivel)).toEqual([
      "baixa",
      "media",
      "alta",
    ]);
    for (const faixa of DENSIDADE_VISUAL) {
      const permiteIdentidade = (
        faixa.grafismosPermitidos as readonly string[]
      ).includes("identidade");
      expect(permiteIdentidade).toBe(faixa.nivel === "alta");
      expect(faixa.ondeSeAplica.length).toBeGreaterThan(10);
      expect(faixa.movimento.length).toBeGreaterThan(10);
    }
  });
});

/**
 * A H4.0 foi prototipada antes desta consolidação e não pode ser tocada por
 * ela. O acoplamento é o risco real: bastaria um import atravessado para que
 * um refino de linguagem mudasse o painel de indicadores sem ninguém notar.
 */
describe("H3.5.1: isolamento entre o laboratório de linguagem e a H4.0", () => {
  const ARQUIVOS_DA_LINGUAGEM = [
    "src/app/dev/linguagem-visual/page.tsx",
    "src/componentes/prototipo/linguagem/PresetVisual.tsx",
    "src/componentes/prototipo/linguagem/RevelacaoVisual.tsx",
    "src/componentes/prototipo/linguagem/estilos.ts",
    "src/componentes/prototipo/linguagem/gramatica.ts",
  ];

  const ARQUIVOS_DA_H4 = [
    "src/app/dev/dados/page.tsx",
    "src/componentes/prototipo/dados/PainelDeDados.tsx",
    "src/componentes/prototipo/dados/RankingDeAtividades.tsx",
    "src/componentes/prototipo/dados/SerieMensal.tsx",
    "src/componentes/prototipo/dados/estilosDosDados.ts",
    "src/dados/indicadores/derivados.ts",
    "src/dados/indicadores/formato.ts",
  ];

  test.each(ARQUIVOS_DA_LINGUAGEM)("%s não importa nada da H4.0", (arquivo) => {
    const fonte = readFileSync(arquivo, "utf8");
    expect(fonte).not.toMatch(
      /from\s+"[^"]*(prototipo\/dados|dados\/indicadores)/,
    );
  });

  test.each(ARQUIVOS_DA_H4)("%s não importa nada do laboratório", (arquivo) => {
    const fonte = readFileSync(arquivo, "utf8");
    expect(fonte).not.toMatch(/from\s+"[^"]*linguagem\//);
    expect(fonte).not.toContain("lv-g-");
  });

  test("o CSS da H4.0 não lê nenhum papel da linguagem", () => {
    const css = readFileSync(
      "src/componentes/prototipo/dados/estilosDosDados.ts",
      "utf8",
    );
    expect(css).not.toMatch(/--lv-|linguagem-visual/);
  });
});
