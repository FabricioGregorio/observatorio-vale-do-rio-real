import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

import {
  aplicar,
  projetarContinuo,
} from "../src/componentes/prototipo/territoriovivo/geometria";
import {
  estaPosicionado,
  montarBaseDoTerritorio,
} from "../src/componentes/prototipo/territoriovivo/local/composicao";
import { carregarEntorno } from "../src/componentes/prototipo/territoriovivo/local/entorno";
import { ENTORNOS } from "../src/componentes/prototipo/territoriovivo/local/entornos";
import {
  FONTE_DA_COORDENADA,
  FONTE_DA_REFERENCIA_CARTOGRAFICA,
  REFERENCIAS_TERRITORIAIS,
  referenciaDe,
} from "../src/componentes/prototipo/territoriovivo/local/referencias";
import { destinosDeRota } from "../src/componentes/prototipo/territoriovivo/local/rota";
import { svgDoEntornoDoLugar } from "../src/componentes/prototipo/territoriovivo/local/servico";
import { LUGARES_SEM_PUBLICACAO } from "../src/componentes/prototipo/territoriovivo/lugares";
import { montarDadosDoMapa } from "../src/dados/territorio/mapa";
import { PONTOS_DE_VISITA_PREVISTOS } from "../src/dados/territorio/pontos";

/**
 * Referências territoriais públicas dos lugares de campo — Tarefa 20.
 *
 * Coordenadas confirmadas pelo responsável e com publicação autorizada em
 * 2026-09-14. Os valores esperados estão escritos aqui de propósito: o teste
 * prova que o modelo usa exatamente esses números.
 */

const ESPERADO = {
  "recanto-da-serra": {
    latitude: -11.015393101706083,
    longitude: -38.048667603935414,
    municipio: "Tobias Barreto",
    municipioIbge: "2807402",
    localidade: "Povoado Jacaré",
  },
  "borda-da-mata": {
    latitude: -11.127754407274919,
    longitude: -37.88642982557546,
    municipio: "Tobias Barreto",
    municipioIbge: "2807402",
    localidade: "Povoado Borda da Mata",
  },
  "serra-dos-macacos": {
    latitude: -10.8811,
    longitude: -37.9867,
    municipio: "Tobias Barreto",
    municipioIbge: "2807402",
    localidade: "Comunidade próxima à Vila de Samambaia",
  },
  "ilha-grande": {
    latitude: -11.0639,
    longitude: -37.2086,
    municipio: "São Cristóvão",
    municipioIbge: "2806701",
    localidade: "Povoado Ilha Grande",
  },
} as const;

const base = montarBaseDoTerritorio();
const posicionados = base.lugares.filter(estaPosicionado);
const porId = (id: string) => {
  const lugar = posicionados.find((l) => l.id === id);
  if (lugar === undefined) throw new Error(`Sem posição: ${id}`);
  return lugar;
};

