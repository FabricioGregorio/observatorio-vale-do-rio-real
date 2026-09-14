import { expect, type Page, test } from "@playwright/test";

/**
 * Laboratório territorial (`/dev/territorio-vivo`). DEV; 404 em produção.
 *
 * Os testes que dependem de posição pulam quando o arquivo local de
 * coordenadas confirmadas não existe (ele fica fora do Git; ver Tarefa 19).
 */

const ROTA = "/dev/territorio-vivo";
const CAMADA = /\/dev\/territorio-vivo\/camada-local\/([a-z-]+)$/;

async function abrir(page: Page, destino: string = ROTA) {
  await page.goto(destino);
  const raiz = page.locator("#territorio-vivo");
  await expect(raiz).toHaveAttribute("data-interativo", "true");
  return raiz;
}

async function exigirCoordenadas(page: Page) {
  const ausentes = await page
    .locator('[data-tv-coordenadas="ausentes"]')
    .count();
  test.skip(ausentes > 0, "Sem arquivo local de coordenadas confirmadas.");
}

/** Registra, por id de lugar, cada pedido de camada local. */
function registrarCamadas(page: Page): string[] {
  const ids: string[] = [];
  page.on("request", (pedido) => {
    const m = CAMADA.exec(new URL(pedido.url()).pathname);
    if (m?.[1] !== undefined) ids.push(m[1]);
  });
  return ids;
}

async function caixa(page: Page, seletor: string) {
  const c = await page.locator(seletor).first().boundingBox();
  if (c === null) throw new Error(`Sem caixa: ${seletor}`);
  return c;
}

/**
 * Ponta do pin na tela: é onde está a coordenada. Lida pela matriz de tela
 * do grupo do pin, cuja origem é a própria coordenada — e não pela caixa do
 * desenho, que arredonda.
 */
async function pontaDoPin(page: Page, seletor: string) {
  const ponto = await page
    .locator(seletor)
    .first()
    .evaluate((el) => {
      const m = (el as unknown as SVGGraphicsElement).getScreenCTM();
      return m === null ? null : [m.e, m.f];
    });
  if (ponto === null) throw new Error(`Sem matriz de tela: ${seletor}`);
  return [ponto[0] ?? 0, ponto[1] ?? 0] as const;
}

/** Centro do `viewBox` do mapa, na tela. */
async function centroDaVista(page: Page) {
  const ponto = await page.locator("[data-tv-mapa]").evaluate((el) => {
    const svg = el as unknown as SVGSVGElement;
    const m = svg.getScreenCTM();
    if (m === null) return null;
    const vb = svg.viewBox.baseVal;
    return new DOMPoint(vb.x + vb.width / 2, vb.y + vb.height / 2)
      .matrixTransform(m)
      .toJSON() as { x: number; y: number };
  });
  if (ponto === null) throw new Error("Mapa sem matriz de tela.");
  return [ponto.x, ponto.y] as const;
}

const opacidade = (page: Page, seletor: string) =>
  page
    .locator(seletor)
    .first()
    .evaluate((el) => Number(getComputedStyle(el).opacity));

const selecionar = (page: Page, nome: RegExp) =>
  page.getByRole("tab", { name: nome }).click();

test("visão geral: lista, pins no Vale, Ilha Grande fora, nada detalhado carregado", async ({
  page,
}) => {
  const pedidos = registrarCamadas(page);
  const raiz = await abrir(page);
  await expect(raiz).toHaveAttribute("data-foco", "vale");
  await expect(page.getByRole("tab")).toHaveCount(5);
  await expect(page.locator("h1")).toHaveCount(1);
  await exigirCoordenadas(page);

  await expect(page.locator('.tv-pin[data-tipo="lugar"]')).toHaveCount(4);
  const svg = await caixa(page, "[data-tv-mapa]");
  for (const id of ["recanto-da-serra", "borda-da-mata", "serra-dos-macacos"]) {
    const [x, y] = await pontaDoPin(page, `.tv-pin[data-pin="${id}"]`);
    expect(x).toBeGreaterThan(svg.x);
    expect(x).toBeLessThan(svg.x + svg.width);
    expect(y).toBeGreaterThan(svg.y);
    expect(y).toBeLessThan(svg.y + svg.height);
  }
  // Ilha Grande não é trazida para dentro do recorte.
  const [xIlha] = await pontaDoPin(page, '.tv-pin[data-pin="ilha-grande"]');
  expect(xIlha).toBeGreaterThan(svg.x + svg.width);
  await expect(page.locator('.tv-pin[data-pin="ilha-grande"]')).toHaveAttribute(
    "data-dentro-do-vale",
    "nao",
  );
  await expect(page.getByRole("tab", { name: /Ilha Grande/ })).toContainText(
    "fora do recorte do Vale",
  );

  expect(pedidos).toEqual([]);
  await expect(page.locator("[data-tv-camada-local] *")).toHaveCount(0);
  const html = await (await page.request.get(ROTA)).text();
  expect(html).not.toContain('class="l estrada"');
  expect(html).not.toContain('data-tipo="localidade-do-lugar"');
});

