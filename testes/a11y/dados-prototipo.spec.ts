import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

const ROTA = "/dev/dados";
const PRESETS = ["declaracao", "painel"] as const;

function preset(page: Page, nome: (typeof PRESETS)[number]) {
  return page.getByTestId(`preset-${nome}`);
}

test.describe("protótipo Dados e indicadores H4", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ROTA);
  });

  test("os dois presets mostram os mesmos números", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Dados e indicadores — duas hierarquias",
    );

    for (const nome of PRESETS) {
      const secao = preset(page, nome);
      await expect(secao.getByText("03 — DADOS")).toHaveCount(1);
      await expect(secao.getByText("93,4%").first()).toBeVisible();
    }

    // A/B muda hierarquia e densidade, nunca o valor.
    const valores = await Promise.all(
      PRESETS.map(async (nome) =>
        preset(page, nome)
          .locator(".painel-dados__valor")
          .allInnerTexts()
          .then((textos) => [...textos].sort()),
      ),
    );
    const [declaracao = [], painel = []] = valores;
    for (const valor of declaracao) {
      expect(painel).toContain(valor);
    }
  });

  /**
   * O gráfico não pode ser a única forma do dado. Aqui isso é verificado de
   * duas maneiras: o SVG tem título e descrição de verdade, e a tabela com os
   * valores exatos está sempre no DOM, inclusive quando o SVG está oculto.
   */
  test("todo gráfico tem alternativa textual real", async ({ page }) => {
    for (const nome of PRESETS) {
      const secao = preset(page, nome);
      const grafico = secao.locator("svg[role='img']");
      await expect(grafico).toHaveCount(1);

      // `title` e `desc` são SVGElement: `textContent`, não `innerText`.
      const titulo = (await grafico.locator("title").textContent()) ?? "";
      const descricao = (await grafico.locator("desc").textContent()) ?? "";
      expect(titulo.length).toBeGreaterThan(20);
      expect(descricao.length).toBeGreaterThan(40);
      expect(titulo).not.toMatch(/^gr[áa]fico$/i);

      const tabela = secao.locator("table").first();
      await expect(tabela.locator("tbody tr")).toHaveCount(6);
      await expect(tabela).toContainText("R$ 4.867,80");
      await expect(tabela.locator("caption")).toHaveText(
        "Série mensal consolidada",
      );
    }
  });

  test("a barra do ranking não carrega o dado sozinha", async ({ page }) => {
    const ranking = preset(page, "painel").locator("table").nth(1);
    await expect(ranking.locator("tbody tr")).toHaveCount(16);
    await expect(ranking.locator("tbody tr").first()).toContainText("57,5%");
    await expect(ranking.locator("tbody tr").first()).toContainText("Museus");
    // O trilho é apoio visual e está fora da árvore de acessibilidade.
    await expect(
      ranking.locator(".painel-dados__trilho[aria-hidden='true']"),
    ).toHaveCount(16);
  });

  test("nenhuma fonte restrita nem dado pessoal aparece no HTML", async ({
    page,
  }) => {
    const html = await page.content();
    expect(html).not.toMatch(/\bA11\b/);
    expect(html).not.toMatch(/\bES\d{2}\b/);
    expect(html).not.toMatch(/Pessoas_Trabalho|Fornecedores|_Painel_Executivo/);
    expect(html).not.toMatch(/anexo-indicadores|\.xlsx/);
    expect(html).not.toMatch(/\d{3}\.\d{3}\.\d{3}-\d{2}/);
  });

  test("o título editorial continua marcado como proposta", async ({
    page,
  }) => {
    for (const nome of PRESETS) {
      await expect(
        preset(page, nome).getByText("Título editorial · proposta"),
      ).toHaveCount(1);
      await expect(preset(page, nome).getByText(/somente DEV/)).toHaveCount(1);
    }
  });

  test("a navegação por teclado alcança o conteúdo e mostra o foco", async ({
    page,
  }) => {
    await page.keyboard.press("Tab");
    const focado = await page.evaluate(() => {
      const alvo = document.activeElement;
      if (alvo === null) return null;
      const estilo = getComputedStyle(alvo);
      return {
        rotulo: (alvo.textContent ?? "").trim().slice(0, 40),
        contorno: estilo.outlineStyle,
        espessura: estilo.outlineWidth,
      };
    });
    expect(focado?.contorno).not.toBe("none");
    expect(focado?.espessura).not.toBe("0px");
  });

  test("o gráfico aparece na largura em que seu texto é legível", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.reload();
    await expect(
      preset(page, "declaracao").locator("svg[role='img']"),
    ).toBeVisible();

    await page.setViewportSize({ width: 375, height: 812 });
    await page.reload();
    await expect(
      preset(page, "declaracao").locator("svg[role='img']"),
    ).toBeHidden();
    // A tabela continua, e é ela que carrega o dado nessa largura.
    await expect(
      preset(page, "declaracao").locator("table").first(),
    ).toBeVisible();
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

  test("zoom de 200% preserva o número e não cria overflow", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 720, height: 900 });
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
      preset(page, "declaracao").getByText("93,4%").first(),
    ).toBeVisible();
  });

  test("movimento reduzido não encontra animação nem transição", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();
    const estilos = await preset(page, "declaracao").evaluate((elemento) => {
      const numero = elemento.querySelector(".painel-dados__numero");
      if (numero === null) return null;
      const estilo = getComputedStyle(numero);
      return {
        animacao: estilo.animationDuration,
        transicao: estilo.transitionDuration,
      };
    });
    expect(["0s", "0.00001s", "1e-05s"]).toContain(estilos?.animacao);
    expect(["0s", "0.00001s", "1e-05s"]).toContain(estilos?.transicao);
  });

  test("a rota não entra no sitemap e continua bloqueada no robots", async ({
    request,
  }) => {
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).not.toContain("/dev/dados");
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toMatch(/Disallow: \/(?:dev\/)?(?:\r?\n|$)/);
  });

  /**
   * Invariante trocada na H4.1, por instrução humana de 2026-09-12.
   *
   * Até aqui este teste afirmava "a Home continua sem a seção de dados", o que
   * era verdade enquanto H4 vivia só no laboratório. A H4.1 integrou a
   * composição aprovada, e a proposição caducou por decisão, não por acidente.
   *
   * O que ela protegia continua protegido, e de forma mais exata: a fronteira
   * entre **laboratório** e **seção pública** não é a ausência da H4 na Home —
   * é a Home receber a candidata aprovada, uma vez, e nada da casca de DEV nem
   * do painel da H4.0.
   */
  /**
   * A Home passou a ser a candidata v2, que tem leitura quantitativa própria
   * no capítulo IV. A seção pública H4.1 saiu de `/` junto com a composição
   * que a hospedava; o que continua valendo, e é o que importa vigiar, é que
   * nada do laboratório atravessa para o conteúdo público.
   */
  test("a Home tem uma leitura quantitativa, e nada do laboratório", async ({
    page,
  }) => {
    await page.goto("/");

    // 1. Exatamente um capítulo de leitura, com o título aprovado.
    const leitura = page.locator("#hl-leitura");
    await expect(leitura).toHaveCount(1);
    await expect(
      leitura.getByRole("heading", { name: "Onde o recurso circula" }),
    ).toBeVisible();

    // 2. A casca do laboratório não veio junto.
    await expect(page.getByTestId("dados-prototipo")).toHaveCount(0);

    // 3. O painel da H4.0 não veio junto: ele é outra composição, e continua
    //    sendo só de `/dev/dados`.
    await expect(page.locator(".painel-dados")).toHaveCount(0);
    await expect(page.getByTestId("preset-declaracao")).toHaveCount(0);
    await expect(page.getByTestId("preset-painel")).toHaveCount(0);

    // 4. Nada do que é reservado ao laboratório.
    for (const seletor of [
      ".dv-preview",
      ".dv-laboratorio",
      ".dv-reservados",
      ".dv-ranking",
      ".dv-proposta",
    ]) {
      await expect(page.locator(seletor)).toHaveCount(0);
    }

    // 5. O laboratório segue separado: 404 em produção é coberto acima, e
    //    aqui basta que a Home não o referencie.
    await expect(page.locator('a[href^="/dev/"]')).toHaveCount(0);
  });
});
