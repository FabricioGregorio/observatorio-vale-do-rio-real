import { existsSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

import { aplicar } from "../src/componentes/prototipo/territoriovivo/geometria";
import {
  estaPosicionado,
  montarBaseDoTerritorio,
} from "../src/componentes/prototipo/territoriovivo/local/composicao";
import {
  CAMINHO_DAS_COORDENADAS_CONFIRMADAS,
  carregarCoordenadasConfirmadas,
  FONTE_DA_COORDENADA,
  validarCoordenadasConfirmadas,
} from "../src/componentes/prototipo/territoriovivo/local/coordenadas";
import { carregarEntornoJacare } from "../src/componentes/prototipo/territoriovivo/local/entorno";
import { destinosDeRota } from "../src/componentes/prototipo/territoriovivo/local/rota";
import { svgDoEntornoDoLugar } from "../src/componentes/prototipo/territoriovivo/local/servico";
import { IDS_DOS_LUGARES } from "../src/componentes/prototipo/territoriovivo/lugares";
import { PONTOS_DE_VISITA_PREVISTOS } from "../src/dados/territorio/pontos";

/**
 * Coordenadas confirmadas dos lugares de campo — Tarefa 19.
 *
 * Este arquivo é versionado e **não contém coordenada**. Os valores
 * literais ficam no teste local `territorio-vivo-coordenadas.local.test.ts`,
 * fora do Git, junto do arquivo de coordenadas.
 */

const temArquivo = existsSync(CAMINHO_DAS_COORDENADAS_CONFIRMADAS);

describe("modelo das coordenadas confirmadas", () => {
  test("sem o arquivo local, nenhum lugar é posicionado", () => {
    const base = montarBaseDoTerritorio({
      coordenadas: carregarCoordenadasConfirmadas(
        join(tmpdir(), "territorio-vivo-inexistente.local.json"),
      ),
    });
    expect(base.lugares.filter(estaPosicionado)).toHaveLength(0);
  });

  test("o esquema exige a fonte humana e recusa autorização implícita", () => {
    const valido = {
      fonteDaCoordenada: FONTE_DA_COORDENADA,
      confirmadoEm: "2026-09-14",
      publicacaoPublicaAutorizada: false,
      remotoPublicoAutorizado: false,
      lugares: {},
    };
    expect(validarCoordenadasConfirmadas(valido).size).toBe(0);
    for (const invalido of [
      { ...valido, fonteDaCoordenada: "OpenStreetMap" },
      { ...valido, fonteDaCoordenada: "IBGE" },
      { ...valido, publicacaoPublicaAutorizada: true },
      { ...valido, remotoPublicoAutorizado: true },
      { ...valido, lugares: { "outro-lugar": { latitude: 0, longitude: 0 } } },
    ]) {
      expect(() => validarCoordenadasConfirmadas(invalido)).toThrow();
    }
  });

  test("pontos.ts, dado público versionado, continua sem coordenada", () => {
    for (const ponto of PONTOS_DE_VISITA_PREVISTOS) {
      expect(ponto.coordenadas).toBeNull();
    }
  });
});

describe.skipIf(!temArquivo)("com o arquivo local de coordenadas", () => {
  const bruto = temArquivo
    ? (JSON.parse(
        readFileSync(CAMINHO_DAS_COORDENADAS_CONFIRMADAS, "utf8"),
      ) as {
        lugares: Record<string, { latitude: number; longitude: number }>;
      })
    : { lugares: {} };
  const base = montarBaseDoTerritorio();
  const posicionados = base.lugares.filter(estaPosicionado);
  const porId = (id: string) => {
    const lugar = posicionados.find((l) => l.id === id);
    if (lugar === undefined) throw new Error(`Sem posição: ${id}`);
    return lugar;
  };

  test("os quatro lugares usam exatamente os valores confirmados, com a fonte humana", () => {
    expect(posicionados.map((l) => l.id).sort()).toEqual(
      [...IDS_DOS_LUGARES].sort(),
    );
    for (const lugar of posicionados) {
      const esperado = bruto.lugares[lugar.id];
      expect(Object.is(lugar.posicao.latitude, esperado?.latitude)).toBe(true);
      expect(Object.is(lugar.posicao.longitude, esperado?.longitude)).toBe(
        true,
      );
      expect(lugar.posicao.coordenadaConfirmada).toBe(true);
      expect(lugar.posicao.fonteDaCoordenada).toBe(FONTE_DA_COORDENADA);
      expect(lugar.posicao.publicacaoPublicaAutorizada).toBe(false);
    }
  });

  test("nenhuma coordenada é substituída por localidade do IBGE ou vértice do OSM", () => {
    const entorno = carregarEntornoJacare();
    const contexto = [
      ...entorno.localidades.map((l) => l.posicao),
      ...entorno.vias.flatMap((v) => v.pontos),
      ...entorno.cursosDagua.flatMap((c) => c.pontos),
    ];
    for (const lugar of posicionados) {
      const coincide = contexto.some(
        ([lon, lat]) =>
          lon === lugar.posicao.longitude && lat === lugar.posicao.latitude,
      );
      expect(coincide, lugar.id).toBe(false);
    }
  });

  test("Recanto e Borda ficam em posições distintas", () => {
    const [xr, yr] = porId("recanto-da-serra").xy;
    const [xb, yb] = porId("borda-da-mata").xy;
    expect(Math.hypot(xr - xb, yr - yb)).toBeGreaterThan(10);
  });

  test("a aproximação de cada lugar põe o pin no centro da vista", () => {
    const cx = (base.vista.x0 + base.vista.x1) / 2;
    const cy = (base.vista.y0 + base.vista.y1) / 2;
    for (const lugar of posicionados) {
      const [x, y] = aplicar(lugar.regional, lugar.xy[0], lugar.xy[1]);
      expect(x, lugar.id).toBeCloseTo(cx, 6);
      expect(y, lugar.id).toBeCloseTo(cy, 6);
    }
  });

  test("Ilha Grande não é colocada dentro do recorte do Vale", () => {
    const ilha = porId("ilha-grande");
    expect(ilha.dentroDoVale).toBe(false);
    expect(ilha.xy[0]).toBeGreaterThan(base.vista.x1);
    for (const id of [
      "recanto-da-serra",
      "borda-da-mata",
      "serra-dos-macacos",
    ]) {
      expect(porId(id).dentroDoVale, id).toBe(true);
    }
  });

  test("no mapa detalhado, pin do lugar e localidade do IBGE são elementos distintos", () => {
    const svg = svgDoEntornoDoLugar("recanto-da-serra") ?? "";
    const pin =
      /<g class="pin" data-tipo="lugar" data-pin="recanto-da-serra" data-selecionado="true" transform="translate\((-?[\d.]+) (-?[\d.]+)\)">/.exec(
        svg,
      );
    const referencia =
      /<g class="ref" data-tipo="localidade-do-lugar" data-codigo-ibge="280740200039" transform="translate\((-?[\d.]+) (-?[\d.]+)\)">/.exec(
        svg,
      );
    expect(pin).not.toBeNull();
    expect(referencia).not.toBeNull();
    const distancia = Math.hypot(
      Number(pin?.[1]) - Number(referencia?.[1]),
      Number(pin?.[2]) - Number(referencia?.[2]),
    );
    expect(distancia).toBeGreaterThan(5);
    expect(svg).not.toContain("não publicada");
    expect(svg).not.toMatch(/<script|<foreignObject|\son[a-z]+=/i);
  });

  test("rota: só destinos derivados da coordenada confirmada, em HTTPS", () => {
    for (const lugar of posicionados) {
      const destinos = destinosDeRota(lugar.posicao);
      expect(destinos.map((d) => d.servico)).toEqual([
        "OpenStreetMap",
        "Google Maps",
      ]);
      for (const d of destinos) {
        expect(d.href.startsWith("https://")).toBe(true);
        expect(d.href).toContain(String(lugar.posicao.latitude));
        expect(d.href).toContain(String(lugar.posicao.longitude));
      }
    }
  });
});
