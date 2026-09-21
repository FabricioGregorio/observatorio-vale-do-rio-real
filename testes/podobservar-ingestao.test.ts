import { createHash, randomUUID } from "node:crypto";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Pool, type PoolClient } from "pg";
import { describe, expect, test } from "vitest";

import {
  EPISODIOS_TEMPORADA_1,
  FORMATOS_DE_MASTER,
  TEMPORADA_1,
} from "../src/dados/podobservar-temporada-1";
import {
  conferirEnvio,
  decidirIngestao,
  type MasterPlanejado,
  podeCompensar,
} from "../src/lib/ingestao-master";
import type { ObjetoPrivadoDescrito } from "../src/lib/storage-privado-grande";
import { hashDeArquivo } from "../src/lib/storage-privado-grande";
import {
  contemMarcacaoInterna,
  extrairCorpoDaTranscricao,
  limparTranscricao,
  MARCACOES_INTERNAS,
  preservouConteudo,
} from "../src/lib/transcricao-podobservar";

/**
 * Ingestão privada do PodObservar — P0.2B2.
 *
 * As regras que importam aqui não são de rede: são de recusa. Nunca
 * sobrescrever master existente, nunca compensar objeto alheio, nunca alterar
 * fala ao limpar transcrição, nunca deixar marcação interna passar. Todas
 * elas são funções puras, testadas sem storage e sem banco.
 *
 * A camada de integração verifica o que só o banco pode afirmar: que os
 * masters não têm vínculo documental e que rascunho não vaza pela view.
 */

const URL_MANUTENCAO = process.env.DATABASE_URL_MANUTENCAO;

const PLANO: MasterPlanejado = {
  origem: "podcast/ep-01/ep-01.wav",
  chave: "arquivos/podobservar/t1-ep-01-teste-master-v1.wav",
  sha256: "a".repeat(64),
  bytes: 379159020,
  mimeType: "audio/wav",
  duracaoSeg: 1433,
};

function remoto(
  over: Partial<ObjetoPrivadoDescrito> = {},
): ObjetoPrivadoDescrito {
  return {
    bytes: PLANO.bytes,
    etag: '"abc-3"',
    sha256: PLANO.sha256,
    execucao: "exec-1",
    ...over,
  };
}

describe("idempotência: nunca sobrescrever master existente", () => {
  test("chave ausente manda enviar", () => {
    expect(decidirIngestao(PLANO, null)).toEqual({ acao: "enviar" });
  });

  test("mesmo SHA-256 e mesmos bytes é ingestão já feita", () => {
    expect(decidirIngestao(PLANO, remoto())).toEqual({ acao: "ja_ingerido" });
  });

  test("conteúdo diferente PARA, não sobrescreve", () => {
    const d = decidirIngestao(PLANO, remoto({ sha256: "b".repeat(64) }));
    expect(d.acao).toBe("parar");
    if (d.acao === "parar") expect(d.motivo).toContain("nunca é substituído");
  });

  test("objeto sem SHA-256 declarado PARA: equivalência não é presumida", () => {
    const d = decidirIngestao(PLANO, remoto({ sha256: null }));
    expect(d.acao).toBe("parar");
    if (d.acao === "parar") expect(d.motivo).toContain("decisão humana");
  });

  test("mesmo hash com tamanho diferente PARA: metadado não confiável", () => {
    const d = decidirIngestao(PLANO, remoto({ bytes: 123 }));
    expect(d.acao).toBe("parar");
  });

  test("ETag jamais é tratado como prova: mudar só o ETag não muda a decisão", () => {
    expect(decidirIngestao(PLANO, remoto({ etag: '"outro-9"' }))).toEqual({
      acao: "ja_ingerido",
    });
  });
});

