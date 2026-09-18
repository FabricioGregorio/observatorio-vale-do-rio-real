import { expect, test } from "@playwright/test";

/**
 * O índice é documental; os objetos binários só são oferecidos nas páginas
 * contextuais e não são carregados automaticamente na abertura.
 */
test("Acervo responde 200, lista todo o acervo público e não baixa nada sozinho", async ({
  page,
  request,
}) => {
  const documentosCarregados: string[] = [];
  page.on("request", (pedido) => {
    if (/\.(?:pdf|zip|xlsx|m4a|mp3)(?:\?|$)/i.test(pedido.url())) {
      documentosCarregados.push(pedido.url());
    }
  });
  const { anexos, total } = (await (
    await request.get("/anexos.json")
  ).json()) as {
    total: number;
    anexos: Array<{ slug: string }>;
  };
  expect(total).toBe(109);
  const resposta = await page.goto("/acervo");
  expect(resposta?.status()).toBe(200);
  await expect(
    page.getByRole("heading", { level: 1, name: "Acervo" }),
  ).toBeVisible();

  const links = page.locator('main a[href^="/acervo/"]');
  await expect(links).toHaveCount(new Set(anexos.map((a) => a.slug)).size);
  for (const href of await links.evaluateAll((elementos) =>
    elementos.map((elemento) => elemento.getAttribute("href")),
  )) {
    expect(href).toMatch(/^\/acervo\/[^/]+$/);
  }
  expect(documentosCarregados).toEqual([]);
});

test("B01 abre dez grupos e 59 páginas contextuais, sem carregar imagens", async ({
  page,
}) => {
  await page.goto("/acervo");
  const link = page.locator('main a[href="/acervo/fotografias-visitas-i-vii"]');
  await expect(link).toHaveCount(1);
  await link.click();
  await expect(page.locator("main section")).toHaveCount(10);
  await expect(page.locator('main a[href*="/arquivo/"]')).toHaveCount(59);
  await expect(page.locator("main img")).toHaveCount(0);
  await expect(
    page.getByText(/58 fotografias e 1 elemento gráfico/),
  ).toBeVisible();
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
  await expect(
    pagina.locator('main a[href^="/acervo/"]').first(),
  ).toBeAttached();
  expect(
    await pagina.locator('main a[href^="/acervo/"]').count(),
  ).toBeGreaterThan(8);
  await contexto.close();
});
