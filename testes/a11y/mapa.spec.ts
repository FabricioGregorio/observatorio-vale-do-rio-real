import { expect, test } from "@playwright/test";

/**
 * Mapa territorial da Home — cartografia editorial em camadas.
 *
 * A composição restaurada em 2026-09-17 devolve à Home a linguagem
 * cartográfica original: Sergipe inteiro, quatro camadas visuais legíveis de
 * uma vez, moldura, nota cartográfica e legenda. O que **não** volta é o
 * índice dos 75 municípios como opções — nisso vale a decisão de 2026-09-16,
 * que fez do estado contexto e do recorte o alvo editorial.
 *
 * Por isso este arquivo cobre duas ordens de contrato:
 *
 * 1. **as camadas**, que não dependem de interação nenhuma — quem chega sem
 *    tocar em nada já distingue Sergipe, Vale, pesquisa e comparação, e não
 *    por cor sozinha;
 * 2. **os seis alvos editoriais** como opções de teclado, mouse e toque, com
 *    foco, seleção, troca da coluna e volta ao padrão.
 *
 * Desde o adendo de 2026-09-19 a coluna inteira é contextual: selecionar troca
 * sobretítulo, título, parágrafos e linha territorial. O estado sem seleção não
 * é vazio — é o Vale, que é o assunto da seção e o que vale também sem
 * JavaScript.
 *
 * A experiência territorial completa é de `/territorio`, coberta em
 * `territorio-publico.spec.ts`.
 */

const SVG = "#hl-mapa";
const VALE = '#hl-mapa [data-recorte="vale"]';
const COMPARACAO = '#hl-mapa [data-recorte="comparacao"]';
const ILHA_GRANDE = '#hl-mapa [data-recorte="ilha-grande"]';
const SERRA = '#hl-mapa [data-recorte="serra-dos-macacos"]';
const MARCADOS = "#hl-municipios [data-selecionado]";
const PAINEL = "#hl-mapa-painel";
const CONVITE = "#hl-territorio .territorio-cartografico__convite";
const PONTE = "#hl-territorio .territorio-cartografico__ir";

/** Bloco da coluna que está aberto agora. Só pode haver um. */
const ABERTO = `${PAINEL} [data-painel-de]:not([hidden])`;

/** Os seis alvos, na ordem em que o desenho os oferece. */
const ALVOS = [
  "vale",
  "comparacao",
  "recanto-da-serra",
  "borda-da-mata",
  "serra-dos-macacos",
  "ilha-grande",
];

const RECORTES = ["vale", "comparacao"];

/**
 * O que se clica dentro de um alvo.
 *
 * O `<g>` não é alvo de ponteiro por si: num recorte, quem pinta são os
 * caminhos dos municípios; num lugar, é o círculo transparente. Clicar no `<g>`
 * acertaria o centro da caixa envolvente, que inclui o rótulo invisível e pode
 * cair fora de qualquer coisa desenhada.
 */
function clicavel(chave: string): string {
  const dentro = RECORTES.includes(chave) ? "path" : "path.forma";
  return `#hl-mapa [data-recorte="${chave}"] ${dentro}`;
}

const MUNICIPIOS_DO_VALE = [
  "Tobias Barreto",
  "Tomar do Geru",
  "Itabaianinha",
  "Cristinápolis",
  "Poço Verde",
];

/** Lugares confirmados que caem em cada recorte. Os três primeiros são de
 *  Tobias Barreto; Ilha Grande é de São Cristóvão. */
const LUGARES_DO_VALE = 3;
const LUGARES_DA_COMPARACAO = 1;

/** Espera a ilha assumir o desenho; antes disso não há interação nenhuma. */
async function abrirMapa(page: import("@playwright/test").Page) {
  await page.goto("/");
  await expect(page.locator(SVG)).toHaveAttribute("data-interativo", "true");
}

