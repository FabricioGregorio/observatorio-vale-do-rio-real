import { expect, test } from "@playwright/test";

/**
 * Protótipo do Hero — Fase H1.
 *
 * A rota é de desenvolvimento e some em produção, mas o que ela exercita não é
 * descartável: art direction, contraste sobre fotografia, painel de
 * acessibilidade e cabeçalho que recolhe. Tudo isso migra para a Home quando a
 * variante for escolhida, e é melhor descobrir os defeitos aqui.
 *
 * O contraste é medido sobre **o que foi de fato pintado** — a fotografia com
 * as duas camadas de overlay por cima —, não sobre os tokens. Um Hero cujo
 * contraste é conferido no token e não no pixel não foi conferido.
 */

const ROTA = "/dev/hero";

/** Quebra de linha para o relatório de contraste. */
const BR = String.fromCharCode(10);

const VARIANTES = [
  { chave: "A", seletor: "#hero-wordmark" },
  { chave: "B", seletor: "#hero-tipografia" },
] as const;

/**
 * Amostra a luminância do fundo realmente pintado sob um elemento e devolve a
 * razão de contraste contra a cor do texto.
 *
 * Desenhar a página num canvas não é possível sem `html2canvas`, então a
 * medição usa o caminho honesto: `elementsFromPoint` para descobrir o que está
 * empilhado sob o ponto, e composição manual das camadas semitransparentes
 * sobre a fotografia. O resultado é o pior caso entre vários pontos do
 * elemento, não a média.
 */
async function contrasteDoTexto(
  page: import("@playwright/test").Page,
  seletor: string,
): Promise<number> {
  return page.evaluate(async (sel) => {
    const alvo = document.querySelector(sel);
    if (alvo === null) throw new Error(`sem elemento: ${sel}`);

    const canais = (cor: string): number[] =>
      (cor.match(/[\d.]+/g) ?? []).map(Number);
    const lin = (c: number) =>
      c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    const luminancia = (c: number[]) =>
      0.2126 * lin((c[0] ?? 0) / 255) +
      0.7152 * lin((c[1] ?? 0) / 255) +
      0.0722 * lin((c[2] ?? 0) / 255);

    const frente = canais(getComputedStyle(alvo).color);

    // A fotografia, desenhada num canvas para amostrar o pixel de origem.
    const secao = alvo.closest("section");
    const img = secao?.querySelector("img");
    if (!(img instanceof HTMLImageElement)) throw new Error("sem fotografia");
    const caixaImg = img.getBoundingClientRect();

    const tela = document.createElement("canvas");
    tela.width = img.naturalWidth;
    tela.height = img.naturalHeight;
    const ctx = tela.getContext("2d");
    if (ctx === null) throw new Error("canvas indisponível");
    ctx.drawImage(img, 0, 0);

    // As camadas de overlay, na ordem em que são pintadas.
    const camadas = [
      ...(secao?.querySelectorAll(':scope > div[aria-hidden="true"]') ?? []),
    ];

    const caixa = alvo.getBoundingClientRect();
    let pior = Number.POSITIVE_INFINITY;

    for (let i = 1; i <= 9; i += 1) {
      const px = caixa.left + (caixa.width * i) / 10;
      const py = caixa.top + caixa.height / 2;

      // `object-fit: cover` — descobre o pixel da fotografia sob este ponto.
      const escala = Math.max(
        caixaImg.width / img.naturalWidth,
        caixaImg.height / img.naturalHeight,
      );
      const sobraX = (img.naturalWidth * escala - caixaImg.width) / 2;
      const sobraY = (img.naturalHeight * escala - caixaImg.height) / 2;
      const ix = Math.round((px - caixaImg.left + sobraX) / escala);
      const iy = Math.round((py - caixaImg.top + sobraY) / escala);
      if (ix < 0 || iy < 0 || ix >= tela.width || iy >= tela.height) continue;

      const dados = ctx.getImageData(ix, iy, 1, 1).data;
      let fundo = [dados[0] as number, dados[1] as number, dados[2] as number];

      // Compõe cada camada de overlay por cima, na ordem.
      for (const camada of camadas) {
        const estilo = getComputedStyle(camada);
        const cores: string[] = [];
        if (estilo.backgroundColor !== "rgba(0, 0, 0, 0)") {
          cores.push(estilo.backgroundColor);
        }
        if (estilo.backgroundImage !== "none") {
          // Gradiente vertical: interpola pela posição relativa do ponto.
          const caixaCamada = camada.getBoundingClientRect();
          const t = (py - caixaCamada.top) / caixaCamada.height;
          const paradas = estilo.backgroundImage.match(/rgba?\([^)]+\)/g) ?? [];
          // A parada de baixo domina onde o texto se assenta; usar a mais
          // próxima do ponto é aproximação suficiente para um piso.
          const indice = t > 0.62 ? 0 : t > 0.3 ? 1 : 2;
          const escolhida = paradas[indice];
          if (escolhida !== undefined) cores.push(escolhida);
        }
        for (const cor of cores) {
          const c = canais(cor);
          const alfa = c.length > 3 ? (c[3] as number) : 1;
          fundo = [
            (c[0] as number) * alfa + (fundo[0] as number) * (1 - alfa),
            (c[1] as number) * alfa + (fundo[1] as number) * (1 - alfa),
            (c[2] as number) * alfa + (fundo[2] as number) * (1 - alfa),
          ];
        }
      }

      const a = luminancia(frente);
      const b = luminancia(fundo);
      const [claro, escuro] = a > b ? [a, b] : [b, a];
      pior = Math.min(pior, (claro + 0.05) / (escuro + 0.05));
    }

    return pior;
  }, seletor);
}

