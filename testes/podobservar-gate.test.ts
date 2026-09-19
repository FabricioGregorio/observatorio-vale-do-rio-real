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
 * Gate público do PodObservar — migração 0010, substituída pela 0011.
 *
 * A 0011 implementa a ADR-021: o site não reproduz áudio, não oferece
 * download e não expõe URL do master. O destino de escuta é o Spotify, e
 * passa a ser condição de publicação. Áudio privado deixou de bloquear o
 * episódio.
 *
 * Duas camadas de prova, porque são duas afirmações diferentes:
 *
 * - **unitária**: as primitivas de `consultas/podobservar.ts` ordenam por data
 *   de publicação, recusam resolver slug em temporada errada e descartam
 *   linha sem destino de escuta;
 * - **integração**: `vw_episodio_publico` não devolve episódio não publicado
 *   nem episódio sem Spotify, devolve episódio de áudio privado, e não
 *   carrega nenhuma coluna capaz de localizar o master — tudo isso no banco,
 *   não num `WHERE` da aplicação.
 *
 * A camada de integração insere dentro de transação e sempre dá `rollback`:
 * nenhum episódio, nenhum arquivo e nenhuma temporada sobrevivem ao teste.
 */

const URL_MANUTENCAO = process.env.DATABASE_URL_MANUTENCAO;

const HASH = "e".repeat(64);

const SPOTIFY = "https://open.spotify.com/episode/4I2y3ku1E62PjxtDNWo8Uf";

/**
 * Colunas que jamais podem sair da view pública. Três famílias: identidade
 * do binário, localização do binário e estado interno do episódio.
 */
const COLUNAS_PROIBIDAS = [
  "audio_url",
  "audio_id",
  "audio_mime_type",
  "audio_bytes",
  "bucket",
  "chave_storage",
  "url_publica",
  "sha256",
  "espelhado_em",
  "visibilidade",
  "id",
  "temporada_id",
  "capa_id",
  "status",
  "criado_em",
  "atualizado_em",
  "busca",
] as const;

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
    urlSpotify: SPOTIFY,
    urlYoutube: null,
    capaUrl: null,
    capaLarguraPx: null,
    capaAlturaPx: null,
    ...over,
  };
}