test.describe("mapa da Home — camadas", () => {
  test("desenha os 75 municípios de Sergipe", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#hl-mapa path.m")).toHaveCount(75);
  });

  /**
   * O ponto da restauração: as quatro camadas se distinguem **sem seleção**, e
   * cada uma por mais de um canal. Preenchimento, padrão e traço são
   * independentes — é o que permite Tobias Barreto ler como Vale *e* pesquisa,
   * e São Cristóvão ler como pesquisa *e* comparação sem nunca ler como Vale.
   */
  test("as quatro camadas se distinguem sem interação e sem depender de cor", async ({
    page,
  }) => {
    await page.goto("/");

    const estilo = (seletor: string) =>
      page
        .locator(seletor)
        .first()
        .evaluate((elemento) => {
          const e = getComputedStyle(elemento);
          return {
            preenchimento: e.fill,
            traco: e.stroke,
            espessura: e.strokeWidth,
            tracejado: e.strokeDasharray,
          };
        });

    const sergipe = await estilo("#hl-mapa > path.m");
    const vale = await estilo("#hl-mapa path.m.v");
    const comparacao = await estilo("#hl-mapa path.m.c");

    // Vale: preenchimento e traço próprios, e o dobro da espessura da base.
    expect(vale.preenchimento).not.toBe(sergipe.preenchimento);
    expect(vale.traco).not.toBe(sergipe.traco);
    expect(Number.parseFloat(vale.espessura)).toBeGreaterThan(
      Number.parseFloat(sergipe.espessura),
    );

    // Comparação: tracejada, e sem o preenchimento do Vale.
    expect(comparacao.tracejado).not.toBe(sergipe.tracejado);
    expect(comparacao.preenchimento).not.toBe(vale.preenchimento);

    // Pesquisa: hachura, que é padrão e não cor.
    const hachura = await page
      .locator("#hl-mapa path.h")
      .first()
      .evaluate((p) => getComputedStyle(p).fill);
    expect(hachura).toContain("url(");
    await expect(page.locator("#hl-mapa pattern")).toHaveCount(1);
  });

  /**
   * Legenda enxuta, por decisão editorial de 2026-09-17: só as três camadas de
   * malha. A comparação continua desenhada e continua explicada — no parágrafo
   * de abertura, no painel de leitura e na leitura em texto — e os lugares
   * continuam nomeados no bloco Pontos de pesquisa. O que saiu foi a linha da
   * legenda, não a informação.
   */
  test("a legenda nomeia as camadas de malha e a nota cartográfica declara a fonte", async ({
    page,
  }) => {
    await page.goto("/");

    const legenda = page.getByLabel("Legenda do mapa");
    await expect(legenda).toBeVisible();
    expect(
      await legenda
        .locator("li")
        .evaluateAll((itens) => itens.map((i) => i.textContent?.trim() ?? "")),
    ).toEqual(["Sergipe", "Vale", "Pesquisa"]);

    const nota = page.locator("#hl-territorio figcaption");
    await expect(nota).toContainText("IBGE, Malhas Territoriais");
    await expect(nota).toContainText(
      `${MUNICIPIOS_DO_VALE.length} municípios no recorte do Vale`,
    );
  });

  /**
   * Os quatro lugares de campo têm coordenada confirmada e são desenhados com
   * o **mesmo pin de `/territorio`**: `caminhoDoPin` é a única definição da
   * gota no projeto, e a ponta cai exatamente sobre a coordenada.
   */
  test("os quatro lugares visitados aparecem com o pin de /territorio", async ({
    page,
  }) => {
    await page.goto("/");
    const lugares = page.locator("#hl-mapa .territorio-cartografico__lugar");
    await expect(lugares).toHaveCount(LUGARES_DO_VALE + LUGARES_DA_COMPARACAO);
    await expect(lugares.locator("path.forma")).toHaveCount(
      LUGARES_DO_VALE + LUGARES_DA_COMPARACAO,
    );

    const formaDaHome = await lugares
      .locator("path.forma")
      .first()
      .getAttribute("d");
    await page.goto("/territorio");
    const formaDoTerritorio = await page
      .locator(".tv-pin path.forma")
      .first()
      .getAttribute("d");
    // Mesmo gerador, mesma gota: o raio muda, a gramática do traço não.
    expect(formaDaHome?.startsWith("M0 0C")).toBe(true);
    expect(formaDoTerritorio?.startsWith("M0 0C")).toBe(true);
  });

  /**
   * O desenho não é uma figura dentro de uma caixa: nem moldura, nem o
   * contorno que o navegador daria ao SVG ao receber clique.
   */
  test("nenhuma borda externa contorna o mapa, em nenhum estado", async ({
    page,
  }) => {
    await abrirMapa(page);

    const moldura = page.locator(
      "#hl-territorio .territorio-cartografico__moldura",
    );
    expect(
      await moldura.evaluate((m) => getComputedStyle(m).borderTopWidth),
    ).toBe("0px");

    const contorno = () =>
      page.locator(SVG).evaluate((s) => getComputedStyle(s).outlineStyle);
    expect(await contorno()).toBe("none");

    // Clique em área vazia do desenho: é o gesto que fazia o retângulo preto
    // aparecer, porque no Chrome o SVG é alvo de foco por clique.
    const caixa = await page.locator(SVG).boundingBox();
    if (caixa !== null) await page.mouse.click(caixa.x + 6, caixa.y + 6);
    expect(await contorno()).toBe("none");

    await page.locator(VALE).focus();
    expect(await contorno()).toBe("none");
    await page.locator(`${VALE} path`).first().click({ force: true });
    expect(await contorno()).toBe("none");
  });
});

