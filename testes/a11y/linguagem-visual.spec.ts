import { expect, test } from "@playwright/test";

const ROTA = "/dev/linguagem-visual";

for (const tema of ["light", "dark"] as const) {
  for (const largura of [320, 375, 768, 1440]) {
    test(`H3.5: A/B em ${largura} ${tema}, leitura e ausência de overflow`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme: tema });
      await page.setViewportSize({ width: largura, height: 900 });
      await page.goto(ROTA);
      for (const preset of ["A", "B"]) {
        await page.locator(`input[value="${preset}"]`).check();
        const artigo = page.locator(`[data-preset="${preset}"]`);
        await expect(artigo).toBeVisible();
        await expect(artigo.locator(".lv-fotografia img")).toHaveAttribute(
          "alt",
          /Fachada|igreja/i,
        );
        expect(
          await page.evaluate(
            () =>
              document.documentElement.scrollWidth <=
              document.documentElement.clientWidth,
          ),
        ).toBe(true);
        const cores = await artigo
          .locator(".lv-campo")
          .evaluate((elemento) => ({
            fundo: getComputedStyle(elemento).backgroundColor,
            texto: getComputedStyle(elemento).color,
          }));
        expect(cores.fundo).not.toBe(cores.texto);
      }
    });
  }
}

test("H3.5: teclado, disclosure, foco e decorativos sem interceptação", async ({
  page,
}) => {
  await page.goto(ROTA);
  const primeiro = page.locator('input[value="A"]');
  await primeiro.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator('input[value="B"]')).toBeChecked();
  const artigo = page.locator('[data-preset="B"]');
  const resumo = artigo.locator("summary");
  await resumo.focus();
  await page.keyboard.press("Enter");
  await expect(artigo.locator("details")).toHaveAttribute("open", "");
  await page.keyboard.press("Tab");
  const link = artigo.getByRole("link", { name: /Explorar o mapa/ });
  await expect(link).toBeFocused();
  expect(await link.evaluate((e) => getComputedStyle(e).outlineWidth)).toBe(
    "3px",
  );
  for (const seletor of [".lv-assinatura", ".lv-fio", ".lv-eixos"]) {
    const decorativo = artigo.locator(seletor);
    await expect(decorativo).toHaveAttribute("aria-hidden", "true");
    expect(
      await decorativo.evaluate((e) => getComputedStyle(e).pointerEvents),
    ).toBe("none");
  }
  const foto = artigo.locator(".lv-foto-link");
  await foto.focus();
  await expect(foto).toBeFocused();
  await foto.click({ trial: true });
});

test("H3.5: reveal único, hidratação, hover e mudança de preferência", async ({
  page,
}) => {
  const erros: string[] = [];
  page.on("pageerror", (erro) => erros.push(erro.message));
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto(ROTA);
  await page.locator('input[value="B"]').check();
  const foto = page.locator('[data-preset="B"] .lv-fotografia');
  await foto.scrollIntoViewIfNeeded();
  await expect(foto).toHaveAttribute("data-revelado", "true");
  await expect
    .poll(() => foto.evaluate((e) => getComputedStyle(e).opacity))
    .toBe("1");
  const imagem = foto.locator("img");
  await foto.locator("a").hover();
  await expect
    .poll(() => imagem.evaluate((e) => getComputedStyle(e).transform))
    .toContain("1.025");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect
    .poll(() => imagem.evaluate((e) => getComputedStyle(e).transform))
    .toBe("none");
  expect(await foto.evaluate((e) => getComputedStyle(e).animationName)).toBe(
    "none",
  );
  expect(erros).toEqual([]);
});

test("H3.5: 200% de zoom e reduced motion nos dois presets", async ({
  page,
}) => {
  await page.setViewportSize({ width: 750, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(ROTA);
  await page.evaluate(() => {
    document.documentElement.style.zoom = "2";
  });
  for (const preset of ["A", "B"]) {
    await page.locator(`input[value="${preset}"]`).check();
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true);
    const foto = page.locator(`[data-preset="${preset}"] .lv-foto-link`);
    await foto.focus();
    expect(
      await foto.locator("img").evaluate((e) => getComputedStyle(e).transform),
    ).toBe("none");
    await expect(
      page.locator(`[data-preset="${preset}"]`).getByText("Não informada"),
    ).toBeVisible();
  }
});

test("H3.5: sem recurso externo/privado e sem entrada no sitemap", async ({
  page,
  request,
}) => {
  const recursos: string[] = [];
  page.on("request", (requisicao) => recursos.push(requisicao.url()));
  await page.goto(ROTA);
  await page.locator('input[value="B"]').check();
  await page
    .locator('[data-preset="B"] .lv-foto-link')
    .scrollIntoViewIfNeeded();
  expect(
    recursos.filter((url) => new URL(url).hostname !== "localhost"),
  ).toEqual([]);
  expect(recursos.join(" ")).not.toMatch(
    /primeiro-post|B01|A04|D01-08|identidade-visual|\.pdf/,
  );
  expect(await (await request.get("/sitemap.xml")).text()).not.toContain(ROTA);
  expect(await (await request.get("/robots.txt")).text()).toContain(
    "Disallow: /dev/",
  );
});

test("H3.5: leitura e alternância A/B funcionam sem JavaScript", async ({
  browser,
}) => {
  const contexto = await browser.newContext({ javaScriptEnabled: false });
  const pagina = await contexto.newPage();
  await pagina.goto(`http://localhost:3000${ROTA}`);
  await pagina.locator('input[value="B"]').check();
  await expect(pagina.locator('[data-preset="B"]')).toBeVisible();
  await expect(
    pagina
      .locator('[data-preset="B"] h2')
      .filter({ hasText: "O campo como documento" }),
  ).toBeVisible();
  await contexto.close();
});

/**
 * A Central de Acessibilidade nasceu dentro do cabeçalho escuro do protótipo e
 * pinta o gatilho com `--hero-texto` por estilo inline. Trazida para a barra
 * de controles do laboratório, que fica sobre superfície clara, ela sumia:
 * pedra sobre papel dá 1,1:1. O papel foi redefinido na raiz do laboratório, e
 * este teste é o que impede a regressão — é o controle de acessibilidade da
 * página, e ele ilegível é a pior falha possível aqui.
 */
for (const tema of ["light", "dark"] as const) {
  test(`H3.5: o gatilho de acessibilidade passa AA no tema ${tema}`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: tema });
    await page.goto(ROTA);

    const razao = await page.evaluate(() => {
      const alvo = document.querySelector(".lv-controles button");
      if (alvo === null) return null;

      const lin = (c: number) =>
        c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      const canais = (cor: string) => (cor.match(/[\d.]+/g) ?? []).map(Number);
      const luminancia = (c: number[]) =>
        0.2126 * lin((c[0] ?? 0) / 255) +
        0.7152 * lin((c[1] ?? 0) / 255) +
        0.0722 * lin((c[2] ?? 0) / 255);

      const frente = canais(getComputedStyle(alvo).color);
      let no: Element | null = alvo;
      let fundo: number[] | null = null;
      while (no !== null) {
        const canal = canais(getComputedStyle(no).backgroundColor);
        if ((canal[3] ?? 1) > 0) {
          fundo = canal;
          break;
        }
        no = no.parentElement;
      }
      if (fundo === null) return null;

      const a = luminancia(frente);
      const b = luminancia(fundo);
      return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    });

    expect(razao).not.toBeNull();
    expect(razao as number).toBeGreaterThanOrEqual(4.5);
  });
}
