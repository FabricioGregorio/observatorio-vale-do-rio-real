import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { ENDERECOS_PUBLICOS } from "./rotas";

/**
 * O rodapé, nas páginas servidas.
 *
 * Os testes unitários garantem que o manifesto e a régua respeitam os
 * manuais. Estes garantem o resto: que o rodapé **chega** em toda rota
 * pública, que as marcas de fato carregam, que elas não são exibidas fora da
 * medida que os manuais permitem e que nada disso quebra no telefone.
 *
 * A medida é verificada no navegador, e não só no manifesto, porque é o CSS
 * que pode desfazê-la — um `width: auto` fez a marca sair com o dobro do
 * tamanho de exibição antes de este arquivo existir.
 */

/** Manual do Governo Federal: redução máxima em meios eletrônicos. */
const LARGURA_MINIMA_FEDERAL = 200;

/** Onde o rodapé não aparece: a folha de impressão o esconde de propósito. */
const SEM_RODAPE = "/prestacao-de-contas/imprimir";

const COM_RODAPE = ENDERECOS_PUBLICOS.filter((rota) => rota !== SEM_RODAPE);

for (const largura of [375, 768, 1440]) {
  test(`navegação institucional íntegra em ${largura}px`, async ({ page }) => {
    await page.setViewportSize({ width: largura, height: 900 });
    await page.goto("/");
    const rodape = page.locator("body > footer");
    const institucional = rodape.getByRole("navigation", {
      name: "Páginas institucionais",
    });
    await expect(institucional.getByRole("link")).toHaveText([
      "Acessibilidade",
      "Privacidade",
      "Contato",
    ]);
    expect(
      await institucional.evaluate(
        (elemento) =>
          elemento.getBoundingClientRect().right <= window.innerWidth + 1,
      ),
    ).toBe(true);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1,
      ),
    ).toBe(true);
  });
}

for (const rota of COM_RODAPE) {
  test(`${rota} serve o rodapé completo`, async ({ page }) => {
    await page.goto(rota);
    const rodape = page.locator("body > footer");
    await expect(rodape).toHaveCount(1);
    await expect(rodape).toBeVisible();

    // Identidade, navegação e créditos: as três regiões nomeadas.
    await expect(
      rodape.getByRole("navigation", { name: "Seções do site" }),
    ).toBeVisible();
    await expect(
      rodape.getByRole("navigation", { name: "Páginas institucionais" }),
    ).toBeVisible();
    await expect(rodape.locator("#creditos-fomento")).toBeVisible();
  });
}

/*
  A versão imprimível é a exceção declarada: a folha de impressão esconde
  cabeçalho e rodapé. Na tela o elemento existe; o que se afirma aqui é que a
  regra de impressão continua alcançando-o.
*/
test("a versão imprimível esconde o rodapé no papel", async ({ page }) => {
  await page.goto(SEM_RODAPE);
  await page.emulateMedia({ media: "print" });
  await expect(page.locator("body > footer")).toBeHidden();
});