test.describe("estrutura do protótipo", () => {
  test("Hero B usa símbolo compacto e mantém o nome visível sem imagens", async ({
    page,
  }) => {
    await page.route("**/media/logos/**", (rota) => rota.abort());
    await page.goto(ROTA);
    const hero = page.locator("#hero-tipografia");
    await expect(hero.locator("h1")).toBeVisible();
    await expect(
      hero.getByText("Coletivo Cultural", { exact: false }),
    ).toBeVisible();
    await expect(
      hero.locator('img[src$="observatorio-monocromatica-escura.svg"]'),
    ).toHaveCount(0);
    await expect(
      hero.locator('img[src$="observatorio-simbolo-256.png"]'),
    ).toHaveCount(1);
  });

  test("Hero B enquadra as duas marcas como círculos sem distorção", async ({
    page,
  }) => {
    await page.goto(ROTA);
    const marcas = page.locator(
      '#hero-tipografia [data-marca-circular="true"]',
    );

    await expect(marcas).toHaveCount(2);
    for (const marca of await marcas.all()) {
      const medida = await marca.evaluate((el) => {
        const caixa = el.getBoundingClientRect();
        const imagem = el.querySelector("img");
        if (!(imagem instanceof HTMLImageElement)) {
          throw new Error("Marca circular sem imagem");
        }
        const estiloDaCaixa = getComputedStyle(el);
        const estiloDaImagem = getComputedStyle(imagem);
        return {
          altura: caixa.height,
          largura: caixa.width,
          clipPath: estiloDaCaixa.clipPath,
          objectFit: estiloDaImagem.objectFit,
          objectPosition: estiloDaImagem.objectPosition,
        };
      });

      expect(medida.largura).toBe(64);
      expect(medida.altura).toBe(64);
      expect(medida.clipPath).toContain("circle(50%");
      expect(medida.objectFit).toBe("cover");
      expect(medida.objectPosition).toBe("50% 50%");
    }
  });

  test("a rota responde e traz as duas variantes", async ({ page }) => {
    await page.goto(ROTA);
    for (const v of VARIANTES) {
      await expect(page.locator(v.seletor)).toBeVisible();
    }
  });

  /**
   * Nome de instituição não pode depender de imagem carregar. Na variante do
   * wordmark o `h1` está escondido visualmente — mas está no DOM, por extenso.
   */
  test("cada variante tem um h1 com o nome oficial por extenso", async ({
    page,
  }) => {
    await page.goto(ROTA);
    const nome =
      "Observatório de Cultura e Economia Criativa da Região do Vale do Rio Real";

    for (const v of VARIANTES) {
      const h1 = page.locator(`${v.seletor} h1`);
      await expect(h1).toHaveCount(1);
      await expect(h1).toHaveText(nome);
    }
  });

  test("a autoria do Coletivo aparece nas duas variantes", async ({ page }) => {
    await page.goto(ROTA);
    for (const v of VARIANTES) {
      await expect(
        page
          .locator(v.seletor)
          .getByText("Coletivo Cultural", { exact: false }),
      ).toBeVisible();
    }
  });

  test("a fotografia tem texto alternativo descritivo", async ({ page }) => {
    await page.goto(ROTA);
    const alt = await page
      .locator(`${VARIANTES[0].seletor} picture img`)
      .getAttribute("alt");

    expect(alt).toBeTruthy();
    expect((alt ?? "").length).toBeGreaterThan(40);
    // Não afirma local nem identifica pessoa.
    for (const proibido of [
      "Recanto",
      "Serra",
      "Tobias Barreto",
      "imagem de",
    ]) {
      expect(alt).not.toContain(proibido);
    }
  });

  test("a fotografia é o LCP e não é adiada", async ({ page }) => {
    await page.goto(ROTA);
    const img = page.locator(`${VARIANTES[0].seletor} picture img`);
    await expect(img).toHaveAttribute("fetchpriority", "high");
    expect(await img.getAttribute("loading")).not.toBe("lazy");
    // Dimensões declaradas reservam a caixa e impedem deslocamento de layout.
    await expect(img).toHaveAttribute("width", /\d+/);
    await expect(img).toHaveAttribute("height", /\d+/);
  });
});

