import { expect, test } from "@playwright/test";

/**
 * O índice é documental; os objetos binários só são oferecidos nas páginas
 * contextuais e não são carregados automaticamente na abertura.
 */
test("Acervo responde 200, lista todo o acervo público e não baixa nada sozinho", async ({
  page,
  request,
}) => {
  const documentosCarregados: string[] = [];
  page.on("request", (pedido) => {
    if (/\.(?:pdf|zip|xlsx|m4a|mp3)(?:\?|$)/i.test(pedido.url())) {
      documentosCarregados.push(pedido.url());
    }
  });
  const { anexos, total } = (await (
    await request.get("/anexos.json")
  ).json()) as {
    total: number;
    anexos: Array<{ slug: string }>;
  };
  expect(total).toBe(107);
  const resposta = await page.goto("/acervo");
  expect(resposta?.status()).toBe(200);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Documentos e registros da pesquisa",
    }),
  ).toBeVisible();

  const links = page.locator('main a[href^="/acervo/"]');
  await expect(links).toHaveCount(new Set(anexos.map((a) => a.slug)).size);
  for (const href of await links.evaluateAll((elementos) =>
    elementos.map((elemento) => elemento.getAttribute("href")),
  )) {
    expect(href).toMatch(/^\/acervo\/[^/]+$/);
  }
  expect(documentosCarregados).toEqual([]);
});

test("B01 abre dez grupos e 59 páginas contextuais, sem carregar imagens", async ({
  page,
}) => {
  await page.goto("/acervo");
  const link = page.locator('main a[href="/acervo/fotografias-visitas-i-vii"]');
  await expect(link).toHaveCount(1);
  await link.click();
  await expect(page.locator("main section.acervo-secao")).toHaveCount(10);
  await expect(page.locator('main a[href*="/arquivo/"]')).toHaveCount(59);
  await expect(page.locator("main img")).toHaveCount(0);
  await expect(
    page.getByText(/58 fotografias e 1 elemento gráfico/),
  ).toBeVisible();
});

for (const largura of [375, 1440]) {
  test(`Acervo é legível, sem overflow, em ${largura}px`, async ({ page }) => {
    await page.setViewportSize({ width: largura, height: 900 });
    await page.goto("/acervo");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.emulateMedia({ colorScheme: "dark" });
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Documentos e registros da pesquisa",
      }),
    ).toBeVisible();
  });
}

test("conteúdo essencial do Acervo permanece no HTML sem JavaScript", async ({
  browser,
}) => {
  const contexto = await browser.newContext({ javaScriptEnabled: false });
  const pagina = await contexto.newPage();
  await pagina.goto("/acervo");
  await expect(
    pagina.getByRole("heading", {
      level: 1,
      name: "Documentos e registros da pesquisa",
    }),
  ).toBeVisible();
  await expect(
    pagina.locator('main a[href^="/acervo/"]').first(),
  ).toBeAttached();
  await expect(pagina.locator('main a[href^="/acervo/"]')).toHaveCount(16);
  await contexto.close();
});

test("busca, filtro, URL e histórico mantêm o índice navegável", async ({
  page,
}) => {
  await page.goto("/acervo");
  await expect(page.locator(".acervo-card")).toHaveCount(16);
  await page
    .getByRole("searchbox", { name: "Buscar documentos" })
    .fill("serra");
  await page.getByRole("button", { name: "Buscar", exact: true }).click();
  await expect(page).toHaveURL(/\?q=serra$/);
  await expect(page.locator(".acervo-card").first()).toBeVisible();
  await page
    .getByLabel("Tipo de documento")
    .selectOption("entrevista_transcricao");
  await expect(page).toHaveURL(/q=serra&tipo=entrevista_transcricao/);
  await page.goBack();
  await expect(
    page.getByRole("searchbox", { name: "Buscar documentos" }),
  ).toHaveValue("serra");
  await page.goto("/acervo?q=algo-que-nao-existe");
  await expect(
    page.getByText("Nenhum documento ou arquivo corresponde a esta busca."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Limpar busca e filtros" }).click();
  await expect(page).toHaveURL(/\/acervo$/);
  await expect(page.locator(".acervo-card")).toHaveCount(16);
  await page.goto("/acervo?tipo=valor-invalido");
  await expect(page.locator(".acervo-card")).toHaveCount(16);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://observatoriotobiassoueu.com.br/acervo",
  );
});

test("a busca acha o arquivo dentro do documento pai, sem acento e por teclado", async ({
  page,
}) => {
  await page.goto("/acervo");
  const busca = page.getByRole("searchbox", { name: "Buscar documentos" });
  await busca.focus();
  await page.keyboard.type("serie mensal");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\?q=serie\+mensal$/);
  await expect(page.getByRole("status").first()).toHaveText(
    "1 documento encontrado, com 1 arquivo correspondente",
  );
  const cartao = page.locator(".acervo-card");
  await expect(cartao).toHaveCount(1);
  await expect(cartao.getByRole("heading", { level: 3 })).toHaveText(
    "Anexo Técnico de Indicadores — Etapa 1 de Levantamento",
  );
  const arquivo = cartao.locator(".acervo-correspondencia a");
  await expect(arquivo).toHaveCount(1);
  await expect(arquivo).toHaveAttribute(
    "href",
    /^\/acervo\/anexo-indicadores-etapa-1\/arquivo\/[0-9a-f-]{36}$/,
  );
  // As duas saídas estão no card: o arquivo e o documento.
  await expect(
    cartao.locator('a[href="/acervo/anexo-indicadores-etapa-1"]'),
  ).toBeVisible();
  // O link do arquivo é alcançável por teclado, com foco visível.
  let alcancou = false;
  for (let i = 0; i < 12 && !alcancou; i++) {
    await page.keyboard.press("Tab");
    alcancou = await arquivo.evaluate((a) => a === document.activeElement);
  }
  expect(alcancou).toBe(true);
  expect(
    await arquivo.evaluate((a) => getComputedStyle(a).outlineStyle),
  ).not.toBe("none");

  await page.goto("/acervo?q=oviedo");
  await expect(page.locator(".acervo-card h3")).toContainText([
    "Entrevista — Oviêdo e Neide Abreu (28/03/2026)",
  ]);
  await page.goto("/acervo?q=Secretaria&tipo=relatorio_tecnico");
  await expect(page.locator(".acervo-card")).toHaveCount(0);
});

for (const largura of [320, 375, 390, 430]) {
  test(`resultados da busca não excedem ${largura}px`, async ({ page }) => {
    await page.setViewportSize({ width: largura, height: 900 });
    for (const q of ["serie mensal", "Recanto", "Secretaria", "transcricao"]) {
      await page.goto(`/acervo?q=${encodeURIComponent(q)}`);
      await expect(page.locator(".acervo-card").first()).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        q,
      ).toBe(true);
    }
  });
}

for (const largura of [375, 768, 1440]) {
  test(`páginas documentais não excedem ${largura}px`, async ({ page }) => {
    await page.setViewportSize({ width: largura, height: 900 });
    for (const rota of [
      "/acervo/fotografias-visitas-i-vii",
      "/acervo/fotografias-visitas-i-vii/arquivo/d0af646c-e6b0-423d-9edc-d5ffc74b246a",
    ]) {
      await page.goto(rota);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
  });
}
