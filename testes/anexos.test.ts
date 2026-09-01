/**
 * Testes das funções puras da Sala do Avaliador (Tarefa 08).
 * Sem banco e sem R2: nada aqui abre conexão.
 */
import { afterEach, describe, expect, test } from "vitest";

import {
  dataIso,
  hashTruncado,
  tamanhoLegivel,
} from "../src/componentes/acervo/TabelaAnexos";
import {
  CHAVE_ZIP_ANEXOS,
  nomeNoPacote,
  urlDoZipDeAnexos,
} from "../src/lib/zip-anexos";

const SHA = "0faa4397902fe6fd382192454f73bcc731758db66153b046c2d78bf7eb90c0de";

describe("apresentação do hash", () => {
  test("trunca em 12 caracteres com reticências", () => {
    expect(hashTruncado(SHA)).toBe("0faa4397902f…");
  });

  test("o truncado é prefixo do integral", () => {
    const truncado = hashTruncado(SHA).replace("…", "");
    expect(SHA.startsWith(truncado)).toBe(true);
    expect(truncado).toHaveLength(12);
  });

  test("nunca perde o valor integral — ele continua disponível", () => {
    expect(SHA).toHaveLength(64);
    expect(hashTruncado(SHA)).not.toBe(SHA);
  });
});

describe("tamanho legível", () => {
  test("bytes, kB e MB", () => {
    expect(tamanhoLegivel(512)).toBe("512 B");
    expect(tamanhoLegivel(2048)).toBe("2 kB");
    expect(tamanhoLegivel(5 * 1024 * 1024)).toBe("5.0 MB");
  });

  test("limite entre unidades", () => {
    expect(tamanhoLegivel(1023)).toBe("1023 B");
    expect(tamanhoLegivel(1024)).toBe("1 kB");
  });
});

describe("data ISO", () => {
  test("formata como o doc 01 §4 pede", () => {
    expect(dataIso(new Date("2026-04-11T13:45:00Z"))).toBe("2026-04-11");
    expect(dataIso("2026-03-27T00:00:00Z")).toBe("2026-03-27");
  });

  test("ausência vira travessão, nunca data inventada", () => {
    expect(dataIso(null)).toBe("—");
    expect(dataIso("data quebrada")).toBe("—");
  });
});

describe("pacote .zip", () => {
  const original = process.env.STORAGE_PUBLIC_URL;
  afterEach(() => {
    if (original === undefined) delete process.env.STORAGE_PUBLIC_URL;
    else process.env.STORAGE_PUBLIC_URL = original;
  });

  test("a chave do objeto é estável", () => {
    expect(CHAVE_ZIP_ANEXOS).toBe("prestacao-de-contas/anexos.zip");
  });

  test("monta a URL a partir de STORAGE_PUBLIC_URL", () => {
    process.env.STORAGE_PUBLIC_URL = "https://arquivos.exemplo.org";
    expect(urlDoZipDeAnexos()).toBe(
      "https://arquivos.exemplo.org/prestacao-de-contas/anexos.zip",
    );
  });

  test("tolera barra final na variável", () => {
    process.env.STORAGE_PUBLIC_URL = "https://arquivos.exemplo.org/";
    expect(urlDoZipDeAnexos()).toBe(
      "https://arquivos.exemplo.org/prestacao-de-contas/anexos.zip",
    );
  });

  test("sem a variável devolve null, e não um link quebrado", () => {
    delete process.env.STORAGE_PUBLIC_URL;
    expect(urlDoZipDeAnexos()).toBeNull();
  });

  test("nome dentro do pacote usa o slug e preserva a extensão", () => {
    expect(
      nomeNoPacote(
        "relatorio-tecnico-recanto-da-serra",
        "https://arquivos.exemplo.org/arquivos/analise-de-dados/relatorio-tecnico-recanto-da-serra-v1.pdf",
      ),
    ).toBe("relatorio-tecnico-recanto-da-serra.pdf");
  });

  test("ignora query ao deduzir a extensão", () => {
    expect(
      nomeNoPacote("entrevista-x", "https://x/y/entrevista-x-v1.mp3?v=2"),
    ).toBe("entrevista-x.mp3");
  });

  test("sem extensão na URL, o nome fica só com o slug", () => {
    expect(nomeNoPacote("painel-vivo", "https://x/y/painel-vivo-v1")).toBe(
      "painel-vivo",
    );
  });
});
