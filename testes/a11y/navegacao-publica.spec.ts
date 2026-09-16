import { expect, test } from "@playwright/test";

const ITENS = [
  ["O Observatório", "/observatorio"],
  ["A Pesquisa", "/pesquisa"],
  ["Território", "/territorio"],
  ["Dados", "/dados"],
  ["Diário de Campo", "/campo"],
  ["PodObservar", "/podobservar"],
  ["Acervo", "/acervo"],
] as const;

for (const largura of [320, 375, 768, 900, 1024, 1280, 1440]) {
  test(`menu aprovado sem overflow em ${largura}px`, async ({ page }) => {
    await page.setViewportSize({ width: largura, height: 900 });
    await page.goto("/");
    const diagnosticarCabecalho = () =>
      page.evaluate(() => {
        const raiz = document.querySelector("#cabecalho-home");
        if (raiz === null) return [{ seletor: "#cabecalho-home ausente" }];
        return [raiz, ...raiz.querySelectorAll("*")]
          .filter((elemento) => {
            const caixa = elemento.getBoundingClientRect();
            const visivel = caixa.width > 0 && caixa.height > 0;
            return (
              visivel &&
              (caixa.right > window.innerWidth + 1 || caixa.left < -1)
            );
          })
          .slice(0, 8)
          .map((elemento) => ({
            seletor: `${elemento.tagName.toLowerCase()}${elemento.id ? `#${elemento.id}` : ""}${elemento.classList.length ? `.${[...elemento.classList].join(".")}` : ""}`,
            caixa: elemento.getBoundingClientRect().toJSON(),
          }));
      });

    if (largura < 1360) {
      const gatilho = page.getByRole("button", { name: "Menu", exact: true });
      await gatilho.click();
      const links = page
        .getByRole("navigation", { name: "Principal (telas estreitas)" })
        .getByRole("link");
      await expect(links).toHaveCount(7);
      expect(await links.allTextContents()).toEqual(
        ITENS.map(([rotulo]) => rotulo),
      );
      expect(await diagnosticarCabecalho()).toEqual([]);
      await page.keyboard.press("Escape");
      await expect(gatilho).toBeFocused();
    } else {
      const menu = page.getByRole("navigation", {
        name: "Principal",
        exact: true,
      });
      await expect(menu).toBeVisible();
      const links = menu.getByRole("link");
      await expect(links).toHaveCount(7);
      expect(await links.allTextContents()).toEqual(
        ITENS.map(([rotulo]) => rotulo),
      );
    }

    expect(await diagnosticarCabecalho()).toEqual([]);
  });
}

test("menu móvel preserva ordem, Enter, Esc e devolução de foco", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto("/");
  const gatilho = page.getByRole("button", { name: "Menu", exact: true });
  await gatilho.focus();
  await page.keyboard.press("Enter");

  const menu = page.getByRole("navigation", {
    name: "Principal (telas estreitas)",
  });
  const links = menu.getByRole("link");
  await expect(links).toHaveCount(7);
  expect(await links.allTextContents()).toEqual(
    ITENS.map(([rotulo]) => rotulo),
  );
  await page.keyboard.press("Escape");
  await expect(gatilho).toBeFocused();
});

test("equivalente a 1440px com zoom 200% usa a navegação estreita sem overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 720, height: 450 });
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Menu", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
