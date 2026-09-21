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
 * Quantas fotografias o **recorte editorial das fichas** reúne por lugar.
 *
 * O nome importa. Estes números não são o total de fotografias do lugar: são
 * as que a seleção declarada em `FICHAS` levou à ficha. Recanto e Borda têm
 * duas cada no Acervo que ficaram de fora.
 *
 * Números fixos de propósito: mudá-los deve exigir uma decisão editorial, não
 * acontecer de passagem.
 *
 * Serra dos Macacos e Ilha Grande passaram a 8 em 2026-09-21: as oito
 * fotografias publicadas de cada lugar, com os mesmos bytes do Acervo. Os
 * três derivados antigos da H3 deixaram a ficha de Ilha Grande.
 */
describe("recorte das fichas por lugar", () => {
  const porId = new Map(lugaresDeCampo(new Map()).map((l) => [l.id, l]));

  /*
    Borda da Mata caiu de 7 para 6 na sincronização de 2026-09-18: o original
    de `frente-do-museu-borda-da-mata.heic` saiu da seleção do responsável, e
    a ficha não guarda fotografia cuja fonte não está mais no corpus.
  */
  test.each([
    ["recanto-da-serra", 6],
    ["borda-da-mata", 6],
    ["serra-dos-macacos", 8],
    ["ilha-grande", 8],
  ] as const)("%s leva %i fotografias à ficha", (id, quantas) => {
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

  test.each(["ilha-grande", "serra-dos-macacos"] as const)(
    "%s só recebe fotografia cujo original veio da sua pasta",
    (id) => {
      for (const foto of porId.get(id)?.fotos ?? []) {
        const derivado = DERIVADOS_DOS_LUGARES.find((d) =>
          foto.src.endsWith(`/${d.arquivo}`),
        );
        expect(derivado, foto.src).toBeDefined();
        expect(derivado?.original.arquivo).toMatch(new RegExp(`^fotos/${id}/`));
      }
    },
  );

  /*
    Os três derivados da H3 saíram das fichas: eram de originais que o
    responsável retirou ou trocou, e as mesmas cenas estão no recorte.
  */
  test("nenhuma ficha serve os derivados antigos da H3", () => {
    const antigos = new Set<string>(
      DERIVADOS_DA_PESQUISA.map((d) => d.arquivo),
    );
    for (const lugar of porId.values()) {
      for (const foto of lugar.fotos) {
        expect(antigos.has(foto.src.split("/").pop() ?? ""), foto.src).toBe(
          false,
        );
      }
    }
  });

  test("Serra dos Macacos e Ilha Grande abrem com a capa do ADR-020", () => {
    for (const id of ["serra-dos-macacos", "ilha-grande"] as const) {
      const principais = porId.get(id)?.fotos.filter((f) => f.principal);
      expect(principais, id).toHaveLength(1);
      const derivado = DERIVADOS_DOS_LUGARES.find((d) =>
        principais?.[0]?.src.endsWith(`/${d.arquivo}`),
      );
      expect(derivado?.original.arquivo).toBe(`fotos/${id}/principal-capa.jpg`);
    }
  });
});

/**
 * O estado vazio só pode afirmar o que a ficha sabe.
 *
 * A primeira versão dizia "Nenhuma fotografia pública está vinculada a este
 * lugar" e falava do acervo inteiro a partir do que a ficha reúne — afirmação
 * que o corpus da Serra dos Macacos desmente. A frase certa descreve a ficha.
 * O inverso também é proibido: anunciar material ainda não publicado exporia a
 * existência de acervo fora do universo público.
 */
describe("frase do estado vazio", () => {
  // A prancha de cada lugar mora em `PranchaDoLugar.tsx` desde a direção de
  // arte do atlas; a regra da frase continua a mesma.
  const componente = readFileSync(
    "src/componentes/territorio/cartografia/PranchaDoLugar.tsx",
    "utf8",
  );
  const frase = /<p className="lacuna">([^<]*ficha[^<]*)<\/p>/.exec(
    componente,
  )?.[1];

  test("existe e fala da ficha, não do acervo", () => {
    expect(frase).toBeDefined();
    expect(frase).toContain("ficha");
  });

  test("não afirma que o lugar não tem fotografia", () => {
    expect(frase).not.toMatch(/nenhuma fotografia/i);
    expect(frase).not.toMatch(/não (existe|há)/i);
  });

  test("não anuncia material fora do universo público", () => {
    expect(frase).not.toMatch(/restrit|privad|bloquead|em revisão|pendente/i);
    expect(frase).not.toMatch(/\d+\s+fotografia/i);
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
      expect(fonte, id).toContain("posição informada pelo Observatório");
      expect(fonte.toLowerCase(), id).not.toContain("visitad");
    }
    const componente = [
      "src/componentes/territorio/cartografia/TerritorioVivo.tsx",
      "src/componentes/territorio/cartografia/PranchaDoLugar.tsx",
    ]
      .map((arquivo) => readFileSync(arquivo, "utf8"))
      .join(" ");
    expect(componente).not.toMatch(/autorizadoEm/);
    expect(componente).not.toMatch(/[Vv]isitado em \{/);
  });
});
