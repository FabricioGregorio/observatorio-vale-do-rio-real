import { expect, test } from "@playwright/test";

test("Acervo responde 200, apresenta só materiais públicos e links permanentes", async ({
  page,
}) => {
  const documentosCarregados: string[] = [];
  page.on("request", (pedido) => {
    if (/\.(?:pdf|zip)(?:\?|$)/i.test(pedido.url())) {
      documentosCarregados.push(pedido.url());
    }
  });
  const resposta = await page.goto("/acervo");
  expect(resposta?.status()).toBe(200);
  await expect(
    page.getByRole("heading", { level: 1, name: "Acervo" }),
  ).toBeVisible();
  await expect(
    page.getByText(/A04|entrevista|formulário|transcrição/i),
  ).toHaveCount(0);

  const links = page.locator('main a[href^="https://"]');
  await expect(links).toHaveCount(8);
  for (const href of await links.evaluateAll((elementos) =>
    elementos.map((elemento) => elemento.getAttribute("href")),
  )) {
    expect(href).toMatch(/^https:\/\//);
  }
  expect(documentosCarregados).toEqual([]);
});

for (const largura of [375, 1440]) {
  test(`Acervo é legível, sem overflow, em ${largura}px`, async ({ page }) => {
    await page.setViewportSize({ width: largura, height: 900 });
    await page.goto("/acervo");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.emulateMedia({ colorScheme: "dark" });
    await expect(
      page.getByRole("heading", { level: 1, name: "Acervo" }),
    ).toBeVisible();
  });
}

test("conteúdo essencial do Acervo permanece no HTML sem JavaScript", async ({
  browser,
}) => {
  const contexto = await browser.newContext({ javaScriptEnabled: false });
  const pagina = await contexto.newPage();
  await pagina.goto("/acervo");
  await expect(
    pagina.getByRole("heading", { level: 1, name: "Acervo" }),
  ).toBeVisible();
  await expect(pagina.locator('main a[href^="https://"]')).toHaveCount(8);
  await contexto.close();
});
