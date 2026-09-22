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
                  (select count(*)::int from arquivo a
                    where exists (select 1 from documento_arquivo da where da.arquivo_id = a.id)) as a_acervo,
                  (select count(*)::int from documento_arquivo) as da,
                  (select count(*)::int from vw_anexo_publico) as v,
                  (select count(*)::int from documento
                    where estado_documental = 'PUBLICAVEL') as pub`,
        );
        // O acervo físico pode crescer sem mudar o gate público. As dez
        // evidências privadas são conferidas individualmente abaixo.
        expect(r.rows[0]).toMatchObject({
          d: 33,
          v: 109,
          pub: 16,
        });
        /**
         * A igualdade é do **acervo documental**, não de `arquivo` inteiro.
         *
         * Até a P0.2B2 todo `arquivo` pertencia a um `documento`, e a asserção
         * podia comparar os totais. Os masters do PodObservar quebram isso de
         * propósito: eles existem sem `documento_arquivo`, porque vincular um
         * master a documento o faria entrar no Acervo público por
         * `vw_anexo_publico` — outro gate, com outras regras. Ver o
         * ramo correspondente de `vw_pendencia_publicacao` na migração 0012.
         */
        expect(r.rows[0].a_acervo).toBe(r.rows[0].da);
        expect(r.rows[0].a_acervo).toBeGreaterThanOrEqual(119);
        const semVinculo = await pool.query(
          `select count(*)::int as n from arquivo a
           where a.chave_storage like 'arquivos/podobservar/%'
             and exists (select 1 from documento_arquivo da where da.arquivo_id = a.id)`,
        );
        expect(semVinculo.rows[0].n).toBe(0);
        const artesSemVinculo = await pool.query(
          `select count(*)::int as n from arquivo a
           where (a.chave_storage like 'originais/podobservar/%'
                  or a.chave_storage like 'arquivos/podobservar-artes/%')
             and exists (select 1 from documento_arquivo da where da.arquivo_id = a.id)`,
        );
        expect(artesSemVinculo.rows[0].n).toBe(0);
        const arquivos = await pool.query(
          `select a.chave_storage, a.sha256, a.bucket, a.visibilidade,
                  a.url_publica, da.principal, da.versao
           from arquivo a join documento_arquivo da on da.arquivo_id=a.id
          where a.visibilidade = 'privado'`,
        );
        expect(arquivos.rows.length).toBeGreaterThanOrEqual(10);
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
