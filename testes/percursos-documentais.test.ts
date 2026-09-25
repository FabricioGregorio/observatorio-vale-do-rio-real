/**
 * Percursos documentais — o link promete, o destino entrega.
 *
 * A regra que esta suíte protege:
 *
 *   conteúdo editorial → ficha contextual do site → abrir / baixar original
 *
 * Um nome de material ("Entrevista gravada", "Fotografias de campo") leva a
 * uma página do site que oferece o arquivo, e nunca direto ao binário. O
 * binário só é destino quando o rótulo é uma ação sobre ele — "Abrir
 * relatório técnico", "Baixar original".
 *
 * Os testes verificam relação, e não parágrafo: qual `href` sai de qual
 * rótulo, contra o `acervo.json` real.
 */
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import PaginaCampo from "../src/app/campo/page";
import PaginaDados from "../src/app/dados/page";
import NaoEncontrado from "../src/app/not-found";
import PaginaPesquisa from "../src/app/pesquisa/page";
import PaginaPrivacidade from "../src/app/privacidade/page";
import { AberturaB2 } from "../src/componentes/home/Aberturas";
import { ENTREVISTAS } from "../src/componentes/home/conteudo";
import { Escuta, Lugares, Produtos } from "../src/componentes/home/Secoes";
import { lugaresDeCampo } from "../src/componentes/territorio/cartografia/lugares";
import {
  type IdDoLugarDeCampo,
  MATERIAIS_POR_LUGAR,
  resolverMateriaisDoLugar,
} from "../src/dados/materiais-de-campo";
import { listarArquivosPorDocumento } from "../src/dados/publicado/anexos";

const publicados = await listarArquivosPorDocumento();
const LUGARES = Object.keys(MATERIAIS_POR_LUGAR) as IdDoLugarDeCampo[];
const materiais = LUGARES.flatMap((id) =>
  resolverMateriaisDoLugar(id, publicados).map((m) => ({ ...m, lugar: id })),
);

/**
 * Todos os `<a href>` de uma marcação, com o nome que o link anuncia: o texto,
 * sem os sinais de percurso decorativos (`aria-hidden`).
 */
function links(html: string): { href: string; texto: string }[] {
  return [
    ...html.matchAll(/<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g),
  ].map(([, href = "", corpo = ""]) => ({
    href: href.replaceAll("&amp;", "&"),
    texto: corpo
      .replace(/<span aria-hidden="true">[\s\S]*?<\/span>/g, "")
      .replace(/<[^>]+>/g, "")
      .trim(),
  }));
}

