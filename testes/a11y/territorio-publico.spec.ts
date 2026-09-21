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
      .locator(".tv-local, .tv-pin__corpo, .tv-faixa a, .tv-carta__base")
      .evaluateAll((els) =>
        els.map((el) => getComputedStyle(el).transitionProperty),
      );
    expect(transicoes.length).toBeGreaterThan(0);
    expect(transicoes.every((p) => p === "none")).toBe(true);
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
