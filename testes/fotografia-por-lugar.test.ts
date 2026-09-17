import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

import { montarBaseDoTerritorio } from "../src/componentes/territorio/cartografia/local/composicao";
import { lugaresDeCampo } from "../src/componentes/territorio/cartografia/lugares";
import {
  DERIVADOS_DA_PESQUISA,
  DERIVADOS_DOS_LUGARES,
  LUGAR_DA_PASTA_DO_CORPUS,
  pastaDoOriginal,
} from "../src/dados/pesquisa/derivados";
import {
  IDS_DOS_LUGARES,
  referenciaDe,
} from "../src/dados/territorio/referencias";

/**
 * Identidade entre fotografia e lugar.
 *
 * Uma ficha territorial só pode mostrar fotografia cuja ligação com o lugar
 * seja determinística e rastreável. O vínculo é a **pasta do corpus** em que o
 * original foi entregue, e `LUGAR_DA_PASTA_DO_CORPUS` é a tabela que a traduz
 * em id — declarada, nunca inferida por semelhança de nome.
 *
 * O que estes testes impedem de voltar: a ficha filtrava fotografia por
 * igualdade com o nome de exibição do lugar, de modo que uma correção de
 * grafia no manifesto a deixaria vazia sem quebrar nada; Ilha Grande recebia a
 * lista inteira dos derivados da pesquisa, sem filtro; e Serra dos Macacos
 * trazia uma lista vazia escrita à mão, que continuaria vazia mesmo depois de
 * uma fotografia sua entrar no corpus.
 */
