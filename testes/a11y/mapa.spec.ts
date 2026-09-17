import { expect, test } from "@playwright/test";

/**
 * Mapa territorial da Home — cartografia editorial em camadas.
 *
 * A composição restaurada em 2026-09-17 devolve à Home a linguagem
 * cartográfica original: Sergipe inteiro, quatro camadas visuais legíveis de
 * uma vez, moldura, nota cartográfica e legenda. O que **não** volta é o
 * índice dos 75 municípios como opções — nisso vale a decisão de 2026-09-16,
 * que fez do estado contexto e do recorte o alvo editorial.
 *
 * Por isso este arquivo cobre duas ordens de contrato:
 *
 * 1. **as camadas**, que não dependem de interação nenhuma — quem chega sem
 *    tocar em nada já distingue Sergipe, Vale, pesquisa e comparação, e não
 *    por cor sozinha;
 * 2. **os dois recortes** como opções de teclado, mouse e toque, com foco,
 *    seleção, painel e volta à visão geral.
 *
 * A experiência territorial completa é de `/territorio`, coberta em
 * `territorio-publico.spec.ts`.
 */

const SVG = "#hl-mapa";
const VALE = '#hl-mapa g[data-recorte="vale"]';
const COMPARACAO = '#hl-mapa g[data-recorte="comparacao"]';
const MARCADOS = "#hl-municipios [data-selecionado]";
const PAINEL = "#hl-mapa-painel";
const VOLTAR = "#hl-mapa-voltar";

const MUNICIPIOS_DO_VALE = [
  "Tobias Barreto",
  "Tomar do Geru",
  "Itabaianinha",
  "Cristinápolis",
  "Poço Verde",
];

/** Lugares confirmados que caem em cada recorte. Os três primeiros são de
 *  Tobias Barreto; Ilha Grande é de São Cristóvão. */
const LUGARES_DO_VALE = 3;
const LUGARES_DA_COMPARACAO = 1;

/** Espera a ilha assumir o desenho; antes disso não há interação nenhuma. */
async function abrirMapa(page: import("@playwright/test").Page) {
  await page.goto("/");
  await expect(page.locator(SVG)).toHaveAttribute("data-interativo", "true");
}

test.describe("mapa da Home — camadas", () => {
  test("desenha os 75 municípios de Sergipe", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#hl-mapa path.m")).toHaveCount(75);
  });

  /**
   * O ponto da restauração: as quatro camadas se distinguem **sem seleção**, e
   * cada uma por mais de um canal. Preenchimento, padrão e traço são
   * independentes — é o que permite Tobias Barreto ler como Vale *e* pesquisa,
   * e São Cristóvão ler como pesquisa *e* comparação sem nunca ler como Vale.
   */
  test("as quatro camadas se distinguem sem interação e sem depender de cor", async ({
    page,
  }) => {
    await page.goto("/");

    const estilo = (seletor: string) =>
      page
        .locator(seletor)
        .first()
        .evaluate((elemento) => {
          const e = getComputedStyle(elemento);
          return {
            preenchimento: e.fill,
            traco: e.stroke,
            espessura: e.strokeWidth,
            tracejado: e.strokeDasharray,
          };
        });

    const sergipe = await estilo("#hl-mapa > path.m");
    const vale = await estilo("#hl-mapa path.m.v");
    const comparacao = await estilo("#hl-mapa path.m.c");

    // Vale: preenchimento e traço próprios, e o dobro da espessura da base.
    expect(vale.preenchimento).not.toBe(sergipe.preenchimento);
    expect(vale.traco).not.toBe(sergipe.traco);
    expect(Number.parseFloat(vale.espessura)).toBeGreaterThan(
      Number.parseFloat(sergipe.espessura),
    );

    // Comparação: tracejada, e sem o preenchimento do Vale.
    expect(comparacao.tracejado).not.toBe(sergipe.tracejado);
    expect(comparacao.preenchimento).not.toBe(vale.preenchimento);

    // Pesquisa: hachura, que é padrão e não cor.
    const hachura = await page
      .locator("#hl-mapa path.h")
      .first()
      .evaluate((p) => getComputedStyle(p).fill);
    expect(hachura).toContain("url(");
    await expect(page.locator("#hl-mapa pattern")).toHaveCount(1);
  });

  test("a legenda nomeia cada camada e a nota cartográfica declara a fonte", async ({
    page,
  }) => {
    await page.goto("/");

    const legenda = page.getByLabel("Legenda do mapa");
    await expect(legenda).toBeVisible();
    expect(
      await legenda
        .locator("li")
        .evaluateAll((itens) => itens.map((i) => i.textContent?.trim() ?? "")),
    ).toEqual(["Sergipe", "Vale", "Pesquisa", "Comparação", "Lugar visitado"]);

    const nota = page.locator("#hl-territorio figcaption");
    await expect(nota).toContainText("IBGE, Malhas Territoriais");
    await expect(nota).toContainText(
      `${MUNICIPIOS_DO_VALE.length} municípios no recorte do Vale`,
    );
  });

  /** Os quatro lugares de campo têm coordenada confirmada e são desenhados. */
  test("os quatro lugares visitados aparecem no desenho", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.locator("#hl-mapa .territorio-cartografico__lugar"),
    ).toHaveCount(LUGARES_DO_VALE + LUGARES_DA_COMPARACAO);
  });
});

