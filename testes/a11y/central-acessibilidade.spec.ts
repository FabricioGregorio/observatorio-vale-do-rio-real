import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import { ENDERECOS_PUBLICOS } from "./rotas";

async function abrir(page: Page) {
  const gatilho = page.getByRole("button", {
    name: "Acessibilidade",
    exact: true,
  });
  await gatilho.click();
  const dialogo = page.getByRole("dialog", { name: "Acessibilidade" });
  await expect(dialogo).toBeVisible();
  return dialogo;
}

/**
 * Leva até a ficha do primeiro arquivo do Acervo.
 *
 * Índice → documento → arquivo. O percurso é em três passos porque é assim
 * que o Acervo está organizado, e não se fixa nenhum slug nem nenhum UUID:
 * o corpus muda, o caminho não. É por aqui que se chega ao `/baixar/…`, que
 * até 2026-09-23 estava a um clique na tabela da Prestação de Contas.
 */
async function irAoPrimeiroArquivoDoAcervo(page: Page) {
  await page.goto("/acervo");
  await page.locator(".acervo-card a").first().click();
  await page.locator('main a[href*="/arquivo/"]').first().click();
  await expect(page.locator('a[href^="/baixar/"]').first()).toBeVisible();
}

test("central nativa: teclado, preferências, persistência e restauração sem telemetria", async ({
  page,
}) => {
  await page.emulateMedia({
    colorScheme: "light",
    reducedMotion: "no-preference",
  });
  await page.goto("/");
  await page.evaluate(() =>
    localStorage.setItem("dado-de-outro-recurso", "preservar"),
  );
  const gatilho = page.getByRole("button", {
    name: "Acessibilidade",
    exact: true,
  });
  await expect(gatilho).toHaveAttribute("aria-haspopup", "dialog");
  await gatilho.focus();
  await page.keyboard.press("Enter");
  const dialogo = page.getByRole("dialog", { name: "Acessibilidade" });
  await expect(
    dialogo.getByRole("button", { name: "Fechar", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  // O diálogo nativo permite passar pela interface do navegador, nunca pelo conteúdo inerte.
  if (await page.evaluate(() => document.activeElement === document.body))
    await page.keyboard.press("Shift+Tab");
  await expect(
    dialogo.getByRole("link", { name: "Relatar ao Observatório" }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  if (await page.evaluate(() => document.activeElement === document.body))
    await page.keyboard.press("Tab");
  await expect(
    dialogo.getByRole("button", { name: "Fechar", exact: true }),
  ).toBeFocused();
  const eventos: string[] = [];
  page.on("request", (request) => {
    if (request.method() === "POST") eventos.push(request.postData() ?? "");
  });
  await dialogo.getByRole("button", { name: "Escuro", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-tema", "escuro");
  await dialogo.getByRole("button", { name: "Claro", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-tema", "claro");
  await dialogo.getByRole("button", { name: "Sistema", exact: true }).click();
  await expect(page.locator("html")).not.toHaveAttribute("data-tema");
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("body")).toHaveCSS(
    "background-color",
    "rgb(14, 22, 17)",
  );
  await dialogo.getByLabel("Reduzir animações").check();
  await dialogo.getByLabel("Texto maior", { exact: true }).focus();
  await page.keyboard.press("Space");
  await expect(page.locator("html")).toHaveCSS("font-size", "18px");
  await expect(page.locator("html")).toHaveAttribute(
    "data-movimento",
    "reduzido",
  );
  await page.keyboard.press("Escape");
  await expect(dialogo).toBeHidden();
  await expect(gatilho).toBeFocused();
  await expect(gatilho).toHaveAttribute("aria-expanded", "false");
  expect(
    eventos.filter((corpo) =>
      /observatorio-(tema|texto|movimento)|"type"\s*:\s*"event"/.test(corpo),
    ),
  ).toEqual([]);
  await page.reload();
  await abrir(page);
  await expect(
    dialogo.getByLabel("Texto maior", { exact: true }),
  ).toBeChecked();
  await expect(dialogo.getByLabel("Reduzir animações")).toBeChecked();
  await dialogo.getByRole("button", { name: "Restaurar preferências" }).click();
  await expect(page.locator("html")).toHaveCSS("font-size", "16px");
  await expect(page.locator("html")).not.toHaveAttribute("data-movimento");
  await expect(
    dialogo.getByRole("button", { name: "Sistema", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  expect(
    await page.evaluate(() => Object.fromEntries(Object.entries(localStorage))),
  ).toEqual({ "dado-de-outro-recurso": "preservar" });
});

for (const sistema of ["reduce", "no-preference"] as const) {
  test(`redução ${sistema}: efeito manual nunca desrespeita o sistema`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: sistema });
    await page.goto("/pesquisa");
    const dialogo = await abrir(page);
    await dialogo.getByLabel("Reduzir animações").check();
    const duracao = () =>
      page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue("--duracao-hover")
          .trim(),
      );
    expect(Number.parseFloat(await duracao())).toBe(0);
    await expect(page.locator(".pq-etapas")).toHaveCount(1);
    expect(
      await page
        .locator(".pq-etapas")
        .evaluate((el) => getComputedStyle(el, "::after").animationName),
    ).toBe("none");
    await dialogo.getByLabel("Reduzir animações").uncheck();
    if (sistema === "reduce")
      expect(Number.parseFloat(await duracao())).toBe(0);
    else expect(Number.parseFloat(await duracao())).toBeGreaterThan(0);
  });
}

test("rota removida usa a 404 normal e desaparece dos destinos", async ({
  page,
  request,
}) => {
  const resposta = await page.goto("/acessibilidade");
  expect(resposta?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Página não encontrada",
  );
  await expect(page.locator('a[href="/acessibilidade"]')).toHaveCount(0);
  expect(await (await request.get("/sitemap.xml")).text()).not.toContain(
    "/acessibilidade",
  );
  await page.setViewportSize({ width: 320, height: 900 });
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await expect(page.locator('a[href="/acessibilidade"]')).toHaveCount(0);
  await expect(
    page
      .getByRole("navigation", { name: "Principal (telas estreitas)" })
      .getByRole("button", { name: "Acessibilidade" }),
  ).toHaveCount(0);
});

for (const largura of [320, 375, 390, 1440]) {
  test(`texto maior e movimento reduzido em todas as rotas: ${largura}px`, async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: largura, height: 900 });
    await page.goto("/");
    const dialogo = await abrir(page);
    await dialogo.getByLabel("Texto maior", { exact: true }).check();
    await dialogo.getByLabel("Reduzir animações").check();
    for (const rota of ENDERECOS_PUBLICOS) {
      await page.goto(rota);
      await expect(page.locator("html")).toHaveCSS("font-size", "18px");
      const tamanho = await page.evaluate(() => ({
        pagina: document.documentElement.scrollWidth,
        tela: innerWidth,
      }));
      expect(tamanho.pagina, rota).toBeLessThanOrEqual(tamanho.tela);
    }
    await abrir(page);
    const caixa = await dialogo.boundingBox();
    expect(caixa?.x).toBeGreaterThanOrEqual(0);
    expect((caixa?.x ?? 0) + (caixa?.width ?? 0)).toBeLessThanOrEqual(largura);
    const axe = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(axe.violations).toEqual([]);
    await page.keyboard.press("Escape");
    if (largura < 1280) {
      await page.getByRole("button", { name: "Menu", exact: true }).click();
      for (const item of await page
        .locator(".hl-menu-estreito__lista a")
        .all()) {
        expect((await item.boundingBox())?.height).toBeGreaterThanOrEqual(44);
      }
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(largura);
    }
  });
}

test("famílias, consulta documental, download real e foco", async ({
  page,
}) => {
  await page.goto("/podobservar");
  const externo = page
    .getByRole("link", { name: "Ouvir no Spotify", exact: true })
    .first();
  await expect(externo).toHaveAttribute("data-acao", "primary");
  await expect(externo).toHaveAttribute("target", "_blank");
  await expect(externo).toHaveAttribute("rel", /noopener.*noreferrer/);
  await expect(externo).toHaveAccessibleDescription("Abre em nova guia.");
  await page.goto("/pesquisa");
  await expect(page.locator('[data-acao="text"]').first()).toBeAttached();
  /*
    O download documental vivia na tabela da Prestação de Contas. Desde
    2026-09-23 ele mora na ficha do arquivo, no Acervo — mesma variante de
    ação, mesmo alvo de toque, mesma exigência de foco visível.
  */
  await irAoPrimeiroArquivoDoAcervo(page);
  const download = page.locator('a[href^="/baixar/"]').first();
  await expect(download).toHaveAttribute("data-acao", "document");
  await download.focus();
  expect(
    await download.evaluate((el) => getComputedStyle(el).outlineStyle),
  ).not.toBe("none");
  expect((await download.boundingBox())?.height).toBeGreaterThanOrEqual(44);
  const [arquivo] = await Promise.all([
    page.waitForEvent("download"),
    download.click(),
  ]);
  expect(await arquivo.failure()).toBeNull();
  expect(arquivo.suggestedFilename()).not.toBe("");
  await expect(
    page.getByRole("button", { name: "Acessibilidade", exact: true }),
  ).toHaveAttribute("data-acao", "utility");
});

test("checkpoint visual: desktop, 320px, temas e central", async ({ page }) => {
  test.setTimeout(120_000);
  const pasta = join(process.cwd(), "tmp", "checkpoint-ctas");
  await mkdir(pasta, { recursive: true });
  for (const largura of [1440, 320]) {
    await page.setViewportSize({ width: largura, height: 900 });
    await page.goto("/");
    const dialogo = await abrir(page);
    await dialogo
      .getByRole("button", { name: "Restaurar preferências" })
      .click();
    if (largura === 320)
      await dialogo.getByLabel("Texto maior", { exact: true }).check();
    for (const tema of ["Claro", "Escuro"]) {
      await dialogo.getByRole("button", { name: tema, exact: true }).click();
      expect(
        (
          await new AxeBuilder({ page })
            .include("dialog")
            .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
            .analyze()
        ).violations,
      ).toEqual([]);
      await page.screenshot({
        animations: "disabled",
        path: join(pasta, `central-${largura}-${tema}.png`),
      });
    }
    await page.keyboard.press("Escape");
    for (const rota of ["/", "/acervo", "/podobservar"]) {
      await page.goto(rota);
      await page.screenshot({
        animations: "disabled",
        path: join(pasta, `${rota.slice(1) || "home"}-${largura}.png`),
        fullPage: false,
      });
    }
    await page.goto("/#hl-lugares");
    const relatorios = page.getByRole("link", {
      name: "Abrir relatório técnico",
      exact: true,
    });
    for (const relatorio of await relatorios.all()) {
      expect((await relatorio.boundingBox())?.height).toBeLessThanOrEqual(88);
    }
    await page
      .locator(".hl-equip")
      .first()
      .screenshot({
        path: join(pasta, `relatorio-${largura}.png`),
        animations: "disabled",
      });
    await page.goto("/acervo");
    const card = page.locator(".acervo-card").first();
    await card.getByRole("link").focus();
    await card.screenshot({
      path: join(pasta, `acervo-foco-${largura}.png`),
      animations: "disabled",
    });
    await irAoPrimeiroArquivoDoAcervo(page);
    await page.locator('a[href^="/baixar/"]').first().focus();
    await page.screenshot({
      path: join(pasta, `documentos-foco-${largura}.png`),
      animations: "disabled",
    });
    await page.goto("/podobservar");
    await page
      .locator(".pod-episodio")
      .first()
      .screenshot({
        path: join(pasta, `episodio-${largura}.png`),
        animations: "disabled",
      });
    await page.goto("/");
    if (largura === 320) {
      await page.getByRole("button", { name: "Menu", exact: true }).click();
      await page.screenshot({
        animations: "disabled",
        path: join(pasta, "menu-320.png"),
      });
    }
  }
});

/*
  Geometria do painel, e não só a sua presença.

  A Central abria centrada nos emuladores e desalinhada em celular real. A
  causa não estava nas medidas: o <dialog> era filho do cabeçalho, que tem
  `backdrop-filter`, e um ancestral com filtro vira o bloco recipiente dos
  descendentes `position: fixed`. Nos motores que não retiram o diálogo modal
  dessa cadeia, o painel era centrado na faixa do cabeçalho — topo fora da
  tela, rodapé cortado. O painel passou a ser montado em <body>.

  Por isso este teste mede duas coisas que `toBeVisible()` não mede: a caixa
  do painel contra a viewport, e a ausência de ancestral com filtro ou
  transformação. A segunda é a que falha primeiro se o painel voltar para
  dentro do cabeçalho — e é a que descreve o defeito real.

  `/observatorio` é a rota usada porque não depende do banco.
*/
const TELAS = [
  { largura: 320, altura: 568 },
  { largura: 360, altura: 800 },
  { largura: 375, altura: 667 },
  { largura: 390, altura: 844 },
  { largura: 430, altura: 932 },
  { largura: 667, altura: 375 },
] as const;

for (const { largura, altura } of TELAS) {
  test(`central centrada na viewport: ${largura}x${altura}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: largura, height: altura });
    await page.goto("/observatorio");
    const dialogo = page.getByRole("dialog", { name: "Acessibilidade" });

    /* A cadeia de ancestrais é a causa; medi-la é medir o defeito. */
    await abrir(page);
    expect(
      await dialogo.evaluate((el) => {
        const presos: string[] = [];
        for (let n = el.parentElement; n; n = n.parentElement) {
          const s = getComputedStyle(n);
          if (
            s.transform !== "none" ||
            s.filter !== "none" ||
            s.backdropFilter !== "none" ||
            s.perspective !== "none"
          )
            presos.push(`${n.tagName}.${n.className}`);
        }
        return presos;
      }),
    ).toEqual([]);
    await page.keyboard.press("Escape");

    /*
      Rolar antes de abrir: se o painel se prendesse ao documento, ou a um
      ancestral, é aqui que ele sairia de lugar.
    */
    await page.evaluate(() => scrollTo(0, 3000));
    for (const maior of [false, true]) {
      const dialogoAberto = await abrir(page);
      if (maior)
        await dialogoAberto.getByLabel("Texto maior", { exact: true }).check();
      else
        await dialogoAberto
          .getByLabel("Texto maior", { exact: true })
          .uncheck();
      /* Fechar e reabrir: a posição não pode depender da primeira abertura. */
      await page.keyboard.press("Escape");
      await abrir(page);

      const caixa = await dialogo.boundingBox();
      if (!caixa) throw new Error("painel sem caixa");
      const contexto = `${largura}x${altura} texto ${maior ? "maior" : "padrão"}`;
      const folgaEsquerda = caixa.x;
      const folgaDireita = largura - (caixa.x + caixa.width);
      const folgaTopo = caixa.y;
      const folgaBase = altura - (caixa.y + caixa.height);

      /* Inteiro dentro da viewport, sem encostar nas bordas. */
      expect(folgaEsquerda, contexto).toBeGreaterThanOrEqual(8);
      expect(folgaDireita, contexto).toBeGreaterThanOrEqual(8);
      expect(folgaTopo, contexto).toBeGreaterThanOrEqual(8);
      expect(folgaBase, contexto).toBeGreaterThanOrEqual(8);

      /* Centrado: as folgas opostas são a mesma, a menos de arredondamento. */
      expect(
        Math.abs(folgaEsquerda - folgaDireita),
        contexto,
      ).toBeLessThanOrEqual(2);
      expect(Math.abs(folgaTopo - folgaBase), contexto).toBeLessThanOrEqual(2);

      /* O fim do painel é alcançável sem rolar a página por trás. */
      const rolagem = await page.evaluate(() => ({
        pagina: scrollY,
        painel: (() => {
          const d = document.querySelector("dialog.central") as HTMLElement;
          d.scrollTop = d.scrollHeight;
          const fim = d.querySelector(".central__ajuda") as HTMLElement;
          return fim.getBoundingClientRect().bottom <= innerHeight + 1;
        })(),
      }));
      expect(rolagem.painel, contexto).toBe(true);
      expect(rolagem.pagina, contexto).toBeGreaterThan(0);

      await page.keyboard.press("Escape");
      await expect(
        page.getByRole("button", { name: "Acessibilidade", exact: true }),
      ).toBeFocused();
    }
    await abrir(page);
    await dialogo
      .getByRole("button", { name: "Restaurar preferências" })
      .click();
    await page.keyboard.press("Escape");
  });
}
