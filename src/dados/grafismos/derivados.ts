/**
 * Procedência dos grafismos da identidade visual usados na H3.5.
 *
 * O corpus e os arquivos de identidade ficam fora do repositório. Só o WebP
 * declarado abaixo entra no bundle, gerado por `pnpm derivar-grafismos`.
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
  readonly id: "carcara";
  readonly arquivo: string;
  readonly largura: number;
  readonly altura: number;
  readonly bytes: number;
  readonly sha256: string;
  readonly qualidade: number;
  /** Legenda de origem. Nunca descrição de avistamento. */
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
    readonly rasterEmbutido: readonly [number, number];
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
      arquivo: "identidade-visual/elementos visuais e graficos/carcará.svg",
      bytes: 91_034,
      sha256:
        "1900a7fcbfa5294d2eec5105e4f1f4465ef270b96b5ee3747774518ddb860f06",
      viewBox: "0 0 276 525.750006",
      larguraDeclarada: 368,
      alturaDeclarada: 701,
      rasterEmbutido: [398, 759],
    },
    transformacao:
      "rasterização integral do SVG em 368x701, no tamanho intrínseco declarado pelo próprio arquivo; sem recorte, recoloração ou redesenho; codificação WebP com alfa, qualidade 0,82",
    metadadosRemovidos: ["EXIF", "XMP"],
  },
] as const satisfies readonly GrafismoDaIdentidade[];

export const CARCARA_DA_IDENTIDADE = GRAFISMOS_DA_IDENTIDADE[0];