describe("conferência pós-envio", () => {
  test("aprova quando bytes, hash e execução conferem", () => {
    expect(conferirEnvio(PLANO, remoto(), "exec-1")).toEqual({ ok: true });
  });

  test("recusa objeto ausente", () => {
    expect(conferirEnvio(PLANO, null, "exec-1").ok).toBe(false);
  });

  test("recusa tamanho divergente", () => {
    expect(conferirEnvio(PLANO, remoto({ bytes: 1 }), "exec-1").ok).toBe(false);
  });

  test("recusa objeto de outra execução", () => {
    const r = conferirEnvio(PLANO, remoto({ execucao: "exec-2" }), "exec-1");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.motivo).toContain("outra execução");
  });
});

describe("compensação só age sobre o que esta execução criou", () => {
  test("objeto desta execução pode ser compensado", () => {
    expect(podeCompensar(remoto({ execucao: "exec-1" }), "exec-1")).toBe(true);
  });

  test("objeto preexistente nunca é removido", () => {
    expect(podeCompensar(remoto({ execucao: null }), "exec-1")).toBe(false);
    expect(podeCompensar(remoto({ execucao: "outra" }), "exec-1")).toBe(false);
  });

  test("objeto ausente não é compensável", () => {
    expect(podeCompensar(null, "exec-1")).toBe(false);
  });
});

describe("hash por streaming, sem carregar o arquivo em memória", () => {
  test("confere com o hash do conteúdo", async () => {
    const dir = mkdtempSync(join(tmpdir(), "podobservar-teste-"));
    const caminho = join(dir, "amostra.bin");
    const conteudo = Buffer.from(randomUUID().repeat(1000));
    writeFileSync(caminho, conteudo);
    const esperado = createHash("sha256").update(conteudo).digest("hex");
    expect(await hashDeArquivo(caminho)).toBe(esperado);
  });
});

describe("limpeza editorial da transcrição", () => {
  const bruto = [
    "PodObservar — 1ª Temporada",
    "Participações: Galileu Santana e Luiz [sobrenome não confirmado]",
    "",
    "[00:00]",
    "[vinheta de abertura do PodObservar]",
    "LAURA AGUIAR",
    "Oi, oi, gente!",
    "[risos]",
    "",
    "[bloco sobre educação]",
    "",
    "PEDRO MENEZES",
    "A casa de taipa foi construída na década de 1930.",
    "[som de carro em estrada de terra]",
    "",
    "[Nota de continuidade da gravação]",
    "LHUCAS SANTOS",
    "Ok, ok!",
  ].join("\n");

  const { texto, remocoes, total } = limparTranscricao(bruto);

  test("remove exatamente as marcações internas encontradas", () => {
    expect(total).toBe(3);
    expect(remocoes.map((r) => r.marcacao).sort()).toEqual(
      [
        "[Nota de continuidade da gravação]",
        "[bloco sobre educação]",
        "[sobrenome não confirmado]",
      ].sort(),
    );
  });

  test("nenhuma marcação interna sobrevive", () => {
    expect(contemMarcacaoInterna(texto)).toBe(false);
    for (const m of MARCACOES_INTERNAS) expect(texto).not.toContain(m);
  });

  test("marcações sonoras e de acessibilidade permanecem", () => {
    expect(texto).toContain("[vinheta de abertura do PodObservar]");
    expect(texto).toContain("[risos]");
    expect(texto).toContain("[som de carro em estrada de terra]");
  });

  test("timestamps permanecem", () => {
    expect(texto).toContain("[00:00]");
  });

  test("nenhuma fala é alterada e nenhuma frase é acrescentada", () => {
    expect(preservouConteudo(bruto, texto)).toBe(true);
    expect(texto).toContain(
      "A casa de taipa foi construída na década de 1930.",
    );
    expect(texto).toContain("Oi, oi, gente!");
  });

  test("LUIZ permanece identificado, sem sobrenome inventado", () => {
    expect(texto).toContain("Luiz");
    expect(texto).not.toContain("não confirmado");
  });

  test("não sobra espaço pendurado nem linha tripla", () => {
    expect(texto).not.toMatch(/[ \t]+\n/);
    expect(texto).not.toMatch(/\n{3,}/);
  });

  test("texto sem marcação interna passa intacto", () => {
    const limpo = "LAURA AGUIAR\nBom dia.\n[risos]";
    const r = limparTranscricao(limpo);
    expect(r.total).toBe(0);
    expect(r.texto).toBe(limpo);
  });

  test("detecta alteração indevida de conteúdo", () => {
    expect(preservouConteudo("LAURA: bom dia.", "LAURA: boa noite.")).toBe(
      false,
    );
  });

  /**
   * Regressão da P0.2B2.
   *
   * No PDF do episódio 01 a marcação chega quebrada pela margem: `[nome
   * completo` termina a linha e `não confirmado]` abre a seguinte. A primeira
   * versão desta limpeza comparava literalmente, não encontrava nada, e a
   * verificação que deveria barrar usava a mesma comparação — então a nota
   * interna atravessaria tudo e seria gravada como transcrição pública.
   */
  test("marcação quebrada por quebra de linha também é removida", () => {
    const quebrado = [
      "Participações: Galileu Santana, Lhucas Santos, Luiz [nome completo",
      "não confirmado] e Pedro Menezes",
      "",
      "[00:00]",
      "LAURA AGUIAR",
      "Oi, oi, gente!",
    ].join("\n");

    const { texto, total } = limparTranscricao(quebrado);
    expect(total).toBe(1);
    expect(contemMarcacaoInterna(texto)).toBe(false);
    expect(texto).not.toContain("nome completo");
    expect(texto).not.toContain("não confirmado");
    expect(texto).toContain("Luiz");
    expect(texto).toContain("e Pedro Menezes");
    expect(preservouConteudo(quebrado, texto)).toBe(true);
  });

  test("a rede de resíduos pega marcação que o padrão não previu", () => {
    expect(contemMarcacaoInterna("Luiz [sobrenome  não  confirmado]")).toBe(
      true,
    );
    expect(contemMarcacaoInterna("algo com não confirmado solto")).toBe(true);
    expect(contemMarcacaoInterna("LAURA: bom dia. [risos]")).toBe(false);
  });
});

