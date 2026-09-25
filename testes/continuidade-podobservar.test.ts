/**
 * Continuidade do caderno de escuta: anterior e próximo só entre episódios
 * publicados, uma porta para começar do primeiro, um salto para a
 * transcrição, e "Neste episódio" só com relação declarada.
 */
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import PaginaEpisodio from "../src/app/podobservar/[temporada]/[episodio]/page";
import { CadernoDeEscuta } from "../src/componentes/podobservar/CadernoDeEscuta";
import {
  RELACOES_DOS_EPISODIOS,
  vizinhosNaTemporada,
} from "../src/dados/editorial/relacoes";
import { listarEpisodiosPublicos } from "../src/dados/publicado/podobservar";

const episodios = await listarEpisodiosPublicos();

async function pagina(slug: string) {
  return renderToStaticMarkup(
    await PaginaEpisodio({
      params: Promise.resolve({ temporada: "t1", episodio: slug }),
    }),
  );
}

function sequencia(html: string) {
  const inicio = html.indexOf('aria-label="Episódios da temporada"');
  if (inicio < 0) return { anterior: null, proximo: null };
  const nav = html.slice(inicio, html.indexOf("</nav>", inicio));
  const destino = (rotulo: string) =>
    new RegExp(`${rotulo}</p><a[^>]*href="([^"]+)"`).exec(nav)?.[1] ?? null;
  return {
    anterior: destino("Episódio anterior"),
    proximo: destino("Próximo episódio"),
  };
}

const slugDe = (numero: number) =>
  episodios.find((e) => e.numero === numero)?.slug;
const href = (numero: number) => `/podobservar/t1/${slugDe(numero)}`;

describe("anterior e próximo", () => {
  test("são quatro episódios publicados na temporada 1", () => {
    expect(episodios.map((e) => e.numero).sort()).toEqual([1, 2, 3, 4]);
  });

  test.each([
    [1, null, 2],
    [2, 1, 3],
    [3, 2, 4],
    [4, 3, null],
  ])("EP0%i: anterior %s, próximo %s", async (numero, anterior, proximo) => {
    const html = await pagina(slugDe(numero) ?? "");
    expect(sequencia(html)).toEqual({
      anterior: anterior === null ? null : href(anterior),
      proximo: proximo === null ? null : href(proximo),
    });
  });

  test("episódio fora da lista publicada nunca é vizinho", () => {
    const [primeiro, segundo] = [...episodios].sort(
      (a, b) => a.numero - b.numero,
    );
    if (!primeiro || !segundo) throw new Error("temporada vazia");
    // Sem o EP02 publicado, o próximo do EP01 é o EP03 — nunca um rascunho.
    const semSegundo = episodios.filter((e) => e.slug !== segundo.slug);
    expect(vizinhosNaTemporada(semSegundo, primeiro).proximo?.numero).toBe(3);
  });
});

describe("portas de entrada", () => {
  test('"Começar pelo episódio 1" leva ao EP01, sem mudar a ordem da lista', () => {
    const html = renderToStaticMarkup(
      createElement(CadernoDeEscuta, { episodios }),
    );
    expect(html).toMatch(
      new RegExp(`href="${href(1)}"[^>]*>Começar pelo episódio 1`),
    );
    // A entrada em destaque continua sendo a mais recente.
    const numeros = [...html.matchAll(/id="titulo-([^"]+)"/g)].map(
      ([, slug]) => episodios.find((e) => e.slug === slug)?.numero,
    );
    expect(numeros).toEqual([4, 3, 2, 1]);
  });

  test('"Ir para a transcrição" aponta ao título real da transcrição', async () => {
    for (const episodio of episodios) {
      const html = await pagina(episodio.slug);
      expect(html).toMatch(
        /href="#pod-transcricao-titulo"[^>]*>Ir para a transcrição/,
      );
      const alvo = html.indexOf('id="pod-transcricao-titulo"');
      expect(alvo).toBeGreaterThan(0);
      expect(html.indexOf('class="pod-transcricao', alvo)).toBeGreaterThan(
        alvo,
      );
    }
  });
});

describe("Neste episódio", () => {
  test("mostra exatamente as relações declaradas, e nada sem elas", async () => {
    for (const episodio of episodios) {
      const html = await pagina(episodio.slug);
      const declaradas = RELACOES_DOS_EPISODIOS[episodio.slug] ?? [];
      const bloco = html.indexOf('id="pod-relacoes-titulo"');
      if (declaradas.length === 0) {
        expect(bloco, episodio.slug).toBe(-1);
        continue;
      }
      const secao = html.slice(bloco, html.indexOf("</section>", bloco));
      expect(secao.match(/<li>/g), episodio.slug).toHaveLength(
        declaradas.length,
      );
      expect(secao).not.toContain("https://");
    }
  });
});
