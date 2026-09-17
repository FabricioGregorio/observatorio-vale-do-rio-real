import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

import { razaoDeContraste } from "../src/app/dev/estilos/page";

/**
 * Contraste dos tokens — Fase H0.
 *
 * A Direção Visual §5.4 decidiu que o modo escuro é primeira classe e **não é
 * inversão**. A consequência prática é que cada par cor/fundo precisa passar
 * duas vezes, e três tokens da paleta clara reprovam no escuro — anil, barro e
 * a assinatura institucional. É por isso que existem versões clareadas deles,
 * e é isso que este arquivo protege: quem trocar um valor de token por
 * estimativa visual descobre aqui, não em produção.
 *
 * A razão é calculada a partir do próprio `tokens.css`, com a fórmula da WCAG.
 * Nenhum número é copiado de comentário.
 */

const CSS = readFileSync(
  join(process.cwd(), "src", "estilos", "tokens.css"),
  "utf8",
);

function recortarBloco(css: string, abertura: string): string {
  const inicio = css.indexOf(abertura);
  if (inicio < 0) return "";
  let profundidade = 0;
  for (let i = css.indexOf("{", inicio); i < css.length; i += 1) {
    if (css[i] === "{") profundidade += 1;
    else if (css[i] === "}") {
      profundidade -= 1;
      if (profundidade === 0) return css.slice(inicio, i);
    }
  }
  return "";
}

function declaracoes(trecho: string): Map<string, string> {
  const mapa = new Map<string, string>();
  for (const m of trecho.matchAll(/(--[a-z0-9-]+):\s*([^;]+);/gi)) {
    const nome = m[1]?.trim();
    const valor = m[2]?.trim();
    if (nome && valor) mapa.set(nome, valor);
  }
  return mapa;
}

function resolver(
  tokens: Map<string, string>,
  nome: string,
  saltos = 0,
): string {
  const valor = tokens.get(nome);
  if (!valor || saltos > 10) return valor ?? "";
  const ref = valor.match(/^var\((--[a-z0-9-]+)\)$/i);
  return ref?.[1] ? resolver(tokens, ref[1], saltos + 1) : valor;
}

const CLARO = declaracoes(recortarBloco(CSS, "@theme"));

const ESCURO = (() => {
  const mapa = new Map(CLARO);
  for (const [nome, valor] of declaracoes(
    recortarBloco(CSS, ':root[data-tema="escuro"]'),
  )) {
    mapa.set(nome, valor);
  }
  return mapa;
})();

function razao(
  tokens: Map<string, string>,
  frente: string,
  fundo: string,
): number {
  return razaoDeContraste(resolver(tokens, frente), resolver(tokens, fundo));
}

/** WCAG 2.2 AA: 4.5:1 texto normal; 3:1 texto grande, componentes e fronteiras. */
const TEXTO = 4.5;
const COMPONENTE = 3;

/** Pares que precisam passar como texto normal, nos dois temas. */
const PARES_DE_TEXTO: [string, string, string][] = [
  ["--color-texto", "--color-fundo", "corpo de texto"],
  ["--color-texto", "--color-fundo-elevado", "texto em ficha"],
  ["--color-texto-suave", "--color-fundo", "metadado de ficha"],
  ["--color-texto-suave", "--color-fundo-elevado", "metadado em ficha"],
  ["--color-link", "--color-fundo", "link"],
  ["--color-link", "--color-fundo-elevado", "link em ficha"],
  ["--color-link-hover", "--color-fundo", "link em hover"],
  ["--color-acento", "--color-fundo", "acento textual"],
  ["--color-marca", "--color-fundo", "assinatura do Observatório"],
  ["--color-texto-inverso", "--color-fundo-inverso", "cabeçalho e rodapé"],
  ["--color-texto-sobre-destaque", "--color-destaque", "texto sobre marcador"],
  [
    "--hero-texto-sobre-acento",
    "--hero-acento-editorial",
    "rótulo do botão da abertura",
  ],
];

/** Pares que precisam passar como componente ou fronteira, nos dois temas. */
const PARES_DE_COMPONENTE: [string, string, string][] = [
  ["--color-foco", "--color-fundo", "contorno de foco sobre a página"],
  ["--color-foco", "--color-fundo-elevado", "contorno de foco sobre ficha"],
  ["--color-borda-forte", "--color-fundo", "fronteira de controle"],
  ["--color-borda-forte", "--color-fundo-elevado", "fronteira em ficha"],
];

