/**
 * Procedência dos grafismos da identidade visual usados no site.
 *
 * O corpus e os arquivos de identidade ficam fora do repositório. Só os WebP
 * declarados abaixo entram no bundle, gerados por `pnpm derivar-grafismos`.
 *
 * **O que este arquivo é e o que não é.** O carcará é elemento gráfico da
 * identidade visual aprovada do Observatório, catalogado na biblioteca
 * iconográfica da Direção Visual. Ele é ilustração de marca, e não registro
 * de campo: nenhum documento do projeto afirma avistamento da ave em
 * qualquer município do recorte. Por isso ele entra como assinatura visual,
 * sempre decorativo (`alt=""` e `aria-hidden`), acompanhado de legenda que
 * diz de onde ele vem. Apresentá-lo como fotografia ou como observação seria
 * inventar dado de pesquisa.
 *
 * **Por que não é o SVG literal.** O arquivo de origem é SVG apenas por
 * invólucro: dentro dele há um PNG de 398x759 em base64, aplicado como
 * máscara sobre um único caminho. Não existe vetor a preservar, e o
 * invólucro custa 91 KB de base64. O derivado rasteriza o arquivo no tamanho
 * intrínseco que ele mesmo declara — `width="368" height="701"` — sem
 * recorte, recoloração ou redesenho.
 */

/** Pasta pública dos grafismos da identidade. */
export const PASTA_PUBLICA_DOS_GRAFISMOS = "/media/grafismos";
export const PASTA_DOS_DERIVADOS_DE_GRAFISMOS = "public/media/grafismos";

export type GrafismoDaIdentidade = {
  readonly id: "carcara" | "cactus" | "bodega" | "igreja-serra-dos-macacos";
  readonly arquivo: string;
  readonly largura: number;
  readonly altura: number;
  readonly bytes: number;
  readonly sha256: string;
  readonly qualidade: number;
  /** Identificação de origem, nunca descrição de evidência de campo. */
  readonly legenda: string;
  /** Decorativo por decisão: o conteúdo não depende da ilustração. */
  readonly alt: "";
  readonly fonte: "identidade visual do Observatório";
  readonly original: {
    readonly arquivo: string;
    readonly bytes: number;
    readonly sha256: string;
    readonly viewBox: string;
    readonly larguraDeclarada: number;
    readonly alturaDeclarada: number;
    readonly natureza: "raster-embutido" | "vetor";
    readonly rasterEmbutido?: readonly [number, number];
  };
  readonly transformacao: string;
  readonly metadadosRemovidos: readonly string[];
};

export const GRAFISMOS_DA_IDENTIDADE = [
  {
    id: "carcara",
    arquivo: "carcara-identidade-368.webp",
    largura: 368,
    altura: 701,
    bytes: 29_954,
    sha256: "c8ef6799982227cd3f6bb10c9a4c904daf2ac6faaf188532a59676f72320ff05",
    qualidade: 0.82,
    legenda: "Carcará · grafismo da identidade",
    alt: "",
    fonte: "identidade visual do Observatório",
    original: {
      arquivo:
        "identidade-visual/elementos visuais e graficos/grafismos/carcará.svg",
      bytes: 91_034,
      sha256:
        "1900a7fcbfa5294d2eec5105e4f1f4465ef270b96b5ee3747774518ddb860f06",
      viewBox: "0 0 276 525.750006",
      larguraDeclarada: 368,
      alturaDeclarada: 701,
      natureza: "raster-embutido",
      rasterEmbutido: [398, 759],
    },
    transformacao:
      "rasterização integral do SVG em 368x701, no tamanho intrínseco declarado pelo próprio arquivo; sem recorte, recoloração ou redesenho; codificação WebP com alfa, qualidade 0,82",
    metadadosRemovidos: ["EXIF", "XMP"],
  },
  {
    id: "cactus",
    arquivo: "cactus-identidade-479.webp",
    largura: 479,
    altura: 871,
    bytes: 37_706,
    sha256: "40cd51c0fe1ae5187cf282cdd0336b7f7fc2e5c87f72eb037f8f916b33e96bf5",
    qualidade: 0.82,
    legenda: "Cacto · grafismo da identidade",
    alt: "",
    fonte: "identidade visual do Observatório",
    original: {
      arquivo:
        "identidade-visual/elementos visuais e graficos/grafismos/cactus.svg",
      bytes: 130_974,
      sha256:
        "f0c29e83dd2cfb6782ab1c86ca87098687e5b0b6b286bdcaca53835000ad3a43",
      viewBox: "0 0 359.25 653.249998",
      larguraDeclarada: 479,
      alturaDeclarada: 871,
      natureza: "raster-embutido",
      rasterEmbutido: [300, 546],
    },
    transformacao:
      "rasterização integral do SVG em 479x871, no tamanho intrínseco declarado pelo próprio arquivo; sem recorte, recoloração ou redesenho; codificação WebP com alfa, qualidade 0,82",
    metadadosRemovidos: ["EXIF", "XMP"],
  },
  {
    id: "bodega",
    arquivo: "bodega-tropeiros-600.webp",
    largura: 600,
    altura: 800,
    bytes: 28_462,
    sha256: "ca7eaf9515f1b2c4053302a0f084d83b5545f8b6f4c1f76830d5d9e41aa8cb9f",
    qualidade: 0.82,
    legenda: "Bodega dos Tropeiros · grafismo da identidade",
    alt: "",
    fonte: "identidade visual do Observatório",
    original: {
      arquivo:
        "identidade-visual/elementos visuais e graficos/grafismos/bodega dos tropeiros.svg",
      bytes: 680_838,
      sha256:
        "13d14523624cfe0a7505962282b59032f13d7a039c822cda0d0b710940c5d758",
      viewBox: "0 0 1202 1603",
      larguraDeclarada: 1202,
      alturaDeclarada: 1603,
      natureza: "vetor",
    },
    transformacao:
      "remoção apenas do retângulo branco de fundo que cobria o canvas inteiro; rasterização integral em 600x800, preservando proporção e arte; sem recorte, recoloração ou redesenho; codificação WebP com alfa, qualidade 0,82",
    metadadosRemovidos: ["EXIF", "XMP"],
  },
  {
    id: "igreja-serra-dos-macacos",
    arquivo: "igreja-serra-dos-macacos-540.webp",
    largura: 540,
    altura: 960,
    bytes: 73_806,
    sha256: "f188edf6b3ff14c5a277b4fe15291af9b4ed947d04de6c9708afc789c0524953",
    qualidade: 0.82,
    legenda: "Igreja da Serra dos Macacos · grafismo da identidade",
    alt: "",
    fonte: "identidade visual do Observatório",
    original: {
      arquivo:
        "identidade-visual/elementos visuais e graficos/grafismos/igreja-serra-dos-macacos.svg",
      bytes: 4_393_173,
      sha256:
        "1486be75751f9029a54543f52c0da25b200fed79f3d3f5ad78fe3514b4703dad",
      viewBox: "0 0 810 1439.999935",
      larguraDeclarada: 1080,
      alturaDeclarada: 1920,
      natureza: "vetor",
    },
    transformacao:
      "rasterização integral do SVG em 540x960, metade das dimensões declaradas e com a mesma proporção; sem recorte, recoloração ou redesenho; codificação WebP com alfa, qualidade 0,82",
    metadadosRemovidos: ["EXIF", "XMP"],
  },
] as const satisfies readonly GrafismoDaIdentidade[];

export const CARCARA_DA_IDENTIDADE = GRAFISMOS_DA_IDENTIDADE[0];
