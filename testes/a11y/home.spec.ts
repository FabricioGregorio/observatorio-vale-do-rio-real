import { expect, test } from "@playwright/test";

/**
 * Home estrutural — Tarefa 10A.
 *
 * Cobre a estrutura entregue e, principalmente, o que a fatia decidiu NÃO
 * entregar: nenhuma apresentação institucional, nenhum comparativo municipal e
 * nenhum número de indicador. Um teste que só verificasse presença deixaria
 * passar exatamente o erro que importa aqui.
 */

test.describe("Home", () => {
  test("tem um único h1 com o nome oficial", async ({ page }) => {
    await page.goto("/");
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toHaveCount(1);
    await expect(h1).toHaveText("Observatório do Vale do Rio Real");
  });

  test("leva à Sala do Avaliador como ação principal", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("link", { name: "Abrir a Prestação de Contas" }),
    ).toBeVisible();
  });

  test("mostra os caminhos prioritários", async ({ page }) => {
    await page.goto("/");
    const caminhos = page.getByRole("navigation", {
      name: "Caminhos prioritários",
    });
    for (const destino of [
      "/prestacao-de-contas",
      "/pesquisa",
      "/podobservar",
      "/dados",
    ]) {
      await expect(caminhos.locator(`a[href="${destino}"]`)).toHaveCount(1);
    }
  });

  test("declara o estado dos destinos ainda sem conteúdo", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Em preparação").first()).toBeVisible();
  });

  test("aponta o acervo legível por máquina", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('a[href="/anexos.json"]')).toHaveCount(1);
  });

  /**
   * Guarda ajustado na Tarefa 10B.3.3, e vale registrar por quê.
   *
   * Até aqui este teste proibia os nomes "Itabaianinha" e "São Cristóvão" na
   * Home, como atalho para detectar o comparativo municipal. Com o mapa
   * territorial, os 75 municípios de Sergipe passaram a ser nomeados — e isso
   * é dado oficial do IBGE, não comparativo. O atalho deixou de servir.
   *
   * O que continua proibido é o que sempre importou: indicador, número de
   * pesquisa e linguagem de comparação entre municípios. É isso que o teste
   * verifica agora, sem confundir "nomear" com "comparar".
   */
  test("não publica indicador nem comparativo municipal", async ({ page }) => {
    await page.goto("/");
    const conteudo = (await page.locator("main").innerText()).toLowerCase();

    // Painel de indicadores: só depois da tabela `indicador` (Tarefa 13).
    expect(conteudo).not.toContain("indicador");
    // Vocabulário de comparativo, que depende de fonte oficial comparável.
    expect(conteudo).not.toContain("habitantes");
    expect(conteudo).not.toContain("população");
    expect(conteudo).not.toContain("comparativo");
    expect(conteudo).not.toContain("ranking");
  });

  test("cabe em 360 px sem rolagem horizontal", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 720 });
    await page.goto("/");
    const transborda = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(transborda).toBe(false);
  });
});