test("seleção por teclado troca a ficha inteira e o estado do mapa", async ({
  page,
}) => {
  const raiz = await abrir(page);
  await exigirCoordenadas(page);
  await page.getByRole("tab", { name: /Vale do Rio Real/ }).focus();
  await page.keyboard.press("ArrowDown");
  const aba = page.getByRole("tab", { name: /Recanto da Serra/ });
  await expect(aba).toBeFocused();
  await page.keyboard.press("Enter");

  await expect(aba).toHaveAttribute("aria-selected", "true");
  await expect(
    page.getByRole("tabpanel", { name: "Recanto da Serra" }),
  ).toBeVisible();
  await expect(
    page.getByRole("tabpanel", { name: "Vale do Rio Real" }),
  ).toBeHidden();
  await expect(raiz).toHaveAttribute("data-foco", "lugar-recanto-da-serra");
  await expect(page).toHaveURL(/#lugar-recanto-da-serra$/);
  await expect(page.locator("[data-tv-regiao-anuncio]")).toContainText(
    "Recanto da Serra selecionado",
  );
  const contorno = await aba.evaluate(
    (el) => getComputedStyle(el).outlineStyle,
  );
  expect(contorno).not.toBe("none");
});

test("Recanto: camada local sob demanda, uma vez, com pin distinto da localidade", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const pedidos = registrarCamadas(page);
  const raiz = await abrir(page);
  await exigirCoordenadas(page);
  const doRecanto = () => pedidos.filter((id) => id === "recanto-da-serra");
  expect(pedidos).toEqual([]);

  // Visão municipal (Tobias Barreto por outro lugar): nada do Recanto.
  await selecionar(page, /Museu Borda da Mata/);
  await expect(raiz).toHaveAttribute("data-foco", "lugar-borda-da-mata");
  expect(doRecanto()).toEqual([]);

  await selecionar(page, /Recanto da Serra/);
  await expect(raiz).toHaveAttribute("data-escala", "local");
  expect(doRecanto()).toHaveLength(1);

  const local = page.locator('[data-tv-camada-local="recanto-da-serra"]');
  const pin = local.locator('[data-tipo="lugar"][data-pin="recanto-da-serra"]');
  const referencia = local.locator('[data-tipo="localidade-do-lugar"]');
  await expect(pin).toHaveCount(1);
  await expect(pin).toHaveAttribute("data-selecionado", "true");
  await expect(referencia).toHaveCount(1);
  await expect(referencia.locator(".forma")).toHaveCount(0);
  const [px, py] = await pontaDoPin(
    page,
    '[data-tv-camada-local="recanto-da-serra"] [data-pin="recanto-da-serra"]',
  );
  const r = await caixa(
    page,
    '[data-tv-camada-local="recanto-da-serra"] [data-tipo="localidade-do-lugar"]',
  );
  expect(
    Math.hypot(px - (r.x + r.width / 2), py - (r.y + r.height / 2)),
  ).toBeGreaterThan(10);
  await expect(local).toContainText("▸ Recanto da Serra");
  await expect(local).toContainText("Jacaré · localidade");
  await expect(local).not.toContainText("não publicada");
  await expect(page.locator(".tv__legenda--local")).toBeVisible();
  await expect(page.locator(".tv__legenda--geral")).toBeHidden();
  await expect(page.locator(".tv__nota--local")).toContainText("OpenStreetMap");

  // Volta ao Vale e seleciona de novo: usa o que já está em memória.
  await selecionar(page, /Vale do Rio Real/);
  await expect(raiz).not.toHaveAttribute("data-escala", "local");
  await selecionar(page, /Recanto da Serra/);
  await expect(raiz).toHaveAttribute("data-escala", "local");
  expect(doRecanto()).toHaveLength(1);
});

