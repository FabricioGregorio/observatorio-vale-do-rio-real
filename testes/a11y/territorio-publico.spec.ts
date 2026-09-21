import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { REFERENCIAS_TERRITORIAIS } from "../../src/dados/territorio/referencias";

/**
 * Contrato público da Cartografia Viva (`/territorio`).
 *
 * A página é um atlas: a carta do território na abertura, a faixa dos
 * lugares presa ao topo, o capítulo do Vale e uma prancha por lugar, cada uma
 * com o mapa do próprio entorno. O que estes testes protegem é o que não pode
 * mudar com o desenho — os fatos de cada lugar, a camada local sob demanda, a
 * procedência, as rotas externas, o teclado, o leitor de tela, a leitura sem
 * JavaScript e sem movimento. A forma dos componentes só aparece onde ela é o
 * próprio requisito (fotografia sem corte, carta na primeira tela).
 */

const LUGARES = [
  {
    id: "recanto-da-serra",
    nome: "Recanto da Serra",
    localidade: "Povoado Jacaré, Tobias Barreto (SE)",
    latitude: "-11.015393101706083",
    longitude: "-38.048667603935414",
  },
  {
    id: "borda-da-mata",
    nome: "Museu Borda da Mata",
    localidade: "Povoado Borda da Mata, Tobias Barreto (SE)",
    latitude: "-11.127754407274919",
    longitude: "-37.88642982557546",
  },
  {
    id: "serra-dos-macacos",
    nome: "Serra dos Macacos",
    localidade: "Comunidade próxima à Vila de Samambaia, Tobias Barreto (SE)",
    latitude: "-10.8811",
    longitude: "-37.9867",
  },
  {
    id: "ilha-grande",
    nome: "Ilha Grande",
    localidade: "Povoado Ilha Grande, São Cristóvão (SE)",
    latitude: "-11.0639",
    longitude: "-37.2086",
  },
] as const;

async function abrir(page: Page) {
  await page.goto("/territorio");
  const raiz = page.locator("#territorio-vivo");
  await expect(raiz).toHaveAttribute("data-interativo", "true");
  return raiz;
}

/** Leva a prancha à tela e espera o mapa detalhado dela chegar. */
async function irAPrancha(page: Page, id: string) {
  await page.locator(`#lugar-${id}`).scrollIntoViewIfNeeded();
  await page.locator(`[data-tv-carta="${id}"]`).scrollIntoViewIfNeeded();
  await expect(page.locator(`[data-tv-carta="${id}"]`)).toHaveAttribute(
    "data-camada",
    "local",
  );
}

async function percorrerTudo(page: Page) {
  for (const lugar of LUGARES) await irAPrancha(page, lugar.id);
}

function registrarCamadas(page: Page): string[] {
  const urls: string[] = [];
  page.on("request", (pedido) => {
    if (pedido.url().includes("/camada-local/")) urls.push(pedido.url());
  });
  return urls;
}

const faixa = (page: Page) =>
  page.getByRole("navigation", { name: "Os lugares da pesquisa" });

