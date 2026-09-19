import { expect, test } from "@playwright/test";

/**
 * O laboratório não chega à superfície pública — cenários de produção.
 *
 * ## Por que este arquivo existe
 *
 * O gate deixou de rodar contra `next dev` e passou a subir um `next start`
 * sobre o build de produção. Foi a mudança certa — é a superfície publicada
 * que precisa de prova —, mas ela tem uma consequência: as rotas `/dev/*`
 * chamam `notFound()` quando `NODE_ENV === "production"`, então todo cenário
 * que navega até um laboratório passa a bater em 404. Os oito arquivos de
 * protótipo saíram do gate por `testIgnore` no `playwright.config.ts`.
 *
 * O problema é que aqueles arquivos não guardavam só o laboratório. Ao longo
 * das fases H3–H4, à medida que composições do laboratório foram promovidas
 * para a Home, cada spec ganhou o cenário inverso: **o que ficou para trás não
 * pode ter atravessado junto**. Esses cenários olham para `/`, não para
 * `/dev/*`, e são exatamente o tipo de garantia que um site de prestação de
 * contas não pode perder de vista — material de laboratório, número de
 * protótipo e casca de desenvolvimento não têm lugar no conteúdo público.
 *
 * Ignorar os arquivos por inteiro levaria esses cenários embora sem que
 * ninguém notasse. Este arquivo os traz de volta para o gate, reunidos, e
 * acrescenta o que faltava ser afirmado: que `/dev/*` de fato responde 404 na
 * produção. Antes isso era premissa; agora é teste.
 *
 * As cópias originais seguem nos specs de laboratório, que só têm sentido
 * contra `next dev`. Quem mexer em uma das duas pontas precisa olhar a outra.
 */

/** Toda a superfície laboratorial, como aparece no build. */
const ROTAS_DE_LABORATORIO = [
  "/dev/dados",
  "/dev/dados-vivos",
  "/dev/estilos",
  "/dev/hero",
  "/dev/linguagem-visual",
  "/dev/pesquisa",
  "/dev/territorio",
  "/dev/territorio-vivo",
  "/dev/territorio-vivo/camada-local/recanto-da-serra",
] as const;

/** Famílias da gramática visual da H3.5 — existem só no laboratório. */
const FAMILIAS = [
  "lv-g-cartografico",
  "lv-g-documental",
  "lv-g-transicao",
] as const;

test.describe("o laboratório não existe na produção", () => {
  for (const rota of ROTAS_DE_LABORATORIO) {
    test(`${rota} responde 404`, async ({ request }) => {
      expect((await request.get(rota)).status()).toBe(404);
    });
  }

  test("nenhuma rota de laboratório entra no sitemap", async ({ request }) => {
    expect(await (await request.get("/sitemap.xml")).text()).not.toContain(
      "/dev/",
    );
  });

  test("o robots bloqueia o laboratório", async ({ request }) => {
    expect(await (await request.get("/robots.txt")).text()).toMatch(
      /Disallow: \/(?:dev\/)?(?:\r?\n|$)/,
    );
  });
});

test.describe("a Home recebeu só o que foi aprovado", () => {
  /*
    Relocado de `hero-prototipo.spec.ts`. A Home é a candidata v2, cuja
    abertura aprovada é a B2: `/` serve **uma** abertura, e nenhum seletor de
    variação do laboratório atravessa junto.
  */
  test("usa apenas a abertura aprovada, sem os seletores do laboratório", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("#hero-wordmark")).toHaveCount(0);
    await expect(page.locator("#hero-tipografia")).toHaveCount(0);
    await expect(page.locator("[data-abertura]")).toHaveCount(1);
    await expect(page.locator('[data-abertura="b2"]')).toHaveCount(1);
    await expect(page.locator(".ab-seletor")).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Observatório de Cultura e Economia Criativa da Região do Vale do Rio Real",
    );
  });

  /*
    Relocado de `dados-prototipo.spec.ts`. A Home tem leitura quantitativa
    própria no capítulo IV; o que importa vigiar é que nada do laboratório
    atravessa para o conteúdo público.
  */
  test("tem uma leitura quantitativa, e nada do laboratório", async ({
    page,
  }) => {
    await page.goto("/");

    // 1. Exatamente um capítulo de leitura, com o título aprovado.
    const leitura = page.locator("#hl-leitura");
    await expect(leitura).toHaveCount(1);
    await expect(
      leitura.getByRole("heading", { name: "Onde o recurso circula" }),
    ).toBeVisible();

    // 2. A casca do laboratório não veio junto.
    await expect(page.getByTestId("dados-prototipo")).toHaveCount(0);

    // 3. O painel da H4.0 não veio junto: ele é outra composição, e continua
    //    sendo só de `/dev/dados`.
    await expect(page.locator(".painel-dados")).toHaveCount(0);
    await expect(page.getByTestId("preset-declaracao")).toHaveCount(0);
    await expect(page.getByTestId("preset-painel")).toHaveCount(0);

    // 4. Nada do que é reservado ao laboratório.
    for (const seletor of [
      ".dv-preview",
      ".dv-laboratorio",
      ".dv-reservados",
      ".dv-ranking",
      ".dv-proposta",
    ]) {
      await expect(page.locator(seletor)).toHaveCount(0);
    }

    // 5. A Home não referencia o laboratório.
    await expect(page.locator('a[href^="/dev/"]')).toHaveCount(0);
  });

  /*
    Relocado de `dados-vivos.spec.ts`. A moldura e o material reservado da
    H4.5 não acompanharam a candidata na promoção para `/`.
  */
  test("não trouxe a moldura nem o material reservado da H4.5", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("#hl-leitura")).toHaveCount(1);
    await expect(page.getByText("Onde o recurso circula")).toHaveCount(1);

    await expect(page.locator(".dv-preview")).toHaveCount(0);
    await expect(page.locator(".dv-laboratorio")).toHaveCount(0);
    await expect(page.locator(".dv-reservados")).toHaveCount(0);
    await expect(page.locator(".dv-ranking")).toHaveCount(0);
    await expect(page.locator(".dv-proposta")).toHaveCount(0);
    await expect(
      page.locator('.dv-faixa[data-variante="reservados"]'),
    ).toHaveCount(0);
  });

  /*
    Relocado de `linguagem-visual.spec.ts`. A gramática da H3.5 existe só no
    laboratório: nem ela nem a casca de comparação vestem a Home pública.
  */
  test("não veste a gramática nem a casca do laboratório", async ({ page }) => {
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
      getComputedStyle(document.body).getPropertyValue("--lv-passagem").trim(),
    );
    expect(noBody).toBe("");

    // A Home pública usa somente a camada abstrata territorial.
    await expect(page.locator('img[src*="/media/grafismos/"]')).toHaveCount(0);

    // Vocabulário de desenvolvimento, inclusive como regra morta no CSS.
    expect(await page.content()).not.toMatch(/proposta|somente DEV/i);
  });
});
