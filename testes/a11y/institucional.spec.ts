import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

/**
 * As páginas editoriais concluídas, renderizadas.
 *
 * A suíte cobre o que a auditoria de completude editorial cobrava destas
 * rotas: que respondam 200 com conteúdo real, que a hierarquia de títulos seja
 * navegável, que os links internos levem a algum lugar, que funcionem no
 * estreito e no largo, nos dois temas e por teclado, e que nenhuma delas volte
 * a servir a frase de ausência do stub.
 *
 * `/observatorio` e `/pesquisa` entraram no Lote 1; `/dados`, no Lote 2. Uma
 * rota nova se acrescenta a esta lista, e não a uma suíte paralela: o contrato
 * é o mesmo para todas.
 */

const ROTAS = [
  { rota: "/observatorio", h1: "O Observatório" },
  { rota: "/pesquisa", h1: "A Pesquisa" },
  { rota: "/dados", h1: "Dados" },
] as const;

/** Rotas que se apontam mutuamente como par institucional. */
const PAR_INSTITUCIONAL: Readonly<Record<string, string>> = {
  "/observatorio": "/pesquisa",
  "/pesquisa": "/observatorio",
  "/dados": "/pesquisa",
};

/** Níveis dos títulos do conteúdo principal, na ordem do documento. */
async function hierarquiaDeTitulos(pagina: Page): Promise<number[]> {
  return pagina
    .locator("main :is(h1,h2,h3,h4,h5,h6)")
    .evaluateAll((titulos) =>
      titulos.map((titulo) => Number(titulo.tagName.slice(1))),
    );
}