test.describe("mapa da Home — estado inicial", () => {
  test("abre sem recorte selecionado", async ({ page }) => {
    await abrirMapa(page);

    await expect(page.locator(`${VALE}[aria-selected="true"]`)).toHaveCount(0);
    await expect(
      page.locator(`${COMPARACAO}[aria-selected="true"]`),
    ).toHaveCount(0);
    await expect(page.locator(MARCADOS)).toHaveCount(0);
  });

  /**
   * A regra visual: nada pode parecer escolhido antes de alguém escolher. Os
   * nomes dos lugares só entram no desenho depois da seleção — a visão geral é
   * a malha, não uma lista de etiquetas.
   */
  test("nenhum lugar é nomeado no desenho antes da seleção", async ({
    page,
  }) => {
    await abrirMapa(page);

    const visiveis = await page
      .locator("#hl-mapa .territorio-cartografico__lugar text")
      .evaluateAll(
        (rotulos) =>
          rotulos.filter((r) => Number(getComputedStyle(r).opacity) > 0).length,
      );
    expect(visiveis).toBe(0);
  });

  test("o painel abre vazio e não afirma seleção que não houve", async ({
    page,
  }) => {
    await abrirMapa(page);

    await expect(page.locator(`${PAINEL} [data-painel-vazio]`)).toBeVisible();
    await expect(
      page.locator(`${PAINEL} [data-painel-de]:visible`),
    ).toHaveCount(0);
    // Sem seleção, voltar não teria a que voltar.
    await expect(page.locator(VOLTAR)).toBeHidden();
  });

  test("os dois recortes são opções nomeadas de uma única listbox", async ({
    page,
  }) => {
    await abrirMapa(page);

    await expect(page.locator(SVG)).toHaveAttribute("role", "listbox");
    const opcoes = page.locator('#hl-mapa [role="option"]');
    await expect(opcoes).toHaveCount(2);
    expect(
      await opcoes.evaluateAll((os) =>
        os.map((o) => o.getAttribute("aria-label")),
      ),
    ).toEqual([
      "Recorte do Vale do Rio Real",
      "Referência de comparação, fora do Vale",
    ]);
  });

  /** Roving tabindex: o mapa é uma parada de Tab, não duas. */
  test("o mapa é uma única parada de Tab", async ({ page }) => {
    await abrirMapa(page);

    await expect(
      page.locator('#hl-mapa [role="option"][tabindex="0"]'),
    ).toHaveCount(1);
    await expect(
      page.locator('#hl-mapa [role="option"][tabindex="-1"]'),
    ).toHaveCount(1);
  });
});

