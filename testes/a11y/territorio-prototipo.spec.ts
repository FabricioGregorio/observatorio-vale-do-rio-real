import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

const ROTA = "/dev/territorio";

function preset(page: Page, nome: string) {
  return page.getByTestId(`preset-${nome}`);
}

test.describe("protótipo territorial H2", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ROTA);
  });

  test("renderiza dois presets com a mesma geometria oficial", async ({
    page,
  }) => {
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Território — comparação de profundidade",
    );

    for (const nome of ["minima", "moderada"]) {
      const secao = preset(page, nome);
      await expect(secao.locator("svg")).toHaveCount(1);
      await expect(secao.locator("svg path[data-codigo]")).toHaveCount(75);
      await expect(secao.locator("svg path.h")).toHaveCount(3);
      await expect(secao.locator("svg use")).toHaveCount(0);
      await expect(secao.locator(":scope > style")).toHaveCount(1);
    }
  });

  test("hover e foco preservam feedback visual", async ({ page }) => {
    const mapa = preset(page, "minima").getByRole("listbox", {
      name: "Mapa dos 75 municípios de Sergipe",
    });
    const amparo = mapa.getByRole("option", {
      name: /Amparo do São Francisco/,
    });

    const preenchimentoInicial = await amparo.evaluate(
      (elemento) => getComputedStyle(elemento).fill,
    );
    await amparo.hover();
    await expect
      .poll(() =>
        amparo.evaluate((elemento) => getComputedStyle(elemento).fill),
      )
      .not.toBe(preenchimentoInicial);

    await amparo.focus();
    const espessura = await amparo.evaluate(
      (elemento) => getComputedStyle(elemento).strokeWidth,
    );
    expect(Number.parseFloat(espessura)).toBeGreaterThanOrEqual(2.4);
  });

  test("mouse sincroniza mapa, índice e painel factual", async ({ page }) => {
    const secao = preset(page, "minima");
    const mapa = secao.getByRole("listbox", {
      name: "Mapa dos 75 municípios de Sergipe",
    });
    const tobias = mapa.getByRole("option", { name: /Tobias Barreto/ });

    await tobias.click();
    await expect(tobias).toHaveAttribute("aria-selected", "true");
    await expect(
      secao.locator("#territorio-minima-lista [data-selecionado='true']"),
    ).toContainText("Tobias Barreto");
    await expect(secao.locator("#territorio-minima-painel")).toContainText(
      "Entrevista — Secretaria de Cultura",
    );
  });

  test("o índice também seleciona e atualiza o mesmo mapa", async ({
    page,
  }) => {
    const secao = preset(page, "moderada");
    const indice = secao.getByRole("listbox", {
      name: /Índice acessível — 75 municípios/,
    });
    const cristinapolis = indice.getByRole("option", {
      name: /Cristinápolis/,
    });

    await cristinapolis.click();
    await expect(cristinapolis).toHaveAttribute("aria-selected", "true");
    await expect(
      secao
        .getByRole("listbox", { name: "Mapa dos 75 municípios de Sergipe" })
        .getByRole("option", { name: /Cristinápolis/ }),
    ).toHaveAttribute("aria-selected", "true");
    await expect(secao.locator("#territorio-moderada-painel")).toContainText(
      "Vale do Rio Real",
    );
  });

  test("mapa e índice são uma parada de Tab cada e aceitam teclado", async ({
    page,
  }) => {
    const secao = preset(page, "minima");
    const mapa = secao.getByRole("listbox", {
      name: "Mapa dos 75 municípios de Sergipe",
    });
    await expect(mapa.locator("path[data-codigo][tabindex='0']")).toHaveCount(
      1,
    );

    const tobias = mapa.getByRole("option", { name: /Tobias Barreto/ });
    await tobias.focus();
    await tobias.press("Enter");
    await expect(tobias).toHaveAttribute("aria-selected", "true");
    await tobias.press("Escape");
    await expect(tobias).toHaveAttribute("aria-selected", "false");

    const indice = secao.getByRole("listbox", {
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

  test("São Cristóvão permanece comparação, e o Vale mantém cinco municípios", async ({
    page,
  }) => {
    const secao = preset(page, "minima");
    const itens = secao.locator("#territorio-minima-lista > [data-codigo]");
    await expect(itens.filter({ hasText: "Vale do Rio Real" })).toHaveCount(5);

    const saoCristovao = itens.filter({ hasText: /^São Cristóvão/ });
    await expect(saoCristovao).toContainText(
      "Comparação de políticas públicas",
    );
    await expect(saoCristovao).not.toContainText("Vale do Rio Real");
  });

  test("os quatro pontos sem coordenada ficam fora do SVG", async ({
    page,
  }) => {
    const secao = preset(page, "minima");
    await expect(secao.locator("svg circle.p")).toHaveCount(0);
    await expect(
      secao.getByText("sem coordenada", { exact: false }),
    ).toHaveCount(4);
  });

  test("movimento reduzido elimina a transição da perspectiva", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();
    const duracao = await preset(page, "moderada")
      .locator("svg")
      .evaluate((elemento) => getComputedStyle(elemento).transitionDuration);
    expect(["0s", "0.00001s", "1e-05s"]).toContain(duracao);
  });

  for (const tema of ["light", "dark"] as const) {
    for (const largura of [320, 375, 768, 1440]) {
      test(`${largura}px no tema ${tema} não transborda`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: tema });
        await page.setViewportSize({ width: largura, height: 900 });
        await page.reload();

        const dimensoes = await page.evaluate(() => ({
          clientWidth: document.documentElement.clientWidth,
          scrollWidth: document.documentElement.scrollWidth,
        }));
        expect(dimensoes.scrollWidth).toBeLessThanOrEqual(
          dimensoes.clientWidth,
        );

        for (const nome of ["minima", "moderada"]) {
          const caixa = await preset(page, nome).locator("svg").boundingBox();
          expect(caixa).not.toBeNull();
          expect(caixa?.width ?? 0).toBeGreaterThan(0);
          expect(caixa?.width ?? largura + 1).toBeLessThanOrEqual(largura);
        }
      });
    }
  }

  test("a rota não entra no sitemap e continua bloqueada no robots", async ({
    page,
    request,
  }) => {
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).not.toContain("/dev/territorio");

    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("Disallow: /dev/");

    await expect(page).toHaveURL(/\/dev\/territorio/);
  });
});
