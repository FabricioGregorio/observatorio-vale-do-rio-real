import { expect, test } from "@playwright/test";

/**
 * Acervo → busca → documento → retorno, no navegador. A URL é a memória:
 * nenhum passo depende do histórico.
 */

test("A: Secretaria → entrevista → volta à mesma busca, com o motivo à vista", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/acervo?q=Secretaria");
  const cartao = page.locator(".acervo-card", {
    hasText: "Josenilson Bispo",
  });
  await expect(cartao.locator(".acervo-motivo")).toContainText(
    "Secretaria de Cultura",
  );
  await cartao.getByRole("link", { name: /Abrir documento/ }).click();
  await expect(page).toHaveURL(
    /\/acervo\/entrevista-josenilson-bispo\?q=Secretaria$/,
  );
  await page
    .getByRole("link", { name: "Voltar aos resultados do Acervo" })
    .click();
  await expect(page).toHaveURL(/\/acervo\?q=Secretaria$/);
  await expect(
    page.getByRole("searchbox", { name: "Buscar documentos" }),
  ).toHaveValue("Secretaria");
  await expect(page.locator(".acervo-card")).toHaveCount(2);
});

test("B: busca e tipo voltam juntos", async ({ page }) => {
  await page.goto("/acervo?q=Recanto&tipo=entrevista_transcricao");
  await page
    .locator(".acervo-card")
    .getByRole("link", { name: /Abrir documento/ })
    .click();
  await expect(page).toHaveURL(
    /\/acervo\/entrevista-pedro-menezes\?q=Recanto&tipo=entrevista_transcricao$/,
  );
  await page
    .getByRole("link", { name: "Voltar aos resultados do Acervo" })
    .click();
  await expect(page).toHaveURL(
    /\/acervo\?q=Recanto&tipo=entrevista_transcricao$/,
  );
  await expect(page.getByLabel("Tipo de documento")).toHaveValue(
    "entrevista_transcricao",
  );
});

test("C e D: entrada direta e nova aba têm retorno válido sem histórico", async ({
  browser,
}) => {
  const contexto = await browser.newContext();
  const direta = await contexto.newPage();
  await direta.goto("/acervo/entrevista-pedro-menezes");
  await expect(
    direta.getByRole("link", { name: "Voltar ao Acervo", exact: true }),
  ).toHaveAttribute("href", "/acervo");
  // Nova aba com a URL da ficha já com consulta: sem histórico nenhum.
  const aba = await contexto.newPage();
  await aba.goto("/acervo/entrevista-pedro-menezes?q=Recanto");
  await aba
    .getByRole("link", { name: "Voltar aos resultados do Acervo" })
    .click();
  await expect(aba).toHaveURL(/\/acervo\?q=Recanto$/);
  await contexto.close();
});

test('"serie mensal" não repete o motivo que o arquivo já mostra', async ({
  page,
}) => {
  await page.goto("/acervo?q=serie+mensal");
  await expect(page.locator(".acervo-correspondencia")).toHaveCount(1);
  await expect(page.locator(".acervo-motivo")).toHaveCount(0);
});
