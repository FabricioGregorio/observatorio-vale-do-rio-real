import { describe, expect, test } from "vitest";
import {
  CLASSIFICACAO,
  DISTRIBUICAO_ESPERADA,
} from "../src/dados/classificacao-documental";
import {
  evidenciaManifestoSchema,
  manifestoPublico,
  podePublicar,
} from "../src/lib/manifesto-evidencias";

/**
 * Espelhar não é publicar.
 *
 * `ESPELHAVEL` significa que o binário pode ir para storage controlado.
 * `PUBLICAVEL` significa que pode ser exposto publicamente. Confundir os dois
 * publicaria áudio de entrevista e relatório com nome de trabalhador.
 *
 * Havia aqui uma segunda camada, de integração: ela inseria arquivo privado
 * numa transação desfeita e provava, contra o banco, que a restrição de URL
 * pública e a projeção pública se comportavam. Saiu com o banco. O que
 * permanece é a regra documental em si — classificação, gate e manifesto —,
 * que é pura e roda em qualquer máquina.
 */

const HASH = "a".repeat(64);

function evidencia(over: Record<string, unknown> = {}) {
  return evidenciaManifestoSchema.parse({
    codigo: "X01",
    entregavel: "Item de teste",
    natureza: "item_exigido",
    obrigatorio: true,
    estado: "PUBLICAVEL",
    revisao_privacidade: "concluida",
    url: "https://exemplo.invalid/x01.pdf",
    sha256: HASH,
    doi: null,
    observacao: null,
    derivado_de: ["documento:X01"],
    derivado_de_documento: null,
    derivacao_metodo: null,
    arquivo_existe: true,
    ...over,
  });
}

describe("ESPELHAVEL não é PUBLICAVEL", () => {
  test("ESPELHAVEL nunca satisfaz o gate público", () => {
    expect(podePublicar(evidencia({ estado: "ESPELHAVEL" }))).toBe(false);
  });

  test("ESPELHAVEL com revisão concluída também não publica", () => {
    const item = evidencia({
      estado: "ESPELHAVEL",
      revisao_privacidade: "concluida",
    });
    expect(podePublicar(item)).toBe(false);
  });

  test("a distribuição da classificação bate com a declarada", () => {
    const contagem = Object.values(CLASSIFICACAO).reduce<
      Record<string, number>
    >((acc, c) => {
      acc[c.estado] = (acc[c.estado] ?? 0) + 1;
      return acc;
    }, {});
    for (const [estado, esperado] of Object.entries(DISTRIBUICAO_ESPERADA)) {
      expect(contagem[estado] ?? 0, estado).toBe(esperado);
    }
  });

  /**
   * O gate não afrouxou com a decisão de 2026-09-16: o que mudou foi quais
   * itens o satisfazem. Nenhum `PUBLICAVEL` pode existir com revisão pendente,
   * que é o mesmo invariante do CHECK `documento_publicavel_exige_revisao`.
   */
  test("PUBLICAVEL exige revisão concluída em toda a classificação", () => {
    for (const [codigo, c] of Object.entries(CLASSIFICACAO)) {
      if (c.estado === "PUBLICAVEL") {
        expect(c.revisao, `${codigo} publicável exige revisão`).toBe(
          "concluida",
        );
      }
    }
  });

  test("os itens autorizados em 2026-09-16 estão PUBLICAVEL", () => {
    const publicaveis = Object.entries(CLASSIFICACAO)
      .filter(([, c]) => c.estado === "PUBLICAVEL")
      .map(([codigo]) => codigo)
      .sort();
    expect(publicaveis).toEqual([
      "A02",
      "A03",
      "A04",
      "A09",
      "A10",
      "A11",
      "B01",
      "B02",
      "B03",
      "B04",
      "B05",
      "B06",
      "B08",
      "B13",
      "B14",
      "D01",
    ]);
  });
});

describe("arquivo privado não tem URL pública", () => {
  test("sem URL, o gate bloqueia mesmo com tudo o resto em ordem", () => {
    const privado = evidencia({ url: null });
    expect(privado.estado).toBe("PUBLICAVEL");
    expect(privado.revisao_privacidade).toBe("concluida");
    expect(privado.arquivo_existe).toBe(true);
    expect(podePublicar(privado)).toBe(false);
  });

  test("URL pública não é inventada: null permanece null", () => {
    expect(evidencia({ url: null }).url).toBeNull();
    expect(evidencia({ url: undefined }).url).toBeNull();
  });

  test("URL malformada é recusada pelo contrato, não normalizada", () => {
    expect(() =>
      evidencia({ url: "observatorio-privado/arquivos/x.pdf" }),
    ).toThrow();
    expect(() => evidencia({ url: "" })).toThrow();
  });
});

describe("RESTRITO fora do Manifesto público", () => {
  test("manifestoPublico descarta RESTRITO", () => {
    const restrito = evidencia({ codigo: "B02", estado: "RESTRITO" });
    const publicavel = evidencia({ codigo: "OK1" });
    expect(manifestoPublico([restrito, publicavel])).toEqual([publicavel]);
  });

  test("os 11 RESTRITO da classificação ficam fora", () => {
    const restritos = Object.entries(CLASSIFICACAO)
      .filter(([, c]) => c.estado === "RESTRITO")
      .map(([codigo]) => evidencia({ codigo, estado: "RESTRITO" }));
    expect(restritos).toHaveLength(DISTRIBUICAO_ESPERADA.RESTRITO);
    expect(manifestoPublico(restritos)).toHaveLength(0);
  });

  test("PUBLICAVEL sem revisão concluída fica fora", () => {
    for (const revisao of ["pendente", "bloqueada"] as const) {
      expect(podePublicar(evidencia({ revisao_privacidade: revisao }))).toBe(
        false,
      );
    }
  });
});
