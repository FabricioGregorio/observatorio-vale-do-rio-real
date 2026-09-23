import { expect, test } from "@playwright/test";

/**
 * Antirregressão dos dois bloqueios encontrados no primeiro deployment
 * controlado na Vercel (2026-09-08).
 *
 * 1. A página oferecia "Baixar tudo (.zip)" para um objeto que nunca foi enviado
 *    ao R2, e o link respondia 404.
 * 2. Em viewport de 375 px, `documentElement.scrollWidth` ia a 629 px na página e
 *    na versão imprimível. A causa não era a tabela — ela sempre foi clipada
 *    pelo contêiner de rolagem —, e sim os `<code class="sr-only">` do SHA-256
 *    integral: sendo `position: absolute` sem ancestral posicionado, seu bloco
 *    container era o `<html>`, então o contêiner de rolagem não os clipava.
 */

const ROTAS = ["/prestacao-de-contas", "/prestacao-de-contas/imprimir"];

/** Largura real da viewport de layout; `innerWidth` mente sob emulação. */
const LARGURA_DA_PAGINA = `(() => ({
  clientWidth: document.documentElement.clientWidth,
  scrollWidth: document.documentElement.scrollWidth,
}))()`;

test.describe("Prestação de Contas em 375 px", () => {
  for (const rota of ROTAS) {
    test(`${rota} não rola na horizontal`, async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto(rota);

      const medida = await page.evaluate<{
        clientWidth: number;
        scrollWidth: number;
      }>(LARGURA_DA_PAGINA);

      expect(medida.clientWidth).toBe(375);
      // Tolerância de 1 px para arredondamento de subpixel; 629 não passa.
      expect(medida.scrollWidth).toBeLessThanOrEqual(medida.clientWidth + 1);
    });

    test(`${rota} mantém a rolagem dentro do contêiner da tabela`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto(rota);

      // A informação não foi truncada nem escondida: a tabela continua larga,
      // só que a rolagem é dela, não da página.
      const conteiner = page.getByRole("region", { name: /rolável/i });
      const rola = await conteiner.evaluate(
        (el) => el.scrollWidth > el.clientWidth,
      );
      expect(rola).toBe(true);

      // E o conteúdo rolado continua alcançável por teclado: a última coluna
      // tem o `<summary>` do hash integral, então tabular rola a tabela até o
      // fim sem depender de mouse.
      const ultimaColuna = conteiner
        .getByRole("group")
        .last()
        .getByText("Ver hash integral");
      await ultimaColuna.focus();
      await expect(ultimaColuna).toBeFocused();
    });
  }

  for (const largura of [768, 1440]) {
    test(`a página continua sem overflow em ${largura} px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: largura, height: 900 });
      await page.goto("/prestacao-de-contas");

      const medida = await page.evaluate<{
        clientWidth: number;
        scrollWidth: number;
      }>(LARGURA_DA_PAGINA);

      expect(medida.scrollWidth).toBeLessThanOrEqual(medida.clientWidth + 1);
    });
  }
});

test.describe("CTA do pacote .zip", () => {
  test("sem ZIP publicado, o download agregado não é oferecido", async ({
    page,
  }) => {
    await page.goto("/prestacao-de-contas");

    await expect(page.getByRole("link", { name: /baixar tudo/i })).toHaveCount(
      0,
    );
    await expect(page.locator('a[href$="anexos.zip"]')).toHaveCount(0);
  });

  test("os anexos individuais continuam disponíveis", async ({
    page,
    request,
  }) => {
    const { total } = (await (await request.get("/anexos.json")).json()) as {
      total: number;
    };
    await page.goto("/prestacao-de-contas");

    expect(total).toBeGreaterThan(0);
    // Copy varia por exceção: "Baixar original" ou "Baixar versão pública".
    await expect(page.getByRole("link", { name: /^Baixar /i })).toHaveCount(
      total,
    );
  });
});