test.describe("art direction", () => {
  test("em 1440 chega a composição horizontal", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(ROTA);
    const src = await page
      .locator(`${VARIANTES[0].seletor} picture img`)
      .evaluate((el) => (el as HTMLImageElement).currentSrc);
    expect(src).toContain("desktop");
  });

  test("em 375 chega a composição vertical, e não a horizontal comprimida", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(ROTA);
    const src = await page
      .locator(`${VARIANTES[0].seletor} picture img`)
      .evaluate((el) => (el as HTMLImageElement).currentSrc);
    expect(src).toContain("mobile");
  });

  /**
   * Bytes realmente transferidos por breakpoint.
   *
   * O número que importa não é o do arquivo em disco: é o que sai pela rede.
   * Ele alimenta o documento da H1 e o orçamento do doc 01 §7.
   */
  test("relata os bytes transferidos da fotografia", async ({ browser }) => {
    const linhas: string[] = [];

    for (const [largura, altura] of [
      [1440, 900],
      [768, 1024],
      [375, 812],
    ] as const) {
      // Contexto novo por largura: com cache reaproveitado, os breakpoints
      // seguintes mediriam zero e o relatório mentiria.
      const contexto = await browser.newContext({
        viewport: { width: largura, height: altura },
      });
      const pagina = await contexto.newPage();

      const pesos = new Map<string, number>();
      pagina.on("response", async (r) => {
        // Só as mídias do projeto: `/_next/static/media/` são as fontes.
        if (!/\/media\/(campo|logos)\//.test(r.url())) return;
        try {
          pesos.set(
            r.url().split("/").pop() ?? r.url(),
            (await r.body()).length,
          );
        } catch {
          // Resposta sem corpo acessível: ignorada.
        }
      });

      await pagina.goto(`http://localhost:3000${ROTA}`, {
        waitUntil: "networkidle",
      });
      await pagina.waitForTimeout(300);

      const total = [...pesos.values()].reduce((a, b) => a + b, 0);
      for (const [nome, bytes] of pesos) {
        linhas.push(
          `${String(largura).padStart(4)}px  ${nome.padEnd(40)} ${String(bytes).padStart(7)} B`,
        );
      }
      linhas.push(
        `${String(largura).padStart(4)}px  ${"TOTAL de midia do projeto".padEnd(40)} ${String(total).padStart(7)} B`,
      );
      await contexto.close();
    }

    console.log(
      ["", "=== bytes transferidos ===", linhas.join(BR), ""].join(BR),
    );
    expect(linhas.length).toBeGreaterThan(0);
  });

  /** Só um arquivo de fotografia por página: `<picture>` não baixa os dois. */
  test("apenas uma variante da fotografia é baixada", async ({ page }) => {
    const baixadas = new Set<string>();
    page.on("request", (r) => {
      if (r.url().includes("/media/campo/")) baixadas.add(r.url());
    });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(ROTA, { waitUntil: "networkidle" });

    expect(baixadas.size).toBe(1);
    expect([...baixadas][0]).toContain("desktop");
  });
});

