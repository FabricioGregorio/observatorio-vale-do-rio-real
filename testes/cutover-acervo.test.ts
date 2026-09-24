import { describe, expect, test } from "vitest";
import loteAntigoBruto from "../src/dados/lote-publicacao-2026-09-16.json";
import {
  exigirLote,
  IDS_DOS_LOTES,
  IDS_EXECUTAVEIS,
  idDoLoteEmArgv,
  LOTES_DECLARADOS,
} from "../src/dados/lotes-de-publicacao";
import {
  exigirPlano,
  idDoPlanoEmArgv,
  itemDoPlanoSchema,
  PLANOS_DECLARADOS,
} from "../src/dados/plano-de-despublicacao";

const PREFIXO = "arquivos/comprovacao-de-campo/";

/*
  Este arquivo já teve três blocos a mais, todos sobre os executores de
  publicação e despublicação: o padrão `--lote`/`--plano` da linha de comando,
  a recusa do publicador em sobrescrever chave ocupada e a conferência
  fail-closed que comparava a linha do banco com o item do plano antes de
  tornar um objeto privado. Os dois executores escreviam no PostgreSQL e foram
  removidos com ele; o fluxo editorial que os substitui é do Lote C.

  O que sobrou não depende de executor nenhum: são os artefatos versionados do
  corte — os lotes declarados e o plano de despublicação — e as invariantes
  que eles precisam satisfazer para que a história da publicação continue
  legível. Elas valem independentemente de quem as executa.
*/

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

  test("os três lotes estão registrados, em ordem cronológica", () => {
    expect(IDS_DOS_LOTES).toEqual(["2026-09-08", "2026-09-16", "2026-09-18"]);
    expect(LOTES_DECLARADOS.size).toBe(3);
  });

  /*
    A primeira publicação entrou no registro em 2026-09-23. Ela compõe o
    acervo — dois dos seus objetos continuam públicos e não são declarados em
    nenhum outro lugar —, mas não pode ser reexecutada: seis dos oito objetos
    foram substituídos na migração para os originais, duas fontes não existem
    mais, e as entradas não trazem os campos que o executor grava.

    Registrar sem distinguir a natureza obrigaria a uma das duas coisas que o
    projeto não faz: esconder um lote real da proveniência, ou preencher à mão
    campos que ninguém declarou em 08/09.
  */
  test("a primeira publicação está registrada como histórica", () => {
    const primeira = LOTES_DECLARADOS.get("2026-09-08");
    expect(primeira?.natureza).toBe("historico");
    expect(primeira?.entradas).toHaveLength(8);
    expect(primeira?.codigos).toEqual(["A02", "D01"]);
  });

  test("só os lotes executáveis são oferecidos a --lote", () => {
    expect(IDS_EXECUTAVEIS).toEqual(["2026-09-16", "2026-09-18"]);
  });

  test("lote histórico é recusado nomeando o motivo, não como desconhecido", () => {
    expect(() => exigirLote("2026-09-08")).toThrow(/histórico/);
    expect(() => exigirLote("2026-09-08")).not.toThrow(/desconhecido/);
  });

  test("--lote é lido do argv, e a ausência é distinguível", () => {
    expect(idDoLoteEmArgv(["--lote", "2026-09-18"])).toBe("2026-09-18");
    expect(idDoLoteEmArgv(["--executar"])).toBeUndefined();
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

  test("--plano é lido do argv, e a ausência é distinguível", () => {
    expect(idDoPlanoEmArgv(["--plano", "2026-09-18"])).toBe("2026-09-18");
    expect(idDoPlanoEmArgv(["--executar"])).toBeUndefined();
  });

  test("os dois artefatos do corte são contrapartidas: 19 entram, 19 saem", () => {
    expect(exigirLote("2026-09-18").entradas).toHaveLength(19);
    expect(PLANOS_DECLARADOS.get("2026-09-18")?.itens).toHaveLength(19);
  });
});
