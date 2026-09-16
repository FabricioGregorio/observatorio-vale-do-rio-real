import { expect, test } from "@playwright/test";

/**
 * O Acervo cresce a partir da fonte da verdade, então o total esperado vem de
 * `/anexos.json` — o mesmo build, a mesma view. O que o teste fixa é a forma:
 * link permanente sob o domínio próprio e **nenhum download automático**.
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
  const { total } = (await (await request.get("/anexos.json")).json()) as {
    total: number;
  };
  const resposta = await page.goto("/acervo");
  expect(resposta?.status()).toBe(200);
  await expect(
    page.getByRole("heading", { level: 1, name: "Acervo" }),
  ).toBeVisible();

  const links = page.locator('main a[href^="https://"]');
  await expect(links).toHaveCount(total);
  for (const href of await links.evaluateAll((elementos) =>
    elementos.map((elemento) => elemento.getAttribute("href")),
  )) {
    expect(href).toMatch(
      /^https:\/\/acervo\.observatoriotobiassoueu\.com\.br\/arquivos\//,
    );
  }
  expect(documentosCarregados).toEqual([]);
});

test("documentos multiarquivo permanecem agrupados numa ficha só", async ({
  page,
}) => {
  await page.goto("/acervo");
  const fotografias = page.getByRole("region", {
    name: /Fotografias de comprovação/i,
  });
  await expect(fotografias).toHaveCount(1);
  await expect(fotografias.getByRole("link")).toHaveCount(59);
  await expect(fotografias.getByText("59 arquivos públicos")).toBeVisible();
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
    pagina.locator('main a[href^="https://"]').first(),
  ).toBeAttached();
  expect(
    await pagina.locator('main a[href^="https://"]').count(),
  ).toBeGreaterThan(8);
  await contexto.close();
});
