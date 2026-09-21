import { expect, test } from "@playwright/test";
import { ENDERECOS_PUBLICOS } from "./rotas";

const BASTIDORES = [
  /confirmad[oa] pelo responsável/i,
  /confirmação humana direta do responsável/i,
  /decisão humana documentada/i,
  /conforme (solicitado|pedido)/i,
  /fonte da verdade|fonte de verdade/i,
  /pendente de decisão/i,
  /nesta (tarefa|fase|compilação)/i,
  /fora do escopo|não bloqueante/i,
  /AGENTS\.md|data-copy-editorial/i,
  /data-(aprovado|editorial|responsavel|status-interno|validacao|decisao)/i,
  /ChatGPT|Claude|inteligência artificial|conforme prompt/i,
  /(?:usuário|responsável) pediu|foi decidido na conversa/i,
  /tempo de compilação|fontes auto-hospedadas no build/i,
] as const;

test("a saída HTML pública não revela bastidores", async ({
  page,
  request,
}) => {
  test.setTimeout(180_000);
  const rotas = new Set<string>([...ENDERECOS_PUBLICOS, "/pagina-inexistente"]);
  const achados: string[] = [];

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  for (const correspondencia of (await sitemap.text()).matchAll(
    /<loc>([^<]+)<\/loc>/g,
  )) {
    const endereco = correspondencia[1];
    if (endereco) rotas.add(new URL(endereco).pathname);
  }

  for (const indice of ["/acervo", "/podobservar"]) {
    await page.goto(indice);
    const destinos = await page
      .locator('a[href^="/acervo/"], a[href^="/podobservar/"]')
      .evaluateAll((links) =>
        links
          .map((link) => link.getAttribute("href"))
          .filter((href): href is string => href !== null),
      );
    for (const destino of destinos) rotas.add(destino);
  }

  for (const rota of rotas) {
    const resposta = await page.goto(rota);
    expect(resposta, rota).not.toBeNull();
    expect(resposta?.status(), rota).toBe(
      rota === "/pagina-inexistente" ? 404 : 200,
    );
    const saida = await page.evaluate(() => ({
      corpo: document.body.innerText,
      html: document.documentElement.outerHTML,
      atributos: [...document.querySelectorAll("*")]
        .flatMap((elemento) =>
          [...elemento.attributes]
            .filter((atributo) =>
              /^(alt|aria-label|aria-description|title|data-)/.test(
                atributo.name,
              ),
            )
            .map((atributo) => `${atributo.name}=${atributo.value}`),
        )
        .join("\n"),
      metadados: [
        ...document.querySelectorAll(
          "meta, script[type='application/ld+json']",
        ),
      ]
        .map((elemento) => elemento.outerHTML)
        .join("\n"),
    }));
    for (const [superficie, texto] of Object.entries(saida)) {
      for (const padrao of BASTIDORES) {
        if (padrao.test(texto))
          achados.push(`${rota} · ${superficie}: ${padrao.source}`);
      }
    }
  }
  console.info(`Higiene editorial: ${rotas.size} páginas HTML auditadas.`);
  expect(achados).toEqual([]);
});

test("sem JavaScript, o conteúdo de leitura continua sem bastidores", async ({
  browser,
}) => {
  const contexto = await browser.newContext({ javaScriptEnabled: false });
  const pagina = await contexto.newPage();
  try {
    for (const rota of ["/", "/territorio", "/prestacao-de-contas/imprimir"]) {
      const resposta = await pagina.goto(rota);
      expect(resposta?.status(), rota).toBe(200);
      const texto = await pagina.locator("body").innerText();
      for (const padrao of BASTIDORES) expect(texto, rota).not.toMatch(padrao);
    }
  } finally {
    await contexto.close();
  }
});
