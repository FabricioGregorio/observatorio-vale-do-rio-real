import { Pool, type PoolClient } from "pg";
import { describe, expect, test } from "vitest";

import {
  adaptarLinhasDaView,
  type EpisodioPublico,
  interpretarSegmentoDeTemporada,
  type LinhaEpisodioPublico,
  ordenarPorPublicacao,
  selecionarMaisRecente,
  selecionarPorTemporadaESlug,
} from "../src/dados/consultas/podobservar";

/**
 * Gate público do PodObservar — migração 0010.
 *
 * Duas camadas de prova, porque são duas afirmações diferentes:
 *
 * - **unitária**: as primitivas de `consultas/podobservar.ts` ordenam por data
 *   de publicação e recusam resolver slug em temporada errada;
 * - **integração**: `vw_episodio_publico` não devolve episódio não publicado,
 *   e a recusa está no banco — não num `WHERE` da aplicação.
 *
 * A camada de integração insere dentro de transação e sempre dá `rollback`:
 * nenhum episódio, nenhum arquivo e nenhuma temporada sobrevivem ao teste.
 * Nenhuma asserção compara texto de registro privado — só a presença ou a
 * ausência do slug na projeção pública.
 */

const URL_MANUTENCAO = process.env.DATABASE_URL_MANUTENCAO;

const HASH = "e".repeat(64);

function episodio(over: Partial<EpisodioPublico> = {}): EpisodioPublico {
  return {
    slug: "o-que-e-o-vale-do-rio-real",
    temporadaNumero: 1,
    temporadaTitulo: "Primeira temporada",
    numero: 1,
    titulo: "#01 Episódio",
    resumo: "Resumo do episódio.",
    publicadoEm: new Date("2026-08-31T12:00:00Z"),
    duracaoSeg: 1800,
    transcricao: "Transcrição revisada do áudio final.",
    explicito: false,
    urlSpotify: null,
    urlYoutube: null,
    audioUrl: "https://exemplo.invalid/ep-01.mp3",
    audioMimeType: "audio/mpeg",
    audioBytes: 1024,
    capaUrl: null,
    capaLarguraPx: null,
    capaAlturaPx: null,
    ...over,
  };
}

describe("adaptação da view pública", () => {
  test("linha completa atravessa a validação", () => {
    const linha = episodio() as unknown as LinhaEpisodioPublico;
    expect(adaptarLinhasDaView([linha])).toHaveLength(1);
  });

  test("linha sem transcrição é descartada, não completada", () => {
    const linha = {
      ...episodio(),
      transcricao: null,
    } as unknown as LinhaEpisodioPublico;
    expect(adaptarLinhasDaView([linha])).toEqual([]);
  });

  test("linha sem áudio público é descartada", () => {
    const linha = {
      ...episodio(),
      audioUrl: null,
    } as unknown as LinhaEpisodioPublico;
    expect(adaptarLinhasDaView([linha])).toEqual([]);
  });

  test("linha sem data de publicação é descartada", () => {
    const linha = {
      ...episodio(),
      publicadoEm: null,
    } as unknown as LinhaEpisodioPublico;
    expect(adaptarLinhasDaView([linha])).toEqual([]);
  });
});

describe("I. mais recente é o de data maior, não o de número maior", () => {
  const antigoComNumeroAlto = episodio({
    slug: "ep-antigo",
    numero: 9,
    publicadoEm: new Date("2026-08-31T12:00:00Z"),
  });
  const recenteComNumeroBaixo = episodio({
    slug: "ep-recente",
    numero: 2,
    publicadoEm: new Date("2026-09-14T12:00:00Z"),
  });

  test("seleciona por publicado_em, ignorando o número", () => {
    const escolhido = selecionarMaisRecente([
      antigoComNumeroAlto,
      recenteComNumeroBaixo,
    ]);
    expect(escolhido?.slug).toBe("ep-recente");
  });

  test("a ordem não depende da posição no array", () => {
    const direta = ordenarPorPublicacao([
      antigoComNumeroAlto,
      recenteComNumeroBaixo,
    ]);
    const inversa = ordenarPorPublicacao([
      recenteComNumeroBaixo,
      antigoComNumeroAlto,
    ]);
    expect(direta.map((e) => e.slug)).toEqual(inversa.map((e) => e.slug));
    expect(direta.map((e) => e.slug)).toEqual(["ep-recente", "ep-antigo"]);
  });

  test("empate de data desempata por número decrescente", () => {
    const mesmoInstante = new Date("2026-09-07T12:00:00Z");
    const ordenados = ordenarPorPublicacao([
      episodio({ slug: "ep-a", numero: 2, publicadoEm: mesmoInstante }),
      episodio({ slug: "ep-b", numero: 5, publicadoEm: mesmoInstante }),
    ]);
    expect(ordenados.map((e) => e.slug)).toEqual(["ep-b", "ep-a"]);
  });

  test("sem episódio público não há mais recente", () => {
    expect(selecionarMaisRecente([])).toBeNull();
  });
});

