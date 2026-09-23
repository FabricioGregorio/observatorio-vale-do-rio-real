import { readFileSync } from "node:fs";
import { glob } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { LIMITES } from "../src/componentes/dados/conteudo";
import { ENTREVISTAS } from "../src/componentes/home/conteudo";

/**
 * Voz editorial das superfícies públicas.
 *
 * Este arquivo não trava redação. Ele trava o que a revisão editorial de
 * 2026-09-20 tirou da interface e que não pode voltar: texto escrito para
 * quem desenvolve o site, rótulo de processo interno, estado de aprovação e
 * marcação de substituição. Redação boa muda com o tempo; essas quatro coisas
 * são erro em qualquer redação.
 *
 * O `/dev` e o protótipo ficam fora: são rotas `noindex`, servidas só para
 * conferência visual, e o vocabulário de implementação é legítimo lá.
 */

const RAIZ = join(import.meta.dirname, "..");
const FORA = ["src/app/dev/", "src/componentes/prototipo/"];

/**
 * O texto que sobra depois de remover comentário de código.
 *
 * O comentário é para quem lê o repositório, e o projeto pede que ele
 * exista. O que esta varredura procura é o que chega ao navegador — por isso
 * comentário de bloco e linha iniciada por barra dupla saem antes da busca.
 */
function semComentarios(fonte: string): string {
  return fonte
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .filter((linha) => !linha.trimStart().startsWith("//"))
    .join("\n");
}

async function superficiesPublicas(): Promise<
  readonly { readonly arquivo: string; readonly texto: string }[]
> {
  const encontrados: { arquivo: string; texto: string }[] = [];
  for await (const caminho of glob("src/{app,componentes}/**/*.{ts,tsx}", {
    cwd: RAIZ,
  })) {
    const arquivo = caminho.split("\\").join("/");
    if (FORA.some((prefixo) => arquivo.startsWith(prefixo))) continue;
    encontrados.push({
      arquivo,
      texto: semComentarios(readFileSync(join(RAIZ, caminho), "utf8")),
    });
  }
  expect(encontrados.length).toBeGreaterThan(50);
  return encontrados;
}

describe("nenhum texto de desenvolvimento chega à interface", () => {
  /**
   * `placeholder=` é atributo de HTML e fica de fora: a busca do Acervo o usa
   * como dica de campo, que é conteúdo público legítimo. O que não pode
   * existir é a palavra como marcação de conteúdo provisório.
   */
  const PROIBIDOS: readonly {
    readonly padrao: RegExp;
    readonly porque: string;
  }[] = [
    {
      padrao: /município não consolidado/i,
      porque: "rótulo de processo interno na lista de entrevistas",
    },
    {
      padrao: /data-copy-editorial/,
      porque: "estado de aprovação humana exposto no HTML público",
    },
    {
      padrao: /confirmad[oa] pelo responsável|decisão humana documentada/i,
      porque: "bastidor de aprovação no texto público",
    },
    {
      padrao: /fonte da verdade|fonte de verdade|pendente de decisão/i,
      porque: "vocabulário de processo interno",
    },
    {
      padrao: /AGENTS\.md|no build|tempo de compilação/i,
      porque: "instrução ou mecanismo de compilação exposto",
    },
    {
      padrao: /nesta compilação/i,
      porque: "vocabulário de build na tela de quem lê",
    },
    {
      padrao: /não (está )?resolvid[oa]/i,
      porque: "vocabulário de resolução de dados na tela de quem lê",
    },
    { padrao: /\bgate\b/i, porque: "nome interno do critério de publicação" },
    { padrao: /Lorem ipsum/i, porque: "texto de substituição" },
    { padrao: /\bTODO\b/, porque: "marca de tarefa pendente" },
    {
      padrao: /(?<!aria-|input |campo )placeholder(?!=)/i,
      porque: "marca de conteúdo provisório",
    },
  ];

  test("as superfícies públicas não carregam vocabulário de implementação", async () => {
    const achados: string[] = [];
    for (const { arquivo, texto } of await superficiesPublicas()) {
      for (const { padrao, porque } of PROIBIDOS) {
        const encontrado = padrao.exec(texto);
        if (encontrado !== null)
          achados.push(`${arquivo}: "${encontrado[0]}" — ${porque}`);
      }
    }
    expect(achados).toEqual([]);
  });
});

/**
 * O que nenhuma superfície pública pode afirmar.
 *
 * Esta guarda vinha de `prestacao-de-contas.test.ts`, onde varria só os
 * textos daquela página. Com a página removida em 2026-09-23, ela veio para
 * cá e passou a varrer toda superfície pública — que é onde a regra sempre
 * valeu: situação financeira, parecer e encerramento de prestação não estão
 * documentalmente confirmados em lugar nenhum do corpus, e afirmar qualquer
 * um deles é o dado fictício que este projeto proíbe.
 *
 * Os padrões são **afirmativos** de propósito. O que não pode existir é a
 * afirmação, não o termo: uma regra que procurasse a palavra solta
 * reprovaria a própria frase que estabelece o limite.
 */
