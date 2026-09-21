import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("apresenta os canais distintos com destinos corretos", async ({
  page,
}) => {
  await page.goto("/contato");
  await expect(page).toHaveTitle("Contato — Observatório do Vale do Rio Real");
  await expect(page.locator("main h1")).toHaveCount(1);

  const contatos = [
    {
      entidade: "Observatório",
      links: [
        ["obstobiassoueu@gmail.com", "mailto:obstobiassoueu@gmail.com", false],
        [
          "@obs_tobiassoueu",
          "https://www.instagram.com/obs_tobiassoueu/",
          true,
        ],
      ],
    },
    {
      entidade: "Coletivo Tobias Sou Eu",
      links: [
        [
          "coletivotobiassoueu@gmail.com",
          "mailto:coletivotobiassoueu@gmail.com",
          false,
        ],
        ["@tobiassoueu", "https://www.instagram.com/tobiassoueu/", true],
        ["@TobiassouEu", "https://www.youtube.com/@TobiassouEu", true],
      ],
    },
  ] as const;

  for (const contato of contatos) {
    const secao = page.locator("main").getByRole("region", {
      name: contato.entidade,
      exact: true,
    });
    await expect(secao).toHaveCount(1);
    for (const [nome, href, externo] of contato.links) {
      const link = secao.getByRole("link", { name: nome, exact: true });
      await expect(link).toHaveAttribute("href", href);
      if (externo) {
        await expect(link).toHaveAttribute("target", "_blank");
        await expect(link).toHaveAttribute("rel", "noopener noreferrer");
      } else {
        await expect(link).not.toHaveAttribute("target", "_blank");
      }
    }
  }

  const texto = (await page.locator("main").innerText()).toLowerCase();
  for (const antigo of [
    "ainda não há canal",
    "não há endereço de e-mail",
    "canal de atendimento ainda não disponível",
  ]) {
    expect(texto).not.toContain(antigo);
  }
});

for (const largura of [375, 768, 1440]) {
  test(`contato cabe em ${largura}px`, async ({ page }) => {
    await page.setViewportSize({ width: largura, height: 900 });
    await page.goto("/contato");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });
}

for (const tema of ["light", "dark"] as const) {
  test(`contato passa no axe em tema ${tema}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: tema });
    await page.goto("/contato");
    const resultado = await new AxeBuilder({ page })
      .include("main")
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(resultado.violations).toEqual([]);
  });
}