test("a aproximação de cada lugar o centraliza — inclusive fora do Vale", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  // Sem camada local, o mapa fica na aproximação regional centrada no pin.
  await page.route(CAMADA, (rota) => rota.abort());
  const raiz = await abrir(page);
  await exigirCoordenadas(page);
  for (const [id, nome] of [
    ["recanto-da-serra", /Recanto da Serra/],
    ["borda-da-mata", /Museu Borda da Mata/],
    ["serra-dos-macacos", /Serra dos Macacos/],
    ["ilha-grande", /Ilha Grande/],
  ] as const) {
    await selecionar(page, nome);
    await expect(raiz).toHaveAttribute("data-foco", `lugar-${id}`);
    // Medido a cada seleção: clicar na aba pode rolar a página, e o mapa é sticky.
    const [cx, cy] = await centroDaVista(page);
    const [x, y] = await pontaDoPin(page, `.tv-pin[data-pin="${id}"]`);
    expect(Math.abs(x - cx), id).toBeLessThan(1);
    expect(Math.abs(y - cy), id).toBeLessThan(1);
  }
  await expect(
    page.getByRole("tabpanel", { name: "Ilha Grande" }).locator(".lacuna"),
  ).toBeVisible();
  // Ficha oculta sai da árvore de acessibilidade: conferida pelo id.
  await expect(page.locator("#tv-painel-serra-dos-macacos")).toContainText(
    "Restrito",
  );
});

test("Tobias Barreto: Recanto e Borda como pins reais, contagem como complemento", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route(CAMADA, (rota) => rota.abort());
  const raiz = await abrir(page);
  await exigirCoordenadas(page);
  await selecionar(page, /Museu Borda da Mata/);
  await expect(raiz).toHaveAttribute("data-foco", "lugar-borda-da-mata");

  const svg = await caixa(page, "[data-tv-mapa]");
  const [xr, yr] = await pontaDoPin(
    page,
    '.tv-pin[data-pin="recanto-da-serra"]',
  );
  const [xb, yb] = await pontaDoPin(page, '.tv-pin[data-pin="borda-da-mata"]');
  for (const [x, y] of [
    [xr, yr],
    [xb, yb],
  ]) {
    expect(x).toBeGreaterThan(svg.x);
    expect(x).toBeLessThan(svg.x + svg.width);
    expect(y).toBeGreaterThan(svg.y);
    expect(y).toBeLessThan(svg.y + svg.height);
  }
  expect(Math.hypot(xr - xb, yr - yb)).toBeGreaterThan(40);
  expect(
    await opacidade(page, '.tv-pin[data-pin="recanto-da-serra"] .nome'),
  ).toBe(1);
  const contagem = page.locator('.tv-contagem[data-codigo="2807402"]');
  await expect(contagem).toContainText("2 lugares visitados neste município");
  expect(await opacidade(page, '.tv-contagem[data-codigo="2807402"]')).toBe(1);
  await expect(page.locator("[data-tv-chip]")).toHaveCount(0);
  await expect(
    page.getByRole("tabpanel", { name: "Museu Borda da Mata" }),
  ).not.toContainText("Povoado");
});

test("com movimento reduzido, a troca para o mapa detalhado é imediata", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const raiz = await abrir(page);
  await exigirCoordenadas(page);
  await selecionar(page, /Recanto da Serra/);
  await expect(raiz).toHaveAttribute("data-escala", "local");
  // Lido uma vez, sem espera: com movimento reduzido não há transição.
  const estado = await page.evaluate(() => {
    const mundo = document.querySelector(".tv-mundo");
    const local = document.querySelector(
      '[data-tv-camada-local="recanto-da-serra"]',
    );
    if (mundo === null || local === null) return null;
    return {
      escala: new DOMMatrixReadOnly(getComputedStyle(mundo).transform).a,
      local: Number(getComputedStyle(local).opacity),
      mundo: Number(getComputedStyle(mundo).opacity),
    };
  });
  expect(estado?.escala).toBeGreaterThan(1.5);
  expect(estado?.local).toBe(1);
  expect(estado?.mundo).toBe(0);
});

