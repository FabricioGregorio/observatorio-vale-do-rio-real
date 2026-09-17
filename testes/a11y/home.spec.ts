import { expect, test } from "@playwright/test";

/**
 * Home pública — candidata v2 promovida a `/` em 2026-09-16.
 *
 * Os cenários da composição H0–H4.1 que esta suíte guardava saíram com ela:
 * aquela Home continua versionada como baseline de rollback, mas não é mais
 * o que `/` serve. O que **não** saiu — e é o que este arquivo protege — são
 * os contratos que nunca foram de uma composição específica: um `h1`,
 * landmarks, navegação, teclado, movimento reduzido, funcionamento sem
 * JavaScript, privacidade e ausência de material interno no conteúdo público.
 *
 * O mapa territorial tem suíte própria em `mapa.spec.ts`.
 */

const NOME_OFICIAL =
  "Observatório de Cultura e Economia Criativa da Região do Vale do Rio Real";

const CAPITULOS = [
  "hl-origem",
  "hl-territorio",
  "hl-lugares",
  "hl-leitura",
  "hl-escuta",
  "hl-produtos",
  "hl-conferencia",
];

test.describe("Home", () => {
  test("tem um único h1 com o nome oficial", async ({ page }) => {
    await page.goto("/");
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toHaveCount(1);
    await expect(h1).toHaveText(NOME_OFICIAL);
  });

  test("serve a abertura B2 aprovada, com a identificação documental da fotografia", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator('[data-abertura="b2"]')).toHaveCount(1);
    await expect(
      page.locator(".ab-b2__legenda").getByText("Recanto da Serra"),
    ).toBeVisible();
    await expect(page.locator(".ab-b2__legenda")).toContainText("05/04/2026");
  });

  test("os grafismos territoriais são discretos, decorativos e não interativos", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page.locator('[data-grafismo-topografia="true"]')).toHaveCount(
      1,
    );
    const grafismos = page.locator("[data-grafismo-territorial]");
    await expect(grafismos).toHaveCount(2);

    const estilos = await grafismos.evaluateAll((elementos) =>
      elementos.map((elemento) => {
        const estilo = getComputedStyle(elemento);
        return {
          oculto: elemento.getAttribute("aria-hidden"),
          focavel: elemento.getAttribute("focusable"),
          opacidade: Number(estilo.opacity),
          eventos: estilo.pointerEvents,
        };
      }),
    );
    for (const estilo of estilos) {
      expect(estilo.oculto).toBe("true");
      expect(estilo.focavel).toBe("false");
      expect(estilo.eventos).toBe("none");
      expect(estilo.opacidade).toBeGreaterThan(0);
      expect(estilo.opacidade).toBeLessThanOrEqual(0.16);
    }
  });

  test("mantém os sete capítulos na ordem narrativa aprovada", async ({
    page,
  }) => {
    await page.goto("/");
    const ids = await page
      .locator("section.hl-capitulo")
      .evaluateAll((secoes) => secoes.map((s) => s.id));
    expect(ids).toEqual(CAPITULOS);
  });

  test("declara os landmarks de navegação e conteúdo", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    await expect(page.locator("#cabecalho-home")).toHaveCount(1);
    await expect(
      page.getByRole("navigation", { name: "Principal", exact: true }),
    ).toBeVisible();
    await expect(page.locator("main#conteudo")).toHaveCount(1);
  });

  test("o cabeçalho separa quatro destinos principais e três conteúdos", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    const nav = page.getByRole("navigation", {
      name: "Principal",
      exact: true,
    });
    for (const destino of [
      "/observatorio",
      "/pesquisa",
      "/territorio",
      "/dados",
    ]) {
      await expect(nav.locator(`a[href="${destino}"]`)).toHaveCount(1);
    }
    await expect(nav.getByRole("link")).toHaveCount(4);
    await nav.getByRole("button", { name: /Conteúdos/ }).click();
    for (const destino of ["/campo", "/podobservar", "/acervo"]) {
      await expect(nav.locator(`a[href="${destino}"]`)).toHaveCount(1);
    }
    await expect(nav.locator('a[href="/educacao"]')).toHaveCount(0);
  });

  test("leva à Sala do Avaliador pela ação institucional do cabeçalho", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await expect(
      page
        .locator("#cabecalho-home")
        .getByRole("link", { name: /Prestação de contas/ }),
    ).toBeVisible();
  });

  test("usa o ícone oficial escolhido e não a assinatura anterior", async ({
    page,
  }) => {
    await page.goto("/");
    const cabecalho = page.locator("#cabecalho-home");
    await expect(
      cabecalho.locator('img[src$="observatorio-icone-oficial-96.png"]'),
    ).toHaveCount(1);
    await expect(
      cabecalho.locator('img[src$="observatorio-monocromatica-escura.svg"]'),
    ).toHaveCount(0);
  });

  test("links e utilidades têm hover e foco perceptíveis", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const cabecalho = page.locator("#cabecalho-home");
    const link = cabecalho.getByRole("link", { name: "O Observatório" });
    const acessibilidade = cabecalho.getByRole("button", {
      name: "Acessibilidade",
    });
    const prestacao = cabecalho.getByRole("link", {
      name: /Prestação de contas/,
    });

    const corInicial = await acessibilidade.evaluate(
      (elemento) => getComputedStyle(elemento).backgroundColor,
    );
    await acessibilidade.hover();
    await page.waitForTimeout(200);
    expect(
      await acessibilidade.evaluate(
        (elemento) => getComputedStyle(elemento).backgroundColor,
      ),
    ).not.toBe(corInicial);

    await prestacao.hover();
    await expect(prestacao).toBeVisible();

    await link.focus();
    expect(
      await link.evaluate(
        (elemento) => getComputedStyle(elemento).outlineStyle,
      ),
    ).not.toBe("none");
    await acessibilidade.focus();
    expect(
      await acessibilidade.evaluate(
        (elemento) => getComputedStyle(elemento).outlineStyle,
      ),
    ).not.toBe("none");
  });

  test("menu compacto mantém contraste, navegação e retorno de foco", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    const menu = page.getByRole("button", { name: "Menu", exact: true });

    await expect(menu).toBeVisible();
    expect(
      await menu.evaluate((elemento) => getComputedStyle(elemento).color),
    ).toBe("rgb(231, 229, 222)");

    await menu.click();
    await expect(
      page.getByRole("link", { name: "Acervo", exact: true }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(menu).toBeFocused();
  });

  test("a Central de Acessibilidade funciona e devolve o foco", async ({
    page,
  }) => {
    await page.goto("/");
    const gatilho = page.getByRole("button", { name: "Acessibilidade" });
    await gatilho.click();

    const painel = page.getByRole("dialog", { name: "Acessibilidade" });
    await expect(painel).toBeVisible();
    await page.getByRole("button", { name: "Escuro" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-tema", "escuro");

    await page.keyboard.press("Escape");
    await expect(painel).toBeHidden();
    await expect(gatilho).toBeFocused();
  });

  test("a Central de Acessibilidade fecha ao clicar fora", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Acessibilidade" }).click();
    const painel = page.getByRole("dialog", { name: "Acessibilidade" });
    await expect(painel).toBeVisible();
    await page.locator("h1").click();
    await expect(painel).toBeHidden();
  });

  test("o CTA principal é alcançável por teclado e tem foco visível", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");

    let alcancou = false;
    for (let i = 0; i < 30 && !alcancou; i++) {
      await page.keyboard.press("Tab");
      alcancou = await page.evaluate(() =>
        /Conhecer a pesquisa/.test(document.activeElement?.textContent ?? ""),
      );
    }
    expect(alcancou).toBe(true);

    const contorno = await page.evaluate(
      () => getComputedStyle(document.activeElement as Element).outlineStyle,
    );
    expect(contorno).not.toBe("none");
  });

  test("aponta o acervo legível por máquina", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('a[href="/anexos.json"]')).toHaveCount(1);
  });

  test("a Home não carrega grafismo figurativo", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('img[src*="/media/grafismos/"]')).toHaveCount(0);
  });
});

