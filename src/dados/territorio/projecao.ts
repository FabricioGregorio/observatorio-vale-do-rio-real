import type { GeometriaGeoJson, Posicao } from "./tipos";

/**
 * Projeção do território para coordenadas de SVG — Tarefa 10B.3.3.
 *
 * Funções puras, sem leitura de disco e sem JSX: dá para testar sem renderizar
 * nada.
 *
 * A projeção é **equirretangular com correção de meridiano**: longitude e
 * latitude entram numa escala linear, e a longitude é corrigida por
 * `cos(latitude média)` para que o estado não saia esticado na horizontal. Não
 * é reprojeção cartográfica de verdade, e não pretende ser — para um único
 * estado, a 10° de latitude, o erro de forma fica em torno de 1,7%, invisível
 * num mapa de leitura. Um mapa que precise de medição de área ou distância
 * precisaria de outra projeção.
 *
 * O eixo Y é invertido porque em SVG ele cresce para baixo e a latitude cresce
 * para cima.
 */

/** Retângulo envolvente em graus. */
export type Envelope = {
  readonly lonMin: number;
  readonly lonMax: number;
  readonly latMin: number;
  readonly latMax: number;
};

export type Projecao = {
  /** Largura do `viewBox`, em unidades de SVG. */
  readonly largura: number;
  /** Altura do `viewBox`, derivada da escala — nunca arbitrada. */
  readonly altura: number;
  readonly envelope: Envelope;
};

/** Anéis de um polígono ou multipolígono, achatados numa lista só. */
export function aneisDaGeometria(
  geometria: GeometriaGeoJson,
): readonly (readonly Posicao[])[] {
  if (geometria.type === "Polygon") return geometria.coordinates;
  return geometria.coordinates.flat();
}

export function calcularEnvelope(
  geometrias: readonly GeometriaGeoJson[],
): Envelope {
  let lonMin = Number.POSITIVE_INFINITY;
  let lonMax = Number.NEGATIVE_INFINITY;
  let latMin = Number.POSITIVE_INFINITY;
  let latMax = Number.NEGATIVE_INFINITY;

  for (const geometria of geometrias) {
    for (const anel of aneisDaGeometria(geometria)) {
      for (const [lon, lat] of anel) {
        if (lon < lonMin) lonMin = lon;
        if (lon > lonMax) lonMax = lon;
        if (lat < latMin) latMin = lat;
        if (lat > latMax) latMax = lat;
      }
    }
  }

  if (!Number.isFinite(lonMin)) {
    throw new Error("Envelope sem coordenada: nenhuma geometria recebida.");
  }
  return { lonMin, lonMax, latMin, latMax };
}

export function criarProjecao(envelope: Envelope, largura: number): Projecao {
  const vaoLon = envelope.lonMax - envelope.lonMin;
  const vaoLat = envelope.latMax - envelope.latMin;
  if (vaoLon <= 0 || vaoLat <= 0) {
    throw new Error("Envelope degenerado: vão nulo em longitude ou latitude.");
  }

  const latMedia = ((envelope.latMin + envelope.latMax) / 2) * (Math.PI / 180);
  const escala = largura / (vaoLon * Math.cos(latMedia));

  return { largura, altura: vaoLat * escala, envelope };
}

/**
 * Uma casa decimal é suficiente e foi medida: num `viewBox` de 1000 unidades
 * cobrindo cerca de 202 km, 0,1 unidade equivale a uns 20 metros. Duas casas
 * custam 3,3 kB comprimidos a mais sem ganho visível.
 */
export const CASAS_DECIMAIS = 1;

function projetar(
  posicao: Posicao,
  projecao: Projecao,
): readonly [number, number] {
  const { envelope, largura, altura } = projecao;
  const x =
    ((posicao[0] - envelope.lonMin) / (envelope.lonMax - envelope.lonMin)) *
    largura;
  const y =
    ((envelope.latMax - posicao[1]) / (envelope.latMax - envelope.latMin)) *
    altura;
  return [Number(x.toFixed(CASAS_DECIMAIS)), Number(y.toFixed(CASAS_DECIMAIS))];
}

/** Posição de um ponto de visita nas coordenadas do SVG. */
export function posicaoNoSvg(
  posicao: Posicao,
  projecao: Projecao,
): readonly [number, number] {
  return projetar(posicao, projecao);
}

/**
 * Atributo `d` de um `<path>` para uma geometria.
 *
 * O ponto de fecho do anel é descartado: o comando `Z` fecha o caminho, e
 * repetir a primeira posição só gasta bytes.
 */
export function caminhoDaGeometria(
  geometria: GeometriaGeoJson,
  projecao: Projecao,
): string {
  const partes: string[] = [];

  for (const anel of aneisDaGeometria(geometria)) {
    const pontos = anel.map((posicao) => projetar(posicao, projecao));
    const primeiro = pontos[0];
    const ultimo = pontos[pontos.length - 1];
    const fechado =
      primeiro !== undefined &&
      ultimo !== undefined &&
      primeiro[0] === ultimo[0] &&
      primeiro[1] === ultimo[1];
    const usados = fechado ? pontos.slice(0, -1) : pontos;

    const inicio = usados[0];
    if (inicio === undefined) continue;

    const resto = usados
      .slice(1)
      .map(([x, y]) => `L${x} ${y}`)
      .join("");
    partes.push(`M${inicio[0]} ${inicio[1]}${resto}Z`);
  }

  return partes.join("");
}
