import { expect, test } from "@playwright/test";

/**
 * Fotografia → ficha, e ficha em entrada direta: a pessoa que chega pelo
 * Google, sem referrer e sem query, encontra onde e quando.
 */

test("a fotografia do Diário de Campo abre a própria ficha", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/campo#campo-ilha-grande-titulo");
  const secao = page.locator("section", {
    has: page.locator("#campo-ilha-grande-titulo"),
  });
  const link = secao
    .getByRole("link", { name: /^Ver ficha da fotografia/ })
    .first();
  const nome = (await link.getAttribute("href")) ?? "";
  const titulo = ((await link.textContent()) ?? "").split(": ")[1] ?? "";
  await link.click();
  await expect(page).toHaveURL(new RegExp(`${nome}$`));
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(titulo);
  await expect(
    page.getByText("Ilha Grande (Povoado Ilha Grande)"),
  ).toBeVisible();
});

for (const largura of [320, 1440]) {
  test(`ficha fotográfica em entrada direta, sem referrer, em ${largura}px`, async ({
    browser,
  }) => {
    const contexto = await browser.newContext({
      viewport: { width: largura, height: 800 },
      colorScheme: "dark",
    });
    const page = await contexto.newPage();
    const resposta = await page.goto(
      "/acervo/fotografias-visitas-i-vii/arquivo/37bdd488-38ed-47ab-b6c3-0fa43a4734af",
      { referer: "" },
    );
    expect(resposta?.status()).toBe(200);
    const dados = page.getByRole("definition");
    await expect(page.getByText("Data do registro")).toBeVisible();
    await expect(page.getByText("Publicado em")).toBeVisible();
    await expect(dados.filter({ hasText: "11/04/2026" })).toHaveCount(1);
    await expect(
      page.getByRole("heading", { level: 2, name: "Relacionado" }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await contexto.close();
  });
}

test("ficha de entrevista em entrada direta mostra lugar e relacionados", async ({
  page,
}) => {
  await page.goto("/acervo/entrevista-pedro-menezes");
  await expect(
    page.getByRole("definition").filter({ hasText: "Recanto da Serra" }),
  ).toHaveCount(1);
  const relacionados = page.locator(".acervo-relacionados");
  await expect(
    relacionados.getByRole("link", { name: "Quem a pesquisa ouviu" }),
  ).toBeVisible();
  await relacionados
    .getByRole("link", { name: "Recanto da Serra no Diário de Campo" })
    .click();
  await expect(page).toHaveURL(/\/campo#campo-recanto-da-serra-titulo$/);
  await expect(page.locator("#campo-recanto-da-serra-titulo")).toBeInViewport();
});
