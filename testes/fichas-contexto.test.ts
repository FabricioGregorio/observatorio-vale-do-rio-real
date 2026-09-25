/**
 * Fichas com contexto e relações — só o que um dado estruturado sustenta.
 *
 * Três garantias:
 *
 * 1. toda relação aponta para algo que existe e é público (documento
 *    publicado, episódio publicado, seção real);
 * 2. relação de episódio só existe com evidência literal no resumo
 *    publicado dele — nunca por palavra da transcrição;
 * 3. a fotografia só ganha link para a ficha quando os bytes são os mesmos e
 *    o lugar concorda.
 */
import { existsSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import PaginaArquivo from "../src/app/acervo/[documento]/arquivo/[arquivoId]/page";
import PaginaDocumento from "../src/app/acervo/[documento]/page";
import PaginaCampo from "../src/app/campo/page";
import PaginaDados from "../src/app/dados/page";
import PaginaPesquisa from "../src/app/pesquisa/page";
import { mapaB01 } from "../src/dados/editorial/mapa-b01";
import {
  contextoDaFotografia,
  contextoDoDocumento,
  fichaDaFotografiaExibida,
  RELACOES_DOS_EPISODIOS,
  relacionadosDoEpisodio,
} from "../src/dados/editorial/relacoes";
import { DERIVADOS_DOS_LUGARES } from "../src/dados/pesquisa/derivados";
import { listarDocumentosPublicos } from "../src/dados/publicado/acervo";
import { listarAnexosPublicos } from "../src/dados/publicado/anexos";
import { listarEpisodiosPublicos } from "../src/dados/publicado/podobservar";

const documentos = await listarDocumentosPublicos();
const anexos = await listarAnexosPublicos();
const episodios = await listarEpisodiosPublicos();
const titulos = new Map(documentos.map((d) => [d.slug, d.titulo]));

const paginas = {
  "/campo": renderToStaticMarkup(await PaginaCampo()),
  "/pesquisa": renderToStaticMarkup(await PaginaPesquisa()),
  "/dados": renderToStaticMarkup(await PaginaDados()),
} as const;

/** Um destino interno existe: rota real, documento publicado, id presente. */
function destinoExiste(href: string): boolean {
  const [caminho = "", ancora] = href.split("#");
  const acervo = /^\/acervo\/([a-z0-9-]+)$/.exec(caminho);
  if (acervo) return titulos.has(acervo[1] ?? "");
  const episodio = /^\/podobservar\/t(\d+)\/([a-z0-9-]+)$/.exec(caminho);
  if (episodio)
    return episodios.some(
      (e) => `${e.temporadaNumero}` === episodio[1] && e.slug === episodio[2],
    );
  if (!existsSync(`src/app${caminho}/page.tsx`)) return false;
  if (ancora === undefined) return true;
  const html = paginas[caminho as keyof typeof paginas];
  return html?.includes(`id="${ancora}"`) ?? false;
}

function pagina(html: string) {
  return {
    relacionados: [
      ...(html
        .slice(html.indexOf(">Relacionado</h2>"))
        .matchAll(/<a href="([^"]+)"/g) ?? []),
    ].map(([, href]) => href),
  };
}

describe("relações dos episódios", () => {
  test("só para episódios publicados, com evidência literal no resumo", () => {
    for (const [slug, relacoes] of Object.entries(RELACOES_DOS_EPISODIOS)) {
      const episodio = episodios.find((e) => e.slug === slug);
      expect(episodio, slug).toBeDefined();
      for (const relacao of relacoes)
        expect(episodio?.resumo, `${slug} · ${relacao.evidencia}`).toContain(
          relacao.evidencia,
        );
    }
  });

  test("todo destino resolvido existe e é público", () => {
    for (const episodio of episodios)
      for (const item of relacionadosDoEpisodio(episodio.slug, titulos))
        expect(
          destinoExiste(item.href),
          `${episodio.slug} → ${item.href}`,
        ).toBe(true);
  });

  test("documento sem ficha pública não vira relação", () => {
    const itens = relacionadosDoEpisodio(
      "02-conheca-o-recanto-da-serra",
      new Map(),
    );
    expect(itens.some((i) => i.href.startsWith("/acervo/"))).toBe(false);
  });
});

describe("fichas de documento", () => {
  test("todo relacionado dos 16 documentos aponta para destino real", () => {
    for (const documento of documentos) {
      const { relacionados } = contextoDoDocumento(
        documento.slug,
        episodios,
        documento.arquivos,
      );
      for (const item of relacionados)
        expect(
          destinoExiste(item.href),
          `${documento.slug} → ${item.href}`,
        ).toBe(true);
    }
  });

  test("entrevista em entrada direta: lugar, município e relações declaradas", async () => {
    const html = renderToStaticMarkup(
      await PaginaDocumento({
        params: Promise.resolve({ documento: "entrevista-pedro-menezes" }),
      }),
    );
    expect(html).toContain('aria-label="Sobre este documento"');
    expect(html).toContain("Recanto da Serra");
    expect(html).toContain("Tobias Barreto");
    expect(pagina(html).relacionados).toEqual(
      expect.arrayContaining([
        "/campo#campo-recanto-da-serra-titulo",
        "/pesquisa#pq-escuta-titulo",
        "/podobservar/t1/02-conheca-o-recanto-da-serra",
      ]),
    );
  });

  test("instituição aparece como instituição, e sem lugar inventado", () => {
    const { linhas, relacionados } = contextoDoDocumento(
      "entrevista-josenilson-bispo",
      episodios,
    );
    expect(linhas).toEqual([
      { termo: "Instituição", valor: "Secretaria de Cultura" },
      { termo: "Município", valor: "Tobias Barreto" },
      { termo: "Escuta", valor: "Na gestão pública municipal" },
    ]);
    expect(relacionados.some((r) => r.href.startsWith("/campo"))).toBe(false);
  });

  test("documento sem dado estruturado não ganha bloco nem frase", async () => {
    const html = renderToStaticMarkup(
      await PaginaDocumento({
        params: Promise.resolve({ documento: "identidade-visual" }),
      }),
    );
    expect(html).not.toContain("Sobre este documento");
    expect(html).not.toContain(">Relacionado</h2>");
  });

  test("fontes de Dados apontam para Dados", () => {
    for (const slug of [
      "anexo-indicadores-etapa-1",
      "formulario-rotina-de-funcionamento",
    ]) {
      const documento = documentos.find((d) => d.slug === slug);
      expect(
        contextoDoDocumento(
          slug,
          episodios,
          documento?.arquivos,
        ).relacionados.map((r) => r.href),
        slug,
      ).toContain("/dados#dd-fontes-titulo");
    }
  });
});

describe("fotografias", () => {
  test("as 28 fotografias do Campo encontram a ficha pelos mesmos bytes", async () => {
    for (const foto of DERIVADOS_DOS_LUGARES) {
      const ficha = fichaDaFotografiaExibida(foto, anexos);
      expect(ficha, foto.arquivo).not.toBeNull();
      const id = ficha?.href.split("/").at(-1);
      const publico = anexos.find((a) => a.arquivoId === id);
      expect(publico?.previewSha256 ?? publico?.sha256, foto.arquivo).toBe(
        foto.sha256,
      );
    }
    const campo = paginas["/campo"];
    expect(campo.match(/Ver ficha da fotografia/g)).toHaveLength(
      DERIVADOS_DOS_LUGARES.length,
    );
  });

  test("sem bytes iguais ou com lugar divergente, não há link", () => {
    const foto = DERIVADOS_DOS_LUGARES[0];
    if (!foto) throw new Error("manifesto vazio");
    expect(
      fichaDaFotografiaExibida({ ...foto, sha256: "0".repeat(64) }, anexos),
    ).toBeNull();
    expect(
      fichaDaFotografiaExibida({ ...foto, lugar: "ilha-grande" }, anexos),
    ).toBeNull();
  });

  test("ficha fotográfica em entrada direta separa registro e publicação", async () => {
    const pier = mapaB01.arquivos.find(
      (e) => e.tituloPublico === "Píer sobre a água",
    );
    const publico = anexos.find(
      (a) => (a.previewArquivoId ?? a.arquivoId) === pier?.arquivoId,
    );
    if (!publico) throw new Error("Píer ausente");
    const html = renderToStaticMarkup(
      await PaginaArquivo({
        params: Promise.resolve({
          documento: publico.slug,
          arquivoId: publico.arquivoId,
        }),
      }),
    );
    expect(html).toContain("Ilha Grande");
    expect(html).toContain("São Cristóvão");
    expect(html).toContain("Data do registro");
    expect(html).toContain('<time dateTime="2026-04-11">11/04/2026</time>');
    expect(html).toContain("Publicado em");
    expect(pagina(html).relacionados).toEqual([
      "/campo#campo-ilha-grande-titulo",
    ]);
  });

  test("fotografia sem data no manifesto não ganha data de registro", () => {
    for (const entrada of mapaB01.arquivos) {
      const publico = anexos.find(
        (a) => (a.previewArquivoId ?? a.arquivoId) === entrada.arquivoId,
      );
      if (!publico) throw new Error(entrada.arquivoId);
      const derivado = DERIVADOS_DOS_LUGARES.find(
        (d) => d.sha256 === entrada.sha256,
      );
      expect(contextoDaFotografia(publico).registro).toBe(
        derivado?.data ?? null,
      );
    }
  });
});
