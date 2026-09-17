import { describe, expect, test } from "vitest";
import sitemap from "../src/app/sitemap";
import { databaseUrlDisponivel } from "../src/dados/consultas/anexos";
import { regrasDeRobots } from "../src/lib/indexacao";
import { metadadosDaRota, obterSiteUrl, urlDoSite } from "../src/lib/site-url";

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

  test("sitemap contém as treze páginas públicas canônicas", () => {
    const urls = sitemap().map((item) => item.url);

    expect(urls).toHaveLength(13);
    expect(urls).toContain("https://observatoriotobiassoueu.com.br/");
    expect(urls).toContain("https://observatoriotobiassoueu.com.br/territorio");
    expect(urls).toContain("https://observatoriotobiassoueu.com.br/acervo");
    expect(urls).not.toContain(
      "https://observatoriotobiassoueu.com.br/educacao",
    );
    expect(urls).not.toContain(
      "https://observatoriotobiassoueu.com.br/dev/estilos",
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
