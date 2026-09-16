/**
 * Derivados web dos grafismos da identidade usados no site.
 *
 * O corpus da identidade visual vive fora do repositório. Parte dos arquivos
 * é PNG embutido num invólucro SVG; parte é vetor real, mas chega a 9,3 MB.
 * Levar esses originais literais para a Home contrariaria seu orçamento. O
 * script confere cada hash, rasteriza a arte integralmente e grava WebP com
 * alfa pelo canvas do Chromium, que não escreve EXIF nem XMP.
 *
 * Nada é recolorido, recortado ou redesenhado. A Bodega tem somente o
 * retângulo branco que cobre o canvas removido para manter transparência.
 *
 * Uso:
 *
 *     pnpm derivar-grafismos
 *     pnpm derivar-grafismos bodega-tropeiros-600.webp
 *
 * `OBSERVATORIO_FONTES_DIR` deve apontar para o corpus local. O caminho nunca
 * é gravado no derivado nem exposto pela interface.
 */

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { chromium } from "@playwright/test";
import { z } from "zod";

type GrafismoSelecionado = {
  readonly arquivo: string;
  readonly caminhoNoCorpus: readonly string[];
  readonly larguraDaFonte: number;
  readonly alturaDaFonte: number;
  readonly largura: number;
  readonly altura: number;
  readonly qualidade: number;
  readonly sha256: string;
  readonly fundoBranco?: true;
};

const GRAFISMOS: readonly GrafismoSelecionado[] = [
  {
    arquivo: "carcara-identidade-368.webp",
    caminhoNoCorpus: [
      "identidade-visual",
      "elementos visuais e graficos",
      "grafismos",
      "carcará.svg",
    ],
    // O próprio SVG declara width="368" height="701"; nenhuma escala foi
    // escolhida aqui.
    larguraDaFonte: 368,
    alturaDaFonte: 701,
    largura: 368,
    altura: 701,
    qualidade: 0.82,
    sha256: "1900a7fcbfa5294d2eec5105e4f1f4465ef270b96b5ee3747774518ddb860f06",
  },
  {
    arquivo: "cactus-identidade-479.webp",
    caminhoNoCorpus: [
      "identidade-visual",
      "elementos visuais e graficos",
      "grafismos",
      "cactus.svg",
    ],
    larguraDaFonte: 479,
    alturaDaFonte: 871,
    largura: 479,
    altura: 871,
    qualidade: 0.82,
    sha256: "f0c29e83dd2cfb6782ab1c86ca87098687e5b0b6b286bdcaca53835000ad3a43",
  },
  {
    arquivo: "bodega-tropeiros-600.webp",
    caminhoNoCorpus: [
      "identidade-visual",
      "elementos visuais e graficos",
      "grafismos",
      "bodega dos tropeiros.svg",
    ],
    larguraDaFonte: 1202,
    alturaDaFonte: 1603,
    largura: 600,
    altura: 800,
    qualidade: 0.82,
    sha256: "13d14523624cfe0a7505962282b59032f13d7a039c822cda0d0b710940c5d758",
    fundoBranco: true,
  },
  {
    arquivo: "igreja-serra-dos-macacos-540.webp",
    caminhoNoCorpus: [
      "identidade-visual",
      "elementos visuais e graficos",
      "grafismos",
      "igreja-serra-dos-macacos.svg",
    ],
    larguraDaFonte: 1080,
    alturaDaFonte: 1920,
    largura: 540,
    altura: 960,
    qualidade: 0.82,
    sha256: "1486be75751f9029a54543f52c0da25b200fed79f3d3f5ad78fe3514b4703dad",
  },
] as const;

function sha256(bytes: Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}

async function principal(): Promise<void> {
  const somente = process.argv[2];
  if (somente && !GRAFISMOS.some((grafismo) => grafismo.arquivo === somente)) {
    throw new Error(`Grafismo não selecionado: ${somente}`);
  }
  const corpus = z
    .string()
    .min(1, "OBSERVATORIO_FONTES_DIR está vazio")
    .parse(process.env.OBSERVATORIO_FONTES_DIR);
  const destino = resolve("public", "media", "grafismos");
  mkdirSync(destino, { recursive: true });

  const navegador = await chromium.launch();
  const pagina = await navegador.newPage();

  try {
    for (const grafismo of GRAFISMOS) {
      if (somente && grafismo.arquivo !== somente) continue;
      const caminho = join(corpus, ...grafismo.caminhoNoCorpus);
      const bytes = readFileSync(caminho);
      const hash = sha256(bytes);

      if (hash !== grafismo.sha256) {
        throw new Error(
          `Original divergente em ${grafismo.caminhoNoCorpus.join("/")}: ${hash}`,
        );
      }

      let svg = bytes.toString("utf8");
      if (/(?:xlink:)?href="(?!data:)/.test(svg)) {
        throw new Error(
          "O SVG referencia recurso externo; derivação abortada.",
        );
      }

      if (grafismo.fundoBranco) {
        const fundo = '<path d="M0 0H1202V1603H0V0Z" fill="white"/>';
        if (!svg.includes(fundo)) {
          throw new Error("Fundo branco esperado da Bodega não encontrado.");
        }
        // O fundo ocupa o canvas inteiro; só ele é removido para deixar alfa.
        svg = svg.replace(fundo, "");
      }

      const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
      const base64 = await pagina.evaluate(
        async ({
          url,
          larguraDaFonte,
          alturaDaFonte,
          largura,
          altura,
          qualidade,
        }) => {
          const imagem = new Image();
          imagem.src = url;
          await imagem.decode();

          if (
            imagem.naturalWidth !== larguraDaFonte ||
            imagem.naturalHeight !== alturaDaFonte
          ) {
            throw new Error(
              `Dimensões inesperadas: ${imagem.naturalWidth}x${imagem.naturalHeight}`,
            );
          }

          const tela = document.createElement("canvas");
          tela.width = largura;
          tela.height = altura;
          const contexto = tela.getContext("2d");
          if (contexto === null) throw new Error("canvas 2d indisponível");

          contexto.imageSmoothingEnabled = true;
          contexto.imageSmoothingQuality = "high";
          contexto.drawImage(imagem, 0, 0, largura, altura);

          const blob = await new Promise<Blob | null>((resolver) =>
            tela.toBlob(resolver, "image/webp", qualidade),
          );
          if (blob === null) throw new Error("falha ao codificar WebP");

          const binario = new Uint8Array(await blob.arrayBuffer());
          let textoBinario = "";
          for (let i = 0; i < binario.length; i += 1) {
            textoBinario += String.fromCharCode(binario[i] as number);
          }
          return btoa(textoBinario);
        },
        {
          url: dataUrl,
          larguraDaFonte: grafismo.larguraDaFonte,
          alturaDaFonte: grafismo.alturaDaFonte,
          largura: grafismo.largura,
          altura: grafismo.altura,
          qualidade: grafismo.qualidade,
        },
      );

      const derivado = Buffer.from(base64, "base64");
      writeFileSync(join(destino, grafismo.arquivo), derivado);
      console.log(
        `${grafismo.arquivo} ${grafismo.largura}x${grafismo.altura} ` +
          `${derivado.length} B sha256:${sha256(derivado)}`,
      );
    }
  } finally {
    await navegador.close();
  }
}

principal().catch((erro: unknown) => {
  console.error(erro);
  process.exit(1);
});
