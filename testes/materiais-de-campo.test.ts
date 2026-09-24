import { createHash } from "node:crypto";
import { describe, expect, test } from "vitest";
import { resolverEstadoDosProdutos } from "../src/componentes/home/Secoes";
import { lugaresDeCampo } from "../src/componentes/territorio/cartografia/lugares";
import type { AnexoPublico } from "../src/dados/anexo-publico";
import {
  CODIGOS_DO_LOTE,
  LOTE_PUBLICACAO,
  TOTAL_DO_LOTE,
} from "../src/dados/lote-publicacao";
import {
  type ArquivosPublicados,
  linkPreferido,
  MATERIAIS_POR_LUGAR,
  resolverMateriaisDoLugar,
  resolverMaterial,
} from "../src/dados/materiais-de-campo";
import { indexarPorDocumento } from "../src/dados/publicado/anexos";

/**
 * O contrato que esta suíte protege é um só: **nenhum material aparece como
 * público sem URL**. A ficha da Home e a do Território passaram meses com
 * duas listas manuais de estado; a segunda divergiu da primeira assim que a
 * decisão de publicação mudou. Aqui o estado é função da URL, e o teste
 * verifica que a função não tem outra saída.
 */

/**
 * `arquivoId` de fixture, derivado do link permanente.
 *
 * Determinístico e sem aleatoriedade, e reproduz a invariante real do schema:
 * `arquivo.url_publica` é UNIQUE, então uma URL pública corresponde a
 * exatamente um objeto físico. Importa porque vários testes abaixo montam
 * dois anexos do **mesmo** documento — o caso multiarquivo da migração 0007.
 * Um id constante faria dois objetos distintos compartilharem a identidade
 * que a migração 0009 passou a exigir, e o fixture passaria a afirmar algo
 * que o banco não permite.
 */
function arquivoIdDeFixture(link: string): string {
  const h = createHash("sha256").update(link).digest("hex");
  return [
    h.slice(0, 8),
    h.slice(8, 12),
    `4${h.slice(13, 16)}`,
    `8${h.slice(17, 20)}`,
    h.slice(20, 32),
  ].join("-");
}

function anexo(slug: string, over: Partial<AnexoPublico> = {}): AnexoPublico {
  const linkPermanente =
    over.linkPermanente ?? `https://acervo.exemplo/${slug}.pdf`;
  return {
    arquivoId: arquivoIdDeFixture(linkPermanente),
    codigo: "1",
    estado: "PUBLICAVEL",
    revisaoPrivacidade: "concluida",
    derivadoDe: [],
    arquivoOrigemId: null,
    arquivoRelacao: null,
    arquivoDerivacaoMetodo: null,
    ordemAnexo: 1,
    slug,
    rotuloArquivo: null,
    principal: false,
    titulo: "T",
    tipo: "outro",
    resumo: null,
    dataReferencia: null,
    licenca: "CC BY-SA 4.0",
    linkPermanente,
    linkOrigem: null,
    mimeType: "application/pdf",
    bytes: 1,
    sha256: "0".repeat(64),
    publicadoEm: null,
    ...over,
  };
}

