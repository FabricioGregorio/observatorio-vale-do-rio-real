import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

import corpusAutorizado from "../src/dados/pesquisa/corpus-b01-autorizado.json";
import {
  DERIVADOS_DOS_LUGARES,
  LUGAR_DA_PASTA_DO_CORPUS,
  PASTA_DOS_DERIVADOS_DA_PESQUISA,
} from "../src/dados/pesquisa/derivados";

const GERADOR = "scripts/derivar-fotos-campo.py";

/**
 * O corpus autorizado é uma declaração, não uma contagem.
 *
 * O gate do gerador era `len(itens) != 59`. Um número protege menos do que
 * parece: trocar um original por outro mantém a contagem, e o script
 * regravaria manifesto e derivados em silêncio. E toda mudança legítima do
 * corpus o quebrava, com uma saída fácil e errada — aumentar o número, que
 * dissolve o gate em vez de responder a ele.
 *
 * A declaração por `sha256` diz quais conteúdos estão autorizados, nomeia a
 * divergência quando aparece e faz de ampliar o corpus um ato explícito,
 * visível no diff. É o mesmo desenho de `ORIGINAIS` em
 * `derivar-pesquisa-campo.ts`, que já conferia hash antes de transformar.
 */
describe("declaração do corpus autorizado", () => {
  test("declara 58 conteúdos, sem hash repetido", () => {
    expect(corpusAutorizado).toHaveLength(58);
    expect(new Set(corpusAutorizado.map((c) => c.sha256)).size).toBe(58);
  });

  test("todo caminho é de pasta do corpus e todo hash é sha256", () => {
    for (const { arquivo, sha256 } of corpusAutorizado) {
      expect(arquivo, arquivo).toMatch(/^fotos\/[^/]+\/.+$/);
      expect(sha256, arquivo).toMatch(/^[a-f0-9]{64}$/);
    }
  });

  test("nenhum caminho declarado se repete", () => {
    const caminhos = corpusAutorizado.map((c) => c.arquivo);
    expect(new Set(caminhos).size).toBe(caminhos.length);
  });

  /*
    A declaração é o insumo do gate. Se o gerador voltar a decidir por
    contagem, o gate deixa de nomear o que divergiu.
  */
  test("o gerador confere a declaração, e não um número", () => {
    const script = readFileSync(GERADOR, "utf8");
    expect(script).toContain("corpus-b01-autorizado.json");
    expect(script).toContain("conferir_corpus");
    // A citação do gate antigo na docstring é bem-vinda; a comparação, não.
    expect(script).not.toMatch(/^\s*if\s+len\(itens\)\s*!=/m);
  });

  test("o gate barra inclusão, exclusão e troca de caminho", () => {
    const script = readFileSync(GERADOR, "utf8");
    for (const sinal of ["ausentes", "intrusos", "renomeados"]) {
      expect(script, sinal).toContain(sinal);
    }
    // Falha fechada: nada é gravado quando diverge.
    expect(script).toContain("Nada foi gravado");
  });
});

/**
 * Toda fotografia que a interface já consome nasceu de conteúdo declarado.
 */
