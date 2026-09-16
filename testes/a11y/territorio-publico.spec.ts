import { expect, test } from "@playwright/test";

test("Território público preserva quatro lugares e lazy loading das camadas", async ({
  page,
}) => {
  const camadas: string[] = [];
  page.on("request", (pedido) => {
    if (pedido.url().includes("/territorio/camada-local/"))
      camadas.push(pedido.url());
  });

  const resposta = await page.goto("/territorio");
  expect(resposta?.status()).toBe(200);
  await expect(
    page.getByRole("heading", { level: 1, name: "Cartografia Viva" }),
  ).toBeVisible();
  expect(camadas).toHaveLength(0);

  const percurso = page.getByRole("navigation", { name: "Explore os lugares" });
  for (const lugar of [
    "Recanto da Serra",
    "Museu Borda da Mata",
    "Serra dos Macacos",
    "Ilha Grande",
  ]) {
    await percurso.getByRole("tab", { name: new RegExp(lugar) }).click();
  }
  await expect.poll(() => camadas.length).toBe(4);
  expect(camadas.every((url) => !url.includes("/dev/"))).toBe(true);
});

for (const largura of [375, 1440]) {
  test(`Território público sem overflow em ${largura}px`, async ({ page }) => {
    await page.setViewportSize({ width: largura, height: 900 });
    await page.goto("/territorio");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.emulateMedia({ colorScheme: "dark" });
    await expect(page.locator("#territorio-vivo")).toBeVisible();
  });
}

test("Território mantém conteúdo essencial sem JavaScript", async ({
  browser,
}) => {
  const contexto = await browser.newContext({ javaScriptEnabled: false });
  const pagina = await contexto.newPage();
  await pagina.goto("/territorio");
  await expect(
    pagina.getByRole("heading", { level: 1, name: "Cartografia Viva" }),
  ).toBeVisible();
  await expect(
    pagina.getByRole("heading", { level: 2, name: "Serra dos Macacos" }),
  ).toBeAttached();
  await contexto.close();
});
