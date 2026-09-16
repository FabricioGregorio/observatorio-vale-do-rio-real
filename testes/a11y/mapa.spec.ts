import { expect, test } from "@playwright/test";

/**
 * Mapa territorial da Home v2 — exploração por recorte.
 *
 * Este arquivo substitui o contrato da composição H2, aposentada da parte
 * pública por decisão humana de 2026-09-16. O que mudou foi a implementação,
 * não a exigência: os cenários de teclado, seleção, foco e alternativa textual
 * continuam aqui, aplicados a **dois recortes** em vez de 75 municípios.
 *
 * O que ficou para trás, e por quê: os 75 municípios eram opções porque o
 * desenho era o estado inteiro como ferramenta. Na Home v2 o estado é
 * contexto, e o que se explora é o recorte que o Observatório declarou. A
 * experiência territorial completa é de `/territorio`, coberta em
 * `territorio-publico.spec.ts`.
 *
 * As asserções de reenquadramento rodam com `prefers-reduced-motion`, e não
 * por conveniência de teste: com movimento reduzido a mudança é imediata por
 * contrato, o que torna o cenário determinístico sem afrouxar nada.
 */

const SVG = "#hl-mapa";
const QUADRO = "#hl-mapa-quadro";
const VALE = '#hl-mapa g[data-recorte="vale"]';
const COMPARACAO = '#hl-mapa g[data-recorte="comparacao"]';
const MARCADOS = "#hl-municipios [data-selecionado]";

const MUNICIPIOS_DO_VALE = [
  "Tobias Barreto",
  "Tomar do Geru",
  "Itabaianinha",
  "Cristinápolis",
  "Poço Verde",
];

/** Espera a ilha assumir o desenho; antes disso não há interação nenhuma. */
async function abrirMapa(page: import("@playwright/test").Page) {
  await page.goto("/");
  await expect(page.locator(SVG)).toHaveAttribute("data-interativo", "true");
}

