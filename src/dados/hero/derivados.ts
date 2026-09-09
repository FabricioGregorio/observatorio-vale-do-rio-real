/**
 * Derivados web da fotografia do Hero — Fase H1.
 *
 * Mesma disciplina que `src/dados/territorio/fontes.ts` aplica à malha do
 * IBGE: origem declarada, transformação declarada, SHA-256 conferível. Num
 * site de prestação de contas, imagem publicada sem procedência registrada é
 * tão indefensável quanto anexo sem espelho.
 *
 * O original **não é versionado**. Ele tem 6,86 MB e vive no corpus, fora do
 * repositório. Os derivados são produzidos por `pnpm derivar-hero`, que lê o
 * original, aplica a orientação do EXIF, recorta, redimensiona e codifica em
 * WebP — descartando todo metadado no caminho.
 *
 * ## A orientação
 *
 * O arquivo está gravado como 4000x3000, mas traz `Orientation = 6`: a
 * fotografia é **retrato 3000x4000**. O `PLANO_HOME_PILOTO_1_0.md` §7.2 a
 * descreve como paisagem 4:3, o que veio de ler as dimensões sem aplicar a
 * orientação. A correção está registrada na H1.
 */

/** Pasta dos derivados, relativa à raiz do projeto. */
export const PASTA_DOS_DERIVADOS = "public/media/campo";

/** Prefixo público correspondente. */
export const CAMINHO_PUBLICO = "/media/campo";

export type DerivadoDoHero = {
  readonly arquivo: string;
  readonly largura: number;
  readonly altura: number;
  /** Recorte aplicado sobre a imagem já orientada, em pixels. */
  readonly recorte: {
    readonly x: number;
    readonly y: number;
    readonly largura: number;
    readonly altura: number;
  };
  readonly qualidade: number;
  readonly sha256: string;
  /**
   * Teto de bytes aceito no repositório. Não é estético: a Home tem orçamento
   * de 500 kB (doc 01 §7), e estes derivados de protótipo já consomem boa
   * parte dele. O teto impede a situação piorar sem ninguém notar.
   */
  readonly tetoBytes: number;
};

/**
 * Procedência do original. Conferida em 2026-09-09.
 *
 * O EXIF do original traz **GPS**, marca e modelo do aparelho, versão de
 * firmware e data/hora. Nada disso sobrevive nos derivados, e
 * `testes/hero-derivados.test.ts` confirma arquivo por arquivo.
 *
 * A existência de GPS no original é registrada aqui como **achado**, não como
 * fonte: se aquelas coordenadas constituem ou não documentação do ponto de
 * pesquisa é decisão humana, e `src/dados/territorio/pontos.ts` continua com
 * `coordenadas: null` até que essa decisão exista.
 */
export const ORIGINAL_DO_HERO = {
  arquivo: "identidade-visual/elementos visuais e graficos/home.jpg",
  origem: "OBSERVATORIO_FONTES_DIR (corpus local, fora do repositório)",
  bytes: 7_190_837,
  sha256: "37cf8d2ee72d41756b41f1b027ca241c4cbc17d9a654addc2d9f5412fd7ca866",
  larguraGravada: 4000,
  alturaGravada: 3000,
  orientacaoExif: 6,
  larguraOrientada: 3000,
  alturaOrientada: 4000,
  metadadosRemovidos: [
    "GPS (latitude, longitude, altitude)",
    "marca e modelo do aparelho",
    "versão de firmware",
    "data e hora de captura",
    "miniatura embutida",
    "bloco XMP",
  ],
} as const;

/**
 * Os derivados publicados.
 *
 * **Conjunto de protótipo.** Uma largura por composição, o suficiente para
 * avaliar a composição em 1440 e em 375. O conjunto de produção precisa de
 * `srcset` por densidade e de um orçamento de peso resolvido — ver
 * `docs/frontend/H1_HERO_MANIFESTO_PROTOTIPO.md`.
 */
export const DERIVADOS_DO_HERO: readonly DerivadoDoHero[] = [
  {
    arquivo: "hero-observatorio-desktop-1440.webp",
    largura: 1440,
    altura: 936,
    recorte: { x: 0, y: 1250, largura: 3000, altura: 1950 },
    qualidade: 0.55,
    sha256: "ffd76a44a03c63ab",
    tetoBytes: 300_000,
  },
  {
    arquivo: "hero-observatorio-mobile-540.webp",
    largura: 540,
    altura: 1024,
    recorte: { x: 895, y: 0, largura: 2105, altura: 3990 },
    qualidade: 0.55,
    sha256: "0ed8f04252058b71",
    tetoBytes: 200_000,
  },
];

