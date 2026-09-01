/**
 * Testes do gate de pendências (Tarefa 09).
 *
 * Duas partes, deliberadamente separadas:
 *
 * - as funções puras rodam sempre, sem banco;
 * - a integração roda apenas com `DATABASE_URL`, contra um PostgreSQL de
 *   verdade. Nenhum banco falso e nenhum mock de PostgreSQL: a view é SQL, e um
 *   mock provaria só que o mock funciona. Sem credencial o Vitest marca o bloco
 *   como skipped, e a ausência de cobertura fica visível em vez de silenciosa.
 */
import { afterAll, beforeAll, describe, expect, test } from "vitest";

import {
  emCi,
  formatarTabela,
  resultado,
  semCredencial,
} from "../scripts/verificar-pendencias";
import type { Pendencia } from "../src/dados/consultas/pendencias";

const pendencia = (parcial: Partial<Pendencia> = {}): Pendencia => ({
  slug: "relatorio-parcial",
  titulo: "Relatório Parcial",
  pendencia: "anexo obrigatório sem arquivo espelhado",
  ...parcial,
});

describe("tabela legível", () => {
  test("traz cabeçalho, separador e uma linha por pendência", () => {
    const saida = formatarTabela([pendencia(), pendencia({ slug: "outro" })]);
    const linhas = saida.split("\n");

    expect(linhas).toHaveLength(4);
    expect(linhas[0]).toContain("slug");
    expect(linhas[0]).toContain("titulo");
    expect(linhas[0]).toContain("pendencia");
    expect(linhas[1]).toMatch(/^-+ {2}-+ {2}-+$/);
    expect(linhas[2]).toContain("relatorio-parcial");
    expect(linhas[3]).toContain("outro");
  });

  test("alinha as colunas pelo valor mais largo", () => {
    const saida = formatarTabela([
      pendencia({ slug: "curto" }),
      pendencia({ slug: "um-slug-bem-mais-comprido" }),
    ]);
    const [, , primeira, segunda] = saida.split("\n");

    expect(primeira?.indexOf("Relatório Parcial")).toBe(
      segunda?.indexOf("Relatório Parcial"),
    );
  });

  test("valor ausente vira travessão, nunca célula em branco", () => {
    expect(formatarTabela([pendencia({ titulo: null })])).toContain("—");
  });
});

describe("decisão do gate após consultar", () => {
  test("limpo sai com 0 e diz o que foi conferido", () => {
    const { codigo, mensagem } = resultado([]);

    expect(codigo).toBe(0);
    expect(mensagem).toContain("Nenhuma pendência");
    expect(mensagem).toContain("espelhado");
  });

  test("com pendência sai com 1 e mostra a tabela", () => {
    const { codigo, mensagem } = resultado([pendencia()]);

    expect(codigo).toBe(1);
    expect(mensagem).toContain("1 pendência");
    expect(mensagem).toContain("relatorio-parcial");
    expect(mensagem).toContain("bloqueado");
  });

  test("concorda em número", () => {
    expect(resultado([pendencia(), pendencia()]).mensagem).toContain(
      "2 pendências",
    );
  });
});

describe("decisão do gate sem credencial", () => {
  test("fora do CI: sai com 0, mas não afirma que está limpo", () => {
    const { codigo, mensagem } = semCredencial(false);

    expect(codigo).toBe(0);
    expect(mensagem).toContain("NÃO foram verificadas");
    expect(mensagem).toContain("não atesta nada");
    expect(mensagem).not.toContain("Nenhuma pendência");
  });

  test("em CI: sai com 1", () => {
    const { codigo, mensagem } = semCredencial(true);

    expect(codigo).toBe(1);
    expect(mensagem).toContain("erro de configuração");
  });
});

describe("detecção de CI", () => {
  test("reconhece a variável que todo provedor define", () => {
    expect(emCi("true")).toBe(true);
    expect(emCi("1")).toBe(true);
  });

  test("ausente ou desligada não é CI", () => {
    expect(emCi(undefined)).toBe(false);
    expect(emCi("")).toBe(false);
    expect(emCi("false")).toBe(false);
  });
});

/**
 * Integração: prova que a view denuncia o caso real e que o script falharia.
 * Só roda com banco; ver o cabeçalho deste arquivo.
 */
describe.skipIf(!process.env.DATABASE_URL)(
  "integração com a view (requer DATABASE_URL)",
  () => {
    const SLUG = "teste-pendencia-gate-09";

    // Tipagem preguiçosa: os módulos são carregados dentro do beforeAll porque
    // src/dados/cliente.ts lança no topo quando não há DATABASE_URL, e o import
    // estático rodaria mesmo com o bloco pulado.
    let db: Awaited<typeof import("../src/dados/cliente")>["db"];
    let documento: typeof import("../db/schema")["documento"];
    let listar: typeof import("../src/dados/consultas/pendencias")["listarPendenciasDePublicacao"];
    let eq: typeof import("drizzle-orm")["eq"];

    async function limpar(): Promise<void> {
      await db.delete(documento).where(eq(documento.slug, SLUG));
    }

    beforeAll(async () => {
      ({ db } = await import("../src/dados/cliente"));
      ({ documento } = await import("../db/schema"));
      ({ eq } = await import("drizzle-orm"));
      ({ listarPendenciasDePublicacao: listar } = await import(
        "../src/dados/consultas/pendencias"
      ));
      await limpar();
    });

    afterAll(async () => {
      await limpar();
    });

    test("documento exigido e publicado sem arquivo espelhado é denunciado", async () => {
      const antes = await listar();
      expect(antes.some((p) => p.slug === SLUG)).toBe(false);

      await db.insert(documento).values({
        slug: SLUG,
        titulo: "Documento de teste do gate",
        tipo: "relatorio_tecnico",
        exigidoPeloEdital: true,
        status: "publicado",
        publicadoEm: new Date(),
      });

      const depois = await listar();
      const linha = depois.find((p) => p.slug === SLUG);

      expect(linha).toBeDefined();
      expect(linha?.pendencia).toBe("anexo obrigatório sem arquivo espelhado");
      expect(resultado(depois).codigo).toBe(1);
    });

    test("o mesmo documento em rascunho não é denunciado", async () => {
      await db
        .update(documento)
        .set({ status: "rascunho" })
        .where(eq(documento.slug, SLUG));

      const linhas = await listar();
      expect(linhas.some((p) => p.slug === SLUG)).toBe(false);
    });
  },
);