test.describe("mapa da Home — estado inicial", () => {
  test("abre sem recorte selecionado", async ({ page }) => {
    await abrirMapa(page);

    await expect(page.locator(`${VALE}[aria-selected="true"]`)).toHaveCount(0);
    await expect(
      page.locator(`${COMPARACAO}[aria-selected="true"]`),
    ).toHaveCount(0);
    await expect(page.locator(MARCADOS)).toHaveCount(0);
  });

  /**
   * A regra visual: nada pode parecer escolhido antes de alguém escolher. Os
   * nomes dos lugares só entram no desenho depois da seleção — a visão geral é
   * a malha, não uma lista de etiquetas.
   */
  test("nenhum lugar é nomeado no desenho antes da seleção", async ({
    page,
  }) => {
    await abrirMapa(page);

    const visiveis = await page
      .locator("#hl-mapa .territorio-cartografico__lugar text")
      .evaluateAll(
        (rotulos) =>
          rotulos.filter((r) => Number(getComputedStyle(r).opacity) > 0).length,
      );
    expect(visiveis).toBe(0);
  });

  /**
   * A coluna abre no Vale, e não num "selecione algo": o texto de abertura é
   * conteúdo, não instrução. Nada fica marcado como escolhido antes de alguém
   * escolher — abrir no padrão não é afirmar seleção.
   */
  test("a coluna abre no Vale, com um bloco só e sem afirmar seleção", async ({
    page,
  }) => {
    await abrirMapa(page);

    await expect(page.locator(ABERTO)).toHaveCount(1);
    await expect(page.locator(ABERTO)).toHaveAttribute(
      "data-painel-de",
      "vale",
    );
    await expect(page.locator(`${ABERTO} h3`)).toHaveText(
      "Uma região que se reconhece pelo que circula nela",
    );
    await expect(page.locator(`${PAINEL} [data-painel-vazio]`)).toHaveCount(0);
    await expect(page.locator('#hl-mapa [aria-selected="true"]')).toHaveCount(
      0,
    );
  });

  /** O convite só existe havendo o que selecionar. */
  test("o convite a explorar aparece quando a ilha assume o desenho", async ({
    page,
  }) => {
    await abrirMapa(page);
    await expect(page.locator(CONVITE)).toBeVisible();
    await expect(page.locator(CONVITE)).toContainText("ponto de pesquisa");
  });

  test("os seis alvos são opções nomeadas de uma única listbox", async ({
    page,
  }) => {
    await abrirMapa(page);

    await expect(page.locator(SVG)).toHaveAttribute("role", "listbox");
    const opcoes = page.locator('#hl-mapa [role="option"]');
    await expect(opcoes).toHaveCount(ALVOS.length);

    expect(
      await opcoes.evaluateAll((os) =>
        os.map((o) => o.getAttribute("data-recorte")),
      ),
    ).toEqual(ALVOS);
    expect(
      await opcoes.evaluateAll((os) =>
        os.map((o) => o.getAttribute("aria-label")),
      ),
    ).toEqual([
      "Recorte do Vale do Rio Real",
      "Referência de comparação, fora do Vale",
      "Recanto da Serra, ponto de pesquisa",
      "Museu Borda da Mata, ponto de pesquisa",
      "Serra dos Macacos, ponto de pesquisa",
      "Ilha Grande, ponto de pesquisa",
    ]);
  });

  /** Roving tabindex: o mapa é uma parada de Tab, não seis. */
  test("o mapa é uma única parada de Tab", async ({ page }) => {
    await abrirMapa(page);

    await expect(
      page.locator('#hl-mapa [role="option"][tabindex="0"]'),
    ).toHaveCount(1);
    await expect(
      page.locator('#hl-mapa [role="option"][tabindex="-1"]'),
    ).toHaveCount(ALVOS.length - 1);
  });
});

