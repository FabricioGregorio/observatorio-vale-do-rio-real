import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import {
  ATIVIDADES,
  INDICADORES,
  SERIE_MENSAL,
} from "../../src/dados/indicadores/derivados";
import {
  exibirIndicador,
  formatarReais,
} from "../../src/dados/indicadores/formato";

for (const largura of [375, 768, 1440]) {
  for (const tema of ["light", "dark"] as const) {
    test(`dados legíveis, sem overflow e axe limpo — ${largura}, ${tema}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: largura, height: 900 });
      await page.emulateMedia({ colorScheme: tema });
      await page.goto("/dados");
      await expect(page.locator(".dd-indicador")).toHaveCount(
        INDICADORES.length,
      );
      for (const indicador of INDICADORES) {
        const ficha = page.locator(`[data-indicador="${indicador.id}"]`);
        await expect(ficha.locator(".dd-indicador__valor")).toHaveText(
          exibirIndicador(indicador),
        );
        await expect(ficha).toContainText(indicador.regra);
        await expect(ficha).toContainText(indicador.fontePublica);
        if (indicador.base !== null)
          await expect(ficha).toContainText(indicador.base);
        await ficha.locator("summary").click();
        await expect(ficha.locator("details")).toContainText(indicador.periodo);
        await expect(ficha.locator("details")).toContainText(indicador.recorte);
      }
      for (const [indice, mes] of SERIE_MENSAL.entries()) {
        const linha = page.locator(".dd-mes").nth(indice);
        await expect(linha.locator(".dd-comparacao")).toBeVisible();
        await expect(linha.locator("summary")).toContainText(
          formatarReais(mes.receita),
        );
        await expect(linha.locator("summary")).toContainText(
          formatarReais(mes.despesa),
        );
        const pontos = linha.locator(".dd-comparacao__ponto");
        const posicoes = await pontos.evaluateAll((elementos) =>
          elementos.map((elemento) => elemento.getBoundingClientRect().x),
        );
        expect((posicoes[0] ?? 0) < (posicoes[1] ?? 0)).toBe(
          mes.receita < mes.despesa,
        );
      }
      const tabelaAtividades = page.locator(".dd-tabela--ranking");
      await expect(tabelaAtividades.locator("tbody tr")).toHaveCount(
        ATIVIDADES.length,
      );
      for (const [indice, atividade] of ATIVIDADES.entries()) {
        const linha = tabelaAtividades.locator("tbody tr").nth(indice);
        await expect(linha).toContainText(atividade.nome);
        await expect(linha).toContainText(`${atividade.diasComAtividade} de`);
        await expect(linha.locator("svg")).toHaveAttribute(
          "aria-hidden",
          "true",
        );
      }
      await page.locator(".dd-serie__tabela summary").click();
      await expect(page.locator(".dd-serie__tabela tbody tr")).toHaveCount(
        SERIE_MENSAL.length,
      );
      expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            document.documentElement.clientWidth,
        ),
      ).toBe(true);
      const resultado = await new AxeBuilder({ page })
        .include("main")
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(resultado.violations).toEqual([]);
    });
  }
}

test("mês abre e fecha com teclado, com foco visível e sem animação com movimento reduzido", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/dados");
  const resumo = page.locator(".dd-mes summary").first();
  await resumo.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".dd-mes").first()).toHaveAttribute("open", "");
  await expect(page.locator(".dd-mes__contexto").first()).toBeVisible();
  expect(
    await resumo.evaluate((elemento) =>
      parseFloat(getComputedStyle(elemento).outlineWidth),
    ),
  ).toBeGreaterThanOrEqual(2);
  expect(
    await page
      .locator(".dd-mes__abrir")
      .first()
      .evaluate((elemento) => getComputedStyle(elemento).transitionProperty),
  ).toBe("none");
  await page.keyboard.press("Space");
  await expect(page.locator(".dd-mes").first()).not.toHaveAttribute("open");
});

test("todos os dados e controles nativos funcionam sem JavaScript a 375px", async ({
  browser,
}) => {
  const contexto = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 375, height: 900 },
  });
  const page = await contexto.newPage();
  await page.goto("http://localhost:3100/dados");
  await expect(page.locator(".dd-indicador__valor")).toHaveCount(
    INDICADORES.length,
  );
  await expect(page.locator(".dd-comparacao")).toHaveCount(SERIE_MENSAL.length);
  await page.locator(".dd-mes summary").first().click();
  await expect(page.locator(".dd-mes__contexto").first()).toBeVisible();
  await page.locator(".dd-serie__tabela summary").click();
  await expect(
    page.getByRole("table", {
      name: "Série mensal consolidada dos dois equipamentos",
    }),
  ).toBeVisible();
  expect(
    await page
      .locator(".dd-comparacao__ponto")
      .evaluateAll((pontos) =>
        pontos.every((ponto) => getComputedStyle(ponto).opacity === "1"),
      ),
  ).toBe(true);
  await contexto.close();
});
