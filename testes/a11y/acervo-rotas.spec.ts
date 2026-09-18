import { expect, test } from "@playwright/test";

const documento = "fotografias-visitas-i-vii";
const arquivoComCredito = "d0af646c-e6b0-423d-9edc-d5ffc74b246a";

test("documento e arquivo B01 exibem contexto, alt, crédito e canonical HTML", async ({
  page,
}) => {
  await page.goto(`/acervo/${documento}`);
  await expect(
    page.getByRole("navigation", { name: "Caminho da página" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.goto(`/acervo/${documento}/arquivo/${arquivoComCredito}`);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Retrato em ambiente interno",
    }),
  ).toBeVisible();
  await expect(page.locator("main img")).toHaveAttribute(
    "alt",
    "Homem de óculos e camisa branca posa em ambiente interno, com outras pessoas ao fundo.",
  );
  await expect(page.locator("main img")).toHaveAttribute("width", "1280");
  await expect(page.getByText("Foto: Dani Santos")).toBeVisible();
  await expect(page.getByText("Informações técnicas")).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    `https://observatoriotobiassoueu.com.br/acervo/${documento}/arquivo/${arquivoComCredito}`,
  );
  const src = await page.locator("main img").getAttribute("src");
  expect(src).toMatch(
    /^https:\/\/acervo\.observatoriotobiassoueu\.com\.br\/arquivos\//,
  );
  expect(src).not.toContain("/_next/image");
});

test("UUID inválido, documento errado e arquivo desconhecido retornam o mesmo 404", async ({
  request,
}) => {
  for (const caminho of [
    `/acervo/${documento}/arquivo/invalido`,
    `/acervo/identidade-visual/arquivo/${arquivoComCredito}`,
    `/acervo/${documento}/arquivo/00000000-0000-4000-8000-000000000000`,
    "/acervo/documento-inexistente",
  ]) {
    expect((await request.get(caminho)).status()).toBe(404);
  }
});
