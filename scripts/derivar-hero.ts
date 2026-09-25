/**
 * Derivados web da fotografia do Hero.
 *
 * O original é `home_melhorada.png`: a versão horizontal que a equipe
 * preparou em 2026-09-25 a partir de `home.jpg` (decisão da Direção Visual
 * §7.2). `home.jpg` é retrato 3000x4000; a versão horizontal tem 1672x941, e
 * as faixas laterais dela — agaves à esquerda, cactos e bromélias à direita —
 * não existem no original. Ela tem 3,7 MB e **não é versionada**: o que entra
 * no repositório são os derivados que este script produz.
 *
 * ## Por que o navegador faz a codificação
 *
 * O projeto não instala codificador de imagem separado. Para AVIF, reutiliza
 * o Sharp que o próprio Next mantém no lockfile para otimização em produção;
 * para a marca WebP, reutiliza o Chromium do Playwright. Nada depende de
 * binário global, serviço externo ou ferramenta baixada à parte.
 *
 * O Sharp aplica recorte e redimensionamento antes de codificar o AVIF. O
 * Chromium confere as dimensões do original e faz redimensionamento e WebP da
 * marca por `canvas`. Tudo é local e parte das dependências já travadas do
 * projeto.
 *
 * O codificador do `System.Drawing` foi medido antes desta escolha e
 * descartado: 4:4:4 sem controle de subamostragem, produzindo 283 kB para
 * 1440x936 em qualidade 45 — mais que o dobro do orçamento, com perda visível.
 *
 * ## Metadados
 *
 * O PNG não traz EXIF, XMP nem ICC. O `home.jpg` do qual ele saiu traz GPS,
 * aparelho e data — e é por isso que a regra continua valendo: os derivados
 * saem só com pixels. `testes/hero-derivados.test.ts` confirma.
 *
 * ## O que é permitido, e o que não é
 *
 * Permitido, e é só isto que o script faz: recorte, redimensionamento,
 * compressão, conversão de formato e remoção de metadado.
 *
 * Proibido, e o script não faz: acrescentar ou remover pessoas, alterar
 * cenário, reconstruir céu, mexer em placas, aplicar filtro ou gerar pixel por
 * IA. O que o original já traz é responsabilidade de quem o preparou; este
 * script não acrescenta nada a ele.
 *
 * ## Uso
 *
 *     pnpm derivar-hero -- "<caminho absoluto do home_melhorada.png>"
 *     pnpm derivar-hero -- --medir-avif "<caminho absoluto do home_melhorada.png>"
 *
 * Sem argumento, usa `OBSERVATORIO_FONTES_DIR` do ambiente — e, nesse caso,
 * também regrava as marcas institucionais.
 */

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join, resolve } from "node:path";
import { chromium } from "@playwright/test";

/** Dimensões do original. PNG não tem orientação de EXIF a aplicar. */
const LARGURA_ORIENTADA = 1672;
const ALTURA_ORIENTADA = 941;

/**
 * Recortes sobre o original. Coordenadas lidas sobre a imagem inteira:
 *
 *     pessoas ....... x  545-750    y 380-710   (três, todas de costas)
 *     placas ........ x  853-1208   y 385-615
 *     caminho ....... x  700-1000   y 460-660
 */
type Recorte = {
  readonly nome: string;
  readonly x: number;
  readonly y: number;
  readonly largura: number;
  readonly altura: number;
  readonly saidas: readonly number[];
  readonly qualidade: number;
  readonly nota: string;
};

const RECORTES: readonly Recorte[] = [
  {
    nome: "hero-home-melhorada-desktop",
    x: 0,
    y: 0,
    largura: 1672,
    altura: 941,
    saidas: [1600],
    qualidade: 32,
    nota: "Quadro inteiro, sem recorte. A caixa da Hero em 1440x900 pede 1599x900: um derivado de 1440 teria de ser ampliado, e 1600x900 é 1:1 nesse perfil. A largura nativa (1672) custava 9 kB a mais e estourava o orçamento desktop DPR1 da Home.",
  },
  {
    nome: "hero-home-melhorada-mobile",
    x: 700,
    y: 0,
    largura: 515,
    altura: 941,
    saidas: [515],
    qualidade: 35,
    nota: "Mesma composição da versão anterior, com o mesmo `object-position: 0 28%`: a caixa do celular (~0,46:1) mostra os 433 px da esquerda desta janela — caminho e figura de azul sob o texto, placas à direita, cortadas na borda. Ancorar à direita deixava as placas inteiras, mas punha a placa azul sob o sobretítulo e prejudicava a leitura. Largura nativa: nenhum pixel ampliado.",
  },
];