describe("resolução de materiais contra o que está publicado", () => {
  test("sem nada publicado, nenhum material é público e nenhum tem link", () => {
    const vazio: ArquivosPublicados = new Map();
    for (const id of Object.keys(MATERIAIS_POR_LUGAR) as Array<
      keyof typeof MATERIAIS_POR_LUGAR
    >) {
      for (const material of resolverMateriaisDoLugar(id, vazio)) {
        expect(material.estado, material.material).not.toBe("publico");
        expect(material.href, material.material).toBeNull();
        expect(material.arquivosPublicos).toBe(0);
      }
    }
  });

  test("um documento publicado torna o material público e traz a URL real", () => {
    const publicados = indexarPorDocumento([
      anexo("relatorio-tecnico-borda-da-mata"),
    ]);
    const materiais = resolverMateriaisDoLugar("borda-da-mata", publicados);
    const relatorio = materiais.find((m) => m.material === "Relatório técnico");
    expect(relatorio?.estado).toBe("publico");
    expect(relatorio?.href).toBe(
      "https://acervo.exemplo/relatorio-tecnico-borda-da-mata.pdf",
    );
    // Os demais materiais do mesmo lugar não são arrastados junto.
    for (const outro of materiais.filter((m) => m !== relatorio)) {
      expect(outro.estado, outro.material).not.toBe("publico");
    }
  });

  test("o link preferido é o arquivo principal, não o primeiro da lista", () => {
    const publicados = indexarPorDocumento([
      anexo("entrevista-pedro-menezes", {
        linkPermanente: "https://acervo.exemplo/audio.m4a",
      }),
      anexo("entrevista-pedro-menezes", {
        principal: true,
        linkPermanente: "https://acervo.exemplo/transcricao.pdf",
      }),
    ]);
    expect(
      linkPreferido(publicados.get("entrevista-pedro-menezes") ?? []),
    ).toBe("https://acervo.exemplo/transcricao.pdf");
  });

  test("conjunto sem principal aponta para o grupo no Acervo, não para um arquivo", () => {
    const publicados = indexarPorDocumento([
      anexo("fotografias-visitas-i-vii", {
        linkPermanente: "https://acervo.exemplo/foto-do-borda.webp",
      }),
      anexo("fotografias-visitas-i-vii", {
        linkPermanente: "https://acervo.exemplo/foto-do-recanto.webp",
      }),
    ]);
    const fotos = resolverMaterial(
      {
        material: "Fotografias de campo",
        documentos: ["fotografias-visitas-i-vii"],
        estadoSemPublicacao: "pendente",
      },
      publicados,
    );
    expect(fotos.estado).toBe("publico");
    expect(fotos.href).toBe("/acervo#acervo-fotografias-visitas-i-vii");
    expect(fotos.arquivosPublicos).toBe(2);
  });

  test("material com vários documentos soma os arquivos de todos", () => {
    const publicados = indexarPorDocumento([
      anexo("formulario-rotina-de-funcionamento"),
      anexo("formulario-publico-consumidor"),
      anexo("formulario-publico-consumidor", {
        linkPermanente: "https://acervo.exemplo/outro.xlsx",
      }),
    ]);
    const formularios = resolverMaterial(
      {
        material: "Formulários",
        documentos: [
          "formulario-rotina-de-funcionamento",
          "formulario-publico-consumidor",
        ],
        estadoSemPublicacao: "restrito",
      },
      publicados,
    );
    expect(formularios.estado).toBe("publico");
    expect(formularios.arquivosPublicos).toBe(3);
    // Sem principal entre os três, o destino é o conjunto do primeiro
    // documento que tem arquivo público.
    expect(formularios.href).toBe(
      "/acervo#acervo-formulario-rotina-de-funcionamento",
    );
  });

  test("as fichas do Território usam a mesma resolução, sem exceção local", () => {
    const publicados = indexarPorDocumento([
      anexo("relatorio-tecnico-serra-dos-macacos"),
    ]);
    const serra = lugaresDeCampo(publicados).find(
      (l) => l.id === "serra-dos-macacos",
    );
    // O relato está publicado neste cenário; as fotografias, não.
    expect(serra?.materiais.map((m) => m.estado)).toEqual([
      "publico",
      "pendente",
    ]);
    expect(
      lugaresDeCampo(new Map())
        .flatMap((l) => l.materiais)
        .every((m) => m.href === null),
    ).toBe(true);
  });

  test("os produtos da Home só ficam públicos quando as URLs reais existem", () => {
    expect(resolverEstadoDosProdutos(new Map())).toEqual({
      relatoriosPublicos: false,
      entrevistasEFormulariosPublicos: false,
    });

    const publicados = indexarPorDocumento([
      anexo("relatorio-tecnico-recanto-da-serra"),
      anexo("relatorio-tecnico-borda-da-mata"),
      anexo("relatorio-tecnico-serra-dos-macacos"),
      anexo("entrevista-pedro-menezes"),
      anexo("entrevista-oviedo-e-neide-abreu"),
      anexo("entrevista-lideranca-ilha-grande"),
      anexo("formulario-rotina-de-funcionamento"),
      anexo("formulario-publico-consumidor"),
    ]);
    expect(resolverEstadoDosProdutos(publicados)).toEqual({
      relatoriosPublicos: true,
      entrevistasEFormulariosPublicos: true,
    });
  });
});

