import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";
import {
  conferir,
  FalhaDespublicacao,
  type LinhaDoBanco,
  opcoes as opcoesDaDespublicacao,
} from "../scripts/despublicar-acervo";
import { opcoes as opcoesDaPublicacao } from "../scripts/publicar-acervo";
import loteAntigoBruto from "../src/dados/lote-publicacao-2026-09-16.json";
import {
  exigirLote,
  IDS_DOS_LOTES,
  idDoLoteEmArgv,
  LOTES_DECLARADOS,
} from "../src/dados/lotes-de-publicacao";
import {
  exigirPlano,
  idDoPlanoEmArgv,
  itemDoPlanoSchema,
  PLANOS_DECLARADOS,
} from "../src/dados/plano-de-despublicacao";

const PUBLICADOR = "scripts/publicar-acervo.ts";
const DESPUBLICADOR = "scripts/despublicar-acervo.ts";
const PREFIXO = "arquivos/comprovacao-de-campo/";

/**
 * O executor não adivinha o que publicar.
 *
 * Antes de 2026-09-18 o lote vinha do módulo, e publicar outro conjunto pedia
 * edição de código. Um executor que escolhe sozinho o lote é um executor que
 * pode republicar o histórico por acidente.
 */
describe("seleção de lote é explícita", () => {
  test("sem id não existe lote", () => {
    expect(() => exigirLote(undefined)).toThrow(/Lote não informado/);
    expect(() => exigirLote("")).toThrow(/Lote não informado/);
    expect(() => exigirLote("   ")).toThrow(/Lote não informado/);
  });

  test("id desconhecido não cai em nenhum padrão", () => {
    expect(() => exigirLote("2026-01-01")).toThrow(/Lote desconhecido/);
  });

  test("o lote histórico de 16/09 continua legível e intacto", () => {
    const antigo = exigirLote("2026-09-16");
    expect(antigo.entradas).toHaveLength(101);
    expect(antigo.entradas).toHaveLength(loteAntigoBruto.length);
    expect(antigo.codigos).toContain("B01");
  });

  test("o lote novo de 18/09 é aceito e só toca B01", () => {
    const novo = exigirLote("2026-09-18");
    expect(novo.entradas).toHaveLength(19);
    expect(novo.codigos).toEqual(["B01"]);
    expect(new Set(novo.entradas.map((e) => e.codigo))).toEqual(
      new Set(["B01"]),
    );
  });

  test("os dois lotes estão declarados e nenhum outro", () => {
    expect(IDS_DOS_LOTES).toEqual(["2026-09-16", "2026-09-18"]);
    expect(LOTES_DECLARADOS.size).toBe(2);
  });

  test("--lote é lido do argv, e sem ele a publicação recusa", () => {
    expect(idDoLoteEmArgv(["--lote", "2026-09-18"])).toBe("2026-09-18");
    expect(idDoLoteEmArgv(["--executar"])).toBeUndefined();
    expect(() => opcoesDaPublicacao(["--executar"])).toThrow(
      /Lote não informado/,
    );
  });

  test("dry-run é o padrão da publicação", () => {
    expect(opcoesDaPublicacao(["--lote", "2026-09-18"]).executar).toBe(false);
    expect(
      opcoesDaPublicacao(["--lote", "2026-09-18", "--executar"]).executar,
    ).toBe(true);
  });

  test("argumento desconhecido não passa", () => {
    expect(() =>
      opcoesDaPublicacao(["--lote", "2026-09-18", "--forcar"]),
    ).toThrow();
  });
});

/**
 * Substituir não é sobrescrever.
 *
 * A chave antiga vai ser apagada do bucket. Se o objeto novo ocupasse a mesma
 * chave, a fase de remoção apagaria a fotografia que acabou de entrar.
 */
