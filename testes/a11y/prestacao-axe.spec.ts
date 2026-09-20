import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * Acessibilidade da Prestação de Contas, depois da reorganização do Lote 3.
 *
 * A rota já tinha cobertura de overflow (`viewports-tema`, `sala-responsiva`)
 * e de conteúdo (`sala`), mas nenhuma varredura axe — e ela deixou de ser uma
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
   * ouve precisa receber "4 de 4 — Assinatura federal", e não quatro blocos
   * soltos. Ver `componentes/institucional/creditos.ts`.
   */
  test("a régua de créditos é ordenada e fecha no Governo Federal", async ({
    page,
  }) => {
    const regua = page.locator("main .regua__niveis");
    await expect(regua).toHaveCount(1);
    expect(await regua.evaluate((el) => el.tagName)).toBe("OL");
    await expect(regua.locator("> li")).toHaveCount(4);
    await expect(regua.locator("> li").last()).toContainText("Governo Federal");
  });

  /*
    Nenhuma marca oficial entra enquanto o manual de aplicação estiver
    pendente. Um `<img>` aqui significaria que a pendência foi resolvida por
    interpretação.
  */
  test("os créditos não aplicam marca oficial", async ({ page }) => {
    await expect(page.locator("main .regua img")).toHaveCount(0);
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
    await expect(
      page.getByRole("link", { name: "Baixar", exact: true }),
    ).toHaveCount(json.total);
  });
});
