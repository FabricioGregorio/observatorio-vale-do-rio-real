import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

import {
  ATIVIDADES,
  CONTEXTO_DOS_DADOS,
  DESPESA_IDENTIFICADA_NO_MUNICIPIO,
  DESPESA_IDENTIFICADA_TOTAL,
  FIM_DA_COLETA,
  INDICADORES,
  INICIO_DA_COLETA,
  MESES_DE_COLETA,
  SERIE_MENSAL,
} from "../src/dados/indicadores/derivados";
import {
  arredondar,
  exibirIndicador,
  formatarContagem,
  formatarFator,
  formatarPercentual,
  formatarReais,
} from "../src/dados/indicadores/formato";

/** Soma em centavos: somar reais em ponto flutuante acumula resíduo. */
function somarReais(valores: readonly number[]): number {
  return (
    valores.reduce((total, valor) => total + Math.round(valor * 100), 0) / 100
  );
}

function porId(id: string) {
  const indicador = INDICADORES.find((item) => item.id === id);
  if (indicador === undefined) throw new Error(`indicador ausente: ${id}`);
  return indicador;
}

describe("formatação determinística", () => {
  test("arredonda meio-para-cima nos dois sinais", () => {
    expect(arredondar(0.9339802439, 3)).toBe(0.934);
    expect(arredondar(2.5, 0)).toBe(3);
    expect(arredondar(-2.5, 0)).toBe(-3);
    expect(arredondar(469.063, 2)).toBe(469.06);
    expect(arredondar(469.065, 2)).toBe(469.07);
  });

  test("percentual usa uma casa e vírgula decimal", () => {
    expect(formatarPercentual(0.9339802439)).toBe("93,4%");
    expect(formatarPercentual(0.4061288143)).toBe("40,6%");
    expect(formatarPercentual(0.575)).toBe("57,5%");
    expect(formatarPercentual(1)).toBe("100,0%");
    expect(formatarPercentual(0.836774591, 2)).toBe("83,68%");
  });

  test("reais usam ponto de milhar, vírgula decimal e sinal tipográfico", () => {
    expect(formatarReais(18762.52)).toBe("R$ 18.762,52");
    expect(formatarReais(469.063)).toBe("R$ 469,06");
    expect(formatarReais(15700)).toBe("R$ 15.700,00");
    expect(formatarReais(-3062.52)).toBe("−R$ 3.062,52");
    expect(formatarReais(5000, 0)).toBe("R$ 5.000");
    expect(formatarReais(0, 0)).toBe("R$ 0");
  });

  test("contagem e fator seguem a mesma convenção", () => {
    expect(formatarContagem(40)).toBe("40");
    expect(formatarContagem(684)).toBe("684");
    expect(formatarContagem(15700)).toBe("15.700");
    expect(formatarFator(1.195064968)).toBe("1,20×");
  });

  /**
   * O formato não pode depender do ICU do runtime: se um build em outra
   * máquina produzisse "18,762.52", o número exibido deixaria de ser o número
   * conferido. Por isso as funções são puras e este teste fixa a saída.
   */
  test("a saída não varia entre chamadas nem depende de locale", () => {
    const primeira = INDICADORES.map((indicador) => exibirIndicador(indicador));
    const segunda = INDICADORES.map((indicador) => exibirIndicador(indicador));
    expect(primeira).toEqual(segunda);
    expect(primeira).toEqual([
      "93,4%",
      "R$ 469,06",
      "R$ 18.762,52",
      "R$ 15.700,00",
      "40,6%",
      "40",
      "84",
      "12",
    ]);
  });
});

