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
 * O realce é ênfase de leitura, nunca informação. Ele reforça o mês escolhido
 * e acende a linha correspondente da tabela, que é onde o valor exato vive.
 *
 * A H4.5.1 acrescentou duas garantias: o rótulo do mês não perde opacidade, e
 * a atenuação das marcas não passa de um limite que as deixaria com cara de
 * desabilitadas.
 */
test("H4.5.1: o realce enfatiza o mês escolhido sem apagar os outros", async ({
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
  const opacidade = (alvo: typeof vizinho, seletor: string) =>
    alvo
      .locator(seletor)
      .first()
      .evaluate((e) => Number(getComputedStyle(e).opacity));

  await alvo.locator(".dv-captura").hover();

  // As marcas do vizinho atenuam, mas continuam bem acima do limiar em que
  // uma série passa a parecer desligada.
  await expect.poll(() => opacidade(vizinho, ".dv-conector")).toBeLessThan(1);
  await expect
    .poll(() => opacidade(vizinho, ".dv-conector"))
    .toBeGreaterThanOrEqual(0.5);
  await expect
    .poll(() => opacidade(vizinho, ".dv-ponto"))
    .toBeGreaterThanOrEqual(0.5);

  // O rótulo do mês é texto: ele não perde contraste em nenhum estado.
  expect(await opacidade(vizinho, ".dv-mes")).toBe(1);
  expect(
    await vizinho.evaluate((e) => Number(getComputedStyle(e).opacity)),
  ).toBe(1);

  // A dominância do escolhido vem de somar ênfases, e não de apagar o resto.
  expect(await opacidade(alvo, ".dv-conector")).toBe(1);
  // `strokeWidth` volta com unidade ("3px"), então a leitura é por parseFloat.
  expect(
    await alvo
      .locator(".dv-conector")
      .evaluate((e) => Number.parseFloat(getComputedStyle(e).strokeWidth)),
  ).toBeGreaterThan(2);
  await expect
    .poll(() => linha.evaluate((e) => getComputedStyle(e).backgroundColor))
    .not.toBe(fundoEmRepouso);

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

  for (const seletor of [".lv-fio"]) {
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
    '.dv-faixa[data-variante="candidata"]',
    ".dv-serie",
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
  await page.locator(".dv-serie").scrollIntoViewIfNeeded();

  expect(
    recursos.filter((url) => new URL(url).hostname !== "localhost"),
  ).toEqual([]);
  expect(recursos.join(" ")).not.toMatch(/anexo-indicadores|\.xlsx|\.pdf/);
  expect(await (await request.get("/sitemap.xml")).text()).not.toContain(ROTA);
  expect(await (await request.get("/robots.txt")).text()).toContain(
    "Disallow: /dev/",
  );
});

/**
 * A H4.1 integrou a composição na Home, e a asserção "a Home não tem nada
 * disto" caducou por decisão aprovada, não por acaso. O que continua sendo
 * verdade — e é o que importa vigiar — é que o **material reservado** e a
 * moldura do laboratório não atravessaram junto. A H4.0 segue intocada.
 */
test("H4.5: a Home recebeu só a candidata; a H4.0 continua como estava", async ({
  page,
}) => {
  await page.goto("/");
  /*
    A Home é a candidata v2 desde 2026-09-16, e a sua leitura quantitativa é
    composição própria — a seção `.dados-vivos` da H4.1 saiu de `/` com a
    Home que a hospedava. O título aprovado permanece, e a moldura do
    laboratório continua proibida: é isso que este cenário guarda.
  */
  await expect(page.locator("#hl-leitura")).toHaveCount(1);
  await expect(page.getByText("Onde o recurso circula")).toHaveCount(1);

  // Moldura e material reservado do laboratório não acompanham.
  await expect(page.locator(".dv-preview")).toHaveCount(0);
  await expect(page.locator(".dv-laboratorio")).toHaveCount(0);
  await expect(page.locator(".dv-reservados")).toHaveCount(0);
  await expect(page.locator(".dv-ranking")).toHaveCount(0);
  await expect(page.locator(".dv-proposta")).toHaveCount(0);
  await expect(
    page.locator('.dv-faixa[data-variante="reservados"]'),
  ).toHaveCount(0);

  await page.goto(ORIGINAL);
  // A composição original continua sendo ela mesma, e não recebeu a camada nova.
  await expect(page.locator(".painel-dados").first()).toBeVisible();
  await expect(page.locator('[class*="dv-"]')).toHaveCount(0);
  await expect(page.locator(".dados-vivos")).toHaveCount(0);
  await expect(page.getByTestId("preset-declaracao")).toBeVisible();
  await expect(page.getByTestId("preset-painel")).toBeVisible();
});

/**
 * H4.5.1 — a área candidata à Home termina antes do ranking.
 *
 * O componente não sumiu: ele está na mesma página, depois da marca de fim, no
 * bloco reservado à futura página de dados.
 */
test("H4.5.1: o ranking está fora da candidata e continua no laboratório", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(ROTA);

  const candidata = page.locator(".dv-preview");
  await expect(candidata.locator(".dv-ranking")).toHaveCount(0);
  await expect(candidata.getByText("Atividades acionadas")).toHaveCount(0);
  await expect(candidata.getByText(/10 ou mais/)).toHaveCount(0);
  await expect(candidata.getByText("Museus")).toHaveCount(0);

  const reservado = page.locator(".dv-laboratorio");
  await expect(reservado.locator(".dv-ranking")).toHaveCount(1);
  await expect(reservado.getByText(/10 ou mais/)).toBeVisible();
  await expect(
    reservado.getByRole("heading", { name: /Material reservado/ }),
  ).toBeVisible();

  // A ordem no DOM é o contrato: fim da candidata, depois material reservado.
  const ordem = await page.evaluate(() => {
    const preview = document.querySelector(".dv-preview");
    const laboratorio = document.querySelector(".dv-laboratorio");
    if (preview === null || laboratorio === null) return null;
    return (
      preview.compareDocumentPosition(laboratorio) &
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });
  expect(ordem).toBeTruthy();
});

/**
 * H4.5.1 — a pré-visualização não fala como protótipo.
 *
 * O marcador editorial de proposta fica, porque ele é sobre aprovação de copy.
 * O vocabulário de laboratório sai, porque ele falseia a pré-visualização.
 */
test("H4.5.1: a candidata não carrega vocabulário de laboratório", async ({
  page,
}) => {
  await page.goto(ROTA);
  const candidata = page.locator(".dv-preview");

  for (const termo of ["somente DEV", "Preset", "H4.0", "H3.5.1"]) {
    await expect(candidata.getByText(termo, { exact: false })).toHaveCount(0);
  }
  await expect(
    candidata.getByText("Título editorial · proposta"),
  ).toBeVisible();

  // A seleção editorial está fechada: não restou controle de variante.
  await expect(page.locator('input[name="variante"]')).toHaveCount(0);
  await expect(candidata.locator("input")).toHaveCount(0);
});

/**
 * H4.5.1 — a passagem de saída não afirma o que a fonte não sustenta.
 *
 * As 84 contratações não são 84 pessoas. A copy anterior sugeria isso.
 */
test("H4.5.1: a passagem de saída não fala de pessoas e perdeu a cruz", async ({
  page,
}) => {
  await page.goto(ROTA);
  const saida = page.getByTestId("passagem-saida");

  await expect(saida).toBeVisible();
  await expect(saida.getByText("Medida → Conjunto completo")).toBeVisible();
  await expect(saida.locator("svg")).toHaveCount(0);
  await expect(saida.locator(".lv-fio")).toHaveCount(1);
  await expect(page.getByText("existe alguém")).toHaveCount(0);
  await expect(page.getByText("Medida → Pessoas")).toHaveCount(0);
});

/** H4.5.2 — a candidata fixa quatro apoios e continua íntegra sem JS. */
test("H4.5.2: a seleção de quatro funciona sem JavaScript", async ({
  browser,
}) => {
  const contexto = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 1440, height: 900 },
  });
  const pagina = await contexto.newPage();
  await pagina.goto(`http://localhost:3000${ROTA}`);

  const candidata = pagina.locator(
    '.dv-preview .dv-faixa[data-variante="candidata"]',
  );
  await expect(candidata).toBeVisible();
  await expect(candidata.locator(".dv-registro-indicador")).toHaveCount(4);
  await expect(
    candidata.getByText("R$ 18.762,52", { exact: true }),
  ).toBeVisible();
  await expect(
    candidata.getByText("R$ 15.700,00", { exact: true }),
  ).toBeVisible();
  await expect(candidata.getByText("40,6%", { exact: true })).toBeVisible();
  await expect(candidata.getByText("12", { exact: true })).toBeVisible();
  await expect(
    candidata.getByText("Localidades de origem registradas"),
  ).toBeVisible();
  await expect(candidata.getByText("Despesa total registrada")).toBeVisible();
  await expect(
    candidata.getByText("Receita registrada", { exact: true }),
  ).toBeVisible();
  await expect(
    candidata.getByText("Participação do trabalho na despesa"),
  ).toBeVisible();

  await contexto.close();
});

/**
 * O cabeçalho declara a decisão sem contaminar a pré-visualização.
 */
test("H4.5.2: a seleção fechada é explicada fora da candidata", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(ROTA);
  const ressalva = page.locator(".lv-recomendado");
  await expect(ressalva).toBeVisible();
  await expect(ressalva).toContainText("decisão editorial fechada");
  await expect(ressalva).toContainText("Nenhum indicador foi invalidado");
  await expect(page.locator(".dv-preview .lv-recomendado")).toHaveCount(0);
});

test("H4.5.1: a passagem usa só o fio cartográfico", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(ROTA);
  const passagem = page.locator('[data-passagem="medida"]');
  await expect(passagem.locator(".lv-fio")).toHaveCount(1);
  await expect(passagem.locator(".lv-g-identidade")).toHaveCount(0);
  await expect(passagem.locator('img[src*="/media/grafismos/"]')).toHaveCount(
    0,
  );
});
