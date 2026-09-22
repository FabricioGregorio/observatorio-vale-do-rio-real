import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

import {
  ATRIBUTO_TEMA,
  atributoDoTema,
  CHAVE_TEMA,
  ehTema,
  SCRIPT_TEMA_INICIAL,
  TEMA_PADRAO,
  TEMAS,
  type Tema,
  temaArmazenado,
} from "../src/lib/tema";

/**
 * Fundação de tema — Fase H0.
 *
 * O que estes testes protegem não é a aparência, é o **contrato**: três
 * estados, padrão `sistema`, entrada externa inválida que vira padrão em vez
 * de exceção, e — o mais importante — os dois blocos de tema escuro do
 * `tokens.css` dizendo exatamente a mesma coisa.
 */

const CSS = readFileSync(
  join(process.cwd(), "src", "estilos", "tokens.css"),
  "utf8",
);

/** Recorta um bloco `{ … }` equilibrando chaves, a partir do texto que o abre. */
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

describe("estados do tema", () => {
  test("são exatamente três, e o padrão é seguir o sistema", () => {
    expect([...TEMAS]).toEqual(["sistema", "claro", "escuro"]);
    expect(TEMA_PADRAO).toBe("sistema");
  });

  test.each(["sistema", "claro", "escuro"])("reconhece %s", (valor) => {
    expect(ehTema(valor)).toBe(true);
  });

  test.each([null, undefined, "", "dark", "SISTEMA", 1, {}, []])(
    "rejeita %s",
    (valor) => {
      expect(ehTema(valor)).toBe(false);
    },
  );

  /**
   * Armazenamento local é entrada externa: outra aba, outra versão do site ou
   * um usuário curioso podem ter escrito qualquer coisa ali. Nada disso pode
   * derrubar a renderização.
   */
  test.each([
    [null, "sistema"],
    [undefined, "sistema"],
    ["", "sistema"],
    ["lixo", "sistema"],
    ["dark", "sistema"],
    ["sistema", "sistema"],
    ["claro", "claro"],
    ["escuro", "escuro"],
  ])("valor armazenado %s vira %s", (bruto, esperado) => {
    expect(temaArmazenado(bruto)).toBe(esperado);
  });
});

describe("atributo do tema", () => {
  test("sistema não escreve atributo nenhum", () => {
    expect(atributoDoTema("sistema")).toBeNull();
  });

  test.each([
    ["claro", "claro"],
    ["escuro", "escuro"],
  ] as [Tema, string][])("%s vira data-tema=%s", (tema, esperado) => {
    expect(atributoDoTema(tema)).toBe(esperado);
  });
});

describe("script de tema inicial", () => {
  test("usa a mesma chave e o mesmo atributo do módulo", () => {
    expect(SCRIPT_TEMA_INICIAL).toContain(JSON.stringify(CHAVE_TEMA));
    expect(SCRIPT_TEMA_INICIAL).toContain(JSON.stringify(ATRIBUTO_TEMA));
  });

  /**
   * Sem `try/catch` o script derruba a página inteira em navegador com
   * armazenamento bloqueado: `localStorage` **lança** nesse caso, não devolve
   * vazio.
   */
  test("é protegido contra armazenamento indisponível", () => {
    expect(SCRIPT_TEMA_INICIAL).toContain("try{");
    expect(SCRIPT_TEMA_INICIAL).toContain("catch");
  });

  test("só escreve o atributo para escolha manual, nunca para sistema", () => {
    expect(SCRIPT_TEMA_INICIAL).not.toContain("sistema");
  });

  /** Ele está no caminho crítico da primeira pintura: precisa ser minúsculo. */
  test("cabe em 200 bytes", () => {
    expect(SCRIPT_TEMA_INICIAL.length).toBeLessThanOrEqual(200);
  });

  test("roda de verdade e aplica a escolha salva", () => {
    for (const [salvo, esperado] of [
      ["escuro", "escuro"],
      ["claro", "claro"],
      ["sistema", null],
      ["lixo", null],
      [null, null],
    ] as [string | null, string | null][]) {
      const atributos = new Map<string, string>();
      const documentoFalso = {
        documentElement: {
          setAttribute: (nome: string, valor: string) =>
            atributos.set(nome, valor),
        },
      };
      const armazenamentoFalso = { getItem: () => salvo };

      new Function("document", "localStorage", SCRIPT_TEMA_INICIAL)(
        documentoFalso,
        armazenamentoFalso,
      );

      expect(atributos.get(ATRIBUTO_TEMA) ?? null).toBe(esperado);
    }
  });

  test("não quebra quando o armazenamento lança", () => {
    const documentoFalso = {
      documentElement: { setAttribute: () => undefined },
    };
    const armazenamentoQueLanca = {
      getItem: () => {
        throw new Error("armazenamento bloqueado");
      },
    };

    expect(() =>
      new Function("document", "localStorage", SCRIPT_TEMA_INICIAL)(
        documentoFalso,
        armazenamentoQueLanca,
      ),
    ).not.toThrow();
  });
});

