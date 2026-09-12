import { expect, test } from "@playwright/test";

const ROTA = "/dev/dados-vivos";
const ORIGINAL = "/dev/dados";

for (const tema of ["light", "dark"] as const) {
  for (const largura of [320, 375, 768, 1440]) {
    test(`H4.5: ${largura}px no tema ${tema} lê sem transbordar`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme: tema });
      await page.setViewportSize({ width: largura, height: 900 });
      await page.goto(ROTA);

      const dimensoes = await page.evaluate(() => ({
        cliente: document.documentElement.clientWidth,
        rolagem: document.documentElement.scrollWidth,
      }));
      expect(dimensoes.rolagem).toBeLessThanOrEqual(dimensoes.cliente);

      // O número protagonista e a tabela exata existem em toda largura.
      await expect(page.locator(".dv-numero")).toHaveText("93,4%");
      await expect(
        page.getByRole("table", { name: /Série mensal consolidada/ }),
      ).toBeVisible();

      const cores = await page.locator(".dv-secao").evaluate((elemento) => ({
        fundo: getComputedStyle(elemento).backgroundColor,
        texto: getComputedStyle(elemento).color,
      }));
      expect(cores.fundo).not.toBe(cores.texto);
    });
  }
}

/**
 * O desenho é leitura; a tabela é a fonte. Abaixo da largura em que o texto do
 * SVG fica legível ele some, e nada se perde porque a tabela não depende dele.
 */
test("H4.5: o gráfico aparece onde seu texto é legível, e a tabela sempre", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(ROTA);
  await expect(page.locator(".dv-grafico")).toBeVisible();

  await page.setViewportSize({ width: 375, height: 812 });
  await page.reload();
  await expect(page.locator(".dv-grafico")).toBeHidden();
  await expect(
    page.getByRole("table", { name: /Série mensal consolidada/ }),
  ).toBeVisible();
  // Os seis meses continuam no DOM, com valor exato.
  await expect(page.locator(".dv-tabela tbody tr[data-mes]")).toHaveCount(6);
  await expect(page.getByText("R$ 4.867,80")).toBeVisible();
});

test("H4.5: o gráfico tem alternativa textual real, não rótulo genérico", async ({
  page,
}) => {
  await page.goto(ROTA);
  const svg = page.locator(".dv-grafico");
  await expect(svg).toHaveAttribute("role", "img");

  const alternativa = await svg.evaluate((elemento) => {
    const titulo = elemento.querySelector("title")?.textContent ?? "";
    const descricao = elemento.querySelector("desc")?.textContent ?? "";
    return `${titulo} ${descricao}`;
  });
  expect(alternativa).toMatch(/receita/i);
  expect(alternativa).toMatch(/despesa/i);
  expect(alternativa).toMatch(/tabela/i);
  expect(alternativa.length).toBeGreaterThan(120);

  // `role="img"` torna o interior presentacional: nada focável ali dentro.
  await expect(svg.locator("[tabindex]")).toHaveCount(0);
});

/**
 * O realce é ênfase de leitura, nunca informação. Ele atenua os demais meses e
 * acende a linha correspondente da tabela, que é onde o valor exato vive.
 */
test("H4.5: o realce de um mês liga desenho e tabela, sem esconder dado", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(ROTA);

  const alvo = page.locator('.dv-grafico .dv-registro[data-mes="2"]');
  const vizinho = page.locator('.dv-grafico .dv-registro[data-mes="4"]');
  const linha = page.locator('.dv-tabela tr[data-mes="2"]');

  const fundoEmRepouso = await linha.evaluate(
    (e) => getComputedStyle(e).backgroundColor,
  );

  await alvo.locator(".dv-captura").hover();

  await expect
    .poll(() => vizinho.evaluate((e) => Number(getComputedStyle(e).opacity)))
    .toBeLessThan(1);
  expect(await alvo.evaluate((e) => Number(getComputedStyle(e).opacity))).toBe(
    1,
  );
  // `strokeWidth` volta com unidade ("3px"), então a leitura é por parseFloat.
  expect(
    await alvo
      .locator(".dv-conector")
      .evaluate((e) => Number.parseFloat(getComputedStyle(e).strokeWidth)),
  ).toBeGreaterThan(2);
  await expect
    .poll(() => linha.evaluate((e) => getComputedStyle(e).backgroundColor))
    .not.toBe(fundoEmRepouso);

  // Atenuar não é esconder: o mês vizinho continua legível e no DOM.
  await expect(vizinho).toBeVisible();
  await expect(page.locator('.dv-tabela tr[data-mes="4"]')).toBeVisible();
});

test("H4.5: teclado alcança o conteúdo, o foco aparece e os decorativos não interceptam", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(ROTA);

  await page.keyboard.press("Tab");
  const primeiro = await page.evaluate(() => {
    const alvo = document.activeElement;
    if (alvo === null) return null;
    const estilo = getComputedStyle(alvo);
    return { contorno: estilo.outlineStyle, espessura: estilo.outlineWidth };
  });
  expect(primeiro?.contorno).not.toBe("none");
  expect(primeiro?.espessura).not.toBe("0px");

  const atalho = page.getByRole("link", { name: /dev\/dados/ });
  await atalho.focus();
  await expect(atalho).toBeFocused();
  expect(await atalho.evaluate((e) => getComputedStyle(e).outlineWidth)).toBe(
    "3px",
  );

  for (const seletor of [".lv-g-identidade", ".lv-fio", ".dv-cruz"]) {
    const decorativos = page.locator(seletor);
    await expect(decorativos.first()).toBeAttached();
    for (const decorativo of await decorativos.all()) {
      await expect(decorativo).toHaveAttribute("aria-hidden", "true");
      expect(
        await decorativo.evaluate((e) => getComputedStyle(e).pointerEvents),
      ).toBe("none");
    }
  }
});

