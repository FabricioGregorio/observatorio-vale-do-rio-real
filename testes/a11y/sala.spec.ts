import { expect, test } from "@playwright/test";

test.describe("Sala do Avaliador após a primeira publicação", () => {
  test("expõe somente A02 e os sete arquivos públicos de D01", async ({
    page,
  }) => {
    await page.goto("/prestacao-de-contas");

    await expect(
      page.getByRole("link", { name: "Baixar", exact: true }),
    ).toHaveCount(8);
    await expect(page.getByText("A02", { exact: true })).toHaveCount(1);
    for (let indice = 1; indice <= 7; indice += 1) {
      await expect(
        page.getByText(`D01-0${indice}`, { exact: true }),
      ).toHaveCount(1);
    }
    await expect(page.getByText("D01-08", { exact: true })).toHaveCount(0);
    await expect(page.getByText("A04", { exact: true })).toHaveCount(0);

    const urls = await page
      .getByRole("link", { name: "Baixar", exact: true })
      .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
    expect(urls).toHaveLength(8);
    for (const url of urls) {
      expect(url).toMatch(
        /^https:\/\/acervo\.observatoriotobiassoueu\.com\.br\/arquivos\//,
      );
      expect(url).not.toMatch(/privad|r2\.dev|r2\.cloudflarestorage/);
    }
  });

  test("expõe JSON com os mesmos oito arquivos e sem referência privada", async ({
    request,
  }) => {
    const resposta = await request.get("/anexos.json");
    expect(resposta.ok()).toBe(true);
    expect(resposta.headers()["content-type"]).toContain("application/json");

    const corpo = await resposta.text();
    const json = JSON.parse(corpo) as {
      total: number;
      anexos: Array<{ slug: string; link_permanente: string }>;
    };
    expect(json.total).toBe(8);
    expect(json.anexos).toHaveLength(8);
    expect(
      json.anexos.filter(
        (anexo) => anexo.slug === "relatorio-tecnico-recanto-da-serra",
      ),
    ).toHaveLength(1);
    expect(
      json.anexos.filter((anexo) => anexo.slug === "identidade-visual"),
    ).toHaveLength(7);
    for (const anexo of json.anexos) {
      expect(anexo.link_permanente).toMatch(
        /^https:\/\/acervo\.observatoriotobiassoueu\.com\.br\/arquivos\//,
      );
    }
    expect(corpo).not.toContain("D01-08");
    expect(corpo).not.toContain("relato-participacao-expedicao");
    expect(corpo).not.toContain("STORAGE_PRIVATE");
    expect(corpo).not.toContain("chave_storage");
    expect(corpo).not.toContain("r2.dev");
    expect(corpo).not.toContain("r2.cloudflarestorage");
  });
});
