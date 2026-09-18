import { expect, test } from "@playwright/test";

const b01 = "/acervo/fotografias-visitas-i-vii";
const arquivo = `${b01}/arquivo/d0af646c-e6b0-423d-9edc-d5ffc74b246a`;

async function conferirNovaGuia(
  page: import("@playwright/test").Page,
  seletor: string,
  total: number,
) {
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

test("índice abre documentos e inventário em nova guia, preservando navegação estrutural", async ({
  page,
}) => {
  await page.goto("/acervo");
  await conferirNovaGuia(page, 'main a[href^="/acervo/"]', 16);
  await conferirNovaGuia(page, 'main a[href="/anexos.json"]', 1);
  await expect(
    page.getByRole("searchbox", { name: "Buscar documentos" }),
  ).toBeVisible();
  await expect(page.getByLabel("Tipo de documento")).toBeVisible();
  const [novaGuia] = await Promise.all([
    page.context().waitForEvent("page"),
    page.locator(`main a[href="${b01}"]`).click(),
  ]);
  await expect(novaGuia).toHaveURL(new RegExp(`${b01}$`));
  await expect(page).toHaveURL(/\/acervo$/);
  await novaGuia.close();
});

test("B01 e documento comum abrem evidências em nova guia", async ({
  page,
}) => {
  await page.goto(b01);
  await conferirNovaGuia(page, 'main a[href*="/arquivo/"]', 59);
  await expect(page.locator("main img")).toHaveCount(0);
  await expect(
    page
      .getByRole("navigation", { name: "Caminho da página" })
      .getByRole("link"),
  ).not.toHaveAttribute("target", "_blank");
  await expect(
    page.getByRole("link", { name: /Voltar ao índice/ }),
  ).not.toHaveAttribute("target", "_blank");
  const [novaGuia] = await Promise.all([
    page.context().waitForEvent("page"),
    page.locator('main a[href*="/arquivo/"]').first().click(),
  ]);
  await expect(novaGuia).toHaveURL(/\/arquivo\//);
  await novaGuia.close();

  await page.goto("/acervo/relatorio-tecnico-recanto-da-serra");
  await conferirNovaGuia(page, 'main a[href*="/arquivo/"]', 2);
  await expect(
    page.getByRole("link", { name: /Voltar ao índice/ }),
  ).not.toHaveAttribute("target", "_blank");
});

test("CTA do binário abre nova guia, enquanto breadcrumb e retorno ficam na guia atual", async ({
  page,
}) => {
  await page.goto(arquivo);
  const binario = page.getByRole("link", { name: "Abrir arquivo público" });
  await conferirNovaGuia(
    page,
    'main a[href^="https://acervo.observatoriotobiassoueu.com.br/arquivos/"]',
    1,
  );
  await expect(binario).toHaveAttribute("target", "_blank");
  const alvosDoCaminho = await page
    .getByRole("navigation", { name: "Caminho da página" })
    .getByRole("link")
    .evaluateAll((links) => links.map((link) => link.getAttribute("target")));
  expect(alvosDoCaminho).toEqual([null, null]);
  await expect(
    page.getByRole("link", { name: /Voltar ao documento/ }),
  ).not.toHaveAttribute("target", "_blank");
  const [novaGuia] = await Promise.all([
    page.context().waitForEvent("page"),
    binario.click(),
  ]);
  await expect(novaGuia).toHaveURL(
    /^https:\/\/acervo\.observatoriotobiassoueu\.com\.br\/arquivos\//,
  );
  await novaGuia.close();
  await page
    .getByRole("navigation", { name: "Caminho da página" })
    .getByRole("link", { name: "Acervo" })
    .click();
  await expect(page).toHaveURL(/\/acervo$/);
  expect(page.context().pages()).toHaveLength(1);
});

test("áudio mantém player nativo e abre transcrição e binário em nova guia", async ({
  page,
}) => {
  await page.goto(
    "/acervo/entrevista-josenilson-bispo/arquivo/b66b98a6-fdec-481b-9d9f-fd323a751364",
  );
  await expect(page.locator("main audio")).toHaveAttribute("preload", "none");
  await conferirNovaGuia(page, 'main a[href*="/arquivo/"]', 1);
  await conferirNovaGuia(
    page,
    'main a[href^="https://acervo.observatoriotobiassoueu.com.br/arquivos/"]',
    1,
  );
});
