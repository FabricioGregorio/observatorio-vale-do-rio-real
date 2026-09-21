import AxeBuilder from "@axe-core/playwright";
import { type Browser, expect, type Page, test } from "@playwright/test";

/**
 * Interação da Cartografia Viva: a página inteira entende qual lugar está
 * sendo explorado.
 *
 * Estes testes olham o que o visitante percebe — qual item da faixa está
 * marcado, qual pin está aceso, para onde o foco vai, em que ponto a página
 * para —, e não como a ilha cliente faz isso. O contrato de base (realce entre
 * faixa, pin e município; Vale; Ilha Grande; sem JavaScript; axe; overflow)
 * continua em `territorio-publico.spec.ts`.
 */

const LUGARES = [
  "recanto-da-serra",
  "borda-da-mata",
  "serra-dos-macacos",
  "ilha-grande",
] as const;

async function abrir(page: Page, caminho = "/territorio") {
  await page.goto(caminho);
  await expect(page.locator("#territorio-vivo")).toHaveAttribute(
    "data-interativo",
    "true",
  );
}

const faixa = (page: Page) =>
  page.getByRole("navigation", { name: "Os lugares da pesquisa" });
const itemDaFaixa = (page: Page, id: string) =>
  page.locator(`.tv-faixa [data-tv-ir="${id}"]`);
const atual = (page: Page) =>
  page.evaluate(
    () =>
      document
        .querySelector("[data-tv-faixa] [aria-current]")
        ?.getAttribute("data-tv-ir") ?? "-",
  );
const pertence = (page: Page, seletor: string) =>
  page
    .locator(seletor)
    .first()
    .evaluate((el) => getComputedStyle(el).getPropertyValue("--eu").trim());

/**
 * Grava cada valor que `aria-current` assume na faixa, na ordem, a partir de
 * agora. Serve para provar que nada piscou no caminho.
 */
async function gravarMarcas(page: Page) {
  await page.evaluate(() => {
    const registro: string[] = [];
    (window as unknown as { __marcas: string[] }).__marcas = registro;
    const lista = document.querySelector("[data-tv-faixa]");
    if (lista === null) return;
    new MutationObserver(() => {
      const id =
        lista.querySelector("[aria-current]")?.getAttribute("data-tv-ir") ??
        "-";
      if (registro.at(-1) !== id) registro.push(id);
    }).observe(lista, {
      attributes: true,
      attributeFilter: ["aria-current"],
      subtree: true,
    });
  });
}
const marcas = (page: Page) =>
  page.evaluate(() => (window as unknown as { __marcas: string[] }).__marcas);

async function celular(browser: Browser) {
  const contexto = await browser.newContext({
    baseURL: "http://localhost:3100",
    viewport: { width: 375, height: 812 },
    hasTouch: true,
    isMobile: true,
  });
  return { contexto, pagina: await contexto.newPage() };
}

