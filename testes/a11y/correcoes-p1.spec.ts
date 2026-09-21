import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const ROTAS_DO_SALTO = [
  "/",
  "/pesquisa",
  "/dados",
  "/territorio",
  "/campo",
  "/acervo",
  "/acessibilidade",
  "/privacidade",
  "/contato",
] as const;

for (const largura of [375, 768, 1440]) {
  for (const rota of ROTAS_DO_SALTO) {
    test(`salto mostra o título em ${rota} a ${largura}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: largura, height: 900 });
      await page.goto(rota);

      await page.keyboard.press("Tab");
      const salto = page.getByRole("link", { name: "Pular para o conteúdo" });
      await expect(salto).toBeFocused();
      await expect(salto).toBeVisible();
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(/#conteudo$/);

      const posicao = await page.evaluate(() => ({
        cabecalho: document
          .querySelector("body > .hl-topo")
          ?.getBoundingClientRect().bottom,
        titulo: document.querySelector("main h1")?.getBoundingClientRect().top,
      }));
      expect(posicao.cabecalho).toBeDefined();
      expect(posicao.titulo).toBeDefined();
      expect(posicao.titulo ?? -1).toBeGreaterThanOrEqual(
        (posicao.cabecalho ?? 0) - 1,
      );
      expect(posicao.titulo ?? Infinity).toBeLessThan(900);
    });
  }
}

for (const rota of ["/acervo", "/privacidade"] as const) {
  for (const largura of [320, 375, 768, 1440]) {
    test(`${rota} mantém a página dentro de ${largura}px`, async ({ page }) => {
      await page.setViewportSize({ width: largura, height: 900 });
      await page.goto(rota);
      const larguraDaPagina = await page.evaluate(() => ({
        conteudo: document.documentElement.scrollWidth,
        disponivel: document.documentElement.clientWidth,
      }));
      expect(larguraDaPagina.conteudo).toBeLessThanOrEqual(
        larguraDaPagina.disponivel,
      );
    });
  }
}

test("declara o e-mail para relatar barreiras", async ({ page }) => {
  await page.goto("/acessibilidade");
  const secao = page.getByRole("region", {
    name: "Como relatar um problema de acesso",
  });
  await expect(
    secao.getByRole("link", { name: "obstobiassoueu@gmail.com" }),
  ).toHaveAttribute("href", "mailto:obstobiassoueu@gmail.com");
  const texto = await secao.innerText();
  expect(texto).toContain("barreira de acesso ou uso");
  expect(texto).not.toContain("ainda não designou um canal");
  expect(texto).not.toContain("falta decidir");
});

for (const rota of ["/acervo", "/privacidade", "/acessibilidade"] as const) {
  for (const tema of ["light", "dark"] as const) {
    test(`axe em ${rota}, tema ${tema}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: tema });
      await page.goto(rota);
      const resultado = await new AxeBuilder({ page })
        .include("main")
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(resultado.violations).toEqual([]);
    });
  }
}
