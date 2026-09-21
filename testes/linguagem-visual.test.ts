import { readFileSync } from "node:fs";
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
import { REGISTROS_DOS_PROTOTIPOS } from "../src/dados/pesquisa/derivados";
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
      expect(html).toContain(REGISTROS_DOS_PROTOTIPOS[2].titulo);
      expect(html).toContain("Não informada");
      expect(html).toContain("Nenhum indicador é apresentado");
      expect(html).not.toMatch(
        /B01|A04|D01-08|primeiro-post|OBSERVATORIO_FONTES_DIR|latitud|longitud|data:image|https?:\/\//,
      );
      expect(html).not.toMatch(/lorem ipsum|<circle/);
    },
  );
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
  test("as três famílias abstratas estão declaradas", () => {
    expect(GRAMATICA_DE_GRAFISMOS.map((familia) => familia.id)).toEqual([
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

  test.each(["A", "B"] as const)(
    "preset %s usa as famílias abstratas declaradas",
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

  test.each(["A", "B"] as const)(
    "preset %s liga três capítulos por duas passagens abstratas",
    (preset) => {
      const html = renderizar(preset);
      expect(ocorrencias(html, "lv-g-transicao")).toBe(2);
      expect(html).toContain('data-passagem="campo"');
      expect(html).toContain('data-passagem="leitura"');

      expect(html).not.toContain("lv-g-identidade");
      expect(html).toContain("lv-cruz");
    },
  );
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

  test("o guia de densidade usa somente famílias abstratas", () => {
    expect(DENSIDADE_VISUAL.map((faixa) => faixa.nivel)).toEqual([
      "baixa",
      "media",
      "alta",
    ]);
    for (const faixa of DENSIDADE_VISUAL) {
      expect(faixa.grafismosPermitidos).not.toContain("identidade");
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
