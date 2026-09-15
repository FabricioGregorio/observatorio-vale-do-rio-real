import { expect, type Page, test } from "@playwright/test";

/**
 * Laboratório territorial (`/dev/territorio-vivo`). DEV; 404 em produção.
 *
 * Referências territoriais públicas dos quatro lugares (Tarefa 20).
 */

const ROTA = "/dev/territorio-vivo";
const CAMADA = /\/dev\/territorio-vivo\/camada-local\/([a-z-]+)$/;

const LUGARES = [
  {
    id: "recanto-da-serra",
    aba: /Recanto da Serra/,
    ficha: "Recanto da Serra",
    localidade: "Povoado Jacaré, Tobias Barreto (SE)",
    latitude: "-11.015393101706083",
    longitude: "-38.048667603935414",
  },
  {
    id: "borda-da-mata",
    aba: /Museu Borda da Mata/,
    ficha: "Museu Borda da Mata",
    localidade: "Povoado Borda da Mata, Tobias Barreto (SE)",
    latitude: "-11.127754407274919",
    longitude: "-37.88642982557546",
  },
  {
    id: "serra-dos-macacos",
    aba: /Serra dos Macacos/,
    ficha: "Serra dos Macacos",
    localidade: "Comunidade próxima à Vila de Samambaia, Tobias Barreto (SE)",
    latitude: "-10.8811",
    longitude: "-37.9867",
  },
  {
    id: "ilha-grande",
    aba: /Ilha Grande/,
    ficha: "Ilha Grande",
    localidade: "Povoado Ilha Grande, São Cristóvão (SE)",
    latitude: "-11.0639",
    longitude: "-37.2086",
  },
] as const;

