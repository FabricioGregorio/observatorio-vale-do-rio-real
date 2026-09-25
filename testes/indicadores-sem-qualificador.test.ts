/**
 * Os indicadores se apresentam como indicadores.
 *
 * A camada principal mostra o resultado; metodologia, fontes, limites e
 * documentos ficam nas camadas de aprofundamento. Um qualificador de
 * validação colado ao nome ("indicadores auditados") repetia essa prova em
 * cada bloco e saiu em 2026-09-25. O guarda é sobre a saída pública — texto
 * renderizado e metadados —, não sobre comentário de código.
 */
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import PaginaDados, { metadata as metadadosDados } from "../src/app/dados/page";
import PaginaObservatorio, {
  metadata as metadadosObservatorio,
} from "../src/app/observatorio/page";
import PaginaPesquisa, {
  metadata as metadadosPesquisa,
} from "../src/app/pesquisa/page";

const QUALIFICADOR =
  /indicadores?\s+(auditad|verificad|conferid|validad|certificad)/i;

describe("indicadores sem selo de validação na saída pública", () => {
  test.each([
    ["/dados", async () => renderToStaticMarkup(await PaginaDados())],
    ["/pesquisa", async () => renderToStaticMarkup(await PaginaPesquisa())],
    [
      "/observatorio",
      async () => renderToStaticMarkup(createElement(PaginaObservatorio)),
    ],
  ])("%s", async (_rota, renderizar) => {
    expect(await renderizar()).not.toMatch(QUALIFICADOR);
  });

  test("metadados", () => {
    for (const metadados of [
      metadadosDados,
      metadadosPesquisa,
      metadadosObservatorio,
    ])
      expect(JSON.stringify(metadados)).not.toMatch(QUALIFICADOR);
  });
});
