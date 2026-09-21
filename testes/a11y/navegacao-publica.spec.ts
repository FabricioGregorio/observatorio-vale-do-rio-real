import { expect, test } from "@playwright/test";

import { DESCRICOES_DE_CONTEUDO } from "../../src/lib/navegacao";

const ITENS_PRINCIPAIS = [
  ["O Observatório", "/observatorio"],
  ["PodObservar", "/podobservar"],
  ["A Pesquisa", "/pesquisa"],
  ["Território", "/territorio"],
  ["Dados", "/dados"],
] as const;

const ITENS_DE_CONTEUDO = [
  ["Diário de Campo", "/campo"],
  ["Acervo", "/acervo"],
] as const;

/**
 * No painel "Conteúdos", o texto acessível de cada link é o rótulo seguido da
 * descrição. As duas partes vêm da mesma fonte que o menu usa, e não de uma
 * cópia escrita aqui: uma revisão editorial da descrição não é regressão de
 * navegação, e não deve quebrar este teste.
 */
const textoDoLink = ([rotulo, href]: readonly [string, string]): string =>
  `${rotulo}${DESCRICOES_DE_CONTEUDO[href as keyof typeof DESCRICOES_DE_CONTEUDO]}`;

for (const largura of [320, 375, 768, 900, 1024, 1280, 1440]) {
  test(`menu aprovado sem overflow em ${largura}px`, async ({ page }) => {
    await page.setViewportSize({ width: largura, height: 900 });
    await page.goto("/");
    const diagnosticarCabecalho = () =>
      page.evaluate(() => {
        const raiz = document.querySelector("#cabecalho-home");
        if (raiz === null) return [{ seletor: "#cabecalho-home ausente" }];
        return [raiz, ...raiz.querySelectorAll("*")]
          .filter((elemento) => {
            const caixa = elemento.getBoundingClientRect();
            const visivel = caixa.width > 0 && caixa.height > 0;
            return (
              visivel &&
              (caixa.right > window.innerWidth + 1 || caixa.left < -1)
            );
          })
          .slice(0, 8)
          .map((elemento) => ({
            seletor: `${elemento.tagName.toLowerCase()}${elemento.id ? `#${elemento.id}` : ""}${elemento.classList.length ? `.${[...elemento.classList].join(".")}` : ""}`,
            caixa: elemento.getBoundingClientRect().toJSON(),
          }));
      });

    if (largura < 1280) {
      const gatilho = page.getByRole("button", { name: "Menu", exact: true });
      await gatilho.click();
      const links = page
        .getByRole("navigation", { name: "Principal (telas estreitas)" })
        .getByRole("link");
      await expect(links).toHaveCount(7);
      expect(await links.allTextContents()).toEqual(
        [...ITENS_PRINCIPAIS, ...ITENS_DE_CONTEUDO].map(([rotulo]) => rotulo),
      );
      expect(await diagnosticarCabecalho()).toEqual([]);
      await page.keyboard.press("Escape");
      await expect(gatilho).toBeFocused();
    } else {
      const menu = page.getByRole("navigation", {
        name: "Principal",
        exact: true,
      });
      await expect(menu).toBeVisible();
      const links = menu.getByRole("link");
      await expect(links).toHaveCount(5);
      expect(await links.allTextContents()).toEqual(
        ITENS_PRINCIPAIS.map(([rotulo]) => rotulo),
      );
      const conteudos = menu.getByRole("button", { name: /Conteúdos/ });
      await conteudos.click();
      const painel = page.locator(
        `[id="${await conteudos.getAttribute("aria-controls")}"]`,
      );
      await expect(painel.getByRole("link")).toHaveCount(2);
      expect(await painel.getByRole("link").allTextContents()).toEqual(
        ITENS_DE_CONTEUDO.map(textoDoLink),
      );
    }

    expect(await diagnosticarCabecalho()).toEqual([]);
  });
}

