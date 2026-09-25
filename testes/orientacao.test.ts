/**
 * Índices das páginas longas: cada atalho aponta para um título que existe.
 *
 * A prova de que o salto funciona no navegador — título visível abaixo do
 * cabeçalho fixo, entrada direta pelo hash, teclado — está em
 * `testes/a11y/orientacao.spec.ts`. Aqui fica o contrato de marcação.
 */
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import PaginaCampo from "../src/app/campo/page";
import PaginaPesquisa from "../src/app/pesquisa/page";
import { INDICE_DA_PESQUISA } from "../src/componentes/pesquisa/conteudoDaPesquisa";
import { REFERENCIAS_TERRITORIAIS } from "../src/dados/territorio/referencias";

function indice(html: string, rotulo: string) {
  const inicio = html.indexOf(`<nav aria-label="${rotulo}"`);
  expect(inicio, rotulo).toBeGreaterThanOrEqual(0);
  const nav = html.slice(inicio, html.indexOf("</nav>", inicio));
  return [...nav.matchAll(/<a href="#([^"]+)"[^>]*>([^<]+)<\/a>/g)].map(
    ([, alvo = "", texto = ""]) => ({ alvo, texto }),
  );
}

describe("Pesquisa", () => {
  test("o índice leva a títulos reais de seção, na ordem da página", async () => {
    const html = renderToStaticMarkup(await PaginaPesquisa());
    const itens = indice(html, "Partes da pesquisa");
    expect(itens.map((i) => i.alvo)).toEqual(
      INDICE_DA_PESQUISA.map((i) => i.alvo),
    );
    const posicoes = itens.map((i) => {
      const alvo = html.indexOf(`<h2 id="${i.alvo}"`);
      expect(alvo, i.alvo).toBeGreaterThan(
        html.indexOf('aria-label="Partes da pesquisa"'),
      );
      return alvo;
    });
    expect([...posicoes].sort((a, b) => a - b)).toEqual(posicoes);
    expect(itens.map((i) => i.texto)).toContain("Entrevistas");
  });
});

describe("Diário de Campo", () => {
  test("o índice traz os quatro lugares, com o nome público e o id da seção", async () => {
    const html = renderToStaticMarkup(await PaginaCampo());
    const itens = indice(html, "Lugares nesta página");
    expect(itens).toEqual(
      REFERENCIAS_TERRITORIAIS.map((r) => ({
        alvo: `campo-${r.id}-titulo`,
        texto: r.nome,
      })),
    );
    for (const { alvo } of itens) expect(html).toContain(`<h2 id="${alvo}"`);
  });
});