/**
 * Marcas institucionais que o Hero usa.
 *
 * Só **redimensionamento e conversão de formato**. Nenhuma cor é trocada,
 * nenhum elemento é redesenhado, nada é recortado: o desenho da marca chega ao
 * site exatamente como está no arquivo oficial.
 *
 * A marca do Observatório não entra aqui: `horizontal-monocromatica-escura.svg`
 * é vetor de verdade e é copiado **literalmente**, sem passar por conversão.
 */
type Marca = {
  readonly nome: string;
  readonly caminhoNoCorpus: readonly string[];
  readonly largura: number;
  readonly qualidade: number;
  readonly nota: string;
};

const MARCAS: readonly Marca[] = [
  {
    nome: "coletivo-tobias-sou-eu",
    caminhoNoCorpus: [
      "identidade-visual",
      "coletivo-tobias-sou-eu",
      "logo-oficial-tobias-sou-eu.png",
    ],
    largura: 128,
    qualidade: 0.85,
    nota: "O arquivo oficial é um painel magenta opaco com o lettering em amarelo — a marca traz o próprio fundo. Por isso ela não precisa de placa clara de apoio sobre o Hero escuro: o contraste do lettering acontece dentro do próprio painel. A faixa transparente da borda esquerda é preservada.",
  },
];

function sha256(bytes: Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}

/**
 * Modo de medição: `--medir` varre qualidades sem gravar arquivo.
 *
 * A qualidade não foi escolhida no olho. Esta fotografia é o pior caso para
 * compressão — folhagem e grama ocupam quase todo o quadro, e detalhe de alta
 * frequência é exatamente o que nenhum codificador consegue baratear. A varredura
 * é o que sustenta o valor em `RECORTES`.
 */
const QUALIDADES_DA_VARREDURA = [0.4, 0.5, 0.55, 0.6, 0.65, 0.72] as const;

type PipelineSharp = {
  autoOrient(): PipelineSharp;
  extract(opcoes: {
    left: number;
    top: number;
    width: number;
    height: number;
  }): PipelineSharp;
  resize(opcoes: { width: number; height: number; fit: "fill" }): PipelineSharp;
  avif(opcoes: {
    quality: number;
    effort: number;
    chromaSubsampling: "4:2:0";
  }): PipelineSharp;
  toBuffer(): Promise<Buffer>;
};

type FabricaSharp = (entrada: Buffer) => PipelineSharp;

/**
 * O Next já instala Sharp como dependência opcional para seu otimizador de
 * imagens em produção. O pnpm o mantém junto do pacote que o declarou, não na
 * raiz; por isso a resolução parte do próprio `next/package.json`. Assim o
 * pipeline reutiliza exatamente o codificador travado no lockfile, sem baixar
 * ferramenta paralela nem depender de binário global da máquina.
 */
function carregarSharpDoNext(): FabricaSharp {
  const requererDoNext: (id: string) => unknown = createRequire(
    createRequire(import.meta.url).resolve("next/package.json"),
  );
  const modulo = requererDoNext("sharp");
  if (typeof modulo !== "function") {
    throw new Error("O Sharp fornecido pelo Next não pôde ser carregado.");
  }
  return modulo as FabricaSharp;
}

const QUALIDADES_AVIF_DA_VARREDURA = [30, 32, 35, 40, 45, 50] as const;

