/**
 * Home do Observatório — o que dá para verificar sem renderizar.
 *
 * O comportamento renderizado é coberto em `testes/a11y/home.spec.ts`. Aqui
 * ficam três contratos que nenhum tipo, lint ou build pega:
 *
 * 1. a navegação do site e as rotas que ela promete;
 * 2. a fiação de `/` — uma Home só, sem casca de laboratório sobrando;
 * 3. os limites de conteúdo: nada de título, duração ou link sugeridos onde o
 *    material real ainda não existe.
 */
import { existsSync, readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { ENTREVISTAS } from "../src/componentes/home/conteudo";
import { MENU_PRINCIPAL } from "../src/lib/navegacao";

describe("navegação do site", () => {
  test("o menu segue os sete itens e a ordem aprovados", () => {
    expect(MENU_PRINCIPAL).toEqual([
      { href: "/observatorio", rotulo: "O Observatório" },
      { href: "/podobservar", rotulo: "PodObservar" },
      { href: "/pesquisa", rotulo: "A Pesquisa" },
      { href: "/territorio", rotulo: "Território" },
      { href: "/dados", rotulo: "Dados" },
      { href: "/campo", rotulo: "Diário de Campo" },
      { href: "/acervo", rotulo: "Acervo" },
    ]);
  });

  test("todo item do menu principal tem uma rota real", () => {
    for (const item of MENU_PRINCIPAL) {
      expect(existsSync(`src/app${item.href}/page.tsx`), item.href).toBe(true);
    }
  });
});

/**
 * Consolidação de 2026-09-17: a Home passou a ser a implementação oficial e
 * única. O que precisa de guarda é o que um tipo não pega — que `/` não volte
 * a disputar composição com uma segunda Home, e que nenhum instrumento de
 * laboratório reapareça no conteúdo público.
 */
describe("fiação da Home pública", () => {
  const home = readFileSync("src/app/page.tsx", "utf8");

  test("a rota serve a composição oficial de `componentes/home`", () => {
    expect(home).toContain('from "../componentes/home/Home"');
    expect(home).toContain("<ComposicaoDaHome");
  });

  test("a rota não remonta a composição da Home antiga", () => {
    for (const antigo of [
      "HeroManifesto",
      "SecaoMapa",
      "PesquisaEmCampo",
      "SecaoDados",
      "CaminhosPrioritarios",
      "ChamadaAcervo",
      "AberturaObservatorio",
      "CabecalhoPrototipo",
    ]) {
      expect(home, antigo).not.toContain(antigo);
    }
  });

  test("a rota não lê variante de abertura nem contexto", () => {
    expect(home).not.toContain("searchParams");
    expect(home).not.toContain("lerVarianteDaAbertura");
    expect(home).not.toContain("contexto");
  });

  /** A Home antiga e o harness `/dev/home-livre` não voltam pela porta dos fundos. */
  test("não existe segunda Home nem rota de laboratório dela", () => {
    for (const caminho of [
      "src/app/dev/home-livre/page.tsx",
      "src/componentes/prototipo/homelivre",
      "src/componentes/home/caminhos.ts",
      "src/componentes/home/SecaoMapa.tsx",
      "src/componentes/dados/SecaoDados.tsx",
      "src/componentes/pesquisa/PesquisaEmCampo.tsx",
    ]) {
      expect(existsSync(caminho), caminho).toBe(false);
    }
  });
});

/**
 * A barra superior é do layout raiz e serve todas as rotas. Os sete destinos
 * continuam presentes, mas dois vivem no painel de Conteúdos, para separar
 * navegação principal de acervo editorial. O PodObservar saiu do painel e é
 * item de primeiro nível desde 2026-09-21.
 */
describe("cabeçalho do site", () => {
  const cabecalho = readFileSync(
    "src/componentes/layout/Cabecalho.tsx",
    "utf8",
  );

  test("usa a navegação hierarquizada e o identificador do cabeçalho", () => {
    expect(cabecalho).toContain("<NavegacaoPrincipal />");
    expect(cabecalho).toContain("ID_CABECALHO_HOME");
  });

  test("serve o menu de telas estreitas", () => {
    expect(cabecalho).toContain('aria-label="Principal (telas estreitas)"');
    expect(cabecalho).toContain('<MenuMobile classeResponsiva="" />');
  });

  /**
   * Acessibilidade e Prestação de contas são a mesma utilidade e precisam da
   * mesma altura; a hierarquia entre elas fica por cor, borda e fundo. A
   * regra que garante isso é uma só, e as duas classes vivem nela.
   */
  test("as duas utilidades compartilham uma altura só", () => {
    const css = readFileSync(
      "src/componentes/layout/estilosCabecalho.ts",
      "utf8",
    );
    const regra = css
      .split("\n")
      .find(
        (linha) =>
          linha.includes(".hl-topo__acessibilidade,") &&
          linha.includes(".hl-topo__prestacao{"),
      );
    expect(regra).toBeDefined();
    expect(regra).toContain("min-height:var(--topo-altura-utilidade)");
    expect(regra).toContain("white-space:nowrap");
  });
});

describe("sistema gráfico territorial", () => {
  const aberturas = readFileSync("src/componentes/home/Aberturas.tsx", "utf8");
  const secoes = readFileSync("src/componentes/home/Secoes.tsx", "utf8");
  const grafismos = readFileSync(
    "src/componentes/grafismos/GrafismosTerritoriais.tsx",
    "utf8",
  );

  test("preserva rio e serra e retira a topografia do painel removido", () => {
    expect(aberturas).not.toContain('data-grafismo-topografia="true"');
    expect(secoes).toContain("<GrafismoRioReal />");
    expect(secoes).toContain("<GrafismoSerra />");
    expect(grafismos.match(/data-grafismo-territorial=/g)).toHaveLength(2);
  });

  test("rio e serra são decorativos e não recebem foco", () => {
    expect(grafismos.match(/aria-hidden="true"/g)).toHaveLength(2);
    expect(grafismos.match(/focusable="false"/g)).toHaveLength(2);
  });
});

/**
 * Limites de conteúdo. Vinham de `testes/rota-home-livre.test.ts` e seguem
 * valendo: o que protegiam não era o laboratório, era a integridade do que a
 * Home afirma. Material ausente é `null` com estado declarado — nunca um
 * placeholder plausível.
 */
describe("limites de conteúdo da Home", () => {
  /*
   * O teste que vivia aqui protegia o bloco antigo do PodObservar, que
   * declarava três episódios sem título, duração, link nem transcrição — a
   * forma honesta de mostrar estrutura quando não havia material. O material
   * existe desde a P0.2B2, o bloco saiu na P0.3, e a Home passou a ler a view
   * pública. O contrato equivalente agora é `testes/podobservar-publico.test.ts`:
   * a Home não conhece quantidade de episódios e não inventa nenhum.
   */

  test("as entrevistas são identificadas por instituição ou lugar", () => {
    expect(ENTREVISTAS.map((e) => e.numero)).toEqual([
      "01",
      "02",
      "03",
      "04",
      "05",
      "06",
      "07",
      "08",
    ]);
  });

  /**
   * O bloco de fontes citava caminho de repositório, código de fase e
   * documento restrito. Ele nunca era renderizado em público — mas existia na
   * árvore. Agora não existe, e é isso que se verifica.
   */
  test("nenhum instrumento de laboratório sobrou na composição", () => {
    for (const arquivo of [
      "src/componentes/home/Home.tsx",
      "src/componentes/home/Secoes.tsx",
      "src/componentes/home/Aberturas.tsx",
      "src/componentes/home/Estrutura.tsx",
      "src/componentes/home/conteudo.ts",
    ]) {
      const fonte = readFileSync(arquivo, "utf8");
      for (const vestigio of [
        "hl-dev",
        "SeletorDeAbertura",
        "Fontes desta seção",
        "somente DEV",
        "Não publicar",
      ]) {
        expect(fonte, `${arquivo} · ${vestigio}`).not.toContain(vestigio);
      }
    }
  });
});
