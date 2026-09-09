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
    await expect(h1).toHaveText(
      "Observatório de Cultura e Economia Criativa da Região do Vale do Rio Real",
    );
  });

  test("leva à Sala do Avaliador pela ação institucional do cabeçalho", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page
        .locator("#cabecalho-home")
        .getByRole("link", { name: "Prestação de Contas", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Abrir a Prestação de Contas" }),
    ).toHaveCount(0);
  });

  test("integra somente o Hero B aprovado e mantém as marcas circulares", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("#hero-home")).toBeVisible();
    await expect(
      page.locator('#hero-home [data-marca-circular="true"]'),
    ).toHaveCount(2);
    await expect(page.locator("#hero-wordmark")).toHaveCount(0);
    await expect(page.locator("#hero-tipografia")).toHaveCount(0);
  });

  test("o cabeçalho real omite destinos sem rota e não duplica o banner", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    await expect(page.locator("header:visible")).toHaveCount(1);
    const nav = page.getByRole("navigation", { name: "Principal" });
    for (const rotulo of ["Território", "Acervo"]) {
      await expect(nav.getByText(rotulo, { exact: true })).toHaveCount(0);
    }
    for (const destino of [
      "/observatorio",
      "/pesquisa",
      "/dados",
      "/podobservar",
    ]) {
      await expect(nav.locator(`a[href="${destino}"]`)).toHaveCount(1);
    }
  });

  test("a Central de Acessibilidade funciona na Home", async ({ page }) => {
    await page.goto("/");
    const gatilho = page.getByRole("button", { name: "Acessibilidade" });
    await gatilho.click();

    const painel = page.getByRole("dialog", { name: "Acessibilidade" });
    await expect(painel).toBeVisible();
    await page.getByRole("button", { name: "Escuro" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-tema", "escuro");

    await page.keyboard.press("Escape");
    await expect(painel).toBeHidden();
    await expect(gatilho).toBeFocused();
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

  for (const largura of [320, 375, 768, 1440]) {
    for (const tema of ["light", "dark"] as const) {
      test(`${largura}px no tema ${tema} não tem overflow horizontal`, async ({
        page,
      }) => {
        await page.emulateMedia({ colorScheme: tema });
        await page.setViewportSize({ width: largura, height: 800 });
        await page.goto("/");
        const transborda = await page.evaluate(
          () => document.documentElement.scrollWidth > window.innerWidth,
        );
        expect(transborda).toBe(false);
      });
    }
  }

  test("equivalente a zoom 200% mantém título e transição utilizáveis", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 720, height: 450 });
    await page.goto("/");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      ),
    ).toBe(false);
    await expect(page.locator("#hero-home h1")).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Caminhos prioritários" }),
    ).toBeVisible();
  });
});
