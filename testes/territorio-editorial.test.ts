import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  ALVO_PADRAO,
  ALVOS_EDITORIAIS,
  DEFINICOES,
  LUGARES_EDITORIAIS,
} from "../src/componentes/home/recortes";
import {
  ABERTURA_DO_TERRITORIO,
  TERRITORIO,
} from "../src/componentes/observatorio/conteudo";
import { RESUMO_PUBLICO_DO_VALE } from "../src/dados/territorio/recorte";
import {
  IDS_DOS_LUGARES,
  REFERENCIAS_TERRITORIAIS,
} from "../src/dados/territorio/referencias";

/**
 * Conteúdo editorial da seção III da Home.
 *
 * O que estes testes protegem não é redação: é a relação entre identificador,
 * rótulo do mapa e texto, e são as afirmações factuais que as transcrições do
 * PodObservar sustentam. Redação muda; a grafia decidida pela equipe e o
 * município de um povoado não mudam sem decisão humana.
 */

const textoDe = (chave: string): string => {
  const alvo = ALVOS_EDITORIAIS.find((a) => a.chave === chave);
  if (alvo === undefined) throw new Error(`Alvo inexistente: ${chave}`);
  return [alvo.sobretitulo, alvo.titulo, ...alvo.paragrafos].join(" ");
};

const TODO_O_TEXTO = ALVOS_EDITORIAIS.map((a) => textoDe(a.chave)).join(" ");

describe("grafia decidida pela equipe", () => {
  /**
   * `Itanhy` é a grafia que a transcrição revisada do EP01 usa para o nome
   * indígena do rio. A equipe determinou `Itanhi` para o texto editorial do
   * site, e é essa decisão humana que vale aqui — ela não reescreve a
   * transcrição, que é documento e permanece como está no corpus.
   *
   * O município Santa Luzia do Itanhy continua com o `y`: é nome oficial do
   * IBGE, dado técnico da malha, e não texto editorial do Observatório.
   */
  it("o nome indígena do rio aparece como Itanhi, nunca Itanhy", () => {
    expect(TODO_O_TEXTO).toContain("Itanhi");
    expect(TODO_O_TEXTO).not.toContain("Itanhy");
  });
});

describe("texto recusado pela equipe", () => {
  /**
   * A abordagem anterior definia o Vale por negação administrativa. A equipe
   * recusou: o território é apresentado como vivido e pesquisado, e a precisão
   * metodológica, quando precisa existir, é secundária.
   */
  it.each([
    "Não é divisão administrativa oficial",
    "Região socioeconômica associada ao curso superior e médio do rio Real",
    "não cria fronteira nova",
    "apresenta os 75 municípios de Sergipe e distingue as relações declaradas",
    "município não consolidado",
  ])("não reintroduz %j", (trecho) => {
    expect(TODO_O_TEXTO).not.toContain(trecho);
  });
});

/**
 * A recusa vale para **toda** superfície pública, e não só para a Home.
 *
 * Até 2026-09-20 a trava acima olhava apenas `ALVOS_EDITORIAIS`. `/territorio`
 * e `/observatorio` serviam `DEFINICAO_VALE_DO_RIO_REAL` literalmente, e
 * passavam por fora dela — foi assim que a formulação recusada voltou ao ar
 * numa página institucional. A constante continua existindo como nota
 * metodológica interna; o que não pode é chegar ao HTML.
 */
