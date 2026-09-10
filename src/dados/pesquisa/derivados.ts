/**
 * Procedência dos derivados fotográficos da H3 — Pesquisa em Campo.
 *
 * O corpus e os originais ficam fora do repositório. Somente os três WebP
 * abaixo entram no bundle, depois de revisão visual de privacidade. Nenhuma
 * imagem com pessoa identificável foi selecionada.
 */

export const PASTA_PUBLICA_DA_PESQUISA = "/media/pesquisa";
export const PASTA_DOS_DERIVADOS_DA_PESQUISA = "public/media/pesquisa";

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
    titulo: "Igrejinha",
    alt: "Fachada branca e azul de uma igreja, com a inscrição 1933 na parte superior.",
    local: "Ilha Grande",
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
