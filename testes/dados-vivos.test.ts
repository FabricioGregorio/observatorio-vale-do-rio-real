import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";
import { exigirDesenvolvimentoDosDadosVivos } from "../src/app/dev/dados-vivos/page";
import { PainelDeDados } from "../src/componentes/prototipo/dados/PainelDeDados";
import { DadosVivos } from "../src/componentes/prototipo/dadosvivos/DadosVivos";
import {
  ATIVIDADES_ABAIXO_DO_LIMIAR,
  ATIVIDADES_ACIMA_DO_LIMIAR,
  LIMIAR_DE_DIAS,
} from "../src/componentes/prototipo/dadosvivos/RankingEditorial";
import {
  ATIVIDADES,
  CONTEXTO_DOS_DADOS,
  INDICADORES,
  SERIE_MENSAL,
} from "../src/dados/indicadores/derivados";
import {
  exibirIndicador,
  formatarReais,
} from "../src/dados/indicadores/formato";

const h45 = renderToStaticMarkup(createElement(DadosVivos));
const h40Painel = renderToStaticMarkup(
  createElement(PainelDeDados, { composicao: "painel" as const }),
);
const h40Declaracao = renderToStaticMarkup(
  createElement(PainelDeDados, { composicao: "declaracao" as const }),
);

function ocorrencias(html: string, trecho: string): number {
  return html.split(trecho).length - 1;
}

describe("H4.5: a rota é laboratório e some em produção", () => {
  test("produção interrompe antes de renderizar; desenvolvimento permite", () => {
    const interromper = vi.fn((): never => {
      throw new Error("404");
    });
    expect(() =>
      exigirDesenvolvimentoDosDadosVivos("production", interromper),
    ).toThrow("404");
    exigirDesenvolvimentoDosDadosVivos("development", interromper);
    expect(interromper).toHaveBeenCalledOnce();
  });
});

/**
 * O contrato central da fase: a H4.5 é composição, não é dado.
 *
 * As duas composições leem o mesmo módulo, então divergir de número seria
 * preciso muito esforço — e é exatamente por isso que o teste existe: ele pega
 * a tentação de "arredondar para caber" ou de escrever um valor à mão no JSX.
 */
describe("H4.5: os números são os mesmos da H4.0", () => {
  test.each(INDICADORES)(
    "$id aparece com o mesmo valor formatado nas duas composições",
    (indicador) => {
      const esperado = exibirIndicador(indicador);
      expect(h45).toContain(esperado);
      expect(h40Painel).toContain(esperado);
    },
  );

  test("os oito indicadores estão na H4.5, e nenhum a mais", () => {
    const valores = INDICADORES.map((indicador) => exibirIndicador(indicador));
    expect(valores).toHaveLength(8);
    for (const valor of valores) expect(h45).toContain(valor);
  });

  test("base, período, recorte e regra não foram reescritos", () => {
    expect(h45).toContain(CONTEXTO_DOS_DADOS.periodo);
    expect(h45).toContain(CONTEXTO_DOS_DADOS.recorte);
    expect(h45).toContain(CONTEXTO_DOS_DADOS.fontePublica);
    for (const indicador of INDICADORES) {
      if (indicador.id === "H4-001") {
        expect(h45).toContain(indicador.base);
        expect(h45).toContain(indicador.notaMetodologica);
      }
      if (indicador.base !== null && indicador.id !== "H4-001") {
        expect(h45).toContain(indicador.base);
      }
      expect(h45).toContain(indicador.regra);
    }
  });

  /**
   * A tabela é a fonte exata e o desenho é a leitura dela. Se os dois
   * divergirem, o gráfico passa a afirmar o que a tabela nega.
   */
  test("tabela e gráfico descrevem a mesma série, mês a mês", () => {
    for (const [indice, mes] of SERIE_MENSAL.entries()) {
      expect(h45).toContain(`data-mes="${indice}"`);
      expect(h45).toContain(mes.rotulo);
      expect(h45).toContain(formatarReais(mes.receita));
      expect(h45).toContain(formatarReais(mes.despesa));
    }
    // Um grupo no desenho e uma linha na tabela para cada mês, e nada além.
    expect(ocorrencias(h45, 'data-mes="')).toBe(SERIE_MENSAL.length * 2);
  });

  test("a tabela de valores exatos está sempre no HTML, em qualquer largura", () => {
    // Nenhuma largura é decidida aqui: a tabela não é condicional no servidor,
    // e é isso que garante que o celular não perca informação.
    const fonte = readFileSync(
      "src/componentes/prototipo/dadosvivos/SerieViva.tsx",
      "utf8",
    );
    expect(fonte).toContain("<TabelaDaSerieViva />");
    expect(fonte).not.toMatch(/\?\s*<TabelaDaSerieViva/);
    expect(h45).toContain("Série mensal consolidada");
  });
});

describe("H4.5: nada de fonte restrita e nada de dado pessoal", () => {
  test("nenhum identificador da fonte restrita chega ao HTML", () => {
    expect(h45).not.toMatch(/\bES\d{2}\b/);
    expect(h45).not.toMatch(/_Painel_Executivo|_Indicadores_Solidaria/);
    expect(h45).not.toMatch(/Pessoas_Trabalho|Fornecedores/);
    expect(h45).not.toMatch(/anexo-indicadores|\.xlsx/);
    expect(h45).not.toContain(CONTEXTO_DOS_DADOS.sha256DaFonte);
  });

  test("nenhum dado pessoal e nenhum caminho de corpus chega ao HTML", () => {
    expect(h45).not.toContain("@");
    expect(h45).not.toMatch(/\d{3}\.\d{3}\.\d{3}-\d{2}/);
    expect(h45).not.toMatch(/\(\d{2}\)\s?\d{4,5}-\d{4}/);
    expect(h45).not.toMatch(/\bCPF\b|\bRG\b/i);
    expect(h45).not.toMatch(/OBSERVATORIO_FONTES_DIR|latitud|longitud/);
  });

  test("o título editorial continua marcado como proposta", () => {
    expect(h45).toContain("Título editorial · proposta");
    expect(h45).toContain("Onde o recurso circula");
  });
});