test.describe("as marcas institucionais na tela", () => {
  /*
    As marcas carregam com `loading="lazy"` — elas ficam no fim de toda página,
    muito abaixo da primeira dobra, e é isso que mantém o orçamento da Home
    intacto. Então não basta rolar até lá: é preciso esperar as cinco
    decodificarem, ou a asserção corre contra uma imagem ainda em voo.
  */
  test.beforeEach(async ({ page }) => {
    await page.goto("/observatorio");
    await page.locator("body > footer").scrollIntoViewIfNeeded();
    await expect
      .poll(
        () =>
          page
            .locator(".regua__marca")
            .evaluateAll(
              (imagens) =>
                imagens.filter(
                  (img) =>
                    (img as HTMLImageElement).complete &&
                    (img as HTMLImageElement).naturalWidth > 0,
                ).length,
            ),
        { timeout: 10_000 },
      )
      .toBe(5);
  });

  test("as cinco marcas carregam de fato", async ({ page }) => {
    const marcas = page.locator(".regua__marca");
    await expect(marcas).toHaveCount(5);

    const quebradas = await marcas.evaluateAll((imagens) =>
      imagens
        .filter((img) => {
          const imagem = img as HTMLImageElement;
          return !imagem.complete || imagem.naturalWidth === 0;
        })
        .map((img) => img.getAttribute("src") ?? "?"),
    );
    expect(quebradas).toEqual([]);
  });

  /**
   * Nenhuma marca é exibida fora da proporção do arquivo. Distorcer é a
   * proibição que os três manuais repetem, e é o que um `width` e um `height`
   * mal casados produzem.
   */
  test("nenhuma marca é exibida distorcida", async ({ page }) => {
    const desvios = await page.locator(".regua__marca").evaluateAll((imagens) =>
      imagens
        .map((img) => {
          const imagem = img as HTMLImageElement;
          const exibida = imagem.clientWidth / imagem.clientHeight;
          const natural = imagem.naturalWidth / imagem.naturalHeight;
          return {
            src: imagem.getAttribute("src") ?? "?",
            desvio: Math.abs(exibida - natural) / natural,
          };
        })
        .filter((item) => item.desvio > 0.02),
    );
    expect(desvios).toEqual([]);
  });

  test("a marca federal respeita o limite de redução eletrônica", async ({
    page,
  }) => {
    const largura = await page
      .locator('.regua__marca[src*="minc-governo-federal"]')
      .evaluate((img) => (img as HTMLImageElement).clientWidth);
    expect(largura).toBeGreaterThanOrEqual(LARGURA_MINIMA_FEDERAL);
  });

  /**
   * Manual PNAB: nenhuma marca do bloco ultrapassa a altura ou a largura da
   * marca nominativa do Governo Federal. Verificado como o avaliador veria,
   * em pixels de tela.
   */
  test("nenhuma marca ultrapassa a federal na tela", async ({ page }) => {
    const medidas = await page.locator(".regua__marca").evaluateAll((imagens) =>
      imagens.map((img) => {
        const imagem = img as HTMLImageElement;
        return {
          src: imagem.getAttribute("src") ?? "?",
          largura: imagem.clientWidth,
          altura: imagem.clientHeight,
        };
      }),
    );
    const federal = medidas.find((m) => m.src.includes("minc-governo-federal"));
    expect(federal).toBeDefined();
    for (const marca of medidas) {
      expect(marca.largura, marca.src).toBeLessThanOrEqual(
        federal?.largura ?? 0,
      );
      expect(marca.altura, marca.src).toBeLessThanOrEqual(federal?.altura ?? 0);
    }
  });

  test("as marcas preservam nomes acessíveis sem lista visual redundante", async ({
    page,
  }) => {
    await expect(page.locator(".regua__instituicoes")).toHaveCount(0);
    await expect(page.locator('.regua__marca[alt=""]')).toHaveCount(0);
    await expect(
      page.getByAltText(
        "Secretaria Especial da Cultura · Governo do Estado de Sergipe",
      ),
    ).toHaveCount(1);
    await expect(
      page.getByAltText("Ministério da Cultura · Governo do Brasil"),
    ).toHaveCount(1);
  });

  test("desktop distribui Apoio e Realização na mesma linha", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 900, width: 1440 });
    const niveis = await page.locator(".regua__nivel").evaluateAll((itens) =>
      itens.map((item) => {
        const caixa = item.getBoundingClientRect();
        return { esquerda: caixa.left, topo: caixa.top };
      }),
    );
    expect(niveis).toHaveLength(2);
    expect(
      Math.abs((niveis[0]?.topo ?? 0) - (niveis[1]?.topo ?? 0)),
    ).toBeLessThan(1);
    expect(niveis[1]?.esquerda ?? 0).toBeGreaterThan(niveis[0]?.esquerda ?? 0);
  });

  test("mobile empilha as assinaturas na ordem institucional", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 900, width: 375 });
    await page.reload();
    await page.locator("body > footer").scrollIntoViewIfNeeded();
    const marcas = await page.locator(".regua__marca").evaluateAll((imagens) =>
      imagens.map((imagem) => {
        const caixa = imagem.getBoundingClientRect();
        return {
          src: imagem.getAttribute("src") ?? "?",
          topo: caixa.top,
          base: caixa.bottom,
        };
      }),
    );
    expect(marcas.map((marca) => marca.src)).toEqual([
      "/media/marcas/funcap.webp",
      "/media/marcas/secretaria-especial-governo-sergipe.webp",
      "/media/marcas/sistema-nacional-de-cultura.webp",
      "/media/marcas/pnab.webp",
      "/media/marcas/minc-governo-federal.webp",
    ]);
    for (let indice = 1; indice < marcas.length; indice += 1) {
      expect(marcas[indice]?.topo ?? 0).toBeGreaterThan(
        marcas[indice - 1]?.base ?? 0,
      );
    }
  });

  test("a frase obrigatória permanece separada por filete", async ({
    page,
  }) => {
    const assinatura = page.locator(".regua__assinatura");
    await expect(assinatura).toContainText(
      "Este projeto foi contemplado nos Editais da Política Nacional Aldir Blanc Sergipe",
    );
    expect(
      await assinatura.evaluate((elemento) =>
        Number.parseFloat(getComputedStyle(elemento).borderTopWidth),
      ),
    ).toBeGreaterThan(0);
  });
});

