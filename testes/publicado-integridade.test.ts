/**
 * O snapshot em disco é o que o manifesto diz que é.
 *
 * O `release.json` declara o SHA-256 de `acervo.json` e de `episodios.json`, e
 * o próprio `id` deriva desses dois hashes. Isso só significa alguma coisa se
 * os **bytes em disco** forem os bytes hasheados — e é exatamente aí que essa
 * garantia se perde em silêncio.
 *
 * Foi o que aconteceu entre o Lote B e o Lote C: o formatador reorganizou
 * `acervo.json`, compactando arrays que a serialização canônica escreve linha
 * a linha. O conteúdo continuou idêntico — o mesmo objeto, os mesmos 107
 * anexos —, mas os bytes mudaram, e o manifesto passou a descrever um arquivo
 * que não existia mais. Nenhum teste percebeu, porque todos liam o JSON
 * analisado, nunca o texto.
 *
 * Estes testes leem o texto. São a semente do gate integrado: antes de o
 * release valer alguma coisa, o que está em disco precisa ser o que foi
 * declarado.
 */
import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

import { lerRelease } from "../src/dados/publicado/leitura";
import {
  conferirRelease,
  serializarCanonico,
  sha256DeTexto,
} from "../src/dados/publicado/release";
import { chaveDoPacote } from "../src/lib/pacote-acervo";

const ARQUIVOS = ["acervo", "episodios", "release"] as const;

function texto(nome: string): string {
  return readFileSync(`src/dados/publicado/${nome}.json`, "utf8");
}

describe("os arquivos do snapshot estão na forma canônica", () => {
  test.each(ARQUIVOS)(
    "%s.json é byte a byte a serialização canônica",
    (nome) => {
      const bruto = texto(nome);
      expect(bruto).toBe(serializarCanonico(JSON.parse(bruto)));
    },
  );

  /*
    A regra acima só se sustenta se o formatador não reescrever estes
    arquivos. A exclusão no `biome.json` é parte do contrato, e não
    preferência de estilo: sem ela, o próximo `--write` desfaz tudo.
  */
  test("o formatador não reescreve o snapshot", () => {
    const configuracao = JSON.parse(readFileSync("biome.json", "utf8")) as {
      files: { includes: string[] };
    };
    expect(configuracao.files.includes).toContain(
      "!src/dados/publicado/*.json",
    );
  });
});

describe("o manifesto descreve os arquivos que estão em disco", () => {
  const release = lerRelease();

  test("os hashes declarados são os dos bytes reais", () => {
    expect(release.sha256.acervo).toBe(sha256DeTexto(texto("acervo")));
    expect(release.sha256.episodios).toBe(sha256DeTexto(texto("episodios")));
  });

  test("o id deriva do conteúdo, e continua coerente", () => {
    expect(() =>
      conferirRelease(release, texto("acervo"), texto("episodios")),
    ).not.toThrow();
  });

  test("os totais declarados são os totais reais", () => {
    const acervo = JSON.parse(texto("acervo")) as { slug: string }[];
    const episodios = JSON.parse(texto("episodios")) as unknown[];

    expect(release.totais.anexos).toBe(acervo.length);
    expect(release.totais.documentos).toBe(
      new Set(acervo.map((anexo) => anexo.slug)).size,
    );
    expect(release.totais.episodios).toBe(episodios.length);
  });
});

describe("o pacote declarado no release", () => {
  const { zip } = lerRelease();

  test("existe e está endereçado pelo próprio conteúdo", () => {
    expect(zip).not.toBeNull();
    if (!zip) return;
    expect(zip.chave).toBe(chaveDoPacote(zip.sha256));
    expect(zip.bytes).toBeGreaterThan(0);
  });

  /*
    O pacote é maior que a soma dos arquivos: o ZIP acrescenta cabeçalho e
    diretório central. Não pode ser menor — isso significaria compressão de
    conteúdo já comprimido ou, pior, arquivo faltando.
  */
  test("o tamanho é coerente com o corpus que ele carrega", () => {
    const acervo = JSON.parse(texto("acervo")) as { bytes: number }[];
    const soma = acervo.reduce((total, anexo) => total + anexo.bytes, 0);
    if (!zip) return;
    expect(zip.bytes).toBeGreaterThanOrEqual(soma);
    // Sem compressão, a sobrecarga do formato é ínfima perto do conteúdo.
    expect(zip.bytes - soma).toBeLessThan(soma * 0.01);
  });
});
