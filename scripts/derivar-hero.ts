/**
 * Derivados web da fotografia do Hero — Fase H1.
 *
 * O original é `home.jpg`, decisão humana registrada na Direção Visual §7.2.
 * Ele tem 6,86 MB e **não é versionado**: o que entra no repositório são os
 * derivados que este script produz.
 *
 * ## Por que o navegador faz a codificação
 *
 * O projeto não tem `sharp`, `jimp` nem qualquer biblioteca de imagem, e a
 * máquina não tem ImageMagick, `cwebp`, `avifenc` nem `ffmpeg`. A instrução da
 * H1 é explícita: parar antes de instalar dependência nova e não usar serviço
 * externo.
 *
 * O que existe é o **Chromium do Playwright**, já instalado como dependência
 * de desenvolvimento. Ele traz um codificador WebP de qualidade, e um `canvas`
 * faz recorte e redimensionamento no mesmo passo. Tudo local, nada de rede,
 * nenhuma dependência nova.
 *
 * O codificador do `System.Drawing` foi medido antes desta escolha e
 * descartado: 4:4:4 sem controle de subamostragem, produzindo 283 kB para
 * 1440x936 em qualidade 45 — mais que o dobro do orçamento, com perda visível.
 *
 * ## Orientação — o detalhe que muda tudo
 *
 * O arquivo está gravado como 4000x3000, mas traz `Orientation = 6` no EXIF:
 * para exibir corretamente é preciso girar 90 graus no sentido horário. A
 * fotografia é, de fato, **retrato 3000x4000**. Ler as dimensões do arquivo
 * sem aplicar a orientação leva à conclusão errada de que ela é paisagem — foi
 * o que aconteceu no `PLANO_HOME_PILOTO_1_0.md` §7.2, corrigido na H1.
 *
 * O Chromium aplica a orientação sozinho ao carregar a imagem (`image-
 * orientation: from-image` é o padrão), então o `canvas` já recebe 3000x4000.
 * O script confere isso e falha se vier diferente.
 *
 * ## Metadados
 *
 * O original carrega EXIF com **GPS**, marca e modelo do aparelho, versão de
 * firmware, data e hora, miniatura embutida e um bloco XMP.
 *
 * Nada disso sobrevive: `canvas.toBlob` grava apenas os pixels. Os derivados
 * saem sem EXIF, sem XMP e sem ICC. `testes/hero-derivados.test.ts` confirma.
 *
 * ## O que é permitido, e o que não é
 *
 * Permitido, e é só isto que o script faz: recorte, redimensionamento,
 * compressão, conversão de formato e remoção de metadado.
 *
 * Proibido, e o script não faz: acrescentar ou remover pessoas, alterar
 * cenário, reconstruir céu, mexer em placas, aplicar filtro ou gerar pixel por
 * IA. A fidelidade documental da fotografia é preservada.
 *
 * ## Uso
 *
 *     pnpm derivar-hero -- "<caminho absoluto do home.jpg>"
 *
 * Sem argumento, usa `OBSERVATORIO_FONTES_DIR` do ambiente.
 */

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { chromium } from "@playwright/test";

/** Dimensões da fotografia depois de aplicada a orientação do EXIF. */
const LARGURA_ORIENTADA = 3000;
const ALTURA_ORIENTADA = 4000;

/**
 * Recortes escolhidos sobre a imagem já orientada. As coordenadas vieram de
 * inspeção visual com grade, não de estimativa:
 *
 *     pessoas ....... x  330-1050   y 1500-2850   (três, todas de costas)
 *     placas ........ x 1650-3000   y 1550-2500
 *     caminho ....... x  950-1500   y 1900-2400
 *     copa e céu .... y 0-1700
 *     grama ......... y 2400-4000
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
    nome: "hero-observatorio-desktop",
    x: 0,
    y: 1250,
    largura: 3000,
    altura: 1950,
    saidas: [1440],
    qualidade: 0.55,
    nota: "Mantém pessoas e placas juntas, com faixa de grama embaixo para o texto — o que a Direção Visual §7.4 pede para telas largas.",
  },
  {
    nome: "hero-observatorio-mobile",
    x: 895,
    y: 0,
    largura: 2105,
    altura: 3990,
    saidas: [540],
    qualidade: 0.55,
    nota: "Em retrato não cabem as duas coisas: o conteúdo útil ocupa 2670 px de largura, e uma janela 1:1.9 tirada de 4000 px de altura tem no máximo 2105 px. A escolha preserva as placas inteiras, que carregam a linguagem local e são o elemento insubstituível da cena; as figuras entram pela borda esquerda. Cortar as placas no meio das palavras seria pior.",
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
    largura: 640,
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

async function principal(): Promise<void> {
  const medir = process.argv.includes("--medir");
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
          "home.jpg",
        ));

  if (origem === undefined) {
    throw new Error(
      "Informe o caminho de home.jpg ou defina OBSERVATORIO_FONTES_DIR.",
    );
  }

  const bruto = readFileSync(origem);
  console.log(`origem   ${origem}`);
  console.log(`bytes    ${bruto.length}`);
  console.log(`sha-256  ${sha256(bruto)}`);
  console.log("");

  const destino = resolve("public", "media", "campo");
  mkdirSync(destino, { recursive: true });

  const navegador = await chromium.launch();
  const pagina = await navegador.newPage();

  // A imagem entra como data URL: o navegador não precisa de servidor, e nada
  // sai da máquina.
  const dataUrl = `data:image/jpeg;base64,${bruto.toString("base64")}`;

  const dimensoes = await pagina.evaluate(async (url) => {
    const img = new Image();
    img.src = url;
    await img.decode();
    return { largura: img.naturalWidth, altura: img.naturalHeight };
  }, dataUrl);

  console.log(
    `orientada  ${dimensoes.largura}x${dimensoes.altura} (o Chromium aplica o Orientation do EXIF)`,
  );

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

      const base64 = await pagina.evaluate(
        async ({ url, r, w, h, q }) => {
          const img = new Image();
          img.src = url;
          await img.decode();

          const tela = document.createElement("canvas");
          tela.width = w;
          tela.height = h;
          const ctx = tela.getContext("2d");
          if (ctx === null) throw new Error("canvas 2d indisponível");
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, r.x, r.y, r.largura, r.altura, 0, 0, w, h);

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
          q: recorte.qualidade,
        },
      );

      const saida = Buffer.from(base64, "base64");
      const caminho = join(destino, `${recorte.nome}-${largura}.webp`);
      writeFileSync(caminho, saida);

      console.log(
        `${`${recorte.nome}-${largura}.webp`.padEnd(40)} ` +
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
      const bytes = readFileSync(vetor);
      const saida = join(pastaLogos, "observatorio-monocromatica-escura.svg");
      writeFileSync(saida, bytes);
      console.log("");
      console.log(
        `${"observatorio-monocromatica-escura.svg".padEnd(40)} ${"copia literal".padEnd(11)} ${String(bytes.length).padStart(7)} B  ${(bytes.length / 1024).toFixed(1).padStart(6)} kB  ${sha256(bytes).slice(0, 16)}`,
      );
    }

    for (const marca of MARCAS) {
      if (corpus === undefined) break;
      const caminho = join(corpus, ...marca.caminhoNoCorpus);
      const original = readFileSync(caminho);
      const url = `data:image/png;base64,${original.toString("base64")}`;

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