test.describe("mapa da Home — seleção", () => {
  test("clique no Vale marca os cinco municípios e São Cristóvão fica fora", async ({
    page,
  }) => {
    await abrirMapa(page);
    await page.locator(`${VALE} path`).first().click({ force: true });

    await expect(page.locator(VALE)).toHaveAttribute("aria-selected", "true");
    await expect(page.locator(COMPARACAO)).toHaveAttribute(
      "aria-selected",
      "false",
    );

    const nomes = await page
      .locator(`${MARCADOS} dt`)
      .evaluateAll((ns) => ns.map((n) => n.textContent?.trim() ?? ""));
    expect(nomes).toEqual(MUNICIPIOS_DO_VALE);
    expect(nomes).not.toContain("São Cristóvão");

    const painel = page.locator(`${PAINEL} [data-painel-de="vale"]`);
    await expect(painel).toBeVisible();
    await expect(painel).toContainText("atravessa Sergipe e a Bahia");
    // Grafia decidida pela equipe para o texto editorial do site.
    await expect(painel).toContainText("Itanhi");
    await expect(painel).not.toContainText("Itanhy");
    // A abordagem recusada não volta por nenhuma porta.
    await expect(painel).not.toContainText(
      "Não é divisão administrativa oficial",
    );
    await expect(painel).toContainText(MUNICIPIOS_DO_VALE.join(" · "));
  });

  test("clique em São Cristóvão destaca só ele, como referência de comparação", async ({
    page,
  }) => {
    await abrirMapa(page);
    await page.locator(`${COMPARACAO} path`).first().click({ force: true });

    const nomes = await page
      .locator(`${MARCADOS} dt`)
      .evaluateAll((ns) => ns.map((n) => n.textContent?.trim() ?? ""));
    expect(nomes).toEqual(["São Cristóvão"]);

    const painel = page.locator(`${PAINEL} [data-painel-de="comparacao"]`);
    await expect(painel).toBeVisible();
    await expect(painel).toContainText("comparação");
    await expect(painel).not.toContainText("parte do Vale do Rio Real");
  });

  /**
   * O caso que o adendo nomeia: Ilha Grande deixa de ser só um ponto no
   * desenho e passa a abrir ficha própria. O município é o que a transcrição
   * do EP01 diz e o que `referencias.ts` publica desde 2026-09-14.
   */
  test("clique em Ilha Grande abre a ficha do povoado de São Cristóvão", async ({
    page,
  }) => {
    await abrirMapa(page);
    await page.locator(clicavel("ilha-grande")).click();

    await expect(page.locator(ILHA_GRANDE)).toHaveAttribute(
      "aria-selected",
      "true",
    );

    const ficha = page.locator(`${PAINEL} [data-painel-de="ilha-grande"]`);
    await expect(ficha).toBeVisible();
    await expect(ficha.locator("h3")).toHaveText("Ilha Grande");
    await expect(ficha).toContainText("São Cristóvão");
    await expect(ficha).toContainText("samba de coco");
    await expect(ficha).toContainText("barco");
    await expect(ficha).not.toContainText("município não consolidado");
  });

  /** Alternar não mistura: a coluna mostra um alvo por vez, e só um. */
  test("alternar entre alvos não mistura conteúdo", async ({ page }) => {
    await abrirMapa(page);

    for (const chave of ["ilha-grande", "vale", "serra-dos-macacos"]) {
      await page.locator(clicavel(chave)).first().click({ force: true });
      await expect(page.locator(ABERTO)).toHaveCount(1);
      await expect(page.locator(ABERTO)).toHaveAttribute(
        "data-painel-de",
        chave,
      );
      await expect(page.locator('#hl-mapa [aria-selected="true"]')).toHaveCount(
        1,
      );
    }

    // O texto do alvo anterior não sobrou na coluna visível.
    await expect(page.locator(ABERTO)).not.toContainText("samba de coco");
    await expect(page.locator(ABERTO)).toContainText("Pedra Grande");
  });

  /**
   * O alvo de toque de cada lugar precisa existir no telefone: a gota tem
   * menos de 6 px em 375 px, e é o círculo transparente que dá o alvo.
   */
  test("no telefone, cada ponto de pesquisa é tocável e abre o seu", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await abrirMapa(page);

    const alvos = page.locator(
      "#hl-mapa .territorio-cartografico__lugar .alvo",
    );
    await expect(alvos).toHaveCount(4);
    for (const caixa of await alvos.evaluateAll((cs) =>
      cs.map((c) => c.getBoundingClientRect().width),
    )) {
      // WCAG 2.2 AA, critério 2.5.8: 24 px é o mínimo.
      expect(caixa).toBeGreaterThanOrEqual(24);
    }

    /*
      Toque fora da gota e dentro do círculo: é exatamente o que o alvo
      ampliado existe para pegar. A gota mede menos de 6 px aqui; sem o
      círculo, este toque não acertaria nada.
    */
    await page.locator(`${SERRA} .alvo`).click({ position: { x: 6, y: 6 } });
    await expect(page.locator(SERRA)).toHaveAttribute("aria-selected", "true");
    await expect(page.locator(ABERTO)).toHaveAttribute(
      "data-painel-de",
      "serra-dos-macacos",
    );
    // A coluna continua legível: nada de rolagem horizontal na página.
    expect(
      await page.evaluate(() => ({
        rolagem: document.documentElement.scrollWidth,
        visivel: document.documentElement.clientWidth,
      })),
    ).toEqual({ rolagem: 375, visivel: 375 });
  });

  /** Toque percorre o mesmo caminho de seleção: nada depende de `hover`. */
  test("toque seleciona pelo mesmo caminho do clique", async ({ page }) => {
    await abrirMapa(page);
    await page.locator(`${VALE} path`).first().dispatchEvent("click");

    await expect(page.locator(VALE)).toHaveAttribute("aria-selected", "true");
  });

  test("a seleção não depende só de cor: traço e nomes dos lugares mudam junto", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await abrirMapa(page);

    const traco = () =>
      page
        .locator(`${VALE} path`)
        .first()
        .evaluate((p) => getComputedStyle(p).strokeWidth);
    const antes = await traco();

    await page.locator(`${VALE} path`).first().click({ force: true });
    await expect(page.locator(VALE)).toHaveAttribute("aria-selected", "true");
    await expect.poll(traco).not.toBe(antes);

    const nomesVisiveis = () =>
      page
        .locator("#hl-mapa .territorio-cartografico__lugar text")
        .evaluateAll(
          (rs) =>
            rs.filter((r) => Number(getComputedStyle(r).opacity) > 0).length,
        );
    await expect.poll(nomesVisiveis).toBe(LUGARES_DO_VALE);
  });
});