async function principal(): Promise<void> {
  const medir = process.argv.includes("--medir");
  const medirAvif = process.argv.includes("--medir-avif");
  const argumento = process.argv.find((a, i) => i >= 2 && !a.startsWith("--"));
  const corpus = process.env.OBSERVATORIO_FONTES_DIR;
  const origem =
    argumento ??
    (corpus === undefined
      ? undefined
      : join(
          corpus,
          "identidade-visual",
          "elementos visuais e graficos",
          "home_melhorada.png",
        ));

  if (origem === undefined) {
    throw new Error(
      "Informe o caminho de home_melhorada.png ou defina OBSERVATORIO_FONTES_DIR.",
    );
  }

  const bruto = readFileSync(origem);
  console.log(`origem   ${origem}`);
  console.log(`bytes    ${bruto.length}`);
  console.log(`sha-256  ${sha256(bruto)}`);
  console.log("");

  if (medirAvif) {
    const sharp = carregarSharpDoNext();
    for (const recorte of RECORTES) {
      for (const largura of recorte.saidas) {
        const altura = Math.round((largura * recorte.altura) / recorte.largura);
        const medidas: string[] = [];
        for (const qualidade of QUALIDADES_AVIF_DA_VARREDURA) {
          const bytes = await sharp(bruto)
            .autoOrient()
            .extract({
              left: recorte.x,
              top: recorte.y,
              width: recorte.largura,
              height: recorte.altura,
            })
            .resize({ width: largura, height: altura, fit: "fill" })
            .avif({ quality: qualidade, effort: 6, chromaSubsampling: "4:2:0" })
            .toBuffer();
          medidas.push(`q${qualidade}=${(bytes.length / 1024).toFixed(0)}kB`);
        }
        console.log(
          `${`${recorte.nome}-${largura}`.padEnd(40)} ${String(largura).padStart(4)}x${String(altura).padEnd(4)} ${medidas.join("  ")}`,
        );
      }
    }
    return;
  }

  const destino = resolve("public", "media", "campo");
  mkdirSync(destino, { recursive: true });
  const sharp = carregarSharpDoNext();

  const navegador = await chromium.launch();
  const pagina = await navegador.newPage();

  // A imagem entra como data URL: o navegador não precisa de servidor, e nada
  // sai da máquina.
  const mimeDoOriginal = origem.endsWith(".png") ? "image/png" : "image/jpeg";
  const dataUrl = `data:${mimeDoOriginal};base64,${bruto.toString("base64")}`;

  const dimensoes = await pagina.evaluate(async (url) => {
    const img = new Image();
    img.src = url;
    await img.decode();
    return { largura: img.naturalWidth, altura: img.naturalHeight };
  }, dataUrl);

  console.log(`original  ${dimensoes.largura}x${dimensoes.altura}`);

  if (
    dimensoes.largura !== LARGURA_ORIENTADA ||
    dimensoes.altura !== ALTURA_ORIENTADA
  ) {
    throw new Error(
      `Dimensões inesperadas: ${dimensoes.largura}x${dimensoes.altura}, ` +
        `esperado ${LARGURA_ORIENTADA}x${ALTURA_ORIENTADA}. ` +
        "Recortes calibrados para outra imagem não podem ser aplicados.",
    );
  }
  console.log("");

  for (const recorte of RECORTES) {
    for (const largura of recorte.saidas) {
      const altura = Math.round((largura * recorte.altura) / recorte.largura);

      if (medir) {
        const medidas: string[] = [];
        for (const q of QUALIDADES_DA_VARREDURA) {
          const bytes: number = await pagina.evaluate(
            async ({ url, r, w, h, q: qualidade }) => {
              const img = new Image();
              img.src = url;
              await img.decode();
              const tela = document.createElement("canvas");
              tela.width = w;
              tela.height = h;
              const ctx = tela.getContext("2d");
              if (ctx === null) throw new Error("canvas 2d indisponível");
              ctx.imageSmoothingQuality = "high";
              ctx.drawImage(img, r.x, r.y, r.largura, r.altura, 0, 0, w, h);
              const blob = await new Promise<Blob | null>((ok) =>
                tela.toBlob(ok, "image/webp", qualidade),
              );
              return blob === null ? -1 : blob.size;
            },
            {
              url: dataUrl,
              r: {
                x: recorte.x,
                y: recorte.y,
                largura: recorte.largura,
                altura: recorte.altura,
              },
              w: largura,
              h: altura,
              q,
            },
          );
          medidas.push(`q${q}=${(bytes / 1024).toFixed(0)}kB`);
        }
        console.log(
          `${`${recorte.nome}-${largura}`.padEnd(40)} ${String(largura).padStart(4)}x${String(altura).padEnd(4)} ${medidas.join("  ")}`,
        );
        continue;
      }

      const saida = await sharp(bruto)
        .autoOrient()
        .extract({
          left: recorte.x,
          top: recorte.y,
          width: recorte.largura,
          height: recorte.altura,
        })
        .resize({ width: largura, height: altura, fit: "fill" })
        .avif({
          quality: recorte.qualidade,
          effort: 6,
          chromaSubsampling: "4:2:0",
        })
        .toBuffer();
      const caminho = join(destino, `${recorte.nome}-${largura}.avif`);
      writeFileSync(caminho, saida);

      console.log(
        `${`${recorte.nome}-${largura}.avif`.padEnd(40)} ` +
          `${String(largura).padStart(4)}x${String(altura).padEnd(4)} ` +
          `${String(saida.length).padStart(7)} B  ` +
          `${(saida.length / 1024).toFixed(1).padStart(6)} kB  ` +
          `${sha256(saida).slice(0, 16)}`,
      );
    }
  }

  if (!medir) {
    const pastaLogos = resolve("public", "media", "logos");
    mkdirSync(pastaLogos, { recursive: true });

    // A marca do Observatorio e vetor de verdade: copia literal, sem conversao.
    if (corpus !== undefined) {
      const vetor = join(
        corpus,
        "identidade-visual",
        "observatorio",
        "horizontal-monocromatica-escura.svg",
      );
      const saida = join(pastaLogos, "observatorio-monocromatica-escura.svg");
      if (existsSync(vetor)) {
        const bytes = readFileSync(vetor);
        writeFileSync(saida, bytes);
        console.log("");
        console.log(
          `${"observatorio-monocromatica-escura.svg".padEnd(40)} ${"copia literal".padEnd(11)} ${String(bytes.length).padStart(7)} B  ${(bytes.length / 1024).toFixed(1).padStart(6)} kB  ${sha256(bytes).slice(0, 16)}`,
        );
      } else if (!existsSync(saida)) {
        throw new Error(
          `Marca oficial ausente no corpus e no destino: ${vetor}`,
        );
      }
    }

    for (const marca of MARCAS) {
      if (corpus === undefined) break;
      const originalNoCorpus = join(corpus, ...marca.caminhoNoCorpus);
      const caminho = existsSync(originalNoCorpus)
        ? originalNoCorpus
        : join(pastaLogos, "coletivo-tobias-sou-eu-640.webp");
      if (!existsSync(caminho)) {
        throw new Error(
          `Marca do Coletivo ausente no corpus e nos derivados locais: ${originalNoCorpus}`,
        );
      }
      const original = readFileSync(caminho);
      const mime = caminho.endsWith(".webp") ? "image/webp" : "image/png";
      const url = `data:${mime};base64,${original.toString("base64")}`;

      const base64 = await pagina.evaluate(
        async ({ url: u, w, q }) => {
          const img = new Image();
          img.src = u;
          await img.decode();
          const h = Math.round((w * img.naturalHeight) / img.naturalWidth);
          const tela = document.createElement("canvas");
          tela.width = w;
          tela.height = h;
          const ctx = tela.getContext("2d");
          if (ctx === null) throw new Error("canvas 2d indisponivel");
          ctx.imageSmoothingQuality = "high";
          // Sem cor de fundo: a faixa transparente da marca continua transparente.
          ctx.drawImage(img, 0, 0, w, h);
          const blob = await new Promise<Blob | null>((ok) =>
            tela.toBlob(ok, "image/webp", q),
          );
          if (blob === null) throw new Error("falha ao codificar WebP");
          const buffer = await blob.arrayBuffer();
          let binario = "";
          const bytes = new Uint8Array(buffer);
          for (let i = 0; i < bytes.length; i += 1) {
            binario += String.fromCharCode(bytes[i] as number);
          }
          return btoa(binario);
        },
        { url, w: marca.largura, q: marca.qualidade },
      );

      const saidaBytes = Buffer.from(base64, "base64");
      const saida = join(pastaLogos, `${marca.nome}-${marca.largura}.webp`);
      writeFileSync(saida, saidaBytes);
      console.log(
        `${`${marca.nome}-${marca.largura}.webp`.padEnd(40)} ${String(marca.largura).padStart(4)}w${"".padEnd(6)} ${String(saidaBytes.length).padStart(7)} B  ${(saidaBytes.length / 1024).toFixed(1).padStart(6)} kB  ${sha256(saidaBytes).slice(0, 16)}`,
      );
    }
  }

  await navegador.close();
}

principal().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
