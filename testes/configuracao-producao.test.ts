import { describe, expect, test, vi } from "vitest";
import sitemap, { ROTAS_PUBLICAS } from "../src/app/sitemap";
import { listarDocumentosPublicos } from "../src/dados/consultas/acervo";
import { databaseUrlDisponivel } from "../src/dados/consultas/anexos";
import { listarEpisodiosPublicos } from "../src/dados/consultas/podobservar";
import { regrasDeRobots } from "../src/lib/indexacao";
import { metadadosDaRota, obterSiteUrl, urlDoSite } from "../src/lib/site-url";

/*
  Até 2026-09-23 o teste do sitemap chamava `listarDocumentosPublicos()` e
  `listarEpisodiosPublicos()` de verdade — e, como `vitest.config.ts` carregava
  `.env.local`, "de verdade" significava abrir conexão com o banco remoto a
  cada `pnpm teste`. Isso tornava uma suíte unitária dependente de um serviço
  externo e de um estado que muda sem o código mudar.

  As duas consultas passam a vir de um conjunto declarado aqui. O objetivo do
  teste não muda: ele sempre verificou a **composição** do sitemap — rotas
  institucionais, mais um endereço por episódio, mais um por documento, mais um
  por arquivo —, e é isso que continua sendo verificado, agora sem rede.

  O conjunto abaixo é fixture de composição e nada mais. Ele não afirma quantos
  documentos ou episódios o acervo tem: esse número pertence a
  `validarAcervoPublico` e ao teste do snapshot real, que só existe quando o
  snapshot real existir. Por isso as asserções são de forma — `/podobservar/t1/…`
  construído a partir de `temporadaNumero` e `slug` — e não de conteúdo.
*/
const { DOCUMENTOS, EPISODIOS } = vi.hoisted(() => {
  const arquivo = (arquivoId: string, ordem: number) => ({
    arquivoId,
    codigo: String(ordem),
    estado: "PUBLICAVEL" as const,
    revisaoPrivacidade: "concluida" as const,
    derivadoDe: ["documento:fixture"],
    derivadoDeDocumento: null,
    arquivoOrigemId: null,
    arquivoRelacao: null,
    arquivoDerivacaoMetodo: null,
    ordemAnexo: ordem,
    slug: "documento-de-fixture",
    rotuloArquivo: null,
    principal: ordem === 1,
    titulo: "Documento de fixture",
    tipo: "relatorio_tecnico",
    resumo: null,
    dataReferencia: null,
    licenca: "CC BY-SA 4.0",
    linkPermanente: `https://arquivos.exemplo.test/fixture-${ordem}.pdf`,
    linkOrigem: null,
    mimeType: "application/pdf",
    bytes: 1024,
    sha256: "a".repeat(64),
    publicadoEm: new Date("2026-01-02T12:00:00.000Z"),
  });

  return {
    DOCUMENTOS: [
      {
        slug: "documento-de-fixture",
        titulo: "Documento de fixture",
        tipo: "relatorio_tecnico",
        resumo: null,
        licenca: "CC BY-SA 4.0",
        arquivos: [
          arquivo("11111111-1111-4111-8111-111111111111", 1),
          arquivo("22222222-2222-4222-8222-222222222222", 2),
        ],
      },
      {
        slug: "outro-documento-de-fixture",
        titulo: "Outro documento de fixture",
        tipo: "outro",
        resumo: null,
        licenca: "CC BY-SA 4.0",
        arquivos: [arquivo("33333333-3333-4333-8333-333333333333", 3)],
      },
    ],
    EPISODIOS: [
      {
        slug: "episodio-de-fixture",
        temporadaNumero: 1,
        temporadaTitulo: "Temporada de fixture",
        numero: 2,
        titulo: "Episódio de fixture",
        resumo: "Resumo.",
        publicadoEm: new Date("2026-01-03T15:00:00.000Z"),
        duracaoSeg: 600,
        transcricao: "Transcrição.",
        explicito: false,
        urlSpotify: "https://open.spotify.com/episode/fixture",
        urlYoutube: null,
        capaUrl: null,
        capaLarguraPx: null,
        capaAlturaPx: null,
      },
      {
        slug: "outro-episodio-de-fixture",
        temporadaNumero: 2,
        temporadaTitulo: "Segunda temporada de fixture",
        numero: 1,
        titulo: "Outro episódio de fixture",
        resumo: "Resumo.",
        publicadoEm: new Date("2026-01-01T15:00:00.000Z"),
        duracaoSeg: 600,
        transcricao: "Transcrição.",
        explicito: false,
        urlSpotify: "https://open.spotify.com/episode/outra-fixture",
        urlYoutube: null,
        capaUrl: null,
        capaLarguraPx: null,
        capaAlturaPx: null,
      },
    ],
  };
});

