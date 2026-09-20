import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

import {
  ASSINATURA_PADRAO,
  PENDENCIA_DAS_MARCAS,
  REGUA_DE_CREDITOS,
} from "../src/componentes/institucional/creditos";
import {
  LARGURA_MINIMA_FEDERAL,
  MARCA_FEDERAL,
  MARCAS_DERIVADAS,
} from "../src/dados/institucional/marcas";

/**
 * Marcas institucionais de fomento — o contrato com os manuais oficiais.
 *
 * Estes testes não protegem layout. Eles protegem o que três manuais
 * determinam sobre marca de governo, e crédito de fomento errado é causa
 * recorrente de ressalva em prestação de contas: é a classe de erro que custa
 * o edital, não a que custa um ajuste de CSS.
 *
 * Os manuais estão em `OBSERVATORIO_FONTES_DIR/marcas/` e não são versionados.
 * O que o repositório carrega é o **manifesto** — origem, hashes, dimensões e
 * a regra que justifica cada escolha — e é contra ele que se verifica aqui.
 */

const DESTINO = "public/media/marcas";

const FONTES = {
  creditos: "src/componentes/institucional/creditos.ts",
  regua: "src/componentes/institucional/ReguaDeCreditos.tsx",
  rodape: "src/componentes/layout/Rodape.tsx",
  estilos: "src/componentes/layout/estilosRodape.ts",
  script: "scripts/derivar-marcas-institucionais.py",
} as const;

function ler(caminho: string): string {
  return readFileSync(caminho, "utf8");
}

