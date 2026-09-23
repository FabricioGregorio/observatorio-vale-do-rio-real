import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * Acessibilidade da Prestação de Contas, depois da reorganização do Lote 3.
 *
 * A rota já tinha cobertura de overflow (`viewports-tema`, `prestacao-responsiva`)
 * e de conteúdo (`prestacao-acervo`), mas nenhuma varredura axe — e ela deixou de ser uma
 * tabela numa página para virar seis seções com fichas, tabela de conjunto,
 * lista de definição e régua de créditos. Cada uma dessas formas tem um jeito
 * próprio de errar nome acessível.
 *
 * O escopo é `main`: cabeçalho e rodapé do layout raiz são varridos pelas
 * suítes que os cobrem em todas as rotas.
 */

const ROTAS = ["/prestacao-de-contas", "/prestacao-de-contas/imprimir"];

for (const rota of ROTAS) {
  for (const tema of ["light", "dark"] as const) {
    test(`axe não encontra violação em ${rota}, tema ${tema}`, async ({
      page,
    }) => {
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

test.describe("estrutura da página de comprovação", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/prestacao-de-contas");
  });

  test("responde com um h1 só e sem salto de nível", async ({ page }) => {
    await expect(page.locator("main h1")).toHaveCount(1);
    const niveis = await page
      .locator("main h1, main h2, main h3")
      .evaluateAll((els) => els.map((el) => Number(el.tagName.slice(1))));
    for (const [i, nivel] of niveis.entries()) {
      if (i === 0) continue;
      expect(nivel - (niveis[i - 1] ?? 0)).toBeLessThanOrEqual(1);
    }
  });

  /*
    Seção sem nome acessível é uma região anônima para quem navega por
    landmarks — numa página que um avaliador percorre procurando uma coisa
    específica, é o pior lugar para isso acontecer.
  */
  test("toda seção do conteúdo tem nome acessível", async ({ page }) => {
    const secoes = page.locator("main section");
    const total = await secoes.count();
    expect(total).toBeGreaterThan(0);
    for (let i = 0; i < total; i += 1) {
      const secao = secoes.nth(i);
      const rotulo = await secao.getAttribute("aria-labelledby");
      expect(rotulo ?? (await secao.getAttribute("aria-label"))).toBeTruthy();
    }
  });

  /**
   * A régua de créditos é lista ordenada porque a ordem é normativa: quem
   * ouve precisa receber "2 de 2 — Realização", e não dois blocos soltos. Os
   * dois blocos e a ordem deles vêm dos manuais oficiais de uso de marca —
   * ver `componentes/institucional/creditos.ts`.
   */
  test("a régua de créditos é ordenada e fecha no Governo do Brasil", async ({
    page,
  }) => {
    /*
      Escopado ao conteúdo: desde que o rodapé global serve a mesma régua, ela
      existe duas vezes na página — de propósito, e da mesma fonte. O que este
      teste afirma é sobre a régua em destaque da Prestação de Contas.
    */
    const regua = page.locator("main .regua__niveis");
    await expect(regua).toHaveCount(1);
    expect(await regua.evaluate((el) => el.tagName)).toBe("OL");
    await expect(regua.locator("> li")).toHaveCount(2);
    await expect(
      regua.locator("> li").last().locator("img").last(),
    ).toHaveAttribute("alt", "Ministério da Cultura · Governo do Brasil");
  });

  /**
   * As cinco assinaturas oficiais entram aqui desde 2026-09-20, quando os manuais
   * foram localizados e lidos. Até então a régua era só texto, e este teste
   * exigia zero imagens — o que estava certo enquanto a aplicação não tinha
   * regra documental para seguir.
   *
   * O que ele passa a exigir é que as marcas venham **do manifesto**: cinco,
   * servidas de `/media/marcas`, e nenhuma de outra origem.
   */
  test("os créditos aplicam as cinco marcas do manifesto", async ({ page }) => {
    const marcas = page.locator("main .regua__marca");
    await expect(marcas).toHaveCount(5);
    const origens = await marcas.evaluateAll((imagens) =>
      imagens.map((img) => img.getAttribute("src") ?? "?"),
    );
    for (const origem of origens) {
      expect(origem, origem).toMatch(/^\/media\/marcas\/[a-z-]+\.webp$/);
    }
  });

  test("a contagem exibida é a mesma que a tabela lista", async ({
    page,
    request,
  }) => {
    const json = (await (await request.get("/anexos.json")).json()) as {
      total: number;
    };
    await expect(page.locator("main .pc-conjunto caption")).toContainText(
      `${json.total} arquivos públicos`,
    );
    // Copy varia por exceção: "Baixar original" ou "Baixar versão pública".
    await expect(page.getByRole("link", { name: /^Baixar /i })).toHaveCount(
      json.total,
    );
  });
});
