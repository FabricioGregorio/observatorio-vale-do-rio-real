import { expect, test } from "@playwright/test";

/**
 * Laboratório territorial (`/dev/territorio-vivo`). DEV; 404 em produção.
 */

const ROTA = "/dev/territorio-vivo";

async function focarAba(page: import("@playwright/test").Page, nome: RegExp) {
  await page.getByRole("tab", { name: nome }).focus();
}

test("abre na visão geral, com lista textual e ficha do Vale", async ({
  page,
}) => {
  await page.goto(ROTA);
  const raiz = page.locator("#territorio-vivo");
  await expect(raiz).toHaveAttribute("data-interativo", "true");
  await expect(raiz).toHaveAttribute("data-foco", "vale");
  await expect(page.getByRole("tab")).toHaveCount(5);
  await expect(
    page.getByRole("tab", { name: /Vale do Rio Real/ }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(
    page.getByRole("tabpanel", { name: "Vale do Rio Real" }),
  ).toBeVisible();
  await expect(page.locator("h1")).toHaveCount(1);
});

test("seleção por teclado troca a ficha inteira e o estado do mapa", async ({
  page,
}) => {
  await page.goto(ROTA);
  await focarAba(page, /Vale do Rio Real/);
  await page.keyboard.press("ArrowDown");
  await expect(
    page.getByRole("tab", { name: /Recanto da Serra/ }),
  ).toBeFocused();
  await page.keyboard.press("Enter");

  const aba = page.getByRole("tab", { name: /Recanto da Serra/ });
  await expect(aba).toHaveAttribute("aria-selected", "true");
  await expect(
    page.getByRole("tabpanel", { name: "Recanto da Serra" }),
  ).toBeVisible();
  await expect(
    page.getByRole("tabpanel", { name: "Vale do Rio Real" }),
  ).toBeHidden();
  await expect(page.locator("#territorio-vivo")).toHaveAttribute(
    "data-foco",
    "2807402",
  );
  await expect(page).toHaveURL(/#lugar-recanto-da-serra$/);
  await expect(page.locator("[data-tv-regiao-anuncio]")).toContainText(
    "Recanto da Serra selecionado",
  );
  const contorno = await aba.evaluate(
    (el) => getComputedStyle(el).outlineStyle,
  );
  expect(contorno).not.toBe("none");
});

test("lugar sem localização publicada não aproxima o mapa", async ({
  page,
}) => {
  await page.goto(ROTA);
  await page.getByRole("tab", { name: /Ilha Grande/ }).click();
  await expect(page.locator("#territorio-vivo")).toHaveAttribute(
    "data-foco",
    "sem-local",
  );
  await expect(
    page.getByRole("tabpanel", { name: "Ilha Grande" }).locator(".lacuna"),
  ).toBeVisible();
});

test("com movimento reduzido, a troca de estado do mapa é imediata", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(ROTA);
  await page.getByRole("tab", { name: /Recanto da Serra/ }).click();
  const escala = await page.locator(".tv-mundo").evaluate((el) => {
    const m = new DOMMatrixReadOnly(getComputedStyle(el).transform);
    return m.a;
  });
  expect(escala).toBeGreaterThan(1.5);
});

for (const tema of ["light", "dark"] as const) {
  for (const largura of [375, 1440]) {
    test(`${largura}px, tema ${tema}: sem transbordo e sem imagem sem alt`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme: tema });
      await page.setViewportSize({ width: largura, height: 900 });
      await page.goto(`${ROTA}#lugar-recanto-da-serra`);
      const d = await page.evaluate(() => ({
        cliente: document.documentElement.clientWidth,
        rolagem: document.documentElement.scrollWidth,
        semAlt: [...document.images].filter((i) => !i.hasAttribute("alt"))
          .length,
      }));
      expect(d.rolagem).toBeLessThanOrEqual(d.cliente);
      expect(d.semAlt).toBe(0);
    });
  }
}
