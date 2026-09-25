import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * EP04 — "Entre dados e fatos", publicado em 2026-09-21.
 *
 * Primeiro episódio publicado depois das superfícies do PodObservar existirem,
 * e o primeiro com master em MP3 e capa original em 4:5. O que se verifica
 * aqui é o que o visitante recebe: a página do episódio, a Home e a lista
 * mostrando o EP04 como mais recente, e o sitemap
 * contando quatro — tudo derivado da view, sem nada escrito à mão.
 *
 * Depende do banco no build, como o resto da suíte a11y.
 */

const ROTA = "/podobservar/t1/04-entre-dados-e-fatos";
const TITULO = "#04 Episódio - Entre dados e fatos";
const SPOTIFY = "https://open.spotify.com/episode/7Johkhb6BqDx1gVolyz8iE";
const CAPA = "arquivos%2Fpodobservar-artes%2Ft1-ep-04-capa-v1.webp";
const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

/** Nada de bastidor, arquivo interno ou áudio pode chegar ao documento. */
const PROIBIDOS = [
  "não informada nos anexos",
  "aproximadamente 26:15",
  "Publicado em:",
  "ep04-v2",
  ".mp3",
  "audio/mpeg",
  "arquivos/podobservar/",
  "observatorio-privado",
  "originais/podobservar",
  "observatorio-fontes",
  "Transcrição episódio 4.pdf",
];

test("a página do EP04 responde 200 com título, data, duração e escuta", async ({
  page,
}) => {
  const resposta = await page.goto(ROTA);
  expect(resposta?.status()).toBe(200);

  await expect(page).toHaveTitle(`${TITULO} — PodObservar`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(TITULO);
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);

  const main = page.locator("main");
  await expect(main.locator('time[dateTime="2026-09-21"]')).toHaveText(
    "21 de setembro de 2026",
  );
  await expect(main.locator('time[dateTime="PT26M15S"]')).toHaveText(
    "26 min 15 s",
  );

  const spotify = main.getByRole("link", { name: /Ouvir no Spotify/ });
  await expect(spotify).toHaveAttribute("href", SPOTIFY);
  await expect(spotify).toHaveAttribute("target", "_blank");
  await expect(spotify).toHaveAttribute("rel", /noopener/);
  await expect(spotify).toHaveAttribute("rel", /noreferrer/);

  const capa = main.locator("img.pod-episodio-pagina__capa");
  await expect(capa).toHaveAttribute("src", new RegExp(CAPA));
  await expect(capa).toHaveAttribute("width", "1200");
  await expect(capa).toHaveAttribute("height", "1200");

  await expect(
    page.locator('meta[property="og:image"]').first(),
  ).toHaveAttribute("content", /t1-ep-04-capa-v1\.webp$/);
});

test("a transcrição do EP04 é integral e começa na primeira fala", async ({
  page,
}) => {
  await page.goto(ROTA);
  const transcricao = page
    .getByRole("heading", { name: "Transcrição", exact: true })
    .locator("xpath=ancestor::section[1]");
  const texto = await transcricao.innerText();
  expect(texto).toMatch(/LAURA AGUIAR/);
  expect(texto).toContain(
    "Antes de falar da Serra dos Macacos, a gente precisa contar como ficou sabendo",
  );
  for (const falante of [
    "GALILEU SANTANA",
    "LHUCAS SANTOS",
    "LUIZ",
    "FABRÍCIO GREGÓRIO",
    "PEDRO MENEZES",
  ])
    expect(texto, falante).toContain(falante);
  // O EP04 não tem marcas de tempo, e nenhuma é inventada.
  expect(texto).not.toMatch(/\[\d{2}:\d{2}\]/);
});

for (const rota of [ROTA, "/", "/podobservar"]) {
  test(`${rota} não entrega áudio nem texto de bastidor do EP04`, async ({
    page,
  }) => {
    await page.goto(rota);
    await expect(page.locator("audio, video, iframe, a[download]")).toHaveCount(
      0,
    );
    const html = await page.content();
    for (const proibido of PROIBIDOS)
      expect(html, `${rota} contém ${proibido}`).not.toContain(proibido);
  });
}

test("a Home destaca o EP04 como episódio mais recente", async ({ page }) => {
  await page.goto("/");
  const recente = page.locator(".hl-pod-recente");
  await expect(recente).toContainText(TITULO);
  await expect(recente).toContainText("21/09/2026");
  await expect(recente).toContainText("26 min 15 s");
  await expect(recente).not.toContainText("Borda da Mata");
  await expect(recente.locator("img.hl-pod-recente__capa")).toHaveAttribute(
    "src",
    new RegExp(CAPA),
  );
  await expect(
    recente.getByRole("link", { name: /Ouvir no Spotify/ }),
  ).toHaveAttribute("href", SPOTIFY);
  await expect(
    page.locator("#hl-podobservar").getByRole("link", {
      name: /Ver PodObservar/,
    }),
  ).toHaveAttribute("href", "/podobservar");
});

test("/podobservar lista quatro episódios, com o EP04 primeiro", async ({
  page,
}) => {
  await page.goto("/podobservar");
  // As entradas do caderno, na ordem da página. A porta "Começar pelo
  // episódio 1", no masthead, não é entrada da lista.
  const links = page.locator('main .pod-entrada a[href^="/podobservar/t1/"]');
  const destinos = [
    ...new Set(
      await links.evaluateAll((todos) =>
        todos.map((a) => a.getAttribute("href")),
      ),
    ),
  ];
  expect(destinos).toEqual([
    ROTA,
    "/podobservar/t1/03-conheca-o-museu-borda-da-mata",
    "/podobservar/t1/02-conheca-o-recanto-da-serra",
    "/podobservar/t1/01-o-que-e-o-vale-do-rio-real",
  ]);
});

/*
  A contagem de episódios publicados era exibida também na Prestação de
  Contas, e este arquivo a conferia lá. A página saiu em 2026-09-23; o que ela
  contava continua contado acima, contra as quatro rotas que o gate publicou —
  que é a fonte, e não uma segunda escrita dela.
*/

test("o sitemap inclui a página do EP04", async ({ request }) => {
  const resposta = await request.get("/sitemap.xml");
  expect(resposta.status()).toBe(200);
  const corpo = await resposta.text();
  expect(corpo).toContain(ROTA);
  expect(corpo.match(/\/podobservar\/t1\//g)).toHaveLength(4);
});

for (const largura of [375, 768, 1440]) {
  test(`a página do EP04 não transborda em ${largura}px`, async ({ page }) => {
    await page.setViewportSize({ width: largura, height: 900 });
    await page.goto(ROTA);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 1,
      ),
    ).toBe(false);
    const capa = await page
      .locator("img.pod-episodio-pagina__capa")
      .boundingBox();
    expect(capa).not.toBeNull();
    if (capa) expect(Math.abs(capa.width - capa.height)).toBeLessThanOrEqual(1);
  });
}

for (const tema of ["light", "dark"] as const) {
  test(`a página do EP04 passa no axe no tema ${tema}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: tema });
    await page.goto(ROTA);
    const resultado = await new AxeBuilder({ page })
      .include("main")
      .withTags(WCAG)
      .analyze();
    expect(resultado.violations).toEqual([]);
  });
}