describe("a API pública não conhece áudio", () => {
  test("o tipo público não tem campo de áudio algum", () => {
    const chaves = Object.keys(episodio());
    for (const proibida of [
      "audioUrl",
      "audioMimeType",
      "audioBytes",
      "audioId",
    ]) {
      expect(chaves).not.toContain(proibida);
    }
  });

  test("coluna de áudio que porventura venha do banco não entra no objeto público", () => {
    const linha = {
      ...episodio(),
      audio_url: "https://exemplo.invalid/master.wav",
      audio_id: "00000000-0000-4000-8000-000000000001",
    } as unknown as LinhaEpisodioPublico;
    const [publicado] = adaptarLinhasDaView([linha]);
    expect(publicado).toBeDefined();
    expect(JSON.stringify(publicado)).not.toContain("master.wav");
    expect(Object.keys(publicado ?? {})).not.toContain("audio_url");
  });
});

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

  test("linha sem Spotify é descartada", () => {
    const linha = {
      ...episodio(),
      urlSpotify: null,
    } as unknown as LinhaEpisodioPublico;
    expect(adaptarLinhasDaView([linha])).toEqual([]);
  });

  test("link que não é do Spotify não vira CTA de Spotify", () => {
    const linha = {
      ...episodio(),
      urlSpotify: "https://exemplo.invalid/episodio",
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

  test("YouTube ausente não derruba o episódio", () => {
    const linha = episodio({
      urlYoutube: null,
    }) as unknown as LinhaEpisodioPublico;
    const [publicado] = adaptarLinhasDaView([linha]);
    expect(publicado?.urlYoutube).toBeNull();
  });

  test("YouTube em formato curto é aceito", () => {
    const linha = episodio({
      urlYoutube: "https://youtu.be/CcNdxMkuFcI",
    }) as unknown as LinhaEpisodioPublico;
    expect(adaptarLinhasDaView([linha])).toHaveLength(1);
  });
});

describe("N. mais recente é o de data maior, não o de número maior", () => {
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

describe("K e L. temporada + slug resolvem juntos", () => {
  const acervo = [episodio({ slug: "ep-da-t1", temporadaNumero: 1 })];

  test("temporada e slug corretos resolvem", () => {
    expect(selecionarPorTemporadaESlug(acervo, 1, "ep-da-t1")?.slug).toBe(
      "ep-da-t1",
    );
  });

  test("K. slug real em temporada errada não resolve", () => {
    expect(selecionarPorTemporadaESlug(acervo, 2, "ep-da-t1")).toBeNull();
  });

  test("L. slug inexistente não resolve", () => {
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

    /**
     * Master privado — o estado que a ADR-021 tornou normal. Sem URL pública,
     * sem espelhamento: o Observatório é dono do binário, e o visitante não
     * chega nele.
     */
    async function inserirAudioPrivado(
      c: PoolClient,
      chave: string,
    ): Promise<string> {
      const { rows } = await c.query<{ id: string }>(
        `insert into arquivo (chave_storage, bucket, visibilidade, url_publica,
                              tipo_midia, mime_type, bytes, sha256)
         values ($1, 'observatorio-privado', 'privado', null,
                 'audio', 'audio/wav', 379159020, $2)
         returning id`,
        [chave, HASH],
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
      spotify?: string | null;
      transcricao?: string;
    };

    async function inserirEpisodio(
      c: PoolClient,
      temporadaId: string,
      audioId: string,
      slug: string,
      numero: number,
      estado: Estado,
    ): Promise<void> {
      await c.query(
        `insert into episodio (slug, temporada_id, numero, titulo, resumo,
                               audio_id, duracao_seg, transcricao,
                               status, publicado_em, url_spotify)
         values ($1, $2, $3, 'Episódio de teste', 'Resumo de teste',
                 $4, 1800, $5, $6, $7, $8)`,
        [
          slug,
          temporadaId,
          numero,
          audioId,
          estado.transcricao ?? "Transcrição de teste",
          estado.status,
          estado.publicadoEm,
          estado.spotify === undefined ? SPOTIFY : estado.spotify,
        ],
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
        "E. publicado sem Spotify",
        "gate-sem-spotify",
        {
          status: "publicado",
          publicadoEm: "2026-08-31T12:00:00Z",
          spotify: null,
        },
      ],
      [
        "publicado com Spotify em branco",
        "gate-spotify-vazio",
        {
          status: "publicado",
          publicadoEm: "2026-08-31T12:00:00Z",
          spotify: "   ",
        },
      ],
      [
        "publicado com transcrição em branco",
        "gate-transcricao-vazia",
        {
          status: "publicado",
          publicadoEm: "2026-08-31T12:00:00Z",
          transcricao: "   ",
        },
      ],
      [
        "arquivado, ainda que com data passada",
        "gate-arquivado",
        { status: "arquivado", publicadoEm: "2026-01-01T00:00:00Z" },
      ],
    ];

    for (const [nome, slug, estado] of casosRetidos) {
      test(`${nome} não aparece na view`, async () => {
        await comRollback(async (c) => {
          const audioId = await inserirAudioPrivado(c, `zz/${slug}.wav`);
          const temporadaId = await inserirTemporada(c, 91);
          await inserirEpisodio(c, temporadaId, audioId, slug, 1, estado);
          expect(await slugsPublicos(c)).not.toContain(slug);
        });
      });
    }

    test("F. publicado, datado e com Spotify aparece", async () => {
      await comRollback(async (c) => {
        const audioId = await inserirAudioPrivado(c, "zz/gate-publicado.wav");
        const temporadaId = await inserirTemporada(c, 92);
        await inserirEpisodio(c, temporadaId, audioId, "gate-publicado", 1, {
          status: "publicado",
          publicadoEm: "2026-08-31T12:00:00Z",
        });
        expect(await slugsPublicos(c)).toContain("gate-publicado");
      });
    });

    test("G, H, I, J. áudio privado sustenta episódio público sem vazar nada dele", async () => {
      await comRollback(async (c) => {
        const chave = "zz/master-ep-01-nao-deve-vazar.wav";
        const audioId = await inserirAudioPrivado(c, chave);
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

        // G: o episódio é público, ainda que o master seja privado.
        const { rows } = await c.query<Record<string, unknown>>(
          `select * from vw_episodio_publico where slug = 'gate-audio-privado'`,
        );
        expect(rows).toHaveLength(1);
        const linha = rows[0];
        if (!linha) throw new Error("linha pública ausente");

        // H, I, J: nenhum valor da linha localiza o master.
        const serializada = JSON.stringify(linha);
        expect(serializada).not.toContain(chave);
        expect(serializada).not.toContain(audioId);
        expect(serializada).not.toContain(HASH);
        expect(serializada).not.toContain("observatorio-privado");
        expect(serializada).not.toContain("audio/wav");
        expect(serializada).not.toContain("379159020");

        // E o que deve estar lá, está.
        expect(linha.url_spotify).toBe(SPOTIFY);
        expect(linha.transcricao).toBe("Transcrição de teste");
        expect(linha.duracao_seg).toBe(1800);
      });
    });

    test("§24. a projeção pública não tem coluna capaz de localizar o master", async () => {
      await comRollback(async (c) => {
        const { rows } = await c.query<{ column_name: string }>(
          `select column_name from information_schema.columns
           where table_name = 'vw_episodio_publico'`,
        );
        const colunas = rows.map((r) => r.column_name);
        for (const proibida of COLUNAS_PROIBIDAS) {
          expect(colunas, `coluna proibida na view: ${proibida}`).not.toContain(
            proibida,
          );
        }
        // Nenhuma coluna de áudio, qualquer que seja o nome.
        expect(colunas.filter((n) => n.includes("audio"))).toEqual([]);
      });
    });

    test("M. listar públicos não traz nenhum episódio privado", async () => {
      await comRollback(async (c) => {
        const temporadaId = await inserirTemporada(c, 94);
        let numero = 0;
        for (const [, slug, estado] of casosRetidos) {
          numero += 1;
          const audioId = await inserirAudioPrivado(c, `zz/m-${slug}.wav`);
          await inserirEpisodio(
            c,
            temporadaId,
            audioId,
            `m-${slug}`,
            numero,
            estado,
          );
        }
        const publicoId = await inserirAudioPrivado(c, "zz/m-publico.wav");
        await inserirEpisodio(c, temporadaId, publicoId, "m-publico", 99, {
          status: "publicado",
          publicadoEm: "2026-08-31T12:00:00Z",
        });

        const slugs = await slugsPublicos(c);
        expect(slugs).toContain("m-publico");
        for (const [, slug] of casosRetidos) {
          expect(slugs).not.toContain(`m-${slug}`);
        }
      });
    });

    test("E→F. o mesmo registro só aparece depois de ganhar Spotify", async () => {
      await comRollback(async (c) => {
        const audioId = await inserirAudioPrivado(c, "zz/gate-spotify.wav");
        const temporadaId = await inserirTemporada(c, 95);
        await inserirEpisodio(c, temporadaId, audioId, "gate-spotify", 1, {
          status: "publicado",
          publicadoEm: "2026-08-31T12:00:00Z",
          spotify: null,
        });
        expect(await slugsPublicos(c)).not.toContain("gate-spotify");

        await c.query(
          `update episodio set url_spotify = $1 where slug = 'gate-spotify'`,
          [SPOTIFY],
        );
        expect(await slugsPublicos(c)).toContain("gate-spotify");
      });
    });

    test("K. no banco, slug real em temporada errada não resolve", async () => {
      await comRollback(async (c) => {
        const audioId = await inserirAudioPrivado(c, "zz/gate-temporada.wav");
        const t1 = await inserirTemporada(c, 96);
        await inserirEpisodio(c, t1, audioId, "gate-temporada", 1, {
          status: "publicado",
          publicadoEm: "2026-08-31T12:00:00Z",
        });
        const certo = await c.query(
          `select 1 from vw_episodio_publico where temporada_numero = 96 and slug = 'gate-temporada'`,
        );
        const errado = await c.query(
          `select 1 from vw_episodio_publico where temporada_numero = 97 and slug = 'gate-temporada'`,
        );
        const inexistente = await c.query(
          `select 1 from vw_episodio_publico where temporada_numero = 96 and slug = 'nao-existe'`,
        );
        expect(certo.rowCount).toBe(1);
        expect(errado.rowCount).toBe(0);
        expect(errado.rowCount).toBe(inexistente.rowCount);
      });
    });
  },
);