test.describe("Interação — estado ativo e destino", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test("A. apontar o item da faixa acende o pin, e só ele", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await abrir(page);
    await itemDaFaixa(page, "borda-da-mata").hover();
    await expect
      .poll(() => pertence(page, '.tv-geral [data-pin="borda-da-mata"]'))
      .toBe("1");
    expect(
      await pertence(page, '.tv-geral [data-pin="recanto-da-serra"]'),
    ).toBe("0");
  });

  test("D/E. o capítulo muda na linha de leitura, um de cada vez, e aria-current o acompanha", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await abrir(page);
    // Na abertura, a leitura é a do conjunto.
    expect(await atual(page)).toBe("vale");

    // Com o título do Recanto logo abaixo da faixa, o Recanto já é o atual…
    await page.evaluate(() =>
      document
        .getElementById("lugar-recanto-da-serra")
        ?.scrollIntoView({ block: "start" }),
    );
    await expect.poll(() => atual(page)).toBe("recanto-da-serra");
    await expect(page.locator("#lugar-recanto-da-serra")).toHaveAttribute(
      "data-em-leitura",
      "",
    );

    // …e a borda do Borda entrando pela parte de baixo da tela não o tira.
    const topoDoBorda = await page.evaluate(
      () =>
        document.getElementById("lugar-borda-da-mata")?.getBoundingClientRect()
          .top ?? 0,
    );
    await page.evaluate((y) => window.scrollBy(0, y - 900 * 0.8), topoDoBorda);
    await page.waitForTimeout(120);
    expect(await atual(page)).toBe("recanto-da-serra");

    // Quando o Borda ocupa a maior parte da tela, a marca passa para ele.
    await page.evaluate(() =>
      document
        .getElementById("lugar-borda-da-mata")
        ?.scrollIntoView({ block: "start" }),
    );
    await expect.poll(() => atual(page)).toBe("borda-da-mata");
    await expect(faixa(page).locator("[aria-current]")).toHaveCount(1);
    await expect(
      page.locator("#lugar-recanto-da-serra[data-em-leitura]"),
    ).toHaveCount(0);
  });

  test("clicar num lugar marca o destino desde o clique: nada pisca no caminho", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await abrir(page);
    await gravarMarcas(page);
    await itemDaFaixa(page, "ilha-grande").click();
    // A carta mantém o lugar aceso enquanto a página rola.
    await expect(page.locator("#territorio-vivo")).toHaveAttribute(
      "data-tv-destino",
      "ilha-grande",
    );
    await expect(
      page.getByRole("heading", { level: 2, name: "Ilha Grande" }),
    ).toBeInViewport();
    await expect(page.locator("#territorio-vivo")).not.toHaveAttribute(
      "data-tv-destino",
      /./,
    );
    // Da abertura ao destino, uma troca só: nenhum capítulo do meio acendeu.
    expect(await marcas(page)).toEqual(["ilha-grande"]);
  });

  test("clicar no pin da carta tem continuidade até a prancha", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await abrir(page);
    await gravarMarcas(page);
    await page
      .locator('.tv-geral [data-pin="serra-dos-macacos"] .nome')
      .click();
    expect(
      await pertence(page, '.tv-geral [data-pin="serra-dos-macacos"]'),
    ).toBe("1");
    await expect(page).toHaveURL(/#lugar-serra-dos-macacos$/);
    await expect(page.locator("#lugar-serra-dos-macacos")).toHaveAttribute(
      "data-em-leitura",
      "",
    );
    expect(await marcas(page)).toEqual(["serra-dos-macacos"]);
  });

  test("F. Vale é escolha: apaga o lugar aceso e traz o recorte à frente", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await abrir(page);
    await itemDaFaixa(page, "ilha-grande").click();
    await expect(page.locator("#lugar-ilha-grande")).toHaveAttribute(
      "data-em-leitura",
      "",
    );
    await itemDaFaixa(page, "vale").click();
    await expect(page.locator("#territorio-vivo")).toHaveAttribute(
      "data-tv-destino",
      "vale",
    );
    // Nenhum lugar individual segue aceso; o conjunto vem à frente.
    for (const id of LUGARES) {
      expect(await pertence(page, `.tv-geral [data-pin="${id}"]`)).toBe("0");
    }
    expect(await pertence(page, '.tv-faixa [data-tv-ir="vale"]')).toBe("1");
    await expect.poll(() => atual(page)).toBe("vale");
  });

  test("G. em leitura, Ilha Grande marca a faixa com o anil de fora do recorte", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await abrir(page);
    const filete = (id: string) =>
      itemDaFaixa(page, id).evaluate((el) => getComputedStyle(el).boxShadow);
    await itemDaFaixa(page, "borda-da-mata").click();
    await expect.poll(() => atual(page)).toBe("borda-da-mata");
    const doVale = await filete("borda-da-mata");
    await itemDaFaixa(page, "ilha-grande").click();
    await expect.poll(() => atual(page)).toBe("ilha-grande");
    const deFora = await filete("ilha-grande");
    expect(deFora).not.toBe("none");
    expect(deFora).not.toBe(doVale);
  });
});

test.describe("Interação — deep link e histórico", () => {
  test("I. abrir direto numa prancha: capítulo, faixa e aria-current certos, sem rolagem animada", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/territorio#lugar-serra-dos-macacos", {
      waitUntil: "domcontentloaded",
    });
    /*
      O que conta é onde o título está na tela, e não o `scrollY`: as
      fotografias das pranchas anteriores carregam depois e crescem, e o
      navegador compensa a rolagem para a âncora ficar parada.
    */
    const topoDoTitulo = () =>
      page.evaluate(
        () =>
          document
            .querySelector("#lugar-serra-dos-macacos h2")
            ?.getBoundingClientRect().top ?? -1,
      );
    const antes = await topoDoTitulo();
    await expect(page.locator("#territorio-vivo")).toHaveAttribute(
      "data-interativo",
      "true",
    );
    await page.waitForLoadState("load");
    await page.waitForTimeout(800);
    const depois = await topoDoTitulo();
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(1000);
    // Nem rolagem animada desde o topo, nem salto depois da hidratação.
    expect(Math.abs(depois - antes)).toBeLessThan(4);
    await expect(
      page.getByRole("heading", { level: 2, name: "Serra dos Macacos" }),
    ).toBeInViewport();
    expect(await atual(page)).toBe("serra-dos-macacos");
    await expect(
      page.locator("#lugar-serra-dos-macacos[data-em-leitura]"),
    ).toHaveCount(1);
  });

  test("J. Voltar e Avançar restauram capítulo e faixa; voltar à carta mostra a origem", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await abrir(page);
    await itemDaFaixa(page, "borda-da-mata").click();
    await expect.poll(() => atual(page)).toBe("borda-da-mata");
    await itemDaFaixa(page, "ilha-grande").click();
    await expect.poll(() => atual(page)).toBe("ilha-grande");

    await page.goBack();
    await expect(page).toHaveURL(/#lugar-borda-da-mata$/);
    await expect.poll(() => atual(page)).toBe("borda-da-mata");

    await page.goForward();
    await expect(page).toHaveURL(/#lugar-ilha-grande$/);
    await expect.poll(() => atual(page)).toBe("ilha-grande");

    // De volta à abertura: a carta mostra, por um instante, de onde se veio.
    await page.goBack();
    await page.goBack();
    await expect(page).toHaveURL(/\/territorio$/);
    await expect.poll(() => atual(page)).toBe("vale");
    await expect(page.locator("#territorio-vivo")).toHaveAttribute(
      "data-tv-origem",
      "borda-da-mata",
    );
    expect(await pertence(page, '.tv-geral [data-pin="borda-da-mata"]')).toBe(
      "1",
    );
    // E depois volta ao estado geral, sozinha.
    await expect(page.locator("#territorio-vivo")).not.toHaveAttribute(
      "data-tv-origem",
      /./,
      { timeout: 4000 },
    );
    expect(await pertence(page, '.tv-geral [data-pin="borda-da-mata"]')).toBe(
      "0",
    );
  });
});