test("H4.5: zoom de 200% preserva o número e não cria transbordo", async ({
  page,
}) => {
  await page.setViewportSize({ width: 720, height: 900 });
  await page.goto(ROTA);
  await page.evaluate(() => {
    document.documentElement.style.zoom = "2";
  });
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true);
  await expect(page.locator(".dv-numero")).toHaveText("93,4%");
});

/**
 * A entrada existe, é curta e é única: o conector desenha, os pontos chegam
 * depois. Nada roda em laço e nenhuma duração passa de 400 ms.
 */
test("H4.5: a entrada do gráfico é curta, única e não roda em laço", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(ROTA);

  const serie = page.locator(".dv-serie");
  await serie.scrollIntoViewIfNeeded();
  await expect(serie).toHaveAttribute("data-revelado", "true");

  const tempos = await serie.evaluate((elemento) => {
    const ler = (alvo: Element) => {
      const estilo = getComputedStyle(alvo);
      return {
        duracao: Number.parseFloat(estilo.animationDuration),
        atraso: Number.parseFloat(estilo.animationDelay),
        repeticoes: estilo.animationIterationCount,
      };
    };
    const conector = elemento.querySelector(".dv-conector");
    const ponto = elemento.querySelector(".dv-ponto");
    return {
      bloco: ler(elemento),
      conector: conector === null ? null : ler(conector),
      ponto: ponto === null ? null : ler(ponto),
    };
  });

  expect(tempos.conector).not.toBeNull();
  expect(tempos.ponto).not.toBeNull();
  const total = (tempos.ponto?.atraso ?? 0) + (tempos.ponto?.duracao ?? 0);
  expect(total).toBeLessThanOrEqual(0.4);
  expect(tempos.bloco.duracao).toBeLessThanOrEqual(0.3);
  for (const parte of [tempos.bloco, tempos.conector, tempos.ponto]) {
    expect(parte?.repeticoes).toBe("1");
  }

  // Passada a entrada, tudo termina opaco: a animação não guarda estado.
  await expect
    .poll(() =>
      serie
        .locator(".dv-ponto")
        .first()
        .evaluate((e) => getComputedStyle(e).opacity),
    )
    .toBe("1");
});

test("H4.5: com movimento reduzido nada anima e nada some", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(ROTA);

  for (const seletor of [
    ".dv-abertura",
    ".dv-protagonista__numero",
    ".dv-faixa",
    ".dv-serie",
    ".dv-ranking",
  ]) {
    const bloco = page.locator(seletor);
    await bloco.scrollIntoViewIfNeeded();
    await expect(bloco).toBeVisible();
    const estado = await bloco.evaluate((e) => {
      const estilo = getComputedStyle(e);
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

  const ponto = page.locator(".dv-ponto").first();
  expect(await ponto.evaluate((e) => getComputedStyle(e).animationName)).toBe(
    "none",
  );
  expect(await ponto.evaluate((e) => getComputedStyle(e).opacity)).toBe("1");
  await expect(page.locator(".dv-numero")).toHaveText("93,4%");
  await expect(page.getByText("R$ 4.867,80")).toBeVisible();
});

test("H4.5: sem recurso externo, fora do sitemap e bloqueada no robots", async ({
  page,
  request,
}) => {
  const recursos: string[] = [];
  page.on("request", (requisicao) => recursos.push(requisicao.url()));
  await page.goto(ROTA);
  await page.locator(".dv-ranking").scrollIntoViewIfNeeded();

  expect(
    recursos.filter((url) => new URL(url).hostname !== "localhost"),
  ).toEqual([]);
  expect(recursos.join(" ")).not.toMatch(/anexo-indicadores|\.xlsx|\.pdf/);
  expect(await (await request.get("/sitemap.xml")).text()).not.toContain(ROTA);
  expect(await (await request.get("/robots.txt")).text()).toContain(
    "Disallow: /dev/",
  );
});

test("H4.5: a Home e a H4.0 continuam como estavam", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".dados-vivos")).toHaveCount(0);
  await expect(page.locator('[class*="dv-"]')).toHaveCount(0);
  await expect(page.getByText("03 — Dados")).toHaveCount(0);
  await expect(page.getByText("Onde o recurso circula")).toHaveCount(0);

  await page.goto(ORIGINAL);
  // A composição original continua sendo ela mesma, e não recebeu a camada nova.
  await expect(page.locator(".painel-dados").first()).toBeVisible();
  await expect(page.locator('[class*="dv-"]')).toHaveCount(0);
  await expect(page.locator(".dados-vivos")).toHaveCount(0);
  await expect(page.getByTestId("preset-declaracao")).toBeVisible();
  await expect(page.getByTestId("preset-painel")).toBeVisible();
});
