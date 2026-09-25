/**
 * Título humano de arquivo — leitura do rótulo, nunca reescrita do dado.
 *
 * O rótulo publicado continua o mesmo em `acervo.json`; o que muda é como a
 * interface o lê: código documental à parte, título legível como título.
 * Estes testes prendem o que pode mudar (acento, maiúscula, a preposição da
 * tabela) e o que não pode (o texto do rótulo, a chave, o identificador).
 */
import { describe, expect, test } from "vitest";

import { normalizarBusca } from "../src/componentes/acervo/busca";
import {
  apresentarArquivoPublico,
  listarDocumentosPublicos,
} from "../src/dados/publicado/acervo";

const documentos = await listarDocumentosPublicos();
const arquivos = documentos.flatMap((d) => d.arquivos);

function porRotulo(rotulo: string) {
  const arquivo = arquivos.find((a) => a.rotuloArquivo === rotulo);
  if (arquivo === undefined) throw new Error(`rótulo ausente: ${rotulo}`);
  return apresentarArquivoPublico(arquivo);
}

describe("exemplos", () => {
  test.each([
    ["A11-16 — dicionario dados", "Dicionário dos dados", "A11-16"],
    ["A11-05 — serie mensal", "Série mensal", "A11-05"],
    ["A11-01 — sumario", "Sumário", "A11-01"],
    ["A11-11 — nota metodologica", "Nota metodológica", "A11-11"],
    ["B04 — áudio da entrevista", "Áudio da entrevista", "B04"],
    ["B04 — transcrição da entrevista", "Transcrição da entrevista", "B04"],
    ["A02 — relatório técnico integral", "Relatório técnico integral", "A02"],
    [
      "A10 — respostas de visitantes, Recanto da Serra",
      "Respostas de visitantes, Recanto da Serra",
      "A10",
    ],
  ])("%s → %s · %s", (rotulo, titulo, identificador) => {
    expect(porRotulo(rotulo)).toEqual({ titulo, identificador });
  });

  test.each([
    "A11-03 — indicadores solidaria",
    "A11-04 — publico mensuracao",
    "A11-06 — pessoas trabalho",
    "A11-13 — motivacao atividades",
    "A11-14 — consumo percepcao",
  ])("sem título sustentado, %s fica como está publicado", (rotulo) => {
    expect(porRotulo(rotulo)).toEqual({ titulo: rotulo, identificador: null });
  });

  test("rótulo sem descrição fica como está", () => {
    expect(porRotulo("D01-04")).toEqual({
      titulo: "D01-04",
      identificador: null,
    });
  });
});

describe("invariantes sobre os 107 arquivos", () => {
  test("o título só difere do rótulo em acento, caixa e preposição", () => {
    for (const arquivo of arquivos) {
      if (arquivo.slug === "fotografias-visitas-i-vii") continue;
      const { titulo, identificador } = apresentarArquivoPublico(arquivo);
      const rotulo = arquivo.rotuloArquivo ?? arquivo.titulo;
      if (identificador === null) {
        expect(titulo).toBe(rotulo);
        continue;
      }
      expect(rotulo.startsWith(`${identificador} — `)).toBe(true);
      const semPreposicao = (t: string) =>
        normalizarBusca(t)
          .replace(/\b(de|dos|das|do|da)\b/g, "")
          .replace(/\s+/g, " ")
          .trim();
      expect(semPreposicao(titulo), rotulo).toBe(
        semPreposicao(rotulo.slice(identificador.length + 3)),
      );
    }
  });

  test("apresentar não altera o arquivo lido", () => {
    const antes = JSON.stringify(arquivos);
    for (const arquivo of arquivos) apresentarArquivoPublico(arquivo);
    expect(JSON.stringify(arquivos)).toBe(antes);
    expect(arquivos).toHaveLength(107);
    expect(documentos).toHaveLength(16);
  });
});