describe("tokens de tema no CSS", () => {
  const tema = declaracoes(recortarBloco(CSS, "@theme"));
  const escuroPorAtributo = declaracoes(
    recortarBloco(CSS, ':root[data-tema="escuro"]'),
  );
  const escuroPorSistema = declaracoes(
    recortarBloco(CSS, ':root:not([data-tema="claro"])'),
  );

  test("o bloco @theme existe e declara a paleta", () => {
    expect(tema.size).toBeGreaterThan(20);
  });

  /**
   * O motivo de este teste existir está escrito no próprio `tokens.css`: o CSS
   * não tem como unir uma media query e um seletor de atributo numa regra só,
   * então a mesma lista de papéis aparece duas vezes. Duas definições da mesma
   * coisa divergem em silêncio, e num projeto operado por agentes a errada é
   * obedecida sem ninguém perceber.
   */
  test("os dois blocos de tema escuro são idênticos", () => {
    expect(escuroPorAtributo.size).toBeGreaterThan(0);
    expect([...escuroPorAtributo.entries()].sort()).toEqual(
      [...escuroPorSistema.entries()].sort(),
    );
  });

  test("o escuro redefine papéis, nunca a paleta bruta", () => {
    const brutos = [
      "--color-mata",
      "--color-anil",
      "--color-pedra",
      "--color-milho",
      "--color-barro",
      "--color-carvao",
      "--color-observatorio",
      "--color-noite",
    ];
    for (const bruto of brutos) {
      expect(tema.has(bruto)).toBe(true);
      expect(escuroPorAtributo.has(bruto)).toBe(false);
    }
  });

  test("todo papel redefinido no escuro existe no claro", () => {
    for (const nome of escuroPorAtributo.keys()) {
      expect(tema.has(nome)).toBe(true);
    }
  });

  /**
   * O teal institucional não é escolha estética: o valor foi medido nos
   * arquivos oficiais da identidade. Trocá-lo por estimativa é o erro que este
   * teste impede.
   */
  test("a assinatura institucional é o valor medido", () => {
    expect(tema.get("--color-observatorio")).toBe("#026a69");
  });

  test("mata continua existindo e é distinta da assinatura", () => {
    expect(tema.get("--color-mata")).toBe("#12301f");
    expect(tema.get("--color-mata")).not.toBe(tema.get("--color-observatorio"));
  });

  test("o fundo escuro não é preto puro", () => {
    const noite = tema.get("--color-noite");
    expect(noite).toBeDefined();
    expect(noite).not.toBe("#000000");
    expect(noite).not.toBe("#000");
  });

  test("o foco troca de cor entre os temas", () => {
    expect(tema.get("--color-foco")).toBe("var(--color-anil)");
    expect(escuroPorAtributo.get("--color-foco")).toBe("var(--color-milho)");
  });

  test("os tokens de movimento existem e são zerados sob reduced motion", () => {
    for (const nome of [
      "--duracao-hover",
      "--duracao-revelacao",
      "--duracao-painel",
    ]) {
      expect(tema.has(nome)).toBe(true);
    }
    const reduzido = recortarBloco(
      CSS,
      "@media (prefers-reduced-motion: reduce)",
    );
    for (const nome of [
      "--duracao-hover",
      "--duracao-revelacao",
      "--duracao-painel",
    ]) {
      expect(declaracoes(reduzido).get(nome)).toBe("0ms");
    }
  });

  test("as camadas são declaradas, e o link de pular fica acima de tudo", () => {
    const camadas = [
      "--z-conteudo",
      "--z-cabecalho",
      "--z-barra-mobile",
      "--z-painel",
      "--z-pular",
    ];
    const valores = camadas.map((n) => Number(tema.get(n)));
    for (const v of valores) expect(Number.isFinite(v)).toBe(true);
    expect(Math.max(...valores)).toBe(Number(tema.get("--z-pular")));
  });

  test("o contorno de foco não redefine o raio do elemento", () => {
    const foco = recortarBloco(CSS, ":focus-visible");
    expect(foco).toContain("outline");
    expect(foco).not.toContain("border-radius");
  });

  test("color-scheme acompanha os dois temas", () => {
    expect(CSS).toContain("color-scheme: light");
    expect(CSS).toContain("color-scheme: dark");
  });

  /** A dívida de `!important` é preexistente e não pode crescer (H0 §17). */
  test("o !important continua restrito ao bloco de reduced motion", () => {
    const total = (CSS.match(/!important/g) ?? []).length;
    expect(total).toBe(4);
    const reduzido = recortarBloco(
      CSS,
      "@media (prefers-reduced-motion: reduce)",
    );
    expect((reduzido.match(/!important/g) ?? []).length).toBe(4);
  });
});

