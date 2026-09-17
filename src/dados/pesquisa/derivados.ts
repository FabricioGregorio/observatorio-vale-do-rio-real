/**
 * Procedência dos derivados fotográficos da H3 — Pesquisa em Campo.
 *
 * O corpus e os originais ficam fora do repositório. Somente os três WebP
 * abaixo entram no bundle, depois de revisão visual de privacidade. Nenhuma
 * imagem com pessoa identificável foi selecionada.
 *
 * `id` e `original.arquivo` preservam o nome dado no corpus e servem à
 * procedência. `titulo` é legenda descritiva do que a fotografia mostra, e não
 * topônimo: nenhum documento lido registra nome oficial de lugar para estas
 * cenas. Por isso `igrejinha.jpg` continua identificando o original e a Home
 * exibe "Fachada de igreja".
 */

export const PASTA_PUBLICA_DA_PESQUISA = "/media/pesquisa";
export const PASTA_DOS_DERIVADOS_DA_PESQUISA = "public/media/pesquisa";

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

export type DerivadoDaPesquisa = {
  readonly id: "chegada-por-agua" | "forno-a-lenha" | "igrejinha";
  readonly arquivo: string;
  readonly largura: number;
  readonly altura: number;
  readonly bytes: number;
  readonly sha256: string;
  readonly qualidade: number;
  readonly titulo: string;
  readonly alt: string;
  readonly local: "Ilha Grande";
  /** Identidade do lugar; conferida contra `original.arquivo` por teste. */
  readonly lugar: IdDoLugar;
  readonly data: null;
  readonly tipo: "registro fotográfico";
  readonly fonte: "B01 — fotografias de comprovação";
  readonly original: {
    readonly arquivo: string;
    readonly bytes: number;
    readonly sha256: string;
    readonly larguraGravada: number;
    readonly alturaGravada: number;
    readonly orientacaoExif: number | null;
  };
  readonly transformacao: string;
  readonly metadadosRemovidos: readonly string[];
};

export const DERIVADOS_DA_PESQUISA = [
  {
    id: "chegada-por-agua",
    arquivo: "ilha-grande-chegada-barco-410.webp",
    largura: 410,
    altura: 731,
    bytes: 31_842,
    sha256: "b8404169e78e5bffa78d1b73ee32a5f0850f587366315a2a8d74e715cec6abb2",
    qualidade: 0.78,
    titulo: "Chegada por água",
    alt: "Vista de construções e vegetação na margem, fotografada a partir de uma embarcação em movimento.",
    local: "Ilha Grande",
    lugar: "ilha-grande",
    data: null,
    tipo: "registro fotográfico",
    fonte: "B01 — fotografias de comprovação",
    original: {
      arquivo: "fotos/ilha-grande/chegando-a-ilha-grande-de-barco.png",
      bytes: 587_875,
      sha256:
        "00415cefdbd2a3954bf2717fe4886aa69ba62ab2815bbf58b1aedb8a3a4c1e89",
      larguraGravada: 410,
      alturaGravada: 731,
      orientacaoExif: null,
    },
    transformacao:
      "imagem integral em 410x731, sem crop; conversão PNG → WebP, qualidade 0,78",
    metadadosRemovidos: ["metadados auxiliares do contêiner"],
  },
  {
    id: "forno-a-lenha",
    arquivo: "ilha-grande-forno-lenha-412.webp",
    largura: 412,
    altura: 731,
    bytes: 42_186,
    sha256: "1c9cc9b37a54bfa5bf53381d5c4bc217bae9e187476c27037377898a0d0d26ed",
    qualidade: 0.78,
    titulo: "Atividade no forno a lenha",
    alt: "Forno circular aquecido, com utensílios e porções de massa em uma área coberta.",
    local: "Ilha Grande",
    lugar: "ilha-grande",
    data: null,
    tipo: "registro fotográfico",
    fonte: "B01 — fotografias de comprovação",
    original: {
      arquivo: "fotos/ilha-grande/forno-a-lenha2.png",
      bytes: 746_932,
      sha256:
        "25475b5fa02d2aa4d3e70f07580c01ffe32910b11f39bc91d5cb71cfe7f43aa9",
      larguraGravada: 412,
      alturaGravada: 731,
      orientacaoExif: null,
    },
    transformacao:
      "imagem integral em 412x731, sem crop; conversão PNG → WebP, qualidade 0,78",
    metadadosRemovidos: ["metadados auxiliares do contêiner"],
  },
  {
    id: "igrejinha",
    arquivo: "ilha-grande-igrejinha-1280.webp",
    largura: 1280,
    altura: 1707,
    bytes: 168_738,
    sha256: "75d9dcb8291299224953c965c24a04c346373bd7923757cd39c1e45599aa3592",
    qualidade: 0.72,
    titulo: "Fachada de igreja",
    alt: "Fachada branca e azul de uma igreja, com a inscrição 1933 na parte superior.",
    local: "Ilha Grande",
    lugar: "ilha-grande",
    data: null,
    tipo: "registro fotográfico",
    fonte: "B01 — fotografias de comprovação",
    original: {
      arquivo: "fotos/ilha-grande/igrejinha.jpg",
      bytes: 3_748_570,
      sha256:
        "2746986d0351640c3ba4e0b78fec0276cacd828039317638c3d4e9f7d6f8a4c0",
      larguraGravada: 4000,
      alturaGravada: 3000,
      orientacaoExif: 6,
    },
    transformacao:
      "orientação EXIF aplicada (retrato 3000x4000), imagem integral sem crop, redimensionamento para 1280x1707 e conversão JPEG → WebP, qualidade 0,72",
    metadadosRemovidos: [
      "EXIF",
      "data e hora",
      "marca e modelo do dispositivo",
      "orientação",
      "miniatura embutida",
      "XMP",
      "GPS, se existente",
    ],
  },
] as const satisfies readonly DerivadoDaPesquisa[];

export const BYTES_TOTAIS_DA_PESQUISA = DERIVADOS_DA_PESQUISA.reduce(
  (total, derivado) => total + derivado.bytes,
  0,
);

export type DerivadoDeLugar = (typeof fotosDosLugares)[number];

/** Fotografias autorizadas para as fichas de Recanto e Borda da Mata. */
export const DERIVADOS_DOS_LUGARES =
  fotosDosLugares as readonly DerivadoDeLugar[];
