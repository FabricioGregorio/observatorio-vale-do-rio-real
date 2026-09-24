import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

import {
  type EpisodioPublico,
  episodioPublicoSchema,
} from "../src/dados/podobservar-publico";
import {
  interpretarSegmentoDeTemporada,
  ordenarPorPublicacao,
  selecionarMaisRecente,
  selecionarPorTemporadaESlug,
} from "../src/dados/publicado/podobservar";

/**
 * Gate público do PodObservar — a política de distribuição.
 *
 * O site não reproduz áudio, não oferece download e não expõe URL do master.
 * O destino de escuta é o Spotify, e é condição de publicação; áudio privado
 * não bloqueia o episódio.
 *
 * O gate existiu primeiro como view do PostgreSQL, com uma camada de
 * integração que provava, contra o banco, que ela era fail-closed. A view saiu
 * com o banco. A regra não saiu: ela é o `episodioPublicoSchema`, que a
 * leitura do snapshot aplica em toda linha de `episodios.json` — episódio sem
 * transcrição, sem data ou sem destino de escuta é **descartado**, nunca
 * completado por suposição. É isso que os casos abaixo travam, agora sem
 * banco e sem rede.
 */

const SPOTIFY = "https://open.spotify.com/episode/4I2y3ku1E62PjxtDNWo8Uf";

/**
 * Nomes que jamais podem aparecer no que é publicado. Três famílias:
 * identidade do binário, localização do binário e estado interno do episódio.
 *
 * Eram as colunas que a view pública não podia carregar; agora são as chaves
 * que `episodios.json` não pode conter. O alvo mudou de lugar, a proibição é
 * a mesma — e é ela que impede o master do podcast de vazar por metadado.
 */
const NOMES_PROIBIDOS = [
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

/**
 * O mesmo descarte que `lerEpisodiosPublicados()` aplica: linha que não
 * satisfaz o contrato some, e nenhum campo é preenchido por inferência.
 */
function aceitos(linhas: readonly unknown[]): EpisodioPublico[] {
  return linhas.flatMap((linha) => {
    const analise = episodioPublicoSchema.safeParse(linha);
    return analise.success ? [analise.data] : [];
  });
}

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

  test("campo de áudio que porventura apareça na linha não entra no objeto público", () => {
    const linha = {
      ...episodio(),
      audio_url: "https://exemplo.invalid/master.wav",
      audio_id: "00000000-0000-4000-8000-000000000001",
    };
    const [publicado] = aceitos([linha]);
    expect(publicado).toBeDefined();
    expect(JSON.stringify(publicado)).not.toContain("master.wav");
    expect(Object.keys(publicado ?? {})).not.toContain("audio_url");
  });
});

describe("o snapshot publicado não carrega o master", () => {
  test("nenhum nome proibido aparece em episodios.json", () => {
    const bruto = readFileSync(
      join(process.cwd(), "src/dados/publicado/episodios.json"),
      "utf8",
    );
    const chaves = new Set<string>();
    for (const episodio of JSON.parse(bruto) as Record<string, unknown>[]) {
      for (const chave of Object.keys(episodio)) chaves.add(chave);
    }
    for (const proibido of NOMES_PROIBIDOS) {
      expect(chaves.has(proibido), proibido).toBe(false);
      expect(bruto.includes(`"${proibido}"`), proibido).toBe(false);
    }
  });
});

describe("validação da linha publicada", () => {
  test("linha completa atravessa a validação", () => {
    const linha = episodio();
    expect(aceitos([linha])).toHaveLength(1);
  });

  test("linha sem transcrição é descartada, não completada", () => {
    const linha = {
      ...episodio(),
      transcricao: null,
    };
    expect(aceitos([linha])).toEqual([]);
  });

  test("linha sem Spotify é descartada", () => {
    const linha = {
      ...episodio(),
      urlSpotify: null,
    };
    expect(aceitos([linha])).toEqual([]);
  });

  test("link que não é do Spotify não vira CTA de Spotify", () => {
    const linha = {
      ...episodio(),
      urlSpotify: "https://exemplo.invalid/episodio",
    };
    expect(aceitos([linha])).toEqual([]);
  });

  test("linha sem data de publicação é descartada", () => {
    const linha = {
      ...episodio(),
      publicadoEm: null,
    };
    expect(aceitos([linha])).toEqual([]);
  });

  test("YouTube ausente não derruba o episódio", () => {
    const linha = episodio({
      urlYoutube: null,
    });
    const [publicado] = aceitos([linha]);
    expect(publicado?.urlYoutube).toBeNull();
  });

  test("YouTube em formato curto é aceito", () => {
    const linha = episodio({
      urlYoutube: "https://youtu.be/CcNdxMkuFcI",
    });
    expect(aceitos([linha])).toHaveLength(1);
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
