import { afterEach, describe, expect, test, vi } from "vitest";

import nextConfig from "../next.config";
import {
  ambienteIndexavel,
  CABECALHO_ROBOTS,
  DIRETIVA_NOINDEX,
  regrasDeRobots,
} from "../src/lib/indexacao";

const ORIGEM = new URL("https://observatoriotobiassoueu.com.br");

/** Cabeçalhos que a configuração do Next.js devolve para um `VERCEL_ENV`. */
async function cabecalhosCom(vercelEnv: string | undefined) {
  if (vercelEnv === undefined) vi.stubEnv("VERCEL_ENV", undefined);
  else vi.stubEnv("VERCEL_ENV", vercelEnv);

  return (await nextConfig.headers?.()) ?? [];
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("indexação por ambiente", () => {
  test("só o deployment de produção da Vercel é indexável", () => {
    expect(ambienteIndexavel("production")).toBe(true);
  });

  test.each(["preview", "development", "", "  ", "Production", undefined])(
    "%o não é indexável",
    (valor) => {
      expect(ambienteIndexavel(valor)).toBe(false);
    },
  );

  test("a diretiva declara noindex sem ambiguidade", () => {
    expect(DIRETIVA_NOINDEX).toMatch(/^noindex\b/);
    expect(DIRETIVA_NOINDEX).toContain("nofollow");
  });
});

describe("robots.txt fora da produção", () => {
  test("proíbe tudo e não anuncia sitemap nem host", () => {
    expect(regrasDeRobots(ORIGEM, false)).toEqual({
      rules: { userAgent: "*", disallow: "/" },
    });
  });

  test("produção continua anunciando o sitemap canônico", () => {
    const arquivo = regrasDeRobots(ORIGEM, true);

    expect(arquivo.host).toBe("https://observatoriotobiassoueu.com.br");
    expect(arquivo.sitemap).toBe(
      "https://observatoriotobiassoueu.com.br/sitemap.xml",
    );
    expect(arquivo.rules.allow).toBe("/");
  });
});

describe("X-Robots-Tag na homologação", () => {
  test("preview recebe noindex em toda rota", async () => {
    const cabecalhos = await cabecalhosCom("preview");

    expect(cabecalhos).toHaveLength(1);
    const [regra] = cabecalhos;
    // Padrão documentado do Next.js para "toda rota"; inclui a raiz.
    expect(regra?.source).toBe("/:caminho*");
    expect(regra?.headers).toEqual([
      { key: CABECALHO_ROBOTS, value: DIRETIVA_NOINDEX },
    ]);
  });

  test.each(["development", undefined])(
    "%o também recebe noindex, porque o gate é fail-closed",
    async (valor) => {
      const cabecalhos = await cabecalhosCom(valor);

      expect(cabecalhos).toHaveLength(1);
      expect(cabecalhos[0]?.headers[0]?.key).toBe(CABECALHO_ROBOTS);
    },
  );

  test("produção não recebe cabeçalho algum: o SEO fica intacto", async () => {
    expect(await cabecalhosCom("production")).toEqual([]);
  });
});