describe("corpo da transcrição sem o cabeçalho editorial do PDF", () => {
  const pdf = [
    "PodObservar — 1ª Temporada",
    "",
    "Episódio 04 — Entre dados e fatos",
    "",
    "Publicado em: [data não informada nos anexos]",
    "Duração: aproximadamente 26:15",
    "Participações: Galileu Santana e Luiz",
    "",
    " Sobre esta transcrição:",
    "",
    " Esta é uma transcrição revisada do episódio, produzida a partir do áudio e do",
    " roteiro de produção. Sem alterar o conteúdo.",
    "",
    "LAURA AGUIAR — APRESENTADORA",
    "",
    "Antes de falar da Serra dos Macacos…",
    "",
    "[vinheta de transição]",
  ].join("\n");

  test("começa na primeira linha depois da nota e preserva o resto", () => {
    const corpo = extrairCorpoDaTranscricao(pdf);
    expect(corpo?.startsWith("LAURA AGUIAR — APRESENTADORA")).toBe(true);
    expect(corpo?.endsWith("[vinheta de transição]")).toBe(true);
  });

  test("data não informada, duração aproximada e roteiro não chegam ao corpo", () => {
    const corpo = extrairCorpoDaTranscricao(pdf) ?? "";
    expect(corpo).not.toContain("não informada nos anexos");
    expect(corpo).not.toContain("aproximadamente 26:15");
    expect(corpo).not.toContain("Publicado em:");
    expect(corpo).not.toContain("roteiro de produção");
    expect(contemMarcacaoInterna(corpo)).toBe(false);
  });

  test("a marca de data não informada é resíduo proibido", () => {
    expect(contemMarcacaoInterna(pdf)).toBe(true);
  });

  test("sem a nota, não adivinha onde o cabeçalho termina", () => {
    expect(extrairCorpoDaTranscricao("LAURA AGUIAR\nOi, gente!")).toBeNull();
  });
});

