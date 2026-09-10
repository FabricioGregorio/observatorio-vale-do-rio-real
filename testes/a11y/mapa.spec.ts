import { expect, test } from "@playwright/test";

/**
 * Mapa territorial — Tarefa 10B.3.3.
 *
 * O que estes testes protegem é a razão de o Cenário C ter sido escolhido:
 * mapa que funciona sem JavaScript, sem WebGL e por teclado. Um mapa em canvas
 * passaria num teste de "existe um mapa" e falharia em quase todos estes.
 *
 * Nada aqui compara o SVG inteiro: comparar 75 caminhos quebraria a cada
 * atualização da malha do IBGE sem indicar nada de útil.
 */

const MUNICIPIOS = ".mapa-territorio svg path[data-codigo]";
const ITENS_DO_INDICE = "#territorio-home-lista > [data-codigo]";

/**
 * Abre a Home e espera a ilha de interação assumir o mapa.
 *
 * Sem isso os testes de interação são corrida: o SVG vem do servidor pronto,
 * mas `role="listbox"` e os `tabindex` só aparecem depois da hidratação. Um
 * clique antes disso não faz nada, e o teste falha sem que exista defeito.
 */
async function abrirMapaInterativo(page: import("@playwright/test").Page) {
  await page.goto("/");
  await expect(page.locator(".mapa-territorio svg")).toHaveAttribute(
    "role",
    "listbox",
  );
}

