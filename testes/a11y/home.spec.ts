import { expect, test } from "@playwright/test";

/**
 * Home do Observatório — a página inicial, em `/`.
 *
 * Desde a consolidação de 2026-09-17 existe uma Home só, e esta suíte é a
 * única que a cobre renderizada. Ela protege duas ordens de contrato: os que
 * valem para qualquer composição servida em `/` — um `h1`, landmarks,
 * navegação, teclado, movimento reduzido, funcionamento sem JavaScript,
 * privacidade e ausência de material interno no conteúdo público — e os que
 * são desta composição: a abertura aprovada, os sete capítulos e os grafismos
 * territoriais.
 *
 * O mapa territorial tem suíte própria em `mapa.spec.ts`.
 */

const NOME_OFICIAL =
  "Observatório de Cultura e Economia Criativa da Região do Vale do Rio Real";

const CAPITULOS = [
  "hl-origem",
  // II · PodObservar entrou na P0.3, entre Origem e Território.
  "hl-podobservar",
  "hl-territorio",
  "hl-lugares",
  "hl-leitura",
  "hl-escuta",
  "hl-produtos",
  "hl-conferencia",
];

test.describe("Home", () => {
  test("tem um único h1 com o nome oficial", async ({ page }) => {
    await page.goto("/");
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toHaveCount(1);
    await expect(h1).toHaveText(NOME_OFICIAL);
  });

  test("serve a abertura B2 aprovada, com a identificação documental da fotografia", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator('[data-abertura="b2"]')).toHaveCount(1);
    await expect(
      page.locator(".ab-b2__legenda").getByText("Recanto da Serra"),
    ).toBeVisible();
    await expect(page.locator(".ab-b2__legenda")).toContainText("05/04/2026");
  });

  test("os grafismos territoriais são discretos, decorativos e não interativos", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page.locator('[data-grafismo-topografia="true"]')).toHaveCount(
      0,
    );
    const grafismos = page.locator("[data-grafismo-territorial]");
    await expect(grafismos).toHaveCount(2);

    const estilos = await grafismos.evaluateAll((elementos) =>
      elementos.map((elemento) => {
        const estilo = getComputedStyle(elemento);
        return {
          oculto: elemento.getAttribute("aria-hidden"),
          focavel: elemento.getAttribute("focusable"),
          opacidade: Number(estilo.opacity),
          eventos: estilo.pointerEvents,
        };
      }),
    );
    for (const estilo of estilos) {
      expect(estilo.oculto).toBe("true");
      expect(estilo.focavel).toBe("false");
      expect(estilo.eventos).toBe("none");
      expect(estilo.opacidade).toBeGreaterThan(0);
      expect(estilo.opacidade).toBeLessThanOrEqual(0.16);
    }
  });

  test("mantém os oito capítulos na ordem narrativa aprovada", async ({
    page,
  }) => {
    await page.goto("/");
    const ids = await page
      .locator("section.hl-capitulo")
      .evaluateAll((secoes) => secoes.map((s) => s.id));
    expect(ids).toEqual(CAPITULOS);
  });

  test("declara os landmarks de navegação e conteúdo", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    await expect(page.locator("#cabecalho-home")).toHaveCount(1);
    await expect(
      page.getByRole("navigation", { name: "Principal", exact: true }),
    ).toBeVisible();
    await expect(page.locator("main#conteudo")).toHaveCount(1);
  });

  test("marca a Home como rota ativa na navbar", async ({ page }) => {
    await page.goto("/");
    const marca = page.locator("#cabecalho-home .hl-topo__marca");
    await expect(marca).toHaveAttribute("aria-current", "page");
    await expect(marca.locator("span")).toHaveCSS("color", "rgb(42, 157, 150)");
  });

  test("o cabeçalho separa quatro destinos principais e três conteúdos", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    const nav = page.getByRole("navigation", {
      name: "Principal",
      exact: true,
    });
    for (const destino of [
      "/observatorio",
      "/pesquisa",
      "/territorio",
      "/dados",
    ]) {
      await expect(nav.locator(`a[href="${destino}"]`)).toHaveCount(1);
    }
    await expect(nav.getByRole("link")).toHaveCount(4);
    await nav.getByRole("button", { name: /Conteúdos/ }).click();
    for (const destino of ["/campo", "/podobservar", "/acervo"]) {
      await expect(nav.locator(`a[href="${destino}"]`)).toHaveCount(1);
    }
    await expect(nav.locator('a[href="/educacao"]')).toHaveCount(0);
  });

  test("leva à Sala do Avaliador pela ação institucional do cabeçalho", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const prestacao = page
      .locator("#cabecalho-home")
      .getByRole("link", { name: /Prestação de contas/ });
    await expect(prestacao).toBeVisible();
    await Promise.all([
      page.waitForURL((url) => url.pathname === "/prestacao-de-contas"),
      prestacao.click(),
    ]);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("usa o ícone oficial escolhido e não a assinatura anterior", async ({
    page,
  }) => {
    await page.goto("/");
    const cabecalho = page.locator("#cabecalho-home");
    await expect(
      cabecalho.locator('img[src$="observatorio-icone-oficial-96.webp"]'),
    ).toHaveCount(1);
    await expect(
      cabecalho.locator('img[src$="observatorio-monocromatica-escura.svg"]'),
    ).toHaveCount(0);
  });

  test("links e utilidades têm hover e foco perceptíveis", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const cabecalho = page.locator("#cabecalho-home");
    const link = cabecalho.getByRole("link", { name: "O Observatório" });
    const acessibilidade = cabecalho.getByRole("button", {
      name: "Acessibilidade",
    });
    const prestacao = cabecalho.getByRole("link", {
      name: /Prestação de contas/,
    });

    const corInicial = await acessibilidade.evaluate(
      (elemento) => getComputedStyle(elemento).backgroundColor,
    );
    await acessibilidade.hover();
    await page.waitForTimeout(200);
    expect(
      await acessibilidade.evaluate(
        (elemento) => getComputedStyle(elemento).backgroundColor,
      ),
    ).not.toBe(corInicial);

    await prestacao.hover();
    await expect(prestacao).toBeVisible();

    await link.focus();
    expect(
      await link.evaluate(
        (elemento) => getComputedStyle(elemento).outlineStyle,
      ),
    ).not.toBe("none");
    await acessibilidade.focus();
    expect(
      await acessibilidade.evaluate(
        (elemento) => getComputedStyle(elemento).outlineStyle,
      ),
    ).not.toBe("none");
  });

  test("menu compacto mantém contraste, navegação e retorno de foco", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    const menu = page.getByRole("button", { name: "Menu", exact: true });

    await expect(menu).toBeVisible();
    expect(
      await menu.evaluate((elemento) => getComputedStyle(elemento).color),
    ).toBe("rgb(231, 229, 222)");

    await menu.click();
    /*
      Escopado ao menu compacto. Desde que o rodapé global passou a servir as
      mesmas seções, "Acervo" existe duas vezes na página — e o que este teste
      afirma é sobre o menu que acabou de abrir, não sobre o rodapé.
    */
    await expect(
      page
        .getByRole("navigation", { name: "Principal (telas estreitas)" })
        .getByRole("link", { name: "Acervo", exact: true }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(menu).toBeFocused();
  });

  test("a Central de Acessibilidade funciona e devolve o foco", async ({
    page,
  }) => {
    await page.goto("/");
    const gatilho = page.getByRole("button", { name: "Acessibilidade" });
    await gatilho.click();

    const painel = page.getByRole("dialog", { name: "Acessibilidade" });
    await expect(painel).toBeVisible();
    await page.getByRole("button", { name: "Escuro" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-tema", "escuro");

    await page.keyboard.press("Escape");
    await expect(painel).toBeHidden();
    await expect(gatilho).toBeFocused();
  });

  test("a Central de Acessibilidade fecha ao clicar fora", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Acessibilidade" }).click();
    const painel = page.getByRole("dialog", { name: "Acessibilidade" });
    await expect(painel).toBeVisible();
    await page.locator("h1").click();
    await expect(painel).toBeHidden();
  });

  test("o CTA principal é alcançável por teclado e tem foco visível", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");

    let alcancou = false;
    for (let i = 0; i < 30 && !alcancou; i++) {
      await page.keyboard.press("Tab");
      alcancou = await page.evaluate(() =>
        /Conhecer a pesquisa/.test(document.activeElement?.textContent ?? ""),
      );
    }
    expect(alcancou).toBe(true);

    const contorno = await page.evaluate(
      () => getComputedStyle(document.activeElement as Element).outlineStyle,
    );
    expect(contorno).not.toBe("none");
  });

  test("aponta o acervo legível por máquina", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('a[href="/anexos.json"]')).toHaveCount(1);
  });

  test("a Home não carrega grafismo figurativo", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('img[src*="/media/grafismos/"]')).toHaveCount(0);
  });

  /*
    Os dois desdobramentos do campo, Serra antes de Ilha, com a mesma forma:
    três fotografias cada. As de Ilha Grande são de 11/04/2026; as da Serra
    trazem a data de cada visita (EXIF confirmado pelo calendário do doc 02).
    Nenhuma legenda diz "data não informada".
  */
  test("mostra Serra dos Macacos e depois Ilha Grande, três fotografias cada", async ({
    page,
  }) => {
    await page.goto("/");
    const titulos = page.locator("#hl-escuta h3", {
      hasText: /^Também em campo:/,
    });
    await expect(titulos).toHaveText([
      "Também em campo: Serra dos Macacos",
      "Também em campo: Ilha Grande",
    ]);

    const serra = page.locator('.hl-ilha[data-lugar="serra-dos-macacos"]');
    const ilha = page.locator('.hl-ilha[data-lugar="ilha-grande"]');
    for (const bloco of [serra, ilha]) {
      const imagens = bloco.locator("img");
      await expect(imagens).toHaveCount(3);
      for (const imagem of await imagens.all()) {
        await expect(imagem).toHaveAttribute("loading", "lazy");
        await expect(imagem).toHaveAttribute("sizes", /.+/);
        await expect(imagem).toHaveAttribute("alt", /\S{3,}/);
        await expect(imagem).not.toHaveAttribute("alt", /\.webp|imagem de/i);
      }
      // Três legendas diferentes: nenhuma repete o nome do lugar.
      const legendas = await bloco.locator("figcaption strong").allInnerTexts();
      expect(new Set(legendas).size).toBe(3);
    }
    await expect(serra.locator("img").first()).toHaveAttribute(
      "alt",
      /ponte de madeira/,
    );

    await expect(ilha.locator(".meta-ficha")).toHaveText([
      "11/04/2026",
      "11/04/2026",
      "11/04/2026",
    ]);
    await expect(serra.locator(".meta-ficha")).toHaveText([
      "02/08/2025",
      "05/04/2026",
      "05/04/2026",
    ]);
    await expect(page.locator("main")).not.toContainText("data não informada");
  });

  /* As seis fotografias existem de fato: nenhuma referência quebrada. */
  test("as fotografias dos dois blocos carregam", async ({ page }) => {
    await page.goto("/");
    const imagens = page.locator(".hl-ilha img");
    await expect(imagens).toHaveCount(6);
    for (const imagem of await imagens.all()) {
      await imagem.scrollIntoViewIfNeeded();
      await expect
        .poll(() =>
          imagem.evaluate((el) => (el as HTMLImageElement).naturalWidth),
        )
        .toBeGreaterThan(0);
    }
  });
});