describe.each([
  ["luz do dia", CLARO],
  ["noite", ESCURO],
] as [string, Map<string, string>][])(
  "contraste — tema %s",
  (_nome, tokens) => {
    test.each(PARES_DE_TEXTO)(
      "%s sobre %s (%s) passa AA para texto normal",
      (frente, fundo) => {
        expect(razao(tokens, frente, fundo)).toBeGreaterThanOrEqual(TEXTO);
      },
    );

    test.each(PARES_DE_COMPONENTE)(
      "%s sobre %s (%s) passa AA para componente",
      (frente, fundo) => {
        expect(razao(tokens, frente, fundo)).toBeGreaterThanOrEqual(COMPONENTE);
      },
    );

    test("o destaque continua legível sobre a superfície inversa", () => {
      expect(
        razao(tokens, "--color-destaque", "--color-fundo-inverso"),
      ).toBeGreaterThanOrEqual(TEXTO);
    });
  },
);

describe("regras que dependem do tema", () => {
  /**
   * A regra mais fácil de violar do projeto, e por isso a mais vigiada: milho
   * sobre pedra dá 1,7:1. Ele nunca é cor de texto sobre fundo claro.
   */
  test("no claro, o destaque reprova como texto sobre o fundo da página", () => {
    expect(razao(CLARO, "--color-destaque", "--color-fundo")).toBeLessThan(
      COMPONENTE,
    );
  });

  /** No escuro a restrição se inverte — e é por isso que ele vira o foco. */
  test("no escuro, o destaque passa e serve de contorno de foco", () => {
    expect(
      razao(ESCURO, "--color-destaque", "--color-fundo"),
    ).toBeGreaterThanOrEqual(TEXTO);
    expect(resolver(ESCURO, "--color-foco")).toBe(
      resolver(ESCURO, "--color-destaque"),
    );
  });

  /**
   * A abertura da Home é sempre escura, nos dois temas, e seu acento é a
   * **assinatura institucional** — não o destaque. Os dois papéis já
   * estiveram colapsados no mesmo token: `--color-milho` chegou a ser
   * reapontado para verde-azulado só para tingir o Hero, o que arrastou
   * marcador, seleção e contorno de foco junto.
   *
   * Estes dois testes são a trava. O primeiro diz que milho continua milho; o
   * segundo, que o acento da abertura pede a marca e não o destaque.
   */
  test("milho continua sendo a cor de milho, e não um verde-azulado", () => {
    expect(resolver(CLARO, "--color-milho")).toBe("#e8b23a");
    expect(resolver(CLARO, "--color-destaque")).toBe("#e8b23a");
  });

  test("o acento da abertura é a assinatura, e não o destaque", () => {
    for (const tokens of [CLARO, ESCURO]) {
      expect(resolver(tokens, "--hero-acento-editorial")).toBe(
        resolver(tokens, "--color-observatorio-claro"),
      );
      expect(resolver(tokens, "--hero-acento-editorial")).not.toBe(
        resolver(tokens, "--color-milho"),
      );
    }
  });

  /**
   * O rótulo do botão da abertura pousa sobre o próprio acento, e o título
   * `.ab-b2__t1` pousa sobre a base escura do Hero. Nenhum dos dois é coberto
   * pelos pares de página: a abertura não usa `--color-fundo`.
   */
  test("o acento da abertura passa AA sobre a base escura do Hero", () => {
    expect(
      razao(CLARO, "--hero-acento-editorial", "--color-noite"),
    ).toBeGreaterThanOrEqual(TEXTO);
  });

  /**
   * Os três tokens que motivaram a paleta noturna. Se alguém "simplificar" o
   * escuro reaproveitando os valores claros, estes testes falham.
   */
  test.each([
    ["--color-anil", "link"],
    ["--color-observatorio", "assinatura institucional"],
    ["--color-barro", "acento"],
  ])("o valor claro de %s (%s) reprovaria sobre a noite", (bruto) => {
    const noite = resolver(ESCURO, "--color-fundo");
    expect(razaoDeContraste(resolver(CLARO, bruto), noite)).toBeLessThan(TEXTO);
  });

  /**
   * Nenhuma das duas marcas pode aparecer em cor institucional sobre
   * superfície escura. A do Coletivo não é token do projeto — é a cor do
   * arquivo oficial, medida e registrada aqui só como guarda.
   */
  test("nem a assinatura do Observatório nem a do Coletivo servem sobre mata", () => {
    const mata = resolver(CLARO, "--color-mata");
    expect(
      razaoDeContraste(resolver(CLARO, "--color-observatorio"), mata),
    ).toBeLessThan(COMPONENTE);
    expect(razaoDeContraste("#9e309e", mata)).toBeLessThan(COMPONENTE);
  });

  test("a borda comum é decorativa nos dois temas, e a forte não é", () => {
    for (const tokens of [CLARO, ESCURO]) {
      expect(razao(tokens, "--color-borda", "--color-fundo")).toBeLessThan(
        COMPONENTE,
      );
      expect(
        razao(tokens, "--color-borda-forte", "--color-fundo"),
      ).toBeGreaterThanOrEqual(COMPONENTE);
    }
  });
});