describe("os arquivos derivados existem e conferem", () => {
  test.each(MARCAS_DERIVADAS.map((marca) => [marca.id, marca] as const))(
    "%s tem arquivo, bytes e hash declarados",
    (_id, marca) => {
      const caminho = join(DESTINO, marca.arquivo);
      expect(existsSync(caminho), caminho).toBe(true);
      expect(statSync(caminho).size).toBe(marca.bytes);
      expect(
        createHash("sha256").update(readFileSync(caminho)).digest("hex"),
      ).toBe(marca.sha256);
    },
  );

  /**
   * A proporção do derivado é a da arte do original. Um derivado com outra
   * proporção é uma marca distorcida, e os três manuais proíbem distorcer.
   *
   * A tolerância de meio por cento absorve o arredondamento de pixel inteiro
   * na geração; ela não absorve um redimensionamento livre.
   */
  test.each(MARCAS_DERIVADAS.map((marca) => [marca.id, marca] as const))(
    "%s preserva a proporção da arte original",
    (_id, marca) => {
      const original =
        marca.original.larguraDaArte / marca.original.alturaDaArte;
      const derivado = marca.largura / marca.altura;
      expect(Math.abs(derivado - original) / original).toBeLessThan(0.005);
    },
  );

  test.each(MARCAS_DERIVADAS.map((marca) => [marca.id, marca] as const))(
    "%s registra origem, transformação e a regra do manual",
    (_id, marca) => {
      expect(marca.original.arquivo).toMatch(/^marcas\//);
      expect(marca.original.sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(marca.transformacao.length).toBeGreaterThan(40);
      expect(marca.regra).toMatch(/[Mm]anual/);
    },
  );

  /*
    Densidade dupla: o arquivo é gerado em 2x e exibido em 1x. Servir 1x faria
    a marca borrar em tela de retina, que é degradação de reprodução.
  */
  test("todos os derivados são gerados em 2x", () => {
    for (const marca of MARCAS_DERIVADAS) expect(marca.escala).toBe(2);
  });
});

describe("os limites dimensionais dos manuais", () => {
  /**
   * Manual de uso da marca do Governo Federal, v1.2, "LIMITE DE REDUÇÃO": em
   * meios eletrônicos a redução máxima é 200 px. O projeto não usa a exceção
   * de 110 px.
   */
  test("a marca federal não desce do limite de redução eletrônica", () => {
    expect(MARCA_FEDERAL.largura).toBeGreaterThanOrEqual(
      LARGURA_MINIMA_FEDERAL,
    );
  });

  /**
   * Manual PNAB Sergipe: "as logomarcas que pertencem ao bloco não devem
   * ultrapassar a altura e a largura total da marca nominativa do Governo
   * Federal".
   */
  test.each(
    MARCAS_DERIVADAS.filter((marca) => marca.id !== MARCA_FEDERAL.id).map(
      (marca) => [marca.id, marca] as const,
    ),
  )(
    "%s não ultrapassa a altura nem a largura da marca federal",
    (_id, marca) => {
      expect(marca.altura).toBeLessThanOrEqual(MARCA_FEDERAL.altura);
      expect(marca.largura).toBeLessThanOrEqual(MARCA_FEDERAL.largura);
    },
  );

  /*
    A marca federal é a maior do bloco — é isso que a regra acima significa na
    prática, e é o que um revisor confere a olho.
  */
  test("a marca federal é a de maior largura do bloco", () => {
    const maior = Math.max(...MARCAS_DERIVADAS.map((m) => m.largura));
    expect(MARCA_FEDERAL.largura).toBe(maior);
  });
});

describe("a ordem da régua vem dos manuais", () => {
  const ordem = REGUA_DE_CREDITOS.map((nivel) => nivel.id);

  /**
   * Manual federal: ordem ascendente de importância da esquerda para a
   * direita. Manual PNAB: a assinatura Ministério da Cultura/Governo Federal
   * fecha o bloco à extrema direita.
   */
  test("a régua tem os dois blocos do manual, apoio antes de realização", () => {
    expect(ordem).toEqual(["apoio", "fomento"]);
  });

  test("a assinatura federal é a última marca da régua", () => {
    const ultimo = REGUA_DE_CREDITOS.at(-1);
    expect(ultimo?.marcas.at(-1)?.id).toBe(MARCA_FEDERAL.id);
    expect(ultimo?.instituicoes.at(-1)).toBe("Governo Federal");
  });

  /**
   * O manual da PNAB é literal: a marca da política fica "ao lado de
   * Ministério da Cultura/Governo Federal, separada por um traço". O traço é
   * **interno** ao bloco de Realização, entre as duas marcas — não antes do
   * bloco.
   */
  test("só o bloco de realização traz o traço, e ele é interno", () => {
    const comTraco = REGUA_DE_CREDITOS.filter(
      (nivel) => nivel.tracoEntreMarcas,
    );
    expect(comTraco.map((nivel) => nivel.id)).toEqual(["fomento"]);
    expect(comTraco[0]?.marcas).toHaveLength(2);
  });

  test("a PNAB vem antes da assinatura federal, no mesmo bloco", () => {
    const fomento = REGUA_DE_CREDITOS.find((nivel) => nivel.id === "fomento");
    expect(fomento?.marcas.map((marca) => marca.id)).toEqual([
      "pnab",
      MARCA_FEDERAL.id,
    ]);
  });

  test("toda marca do manifesto está na régua, e só uma vez", () => {
    const naRegua = REGUA_DE_CREDITOS.flatMap((nivel) =>
      nivel.marcas.map((marca) => marca.id),
    );
    expect(naRegua.sort()).toEqual(
      MARCAS_DERIVADAS.map((marca) => marca.id).sort(),
    );
  });
});

describe("as entidades nomeadas", () => {
  const nomes = REGUA_DE_CREDITOS.flatMap((nivel) => nivel.instituicoes);

  /**
   * O manual da PNAB Sergipe obriga a divulgar o apoio de quatro entidades,
   * "sob pena de serem considerados inadimplentes": Governo do Estado de
   * Sergipe, Secretaria Especial da Cultura, FUNCAP e Governo Federal.
   *
   * A decisão humana de 2026-09-13 determinou usar o ativo gráfico do Governo
   * de Sergipe isolado, e não o lockup com a Secretaria. As duas coisas
   * convivem porque a Secretaria é nomeada **em texto**, aqui e na assinatura
   * padrão — que é a redação do próprio manual.
   */
  test.each([
    "Governo do Estado de Sergipe",
    "Secretaria Especial da Cultura",
    "Governo Federal",
  ])("%s é nomeada na régua", (entidade) => {
    expect(nomes).toContain(entidade);
  });

  test("a FUNCAP aparece com a grafia do manual", () => {
    expect(nomes).toContain(
      "FUNCAP — Fundação de Cultura e Arte Aperipê de Sergipe",
    );
  });

  test("a assinatura padrão é a do manual, sem reescrita", () => {
    expect(ASSINATURA_PADRAO).toContain(
      "Editais da Política Nacional Aldir Blanc Sergipe",
    );
    expect(ASSINATURA_PADRAO).toContain("Secretaria Especial da Cultura");
    expect(ASSINATURA_PADRAO).toContain("Ministério da Cultura");
  });

  /*
    O manual do Governo de Sergipe proíbe criar variações de assinatura. O
    lockup "Secretaria de Cultura + Governo de Sergipe" existe no corpus e é
    legítimo; o que não pode é uma terceira forma, composta aqui.
  */
  test("nenhuma assinatura conjunta é inventada", () => {
    const script = ler(FONTES.script);
    expect(script).not.toMatch(/paste|composite|alpha_composite|Draw/);
  });
});

describe("o que os manuais proíbem, e o código não faz", () => {
  const superficies = [FONTES.regua, FONTES.estilos, FONTES.rodape]
    .map(ler)
    .join("\n");

  /**
   * Nenhuma marca recebe filtro, rotação, recorte, sombra ou mistura de cor.
   * `filter` é a forma mais comum de "fabricar" uma versão branca de logo, e
   * os três manuais tratam isso como alteração de cor.
   */
  test.each([
    [/\.regua__marca[^}]*filter\s*:/, "filter"],
    [/\.regua__marca[^}]*mix-blend-mode\s*:/, "mix-blend-mode"],
    [/\.regua__marca[^}]*transform\s*:/, "transform"],
    [/\.regua__marca[^}]*clip-path\s*:/, "clip-path"],
    [/\.regua__marca[^}]*opacity\s*:/, "opacity"],
  ])("a marca não recebe %s", (padrao) => {
    expect(superficies).not.toMatch(padrao as RegExp);
  });

  /**
   * As marcas ficam sobre painel claro — "aplicação em box branco" do manual
   * federal. É o que permite usar a versão completa em cores sólidas de todas
   * as quatro, sem fabricar variante que o corpus não tem: não existe versão
   * negativa do brasão do Governo de Sergipe.
   */
  test("a régua é servida sobre painel claro", () => {
    expect(ler(FONTES.estilos)).toMatch(/\.rd__painel\{background:#fff/);
  });

  /*
    Altura e largura são atributos da imagem, vindos do manifesto. Se o CSS as
    sobrescrevesse, a proporção declarada deixaria de ser a exibida.
  */
  test("o componente serve as dimensões do manifesto", () => {
    const regua = ler(FONTES.regua);
    expect(regua).toMatch(/height=\{marca\.altura\}/);
    expect(regua).toMatch(/width=\{marca\.largura\}/);
  });
});