test.describe("Interação — teclado", () => {
  test("setas, Home e End percorrem a faixa; Tab continua com as mesmas paradas", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await abrir(page);
    const links = faixa(page).getByRole("link");
    await links.first().focus();
    await page.keyboard.press("ArrowRight");
    await expect(links.nth(1)).toBeFocused();
    await page.keyboard.press("End");
    await expect(links.last()).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(links.last()).toBeFocused();
    await page.keyboard.press("Home");
    await expect(links.first()).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(links.first()).toBeFocused();
    // Continuam sendo links comuns: nenhum sai da ordem de Tab.
    for (const link of await links.all()) {
      await expect(link).not.toHaveAttribute("tabindex", /./);
      await expect(link).not.toHaveAttribute("role", /./);
    }
  });

  test("C. o foco que as setas movem acende o pin do lugar", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await abrir(page);
    await faixa(page).getByRole("link").first().focus();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await expect(itemDaFaixa(page, "borda-da-mata")).toBeFocused();
    await expect
      .poll(() => pertence(page, '.tv-geral [data-pin="borda-da-mata"]'))
      .toBe("1");
  });

  test("Espaço segue o link como Enter, e o Tab seguinte entra na prancha", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await abrir(page);
    await itemDaFaixa(page, "borda-da-mata").focus();
    await page.keyboard.press(" ");
    await expect(page).toHaveURL(/#lugar-borda-da-mata$/);
    await expect.poll(() => atual(page)).toBe("borda-da-mata");
    // Nenhum foco forçado: o próximo Tab parte do destino, pelo navegador.
    await page.keyboard.press("Tab");
    const onde = await page.evaluate(
      () => document.activeElement?.closest("[data-tv-capitulo]")?.id ?? "",
    );
    expect(onde).toBe("lugar-borda-da-mata");
  });
});

