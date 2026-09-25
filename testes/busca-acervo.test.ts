/**
 * Busca do Acervo — recuperação sobre o índice real, montado do snapshot.
 *
 * Nenhum resultado esperado está escrito no índice: os casos abaixo decorrem
 * das relações que o site já publica (entrevista → instituição e município,
 * lugar → materiais, fotografia → grupo) e do título dos arquivos. Se uma
 * dessas relações mudar, o teste diz qual busca deixou de funcionar.
 */
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { fraseDoResultado } from "../src/componentes/acervo/BuscaAcervo";
import {
  ARQUIVOS_EXIBIDOS,
  buscarNoAcervo,
  compactarIndice,
  expandirIndice,
  normalizarBusca,
  type ResultadoDaBusca,
} from "../src/componentes/acervo/busca";
import { montarIndiceDoAcervo } from "../src/componentes/acervo/indiceDeBusca";
import { ListaDocumentosPublicos } from "../src/componentes/acervo/ListaDocumentosPublicos";
import { ENTREVISTAS } from "../src/componentes/home/conteudo";
import { listarDocumentosPublicos } from "../src/dados/publicado/acervo";

const documentos = await listarDocumentosPublicos();
const indice = montarIndiceDoAcervo(documentos);

const slugs = (resultados: ResultadoDaBusca[]) =>
  resultados.map((r) => r.documento.slug);

function unico(resultados: ResultadoDaBusca[], slug: string) {
  const achados = resultados.filter((r) => r.documento.slug === slug);
  expect(achados, slug).toHaveLength(1);
  return achados[0] as ResultadoDaBusca;
}

describe("normalização", () => {
  test("ignora caixa e acento, sem mudar a grafia exibida", () => {
    expect(normalizarBusca("Oviêdo")).toBe("oviedo");
    expect(normalizarBusca("São Cristóvão")).toBe(
      normalizarBusca("sao cristovao"),
    );
    expect(normalizarBusca("  TRANSCRIÇÃO   da  Entrevista ")).toBe(
      "transcricao da entrevista",
    );
  });
});

describe("índice", () => {
  test("preserva 16 documentos e 107 arquivos, sem duplicar nenhum", () => {
    expect(indice).toHaveLength(16);
    const arquivos = indice.flatMap((d) => d.arquivos.map((a) => a.id));
    expect(arquivos).toHaveLength(107);
    expect(new Set(arquivos).size).toBe(107);
    for (const documento of indice)
      expect(documento.arquivos).toHaveLength(documento.quantidade);
  });

  test("a forma compacta que vai ao cliente devolve o mesmo índice", () => {
    const compacto = compactarIndice(indice);
    expect(expandirIndice(compacto)).toEqual(indice);
    // Cada termo de contexto é escrito uma vez só.
    expect(new Set(compacto.termos).size).toBe(compacto.termos.length);
    expect(JSON.stringify(compacto).length).toBeLessThan(
      JSON.stringify(indice).length,
    );
  });

  test("leva só o necessário para achar e apontar — nada de binário", () => {
    const serializado = JSON.stringify(indice);
    expect(serializado).not.toContain("https://");
    expect(serializado).not.toMatch(/[a-f0-9]{64}/);
    for (const arquivo of indice.flatMap((d) => d.arquivos))
      expect(Object.keys(arquivo).sort()).toEqual(["contexto", "id", "titulo"]);
  });
});

