/**
 * Derivados web da seleção documental da H3 — Pesquisa em Campo.
 *
 * Os três originais foram selecionados somente depois de inspeção visual:
 * nenhum deles mostra pessoa identificável. O script confere conteúdo e
 * dimensões antes de transformar, redimensiona a imagem inteira (sem crop) e
 * usa o canvas do Chromium para gravar WebP sem EXIF ou XMP.
 *
 * Uso:
 *
 *     pnpm exec tsx scripts/derivar-pesquisa-campo.ts
 *
 * `OBSERVATORIO_FONTES_DIR` deve apontar para o corpus local. O caminho nunca
 * é gravado nos derivados nem exposto pela interface.
 */

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { chromium } from "@playwright/test";
import { z } from "zod";

type OriginalSelecionado = {
  readonly arquivo: string;
  readonly caminhoNoCorpus: readonly string[];
  readonly mime: "image/jpeg" | "image/png";
  readonly largura: number;
  readonly altura: number;
  readonly larguraDeSaida: number;
  readonly qualidade: number;
  readonly sha256: string;
};

const ORIGINAIS: readonly OriginalSelecionado[] = [
  {
    arquivo: "ilha-grande-chegada-barco-410.webp",
    caminhoNoCorpus: [
      "fotos",
      "ilha-grande",
      "chegando-a-ilha-grande-de-barco.png",
    ],
    mime: "image/png",
    largura: 410,
    altura: 731,
    larguraDeSaida: 410,
    qualidade: 0.78,
    sha256: "00415cefdbd2a3954bf2717fe4886aa69ba62ab2815bbf58b1aedb8a3a4c1e89",
  },
  {
    arquivo: "ilha-grande-forno-lenha-412.webp",
    caminhoNoCorpus: ["fotos", "ilha-grande", "forno-a-lenha2.png"],
    mime: "image/png",
    largura: 412,
    altura: 731,
    larguraDeSaida: 412,
    qualidade: 0.78,
    sha256: "25475b5fa02d2aa4d3e70f07580c01ffe32910b11f39bc91d5cb71cfe7f43aa9",
  },
  {
    arquivo: "ilha-grande-igrejinha-1280.webp",
    caminhoNoCorpus: ["fotos", "ilha-grande", "igrejinha.jpg"],
    mime: "image/jpeg",
    // O arquivo está gravado em 4000x3000, mas Orientation=6. O Chromium
    // aplica a orientação antes de desenhar e entrega o retrato 3000x4000.
    largura: 3000,
    altura: 4000,
    larguraDeSaida: 1280,
    qualidade: 0.72,
    sha256: "2746986d0351640c3ba4e0b78fec0276cacd828039317638c3d4e9f7d6f8a4c0",
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
  const destino = resolve("public", "media", "pesquisa");
  mkdirSync(destino, { recursive: true });

  const navegador = await chromium.launch();
  const pagina = await navegador.newPage();

  try {
    for (const original of ORIGINAIS) {
      const caminho = join(corpus, ...original.caminhoNoCorpus);
      const bytes = readFileSync(caminho);
      const hash = sha256(bytes);

      if (hash !== original.sha256) {
        throw new Error(
          `Original divergente em ${original.caminhoNoCorpus.join("/")}: ${hash}`,
        );
      }

      const dataUrl = `data:${original.mime};base64,${bytes.toString("base64")}`;
      const resultado = await pagina.evaluate(
        async ({
          url,
          larguraEsperada,
          alturaEsperada,
          larguraSaida,
          qualidade,
        }) => {
          const imagem = new Image();
          imagem.src = url;
          await imagem.decode();

          if (
            imagem.naturalWidth !== larguraEsperada ||
            imagem.naturalHeight !== alturaEsperada
          ) {
            throw new Error(
              `Dimensões inesperadas: ${imagem.naturalWidth}x${imagem.naturalHeight}`,
            );
          }

          const alturaSaida = Math.round(
            (larguraSaida * imagem.naturalHeight) / imagem.naturalWidth,
          );
          const tela = document.createElement("canvas");
          tela.width = larguraSaida;
          tela.height = alturaSaida;
          const contexto = tela.getContext("2d");
          if (contexto === null) throw new Error("canvas 2d indisponível");

          contexto.imageSmoothingEnabled = true;
          contexto.imageSmoothingQuality = "high";
          contexto.drawImage(imagem, 0, 0, larguraSaida, alturaSaida);

          const blob = await new Promise<Blob | null>((resolver) =>
            tela.toBlob(resolver, "image/webp", qualidade),
          );
          if (blob === null) throw new Error("falha ao codificar WebP");

          const binario = new Uint8Array(await blob.arrayBuffer());
          let textoBinario = "";
          for (let i = 0; i < binario.length; i += 1) {
            textoBinario += String.fromCharCode(binario[i] as number);
          }

          return { base64: btoa(textoBinario), alturaSaida };
        },
        {
          url: dataUrl,
          larguraEsperada: original.largura,
          alturaEsperada: original.altura,
          larguraSaida: original.larguraDeSaida,
          qualidade: original.qualidade,
        },
      );

      const derivado = Buffer.from(resultado.base64, "base64");
      writeFileSync(join(destino, original.arquivo), derivado);
      console.log(
        `${original.arquivo} ${original.larguraDeSaida}x${resultado.alturaSaida} ` +
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
