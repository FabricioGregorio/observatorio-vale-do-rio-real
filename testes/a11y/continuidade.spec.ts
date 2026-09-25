import { expect, test } from "@playwright/test";

/** O caderno de escuta continua: começar, saltar à transcrição, seguir. */

test("quem nunca ouviu começa pelo episódio 1, e segue para o 2", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/podobservar");
  await page.getByRole("link", { name: "Começar pelo episódio 1" }).click();
  await expect(page).toHaveURL(/\/podobservar\/t1\/01-[a-z-]+$/);
  await expect(
    page.getByRole("link", { name: /^Episódio anterior/ }),
  ).toHaveCount(0);
  await page.getByRole("link", { name: /^Próximo episódio/ }).click();
  await expect(page).toHaveURL(/\/podobservar\/t1\/02-[a-z-]+$/);
});

test("o EP02 volta ao 1 e segue para o 3; o EP04 não promete um quinto", async ({
  page,
}) => {
  await page.goto("/podobservar/t1/02-conheca-o-recanto-da-serra");
  await expect(
    page.getByRole("link", { name: /^Episódio anterior/ }),
  ).toHaveAttribute("href", /\/t1\/01-/);
  await expect(
    page.getByRole("link", { name: /^Próximo episódio/ }),
  ).toHaveAttribute("href", /\/t1\/03-/);
  await page.goto("/podobservar/t1/04-entre-dados-e-fatos");
  await expect(
    page.getByRole("link", { name: /^Próximo episódio/ }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: /^Episódio anterior/ }),
  ).toHaveAttribute("href", /\/t1\/03-/);
});

for (const largura of [320, 1440]) {
  test(`"Ir para a transcrição" mostra o título abaixo do cabeçalho em ${largura}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: largura, height: 800 });
    await page.goto("/podobservar/t1/04-entre-dados-e-fatos");
    await page.getByRole("link", { name: "Ir para a transcrição" }).click();
    await expect(page).toHaveURL(/#pod-transcricao-titulo$/);
    const titulo = page.locator("#pod-transcricao-titulo");
    await expect(titulo).toBeInViewport();
    const cabecalho = await page.locator("header").first().boundingBox();
    expect((await titulo.boundingBox())?.y ?? 0).toBeGreaterThanOrEqual(
      (cabecalho?.y ?? 0) + (cabecalho?.height ?? 0),
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}