describe("dados territoriais públicos", () => {
  test("os quatro lugares usam exatamente as coordenadas confirmadas", () => {
    expect(REFERENCIAS_TERRITORIAIS.map((r) => r.id)).toEqual(
      Object.keys(ESPERADO),
    );
    for (const [id, esperado] of Object.entries(ESPERADO)) {
      const referencia = referenciaDe(id as keyof typeof ESPERADO);
      expect(Object.is(referencia.latitude, esperado.latitude), id).toBe(true);
      expect(Object.is(referencia.longitude, esperado.longitude), id).toBe(
        true,
      );
      const lugar = porId(id);
      expect(Object.is(lugar.posicao.latitude, esperado.latitude), id).toBe(
        true,
      );
      expect(Object.is(lugar.posicao.longitude, esperado.longitude), id).toBe(
        true,
      );
    }
  });

  test("fonte humana, coordenada confirmada e publicação autorizada", () => {
    expect(FONTE_DA_COORDENADA).toBe(
      "confirmação humana direta do responsável — 2026-09-14",
    );
    for (const r of REFERENCIAS_TERRITORIAIS) {
      expect(r.coordenadaConfirmada, r.id).toBe(true);
      expect(r.publicacaoPublicaAutorizada, r.id).toBe(true);
      expect(r.fonteDaCoordenada, r.id).toBe(FONTE_DA_COORDENADA);
      expect(r.fonteDaCoordenada, r.id).not.toMatch(/IBGE|OpenStreetMap|OSM/);
      expect(r.autorizadoEm, r.id).toBe("2026-09-14");
    }
  });

  test("município e localidade corretos, e iguais na ficha", () => {
    const nomes = new Map(
      montarDadosDoMapa().municipios.map((m) => [m.codigoIbge, m.nome]),
    );
    for (const [id, esperado] of Object.entries(ESPERADO)) {
      const r = referenciaDe(id as keyof typeof ESPERADO);
      expect(r.municipio, id).toBe(esperado.municipio);
      expect(r.municipioIbge, id).toBe(esperado.municipioIbge);
      expect(nomes.get(r.municipioIbge), id).toBe(esperado.municipio);
      expect(r.localidade, id).toBe(esperado.localidade);
      const lugar = LUGARES_SEM_PUBLICACAO.find((l) => l.id === id);
      expect(lugar?.municipioId, id).toBe(esperado.municipioIbge);
      expect(lugar?.localidade?.texto, id).toBe(esperado.localidade);
      expect(lugar?.lacunaDeLocalizacao ?? null, id).toBeNull();
    }
  });

  test("a Serra dos Macacos traz a referência territorial autorizada", () => {
    const serra = LUGARES_SEM_PUBLICACAO.find(
      (l) => l.id === "serra-dos-macacos",
    );
    expect(serra?.comoChegar?.referencia?.texto).toContain(
      "divisa com os municípios de Simão Dias e Poço Verde",
    );
    expect(serra?.comoChegar?.referencia?.fonte).toBe(FONTE_DA_COORDENADA);
  });

  test("a Vila Samambaia é referência cartográfica, não o lugar visitado", () => {
    const serra = referenciaDe("serra-dos-macacos");
    expect(serra.localidade).toBe("Comunidade próxima à Vila de Samambaia");
    expect(serra.localidadeIbge).toBeNull();
    expect(serra.referenciaCartografica).toEqual({
      nome: "Vila Samambaia",
      rotulo: "Vila Samambaia · IBGE",
      codigoIbge: "280740210",
      fonte: FONTE_DA_REFERENCIA_CARTOGRAFICA,
    });
  });

  test("os valores vivem numa fonte só dentro do laboratório", () => {
    const raiz = "src/componentes/prototipo/territoriovivo";
    const arquivos = readdirSync(raiz, { recursive: true })
      .map(String)
      .map((relativo) => join(raiz, relativo))
      .filter((c) => statSync(c).isFile() && /\.(tsx?)$/.test(c));
    for (const esperado of Object.values(ESPERADO)) {
      const comValor = arquivos.filter((c) =>
        readFileSync(c, "utf8").includes(String(esperado.latitude)),
      );
      expect(comValor.map((c) => c.replaceAll("\\", "/"))).toEqual([
        `${raiz}/local/referencias.ts`,
      ]);
    }
  });

  test("pontos.ts, dado da Home, não foi alterado por esta decisão", () => {
    for (const ponto of PONTOS_DE_VISITA_PREVISTOS) {
      expect(ponto.coordenadas).toBeNull();
    }
  });

  test("sem referências, nenhum pin (o laboratório não inventa posição)", () => {
    const vazia = montarBaseDoTerritorio({ coordenadas: new Map() });
    expect(vazia.lugares.filter(estaPosicionado)).toHaveLength(0);
  });
});

