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

  test("o título usa a largura editorial aprovada sem quebra manual", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const titulo = page.locator("#hero-home h1");

    const medidas = await titulo.evaluate((elemento) => {
      const range = document.createRange();
      range.selectNodeContents(elemento);
      const topos = [...range.getClientRects()].map((retangulo) =>
        Math.round(retangulo.top * 100),
      );
      return {
        largura: elemento.getBoundingClientRect().width,
        linhas: new Set(topos).size,
        quebrasManuais: elemento.querySelectorAll("br").length,
      };
    });

    expect(medidas.largura).toBeGreaterThanOrEqual(800);
    expect(medidas.largura).toBeLessThanOrEqual(950);
    expect(medidas.linhas).toBe(2);
    expect(medidas.quebrasManuais).toBe(0);
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

  test("integra uma única cartografia B sem rótulos de desenvolvimento", async ({
    page,
  }) => {
    await page.goto("/");
    const territorio = page.getByTestId("territorio-home");

    await expect(territorio).toHaveAttribute("data-profundidade", "moderada");
    await expect(territorio.locator("svg")).toHaveCount(1);
    await expect(territorio.locator("svg path[data-codigo]")).toHaveCount(75);
    await expect(territorio.locator("svg path.h")).toHaveCount(3);
    await expect(territorio.locator("svg circle.p")).toHaveCount(0);
    await expect(page.getByText(/Preset B/i)).toHaveCount(0);
    await expect(page.getByText(/Proposta editorial/i)).toHaveCount(0);
  });

  test("preserva Vale, comparação e lista territorial progressiva", async ({
    page,
  }) => {
    await page.goto("/");
    const territorio = page.getByTestId("territorio-home");
    const indice = territorio.locator("details");
    const itens = territorio.locator("#territorio-home-lista > [data-codigo]");

    await expect(indice).not.toHaveAttribute("open", "");
    await expect(
      territorio.getByText("Índice acessível — 75 municípios"),
    ).toBeVisible();
    await expect(itens).toHaveCount(75);
    await expect(itens.filter({ hasText: "Vale do Rio Real" })).toHaveCount(5);

    const saoCristovao = itens.filter({ hasText: /^São Cristóvão/ });
    await expect(saoCristovao).toContainText(
      "Comparação de políticas públicas",
    );
    await expect(saoCristovao).not.toContainText("Vale do Rio Real");
  });

  test("mapa e índice selecionam por teclado e atualizam o mesmo painel", async ({
    page,
  }) => {
    await page.goto("/");
    const territorio = page.getByTestId("territorio-home");
    const mapa = territorio.getByRole("listbox", {
      name: "Mapa dos 75 municípios de Sergipe",
    });
    const tobias = mapa.getByRole("option", { name: /Tobias Barreto/ });

    await tobias.focus();
    await tobias.press("Enter");
    await expect(tobias).toHaveAttribute("aria-selected", "true");
    await expect(territorio.locator("#territorio-home-painel")).toContainText(
      "Entrevista — Secretaria de Cultura",
    );

    await territorio.getByText("Índice acessível — 75 municípios").click();
    const indice = territorio.getByRole("listbox", {
      name: /Índice acessível — 75 municípios/,
    });
    const primeira = indice.getByRole("option").first();
    await primeira.focus();
    await primeira.press("ArrowDown");
    await expect(indice.getByRole("option").nth(1)).toBeFocused();
    await indice.getByRole("option").nth(1).press("Space");
    await expect(indice.getByRole("option").nth(1)).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  test("Território sucede o Hero e respeita movimento reduzido", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    const ordem = await page.evaluate(() => {
      const hero = document.querySelector("#hero-home");
      const territorio = document.querySelector("#territorio-home");
      if (hero === null || territorio === null) return null;
      return Boolean(
        hero.compareDocumentPosition(territorio) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      );
    });
    expect(ordem).toBe(true);

    const duracao = await page
      .locator("#territorio-home svg")
      .evaluate((elemento) => getComputedStyle(elemento).transitionDuration);
    expect(["0s", "0.00001s", "1e-05s"]).toContain(duracao);
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
