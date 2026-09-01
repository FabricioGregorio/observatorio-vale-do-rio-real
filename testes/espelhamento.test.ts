/**
 * Testes das funções puras do espelhamento (Tarefa 06).
 * Sem rede, sem banco, sem storage — só as decisões determinísticas.
 */
import { describe, expect, test } from "vitest";

import {
  backoffMs,
  categoriaDoItem,
  chaveStorage,
  ehRetentavel,
  exigeCapturaManual,
  extensaoDaUrl,
  extensaoDeMime,
  type ItemInventario,
  lerCsv,
  lerInventario,
  normalizar,
  origemSistemaDoItem,
  pendenciaDeOrigem,
  resolverMime,
  slugDoItem,
  tipoMidiaDeMime,
} from "../src/lib/espelhamento";

const item = (parcial: Partial<ItemInventario> = {}): ItemInventario => ({
  id: "A02",
  categoria: "Análise de dados",
  item: "Relatório Técnico — Recanto da Serra",
  tipo: "relatorio_tecnico",
  exigidoPeloEdital: "Sim",
  status: "Disponível",
  fonteAtual: "Google Docs",
  linkAtual: "https://docs.google.com/document/d/abc/export?format=pdf",
  slugProposto: "relatorio-tecnico-recanto-da-serra",
  ...parcial,
});

describe("normalizar", () => {
  test("minúsculas, sem acento, hífen entre palavras", () => {
    expect(normalizar("Relatório Técnico — Recanto da Serra")).toBe(
      "relatorio-tecnico-recanto-da-serra",
    );
    expect(normalizar("Diagnóstico Interno — Visitantes II")).toBe(
      "diagnostico-interno-visitantes-ii",
    );
    expect(normalizar("Comprovação de campo")).toBe("comprovacao-de-campo");
  });

  test("conjunto ASCII: o ordinal ª vira separador, não sobrevive", () => {
    expect(normalizar("PodObservar — 1ª temporada")).toBe(
      "podobservar-1-temporada",
    );
  });

  test("sem hífen nas extremidades e sem hífen duplicado", () => {
    expect(normalizar("  — Termos, de consentimento —  ")).toBe(
      "termos-de-consentimento",
    );
  });
});

describe("slugDoItem", () => {
  test("usa Slug proposto quando existe", () => {
    expect(slugDoItem(item())).toBe("relatorio-tecnico-recanto-da-serra");
  });

  test("deriva de Item quando Slug proposto está vazio", () => {
    expect(
      slugDoItem(item({ slugProposto: "", item: "Relato de campo — Lhucas" })),
    ).toBe("relato-de-campo-lhucas");
  });

  test("os 16 itens sem slug do inventário não colidem entre si", () => {
    const titulos = [
      "Diagnóstico Interno — Recanto da Serra",
      "Diagnóstico Interno — Borda da Mata",
      "Diagnóstico Interno — Visitantes I",
      "Diagnóstico Interno — Visitantes II",
      "Entrevista — Secretaria de Cultura de Itabaianinha",
      "Entrevista — Prefeito de Tobias Barreto",
      "Relato de campo — Lhucas",
      "Relato de campo — Fabricio",
      "Relato de campo — Luiz",
      "Relato de campo — Galileu",
      "Relatório Parcial de Levantamento de Dados",
      "Documento Final da pesquisa",
      "Relatório de modelagem estatística",
      "PodObservar — 1ª temporada",
      "Termos de consentimento das entrevistas",
      "Manual de aplicação de marcas do edital",
    ];
    const slugs = titulos.map((t) =>
      slugDoItem(item({ slugProposto: "", item: t })),
    );
    expect(new Set(slugs).size).toBe(titulos.length);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });
});

