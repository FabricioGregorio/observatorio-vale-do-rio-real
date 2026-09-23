/**
 * Procedência dos derivados fotográficos servidos pelo site.
 *
 * O corpus e os originais ficam fora do repositório. Em `public/media/pesquisa`
 * só entra o recorte das fichas gerado por `scripts/derivar-fotos-campo.py`,
 * com os mesmos bytes do Acervo.
 *
 * Os três derivados da H3 de Ilha Grande (`ilha-grande-chegada-barco-410`,
 * `-forno-lenha-412` e `-igrejinha-1280`) foram removidos em 2026-09-21: os
 * originais deles saíram ou foram trocados no corpus em 2026-09-18, e as
 * mesmas cenas estão no recorte atual.
 */

export const PASTA_PUBLICA_DA_PESQUISA = "/media/pesquisa";
export const PASTA_DOS_DERIVADOS_DA_PESQUISA = "public/media/pesquisa";

/** Fato declarado pelo responsável em 2026-09-21, restrito ao corpus publicado naquela data. */
export const CONSENTIMENTO_CORPUS_PUBLICO_2026_09_21 = {
  obtido: true,
  escopo:
    "corpus fotográfico público em 2026-09-21, inclusive pessoas identificáveis",
  comprovacao: "interna; não publicada",
} as const;

import { mapaB01 } from "../editorial/mapa-b01";
import type { IdDoLugar } from "../territorio/referencias";
import fotosDosLugares from "./lugares-derivados.json";

/**
 * Pasta do corpus → lugar de campo. **A identidade de uma fotografia vem daqui.**
 *
 * A pasta em que o original foi entregue é o único vínculo determinístico
 * entre fotografia e lugar: ela descreve onde a fotografia foi feita, e
 * `scripts/derivar-fotos-campo.py` já a usa para desempatar a deduplicação —
 * a pasta de lugar vence a pasta de pessoa justamente por isso.
 *
 * A tabela é declarada, nunca inferida: `centro-cultural-museu-borda-da-mata`
 * vira `borda-da-mata` porque esta linha diz, não porque os nomes se pareçam.
 * Antes, a ficha filtrava por igualdade com o nome de exibição
 * (`"Borda da Mata"`), e uma correção de grafia no manifesto deixaria a ficha
 * silenciosamente sem fotografia nenhuma.
 *
 * `local` continua no manifesto como **rótulo de exibição**, e é só isso. Um
 * teste confere que `lugar` e a pasta de origem concordam em todo item.
 */
export const LUGAR_DA_PASTA_DO_CORPUS = {
  "recanto-da-serra": "recanto-da-serra",
  "centro-cultural-museu-borda-da-mata": "borda-da-mata",
  "serra-dos-macacos": "serra-dos-macacos",
  "ilha-grande": "ilha-grande",
} as const satisfies Readonly<Record<string, IdDoLugar>>;

export type PastaDoCorpus = keyof typeof LUGAR_DA_PASTA_DO_CORPUS;

/** Pasta de `fotos/<pasta>/<arquivo>`; `null` quando não é pasta de lugar. */
export function pastaDoOriginal(caminho: string): PastaDoCorpus | null {
  const pasta = caminho.split("/")[1];
  return pasta !== undefined && pasta in LUGAR_DA_PASTA_DO_CORPUS
    ? (pasta as PastaDoCorpus)
    : null;
}

/**
 * Data de um registro fotográfico como a interface a exibe: `11/04/2026`.
 *
 * A ausência é dita, não esquecida — `null` vira "data não informada". É a
 * única formatação de data de fotografia: a Home e as fichas de `/territorio`
 * leem daqui, e nenhuma escreve a data à mão.
 */
