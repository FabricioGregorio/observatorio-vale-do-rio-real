/**
 * Referências territoriais públicas dos lugares de campo — Tarefa 20.
 *
 * Fonte versionada **única** da posição, do município e da localidade dos
 * quatro lugares visitados em campo. Nenhum outro arquivo do laboratório
 * repete estes valores; um teste confere isso.
 *
 * ## Trilha de decisão
 *
 * - 2026-09-14: o responsável confirmou as coordenadas; uso restrito ao
 *   laboratório, em arquivo local fora do Git (Tarefa 19).
 * - 2026-09-14, decisão posterior: publicação pública e versionamento
 *   autorizados, com município, localidade e Como chegar (Tarefa 20).
 * - 2026-09-14, refinamento posterior: o lugar visitado na Serra dos Macacos
 *   é uma comunidade próxima à Vila de Samambaia, não a própria Vila nem um
 *   povoado de nome oficial confirmado. A coordenada permaneceu inalterada.
 *
 * ## O ponto × o contexto
 *
 * A posição vem de **confirmação humana direta**. IBGE e OpenStreetMap são
 * fontes só do contexto cartográfico (vias, cursos d'água, localidades,
 * limites) e nunca substituem o ponto.
 *
 * Geografia pública não reclassifica documentos: relatórios, entrevistas,
 * formulários e fotografias continuam com o estado declarado em `lugares.ts`.
 */

export const IDS_DOS_LUGARES = [
  "recanto-da-serra",
  "borda-da-mata",
  "serra-dos-macacos",
  "ilha-grande",
] as const;

export type IdDoLugar = (typeof IDS_DOS_LUGARES)[number];

export const FONTE_DA_COORDENADA =
  "confirmação humana direta do responsável — 2026-09-14";

export const FONTE_DA_REFERENCIA_CARTOGRAFICA =
  "IBGE — Localidades do Brasil, Censo 2022";

/** Código IBGE da localidade Jacaré, Tobias Barreto (Localidades 2022). */
export const CODIGO_DA_LOCALIDADE_JACARE = "280740200039";

/** Código IBGE do povoado Borda da Mata, Tobias Barreto (Localidades 2022). */
export const CODIGO_DO_POVOADO_BORDA_DA_MATA = "280740200023";

/** Código IBGE da Vila Samambaia, sede de distrito em Tobias Barreto. */
export const CODIGO_DA_VILA_SAMAMBAIA = "280740210";

export type ReferenciaCartografica = {
  /** Nome editorial da entidade cartográfica, sem confundi-la com o lugar. */
  readonly nome: string;
  readonly rotulo: string;
  readonly codigoIbge: string;
  readonly fonte: typeof FONTE_DA_REFERENCIA_CARTOGRAFICA;
};

export type ReferenciaTerritorial = {
  readonly id: IdDoLugar;
  readonly nome: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly municipio: string;
  /** Código IBGE do município. */
  readonly municipioIbge: string;
  /** Identificação editorial da localização confirmada pelo responsável. */
  readonly localidade: string;
  /**
   * Localidade do IBGE que corresponde à localidade confirmada — mesmo nome e
   * categoria compatível. É contexto, com símbolo próprio no mapa; nunca o
   * ponto do lugar e nunca substitui o nome confirmado. `null` quando a base
   * não tem correspondente seguro.
   */
  readonly localidadeIbge: string | null;
  /** Entidade cartográfica próxima que não representa o lugar visitado. */
  readonly referenciaCartografica: ReferenciaCartografica | null;
  /** Texto territorial autorizado pelo responsável, quando existe. */
  readonly referenciaTerritorial: string | null;
  readonly coordenadaConfirmada: true;
  readonly fonteDaCoordenada: typeof FONTE_DA_COORDENADA;
  readonly publicacaoPublicaAutorizada: true;
  readonly autorizadoEm: "2026-09-14";
};

const AUTORIZACAO = {
  coordenadaConfirmada: true,
  fonteDaCoordenada: FONTE_DA_COORDENADA,
  publicacaoPublicaAutorizada: true,
  autorizadoEm: "2026-09-14",
} as const;

