/**
 * Gera o ícone web do Observatório a partir do PNG oficial.
 *
 * Uso:
 *   node --import tsx scripts/derivar-icone-observatorio.ts <icon.png>
 *
 * O canvas preserva a proporção e a transparência. Não há recorte,
 * recoloração, filtro ou fundo acrescentado.
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "@playwright/test";

const origem = process.argv[2];
if (origem === undefined) throw new Error("Informe o caminho de icon.png.");

const bruto = readFileSync(origem);
const hash = createHash("sha256").update(bruto).digest("hex");
const esperado =
  "20722639dba1b44885121e72fda6b7c1749f0607047215c513817d3619a1881f";
if (hash !== esperado) {
  throw new Error(`Ícone divergente da fonte auditada: ${hash}.`);
}

const navegador = await chromium.launch();
try {
  const pagina = await navegador.newPage();
  const dataUrl = `data:image/png;base64,${bruto.toString("base64")}`;
  const base64 = await pagina.evaluate(async (url) => {
    const imagem = new Image();
    imagem.src = url;
    await imagem.decode();
    if (imagem.naturalWidth !== 565 || imagem.naturalHeight !== 565) {
      throw new Error(
        `Dimensões inesperadas: ${imagem.naturalWidth}x${imagem.naturalHeight}.`,
      );
    }
    const tela = document.createElement("canvas");
    tela.width = 96;
    tela.height = 96;
    const contexto = tela.getContext("2d");
    if (contexto === null) throw new Error("Canvas 2D indisponível.");
    contexto.imageSmoothingEnabled = true;
    contexto.imageSmoothingQuality = "high";
    contexto.drawImage(imagem, 0, 0, 96, 96);
    return tela.toDataURL("image/png").split(",")[1];
  }, dataUrl);
  if (base64 === undefined) throw new Error("Falha ao gerar o PNG derivado.");
  const destino = resolve(
    "public/media/logos/observatorio-icone-oficial-96.png",
  );
  const saida = Buffer.from(base64, "base64");
  writeFileSync(destino, saida);
  console.log(`${destino} · ${saida.length} bytes`);
  console.log(createHash("sha256").update(saida).digest("hex"));
} finally {
  await navegador.close();
}