vi.mock("../src/dados/consultas/acervo", () => ({
  listarDocumentosPublicos: async () => DOCUMENTOS,
}));

vi.mock("../src/dados/consultas/podobservar", () => ({
  listarEpisodiosPublicos: async () => EPISODIOS,
}));

describe("configuração de produção", () => {
  test.each(["development", "test"])(
    "%s permite o estado local controlado sem DATABASE_URL",
    (ambiente) => {
      expect(databaseUrlDisponivel(ambiente, undefined)).toBe(false);
    },
  );

  test("produção falha explicitamente sem DATABASE_URL", () => {
    expect(() => databaseUrlDisponivel("production", undefined)).toThrow(
      /DATABASE_URL ausente/,
    );
  });

  test("produção permite a credencial read-only configurada", () => {
    expect(
      databaseUrlDisponivel("production", "postgres://somente-leitura"),
    ).toBe(true);
  });

  test("SITE_URL é obrigatória em produção e validada como origem HTTPS", () => {
    expect(() => obterSiteUrl("", "production")).toThrow(/SITE_URL ausente/);
    expect(() => obterSiteUrl("http://exemplo.test", "production")).toThrow(
      /HTTPS/,
    );
    expect(() =>
      obterSiteUrl("https://exemplo.test/caminho", "production"),
    ).toThrow(/origem canônica/);
  });

  test("canonical e Open Graph usam a mesma origem server-side", () => {
    const metadata = metadadosDaRota({
      pathname: "/dados",
      titulo: "Dados",
    });

    expect(metadata.alternates?.canonical?.toString()).toBe(
      "https://observatoriotobiassoueu.com.br/dados",
    );
    expect(metadata.openGraph?.url?.toString()).toBe(
      "https://observatoriotobiassoueu.com.br/dados",
    );
    expect(urlDoSite("/").origin).toBe(
      "https://observatoriotobiassoueu.com.br",
    );
  });

  test("sitemap compõe rotas institucionais, documentos, arquivos e episódios", async () => {
    const urls = (await sitemap()).map((item) => item.url);

    // O inventário canônico não gera páginas extras para derivados A02/A03.
    const [documentos, episodios] = await Promise.all([
      listarDocumentosPublicos(),
      listarEpisodiosPublicos(),
    ]);
    expect(urls).toHaveLength(
      ROTAS_PUBLICAS.length +
        episodios.length +
        documentos.length +
        documentos.reduce(
          (total, documento) => total + documento.arquivos.length,
          0,
        ),
    );

    for (const pathname of ROTAS_PUBLICAS) {
      expect(urls).toContain(urlDoSite(pathname).href);
    }

    /*
      A rota do episódio é montada a partir de `temporadaNumero` e `slug`, e é
      essa montagem que o teste verifica: um episódio da temporada 2 precisa
      aparecer em `/podobservar/t2/…`, nunca em `/podobservar/t1/…`.
    */
    for (const episodio of episodios) {
      expect(urls).toContain(
        urlDoSite(`/podobservar/t${episodio.temporadaNumero}/${episodio.slug}`)
          .href,
      );
    }

    for (const documento of documentos) {
      expect(urls).toContain(urlDoSite(`/acervo/${documento.slug}`).href);
      for (const arquivo of documento.arquivos) {
        expect(urls).toContain(
          urlDoSite(`/acervo/${documento.slug}/arquivo/${arquivo.arquivoId}`)
            .href,
        );
      }
    }

    // O destino de escuta nunca vira endereço anunciado do site.
    expect(urls.some((url) => url.includes("open.spotify.com"))).toBe(false);

    expect(urls).not.toContain(
      "https://observatoriotobiassoueu.com.br/acessibilidade",
    );
    expect(urls).not.toContain(
      "https://observatoriotobiassoueu.com.br/educacao",
    );
    expect(urls).not.toContain(
      "https://observatoriotobiassoueu.com.br/imprensa",
    );
    expect(urls).not.toContain(
      "https://observatoriotobiassoueu.com.br/dev/estilos",
    );
    expect(urls).not.toContain(
      "https://observatoriotobiassoueu.com.br/prestacao-de-contas",
    );
    expect(
      urls.every((url) =>
        url.startsWith("https://observatoriotobiassoueu.com.br/"),
      ),
    ).toBe(true);
  });

  test("robots referencia o sitemap canônico e exclui a área dev", () => {
    const arquivo = regrasDeRobots(obterSiteUrl(), true);

    expect(arquivo.host).toBe("https://observatoriotobiassoueu.com.br");
    expect(arquivo.sitemap).toBe(
      "https://observatoriotobiassoueu.com.br/sitemap.xml",
    );
    expect(arquivo.rules).toEqual({
      userAgent: "*",
      allow: "/",
      disallow: "/dev/",
    });
  });
});