/**
 * Estes são os contratos que a promoção não podia afrouxar. Valem para
 * qualquer composição servida em `/`, e caíram fora da suíte da Home antiga
 * apenas porque ela deixou de ser a Home — não porque deixaram de valer.
 */
test.describe("Home — o que não pode ser publicado", () => {
  test("não compara município nem publica indicador reservado", async ({
    page,
  }) => {
    await page.goto("/");
    const conteudo = (await page.locator("main").innerText()).toLowerCase();

    expect(conteudo).not.toContain("habitantes");
    expect(conteudo).not.toContain("população");
    expect(conteudo).not.toContain("comparativo");
    expect(conteudo).not.toContain("ranking");
    expect(conteudo).not.toContain("valor movimentado por dia");
    expect(conteudo).not.toContain("registros de operação");
  });

  /**
   * A03 e A04 continuam fora do lote público e B01 continua restrito como
   * conjunto. O identificador, o título interno e o caminho do arquivo não
   * podem aparecer no HTML servido.
   */
  test("não expõe conjunto restrito nem relatório fora do lote público", async ({
    page,
  }) => {
    await page.goto("/");
    const html = await page.content();

    expect(html).not.toMatch(/\bB01\b/);
    expect(html).not.toMatch(/\bA0[34]\b/);
    expect(html).not.toContain("fotografias de comprovação");
    expect(html).not.toContain("relatorio-tecnico-serra-dos-macacos");
  });

  /**
   * Os blocos de fontes do experimento citam caminho de repositório, código de
   * fase, documento interno e instrução de trabalho. São instrumento do
   * laboratório: em `publico` não são renderizados — e "não renderizados"
   * quer dizer fora da árvore, não escondidos.
   */
  test("nenhum material interno de desenvolvimento chega ao público", async ({
    page,
  }) => {
    await page.goto("/");
    /*
      O texto lido, e não `page.content()`: em desenvolvimento o Next injeta
      caminhos de origem no payload de hidratação, que não são conteúdo da
      página. O que precisa estar limpo é o que a pessoa lê.
    */
    const lido = await page.evaluate(() => document.body.innerText);

    for (const vestigio of [
      "Fontes desta seção",
      "experimento",
      "somente DEV",
      "Preset",
      "Não publicar",
      "AGENTS.md",
      "src/dados",
      "src/app",
      "docs/01",
      "handoff",
      "ESTADO_ATUAL",
      "AUDITORIA_FONTES",
      "MAPA_FONTES",
    ]) {
      expect(lido, vestigio).not.toContain(vestigio);
    }
    expect(lido).not.toMatch(/C:\\Users/);
  });

  test("não oferece rota de desenvolvimento ao visitante", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('a[href^="/dev/"]')).toHaveCount(0);
  });
});