describe("geografia", () => {
  test("nenhum ponto é substituído por localidade do IBGE ou vértice do OSM", () => {
    for (const definicao of ENTORNOS) {
      const lugar = porId(definicao.lugar);
      if (lugar.local === null) throw new Error(`Sem entorno: ${lugar.id}`);
      const entorno = carregarEntorno(definicao.caminho, {
        enquadramento: lugar.local.geografico,
        localidadesObrigatorias: definicao.localidadesObrigatorias,
      });
      const contexto = [
        ...entorno.localidades.map((l) => l.posicao),
        ...entorno.vias.flatMap((v) => v.pontos),
        ...entorno.cursosDagua.flatMap((c) => c.pontos),
      ];
      for (const alvo of posicionados) {
        const coincide = contexto.some(
          ([lon, lat]) =>
            lon === alvo.posicao.longitude && lat === alvo.posicao.latitude,
        );
        expect(coincide, `${definicao.id} × ${alvo.id}`).toBe(false);
      }
    }
  });

  test("Recanto e Borda são pontos distintos; Serra está na posição confirmada", () => {
    const [xr, yr] = porId("recanto-da-serra").xy;
    const [xb, yb] = porId("borda-da-mata").xy;
    expect(Math.hypot(xr - xb, yr - yb)).toBeGreaterThan(10);
    const serra = porId("serra-dos-macacos");
    const [xs, ys] = projetarContinuo(-37.9867, -10.8811, base.dados.projecao);
    expect(serra.xy[0]).toBe(xs);
    expect(serra.xy[1]).toBe(ys);
  });

  test("Ilha Grande fica fora do recorte do Vale; os outros três, dentro", () => {
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
    const saoCristovao = base.dados.municipios.find(
      (m) => m.codigoIbge === "2806701",
    );
    expect(saoCristovao?.relacoesTerritoriais).not.toContain("vale-rio-real");
  });

  test("cada seleção centraliza o pin na vista", () => {
    const cx = (base.vista.x0 + base.vista.x1) / 2;
    const cy = (base.vista.y0 + base.vista.y1) / 2;
    for (const lugar of posicionados) {
      const [x, y] = aplicar(lugar.regional, lugar.xy[0], lugar.xy[1]);
      expect(x, lugar.id).toBeCloseTo(cx, 6);
      expect(y, lugar.id).toBeCloseTo(cy, 6);
    }
  });

  test("a aproximação de um lugar de Tobias Barreto mostra os três pins do município", () => {
    const tobias = ["recanto-da-serra", "borda-da-mata", "serra-dos-macacos"];
    for (const centro of tobias) {
      const e = porId(centro).regional;
      for (const id of tobias) {
        const [x, y] = aplicar(e, porId(id).xy[0], porId(id).xy[1]);
        expect(x, `${centro} → ${id}`).toBeGreaterThan(base.vista.x0);
        expect(x, `${centro} → ${id}`).toBeLessThan(base.vista.x1);
        expect(y, `${centro} → ${id}`).toBeGreaterThan(base.vista.y0);
        expect(y, `${centro} → ${id}`).toBeLessThan(base.vista.y1);
      }
    }
  });

  test("cada mapa local pertence ao lugar certo, e o contexto não move o ponto", () => {
    for (const lugar of posicionados) {
      if (lugar.local === null) throw new Error(`Sem entorno: ${lugar.id}`);
      const svg = svgDoEntornoDoLugar(lugar.id) ?? "";
      const selecionado = new RegExp(
        `<g class="pin" data-tipo="lugar" data-pin="${lugar.id}" data-selecionado="true" transform="translate\\((-?[\\d.]+) (-?[\\d.]+)\\)">`,
      ).exec(svg);
      expect(selecionado, lugar.id).not.toBeNull();
      expect(svg.match(/data-selecionado="true"/g)?.length, lugar.id).toBe(1);
      const [mx, my] = projetarContinuo(
        lugar.posicao.longitude,
        lugar.posicao.latitude,
        base.dados.projecao,
      );
      const [x, y] = aplicar(lugar.local.enquadramento, mx, my);
      expect(Number(selecionado?.[1]), lugar.id).toBeCloseTo(x, 1);
      expect(Number(selecionado?.[2]), lugar.id).toBeCloseTo(y, 1);
      expect(svg, lugar.id).not.toContain("não publicada");
      expect(svg, lugar.id).not.toMatch(/<script|<foreignObject|\son[a-z]+=/i);
    }
  });

  test("localidade do lugar: Jacaré e Borda da Mata como referência IBGE, distintas do pin", () => {
    for (const [id, codigo, nome] of [
      ["recanto-da-serra", "280740200039", "Jacaré · localidade"],
      ["borda-da-mata", "280740200023", "Borda da Mata · localidade"],
    ] as const) {
      const svg = svgDoEntornoDoLugar(id) ?? "";
      const ref = new RegExp(
        `<g class="ref" data-tipo="localidade-do-lugar" data-codigo-ibge="${codigo}" transform="translate\\((-?[\\d.]+) (-?[\\d.]+)\\)">`,
      ).exec(svg);
      const pin = new RegExp(
        `data-pin="${id}" data-selecionado="true" transform="translate\\((-?[\\d.]+) (-?[\\d.]+)\\)"`,
      ).exec(svg);
      expect(ref, id).not.toBeNull();
      expect(svg, id).toContain(nome);
      expect(
        Math.hypot(
          Number(pin?.[1]) - Number(ref?.[1]),
          Number(pin?.[2]) - Number(ref?.[2]),
        ),
        id,
      ).toBeGreaterThan(5);
    }
    for (const id of ["serra-dos-macacos", "ilha-grande"] as const) {
      expect(svgDoEntornoDoLugar(id) ?? "", id).not.toContain(
        'data-tipo="localidade-do-lugar"',
      );
    }
  });

  test("Vila Samambaia aparece só como referência cartográfica e não move o pin da Serra", () => {
    const svg = svgDoEntornoDoLugar("serra-dos-macacos") ?? "";
    expect(svg).toContain(
      '<g class="loc outra referencia-cartografica" data-tipo="referencia-cartografica" data-codigo-ibge="280740210">',
    );
    expect(svg).toContain("Vila Samambaia · IBGE");
    expect(svg).not.toContain(
      'data-tipo="localidade-do-lugar" data-codigo-ibge="280740210"',
    );

    const pin =
      /data-pin="serra-dos-macacos" data-selecionado="true" transform="translate\((-?[\d.]+) (-?[\d.]+)\)"/.exec(
        svg,
      );
    expect(pin).not.toBeNull();
    const serra = porId("serra-dos-macacos");
    if (serra.local === null) throw new Error("Serra sem entorno local.");
    const [mx, my] = projetarContinuo(
      serra.posicao.longitude,
      serra.posicao.latitude,
      base.dados.projecao,
    );
    const [x, y] = aplicar(serra.local.enquadramento, mx, my);
    expect(Number(pin?.[1])).toBeCloseTo(x, 1);
    expect(Number(pin?.[2])).toBeCloseTo(y, 1);
  });
});

describe("rotas externas", () => {
  test("OpenStreetMap e Google Maps apontam exatamente para a coordenada", () => {
    for (const [id, e] of Object.entries(ESPERADO)) {
      const destinos = destinosDeRota(porId(id).posicao);
      expect(destinos, id).toEqual([
        {
          servico: "OpenStreetMap",
          href: `https://www.openstreetmap.org/directions?route=%3B${e.latitude}%2C${e.longitude}`,
        },
        {
          servico: "Google Maps",
          href: `https://www.google.com/maps/dir/?api=1&destination=${e.latitude}%2C${e.longitude}`,
        },
      ]);
    }
  });
});
