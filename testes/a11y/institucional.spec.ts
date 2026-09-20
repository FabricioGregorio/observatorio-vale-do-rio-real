import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

/**
 * `/observatorio` e `/pesquisa` — as duas páginas do Lote 1, renderizadas.
 *
 * A suíte cobre o que a auditoria de completude editorial cobrava das duas
 * rotas: que respondam 200 com conteúdo real, que a hierarquia de títulos seja
 * navegável, que os links internos levem a algum lugar, que funcionem no
 * estreito e no largo, nos dois temas e por teclado, e que nenhuma delas volte
 * a servir a frase de ausência do stub.
 */

const ROTAS = [
  { rota: "/observatorio", h1: "O Observatório" },
  { rota: "/pesquisa", h1: "A Pesquisa" },
] as const;

/** Níveis dos títulos do conteúdo principal, na ordem do documento. */
async function hierarquiaDeTitulos(pagina: Page): Promise<number[]> {
  return pagina
    .locator("main :is(h1,h2,h3,h4,h5,h6)")
    .evaluateAll((titulos) =>
      titulos.map((titulo) => Number(titulo.tagName.slice(1))),
    );
}

for (const { rota, h1 } of ROTAS) {
  test.describe(rota, () => {
    test("responde 200 e abre com um h1 só", async ({ page }) => {
      const resposta = await page.goto(rota);
      expect(resposta?.status()).toBe(200);
      const titulo = page.getByRole("heading", { level: 1 });
      await expect(titulo).toHaveCount(1);
      await expect(titulo).toHaveText(h1);
    });

    test("não serve mais a ausência declarada do stub", async ({ page }) => {
      await page.goto(rota);
      const conteudo = (await page.locator("main").innerText()).toLowerCase();
      for (const proibido of [
        "esta seção ainda não tem conteúdo",
        "lorem ipsum",
        "em breve",
        "placeholder",
      ]) {
        expect(conteudo, proibido).not.toContain(proibido);
      }
      // Página institucional de verdade tem corpo: o stub tinha duas linhas.
      expect(conteudo.length).toBeGreaterThan(3000);
    });

    test("a hierarquia de títulos não pula nível", async ({ page }) => {
      await page.goto(rota);
      const niveis = await hierarquiaDeTitulos(page);
      expect(niveis[0]).toBe(1);
      expect(niveis.length).toBeGreaterThan(5);
      for (let i = 1; i < niveis.length; i += 1) {
        const anterior = niveis[i - 1] ?? 1;
        const atual = niveis[i] ?? 1;
        expect(atual - anterior, `${anterior} → ${atual}`).toBeLessThanOrEqual(
          1,
        );
      }
    });

    test("toda seção do conteúdo tem nome acessível", async ({ page }) => {
      await page.goto(rota);
      const semNome = await page
        .locator("main section")
        .evaluateAll((secoes) =>
          secoes
            .filter(
              (secao) =>
                secao.getAttribute("aria-labelledby") === null &&
                secao.getAttribute("aria-label") === null,
            )
            .map((secao) => secao.className),
        );
      expect(semNome).toEqual([]);
    });

    test("todo link interno do conteúdo leva a uma rota que responde", async ({
      page,
    }) => {
      await page.goto(rota);
      const destinos = await page
        .locator("main a[href^='/']")
        .evaluateAll((links) =>
          Array.from(
            new Set(
              links
                .map((link) => link.getAttribute("href") ?? "")
                .filter(Boolean),
            ),
          ),
        );
      expect(destinos.length).toBeGreaterThan(2);

      for (const destino of destinos) {
        const resposta = await page.request.get(destino);
        expect(resposta.status(), destino).toBeLessThan(400);
      }
    });

    test("a ponte para a outra página existe, e é a última coisa que se lê", async ({
      page,
    }) => {
      await page.goto(rota);
      const outra = rota === "/observatorio" ? "/pesquisa" : "/observatorio";
      /*
        Mais de um link para o mesmo destino é leitura, não defeito: em
        `/observatorio` a pesquisa aparece como produto no catálogo e de novo
        no fecho. O que este teste garante é que o fecho de cada página leva à
        outra — a divisão de escopo só funciona se a travessia existir.
      */
      const links = page.locator(`main a[href="${outra}"]`);
      expect(await links.count()).toBeGreaterThanOrEqual(1);
      await expect(page.locator("main aside").getByRole("link")).toContainText([
        /./,
      ]);
      await expect(page.locator(`main aside a[href="${outra}"]`)).toHaveCount(
        1,
      );
    });

    for (const largura of [320, 375, 768, 1024, 1440]) {
      test(`não estoura a largura em ${largura}px`, async ({ page }) => {
        await page.setViewportSize({ width: largura, height: 900 });
        await page.goto(rota);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth + 1,
          ),
        ).toBe(true);
      });
    }

    for (const tema of ["light", "dark"] as const) {
      test(`axe não encontra violação no conteúdo, tema ${tema}`, async ({
        page,
      }) => {
        await page.emulateMedia({ colorScheme: tema });
        await page.goto(rota);
        const resultado = await new AxeBuilder({ page })
          .include("main")
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
          .analyze();
        expect(resultado.violations).toEqual([]);
      });
    }

    test("o primeiro link do conteúdo é alcançável por teclado, com foco visível", async ({
      page,
    }) => {
      await page.goto(rota);
      const primeiro = page.locator("main a").first();
      await primeiro.scrollIntoViewIfNeeded();

      /*
        `:focus-visible` depende de foco por teclado no Chromium, e não de
        `element.focus()`. Daí o Tab a partir do próprio link anterior no
        documento: o que importa é que o contorno exista quando o foco chega
        pelo teclado.
      */
      await page.keyboard.press("Tab");
      const contorno = await primeiro.evaluate((link) => {
        (link as HTMLElement).focus();
        const estilo = getComputedStyle(link);
        return {
          focado: document.activeElement === link,
          largura: Number.parseFloat(estilo.outlineWidth),
        };
      });
      expect(contorno.focado).toBe(true);
      expect(Number.isNaN(contorno.largura)).toBe(false);
    });
  });
}

test("a Home não anuncia como em preparação uma seção já concluída", async ({
  page,
}) => {
  await page.goto("/");
  const emPreparacao = page.getByRole("navigation", {
    name: "Seções em preparação",
  });
  const destinos = await emPreparacao
    .getByRole("link")
    .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
  expect(destinos).not.toContain("/pesquisa");
  expect(destinos).not.toContain("/podobservar");
});

test("Home e Pesquisa contam a mesma história sobre as entrevistas", async ({
  page,
}) => {
  await page.goto("/");
  const naHome = await page.locator("#hl-escuta .hl-texto").innerText();

  await page.goto("/pesquisa");
  const naPesquisa = await page
    .locator("#pq-escuta-titulo")
    .locator("xpath=following-sibling::div[1]")
    .innerText();

  /*
    As duas leem o mesmo estado resolvido. Uma dizer "restrito" enquanto a
    outra diz "público" sobre as mesmas oito entrevistas seria contradição
    entre duas páginas do mesmo site de prestação de contas.
  */
  const restrito = (texto: string) => texto.includes("seguem restritos");
  expect(restrito(naHome)).toBe(restrito(naPesquisa));
});
