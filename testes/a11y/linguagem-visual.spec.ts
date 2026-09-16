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
  for (const seletor of [
    ".lv-g-identidade",
    ".lv-fio",
    ".lv-eixos",
    ".lv-cruz",
  ]) {
    const decorativos = artigo.locator(seletor);
    await expect(decorativos.first()).toBeAttached();
    for (const decorativo of await decorativos.all()) {
      await expect(decorativo).toHaveAttribute("aria-hidden", "true");
      expect(
        await decorativo.evaluate((e) => getComputedStyle(e).pointerEvents),
      ).toBe("none");
    }
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

/**
 * H3.5.1 — o carcará perdeu 28% de largura. O número sozinho não prova nada:
 * o que importa é que ele deixou de disputar hierarquia. O teste compara a
 * assinatura com a fotografia da mesma página, que é o elemento visual que
 * deve dominar.
 */
test("H3.5.1: a assinatura é secundária em relação à fotografia", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(ROTA);
  await page.locator('input[value="B"]').check();

  const assinatura = page.locator('[data-preset="B"] .lv-g-identidade');
  const fotografia = page.locator('[data-preset="B"] .lv-fotografia');
  await assinatura.scrollIntoViewIfNeeded();

  const larguraDaAssinatura = (await assinatura.boundingBox())?.width ?? 0;
  const larguraDaFotografia = (await fotografia.boundingBox())?.width ?? 0;

  expect(larguraDaAssinatura).toBeGreaterThan(0);
  expect(larguraDaAssinatura).toBeLessThan(larguraDaFotografia / 2);

  // Continua claramente visível: reduzir não é esconder.
  expect(larguraDaAssinatura).toBeGreaterThanOrEqual(80);
});

/**
 * A regra de frequência da H3.5.1 vale no navegador, e não só no HTML: uma
 * assinatura em escala editorial por página, e ela mora numa passagem.
 */
test("H3.5.1: há uma assinatura por página, dentro de uma passagem", async ({
  page,
}) => {
  await page.goto(ROTA);
  for (const preset of ["A", "B"]) {
    await page.locator(`input[value="${preset}"]`).check();
    const artigo = page.locator(`[data-preset="${preset}"]`);
    await expect(artigo.locator(".lv-g-identidade")).toHaveCount(1);
    await expect(artigo.locator(".lv-g-transicao")).toHaveCount(2);
    await expect(
      artigo.locator('.lv-g-transicao[data-passagem="campo"] .lv-g-identidade'),
    ).toHaveCount(1);
    await expect(
      artigo.locator(
        '.lv-g-transicao[data-passagem="leitura"] .lv-g-identidade',
      ),
    ).toHaveCount(0);
  }
});

/**
 * Movimento curto e reversível. A revisão de 3–4/10 para 4–5/10 mudou a
 * quantidade de resposta, não a natureza dela: nenhuma duração passa de
 * 300 ms, e nada aqui roda em laço.
 */
test("H3.5.1: durações ficam curtas e nada anima em laço", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto(ROTA);
  await page.locator('input[value="B"]').check();

  const bloco = page.locator('[data-preset="B"] .lv-fotografia');
  await bloco.scrollIntoViewIfNeeded();
  await expect(bloco).toHaveAttribute("data-revelado", "true");

  const animacao = await bloco.evaluate((elemento) => {
    const estilo = getComputedStyle(elemento);
    return {
      duracao: estilo.animationDuration,
      repeticoes: estilo.animationIterationCount,
      direcao: estilo.animationDirection,
    };
  });
  expect(Number.parseFloat(animacao.duracao)).toBeLessThanOrEqual(0.3);
  expect(animacao.repeticoes).toBe("1");
  expect(animacao.direcao).toBe("normal");

  /*
    `transition-property` vale `all` por padrão em todo elemento, e ler isso
    como defeito daria falso positivo em página inteira. O que interessa é o
    elemento que realmente transiciona: duração acima de zero.
  */
  const transicoes = await page.evaluate(() => {
    const valores: string[] = [];
    for (const elemento of document.querySelectorAll('[data-preset="B"] *')) {
      const estilo = getComputedStyle(elemento);
      const duracoes = estilo.transitionDuration
        .split(",")
        .map((parcela) => Number.parseFloat(parcela));
      if (duracoes.every((duracao) => !(duracao > 0))) continue;
      valores.push(`${estilo.transitionProperty}|${estilo.transitionDuration}`);
    }
    return valores;
  });

  expect(transicoes.length).toBeGreaterThan(0);
  for (const valor of transicoes) {
    const [propriedade, duracao] = valor.split("|");
    // A propriedade animada tem de ser dita: `transition: all` é proibido.
    expect(propriedade).not.toBe("all");
    for (const parcela of (duracao ?? "").split(",")) {
      expect(Number.parseFloat(parcela)).toBeLessThanOrEqual(0.3);
    }
  }
});

