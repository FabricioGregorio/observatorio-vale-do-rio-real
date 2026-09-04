import { readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";

/**
 * Validação da malha municipal — Tarefa 10B.3.1.
 *
 * Um `.geojson` lido do disco é **entrada externa**, e o contrato do projeto
 * manda validar toda entrada externa com Zod (AGENTS.md). O motivo aqui é
 * concreto: sem validação, um arquivo truncado, um download interrompido ou uma
 * mudança de formato do IBGE não estouram — o mapa simplesmente desenha errado,
 * ou desenha menos municípios, e ninguém percebe. Num site de prestação de
 * contas, mapa silenciosamente incompleto é pior que mapa ausente.
 *
 * O esquema é deliberadamente **estrito**. Ele descreve o que o IBGE devolve
 * hoje, verificado no arquivo baixado em 2026-09-03, e não o GeoJSON possível
 * em geral:
 *
 * - posição com exatamente duas coordenadas: as 79 anéis do arquivo são todos
 *   2D. Se um dia vier altitude, é melhor falhar alto e revisar do que aceitar
 *   em silêncio uma geometria que a projeção do mapa vai tratar de outro jeito;
 * - anel linear fechado, com pelo menos quatro posições, como manda o RFC 7946.
 *   Conferido: os 79 anéis fecham, e o menor tem 5 posições;
 * - `properties.codarea` com sete dígitos. É a única propriedade que a malha
 *   traz, e é a chave que liga cada feature ao município.
 *
 * Esta camada **não** é integrada a componente visual nenhum. Ela só valida.
 */

/** `[longitude, latitude]`, nessa ordem — RFC 7946. */
const esquemaPosicao = z.tuple([z.number(), z.number()]);

/**
 * Anel linear: pelo menos quatro posições, primeira igual à última.
 *
 * O fechamento é verificado à mão porque o Zod não tem como expressar "o
 * primeiro elemento é igual ao último" no próprio esquema.
 */
const esquemaAnel = z
  .array(esquemaPosicao)
  .min(4, "anel com menos de quatro posições")
  .refine((anel) => {
    const primeira = anel[0];
    const ultima = anel[anel.length - 1];
    if (primeira === undefined || ultima === undefined) return false;
    return primeira[0] === ultima[0] && primeira[1] === ultima[1];
  }, "anel não fechado: a última posição precisa repetir a primeira");

const esquemaPoligono = z.object({
  type: z.literal("Polygon"),
  coordinates: z.array(esquemaAnel).min(1),
});

const esquemaMultiPoligono = z.object({
  type: z.literal("MultiPolygon"),
  coordinates: z.array(z.array(esquemaAnel).min(1)).min(1),
});

const esquemaGeometria = z.discriminatedUnion("type", [
  esquemaPoligono,
  esquemaMultiPoligono,
]);

const esquemaFeature = z.object({
  type: z.literal("Feature"),
  geometry: esquemaGeometria,
  properties: z.looseObject({
    /** Código do município no IBGE. Identificador, nunca indicador. */
    codarea: z.string().regex(/^\d{7}$/, "codarea fora do formato do IBGE"),
  }),
});

export const esquemaMalhaMunicipal = z.object({
  type: z.literal("FeatureCollection"),
  features: z.array(esquemaFeature).min(1),
});

export type MalhaMunicipal = z.infer<typeof esquemaMalhaMunicipal>;

/** Municípios que Sergipe tem. Conferido na API de localidades do IBGE. */
export const MUNICIPIOS_DE_SERGIPE = 75;

/**
 * Valida a malha e devolve o dado tipado.
 *
 * Além do formato, confere a **completude**: a camada base do mapa é "todos os
 * municípios de Sergipe, e não pode faltar nenhum" (Consolidação 10B.2.1 §1).
 * Um arquivo que passa no esquema mas traz 60 features é um arquivo errado, e
 * essa é justamente a falha que passaria despercebida no mapa desenhado.
 */
export function validarMalhaMunicipal(bruto: unknown): MalhaMunicipal {
  const malha = esquemaMalhaMunicipal.parse(bruto);

  if (malha.features.length !== MUNICIPIOS_DE_SERGIPE) {
    throw new Error(
      `Malha incompleta: ${malha.features.length} municípios, esperados ${MUNICIPIOS_DE_SERGIPE}.`,
    );
  }

  const codigos = new Set(
    malha.features.map((feature) => feature.properties.codarea),
  );
  if (codigos.size !== malha.features.length) {
    throw new Error("Malha com código de município repetido.");
  }

  return malha;
}

/**
 * Nomes dos municípios, da API de localidades do IBGE.
 *
 * Existe porque a malha **não traz nome**: cada feature vem só com
 * `properties.codarea`. Sem este arquivo a camada base não tem como rotular
 * município nenhum, e "nome acessível por município" deixa de ser possível.
 *
 * A resposta traz mais campos — `microrregiao`, `regiao-imediata` —, ignorados
 * aqui de propósito: o projeto não os usa e não vai afirmar nada sobre eles.
 */
const esquemaMunicipioNomeado = z.looseObject({
  id: z.number().int(),
  nome: z.string().min(1),
});

export const esquemaNomesDeMunicipios = z.array(esquemaMunicipioNomeado).min(1);

export type MunicipioNomeado = {
  readonly codigoIbge: string;
  readonly nome: string;
};

/**
 * Valida os nomes e devolve o mapa `código → nome`.
 *
 * Confere completude do mesmo jeito que a malha: são os 75 municípios de
 * Sergipe, ou o arquivo está errado.
 */
export function validarNomesDeMunicipios(
  bruto: unknown,
): ReadonlyMap<string, string> {
  const lista = esquemaNomesDeMunicipios.parse(bruto);

  if (lista.length !== MUNICIPIOS_DE_SERGIPE) {
    throw new Error(
      `Lista de nomes incompleta: ${lista.length} municípios, esperados ${MUNICIPIOS_DE_SERGIPE}.`,
    );
  }

  const mapa = new Map<string, string>();
  for (const item of lista) {
    const codigo = String(item.id);
    if (!/^\d{7}$/.test(codigo)) {
      throw new Error(`Código fora do formato do IBGE: ${codigo}.`);
    }
    if (mapa.has(codigo)) {
      throw new Error(
        `Código de município repetido na lista de nomes: ${codigo}.`,
      );
    }
    mapa.set(codigo, item.nome);
  }
  return mapa;
}

/** Caminho do arquivo, relativo à raiz do projeto. Ver `fontes.ts`. */
export const CAMINHO_DA_MALHA = join(
  "src",
  "dados",
  "territorio",
  "municipios-sergipe.geojson",
);

/**
 * Lê e valida a malha do disco.
 *
 * Feito para rodar em **tempo de build**, não a cada requisição: usa
 * `node:fs`, então não pode ser importado por Client Component.
 */
export function carregarMalhaMunicipal(): MalhaMunicipal {
  const bruto = readFileSync(CAMINHO_DA_MALHA, "utf8");
  return validarMalhaMunicipal(JSON.parse(bruto));
}

export const CAMINHO_DOS_NOMES = join(
  "src",
  "dados",
  "territorio",
  "municipios-sergipe-nomes.json",
);

/** Lê e valida os nomes do disco. Tempo de build, como a malha. */
export function carregarNomesDeMunicipios(): ReadonlyMap<string, string> {
  const bruto = readFileSync(CAMINHO_DOS_NOMES, "utf8");
  return validarNomesDeMunicipios(JSON.parse(bruto));
}