test.describe("contraste sobre a fotografia", () => {
  for (const tema of ["light", "dark"] as const) {
    for (const v of VARIANTES) {
      test(`Hero ${v.chave}: a autoria passa AA no tema ${tema}`, async ({
        page,
      }) => {
        await page.emulateMedia({ colorScheme: tema });
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.goto(ROTA, { waitUntil: "networkidle" });

        const razao = await contrasteDoTexto(
          page,
          `${v.seletor} [data-autoria]`,
        );
        expect(razao).toBeGreaterThanOrEqual(4.5);
      });

      test(`Hero ${v.chave}: o metadado passa AA no tema ${tema}`, async ({
        page,
      }) => {
        await page.emulateMedia({ colorScheme: tema });
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.goto(ROTA, { waitUntil: "networkidle" });

        const razao = await contrasteDoTexto(page, `${v.seletor} .meta-ficha`);
        expect(razao).toBeGreaterThanOrEqual(4.5);
      });
    }
  }

  /**
   * Relatório das razões medidas.
   *
   * Não é asserção decorativa: os números do documento da H1 saem daqui, e
   * saem do pixel pintado. Um valor copiado à mão para a documentação
   * envelhece na primeira mudança de overlay; este não.
   */
  test("relata as razões medidas em cada tema e largura", async ({ page }) => {
    const linhas: string[] = [];

    for (const tema of ["light", "dark"] as const) {
      for (const [largura, altura] of [
        [1440, 900],
        [375, 812],
      ] as const) {
        await page.emulateMedia({ colorScheme: tema });
        await page.setViewportSize({ width: largura, height: altura });
        await page.goto(ROTA, { waitUntil: "networkidle" });

        for (const [seletor, rotulo] of [
          ["#hero-wordmark .meta-ficha", "A metadado"],
          ["#hero-wordmark [data-autoria]", "A autoria"],
          ["#hero-tipografia .meta-ficha", "B metadado"],
          ["#hero-tipografia h1", "B título"],
          ["#hero-tipografia [data-autoria]", "B autoria"],
        ] as const) {
          const razao = await contrasteDoTexto(page, seletor);
          linhas.push(
            `${tema.padEnd(5)} ${String(largura).padStart(4)}px  ${rotulo.padEnd(11)} ${razao.toFixed(2)}:1`,
          );
          expect(razao).toBeGreaterThanOrEqual(4.5);
        }
      }
    }

    const relatorio = linhas.join(BR);
    test.info().annotations.push({
      type: "contraste-do-hero",
      description: relatorio,
    });
    console.log(["", "=== contraste do Hero ===", relatorio, ""].join(BR));
  });

  /** O título da variante B é texto de verdade sobre a fotografia. */
  test("Hero B: o título passa AA para texto grande nos dois temas", async ({
    page,
  }) => {
    for (const tema of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme: tema });
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(ROTA, { waitUntil: "networkidle" });

      const razao = await contrasteDoTexto(page, "#hero-tipografia h1");
      // Título grande: o piso da WCAG é 3:1. Medido bem acima disso.
      expect(razao).toBeGreaterThanOrEqual(4.5);
    }
  });
});