describe("o que a interface consome está declarado", () => {
  const declarados = new Set(corpusAutorizado.map((c) => c.sha256));

  test("os 28 derivados das fichas vêm do corpus autorizado", () => {
    expect(DERIVADOS_DOS_LUGARES).toHaveLength(28);
    for (const foto of DERIVADOS_DOS_LUGARES) {
      expect(declarados.has(foto.original.sha256), foto.arquivo).toBe(true);
    }
  });

  /*
    As fotografias de Serra dos Macacos e Ilha Grande nas fichas não são
    derivado novo: são os arquivos que o Acervo publicou no lote de
    2026-09-18, byte a byte — a da ponte com a placa tarjada (ADR-020).
  */
  test("Serra e Ilha nas fichas são os mesmos bytes publicados no Acervo", () => {
    // A área arborizada entrou no lote de 2026-09-16 e o de 09-18 não a
    // substituiu; as outras quinze são do lote de 09-18.
    const lotes = [
      "src/dados/lote-publicacao-2026-09-16.json",
      "src/dados/lote-publicacao-2026-09-18.json",
    ].flatMap(
      (arquivo) =>
        JSON.parse(readFileSync(arquivo, "utf8")) as readonly {
          sha256: string;
          bytes: number;
        }[],
    );
    const publicados = new Map(lotes.map((item) => [item.sha256, item.bytes]));
    const fotos = DERIVADOS_DOS_LUGARES.filter(
      (f) => f.lugar === "serra-dos-macacos" || f.lugar === "ilha-grande",
    );
    expect(fotos).toHaveLength(16);
    for (const f of fotos) {
      expect(declarados.has(f.original.sha256), f.original.arquivo).toBe(true);
      expect(publicados.get(f.sha256), f.arquivo).toBe(f.bytes);
    }
  });

  test("as pastas declaradas cobrem os lugares com fotografia na ficha", () => {
    const comFoto = new Set(DERIVADOS_DOS_LUGARES.map((f) => f.lugar));
    const cobertas = new Set(Object.values(LUGAR_DA_PASTA_DO_CORPUS));
    for (const lugar of comFoto) expect(cobertas, lugar).toContain(lugar);
  });
});

/**
 * Preparar derivado não é publicar.
 *
 * Um derivado novo em `public/media/pesquisa/` entraria no bundle e a ficha
 * passaria a exibi-lo sem que o Acervo o conhecesse — publicação por efeito
 * colateral, exatamente o que o fail-closed existe para impedir. A pasta só
 * pode conter o que algum manifesto declara.
 */
describe("nada entra na interface sem estar declarado", () => {
  const pasta = join(process.cwd(), PASTA_DOS_DERIVADOS_DA_PESQUISA);

  test("a pasta pública tem exatamente os arquivos declarados", () => {
    const declarados = new Set([
      ...DERIVADOS_DOS_LUGARES.map((d) => d.arquivo),
    ]);
    expect(new Set(readdirSync(pasta))).toEqual(declarados);
  });

  test("cada arquivo publicado conserva o hash declarado", () => {
    for (const d of DERIVADOS_DOS_LUGARES) {
      const bytes = readFileSync(join(pasta, d.arquivo));
      expect(createHash("sha256").update(bytes).digest("hex"), d.arquivo).toBe(
        d.sha256,
      );
    }
  });
});

/**
 * As decisões humanas de 2026-09-17 vivem num ADR, não numa conversa.
 *
 * O hash é o que identifica o arquivo decidido. O nome não decide nada — as
 * pastas do corpus usam `principal-capa` e `capa-principal` para a mesma
 * ideia, e nenhuma das duas grafias é fonte de verdade.
 */
