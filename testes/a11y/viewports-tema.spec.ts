import { expect, test } from "@playwright/test";

/**
 * Viewports × temas — Fase H0.
 *
 * A fundação de tema mexe em cor de fundo, cor de texto e contorno de foco em
 * **toda** rota, sem tocar em componente nenhum. O risco correspondente é o de
 * regressão silenciosa: um papel semântico mal mapeado só aparece numa rota
 * específica, num tema específico, numa largura específica.
 *
 * Por isso a matriz é explícita — três larguras, dois temas, três rotas — e
 * cobre justamente as duas coisas que já quebraram neste projeto antes:
 * transbordo horizontal em 375 px (bloqueio do primeiro deployment) e
 * indicador de foco invisível sobre superfície escura.
 *
 * O contraste é calculado aqui, no navegador, a partir do que foi **de fato
 * pintado** — não dos tokens. É a diferença entre conferir a intenção e
 * conferir o resultado.
 */

const LARGURAS = [375, 768, 1440] as const;
const TEMAS = ["light", "dark"] as const;

const ROTAS = [
  ["/", "Home"],
  ["/prestacao-de-contas", "Prestação de Contas"],
  ["/prestacao-de-contas/imprimir", "versão imprimível"],
] as const;

/**
 * Razão de contraste entre a cor de um elemento e o primeiro plano de fundo
 * opaco acima dele, pela fórmula da WCAG. Roda dentro do navegador, sobre o
 * que foi **de fato pintado** — não sobre os tokens.
 */
function contrasteDe(
  page: import("@playwright/test").Page,
  seletor: string,
): Promise<number | null> {
  return page.evaluate((sel) => {
    const alvo = document.querySelector(sel);
    if (alvo === null) return null;

    const lin = (c: number) =>
      c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    const canais = (cor: string) => (cor.match(/[\d.]+/g) ?? []).map(Number);
    const luminancia = (c: number[]) =>
      0.2126 * lin((c[0] ?? 0) / 255) +
      0.7152 * lin((c[1] ?? 0) / 255) +
      0.0722 * lin((c[2] ?? 0) / 255);

    const frente = canais(getComputedStyle(alvo).color);

    let no: Element | null = alvo;
    let fundo: number[] | null = null;
    while (no !== null) {
      const c = canais(getComputedStyle(no).backgroundColor);
      if (c.length >= 3 && (c[3] === undefined || c[3] > 0)) {
        fundo = c;
        break;
      }
      no = no.parentElement;
    }
    if (fundo === null) {
      fundo = canais(getComputedStyle(document.body).backgroundColor);
    }

    const a = luminancia(frente);
    const b = luminancia(fundo);
    const [claro, escuro] = a > b ? [a, b] : [b, a];
    return (claro + 0.05) / (escuro + 0.05);
  }, seletor);
}

for (const tema of TEMAS) {
  test.describe(`tema ${tema}`, () => {
    for (const largura of LARGURAS) {
      for (const [rota, nome] of ROTAS) {
        test(`${nome} em ${largura}px não transborda na horizontal`, async ({
          page,
        }) => {
          await page.emulateMedia({ colorScheme: tema });
          await page.setViewportSize({ width: largura, height: 900 });
          await page.goto(rota);

          const medidas = await page.evaluate(() => ({
            documento: document.documentElement.scrollWidth,
            janela: window.innerWidth,
          }));
          expect(medidas.documento).toBeLessThanOrEqual(medidas.janela);
        });
      }
    }

    test(`o corpo de texto da Home passa AA no tema ${tema}`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme: tema });
      await page.goto("/");

      // O Hero tem medição própria sobre o pixel composto da fotografia.
      // Aqui continua valendo o propósito original: texto corrido sobre a
      // superfície semântica da página, abaixo da primeira dobra.
      const razao = await contrasteDe(page, "#hl-territorio .hl-texto p");
      expect(razao).not.toBeNull();
      expect(razao as number).toBeGreaterThanOrEqual(4.5);
    });

    test(`o metadado de ficha passa AA no tema ${tema}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: tema });
      await page.goto("/");

      const razao = await contrasteDe(page, ".meta-ficha");
      expect(razao).not.toBeNull();
      expect(razao as number).toBeGreaterThanOrEqual(4.5);
    });

    test(`o texto do cabeçalho passa AA no tema ${tema}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: tema });
      await page.goto("/");

      const razao = await contrasteDe(page, "header a");
      expect(razao).not.toBeNull();
      expect(razao as number).toBeGreaterThanOrEqual(4.5);
    });

    /**
     * O link de pular é o primeiro elemento focável de toda página e só
     * aparece ao receber foco. Se ele ficar ilegível num tema, quem navega por
     * teclado perde a porta de entrada do site.
     */
    test(`o link de pular fica legível ao receber foco no tema ${tema}`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme: tema });
      await page.goto("/");
      await page.keyboard.press("Tab");

      const pular = page.locator(".pular-conteudo");
      await expect(pular).toBeFocused();
      await expect(pular).toBeInViewport();

      const razao = await contrasteDe(page, ".pular-conteudo");
      expect(razao as number).toBeGreaterThanOrEqual(4.5);
    });

    /**
     * WCAG 2.2 — 2.4.13: o indicador de foco precisa ser perceptível. O
     * projeto usa contorno de 3px com deslocamento, e a cor troca por tema
     * justamente para não sumir sobre a superfície noturna.
     */
    test(`o contorno de foco tem 3px em ${tema}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: tema });
      await page.goto("/");
      await page.keyboard.press("Tab");

      const contorno = await page.evaluate(() => {
        const alvo = document.activeElement;
        if (alvo === null) return null;
        const e = getComputedStyle(alvo);
        return {
          largura: e.outlineWidth,
          estilo: e.outlineStyle,
          deslocamento: e.outlineOffset,
        };
      });

      expect(contorno?.largura).toBe("3px");
      expect(contorno?.estilo).toBe("solid");
      expect(contorno?.deslocamento).toBe("2px");
    });
  });
}

/**
 * Zoom de 200% é o cenário da WCAG 1.4.4, e 320 px de largura é o da 1.4.10
 * — que é justamente 1280 px com 400% de zoom. O teste antigo da Home usava
 * 360 px; aqui a régua é a da norma.
 */
test.describe("larguras extremas", () => {
  for (const tema of TEMAS) {
    test(`a Home cabe em 320px no tema ${tema}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: tema });
      await page.setViewportSize({ width: 320, height: 900 });
      await page.goto("/");

      const medidas = await page.evaluate(() => ({
        documento: document.documentElement.scrollWidth,
        janela: window.innerWidth,
      }));
      expect(medidas.documento).toBeLessThanOrEqual(medidas.janela);
    });
  }
});