export const REFERENCIAS_TERRITORIAIS: readonly ReferenciaTerritorial[] = [
  {
    id: "recanto-da-serra",
    nome: "Recanto da Serra",
    latitude: -11.015393101706083,
    longitude: -38.048667603935414,
    municipio: "Tobias Barreto",
    municipioIbge: "2807402",
    localidade: "Povoado Jacaré",
    localidadeIbge: CODIGO_DA_LOCALIDADE_JACARE,
    referenciaCartografica: null,
    referenciaTerritorial: null,
    ...AUTORIZACAO,
  },
  {
    id: "borda-da-mata",
    nome: "Museu Borda da Mata",
    latitude: -11.127754407274919,
    longitude: -37.88642982557546,
    municipio: "Tobias Barreto",
    municipioIbge: "2807402",
    localidade: "Povoado Borda da Mata",
    localidadeIbge: CODIGO_DO_POVOADO_BORDA_DA_MATA,
    referenciaCartografica: null,
    referenciaTerritorial: null,
    ...AUTORIZACAO,
  },
  {
    id: "serra-dos-macacos",
    nome: "Serra dos Macacos",
    latitude: -10.8811,
    longitude: -37.9867,
    municipio: "Tobias Barreto",
    municipioIbge: "2807402",
    localidade: "Comunidade próxima à Vila de Samambaia",
    // A Vila Samambaia do IBGE é apenas uma referência territorial próxima.
    // Não é a comunidade visitada e nunca substitui a coordenada humana.
    localidadeIbge: null,
    referenciaCartografica: {
      nome: "Vila Samambaia",
      rotulo: "Vila Samambaia · IBGE",
      codigoIbge: CODIGO_DA_VILA_SAMAMBAIA,
      fonte: FONTE_DA_REFERENCIA_CARTOGRAFICA,
    },
    referenciaTerritorial:
      "A Serra dos Macacos está situada especificamente na divisa com os municípios de Simão Dias e Poço Verde, servindo como marco geográfico e mirante natural entre essas cidades.",
    ...AUTORIZACAO,
  },
  {
    id: "ilha-grande",
    nome: "Ilha Grande",
    latitude: -11.0639,
    longitude: -37.2086,
    municipio: "São Cristóvão",
    municipioIbge: "2806701",
    // Decisão humana: Ilha Grande é seu próprio povoado. A base do IBGE não
    // tem localidade com esse nome; vizinhas aparecem só como contexto.
    localidade: "Povoado Ilha Grande",
    localidadeIbge: null,
    referenciaCartografica: null,
    referenciaTerritorial: null,
    ...AUTORIZACAO,
  },
];

/** Posição de um lugar, com a origem e a autorização presas ao valor. */
export type PosicaoConfirmada = Pick<
  ReferenciaTerritorial,
  | "latitude"
  | "longitude"
  | "coordenadaConfirmada"
  | "fonteDaCoordenada"
  | "publicacaoPublicaAutorizada"
>;

export function referenciaDe(id: IdDoLugar): ReferenciaTerritorial {
  const referencia = REFERENCIAS_TERRITORIAIS.find((r) => r.id === id);
  if (referencia === undefined) {
    throw new Error(`Lugar sem referência territorial: ${id}.`);
  }
  return referencia;
}

/** Posições dos quatro lugares, por id. Dado versionado; nada é lido do disco. */
export function carregarCoordenadasConfirmadas(): ReadonlyMap<
  IdDoLugar,
  PosicaoConfirmada
> {
  return new Map(
    REFERENCIAS_TERRITORIAIS.map((r) => [
      r.id,
      {
        latitude: r.latitude,
        longitude: r.longitude,
        coordenadaConfirmada: r.coordenadaConfirmada,
        fonteDaCoordenada: r.fonteDaCoordenada,
        publicacaoPublicaAutorizada: r.publicacaoPublicaAutorizada,
      },
    ]),
  );
}