/** Largura a partir da qual a composição horizontal é servida. */
export const LARGURA_DA_COMPOSICAO_HORIZONTAL = 1024;

/** Pasta pública das marcas institucionais. */
export const CAMINHO_DAS_MARCAS = "/media/logos";

/**
 * Marca do Observatório — **cópia literal** do vetor oficial.
 *
 * `horizontal-monocromatica-escura.svg` é o único vetor de verdade da
 * identidade: 13 caminhos, sem imagem embutida. Ele traz o próprio fundo preto
 * e o lettering em branco, e é assim que chega ao site — byte por byte, sem
 * conversão, sem recorte e sem recoloração.
 *
 * O lettering está convertido em curvas. Reproduzi-lo com fonte seria inventar
 * a marca: a fonte oficial não está identificada em nenhum arquivo da
 * identidade (H0 §13).
 */
export const MARCA_OBSERVATORIO = {
  arquivo: "observatorio-monocromatica-escura.svg",
  largura: 1600,
  altura: 900,
  bytes: 31_520,
  sha256: "8bda07efbe684aaa",
  transformacao: "nenhuma — cópia literal do arquivo oficial",
  alt: "Observatório de Cultura e Economia Criativa da Região do Vale do Rio Real",
} as const;

/** Símbolo oficial de apoio do Hero B revisado; mantém o fundo institucional. */
export const SIMBOLO_OBSERVATORIO = {
  arquivo: "observatorio-simbolo-256.png",
  origem: "identidade-visual/observatorio/icon.png",
  sha256Original:
    "6b230265d3c50b864bed83c5d3e7ddd02bd01998a92de818fefae487afc2571b",
  largura: 256,
  altura: 320,
  bytes: 13_026,
  sha256: "5404186e9658408aaf2ca3521c2fceeb87d2f23cb8f46bd89d02e93296ce8283",
  transformacao:
    "redimensionamento integral de 1080x1350 para 256x320 em PNG, sem recorte, recoloração ou remoção de fundo; sem metadados do original",
  alt: "Símbolo oficial do Observatório: telescópio, serra e caminho",
} as const;

/**
 * Marca do Coletivo Cultural "Tobias, sou Eu!".
 *
 * O arquivo oficial é um **painel magenta opaco** com o lettering em amarelo e
 * um retrato estilizado ao centro. A marca **traz o próprio fundo** — e é isso
 * que resolve o problema que a H0 §7 registrou: ela não precisa de placa clara
 * de apoio sobre o Hero escuro, porque o contraste do lettering acontece dentro
 * do próprio painel.
 *
 * Transformação aplicada: **apenas redimensionamento e conversão de formato**.
 * Nenhuma cor trocada, nada redesenhado, nada recortado. A faixa transparente
 * da borda esquerda do arquivo original é preservada.
 */
export const MARCA_COLETIVO = {
  arquivo: "coletivo-tobias-sou-eu-640.webp",
  largura: 640,
  altura: 512,
  bytes: 35_934,
  sha256: "813561906f5654cf",
  transformacao:
    "redimensionamento de 1280x1024 para 640x512 e conversão para WebP",
  alt: 'Coletivo Cultural "Tobias, sou Eu!"',
} as const;

/**
 * Texto alternativo da fotografia.
 *
 * Descreve o que a cena mostra e é útil saber: um caminho de terra, placas
 * pintadas à mão com expressões locais, e pessoas caminhando. **Não identifica
 * ninguém** — as três figuras aparecem de costas, e o consentimento das
 * pessoas fotografadas (item E01 do inventário) continua pendente.
 *
 * **Não afirma o local.** A fotografia veio da pasta de identidade visual sem
 * ficha documental, e nenhum documento do projeto a associa a um município ou
 * equipamento. Escrever "Recanto da Serra" aqui seria inventar procedência —
 * exatamente o que o `AGENTS.md` proíbe.
 *
 * `alt=""` foi considerado e descartado: a fotografia não é decorativa. As
 * placas carregam a linguagem do território ("num se avexe não", "simbora"),
 * que é conteúdo, e nenhum texto vizinho do Hero a descreve.
 */
export const ALT_DO_HERO =
  "Caminho de terra entre vegetação, com placas de madeira pintadas à mão " +
  "trazendo expressões locais de acolhida e um pedido de cuidado com a " +
  "natureza. Três pessoas caminham de costas, seguindo o caminho.";