describe("plano aprovado da temporada 1", () => {
  test("quatro episódios, números e slugs únicos", () => {
    expect(EPISODIOS_TEMPORADA_1).toHaveLength(4);
    const numeros = EPISODIOS_TEMPORADA_1.map((e) => e.numero);
    const slugs = EPISODIOS_TEMPORADA_1.map((e) => e.slug);
    expect(new Set(numeros).size).toBe(4);
    expect(new Set(slugs).size).toBe(4);
    expect(numeros).toEqual([1, 2, 3, 4]);
    expect(slugs[3]).toBe("04-entre-dados-e-fatos");
    expect(EPISODIOS_TEMPORADA_1[3]?.titulo).toBe(
      "#04 Episódio - Entre dados e fatos",
    );
  });

  test("chaves de storage são únicas e cabem no contrato do espelhamento", () => {
    const chaves = EPISODIOS_TEMPORADA_1.map((e) => e.master.chave);
    expect(new Set(chaves).size).toBe(4);
    for (const chave of chaves) {
      expect(chave).toMatch(
        /^arquivos\/[a-z0-9-]+\/[a-z0-9-]+-v[1-9][0-9]*\.[a-z0-9]+$/,
      );
      expect(chave.startsWith("arquivos/podobservar/")).toBe(true);
    }
  });

  test("SHA-256 auditados têm forma válida e são distintos", () => {
    const hashes = EPISODIOS_TEMPORADA_1.map((e) => e.master.sha256);
    expect(new Set(hashes).size).toBe(4);
    for (const h of hashes) expect(h).toMatch(/^[a-f0-9]{64}$/);
  });

  test("todo Spotify é canônico, sem token de compartilhamento", () => {
    for (const ep of EPISODIOS_TEMPORADA_1) {
      expect(
        ep.urlSpotify.startsWith("https://open.spotify.com/episode/"),
      ).toBe(true);
      expect(ep.urlSpotify).not.toContain("?si=");
    }
  });

  test("YouTube existe só no EP01; os outros são null, sem placeholder", () => {
    expect(EPISODIOS_TEMPORADA_1[0]?.urlYoutube).toContain("youtube.com/watch");
    expect(EPISODIOS_TEMPORADA_1[1]?.urlYoutube).toBeNull();
    expect(EPISODIOS_TEMPORADA_1[2]?.urlYoutube).toBeNull();
    expect(EPISODIOS_TEMPORADA_1[3]?.urlYoutube).toBeNull();
  });

  test("o EP04 aponta para o episódio conferido no Spotify", () => {
    expect(EPISODIOS_TEMPORADA_1[3]?.urlSpotify).toBe(
      "https://open.spotify.com/episode/7Johkhb6BqDx1gVolyz8iE",
    );
  });

  test("publicado_em é meio-dia local de Sergipe, preservando a data editorial", () => {
    const datas = EPISODIOS_TEMPORADA_1.map((e) => e.publicadoEm);
    expect(datas).toEqual([
      "2026-08-31T15:00:00Z",
      "2026-09-07T15:00:00Z",
      "2026-09-14T15:00:00Z",
      "2026-09-21T15:00:00Z",
    ]);
    // A data renderizada em Sergipe é a data editorial, não a véspera.
    for (const [i, iso] of datas.entries()) {
      const emSergipe = new Date(iso).toLocaleDateString("pt-BR", {
        timeZone: "America/Maceio",
      });
      expect(emSergipe).toBe(
        ["31/08/2026", "07/09/2026", "14/09/2026", "21/09/2026"][i],
      );
    }
  });

  test("durações auditadas conferem com a temporada", () => {
    expect(EPISODIOS_TEMPORADA_1.map((e) => e.master.duracaoSeg)).toEqual([
      1433, 1938, 1907, 1575,
    ]);
  });

  test("a temporada não inventa descrição nem capa", () => {
    expect(TEMPORADA_1.numero).toBe(1);
    expect(TEMPORADA_1.ano).toBe(2026);
    expect(TEMPORADA_1.descricao).toBeNull();
    expect(TEMPORADA_1.capaId).toBeNull();
  });

  test("EP01–03 continuam WAV; o EP04 é o MP3 entregue, sem conversão", () => {
    expect(EPISODIOS_TEMPORADA_1.map((e) => e.master.mimeType)).toEqual([
      "audio/wav",
      "audio/wav",
      "audio/wav",
      "audio/mpeg",
    ]);
    for (const ep of EPISODIOS_TEMPORADA_1.slice(0, 3))
      expect(ep.master.bytes).toBeGreaterThan(300 * 1024 ** 2);
    expect(EPISODIOS_TEMPORADA_1[3]?.master.bytes).toBe(50_495_795);
  });

  test("extensão de origem, chave e nome acompanham o MIME do master", () => {
    for (const ep of EPISODIOS_TEMPORADA_1) {
      const extensao = FORMATOS_DE_MASTER[ep.master.mimeType];
      expect(ep.master.origem.endsWith(extensao), ep.slug).toBe(true);
      expect(ep.master.chave.endsWith(extensao), ep.slug).toBe(true);
      expect(ep.master.nomeOriginal.endsWith(extensao), ep.slug).toBe(true);
    }
  });
});