describe("F e G. temporada + slug resolvem juntos", () => {
  const acervo = [episodio({ slug: "ep-da-t1", temporadaNumero: 1 })];

  test("temporada e slug corretos resolvem", () => {
    expect(selecionarPorTemporadaESlug(acervo, 1, "ep-da-t1")?.slug).toBe(
      "ep-da-t1",
    );
  });

  test("F. slug real em temporada errada não resolve", () => {
    expect(selecionarPorTemporadaESlug(acervo, 2, "ep-da-t1")).toBeNull();
  });

  test("G. slug inexistente não resolve", () => {
    expect(selecionarPorTemporadaESlug(acervo, 1, "nao-existe")).toBeNull();
  });

  test("os dois casos são indistinguíveis para quem consome", () => {
    expect(selecionarPorTemporadaESlug(acervo, 2, "ep-da-t1")).toEqual(
      selecionarPorTemporadaESlug(acervo, 1, "nao-existe"),
    );
  });
});

describe("segmento de temporada da rota /podobservar/t1/[episodio]", () => {
  test("aceita a forma canônica", () => {
    expect(interpretarSegmentoDeTemporada("t1")).toBe(1);
    expect(interpretarSegmentoDeTemporada("t12")).toBe(12);
  });

  test("recusa variantes que criariam duas URLs para o mesmo episódio", () => {
    for (const segmento of ["t01", "T1", "t0", "t-1", "t", "1", "temporada1"]) {
      expect(interpretarSegmentoDeTemporada(segmento)).toBeNull();
    }
  });
});