test.describe("mapa da Home — teclado", () => {
  test("Enter seleciona, Esc limpa e o foco não seleciona sozinho", async ({
    page,
  }) => {
    await abrirMapa(page);
    const vale = page.locator(VALE);

    await vale.focus();
    // Foco não é seleção: é a exceção de acessibilidade ao princípio visual.
    await expect(vale).toHaveAttribute("aria-selected", "false");
    await expect(page.locator(MARCADOS)).toHaveCount(0);

    await page.keyboard.press("Enter");
    await expect(vale).toHaveAttribute("aria-selected", "true");

    await page.keyboard.press("Escape");
    await expect(vale).toHaveAttribute("aria-selected", "false");
    await expect(page.locator(MARCADOS)).toHaveCount(0);
    // Sair da seleção devolve a coluna ao padrão; nunca a deixa vazia.
    await expect(page.locator(ABERTO)).toHaveAttribute(
      "data-painel-de",
      "vale",
    );
  });

  /** Esc a partir de um lugar também volta ao Vale, não ao nada. */
  test("Esc a partir de um ponto de pesquisa volta ao Vale", async ({
    page,
  }) => {
    await abrirMapa(page);
    await page.locator(ILHA_GRANDE).focus();
    await page.keyboard.press("Enter");
    await expect(page.locator(ABERTO)).toHaveAttribute(
      "data-painel-de",
      "ilha-grande",
    );

    await page.keyboard.press("Escape");
    await expect(page.locator(ABERTO)).toHaveCount(1);
    await expect(page.locator(ABERTO)).toHaveAttribute(
      "data-painel-de",
      "vale",
    );
    await expect(page.locator('#hl-mapa [aria-selected="true"]')).toHaveCount(
      0,
    );
  });

  test("Espaço também seleciona", async ({ page }) => {
    await abrirMapa(page);
    await page.locator(VALE).focus();
    await page.keyboard.press(" ");
    await expect(page.locator(VALE)).toHaveAttribute("aria-selected", "true");
  });

  test("as setas alcançam os seis alvos, incluindo os pontos de pesquisa", async ({
    page,
  }) => {
    await abrirMapa(page);
    await page.locator(VALE).focus();

    const focado = () =>
      page.evaluate(() => document.activeElement?.getAttribute("data-recorte"));

    const percorrido = [await focado()];
    for (let passo = 1; passo < ALVOS.length; passo++) {
      await page.keyboard.press("ArrowRight");
      percorrido.push(await focado());
    }
    expect(percorrido).toEqual(ALVOS);

    await page.keyboard.press("Home");
    expect(await focado()).toBe("vale");

    await page.keyboard.press("End");
    expect(await focado()).toBe("ilha-grande");

    // Do fim, Enter abre a ficha do lugar: teclado chega onde o mouse chega.
    await page.keyboard.press("Enter");
    await expect(page.locator(ABERTO)).toHaveAttribute(
      "data-painel-de",
      "ilha-grande",
    );
  });

  test("o foco é perceptível e não usa o tratamento da seleção", async ({
    page,
  }) => {
    await abrirMapa(page);
    const caminho = page.locator(`${VALE} path`).first();
    const medir = () =>
      caminho.evaluate((p) => {
        const e = getComputedStyle(p);
        return {
          traco: e.strokeWidth,
          cor: e.stroke,
          tracejado: e.strokeDasharray,
        };
      });

    const solto = await medir();
    await page.locator(VALE).focus();
    // `:focus-visible` depende de foco por teclado.
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowLeft");
    const focado = await medir();

    expect(focado.traco).not.toBe(solto.traco);
    expect(focado.cor).not.toBe(solto.cor);
    expect(focado.tracejado).not.toBe(solto.tracejado);
    // Foco não abre ficha nem marca a lista.
    await expect(page.locator(MARCADOS)).toHaveCount(0);
  });
});