describe.skipIf(!URL_MANUTENCAO)(
  "integração: masters ingeridos permanecem privados (requer DATABASE_URL_MANUTENCAO)",
  () => {
    async function comPool<T>(fn: (c: PoolClient) => Promise<T>): Promise<T> {
      const pool = new Pool({ connectionString: URL_MANUTENCAO });
      const c = await pool.connect();
      try {
        return await fn(c);
      } finally {
        c.release();
        await pool.end();
      }
    }

    test("nenhum master do PodObservar tem vínculo documental", async () => {
      await comPool(async (c) => {
        const { rows } = await c.query<{ chave_storage: string }>(
          `select a.chave_storage from arquivo a
           join documento_arquivo da on da.arquivo_id = a.id
           where a.chave_storage like 'arquivos/podobservar/%'`,
        );
        expect(rows).toEqual([]);
      });
    });

    test("nenhum master do PodObservar é público", async () => {
      await comPool(async (c) => {
        const { rows } = await c.query(
          `select chave_storage from arquivo
           where chave_storage like 'arquivos/podobservar/%'
             and (visibilidade <> 'privado' or url_publica is not null)`,
        );
        expect(rows).toEqual([]);
      });
    });

    test("nenhuma chave do PodObservar aparece na projeção pública do acervo", async () => {
      await comPool(async (c) => {
        const { rows } = await c.query(
          `select 1 from vw_anexo_publico
           where link_permanente like '%podobservar%'
              or coalesce(rotulo_arquivo, '') like '%podobservar%'`,
        );
        expect(rows).toEqual([]);
      });
    });

    test("episódio em rascunho não aparece na view pública", async () => {
      await comPool(async (c) => {
        const { rows } = await c.query<{ n: string }>(
          `select count(*) n from episodio e
           where e.status = 'rascunho'
             and exists (select 1 from vw_episodio_publico v where v.slug = e.slug)`,
        );
        expect(rows[0]?.n).toBe("0");
      });
    });
  },
);

