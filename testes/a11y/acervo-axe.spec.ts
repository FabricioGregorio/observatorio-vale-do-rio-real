import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const rota of [
  "/acervo",
  "/acervo?q=algo-que-nao-existe",
  "/acervo/fotografias-visitas-i-vii",
  "/acervo/relatorio-tecnico-recanto-da-serra",
  "/acervo/fotografias-visitas-i-vii/arquivo/d0af646c-e6b0-423d-9edc-d5ffc74b246a",
]) {
  test(`axe não encontra violações no conteúdo do Acervo: ${rota}`, async ({
    page,
  }) => {
    await page.goto(rota);
    const resultado = await new AxeBuilder({ page })
      .include("main")
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(resultado.violations).toEqual([]);
  });
}