describe("a formulação recusada não alcança superfície pública", () => {
  const RAIZ = "src";
  const DONA_DA_CONSTANTE = join("src", "dados", "territorio", "recorte.ts");

  function arquivosDeCodigo(pasta: string): string[] {
    return readdirSync(pasta, { withFileTypes: true }).flatMap((entrada) => {
      const caminho = join(pasta, entrada.name);
      if (entrada.isDirectory()) return arquivosDeCodigo(caminho);
      return /\.tsx?$/.test(entrada.name) ? [caminho] : [];
    });
  }

  /*
    Comentário não vai para o HTML, e explicar por que a frase saiu é
    justamente o que mantém a decisão legível daqui a um ano. A trava olha o
    código servido, não a documentação dele.
  */
  function semComentarios(fonte: string): string {
    return fonte
      .replace(/\/\*[\s\S]*?\*\//g, " ")
      .replace(/^\s*\/\/.*$/gm, " ");
  }

  const CODIGO = arquivosDeCodigo(RAIZ).map((caminho) => ({
    caminho,
    fonte: semComentarios(readFileSync(caminho, "utf8")),
  }));

  it("nenhum componente ou rota importa a nota metodológica interna", () => {
    const consumidores = CODIGO.filter(
      ({ caminho, fonte }) =>
        caminho !== DONA_DA_CONSTANTE &&
        fonte.includes("DEFINICAO_VALE_DO_RIO_REAL"),
    ).map(({ caminho }) => caminho);
    expect(consumidores).toEqual([]);
  });

  it("nenhuma fonte de `src/` repete a frase recusada à mão", () => {
    const reincidentes = CODIGO.filter(
      ({ caminho, fonte }) =>
        caminho !== DONA_DA_CONSTANTE &&
        (fonte.includes("Não é divisão administrativa oficial") ||
          fonte.includes(
            "Região socioeconômica associada ao curso superior e médio",
          )),
    ).map(({ caminho }) => caminho);
    expect(reincidentes).toEqual([]);
  });

  it("o resumo público do Vale afirma, e não nega", () => {
    expect(RESUMO_PUBLICO_DO_VALE).not.toContain("Não é");
    expect(RESUMO_PUBLICO_DO_VALE).not.toContain("não é");
    expect(RESUMO_PUBLICO_DO_VALE.length).toBeGreaterThan(60);
  });

  it("o texto territorial de /observatorio segue a grafia da equipe", () => {
    const texto = [ABERTURA_DO_TERRITORIO, ...TERRITORIO].join(" ");
    expect(texto).toContain("Itanhi");
    expect(texto).not.toContain("Itanhy");
    expect(texto).not.toContain("divisão administrativa");
  });

  it("/observatorio não repete parágrafo da seção III da Home", () => {
    const daHome = new Set(DEFINICOES.flatMap((d) => d.paragrafos));
    for (const paragrafo of TERRITORIO) {
      expect(daHome.has(paragrafo), paragrafo.slice(0, 50)).toBe(false);
    }
  });
});

describe("alvos editoriais", () => {
  it("cobre os dois recortes e os quatro lugares de campo, sem repetir chave", () => {
    const chaves = ALVOS_EDITORIAIS.map((alvo) => alvo.chave);
    expect(chaves).toEqual([
      "vale",
      "comparacao",
      ...IDS_DOS_LUGARES.map(String),
    ]);
    expect(new Set(chaves).size).toBe(chaves.length);
  });

  it("todo alvo tem rótulo, sobretítulo, título e ao menos um parágrafo", () => {
    for (const alvo of ALVOS_EDITORIAIS) {
      expect(alvo.rotulo.length, alvo.chave).toBeGreaterThan(0);
      expect(alvo.sobretitulo.length, alvo.chave).toBeGreaterThan(0);
      expect(alvo.titulo.length, alvo.chave).toBeGreaterThan(0);
      expect(alvo.paragrafos.length, alvo.chave).toBeGreaterThan(0);
    }
  });

  /** O estado inicial é uma decisão, não um acaso: a seção é sobre o Vale. */
  it("o alvo padrão é o recorte do Vale e existe na tabela", () => {
    expect(ALVO_PADRAO).toBe("vale");
    expect(ALVOS_EDITORIAIS.some((a) => a.chave === ALVO_PADRAO)).toBe(true);
  });

  /**
   * Fonte única: município e localidade vêm de `referencias.ts`. Se a tabela
   * editorial os repetisse, passariam a existir duas respostas para a mesma
   * pergunta — exatamente o que a seção 15 do adendo proíbe.
   */
  it("a tabela editorial não redeclara município nem localidade dos lugares", () => {
    for (const lugar of LUGARES_EDITORIAIS) {
      const referencia = REFERENCIAS_TERRITORIAIS.find(
        (r) => r.id === lugar.chave,
      );
      expect(referencia, lugar.chave).toBeDefined();
      expect(lugar.paragrafos.join(" ")).not.toContain(referencia?.localidade);
    }
  });
});

describe("afirmações que as transcrições sustentam", () => {
  /**
   * EP01: "viajamos de barco para Ilha Grande, povoação de São Cristóvão com
   * uma rica cultura pesqueira, que preserva a tradição do samba de coco".
   * O município já era o publicado por `referencias.ts` desde 2026-09-14.
   */
  it("Ilha Grande é povoado de São Cristóvão, e o texto diz o que a fonte diz", () => {
    const referencia = REFERENCIAS_TERRITORIAIS.find(
      (r) => r.id === "ilha-grande",
    );
    expect(referencia?.municipio).toBe("São Cristóvão");

    const texto = textoDe("ilha-grande");
    expect(texto).toContain("São Cristóvão");
    expect(texto).toContain("pesqueira");
    expect(texto).toContain("samba de coco");
    expect(texto).toContain("barco");
  });

  it("São Cristóvão entra como comparação e nunca como parte do Vale", () => {
    const texto = textoDe("comparacao");
    expect(texto).toContain("comparação");
    expect(texto).toContain("não pertence ao Vale");
    expect(texto).not.toContain("parte do Vale do Rio Real");
  });

  it("o Vale atravessa os dois estados e nomeia as cidades do recorte", () => {
    const texto = textoDe("vale");
    expect(texto).toContain("Sergipe");
    expect(texto).toContain("Bahia");
    for (const cidade of [
      "Tobias Barreto",
      "Itabaianinha",
      "Poço Verde",
      "Tomar do Geru",
      "Cristinápolis",
    ]) {
      expect(texto, cidade).toContain(cidade);
    }
  });
});

describe("rótulos do mapa", () => {
  /** O `aria-label` da opção e o título da coluna saem da mesma linha. */
  it("cada rótulo nomeia o alvo que ele abre", () => {
    for (const definicao of DEFINICOES) {
      expect(definicao.rotulo.length).toBeGreaterThan(0);
    }
    for (const lugar of LUGARES_EDITORIAIS) {
      expect(lugar.rotulo, lugar.chave).toContain(lugar.titulo);
      expect(lugar.rotulo, lugar.chave).toContain("ponto de pesquisa");
    }
  });
});
