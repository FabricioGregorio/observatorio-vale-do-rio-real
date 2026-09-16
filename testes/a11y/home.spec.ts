import { expect, test } from "@playwright/test";

/**
 * Home estrutural — Tarefa 10A.
 *
 * Cobre a estrutura entregue e, principalmente, o que a fatia decidiu NÃO
 * entregar: nenhuma apresentação institucional, nenhum comparativo municipal e
 * nenhum número de indicador. Um teste que só verificasse presença deixaria
 * passar exatamente o erro que importa aqui.
 */

test.describe("Home", () => {
  test("tem um único h1 com o nome oficial", async ({ page }) => {
    await page.goto("/");
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toHaveCount(1);
    await expect(h1).toHaveText(
      "Observatório de Cultura e Economia Criativa da Região do Vale do Rio Real",
    );
  });

  test("leva à Sala do Avaliador pela ação institucional do cabeçalho", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page
        .locator("#cabecalho-home")
        .getByRole("link", { name: "Prestação de Contas", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Abrir a Prestação de Contas" }),
    ).toHaveCount(0);
  });

  test("integra somente o Hero B aprovado e mantém as marcas circulares", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("#hero-home")).toBeVisible();
    await expect(
      page.locator('#hero-home [data-marca-circular="true"]'),
    ).toHaveCount(2);
    await expect(page.locator("#hero-wordmark")).toHaveCount(0);
    await expect(page.locator("#hero-tipografia")).toHaveCount(0);
  });

  test("o título usa a largura editorial aprovada sem quebra manual", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const titulo = page.locator("#hero-home h1");

    const medidas = await titulo.evaluate((elemento) => {
      const range = document.createRange();
      range.selectNodeContents(elemento);
      const topos = [...range.getClientRects()].map((retangulo) =>
        Math.round(retangulo.top * 100),
      );
      return {
        largura: elemento.getBoundingClientRect().width,
        linhas: new Set(topos).size,
        quebrasManuais: elemento.querySelectorAll("br").length,
      };
    });

    expect(medidas.largura).toBeGreaterThanOrEqual(800);
    expect(medidas.largura).toBeLessThanOrEqual(950);
    expect(medidas.linhas).toBe(2);
    expect(medidas.quebrasManuais).toBe(0);
  });

  test("o cabeçalho real exibe os sete destinos aprovados e não duplica o banner", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    await expect(page.locator("header:visible")).toHaveCount(1);
    const nav = page.getByRole("navigation", { name: "Principal" });
    for (const destino of [
      "/observatorio",
      "/pesquisa",
      "/territorio",
      "/dados",
      "/campo",
      "/podobservar",
      "/acervo",
    ]) {
      await expect(nav.locator(`a[href="${destino}"]`)).toHaveCount(1);
    }
    await expect(nav.locator('a[href="/educacao"]')).toHaveCount(0);
  });

  test("a Central de Acessibilidade funciona na Home", async ({ page }) => {
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

  test("mostra os caminhos prioritários", async ({ page }) => {
    await page.goto("/");
    const caminhos = page.getByRole("navigation", {
      name: "Caminhos prioritários",
    });
    for (const destino of [
      "/prestacao-de-contas",
      "/pesquisa",
      "/podobservar",
      "/dados",
    ]) {
      await expect(caminhos.locator(`a[href="${destino}"]`)).toHaveCount(1);
    }
  });

  test("declara o estado dos destinos ainda sem conteúdo", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Em preparação").first()).toBeVisible();
  });

  test("aponta o acervo legível por máquina", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('a[href="/anexos.json"]')).toHaveCount(1);
  });

  /**
   * Guarda ajustado na Tarefa 10B.3.3, e vale registrar por quê.
   *
   * Até aqui este teste proibia os nomes "Itabaianinha" e "São Cristóvão" na
   * Home, como atalho para detectar o comparativo municipal. Com o mapa
   * territorial, os 75 municípios de Sergipe passaram a ser nomeados — e isso
   * é dado oficial do IBGE, não comparativo. O atalho deixou de servir.
   *
   * O que continua proibido é o que sempre importou: indicador, número de
   * pesquisa e linguagem de comparação entre municípios. É isso que o teste
   * verifica agora, sem confundir "nomear" com "comparar".
   */
  /**
   * A proibição de "indicador" caiu com a H4.1, e não por conveniência: ela
   * dizia "só depois da tabela `indicador` (Tarefa 13)", e essa premissa foi
   * superada. A H4.0 auditou os oito indicadores como agregado em TypeScript
   * versionado, a H4.5.2 fechou quais entram na Home e o responsável autorizou
   * a integração. **Nenhuma tabela `indicador` foi criada** — o que o teste
   * protegia contra era número provisório, e isso continua protegido pelos
   * testes de valor em `testes/dados-vivos.test.ts`.
   *
   * O resto do teste segue intacto, e ganhou o que passou a ser possível
   * errar: os três indicadores reservados não podem vazar para a Home.
   */
  test("não compara município nem publica o que ficou reservado", async ({
    page,
  }) => {
    await page.goto("/");
    const conteudo = (await page.locator("main").innerText()).toLowerCase();

    // Vocabulário de comparativo, que depende de fonte oficial comparável.
    expect(conteudo).not.toContain("habitantes");
    expect(conteudo).not.toContain("população");
    expect(conteudo).not.toContain("comparativo");
    expect(conteudo).not.toContain("ranking");

    // Os dois reservados cujo título não colide com o texto das regras
    // (H4.5.2). "Contratações de trabalho" não entra nesta lista: a expressão
    // aparece legitimamente dentro da regra declarada do H4-005, e proibi-la
    // aqui seria falhar por colisão em vez de por vazamento. Os três títulos
    // completos são conferidos em `testes/dados-vivos.test.ts`.
    expect(conteudo).not.toContain("valor movimentado por dia");
    expect(conteudo).not.toContain("registros de operação");
  });

  test("integra uma única cartografia B sem rótulos de desenvolvimento", async ({
    page,
  }) => {
    await page.goto("/");
    const territorio = page.getByTestId("territorio-home");

    await expect(territorio).toHaveAttribute("data-profundidade", "moderada");
    await expect(territorio.locator("svg")).toHaveCount(1);
    await expect(territorio.locator("svg path[data-codigo]")).toHaveCount(75);
    await expect(territorio.locator("svg path.h")).toHaveCount(3);
    await expect(territorio.locator("svg circle.p")).toHaveCount(0);
    await expect(page.getByText(/Preset B/i)).toHaveCount(0);
    await expect(page.getByText(/Proposta editorial/i)).toHaveCount(0);
  });

  test("preserva Vale, comparação e lista territorial progressiva", async ({
    page,
  }) => {
    await page.goto("/");
    const territorio = page.getByTestId("territorio-home");
    const indice = territorio.locator("details");
    const itens = territorio.locator("#territorio-home-lista > [data-codigo]");

    await expect(indice).not.toHaveAttribute("open", "");
    await expect(
      territorio.getByText("Índice acessível — 75 municípios"),
    ).toBeVisible();
    await expect(itens).toHaveCount(75);
    await expect(itens.filter({ hasText: "Vale do Rio Real" })).toHaveCount(5);

    const saoCristovao = itens.filter({ hasText: /^São Cristóvão/ });
    await expect(saoCristovao).toContainText(
      "Comparação de políticas públicas",
    );
    await expect(saoCristovao).not.toContainText("Vale do Rio Real");
  });

  test("mapa e índice selecionam por teclado e atualizam o mesmo painel", async ({
    page,
  }) => {
    await page.goto("/");
    const territorio = page.getByTestId("territorio-home");
    const mapa = territorio.getByRole("listbox", {
      name: "Mapa dos 75 municípios de Sergipe",
    });
    const tobias = mapa.getByRole("option", { name: /Tobias Barreto/ });

    await tobias.focus();
    await tobias.press("Enter");
    await expect(tobias).toHaveAttribute("aria-selected", "true");
    await expect(territorio.locator("#territorio-home-painel")).toContainText(
      "Entrevista — Secretaria de Cultura",
    );

    await territorio.getByText("Índice acessível — 75 municípios").click();
    const indice = territorio.getByRole("listbox", {
      name: /Índice acessível — 75 municípios/,
    });
    const primeira = indice.getByRole("option").first();
    await primeira.focus();
    await primeira.press("ArrowDown");
    await expect(indice.getByRole("option").nth(1)).toBeFocused();
    await indice.getByRole("option").nth(1).press("Space");
    await expect(indice.getByRole("option").nth(1)).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  test("Território sucede o Hero e respeita movimento reduzido", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    const ordem = await page.evaluate(() => {
      const hero = document.querySelector("#hero-home");
      const territorio = document.querySelector("#territorio-home");
      if (hero === null || territorio === null) return null;
      return Boolean(
        hero.compareDocumentPosition(territorio) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      );
    });
    expect(ordem).toBe(true);

    const duracao = await page
      .locator("#territorio-home svg")
      .evaluate((elemento) => getComputedStyle(elemento).transitionDuration);
    expect(["0s", "0.00001s", "1e-05s"]).toContain(duracao);
  });

  test("integra a composição A da Pesquisa em Campo, sem rótulo de desenvolvimento", async ({
    page,
  }) => {
    await page.goto("/");
    const pesquisa = page.getByTestId("pesquisa-home");

    await expect(pesquisa).toHaveAttribute(
      "data-composicao",
      "documental-aberto",
    );
    await expect(pesquisa.locator("figure")).toHaveCount(3);
    await expect(pesquisa.locator("figure img[alt]:not([alt=''])")).toHaveCount(
      3,
    );
    await expect(pesquisa.locator("figure figcaption")).toHaveCount(3);
    await expect(pesquisa.getByText(/somente DEV/i)).toHaveCount(0);
    await expect(pesquisa.getByText(/preset/i)).toHaveCount(0);
    await expect(pesquisa.getByText(/proposta/i)).toHaveCount(0);

    // Nem como classe morta no CSS embutido: quem procurar vestígio de
    // desenvolvimento no conteúdo servido não pode encontrar nenhum.
    expect(await page.content()).not.toMatch(/proposta|somente DEV/i);
  });

  /**
   * As três fotografias ficam abaixo do Hero e do Território. Carregá-las na
   * abertura desperdiçaria a banda do público que o doc 01 §7 descreve — rede
   * de escola e de zona rural — para mostrar imagem que ninguém está vendo.
   */
  test("as fotografias da pesquisa não disputam o carregamento inicial", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(
      page.locator(
        "head link[rel='preload'][as='image'][href*='/media/pesquisa']",
      ),
    ).toHaveCount(0);
    await expect(
      page.getByTestId("pesquisa-home").locator("img[loading='lazy']"),
    ).toHaveCount(3);
    await expect(
      page.getByTestId("pesquisa-home").locator("img[fetchpriority='high']"),
    ).toHaveCount(0);
  });

  test("publica a copy aprovada da Pesquisa em Campo e nenhuma nota de auditoria", async ({
    page,
  }) => {
    await page.goto("/");
    const pesquisa = page.getByTestId("pesquisa-home");

    await expect(pesquisa.getByText("02 — PESQUISA EM CAMPO")).toHaveCount(1);
    await expect(
      pesquisa.getByRole("heading", { name: "O campo como documento" }),
    ).toBeVisible();
    await expect(
      pesquisa.getByRole("heading", {
        name: "Da abstração do mapa à materialidade do território",
      }),
    ).toBeVisible();

    const conteudo = await pesquisa.innerText();
    expect(conteudo).not.toMatch(/três (registros|fotografias)/i);
  });

  /**
   * A regra de privacidade continua valendo inteira: as três fotografias só
   * existem porque nenhuma tem pessoa identificável. O que saiu da Home foi a
   * *linguagem* de gate — dizer ao visitante que o material passou por um
   * controle é conversa de auditoria, não de seção editorial. O controle
   * permanece nos bastidores, e é o teste dos derivados que o vigia.
   */
  test("a narrativa da pesquisa não usa linguagem de gate de privacidade", async ({
    page,
  }) => {
    await page.goto("/");
    const conteudo = await page.getByTestId("pesquisa-home").innerText();

    expect(conteudo).not.toMatch(/pessoa identificável|identificáveis/i);
    expect(conteudo).not.toMatch(/privacidade|autoriza[çc]|consentimento/i);
    expect(conteudo).not.toMatch(/auditori|revis[ãa]o|publicá?vel/i);
  });

  test("a ficha declara local e ausência de data, sem nomear a fonte restrita", async ({
    page,
  }) => {
    await page.goto("/");
    const ficha = page.getByTestId("pesquisa-home").locator("dl").first();

    await expect(ficha.locator("dt")).toHaveCount(2);
    await expect(ficha).toContainText("Local");
    await expect(ficha).toContainText("Ilha Grande");
    await expect(ficha).toContainText("Data");
    await expect(ficha).toContainText("Não informada");
    await expect(ficha).not.toContainText("Fonte");
  });

  /**
   * A03 e A04 continuam fora do lote público e B01 continua RESTRITO como
   * conjunto. Publicar os derivados seguros não promove nenhum dos três: o
   * identificador, o título interno e o caminho do arquivo não podem vazar
   * para o HTML só porque a seção passou a existir.
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

  test("Pesquisa em Campo sucede o Território e não cria ilha nova", async ({
    page,
  }) => {
    await page.goto("/");

    const ordem = await page.evaluate(() => {
      const territorio = document.querySelector("#territorio-home");
      const pesquisa = document.querySelector("#pesquisa-home");
      if (territorio === null || pesquisa === null) return null;
      return Boolean(
        territorio.compareDocumentPosition(pesquisa) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      );
    });
    expect(ordem).toBe(true);

    await expect(
      page.getByTestId("pesquisa-home").locator("button, [role='listbox']"),
    ).toHaveCount(0);
  });

  /**
   * H4.1 — a seção de Dados na Home.
   *
   * O conteúdo editorial já é conferido em `testes/dados-vivos.test.ts`, contra
   * o dataset. Aqui se verifica o que só o navegador sabe: posição, quantidade
   * de assinaturas, teclado e movimento.
   */
  test("Dados sucede a Pesquisa em Campo e traz a composição aprovada", async ({
    page,
  }) => {
    await page.goto("/");
    const dados = page.getByTestId("dados-home");

    await expect(dados).toBeVisible();
    await expect(
      dados.getByRole("heading", { name: "Onde o recurso circula" }),
    ).toBeVisible();

    const ordem = await page.evaluate(() => {
      const pesquisa = document.querySelector("#pesquisa-home");
      const secao = document.querySelector('[data-testid="dados-home"]');
      const caminhos = document.querySelector("#caminhos-prioritarios");
      if (pesquisa === null || secao === null || caminhos === null) return null;
      const depoisDaPesquisa = Boolean(
        pesquisa.compareDocumentPosition(secao) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      );
      const antesDosCaminhos = Boolean(
        secao.compareDocumentPosition(caminhos) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      );
      return depoisDaPesquisa && antesDosCaminhos;
    });
    expect(ordem).toBe(true);
  });

  /**
   * A regra transversal da H3.5.1: um carcará em escala editorial por página,
   * e só em passagem. A Home inteira, não a seção.
   */
  test("a Home tem exatamente uma assinatura de identidade", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator(".lv-g-identidade")).toHaveCount(1);
    await expect(page.locator('img[src*="carcara-identidade"]')).toHaveCount(1);
  });

  /**
   * A série é evidência, não ornamento: a tabela com os valores exatos é o
   * caminho de teclado e não depende de largura nem de JavaScript.
   */
  test("a série mensal mantém a tabela de valores exatos no DOM", async ({
    page,
  }) => {
    await page.goto("/");
    const tabela = page.getByTestId("dados-home").locator("table.dv-tabela");
    await expect(tabela).toHaveCount(1);
    await expect(tabela.locator("tbody tr")).toHaveCount(6);

    await page.setViewportSize({ width: 375, height: 800 });
    await expect(tabela.locator("tbody tr")).toHaveCount(6);
  });

  test("com movimento reduzido a seção não anima e nada some", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    const dados = page.getByTestId("dados-home");
    await expect(dados).toBeVisible();

    const animado = await page.evaluate(() => {
      const raiz = document.querySelector('[data-testid="dados-home"]');
      if (raiz === null) return null;
      return [...raiz.querySelectorAll(".lv-revelar, .dv-conector, .dv-ponto")]
        .map((elemento) => getComputedStyle(elemento))
        .some(
          (estilo) =>
            estilo.animationName !== "none" || Number(estilo.opacity) < 1,
        );
    });
    expect(animado).toBe(false);
  });

  for (const largura of [320, 375, 768, 1440]) {
    for (const tema of ["light", "dark"] as const) {
      test(`${largura}px no tema ${tema} não tem overflow horizontal`, async ({
        page,
      }) => {
        await page.emulateMedia({ colorScheme: tema });
        await page.setViewportSize({ width: largura, height: 800 });
        await page.goto("/");
        const transborda = await page.evaluate(
          () => document.documentElement.scrollWidth > window.innerWidth,
        );
        expect(transborda).toBe(false);
      });
    }
  }

  test("equivalente a zoom 200% mantém título e transição utilizáveis", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 720, height: 450 });
    await page.goto("/");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      ),
    ).toBe(false);
    await expect(page.locator("#hero-home h1")).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Caminhos prioritários" }),
    ).toBeVisible();
  });
});