describe.skipIf(!URL_MANUTENCAO)(
  "integração: vw_episodio_publico é fail-closed (requer DATABASE_URL_MANUTENCAO)",
  () => {
    async function comRollback<T>(
      fn: (c: PoolClient) => Promise<T>,
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

    /** Áudio já público e espelhado: isola a prova no estado editorial. */
    async function inserirAudio(c: PoolClient, chave: string): Promise<string> {
      const { rows } = await c.query<{ id: string }>(
        `insert into arquivo (chave_storage, bucket, visibilidade, url_publica,
                              tipo_midia, mime_type, bytes, sha256, espelhado_em)
         values ($1, 'observatorio-publico', 'publico', $2,
                 'audio', 'audio/mpeg', 1024, $3, now())
         returning id`,
        [chave, `https://exemplo.invalid/${chave}`, HASH],
      );
      const id = rows[0]?.id;
      if (!id) throw new Error("arquivo de teste não inserido");
      return id;
    }

    async function inserirTemporada(
      c: PoolClient,
      numero: number,
    ): Promise<string> {
      const { rows } = await c.query<{ id: string }>(
        `insert into temporada (numero, titulo) values ($1, $2) returning id`,
        [numero, `Temporada de teste ${numero}`],
      );
      const id = rows[0]?.id;
      if (!id) throw new Error("temporada de teste não inserida");
      return id;
    }

    type Estado = {
      status: "rascunho" | "em_revisao" | "publicado" | "arquivado";
      publicadoEm: string | null;
    };

    async function inserirEpisodio(
      c: PoolClient,
      temporadaId: string,
      audioId: string,
      slug: string,
      numero: number,
      { status, publicadoEm }: Estado,
    ): Promise<void> {
      await c.query(
        `insert into episodio (slug, temporada_id, numero, titulo, resumo,
                               audio_id, duracao_seg, transcricao,
                               status, publicado_em)
         values ($1, $2, $3, 'Episódio de teste', 'Resumo de teste',
                 $4, 1800, 'Transcrição de teste', $5, $6)`,
        [slug, temporadaId, numero, audioId, status, publicadoEm],
      );
    }

    async function slugsPublicos(c: PoolClient): Promise<string[]> {
      const { rows } = await c.query<{ slug: string }>(
        `select slug from vw_episodio_publico`,
      );
      return rows.map((r) => r.slug);
    }

    const casosRetidos: ReadonlyArray<readonly [string, string, Estado]> = [
      [
        "A. rascunho",
        "gate-rascunho",
        { status: "rascunho", publicadoEm: null },
      ],
      [
        "B. em_revisao",
        "gate-em-revisao",
        { status: "em_revisao", publicadoEm: null },
      ],
      [
        "C. publicado sem publicado_em",
        "gate-sem-data",
        { status: "publicado", publicadoEm: null },
      ],
      [
        "D. publicado com data futura",
        "gate-futuro",
        { status: "publicado", publicadoEm: "2099-01-01T00:00:00Z" },
      ],
      [
        "arquivado, ainda que com data passada",
        "gate-arquivado",
        { status: "arquivado", publicadoEm: "2026-01-01T00:00:00Z" },
      ],
      [
        "em_revisao com data passada",
        "gate-revisao-datada",
        { status: "em_revisao", publicadoEm: "2026-01-01T00:00:00Z" },
      ],
    ];

    for (const [nome, slug, estado] of casosRetidos) {
      test(`${nome} não aparece na view`, async () => {
        await comRollback(async (c) => {
          const audioId = await inserirAudio(c, `zz/${slug}.mp3`);
          const temporadaId = await inserirTemporada(c, 91);
          await inserirEpisodio(c, temporadaId, audioId, slug, 1, estado);
          expect(await slugsPublicos(c)).not.toContain(slug);
        });
      });
    }

    test("E. publicado com data passada aparece", async () => {
      await comRollback(async (c) => {
        const audioId = await inserirAudio(c, "zz/gate-publicado.mp3");
        const temporadaId = await inserirTemporada(c, 92);
        await inserirEpisodio(c, temporadaId, audioId, "gate-publicado", 1, {
          status: "publicado",
          publicadoEm: "2026-08-31T12:00:00Z",
        });
        expect(await slugsPublicos(c)).toContain("gate-publicado");
      });
    });

    test("áudio privado retém o episódio, mesmo publicado", async () => {
      await comRollback(async (c) => {
        const { rows } = await c.query<{ id: string }>(
          `insert into arquivo (chave_storage, bucket, visibilidade, url_publica,
                                tipo_midia, mime_type, bytes, sha256, espelhado_em)
           values ('zz/gate-audio-privado.mp3', 'observatorio-privado', 'privado',
                   null, 'audio', 'audio/mpeg', 1024, $1, now())
           returning id`,
          [HASH],
        );
        const audioId = rows[0]?.id;
        if (!audioId) throw new Error("arquivo privado não inserido");
        const temporadaId = await inserirTemporada(c, 93);
        await inserirEpisodio(
          c,
          temporadaId,
          audioId,
          "gate-audio-privado",
          1,
          {
            status: "publicado",
            publicadoEm: "2026-08-31T12:00:00Z",
          },
        );
        expect(await slugsPublicos(c)).not.toContain("gate-audio-privado");
      });
    });

    test("H. listar públicos não traz nenhum episódio privado", async () => {
      await comRollback(async (c) => {
        const temporadaId = await inserirTemporada(c, 94);
        let numero = 0;
        for (const [, slug, estado] of casosRetidos) {
          numero += 1;
          const audioId = await inserirAudio(c, `zz/h-${slug}.mp3`);
          await inserirEpisodio(
            c,
            temporadaId,
            audioId,
            `h-${slug}`,
            numero,
            estado,
          );
        }
        const publicoId = await inserirAudio(c, "zz/h-publico.mp3");
        await inserirEpisodio(c, temporadaId, publicoId, "h-publico", 99, {
          status: "publicado",
          publicadoEm: "2026-08-31T12:00:00Z",
        });

        const slugs = await slugsPublicos(c);
        expect(slugs).toContain("h-publico");
        for (const [, slug] of casosRetidos) {
          expect(slugs).not.toContain(`h-${slug}`);
        }
      });
    });

    test("F. no banco, slug real em temporada errada não resolve", async () => {
      await comRollback(async (c) => {
        const audioId = await inserirAudio(c, "zz/gate-temporada.mp3");
        const t1 = await inserirTemporada(c, 95);
        await inserirEpisodio(c, t1, audioId, "gate-temporada", 1, {
          status: "publicado",
          publicadoEm: "2026-08-31T12:00:00Z",
        });
        const certo = await c.query(
          `select 1 from vw_episodio_publico where temporada_numero = 95 and slug = 'gate-temporada'`,
        );
        const errado = await c.query(
          `select 1 from vw_episodio_publico where temporada_numero = 96 and slug = 'gate-temporada'`,
        );
        const inexistente = await c.query(
          `select 1 from vw_episodio_publico where temporada_numero = 95 and slug = 'nao-existe'`,
        );
        expect(certo.rowCount).toBe(1);
        expect(errado.rowCount).toBe(0);
        expect(errado.rowCount).toBe(inexistente.rowCount);
      });
    });

    test("a projeção pública não carrega estado interno nem id", async () => {
      await comRollback(async (c) => {
        const { rows } = await c.query<{ column_name: string }>(
          `select column_name from information_schema.columns
           where table_name = 'vw_episodio_publico'`,
        );
        const colunas = rows.map((r) => r.column_name);
        for (const proibida of [
          "id",
          "temporada_id",
          "audio_id",
          "capa_id",
          "status",
          "criado_em",
          "atualizado_em",
          "busca",
          "bucket",
          "chave_storage",
        ]) {
          expect(colunas).not.toContain(proibida);
        }
      });
    });
  },
);