describe("conferência dos valores derivados", () => {
  test("a série mensal fecha com a despesa total declarada", () => {
    expect(somarReais(SERIE_MENSAL.map((mes) => mes.despesa))).toBe(
      porId("H4-003").valorBruto,
    );
  });

  test("a série mensal fecha com a receita registrada declarada", () => {
    expect(somarReais(SERIE_MENSAL.map((mes) => mes.receita))).toBe(
      porId("H4-004").valorBruto,
    );
  });

  test("a série mensal fecha com registros e contratações declarados", () => {
    const registros = SERIE_MENSAL.reduce((t, mes) => t + mes.registros, 0);
    const contratacoes = SERIE_MENSAL.reduce(
      (t, mes) => t + mes.contratacoes,
      0,
    );
    expect(registros).toBe(porId("H4-006").valorBruto);
    expect(contratacoes).toBe(porId("H4-007").valorBruto);
    expect(registros).toBe(CONTEXTO_DOS_DADOS.registrosDeFuncionamento);
  });

  test("retenção municipal é a razão entre as duas despesas identificadas", () => {
    const razao =
      DESPESA_IDENTIFICADA_NO_MUNICIPIO / DESPESA_IDENTIFICADA_TOTAL;
    expect(arredondar(razao, 6)).toBe(
      arredondar(porId("H4-001").valorBruto, 6),
    );
    expect(formatarPercentual(razao)).toBe("93,4%");
  });

  test("a base da retenção é menor que a despesa total, e isso é intencional", () => {
    expect(DESPESA_IDENTIFICADA_TOTAL).toBeLessThan(porId("H4-003").valorBruto);
    expect(DESPESA_IDENTIFICADA_NO_MUNICIPIO).toBeLessThan(
      DESPESA_IDENTIFICADA_TOTAL,
    );
  });

  test("valor movimentado por dia é a despesa total sobre os registros", () => {
    const razao =
      porId("H4-003").valorBruto / CONTEXTO_DOS_DADOS.registrosDeFuncionamento;
    expect(arredondar(razao, 3)).toBe(
      arredondar(porId("H4-002").valorBruto, 3),
    );
  });

  test("participação do trabalho é a contratação sobre a despesa total", () => {
    const contratacoesEmReais = 7620;
    const razao = contratacoesEmReais / porId("H4-003").valorBruto;
    expect(arredondar(razao, 6)).toBe(
      arredondar(porId("H4-005").valorBruto, 6),
    );
  });

  test("nenhuma atividade excede os registros de funcionamento", () => {
    for (const atividade of ATIVIDADES) {
      expect(atividade.diasComAtividade).toBeGreaterThan(0);
      expect(atividade.diasComAtividade).toBeLessThanOrEqual(
        CONTEXTO_DOS_DADOS.registrosDeFuncionamento,
      );
    }
  });

  test("o ranking de atividades está ordenado por dias, do maior ao menor", () => {
    const dias = ATIVIDADES.map((a) => a.diasComAtividade);
    expect(dias).toEqual([...dias].sort((a, b) => b - a));
  });
});