test.describe("mapa da Home — seleção", () => {
  test("clique no Vale marca os cinco municípios e São Cristóvão fica fora", async ({
    page,
  }) => {
    await abrirMapa(page);
    await page.locator(`${VALE} path`).first().click({ force: true });

    await expect(page.locator(VALE)).toHaveAttribute("aria-selected", "true");
    await expect(page.locator(COMPARACAO)).toHaveAttribute(
      "aria-selected",
      "false",
    );

    const nomes = await page
      .locator(`${MARCADOS} dt`)
      .evaluateAll((ns) => ns.map((n) => n.textContent?.trim() ?? ""));
    expect(nomes).toEqual(MUNICIPIOS_DO_VALE);
    expect(nomes).not.toContain("São Cristóvão");

    const painel = page.locator(`${PAINEL} [data-painel-de="vale"]`);
    await expect(painel).toBeVisible();
    await expect(painel).toContainText("Não é divisão administrativa oficial");
    await expect(page.locator(VOLTAR)).toBeVisible();
  });

  test("clique em São Cristóvão destaca só ele, como referência de comparação", async ({
    page,
  }) => {
    await abrirMapa(page);
    await page.locator(`${COMPARACAO} path`).first().click({ force: true });

    const nomes = await page
      .locator(`${MARCADOS} dt`)
      .evaluateAll((ns) => ns.map((n) => n.textContent?.trim() ?? ""));
    expect(nomes).toEqual(["São Cristóvão"]);

    const painel = page.locator(`${PAINEL} [data-painel-de="comparacao"]`);
    await expect(painel).toBeVisible();
    await expect(painel).toContainText("comparação");
    await expect(painel).not.toContainText("parte do Vale do Rio Real");
  });

  /** Toque percorre o mesmo caminho de seleção: nada depende de `hover`. */
  test("toque seleciona pelo mesmo caminho do clique", async ({ page }) => {
    await abrirMapa(page);
    await page.locator(`${VALE} path`).first().dispatchEvent("click");

    await expect(page.locator(VALE)).toHaveAttribute("aria-selected", "true");
  });

  test("a seleção não depende só de cor: traço e nomes dos lugares mudam junto", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await abrirMapa(page);

    const traco = () =>
      page
        .locator(`${VALE} path`)
        .first()
        .evaluate((p) => getComputedStyle(p).strokeWidth);
    const antes = await traco();

    await page.locator(`${VALE} path`).first().click({ force: true });
    await expect(page.locator(VALE)).toHaveAttribute("aria-selected", "true");
    await expect.poll(traco).not.toBe(antes);

    const nomesVisiveis = () =>
      page
        .locator("#hl-mapa .territorio-cartografico__lugar text")
        .evaluateAll(
          (rs) =>
            rs.filter((r) => Number(getComputedStyle(r).opacity) > 0).length,
        );
    await expect.poll(nomesVisiveis).toBe(LUGARES_DO_VALE);
  });
});

test.describe("mapa da Home — teclado", () => {
  test("Enter seleciona, Esc limpa e o foco não seleciona sozinho", async ({
    page,
  }) => {
    await abrirMapa(page);
    const vale = page.locator(VALE);

    await vale.focus();
    // Foco não é seleção: é a exceção de acessibilidade ao princípio visual.
    await expect(vale).toHaveAttribute("aria-selected", "false");
    await expect(page.locator(MARCADOS)).toHaveCount(0);

    await page.keyboard.press("Enter");
    await expect(vale).toHaveAttribute("aria-selected", "true");

    await page.keyboard.press("Escape");
    await expect(vale).toHaveAttribute("aria-selected", "false");
    await expect(page.locator(MARCADOS)).toHaveCount(0);
    await expect(page.locator(`${PAINEL} [data-painel-vazio]`)).toBeVisible();
  });

  test("Espaço também seleciona", async ({ page }) => {
    await abrirMapa(page);
    await page.locator(VALE).focus();
    await page.keyboard.press(" ");
    await expect(page.locator(VALE)).toHaveAttribute("aria-selected", "true");
  });

  test("as setas andam entre os dois recortes", async ({ page }) => {
    await abrirMapa(page);
    await page.locator(VALE).focus();

    await page.keyboard.press("ArrowRight");
    expect(
      await page.evaluate(() =>
        document.activeElement?.getAttribute("data-recorte"),
      ),
    ).toBe("comparacao");

    await page.keyboard.press("ArrowLeft");
    expect(
      await page.evaluate(() =>
        document.activeElement?.getAttribute("data-recorte"),
      ),
    ).toBe("vale");

    await page.keyboard.press("End");
    expect(
      await page.evaluate(() =>
        document.activeElement?.getAttribute("data-recorte"),
      ),
    ).toBe("comparacao");
  });

  test("o foco é perceptível e não usa o tratamento da seleção", async ({
    page,
  }) => {
    await abrirMapa(page);
    const caminho = page.locator(`${VALE} path`).first();
    const medir = () =>
      caminho.evaluate((p) => {
        const e = getComputedStyle(p);
        return {
          traco: e.strokeWidth,
          cor: e.stroke,
          tracejado: e.strokeDasharray,
        };
      });

    const solto = await medir();
    await page.locator(VALE).focus();
    // `:focus-visible` depende de foco por teclado.
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowLeft");
    const focado = await medir();

    expect(focado.traco).not.toBe(solto.traco);
    expect(focado.cor).not.toBe(solto.cor);
    expect(focado.tracejado).not.toBe(solto.tracejado);
    // Foco não abre ficha nem marca a lista.
    await expect(page.locator(MARCADOS)).toHaveCount(0);
  });
});

