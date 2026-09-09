import { expect, test } from "@playwright/test";

/**
 * Tema no navegador — Fase H0.
 *
 * A fundação de tema não tem interface: a Central de Acessibilidade é da H4.
 * O que existe agora é a cascata do `tokens.css` mais um script de ~130 bytes
 * no `<head>`. Estes testes verificam justamente isso — que o comportamento
 * está inteiro **antes** de existir qualquer controle na tela.
 *
 * O ponto mais importante é o último grupo: sem JavaScript, o tema continua
 * seguindo o sistema. Se um dia alguém trocar a cascata por um provedor
 * client-side, é aqui que a regressão aparece.
 */

const CHAVE = "observatorio-tema";

/** Lê o valor computado de um token no `<html>`. */
async function token(
  page: import("@playwright/test").Page,
  nome: string,
): Promise<string> {
  return page.evaluate(
    (n) =>
      getComputedStyle(document.documentElement).getPropertyValue(n).trim(),
    nome,
  );
}

async function corDoBody(
  page: import("@playwright/test").Page,
): Promise<string> {
  return page.evaluate(() => getComputedStyle(document.body).backgroundColor);
}

test.describe("tema segue o sistema na primeira visita", () => {
  test("sistema no claro pinta a página clara, sem data-tema", async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");

    await expect(page.locator("html")).not.toHaveAttribute("data-tema", /.*/);
    expect(await token(page, "--color-fundo")).toBe("#f2f1ec");
    expect(await corDoBody(page)).toBe("rgb(242, 241, 236)");
  });

  test("sistema no escuro pinta a página escura, sem data-tema", async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");

    await expect(page.locator("html")).not.toHaveAttribute("data-tema", /.*/);
    expect(await token(page, "--color-fundo")).toBe("#0e1611");
    expect(await corDoBody(page)).toBe("rgb(14, 22, 17)");
  });

  /**
   * `color-scheme` é o que faz o navegador pintar campo de formulário, barra
   * de rolagem e a área além do documento no tema certo. Sem ele, o input
   * continua branco dentro da página escura.
   */
  test("color-scheme acompanha o sistema", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    expect(
      await page.evaluate(
        () => getComputedStyle(document.documentElement).colorScheme,
      ),
    ).toBe("dark");
  });
});

test.describe("escolha manual vence o sistema", () => {
  test("escuro salvo sobrepõe um sistema claro", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.addInitScript(
      ({ chave, valor }) => localStorage.setItem(chave, valor),
      { chave: CHAVE, valor: "escuro" },
    );
    await page.goto("/");

    await expect(page.locator("html")).toHaveAttribute("data-tema", "escuro");
    expect(await token(page, "--color-fundo")).toBe("#0e1611");
  });

  test("claro salvo sobrepõe um sistema escuro", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.addInitScript(
      ({ chave, valor }) => localStorage.setItem(chave, valor),
      { chave: CHAVE, valor: "claro" },
    );
    await page.goto("/");

    await expect(page.locator("html")).toHaveAttribute("data-tema", "claro");
    expect(await token(page, "--color-fundo")).toBe("#f2f1ec");
  });

  /** "sistema" é ausência de escolha: não escreve atributo nenhum. */
  test("sistema salvo devolve a decisão ao sistema operacional", async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.addInitScript(
      ({ chave, valor }) => localStorage.setItem(chave, valor),
      { chave: CHAVE, valor: "sistema" },
    );
    await page.goto("/");

    await expect(page.locator("html")).not.toHaveAttribute("data-tema", /.*/);
    expect(await token(page, "--color-fundo")).toBe("#0e1611");
  });

  test("valor corrompido não quebra nada e cai no sistema", async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.addInitScript(
      ({ chave, valor }) => localStorage.setItem(chave, valor),
      { chave: CHAVE, valor: "roxo-neon" },
    );
    await page.goto("/");

    await expect(page.locator("html")).not.toHaveAttribute("data-tema", /.*/);
    expect(await token(page, "--color-fundo")).toBe("#f2f1ec");
  });
});