test.describe("Território — a carta e os lugares", () => {
  test("a carta do território usa o milho e o papel da malha da Home", async ({
    page,
  }) => {
    await page.goto("/");
    const coresDaHome = await page.evaluate(() => {
      const base = document.querySelector("#hl-mapa > path.m");
      const vale = document.querySelector("#hl-mapa .m.v");
      return {
        base: base === null ? null : getComputedStyle(base).fill,
        vale: vale === null ? null : getComputedStyle(vale).fill,
      };
    });

    await page.goto("/territorio");
    const cores = await page.evaluate(() => {
      const vale = document.querySelector(".tv-geral .m.v");
      const papel = document.querySelector(
        ".tv-carta__base .m:not(.v):not(.c)",
      );
      return {
        base: papel === null ? null : getComputedStyle(papel).fill,
        vale: vale === null ? null : getComputedStyle(vale).fill,
      };
    });
    expect(cores).toEqual(coresDaHome);

    const legenda = page.getByRole("list", {
      name: "Legenda do mapa",
      exact: true,
    });
    for (const rotulo of [
      "Vale do Rio Real",
      "Pesquisa de campo",
      "São Cristóvão, comparação",
      "Lugar da pesquisa",
    ]) {
      await expect(legenda).toContainText(rotulo);
    }
    // Sergipe inteiro, em escala, na situação do capítulo do Vale.
    await expect(page.locator(".tv-situacao use.m")).toHaveCount(75);
  });

  test("quatro lugares, e cada mapa detalhado só quando a prancha chega", async ({
    page,
  }) => {
    const camadas = registrarCamadas(page);
    const resposta = await page.goto("/territorio");
    expect(resposta?.status()).toBe(200);
    await expect(
      page.getByRole("heading", { level: 1, name: "Cartografia Viva" }),
    ).toBeVisible();
    await expect(page.locator("#territorio-vivo")).toHaveAttribute(
      "data-interativo",
      "true",
    );
    await page.waitForLoadState("networkidle");
    expect(camadas).toHaveLength(0);

    const links = faixa(page).getByRole("link");
    await expect(links).toHaveCount(1 + LUGARES.length);
    await expect(links.first()).toContainText("Vale do Rio Real");

    for (const lugar of LUGARES) {
      await faixa(page)
        .getByRole("link", { name: new RegExp(lugar.nome) })
        .click();
      await expect(page).toHaveURL(new RegExp(`#lugar-${lugar.id}$`));
      await expect(
        page.getByRole("heading", { level: 2, name: lugar.nome }),
      ).toBeInViewport();
      await irAPrancha(page, lugar.id);
    }
    await expect.poll(() => camadas.length).toBe(4);
    expect(
      camadas.every((url) => url.includes("/territorio/camada-local/")),
    ).toBe(true);
    expect(camadas.every((url) => !url.includes("/dev/"))).toBe(true);
  });

  test("a faixa marca o capítulo em leitura, um de cada vez", async ({
    page,
  }) => {
    await abrir(page);
    await page.locator("#lugar-borda-da-mata h2").scrollIntoViewIfNeeded();
    await page.evaluate(() =>
      document
        .getElementById("lugar-borda-da-mata")
        ?.scrollIntoView({ block: "start" }),
    );
    const atual = faixa(page).locator('[aria-current="location"]');
    await expect(atual).toHaveCount(1);
    await expect(atual).toContainText("Museu Borda da Mata");

    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(atual).toHaveCount(0);
  });

  test("a abertura mostra a carta inteira e a faixa na primeira tela do desktop", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await abrir(page);
    const carta = await page.locator(".tv-geral__svg").boundingBox();
    expect(carta).not.toBeNull();
    expect(carta?.y ?? -1).toBeGreaterThanOrEqual(0);
    expect((carta?.y ?? 0) + (carta?.height ?? 0)).toBeLessThanOrEqual(900);
    expect(carta?.width ?? 0).toBeGreaterThan(700);

    // Os quatro pins estão no quadro — inclusive Ilha Grande, fora do Vale.
    const pins = page.locator(".tv-geral [data-pin]");
    await expect(pins).toHaveCount(4);
    for (const pin of await pins.all()) await expect(pin).toBeInViewport();

    const nav = await faixa(page).boundingBox();
    expect((nav?.y ?? 0) + (nav?.height ?? 0)).toBeLessThanOrEqual(900);
    await expect(
      page.getByRole("heading", { level: 1, name: "Cartografia Viva" }),
    ).toBeInViewport();
  });
});

