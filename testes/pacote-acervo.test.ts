/**
 * O pacote "Baixar tudo em ZIP" — seleção, nomes e endereço.
 *
 * O empacotamento em si é operação explícita e remota; o que se prova aqui é
 * a regra que decide **o que entra** e **com que nome**, que é pura e roda
 * offline. Um pacote com 106 arquivos, com um preview dentro, ou com duas
 * entradas disputando o mesmo caminho é um erro que precisa aparecer na
 * suíte, e não depois de 588 MiB enviados.
 */
import { describe, expect, test } from "vitest";

import type { AnexoPublico } from "../src/dados/anexo-publico";
import { FOTO_DA_PLACA } from "../src/dados/pesquisa/excecao-placa";
import {
  CorpusIncoerente,
  conferirCorpusCanonico,
  TOTAL_CANONICO,
  TOTAL_DE_DOCUMENTOS,
} from "../src/dados/publicado/canonicidade";
import { lerAcervoPublicado } from "../src/dados/publicado/leitura";
import {
  caminhoNoPacote,
  chaveDoPacote,
  entradasDoPacote,
  INSTANTE_DO_PACOTE,
  PacoteIncoerente,
} from "../src/lib/pacote-acervo";

const acervo = lerAcervoPublicado();
const entradas = entradasDoPacote(acervo);

describe("seleção: o pacote é o catálogo, nem mais nem menos", () => {
  test("uma entrada por anexo canônico", () => {
    expect(entradas).toHaveLength(TOTAL_CANONICO);
    expect(entradas).toHaveLength(acervo.length);
    expect(new Set(entradas.map((e) => e.arquivoId)).size).toBe(acervo.length);
  });

  test("todo anexo do acervo está no pacote", () => {
    const noPacote = new Set(entradas.map((e) => e.arquivoId));
    for (const anexo of acervo) {
      expect(noPacote.has(anexo.arquivoId), anexo.arquivoId).toBe(true);
    }
  });

  /*
    A seleção é por pertencimento ao catálogo, nunca por formato. Um filtro
    por extensão ou MIME deixaria de fora o WebP canônico — e o teste abaixo
    existe para que ninguém invente essa regra de novo.
  */
  test("nenhum preview entra, e nenhum WebP canônico fica de fora", () => {
    const urlsDoPacote = new Set(
      entradas.map(
        (e) => `https://acervo.observatoriotobiassoueu.com.br/${e.chave}`,
      ),
    );
    const previews = acervo.filter((anexo) => anexo.previewUrl);
    expect(previews.length).toBeGreaterThan(0);
    for (const anexo of previews) {
      expect(urlsDoPacote.has(anexo.previewUrl ?? ""), anexo.arquivoId).toBe(
        false,
      );
    }

    const webp = acervo.filter((anexo) => anexo.mimeType === "image/webp");
    expect(webp).toHaveLength(1);
    expect(
      entradas.some((e) => e.arquivoId === webp[0]?.arquivoId),
      "o WebP canônico precisa estar no pacote",
    ).toBe(true);
  });

  test("a fotografia com placa entra só na versão pública", () => {
    const tarjada = entradas.find(
      (e) => e.arquivoId === FOTO_DA_PLACA.arquivoPublicoId,
    );
    expect(tarjada?.sha256).toBe(FOTO_DA_PLACA.sha256Publico);
    expect(
      entradas.some((e) => e.sha256 === FOTO_DA_PLACA.sha256Original),
    ).toBe(false);
  });

  test("nenhuma chave privada atravessa para o pacote", () => {
    for (const entrada of entradas) {
      expect(entrada.chave.startsWith("arquivos/"), entrada.chave).toBe(true);
      expect(entrada.chave, entrada.arquivoId).not.toContain("privado");
    }
  });
});

