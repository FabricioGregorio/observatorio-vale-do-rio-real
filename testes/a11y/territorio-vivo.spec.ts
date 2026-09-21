import { expect, test } from "@playwright/test";

/**
 * Laboratório territorial (`/dev/territorio-vivo`). DEV; 404 em produção.
 *
 * O laboratório renderiza o mesmo componente da rota pública, apontando as
 * camadas locais para a rota DEV. O contrato completo — fatos, camada local,
 * teclado, axe, sem JavaScript — mora em `territorio-publico.spec.ts`, que
 * roda contra `/territorio`. Aqui fica só o que é próprio do laboratório: ele
 * abre, e busca as camadas pela rota dele.
 */

const ROTA = "/dev/territorio-vivo";

test("o laboratório abre o atlas e busca as camadas pela rota DEV", async ({
  page,
}) => {
  const camadas: string[] = [];
  page.on("request", (pedido) => {
    if (pedido.url().includes("/camada-local/")) camadas.push(pedido.url());
  });
  await page.goto(ROTA);
  await expect(page.locator("#territorio-vivo")).toHaveAttribute(
    "data-interativo",
    "true",
  );
  await expect(
    page.getByRole("heading", { level: 1, name: "Cartografia Viva" }),
  ).toBeVisible();
  expect(camadas).toHaveLength(0);

  await page
    .locator('[data-tv-carta="serra-dos-macacos"]')
    .scrollIntoViewIfNeeded();
  await expect(
    page.locator('[data-tv-carta="serra-dos-macacos"]'),
  ).toHaveAttribute("data-camada", "local");
  expect(camadas.length).toBeGreaterThan(0);
  expect(
    camadas.every((url) => url.includes("/dev/territorio-vivo/camada-local/")),
  ).toBe(true);
});