/**
 * A H4.1 é a primeira seção da Home a usar `RevelacaoVisual`. A ilha
 * **acrescenta** a entrada aprovada; ela não é condição de leitura. Sem
 * JavaScript nenhum atributo `data-revelado` é posto, nenhuma animação se
 * aplica, e a seção precisa continuar inteira.
 */
test.describe("Home sem JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("a seção de Dados continua completa e legível", async ({ page }) => {
    await page.goto("/");
    const dados = page.getByTestId("dados-home");

    await expect(
      dados.getByRole("heading", { name: "Onde o recurso circula" }),
    ).toBeVisible();
    await expect(dados.locator(".dv-numero")).toBeVisible();
    await expect(dados.locator(".dv-registro-indicador")).toHaveCount(4);
    await expect(dados.locator("table.dv-tabela tbody tr")).toHaveCount(6);
    await expect(dados.locator("[data-revelado]")).toHaveCount(0);

    const visivel = await page.evaluate(() => {
      const raiz = document.querySelector('[data-testid="dados-home"]');
      if (raiz === null) return null;
      return [...raiz.querySelectorAll(".lv-revelar")].every(
        (elemento) => Number(getComputedStyle(elemento).opacity) === 1,
      );
    });
    expect(visivel).toBe(true);
  });
});