/**
 * Estes são os contratos que a promoção não podia afrouxar. Valem para
 * qualquer composição servida em `/`, e caíram fora da suíte da Home antiga
 * apenas porque ela deixou de ser a Home — não porque deixaram de valer.
 */
test.describe("Home — o que não pode ser publicado", () => {
  test("não compara município nem publica indicador reservado", async ({
    page,
  }) => {
    await page.goto("/");
    const conteudo = (await page.locator("main").innerText()).toLowerCase();

    expect(conteudo).not.toContain("habitantes");
    expect(conteudo).not.toContain("população");
    expect(conteudo).not.toContain("comparativo");
    expect(conteudo).not.toContain("ranking");
    expect(conteudo).not.toContain("valor movimentado por dia");
    expect(conteudo).not.toContain("registros de operação");
  });

  /**
   * A03 e A04 continuam fora do lote público e B01 continua restrito como
   * conjunto. O identificador, o título interno e o caminho do arquivo não
   * podem aparecer no HTML servido.
   */
  test("não expõe conjunto restrito nem relatório fora do lote público", async ({
    page,
  }) => {
    await page.goto("/");
    const html = await page.content();

    expect(html).not.toMatch(/\bB01\b/);
    expect(html).not.toMatch(/\bA0[34]\b/);
    expect(html).not.toContain("fotografias de comprovação");
    expect(html).not.toContain("relatorio-tecnico-serra-dos-macacos");
  });

  /**
   * Os blocos de fontes do experimento citam caminho de repositório, código de
   * fase, documento interno e instrução de trabalho. São instrumento do
   * laboratório: em `publico` não são renderizados — e "não renderizados"
   * quer dizer fora da árvore, não escondidos.
   */
  test("nenhum material interno de desenvolvimento chega ao público", async ({
    page,
  }) => {
    await page.goto("/");
    /*
      O texto lido, e não `page.content()`: em desenvolvimento o Next injeta
      caminhos de origem no payload de hidratação, que não são conteúdo da
      página. O que precisa estar limpo é o que a pessoa lê.
    */
    const lido = await page.evaluate(() => document.body.innerText);

    for (const vestigio of [
      "Fontes desta seção",
      "experimento",
      "somente DEV",
      "Preset",
      "Não publicar",
      "AGENTS.md",
      "src/dados",
      "src/app",
      "docs/01",
      "handoff",
      "ESTADO_ATUAL",
      "AUDITORIA_FONTES",
      "MAPA_FONTES",
    ]) {
      expect(lido, vestigio).not.toContain(vestigio);
    }
    expect(lido).not.toMatch(/C:\\Users/);
  });

  test("não oferece rota de desenvolvimento ao visitante", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('a[href^="/dev/"]')).toHaveCount(0);
  });
});