/**
 * A ponte editorial: a Home mostra a síntese, `/territorio` tem a cartografia
 * completa. É link, não botão — leva a outra página, existe sem JavaScript e
 * não depende de seleção nenhuma.
 */
test.describe("mapa da Home — ponte para /territorio", () => {
  test("a ponte é um link visível que leva à cartografia completa", async ({
    page,
  }) => {
    await page.goto("/");

    const ponte = page.locator(PONTE);
    await expect(ponte).toBeVisible();
    await expect(ponte).toHaveAttribute("href", "/territorio");
    await expect(ponte).toContainText("mapa interativo completo");
  });

  test("a ponte navega de fato, e a rota responde", async ({ page }) => {
    await page.goto("/");
    // A âncora que `/territorio` acrescenta ao montar é dela, não da ponte:
    // o que importa aqui é o caminho. `waitForURL` espera a navegação de
    // verdade, e não depende de a rota já estar compilada.
    await Promise.all([
      page.waitForURL((url) => url.pathname === "/territorio"),
      page.locator(PONTE).click(),
    ]);
    await expect(page).toHaveTitle(
      "Território — Observatório do Vale do Rio Real",
    );
  });

  /**
   * Nenhum controle de volta sobrou. Quem limpa a seleção é Esc, e nada fica
   * escondido enquanto um recorte está escolhido: as quatro camadas continuam
   * desenhadas, a seleção é ênfase. Não há estado do qual não se saia.
   */
  test("não existe mais botão de voltar à visão geral", async ({ page }) => {
    await abrirMapa(page);
    await expect(page.locator("#hl-mapa-voltar")).toHaveCount(0);

    await page.locator(VALE).focus();
    await page.keyboard.press("Enter");
    await expect(page.locator(VALE)).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("Escape");
    await expect(page.locator('#hl-mapa [aria-selected="true"]')).toHaveCount(
      0,
    );
  });
});