test.describe("mapa territorial", () => {
  test("a seção existe com o título aprovado", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", {
        name: "Cartografia viva do Vale do Rio Real",
      }),
    ).toBeVisible();
  });

  test("desenha os 75 municípios", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(MUNICIPIOS)).toHaveCount(75);
  });

  /**
   * Semântica: município não é link enquanto não houver página territorial
   * aprovada. Nenhum `href` no SVG — nem para âncora da própria página só para
   * ficar clicável.
   */
  test("nenhum município usa semântica de link", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".mapa-territorio svg a")).toHaveCount(0);
    const comHref = await page.evaluate(
      () =>
        document.querySelectorAll(
          ".mapa-territorio svg [href], .mapa-territorio svg [xlink\\:href]",
        ).length,
    );
    expect(comHref).toBe(0);
  });

  test("com JavaScript, o município é opção de uma listbox", async ({
    page,
  }) => {
    await abrirMapaInterativo(page);
    const svg = page.locator(".mapa-territorio svg");
    await expect(svg).toHaveAttribute("role", "listbox");
    await expect(page.locator(`${MUNICIPIOS}[role="option"]`)).toHaveCount(75);
  });

  test("todo município tem nome acessível", async ({ page }) => {
    await page.goto("/");
    const semNome = await page.evaluate(
      (selector) =>
        [...document.querySelectorAll(selector)].filter(
          (no) => (no.getAttribute("aria-label") ?? "").trim().length === 0,
        ).length,
      MUNICIPIOS,
    );
    expect(semNome).toBe(0);
  });

  /**
   * O ponto desta rodada: o mapa é **uma** parada de Tab, não 75. É o roving
   * tabindex — só o município ativo é alcançável.
   */
  test("o mapa é uma única parada de Tab", async ({ page }) => {
    await abrirMapaInterativo(page);
    await expect(page.locator(`${MUNICIPIOS}[tabindex="0"]`)).toHaveCount(1);
    await expect(page.locator(`${MUNICIPIOS}[tabindex="-1"]`)).toHaveCount(74);
  });

  test("Tab sai do mapa em uma tecla", async ({ page }) => {
    await abrirMapaInterativo(page);
    await page.locator(`${MUNICIPIOS}[tabindex="0"]`).focus();
    await page.keyboard.press("Tab");
    const aindaNoMapa = await page.evaluate(
      () => document.activeElement?.closest(".mapa-territorio svg") !== null,
    );
    expect(aindaNoMapa).toBe(false);
  });

  test("setas navegam entre municípios", async ({ page }) => {
    await abrirMapaInterativo(page);
    const codigos = await page.evaluate(
      (selector) =>
        [...document.querySelectorAll(selector)].map((no) =>
          no.getAttribute("data-codigo"),
        ),
      MUNICIPIOS,
    );

    await page.locator(`${MUNICIPIOS}[tabindex="0"]`).focus();
    await page.keyboard.press("ArrowRight");
    const depoisDeAvancar = await page.evaluate(() =>
      document.activeElement?.getAttribute("data-codigo"),
    );
    expect(depoisDeAvancar).toBe(codigos[1]);

    await page.keyboard.press("ArrowLeft");
    const depoisDeVoltar = await page.evaluate(() =>
      document.activeElement?.getAttribute("data-codigo"),
    );
    expect(depoisDeVoltar).toBe(codigos[0]);

    await page.keyboard.press("End");
    const noFim = await page.evaluate(() =>
      document.activeElement?.getAttribute("data-codigo"),
    );
    expect(noFim).toBe(codigos[codigos.length - 1]);
  });

  test("Enter seleciona e Esc limpa", async ({ page }) => {
    await abrirMapaInterativo(page);
    await page.locator(`${MUNICIPIOS}[tabindex="0"]`).focus();
    await page.keyboard.press("Enter");

    const selecionado = await page.evaluate(() => {
      const ativo = document.activeElement;
      const codigo = ativo?.getAttribute("data-codigo") ?? "";
      const item = document.querySelector(
        `#territorio-home-lista [data-codigo="${codigo}"]`,
      );
      return {
        opcao: ativo?.getAttribute("aria-selected"),
        item: item?.getAttribute("data-selecionado"),
      };
    });
    expect(selecionado.opcao).toBe("true");
    expect(selecionado.item).toBe("true");

    await page.keyboard.press("Escape");
    const depois = await page.evaluate(() => ({
      opcoes: document.querySelectorAll('[aria-selected="true"]').length,
      itens: document.querySelectorAll("[data-selecionado]").length,
    }));
    expect(depois.opcoes).toBe(0);
    expect(depois.itens).toBe(0);
  });

  test("Espaço também seleciona", async ({ page }) => {
    await abrirMapaInterativo(page);
    await page.locator(`${MUNICIPIOS}[tabindex="0"]`).focus();
    await page.keyboard.press(" ");
    await expect(
      page.locator(`${MUNICIPIOS}[aria-selected="true"]`),
    ).toHaveCount(1);
  });

  test("clique e toque continuam selecionando", async ({ page }) => {
    await abrirMapaInterativo(page);
    const alvo = page.locator(MUNICIPIOS).nth(10);
    const codigo = await alvo.getAttribute("data-codigo");

    await alvo.click({ force: true });
    await expect(alvo).toHaveAttribute("aria-selected", "true");
    await expect(
      page.locator(`#territorio-home-lista [data-codigo="${codigo}"]`),
    ).toHaveAttribute("data-selecionado", "true");

    // Toque: o mesmo caminho de seleção, disparado por evento de ponteiro.
    await page.locator(MUNICIPIOS).nth(20).dispatchEvent("click");
    await expect(
      page.locator(`${MUNICIPIOS}[aria-selected="true"]`),
    ).toHaveCount(1);
  });

  /**
   * Foco não pode ser só cor: confere que a espessura do traço muda também.
   */
  test("o foco muda cor e espessura do traço", async ({ page }) => {
    await abrirMapaInterativo(page);
    const primeiro = page.locator(`${MUNICIPIOS}[tabindex="0"]`);

    const antes = await primeiro.evaluate((no) => ({
      traco: getComputedStyle(no).strokeWidth,
      cor: getComputedStyle(no).stroke,
    }));

    // `:focus-visible` só é ativado por teclado, então o foco vem de Tab.
    await primeiro.focus();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowLeft");

    const depois = await primeiro.evaluate((no) => ({
      traco: getComputedStyle(no).strokeWidth,
      cor: getComputedStyle(no).stroke,
    }));

    expect(depois.traco).not.toBe(antes.traco);
    expect(depois.cor).not.toBe(antes.cor);
  });

  test("a alternativa textual lista os 75 municípios", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(ITENS_DO_INDICE)).toHaveCount(75);
  });

  test("os quatro pontos de visita aparecem, ainda sem posição", async ({
    page,
  }) => {
    await page.goto("/");
    const secao = page.getByRole("region", { name: "Pontos de pesquisa" });
    await expect(secao).toBeVisible();
    for (const nome of [
      "Recanto da Serra",
      "Centro Cultural e Museu Borda da Mata",
      "Serra dos Macacos",
      "Ilha Grande",
    ]) {
      await expect(secao.getByText(nome, { exact: false })).toBeVisible();
    }
    await expect(page.locator(".mapa-territorio svg circle")).toHaveCount(0);
  });

  test("o Vale é destacado e São Cristóvão não entra nele", async ({
    page,
  }) => {
    await page.goto("/");
    const doVale = await page.evaluate(() =>
      [...document.querySelectorAll(".mapa-territorio svg path.v")].map(
        (no) => no.getAttribute("aria-label") ?? "",
      ),
    );
    expect(doVale).toHaveLength(5);
    expect(doVale.join(" | ")).toContain("Tobias Barreto");
    expect(doVale.join(" | ")).not.toContain("São Cristóvão");
  });

  /**
   * Fronteira da camada base precisa ser perceptível sem competir com o Vale:
   * traço mais escuro que o fundo, e mais fino que o do Vale.
   */
  test("a fronteira da base é perceptível e mais discreta que a do Vale", async ({
    page,
  }) => {
    await page.goto("/");
    const medidas = await page.evaluate(() => {
      const base = document.querySelector(
        ".mapa-territorio svg path.m:not(.v)",
      );
      const vale = document.querySelector(".mapa-territorio svg path.v");
      const corpo = getComputedStyle(document.body).backgroundColor;
      if (base === null || vale === null) return null;
      return {
        baseCor: getComputedStyle(base).stroke,
        baseTraco: Number.parseFloat(getComputedStyle(base).strokeWidth),
        valeTraco: Number.parseFloat(getComputedStyle(vale).strokeWidth),
        fundo: corpo,
      };
    });

    expect(medidas).not.toBeNull();
    // O traço da base não é a cor do fundo, e o Vale continua mais grosso.
    expect(medidas?.baseCor).not.toBe(medidas?.fundo);
    expect(medidas?.valeTraco).toBeGreaterThan(medidas?.baseTraco ?? 0);
  });

  test("não publica indicador nem comparativo no mapa", async ({ page }) => {
    await page.goto("/");
    const texto = (
      await page.locator(".mapa-territorio").innerText()
    ).toLowerCase();
    expect(texto).not.toContain("indicador");
    expect(texto).not.toContain("habitantes");
  });
});

/**
 * Sem JavaScript, o essencial continua de pé — e o mapa não promete interação
 * que não pode cumprir. É esta suíte que justifica o Cenário C.
 */
test.describe("mapa sem JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("o desenho e a lista completa vêm do servidor", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(MUNICIPIOS)).toHaveCount(75);
    await expect(page.locator(ITENS_DO_INDICE)).toHaveCount(75);
    await expect(
      page.getByRole("heading", {
        name: "Cartografia viva do Vale do Rio Real",
      }),
    ).toBeVisible();
  });

  test("o mapa se anuncia como imagem, sem prometer navegação", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator(".mapa-territorio svg")).toHaveAttribute(
      "role",
      "img",
    );
    await expect(page.locator(`${MUNICIPIOS}[tabindex]`)).toHaveCount(0);
    await expect(page.locator(`${MUNICIPIOS}[role="option"]`)).toHaveCount(0);
  });

  test("os pontos sem coordenada continuam listados", async ({ page }) => {
    await page.goto("/");
    const secao = page.getByRole("region", { name: "Pontos de pesquisa" });
    await expect(
      secao.getByText("Ilha Grande", { exact: false }),
    ).toBeVisible();
  });
});
