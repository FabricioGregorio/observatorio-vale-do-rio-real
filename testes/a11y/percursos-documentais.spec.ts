import { expect, test } from "@playwright/test";

/**
 * Percursos documentais no navegador: o clique chega aonde o rótulo promete,
 * e o alvo aparece — não fica sob o cabeçalho fixo.
 */

for (const largura of [390, 1440]) {
  test(`"Fotografias de campo" chega ao título do lugar em /campo, visível, em ${largura}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: largura, height: 900 });
    for (const id of [
      "recanto-da-serra",
      "borda-da-mata",
      "serra-dos-macacos",
      "ilha-grande",
    ]) {
      await page.goto(`/campo#campo-${id}-titulo`);
      const titulo = page.locator(`#campo-${id}-titulo`);
      await expect(titulo).toBeInViewport();
      const cabecalho = await page
        .locator("body > header, header")
        .first()
        .boundingBox();
      const caixa = await titulo.boundingBox();
      expect(caixa?.y ?? 0, id).toBeGreaterThanOrEqual(
        (cabecalho?.y ?? 0) + (cabecalho?.height ?? 0),
      );
    }
  });
}

test("na Home, a entrevista e o CTA levam aos destinos prometidos", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .locator(".hl-entrevistas")
    .getByRole("link", { name: "Secretaria Municipal de Cultura" })
    .click();
  await expect(page).toHaveURL(/\/acervo\/entrevista-laerte-aguiar$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Laerte Santos Aguiar",
  );

  await page.goto("/");
  await page.getByRole("link", { name: "Conhecer a pesquisa" }).click();
  await expect(page).toHaveURL(/\/pesquisa$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "A Pesquisa",
  );
});

test('"Entrevista gravada" abre a ficha com áudio e transcrição', async ({
  page,
}) => {
  await page.goto("/pesquisa");
  const materiais = page.locator(".pq-materiais");
  await materiais
    .getByRole("link", { name: "Entrevista gravada" })
    .first()
    .click();
  await expect(page).toHaveURL(/\/acervo\/entrevista-[a-z-]+$/);
  await expect(page.getByText("Áudio da entrevista")).toBeVisible();
  await expect(page.getByText("Transcrição da entrevista")).toBeVisible();
});
