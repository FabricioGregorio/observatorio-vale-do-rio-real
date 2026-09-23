import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { ENDERECOS_PUBLICOS, FRASES_PROIBIDAS, ROTAS_PUBLICAS } from "./rotas";

/**
 * Smoke de todas as rotas públicas.
 *
 * As suítes anteriores cobriam bem as rotas que tinham conteúdo e não
 * cobriam as que não tinham — o que é exatamente ao contrário do necessário,
 * porque foram as seis rotas vazias que ficaram meses servindo "esta seção
 * ainda não tem conteúdo publicado" sem que nenhum teste reclamasse.
 *
 * Aqui o contrato é o mínimo que **toda** rota pública precisa cumprir:
 * responde, tem um h1 só, tem título próprio, não se anuncia incompleta e não
 * leva a lugar nenhum que não exista. A lista está em `rotas.ts`, e rota nova
 * entra lá.
 */

for (const [rota, titulo] of ROTAS_PUBLICAS) {
  test(`${rota} responde 200, com título e h1 próprios`, async ({ page }) => {
    const resposta = await page.goto(rota);
    expect(resposta?.status(), rota).toBe(200);
    await expect(page).toHaveTitle(titulo);
    await expect(page.locator("main h1")).toHaveCount(1);
  });
}

test("as duas rotas removidas respondem 404", async ({ request }) => {
  for (const rota of ["/educacao", "/imprensa"]) {
    const resposta = await request.get(rota);
    expect(resposta.status(), rota).toBe(404);
  }
});

test("nenhuma página pública aponta para as rotas removidas", async ({
  page,
}) => {
  for (const rota of ENDERECOS_PUBLICOS) {
    await page.goto(rota);
    const destinos = await page
      .locator("a[href]")
      .evaluateAll((links) =>
        links.map((link) => link.getAttribute("href") ?? ""),
      );
    expect(
      destinos.filter((href) =>
        /^\/(educacao|imprensa)\/?(?:[?#]|$)/.test(href),
      ),
      rota,
    ).toEqual([]);
  }
});

for (const rota of ENDERECOS_PUBLICOS) {
  test(`${rota} não se anuncia incompleta`, async ({ page }) => {
    await page.goto(rota);
    const texto = await page.locator("main").innerText();
    for (const frase of FRASES_PROIBIDAS) {
      expect(texto, `${rota} contém ${frase}`).not.toMatch(frase);
    }
  });
}

/**
 * Nenhum link interno leva a 404.
 *
 * Só links internos: um link externo que caia é problema do outro site, e
 * bater nele a cada execução transformaria a suíte num monitor de
 * terceiros. O `HEAD` basta — interessa o status, não o corpo.
 */
for (const rota of ENDERECOS_PUBLICOS) {
  test(`links internos de ${rota} respondem`, async ({ page, request }) => {
    await page.goto(rota);
    const destinos = await page
      .locator("a[href^='/']")
      .evaluateAll((links) =>
        links.map((link) => link.getAttribute("href") ?? ""),
      );

    const unicos = [
      ...new Set(
        destinos
          .filter((href) => href.length > 0 && !href.startsWith("//"))
          .map((href) => href.split("#")[0] ?? "")
          .filter((href) => href.length > 0),
      ),
    ];
    expect(unicos.length, rota).toBeGreaterThan(0);

    const quebrados: string[] = [];
    for (const destino of unicos) {
      const resposta = await request.head(destino);
      if (resposta.status() >= 400) {
        quebrados.push(`${destino} → ${resposta.status()}`);
      }
    }
    expect(quebrados, rota).toEqual([]);
  });
}

/**
 * Varredura axe nas rotas institucionais desta rodada.
 *
 * As demais já têm suíte própria (`institucional`, `acervo-axe`,
 * `prestacao-axe`, `territorio-publico`, `home`). Aqui entram as seis que
 * eram stub e passaram a ter conteúdo.
 */
const ROTAS_NOVAS = ["/privacidade", "/contato", "/campo"] as const;

for (const rota of ROTAS_NOVAS) {
  for (const tema of ["light", "dark"] as const) {
    test(`axe não encontra violação em ${rota}, tema ${tema}`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme: tema });
      await page.goto(rota);
      const resultado = await new AxeBuilder({ page })
        .include("main")
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(resultado.violations).toEqual([]);
    });
  }

  for (const largura of [375, 768, 1440]) {
    test(`${rota} não transborda na horizontal em ${largura}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ height: 900, width: largura });
      await page.goto(rota);
      const transborda = await page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      );
      expect(transborda, `${rota} em ${largura}px`).toBe(false);
    });
  }

  test(`${rota} tem hierarquia de títulos sem salto`, async ({ page }) => {
    await page.goto(rota);
    const niveis = await page
      .locator("main :is(h1,h2,h3,h4,h5,h6)")
      .evaluateAll((titulos) =>
        titulos.map((titulo) => Number(titulo.tagName.slice(1))),
      );
    expect(niveis[0], rota).toBe(1);
    for (const [i, nivel] of niveis.entries()) {
      if (i === 0) continue;
      expect(
        nivel - (niveis[i - 1] ?? 0),
        `${rota} índice ${i}`,
      ).toBeLessThanOrEqual(1);
    }
  });

  test(`toda seção de ${rota} tem nome acessível`, async ({ page }) => {
    await page.goto(rota);
    const secoes = page.locator("main section");
    const total = await secoes.count();
    expect(total, rota).toBeGreaterThan(0);
    for (let i = 0; i < total; i += 1) {
      const secao = secoes.nth(i);
      const rotulo =
        (await secao.getAttribute("aria-labelledby")) ??
        (await secao.getAttribute("aria-label"));
      expect(rotulo, `${rota} seção ${i}`).toBeTruthy();
    }
  });
}

/**
 * Toda imagem servida tem alternativa textual.
 *
 * `alt=""` é resposta legítima para imagem decorativa, e por isso o teste
 * exige o **atributo**, não um texto. O que ele proíbe é a ausência, que faz
 * o leitor de tela anunciar o nome do arquivo.
 */
for (const rota of ENDERECOS_PUBLICOS) {
  test(`imagens de ${rota} declaram alternativa textual`, async ({ page }) => {
    await page.goto(rota);
    const semAlt = await page
      .locator("main img:not([alt])")
      .evaluateAll((imagens) =>
        imagens.map((img) => img.getAttribute("src") ?? "?"),
      );
    expect(semAlt, rota).toEqual([]);
  });
}