test.describe("Home — apresentação", () => {
  for (const largura of [375, 1440]) {
    test(`faixa de números após Origem, com disposição responsiva em ${largura}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: largura, height: 900 });
      await page.goto("/");
      /*
        A faixa continua entre a abertura narrativa e o Território, mas deixou
        de ser irmã imediata de Origem: a P0.3 pôs a seção do PodObservar
        entre as duas. O contrato que importa é a ordem, não a adjacência —
        por isso a asserção passou a comparar posições.
      */
      await expect(
        page.locator("#hl-podobservar + #hl-numeros + #hl-territorio"),
      ).toHaveCount(1);
      await expect(page.locator(".ab-b2__lado")).toHaveCount(0);
      const faixa = page.locator("#hl-numeros");
      await expect(faixa.locator("strong")).toHaveText(["2", "8", "5"]);
      /*
        O rótulo entra no contrato junto com o número. Os três valores são 2, 8
        e 5, e o terceiro já foi "5 municípios no recorte do Vale" — trocar o
        significado sem trocar o dígito não quebraria uma asserção só de
        números. Desde 2026-09-17 o terceiro indicador é a duração da coleta.
      */
      await expect(faixa.locator("li span")).toHaveText([
        "equipamentos culturais acompanhados em Tobias Barreto",
        "entrevistas gravadas",
        "meses de coleta de dados",
      ]);
      expect(
        await faixa.evaluate((e) => getComputedStyle(e).backgroundColor),
      ).toBe("rgba(0, 0, 0, 0)");
      const itens = await faixa.locator("li").evaluateAll((elementos) =>
        elementos.map((e) => ({
          x: e.getBoundingClientRect().x,
          y: e.getBoundingClientRect().y,
        })),
      );
      if (!itens[0] || !itens[1]) throw new Error("Indicadores ausentes");
      if (largura < 768) {
        expect(itens[1].x).toBe(itens[0].x);
        expect(itens[1].y).toBeGreaterThan(itens[0].y);
      } else {
        expect(itens[1].y).toBe(itens[0].y);
        expect(itens[1].x).toBeGreaterThan(itens[0].x);
      }
    });
  }

  /**
   * O recorte saiu da faixa de números, não do site. Ele é cartografia, não
   * estatística de execução, e continua dito onde significa alguma coisa: na
   * nota do mapa e no catálogo de produtos. Este teste existe para que a
   * remoção da faixa não vire, em silêncio, a remoção da informação.
   */
  test("o recorte do Vale continua apresentado fora da faixa de números", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page.locator("#hl-numeros")).not.toContainText(
      "recorte do Vale",
    );
    // Nota cartográfica, sob o mapa.
    await expect(page.locator("#hl-territorio figcaption")).toContainText(
      "municípios no recorte do Vale",
    );
    // Catálogo de produtos, capítulo VII.
    await expect(
      page.locator("#hl-produtos .hl-catalogo li", {
        hasText: "Cartografia do recorte",
      }),
    ).toContainText("municípios no recorte do Vale");
  });

  for (const largura of [375, 1440]) {
    test(`Hero ocupa a tela e a próxima seção começa abaixo em ${largura}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: largura, height: 900 });
      await page.goto("/");
      const hero = await page.locator(".ab-b2").boundingBox();
      const proxima = await page.locator("#hl-origem").boundingBox();
      expect(hero?.y).toBe(0);
      expect(hero?.height).toBe(900);
      expect(proxima?.y).toBe(900);
      const painel = await page.locator(".ab-b2__folha").boundingBox();
      const legenda = await page.locator(".ab-b2__legenda").boundingBox();
      expect((painel?.y ?? 0) + (painel?.height ?? 0)).toBeLessThan(
        legenda?.y ?? 0,
      );
    });
  }

  for (const largura of [375, 1440]) {
    test(`navbar translúcida sobre a foto e fixa ao rolar em ${largura}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: largura, height: 900 });
      await page.goto("/");
      const topo = page.locator("#cabecalho-home");
      const foto = await page.locator(".ab-b2__foto").boundingBox();
      const cabecalho = await topo.boundingBox();
      expect(foto?.y).toBe(0);
      expect(cabecalho?.y).toBe(0);
      const fundo = await topo.evaluate(
        (elemento) => getComputedStyle(elemento).backgroundColor,
      );
      expect(fundo).toMatch(/^rgba\(.+, 0\.82\)$/);
      await page.getByRole("link", { name: "Conhecer a pesquisa" }).click();
      await expect(topo).toBeInViewport();
      expect((await topo.boundingBox())?.y).toBe(0);
      const destino = await page.locator("#hl-lugares").boundingBox();
      expect(destino?.y).toBeGreaterThanOrEqual(cabecalho?.height ?? 0);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      expect((await topo.boundingBox())?.y).toBe(0);
    });
  }

  test("menu aberto ocupa a largura do celular sem comprimir a marca", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 812 });
    await page.goto("/");
    const marca = page.locator(".hl-topo__marca");
    const antes = await marca.boundingBox();
    await page.getByRole("button", { name: "Menu", exact: true }).click();
    const depois = await marca.boundingBox();
    expect(depois?.width).toBe(antes?.width);
    const painel = page.locator('.hl-topo__nav-estreita [tabindex="-1"]');
    const quadro = await painel.boundingBox();
    expect(quadro?.width).toBeGreaterThan(280);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(320);
    await expect(painel.getByRole("link", { name: "Acervo" })).toBeVisible();
  });

  for (const largura of [320, 375, 768, 1024, 1280, 1440]) {
    for (const tema of ["light", "dark"] as const) {
      test(`${largura}px no tema ${tema} não transborda nem perde alt`, async ({
        page,
      }) => {
        await page.emulateMedia({ colorScheme: tema });
        await page.setViewportSize({ width: largura, height: 900 });
        await page.goto("/");

        const medidas = await page.evaluate(() => {
          const foto =
            document.querySelector<HTMLImageElement>(".ab-b2__foto img");
          const hero = document.querySelector<HTMLElement>(".ab-b2");
          const folha = document.querySelector<HTMLElement>(".ab-b2__folha");
          const legenda =
            document.querySelector<HTMLElement>(".ab-b2__legenda");
          const imagem = document.querySelector<HTMLElement>(
            ".ab-b2__foto picture",
          );
          if (!foto || !hero || !folha || !legenda || !imagem)
            throw new Error("Abertura B2 incompleta");
          const quadro = foto.getBoundingClientRect();
          const abertura = hero.getBoundingClientRect();
          return {
            rolagem: document.documentElement.scrollWidth,
            janela: window.innerWidth,
            semAlt: [...document.images].filter((i) => !i.hasAttribute("alt"))
              .length,
            foto: {
              esquerda: quadro.left,
              direita: quadro.right,
              topo: quadro.top,
              base: quadro.bottom,
            },
            hero: { topo: abertura.top, base: abertura.bottom },
            folha: folha.getBoundingClientRect().top,
            legenda: legenda.getBoundingClientRect().bottom,
            recorte: getComputedStyle(foto).clipPath,
            overlay: getComputedStyle(imagem, "::after").backgroundImage,
          };
        });
        expect(medidas.rolagem).toBeLessThanOrEqual(medidas.janela);
        expect(medidas.semAlt).toBe(0);
        expect(medidas.foto.esquerda).toBe(0);
        expect(medidas.foto.direita).toBe(largura);
        expect(medidas.foto.topo).toBe(medidas.hero.topo);
        expect(medidas.foto.base).toBe(medidas.hero.base);
        expect(medidas.recorte).toBe("none");
        expect(medidas.overlay).toContain("linear-gradient");
        expect(medidas.folha).toBeGreaterThan(medidas.foto.topo);
        expect(medidas.folha).toBeLessThan(medidas.foto.base);
        expect(medidas.legenda).toBeLessThanOrEqual(medidas.foto.base);
      });
    }
  }

  test("equivalente a zoom 200% mantém título e navegação utilizáveis", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 720, height: 450 });
    await page.goto("/");

    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      ),
    ).toBe(false);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Menu", exact: true }),
    ).toBeVisible();
  });

  test("com movimento reduzido nada anima e nada some", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    const animado = await page.evaluate(() =>
      [...document.querySelectorAll("#home *")]
        .map((e) => getComputedStyle(e))
        .some(
          (s) => s.animationName !== "none" && s.animationDuration !== "0s",
        ),
    );
    expect(animado).toBe(false);

    const ids = await page
      .locator("section.hl-capitulo")
      .evaluateAll((secoes) => secoes.map((s) => s.id));
    expect(ids).toHaveLength(CAPITULOS.length);
  });
});

/**
 * A ilha do mapa **acrescenta** exploração; ela não é condição de leitura.
 * Sem JavaScript a Home precisa continuar inteira e honesta.
 */
test.describe("Home sem JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("os oito capítulos e o título continuam servidos", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      NOME_OFICIAL,
    );
    const ids = await page
      .locator("section.hl-capitulo")
      .evaluateAll((secoes) => secoes.map((s) => s.id));
    expect(ids).toEqual(CAPITULOS);
  });

  test("a leitura quantitativa continua completa", async ({ page }) => {
    await page.goto("/");
    const leitura = page.locator("#hl-leitura");

    await expect(
      leitura.getByRole("heading", { name: "Onde o recurso circula" }),
    ).toBeVisible();
    await expect(leitura).toContainText("Retenção municipal da despesa");
  });

  test("a navegação principal continua alcançável", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const nav = page.getByRole("navigation", {
      name: "Principal",
      exact: true,
    });
    await expect(nav.getByRole("link")).toHaveCount(7);
  });
});
