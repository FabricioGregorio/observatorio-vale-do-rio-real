import { expect, test } from "@playwright/test";

import { classificarDestino } from "../../src/lib/destino-de-link";
import { ENDERECOS_PUBLICOS } from "./rotas";

/**
 * Política de nova guia, verificada em toda superfície pública.
 *
 * Não há lista de links aqui. Cada `<a href>` renderizado — cabeçalho, rodapé,
 * cards, tabelas, fichas, mapas, CTAs, o que vier do banco — é classificado
 * pela mesma função que a interface usa (`classificarDestino`), e a página
 * precisa se comportar como a classificação diz:
 *
 * - documento ou site externo: `target="_blank"`, `rel` com `noopener` e
 *   `noreferrer`, e um aviso ligado por `aria-describedby`;
 * - rota do Observatório: sem `target`, na mesma guia.
 *
 * Um link novo, escrito à mão e esquecido, quebra aqui sem que ninguém precise
 * lembrar de acrescentá-lo a uma lista.
 */

/**
 * As rotas dinâmicas entram por amostra: um documento do Acervo, a ficha de
 * um arquivo (onde mora o link direto para o binário) e um episódio. Os links
 * de rota para OpenStreetMap e Google Maps estão nas fichas de `/territorio`.
 */
const SUPERFICIES = [
  ...ENDERECOS_PUBLICOS,
  "/acervo/fotografias-visitas-i-vii",
  "/acervo/fotografias-visitas-i-vii/arquivo/d0af646c-e6b0-423d-9edc-d5ffc74b246a",
  "/podobservar/t1/01-o-que-e-o-vale-do-rio-real",
];

for (const rota of SUPERFICIES) {
  test(`${rota} segue a política de nova guia`, async ({ page }) => {
    await page.goto(rota);
    const links = await page.locator("a[href]").evaluateAll((elementos) =>
      elementos.map((a) => {
        const aviso = a.getAttribute("aria-describedby");
        return {
          href: a.getAttribute("href") ?? "",
          target: a.getAttribute("target"),
          rel: a.getAttribute("rel") ?? "",
          aviso:
            aviso === null
              ? null
              : (document.getElementById(aviso)?.textContent ?? "").trim(),
        };
      }),
    );
    expect(links.length, rota).toBeGreaterThan(0);

    const defeitos = links.flatMap(({ href, target, rel, aviso }) => {
      const destino = classificarDestino(href);
      if (destino === "interno") {
        return target === null ? [] : [`interno com target: ${href}`];
      }
      const erros: string[] = [];
      if (target !== "_blank") erros.push(`${destino} sem nova guia: ${href}`);
      if (!rel.includes("noopener") || !rel.includes("noreferrer")) {
        erros.push(`${destino} sem rel seguro: ${href}`);
      }
      if (aviso !== "Abre em nova guia.") {
        erros.push(`${destino} sem aviso de nova guia: ${href}`);
      }
      return erros;
    });
    expect(defeitos, rota).toEqual([]);
  });
}
