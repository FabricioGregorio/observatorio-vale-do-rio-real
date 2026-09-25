/**
 * Derivados web da fotografia do Hero — Fase H1.
 *
 * Mesma disciplina que `src/dados/territorio/fontes.ts` aplica à malha do
 * IBGE: origem declarada, transformação declarada, SHA-256 conferível. Num
 * site de prestação de contas, imagem publicada sem procedência registrada é
 * tão indefensável quanto anexo sem espelho.
 *
 * O original **não é versionado**. Ele tem 3,7 MB e vive no corpus, fora do
 * repositório. Os derivados são produzidos por `pnpm derivar-hero`, que lê o
 * original, recorta, redimensiona e codifica em AVIF — descartando todo
 * metadado no caminho.
 *
 * ## Qual original
 *
 * Até 2026-09-25 a Hero saía de `home.jpg`, fotografia **retrato 3000x4000**
 * (gravada 4000x3000 com `Orientation = 6`). Na caixa horizontal do desktop,
 * isso obrigava a recortar uma faixa de 3000x1950 do meio do retrato — o zoom
 * que a troca veio corrigir.
 *
 * O original agora é `home_melhorada.png`, **versão horizontal 1672x941
 * preparada pela equipe** a partir de `home.jpg`. As faixas laterais dela —
 * agaves à esquerda, cactos e bromélias à direita, parte do céu — não existem
 * no retrato de origem. Ela é, portanto, imagem editada, e está registrada
 * assim: o que ela não é, é fotografia bruta de campo.
 *
 * É **composição editorial da Hero**, e só isso. Não é documento de campo,
 * não é evidência, não entra no Acervo e não substitui `home.jpg`, que
 * continua sendo o registro documental — intacto no corpus.
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
   * de 500 kB, e estes derivados de protótipo já consomem boa
   * parte dele. O teto impede a situação piorar sem ninguém notar.
   */
  readonly tetoBytes: number;
};

/**
 * Procedência do original. Conferida em 2026-09-25.
 *
 * O PNG não traz EXIF, XMP nem perfil ICC — só pixels sRGB. A fotografia da
 * qual ele foi preparado (`home.jpg`, 7.190.837 B, SHA-256 `37cf8d2e…`) traz
 * **GPS**, aparelho e data; nada disso chegou ao PNG, e
 * `testes/hero-derivados.test.ts` continua confirmando, arquivo por arquivo,
 * que também não chega aos derivados.
 *
 * A existência de GPS no `home.jpg` segue registrada como **achado**, não como
 * fonte: `src/dados/territorio/pontos.ts` continua com `coordenadas: null`
 * até que exista decisão humana sobre aquelas coordenadas.
 */
export const ORIGINAL_DO_HERO = {
  arquivo: "identidade-visual/elementos visuais e graficos/home_melhorada.png",
  origem: "OBSERVATORIO_FONTES_DIR (corpus local, fora do repositório)",
  bytes: 3_714_313,
  sha256: "2727f6111f8c0ffcfdc192407bf5305f2029466b96a9dc5ef6a00195dddcab9a",
  largura: 1672,
  altura: 941,
  preparadoDe: {
    arquivo: "identidade-visual/elementos visuais e graficos/home.jpg",
    sha256: "37cf8d2ee72d41756b41f1b027ca241c4cbc17d9a654addc2d9f5412fd7ca866",
    larguraOrientada: 3000,
    alturaOrientada: 4000,
  },
  edicao:
    "versão horizontal preparada pela equipe; as faixas laterais não existem no retrato de origem",
} as const;

/**
 * Os derivados publicados.
 *
 * Servidos por `<picture>`: o recorte mobile abaixo de
 * `LARGURA_DA_COMPOSICAO_HORIZONTAL`, e o quadro inteiro acima dela, em duas
 * larguras por `srcset`. Nenhum pixel ampliado: 1600 é 1:1 na caixa de
 * 1440x900, e 1672 é toda a resolução que o original tem — não existe 1920
 * nem 2048, porque seriam só ampliação.
 *
 * Qualidade AVIF 55 nos três. A 32/35 anterior foi calibrada para o `home.jpg`
 * de 3000 px, em que a redução escondia a perda do codificador; sobre este
 * original, ela retinha 56% do detalhe fino das placas e da folhagem, contra
 * 82% da 55. Os tetos são os da política da Home em
 * `testes/a11y/home-orcamento.spec.ts`: 300 kB por variante desktop, 120 kB
 * no mobile.
 */
export const DERIVADOS_DO_HERO: readonly DerivadoDoHero[] = [
  {
    arquivo: "hero-home-melhorada-desktop-1600.avif",
    largura: 1600,
    altura: 900,
    recorte: { x: 0, y: 0, largura: 1672, altura: 941 },
    qualidade: 55,
    sha256: "53a413d288d5bff54d99363dd0f29b71ae94eb53e0bb2488d4c47ff62a80226c",
    tetoBytes: 300_000,
  },
  {
    arquivo: "hero-home-melhorada-desktop-1672.avif",
    largura: 1672,
    altura: 941,
    recorte: { x: 0, y: 0, largura: 1672, altura: 941 },
    qualidade: 55,
    sha256: "fa8cee77031e2027630620c08bc3889f2d2733fdf9e66cd131d919b03e8c4176",
    tetoBytes: 300_000,
  },
  {
    arquivo: "hero-home-melhorada-mobile-515.avif",
    largura: 515,
    altura: 941,
    recorte: { x: 700, y: 0, largura: 515, altura: 941 },
    qualidade: 55,
    sha256: "2effe41227e3d0a49dd57686c5389d3af40da1fc344784988f4ca4d2467bd9fc",
    tetoBytes: 120_000,
  },
];