/**
 * O corte do ranking precisa ser reproduzível por quem lê, e não confortável
 * para quem escreve.
 */
describe("H4.5: o recorte do ranking é um limiar declarado", () => {
  test("o limiar seleciona o que promete, e o total continua dito", () => {
    expect(ATIVIDADES_ACIMA_DO_LIMIAR.length).toBe(8);
    expect(ATIVIDADES_ABAIXO_DO_LIMIAR).toBe(
      ATIVIDADES.length - ATIVIDADES_ACIMA_DO_LIMIAR.length,
    );
    for (const atividade of ATIVIDADES_ACIMA_DO_LIMIAR) {
      expect(atividade.diasComAtividade).toBeGreaterThanOrEqual(LIMIAR_DE_DIAS);
      expect(h45).toContain(atividade.nome);
    }
    expect(h45).toContain(`${LIMIAR_DE_DIAS} ou mais`);
    expect(h45).toContain(`${ATIVIDADES.length} atividades`);
  });

  /**
   * Limiar que cai em cima de um empate deixa de ser critério e vira sorteio:
   * duas atividades com o mesmo número de dias, uma dentro e outra fora.
   */
  test("o limiar não corta um empate", () => {
    const dentro = ATIVIDADES_ACIMA_DO_LIMIAR.at(-1);
    const fora = ATIVIDADES.filter(
      (atividade) => atividade.diasComAtividade < LIMIAR_DE_DIAS,
    )[0];
    expect(dentro).toBeDefined();
    expect(fora).toBeDefined();
    expect(dentro?.diasComAtividade).toBeGreaterThan(
      fora?.diasComAtividade ?? 0,
    );
  });

  test("nenhuma atividade some sem ser contada", () => {
    expect(h45).toContain("ranking completo");
    expect(
      ATIVIDADES_ACIMA_DO_LIMIAR.length + ATIVIDADES_ABAIXO_DO_LIMIAR,
    ).toBe(ATIVIDADES.length);
  });
});

describe("H4.5: a gramática da H3.5.1 vale também sobre números", () => {
  test("as quatro famílias de grafismo aparecem", () => {
    for (const familia of [
      "lv-g-identidade",
      "lv-g-cartografico",
      "lv-g-documental",
      "lv-g-transicao",
    ]) {
      expect(ocorrencias(h45, familia)).toBeGreaterThan(0);
    }
  });

  /** Um carcará em escala editorial por página, e só em passagem. */
  test("a assinatura aparece uma vez, na passagem de entrada", () => {
    expect(ocorrencias(h45, "lv-g-identidade")).toBe(1);
    expect(ocorrencias(h45, "lv-g-transicao")).toBe(2);

    const saida = h45.slice(h45.indexOf('data-passagem="saida"'));
    expect(saida).not.toContain("lv-g-identidade");

    const assinatura = h45.slice(h45.indexOf("lv-g-identidade"));
    expect(assinatura).toContain('aria-hidden="true"');
    expect(assinatura.slice(0, 400)).toMatch(/alt=""/);
  });

  test("o carcará não é apresentado como dado territorial", () => {
    expect(h45).toContain("Carcará · grafismo da identidade");
    expect(h45).not.toMatch(
      /carcará[^<]*(avistad|encontrad|espécie|fauna do território)/i,
    );
  });
});

/**
 * A H4.0 é a autoridade factual e não pode ser tocada por uma fase de
 * composição. O acoplamento é o risco: um import atravessado faria um refino
 * visual mudar o painel original sem ninguém notar.
 */
describe("H4.5: a H4.0 continua intacta e desacoplada", () => {
  const ARQUIVOS_DA_H4 = [
    "src/app/dev/dados/page.tsx",
    "src/componentes/prototipo/dados/PainelDeDados.tsx",
    "src/componentes/prototipo/dados/RankingDeAtividades.tsx",
    "src/componentes/prototipo/dados/SerieMensal.tsx",
    "src/componentes/prototipo/dados/estilosDosDados.ts",
  ];

  test.each(ARQUIVOS_DA_H4)("%s não sabe da H4.5", (arquivo) => {
    const fonte = readFileSync(arquivo, "utf8");
    expect(fonte).not.toContain("dadosvivos");
    expect(fonte).not.toMatch(/\bdv-/);
  });

  test("a composição original continua renderizando como antes", () => {
    expect(h40Declaracao).toContain("A — Declaração editorial");
    expect(h40Declaracao).toContain("painel-dados__numero");
    expect(h40Declaracao).not.toContain("dv-numero");
  });

  test("as duas composições leem o mesmo módulo de dados", () => {
    const fonteH45 = readFileSync(
      "src/componentes/prototipo/dadosvivos/DadosVivos.tsx",
      "utf8",
    );
    expect(fonteH45).toContain('from "../../../dados/indicadores/derivados"');
    // Nenhum número escrito à mão no componente: os dígitos que aparecem no
    // JSX vêm do dataset ou de nada.
    expect(fonteH45).not.toMatch(/>\s*\d[\d.,]*\s*%?\s*</);
  });
});
