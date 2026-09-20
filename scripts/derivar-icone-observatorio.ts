/**
 * Gera o ícone web do Observatório a partir do PNG oficial.
 *
 * Uso:
 *   node --import tsx scripts/derivar-icone-observatorio.ts <icon.png>
 *
 * Não há recorte, recoloração, filtro ou fundo acrescentado: apenas
 * redimensionamento de 565x565 para 96x96 e troca de container.
 *
 * ## Por que WebP sem perda
 *
 * O PNG que este script produzia saía do `canvas.toDataURL` do Chromium, que
 * grava RGBA sem otimizar: 11.299 bytes para uma marca de 96x96 — 1,2 byte por
 * pixel. O mesmo desenho, nos mesmos pixels, cabe em 7.492 bytes em WebP sem
 * perda. São 3.807 bytes a menos em toda página do site, já que a marca está
 * no cabeçalho.
 *
 * **Sem perda é requisito, não preferência.** É a marca institucional. As
 * variantes com perda foram medidas e descartadas: WebP q92 cabe em 5.178
 * bytes, mas desvia até 221 níveis por canal nas bordas duras do desenho. O
 * WebP sem perda devolve as amostras idênticas — a conferência abaixo falha se
 * um único pixel divergir.
 *
 * O AVIF sem perda também foi medido e é pior aqui: 14.786 bytes.
 *
 * ## Por que o Sharp, e não o canvas
 *
 * O projeto não instala codificador de imagem separado. O Sharp já está no
 * lockfile porque o Next o usa para otimizar imagem em produção — é o mesmo
 * caminho que `derivar-hero.ts` usa. Nada depende de binário global.
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";

const origem = process.argv[2];
if (origem === undefined) throw new Error("Informe o caminho de icon.png.");

const bruto = readFileSync(origem);
const hash = createHash("sha256").update(bruto).digest("hex");
const esperado =
  "20722639dba1b44885121e72fda6b7c1749f0607047215c513817d3619a1881f";
if (hash !== esperado) {
  throw new Error(`Ícone divergente da fonte auditada: ${hash}.`);
}

type PipelineSharp = {
  resize(
    largura: number,
    altura: number,
    opcoes: { fit: "inside" },
  ): PipelineSharp;
  webp(opcoes: { lossless: boolean; effort: number }): PipelineSharp;
  raw(): PipelineSharp;
  ensureAlpha(): PipelineSharp;
  metadata(): Promise<{ width?: number; height?: number }>;
  toBuffer(): Promise<Buffer>;
};
type FabricaSharp = (entrada: Buffer) => PipelineSharp;

const requererDoNext: (id: string) => unknown = createRequire(
  createRequire(import.meta.url).resolve("next/package.json"),
);
const moduloSharp = requererDoNext("sharp");
if (typeof moduloSharp !== "function") {
  throw new Error("O Sharp fornecido pelo Next não pôde ser carregado.");
}
const sharp = moduloSharp as FabricaSharp;

const dimensoes = await sharp(bruto).metadata();
if (dimensoes.width !== 565 || dimensoes.height !== 565) {
  throw new Error(
    `Dimensões inesperadas: ${dimensoes.width}x${dimensoes.height}.`,
  );
}

const redimensionar = () => sharp(bruto).resize(96, 96, { fit: "inside" });
const saida = await redimensionar()
  .webp({ lossless: true, effort: 6 })
  .toBuffer();

/* Prova de que o container mudou e os pixels não. */
const esperados = await redimensionar().raw().ensureAlpha().toBuffer();
const obtidos = await sharp(saida).raw().ensureAlpha().toBuffer();
if (!esperados.equals(obtidos)) {
  throw new Error(
    "O WebP gravado não reproduz os pixels do redimensionamento.",
  );
}

const destino = resolve(
  "public/media/logos/observatorio-icone-oficial-96.webp",
);
writeFileSync(destino, saida);
console.log(`${destino} · ${saida.length} bytes · pixels idênticos`);
console.log(createHash("sha256").update(saida).digest("hex"));