/**
 * Sem JavaScript o desenho é ilustração e diz isso: nenhum controle, nenhuma
 * promessa de navegação. As quatro camadas continuam desenhadas e a informação
 * territorial continua inteira em texto — é o que justifica desenhar o estado
 * como contexto sem transformá-lo em ferramenta.
 */
test.describe("mapa da Home sem JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("o desenho se anuncia como imagem, com alternativa textual", async ({
    page,
  }) => {
    await page.goto("/");

    const svg = page.locator(SVG);
    await expect(svg).toHaveAttribute("role", "img");
    await expect(svg).not.toHaveAttribute("data-interativo", "true");
    await expect(page.locator('#hl-mapa [role="option"]')).toHaveCount(0);
    await expect(page.locator("#hl-mapa [tabindex]")).toHaveCount(0);

    await expect(page.locator("#hl-mapa > title")).toHaveText(
      "Sergipe e o recorte do Vale do Rio Real",
    );
    await expect(page.locator("#hl-mapa > desc")).toContainText(
      "A leitura em texto abaixo descreve cada vínculo",
    );
  });

  test("as camadas continuam desenhadas, e a legenda continua visível", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page.locator("#hl-mapa path.m")).toHaveCount(75);
    await expect(page.locator("#hl-mapa path.m.v")).toHaveCount(
      MUNICIPIOS_DO_VALE.length,
    );
    await expect(page.locator("#hl-mapa path.m.c")).toHaveCount(1);
    await expect(page.getByLabel("Legenda do mapa")).toBeVisible();
  });

  /**
   * A coluna **é** texto editorial, não uma promessa de interação: sem
   * JavaScript ela continua inteira, no alvo padrão. O que some é o convite a
   * selecionar, porque não há o que selecionar.
   */
  test("a coluna entrega o Vale por inteiro, e o convite não aparece", async ({
    page,
  }) => {
    await page.goto("/");

    const aberto = page.locator(ABERTO);
    await expect(aberto).toHaveCount(1);
    await expect(aberto).toHaveAttribute("data-painel-de", "vale");
    await expect(aberto).toContainText("atravessa Sergipe e a Bahia");
    await expect(aberto).toContainText("Itanhi");

    await expect(page.locator(CONVITE)).toBeHidden();

    // A ponte é navegação, não interação: funciona sem JavaScript.
    await expect(page.locator(PONTE)).toBeVisible();
    await expect(page.locator(PONTE)).toHaveAttribute("href", "/territorio");
  });

  /** As cinco fichas restantes existem no documento, mas ficam fechadas. */
  test("os outros cinco alvos ficam fechados, sem JavaScript para abri-los", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page.locator(`${PAINEL} [data-painel-de]`)).toHaveCount(
      ALVOS.length,
    );
    await expect(page.locator(ABERTO)).toHaveCount(1);
  });

  test("o vínculo de cada município continua legível em texto", async ({
    page,
  }) => {
    await page.goto("/");
    const lista = page.locator("#hl-municipios");

    for (const nome of MUNICIPIOS_DO_VALE) {
      await expect(lista).toContainText(nome);
    }
    await expect(lista).toContainText("São Cristóvão");
    await expect(lista).toContainText("referência de comparação");
  });
});
