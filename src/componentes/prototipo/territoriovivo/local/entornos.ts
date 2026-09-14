import { join } from "node:path";

import type { IdDoLugar } from "../lugares";
import type { PosicaoConfirmada } from "./coordenadas";
import {
  CAMINHO_DO_ENTORNO_JACARE,
  CODIGO_DA_LOCALIDADE_JACARE,
  CODIGO_DA_SEDE_TOBIAS_BARRETO,
  ENQUADRAMENTO_DO_ENTORNO_JACARE,
  type EnquadramentoGeografico,
} from "./entorno";

/**
 * Entornos locais — um por lugar de campo (Tarefa 19).
 *
 * ## Dois tipos de enquadramento
 *
 * - **Fixo** (Jacaré): definido pela localidade pública e pela sede, antes de
 *   haver coordenada confirmada. Não revela a posição do lugar, e por isso o
 *   derivado pode ir ao Git.
 * - **Centrado** (os demais): o centro é a coordenada confirmada. Um arquivo
 *   com esse enquadramento revelaria a posição, então o derivado fica **local**
 *   (`entornos/*.local.json`, excluído do Git) até haver autorização.
 *
 * O ponto central vem sempre da confirmação humana; o conteúdo do entorno,
 * sempre de IBGE e OpenStreetMap.
 */

export type IdDoEntorno =
  | "jacare"
  | "borda-da-mata"
  | "serra-dos-macacos"
  | "ilha-grande";

export type DefinicaoDeEntorno = {
  readonly id: IdDoEntorno;
  readonly lugar: IdDoLugar;
  readonly caminho: string;
  /** Pode ir ao remoto público: o enquadramento não revela a posição. */
  readonly versionavel: boolean;
  /** `null`: enquadramento centrado na coordenada confirmada. */
  readonly enquadramentoFixo: EnquadramentoGeografico | null;
  /** Localidades do IBGE que o derivado precisa conter. */
  readonly localidadesObrigatorias: readonly string[];
};

const J = ENQUADRAMENTO_DO_ENTORNO_JACARE;
/** Mesmo tamanho do entorno de Jacaré (~19 × 25 km), em graus. */
const MEIA_LATITUDE = (J.latMax - J.latMin) / 2;
const MEIA_LONGITUDE = (J.lonMax - J.lonMin) / 2;

const caminhoLocal = (id: IdDoEntorno) =>
  join(
    "src",
    "componentes",
    "prototipo",
    "territoriovivo",
    "local",
    "entornos",
    `${id}.local.json`,
  );

export const ENTORNOS: readonly DefinicaoDeEntorno[] = [
  {
    id: "jacare",
    lugar: "recanto-da-serra",
    caminho: CAMINHO_DO_ENTORNO_JACARE,
    versionavel: true,
    enquadramentoFixo: J,
    localidadesObrigatorias: [
      CODIGO_DA_SEDE_TOBIAS_BARRETO,
      CODIGO_DA_LOCALIDADE_JACARE,
    ],
  },
  {
    id: "borda-da-mata",
    lugar: "borda-da-mata",
    caminho: caminhoLocal("borda-da-mata"),
    versionavel: false,
    enquadramentoFixo: null,
    localidadesObrigatorias: [],
  },
  {
    id: "serra-dos-macacos",
    lugar: "serra-dos-macacos",
    caminho: caminhoLocal("serra-dos-macacos"),
    versionavel: false,
    enquadramentoFixo: null,
    localidadesObrigatorias: [],
  },
  {
    id: "ilha-grande",
    lugar: "ilha-grande",
    caminho: caminhoLocal("ilha-grande"),
    versionavel: false,
    enquadramentoFixo: null,
    localidadesObrigatorias: [],
  },
];

export function definicaoDoEntorno(id: IdDoEntorno): DefinicaoDeEntorno {
  const definicao = ENTORNOS.find((e) => e.id === id);
  if (definicao === undefined) throw new Error(`Entorno desconhecido: ${id}.`);
  return definicao;
}

const seisCasas = (n: number) => Number(n.toFixed(6));

export function enquadramentoDoEntorno(
  definicao: DefinicaoDeEntorno,
  posicao: PosicaoConfirmada,
): EnquadramentoGeografico {
  if (definicao.enquadramentoFixo !== null) return definicao.enquadramentoFixo;
  return {
    lonMin: seisCasas(posicao.longitude - MEIA_LONGITUDE),
    lonMax: seisCasas(posicao.longitude + MEIA_LONGITUDE),
    latMin: seisCasas(posicao.latitude - MEIA_LATITUDE),
    latMax: seisCasas(posicao.latitude + MEIA_LATITUDE),
  };
}
