import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

import {
  aplicar,
  caixaDoCaminho,
  caminhoRelativo,
  compor,
  expandir,
  kmPorUnidade,
  unirCaixas,
} from "../src/componentes/prototipo/territoriovivo/geometria";
import {
  CAMINHO_DO_ENTORNO_JACARE,
  CODIGO_DA_LOCALIDADE_JACARE,
  CODIGO_DA_SEDE_TOBIAS_BARRETO,
  carregarEntornoJacare,
  ENQUADRAMENTO_DO_ENTORNO_JACARE,
  nomePodeEntrarNoEntorno,
  validarEntornoLocal,
} from "../src/componentes/prototipo/territoriovivo/local/entorno";
import { ENTORNOS } from "../src/componentes/prototipo/territoriovivo/local/entornos";
import { PROCEDENCIA_DO_ENTORNO } from "../src/componentes/prototipo/territoriovivo/local/procedencia";
import { LUGARES_DE_CAMPO } from "../src/componentes/prototipo/territoriovivo/lugares";
import { montarDadosDoMapa } from "../src/dados/territorio/mapa";
import { PONTOS_DE_VISITA_PREVISTOS } from "../src/dados/territorio/pontos";
import { carregarMalhaMunicipal } from "../src/dados/territorio/validacao";

/**
 * Laboratório territorial — camada geográfica local (Tarefas 18 e 19).
 */

describe("geometria da transição de escala", () => {
  test("caminho relativo reconstrói as posições arredondadas, sem erro acumulado", () => {
    const pontos = [
      [10.04, 20.06],
      [10.16, 19.94],
      [13.333, 21.777],
      [13.34, 21.78],
    ] as const;
    const d = caminhoRelativo(pontos);
    const numeros = d.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
    let x = numeros[0] ?? 0;
    let y = numeros[1] ?? 0;
    const reconstruido = [[x, y]];
    for (let i = 2; i + 1 < numeros.length; i += 2) {
      x = Math.round((x + (numeros[i] ?? 0)) * 10) / 10;
      y = Math.round((y + (numeros[i + 1] ?? 0)) * 10) / 10;
      reconstruido.push([x, y]);
    }
    expect(reconstruido).toEqual([
      [10, 20.1],
      [10.2, 19.9],
      [13.3, 21.8],
    ]);
  });

  test("compor leva o conteúdo de um enquadramento para outro", () => {
    const origem = { s: 4.4, tx: -120, ty: -2800 };
    const destino = { s: 2, tx: -40, ty: -900 };
    const t = compor(destino, origem);
    const [ox, oy] = aplicar(origem, 90, 700);
    const [cx, cy] = aplicar(t, ox, oy);
    const [dx, dy] = aplicar(destino, 90, 700);
    expect(cx).toBeCloseTo(dx);
    expect(cy).toBeCloseTo(dy);
    const identidade = compor(origem, origem);
    expect(identidade.s).toBeCloseTo(1);
    expect(identidade.tx).toBeCloseTo(0);
  });

  test("o enquadramento local tem a proporção da vista do Vale", () => {
    const dados = montarDadosDoMapa();
    const vista = expandir(
      unirCaixas(
        dados.municipios
          .filter((m) => m.relacoesTerritoriais.includes("vale-rio-real"))
          .map((m) => caixaDoCaminho(m.caminho)),
      ),
      0.08,
    );
    const e = ENQUADRAMENTO_DO_ENTORNO_JACARE;
    const lat = ((e.latMin + e.latMax) / 2) * (Math.PI / 180);
    const proporcaoLocal =
      ((e.lonMax - e.lonMin) * Math.cos(lat)) / (e.latMax - e.latMin);
    const proporcaoVale = (vista.x1 - vista.x0) / (vista.y1 - vista.y0);
    expect(Math.abs(proporcaoLocal / proporcaoVale - 1)).toBeLessThan(0.05);
    const kmLocal = (e.latMax - e.latMin) * 110.57;
    const kmVale = (vista.y1 - vista.y0) * kmPorUnidade(dados.projecao);
    expect(kmVale / kmLocal).toBeGreaterThan(3);
  });
});

