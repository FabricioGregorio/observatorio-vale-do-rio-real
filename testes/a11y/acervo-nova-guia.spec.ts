import { expect, test, type Page } from "@playwright/test";

const b01 = "/acervo/fotografias-visitas-i-vii";
const relatorio = "/acervo/relatorio-tecnico-recanto-da-serra";
const foto = `${b01}/arquivo/d0af646c-e6b0-423d-9edc-d5ffc74b246a`;
const audio =
  "/acervo/entrevista-josenilson-bispo/arquivo/b66b98a6-fdec-481b-9d9f-fd323a751364";

async function conferirMesmaGuia(page: Page, seletor: string, total: number) {
  const links = page.locator(seletor);
  await expect(links).toHaveCount(total);
  const atributos = await links.evaluateAll((elementos) =>
    elementos.map((elemento) => ({
      target: elemento.getAttribute("target"),
      rel: elemento.getAttribute("rel"),
      aviso: elemento.getAttribute("aria-describedby"),
    })),
  );
  expect(
    atributos.every(
      ({ target, rel, aviso }) =>
        target === null && rel === null && aviso === null,
    ),
  ).toBe(true);
}

async function conferirNovaGuia(page: Page, seletor: string, total: number) {
  const links = page.locator(seletor);
  await expect(links).toHaveCount(total);
  const atributos = await links.evaluateAll((elementos) =>
    elementos.map((elemento) => ({
      target: elemento.getAttribute("target"),
      rel: elemento.getAttribute("rel"),
      aviso: elemento.getAttribute("aria-describedby"),
    })),
  );
  expect(
    atributos.every(
      ({ target, rel, aviso }) =>
        target === "_blank" && rel === "noopener noreferrer" && Boolean(aviso),
    ),
  ).toBe(true);
  const aviso = atributos[0]?.aviso;
  if (!aviso) throw new Error("Aviso de nova guia ausente");
  await expect(page.locator(`#${aviso}`)).toHaveText("Abre em nova guia.");
}

test("fluxo B01 usa a mesma guia até o binário e preserva o histórico", async ({
  page,
}) => {
  await page.goto("/acervo");
  await conferirMesmaGuia(page, 'main a[href^="/acervo/"]', 16);
  await conferirNovaGuia(page, 'main a[href="/anexos.json"]', 1);
  await page.locator(`main a[href="${b01}"]`).click();
  await expect(page).toHaveURL(new RegExp(`${b01}$`));
  expect(page.context().pages()).toHaveLength(1);
  await conferirMesmaGuia(page, 'main a[href*="/arquivo/"]', 59);
  await expect(page.locator("main img")).toHaveCount(0);
  await page.locator(`main a[href="${foto}"]`).click();
  await expect(page).toHaveURL(new RegExp(`${foto}$`));
  expect(page.context().pages()).toHaveLength(1);
  await conferirNovaGuia(
    page,
    'main a[href^="https://acervo.observatoriotobiassoueu.com.br/arquivos/"]',
    1,
  );
  const [binario] = await Promise.all([
    page.context().waitForEvent("page"),
    page.getByRole("link", { name: "Abrir arquivo público" }).click(),
  ]);
  await expect(binario).toHaveURL(
    /^https:\/\/acervo\.observatoriotobiassoueu\.com\.br\/arquivos\//,
  );
  await expect(page).toHaveURL(new RegExp(`${foto}$`));
  await binario.close();
  await page.goBack();
  await expect(page).toHaveURL(new RegExp(`${b01}$`));
  await page.goBack();
  await expect(page).toHaveURL(/\/acervo$/);
});

test("documento comum e seus arquivos contextuais permanecem na mesma guia", async ({
  page,
}) => {
  await page.goto("/acervo");
  await page.locator(`main a[href="${relatorio}"]`).click();
  await expect(page).toHaveURL(new RegExp(`${relatorio}$`));
  await conferirMesmaGuia(page, 'main a[href*="/arquivo/"]', 2);
  await page.locator('main a[href*="/arquivo/"]').first().click();
  await expect(page).toHaveURL(/\/arquivo\//);
  expect(page.context().pages()).toHaveLength(1);
  await conferirNovaGuia(
    page,
    'main a[href^="https://acervo.observatoriotobiassoueu.com.br/arquivos/"]',
    1,
  );
  await page.goBack();
  await expect(page).toHaveURL(new RegExp(`${relatorio}$`));
  await page.goBack();
  await expect(page).toHaveURL(/\/acervo$/);
});

test("transcrição HTML e navegação estrutural ficam na mesma guia; binário e JSON não", async ({
  page,
}) => {
  await page.goto(audio);
  await expect(page.locator("main audio")).toHaveAttribute("preload", "none");
  await conferirMesmaGuia(page, 'main a[href*="/arquivo/"]', 1);
  await conferirNovaGuia(
    page,
    'main a[href^="https://acervo.observatoriotobiassoueu.com.br/arquivos/"]',
    1,
  );
  await conferirMesmaGuia(
    page,
    'main nav[aria-label="Caminho da página"] a',
    2,
  );
  await conferirMesmaGuia(
    page,
    'main a[href="/acervo/entrevista-josenilson-bispo"]',
    3,
  );
  await page
    .getByRole("link", { name: "Abrir transcrição pública deste documento" })
    .click();
  await expect(page).toHaveURL(/\/arquivo\//);
  expect(page.context().pages()).toHaveLength(1);
  await page.goto("/acervo");
  await conferirNovaGuia(page, 'main a[href="/anexos.json"]', 1);
});