describe("a pendência de aprovação continua declarada", () => {
  /**
   * Manual PNAB Sergipe, orientação geral 2: todo material em arte-final deve
   * ser submetido à aprovação da Funcap e da Secult com no mínimo 10 dias
   * úteis de antecedência. Essa aprovação não foi registrada, e a superfície
   * pública precisa dizer a diferença entre "aplicado conforme o manual" e
   * "aprovado".
   */
  test("a superfície distingue aplicação conforme manual de aprovação", () => {
    expect(PENDENCIA_DAS_MARCAS).toMatch(/manuais oficiais/i);
    expect(PENDENCIA_DAS_MARCAS).toMatch(/aprovação prévia/i);
    expect(PENDENCIA_DAS_MARCAS).toMatch(/não foi registrada/i);
  });

  test("a régua publica a pendência e a assinatura padrão", () => {
    const regua = ler(FONTES.regua);
    expect(regua).toContain("PENDENCIA_DAS_MARCAS");
    expect(regua).toContain("ASSINATURA_PADRAO");
  });

  /*
    Nem o e-mail de aprovação da Funcap/Secult nem o da Secult entram no site.
    Eles estão no manual, são endereços de terceiros, e publicá-los aqui seria
    oferecer ao leitor um canal que não é do projeto.
  */
  test("nenhum e-mail de terceiro vaza para a superfície pública", () => {
    const publico = [ASSINATURA_PADRAO, PENDENCIA_DAS_MARCAS].join(" ");
    expect(publico).not.toMatch(/@/);
  });
});

describe("uma fonte, dois consumidores", () => {
  /**
   * O rodapé e a Prestação de Contas servem a mesma régua. Se um deles
   * montasse a própria lista, as duas superfícies começariam a divergir sobre
   * quem financia o projeto — que é o defeito que este lote veio fechar.
   */
  test("rodapé e Prestação de Contas consomem o mesmo componente", () => {
    expect(ler(FONTES.rodape)).toContain("ReguaDeCreditos");
    expect(ler("src/app/prestacao-de-contas/page.tsx")).toContain(
      "ReguaDeCreditos",
    );
  });

  test.each([FONTES.rodape, "src/app/prestacao-de-contas/page.tsx"])(
    "%s não escreve nome de entidade de fomento à mão",
    (caminho) => {
      const servido = ler(caminho)
        .replace(/\/\*[\s\S]*?\*\//g, " ")
        .replace(/^\s*\/\/.*$/gm, " ");
      expect(servido).not.toMatch(/FUNCAP|PNAB|Aldir Blanc|Governo Federal/);
    },
  );

  test("a régua declara as marcas a partir do manifesto", () => {
    const creditos = ler(FONTES.creditos);
    expect(creditos).toContain("MARCAS_DERIVADAS");
    expect(creditos).not.toMatch(/\.webp"/);
  });
});