test.describe("Home — apresentação", () => {
  for (const largura of [320, 375, 768, 1024, 1280, 1440]) {
    for (const tema of ["light", "dark"] as const) {
      test(`${largura}px no tema ${tema} não transborda nem perde alt`, async ({
        page,
      }) => {
        await page.emulateMedia({ colorScheme: tema });
        await page.setViewportSize({ width: largura, height: 900 });
        await page.goto("/");

        const medidas = await page.evaluate(() => {
          const foto =
            document.querySelector<HTMLImageElement>(".ab-b2__foto img");
          const folha = document.querySelector<HTMLElement>(".ab-b2__folha");
          const numeros = document.querySelector<HTMLElement>(
            ".ab-b2__provas-rotulo",
          );
          if (!foto || !folha || !numeros)
            throw new Error("Abertura B2 incompleta");
          const quadro = foto.getBoundingClientRect();
          return {
            rolagem: document.documentElement.scrollWidth,
            janela: window.innerWidth,
            semAlt: [...document.images].filter((i) => !i.hasAttribute("alt"))
              .length,
            foto: {
              esquerda: quadro.left,
              direita: quadro.right,
              base: quadro.bottom,
            },
            folha: folha.getBoundingClientRect().top,
            numeros: numeros.getBoundingClientRect().top,
            recorte: getComputedStyle(foto).clipPath,
          };
        });
        expect(medidas.rolagem).toBeLessThanOrEqual(medidas.janela);
        expect(medidas.semAlt).toBe(0);
        expect(medidas.foto.esquerda).toBe(0);
        expect(medidas.foto.direita).toBe(largura);
        expect(medidas.recorte).toBe("none");
        expect(medidas.numeros).toBeGreaterThan(medidas.foto.base);
        if (largura >= 960) {
          expect(medidas.foto.base - medidas.folha).toBeCloseTo(108, 0);
        } else {
          expect(medidas.folha).toBeGreaterThanOrEqual(medidas.foto.base);
        }
      });
    }
  }

  test("equivalente a zoom 200% mantém título e navegação utilizáveis", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 720, height: 450 });
    await page.goto("/");

    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      ),
    ).toBe(false);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Menu", exact: true }),
    ).toBeVisible();
  });

  test("com movimento reduzido nada anima e nada some", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    const animado = await page.evaluate(() =>
      [...document.querySelectorAll("#home-livre *")]
        .map((e) => getComputedStyle(e))
        .some(
          (s) => s.animationName !== "none" && s.animationDuration !== "0s",
        ),
    );
    expect(animado).toBe(false);

    const ids = await page
      .locator("section.hl-capitulo")
      .evaluateAll((secoes) => secoes.map((s) => s.id));
    expect(ids).toHaveLength(7);
  });
});

/**
 * A ilha do mapa **acrescenta** exploração; ela não é condição de leitura.
 * Sem JavaScript a Home precisa continuar inteira e honesta.
 */
test.describe("Home sem JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("os sete capítulos e o título continuam servidos", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      NOME_OFICIAL,
    );
    const ids = await page
      .locator("section.hl-capitulo")
      .evaluateAll((secoes) => secoes.map((s) => s.id));
    expect(ids).toEqual(CAPITULOS);
  });

  test("a leitura quantitativa continua completa", async ({ page }) => {
    await page.goto("/");
    const leitura = page.locator("#hl-leitura");

    await expect(
      leitura.getByRole("heading", { name: "Onde o recurso circula" }),
    ).toBeVisible();
    await expect(leitura).toContainText("Retenção municipal da despesa");
  });

  test("a navegação principal continua alcançável", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const nav = page.getByRole("navigation", {
      name: "Principal",
      exact: true,
    });
    await expect(nav.getByRole("link")).toHaveCount(7);
  });
});