/** Larguras do quadro inteiro, da menor para a maior. */
export const DERIVADOS_DESKTOP_DO_HERO = DERIVADOS_DO_HERO.filter((d) =>
  d.arquivo.includes("desktop"),
);

/** O recorte vertical, servido abaixo da composição horizontal. */
export const DERIVADO_MOBILE_DO_HERO = DERIVADOS_DO_HERO.find((d) =>
  d.arquivo.includes("mobile"),
) as DerivadoDoHero;

/**
 * `srcset` do quadro inteiro. Com `sizes="100vw"`, o navegador escolhe o menor
 * arquivo que cobre a largura física: 1600 em 1440 a DPR 1, 1672 de 1600
 * físicos em diante. Acima de 1672 ele amplia — é o limite real do original.
 */
export const SRCSET_DESKTOP_DO_HERO = DERIVADOS_DESKTOP_DO_HERO.map(
  (d) => `${CAMINHO_PUBLICO}/${d.arquivo} ${d.largura}w`,
).join(", ");

export const SIZES_DESKTOP_DO_HERO = "100vw";

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
 * Ícone oficial escolhido exclusivamente para o cabeçalho do site.
 *
 * Republicado em WebP sem perda em 2026-09-19. O PNG anterior tinha 11.299
 * bytes — saía do `canvas.toDataURL` do Chromium, que grava RGBA sem otimizar.
 * Os pixels são os mesmos: `derivar-icone-observatorio.ts` decodifica o arquivo
 * gravado e falha se uma amostra divergir do redimensionamento. Como a marca
 * está no cabeçalho, os 3.807 bytes economizados valem em toda página.
 */
export const ICONE_OBSERVATORIO_CABECALHO = {
  arquivo: "observatorio-icone-oficial-96.webp",
  origem: "identidade-visual/observatorio/icon.png",
  sha256Original:
    "20722639dba1b44885121e72fda6b7c1749f0607047215c513817d3619a1881f",
  largura: 96,
  altura: 96,
  bytes: 7_492,
  sha256: "d0bd0db9b4450db9d87fb9d8dff6213020d3d2e292bd360f420cc3a1d0941df5",
  transformacao:
    "redimensionamento integral de 565x565 para 96x96 e codificação WebP sem perda, sem recorte, recoloração ou fundo acrescentado",
  alt: "Símbolo oficial do Observatório: telescópio voltado para o céu sobre a serra e um caminho",
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
  arquivo: "coletivo-tobias-sou-eu-128.webp",
  /**
   * A marca é servida num selo circular de 3,5rem com `object-fit: cover` —
   * 56 px de caixa. O derivado de 640 px que estava publicado cobria essa
   * caixa onze vezes e custava 35.934 B da Home. O de 128 px ainda cobre o
   * selo com folga em telas de densidade dupla, por 2.810 B.
   *
   * Ele saiu do derivado de 640 px, e não do original, porque o caminho
   * declarado no corpus (`identidade-visual/coletivo-tobias-sou-eu/
   * logo-oficial-tobias-sou-eu.png`) não existe mais. O que há hoje naquela
   * pasta é `logo-coletivo.png`, com a **mesma arte em disco circular
   * 1024x1024** — outro enquadramento, não o painel retangular que está no
   * ar. Trocar de fonte mudaria o que o selo mostra, e isso é decisão
   * editorial, não consequência de uma otimização de peso. Até que ela seja
   * tomada, o derivado de 640 px permanece versionado como **fonte** desta
   * marca: é o que mantém `pnpm derivar-hero` capaz de reproduzi-la.
   */
  fonteVersionada: "coletivo-tobias-sou-eu-640.webp",
  largura: 128,
  altura: 102,
  bytes: 2_810,
  sha256: "35662eefa8be6a2020b41272d532d3ef88da6f28ed787284388d683b98b9c39e",
  transformacao:
    "redimensionamento do derivado versionado 640x512 para 128x102 e recodificação WebP",
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
 * exatamente o que este projeto proíbe.
 *
 * `alt=""` foi considerado e descartado: a fotografia não é decorativa. As
 * placas carregam a linguagem do território ("num se avexe não", "simbora"),
 * que é conteúdo, e nenhum texto vizinho do Hero a descreve.
 */
export const ALT_DO_HERO =
  "Caminho de terra entre vegetação, com placas de madeira pintadas à mão " +
  "trazendo expressões locais de acolhida e um pedido de cuidado com a " +
  "natureza. Três pessoas caminham de costas, seguindo o caminho.";