describe("integridade documental do dataset", () => {
  /** Todo campo que pode chegar ao HTML. `procedencia` está fora de propósito. */
  const camposRenderizaveis = INDICADORES.flatMap((indicador) => [
    indicador.id,
    indicador.titulo,
    indicador.base ?? "",
    indicador.periodo,
    indicador.recorte,
    indicador.regra,
    indicador.notaMetodologica ?? "",
    indicador.fontePublica,
  ]);

  /**
   * O período de exibição deriva das duas datas estruturadas, e não o
   * contrário. Sem este teste, alguém pode corrigir a string e deixar as datas
   * para trás — e a Home, que conta meses a partir delas, passaria a publicar
   * um número que não corresponde ao período que os indicadores declaram.
   */
  test("o período exibido é o que as datas da coleta dizem", () => {
    expect(INICIO_DA_COLETA).toBe("2025-07-21");
    expect(FIM_DA_COLETA).toBe("2025-12-21");
    expect(CONTEXTO_DOS_DADOS.periodo).toBe("21/07/2025 a 21/12/2025");
    for (const indicador of INDICADORES) {
      expect(indicador.periodo).toBe(CONTEXTO_DOS_DADOS.periodo);
    }
  });

  /**
   * Cinco, e não seis.
   *
   * Doc 01 §8 e doc 02 §7 declaram "5 meses de coleta" no painel de números do
   * projeto — são as fontes canônicas, e estão acima do código na hierarquia
   * do AGENTS.md. Seis é outra contagem: a de **linhas da série mensal**, que
   * tem julho e dezembro parciais nas pontas. As duas leituras convivem e
   * medem coisas diferentes; confundi-las publicaria um mês que não houve.
   */
  test("a coleta durou cinco meses completos, e a série tem seis linhas", () => {
    expect(MESES_DE_COLETA).toBe(5);
    expect(SERIE_MENSAL).toHaveLength(6);

    const docDaInformacao = readFileSync(
      "docs/01-arquitetura-informacao.md",
      "utf8",
    );
    const docDoBanco = readFileSync("docs/02-arquitetura-banco.md", "utf8");
    expect(docDaInformacao).toContain(`${MESES_DE_COLETA} meses de coleta`);
    expect(docDoBanco).toContain(`${MESES_DE_COLETA} meses de coleta`);
  });

  /** A primeira e a última linha da série são as pontas declaradas do período. */
  test("a série mensal começa e termina dentro da janela de coleta", () => {
    expect(SERIE_MENSAL[0]?.rotulo).toBe("Jul/2025");
    expect(SERIE_MENSAL.at(-1)?.rotulo).toBe("Dez/2025");
  });

  test("todo indicador declara período, recorte, regra e fonte pública", () => {
    for (const indicador of INDICADORES) {
      expect(indicador.periodo).not.toBe("");
      expect(indicador.recorte).not.toBe("");
      expect(indicador.regra).not.toBe("");
      expect(indicador.fontePublica).not.toBe("");
      expect(indicador.procedencia.aba).not.toBe("");
      expect(indicador.procedencia.conferencia).not.toBe("");
    }
  });

  test("os identificadores usam namespace próprio da fase, não código do inventário", () => {
    for (const indicador of INDICADORES) {
      expect(indicador.id).toMatch(/^H4-\d{3}$/);
    }
    expect(new Set(INDICADORES.map((i) => i.id)).size).toBe(INDICADORES.length);
  });

  /**
   * A unidade documental de origem continua RESTRITA. Ela pode sustentar a
   * agregação internamente — `procedencia` guarda o rastro —, mas identificador
   * documental, título interno, nome de arquivo e nome de aba não podem
   * atravessar para nada que seja renderizado.
   */
  test("nenhum campo renderizável carrega identificador da fonte restrita", () => {
    const texto = camposRenderizaveis.join(" | ");
    expect(texto).not.toMatch(/\bA11\b/);
    expect(texto).not.toMatch(/\bES\d{2}\b/);
    expect(texto).not.toMatch(/_Painel_Executivo|_Indicadores_Solidaria/);
    expect(texto).not.toMatch(/Pessoas_Trabalho|Fornecedores/);
    expect(texto).not.toMatch(/anexo-indicadores|\.xlsx/);
  });

  test("nenhum campo renderizável carrega dado pessoal", () => {
    const texto = [
      ...camposRenderizaveis,
      ...ATIVIDADES.flatMap((a) => [a.nome, a.tipo]),
      ...SERIE_MENSAL.map((m) => m.rotulo),
    ].join(" | ");
    expect(texto).not.toContain("@");
    expect(texto).not.toMatch(/\d{3}\.\d{3}\.\d{3}-\d{2}/);
    expect(texto).not.toMatch(/\(\d{2}\)\s?\d{4,5}-\d{4}/);
    expect(texto).not.toMatch(/\bCPF\b|\bRG\b/i);
  });

  /**
   * O dataset é agregado por construção: oito indicadores, seis meses e
   * dezesseis atividades. Se alguém acrescentar aqui uma lista com dezenas de
   * linhas, é sinal de que uma base individual entrou no repositório.
   */
  test("o dataset continua agregado, sem base individual", () => {
    expect(INDICADORES.length).toBeLessThanOrEqual(12);
    expect(SERIE_MENSAL.length).toBe(6);
    expect(ATIVIDADES.length).toBeLessThanOrEqual(20);
  });
});

describe("vínculo com a fonte fora do repositório", () => {
  const raiz = process.env.OBSERVATORIO_FONTES_DIR;
  const caminho =
    raiz === undefined
      ? null
      : join(
          raiz,
          "formularios",
          "indicadores-observatorio",
          "anexo-indicadores-observatorio-pnab-estatico-final.xlsx",
        );
  const disponivel = caminho !== null && existsSync(caminho);

  test.skipIf(!disponivel)(
    "o hash da planilha de origem continua o registrado",
    () => {
      if (caminho === null) return;
      const bytes = readFileSync(caminho);
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(
        CONTEXTO_DOS_DADOS.sha256DaFonte,
      );
    },
  );

  test("o hash registrado tem formato de SHA-256", () => {
    expect(CONTEXTO_DOS_DADOS.sha256DaFonte).toMatch(/^[0-9a-f]{64}$/);
  });
});
