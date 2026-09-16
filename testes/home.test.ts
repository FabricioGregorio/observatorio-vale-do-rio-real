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
  test("o menu segue os sete itens e a ordem aprovados", () => {
    expect(MENU_PRINCIPAL).toEqual([
      { href: "/observatorio", rotulo: "O Observatório" },
      { href: "/pesquisa", rotulo: "A Pesquisa" },
      { href: "/territorio", rotulo: "Território" },
      { href: "/dados", rotulo: "Dados" },
      { href: "/campo", rotulo: "Diário de Campo" },
      { href: "/podobservar", rotulo: "PodObservar" },
      { href: "/acervo", rotulo: "Acervo" },
    ]);
  });

  test("todo item do menu principal tem uma rota real", () => {
    for (const item of MENU_PRINCIPAL) {
      expect(existsSync(`src/app${item.href}/page.tsx`), item.href).toBe(true);
    }
  });

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
 * Fiação da Home pública — promoção da Home v2 (decisão humana de 2026-09-16).
 *
 * Até aqui esta seção guardava o contrário: que `/` montasse as entradas
 * públicas das seções H0–H4.1 e nunca os componentes de laboratório. A Home v2
 * substituiu aquela composição, e o risco mudou de lugar sem mudar de
 * natureza. O que precisa de guarda agora é a promessa que a decisão fez:
 *
 * - `/` reutiliza a implementação aprovada, em vez de uma cópia — duas Homes
 *   divergentes é exatamente o que a convergência veio encerrar;
 * - nada de laboratório atravessa para o conteúdo público. O aviso de
 *   experimento e o seletor de abertura não quebram tipo, lint nem build se
 *   vazarem: só um teste os pega.
 */
describe("fiação da Home pública", () => {
  const home = readFileSync("src/app/page.tsx", "utf8");
  const componente = readFileSync(
    "src/componentes/prototipo/homelivre/HomeLivre.tsx",
    "utf8",
  );

  test("a Home reutiliza a implementação da v2, sem cópia", () => {
    expect(home).toContain(
      'import { HomeLivre } from "../componentes/prototipo/homelivre/HomeLivre"',
    );
    expect(home).toContain("<HomeLivre");
  });

  test("a rota pública declara o contexto público e a abertura aprovada", () => {
    expect(home).toContain('contexto="publico"');
    expect(home).toContain('abertura="b2"');
  });

  /**
   * A Home antiga continua versionada como baseline de rollback. O que não
   * pode voltar é ela disputar `/` com a v2 — e isso se detecta no import.
   */
  test("a rota pública não remonta a composição da Home antiga", () => {
    for (const antigo of [
      "HeroManifesto",
      "SecaoMapa",
      "PesquisaEmCampo",
      "SecaoDados",
      "CaminhosPrioritarios",
      "ChamadaAcervo",
      "CabecalhoPrototipo",
    ]) {
      expect(home, antigo).not.toContain(antigo);
    }
  });

  test("a rota pública não lê variante de abertura", () => {
    expect(home).not.toContain("searchParams");
    expect(home).not.toContain("lerVarianteDaAbertura");
  });

  /**
   * O aviso e o seletor existem para o laboratório. Se deixarem de depender do
   * contexto, passam a ser servidos em `/` sem que nada mais reclame.
   */
  test("aviso de experimento e seletor de abertura dependem do contexto", () => {
    const trecho = componente.slice(componente.indexOf("data-contexto"));
    const aviso = trecho.indexOf("hl-dev");
    const seletor = trecho.indexOf("SeletorDeAbertura ativa");
    const guarda = trecho.indexOf('contexto === "dev"');

    for (const posicao of [aviso, seletor, guarda])
      expect(posicao).toBeGreaterThan(-1);
    expect(guarda).toBeLessThan(aviso);
    expect(guarda).toBeLessThan(seletor);
  });
});

/**
 * As entradas públicas das seções H0–H4.1 continuam versionadas e servindo os
 * laboratórios. A fixação de composição e contexto segue valendo: elas não
 * podem regredir para a casca de protótipo enquanto existirem.
 */
describe("entradas públicas preservadas da Home antiga", () => {
  test("Pesquisa em Campo fixa a composição A e o contexto da Home", () => {
    const entrada = readFileSync(
      "src/componentes/pesquisa/PesquisaEmCampo.tsx",
      "utf8",
    );
    expect(entrada).toContain('composicao="documental-aberto"');
    expect(entrada).toContain('contexto="home"');
    expect(entrada).not.toContain("caderno-tecnico");
  });

  test("a seção de Dados fixa o contexto da Home", () => {
    const entrada = readFileSync(
      "src/componentes/dados/SecaoDados.tsx",
      "utf8",
    );
    expect(entrada).toContain('contexto="home"');
  });
});

/**
 * A barra superior da Home v2 serve os dois lugares. No público ela precisa
 * usar a navegação canônica de sete itens; no laboratório, a demonstração
 * histórica da H1. Uma troca silenciosa aqui republicaria o menu de seis itens
 * com dois destinos mortos.
 */
describe("navegação da Home v2", () => {
  const secoes = readFileSync(
    "src/componentes/prototipo/homelivre/Secoes.tsx",
    "utf8",
  );

  test("o topo escolhe o menu oficial quando o contexto é público", () => {
    expect(secoes).toContain(
      "const itens = publico ? MENU_PRINCIPAL : ITENS_COM_DESTINO;",
    );
  });

  test("o topo público carrega o identificador do cabeçalho da Home", () => {
    expect(secoes).toContain("ID_CABECALHO_HOME");
  });

  test("o menu de telas estreitas é servido só no contexto público", () => {
    expect(secoes).toContain('aria-label="Principal (telas estreitas)"');
    expect(secoes).toContain("<MenuMobile />");
  });
});
