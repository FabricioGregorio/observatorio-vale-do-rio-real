/**
 * Título humano de arquivo — leitura do rótulo, nunca reescrita do dado.
 *
 * O rótulo publicado continua o mesmo em `acervo.json`; o que muda é como a
 * interface o lê: código documental à parte, título legível como título.
 * Estes testes prendem o que pode mudar (acento, maiúscula, a preposição da
 * tabela) e o que não pode (o texto do rótulo, a chave, o identificador).
 */
import { describe, expect, test } from "vitest";
import { generateMetadata } from "../src/app/acervo/[documento]/arquivo/[arquivoId]/page";
import { normalizarBusca } from "../src/componentes/acervo/busca";
import {
  apresentarArquivoPublico,
  identificacaoDoDocumento,
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

describe("título da página das 107 fichas de arquivo", () => {
  test("todo título é único, e a ficha mantém o canonical", async () => {
    const titulos: string[] = [];
    for (const documento of documentos)
      for (const arquivo of documento.arquivos) {
        const meta = await generateMetadata({
          params: Promise.resolve({
            documento: documento.slug,
            arquivoId: arquivo.arquivoId,
          }),
        });
        const titulo = String(meta.title);
        titulos.push(titulo);
        expect(String(meta.alternates?.canonical)).toBe(
          `https://observatoriotobiassoueu.com.br/acervo/${documento.slug}/arquivo/${arquivo.arquivoId}`,
        );
        // Nada técnico no título: UUID, hash, chave de armazenamento, MIME.
        expect(titulo).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-|[0-9a-f]{32}/);
        expect(titulo).not.toMatch(
          /arquivos\/|\.(pdf|m4a|mp3|xlsx|webp|jpg|svg)\b/i,
        );
        expect(titulo).not.toMatch(/application\/|audio\/|image\//);
      }
    expect(titulos).toHaveLength(107);
    expect(new Set(titulos).size).toBe(107);
  });

  test("a identificação do pai entra sem repetir o tipo", async () => {
    const titulo = async (slug: string, rotulo: string) => {
      const documento = documentos.find((d) => d.slug === slug);
      const arquivo = documento?.arquivos.find((a) =>
        a.rotuloArquivo?.includes(rotulo),
      );
      if (!documento || !arquivo) throw new Error(`${slug} · ${rotulo}`);
      return String(
        (
          await generateMetadata({
            params: Promise.resolve({
              documento: slug,
              arquivoId: arquivo.arquivoId,
            }),
          })
        ).title,
      );
    };
    expect(await titulo("entrevista-pedro-menezes", "transcrição")).toBe(
      "Transcrição da entrevista — Pedro Menezes (05/04/2026) — Acervo",
    );
    expect(await titulo("entrevista-pedro-menezes", "áudio")).toBe(
      "Áudio da entrevista — Pedro Menezes (05/04/2026) — Acervo",
    );
    expect(await titulo("relatorio-tecnico-borda-da-mata", "integral")).toBe(
      "Relatório técnico integral — Borda da Mata — Acervo",
    );
    // Título já único no acervo não ganha sufixo.
    expect(await titulo("anexo-indicadores-etapa-1", "serie mensal")).toBe(
      "Série mensal — Acervo",
    );
  });

  test("sem o tipo como prefixo, a identificação é o título inteiro", () => {
    expect(
      identificacaoDoDocumento({
        slug: "formulario-publico-consumidor",
        tipo: "formulario_modelo",
        titulo: "Respostas do formulário de visitantes",
      }),
    ).toBe("Respostas do formulário de visitantes");
    expect(
      identificacaoDoDocumento({
        slug: "anexo-indicadores-etapa-1",
        tipo: "painel_dados",
        titulo: "Anexo Técnico de Indicadores — Etapa 1 de Levantamento",
      }),
    ).toBe("Anexo Técnico de Indicadores — Etapa 1 de Levantamento");
  });
});
