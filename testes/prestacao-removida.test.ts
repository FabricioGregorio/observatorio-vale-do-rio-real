import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

import config from "../next.config";
import { ROTAS_PUBLICAS } from "../src/app/sitemap";

/**
 * A Prestação de Contas deixou de ser área pública — e não volta por acidente.
 *
 * ## O que este arquivo substituiu
 *
 * `testes/prestacao-de-contas.test.ts` travava os invariantes da página: o
 * agrupamento por natureza, as entregas derivadas e o limite do que a página
 * afirmava. A decisão humana de 2026-09-23 removeu a página e centralizou a
 * consulta documental no Acervo, e testar a composição de uma página que não
 * existe é manter um contrato sem contraparte.
 *
 * O que daquela suíte era integridade, e não composição, foi para onde a
 * afirmação passou a viver:
 *
 * - a guarda contra afirmação financeira e de aprovação em texto público está
 *   em `voz-editorial.test.ts`, que varre **toda** superfície pública em vez
 *   de só a página removida — é mais cobertura, não menos;
 * - a medida derivada da janela de coleta está em `indicadores.test.ts`,
 *   comparada contra a própria fonte;
 * - a correspondência entre o acervo servido e `/anexos.json` está em
 *   `a11y/prestacao-acervo.spec.ts`, agora apurada contra o Acervo.
 *
 * ## O que este arquivo trava
 *
 * Que os dois endereços antigos continuam respondendo com redirect
 * permanente, que eles não voltaram ao sitemap, e que nenhuma superfície
 * pública ativa voltou a oferecer a área. A contraparte sobre o HTTP real
 * está em `a11y/prestacao-redirecionada.spec.ts`: aqui é a regra declarada,
 * lá é a resposta servida.
 */

const RAIZ = join(import.meta.dirname, "..");

const ROTAS_APOSENTADAS = [
  "/prestacao-de-contas",
  "/prestacao-de-contas/imprimir",
] as const;

describe("as rotas antigas redirecionam para o Acervo", () => {
  test("as duas estão declaradas, permanentes e apontam para /acervo", async () => {
    const regras = (await config.redirects?.()) ?? [];
    for (const rota of ROTAS_APOSENTADAS) {
      const regra = regras.find((item) => item.source === rota);
      expect(regra, rota).toBeDefined();
      expect(regra?.destination, rota).toBe("/acervo");
      /*
        `permanent: true` é o que faz o Next emitir 308 — o 301 que preserva o
        método. Um redirect temporário pediria ao buscador que mantivesse os
        dois endereços, que é o oposto de centralizar.
      */
      expect(regra?.permanent, rota).toBe(true);
    }
  });

  test("nenhuma delas é anunciada como página indexável", () => {
    for (const rota of ROTAS_APOSENTADAS) {
      expect(ROTAS_PUBLICAS as readonly string[]).not.toContain(rota);
    }
    expect(ROTAS_PUBLICAS).toContain("/acervo");
  });
});

/**
 * Varredura de superfície ativa.
 *
 * O caminho antigo pode e deve continuar existindo em três lugares: a regra
 * de redirect, os testes que a conferem e o histórico imutável do projeto.
 * Em qualquer outro lugar ele é uma oferta pública de uma área que não
 * existe.
 */
const PERMITIDOS = new Set([
  "next.config.ts",
  "testes/prestacao-removida.test.ts",
  "testes/a11y/prestacao-redirecionada.spec.ts",
]);

const IGNORADOS = new Set([
  "node_modules",
  ".next",
  ".git",
  "test-results",
  "tmp",
  "migrations",
]);

/** Só a superfície que o visitante recebe: código de página e de componente. */
const SUPERFICIE = ["src/app", "src/componentes", "src/lib", "src/dados"];

function arquivosDe(caminho: string): string[] {
  const absoluto = join(RAIZ, caminho);
  if (!statSync(absoluto).isDirectory()) return [caminho];
  return readdirSync(absoluto).flatMap((entrada) =>
    IGNORADOS.has(entrada) ? [] : arquivosDe(`${caminho}/${entrada}`),
  );
}

/** O comentário é para quem lê o repositório; a busca é pelo que é servido. */
function semComentarios(fonte: string): string {
  return fonte
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .split("\n")
    .filter((linha) => !linha.trimStart().startsWith("*"))
    .filter((linha) => !linha.trimStart().startsWith("//"))
    .join("\n");
}

describe("nenhuma superfície pública oferece a área removida", () => {
  test("nenhum destino aponta para /prestacao-de-contas", () => {
    const achados = SUPERFICIE.flatMap(arquivosDe)
      .filter((arquivo) => /\.(ts|tsx|css)$/.test(arquivo))
      .filter((arquivo) => !PERMITIDOS.has(arquivo))
      .flatMap((arquivo) =>
        semComentarios(readFileSync(join(RAIZ, arquivo), "utf8"))
          .split("\n")
          .map((texto, i) => ({ arquivo, linha: i + 1, texto }))
          .filter(({ texto }) => /["'`]\/prestacao-de-contas/.test(texto)),
      )
      .map(
        ({ arquivo, linha, texto }) => `${arquivo}:${linha} ${texto.trim()}`,
      );

    expect(achados).toEqual([]);
  });

  /*
    A chave do pacote ZIP no storage continua sendo `prestacao-de-contas/…`:
    é endereço de objeto já publicado, e renomeá-lo quebraria o download de
    quem tem o link. Por isso a busca acima é por destino de navegação — uma
    string que **começa** com a barra —, e não pelo termo solto.
  */
  test("o rótulo não volta como nome de área, CTA ou destino", () => {
    const achados = SUPERFICIE.flatMap(arquivosDe)
      .filter((arquivo) => /\.(ts|tsx)$/.test(arquivo))
      .filter((arquivo) => !PERMITIDOS.has(arquivo))
      .flatMap((arquivo) =>
        semComentarios(readFileSync(join(RAIZ, arquivo), "utf8"))
          .split("\n")
          .map((texto, i) => ({ arquivo, linha: i + 1, texto }))
          .filter(({ texto }) =>
            /(Ver|Ir para a?)\s+Presta[çc][ãa]o|Presta[çc][ãa]o de [Cc]ontas\s*<\/|>\s*Presta[çc][ãa]o de [Cc]ontas/.test(
              texto,
            ),
          ),
      )
      .map(
        ({ arquivo, linha, texto }) => `${arquivo}:${linha} ${texto.trim()}`,
      );

    expect(achados).toEqual([]);
  });
});