for (const largura of [320, 375, 768, 1024, 1280, 1440]) {
  test(`Território público sem overflow em ${largura}px`, async ({ page }) => {
    await page.setViewportSize({ width: largura, height: 900 });
    await abrir(page);
    await percorrerTudo(page);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.emulateMedia({ colorScheme: "dark" });
    await expect(page.locator("#territorio-vivo")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });
}

test("Território mantém o conteúdo essencial sem JavaScript", async ({
  browser,
}) => {
  const contexto = await browser.newContext({ javaScriptEnabled: false });
  const pagina = await contexto.newPage();
  const camadas = registrarCamadas(pagina);
  await pagina.goto("/territorio");
  await expect(
    pagina.getByRole("heading", { level: 1, name: "Cartografia Viva" }),
  ).toBeVisible();
  await expect(
    pagina.getByRole("heading", { level: 2, name: "Vale do Rio Real" }),
  ).toBeVisible();
  const nav = pagina.getByRole("navigation", {
    name: "Os lugares da pesquisa",
  });
  await expect(nav.getByRole("link")).toHaveCount(5);

  for (const lugar of LUGARES) {
    const prancha = pagina.locator(`#lugar-${lugar.id}`);
    await expect(
      prancha.getByRole("heading", { level: 2, name: lugar.nome }),
    ).toBeVisible();
    // Sem a camada local, o mapa da prancha continua com malha e pin.
    await expect(prancha.locator(".tv-carta__pin")).toHaveCount(1);
    await expect(prancha.locator(".tv-carta__base use").first()).toBeAttached();
    await expect(prancha).toContainText(lugar.localidade);
  }
  await expect(
    pagina.getByRole("img", { name: /Mapa do entorno/ }).first(),
  ).toBeVisible();
  expect(camadas).toHaveLength(0);
  await contexto.close();
});

/**
 * A carta responde à exploração.
 *
 * O estado "lugar apontado" é o mesmo venha de onde vier — ponteiro na
 * faixa, ponteiro no pin, foco de teclado na faixa, toque no pin — e liga o
 * pin, o item da faixa e o município que contém o lugar. Os testes leem o
 * grau de pertinência que cada elemento declara (`--eu`) e o efeito
 * computado (opacidade), nunca pixels.
 */
/*
  `--eu` não é propriedade registrada: o valor computado chega como a
  expressão (`max(1,0,0)`). Uma sonda resolve o número pela própria CSS.
*/
const pertence = (page: Page, seletor: string) =>
  page
    .locator(seletor)
    .first()
    .evaluate((el) => {
      const expressao = getComputedStyle(el).getPropertyValue("--eu").trim();
      const sonda = document.createElement("div");
      sonda.style.opacity = `calc(${expressao || "0"})`;
      document.body.append(sonda);
      const valor = getComputedStyle(sonda).opacity;
      sonda.remove();
      return valor;
    });
const opacidade = (page: Page, seletor: string) =>
  page
    .locator(seletor)
    .first()
    .evaluate((el) => Number(getComputedStyle(el).opacity));
const TOBIAS_BARRETO = "2807402";
const SAO_CRISTOVAO = "2806701";
const POCO_VERDE = "2805505";

test.describe("Território — a carta responde à exploração", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

  test("apontar o pin acende o item da faixa e o município; o resto recua", async ({
    page,
  }) => {
    await abrir(page);
    await page
      .locator('.tv-geral [data-pin="recanto-da-serra"] .tv-pin__corpo')
      .hover();
    await expect
      .poll(() => pertence(page, '.tv-faixa [data-tv-ir="recanto-da-serra"]'))
      .toBe("1");
    expect(await pertence(page, '.tv-faixa [data-tv-ir="borda-da-mata"]')).toBe(
      "0",
    );
    expect(
      await pertence(page, `.tv-geral use.m[data-codigo="${TOBIAS_BARRETO}"]`),
    ).toBe("1");
    expect(
      await opacidade(page, '.tv-geral [data-pin="ilha-grande"]'),
    ).toBeLessThan(1);
    expect(
      await opacidade(page, '.tv-geral [data-pin="recanto-da-serra"]'),
    ).toBe(1);

    // Sair devolve a carta inteira ao mesmo nível.
    await page.mouse.move(5, 300);
    await expect
      .poll(() => opacidade(page, '.tv-geral [data-pin="ilha-grande"]'))
      .toBe(1);
  });

  test("o foco de teclado na faixa acende o pin correspondente", async ({
    page,
  }) => {
    await abrir(page);
    await faixa(page).getByRole("link").first().focus();
    await page.keyboard.press("Tab");
    await expect(
      faixa(page).getByRole("link", { name: /Recanto da Serra/ }),
    ).toBeFocused();
    await expect
      .poll(() => pertence(page, '.tv-geral [data-pin="recanto-da-serra"]'))
      .toBe("1");
    expect(await pertence(page, '.tv-geral [data-pin="borda-da-mata"]')).toBe(
      "0",
    );
    // Shift+Tab volta ao Vale: nenhum lugar fica apontado.
    await page.keyboard.press("Shift+Tab");
    await expect
      .poll(() => opacidade(page, '.tv-geral [data-pin="borda-da-mata"]'))
      .toBe(1);
  });

  test("Ilha Grande traz São Cristóvão à frente e diz que está fora do recorte", async ({
    page,
  }) => {
    await abrir(page);
    await expect(page.locator(".tv-geral .tv-pin__fora")).toHaveText(
      "São Cristóvão · fora do recorte",
    );
    await faixa(page)
      .getByRole("link", { name: /Ilha Grande/ })
      .hover();
    await expect
      .poll(() =>
        pertence(page, `.tv-geral use.m[data-codigo="${SAO_CRISTOVAO}"]`),
      )
      .toBe("1");
    // O Vale inteiro recua: o ponto apontado está fora dele.
    expect(
      await opacidade(page, `.tv-geral use.m[data-codigo="${TOBIAS_BARRETO}"]`),
    ).toBeLessThan(1);
    // E o fato continua escrito na faixa, sem depender do ponteiro.
    await expect(
      faixa(page).getByRole("link", { name: /Ilha Grande/ }),
    ).toContainText("fora do recorte");
  });

  test("Vale do Rio Real é visão geral: o recorte à frente, os lugares no mesmo nível", async ({
    page,
  }) => {
    await abrir(page);
    await faixa(page)
      .getByRole("link", { name: /Vale do Rio Real/ })
      .hover();
    await expect
      .poll(() =>
        opacidade(page, `.tv-geral use.m[data-codigo="${SAO_CRISTOVAO}"]`),
      )
      .toBeLessThan(1);
    for (const lugar of LUGARES) {
      expect(await opacidade(page, `.tv-geral [data-pin="${lugar.id}"]`)).toBe(
        1,
      );
    }
    expect(
      await opacidade(page, `.tv-geral use.m[data-codigo="${POCO_VERDE}"]`),
    ).toBe(1);
  });

  test("chegar a uma prancha acende o você-está-aqui e marca o capítulo", async ({
    page,
  }) => {
    await abrir(page);
    await faixa(page)
      .getByRole("link", { name: /Museu Borda da Mata/ })
      .click();
    const prancha = page.locator("#lugar-borda-da-mata");
    await expect(prancha).toHaveAttribute("data-em-leitura", "");
    await expect(
      faixa(page).locator('[aria-current="location"]'),
    ).toContainText("Museu Borda da Mata");
    await expect
      .poll(() => opacidade(page, "#lugar-borda-da-mata .tv-carta__halo"))
      .toBe(1);
    // Só a prancha em leitura acende; as outras ficam em repouso.
    expect(
      await opacidade(page, "#lugar-recanto-da-serra .tv-carta__halo"),
    ).toBe(0);
    // Com movimento reduzido, a marca de destino fica parada no título.
    const marca = await prancha
      .locator("h2")
      .evaluate((el) => getComputedStyle(el).boxShadow);
    expect(marca).not.toBe("none");
  });

  test("o capítulo em leitura avança sem piscar ao rolar a página", async ({
    page,
  }) => {
    await abrir(page);
    const altura = await page.evaluate(() => document.body.scrollHeight);
    const sequencia: string[] = [];
    for (let y = 0; y < altura; y += 60) {
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await page.waitForTimeout(30);
      const atual = await page.evaluate(
        () =>
          document
            .querySelector("[data-tv-faixa] [aria-current]")
            ?.getAttribute("data-tv-ir") ?? "-",
      );
      if (sequencia.at(-1) !== atual) sequencia.push(atual);
    }
    expect(sequencia).toEqual(["-", "vale", ...LUGARES.map((l) => l.id), "-"]);
  });
});