describe("nenhuma superfície pública afirma o que o projeto não pode provar", () => {
  /** Estado administrativo do projeto: proibido em qualquer superfície. */
  const ESTADO_ADMINISTRATIVO: readonly RegExp[] = [
    /\b(foi|está|encontra-se)\s+(aprovad|homologad)/i,
    /prestação de contas\s+(está|foi|encontra-se)\s+(aprovada|encerrada|concluída)/i,
    /parecer\s+(favorável|técnico aprovado|de aprovação)/i,
  ];

  /** Cifra e medida financeira **do próprio projeto**. */
  const EXECUCAO_FINANCEIRA: readonly RegExp[] = [
    /\bsaldo\b/i,
    /\bvalor executado\b/i,
    /\bR\$\s?\d/,
  ];

  /**
   * Onde uma cifra não é afirmação sobre o projeto.
   *
   * A cartografia publica receita e despesa **dos lugares pesquisados** — no
   * caso do Recanto da Serra, os valores que o relatório técnico A02 registra,
   * cada um com a sua `fonte` declarada ao lado. Isso é achado de pesquisa
   * citado de um documento, e é justamente o que o Observatório foi financiado
   * para levantar.
   *
   * O que a regra proíbe é o projeto declarar a própria execução financeira,
   * que não está documentalmente confirmada em lugar nenhum do corpus. São
   * coisas diferentes, e uma varredura que não as distinguisse mandaria apagar
   * o resultado da pesquisa para proteger uma regra sobre prestação de contas.
   */
  const CIFRA_DE_PESQUISA = new Set([
    "src/componentes/territorio/cartografia/lugares.ts",
  ]);

  test("nenhum texto público declara aprovação nem parecer", async () => {
    const achados: string[] = [];
    for (const { arquivo, texto } of await superficiesPublicas()) {
      for (const padrao of ESTADO_ADMINISTRATIVO) {
        const encontrado = padrao.exec(texto);
        if (encontrado !== null) achados.push(`${arquivo}: "${encontrado[0]}"`);
      }
    }
    expect(achados).toEqual([]);
  });

  test("nenhum texto público declara execução financeira do projeto", async () => {
    const achados: string[] = [];
    for (const { arquivo, texto } of await superficiesPublicas()) {
      if (CIFRA_DE_PESQUISA.has(arquivo)) continue;
      for (const padrao of EXECUCAO_FINANCEIRA) {
        const encontrado = padrao.exec(texto);
        if (encontrado !== null) achados.push(`${arquivo}: "${encontrado[0]}"`);
      }
    }
    expect(achados).toEqual([]);
  });

  /*
    A exceção não é um buraco: a cifra que ela permite continua tendo de vir
    de documento citado. Sem esta linha, apagar a `fonte` ao lado do valor
    passaria despercebido.
  */
  test("a cifra de pesquisa permitida continua trazendo a fonte ao lado", () => {
    for (const arquivo of CIFRA_DE_PESQUISA) {
      const fonte = readFileSync(join(RAIZ, arquivo), "utf8");
      for (const bloco of fonte.split(/\n\s*\},?\s*\n/)) {
        if (!/R\$\s?\d/.test(bloco)) continue;
        expect(bloco, arquivo).toMatch(/fonte:/);
      }
    }
  });
});

describe("afirmações factualmente superadas não voltam", () => {
  /**
   * Os três manuais oficiais de marca foram localizados e lidos, e a régua de
   * marcas é aplicada no rodapé de toda rota. A pendência que dizia o
   * contrário vivia na Prestação de Contas, que saiu em 2026-09-23 — e com
   * ela a estrutura que este teste lia. A afirmação superada passou a ser
   * procurada onde ela poderia reaparecer: no texto servido.
   */
  test("nenhuma superfície diz que falta manual de marcas", async () => {
    const achados: string[] = [];
    for (const { arquivo, texto } of await superficiesPublicas()) {
      if (/nenhuma marca oficial é aplicada/i.test(texto))
        achados.push(arquivo);
      if (
        /manual de aplicação de marcas/i.test(texto) &&
        /pendência|pendente|ainda não/i.test(texto)
      )
        achados.push(arquivo);
    }
    expect(achados).toEqual([]);
  });

  test("o município de cada entrevista está documentado", () => {
    for (const entrevista of ENTREVISTAS) {
      expect(entrevista.municipio, entrevista.onde).not.toBeNull();
    }
  });

  test("os limites de /dados continuam nomeando o recorte", () => {
    expect(LIMITES.length).toBeGreaterThanOrEqual(3);
  });
});

describe("o título da lista de produtos conta o que a lista tem", () => {
  test("/observatorio deriva a contagem, em vez de escrevê-la", () => {
    const fonte = readFileSync(
      join(RAIZ, "src/app/observatorio/page.tsx"),
      "utf8",
    );
    expect(fonte).toContain("{PRODUTOS.length} entradas para o mesmo acervo");
    expect(fonte).not.toContain("Quatro entradas para o mesmo acervo");
  });
});
