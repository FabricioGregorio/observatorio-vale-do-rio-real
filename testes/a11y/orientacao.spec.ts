import { expect, type Page, test } from "@playwright/test";

/**
 * Índices das páginas longas no navegador: o salto chega, o título aparece
 * abaixo do cabeçalho fixo, a URL guarda o hash e o teclado alcança tudo.
 */

async function tituloVisivelAbaixoDoCabecalho(page: Page, id: string) {
  const titulo = page.locator(`[id="${id}"]`);
  await expect(titulo).toBeInViewport();
  const cabecalho = await page.locator("header").first().boundingBox();
  const caixa = await titulo.boundingBox();
  expect(caixa?.y ?? 0, id).toBeGreaterThanOrEqual(
    (cabecalho?.y ?? 0) + (cabecalho?.height ?? 0),
  );
}

async function alvosDoIndice(page: Page, rotulo: string) {
  return page
    .getByRole("navigation", { name: rotulo })
    .getByRole("link")
    .evaluateAll((links) =>
      links.map((link) => (link.getAttribute("href") ?? "").slice(1)),
    );
}

for (const [rota, rotulo, quantidade] of [
  ["/pesquisa", "Partes da pesquisa", 6],
  ["/campo", "Lugares nesta página", 4],
] as const) {
  for (const { largura, altura } of [
    { largura: 320, altura: 740 },
    { largura: 1440, altura: 900 },
  ]) {
    test(`${rota}: entrada direta por hash mostra o título em ${largura}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: largura, height: altura });
      await page.goto(rota);
      const alvos = await alvosDoIndice(page, rotulo);
      expect(alvos).toHaveLength(quantidade);
      for (const alvo of alvos) {
        await page.goto(`${rota}#${alvo}`);
        await tituloVisivelAbaixoDoCabecalho(page, alvo);
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    });
  }

  test(`${rota}: o índice funciona por teclado e o histórico volta ao topo`, async ({
    page,
  }) => {
    await page.goto(rota);
    const alvos = await alvosDoIndice(page, rotulo);
    const ultimo = alvos.at(-1) ?? "";
    const link = page
      .getByRole("navigation", { name: rotulo })
      .getByRole("link")
      .last();
    await link.focus();
    expect(
      await link.evaluate((a) => getComputedStyle(a).outlineStyle),
    ).not.toBe("none");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(new RegExp(`#${ultimo}$`));
    await tituloVisivelAbaixoDoCabecalho(page, ultimo);
    await page.goBack();
    await expect(page).toHaveURL(new RegExp(`${rota}$`));
  });
}

test("Texto maior: os índices quebram em linhas, sem rolagem horizontal", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem("observatorio-texto", "maior"),
  );
  await page.setViewportSize({ width: 320, height: 740 });
  for (const [rota, rotulo] of [
    ["/pesquisa", "Partes da pesquisa"],
    ["/campo", "Lugares nesta página"],
  ] as const) {
    await page.goto(rota);
    const nav = page.getByRole("navigation", { name: rotulo });
    const medidas = await nav.evaluate((n) => ({
      sw: n.scrollWidth,
      cw: n.clientWidth,
      pagina: document.documentElement.scrollWidth,
    }));
    expect(medidas.sw, rota).toBeLessThanOrEqual(medidas.cw);
    expect(medidas.pagina, rota).toBeLessThanOrEqual(320);
  }
});
