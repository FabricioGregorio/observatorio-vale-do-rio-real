/**
 * Captura a comparação A/B da H3 em viewports e temas obrigatórios.
 *
 * Os PNGs vão para `tmp/h3-screenshots/`, pasta ignorada pelo Git. O script
 * pressupõe `pnpm dev` ativo em localhost:3000 e não publica nada.
 */

import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { chromium, type Page } from "@playwright/test";

const ROTA = "http://localhost:3000/dev/pesquisa";
const DESTINO = resolve("tmp", "h3-screenshots");

type Tema = "light" | "dark";
type Preset = "documental-aberto" | "caderno-tecnico";

const CENARIOS: readonly {
  readonly largura: number;
  readonly tema: Tema;
  readonly presets: readonly Preset[];
}[] = [
  {
    largura: 1440,
    tema: "light",
    presets: ["documental-aberto", "caderno-tecnico"],
  },
  {
    largura: 1440,
    tema: "dark",
    presets: ["documental-aberto", "caderno-tecnico"],
  },
  {
    largura: 375,
    tema: "light",
    presets: ["documental-aberto", "caderno-tecnico"],
  },
  {
    largura: 375,
    tema: "dark",
    presets: ["documental-aberto", "caderno-tecnico"],
  },
  { largura: 320, tema: "light", presets: ["documental-aberto"] },
] as const;

function letraDoPreset(preset: Preset): "a" | "b" {
  return preset === "documental-aberto" ? "a" : "b";
}

async function carregarFotografiasDaSecao(
  pagina: Page,
  preset: Preset,
): Promise<void> {
  const secao = pagina.getByTestId(`preset-${preset}`);
  const imagens = secao.locator("img");
  for (let indice = 0; indice < (await imagens.count()); indice += 1) {
    const imagem = imagens.nth(indice);
    await imagem.scrollIntoViewIfNeeded();
    await imagem.waitFor({ state: "visible" });
    await pagina.waitForFunction(
      (elemento) =>
        elemento instanceof HTMLImageElement &&
        elemento.complete &&
        elemento.naturalWidth > 0,
      await imagem.elementHandle(),
    );
  }
}

async function principal(): Promise<void> {
  mkdirSync(DESTINO, { recursive: true });
  const navegador = await chromium.launch();

  try {
    for (const cenario of CENARIOS) {
      const pagina = await navegador.newPage({
        colorScheme: cenario.tema,
        viewport: { width: cenario.largura, height: 900 },
      });
      await pagina.goto(ROTA, { waitUntil: "domcontentloaded" });

      // A captura é da proposta editorial, sem a casca fixa do laboratório ou
      // o indicador do Next dev por cima da fotografia.
      await pagina.addStyleTag({
        content:
          ".cabecalho-prototipo, nextjs-portal { display: none !important; }",
      });

      const transborda = await pagina.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      );
      if (transborda) {
        throw new Error(
          `Overflow horizontal em ${cenario.largura}px/${cenario.tema}`,
        );
      }

      for (const preset of cenario.presets) {
        await carregarFotografiasDaSecao(pagina, preset);
        const arquivo = `pesquisa-${letraDoPreset(preset)}-${cenario.largura}-${cenario.tema}.png`;
        await pagina.getByTestId(`preset-${preset}`).screenshot({
          animations: "disabled",
          path: resolve(DESTINO, arquivo),
        });
        console.log(arquivo);
      }

      await pagina.close();
    }

    // Medição informativa do pipeline responsivo no servidor DEV. O orçamento
    // estável continua sendo o dos WebP versionados; o Next pode recodificar
    // cada imagem de acordo com viewport, DPR, `Accept` e cache.
    const paginaDaMedicao = await navegador.newPage({
      colorScheme: "light",
      viewport: { width: 1440, height: 900 },
    });
    await paginaDaMedicao.goto(ROTA, { waitUntil: "domcontentloaded" });
    await paginaDaMedicao.waitForTimeout(750);
    const imagensAntesDoCampo = await paginaDaMedicao
      .getByTestId("preset-documental-aberto")
      .locator("img")
      .evaluateAll(
        (imagens) =>
          imagens.filter(
            (imagem) =>
              imagem instanceof HTMLImageElement &&
              imagem.complete &&
              imagem.naturalWidth > 0,
          ).length,
      );
    await carregarFotografiasDaSecao(paginaDaMedicao, "documental-aberto");
    const urls = await paginaDaMedicao
      .getByTestId("preset-documental-aberto")
      .locator("img")
      .evaluateAll((imagens) => [
        ...new Set(
          imagens
            .filter(
              (imagem): imagem is HTMLImageElement =>
                imagem instanceof HTMLImageElement,
            )
            .map((imagem) => imagem.currentSrc),
        ),
      ]);
    const pesos = await Promise.all(
      urls.map(async (url) => {
        const resposta = await fetch(url, {
          headers: { Accept: "image/avif,image/webp" },
        });
        if (!resposta.ok) throw new Error(`Falha ao medir ${url}`);
        return (await resposta.arrayBuffer()).byteLength;
      }),
    );
    const bytesAoEntrar = pesos.reduce((total, bytes) => total + bytes, 0);
    console.log(
      `pipeline DEV · imagens já próximas antes do scroll: ${imagensAntesDoCampo}`,
    );
    console.log(`pipeline DEV · A completo no viewport: ${bytesAoEntrar} B`);
    await paginaDaMedicao.close();

    console.log("screenshots: 9");
    console.log(`destino: ${DESTINO}`);
  } finally {
    await navegador.close();
  }
}

principal().catch((erro: unknown) => {
  console.error(erro);
  process.exit(1);
});
