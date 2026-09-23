import { expect, test } from "@playwright/test";

/**
 * Os endereços da antiga Prestação de Contas continuam respondendo.
 *
 * Por decisão humana de 2026-09-23 a Prestação de Contas deixou de existir
 * como área pública e a consulta documental foi centralizada no Acervo. As
 * duas rotas não foram simplesmente apagadas: elas já circularam em link
 * externo, em favorito e em documento entregue, e um 404 numa URL divulgada é
 * exatamente o endereço frágil que este projeto existe para não produzir.
 *
 * O que se verifica aqui é o comportamento servido, e não a regra declarada —
 * essa está em `testes/prestacao-removida.test.ts`, sobre `next.config.ts`.
 *
 * Nenhuma das duas mostra página intermediária, aviso de mudança ou "esta
 * página se mudou": quem chega pelo endereço antigo chega ao Acervo.
 */

const ROTAS_APOSENTADAS = [
  "/prestacao-de-contas",
  "/prestacao-de-contas/imprimir",
] as const;

for (const rota of ROTAS_APOSENTADAS) {
  test(`${rota} responde redirect permanente para /acervo`, async ({
    request,
  }) => {
    /*
      `maxRedirects: 0` para ler a resposta do próprio endereço, e não a do
      destino. 308 é o permanente que preserva o método — é o que faz um
      buscador transferir o endereço em vez de manter os dois vivos.
    */
    const resposta = await request.get(rota, { maxRedirects: 0 });
    expect(resposta.status()).toBe(308);
    const destino = resposta.headers().location;
    expect(destino, "cabeçalho Location ausente").toBeDefined();
    expect(new URL(destino ?? "", "http://localhost").pathname).toBe("/acervo");
  });

  test(`${rota} entrega o Acervo, sem página intermediária`, async ({
    page,
  }) => {
    await page.goto(rota);
    await expect(page).toHaveURL(/\/acervo$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Documentos e registros da pesquisa",
    );
    await expect(page.locator("main")).not.toContainText(/esta p[áa]gina/i);
    await expect(page.locator("main")).not.toContainText(/mudou|foi movida/i);
  });
}

test("as rotas aposentadas não voltam ao sitemap", async ({ request }) => {
  const sitemap = await (await request.get("/sitemap.xml")).text();
  for (const rota of ROTAS_APOSENTADAS) {
    expect(sitemap).not.toContain(`${rota}<`);
  }
  expect(sitemap).toContain("/acervo<");
});
