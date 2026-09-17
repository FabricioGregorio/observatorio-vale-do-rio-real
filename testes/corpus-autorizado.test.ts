import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

import corpusAutorizado from "../src/dados/pesquisa/corpus-b01-autorizado.json";
import {
  DERIVADOS_DA_PESQUISA,
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
  test("declara 59 conteúdos, sem hash repetido", () => {
    expect(corpusAutorizado).toHaveLength(59);
    expect(new Set(corpusAutorizado.map((c) => c.sha256)).size).toBe(59);
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

  test("os 13 derivados das fichas vêm do corpus autorizado", () => {
    expect(DERIVADOS_DOS_LUGARES).toHaveLength(13);
    for (const foto of DERIVADOS_DOS_LUGARES) {
      expect(declarados.has(foto.original.sha256), foto.arquivo).toBe(true);
    }
  });

  test("as pastas declaradas cobrem os lugares com fotografia na ficha", () => {
    const comFoto = new Set(
      [...DERIVADOS_DOS_LUGARES, ...DERIVADOS_DA_PESQUISA].map((f) => f.lugar),
    );
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
      ...DERIVADOS_DA_PESQUISA.map((d) => d.arquivo),
    ]);
    expect(new Set(readdirSync(pasta))).toEqual(declarados);
  });

  test("cada arquivo publicado conserva o hash declarado", () => {
    for (const d of [...DERIVADOS_DOS_LUGARES, ...DERIVADOS_DA_PESQUISA]) {
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

  test("declara o escopo da autorização e não a generaliza", () => {
    const adr = readFileSync(caminho, "utf8");
    expect(adr).toContain("tarjamento_privacidade");
    expect(adr).toMatch(/não\*{0,2}\s+se estende/i);
    expect(adr).toMatch(/LGPD/);
  });
});
