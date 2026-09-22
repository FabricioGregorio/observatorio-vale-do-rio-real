import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import {
  PRIVACIDADE_FRONTEIRAS,
  PRIVACIDADE_NAVEGACAO,
  PRIVACIDADE_SINTESE,
} from "../src/componentes/institucional/conteudo";

/**
 * Vercel Web Analytics — o que o código faz e o que a página declara.
 *
 * A medição de audiência foi aceita sob limites explícitos. Um
 * limite que só existe em prosa não é um limite: este arquivo é o que impede
 * que a próxima rodada acrescente um evento customizado, duplique o
 * componente ou publique uma afirmação de privacidade que o código desminta.
 *
 * A varredura é textual sobre o fonte, e é essa a intenção. O risco aqui não é
 * de runtime — é de alguém escrever `track("clique", { email })` num
 * componente qualquer e ninguém notar. Um teste que só exercitasse o layout
 * renderizado não veria isso.
 */

const RAIZ_SRC = join(import.meta.dirname, "..", "src");

function arquivosDeFonte(diretorio: string): readonly string[] {
  return readdirSync(diretorio).flatMap((entrada) => {
    const caminho = join(diretorio, entrada);
    if (statSync(caminho).isDirectory()) return arquivosDeFonte(caminho);
    return /\.tsx?$/.test(entrada) ? [caminho] : [];
  });
}

const FONTES = arquivosDeFonte(RAIZ_SRC).map((caminho) => ({
  caminho,
  texto: readFileSync(caminho, "utf8"),
}));

/** Comentário de bloco e de linha fora, para que a prosa não vire evidência. */
function semComentarios(texto: string): string {
  return texto.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
}

const CODIGO = FONTES.map((fonte) => ({
  caminho: fonte.caminho,
  texto: semComentarios(fonte.texto),
}));

describe("instrumentação do Vercel Web Analytics", () => {
  test("o componente é montado uma única vez, e no layout raiz", () => {
    const montagens = CODIGO.filter((fonte) =>
      /<Analytics\b/.test(fonte.texto),
    );

    expect(montagens.map((m) => m.caminho.replace(RAIZ_SRC, "src"))).toEqual([
      join("src", "app", "layout.tsx"),
    ]);

    const layout = montagens[0]?.texto ?? "";
    expect(layout.match(/<Analytics\b/g)).toHaveLength(1);
  });

  test("vem do entrypoint oficial de Next.js, não do genérico", () => {
    const layout = CODIGO.find((fonte) =>
      fonte.caminho.endsWith(join("app", "layout.tsx")),
    );

    expect(layout?.texto).toContain(
      'import { Analytics } from "@vercel/analytics/next"',
    );
  });

  test("é montado sem prop alguma — nenhuma configuração de rastreio", () => {
    const layout =
      CODIGO.find((fonte) => fonte.caminho.endsWith(join("app", "layout.tsx")))
        ?.texto ?? "";

    expect(layout).toContain("<Analytics />");
  });

  /**
   * Evento customizado é vedado nesta rodada. `track` é a única API do
   * pacote que emite um, e é por ela que dado pessoal entraria.
   */
  test("nenhum evento customizado é emitido em lugar nenhum do site", () => {
    const suspeitos = CODIGO.filter((fonte) =>
      /from\s+"@vercel\/analytics(?!\/next")/.test(fonte.texto),
    ).map((fonte) => fonte.caminho.replace(RAIZ_SRC, "src"));

    expect(suspeitos).toEqual([]);
    expect(CODIGO.filter((fonte) => /\btrack\s*\(/.test(fonte.texto))).toEqual(
      [],
    );
  });

  test("nenhum identificador de pessoa é passado ao analytics", () => {
    const layout =
      CODIGO.find((fonte) => fonte.caminho.endsWith(join("app", "layout.tsx")))
        ?.texto ?? "";

    for (const proibido of [
      "userId",
      "user_id",
      "identify",
      "fingerprint",
      "beforeSend",
    ]) {
      expect(layout).not.toContain(proibido);
    }
  });
});

describe("o que /privacidade declara", () => {
  const TODOS = [...PRIVACIDADE_NAVEGACAO, ...PRIVACIDADE_FRONTEIRAS];
  const CORPO = [
    PRIVACIDADE_SINTESE,
    ...TODOS.map((item) => `${item.titulo} ${item.texto}`),
  ]
    .join("\n")
    .toLowerCase();

  /**
   * A afirmação que a instrumentação tornou falsa. Ela não pode voltar por
   * cópia de um texto antigo.
   */
  test("não afirma mais que não existe medição de audiência", () => {
    expect(CORPO).not.toMatch(/(nenhuma|não tem|sem) medição de audiência/);
    expect(CORPO).not.toMatch(/qualquer medição de audiência/);
  });

  test("declara a medição e o que ela recebe", () => {
    expect(CORPO).toContain("vercel web analytics");
    for (const termo of [
      "página visitada",
      "navegador",
      "sistema operacional",
      "aparelho",
    ]) {
      expect(CORPO).toContain(termo);
    }
  });

  /**
   * A restrição do item 3 da instrução: nada de coleta que não existe.
   *
   * Um `toContain` cru sobre o corpo inteiro não serve, e a primeira versão
   * deste teste provou isso: o texto **nega** GPS e localização exata, e a
   * negação contém as mesmas palavras da afirmação. O que se audita aqui é o
   * corpo **sem** o item de negação — é ali que uma falsidade apareceria.
   */
  const ITEM_NEGACAO = TODOS.find(
    (item) => item.titulo === "O que essa medição não recebe",
  );

  const AFIRMACOES = [
    PRIVACIDADE_SINTESE,
    ...TODOS.filter((item) => item !== ITEM_NEGACAO).map(
      (item) => `${item.titulo} ${item.texto}`,
    ),
  ]
    .join("\n")
    .toLowerCase();

  const CATEGORIAS_VEDADAS = [
    "gps",
    "localização exata",
    "endereço residencial",
    "e-mail",
    "telefone",
  ] as const;

  test("nenhuma categoria de dado pessoal é reivindicada como coletada", () => {
    for (const vedada of CATEGORIAS_VEDADAS) {
      expect(AFIRMACOES).not.toContain(vedada);
    }
  });

  test("e as mesmas categorias aparecem, negadas, no item que as nega", () => {
    const negacao = (ITEM_NEGACAO?.texto ?? "").toLowerCase();

    expect(ITEM_NEGACAO).toBeDefined();
    for (const vedada of CATEGORIAS_VEDADAS) {
      expect(negacao).toContain(vedada);
    }
    expect(negacao).toContain("não acompanha sua navegação fora deste site");
  });

  test("não promete cidade, que o painel do projeto não lê", () => {
    const medicao = TODOS.find((item) =>
      item.titulo.startsWith("Uma medição de audiência"),
    );

    expect(medicao).toBeDefined();
    expect(medicao?.texto).toContain("aproximada");
    expect(medicao?.texto).toContain("país");
    expect(medicao?.texto.toLowerCase()).not.toContain("cidade");
  });

  /** Sem cookie, o banner pediria consentimento para coisa nenhuma. */
  test("continua afirmando ausência de cookie, e explica por que não há aviso", () => {
    expect(CORPO).toContain("sem cookie");
    expect(CORPO).toContain("não existe aviso de cookies");
  });

  /** Declaração jurídica absoluta é parecer, não fato conferível no código. */
  test("não emite parecer de conformidade com a LGPD", () => {
    expect(CORPO).not.toContain("lgpd");
    expect(CORPO).not.toMatch(/em conformidade com a lei/);
  });
});
