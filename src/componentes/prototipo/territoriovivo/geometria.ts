import type { Projecao } from "../../../dados/territorio/projecao";

/**
 * Geometria do laboratório territorial — funções puras, sem JSX e sem disco.
 *
 * Tudo aqui opera sobre coordenadas **já projetadas** por `projecao.ts`. Nenhuma
 * coordenada geográfica nova entra: enquadramentos, escalas e posições de
 * rótulo são derivados dos caminhos oficiais dos municípios.
 */

export type Caixa = {
  readonly x0: number;
  readonly y0: number;
  readonly x1: number;
  readonly y1: number;
};

export type CaixaComCentro = Caixa & {
  /** Média dos vértices. Serve para rótulo, não afirma ponto nenhum. */
  readonly cx: number;
  readonly cy: number;
};

export function caixaDoCaminho(caminho: string): CaixaComCentro {
  const numeros = caminho.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  let x0 = Number.POSITIVE_INFINITY;
  let y0 = Number.POSITIVE_INFINITY;
  let x1 = Number.NEGATIVE_INFINITY;
  let y1 = Number.NEGATIVE_INFINITY;
  let somaX = 0;
  let somaY = 0;
  let pares = 0;
  for (let i = 0; i + 1 < numeros.length; i += 2) {
    const x = numeros[i] as number;
    const y = numeros[i + 1] as number;
    x0 = Math.min(x0, x);
    y0 = Math.min(y0, y);
    x1 = Math.max(x1, x);
    y1 = Math.max(y1, y);
    somaX += x;
    somaY += y;
    pares += 1;
  }
  if (pares === 0) throw new Error("Caminho sem vértices.");
  return { x0, y0, x1, y1, cx: somaX / pares, cy: somaY / pares };
}

export function unirCaixas(caixas: readonly Caixa[]): Caixa {
  if (caixas.length === 0) throw new Error("Nenhuma caixa para unir.");
  return {
    x0: Math.min(...caixas.map((c) => c.x0)),
    y0: Math.min(...caixas.map((c) => c.y0)),
    x1: Math.max(...caixas.map((c) => c.x1)),
    y1: Math.max(...caixas.map((c) => c.y1)),
  };
}

/** Expande a caixa por uma fração da maior dimensão, em todos os lados. */
export function expandir(caixa: Caixa, fracao: number): Caixa {
  const folga = Math.max(caixa.x1 - caixa.x0, caixa.y1 - caixa.y0) * fracao;
  return {
    x0: caixa.x0 - folga,
    y0: caixa.y0 - folga,
    x1: caixa.x1 + folga,
    y1: caixa.y1 + folga,
  };
}

export function seCruzam(a: Caixa, b: Caixa): boolean {
  return a.x0 <= b.x1 && a.x1 >= b.x0 && a.y0 <= b.y1 && a.y1 >= b.y0;
}

export type Enquadramento = {
  readonly tx: number;
  readonly ty: number;
  readonly s: number;
};

/**
 * Transformação que leva `alvo` a caber, centrado, dentro de `vista`.
 * Um ponto `p` do mundo vai para `s·p + t`.
 */
export function enquadrar(alvo: Caixa, vista: Caixa): Enquadramento {
  const s = Math.min(
    (vista.x1 - vista.x0) / (alvo.x1 - alvo.x0),
    (vista.y1 - vista.y0) / (alvo.y1 - alvo.y0),
  );
  const centroAlvoX = (alvo.x0 + alvo.x1) / 2;
  const centroAlvoY = (alvo.y0 + alvo.y1) / 2;
  const centroVistaX = (vista.x0 + vista.x1) / 2;
  const centroVistaY = (vista.y0 + vista.y1) / 2;
  return {
    s,
    tx: centroVistaX - s * centroAlvoX,
    ty: centroVistaY - s * centroAlvoY,
  };
}

export function aplicar(
  e: Enquadramento,
  x: number,
  y: number,
): readonly [number, number] {
  return [e.s * x + e.tx, e.s * y + e.ty];
}

/**
 * Quilômetros por unidade de SVG, a partir da própria projeção.
 *
 * A projeção corrige a longitude por `cos(latitude média)`, então a escala é a
 * mesma nos dois eixos, com o erro de forma de ~1,7% que `projecao.ts` registra.
 */
export function kmPorUnidade(projecao: Projecao): number {
  const { envelope, largura } = projecao;
  const latMedia = ((envelope.latMin + envelope.latMax) / 2) * (Math.PI / 180);
  return (
    ((envelope.lonMax - envelope.lonMin) * Math.cos(latMedia) * 111.32) /
    largura
  );
}

const PASSOS_KM = [1, 2, 5, 10, 20, 50] as const;

/**
 * Barra de escala com valor "redondo", o maior que cabe em `larguraAlvo`
 * unidades da vista, sob a escala `s` do enquadramento.
 */
export function barraDeEscala(
  kmUnidade: number,
  s: number,
  larguraAlvo: number,
): { readonly km: number; readonly unidades: number } {
  const kmDisponivel = (larguraAlvo / s) * kmUnidade;
  let km: number = PASSOS_KM[0];
  for (const passo of PASSOS_KM) if (passo <= kmDisponivel) km = passo;
  return { km, unidades: (km / kmUnidade) * s };
}
