import { expect, test } from "@playwright/test";

/**
 * Home v2 — candidata editorial experimental (`/dev/home-livre`).
 *
 * A rota é DEV e responde 404 em produção; estes cenários rodam contra o
 * servidor de desenvolvimento, como os demais laboratórios.
 */

const ROTA = "/dev/home-livre";
const NOME_OFICIAL =
  "Observatório de Cultura e Economia Criativa da Região do Vale do Rio Real";
const SECOES = [
  "hl-origem",
  "hl-territorio",
  "hl-lugares",
  "hl-leitura",
  "hl-escuta",
  "hl-produtos",
  "hl-conferencia",
];

test("candidata abre com a B2 por padrão e mantém a ordem das seções", async ({
  page,
}) => {
  await page.goto(ROTA);
  await expect(page.locator('[data-abertura="b2"]')).toHaveCount(1);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveText(NOME_OFICIAL);

  const ids = await page
    .locator("section.hl-capitulo")
    .evaluateAll((secoes) => secoes.map((s) => s.id));
  expect(ids).toEqual(SECOES);

  await expect(
    page
      .locator(".ab-b2__legenda")
      .getByText("Atribuição formal de local pendente"),
  ).toBeVisible();
});

for (const tema of ["light", "dark"] as const) {
  for (const largura of [375, 1440]) {
    test(`candidata em ${largura}px, tema ${tema}: sem transbordo e sem imagem sem alt`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme: tema });
      await page.setViewportSize({ width: largura, height: 900 });
      await page.goto(ROTA);

      const dimensoes = await page.evaluate(() => ({
        cliente: document.documentElement.clientWidth,
        rolagem: document.documentElement.scrollWidth,
        semAlt: [...document.images].filter((i) => !i.hasAttribute("alt"))
          .length,
      }));
      expect(dimensoes.rolagem).toBeLessThanOrEqual(dimensoes.cliente);
      expect(dimensoes.semAlt).toBe(0);
    });
  }
}

test("CTA principal é alcançável por teclado, com foco visível, e leva à pesquisa", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(ROTA);

  let alcancou = false;
  for (let i = 0; i < 30 && !alcancou; i++) {
    await page.keyboard.press("Tab");
    alcancou = await page.evaluate(() =>
      /Conhecer a pesquisa/.test(document.activeElement?.textContent ?? ""),
    );
  }
  expect(alcancou).toBe(true);

  const contorno = await page.evaluate(
    () => getComputedStyle(document.activeElement as Element).outlineStyle,
  );
  expect(contorno).not.toBe("none");

  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#hl-lugares$/);
});

test("com movimento reduzido, o CTA não anima", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(ROTA);
  const duracao = await page
    .getByRole("link", { name: /Conhecer a pesquisa/ })
    .evaluate((el) =>
      Number.parseFloat(getComputedStyle(el).transitionDuration),
    );
  expect(duracao).toBeLessThanOrEqual(0.01);
});
