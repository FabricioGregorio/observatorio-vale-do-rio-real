/**
 * Testes das funções puras do catálogo documental (Tarefa 07).
 * Sem banco: o cliente é importado sob demanda pelo script, não no topo.
 */
import { describe, expect, test } from "vitest";
import {
  calcularOrdemAnexo,
  camposDoItem,
  exigidoPeloEdital,
  prefixoChaveStorage,
  TIPOS_DOCUMENTO,
  tipoDocumentoDoItem,
  VERSAO,
} from "../scripts/catalogar-documentos";
import type { ItemInventario } from "../src/lib/espelhamento";

const item = (parcial: Partial<ItemInventario> = {}): ItemInventario => ({
  id: "A02",
  categoria: "Análise de dados",
  item: "Relatório Técnico — Recanto da Serra",
  tipo: "relatorio_tecnico",
  exigidoPeloEdital: "Sim",
  status: "Disponível",
  fonteAtual: "Google Docs",
  linkAtual: "https://docs.google.com/document/d/abc/edit",
  slugProposto: "relatorio-tecnico-recanto-da-serra",
  ...parcial,
});

/** Os 30 IDs reais do inventário, na ordem em que aparecem na planilha. */
const IDS = [
  "A01",
  "A02",
  "A03",
  "A04",
  "A05",
  "A06",
  "A07",
  "A08",
  "A09",
  "A10",
  "B01",
  "B02",
  "B03",
  "B04",
  "B05",
  "B06",
  "B07",
  "B08",
  "B09",
  "B10",
  "B11",
  "B12",
  "C01",
  "C02",
  "C03",
  "C04",
  "D01",
  "D02",
  "E01",
  "E02",
];

describe("tipo_documento", () => {
  test("aceita os doze valores do enum", () => {
    for (const tipo of TIPOS_DOCUMENTO) {
      expect(tipoDocumentoDoItem(item({ tipo }))).toBe(tipo);
    }
  });

  test("recusa valor fora do enum em vez de cair em 'outro'", () => {
    expect(() => tipoDocumentoDoItem(item({ tipo: "relatorio" }))).toThrow(
      /não existe no enum/,
    );
    expect(() => tipoDocumentoDoItem(item({ tipo: "" }))).toThrow();
  });

  test("os onze tipos usados pelo inventário são válidos", () => {
    const usados = [
      "painel_dados",
      "relatorio_tecnico",
      "diagnostico_interno",
      "formulario_modelo",
      "outro",
      "entrevista_transcricao",
      "relato_campo",
      "relatorio_parcial",
      "documento_final",
      "modelagem_estatistica",
      "identidade_visual",
    ];
    for (const t of usados) expect(TIPOS_DOCUMENTO).toContain(t);
  });
});

describe("exigido_pelo_edital", () => {
  test("converte Sim e Não", () => {
    expect(exigidoPeloEdital(item({ exigidoPeloEdital: "Sim" }))).toBe(true);
    expect(exigidoPeloEdital(item({ exigidoPeloEdital: "Não" }))).toBe(false);
    expect(exigidoPeloEdital(item({ exigidoPeloEdital: "nao" }))).toBe(false);
  });

  test("recusa valor inesperado", () => {
    expect(() =>
      exigidoPeloEdital(item({ exigidoPeloEdital: "talvez" })),
    ).toThrow(/valor inesperado/);
  });
});

describe("ordem_anexo", () => {
  test("os 30 IDs do inventário viram 1..30 na ordem A, B, C, D, E", () => {
    const ordens = calcularOrdemAnexo(IDS.map((id) => item({ id })));
    expect(ordens.size).toBe(30);
    expect(ordens.get("A01")).toBe(1);
    expect(ordens.get("A10")).toBe(10);
    expect(ordens.get("B01")).toBe(11);
    expect(ordens.get("B12")).toBe(22);
    expect(ordens.get("C01")).toBe(23);
    expect(ordens.get("C04")).toBe(26);
    expect(ordens.get("D01")).toBe(27);
    expect(ordens.get("D02")).toBe(28);
    expect(ordens.get("E01")).toBe(29);
    expect(ordens.get("E02")).toBe(30);
  });

  test("é estável se as linhas da planilha vierem embaralhadas", () => {
    const embaralhado = [...IDS].reverse().map((id) => item({ id }));
    const ordens = calcularOrdemAnexo(embaralhado);
    expect(ordens.get("A01")).toBe(1);
    expect(ordens.get("E02")).toBe(30);
  });

  test("ordena pelo número, não pelo texto: A10 vem depois de A09", () => {
    const ordens = calcularOrdemAnexo(
      ["A09", "A10", "A02"].map((id) => item({ id })),
    );
    expect(ordens.get("A02")).toBe(1);
    expect(ordens.get("A09")).toBe(2);
    expect(ordens.get("A10")).toBe(3);
  });

  test("sem lacunas nem repetições", () => {
    const valores = [
      ...calcularOrdemAnexo(IDS.map((id) => item({ id }))).values(),
    ];
    expect([...valores].sort((a, b) => a - b)).toEqual(
      Array.from({ length: 30 }, (_, i) => i + 1),
    );
  });
});

describe("prefixo da chave_storage", () => {
  test("usa categoria e slug, ancorado em -v1.", () => {
    expect(prefixoChaveStorage(item())).toBe(
      "arquivos/analise-de-dados/relatorio-tecnico-recanto-da-serra-v1.",
    );
  });

  test("deriva o slug quando a planilha não traz um", () => {
    expect(
      prefixoChaveStorage(
        item({
          slugProposto: "",
          item: "Relato de campo — Lhucas",
          categoria: "Comprovação de campo",
        }),
      ),
    ).toBe("arquivos/comprovacao-de-campo/relato-de-campo-lhucas-v1.");
  });

  test("o literal -v1. impede que um slug curto capture um mais longo", () => {
    const curto = prefixoChaveStorage(item({ slugProposto: "relatorio" }));
    const longo = prefixoChaveStorage(
      item({ slugProposto: "relatorio-tecnico" }),
    );
    expect(longo.startsWith(curto)).toBe(false);
    expect(curto).toBe("arquivos/analise-de-dados/relatorio-v1.");
  });

  test("a versão da primeira catalogação é 1", () => {
    expect(VERSAO).toBe(1);
    expect(prefixoChaveStorage(item())).toContain("-v1.");
  });

  test("categoria fora do vocabulário falha, não vira caminho inventado", () => {
    expect(() =>
      prefixoChaveStorage(item({ categoria: "Relatórios" })),
    ).toThrow(/fora do vocabulário/);
  });
});

describe("camposDoItem", () => {
  test("monta os campos que o script controla", () => {
    expect(camposDoItem(item(), 2)).toEqual({
      slug: "relatorio-tecnico-recanto-da-serra",
      titulo: "Relatório Técnico — Recanto da Serra",
      tipo: "relatorio_tecnico",
      exigidoPeloEdital: true,
      ordemAnexo: 2,
    });
  });

  test("não inventa nada para campos sem fonte no inventário", () => {
    const campos = camposDoItem(item(), 1);
    for (const ausente of ["resumo", "autoria", "dataReferencia", "status"]) {
      expect(campos).not.toHaveProperty(ausente);
    }
  });

  test("item sem título falha", () => {
    expect(() =>
      camposDoItem(item({ item: "", slugProposto: "x" }), 1),
    ).toThrow(/sem título/);
  });

  test("item cujo título e slug normalizam para vazio falha", () => {
    expect(() =>
      camposDoItem(item({ item: "—", slugProposto: "" }), 1),
    ).toThrow();
  });
});