describe("identidade entre fotografia e lugar", () => {
  test("todo derivado declara um lugar que existe", () => {
    for (const foto of [...DERIVADOS_DOS_LUGARES, ...DERIVADOS_DA_PESQUISA]) {
      expect(IDS_DOS_LUGARES, foto.arquivo).toContain(foto.lugar);
    }
  });

  /*
    O coração da regra: o id declarado tem de ser exatamente o que a pasta de
    origem produz pela tabela. Sem isto, `lugar` seria só mais um campo de
    texto — editável à mão e capaz de mudar em silêncio a que lugar uma
    fotografia pertence.
  */
  test("o lugar declarado é o que a pasta do original produz", () => {
    for (const foto of [...DERIVADOS_DOS_LUGARES, ...DERIVADOS_DA_PESQUISA]) {
      const pasta = pastaDoOriginal(foto.original.arquivo);
      expect(pasta, `${foto.arquivo}: pasta fora da tabela`).not.toBeNull();
      if (pasta === null) continue;
      expect(LUGAR_DA_PASTA_DO_CORPUS[pasta], foto.arquivo).toBe(foto.lugar);
    }
  });

  /*
    O manifesto é gerado por `scripts/derivar-fotos-campo.py`. Se as duas
    tabelas divergirem, a próxima regeneração grava ids errados e nenhum outro
    teste percebe — o manifesto continuaria internamente coerente.
  */
  test("a tabela do gerador em Python diz o mesmo que a de TypeScript", () => {
    const script = readFileSync("scripts/derivar-fotos-campo.py", "utf8");
    // `[\s\S]` no lugar da flag `s`, que exigiria target es2018.
    const bloco = /LUGAR_DA_PASTA = \{([\s\S]*?)\n\}/.exec(script)?.[1];
    expect(bloco, "LUGAR_DA_PASTA não encontrada no gerador").toBeDefined();
    const noPython = new Map(
      [
        ...(bloco ?? "").matchAll(/"([a-z-]+)":\s*\{\s*"id":\s*"([a-z-]+)"/g),
      ].map((m) => [m[1] as string, m[2] as string]),
    );
    expect(Object.fromEntries(noPython)).toEqual(LUGAR_DA_PASTA_DO_CORPUS);
  });

  test("nenhuma fotografia é atribuída a um lugar por nome", () => {
    const fonte = readFileSync(
      "src/componentes/territorio/cartografia/lugares.ts",
      "utf8",
    );
    for (const id of IDS_DOS_LUGARES) {
      // O nome de exibição pode aparecer como texto; nunca como filtro.
      const nome = referenciaDe(id).nome;
      expect(fonte, id).not.toContain(`.local === "${nome}"`);
      expect(fonte, id).not.toContain(`fotosDoLugar("${nome}")`);
    }
    expect(fonte).not.toMatch(/\.local\b[^\n]*===|includes\([^)]*\.local/);
  });
});

/**
 * Quantas fotografias públicas cada lugar reúne, hoje.
 *
 * Números fixos de propósito: são a contagem conferida contra a pasta de
 * origem de cada original, e mudá-los deve exigir uma decisão, não acontecer
 * de passagem. Serra dos Macacos em zero **não é falha**: nenhuma fotografia
 * sua entrou no recorte público.
 */
describe("fotografias públicas por lugar", () => {
  const porId = new Map(lugaresDeCampo(new Map()).map((l) => [l.id, l]));

  test.each([
    ["recanto-da-serra", 6],
    ["borda-da-mata", 7],
    ["serra-dos-macacos", 0],
    ["ilha-grande", 3],
  ] as const)("%s reúne %i fotografias públicas", (id, quantas) => {
    expect(porId.get(id)?.fotos).toHaveLength(quantas);
  });

  test("os quatro lugares canônicos continuam quatro", () => {
    expect([...porId.keys()]).toEqual([...IDS_DOS_LUGARES]);
  });

  /*
    Ausência não é preenchida com fotografia de outro lugar. O teste compara
    conjuntos de arquivos: nenhuma imagem pode aparecer em duas fichas.
  */
  test("nenhuma fotografia aparece na ficha de mais de um lugar", () => {
    const vistos = new Map<string, string>();
    for (const lugar of porId.values()) {
      for (const foto of lugar.fotos) {
        const dono = vistos.get(foto.src);
        expect(dono, `${foto.src} em ${dono} e ${lugar.id}`).toBeUndefined();
        vistos.set(foto.src, lugar.id);
      }
    }
  });

  test("Ilha Grande só recebe fotografia cujo original veio da sua pasta", () => {
    for (const foto of porId.get("ilha-grande")?.fotos ?? []) {
      const derivado = DERIVADOS_DA_PESQUISA.find((d) =>
        foto.src.endsWith(d.arquivo),
      );
      expect(derivado, foto.src).toBeDefined();
      expect(derivado?.original.arquivo).toMatch(/^fotos\/ilha-grande\//);
    }
  });

  test("Serra dos Macacos não recebe imagem de substituição", () => {
    const serra = porId.get("serra-dos-macacos");
    expect(serra?.fotos).toEqual([]);
    expect(serra?.materiais.length).toBeGreaterThan(0);
  });
});

/**
 * Coordenadas: a ficha lê a fonte canônica, nunca um valor reescrito.
 */
describe("coordenadas na ficha", () => {
  // A ficha recebe `LugarNoMapa`, que é o lugar já casado com a posição.
  const porId = new Map(
    montarBaseDoTerritorio({ publicados: new Map() }).lugares.map((l) => [
      l.id,
      l,
    ]),
  );

  test.each([...IDS_DOS_LUGARES])(
    "%s traz a posição de referencias.ts, sem cópia",
    (id) => {
      const referencia = referenciaDe(id);
      const posicao = porId.get(id)?.posicao;
      expect(posicao?.latitude, id).toBe(referencia.latitude);
      expect(posicao?.longitude, id).toBe(referencia.longitude);
      expect(posicao?.coordenadaConfirmada, id).toBe(true);
      expect(posicao?.publicacaoPublicaAutorizada, id).toBe(true);
    },
  );

  /*
    A procedência da coordenada é evento editorial — confirmação pelo
    responsável — e não data de visita. A frase canônica já diz isso; o
    componente não pode reescrevê-la em outra coisa.
  */
  test("a procedência fala de confirmação, não de visita", () => {
    for (const id of IDS_DOS_LUGARES) {
      const fonte = porId.get(id)?.posicao?.fonteDaCoordenada ?? "";
      expect(fonte, id).toContain("confirmação humana direta do responsável");
      expect(fonte.toLowerCase(), id).not.toContain("visitad");
    }
    const componente = readFileSync(
      "src/componentes/territorio/cartografia/TerritorioVivo.tsx",
      "utf8",
    );
    expect(componente).not.toMatch(/autorizadoEm/);
    expect(componente).not.toMatch(/[Vv]isitado em \{/);
  });
});