test("menu móvel preserva ordem, Enter, Esc e devolução de foco", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto("/");
  const gatilho = page.getByRole("button", { name: "Menu", exact: true });
  await gatilho.focus();
  await page.keyboard.press("Enter");

  const menu = page.getByRole("navigation", {
    name: "Principal (telas estreitas)",
  });
  const links = menu.getByRole("link");
  await expect(links).toHaveCount(7);
  expect(await links.allTextContents()).toEqual(
    [...ITENS_PRINCIPAIS, ...ITENS_DE_CONTEUDO].map(([rotulo]) => rotulo),
  );
  await page.keyboard.press("Escape");
  await expect(gatilho).toBeFocused();
});

test("painel Conteúdos abre por teclado, fecha com Esc e clique externo", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const gatilho = page.getByRole("button", { name: /Conteúdos/ });

  await gatilho.focus();
  await page.keyboard.press("Enter");
  const primeiroLink = page
    .getByRole("navigation", { name: "Principal", exact: true })
    .getByRole("link", { name: /Diário de Campo/ });
  await expect(primeiroLink).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(gatilho).toBeFocused();
  await expect(gatilho).toHaveAttribute("aria-expanded", "false");

  await page.keyboard.press("Space");
  await expect(gatilho).toHaveAttribute("aria-expanded", "true");
  await page.locator("main h1").click();
  await expect(gatilho).toHaveAttribute("aria-expanded", "false");
});

test("equivalente a 1440px com zoom 200% usa a navegação estreita sem overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 720, height: 450 });
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Menu", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

/**
 * Desde 2026-09-21 o PodObservar é item de primeiro nível. Nas páginas do
 * podcast, é ele quem marca a página atual — e "Conteúdos" não, porque o
 * PodObservar não pertence mais ao painel.
 */
for (const rota of [
  "/podobservar",
  "/podobservar/t1/03-conheca-o-museu-borda-da-mata",
]) {
  test(`PodObservar marca a página atual em ${rota}`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(rota);
    const menu = page.getByRole("navigation", {
      name: "Principal",
      exact: true,
    });
    await expect(
      menu.getByRole("link", { name: "PodObservar", exact: true }),
    ).toHaveAttribute("aria-current", "page");
    await expect(menu.locator(".hl-conteudos")).not.toHaveAttribute(
      "data-ativo",
    );

    await page.setViewportSize({ width: 375, height: 900 });
    await page.getByRole("button", { name: "Menu", exact: true }).click();
    await expect(
      page
        .getByRole("navigation", { name: "Principal (telas estreitas)" })
        .getByRole("link", { name: "PodObservar", exact: true }),
    ).toHaveAttribute("aria-current", "page");
  });
}

/**
 * Com seis entradas na navegação larga, o nome do Observatório chegou a
 * invadir o primeiro link. O teste de overflow não pega isso: nada sai da
 * janela, uma caixa só passa por cima da outra.
 */
for (const largura of [1280, 1440]) {
  test(`marca, navegação e utilidades não colidem em ${largura}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: largura, height: 900 });
    await page.goto("/");
    const caixas = await page.evaluate(() => {
      const direita = (seletor: string) =>
        document.querySelector(seletor)?.getBoundingClientRect().right ?? 0;
      const esquerda = (seletor: string) =>
        document.querySelector(seletor)?.getBoundingClientRect().left ?? 0;
      return {
        fimDaMarca: direita(".hl-topo__marca span"),
        inicioDaNav: esquerda(".hl-topo__nav > ul > li > a"),
        fimDaNav: direita(".hl-conteudos__gatilho"),
        inicioDasUtilidades: esquerda(".hl-topo__util"),
      };
    });
    expect(caixas.fimDaMarca).toBeLessThan(caixas.inicioDaNav);
    expect(caixas.fimDaNav).toBeLessThan(caixas.inicioDasUtilidades);
  });
}
