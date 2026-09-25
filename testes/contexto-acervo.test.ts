/**
 * Contexto de consulta do Acervo: por que o documento apareceu, e como
 * voltar à busca de onde se veio — pela URL, e só por ela.
 */
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import {
  buscarNoAcervo,
  motivoDoResultado,
} from "../src/componentes/acervo/busca";
import { montarIndiceDoAcervo } from "../src/componentes/acervo/indiceDeBusca";
import { ListaDocumentosPublicos } from "../src/componentes/acervo/ListaDocumentosPublicos";
import { destinoDoRetorno } from "../src/componentes/acervo/RetornoAoAcervo";
import { listarDocumentosPublicos } from "../src/dados/publicado/acervo";

const documentos = await listarDocumentosPublicos();
const indice = montarIndiceDoAcervo(documentos);
const TIPOS = [...new Set(documentos.map((d) => d.tipo))];
const doc = (slug: string) => {
  const achado = indice.find((d) => d.slug === slug);
  if (!achado) throw new Error(slug);
  return achado;
};

describe("motivo da correspondência", () => {
  test('"Secretaria": a instituição explica o resultado', () => {
    expect(
      motivoDoResultado(doc("entrevista-josenilson-bispo"), "Secretaria"),
    ).toEqual(["Secretaria de Cultura"]);
    expect(
      motivoDoResultado(doc("entrevista-laerte-aguiar"), "secretaria"),
    ).toEqual(["Secretaria Municipal de Cultura"]);
  });

  test("sem motivo quando o título já explica", () => {
    expect(
      motivoDoResultado(doc("relatorio-tecnico-recanto-da-serra"), "Recanto"),
    ).toEqual([]);
    expect(
      motivoDoResultado(doc("entrevista-oviedo-e-neide-abreu"), "oviedo"),
    ).toEqual([]);
  });

  test('"serie mensal": o arquivo apontado já explica, e nada se repete', () => {
    const [resultado] = buscarNoAcervo(indice, "serie mensal", "");
    expect(resultado?.correspondencia).not.toBeNull();
    // O card só recebe motivo quando nenhum arquivo foi apontado.
    const html = renderToStaticMarkup(
      createElement(ListaDocumentosPublicos, {
        documentos: resultado ? [resultado.documento] : [],
        correspondencias: new Map(
          resultado?.correspondencia
            ? [[resultado.documento.slug, resultado.correspondencia]]
            : [],
        ),
        motivos: new Map(),
      }),
    );
    expect(html).not.toContain("Encontrado por");
  });

  test("o card mostra o motivo e leva a consulta no link do documento", () => {
    const html = renderToStaticMarkup(
      createElement(ListaDocumentosPublicos, {
        documentos: [doc("entrevista-josenilson-bispo")],
        motivos: new Map([
          ["entrevista-josenilson-bispo", ["Secretaria de Cultura"]],
        ]),
        consulta: "q=Secretaria",
      }),
    );
    expect(html).toContain("Encontrado por");
    expect(html).toContain("Secretaria de Cultura");
    expect(html).toContain(
      'href="/acervo/entrevista-josenilson-bispo?q=Secretaria"',
    );
    expect(html).not.toMatch(/match|score|keyword|índice/i);
  });
});

describe("retorno ao Acervo", () => {
  const retorno = (query: string) =>
    destinoDoRetorno(new URLSearchParams(query), TIPOS);

  test("A — busca preservada", () => {
    expect(retorno("q=Secretaria")).toEqual({
      href: "/acervo?q=Secretaria",
      comContexto: true,
    });
  });

  test("B — busca e tipo preservados", () => {
    expect(retorno("q=Recanto&tipo=entrevista_transcricao")).toEqual({
      href: "/acervo?q=Recanto&tipo=entrevista_transcricao",
      comContexto: true,
    });
  });

  test("C — entrada direta volta a /acervo", () => {
    expect(retorno("")).toEqual({ href: "/acervo", comContexto: false });
  });

  test("tipo desconhecido e consulta longa não atravessam", () => {
    expect(retorno("tipo=inexistente").href).toBe("/acervo");
    const longa = "a".repeat(300);
    expect(retorno(`q=${longa}`).href).toBe(`/acervo?q=${"a".repeat(120)}`);
  });
});