test.describe("sem flash de tema", () => {
  /**
   * O flash acontece quando a escolha manual só é aplicada depois da
   * hidratação: a primeira pintura sai clara e a página escurece na frente do
   * usuário. O script no `<head>` existe para impedir isso, e este teste
   * confirma que o atributo chega **antes** de o `<body>` existir.
   */
  test("o atributo é aplicado antes de o corpo ser analisado", async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.addInitScript(
      ({ chave, valor }) => localStorage.setItem(chave, valor),
      { chave: CHAVE, valor: "escuro" },
    );

    const cedo: (string | null)[] = [];
    await page.exposeFunction("registrarTema", (v: string | null) => {
      cedo.push(v);
    });
    await page.addInitScript(() => {
      document.addEventListener(
        "readystatechange",
        () => {
          if (document.readyState === "interactive") {
            (
              window as unknown as {
                registrarTema: (v: string | null) => void;
              }
            ).registrarTema(document.documentElement.getAttribute("data-tema"));
          }
        },
        { once: true },
      );
    });

    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-tema", "escuro");
    expect(cedo).toContain("escuro");
  });

  test("a hidratação não reclama do atributo escrito pelo script", async ({
    page,
  }) => {
    const erros: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error") erros.push(m.text());
    });
    page.on("pageerror", (e) => erros.push(e.message));

    await page.addInitScript(
      ({ chave, valor }) => localStorage.setItem(chave, valor),
      { chave: CHAVE, valor: "escuro" },
    );
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const hidratacao = erros.filter((e) =>
      /hydrat|did not match|server (?:HTML|rendered)/i.test(e),
    );
    expect(hidratacao).toEqual([]);
  });
});

test.describe("tema sem JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  /**
   * A regra que a H0 não pode perder: o tema é cascata de CSS, não estado de
   * componente. Com JavaScript desligado, `prefers-color-scheme` continua
   * decidindo — a escolha manual é que deixa de ser aplicada, e isso é
   * esperado, porque ela vive no armazenamento local.
   */
  test("o sistema escuro continua valendo sem JavaScript", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    expect(await corDoBody(page)).toBe("rgb(14, 22, 17)");
  });

  test("o sistema claro continua valendo sem JavaScript", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    expect(await corDoBody(page)).toBe("rgb(242, 241, 236)");
  });
});

/**
 * Converte uma duração CSS em milissegundos.
 *
 * O Tailwind normaliza a unidade ao emitir o CSS — `150ms` chega ao navegador
 * como `.15s`, e `0ms` como `0s`. Comparar a string devolvida seria testar o
 * formatador do Tailwind, não o comportamento do projeto.
 */
function emMilissegundos(valor: string): number {
  const n = Number.parseFloat(valor);
  return valor.trim().endsWith("ms") ? n : n * 1000;
}

test.describe("movimento reduzido", () => {
  test("zera os tokens de duração", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    for (const nome of [
      "--duracao-hover",
      "--duracao-revelacao",
      "--duracao-painel",
    ]) {
      expect(emMilissegundos(await token(page, nome))).toBe(0);
    }
  });

  test("sem a preferência, as durações valem", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    expect(emMilissegundos(await token(page, "--duracao-hover"))).toBe(150);
  });
});

test.describe("foco visível nos dois temas", () => {
  for (const [rotulo, esquema, corEsperada] of [
    ["claro", "light", "rgb(31, 58, 95)"],
    ["escuro", "dark", "rgb(232, 178, 58)"],
  ] as const) {
    test(`o contorno de foco muda de cor no tema ${rotulo}`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme: esquema });
      await page.goto("/");
      await page.keyboard.press("Tab");

      const contorno = await page.evaluate(() => {
        const alvo = document.activeElement;
        if (alvo === null) return null;
        const estilo = getComputedStyle(alvo);
        return { cor: estilo.outlineColor, largura: estilo.outlineWidth };
      });

      expect(contorno?.cor).toBe(corEsperada);
      expect(contorno?.largura).toBe("3px");
    });
  }
});