describe("ADR-020 registra as decisões desta curadoria", () => {
  const caminho =
    "docs/decisoes/ADR-020-curadoria-fotografica-serra-e-capas.md";

  test("o ADR existe", () => {
    expect(existsSync(caminho), caminho).toBe(true);
  });

  test("cada decisão traz o hash do arquivo a que se refere", () => {
    const adr = readFileSync(caminho, "utf8");
    for (const [decisao, sha] of [
      [
        "capa da Serra",
        "17bbd985205f34fcc98463d15e541f1540fd682e65d07c8517959d26ef7eae9b",
      ],
      [
        "capa de Ilha Grande",
        "faf06f4d3f82ebd62d72ce1b74bff770f12d3a96fb9cdf2ce50a599dd633d5de",
      ],
      [
        "placa a tarjar",
        "d5683e3b98523d36c81e7f2bb9bf8020c361393dc416b6af27fcffd0eccb225c",
      ],
    ] as const) {
      expect(adr, decisao).toContain(sha);
    }
  });

  /*
    A decisão de capa vive na estrutura canônica do gerador, e não só na prosa
    do ADR. Enquanto o original não entrar em FICHAS ela não produz efeito
    nenhum — declarar não é publicar —, mas fica registrada onde as outras
    duas capas já estavam.
  */
  test("as capas decididas estão declaradas no gerador", () => {
    const script = readFileSync(GERADOR, "utf8");
    const bloco = /PRINCIPAIS = \{([\s\S]*?)\}/.exec(script)?.[1] ?? "";
    for (const capa of [
      "recanto-da-serra/recanto-da-serra.png",
      "centro-cultural-museu-borda-da-mata/frente-casa-de-taipa.heic",
      "serra-dos-macacos/principal-capa.jpg",
      "ilha-grande/principal-capa.jpg",
    ]) {
      expect(bloco, capa).toContain(capa);
    }
    // Uma capa por lugar: nada de duas decisões para o mesmo.
    const lugares = [...bloco.matchAll(/"([^/]+)\//g)].map((m) => m[1]);
    expect(new Set(lugares).size).toBe(lugares.length);
  });

  /*
    A tarja da placa é regra de pipeline, não zelo de quem roda o script.
    Um `dict.get` que devolve vazio publicaria a placa em silêncio; por isso a
    obrigação vive numa lista própria e a ausência de coordenada interrompe.
  */
  test("a placa a tarjar é regra do gerador, com falha fechada", () => {
    const script = readFileSync(GERADOR, "utf8");
    const original = "serra-dos-macacos/atravessando-a-ponte.jpg";

    const exigem = /EXIGEM_TARJA = frozenset\(([\s\S]*?)\n\)/.exec(script)?.[1];
    expect(exigem, "EXIGEM_TARJA declarada").toBeDefined();
    expect(exigem).toContain(original);

    const tarjas = /TARJAS: dict\[[\s\S]*?\n\}/.exec(script)?.[0] ?? "";
    expect(tarjas, "coordenadas declaradas").toContain(original);
    // Duas regiões: a placa do veículo e o mesmo emplacamento refletido.
    expect([...tarjas.matchAll(/\(\d+, \d+, \d+, \d+\)/g)]).toHaveLength(2);

    expect(script).toContain(
      "exige tarja de privacidade e nenhuma foi declarada",
    );
    expect(script).toContain("cai fora de");
  });

  /*
    Opaco, e não desfoque nem pixelização: as duas preservam informação e já
    foram revertidas em casos públicos. E antes do redimensionamento, para que
    o pixel coberto não exista no derivado.
  */
  test("a tarja é opaca e anterior ao redimensionamento", () => {
    const script = readFileSync(GERADOR, "utf8");
    expect(script).toContain("COR_DA_TARJA");
    expect(script).not.toMatch(/GaussianBlur|BoxBlur|filter\(ImageFilter/);

    const corpo = script.slice(script.indexOf("def principal"));
    const tarja = corpo.indexOf("aplicar_tarjas(imagem");
    const resize = corpo.indexOf("imagem.resize(");
    expect(tarja, "tarja aplicada no laço").toBeGreaterThan(-1);
    expect(tarja).toBeLessThan(resize);
  });

  test("o original da placa continua declarado no corpus", () => {
    const declarados = new Set(corpusAutorizado.map((c) => c.sha256));
    expect(
      declarados.has(
        "d5683e3b98523d36c81e7f2bb9bf8020c361393dc416b6af27fcffd0eccb225c",
      ),
    ).toBe(true);
  });

  test("declara o escopo da autorização e não a generaliza", () => {
    const adr = readFileSync(caminho, "utf8");
    expect(adr).toContain("tarjamento_privacidade");
    expect(adr).toMatch(/não\*{0,2}\s+se estende/i);
    expect(adr).toMatch(/LGPD/);
  });
});