test.describe("Território — toque e celular", () => {
  test("tocar no pin leva à prancha do lugar", async ({ browser }) => {
    const contexto = await browser.newContext({
      viewport: { width: 375, height: 812 },
      hasTouch: true,
      isMobile: true,
    });
    const pagina = await contexto.newPage();
    await pagina.goto("/territorio");
    await expect(pagina.locator("#territorio-vivo")).toHaveAttribute(
      "data-interativo",
      "true",
    );
    const alvo = pagina.locator(
      '.tv-geral [data-pin="serra-dos-macacos"] .tv-pin__alvo',
    );
    // O alvo de toque tem pelo menos 44 px.
    const caixa = await alvo.boundingBox();
    expect(caixa?.width ?? 0).toBeGreaterThanOrEqual(44);
    await alvo.tap();
    await expect(pagina).toHaveURL(/#lugar-serra-dos-macacos$/);
    await expect(
      pagina.getByRole("heading", { level: 2, name: "Serra dos Macacos" }),
    ).toBeInViewport();
    await contexto.close();
  });

  test("no celular, cada prancha tem o caminho de volta à carta", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await abrir(page);
    const voltar = page
      .locator("#lugar-ilha-grande")
      .getByRole("link", { name: "↑ Voltar à carta dos lugares" });
    await voltar.scrollIntoViewIfNeeded();
    await voltar.click();
    await expect(page).toHaveURL(/#tv-carta$/);
    await expect(page.locator(".tv-geral__svg")).toBeInViewport();
    await expect(
      faixa(page).getByRole("link", { name: /Vale do Rio Real/ }),
    ).toBeInViewport();

    // Nas telas maiores a faixa fica presa ao topo, e o link sai — inclusive
    // da ordem de Tab.
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(voltar).toBeHidden();
  });
});

test.describe("Território — teclado e estado", () => {
  test("a faixa é navegação comum: cinco paradas de Tab, com contorno visível", async ({
    page,
  }) => {
    await abrir(page);
    const primeiro = faixa(page).getByRole("link").first();
    await primeiro.focus();
    for (let i = 1; i <= LUGARES.length; i += 1) {
      await page.keyboard.press("Tab");
      await expect(faixa(page).getByRole("link").nth(i)).toBeFocused();
    }
    const contorno = await page.evaluate(() => {
      const alvo = document.activeElement;
      if (alvo === null) return null;
      const estilo = getComputedStyle(alvo);
      return { estilo: estilo.outlineStyle, largura: estilo.outlineWidth };
    });
    expect(contorno?.estilo).not.toBe("none");
    expect(Number.parseFloat(contorno?.largura ?? "0")).toBeGreaterThan(0);

    // Enter segue a âncora e leva a leitura até a prancha.
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#lugar-ilha-grande$/);
    await expect(
      page.getByRole("heading", { level: 2, name: "Ilha Grande" }),
    ).toBeInViewport();
  });

  test("os pins da carta não criam paradas de Tab duplicadas", async ({
    page,
  }) => {
    await abrir(page);
    const pins = page.locator(".tv-geral a[data-pin]");
    await expect(pins).toHaveCount(4);
    for (const pin of await pins.all()) {
      await expect(pin).toHaveAttribute("tabindex", "-1");
    }
    // O ponteiro também chega: clicar no pin leva à prancha.
    await page.setViewportSize({ width: 1440, height: 900 });
    await pins.filter({ hasText: "Ilha Grande" }).click();
    await expect(page).toHaveURL(/#lugar-ilha-grande$/);
  });

  test("a ficha de localização abre pelo teclado e traz a coordenada", async ({
    page,
  }) => {
    await abrir(page);
    const prancha = page.locator("#lugar-serra-dos-macacos");
    const resumo = prancha.locator(".tv-ficha summary");
    await resumo.focus();
    await page.keyboard.press("Enter");
    await expect(prancha.locator(".tv-ficha")).toHaveAttribute("open", "");
    await expect(prancha.locator(".coordenada")).toBeVisible();
    await expect(prancha.locator(".coordenada")).toHaveText(
      "-10.881100, -37.986700",
    );
  });

  test("os links externos são nomeados e não entregam a aba de origem", async ({
    page,
  }) => {
    await page.goto("/territorio");
    const externos = page.locator('a[target="_blank"]');
    const total = await externos.count();
    expect(total).toBeGreaterThan(0);
    for (let i = 0; i < total; i++) {
      const link = externos.nth(i);
      await expect(link).toHaveAttribute("rel", /noopener/);
      expect((await link.textContent())?.trim().length).toBeGreaterThan(0);
    }
  });

  test("com movimento reduzido nada anima nem transita", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await abrir(page);
    await irAPrancha(page, "ilha-grande");

    const animado = await page.evaluate(() =>
      [...document.querySelectorAll("#territorio-vivo *")]
        .map((e) => getComputedStyle(e))
        .some(
          (s) => s.animationName !== "none" && s.animationDuration !== "0s",
        ),
    );
    expect(animado).toBe(false);
    const transicoes = await page
      .locator(
        ".tv-local, .tv-pin__corpo, .tv-pin__halo, .tv-faixa a, .tv-carta__base, .tv-carta__halo, .tv-geral .m",
      )
      .evaluateAll((els) =>
        els.map((el) => getComputedStyle(el).transitionProperty),
      );
    expect(transicoes.length).toBeGreaterThan(0);
    expect(transicoes.every((p) => p === "none")).toBe(true);
    // A rolagem até o capítulo é imediata para quem pediu menos movimento.
    expect(
      await page.evaluate(
        () => getComputedStyle(document.documentElement).scrollBehavior,
      ),
    ).toBe("auto");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    expect(
      await page.evaluate(
        () => getComputedStyle(document.documentElement).scrollBehavior,
      ),
    ).toBe("smooth");
  });
});

/**
 * A cartografia como informação. Escala, janela e localizador são dado: se um
 * dia virarem desenho sem correspondência, estes testes falham antes de a
 * página ir ao ar.
 */
test.describe("Território — cartografia como informação", () => {
  test("estado, recorte e entorno continuam declarados em quilômetros", async ({
    page,
  }) => {
    await abrir(page);
    const situacao = page.locator("#o-vale .tv-situacao");
    await expect(situacao).toContainText("Sergipe");
    await expect(situacao).toContainText(/\d+ km de largura/);
    await expect(situacao).toContainText(/quadro do recorte, \d+ km/);

    for (const lugar of LUGARES) {
      await expect(
        page.locator(`[data-tv-carta="${lugar.id}"] .tv-carta__escala`),
      ).toContainText(/Entorno \d+ km de largura/);
    }
  });

  test("cada prancha tem uma camada local e um localizador com janela real", async ({
    page,
  }) => {
    await abrir(page);
    await expect(page.locator("[data-tv-camada]")).toHaveCount(4);
    await expect(page.locator("[data-tv-camada-local]")).toHaveCount(4);
    const lados = await page
      .locator(".tv-localizador .janela")
      .evaluateAll((nos) =>
        nos.map((no) => ({
          largura: Number(no.getAttribute("width")),
          altura: Number(no.getAttribute("height")),
        })),
      );
    expect(lados).toHaveLength(4);
    for (const lado of lados) {
      expect(lado.largura).toBeGreaterThan(0);
      expect(lado.altura).toBeGreaterThan(0);
    }
  });

  test("mapa local: pin do lugar, localidade IBGE distinta, atribuição do OSM visível", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await abrir(page);
    for (const [id, referencia] of [
      ["recanto-da-serra", "Jacaré · localidade"],
      ["borda-da-mata", "Borda da Mata · localidade"],
    ] as const) {
      await irAPrancha(page, id);
      const escopo = page.locator(`[data-tv-camada-local="${id}"]`);
      const pin = escopo.locator(`[data-tipo="lugar"][data-pin="${id}"]`);
      const ref = escopo.locator('[data-tipo="localidade-do-lugar"]');
      await expect(pin).toHaveAttribute("data-selecionado", "true");
      await expect(ref).toHaveCount(1);
      const ponta = await pin.evaluate((el) => {
        const m = (el as unknown as SVGGraphicsElement).getScreenCTM();
        return m === null ? [0, 0] : [m.e, m.f];
      });
      const r = await ref.boundingBox();
      expect(
        Math.hypot(
          (ponta[0] ?? 0) - ((r?.x ?? 0) + (r?.width ?? 0) / 2),
          (ponta[1] ?? 0) - ((r?.y ?? 0) + (r?.height ?? 0) / 2),
        ),
        id,
      ).toBeGreaterThan(10);
      await expect(escopo).toContainText(referencia);
      await expect(escopo).not.toContainText("não publicada");
      await expect(
        page.locator(`[data-tv-carta="${id}"] figcaption`),
      ).toContainText("© contribuidores do OpenStreetMap — ODbL 1.0");
    }
  });

  test("Serra: comunidade visitada e Vila Samambaia continuam distintas", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await abrir(page);
    await irAPrancha(page, "serra-dos-macacos");
    const escopo = page.locator('[data-tv-camada-local="serra-dos-macacos"]');
    await expect(
      escopo.locator('[data-tipo="lugar"][data-pin="serra-dos-macacos"]'),
    ).toHaveAttribute("data-selecionado", "true");
    const referencia = escopo.locator(
      '[data-tipo="referencia-cartografica"][data-codigo-ibge="280740210"]',
    );
    await expect(referencia).toHaveCount(1);
    await expect(referencia).toContainText("Vila Samambaia · IBGE");
    await expect(
      escopo.locator('[data-tipo="localidade-do-lugar"]'),
    ).toHaveCount(0);

    const prancha = page.locator("#lugar-serra-dos-macacos");
    await expect(prancha).toContainText(
      "Comunidade próxima à Vila de Samambaia, Tobias Barreto (SE)",
    );
    await expect(prancha).toContainText(
      "Vila Samambaia · IBGE — referência territorial próxima; não representa o lugar visitado.",
    );
    await expect(prancha).toContainText("Relato técnico (A04)");
    await expect(prancha).not.toContainText(/Restrito|Em revisão/);
    await expect(prancha).toContainText(
      "Esta ficha ainda não reúne fotografia pública.",
    );
  });

  test("as pranchas listam evidência pública com link real e nenhum rótulo restrito", async ({
    page,
  }) => {
    await page.goto("/territorio");
    for (const id of ["borda-da-mata", "recanto-da-serra"]) {
      const prancha = page.locator(`#lugar-${id}`);
      await expect(prancha).not.toContainText(/Restrito|Em revisão/);
      await expect(
        prancha.getByRole("heading", { name: "Evidências públicas" }),
      ).toHaveCount(1);
      await expect(prancha).toContainText("Relatório técnico");
      const evidencias = prancha.locator(".tv-evidencias li");
      const quantidade = await evidencias.count();
      expect(quantidade).toBeGreaterThan(0);
      for (let i = 0; i < quantidade; i += 1) {
        const link = evidencias.nth(i).getByRole("link");
        await expect(link).toHaveCount(1);
        expect(await link.getAttribute("href")).toMatch(
          /^(https:\/\/acervo\.observatoriotobiassoueu\.com\.br\/arquivos\/|\/acervo#acervo-)/,
        );
      }
    }
  });

  test("localização nos quatro: localidade, links exatos, nada externo antes do clique", async ({
    page,
  }) => {
    const externos: string[] = [];
    page.on("request", (pedido) => {
      const url = new URL(pedido.url());
      if (url.hostname !== "localhost") externos.push(pedido.url());
    });
    await abrir(page);
    for (const lugar of LUGARES) {
      const prancha = page.locator(`#lugar-${lugar.id}`);
      await expect(prancha).toContainText(lugar.localidade);
      await expect(prancha).not.toContainText("não publicada");
      await prancha.locator(".tv-ficha summary").click();
      const links = prancha.getByRole("link", {
        name: /OpenStreetMap|Google Maps/,
      });
      await expect(
        prancha.getByRole("link", { name: "OpenStreetMap", exact: true }),
      ).toHaveAttribute(
        "href",
        `https://www.openstreetmap.org/directions?route=%3B${lugar.latitude}%2C${lugar.longitude}`,
      );
      await expect(
        prancha.getByRole("link", { name: "Google Maps", exact: true }),
      ).toHaveAttribute(
        "href",
        `https://www.google.com/maps/dir/?api=1&destination=${lugar.latitude}%2C${lugar.longitude}`,
      );
      for (const link of await links.all()) {
        if ((await link.getAttribute("target")) !== "_blank") continue;
        await expect(link).toHaveAttribute("rel", /noopener/);
        await expect(link).toHaveAttribute("rel", /noreferrer/);
        await expect(link).toHaveAttribute("referrerpolicy", "no-referrer");
      }
    }
    await expect(page.locator("#lugar-serra-dos-macacos")).toContainText(
      "divisa com os municípios de Simão Dias e Poço Verde",
    );
    await expect(page.locator("iframe")).toHaveCount(0);
    await page.waitForLoadState("networkidle");
    expect(externos).toEqual([]);
  });

  /*
    Fotografia é documento: nenhuma é recortada, em nenhuma prancha.
  */
  test("nenhuma fotografia das pranchas é recortada", async ({ page }) => {
    await abrir(page);
    const imagens = page.locator(".tv-prancha img");
    const total = await imagens.count();
    expect(total).toBeGreaterThan(10);
    for (const imagem of await imagens.all()) {
      await imagem.scrollIntoViewIfNeeded();
      await expect
        .poll(() =>
          imagem.evaluate((no) => (no as HTMLImageElement).naturalWidth),
        )
        .toBeGreaterThan(0);
      const medida = await imagem.evaluate((no) => {
        const img = no as HTMLImageElement;
        const caixa = img.getBoundingClientRect();
        return {
          ajuste: getComputedStyle(img).objectFit,
          natural: img.naturalWidth / img.naturalHeight,
          renderizada: caixa.width / caixa.height,
        };
      });
      expect(medida.ajuste).not.toBe("cover");
      expect(medida.renderizada).toBeCloseTo(medida.natural, 1);
    }
  });

  test("toda coordenada da prancha é a de referencias.ts", async ({ page }) => {
    await page.goto("/territorio");
    for (const lugar of REFERENCIAS_TERRITORIAIS) {
      const prancha = page.locator(`#lugar-${lugar.id}`);
      await expect(prancha.locator(".coordenada")).toHaveText(
        `${lugar.latitude.toFixed(6)}, ${lugar.longitude.toFixed(6)}`,
      );
      await expect(prancha).toContainText(lugar.localidade);
      await expect(prancha).toContainText(lugar.municipio);
    }
  });
});

for (const largura of [375, 768, 1440]) {
  for (const tema of ["light", "dark"] as const) {
    test(`cartografia e pranchas acessíveis em ${largura}px, ${tema}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: largura, height: 900 });
      await page.emulateMedia({ colorScheme: tema });
      await abrir(page);
      await percorrerTudo(page);
      // As fichas abertas também passam pela auditoria.
      for (const resumo of await page.locator(".tv summary").all()) {
        await resumo.click();
      }
      for (const link of await faixa(page).getByRole("link").all()) {
        const caixa = await link.boundingBox();
        expect(caixa?.height).toBeGreaterThanOrEqual(44);
        expect(caixa?.width).toBeGreaterThanOrEqual(44);
      }
      expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            document.documentElement.clientWidth,
        ),
      ).toBe(true);
      const auditoria = await new AxeBuilder({ page })
        .include("#territorio-vivo")
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(auditoria.violations).toEqual([]);
    });
  }
}
