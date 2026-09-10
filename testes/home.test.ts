/**
 * Testes da Home estrutural (Tarefa 10A).
 *
 * Verificam o que dá para verificar sem renderizar: o conjunto de destinos, a
 * existência real das rotas e a proibição de descrever seção sem conteúdo.
 * O comportamento renderizado é coberto em `testes/a11y/home.spec.ts`.
 */
import { existsSync, readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { CAMINHOS_PRIORITARIOS } from "../src/componentes/home/caminhos";
import { MENU_PRINCIPAL, MENU_RODAPE } from "../src/lib/navegacao";

const rotulosDoSite = new Map<string, string>(
  [...MENU_PRINCIPAL, ...MENU_RODAPE].map((item) => [item.href, item.rotulo]),
);

describe("caminhos prioritários da Home", () => {
  test("todo destino é uma rota que existe no app", () => {
    for (const caminho of CAMINHOS_PRIORITARIOS) {
      expect(
        existsSync(`src/app${caminho.href}/page.tsx`),
        `rota inexistente: ${caminho.href}`,
      ).toBe(true);
    }
  });

  test("os caminhos exigidos pela Tarefa 10 estão presentes", () => {
    const destinos = CAMINHOS_PRIORITARIOS.map((caminho) => caminho.href);
    expect(destinos).toContain("/prestacao-de-contas");
    expect(destinos).toContain("/pesquisa");
    expect(destinos).toContain("/podobservar");
  });

  test("a Prestação de Contas vem primeiro: é a ação principal", () => {
    expect(CAMINHOS_PRIORITARIOS[0]?.href).toBe("/prestacao-de-contas");
  });

  test("nenhum destino aparece duas vezes", () => {
    const destinos = CAMINHOS_PRIORITARIOS.map((caminho) => caminho.href);
    expect(new Set(destinos).size).toBe(destinos.length);
  });

  test("o rótulo é o mesmo que o site usa no menu", () => {
    for (const caminho of CAMINHOS_PRIORITARIOS) {
      expect(rotulosDoSite.get(caminho.href)).toBe(caminho.rotulo);
    }
  });

  /**
   * A regra de integridade da fatia: destino sem conteúdo publicado declara o
   * estado e não recebe descrição. Descrever uma seção vazia como se ela já
   * entregasse algo é conteúdo inventado.
   */
  test("destino em preparação não tem descrição", () => {
    for (const caminho of CAMINHOS_PRIORITARIOS) {
      if (caminho.estado === "em-preparacao") {
        expect(caminho.descricao).toBeNull();
      } else {
        expect(caminho.descricao).not.toBeNull();
      }
    }
  });
});
/**
 * A Home e o laboratório compartilham a implementação da seção, e é justamente
 * por isso que a fiação precisa de guarda. Importar o componente do protótipo
 * direto na Home devolveria os rótulos "Preset" e "somente DEV" ao conteúdo
 * público sem quebrar tipo, lint ou build — o erro passaria silencioso.
 */
describe("fiação da seção Pesquisa em Campo", () => {
  const home = readFileSync("src/app/page.tsx", "utf8");
  const entrada = readFileSync(
    "src/componentes/pesquisa/PesquisaEmCampo.tsx",
    "utf8",
  );

  test("a Home usa a entrada pública, nunca o componente de laboratório", () => {
    expect(home).toContain(
      'import { PesquisaEmCampo } from "../componentes/pesquisa/PesquisaEmCampo"',
    );
    expect(home).toContain("<PesquisaEmCampo />");
    expect(home).not.toContain("PesquisaEmCampoPrototipo");
  });

  test("a entrada pública fixa a composição A e o contexto da Home", () => {
    expect(entrada).toContain('composicao="documental-aberto"');
    expect(entrada).toContain('contexto="home"');
    expect(entrada).not.toContain("caderno-tecnico");
  });
});