test.describe("Interação — celular e toque", () => {
  test("H. um toque no pin: feedback no próprio pin e uma navegação só", async ({
    browser,
  }) => {
    const { contexto, pagina } = await celular(browser);
    await abrir(pagina);
    await gravarMarcas(pagina);
    await pagina
      .locator('.tv-geral [data-pin="recanto-da-serra"] .tv-pin__alvo')
      .tap();
    await expect(pagina).toHaveURL(/#lugar-recanto-da-serra$/);
    await expect(
      pagina.getByRole("heading", { level: 2, name: "Recanto da Serra" }),
    ).toBeInViewport();
    expect(await marcas(pagina)).toEqual(["recanto-da-serra"]);
    await contexto.close();
  });

  test("voltar à carta pelo toque: a origem acende e depois nada fica grudado", async ({
    browser,
  }) => {
    const { contexto, pagina } = await celular(browser);
    await pagina.emulateMedia({ reducedMotion: "reduce" });
    await abrir(pagina);
    await pagina
      .locator('.tv-geral [data-pin="serra-dos-macacos"] .tv-pin__alvo')
      .tap();
    await expect.poll(() => atual(pagina)).toBe("serra-dos-macacos");
    await pagina
      .locator("#lugar-serra-dos-macacos")
      .getByRole("link", { name: "↑ Voltar à carta dos lugares" })
      .tap();
    await expect(pagina).toHaveURL(/#tv-carta$/);
    await expect(pagina.locator("#territorio-vivo")).toHaveAttribute(
      "data-tv-origem",
      "serra-dos-macacos",
    );
    await expect(pagina.locator("#territorio-vivo")).not.toHaveAttribute(
      "data-tv-origem",
      /./,
      { timeout: 4000 },
    );
    // No toque não há :hover que prenda o pin aceso depois da volta.
    for (const id of LUGARES) {
      expect(await pertence(pagina, `.tv-geral [data-pin="${id}"]`)).toBe("0");
    }
    await contexto.close();
  });

  test("voltar à carta pelo teclado devolve o foco ao lugar de origem", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await abrir(page);
    await itemDaFaixa(page, "ilha-grande").focus();
    await page.keyboard.press("Enter");
    await expect.poll(() => atual(page)).toBe("ilha-grande");
    await page
      .locator("#lugar-ilha-grande")
      .getByRole("link", { name: "↑ Voltar à carta dos lugares" })
      .focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#tv-carta$/);
    await expect(itemDaFaixa(page, "ilha-grande")).toBeFocused();
    await expect(page.locator(".tv-geral__svg")).toBeInViewport();
  });

  test("a faixa horizontal do celular não cria rolagem da página", async ({
    browser,
  }) => {
    const { contexto, pagina } = await celular(browser);
    await abrir(pagina);
    await itemDaFaixa(pagina, "ilha-grande").tap();
    await expect(pagina).toHaveURL(/#lugar-ilha-grande$/);
    expect(
      await pagina.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await contexto.close();
  });
});

test.describe("Interação — mapa local e localizador", () => {
  test("M. o mapa detalhado continua sob demanda e, ao chegar, realça a janela do localizador", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const pedidos: string[] = [];
    page.on("request", (pedido) => {
      if (pedido.url().includes("/camada-local/")) pedidos.push(pedido.url());
    });
    await abrir(page);
    await page.waitForLoadState("networkidle");
    expect(pedidos).toHaveLength(0);

    const carta = page.locator('[data-tv-carta="borda-da-mata"]');
    await carta.scrollIntoViewIfNeeded();
    await expect(carta).toHaveAttribute("data-camada", "local");
    // O realce da chegada é um instante, e passa.
    await expect(carta).not.toHaveAttribute("data-tv-recem", /.*/, {
      timeout: 4000,
    });
    // Só as pranchas que chegaram perto da tela pediram a sua camada.
    expect(pedidos.some((url) => url.endsWith("/borda-da-mata"))).toBe(true);
    expect(
      pedidos.some((url) => /serra-dos-macacos|ilha-grande/.test(url)),
    ).toBe(false);
  });

  test("ponteiro no mapa ou foco na legenda: a janela do localizador engrossa", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await abrir(page);
    const carta = page.locator('[data-tv-carta="recanto-da-serra"]');
    await carta.scrollIntoViewIfNeeded();
    await expect(carta).toHaveAttribute("data-camada", "local");
    await expect(carta).not.toHaveAttribute("data-tv-recem", /.*/, {
      timeout: 4000,
    });
    const janela = carta.locator(".tv-localizador .janela");
    const espessura = () =>
      janela.evaluate((el) =>
        Number.parseFloat(getComputedStyle(el).strokeWidth),
      );
    const antes = await espessura();

    await carta.locator(".tv-carta__placa > svg[role='img']").hover();
    await expect.poll(espessura).toBeGreaterThan(antes);

    await page.mouse.move(2, 2);
    await expect.poll(espessura).toBe(antes);

    await carta.locator(".tv-carta__legenda summary").focus();
    await expect.poll(espessura).toBeGreaterThan(antes);
    // O localizador continua informativo: nenhuma parada de Tab, nenhum papel.
    await expect(carta.locator(".tv-localizador")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    await expect(carta.locator(".tv-localizador [tabindex]")).toHaveCount(0);
  });
});

test.describe("Interação — movimento e acessibilidade", () => {
  test("K. com movimento reduzido a âncora é imediata e os estados continuam", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await abrir(page);
    expect(
      await page.evaluate(
        () => getComputedStyle(document.documentElement).scrollBehavior,
      ),
    ).toBe("auto");
    await itemDaFaixa(page, "serra-dos-macacos").click();
    await expect(
      page.getByRole("heading", { level: 2, name: "Serra dos Macacos" }),
    ).toBeInViewport({ timeout: 500 });
    await expect.poll(() => atual(page)).toBe("serra-dos-macacos");
  });

  test("N. axe sem violações com destino, origem e realce do localizador ativos", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await abrir(page);
    await itemDaFaixa(page, "ilha-grande").click();
    await expect.poll(() => atual(page)).toBe("ilha-grande");
    await page.goBack();
    await expect(page.locator("#territorio-vivo")).toHaveAttribute(
      "data-tv-origem",
      "ilha-grande",
    );
    const resultado = await new AxeBuilder({ page })
      .include("#territorio-vivo")
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(resultado.violations).toEqual([]);
  });
});