describe.skipIf(!URL_MANUTENCAO)(
  "integração: tripwire da migração 0012 (requer DATABASE_URL_MANUTENCAO)",
  () => {
    /**
     * Toda alteração aqui é desfeita. O tripwire só pode ser provado mexendo
     * em estado real — então o estado real volta exatamente como estava.
     */
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

    async function pendencias(c: PoolClient): Promise<string[]> {
      const { rows } = await c.query<{ slug: string; pendencia: string }>(
        `select slug, pendencia from vw_pendencia_publicacao order by 1, 2`,
      );
      return rows.map((r) => `${r.slug} | ${r.pendencia}`);
    }

    test("o gate está limpo no estado atual", async () => {
      await comRollback(async (c) => {
        expect(await pendencias(c)).toEqual([]);
      });
    });

    /**
     * O tripwire não pode gritar por episódio correto: um alarme que dispara
     * no caso bom é desligado por quem o lê, e aí não protege mais nada.
     */
    test("episódio publicado corretamente não gera pendência", async () => {
      await comRollback(async (c) => {
        await c.query(
          `update episodio set status = 'publicado' where numero = 1`,
        );
        expect(await pendencias(c)).toEqual([]);
      });
    });

    const defeitos: ReadonlyArray<readonly [string, string, string]> = [
      [
        "sem Spotify",
        `update episodio set status='publicado', url_spotify=null where numero=2`,
        "episódio publicado sem url_spotify",
      ],
      [
        "sem publicado_em",
        `update episodio set status='publicado', publicado_em=null where numero=2`,
        "episódio publicado sem publicado_em",
      ],
      [
        "data no futuro",
        `update episodio set status='publicado', publicado_em='2099-01-01' where numero=2`,
        "episódio publicado com data no futuro",
      ],
      [
        "transcrição em branco",
        `update episodio set status='publicado', transcricao='   ' where numero=2`,
        "episódio publicado com transcrição em branco",
      ],
    ];

    for (const [nome, sql, diagnostico] of defeitos) {
      test(`episódio publicado ${nome} gera o ramo geral e o específico`, async () => {
        await comRollback(async (c) => {
          await c.query(sql);
          const linhas = await pendencias(c);
          expect(linhas).toContain(
            "02-conheca-o-recanto-da-serra | episódio publicado ausente do gate público",
          );
          expect(linhas).toContain(
            `02-conheca-o-recanto-da-serra | ${diagnostico}`,
          );
        });
      });
    }

    /**
     * A porta lateral da P0.2B1: `vw_episodio_publico` não alcança o master,
     * mas vincular o `arquivo` a um `documento` o faria entrar pelo Acervo,
     * que é outro gate. Ninguém impede o vínculo — então o tripwire denuncia.
     */
    test("master vinculado a documento é denunciado", async () => {
      await comRollback(async (c) => {
        const doc = await c.query<{ id: string }>(
          `select id from documento limit 1`,
        );
        const arq = await c.query<{ id: string }>(
          `select id from arquivo where chave_storage like 'arquivos/podobservar/%' limit 1`,
        );
        const documentoId = doc.rows[0]?.id;
        const arquivoId = arq.rows[0]?.id;
        if (!documentoId || !arquivoId) return; // nada ingerido neste ambiente
        await c.query(
          `insert into documento_arquivo (documento_id, arquivo_id, versao, principal)
           values ($1, $2, 1, false)`,
          [documentoId, arquivoId],
        );
        expect(
          (await pendencias(c)).some((l) =>
            l.includes("master de podcast vinculado a documento"),
          ),
        ).toBe(true);
      });
    });

    test("master tornado público é denunciado", async () => {
      await comRollback(async (c) => {
        // Uma linha só: `arquivo.url_publica` é UNIQUE, e tornar os três
        // públicos com a mesma URL falharia pela unicidade, não pelo tripwire.
        const r = await c.query(
          `update arquivo
              set visibilidade = 'publico',
                  url_publica = 'https://acervo.exemplo/master-indevido.wav'
            where id = (
              select id from arquivo
               where chave_storage like 'arquivos/podobservar/%'
               order by chave_storage limit 1
            )`,
        );
        if (!r.rowCount) return; // nada ingerido neste ambiente
        expect(
          (await pendencias(c)).some((l) =>
            l.includes("master de podcast com visibilidade pública"),
          ),
        ).toBe(true);
      });
    });
  },
);
