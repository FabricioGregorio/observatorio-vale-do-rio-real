import { readFileSync } from "node:fs";
import { glob } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { LIMITES } from "../src/componentes/dados/conteudo";
import { ENTREVISTAS } from "../src/componentes/home/conteudo";
import { PENDENCIAS_DECLARADAS } from "../src/componentes/prestacao/conteudo";

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
 * O comentário é para quem lê o repositório, e o `AGENTS.md` pede que ele
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

describe("afirmações factualmente superadas não voltam", () => {
  /**
   * Os três manuais oficiais de marca foram localizados e lidos, e a régua de
   * marcas é aplicada no rodapé de toda rota e na Prestação de Contas. A
   * pendência que dizia o contrário ficou na mesma página que a desmentia.
   */
  test("o manual de marcas não consta mais como pendência", () => {
    const itens = PENDENCIAS_DECLARADAS.map((p) => p.item);
    expect(itens).not.toContain("Manual de aplicação de marcas");
    expect(PENDENCIAS_DECLARADAS.map((p) => p.texto).join(" ")).not.toContain(
      "nenhuma marca oficial é aplicada",
    );
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
