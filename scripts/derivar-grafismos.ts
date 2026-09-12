/**
 * Derivado web do grafismo da identidade usado na H3.5.
 *
 * O corpus da identidade visual vive fora do repositório. O carcará chega lá
 * como SVG, mas o SVG é só invólucro: dentro dele há um PNG embutido em
 * base64, aplicado como máscara sobre um caminho. Não existe vetor a
 * preservar, e copiar o invólucro literal levaria 91 KB de base64 para o
 * bundle. O script rasteriza o arquivo no tamanho intrínseco que ele mesmo
 * declara — 368x701 — e grava WebP pelo canvas do Chromium, que não escreve
 * EXIF nem XMP.
 *
 * Nada é recolorido, recortado ou redesenhado. O único parâmetro é a
 * qualidade da codificação.
 *
 * Uso:
 *
 *     pnpm derivar-grafismos
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
  readonly largura: number;
  readonly altura: number;
  readonly qualidade: number;
  readonly sha256: string;
};

const GRAFISMOS: readonly GrafismoSelecionado[] = [
  {
    arquivo: "carcara-identidade-368.webp",
    caminhoNoCorpus: [
      "identidade-visual",
      "elementos visuais e graficos",
      "carcará.svg",
    ],
    // O próprio SVG declara width="368" height="701"; nenhuma escala foi
    // escolhida aqui.
    largura: 368,
    altura: 701,
    qualidade: 0.82,
    sha256: "1900a7fcbfa5294d2eec5105e4f1f4465ef270b96b5ee3747774518ddb860f06",
  },
] as const;

function sha256(bytes: Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}

async function principal(): Promise<void> {
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
      const caminho = join(corpus, ...grafismo.caminhoNoCorpus);
      const bytes = readFileSync(caminho);
      const hash = sha256(bytes);

      if (hash !== grafismo.sha256) {
        throw new Error(
          `Original divergente em ${grafismo.caminhoNoCorpus.join("/")}: ${hash}`,
        );
      }

      const svg = bytes.toString("utf8");
      if (/(?:xlink:)?href="(?!data:)/.test(svg)) {
        throw new Error(
          "O SVG referencia recurso externo; derivação abortada.",
        );
      }

      const dataUrl = `data:image/svg+xml;base64,${bytes.toString("base64")}`;
      const base64 = await pagina.evaluate(
        async ({ url, largura, altura, qualidade }) => {
          const imagem = new Image();
          imagem.src = url;
          await imagem.decode();

          if (
            imagem.naturalWidth !== largura ||
            imagem.naturalHeight !== altura
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