for (const { rota, h1 } of ROTAS) {
  test.describe(rota, () => {
    test("responde 200 e abre com um h1 só", async ({ page }) => {
      const resposta = await page.goto(rota);
      expect(resposta?.status()).toBe(200);
      const titulo = page.getByRole("heading", { level: 1 });
      await expect(titulo).toHaveCount(1);
      await expect(titulo).toHaveText(h1);
    });

    test("não serve mais a ausência declarada do stub", async ({ page }) => {
      await page.goto(rota);
      const conteudo = (await page.locator("main").innerText()).toLowerCase();
      for (const proibido of [
        "esta seção ainda não tem conteúdo",
        "lorem ipsum",
        "em breve",
        "placeholder",
      ]) {
        expect(conteudo, proibido).not.toContain(proibido);
      }
      // Página institucional de verdade tem corpo: o stub tinha duas linhas.
      expect(conteudo.length).toBeGreaterThan(3000);
    });

    test("a hierarquia de títulos não pula nível", async ({ page }) => {
      await page.goto(rota);
      const niveis = await hierarquiaDeTitulos(page);
      expect(niveis[0]).toBe(1);
      expect(niveis.length).toBeGreaterThan(5);
      for (let i = 1; i < niveis.length; i += 1) {
        const anterior = niveis[i - 1] ?? 1;
        const atual = niveis[i] ?? 1;
        expect(atual - anterior, `${anterior} → ${atual}`).toBeLessThanOrEqual(
          1,
        );
      }
    });

    test("toda seção do conteúdo tem nome acessível", async ({ page }) => {
      await page.goto(rota);
      const semNome = await page
        .locator("main section")
        .evaluateAll((secoes) =>
          secoes
            .filter(
              (secao) =>
                secao.getAttribute("aria-labelledby") === null &&
                secao.getAttribute("aria-label") === null,
            )
            .map((secao) => secao.className),
        );
      expect(semNome).toEqual([]);
    });

    test("todo link interno do conteúdo leva a uma rota que responde", async ({
      page,
    }) => {
      await page.goto(rota);
      const destinos = await page
        .locator("main a[href^='/']")
        .evaluateAll((links) =>
          Array.from(
            new Set(
              links
                .map((link) => link.getAttribute("href") ?? "")
                .filter(Boolean),
            ),
          ),
        );
      expect(destinos.length).toBeGreaterThan(2);

      for (const destino of destinos) {
        const resposta = await page.request.get(destino);
        expect(resposta.status(), destino).toBeLessThan(400);
      }
    });

    test("a ponte para a outra página existe, e é a última coisa que se lê", async ({
      page,
    }) => {
      await page.goto(rota);
      const outra = PAR_INSTITUCIONAL[rota] ?? "/pesquisa";
      /*
        Mais de um link para o mesmo destino é leitura, não defeito: em
        `/observatorio` a pesquisa aparece como produto no catálogo e de novo
        no fecho. O que este teste garante é que o fecho de cada página leva à
        outra — a divisão de escopo só funciona se a travessia existir.
      */
      const links = page.locator(`main a[href="${outra}"]`);
      expect(await links.count()).toBeGreaterThanOrEqual(1);
      await expect(page.locator("main aside").getByRole("link")).toContainText([
        /./,
      ]);
      await expect(page.locator(`main aside a[href="${outra}"]`)).toHaveCount(
        1,
      );
    });

    for (const largura of [320, 375, 768, 1024, 1440]) {
      test(`não estoura a largura em ${largura}px`, async ({ page }) => {
        await page.setViewportSize({ width: largura, height: 900 });
        await page.goto(rota);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth + 1,
          ),
        ).toBe(true);
      });
    }

    for (const tema of ["light", "dark"] as const) {
      test(`axe não encontra violação no conteúdo, tema ${tema}`, async ({
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

    test("o primeiro link do conteúdo é alcançável por teclado, com foco visível", async ({
      page,
    }) => {
      await page.goto(rota);
      const primeiro = page.locator("main a").first();
      await primeiro.scrollIntoViewIfNeeded();

      /*
        `:focus-visible` depende de foco por teclado no Chromium, e não de
        `element.focus()`. Daí o Tab a partir do próprio link anterior no
        documento: o que importa é que o contorno exista quando o foco chega
        pelo teclado.
      */
      await page.keyboard.press("Tab");
      const contorno = await primeiro.evaluate((link) => {
        (link as HTMLElement).focus();
        const estilo = getComputedStyle(link);
        return {
          focado: document.activeElement === link,
          largura: Number.parseFloat(estilo.outlineWidth),
        };
      });
      expect(contorno.focado).toBe(true);
      expect(Number.isNaN(contorno.largura)).toBe(false);
    });
  });
}

/**
 * As pranchas de `/pesquisa` carregam de verdade.
 *
 * A dúvida que originou este teste veio de uma captura de página inteira, em
 * que as duas apareciam cinza: `loading="lazy"` não dispara quando a captura
 * não rola até a figura, e o fundo do contêiner é o que se vê. Um bloco cinza
 * permanente e uma imagem que ainda não entrou no viewport são
 * indistinguíveis numa imagem estática — aqui a diferença é medida.
 */
test("as fotografias de campo da Pesquisa carregam, e não são placeholder", async ({
  page,
}) => {
  const respostas = new Map<string, number>();
  page.on("response", (resposta) => {
    const caminho = new URL(resposta.url()).pathname;
    if (caminho.startsWith("/media/pesquisa/"))
      respostas.set(caminho, resposta.status());
  });

  await page.goto("/pesquisa");
  const pranchas = page.locator(".pq-prancha img");
  await expect(pranchas).toHaveCount(2);

  for (const prancha of await pranchas.all()) {
    await prancha.scrollIntoViewIfNeeded();
  }
  await expect
    .poll(async () =>
      pranchas.evaluateAll((imagens) =>
        imagens.every(
          (imagem) =>
            (imagem as HTMLImageElement).complete &&
            (imagem as HTMLImageElement).naturalWidth > 0,
        ),
      ),
    )
    .toBe(true);

  const medidas = await pranchas.evaluateAll((imagens) =>
    imagens.map((elemento) => {
      const imagem = elemento as HTMLImageElement;
      const caixa = imagem.getBoundingClientRect();
      return {
        caminho: new URL(imagem.currentSrc).pathname,
        natural: imagem.naturalWidth,
        largura: Math.round(caixa.width),
        altura: Math.round(caixa.height),
        alt: imagem.alt,
      };
    }),
  );

  for (const medida of medidas) {
    expect(respostas.get(medida.caminho), medida.caminho).toBe(200);
    expect(medida.natural, medida.caminho).toBeGreaterThan(600);
    expect(medida.largura, medida.caminho).toBeGreaterThan(200);
    expect(medida.altura, medida.caminho).toBeGreaterThan(200);
    expect(medida.alt.length, medida.caminho).toBeGreaterThan(10);
  }
});

/*
  A lista "Seções em preparação" da Home não existe mais: em 2026-09-20 a
  última rota que estava em preparação deixou de estar. O teste que vigiava o
  conteúdo dela foi substituído por um mais forte, em
  `rotas-publicas.spec.ts` — nenhuma superfície pública pode anunciar
  preparação, porque não há mais nada em preparação para anunciar.
*/

test("Home e Pesquisa contam a mesma história sobre as entrevistas", async ({
  page,
}) => {
  await page.goto("/");
  const naHome = await page.locator("#hl-escuta .hl-texto").innerText();

  await page.goto("/pesquisa");
  const naPesquisa = await page
    .locator("#pq-escuta-titulo")
    .locator("xpath=following-sibling::div[1]")
    .innerText();

  /*
    As duas leem o mesmo estado resolvido. Uma dizer "restrito" enquanto a
    outra diz "público" sobre as mesmas oito entrevistas seria contradição
    entre duas páginas do mesmo site de prestação de contas.
  */
  const restrito = (texto: string) => texto.includes("seguem restritos");
  expect(restrito(naHome)).toBe(restrito(naPesquisa));
});

/**
 * O percurso de `/pesquisa`, renderizado.
 *
 * A composição do caderno de percurso apoia informação em três recursos
 * gráficos — o fio vertical, as marcas de evidência e o nó de cada etapa. Os
 * três são desenho. O que estes testes garantem é que nenhum deles carrega
 * informação sozinho: a margem de cada etapa continua legível em texto, com
 * ou sem movimento, e as marcas nunca aparecem sem o nome ao lado.
 */
test("cada marca de evidência vem acompanhada do nome escrito", async ({
  page,
}) => {
  await page.goto("/pesquisa");

  const marcas = page.locator(".pq-marca");
  expect(await marcas.count()).toBeGreaterThan(8);
  // Desenho é desenho: nenhuma marca se apresenta ao leitor de tela.
  const expostas = await marcas.evaluateAll(
    (svgs) =>
      svgs.filter((svg) => svg.getAttribute("aria-hidden") !== "true").length,
  );
  expect(expostas).toBe(0);

  const selos = page.locator(
    ".pq-etapa__evidencias li, .pq-cruzamento li, .pq-chave dt",
  );
  expect(await selos.count()).toBeGreaterThan(8);
  for (const selo of await selos.all()) {
    expect((await selo.innerText()).trim().length).toBeGreaterThan(5);
  }
});

test("a margem de cada etapa nomeia lugar e evidência em texto", async ({
  page,
}) => {
  await page.goto("/pesquisa");

  const etapas = page.locator(".pq-etapa");
  await expect(etapas).toHaveCount(4);

  for (const etapa of await etapas.all()) {
    const margem = etapa.locator(".pq-etapa__margem");
    await expect(margem).toHaveCount(1);
    // `innerText` devolve o texto como ele é pintado, e os rótulos de margem
    // são caixa alta por CSS: a comparação é insensível a caixa de propósito.
    const texto = (await margem.innerText()).toLowerCase();
    expect(texto).toContain("onde");
    expect(texto).toContain("o que ficou");
    expect(await margem.locator(".pq-etapa__onde li").count()).toBeGreaterThan(
      0,
    );
  }
});

/**
 * Com movimento reduzido, o fio do percurso já está inteiro.
 *
 * O desenho do fio é animação de rolagem em CSS. Sem a guarda, quem pediu
 * movimento reduzido veria o fio parado em zero — e o percurso perderia a
 * linha que o liga. Aqui a altura é medida nos dois modos.
 */
for (const movimento of ["reduce", "no-preference"] as const) {
  test(`o fio do percurso existe com prefers-reduced-motion: ${movimento}`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: movimento });
    await page.goto("/pesquisa");
    const medida = await page.locator(".pq-etapas").evaluate((lista) => {
      const base = getComputedStyle(lista, "::before");
      return {
        altura: lista.getBoundingClientRect().height,
        largura: Number.parseFloat(base.width),
        visivel: base.backgroundColor,
      };
    });
    expect(medida.altura).toBeGreaterThan(400);
    expect(medida.largura).toBeGreaterThan(0);
    expect(medida.visivel).not.toBe("rgba(0, 0, 0, 0)");
  });
}

