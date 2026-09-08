import { expect, test } from "@playwright/test";

test("referência visual continua disponível no servidor de desenvolvimento", async ({
  page,
}) => {
  const resposta = await page.goto("/dev/estilos");

  expect(resposta?.status()).toBe(200);
  await expect(
    page.getByRole("heading", { level: 1, name: "Referência visual" }),
  ).toBeVisible();
  await expect(page.getByText("Link de exemplo")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Botão de exemplo" }),
  ).toBeVisible();
});