describe("categoriaDoItem", () => {
  test("aceita as cinco categorias do inventário", () => {
    const esperado = {
      "Análise de dados": "analise-de-dados",
      "Comprovação de campo": "comprovacao-de-campo",
      Conformidade: "conformidade",
      "Produto final": "produto-final",
      Publicidade: "publicidade",
    };
    for (const [entrada, saida] of Object.entries(esperado)) {
      expect(categoriaDoItem(item({ categoria: entrada }))).toBe(saida);
    }
  });

  test("falha explicitamente fora do vocabulário", () => {
    expect(() => categoriaDoItem(item({ categoria: "Relatórios" }))).toThrow(
      /fora do vocabulário/,
    );
  });
});

describe("origemSistemaDoItem", () => {
  test("mapeia as seis fontes do inventário", () => {
    const esperado = {
      "Google Drive": "google_drive",
      "Google Docs": "google_docs",
      "Google Forms": "google_forms",
      Figma: "figma",
      "Arquivo local": "upload",
      Instagram: "instagram",
    };
    for (const [entrada, saida] of Object.entries(esperado)) {
      expect(origemSistemaDoItem(item({ fonteAtual: entrada }))).toBe(saida);
    }
  });

  test("falha em fonte desconhecida em vez de inventar valor", () => {
    expect(() => origemSistemaDoItem(item({ fonteAtual: "Dropbox" }))).toThrow(
      /fora do vocabulário/,
    );
  });
});

describe("tipo_midia e mime", () => {
  test("mapeia MIME para os valores do enum", () => {
    expect(tipoMidiaDeMime("application/pdf")).toBe("pdf");
    expect(tipoMidiaDeMime("audio/mpeg")).toBe("audio");
    expect(tipoMidiaDeMime("image/png")).toBe("imagem");
    expect(tipoMidiaDeMime("video/mp4")).toBe("video");
    expect(tipoMidiaDeMime("text/csv")).toBe("dataset");
    expect(
      tipoMidiaDeMime(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ),
    ).toBe("planilha");
  });

  test("ignora parâmetros do Content-Type", () => {
    expect(tipoMidiaDeMime("application/pdf; charset=binary")).toBe("pdf");
  });

  test("formato de dados abertos é dataset", () => {
    for (const mime of [
      "text/csv",
      "text/tab-separated-values",
      "application/json",
    ]) {
      expect(tipoMidiaDeMime(mime)).toBe("dataset");
    }
  });

  test("planilha de escritório é planilha, não dataset", () => {
    for (const mime of [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.oasis.opendocument.spreadsheet",
    ]) {
      expect(tipoMidiaDeMime(mime)).toBe("planilha");
    }
  });

  test("'outro' nunca é produzido automaticamente", () => {
    const conhecidos = [
      "application/pdf",
      "audio/mpeg",
      "image/png",
      "video/mp4",
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.ms-powerpoint",
    ];
    for (const mime of conhecidos) {
      expect(tipoMidiaDeMime(mime)).not.toBe("outro");
    }
    expect(() => tipoMidiaDeMime("application/x-desconhecido")).toThrow();
  });

  test("falha em vez de cair em 'outro'", () => {
    expect(() => tipoMidiaDeMime("application/x-desconhecido")).toThrow(
      /tipo_midia/,
    );
  });

  test("Content-Type da origem tem precedência sobre a extensão", () => {
    expect(resolverMime("application/pdf", "https://x/y/arquivo.png")).toBe(
      "application/pdf",
    );
  });

  test("extensão é fallback quando a origem não informa tipo útil", () => {
    expect(resolverMime(null, "https://x/y/relatorio.pdf")).toBe(
      "application/pdf",
    );
    expect(
      resolverMime("application/octet-stream", "https://x/y/audio.mp3"),
    ).toBe("audio/mpeg");
  });

  test("falha quando nem Content-Type nem extensão resolvem", () => {
    expect(() =>
      resolverMime(null, "https://drive.google.com/file/d/abc"),
    ).toThrow(/determinar o MIME/);
  });

  test("extensão da URL ignora query e fragmento", () => {
    expect(extensaoDaUrl("https://x/y/a.pdf?v=2#p1")).toBe("pdf");
    expect(extensaoDaUrl("https://x/y/sem-extensao")).toBe("");
  });

  test("extensão canônica a partir do MIME", () => {
    expect(extensaoDeMime("application/pdf")).toBe("pdf");
    expect(() => extensaoDeMime("application/x-desconhecido")).toThrow(
      /extensão/,
    );
  });
});