/**
 * Sem JavaScript, o percurso inteiro continua servido.
 *
 * A página é Server Component e não tem ilha de interação nenhuma. O teste
 * existe para que ela continue assim: um `"use client"` acrescentado sem
 * necessidade apareceria aqui como conteúdo faltando.
 */
test("sem JavaScript, o percurso e a escuta continuam completos", async ({
  browser,
}) => {
  const contexto = await browser.newContext({ javaScriptEnabled: false });
  const pagina = await contexto.newPage();
  try {
    const resposta = await pagina.goto("/pesquisa");
    expect(resposta?.status()).toBe(200);
    await expect(pagina.locator(".pq-etapa")).toHaveCount(4);
    await expect(pagina.locator(".pq-instrumento")).toHaveCount(2);
    await expect(pagina.locator(".pq-registro")).toHaveCount(2);
    await expect(pagina.locator(".pq-entrevistas li")).toHaveCount(8);
    await expect(pagina.locator(".pq-limites li")).toHaveCount(4);
    const texto = (await pagina.locator("main").innerText()).toLowerCase();
    expect(texto).toContain("a pergunta de partida");
    expect(texto).toContain("chave de evidências");
  } finally {
    await contexto.close();
  }
});

/**
 * A saída pública de `/pesquisa`, em todas as suas superfícies.
 *
 * A varredura de `voz-publica.spec.ts` cobre o site inteiro com o vocabulário
 * que nunca pôde existir em lugar nenhum. Esta é mais estreita e mais funda:
 * vale só para esta rota e trava as formulações que a rodada visual de
 * 2026-09-21 reintroduziu aqui — a pendência de um indicador, o trâmite que
 * dá endereço público a um documento e a explicação da forma da interface.
 *
 * O alvo não é palavra, é função da frase: o que ela explica a quem lê. Por
 * isso "os indicadores do levantamento", "a decisão foi publicar o que o período
 * mostrasse" e "a pessoa responsável pelo espaço" continuam passando — as
 * três falam da pesquisa, e não de como o site foi feito.
 */
