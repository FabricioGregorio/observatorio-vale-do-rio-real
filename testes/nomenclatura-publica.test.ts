/**
 * Guarda de nomenclatura — "Sala do Avaliador" não volta.
 *
 * Decisão humana de 2026-09-21: o produto tinha um nome só, **Prestação de
 * contas**. "Sala do Avaliador" era o nome de projeto da mesma página — nunca
 * houve rota, componente ou dado separado —, mas ele vazava para quatro
 * superfícies públicas: o `<title>` (e o `og:title` e o `twitter:title`
 * derivados dele), um `aria-label`, o primeiro link da 404 e o texto do error
 * boundary.
 *
 * A página deixou de existir em 2026-09-23, quando a consulta documental foi
 * centralizada no Acervo. A guarda continua: o termo pode voltar num texto
 * novo, e o que ela protege é a regra de um nome só por produto.
 *
 * Esta varredura é estática e roda em `pnpm teste`, antes do build. A
 * contrapartida sobre o HTML realmente servido está em
 * `testes/a11y/voz-publica.spec.ts`, via `NOMENCLATURA_APOSENTADA`. As duas
 * são necessárias e nenhuma substitui a outra: o error boundary não é
 * alcançável numa varredura e2e normal, e um texto novo escrito em código
 * ainda não renderizado não aparece no HTML de hoje.
 *
 * O que fica de fora, e por quê:
 *
 * - `db/migrations/` — migração aplicada é histórico imutável.
 * - `docs/` — o que restou ali é evidência datada: auditorias de fonte,
 *   reconciliação de integridade, revisão de privacidade e o registro do
 *   consentimento fotográfico. Reescrever um documento de evidência para
 *   ajustar vocabulário falsificaria o registro.
 * - `node_modules/`, `.next/`, `test-results/` — não são fonte.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

/** Superfícies onde o termo é erro, não registro histórico. */
const RAIZES_ATIVAS = [
  "src",
  "scripts",
  "testes",
  "package.json",
  ".env.example",
];

const IGNORADOS = new Set([
  "node_modules",
  ".next",
  ".git",
  "test-results",
  "migrations",
]);

const TERMO = /sala\s+do\s+avaliador|saladoavaliador|sala-do-avaliador/i;

function arquivosDe(caminho: string): string[] {
  if (!statSync(caminho).isDirectory()) return [caminho];
  return readdirSync(caminho).flatMap((entrada) =>
    IGNORADOS.has(entrada) ? [] : arquivosDe(join(caminho, entrada)),
  );
}

describe("nomenclatura aposentada", () => {
  test("nenhuma superfície ativa diz 'Sala do Avaliador'", () => {
    const achados = RAIZES_ATIVAS.flatMap(arquivosDe)
      /*
        Duas exceções, e só estas duas: o arquivo desta guarda e o da lista de
        rotas, que precisam citar o termo para poder proibi-lo. Sem elas a
        regra não teria como ser escrita.
      */
      .filter(
        (arquivo) =>
          !/(nomenclatura-publica\.test\.ts|a11y[\\/]rotas\.ts)$/.test(arquivo),
      )
      .flatMap((arquivo) => {
        const conteudo = readFileSync(arquivo, "utf8");
        return conteudo
          .split("\n")
          .map((linha, i) => ({ arquivo, linha: i + 1, texto: linha }))
          .filter(({ texto }) => TERMO.test(texto));
      })
      .map(
        ({ arquivo, linha, texto }) => `${arquivo}:${linha} ${texto.trim()}`,
      );

    expect(achados).toEqual([]);
  });
});