test.describe("mapa da Home — estado inicial", () => {
  test("abre em visão ampla, sem recorte selecionado", async ({ page }) => {
    await abrirMapa(page);

    await expect(page.locator(QUADRO)).not.toHaveAttribute(
      "data-selecionado",
      /.*/,
    );
    await expect(page.locator(`${VALE}[aria-selected="true"]`)).toHaveCount(0);
    await expect(
      page.locator(`${COMPARACAO}[aria-selected="true"]`),
    ).toHaveCount(0);
    await expect(page.locator(MARCADOS)).toHaveCount(0);
  });

  /**
   * A regra visual da decisão: nada pode parecer escolhido antes de alguém
   * escolher. Os rótulos dos municípios do recorte só existem no desenho
   * depois da seleção.
   */
  test("nenhum município do recorte é nomeado no desenho", async ({ page }) => {
    await abrirMapa(page);

    const visiveis = await page
      .locator("#hl-mapa .hl-mapa__rotulo")
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

    await expect(
      page.locator("#hl-mapa-painel [data-painel-vazio]"),
    ).toBeVisible();
    await expect(
      page.locator("#hl-mapa-painel [data-painel-de]:visible"),
    ).toHaveCount(0);
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
  test("clique no Vale seleciona os cinco municípios e São Cristóvão fica fora", async ({
    page,
  }) => {
    await abrirMapa(page);
    await page.locator(`${VALE} path`).first().click({ force: true });

    await expect(page.locator(QUADRO)).toHaveAttribute(
      "data-selecionado",
      "vale",
    );
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
  });

  test("clique em São Cristóvão destaca só ele, como referência de comparação", async ({
    page,
  }) => {
    await abrirMapa(page);
    await page.locator(`${COMPARACAO} path`).first().click({ force: true });

    await expect(page.locator(QUADRO)).toHaveAttribute(
      "data-selecionado",
      "comparacao",
    );
    const nomes = await page
      .locator(`${MARCADOS} dt`)
      .evaluateAll((ns) => ns.map((n) => n.textContent?.trim() ?? ""));
    expect(nomes).toEqual(["São Cristóvão"]);

    const painel = page.locator(
      '#hl-mapa-painel [data-painel-de="comparacao"]',
    );
    await expect(painel).toBeVisible();
    await expect(painel).toContainText("comparação");
    await expect(painel).not.toContainText("parte do Vale do Rio Real");
  });

  /** Toque percorre o mesmo caminho de seleção: nada depende de `hover`. */
  test("toque seleciona pelo mesmo caminho do clique", async ({ page }) => {
    await abrirMapa(page);
    await page.locator(`${VALE} path`).first().dispatchEvent("click");

    await expect(page.locator(QUADRO)).toHaveAttribute(
      "data-selecionado",
      "vale",
    );
  });

  test("a seleção não depende só de cor: traço e rótulos mudam junto", async ({
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

    const rotulosVisiveis = () =>
      page
        .locator(`${VALE} .hl-mapa__rotulo`)
        .evaluateAll(
          (rs) =>
            rs.filter((r) => Number(getComputedStyle(r).opacity) > 0).length,
        );
    await expect.poll(rotulosVisiveis).toBe(MUNICIPIOS_DO_VALE.length);
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
    await expect(page.locator(QUADRO)).not.toHaveAttribute(
      "data-selecionado",
      /.*/,
    );

    await page.keyboard.press("Enter");
    await expect(vale).toHaveAttribute("aria-selected", "true");

    await page.keyboard.press("Escape");
    await expect(vale).toHaveAttribute("aria-selected", "false");
    await expect(page.locator(MARCADOS)).toHaveCount(0);
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

test.describe("mapa da Home — enquadramento", () => {
  test("selecionar reenquadra e voltar restaura a visão geral", async ({
    page,
  }) => {
    // Com movimento reduzido a mudança é imediata por contrato.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await abrirMapa(page);
    const palco = page.locator("#hl-mapa-quadro .hl-mapa__palco");
    const medir = () => palco.evaluate((p) => getComputedStyle(p).transform);
    /*
      `none` e a matriz identidade são os dois estados de "ainda não
      reenquadrado": a transição parte da identidade, então esperar só por
      "diferente de none" pegaria o primeiro quadro e concluiria cedo demais.
    */
    const reenquadrado = async () => {
      const t = await medir();
      return t !== "none" && t !== "matrix(1, 0, 0, 1, 0, 0)";
    };

    expect(await medir()).toBe("none");

    await page.locator(`${VALE} path`).first().click({ force: true });
    await expect(page.locator(QUADRO)).toHaveAttribute(
      "data-selecionado",
      "vale",
    );
    await expect.poll(reenquadrado).toBe(true);
    const comVale = await medir();

    await page.locator(`${COMPARACAO} path`).first().click({ force: true });
    await expect(page.locator(QUADRO)).toHaveAttribute(
      "data-selecionado",
      "comparacao",
    );
    await expect.poll(reenquadrado).toBe(true);
    await expect.poll(medir).not.toBe(comVale);

    await page.locator("#hl-mapa-voltar").click();
    await expect(page.locator(QUADRO)).not.toHaveAttribute(
      "data-selecionado",
      /.*/,
    );
    await expect.poll(medir).toBe("none");
  });

  test("Esc também devolve à visão geral", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await abrirMapa(page);
    await page.locator(VALE).focus();
    await page.keyboard.press("Enter");
    await expect(page.locator(QUADRO)).toHaveAttribute(
      "data-selecionado",
      "vale",
    );

    await page.keyboard.press("Escape");
    await expect(page.locator(QUADRO)).not.toHaveAttribute(
      "data-selecionado",
      /.*/,
    );
  });

  test("voltar devolve o foco ao mapa, e não ao documento", async ({
    page,
  }) => {
    await abrirMapa(page);
    await page.locator(`${VALE} path`).first().click({ force: true });
    await page.locator("#hl-mapa-voltar").click();

    expect(
      await page.evaluate(
        () => document.activeElement?.closest("#hl-mapa") !== null,
      ),
    ).toBe(true);
  });
});

/**
 * Sem JavaScript o desenho é ilustração e diz isso: nenhum controle, nenhuma
 * promessa de navegação. A informação territorial continua inteira em texto —
 * é o que justifica desenhar o estado como contexto sem transformá-lo em
 * ferramenta.
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

    await expect(page.locator("#hl-mapa title")).toHaveText(
      "Sergipe e o recorte do Vale do Rio Real",
    );
    await expect(page.locator("#hl-mapa desc")).toContainText(
      "A lista ao lado descreve cada vínculo",
    );
  });

  test("nenhum controle interativo é oferecido", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("#hl-mapa-voltar")).toBeHidden();
    await expect(page.locator("#hl-mapa-painel")).toBeHidden();
    await expect(page.locator(".hl-mapa__orientacao")).toBeHidden();
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
