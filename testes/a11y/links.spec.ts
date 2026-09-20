import { expect, test } from "@playwright/test";

/**
 * Distinção de link e visibilidade do foco.
 *
 * Este arquivo existe por causa de um defeito real: enquanto o Tailwind não
 * rodava, o estilo padrão do navegador dava cor e sublinhado a todo link. Com o
 * pipeline corrigido, o `preflight` zera os dois, e cada componente passa a
 * declarar os seus. Sem teste, a regressão é invisível — a página continua
 * "funcionando", só que sem link identificável.
 *
 * A regra verificada: dentro do conteúdo principal, um link precisa de algo
 * além da cor. Sublinhado atende; preenchimento de fundo, como o da chamada
 * principal da Home, também. Cor sozinha não, porque a distância entre a tinta
 * de link e a de texto é de cerca de 1,5:1, longe dos 3:1 da WCAG 1.4.1.
 *
 * Cabeçalho e rodapé ficam fora do escopo de propósito: são landmarks de
 * navegação em que todo item é link, e não blocos de texto com link no meio.
 */

const PAGINAS = [
  "/",
  "/observatorio",
  "/pesquisa",
  "/dados",
  "/prestacao-de-contas",
  "/prestacao-de-contas/imprimir",
  "/rota-que-nao-existe",
];

for (const pagina of PAGINAS) {
  test(`links do conteúdo de ${pagina} não dependem só de cor`, async ({
    page,
  }) => {
    await page.goto(pagina);

    const indistintos = await page.locator("main a").evaluateAll((links) =>
      links
        .filter((link) => {
          // Link dentro de SVG fica fora desta regra, e não por conveniência:
          // a WCAG 1.4.1 trata de link embutido em bloco de texto, e num mapa
          // o município é um controle gráfico. Ele não depende só de cor —
          // hover e foco mudam preenchimento *e* espessura do traço, o que é
          // verificado em `mapa.spec.ts`. Sublinhar um polígono não significa
          // nada.
          if (
            link.closest("svg") !== null ||
            link.closest(
              "header, footer, nav, .cabecalho-prototipo, .hl-topo, .hl-rodape",
            ) !== null
          )
            return false;

          const estilo = getComputedStyle(link);
          const sublinhado = estilo.textDecorationLine.includes("underline");
          const fundo = estilo.backgroundColor;
          const temFundo =
            fundo !== "transparent" && fundo !== "rgba(0, 0, 0, 0)";
          // Contorno tambem distingue sem depender de cor: e o caso dos
          // botoes vazados, que tem borda visivel e fundo transparente.
          const temBorda =
            Number.parseFloat(estilo.borderTopWidth) > 0 ||
            Number.parseFloat(estilo.borderBottomWidth) > 0;
          return !sublinhado && !temFundo && !temBorda;
        })
        .map((link) => link.textContent?.trim().slice(0, 60) ?? ""),
    );

    expect(indistintos, `links sem sublinhado nem fundo em ${pagina}`).toEqual(
      [],
    );
  });
}

test("o foco no cabeçalho não usa a tinta que some sobre o fundo escuro", async ({
  page,
}) => {
  await page.goto("/");

  // `:focus-visible` depende de foco por teclado: `element.focus()` não o
  // ativa em link no Chromium. Daí o Tab — o primeiro leva ao "pular para o
  // conteúdo", o segundo ao link de identificação do cabeçalho.
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");

  const foco = await page.evaluate(() => {
    const alvo = document.activeElement;
    if (!(alvo instanceof HTMLElement)) return null;
    const estilo = getComputedStyle(alvo);
    return {
      texto: alvo.textContent?.trim().slice(0, 40) ?? "",
      dentroDoCabecalho: Boolean(alvo.closest("header")),
      cor: estilo.outlineColor,
      estilo: estilo.outlineStyle,
    };
  });

  expect(foco?.dentroDoCabecalho).toBe(true);
  expect(foco?.estilo).toBe("solid");
  // milho (#e8b23a) sobre mata dá 7,4:1; anil (#1f3a5f) daria cerca de 1,25:1.
  expect(foco?.cor).toBe("rgb(232, 178, 58)");
});
