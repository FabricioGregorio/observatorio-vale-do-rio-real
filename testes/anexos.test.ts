/**
 * Testes das funções puras da Prestação de Contas (Tarefa 08).
 * Sem banco e sem R2: nada aqui abre conexão.
 */
import { afterEach, describe, expect, test } from "vitest";

import {
  dataIso,
  tamanhoLegivel,
} from "../src/componentes/acervo/TabelaAnexos";
import {
  CHAVE_ZIP_ANEXOS,
  nomeNoPacote,
  urlDoZipDeAnexos,
  zipDeAnexosPublicado,
} from "../src/lib/zip-anexos";

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
  test("formata a data ISO para exibição", () => {
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
  const originalPublicado = process.env.ZIP_ANEXOS_PUBLICADO;
  afterEach(() => {
    if (original === undefined) delete process.env.STORAGE_PUBLIC_URL;
    else process.env.STORAGE_PUBLIC_URL = original;
    if (originalPublicado === undefined)
      delete process.env.ZIP_ANEXOS_PUBLICADO;
    else process.env.ZIP_ANEXOS_PUBLICADO = originalPublicado;
  });

  test("a chave do objeto é estável", () => {
    expect(CHAVE_ZIP_ANEXOS).toBe("prestacao-de-contas/anexos.zip");
  });

  test("monta a URL a partir de STORAGE_PUBLIC_URL", () => {
    process.env.STORAGE_PUBLIC_URL = "https://arquivos.exemplo.org";
    process.env.ZIP_ANEXOS_PUBLICADO = "true";
    expect(urlDoZipDeAnexos()).toBe(
      "https://arquivos.exemplo.org/prestacao-de-contas/anexos.zip",
    );
  });

  test("tolera barra final na variável", () => {
    process.env.STORAGE_PUBLIC_URL = "https://arquivos.exemplo.org/";
    process.env.ZIP_ANEXOS_PUBLICADO = "true";
    expect(urlDoZipDeAnexos()).toBe(
      "https://arquivos.exemplo.org/prestacao-de-contas/anexos.zip",
    );
  });

  test("sem a variável devolve null, e não um link quebrado", () => {
    delete process.env.STORAGE_PUBLIC_URL;
    process.env.ZIP_ANEXOS_PUBLICADO = "true";
    expect(urlDoZipDeAnexos()).toBeNull();
  });

  test("nome dentro do pacote usa pasta do documento e nome físico", () => {
    expect(
      nomeNoPacote(
        "relatorio-tecnico-recanto-da-serra",
        "https://arquivos.exemplo.org/arquivos/analise-de-dados/relatorio-tecnico-recanto-da-serra-v1.pdf",
      ),
    ).toBe(
      "relatorio-tecnico-recanto-da-serra/relatorio-tecnico-recanto-da-serra-v1.pdf",
    );
  });

  test("ignora query ao deduzir a extensão", () => {
    expect(
      nomeNoPacote("entrevista-x", "https://x/y/entrevista-x-v1.mp3?v=2"),
    ).toBe("entrevista-x/entrevista-x-v1.mp3");
  });

  test("sem extensão na URL, o nome fica só com o slug", () => {
    expect(nomeNoPacote("painel-vivo", "https://x/y/painel-vivo-v1")).toBe(
      "painel-vivo/painel-vivo-v1",
    );
  });
});

/**
 * Antirregressão do bloqueio 1 do primeiro deployment: com o domínio do acervo
 * configurado e oito anexos publicados, a página oferecia "Baixar tudo (.zip)"
 * apontando para um objeto que nunca foi enviado. O gate é a declaração
 * explícita de publicação, e ele falha fechado.
 */
describe("o ZIP só é oferecido quando declaradamente publicado", () => {
  const originalUrl = process.env.STORAGE_PUBLIC_URL;
  const originalPublicado = process.env.ZIP_ANEXOS_PUBLICADO;
  afterEach(() => {
    if (originalUrl === undefined) delete process.env.STORAGE_PUBLIC_URL;
    else process.env.STORAGE_PUBLIC_URL = originalUrl;
    if (originalPublicado === undefined)
      delete process.env.ZIP_ANEXOS_PUBLICADO;
    else process.env.ZIP_ANEXOS_PUBLICADO = originalPublicado;
  });

  test("domínio configurado mas ZIP não publicado: nenhum link", () => {
    process.env.STORAGE_PUBLIC_URL =
      "https://acervo.observatoriotobiassoueu.com.br";
    delete process.env.ZIP_ANEXOS_PUBLICADO;
    expect(zipDeAnexosPublicado()).toBe(false);
    expect(urlDoZipDeAnexos()).toBeNull();
  });

  test("a chave existir no código não é prova de que o objeto existe", () => {
    process.env.STORAGE_PUBLIC_URL =
      "https://acervo.observatoriotobiassoueu.com.br";
    delete process.env.ZIP_ANEXOS_PUBLICADO;
    expect(CHAVE_ZIP_ANEXOS).toBe("prestacao-de-contas/anexos.zip");
    expect(urlDoZipDeAnexos()).toBeNull();
  });

  test("valor ambíguo não publica: só o `true` exato conta", () => {
    process.env.STORAGE_PUBLIC_URL = "https://arquivos.exemplo.org";
    for (const valor of ["", " ", "false", "1", "sim", "publicado", "yes"]) {
      process.env.ZIP_ANEXOS_PUBLICADO = valor;
      expect(zipDeAnexosPublicado()).toBe(false);
      expect(urlDoZipDeAnexos()).toBeNull();
    }
  });

  test("declarado publicado, o link aparece no domínio do acervo", () => {
    process.env.STORAGE_PUBLIC_URL =
      "https://acervo.observatoriotobiassoueu.com.br";
    process.env.ZIP_ANEXOS_PUBLICADO = "TRUE ";
    expect(zipDeAnexosPublicado()).toBe(true);
    expect(urlDoZipDeAnexos()).toBe(
      "https://acervo.observatoriotobiassoueu.com.br/prestacao-de-contas/anexos.zip",
    );
  });
});