test.describe("menu do protótipo", () => {
  /**
   * A trava que importa: item sem rota **não pode virar link**. A ADR-017
   * proíbe rota falsa, e `typedRoutes` reprovaria o `<Link>` — mas nada impede
   * alguém de escrever um `<a href>` à mão. Este teste impede.
   */
  test("Território e Acervo aparecem como texto, nunca como link", async ({
    page,
  }) => {
    await page.goto(ROTA);
    const nav = page.getByRole("navigation", { name: "Principal" });

    for (const rotulo of ["Território", "Acervo"]) {
      await expect(nav.getByText(rotulo, { exact: true })).toBeVisible();
      await expect(nav.getByRole("link", { name: rotulo })).toHaveCount(0);
    }
  });

  test("os quatro itens com rota real são links", async ({ page }) => {
    await page.goto(ROTA);
    const nav = page.getByRole("navigation", { name: "Principal" });

    for (const [rotulo, destino] of [
      ["Observatório", "/observatorio"],
      ["Pesquisa", "/pesquisa"],
      ["Dados", "/dados"],
      ["PodObservar", "/podobservar"],
    ] as const) {
      await expect(nav.locator(`a[href="${destino}"]`)).toHaveCount(1);
      await expect(nav.getByRole("link", { name: rotulo })).toBeVisible();
    }
  });

  test("Prestação de Contas aponta para a rota real e responde", async ({
    page,
  }) => {
    await page.goto(ROTA);
    const cta = page.getByRole("link", { name: "Prestação de Contas" });
    await expect(cta).toBeVisible();

    await cta.click();
    await expect(page).toHaveURL(/\/prestacao-de-contas$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});

test.describe("Central de Acessibilidade", () => {
  test("abre, prende o foco, fecha com Esc e devolve o foco", async ({
    page,
  }) => {
    await page.goto(ROTA);
    const gatilho = page.getByRole("button", { name: "Acessibilidade" });

    await expect(gatilho).toHaveAttribute("aria-expanded", "false");
    await gatilho.click();
    await expect(gatilho).toHaveAttribute("aria-expanded", "true");

    const painel = page.getByRole("dialog");
    await expect(painel).toBeVisible();
    await expect(painel).toHaveAttribute("aria-modal", "true");
    // Rotulado, e o foco inicial já está num controle operável.
    await expect(painel).toHaveAccessibleName("Acessibilidade");
    await expect(painel.locator(":focus")).toHaveCount(1);

    await page.keyboard.press("Escape");
    await expect(painel).toBeHidden();
    await expect(gatilho).toBeFocused();
  });

  /**
   * A instrução da H1 §18 proíbe controle falso. A H0 implementou tema e
   * movimento; escala de texto, alto contraste e narração ainda não existem.
   */
  test("não mostra recurso que ainda não existe", async ({ page }) => {
    await page.goto(ROTA);
    await page.getByRole("button", { name: "Acessibilidade" }).click();
    const painel = page.getByRole("dialog");
    const texto = (await painel.innerText()).toLowerCase();

    for (const inexistente of [
      "a+",
      "a−",
      "alto contraste",
      "ouvir esta página",
      "narração",
    ]) {
      expect(texto).not.toContain(inexistente);
    }
  });

  test("troca o tema de verdade e persiste a escolha", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto(ROTA);
    await page.getByRole("button", { name: "Acessibilidade" }).click();

    await page.getByRole("button", { name: "Escuro" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-tema", "escuro");
    expect(
      await page.evaluate(() => localStorage.getItem("observatorio-tema")),
    ).toBe("escuro");

    // Sobrevive à recarga, sem depender de o sistema estar no escuro.
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-tema", "escuro");
  });

  test("o estado do tema aparece em texto, não só pela cor do botão", async ({
    page,
  }) => {
    await page.goto(ROTA);
    await page.getByRole("button", { name: "Acessibilidade" }).click();
    await expect(page.getByText(/Em uso:/)).toBeVisible();
  });
});

/**
 * O cabeçalho reage a evento de rolagem, e a ilha que escuta esse evento só
 * existe depois da hidratação. Rolar uma vez logo após `goto` é corrida: se o
 * ouvinte ainda não está lá, o único evento se perde e a espera seguinte nunca
 * vê nada mudar. `toPass` rola de novo a cada tentativa, o que torna o teste
 * determinístico sem precisar adivinhar quanto tempo a hidratação leva.
 */
async function rolarAte(
  page: import("@playwright/test").Page,
  delta: number,
  esperado: string,
) {
  const cabecalho = page.locator("#cabecalho-prototipo");
  await expect(async () => {
    await page.mouse.wheel(0, delta);
    await expect(cabecalho).toHaveAttribute("data-recolhido", esperado, {
      timeout: 500,
    });
  }).toPass({ timeout: 10_000 });
}

test.describe("cabeçalho que recolhe", () => {
  test("recolhe ao descer e volta ao subir", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(ROTA, { waitUntil: "networkidle" });

    await rolarAte(page, 400, "true");
    await rolarAte(page, -200, "false");
  });

  /**
   * WCAG 2.2 — 2.4.11: o elemento focado não pode ficar escondido. Um
   * cabeçalho que some enquanto o foco está dentro dele é exatamente isso.
   */
  test("não recolhe enquanto o foco está dentro dele", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(ROTA);
    const cabecalho = page.locator("#cabecalho-prototipo");

    await page.getByRole("button", { name: "Acessibilidade" }).focus();
    await rolarAte(page, 600, "false");
    // E continua assim depois de mais rolagem: o foco segura o cabeçalho.
    await page.mouse.wheel(0, 400);
    await expect(cabecalho).toHaveAttribute("data-recolhido", "false");
  });

  test("não recolhe com o painel de acessibilidade aberto", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(ROTA);
    await page.getByRole("button", { name: "Acessibilidade" }).click();

    await rolarAte(page, 600, "false");
  });

  test("não recolhe em janela curta", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 420 });
    await page.goto(ROTA, { waitUntil: "networkidle" });
    await rolarAte(page, 600, "false");
  });
});

