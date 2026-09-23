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
  const idCanonico = page.url().split("/").pop();
  expect(idCanonico).not.toBe(arquivoComCredito);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    `https://observatoriotobiassoueu.com.br/acervo/${documento}/arquivo/${idCanonico}`,
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

test("SVG e segundo crédito permanecem contextualizados sem otimização de imagem", async ({
  page,
}) => {
  for (const [id, credito, extensao] of [
    ["86e03efb-e3df-4d19-a922-2314c957943a", "", ".svg"],
    [
      "0780c902-bb26-4004-ac50-86247c139cc2",
      "Foto: Iago de Andrade Santos",
      ".webp",
    ],
  ]) {
    await page.goto(`/acervo/${documento}/arquivo/${id}`);
    const imagem = page.locator("main img");
    await expect(imagem).toHaveCount(1);
    expect(await imagem.getAttribute("src")).toContain(extensao);
    expect(await imagem.getAttribute("alt")).not.toBe("");
    if (credito) await expect(page.getByText(credito)).toBeVisible();
  }
});

test("fotografia vertical conserva dimensões e não cria overflow em 375px", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(
    `/acervo/${documento}/arquivo/ed101d77-0437-439e-b353-3b9a25f6cf9f`,
  );
  await expect(page.locator("main img")).toHaveAttribute("height", "2302");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
