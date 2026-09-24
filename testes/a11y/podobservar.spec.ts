import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * Superfícies públicas do PodObservar — P0.3.
 *
 * Cobre a seção II da Home e a página `/podobservar`. A página de um episódio
 * **não** entra aqui ainda: enquanto os três episódios estiverem em rascunho,
 * `episodios.json` tem zero linhas, `generateStaticParams` devolve lista
 * vazia e a rota não existe para ser visitada. Um teste que a visitasse agora
 * receberia 404 e passaria por engano. A varredura axe do episódio acontece
 * no checkpoint de homologação, depois da publicação autorizada.
 *
 * Os contratos estruturais dessa página — hierarquia de títulos, ausência de
 * player, transcrição legível — estão cobertos por renderização em
 * `testes/podobservar-publico.test.ts`, que lê o snapshot versionado.
 */

const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

/**
 * Na Home, a varredura é escopada à seção do PodObservar.
 *
 * `/` inteira tem uma violação **preexistente**, provada nesta fase com o
 * código novo fora da árvore: `aria-prohibited-attr` em dois `<g aria-label>`
 * sem `role` no SVG da cartografia (`MapaDoRecorte.tsx`). Nenhum spec rodava
 * axe na Home antes, e por isso ela nunca tinha aparecido. Não é desta fase e
 * não se conserta aqui — está relatada, com o conserto de uma linha. Escopar
 * mantém este gate como afirmação sobre o que a P0.3 construiu, em vez de um
 * alarme herdado que alguém desligaria.
 */
test("axe não encontra violações na seção do PodObservar", async ({ page }) => {
  await page.goto("/");
  const resultado = await new AxeBuilder({ page })
    .include("#hl-podobservar")
    .withTags(WCAG)
    .analyze();
  expect(resultado.violations).toEqual([]);
});

test("axe não encontra violações em /podobservar", async ({ page }) => {
  await page.goto("/podobservar");
  const resultado = await new AxeBuilder({ page })
    .include("main")
    .withTags(WCAG)
    .analyze();
  expect(resultado.violations).toEqual([]);
});

test("a Home traz a seção do PodObservar entre Origem e Território", async ({
  page,
}) => {
  await page.goto("/");
  const secao = page.locator("#hl-podobservar");
  await expect(secao).toBeVisible();
  await expect(secao.getByRole("heading", { level: 2 })).toHaveText(
    "A pesquisa também se escuta.",
  );

  const ordem = await page.evaluate(() => {
    const ids = ["hl-origem", "hl-podobservar", "hl-territorio"];
    return ids.map((id) => {
      const no = document.getElementById(id);
      return no ? no.getBoundingClientRect().top + window.scrollY : -1;
    });
  });
  expect(ordem[0]).toBeLessThan(ordem[1] ?? 0);
  expect(ordem[1]).toBeLessThan(ordem[2] ?? 0);
});

test("o bloco antigo do PodObservar não sobrou em Produtos", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("#hl-pod")).toHaveCount(0);
  await expect(page.locator(".hl-episodios")).toHaveCount(0);
  await expect(page.getByText(/\d+ episódios publicados no/)).toHaveCount(0);
});

test("a numeração dos capítulos da Home é contínua", async ({ page }) => {
  await page.goto("/");
  const numeros = await page.locator(".hl-num").allTextContents();
  expect(numeros).toEqual(["I", "II", "III", "IV", "V", "VI", "VII", "VIII"]);
});

test("o CTA interno da Home abre /podobservar na mesma guia", async ({
  page,
}) => {
  await page.goto("/");
  const cta = page
    .locator("#hl-podobservar")
    .getByRole("link", { name: /Ver PodObservar/ });
  await expect(cta).toHaveAttribute("href", "/podobservar");
  await expect(cta).not.toHaveAttribute("target", "_blank");

  await Promise.all([
    page.waitForURL((url) => url.pathname === "/podobservar"),
    cta.click(),
  ]);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "A pesquisa também se escuta.",
  );
});

/**
 * A regra vista de fora: o navegador não recebe player, embed nem
 * endereço de áudio. É a verificação que sobrevive a qualquer refactor de
 * componente, porque olha o documento entregue, não o código-fonte.
 */
for (const rota of ["/", "/podobservar"]) {
  test(`${rota} não entrega player, embed nem áudio`, async ({ page }) => {
    await page.goto(rota);
    await expect(page.locator("audio")).toHaveCount(0);
    await expect(page.locator("video")).toHaveCount(0);
    await expect(page.locator("iframe")).toHaveCount(0);
    await expect(page.locator("a[download]")).toHaveCount(0);

    const html = await page.content();
    for (const proibido of [
      "open.spotify.com/embed",
      "youtube.com/embed",
      "youtube-nocookie",
      ".wav",
      ".mp3",
      ".m4a",
      "arquivos/podobservar/",
      "observatorio-privado",
    ]) {
      expect(html, `${rota} contém ${proibido}`).not.toContain(proibido);
    }
  });
}

test("cada link externo do PodObservar anuncia que abre em nova guia", async ({
  page,
}) => {
  await page.goto("/podobservar");
  const externos = page.locator('main a[target="_blank"]');
  const total = await externos.count();
  for (let i = 0; i < total; i++) {
    const link = externos.nth(i);
    await expect(link).toHaveAttribute("rel", /noopener/);
    await expect(link).toHaveAttribute("rel", /noreferrer/);
    const descrito = await link.getAttribute("aria-describedby");
    expect(descrito).toBeTruthy();
    if (descrito) {
      await expect(page.locator(`#${descrito}`)).toHaveText(
        "Abre em nova guia.",
      );
    }
  }
});

test("/podobservar tem um H1 só e hierarquia coerente", async ({ page }) => {
  await page.goto("/podobservar");
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  const niveis = await page.evaluate(() =>
    [...document.querySelectorAll("main h1, main h2, main h3")].map((h) =>
      Number(h.tagName.slice(1)),
    ),
  );
  expect(niveis[0]).toBe(1);
  for (let i = 1; i < niveis.length; i++) {
    expect((niveis[i] ?? 0) - (niveis[i - 1] ?? 0)).toBeLessThanOrEqual(1);
  }
});

for (const largura of [375, 768, 1440]) {
  test(`/podobservar não transborda em ${largura}px`, async ({ page }) => {
    await page.setViewportSize({ width: largura, height: 900 });
    await page.goto("/podobservar");
    const transbordo = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(transbordo).toBe(false);
  });

  test(`a seção do PodObservar na Home não transborda em ${largura}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: largura, height: 900 });
    await page.goto("/");
    const transbordo = await page.evaluate(() => {
      const secao = document.getElementById("hl-podobservar");
      if (!secao) return true;
      return secao.scrollWidth > window.innerWidth + 1;
    });
    expect(transbordo).toBe(false);
  });
}

for (const tema of ["light", "dark"] as const) {
  test(`/podobservar passa no axe no tema ${tema}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: tema });
    await page.goto("/podobservar");
    const resultado = await new AxeBuilder({ page })
      .include("main")
      .withTags(["wcag2aa", "wcag21aa"])
      .analyze();
    expect(resultado.violations).toEqual([]);
  });
}