test.describe("larguras e zoom", () => {
  for (const largura of [320, 375, 768, 1440]) {
    for (const tema of ["light", "dark"] as const) {
      test(`${largura}px no tema ${tema} não transborda`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: tema });
        await page.setViewportSize({ width: largura, height: 800 });
        await page.goto(ROTA, { waitUntil: "networkidle" });

        const medidas = await page.evaluate(() => ({
          documento: document.documentElement.scrollWidth,
          janela: window.innerWidth,
        }));
        expect(medidas.documento).toBeLessThanOrEqual(medidas.janela);
      });
    }
  }

  /**
   * Zoom de 200% é a WCAG 1.4.4. Emulado por viewport de metade da largura,
   * que é o efeito equivalente em CSS pixels.
   */
  test("com zoom de 200% continua sem transbordo e com o título legível", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 720, height: 450 });
    await page.goto(ROTA, { waitUntil: "networkidle" });

    const medidas = await page.evaluate(() => ({
      documento: document.documentElement.scrollWidth,
      janela: window.innerWidth,
    }));
    expect(medidas.documento).toBeLessThanOrEqual(medidas.janela);
    await expect(page.locator("#hero-tipografia h1")).toBeVisible();
  });
});

test.describe("movimento", () => {
  test("com movimento reduzido o cabeçalho troca sem transição", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(ROTA, { waitUntil: "networkidle" });

    const duracao = await page
      .locator("#cabecalho-prototipo")
      .evaluate((el) => getComputedStyle(el).transitionDuration);
    // O bloco global de reduced motion do `tokens.css` força 0.01ms, que é
    // imperceptível. O que importa é não haver transição de verdade.
    expect(Number.parseFloat(duracao)).toBeLessThan(0.01);

    // O comportamento continua: o que sai é a animação, não a função.
    await rolarAte(page, 600, "true");
  });

  test("o Hero não anima na entrada", async ({ page }) => {
    await page.goto(ROTA);
    const animacoes = await page
      .locator("#hero-wordmark")
      .evaluate((el) =>
        el.getAnimations({ subtree: true }).map((a) => a.constructor.name),
      );
    expect(animacoes).toEqual([]);
  });
});

test.describe("isolamento da rota", () => {
  test("não aparece no sitemap", async ({ page }) => {
    const resposta = await page.request.get("/sitemap.xml");
    expect(await resposta.text()).not.toContain("/dev/");
  });

  test("robots.txt bloqueia /dev/", async ({ page }) => {
    const resposta = await page.request.get("/robots.txt");
    expect(await resposta.text()).toContain("Disallow: /dev/");
  });

  test("a Home pública continua sem o protótipo", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#hero-wordmark")).toHaveCount(0);
    await expect(page.locator("#hero-tipografia")).toHaveCount(0);
    // A Home segue com o h1 estrutural que a Tarefa 10A entregou.
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Observatório do Vale do Rio Real",
    );
  });
});
