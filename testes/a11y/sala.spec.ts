import { expect, test } from "@playwright/test";

test.describe("Sala do Avaliador vazia", () => {
  test("distingue ausência pública de conclusão e de item pendente", async ({
    page,
  }) => {
    await page.goto("/prestacao-de-contas");

    await expect(
      page.getByText("Não há anexos públicos disponíveis neste momento."),
    ).toBeVisible();
    await expect(
      page.getByText("O Caderno de Estudos continua PENDENTE", {
        exact: false,
      }),
    ).toBeVisible();
    await expect(
      page.getByText(
        "Isso não significa que a prestação de contas esteja concluída.",
      ),
    ).toBeVisible();
  });

  test("não oferece ZIP quando não há anexo público", async ({ page }) => {
    await page.goto("/prestacao-de-contas");

    await expect(
      page.getByText("Pacote .zip ainda não publicado"),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Baixar tudo (.zip)" }),
    ).toHaveCount(0);
  });

  test("expõe JSON vazio sem referência privada", async ({ request }) => {
    const resposta = await request.get("/anexos.json");
    expect(resposta.ok()).toBe(true);
    expect(resposta.headers()["content-type"]).toContain("application/json");

    const corpo = await resposta.text();
    const json = JSON.parse(corpo) as { total: number; anexos: unknown[] };
    expect(json.total).toBe(0);
    expect(json.anexos).toEqual([]);
    expect(corpo).not.toContain("D01-08");
    expect(corpo).not.toContain("STORAGE_PRIVATE");
    expect(corpo).not.toContain("chave_storage");
  });
});