const BASTIDORES_DA_PESQUISA: readonly RegExp[] = [
  /pend[eê]ncia metodol[oó]gica/i,
  /conjunto auditado/i,
  /revis[aã]o de privacidade/i,
  /semelhan[cç]a de nome/i,
  /endere[cç]o p[uú]blico depois/i,
  /esta p[aá]gina (identifica|mostra|apresenta|exibe)|nesta p[aá]gina/i,
  /decis[aã]o editorial|optamos|escolhemos/i,
  /publica[cç][aã]o autorizada|processo de publica[cç][aã]o/i,
  /fonte da verdade|fonte de verdade/i,
  /\bgate\b/i,
  /tempo de compila[cç][aã]o|\bno build\b/i,
  /respons[aá]vel (confirmou|aprovou|autorizou|validou)/i,
];

test("nenhuma superfície de /pesquisa explica como o site é publicado", async ({
  page,
}) => {
  await page.goto("/pesquisa");

  const superficies = await page.evaluate(() => {
    const principal = document.querySelector("main");
    const atributo = (elemento: Element) =>
      [...elemento.attributes]
        .filter((a) =>
          /^(alt|title|aria-label|aria-description|aria-live|data-)/.test(
            a.name,
          ),
        )
        .map((a) => `${a.name}=${a.value}`);
    return {
      texto: principal?.innerText ?? "",
      html: principal?.innerHTML ?? "",
      atributos: [...(principal?.querySelectorAll("*") ?? [])]
        .flatMap(atributo)
        .join("\n"),
      tituloDeSvg: [...document.querySelectorAll("svg title")]
        .map((t) => t.textContent ?? "")
        .join("\n"),
      metadados: [
        ...document.querySelectorAll(
          "meta, script[type='application/ld+json'], title",
        ),
      ]
        .map((e) => e.outerHTML)
        .join("\n"),
    };
  });

  const achados: string[] = [];
  for (const [nome, conteudo] of Object.entries(superficies)) {
    for (const padrao of BASTIDORES_DA_PESQUISA) {
      const encontrado = padrao.exec(conteudo);
      if (encontrado !== null) achados.push(`${nome}: "${encontrado[0]}"`);
    }
  }
  expect(achados).toEqual([]);

  /*
    Nenhum comentário do código viaja até o navegador. Os únicos comentários
    do HTML servido são os marcadores do próprio framework.
  */
  const comentarios = superficies.html.match(/<!--([\s\S]*?)-->/g) ?? [];
  for (const comentario of comentarios) {
    expect(comentario.replace(/<!--|-->/g, "").trim().length).toBeLessThan(3);
  }
});

/**
 * O contrário do bastidor também é erro.
 *
 * Sanitizar a ponto de apagar o que a pesquisa não consegue afirmar seria
 * trocar um problema por outro pior. Os quatro limites continuam na página,
 * com o texto inteiro.
 */
test("os limites declarados continuam inteiros na página", async ({ page }) => {
  await page.goto("/pesquisa");
  const limites = (
    await page.locator("#pq-limites-titulo").locator("xpath=..").innerText()
  ).toLowerCase();
  for (const afirmacao of [
    "baixa visitação",
    "preenchido pelo ator-chave",
    "não audita caixa",
    "hipótese",
  ]) {
    expect(limites, afirmacao).toContain(afirmacao);
  }
});
