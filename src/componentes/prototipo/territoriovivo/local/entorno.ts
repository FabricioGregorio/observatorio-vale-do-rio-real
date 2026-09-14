import { readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";

import { PONTOS_DE_VISITA_PREVISTOS } from "../../../../dados/territorio/pontos";

/**
 * Camada geográfica local do laboratório territorial — Tarefa 18.
 *
 * Um arquivo derivado **localmente**, por script versionado
 * (`scripts/derivar-entorno-local.ts`), a partir de duas fontes abertas:
 *
 * - **IBGE — Localidades do Brasil, Censo 2022**: nomes e posições das
 *   localidades (sede, povoados, outras localidades);
 * - **OpenStreetMap**: vias e cursos d'água com nome.
 *
 * Nada é carregado de servidor externo em tempo de execução. A procedência
 * completa de cada fonte e do derivado está em `procedencia.ts`; a origem de
 * cada camada também vai escrita dentro do próprio arquivo (`fontes`).
 *
 * ## O que esta camada afirma
 *
 * Geografia pública do **entorno** de uma localidade. Ela **não** contém
 * posição de nenhum lugar da pesquisa. Um equipamento só ganha marcador quando
 * existir coordenada confirmada pelo Observatório — fonte pública que sugere
 * não é Observatório que confirma.
 *
 * Roda em **tempo de build**: lê do disco, não pode ir para Client Component.
 */

/** `[longitude, latitude]` — RFC 7946. */
const esquemaPosicao = z.tuple([
  z.number().min(-180).max(180),
  z.number().min(-90).max(90),
]);

const esquemaLinha = z.array(esquemaPosicao).min(2);

const esquemaEnquadramento = z.object({
  lonMin: z.number(),
  lonMax: z.number(),
  latMin: z.number(),
  latMax: z.number(),
});

export type EnquadramentoGeografico = z.infer<typeof esquemaEnquadramento>;

/** Origem de cada camada, repetida dentro do derivado. */
export const FONTES_DAS_CAMADAS = {
  localidades: "IBGE — Localidades do Brasil, Censo 2022",
  vias: "© contribuidores do OpenStreetMap — ODbL 1.0",
  cursosDagua: "© contribuidores do OpenStreetMap — ODbL 1.0",
} as const;

export const esquemaEntornoLocal = z.object({
  versao: z.literal(1),
  enquadramento: esquemaEnquadramento,
  fontes: z.object({
    localidades: z.literal(FONTES_DAS_CAMADAS.localidades),
    vias: z.literal(FONTES_DAS_CAMADAS.vias),
    cursosDagua: z.literal(FONTES_DAS_CAMADAS.cursosDagua),
  }),
  localidades: z
    .array(
      z.object({
        /**
         * Código da localidade no IBGE. Os comprimentos são os que o arquivo
         * de 2022 usa em Sergipe: 7 (sede), 9 (vila/distrito), 10 (núcleo
         * urbano) e 12 (demais localidades).
         */
        codigoIbge: z.string().regex(/^\d{7}(\d{2,3}|\d{5})?$/),
        nome: z.string().min(1),
        /** Categoria do IBGE, como publicada: Cidade, Povoado… */
        categoria: z.string().min(1),
        posicao: esquemaPosicao,
      }),
    )
    .min(1),
  cursosDagua: z.array(
    z.object({
      classe: z.enum(["rio", "riacho"]),
      nome: z.string().min(1),
      pontos: esquemaLinha,
    }),
  ),
  vias: z
    .array(
      z.object({
        /**
         * - `rodovia`: via com código (SE-, BR-, BA-) ou principal no OSM;
         * - `estrada`: estrada vicinal sem código;
         * - `urbana`: arruamento da sede.
         */
        classe: z.enum(["rodovia", "estrada", "urbana"]),
        ref: z.string().min(1).nullable(),
        /** `null` quando o OSM não declara o revestimento. */
        pavimentada: z.boolean().nullable(),
        pontos: esquemaLinha,
      }),
    )
    .min(1),
});

export type EntornoLocal = z.infer<typeof esquemaEntornoLocal>;
export type LocalidadeDoEntorno = EntornoLocal["localidades"][number];

/**
 * Enquadramento do entorno do Povoado Jacaré, em graus.
 *
 * Retrato, na proporção da vista do Vale (≈ 0,74), para que a camada local
 * ocupe a mesma placa. Contém a sede de Tobias Barreto e a localidade Jacaré:
 * a relação espacial entre as duas é o que orienta quem chega.
 */
export const ENQUADRAMENTO_DO_ENTORNO_JACARE: EnquadramentoGeografico = {
  lonMin: -38.1185,
  lonMax: -37.9475,
  latMin: -11.215,
  latMax: -10.985,
};

/** Código IBGE da localidade Jacaré (Localidades do Brasil 2022). */
export const CODIGO_DA_LOCALIDADE_JACARE = "280740200039";

/** Código IBGE da sede municipal de Tobias Barreto. */
export const CODIGO_DA_SEDE_TOBIAS_BARRETO = "2807402";

export const CAMINHO_DO_ENTORNO_JACARE = join(
  "src",
  "componentes",
  "prototipo",
  "territoriovivo",
  "local",
  "entorno-jacare.json",
);

/* ---------- filtro de nomes ---------- */

const PALAVRAS_VAZIAS = new Set(["de", "da", "do", "dos", "das"]);

/** Radicais (5 letras, sem acento) das palavras significativas de um nome. */
export function radicaisDoNome(nome: string): string[] {
  return nome
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((p) => p.length >= 4 && !PALAVRAS_VAZIAS.has(p))
    .map((p) => p.slice(0, 5));
}

const RADICAIS_DE_LUGARES = new Set(
  PONTOS_DE_VISITA_PREVISTOS.flatMap((p) => radicaisDoNome(p.nome)),
);

/**
 * Um nome geográfico que compartilhe radical com o nome de um lugar de campo
 * **não entra** na camada: o rótulo seria lido como a posição do lugar. A
 * exclusão é por regra, não por lista — nenhuma localidade sensível é escrita
 * no código. Jacaré é a exceção, porque já é pública no A02.
 */
export function nomePodeEntrarNoEntorno(
  nome: string,
  codigo?: string,
): boolean {
  if (codigo === CODIGO_DA_LOCALIDADE_JACARE) return true;
  return !radicaisDoNome(nome).some((r) => RADICAIS_DE_LUGARES.has(r));
}

/* ---------- validação ---------- */

function dentro(
  [lon, lat]: readonly [number, number],
  e: EnquadramentoGeografico,
): boolean {
  return (
    lon >= e.lonMin && lon <= e.lonMax && lat >= e.latMin && lat <= e.latMax
  );
}

/** O que um derivado precisa satisfazer para o mapa usá-lo. */
export type ExpectativaDoEntorno = {
  readonly enquadramento: EnquadramentoGeografico;
  /** Códigos IBGE que precisam estar entre as localidades. */
  readonly localidadesObrigatorias: readonly string[];
};

export const EXPECTATIVA_DO_ENTORNO_JACARE: ExpectativaDoEntorno = {
  enquadramento: ENQUADRAMENTO_DO_ENTORNO_JACARE,
  localidadesObrigatorias: [
    CODIGO_DA_LOCALIDADE_JACARE,
    CODIGO_DA_SEDE_TOBIAS_BARRETO,
  ],
};

/**
 * Valida o derivado. Além da forma, confere o que o mapa pressupõe: o
 * enquadramento é o esperado, toda localidade cai dentro dele, nenhum nome
 * fere o filtro e as localidades obrigatórias existem. Sem expectativa
 * explícita, vale a de Jacaré.
 */
export function validarEntornoLocal(
  bruto: unknown,
  expectativa: ExpectativaDoEntorno = EXPECTATIVA_DO_ENTORNO_JACARE,
): EntornoLocal {
  const entorno = esquemaEntornoLocal.parse(bruto);
  const e = entorno.enquadramento;
  const esperado = expectativa.enquadramento;
  if (
    e.lonMin !== esperado.lonMin ||
    e.lonMax !== esperado.lonMax ||
    e.latMin !== esperado.latMin ||
    e.latMax !== esperado.latMax
  ) {
    throw new Error(
      "Entorno derivado com enquadramento diferente do declarado.",
    );
  }
  for (const localidade of entorno.localidades) {
    if (!dentro(localidade.posicao, e)) {
      throw new Error(`Localidade fora do enquadramento: ${localidade.nome}.`);
    }
    if (!nomePodeEntrarNoEntorno(localidade.nome, localidade.codigoIbge)) {
      throw new Error(`Localidade barrada pelo filtro: ${localidade.nome}.`);
    }
  }
  for (const curso of entorno.cursosDagua) {
    if (!nomePodeEntrarNoEntorno(curso.nome)) {
      throw new Error(`Curso d'água barrado pelo filtro: ${curso.nome}.`);
    }
  }
  for (const codigo of expectativa.localidadesObrigatorias) {
    if (!entorno.localidades.some((l) => l.codigoIbge === codigo)) {
      throw new Error(`Entorno sem a localidade ${codigo}.`);
    }
  }
  return entorno;
}

/** Lê e valida um derivado. Tempo de build ou rota DEV; nunca no cliente. */
export function carregarEntorno(
  caminho: string,
  expectativa: ExpectativaDoEntorno,
): EntornoLocal {
  return validarEntornoLocal(
    JSON.parse(readFileSync(caminho, "utf8")),
    expectativa,
  );
}

export function carregarEntornoJacare(): EntornoLocal {
  return carregarEntorno(
    CAMINHO_DO_ENTORNO_JACARE,
    EXPECTATIVA_DO_ENTORNO_JACARE,
  );
}
