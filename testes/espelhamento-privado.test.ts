import { Pool } from "pg";
import { describe, expect, test } from "vitest";
import {
  CLASSIFICACAO,
  DISTRIBUICAO_ESPERADA,
} from "../src/dados/classificacao-documental";
import { LOTE_PRIVADO_INICIAL } from "../src/dados/lote-privado-inicial";
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
 * A parte de integração exige `DATABASE_URL_MANUTENCAO` e roda tudo em
 * transação desfeita, no padrão do projeto. O skip aparece na saída do Vitest.
 */

const URL_MANUTENCAO = process.env.DATABASE_URL_MANUTENCAO;
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

  test("os três itens ESPELHAVEL têm revisão pendente", () => {
    const espelhaveis = Object.entries(CLASSIFICACAO).filter(
      ([, c]) => c.estado === "ESPELHAVEL",
    );
    expect(espelhaveis).toHaveLength(DISTRIBUICAO_ESPERADA.ESPELHAVEL);
    expect(espelhaveis.map(([codigo]) => codigo).sort()).toEqual([
      "A02",
      "A04",
      "D01",
    ]);
    for (const [, c] of espelhaveis) {
      expect(c.revisao).toBe("pendente");
    }
  });

  test("nenhum item da classificação aprovada é PUBLICAVEL", () => {
    for (const [codigo, c] of Object.entries(CLASSIFICACAO)) {
      expect(c.estado, `${codigo} não pode ser PUBLICAVEL`).not.toBe(
        "PUBLICAVEL",
      );
    }
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

describe.skipIf(!URL_MANUTENCAO)(
  "integração: storage privado no banco (requer DATABASE_URL_MANUTENCAO)",
  () => {
    async function comRollback<T>(
      fn: (c: import("pg").PoolClient) => Promise<T>,
    ): Promise<T> {
      const pool = new Pool({ connectionString: URL_MANUTENCAO });
      const c = await pool.connect();
      try {
        await c.query("begin");
        return await fn(c);
      } finally {
        await c.query("rollback");
        c.release();
        await pool.end();
      }
    }

    const inserirArquivo = (
      c: import("pg").PoolClient,
      visibilidade: "privado" | "publico",
      url: string | null,
      chave = "zz/teste.pdf",
    ) =>
      c.query(
        `insert into arquivo (chave_storage, bucket, visibilidade, url_publica,
                              tipo_midia, mime_type, bytes, sha256, espelhado_em)
         values ($1, $2, $3, $4, 'pdf', 'application/pdf', 10, $5, now())
         returning id`,
        [
          chave,
          visibilidade === "privado"
            ? "observatorio-privado"
            : "observatorio-publico",
          visibilidade,
          url,
          HASH,
        ],
      );

    test("privado sem URL é aceito", async () => {
      const id = await comRollback(async (c) => {
        const r = await inserirArquivo(c, "privado", null);
        return r.rows[0]?.id as string;
      });
      expect(id).toBeTruthy();
    });

    test("privado com URL pública é recusado pelo CHECK", async () => {
      await expect(
        comRollback((c) =>
          inserirArquivo(c, "privado", "https://exemplo.invalid/a.pdf"),
        ),
      ).rejects.toThrow(/arquivo_visibilidade_coerente/);
    });

    test("público sem URL pública é recusado pelo CHECK", async () => {
      await expect(
        comRollback((c) => inserirArquivo(c, "publico", null)),
      ).rejects.toThrow(/arquivo_visibilidade_coerente/);
    });

    test("arquivo privado não aparece em vw_anexo_publico, no caso mais adverso", async () => {
      const linhas = await comRollback(async (c) => {
        const d = await c.query(
          `insert into documento (slug, titulo, tipo, exigido_pelo_edital, natureza,
                                  estado_documental, revisao_privacidade, status, publicado_em)
           values ('zz-adverso', 'ZZ', 'relatorio_tecnico', true, 'item_exigido',
                   'PUBLICAVEL', 'concluida', 'publicado', now())
           returning id`,
        );
        const a = await inserirArquivo(c, "privado", null, "zz/adverso.pdf");
        await c.query(
          `insert into documento_arquivo (documento_id, arquivo_id, principal)
           values ($1, $2, true)`,
          [d.rows[0]?.id, a.rows[0]?.id],
        );
        const v = await c.query(
          "select count(*)::int as n from vw_anexo_publico where slug = 'zz-adverso'",
        );
        return v.rows[0]?.n as number;
      });
      expect(linhas).toBe(0);
    });

    test("o mesmo caso com arquivo público aparece — prova que a view não está quebrada", async () => {
      const linhas = await comRollback(async (c) => {
        const d = await c.query(
          `insert into documento (slug, titulo, tipo, exigido_pelo_edital, natureza,
                                  estado_documental, revisao_privacidade, status, publicado_em)
           values ('zz-publico', 'ZZ', 'relatorio_tecnico', true, 'item_exigido',
                   'PUBLICAVEL', 'concluida', 'publicado', now())
           returning id`,
        );
        const a = await inserirArquivo(
          c,
          "publico",
          "https://exemplo.invalid/zz.pdf",
          "zz/publico.pdf",
        );
        await c.query(
          `insert into documento_arquivo (documento_id, arquivo_id, principal)
           values ($1, $2, true)`,
          [d.rows[0]?.id, a.rows[0]?.id],
        );
        const v = await c.query(
          "select count(*)::int as n from vw_anexo_publico where slug = 'zz-publico'",
        );
        return v.rows[0]?.n as number;
      });
      expect(linhas).toBe(1);
    });

    test("a primeira publicação preserva intactos os dez arquivos privados", async () => {
      const pool = new Pool({ connectionString: URL_MANUTENCAO });
      try {
        const r = await pool.query(
          `select (select count(*)::int from documento) as d,
                  (select count(*)::int from arquivo) as a,
                  (select count(*)::int from documento_arquivo) as da,
                  (select count(*)::int from vw_anexo_publico) as v,
                  (select count(*)::int from documento
                    where estado_documental = 'PUBLICAVEL') as pub`,
        );
        // Prompt 3.10: oito registros públicos foram acrescentados sem
        // substituir nem expor os dez objetos privados do Prompt 3.4.2.
        expect(r.rows[0]).toEqual({ d: 33, a: 18, da: 18, v: 8, pub: 2 });
        const arquivos = await pool.query(
          `select a.chave_storage, a.sha256, a.bucket, a.visibilidade,
                  a.url_publica, da.principal, da.versao
           from arquivo a join documento_arquivo da on da.arquivo_id=a.id
          where a.visibilidade = 'privado'`,
        );
        expect(arquivos.rows).toHaveLength(10);
        for (const [, , chave, sha256, principal] of LOTE_PRIVADO_INICIAL) {
          expect(arquivos.rows).toContainEqual({
            chave_storage: chave,
            sha256,
            principal,
            versao: 1,
            bucket: "observatorio-privado",
            visibilidade: "privado",
            url_publica: null,
          });
        }
      } finally {
        await pool.end();
      }
    });
  },
);
