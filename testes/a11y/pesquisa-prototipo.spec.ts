import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

const ROTA = "/dev/pesquisa";
const PRESETS = ["documental-aberto", "caderno-tecnico"] as const;

function preset(page: Page, nome: (typeof PRESETS)[number]) {
  return page.getByTestId(`preset-${nome}`);
}

test.describe("protótipo Pesquisa em Campo H3", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ROTA);
  });

  test("renderiza A/B com o mesmo conteúdo, alt e legendas", async ({
    page,
  }) => {
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Pesquisa em Campo — duas densidades editoriais",
    );

    for (const nome of PRESETS) {
      const secao = preset(page, nome);
      await expect(secao.getByText("02 — PESQUISA EM CAMPO")).toHaveCount(1);
      await expect(secao.locator("figure")).toHaveCount(3);
      await expect(secao.locator("figure img[alt]:not([alt=''])")).toHaveCount(
        3,
      );
      await expect(secao.locator("figure figcaption")).toHaveCount(3);
      await expect(secao.locator("img[loading='lazy']")).toHaveCount(3);
    }
    await expect(
      page.locator(
        "head link[rel='preload'][as='image'][href*='/media/pesquisa']",
      ),
    ).toHaveCount(0);
  });

  test("a ordem no mobile é título, foto, texto e registros seguintes", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.reload();

    for (const nome of PRESETS) {
      const secao = preset(page, nome);
      const ordens = await secao.evaluate((elemento) => {
        const principal = elemento.querySelector(".pesquisa-campo__principal");
        const texto = elemento.querySelector(".pesquisa-campo__texto");
        const secundarias = elemento.querySelector(
          ".pesquisa-campo__secundarias",
        );
        return [principal, texto, secundarias].map((item) =>
          item === null ? null : Number(getComputedStyle(item).order),
        );
      });
      expect(ordens).toEqual([1, 2, 3]);
    }
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
      });
    }
  }

  test("zoom de 200% preserva conteúdo e não cria overflow", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 750, height: 900 });
    await page.evaluate(() => {
      document.documentElement.style.zoom = "2";
    });
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true);
    await expect(
      page.getByText("Atividade no forno a lenha").first(),
    ).toBeVisible();
  });

  test("movimento reduzido não encontra animação ou transição editorial", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();
    const estilos = await preset(page, "documental-aberto").evaluate(
      (elemento) => {
        const fotografia = elemento.querySelector("img");
        if (fotografia === null) return null;
        const estilo = getComputedStyle(fotografia);
        return {
          animacao: estilo.animationDuration,
          transicao: estilo.transitionDuration,
        };
      },
    );
    expect(["0s", "0.00001s", "1e-05s"]).toContain(estilos?.animacao);
    expect(["0s", "0.00001s", "1e-05s"]).toContain(estilos?.transicao);
  });

  test("a rota não entra no sitemap e permanece bloqueada no robots", async ({
    request,
  }) => {
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).not.toContain("/dev/pesquisa");
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toMatch(/Disallow: \/(?:dev\/)?(?:\r?\n|$)/);
  });
});