describe("chaveStorage", () => {
  test("segue arquivos/<categoria>/<slug>-v<n>.<ext>", () => {
    expect(
      chaveStorage(
        "analise-de-dados",
        "relatorio-tecnico-recanto-da-serra",
        1,
        "pdf",
      ),
    ).toBe(
      "arquivos/analise-de-dados/relatorio-tecnico-recanto-da-serra-v1.pdf",
    );
  });
});

describe("pendência de origem", () => {
  test("item sem link é pendência, não falha de rede", () => {
    expect(pendenciaDeOrigem(item({ linkAtual: "" }))?.motivo).toMatch(
      /sem Link atual/,
    );
  });

  test("link que não é http(s) é pendência", () => {
    expect(pendenciaDeOrigem(item({ linkAtual: "109" }))?.motivo).toMatch(
      /não é uma URL/,
    );
  });

  test("fonte fora do vocabulário é pendência", () => {
    expect(pendenciaDeOrigem(item({ fonteAtual: "40" }))?.motivo).toMatch(
      /fora do vocabulário/,
    );
  });

  test("item completo não é pendência", () => {
    expect(pendenciaDeOrigem(item())).toBeNull();
  });

  test("Figma exige captura manual", () => {
    expect(exigeCapturaManual(item({ fonteAtual: "Figma" }))).toBe(true);
    expect(exigeCapturaManual(item({ fonteAtual: "Google Drive" }))).toBe(
      false,
    );
  });
});

describe("retentativa", () => {
  test("4xx não é retentável, exceto 408 e 429", () => {
    expect(ehRetentavel(404)).toBe(false);
    expect(ehRetentavel(403)).toBe(false);
    expect(ehRetentavel(408)).toBe(true);
    expect(ehRetentavel(429)).toBe(true);
    expect(ehRetentavel(500)).toBe(true);
    expect(ehRetentavel(503)).toBe(true);
  });

  test("backoff cresce entre tentativas", () => {
    expect(backoffMs(1)).toBe(1000);
    expect(backoffMs(2)).toBe(2000);
    expect(backoffMs(3)).toBe(4000);
  });
});

describe("leitura do inventário", () => {
  test("respeita aspas, vírgulas e quebras dentro do campo", () => {
    const csv = 'a,b\n"x, y","linha1\nlinha2"\n';
    expect(lerCsv(csv)).toEqual([
      ["a", "b"],
      ["x, y", "linha1\nlinha2"],
    ]);
  });

  test("aspas duplas escapadas", () => {
    expect(lerCsv('a\n"diz ""oi"""\n')).toEqual([["a"], ['diz "oi"']]);
  });

  test("converte as colunas da aba Inventário", () => {
    const csv = [
      "ID,Categoria,Item,Tipo (enum),Exigido pelo edital,Status,Fonte atual,Link atual,Slug proposto,Responsável",
      "A02,Análise de dados,Relatório Técnico,relatorio_tecnico,Sim,Disponível,Google Docs,https://x/y.pdf,relatorio-tecnico,",
      "A05,Análise de dados,Diagnóstico Interno,diagnostico_interno,Sim,Pendente,,,,",
    ].join("\n");
    const itens = lerInventario(csv);
    expect(itens).toHaveLength(2);
    const [primeiro, segundo] = itens;
    if (!primeiro || !segundo) throw new Error("esperava dois itens");
    expect(primeiro.id).toBe("A02");
    expect(primeiro.fonteAtual).toBe("Google Docs");
    expect(segundo.linkAtual).toBe("");
    expect(pendenciaDeOrigem(segundo)).not.toBeNull();
  });

  test("falha se faltar coluna obrigatória", () => {
    expect(() => lerInventario("ID,Categoria\nA01,Publicidade")).toThrow(
      /ausente/,
    );
  });
});