describe("dado geográfico local de Jacaré", () => {
  const entorno = carregarEntornoJacare();

  test("valida, e o validador recusa enquadramento trocado", () => {
    expect(entorno.localidades.length).toBeGreaterThan(2);
    expect(entorno.vias.some((v) => v.classe === "rodovia")).toBe(true);
    expect(() =>
      validarEntornoLocal({
        ...entorno,
        enquadramento: { ...entorno.enquadramento, lonMin: -38.5 },
      }),
    ).toThrow(/enquadramento/);
  });

  test("cada camada declara a própria fonte dentro do arquivo", () => {
    expect(entorno.fontes.localidades).toMatch(/IBGE/);
    expect(entorno.fontes.vias).toMatch(/OpenStreetMap.*ODbL/);
    expect(entorno.fontes.cursosDagua).toMatch(/OpenStreetMap.*ODbL/);
  });

  test("sede e Jacaré caem dentro da malha oficial de Tobias Barreto", () => {
    const tobias = carregarMalhaMunicipal().features.find(
      (f) => f.properties.codarea === CODIGO_DA_SEDE_TOBIAS_BARRETO,
    );
    expect(tobias).toBeDefined();
    const poligonos =
      tobias?.geometry.type === "Polygon"
        ? [tobias.geometry.coordinates]
        : (tobias?.geometry.coordinates ?? []);
    const noAnel = (
      [x, y]: readonly [number, number],
      anel: readonly (readonly [number, number])[],
    ) => {
      let dentro = false;
      for (let i = 0, j = anel.length - 1; i < anel.length; j = i++) {
        const [xi, yi] = anel[i] as readonly [number, number];
        const [xj, yj] = anel[j] as readonly [number, number];
        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
          dentro = !dentro;
        }
      }
      return dentro;
    };
    for (const codigo of [
      CODIGO_DA_SEDE_TOBIAS_BARRETO,
      CODIGO_DA_LOCALIDADE_JACARE,
    ]) {
      const l = entorno.localidades.find((x) => x.codigoIbge === codigo);
      expect(l).toBeDefined();
      const p = l?.posicao ?? [0, 0];
      expect(poligonos.some((pol) => pol[0] && noAnel(p, pol[0]))).toBe(true);
    }
  });

  test("nenhum nome geográfico compartilha radical com lugar de campo, salvo Jacaré", () => {
    for (const ponto of PONTOS_DE_VISITA_PREVISTOS) {
      expect(nomePodeEntrarNoEntorno(ponto.nome)).toBe(false);
    }
    for (const l of entorno.localidades) {
      expect(nomePodeEntrarNoEntorno(l.nome, l.codigoIbge)).toBe(true);
    }
    for (const c of entorno.cursosDagua) {
      expect(nomePodeEntrarNoEntorno(c.nome)).toBe(true);
    }
  });

  test("vias não carregam nome, só código e revestimento", () => {
    for (const via of entorno.vias) {
      expect(Object.keys(via).sort()).toEqual(
        ["classe", "pavimentada", "pontos", "ref"].sort(),
      );
    }
  });
});

describe("procedência da camada local", () => {
  test("toda fonte tem origem, data, licença, atribuição, área e método", () => {
    expect(PROCEDENCIA_DO_ENTORNO.length).toBeGreaterThanOrEqual(3);
    for (const fonte of PROCEDENCIA_DO_ENTORNO) {
      expect(fonte.origem, fonte.arquivo).not.toBeNull();
      expect(fonte.obtidoEm, fonte.arquivo).toMatch(/^\d{4}-\d{2}-\d{2}/);
      expect(fonte.licenca, fonte.arquivo).not.toBeNull();
      expect(fonte.atribuicao, fonte.arquivo).not.toBeNull();
      expect(fonte.area.length, fonte.arquivo).toBeGreaterThan(0);
      expect(fonte.metodo.length, fonte.arquivo).toBeGreaterThan(0);
      expect(fonte.sha256DoArquivo, fonte.arquivo).toMatch(/^[0-9a-f]{64}$/);
    }
  });

  /*
    O hash é conferido sobre o conteúdo com fim de linha LF. O repositório não
    tem `.gitattributes` e roda com `core.autocrlf=true` em Windows: sem a
    normalização, um checkout em CRLF quebraria a conferência sem que o dado
    tivesse mudado.
  */
  test("cada derivado versionado confere com o SHA-256 e o tamanho registrados", () => {
    const derivados = PROCEDENCIA_DO_ENTORNO.filter(
      (f) => f.papel === "derivado",
    );
    expect(derivados.map((d) => d.lugar).sort()).toEqual(
      ENTORNOS.map((e) => e.lugar).sort(),
    );
    for (const derivado of derivados) {
      const definicao = ENTORNOS.find((e) => e.lugar === derivado.lugar);
      expect(definicao, derivado.arquivo).toBeDefined();
      const conteudo = readFileSync(definicao?.caminho ?? "", "utf8").replace(
        /\r\n/g,
        "\n",
      );
      expect(
        createHash("sha256").update(conteudo).digest("hex"),
        derivado.arquivo,
      ).toBe(derivado.sha256DoArquivo);
      expect(Buffer.byteLength(conteudo), derivado.arquivo).toBe(
        derivado.bytes,
      );
    }
    expect(CAMINHO_DO_ENTORNO_JACARE).toContain("entorno-jacare.json");
  });
});

describe("entornos dos lugares", () => {
  test("localidade IBGE do lugar: nome igual à localidade confirmada, só quando há correspondente seguro", () => {
    const entornoJacare = carregarEntornoJacare();
    const esperado: Record<string, string | null> = {
      "recanto-da-serra": CODIGO_DA_LOCALIDADE_JACARE,
      "borda-da-mata": "280740200023",
      "serra-dos-macacos": null,
      "ilha-grande": null,
    };
    for (const lugar of LUGARES_DE_CAMPO) {
      expect(lugar.camadaLocal, lugar.id).not.toBeNull();
      expect(lugar.camadaLocal?.localidadeIbge ?? null, lugar.id).toBe(
        esperado[lugar.id],
      );
    }
    const jacare = entornoJacare.localidades.find(
      (l) => l.codigoIbge === CODIGO_DA_LOCALIDADE_JACARE,
    );
    expect(
      LUGARES_DE_CAMPO.find((l) => l.id === "recanto-da-serra")?.localidade
        ?.texto,
    ).toContain(jacare?.nome ?? "∅");
  });

  test("os quatro entornos são versionáveis, fora de qualquer caminho .local", () => {
    expect(ENTORNOS.map((e) => e.lugar)).toEqual([
      "recanto-da-serra",
      "borda-da-mata",
      "serra-dos-macacos",
      "ilha-grande",
    ]);
    for (const definicao of ENTORNOS) {
      expect(definicao.versionavel, definicao.id).toBe(true);
      expect(definicao.caminho, definicao.id).not.toMatch(/\.local\./);
    }
  });
});