test.describe("mapa da Home — volta à visão geral", () => {
  test("voltar limpa a seleção e devolve o foco ao mapa", async ({ page }) => {
    await abrirMapa(page);
    await page.locator(`${VALE} path`).first().click({ force: true });
    await expect(page.locator(VOLTAR)).toBeVisible();

    await page.locator(VOLTAR).click();

    await expect(page.locator('#hl-mapa [aria-selected="true"]')).toHaveCount(
      0,
    );
    await expect(page.locator(MARCADOS)).toHaveCount(0);
    expect(
      await page.evaluate(
        () => document.activeElement?.closest("#hl-mapa") !== null,
      ),
    ).toBe(true);
  });

  test("Esc faz o mesmo que voltar", async ({ page }) => {
    await abrirMapa(page);
    await page.locator(VALE).focus();
    await page.keyboard.press("Enter");
    await expect(page.locator(VALE)).toHaveAttribute("aria-selected", "true");

    await page.keyboard.press("Escape");
    await expect(page.locator('#hl-mapa [aria-selected="true"]')).toHaveCount(
      0,
    );
    await expect(page.locator(VOLTAR)).toBeHidden();
  });
});

/**
 * Sem JavaScript o desenho é ilustração e diz isso: nenhum controle, nenhuma
 * promessa de navegação. As quatro camadas continuam desenhadas e a informação
 * territorial continua inteira em texto — é o que justifica desenhar o estado
 * como contexto sem transformá-lo em ferramenta.
 */
test.describe("mapa da Home sem JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("o desenho se anuncia como imagem, com alternativa textual", async ({
    page,
  }) => {
    await page.goto("/");

    const svg = page.locator(SVG);
    await expect(svg).toHaveAttribute("role", "img");
    await expect(svg).not.toHaveAttribute("data-interativo", "true");
    await expect(page.locator('#hl-mapa [role="option"]')).toHaveCount(0);
    await expect(page.locator("#hl-mapa [tabindex]")).toHaveCount(0);

    await expect(page.locator("#hl-mapa > title")).toHaveText(
      "Sergipe e o recorte do Vale do Rio Real",
    );
    await expect(page.locator("#hl-mapa > desc")).toContainText(
      "A leitura em texto abaixo descreve cada vínculo",
    );
  });

  test("as camadas continuam desenhadas, e a legenda continua visível", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page.locator("#hl-mapa path.m")).toHaveCount(75);
    await expect(page.locator("#hl-mapa path.m.v")).toHaveCount(
      MUNICIPIOS_DO_VALE.length,
    );
    await expect(page.locator("#hl-mapa path.m.c")).toHaveCount(1);
    await expect(page.getByLabel("Legenda do mapa")).toBeVisible();
  });

  test("nenhum controle interativo é oferecido", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator(VOLTAR)).toBeHidden();
    await expect(page.locator(PAINEL)).toBeHidden();
  });

  test("o vínculo de cada município continua legível em texto", async ({
    page,
  }) => {
    await page.goto("/");
    const lista = page.locator("#hl-municipios");

    for (const nome of MUNICIPIOS_DO_VALE) {
      await expect(lista).toContainText(nome);
    }
    await expect(lista).toContainText("São Cristóvão");
    await expect(lista).toContainText("referência de comparação");
  });
});