describe("as seis substituições recebem chave própria", () => {
  const antigas = new Set(loteAntigoBruto.map((e) => e.chave));
  const novo = exigirLote("2026-09-18");
  const plano = exigirPlano("2026-09-18");

  test("nenhuma chave nova coincide com chave já publicada", () => {
    for (const entrada of novo.entradas)
      expect(antigas.has(entrada.chave), entrada.chave).toBe(false);
  });

  test("nenhuma chave nova está no plano de remoção", () => {
    const aRemover = new Set(plano.itens.map((i) => i.chave));
    for (const entrada of novo.entradas)
      expect(aRemover.has(entrada.chave), entrada.chave).toBe(false);
  });

  test.each([
    "b01-ilha-grande-cais-ou-pier-ilha-grande",
    "b01-ilha-grande-campo-verde-de-grama-e-arvores",
    "b01-ilha-grande-dona-mada",
    "b01-ilha-grande-forno-a-lenha",
    "b01-ilha-grande-forno-a-lenha2",
    "b01-ilha-grande-igrejinha",
  ])("%s sai em v1 e entra em v2", (base) => {
    const chavesNovas = new Set(novo.entradas.map((e) => e.chave));
    const aRemover = new Set(plano.itens.map((i) => i.chave));
    expect(chavesNovas.has(`${PREFIXO}${base}-v2.webp`)).toBe(true);
    expect(aRemover.has(`${PREFIXO}${base}-v1.webp`)).toBe(true);
    expect(chavesNovas.has(`${PREFIXO}${base}-v1.webp`)).toBe(false);
  });

  test("o lote novo não repete chave", () => {
    const chaves = novo.entradas.map((e) => e.chave);
    expect(new Set(chaves).size).toBe(chaves.length);
  });
});

/**
 * O publicador falha fechado nas frentes que não dão para testar sem rede:
 * a comparação existe no código e aborta, em vez de seguir.
 */
describe("o publicador aborta em divergência", () => {
  const script = readFileSync(PUBLICADOR, "utf8");

  test("fonte com hash ou bytes diferentes do lote interrompe", () => {
    expect(script).toContain("Fonte divergente do lote aprovado");
    expect(script).toMatch(/sha256 !== entrada\.sha256/);
    expect(script).toMatch(/corpo\.byteLength !== entrada\.bytes/);
  });

  test("chave ocupada por conteúdo diferente interrompe", () => {
    expect(script).toContain("Chave pública já ocupada por conteúdo diferente");
    expect(script).toMatch(/situacao === "divergente"/);
  });

  test("chave com o mesmo conteúdo é reaproveitada, nunca sobrescrita", () => {
    expect(script).toMatch(/situacao === "identico"/);
    expect(script).toContain("reaproveitados");
  });

  test("upload e INSERT só acontecem com --executar", () => {
    expect(script).toMatch(/situacao === "ausente" && executar/);
    const dryRun = script.indexOf("if (!executar)");
    const persistencia = script.indexOf("poolManutencao.connect");
    expect(dryRun).toBeGreaterThan(-1);
    expect(dryRun).toBeLessThan(persistencia);
  });

  test("a promoção de documento usa os códigos do lote, não uma lista global", () => {
    expect(script).toContain("lote.codigos.map");
    expect(script).not.toContain("CODIGOS_DO_LOTE");
  });
});

/**
 * A regra que decide se a despublicação pode seguir é pura, e por isso é
 * testável sem banco. Qualquer divergência aborta tudo — não há execução
 * parcial por padrão.
 */
describe("conferência fail-closed da despublicação", () => {
  const item = exigirPlano("2026-09-18").itens[0];
  if (!item) throw new Error("plano vazio");

  const linhaBoa: LinhaDoBanco = {
    id: item.arquivoId,
    chave_storage: item.chave,
    sha256: item.sha256,
    bytes: item.bytes,
    mime_type: item.mimeType,
    visibilidade: "publico",
    url_publica: item.urlPublica,
    documentos: [item.documento],
    dependentes: 0,
  };

  test("linha íntegra e pública está pronta para sair", () => {
    expect(conferir(item, linhaBoa)).toBe("publicado");
  });

  test("linha ausente no banco aborta", () => {
    expect(() => conferir(item, undefined)).toThrow(FalhaDespublicacao);
  });

  const divergencias: readonly [string, Partial<LinhaDoBanco>][] = [
    ["id", { id: "00000000-0000-4000-8000-000000000000" }],
    ["chave_storage", { chave_storage: `${PREFIXO}outro-objeto-v1.webp` }],
    ["sha256", { sha256: "0".repeat(64) }],
    ["bytes", { bytes: 1 }],
    ["mime_type", { mime_type: "image/png" }],
    ["documento", { documentos: ["outro-documento"] }],
    ["dependentes", { dependentes: 2 }],
  ];

  test.each(divergencias)("divergência em %s aborta", (_campo, mudanca) => {
    expect(() => conferir(item, { ...linhaBoa, ...mudanca })).toThrow(
      FalhaDespublicacao,
    );
  });

  test("url_publica divergente aborta", () => {
    expect(() =>
      conferir(item, {
        ...linhaBoa,
        url_publica: "https://acervo.observatoriotobiassoueu.com.br/outro",
      }),
    ).toThrow(/url_publica divergente/);
  });

  test("visibilidade inesperada aborta", () => {
    expect(() =>
      conferir(item, { ...linhaBoa, visibilidade: "restrito" }),
    ).toThrow(/visibilidade inesperada/);
  });

  /*
    Idempotência: reexecutar depois de uma remoção parcial precisa reconhecer
    o que já saiu, sem tratar isso como erro e sem mirar outro objeto.
  */
  test("objeto já privado é reconhecido, não reprocessado", () => {
    expect(
      conferir(item, {
        ...linhaBoa,
        visibilidade: "privado",
        url_publica: null,
      }),
    ).toBe("ja_privado");
  });

  test("privado com url preenchida é estado impossível e aborta", () => {
    expect(() =>
      conferir(item, { ...linhaBoa, visibilidade: "privado" }),
    ).toThrow(/privado com url_publica preenchida/);
  });
});

