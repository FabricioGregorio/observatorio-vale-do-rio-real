import { expect, type Locator, test } from "@playwright/test";

const ROTAS_COM_RODAPE_COMPARTILHADO = [
  "/podobservar",
  "/territorio",
  "/acervo",
  "/observatorio",
  "/pesquisa",
] as const;

async function razaoDeContraste(alvo: Locator): Promise<number> {
  return alvo.evaluate((elemento) => {
    const canais = (cor: string): number[] =>
      (cor.match(/[\d.]+/g) ?? []).map(Number);
    const luminancia = (cor: string): number => {
      const [r = 0, g = 0, b = 0] = canais(cor).map((valor) => {
        const canal = valor / 255;
        return canal <= 0.03928
          ? canal / 12.92
          : ((canal + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const frente = getComputedStyle(elemento).color;
    let ancestral: Element | null = elemento;
    let fundo = getComputedStyle(document.body).backgroundColor;
    while (ancestral !== null) {
      const candidato = getComputedStyle(ancestral).backgroundColor;
      const valores = canais(candidato);
      if (valores.length >= 3 && (valores[3] === undefined || valores[3] > 0)) {
        fundo = candidato;
        break;
      }
      ancestral = ancestral.parentElement;
    }

    const [claro, escuro] = [luminancia(frente), luminancia(fundo)].sort(
      (a, b) => b - a,
    );
    return ((claro ?? 0) + 0.05) / ((escuro ?? 0) + 0.05);
  });
}

for (const tema of ["light", "dark"] as const) {
  test.describe(`rodapé no tema ${tema}`, () => {
    for (const rota of ROTAS_COM_RODAPE_COMPARTILHADO) {
      test(`${rota}: crédito de fomento passa AA`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: tema });
        await page.goto(rota);
        const titulo = page.locator("#creditos-fomento");
        await expect(titulo).toBeVisible();
        expect(await razaoDeContraste(titulo)).toBeGreaterThanOrEqual(4.5);
      });
    }

    test("episódio: crédito de fomento passa AA", async ({ page }) => {
      await page.emulateMedia({ colorScheme: tema });
      await page.goto("/podobservar");
      const episodio = page.locator('main a[href^="/podobservar/t"]').first();
      await expect(episodio).toBeVisible();
      await episodio.click();
      await expect(page).toHaveURL(/\/podobservar\/t\d+\//);
      const titulo = page.locator("#creditos-fomento");
      await expect(titulo).toBeVisible();
      expect(await razaoDeContraste(titulo)).toBeGreaterThanOrEqual(4.5);
    });

    test("Home preserva o contraste do rodapé próprio", async ({ page }) => {
      await page.emulateMedia({ colorScheme: tema });
      await page.goto("/");
      const link = page.locator(".hl-rodape a").first();
      await expect(link).toBeVisible();
      expect(await razaoDeContraste(link)).toBeGreaterThanOrEqual(4.5);
    });
  });
}