describe("lote de publicação de 2026-09-16", () => {
  test("tem 101 entradas, sem chave repetida", () => {
    expect(LOTE_PUBLICACAO).toHaveLength(TOTAL_DO_LOTE);
    expect(new Set(LOTE_PUBLICACAO.map((e) => e.chave)).size).toBe(
      TOTAL_DO_LOTE,
    );
  });

  test("toda origem declarada cai num dos códigos autorizados", () => {
    for (const entrada of LOTE_PUBLICACAO) {
      expect(CODIGOS_DO_LOTE).toContain(entrada.codigo);
    }
  });

  test("no máximo um arquivo principal por documento", () => {
    const porCodigo = new Map<string, number>();
    for (const entrada of LOTE_PUBLICACAO.filter((e) => e.principal)) {
      porCodigo.set(entrada.codigo, (porCodigo.get(entrada.codigo) ?? 0) + 1);
    }
    for (const [codigo, n] of porCodigo) expect(n, codigo).toBe(1);
  });

  test("a distribuição por código é a do inventário auditado", () => {
    const contagem = LOTE_PUBLICACAO.reduce<Record<string, number>>(
      (acc, e) => {
        acc[e.codigo] = (acc[e.codigo] ?? 0) + 1;
        return acc;
      },
      {},
    );
    expect(contagem).toEqual({
      A02: 1,
      A03: 2,
      A04: 1,
      A09: 1,
      A10: 2,
      A11: 18,
      B01: 59,
      B02: 2,
      B03: 2,
      B04: 2,
      B05: 2,
      B06: 2,
      B08: 2,
      B13: 2,
      B14: 2,
      D01: 1,
    });
  });

  /**
   * `derivacao_metodo` sem `derivado_de_id` é proibido pelo CHECK
   * `arquivo_derivacao_completa`. As fotografias originais nunca foram
   * espelhadas, então os 58 derivados web não têm origem física registrável —
   * e o lote declara isso em vez de inventar uma linha de origem.
   */
  test("derivado sem origem registrada nunca se declara réplica", () => {
    for (const entrada of LOTE_PUBLICACAO) {
      if (entrada.derivadoSemOrigemRegistrada) {
        expect(entrada.relacao, entrada.chave).toBeNull();
      }
    }
    expect(
      LOTE_PUBLICACAO.filter((e) => e.derivadoSemOrigemRegistrada),
    ).toHaveLength(58);
    expect(LOTE_PUBLICACAO.filter((e) => e.relacao === "replica")).toHaveLength(
      3,
    );
  });

  test("A03 textual declara a derivação do PDF digitalizado", () => {
    const acessivel = LOTE_PUBLICACAO.find((entrada) =>
      entrada.chave.endsWith("texto-acessivel-v1.md"),
    );
    expect(acessivel).toMatchObject({
      codigo: "A03",
      mimeType: "text/markdown",
      tipoMidia: "outro",
      rotulo: "A03 — versão textual acessível",
      relacao: "derivado",
      derivadoDeChave:
        "arquivos/analise-de-dados/a03-relatorio-tecnico-borda-da-mata-integral-v1.pdf",
      derivacaoMetodo: "transcricao_leitura_visual",
      principal: false,
    });
  });
});