async function abrir(page: Page, destino: string = ROTA) {
  await page.goto(destino);
  const raiz = page.locator("#territorio-vivo");
  await expect(raiz).toHaveAttribute("data-interativo", "true");
  return raiz;
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
 * do grupo do pin, cuja origem é a própria coordenada.
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

test("visão geral: quatro na lista, pins na posição real, Ilha Grande fora, nada detalhado carregado", async ({
  page,
}) => {
  const pedidos = registrarCamadas(page);
  const raiz = await abrir(page);
  await expect(raiz).toHaveAttribute("data-foco", "vale");
  await expect(page.getByRole("tab")).toHaveCount(5);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveText("Cartografia Viva");
  await expect(page.locator(".tv-dev")).toHaveCount(0);
  await expect(page.locator(".tv__cab")).toContainText(
    "Cinco municípios formam o recorte do Vale do Rio Real",
  );
  await expect(page.locator(".tv__cab")).toContainText(
    "Ilha Grande integra a pesquisa em São Cristóvão, fora desse recorte",
  );

  await expect(page.locator('.tv-pin[data-tipo="lugar"]')).toHaveCount(4);
  const svg = await caixa(page, "[data-tv-mapa]");
  for (const id of ["recanto-da-serra", "borda-da-mata", "serra-dos-macacos"]) {
    const [x, y] = await pontaDoPin(page, `.tv-pin[data-pin="${id}"]`);
    expect(x, id).toBeGreaterThan(svg.x);
    expect(x, id).toBeLessThan(svg.x + svg.width);
    expect(y, id).toBeGreaterThan(svg.y);
    expect(y, id).toBeLessThan(svg.y + svg.height);
  }
  const [xIlha] = await pontaDoPin(page, '.tv-pin[data-pin="ilha-grande"]');
  expect(xIlha).toBeGreaterThan(svg.x + svg.width);
  await expect(page.locator('.tv-pin[data-pin="ilha-grande"]')).toHaveAttribute(
    "data-dentro-do-vale",
    "nao",
  );
  await expect(page.getByRole("tab", { name: /Ilha Grande/ })).toContainText(
    "São Cristóvão · fora do recorte do Vale",
  );
  // São Cristóvão continua fora do recorte: não recebe o preenchimento do Vale.
  await expect(page.locator('.m[data-codigo="2806701"]')).not.toHaveClass(
    /\bv\b/,
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

test("a ficha permite voltar à visão territorial sem recarregar", async ({
  page,
}) => {
  const raiz = await abrir(page);
  await selecionar(page, /Serra dos Macacos/);
  const ficha = page.getByRole("tabpanel", { name: "Serra dos Macacos" });
  await ficha
    .getByRole("link", { name: "Voltar à visão do território" })
    .click();
  await expect(raiz).toHaveAttribute("data-foco", "vale");
  await expect(
    page.getByRole("tab", { name: /Vale do Rio Real/ }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(page).toHaveURL(/#lugar-vale$/);
});

test("sob demanda: 0 no início, 1 por lugar, cache ao voltar, outro lugar só a sua camada", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const pedidos = registrarCamadas(page);
  const raiz = await abrir(page);
  expect(pedidos).toEqual([]);

  await selecionar(page, /Recanto da Serra/);
  await expect(raiz).toHaveAttribute("data-escala", "local");
  expect(pedidos).toEqual(["recanto-da-serra"]);

  await selecionar(page, /Vale do Rio Real/);
  await expect(raiz).not.toHaveAttribute("data-escala", "local");
  await selecionar(page, /Recanto da Serra/);
  await expect(raiz).toHaveAttribute("data-escala", "local");
  expect(pedidos).toEqual(["recanto-da-serra"]);

  await selecionar(page, /Museu Borda da Mata/);
  await expect(raiz).toHaveAttribute("data-foco", "lugar-borda-da-mata");
  await expect(raiz).toHaveAttribute("data-escala", "local");
  expect(pedidos).toEqual(["recanto-da-serra", "borda-da-mata"]);
});

test("mapa local: pin do lugar, localidade IBGE distinta, atribuição do OSM visível", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const raiz = await abrir(page);
  for (const [id, aba, referencia] of [
    ["recanto-da-serra", /Recanto da Serra/, "Jacaré · localidade"],
    ["borda-da-mata", /Museu Borda da Mata/, "Borda da Mata · localidade"],
  ] as const) {
    await selecionar(page, aba);
    await expect(raiz).toHaveAttribute("data-escala", "local");
    const escopo = `[data-tv-camada-local="${id}"]`;
    const pin = page.locator(`${escopo} [data-tipo="lugar"][data-pin="${id}"]`);
    const ref = page.locator(`${escopo} [data-tipo="localidade-do-lugar"]`);
    await expect(pin).toHaveAttribute("data-selecionado", "true");
    await expect(ref).toHaveCount(1);
    await expect(ref.locator(".forma")).toHaveCount(0);
    const [px, py] = await pontaDoPin(page, `${escopo} [data-pin="${id}"]`);
    const r = await caixa(page, `${escopo} [data-tipo="localidade-do-lugar"]`);
    expect(
      Math.hypot(px - (r.x + r.width / 2), py - (r.y + r.height / 2)),
      id,
    ).toBeGreaterThan(10);
    await expect(page.locator(escopo)).toContainText(referencia);
    await expect(page.locator(escopo)).not.toContainText("não publicada");
    await expect(page.locator(".tv__nota--local")).toBeVisible();
    await expect(page.locator(".tv__nota--local")).toContainText(
      "© contribuidores do OpenStreetMap — ODbL 1.0",
    );
  }
});

test("Serra: comunidade visitada e Vila Samambaia permanecem territorialmente distintas", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const raiz = await abrir(page);
  await selecionar(page, /Serra dos Macacos/);
  await expect(raiz).toHaveAttribute("data-escala", "local");

  const escopo = '[data-tv-camada-local="serra-dos-macacos"]';
  const pin = page.locator(
    `${escopo} [data-tipo="lugar"][data-pin="serra-dos-macacos"]`,
  );
  const referencia = page.locator(
    `${escopo} [data-tipo="referencia-cartografica"][data-codigo-ibge="280740210"]`,
  );
  await expect(pin).toHaveAttribute("data-selecionado", "true");
  await expect(referencia).toHaveCount(1);
  await expect(referencia).toContainText("Vila Samambaia · IBGE");
  await expect(
    page.locator(`${escopo} [data-tipo="localidade-do-lugar"]`),
  ).toHaveCount(0);

  const ficha = page.getByRole("tabpanel", { name: "Serra dos Macacos" });
  await expect(ficha).toContainText(
    "Comunidade próxima à Vila de Samambaia, Tobias Barreto (SE)",
  );
  await expect(ficha).toContainText(
    "Vila Samambaia · IBGE — referência territorial próxima; não representa o lugar visitado.",
  );
  await expect(ficha).not.toContainText("A04");
  await expect(ficha).not.toContainText(/Restrito|Em revisão/);
});

test("a candidata omite lacunas restritas sem reclassificar materiais", async ({
  page,
}) => {
  await abrir(page);
  await selecionar(page, /Museu Borda da Mata/);
  const borda = page.getByRole("tabpanel", { name: "Museu Borda da Mata" });
  await expect(borda).not.toContainText(/Restrito|Em revisão/);
  await expect(
    borda.getByRole("heading", { name: "Evidências públicas" }),
  ).toHaveCount(0);

  await selecionar(page, /Recanto da Serra/);
  const recanto = page.getByRole("tabpanel", { name: "Recanto da Serra" });
  await expect(recanto).toContainText("Relatório técnico");
  await expect(recanto).toContainText("Atribuição formal de local pendente");
  await expect(recanto).not.toContainText(/Restrito|Em revisão/);
});

test("cada seleção centraliza o pin e o mapa local pertence ao lugar", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  let bloquear = true;
  await page.route(CAMADA, (rota) =>
    bloquear ? rota.abort() : rota.continue(),
  );
  const raiz = await abrir(page);
  for (const lugar of LUGARES) {
    await selecionar(page, lugar.aba);
    await expect(raiz).toHaveAttribute("data-foco", `lugar-${lugar.id}`);
    // Medido a cada seleção: clicar na aba pode rolar a página, e o mapa é sticky.
    const [cx, cy] = await centroDaVista(page);
    const [x, y] = await pontaDoPin(page, `.tv-pin[data-pin="${lugar.id}"]`);
    expect(Math.abs(x - cx), lugar.id).toBeLessThan(1);
    expect(Math.abs(y - cy), lugar.id).toBeLessThan(1);
  }
  bloquear = false;
  for (const lugar of LUGARES) {
    await selecionar(page, lugar.aba);
    await expect(raiz).toHaveAttribute("data-escala", "local");
    const escopo = page.locator(`[data-tv-camada-local="${lugar.id}"]`);
    await expect(escopo.locator('[data-selecionado="true"]')).toHaveAttribute(
      "data-pin",
      lugar.id,
    );
    expect(await opacidade(page, `[data-tv-camada-local="${lugar.id}"]`)).toBe(
      1,
    );
  }
});

test("Tobias Barreto: Recanto, Borda e Serra como pins reais; contagem complementar", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route(CAMADA, (rota) => rota.abort());
  const raiz = await abrir(page);
  await selecionar(page, /Museu Borda da Mata/);
  await expect(raiz).toHaveAttribute("data-foco", "lugar-borda-da-mata");

  const svg = await caixa(page, "[data-tv-mapa]");
  const pontas: (readonly [number, number])[] = [];
  for (const id of ["recanto-da-serra", "borda-da-mata", "serra-dos-macacos"]) {
    const [x, y] = await pontaDoPin(page, `.tv-pin[data-pin="${id}"]`);
    expect(x, id).toBeGreaterThan(svg.x);
    expect(x, id).toBeLessThan(svg.x + svg.width);
    expect(y, id).toBeGreaterThan(svg.y);
    expect(y, id).toBeLessThan(svg.y + svg.height);
    expect(await opacidade(page, `.tv-pin[data-pin="${id}"] .nome`), id).toBe(
      1,
    );
    pontas.push([x, y]);
  }
  const [a, b] = pontas;
  expect(
    Math.hypot((a?.[0] ?? 0) - (b?.[0] ?? 0), (a?.[1] ?? 0) - (b?.[1] ?? 0)),
  ).toBeGreaterThan(40);
  const contagem = page.locator('.tv-contagem[data-codigo="2807402"]');
  await expect(contagem).toContainText("3 lugares visitados neste município");
  expect(await opacidade(page, '.tv-contagem[data-codigo="2807402"]')).toBe(1);
});

test("com movimento reduzido, a troca para o mapa detalhado é imediata", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const raiz = await abrir(page);
  await selecionar(page, /Recanto da Serra/);
  await expect(raiz).toHaveAttribute("data-escala", "local");
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

test("tema escuro, quatro mapas detalhados: vias, limite, nomes e pin selecionado contrastam", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  const raiz = await abrir(page);
  for (const lugar of LUGARES) {
    await selecionar(page, lugar.aba);
    await expect(raiz).toHaveAttribute("data-escala", "local");
    const r = await page.evaluate((id) => {
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
      const escopo = `[data-tv-camada-local="${id}"]`;
      const estilo = (sel: string) => {
        const el = document.querySelector(sel);
        if (el === null) throw new Error(sel);
        return getComputedStyle(el);
      };
      const placa = estilo(".tv__plano").backgroundColor;
      const fundo = estilo(`${escopo} .mun`).fill;
      return {
        rodovia: contraste(estilo(`${escopo} .rodovia`).stroke, fundo),
        limite: contraste(estilo(`${escopo} .lim`).stroke, fundo),
        nome: contraste(estilo(`${escopo} .loc text`).fill, placa),
        contornoDoPin: contraste(
          estilo(`${escopo} .pin[data-selecionado="true"] .forma`).stroke,
          fundo,
        ),
        larguraDoContorno: Number.parseFloat(
          estilo(`${escopo} .pin[data-selecionado="true"] .forma`).strokeWidth,
        ),
        textoDoPin: contraste(
          estilo(`${escopo} .pin-rotulo.selecionado text`).fill,
          estilo(`${escopo} .pin-rotulo.selecionado rect`).fill,
        ),
        etiqueta:
          document.querySelector(`${escopo} .pin-rotulo.selecionado text`)
            ?.textContent ?? "",
        borda: contraste(
          estilo(".tv__plano").borderTopColor,
          estilo("body").backgroundColor,
        ),
      };
    }, lugar.id);
    expect(r.rodovia, lugar.id).toBeGreaterThanOrEqual(3);
    expect(r.limite, lugar.id).toBeGreaterThanOrEqual(3);
    expect(r.nome, lugar.id).toBeGreaterThanOrEqual(4.5);
    expect(r.contornoDoPin, lugar.id).toBeGreaterThanOrEqual(3);
    // Selecionado não depende só de cor: contorno mais grosso e etiqueta "▸".
    expect(r.larguraDoContorno, lugar.id).toBeGreaterThanOrEqual(2.5);
    expect(r.etiqueta, lugar.id).toMatch(/^▸ /);
    expect(r.textoDoPin, lugar.id).toBeGreaterThanOrEqual(4.5);
    expect(r.borda, lugar.id).toBeGreaterThanOrEqual(1.8);
  }
});

test("como chegar nos quatro: localidade, links exatos, nada externo antes do clique", async ({
  page,
}) => {
  const externos: string[] = [];
  page.on("request", (pedido) => {
    const url = new URL(pedido.url());
    if (url.hostname !== "localhost") externos.push(pedido.url());
  });
  await abrir(page);
  for (const lugar of LUGARES) {
    await selecionar(page, lugar.aba);
    const ficha = page.getByRole("tabpanel", { name: lugar.ficha });
    await expect(ficha).toContainText(lugar.localidade);
    await expect(ficha).not.toContainText("não publicada");
    await expect(ficha).not.toContainText("não foi autorizada");
    const links = ficha.getByRole("link", {
      name: /OpenStreetMap|Google Maps/,
    });
    await expect(links).toHaveCount(2);
    await expect(
      ficha.getByRole("link", { name: "OpenStreetMap", exact: true }),
    ).toHaveAttribute(
      "href",
      `https://www.openstreetmap.org/directions?route=%3B${lugar.latitude}%2C${lugar.longitude}`,
    );
    await expect(
      ficha.getByRole("link", { name: "Google Maps", exact: true }),
    ).toHaveAttribute(
      "href",
      `https://www.google.com/maps/dir/?api=1&destination=${lugar.latitude}%2C${lugar.longitude}`,
    );
    for (const link of await links.all()) {
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", /noopener/);
      await expect(link).toHaveAttribute("rel", /noreferrer/);
      await expect(link).toHaveAttribute("referrerpolicy", "no-referrer");
    }
    // Material restrito ou em revisão continua sem link.
    await expect(
      ficha
        .locator(".materiais li")
        .filter({ hasText: /Restrito|Em revisão/ })
        .locator("a"),
    ).toHaveCount(0);
  }
  await expect(
    page.getByRole("tabpanel", { name: "Serra dos Macacos" }),
  ).toBeHidden();
  await expect(page.locator("#tv-painel-serra-dos-macacos")).toContainText(
    "divisa com os municípios de Simão Dias e Poço Verde",
  );
  await expect(page.locator("iframe")).toHaveCount(0);
  await page.waitForLoadState("networkidle");
  expect(externos).toEqual([]);
});

test("375px, quatro lugares: mapa grande, seletor compacto, ficha, pin legível sem colisão", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const raiz = await abrir(page);
  const lista = page.getByRole("tablist");
  await expect(lista).toHaveAttribute("aria-orientation", "horizontal");
  for (const lugar of LUGARES) {
    await selecionar(page, lugar.aba);
    await expect(raiz).toHaveAttribute("data-escala", "local");
    const mapa = await caixa(page, "[data-tv-mapa]");
    const seletor = await caixa(page, "[data-tv-lista]");
    const ficha = await caixa(page, `#tv-painel-${lugar.id}`);
    expect(mapa.width, lugar.id).toBeGreaterThan(300);
    expect(mapa.height, lugar.id).toBeGreaterThan(380);
    expect(seletor.height, lugar.id).toBeLessThan(110);
    expect(mapa.y, lugar.id).toBeLessThan(seletor.y);
    expect(seletor.y, lugar.id).toBeLessThan(ficha.y);
    const abaAtiva = page.getByRole("tab", { name: lugar.aba });
    const visivel = await abaAtiva.evaluate((el) => {
      const aba = el.getBoundingClientRect();
      const lista = el.parentElement?.parentElement?.getBoundingClientRect();
      return (
        lista !== undefined &&
        aba.left >= lista.left - 1 &&
        aba.right <= lista.right + 1
      );
    });
    expect(visivel, lugar.id).toBe(true);

    const escopo = `[data-tv-camada-local="${lugar.id}"]`;
    const [px, py] = await pontaDoPin(
      page,
      `${escopo} [data-pin="${lugar.id}"]`,
    );
    expect(px, lugar.id).toBeGreaterThan(mapa.x);
    expect(px, lugar.id).toBeLessThan(mapa.x + mapa.width);
    expect(py, lugar.id).toBeGreaterThan(mapa.y);
    expect(py, lugar.id).toBeLessThan(mapa.y + mapa.height);
    const etiqueta = await caixa(page, `${escopo} .pin-rotulo.selecionado`);
    expect(etiqueta.height, lugar.id).toBeGreaterThanOrEqual(10);
    // A etiqueta do pin selecionado não cruza nenhum outro rótulo visível.
    const colisoes = await page.evaluate(
      ({ seletorDoEscopo }) => {
        const escopoEl = document.querySelector(seletorDoEscopo);
        const alvo = escopoEl
          ?.querySelector(".pin-rotulo.selecionado")
          ?.getBoundingClientRect();
        if (escopoEl === null || alvo === undefined) return -1;
        const outros = [
          ...escopoEl.querySelectorAll(
            ".loc text, .ref-rotulo, text.pin-rotulo, .escudo",
          ),
        ].filter(
          (el) => getComputedStyle(el.closest("g") ?? el).display !== "none",
        );
        return outros.filter((el) => {
          const r = el.getBoundingClientRect();
          return (
            r.width > 0 &&
            r.left < alvo.right &&
            r.right > alvo.left &&
            r.top < alvo.bottom &&
            r.bottom > alvo.top
          );
        }).length;
      },
      { seletorDoEscopo: escopo },
    );
    expect(colisoes, lugar.id).toBe(0);
  }
});

test("375px, a candidata não cria controle fixo sobre a ficha", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await abrir(page);
  await selecionar(page, /Recanto da Serra/);
  const ficha = page.getByRole("tabpanel", { name: "Recanto da Serra" });
  await ficha.scrollIntoViewIfNeeded();

  const sobreposicoes = await page
    .locator("#territorio-vivo *")
    .evaluateAll((elementos) => {
      const alvo = document
        .querySelector('#territorio-vivo [role="tabpanel"]:not([hidden])')
        ?.getBoundingClientRect();
      if (alvo === undefined) return -1;
      return elementos.filter((elemento) => {
        if (getComputedStyle(elemento).position !== "fixed") return false;
        const caixa = elemento.getBoundingClientRect();
        return (
          caixa.width > 0 &&
          caixa.height > 0 &&
          caixa.left < alvo.right &&
          caixa.right > alvo.left &&
          caixa.top < alvo.bottom &&
          caixa.bottom > alvo.top
        );
      }).length;
    });
  expect(sobreposicoes).toBe(0);
});

for (const tema of ["light", "dark"] as const) {
  for (const largura of [375, 1440]) {
    test(`${largura}px, tema ${tema}: sem transbordo e sem imagem sem alt`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme: tema });
      await page.setViewportSize({ width: largura, height: 900 });
      await page.goto(`${ROTA}#lugar-ilha-grande`);
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