describe("o mapa não segue o tema", () => {
  /**
   * A camada base do mapa é preenchida com `--color-pedra`, que é token bruto
   * e continua claro nos dois temas. Se o CSS do mapa referenciar um papel
   * semântico, o tema escuro muda só metade do desenho — e o efeito é o
   * oposto do pretendido: a fronteira dos 75 municípios clareia sobre um
   * preenchimento que não clareou, e some.
   *
   * A camada cartográfica ganha tratamento próprio de tema na H3. Até lá, o
   * mapa é invariante, e este teste é o que garante isso.
   */
  const PAPEIS_SEMANTICOS = [
    "--color-fundo",
    "--color-fundo-elevado",
    "--color-fundo-inverso",
    "--color-texto",
    "--color-texto-suave",
    "--color-texto-inverso",
    "--color-link",
    "--color-link-hover",
    "--color-borda",
    "--color-borda-forte",
    "--color-acento",
    "--color-marca",
    "--color-foco",
  ];

  test.each(PAPEIS_SEMANTICOS)("o CSS do mapa não usa %s", async (papel) => {
    const { CSS_DO_MAPA } = await import(
      "../src/componentes/mapa/estilosDoMapa"
    );
    expect(CSS_DO_MAPA).not.toContain(`var(${papel})`);
  });

  /**
   * `--color-destaque` e `--color-texto-sobre-destaque` são a exceção
   * deliberada: milho é o mesmo nos dois temas, e o par existe justamente
   * para que o texto por cima dele também seja.
   */
  test("o realce da lista carrega o texto invariante junto do milho", async () => {
    const { CSS_DO_MAPA } = await import(
      "../src/componentes/mapa/estilosDoMapa"
    );
    expect(CSS_DO_MAPA).toContain("var(--color-destaque)");
    expect(CSS_DO_MAPA).toContain("var(--color-texto-sobre-destaque)");
  });
});