export function exibirDataDaFotografia(data: string | null): string {
  if (data === null) return "data não informada";
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

export type DerivadoDeLugar = (typeof fotosDosLugares)[number];

/**
 * Recorte das fichas: as fotografias que Home, `/territorio` e `/campo`
 * servem localmente, uma por original, com os mesmos bytes do Acervo.
 *
 * Desde 2026-09-21 inclui as oito de Serra dos Macacos e as oito de Ilha
 * Grande. As de Ilha Grande substituem os três derivados da H3, cujos
 * originais o responsável retirou ou trocou em 2026-09-18.
 *
 * `data` vem do gerador e é `null` onde nenhuma fonte a sustenta.
 */
export const DERIVADOS_DOS_LUGARES =
  fotosDosLugares as readonly DerivadoDeLugar[];

/**
 * Título público de uma fotografia: o mesmo que o Acervo exibe, lido do mapa
 * editorial do B01 pelo hash do derivado. Uma fotografia, um título, em todas
 * as superfícies — a Home não escreve legenda própria.
 */
export function tituloPublicoDaFotografia(sha256: string): string | null {
  return (
    mapaB01.arquivos.find((entrada) => entrada.sha256 === sha256)
      ?.tituloPublico ?? null
  );
}

export type FotografiaDaHome = DerivadoDeLugar & { readonly titulo: string };

/**
 * As três fotografias de cada lugar no bloco "Também em campo", da Home.
 *
 * Seleção editorial, declarada por arquivo — nunca as três primeiras da
 * lista. Cada trio mostra três aspectos distintos do lugar:
 *
 * - Serra dos Macacos: o acesso (a ponte), a paisagem entre serras e o
 *   interior de uma igreja da comunidade;
 * - Ilha Grande: a chegada pelo rio, o preparo junto ao forno a lenha e a
 *   igreja de 1933.
 *
 * As outras cinco de cada lugar seguem em `/territorio` e `/campo`.
 */
export const FOTOGRAFIAS_DA_HOME = {
  "serra-dos-macacos": [
    "serra-dos-macacos-atravessando-a-ponte.webp",
    "serra-dos-macacos-serras-e-nuvens.webp",
    "serra-dos-macacos-interior-da-igreja.webp",
  ],
  "ilha-grande": [
    "ilha-grande-margem.webp",
    "ilha-grande-preparo-junto-ao-forno.webp",
    "ilha-grande-pequena-igreja.webp",
  ],
} as const satisfies Partial<Record<IdDoLugar, readonly string[]>>;

/** Resolve a seleção da Home contra o manifesto; falha alto se divergir. */
export function fotografiasDaHome(
  lugar: keyof typeof FOTOGRAFIAS_DA_HOME,
): readonly FotografiaDaHome[] {
  return FOTOGRAFIAS_DA_HOME[lugar].map((arquivo) => {
    const foto = DERIVADOS_DOS_LUGARES.find(
      (candidata) => candidata.arquivo === arquivo && candidata.lugar === lugar,
    );
    const titulo = foto ? tituloPublicoDaFotografia(foto.sha256) : null;
    if (!foto || titulo === null) {
      throw new Error(`Fotografia da Home sem manifesto ou título: ${arquivo}`);
    }
    return { ...foto, titulo };
  });
}

/**
 * Registro fotográfico dos protótipos de `/dev` (Pesquisa em Campo e
 * linguagem visual): as três fotografias de Ilha Grande da Home, na mesma
 * ordem — chegada pelo rio, forno, igreja —, com o rótulo de ficha que os
 * protótipos exibem. Nenhum arquivo próprio.
 */
export type RegistroDoPrototipo = FotografiaDaHome & {
  readonly tipo: "registro fotográfico";
  readonly fonte: "B01 — fotografias de comprovação";
};

function registroDoPrototipo(
  foto: FotografiaDaHome | undefined,
): RegistroDoPrototipo {
  if (foto === undefined) {
    throw new Error("Protótipo sem as três fotografias de Ilha Grande.");
  }
  return {
    ...foto,
    tipo: "registro fotográfico",
    fonte: "B01 — fotografias de comprovação",
  };
}

const ILHA_NA_HOME = fotografiasDaHome("ilha-grande");

export const REGISTROS_DOS_PROTOTIPOS = [
  registroDoPrototipo(ILHA_NA_HOME[0]),
  registroDoPrototipo(ILHA_NA_HOME[1]),
  registroDoPrototipo(ILHA_NA_HOME[2]),
] as const;
