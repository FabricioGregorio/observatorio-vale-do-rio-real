import { expect, test } from "@playwright/test";

/**
 * O total não é constante de teste: ele vem de `/anexos.json`, que deriva de
 * `vw_anexo_publico` no mesmo build. Fixar um número aqui foi o que fez a
 * suíte continuar exigindo oito depois da publicação de 2026-09-16 — um
 * contrato histórico disfarçado de invariante.
 *
 * O que continua invariante, e é o que importa, está nas asserções de forma:
 * toda URL sob o domínio próprio, nenhuma chave privada, nenhum r2.dev, e os
 * dois itens que a decisão humana manteve fora do acervo público.
 */
test.describe("Sala do Avaliador e /anexos.json descrevem o mesmo acervo", () => {
  test("cada anexo público do JSON tem seu link de download na Sala", async ({
    page,
    request,
  }) => {
    const json = (await (await request.get("/anexos.json")).json()) as {
      total: number;
      anexos: Array<{ slug: string; link_permanente: string }>;
    };
    await page.goto("/prestacao-de-contas");

    const baixar = page.getByRole("link", { name: "Baixar", exact: true });
    await expect(baixar).toHaveCount(json.total);

    const urls = await baixar.evaluateAll((links) =>
      links.map((link) => link.getAttribute("href")),
    );
    expect(new Set(urls)).toEqual(
      new Set(json.anexos.map((a) => a.link_permanente)),
    );
    for (const url of urls) {
      expect(url).toMatch(
        /^https:\/\/acervo\.observatoriotobiassoueu\.com\.br\/arquivos\//,
      );
      expect(url).not.toMatch(/privad|r2\.dev|r2\.cloudflarestorage/);
    }
  });

  test("o acervo público reúne os documentos autorizados e só eles", async ({
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
    expect(json.anexos).toHaveLength(json.total);

    const porSlug = new Map<string, number>();
    for (const anexo of json.anexos) {
      porSlug.set(anexo.slug, (porSlug.get(anexo.slug) ?? 0) + 1);
      expect(anexo.link_permanente).toMatch(
        /^https:\/\/acervo\.observatoriotobiassoueu\.com\.br\/arquivos\//,
      );
    }

    // Distribuição autorizada em 2026-09-16, por documento. O A03 tem dois
    // objetos: o PDF integral digitalizado e a transcrição textual acessível
    // derivada dele, publicada por autorização específica.
    expect(Object.fromEntries([...porSlug].sort())).toEqual({
      "anexo-indicadores-etapa-1": 18,
      "entrevista-josenilson-bispo": 2,
      "entrevista-laerte-aguiar": 2,
      "entrevista-lideranca-ilha-grande": 2,
      "entrevista-marcio-andre": 2,
      "entrevista-oviedo-e-neide-abreu": 2,
      "entrevista-paola-santana": 2,
      "entrevista-pedro-menezes": 2,
      "entrevista-prefeito-tobias-barreto": 2,
      "formulario-publico-consumidor": 2,
      "formulario-rotina-de-funcionamento": 1,
      "fotografias-visitas-i-vii": 59,
      "identidade-visual": 8,
      "relatorio-tecnico-borda-da-mata": 2,
      "relatorio-tecnico-recanto-da-serra": 2,
      "relatorio-tecnico-serra-dos-macacos": 1,
    });

    // O que a decisão humana manteve fora, continua fora.
    expect(corpo).not.toContain("relato-participacao-expedicao");
    expect(corpo).not.toContain("entrevista-cultura-itabaianinha");
    expect(corpo).not.toContain("STORAGE_PRIVATE");
    expect(corpo).not.toContain("chave_storage");
    expect(corpo).not.toContain("r2.dev");
    expect(corpo).not.toContain("r2.cloudflarestorage");
  });
});