describe("casos de aceitação", () => {
  test('"serie mensal" acha o arquivo dentro do anexo de indicadores', () => {
    const resultados = buscarNoAcervo(indice, "serie mensal", "");
    expect(slugs(resultados)).toEqual(["anexo-indicadores-etapa-1"]);
    const { correspondencia } = unico(resultados, "anexo-indicadores-etapa-1");
    expect(correspondencia?.arquivos.map((a) => a.titulo)).toHaveLength(1);
    expect(
      normalizarBusca(correspondencia?.arquivos[0]?.titulo ?? ""),
    ).toContain("serie mensal");
  });

  test('"oviedo" acha Oviêdo sem o acento', () => {
    const resultados = buscarNoAcervo(indice, "oviedo", "");
    expect(slugs(resultados)).toContain("entrevista-oviedo-e-neide-abreu");
  });

  test('"Secretaria" acha as entrevistas das secretarias, sem o nome da pessoa', () => {
    const esperadas = ENTREVISTAS.filter((e) =>
      normalizarBusca(e.onde).includes("secretaria"),
    ).map((e) => e.documento);
    expect(esperadas.length).toBeGreaterThan(0);
    const achadas = slugs(buscarNoAcervo(indice, "Secretaria", ""));
    for (const slug of esperadas) expect(achadas).toContain(slug);
    // A entrevista de Tobias Barreto não diz "secretaria" no título: é a
    // relação institucional publicada que a traz.
    expect(achadas).toContain("entrevista-josenilson-bispo");
  });

  test('"Recanto" acha a entrevista ligada ao Recanto da Serra', () => {
    const achadas = slugs(buscarNoAcervo(indice, "Recanto", ""));
    expect(achadas).toContain("entrevista-pedro-menezes");
    expect(achadas).toContain("relatorio-tecnico-recanto-da-serra");
  });

  test('"sao cristovao" acha o que tem São Cristóvão como contexto real', () => {
    const achadas = slugs(buscarNoAcervo(indice, "sao cristovao", ""));
    for (const e of ENTREVISTAS.filter((x) => x.municipio === "São Cristóvão"))
      expect(achadas).toContain(e.documento);
    expect(achadas).not.toContain("relatorio-tecnico-recanto-da-serra");
  });

  test('"transcrição" aponta as transcrições dentro das entrevistas', () => {
    const resultados = buscarNoAcervo(indice, "transcrição", "");
    const entrevistas = resultados.filter((r) =>
      r.documento.slug.startsWith("entrevista-"),
    );
    expect(entrevistas).toHaveLength(8);
    for (const { correspondencia } of entrevistas) {
      expect(correspondencia?.arquivos).toHaveLength(1);
      expect(
        normalizarBusca(correspondencia?.arquivos[0]?.titulo ?? ""),
      ).toContain("transcricao");
    }
  });

  test("termo inexistente não encontra nada", () => {
    expect(buscarNoAcervo(indice, "xylofone inexistente", "")).toEqual([]);
  });

  test("sem consulta, tudo aparece e nada é apontado", () => {
    const resultados = buscarNoAcervo(indice, "   ", "");
    expect(resultados).toHaveLength(16);
    expect(resultados.every((r) => r.correspondencia === null)).toBe(true);
  });
});

describe("hierarquia documento → arquivo", () => {
  test("o acerto num arquivo devolve o documento pai uma vez só", () => {
    for (const busca of ["transcrição", "Recanto", "sao cristovao", "áudio"]) {
      const achadas = slugs(buscarNoAcervo(indice, busca, ""));
      expect(new Set(achadas).size, busca).toBe(achadas.length);
    }
  });

  test("todo arquivo apontado pertence ao documento em que aparece", () => {
    for (const { documento, correspondencia } of buscarNoAcervo(
      indice,
      "Recanto",
      "",
    )) {
      const ids = new Set(documento.arquivos.map((a) => a.id));
      for (const a of correspondencia?.arquivos ?? [])
        expect(ids.has(a.id)).toBe(true);
    }
  });

  test("muitos acertos num documento mostram os primeiros e contam o resto", () => {
    const fotos = unico(
      buscarNoAcervo(indice, "Recanto", ""),
      "fotografias-visitas-i-vii",
    );
    expect(fotos.correspondencia?.arquivos).toHaveLength(ARQUIVOS_EXIBIDOS);
    expect(fotos.correspondencia?.alemDosExibidos).toBeGreaterThan(0);
  });

  test("a lista mostra o arquivo dentro do card do documento, com as duas saídas", () => {
    const resultados = buscarNoAcervo(indice, "serie mensal", "");
    const html = renderToStaticMarkup(
      createElement(ListaDocumentosPublicos, {
        documentos: resultados.map((r) => r.documento),
        correspondencias: new Map(
          resultados.flatMap((r) =>
            r.correspondencia
              ? [[r.documento.slug, r.correspondencia] as const]
              : [],
          ),
        ),
      }),
    );
    const arquivo = resultados[0]?.correspondencia?.arquivos[0];
    expect(html.match(/<article /g)).toHaveLength(1);
    expect(html).toContain("Encontrado neste documento");
    expect(html).toContain(
      `href="/acervo/anexo-indicadores-etapa-1/arquivo/${arquivo?.id}"`,
    );
    expect(html).toContain('href="/acervo/anexo-indicadores-etapa-1"');
  });
});

describe("busca e filtro", () => {
  test("os dois critérios valem juntos", () => {
    const entrevistas = buscarNoAcervo(
      indice,
      "Recanto",
      "entrevista_transcricao",
    );
    expect(slugs(entrevistas)).toEqual(["entrevista-pedro-menezes"]);
  });

  test("um arquivo não faz aparecer documento de outro tipo", () => {
    // "serie mensal" só existe como arquivo do anexo de indicadores.
    expect(buscarNoAcervo(indice, "serie mensal", "relatorio_tecnico")).toEqual(
      [],
    );
  });
});

describe("frase de estado", () => {
  test("diz documentos, e só fala em arquivo quando o acerto veio de um", () => {
    expect(fraseDoResultado(1, 0)).toBe("1 documento encontrado");
    expect(fraseDoResultado(16, 0)).toBe("16 documentos encontrados");
    expect(fraseDoResultado(1, 1)).toBe(
      "1 documento encontrado, com 1 arquivo correspondente",
    );
    expect(fraseDoResultado(8, 8)).toBe(
      "8 documentos encontrados, com 8 arquivos correspondentes",
    );
  });
});
