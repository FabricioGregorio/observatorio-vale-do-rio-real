import { expect, test } from "@playwright/test";

test("Território público preserva quatro lugares e lazy loading das camadas", async ({
  page,
}) => {
  const camadas: string[] = [];
  page.on("request", (pedido) => {
    if (pedido.url().includes("/territorio/camada-local/"))
      camadas.push(pedido.url());
  });

  const resposta = await page.goto("/territorio");
  expect(resposta?.status()).toBe(200);
  await expect(
    page.getByRole("heading", { level: 1, name: "Cartografia Viva" }),
  ).toBeVisible();
  expect(camadas).toHaveLength(0);

  const percurso = page.getByRole("navigation", { name: "Explore os lugares" });
  for (const lugar of [
    "Recanto da Serra",
    "Museu Borda da Mata",
    "Serra dos Macacos",
    "Ilha Grande",
  ]) {
    await percurso.getByRole("tab", { name: new RegExp(lugar) }).click();
  }
  await expect.poll(() => camadas.length).toBe(4);
  expect(camadas.every((url) => !url.includes("/dev/"))).toBe(true);
});

for (const largura of [375, 1440]) {
  test(`Território público sem overflow em ${largura}px`, async ({ page }) => {
    await page.setViewportSize({ width: largura, height: 900 });
    await page.goto("/territorio");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.emulateMedia({ colorScheme: "dark" });
    await expect(page.locator("#territorio-vivo")).toBeVisible();
  });
}

test("Território mantém conteúdo essencial sem JavaScript", async ({
  browser,
}) => {
  const contexto = await browser.newContext({ javaScriptEnabled: false });
  const pagina = await contexto.newPage();
  await pagina.goto("/territorio");
  await expect(
    pagina.getByRole("heading", { level: 1, name: "Cartografia Viva" }),
  ).toBeVisible();
  await expect(
    pagina.getByRole("heading", { level: 2, name: "Serra dos Macacos" }),
  ).toBeAttached();
  await contexto.close();
});

/**
 * Contrato de acessibilidade da Cartografia Viva.
 *
 * Estes cenários já estavam previstos e faltavam. Nenhuma funcionalidade nova
 * foi criada para eles: o percurso já era um `tablist` com roving tabindex, e
 * é isso que passa a ficar protegido. A exploração por recorte da Home é
 * outra coisa, coberta em `mapa.spec.ts` — a experiência completa continua
 * sendo desta página.
 */
test.describe("Território — teclado e estado", () => {
  test("o percurso é um tablist com uma única parada de Tab", async ({
    page,
  }) => {
    await page.goto("/territorio");
    const abas = page.getByRole("tab");

    await expect(abas).toHaveCount(5);
    await expect(page.locator('[role="tab"][tabindex="0"]')).toHaveCount(1);
    await expect(page.locator('[role="tab"][tabindex="-1"]')).toHaveCount(4);
  });

  test("as setas andam entre os lugares e o estado selecionado é declarado", async ({
    page,
  }) => {
    await page.goto("/territorio");
    const primeira = page.locator('[role="tab"][tabindex="0"]');
    const idInicial = await primeira.getAttribute("id");
    await primeira.focus();

    await page.keyboard.press("ArrowRight");
    const ativa = page.locator('[role="tab"]:focus');
    // A seta move o foco para outra aba: nenhuma fica inalcançável.
    await expect(ativa).not.toHaveAttribute("id", idInicial ?? "");

    await page.keyboard.press("Enter");
    await expect(ativa).toHaveAttribute("aria-selected", "true");
    await expect(
      page.locator('[role="tab"][aria-selected="true"]'),
    ).toHaveCount(1);

    const idDoPainel = await ativa.getAttribute("aria-controls");
    expect(idDoPainel).not.toBeNull();
    await expect(page.locator(`#${idDoPainel}`)).toBeVisible();
  });

  test("a aba focada tem contorno visível", async ({ page }) => {
    await page.goto("/territorio");
    await page.locator('[role="tab"][tabindex="0"]').focus();
    await page.keyboard.press("ArrowRight");

    const contorno = await page.evaluate(() => {
      const alvo = document.activeElement;
      if (alvo === null) return null;
      const estilo = getComputedStyle(alvo);
      return { estilo: estilo.outlineStyle, largura: estilo.outlineWidth };
    });
    expect(contorno?.estilo).not.toBe("none");
    expect(Number.parseFloat(contorno?.largura ?? "0")).toBeGreaterThan(0);
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
      expect((await link.innerText()).trim().length).toBeGreaterThan(0);
    }
  });

  test("com movimento reduzido nada anima e o conteúdo continua inteiro", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/territorio");

    const animado = await page.evaluate(() =>
      [...document.querySelectorAll("#territorio-vivo *")]
        .map((e) => getComputedStyle(e))
        .some(
          (s) => s.animationName !== "none" && s.animationDuration !== "0s",
        ),
    );
    expect(animado).toBe(false);
    await expect(page.getByRole("tab")).toHaveCount(5);
  });
});