describe("materiais de campo levam a uma página do site", () => {
  test("todo material público tem destino, e nenhum destino é binário", () => {
    const publicos = materiais.filter((m) => m.estado === "publico");
    expect(publicos.length).toBeGreaterThan(0);
    for (const m of publicos) {
      expect(m.href, `${m.lugar}: ${m.material}`).toMatch(
        /^\/(acervo\/[a-z0-9-]+|campo#campo-[a-z-]+-titulo)$/,
      );
    }
  });

  test("nenhuma URL pública usa a âncora obsoleta do Acervo", () => {
    for (const m of materiais) expect(m.href ?? "").not.toContain("#acervo-");
    const fontes = [
      "src/dados/materiais-de-campo.ts",
      "src/componentes/home/Secoes.tsx",
      "src/app/pesquisa/page.tsx",
      "src/componentes/territorio/cartografia/PranchaDoLugar.tsx",
    ];
    for (const caminho of fontes) {
      expect(readFileSync(caminho, "utf8"), caminho).not.toMatch(
        /\/acervo#acervo-/,
      );
    }
  });

  test("fotografias levam à seção do próprio lugar, e a seção existe em /campo", async () => {
    const campo = renderToStaticMarkup(await PaginaCampo());
    for (const id of LUGARES) {
      const fotos = resolverMateriaisDoLugar(id, publicados).find(
        (m) => m.material === "Fotografias de campo",
      );
      expect(fotos?.href, id).toBe(`/campo#campo-${id}-titulo`);
      // O alvo da âncora é um id real da página renderizada.
      expect(campo, id).toContain(`id="campo-${id}-titulo"`);
    }
  });

  test('"Entrevista gravada" leva à ficha da entrevista, não à transcrição', () => {
    const entrevistas = materiais.filter(
      (m) => m.material === "Entrevista gravada",
    );
    expect(entrevistas).toHaveLength(3);
    for (const m of entrevistas) {
      const declarado = MATERIAIS_POR_LUGAR[m.lugar].find(
        (d) => d.material === "Entrevista gravada",
      );
      expect(m.href).toBe(`/acervo/${declarado?.documento}`);
      expect(m.href).not.toMatch(/\.(pdf|m4a|mp3)$/);
    }
  });

  test("respostas de formulário: um rótulo, um documento, o documento anunciado", () => {
    const esperados = {
      "Respostas de funcionamento":
        "/acervo/formulario-rotina-de-funcionamento",
      "Respostas de visitantes": "/acervo/formulario-publico-consumidor",
    } as const;
    for (const id of ["recanto-da-serra", "borda-da-mata"] as const) {
      const doLugar = resolverMateriaisDoLugar(id, publicados);
      for (const [rotulo, href] of Object.entries(esperados)) {
        expect(doLugar.find((m) => m.material === rotulo)?.href, id).toBe(href);
      }
    }
    // Nenhum rótulo promete dois conjuntos num destino só.
    for (const m of materiais) expect(m.material).not.toMatch(/ e de /);
    // Os dois documentos existem publicados, com arquivos próprios.
    expect(publicados.get("formulario-rotina-de-funcionamento")?.length).toBe(
      1,
    );
    expect(publicados.get("formulario-publico-consumidor")?.length).toBe(2);
  });

  test("as fichas do Território usam os mesmos destinos", () => {
    const doTerritorio = lugaresDeCampo(publicados).flatMap((l) =>
      l.materiais.map((m) => m.href),
    );
    expect(doTerritorio).toEqual(materiais.map((m) => m.href));
  });
});

describe("Home", () => {
  test("cada entrevista da lista leva à própria ficha, na mesma ordem", () => {
    const html = renderToStaticMarkup(createElement(Escuta, { publicados }));
    const lista = html.slice(html.indexOf('class="hl-entrevistas"'));
    const daLista = links(lista.slice(0, lista.indexOf("</ol>")));
    expect(daLista).toEqual(
      ENTREVISTAS.map((e) => ({
        href: `/acervo/${e.documento}`,
        texto: e.onde,
      })),
    );
  });

  test("sem arquivo público, a entrevista fica sem link", () => {
    const html = renderToStaticMarkup(
      createElement(Escuta, { publicados: new Map() }),
    );
    const lista = html.slice(html.indexOf('class="hl-entrevistas"'));
    expect(links(lista.slice(0, lista.indexOf("</ol>")))).toEqual([]);
  });

  test('o CTA "Conhecer a pesquisa" leva a /pesquisa', () => {
    const html = renderToStaticMarkup(createElement(AberturaB2));
    const cta = links(html).filter((l) => l.texto === "Conhecer a pesquisa");
    expect(cta.map((l) => l.href)).toEqual(["/pesquisa"]);
  });

  test("materiais dos lugares vão à ficha; o botão de abrir continua no PDF", () => {
    const html = renderToStaticMarkup(createElement(Lugares, { publicados }));
    const todos = links(html);
    const relatorio = todos.filter((l) => l.texto === "Relatório técnico");
    expect(relatorio.map((l) => l.href)).toEqual([
      "/acervo/relatorio-tecnico-recanto-da-serra",
      "/acervo/relatorio-tecnico-borda-da-mata",
    ]);
    const abrir = todos.filter((l) => l.texto === "Abrir relatório técnico");
    expect(abrir).toHaveLength(2);
    for (const l of abrir)
      expect(l.href).toMatch(/^https:\/\/acervo\..+\.pdf$/);
  });

  test("a identidade visual aponta para a própria ficha", () => {
    const html = renderToStaticMarkup(createElement(Produtos, { publicados }));
    const trecho = html.slice(html.indexOf("Identidade visual"));
    expect(links(trecho)[0]?.href).toBe("/acervo/identidade-visual");
  });
});

describe("páginas pequenas", () => {
  test("Privacidade leva à página de Contato pelo próprio texto", () => {
    const html = renderToStaticMarkup(createElement(PaginaPrivacidade));
    expect(links(html)).toContainEqual({
      href: "/contato",
      texto: "página de Contato",
    });
  });

  test("a 404 chama a área de Dados de Dados, e mantém as três saídas", () => {
    const saidas = links(renderToStaticMarkup(createElement(NaoEncontrado)));
    expect(saidas.map((l) => l.href)).toEqual(["/acervo", "/dados", "/"]);
    expect(saidas.find((l) => l.href === "/dados")?.texto).toBe("Dados");
  });

  test("Pesquisa: entrevistas e materiais vão às fichas, nunca ao binário", async () => {
    const todos = links(renderToStaticMarkup(await PaginaPesquisa()));
    const paraAcervo = todos.filter((l) => l.href.startsWith("/acervo/"));
    for (const e of ENTREVISTAS) {
      expect(paraAcervo.map((l) => l.href)).toContain(`/acervo/${e.documento}`);
    }
    const gravadas = todos.filter((l) => l.texto === "Entrevista gravada");
    expect(gravadas).toHaveLength(3);
    for (const l of gravadas) expect(l.href).toMatch(/^\/acervo\/entrevista-/);
  });

  test("as fontes de Dados levam à ficha do arquivo no Acervo", async () => {
    const html = renderToStaticMarkup(await PaginaDados());
    const secao = html.slice(html.indexOf('id="dd-fontes-titulo"'));
    const fontes = links(secao.slice(0, secao.indexOf("</ul>")));
    expect(fontes.length).toBeGreaterThan(0);
    for (const l of fontes) {
      expect(l.href).toMatch(/^\/acervo\/[a-z0-9-]+\/arquivo\/[0-9a-f-]{36}$/);
    }
  });
});