/**
 * Com movimento reduzido nada se move, e nada desaparece. O segundo é o que
 * costuma falhar em sistemas de reveal: a animação é desligada, o estado
 * inicial de opacidade fica, e o conteúdo some para quem mais precisa dele.
 */
test("H3.5.1: com movimento reduzido nada anima e nada some", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(ROTA);

  for (const preset of ["A", "B"]) {
    await page.locator(`input[value="${preset}"]`).check();
    const artigo = page.locator(`[data-preset="${preset}"]`);

    for (const seletor of [".lv-heading", ".lv-fotografia", ".lv-registro"]) {
      const bloco = artigo.locator(seletor);
      await bloco.scrollIntoViewIfNeeded();
      await expect(bloco).toBeVisible();
      const estado = await bloco.evaluate((elemento) => {
        const estilo = getComputedStyle(elemento);
        return {
          animacao: estilo.animationName,
          opacidade: estilo.opacity,
          transformacao: estilo.transform,
        };
      });
      expect(estado.animacao).toBe("none");
      expect(estado.opacidade).toBe("1");
      expect(estado.transformacao).toBe("none");
    }

    // O conteúdo textual continua inteiro: nada foi condicionado à animação.
    await expect(artigo.getByText("Não informada")).toBeVisible();
    await expect(
      artigo.getByRole("link", { name: /Explorar o mapa/ }),
    ).toBeVisible();
  }
});

/**
 * Invariante trocada na H4.1, por instrução humana de 2026-09-12.
 *
 * Até aqui este teste afirmava "a Home não recebe nada do laboratório", e
 * provava isso proibindo a gramática na página inteira. A H4.1 é a primeira
 * entrada deliberada da gramática H3.5.1 na Home, pela composição pública da
 * seção de Dados — a proibição global deixou de descrever o contrato.
 *
 * O contrato novo é **confinamento**, e ele é mais forte que a proibição
 * anterior: a gramática pode existir na Home, mas apenas dentro de
 * `#secao-dados-home`; H1, H2 e H3 não a adquirem; e a casca do laboratório
 * não atravessa.
 */
const FAMILIAS = [
  "lv-g-identidade",
  "lv-g-cartografico",
  "lv-g-documental",
  "lv-g-transicao",
] as const;

/**
 * A gramática visual da H4 nasceu para a seção de Dados da Home H0–H4.1. Com
 * a promoção da candidata v2, aquela composição deixou de ser servida em `/`
 * — e a exigência se inverte sem perder o propósito: em vez de confinada à
 * seção, a gramática simplesmente não veste a Home pública. O laboratório
 * continua sendo o único lugar onde ela existe, e os cenários que guardam
 * isso seguem abaixo.
 */
test("H4.1: nem a gramática nem a casca do laboratório chegam à Home", async ({
  page,
}) => {
  await page.goto("/");

  for (const familia of FAMILIAS) {
    await expect(
      page.locator(`.${familia}`),
      `${familia} vazou para a Home`,
    ).toHaveCount(0);
  }
  await expect(page.locator('[class*="dv-"]')).toHaveCount(0);
  await expect(page.locator(".lv-revelar")).toHaveCount(0);

  // Casca de comparação do laboratório.
  await expect(page.locator(".linguagem-visual")).toHaveCount(0);
  await expect(page.locator(".lv-abertura")).toHaveCount(0);
  await expect(page.locator(".lv-controles")).toHaveCount(0);
  await expect(page.locator('input[name="preset"]')).toHaveCount(0);
  await expect(page.locator("[data-preset]")).toHaveCount(0);

  /*
    Os papéis da gramática são variáveis da seção de laboratório, e não do
    documento: se subissem para o `body`, alcançariam a Home por herança.
  */
  const noBody = await page.evaluate(() =>
    getComputedStyle(document.body).getPropertyValue("--lv-ave-viva").trim(),
  );
  expect(noBody).toBe("");

  // A assinatura do carcará é única; a segunda camada contém só os três
  // grafismos territoriais selecionados, sem a gramática do laboratório.
  for (const tipo of [
    "carcara",
    "cactus",
    "bodega",
    "igreja-serra-dos-macacos",
  ]) {
    await expect(page.locator(`[data-grafismo-local="${tipo}"]`)).toHaveCount(
      1,
    );
  }
  await expect(page.locator('img[src*="/media/grafismos/"]')).toHaveCount(4);

  // Vocabulário de desenvolvimento, inclusive como regra morta no CSS.
  expect(await page.content()).not.toMatch(/proposta|somente DEV/i);
});

test("H3.5.1: o painel da H4.0 continua fora do alcance do laboratório", async ({
  page,
}) => {
  await page.goto("/dev/dados");
  await expect(page.locator(".linguagem-visual")).toHaveCount(0);
  await expect(page.locator('[class*="lv-g-"]')).toHaveCount(0);
  const papel = await page.evaluate(() =>
    getComputedStyle(document.body).getPropertyValue("--lv-ave-viva").trim(),
  );
  expect(papel).toBe("");
});