test("tema escuro, mapa detalhado: vias, limite, nomes e pin selecionado contrastam", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  const raiz = await abrir(page, `${ROTA}#lugar-recanto-da-serra`);
  await exigirCoordenadas(page);
  await expect(raiz).toHaveAttribute("data-escala", "local");
  const r = await page.evaluate(() => {
    const rgb = (css: string): number[] => {
      const nums = (css.match(/-?\d*\.?\d+/g) ?? []).map(Number);
      return css.startsWith("color(")
        ? nums.slice(0, 3).map((n) => n * 255)
        : nums.slice(0, 3);
    };
    const lum = (css: string) => {
      const [r0, g0, b0] = rgb(css).map((v) => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * (r0 ?? 0) + 0.7152 * (g0 ?? 0) + 0.0722 * (b0 ?? 0);
    };
    const contraste = (a: string, b: string) => {
      const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
      return ((x ?? 0) + 0.05) / ((y ?? 0) + 0.05);
    };
    const escopo = '[data-tv-camada-local="recanto-da-serra"]';
    const estilo = (sel: string) => {
      const el = document.querySelector(sel);
      if (el === null) throw new Error(sel);
      return getComputedStyle(el);
    };
    const placa = estilo(".tv__plano").backgroundColor;
    const fundo = estilo(`${escopo} .mun`).fill;
    return {
      rodovia: contraste(estilo(`${escopo} .rodovia`).stroke, fundo),
      estrada: contraste(estilo(`${escopo} .estrada`).stroke, fundo),
      limite: contraste(estilo(`${escopo} .lim`).stroke, fundo),
      nome: contraste(estilo(`${escopo} .loc text`).fill, placa),
      contornoDoPin: contraste(
        estilo(`${escopo} .pin[data-selecionado="true"] .forma`).stroke,
        fundo,
      ),
      textoDoPin: contraste(
        estilo(`${escopo} .pin-rotulo.selecionado text`).fill,
        estilo(`${escopo} .pin-rotulo.selecionado rect`).fill,
      ),
      borda: contraste(
        estilo(".tv__plano").borderTopColor,
        estilo("body").backgroundColor,
      ),
    };
  });
  expect(r.rodovia).toBeGreaterThanOrEqual(3);
  expect(r.limite).toBeGreaterThanOrEqual(3);
  expect(r.nome).toBeGreaterThanOrEqual(4.5);
  expect(r.contornoDoPin).toBeGreaterThanOrEqual(3);
  expect(r.textoDoPin).toBeGreaterThanOrEqual(4.5);
  expect(r.estrada).toBeGreaterThan(1.3);
  expect(r.estrada).toBeLessThan(r.rodovia);
  expect(r.borda).toBeGreaterThanOrEqual(1.8);
});

test("como chegar: dois links explícitos, sem serviço externo antes do clique", async ({
  page,
}) => {
  const externos: string[] = [];
  page.on("request", (pedido) => {
    const url = new URL(pedido.url());
    if (url.hostname !== "localhost") externos.push(pedido.url());
  });
  await abrir(page, `${ROTA}#lugar-recanto-da-serra`);
  await exigirCoordenadas(page);
  const ficha = page.getByRole("tabpanel", { name: "Recanto da Serra" });
  await expect(ficha).toContainText("Povoado Jacaré, Tobias Barreto (SE)");
  await expect(ficha).not.toContainText("não publicada");
  const links = ficha.getByRole("link", { name: /Abrir rota/ });
  await expect(links).toHaveCount(2);
  for (const link of await links.all()) {
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", /noopener/);
    await expect(link).toHaveAttribute("rel", /noreferrer/);
    await expect(link).toHaveAttribute("referrerpolicy", "no-referrer");
  }
  await expect(page.locator("iframe")).toHaveCount(0);
  await page.waitForLoadState("networkidle");
  expect(externos).toEqual([]);
});

test("375px: mapa grande, seletor compacto e depois a ficha", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await abrir(page, `${ROTA}#lugar-recanto-da-serra`);
  const lista = page.getByRole("tablist");
  await expect(lista).toHaveAttribute("aria-orientation", "horizontal");
  const mapa = await caixa(page, "[data-tv-mapa]");
  const seletor = await caixa(page, "[data-tv-lista]");
  const ficha = await caixa(page, "#tv-painel-recanto-da-serra");
  expect(mapa.width).toBeGreaterThan(300);
  expect(mapa.height).toBeGreaterThan(380);
  expect(seletor.height).toBeLessThan(110);
  expect(mapa.y).toBeLessThan(seletor.y);
  expect(seletor.y).toBeLessThan(ficha.y);
  await page.getByRole("tab", { name: /Recanto da Serra/ }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("tab", { name: /Museu Borda da Mata/ }),
  ).toBeFocused();
});

for (const tema of ["light", "dark"] as const) {
  for (const largura of [375, 1440]) {
    test(`${largura}px, tema ${tema}: sem transbordo e sem imagem sem alt`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme: tema });
      await page.setViewportSize({ width: largura, height: 900 });
      await page.goto(`${ROTA}#lugar-recanto-da-serra`);
      const d = await page.evaluate(() => ({
        cliente: document.documentElement.clientWidth,
        rolagem: document.documentElement.scrollWidth,
        semAlt: [...document.images].filter((i) => !i.hasAttribute("alt"))
          .length,
      }));
      expect(d.rolagem).toBeLessThanOrEqual(d.cliente);
      expect(d.semAlt).toBe(0);
    });
  }
}
