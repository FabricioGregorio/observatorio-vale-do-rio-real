/**
 * Screenshots do protótipo do Hero — Fase H1.
 *
 * Gera capturas **reais** do site rodando localmente: navegador de verdade,
 * viewport de verdade, tema de verdade. Nada de mockup, nada de imagem
 * gerada — a instrução da H1 §30 é explícita sobre isso.
 *
 * As capturas saem para um diretório temporário e **não são versionadas**:
 * elas servem à decisão humana desta rodada, não ao repositório.
 *
 * ## Uso
 *
 *     pnpm dev                              # em outro terminal
 *     pnpm screenshots-hero -- <destino>
 *
 * O destino é opcional; sem ele, usa `tmp/screenshots-hero`.
 */

import { mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { chromium } from "@playwright/test";

const BASE = process.env.URL_DO_PROTOTIPO ?? "http://localhost:3000/dev/hero";

const VARIANTES = [
  { chave: "hero-a", seletor: "#hero-wordmark" },
  { chave: "hero-b", seletor: "#hero-tipografia" },
] as const;

const VIEWPORTS = [
  { nome: "1440", largura: 1440, altura: 900 },
  { nome: "768", largura: 768, altura: 1024 },
  { nome: "375", largura: 375, altura: 812 },
  { nome: "320", largura: 320, altura: 720 },
] as const;

const TEMAS = ["light", "dark"] as const;

/**
 * Combinações pedidas pela instrução §30: as duas variantes em 1440 e 375,
 * nos dois temas — oito capturas. 768 entra como opcional, e 320 entra porque
 * a §24 manda verificar essa largura.
 */
function ehPedida(viewport: string, tema: string): boolean {
  if (viewport === "1440" || viewport === "375") return true;
  if (viewport === "768") return tema === "light";
  if (viewport === "320") return tema === "light";
  return false;
}

async function principal(): Promise<void> {
  const destino = resolve(process.argv[2] ?? join("tmp", "screenshots-hero"));
  mkdirSync(destino, { recursive: true });

  const navegador = await chromium.launch();
  const caminhos: string[] = [];

  for (const tema of TEMAS) {
    for (const viewport of VIEWPORTS) {
      if (!ehPedida(viewport.nome, tema)) continue;

      const contexto = await navegador.newContext({
        viewport: { width: viewport.largura, height: viewport.altura },
        colorScheme: tema,
        deviceScaleFactor: 1,
      });
      const pagina = await contexto.newPage();
      await pagina.goto(BASE, { waitUntil: "networkidle" });

      for (const variante of VARIANTES) {
        const secao = pagina.locator(variante.seletor);
        await secao.scrollIntoViewIfNeeded();
        // A fotografia precisa estar decodificada antes da captura, senão a
        // imagem sai em branco e o screenshot não prova nada.
        await pagina.waitForFunction((sel) => {
          const img = document.querySelector(`${sel} img`);
          return (
            img instanceof HTMLImageElement &&
            img.complete &&
            img.naturalWidth > 0
          );
        }, variante.seletor);

        const arquivo = join(
          destino,
          `${variante.chave}-${viewport.nome}-${tema}.png`,
        );
        await secao.screenshot({ path: arquivo });
        caminhos.push(arquivo);
        console.log(`${variante.chave}  ${viewport.nome}  ${tema}  ${arquivo}`);
      }

      await contexto.close();
    }
  }

  await navegador.close();
  console.log("");
  console.log(`${caminhos.length} capturas em ${destino}`);
}

principal().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