for (const largura of [375, 768, 1440]) {
  test(`o rodapé não transborda em ${largura}px`, async ({ page }) => {
    await page.setViewportSize({ height: 900, width: largura });
    await page.goto("/observatorio");
    const transborda = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    );
    expect(transborda).toBe(false);

    // A marca federal continua acima do limite mesmo na tela estreita.
    const larguraFederal = await page
      .locator('.regua__marca[src*="minc-governo-federal"]')
      .evaluate((img) => (img as HTMLImageElement).clientWidth);
    expect(larguraFederal).toBeGreaterThanOrEqual(LARGURA_MINIMA_FEDERAL);
  });
}

for (const tema of ["light", "dark"] as const) {
  test(`axe não encontra violação no rodapé, tema ${tema}`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: tema });
    await page.goto("/observatorio");
    const resultado = await new AxeBuilder({ page })
      .include("body > footer")
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(resultado.violations).toEqual([]);
  });

  /**
   * O painel das marcas é branco nos dois temas — é a aplicação em box branco
   * do manual federal. O texto dentro dele precisa continuar legível quando a
   * página está escura, e foi exatamente isso que quebrou antes: a tinta
   * seguia o tema e sumia no branco.
   */
  test(`o texto do painel de marcas passa AA no tema ${tema}`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: tema });
    await page.goto("/observatorio");

    const razao = await page
      .locator("body > footer .regua__assinatura")
      .evaluate((elemento) => {
        const canais = (cor: string): number[] =>
          (cor.match(/[\d.]+/g) ?? []).map(Number);
        const luminancia = (cor: string): number => {
          const [r = 0, g = 0, b = 0] = canais(cor).map((valor) => {
            const canal = valor / 255;
            return canal <= 0.03928
              ? canal / 12.92
              : ((canal + 0.055) / 1.055) ** 2.4;
          });
          return 0.2126 * r + 0.7152 * g + 0.0722 * b;
        };

        let ancestral: Element | null = elemento;
        let fundo = "rgb(255,255,255)";
        while (ancestral !== null) {
          const candidato = getComputedStyle(ancestral).backgroundColor;
          const valores = canais(candidato);
          if (
            valores.length >= 3 &&
            (valores[3] === undefined || valores[3] > 0)
          ) {
            fundo = candidato;
            break;
          }
          ancestral = ancestral.parentElement;
        }

        const [claro, escuro] = [
          luminancia(getComputedStyle(elemento).color),
          luminancia(fundo),
        ].sort((a, b) => b - a);
        return ((claro ?? 0) + 0.05) / ((escuro ?? 0) + 0.05);
      });

    expect(razao).toBeGreaterThanOrEqual(4.5);
  });
}
