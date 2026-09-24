/**
 * Semântica de A09 e A10 no acervo publicado.
 *
 * O inventário chamava os dois de "Formulário modelo", mas os objetos
 * efetivamente preservados e publicados são **planilhas de respostas**.
 * Publicar um formulário em branco no lugar das respostas descreveria o
 * acervo errado — e a correção foi editorial, não cosmética.
 *
 * Até 2026-09-24 a asserção era sobre a constante de um script que aplicava a
 * correção no banco. O script saiu com o banco, e a afirmação passou a ser
 * verificada onde ela agora vive: no snapshot versionado, que é o que o
 * público lê.
 */
import { describe, expect, it } from "vitest";

import { lerAcervoPublicado } from "../src/dados/publicado/leitura";

const SLUGS = [
  "formulario-rotina-de-funcionamento",
  "formulario-publico-consumidor",
] as const;

describe("semântica de A09 e A10", () => {
  it("descreve planilhas de respostas sem chamá-las de formulário modelo", () => {
    const acervo = lerAcervoPublicado();

    for (const slug of SLUGS) {
      const arquivos = acervo.filter((anexo) => anexo.slug === slug);
      expect(arquivos.length, slug).toBeGreaterThan(0);

      for (const arquivo of arquivos) {
        expect(arquivo.titulo.toLowerCase(), slug).toContain("respostas");
        expect(arquivo.titulo.toLowerCase(), slug).not.toContain("modelo");
        expect(arquivo.resumo?.length ?? 0, slug).toBeGreaterThan(40);
      }
    }
  });
});