describe("plano de despublicação é declarado e fechado", () => {
  const plano = exigirPlano("2026-09-18");

  test("sem id não existe plano", () => {
    expect(() => exigirPlano(undefined)).toThrow(/Plano não informado/);
    expect(() => exigirPlano("2026-01-01")).toThrow(/Plano desconhecido/);
  });

  test("declara exatamente as 19 chaves, sem repetição", () => {
    expect(plano.itens).toHaveLength(19);
    expect(new Set(plano.itens.map((i) => i.chave)).size).toBe(19);
    expect(new Set(plano.itens.map((i) => i.arquivoId)).size).toBe(19);
  });

  test("toda entrada é um objeto público concreto", () => {
    for (const item of plano.itens) {
      expect(() => itemDoPlanoSchema.parse(item)).not.toThrow();
      expect(item.urlPublica.endsWith(item.chave), item.chave).toBe(true);
      expect(item.chave.startsWith(PREFIXO), item.chave).toBe(true);
    }
  });

  test("dry-run é o padrão da despublicação", () => {
    expect(idDoPlanoEmArgv(["--plano", "2026-09-18"])).toBe("2026-09-18");
    expect(opcoesDaDespublicacao(["--plano", "2026-09-18"]).executar).toBe(
      false,
    );
    expect(
      opcoesDaDespublicacao(["--plano", "2026-09-18", "--executar"]).executar,
    ).toBe(true);
  });

  test("os dois artefatos do corte são contrapartidas: 19 entram, 19 saem", () => {
    expect(exigirLote("2026-09-18").entradas).toHaveLength(19);
    expect(PLANOS_DECLARADOS.get("2026-09-18")?.itens).toHaveLength(19);
  });
});

/**
 * Banco e storage não compartilham transação. O código admite isso em vez de
 * simular atomicidade, e a remoção nunca vira operação de prefixo.
 */
describe("fases separadas e remoção nominal", () => {
  const script = readFileSync(DESPUBLICADOR, "utf8");

  test("não existe remoção por prefixo nem em lote", () => {
    expect(script).not.toMatch(/ListObjects|DeleteObjects|Prefix:/);
    expect(script).toContain("DeleteObjectCommand");
    // Uma chamada de remoção, com uma chave por vez.
    expect([...script.matchAll(/new DeleteObjectCommand/g)]).toHaveLength(1);
  });

  test("só as chaves do plano podem ser alvo", () => {
    expect(script).toMatch(/for \(const item of aApagarDoStorage\)/);
    expect(script).toMatch(/Key: chave/);
  });

  test("UPDATE e DELETE só depois do retorno do dry-run", () => {
    const dryRun = script.indexOf("if (!executar)");
    const update = script.indexOf("update arquivo");
    const del = script.indexOf("apagarChave(item.chave)");
    expect(dryRun).toBeGreaterThan(-1);
    expect(dryRun).toBeLessThan(update);
    expect(update).toBeLessThan(del);
  });

  test("o banco sai da publicação sem apagar a linha", () => {
    expect(script).toContain("visibilidade = 'privado'");
    expect(script).toContain("url_publica = null");
    expect(script).not.toMatch(/delete from arquivo|delete from documento/i);
  });

  test("falha no storage depois do banco não é revertida em silêncio", () => {
    expect(script).toContain("storage parcial");
    expect(script).toContain("não reverter o banco");
  });

  test("as quatro fases estão nomeadas no código", () => {
    for (const fase of ["FASE A", "FASE B", "FASE C", "FASE D"])
      expect(script, fase).toContain(fase);
  });
});