describe("nomes dentro do pacote", () => {
  test("nenhuma colisão de caminho", () => {
    expect(new Set(entradas.map((e) => e.caminho)).size).toBe(entradas.length);
  });

  test("todo caminho começa pelo documento", () => {
    for (const anexo of acervo) {
      const entrada = entradas.find((e) => e.arquivoId === anexo.arquivoId);
      expect(entrada?.caminho.startsWith(`${anexo.slug}/`), anexo.slug).toBe(
        true,
      );
    }
    expect(new Set(entradas.map((e) => e.caminho.split("/")[0])).size).toBe(
      TOTAL_DE_DOCUMENTOS,
    );
  });

  test("nenhum caminho escapa do pacote", () => {
    for (const { caminho } of entradas) {
      expect(caminho, caminho).not.toContain("\\");
      expect(caminho.split("/"), caminho).not.toContain("..");
      expect(caminho.startsWith("/"), caminho).toBe(false);
    }
  });

  test("a ordem é determinística, e não a do catálogo", () => {
    const caminhos = entradas.map((e) => e.caminho);
    expect(caminhos).toEqual([...caminhos].sort());
    // Duas montagens do mesmo acervo produzem a mesma lista.
    expect(entradasDoPacote(acervo)).toEqual(entradas);
    expect(entradasDoPacote([...acervo].reverse())).toEqual(entradas);
  });

  test("recusa caminho inseguro vindo do dado", () => {
    const anexo = {
      ...(acervo[0] as AnexoPublico),
      slug: "..",
    };
    expect(() => caminhoNoPacote(anexo)).toThrow(PacoteIncoerente);
  });

  test("recusa objeto fora do acervo público", () => {
    const anexo = {
      ...(acervo[0] as AnexoPublico),
      linkPermanente: "https://exemplo.invalid/arquivos/x/a.pdf",
    };
    expect(() => caminhoNoPacote(anexo)).toThrow(PacoteIncoerente);
  });
});

describe("endereço do pacote", () => {
  test("a chave é o conteúdo", () => {
    const sha = "a".repeat(64);
    expect(chaveDoPacote(sha)).toBe("acervo/pacotes/anexos-aaaaaaaaaaaa.zip");
    expect(chaveDoPacote(sha)).not.toContain("2026");
  });

  test("recusa hash que não é hash", () => {
    for (const valor of ["", "abc", "A".repeat(64), "g".repeat(64)]) {
      expect(() => chaveDoPacote(valor), valor).toThrow(PacoteIncoerente);
    }
  });

  /*
    O carimbo de tempo é hora de parede, sem fuso: é o que faz o mesmo corpus
    produzir o mesmo pacote — e, portanto, a mesma chave — em qualquer
    máquina. Um instante absoluto viraria um carimbo por fuso horário.
  */
  test("o instante gravado nas entradas não tem fuso", () => {
    expect(INSTANTE_DO_PACOTE).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
    const data = new Date(INSTANTE_DO_PACOTE);
    expect(data.getFullYear()).toBe(1980);
    expect(data.getHours()).toBe(12);
  });
});

describe("garantias do corpus antes de empacotar", () => {
  test("o acervo publicado satisfaz todas elas", () => {
    expect(conferirCorpusCanonico(acervo)).toEqual({
      anexos: TOTAL_CANONICO,
      documentos: TOTAL_DE_DOCUMENTOS,
      comPreview: 57,
    });
  });

  test("um preview promovido a entrada é recusado", () => {
    const comPreview = acervo.find((anexo) => anexo.previewUrl);
    if (!comPreview?.previewUrl) throw new Error("sem preview no acervo");
    const intruso: AnexoPublico = {
      ...comPreview,
      arquivoId: "99999999-9999-4999-8999-999999999999",
      linkPermanente: comPreview.previewUrl,
      previewUrl: undefined,
      previewArquivoId: undefined,
      previewSha256: undefined,
    };
    expect(() => conferirCorpusCanonico([...acervo, intruso])).toThrow(
      CorpusIncoerente,
    );
  });

  test("o original com placa é recusado", () => {
    const tarjada = acervo.find(
      (anexo) => anexo.arquivoId === FOTO_DA_PLACA.arquivoPublicoId,
    );
    if (!tarjada) throw new Error("sem a fotografia tarjada");
    const comOriginal = acervo.map((anexo) =>
      anexo.arquivoId === tarjada.arquivoId
        ? { ...anexo, sha256: FOTO_DA_PLACA.sha256Original }
        : anexo,
    );
    expect(() => conferirCorpusCanonico(comOriginal)).toThrow(CorpusIncoerente);
  });

  test("um Caderno de Estudos inventado é recusado", () => {
    const fantasma: AnexoPublico = {
      ...(acervo[0] as AnexoPublico),
      arquivoId: "88888888-8888-4888-8888-888888888888",
      slug: "caderno-de-estudos",
      titulo: "Caderno de Estudos",
    };
    expect(() => conferirCorpusCanonico([...acervo, fantasma])).toThrow(
      CorpusIncoerente,
    );
  });

  test("corpus com contagem diferente é recusado", () => {
    expect(() => conferirCorpusCanonico(acervo.slice(0, 10))).toThrow(/107/);
  });
});
