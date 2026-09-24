/**
 * `/baixar/[arquivoId]` — o mapa de download do acervo.
 *
 * A rota deixou de ser função e virou redirecionamento declarado: os destinos
 * saem daqui para `next.config.ts` e são compilados no build. O que estes
 * testes travam é o contrato desse mapa — que ele é completo, que não tem
 * destino fora do acervo e que a URL entregue é o link canônico com o
 * marcador, nada além.
 *
 * Tudo aqui é puro: lê o snapshot versionado, não abre conexão e não depende
 * de build. A prova de que os 107 viraram redirects compilados está no
 * `routes-manifest.json`, e é feita no checkpoint do lote, não aqui — um
 * teste que dependesse de `.next` falharia em máquina limpa por motivo que
 * não é o código.
 */
import { describe, expect, test } from "vitest";

import {
  caminhoDeDownload,
  MARCADOR_DE_DOWNLOAD,
  ORIGEM_DO_ACERVO,
  redirecionamentosDeDownload,
  urlDeDownload,
} from "../src/dados/publicado/downloads";
import { lerAcervoPublicado } from "../src/dados/publicado/leitura";

const acervo = lerAcervoPublicado();
const redirecionamentos = redirecionamentosDeDownload();

describe("mapa de download", () => {
  test("todo arquivo do acervo tem destino, e nada além dele", () => {
    expect(redirecionamentos).toHaveLength(acervo.length);
    expect(redirecionamentos.map((r) => r.arquivoId)).toEqual(
      acervo.map((anexo) => anexo.arquivoId),
    );
  });

  test("nenhum arquivoId repetido", () => {
    const ids = redirecionamentos.map((r) => r.arquivoId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("nenhuma origem repetida", () => {
    const origens = redirecionamentos.map((r) => r.origem);
    expect(new Set(origens).size).toBe(origens.length);
  });

  test("a origem é sempre /baixar/<arquivoId>", () => {
    for (const { arquivoId, origem } of redirecionamentos) {
      expect(origem, arquivoId).toBe(`/baixar/${arquivoId}`);
      expect(origem, arquivoId).toBe(caminhoDeDownload(arquivoId));
    }
  });

  /*
    A conferência que impede o redirecionamento aberto: todo destino é do
    acervo público, e de mais lugar nenhum. Se um `linkPermanente` do snapshot
    apontasse para outro host, o build falharia antes de gerar o redirect —
    este teste é a mesma regra, exercida sem build.
  */
  test("todo destino pertence ao acervo público", () => {
    for (const { arquivoId, destino } of redirecionamentos) {
      expect(new URL(destino).origin, arquivoId).toBe(ORIGEM_DO_ACERVO);
      expect(destino.startsWith(`${ORIGEM_DO_ACERVO}/`), arquivoId).toBe(true);
    }
  });

  test("o destino é o link canônico com o marcador, e nada mais", () => {
    for (const anexo of acervo) {
      const destino = redirecionamentos.find(
        (r) => r.arquivoId === anexo.arquivoId,
      )?.destino;
      expect(destino, anexo.arquivoId).toBe(
        `${anexo.linkPermanente}?${MARCADOR_DE_DOWNLOAD}`,
      );
      // O link canônico sobrevive byte a byte: nada foi reescrito.
      expect(
        destino?.startsWith(`${anexo.linkPermanente}?`),
        anexo.arquivoId,
      ).toBe(true);
    }
  });

  test("o marcador aparece uma vez só, e é o único parâmetro", () => {
    for (const { arquivoId, destino } of redirecionamentos) {
      expect(destino.split("?"), arquivoId).toHaveLength(2);
      expect([...new URL(destino).searchParams], arquivoId).toEqual([
        ["baixar", "1"],
      ]);
    }
  });
});

describe("montagem do destino", () => {
  test("acrescenta o marcador ao link canônico", () => {
    expect(
      urlDeDownload(`${ORIGEM_DO_ACERVO}/arquivos/exemplo/a02-v1.pdf`),
    ).toBe(`${ORIGEM_DO_ACERVO}/arquivos/exemplo/a02-v1.pdf?baixar=1`);
  });

  test("recusa host fora do acervo", () => {
    expect(() => urlDeDownload("https://exemplo.invalid/a.pdf")).toThrow(
      /fora do acervo/,
    );
    expect(() =>
      urlDeDownload("https://acervo.observatoriotobiassoueu.com.br.mau/a.pdf"),
    ).toThrow(/fora do acervo/);
  });

  test("recusa esquema que não seja o do acervo", () => {
    expect(() =>
      urlDeDownload("http://acervo.observatoriotobiassoueu.com.br/a.pdf"),
    ).toThrow(/fora do acervo/);
  });

  test("recusa valor que não é URL absoluta", () => {
    for (const valor of ["", "arquivo.pdf", "/arquivos/a.pdf", "não é url"]) {
      expect(() => urlDeDownload(valor), valor).toThrow(/URL absoluta/);
    }
  });

  /*
    Um link que já trouxesse query produziria `?a=1?baixar=1`, que não é uma
    segunda query e sim lixo dentro do valor do primeiro parâmetro. Recusar é
    o único tratamento honesto: o acervo publica URL canônica limpa.
  */
  test("recusa link com query ou fragmento", () => {
    expect(() => urlDeDownload(`${ORIGEM_DO_ACERVO}/a.pdf?v=2`)).toThrow(
      /query ou fragmento/,
    );
    expect(() => urlDeDownload(`${ORIGEM_DO_ACERVO}/a.pdf#topo`)).toThrow(
      /query ou fragmento/,
    );
  });
});

describe("a rota de download não é mais uma função", () => {
  test("não existe rota sob src/app/baixar", async () => {
    const { existsSync } = await import("node:fs");
    expect(existsSync("src/app/baixar")).toBe(false);
  });

  /*
    O mapa é dado, não código que executa: nada aqui busca objeto, confere
    hash ou lê ambiente. A guarda é sobre o texto do módulo porque é o que
    impede a volta do proxy por acréscimo silencioso.
  */
  test("o módulo de download não busca, não confere hash e não lê ambiente", async () => {
    const { readFileSync } = await import("node:fs");
    const fonte = readFileSync("src/dados/publicado/downloads.ts", "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, " ")
      .replace(/(?<!:)\/\/.*$/gm, " ");

    expect(fonte).not.toMatch(/\bfetch\s*\(/);
    expect(fonte).not.toMatch(/createHash/);
    expect(fonte).not.toMatch(/process\.env/);
    expect(fonte).not.toMatch(/force-dynamic/);
  });

  test("next.config declara os redirects a partir do snapshot", async () => {
    const { readFileSync } = await import("node:fs");
    const configuracao = readFileSync("next.config.ts", "utf8");
    expect(configuracao).toContain("redirecionamentosDeDownload()");
    expect(configuracao).toContain("permanent: true");
  });
});
