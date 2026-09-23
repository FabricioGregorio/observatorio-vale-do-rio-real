/**
 * Guarda: o código de renderização pública não abre conexão com PostgreSQL.
 *
 * Varre `src/app/` e segue os imports relativos, arquivo a arquivo, até
 * esgotar o grafo. Qualquer caminho que chegue a um cliente de banco — ou
 * diretamente ao driver — é registrado como acoplamento.
 *
 * ## O que esta guarda cobre, e o que não cobre
 *
 * Ela lê os **especificadores de módulo** com expressão regular, incluindo
 * `import(...)` dinâmico e `require(...)`, e resolve cada um contra o disco.
 * É mais forte que procurar uma palavra no texto: um acoplamento só é
 * registrado quando o caminho resolve para um arquivo que existe e que está
 * na lista de proibidos.
 *
 * Não é análise de AST. A versão de TypeScript deste repositório (7.x, o
 * compilador nativo) não expõe mais `ts.preProcessFile` nem a API clássica do
 * compilador — só superfícies marcadas como `unstable`, que quebrariam na
 * próxima atualização. Montar um analisador de AST próprio seria
 * infraestrutura desproporcional para o que se quer detectar.
 *
 * Os limites concretos, declarados em vez de escondidos:
 *
 * - um especificador **computado** (`import(variavel)`) não pode ser
 *   resolvido. Em vez de ignorá-lo, a varredura o conta e o teste falha: uma
 *   parte do grafo que não dá para analisar não é o mesmo que uma parte
 *   limpa;
 * - um `from "..."` dentro de comentário ou string contaria como import. Isso
 *   produz falso **positivo**, que é barulhento e fácil de diagnosticar, e
 *   nunca falso negativo — que seria silencioso. O modo de falha foi
 *   escolhido nessa direção de propósito.
 *
 * ## Por que existe uma linha de base
 *
 * Hoje `src/app/` chega ao cliente de banco: é a arquitetura vigente, em que
 * as páginas consultam as projeções públicas durante o build. O Lote B troca
 * essa leitura pelo snapshot versionado, e então a lista abaixo fica vazia.
 *
 * Até lá a guarda trava o que importa: **nenhum acoplamento novo**. A
 * igualdade é exata, e não "está contido", para que remover um acoplamento
 * também exija atualizar esta lista — é o que torna o progresso do Lote B
 * visível no diff em vez de silencioso.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { describe, expect, test } from "vitest";

const RAIZ = process.cwd();
const DIRETORIO_DE_ENTRADA = join(RAIZ, "src", "app");

/** Módulos que abrem `Pool` de PostgreSQL. */
const CLIENTES_DE_BANCO = new Set([
  "src/dados/cliente.ts",
  "src/dados/clienteManutencao.ts",
  "db/cliente.ts",
]);

/** Drivers, para o caso de alguém pular o cliente e conectar direto. */
const DRIVERS_DE_BANCO = new Set(["pg", "drizzle-orm/node-postgres"]);

/**
 * Acoplamentos que a arquitetura de hoje tem e o Lote B remove.
 *
 * Cada entrada é a aresta que introduz a dependência: quem importa → o que é
 * importado. Ao migrar os consumidores para o snapshot, esta lista vai a `[]`.
 */
const ACOPLAMENTOS_CONHECIDOS: readonly string[] = [
  "src/dados/consultas/anexos.ts -> src/dados/cliente.ts",
  "src/dados/consultas/podobservar.ts -> src/dados/cliente.ts",
];

const ESTATICO =
  /(?:^|[\s;})])(?:import|export)\s[^;]*?from\s*["']([^"']+)["']/g;
const EFEITO = /(?:^|[\s;})])import\s*["']([^"']+)["']/g;
const DINAMICO = /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g;
const REQUERIDO = /\brequire\s*\(\s*["']([^"']+)["']\s*\)/g;
const COMPUTADO = /\bimport\s*\(\s*(?!["'])/g;

function arquivosDe(diretorio: string): string[] {
  const encontrados: string[] = [];
  for (const nome of readdirSync(diretorio)) {
    const caminho = join(diretorio, nome);
    if (statSync(caminho).isDirectory()) {
      encontrados.push(...arquivosDe(caminho));
    } else if (/\.tsx?$/.test(caminho)) {
      encontrados.push(caminho);
    }
  }
  return encontrados;
}

function comoRepositorio(caminho: string): string {
  return relative(RAIZ, caminho).split("\\").join("/");
}

function especificadoresDe(texto: string): {
  modulos: string[];
  computados: number;
} {
  const modulos: string[] = [];
  for (const padrao of [ESTATICO, EFEITO, DINAMICO, REQUERIDO]) {
    for (const achado of texto.matchAll(padrao)) {
      if (achado[1]) modulos.push(achado[1]);
    }
  }
  return { modulos, computados: [...texto.matchAll(COMPUTADO)].length };
}

function resolverRelativo(
  deQuem: string,
  especificador: string,
): string | null {
  if (!especificador.startsWith(".")) return null;
  const base = resolve(dirname(deQuem), especificador);
  const candidatos = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    join(base, "index.ts"),
    join(base, "index.tsx"),
  ];
  for (const candidato of candidatos) {
    if (existsSync(candidato) && statSync(candidato).isFile()) return candidato;
  }
  return null;
}

type Varredura = {
  arestas: string[];
  exemplos: Map<string, string>;
  computados: number;
  visitados: number;
};

function varrer(): Varredura {
  const visitados = new Set<string>();
  const arestas = new Set<string>();
  const exemplos = new Map<string, string>();
  let computados = 0;

  const fila = arquivosDe(DIRETORIO_DE_ENTRADA).map((arquivo) => ({
    arquivo,
    cadeia: [comoRepositorio(arquivo)],
  }));

  while (fila.length > 0) {
    const atual = fila.shift();
    if (!atual || visitados.has(atual.arquivo)) continue;
    visitados.add(atual.arquivo);

    const origem = comoRepositorio(atual.arquivo);
    const { modulos, computados: quantos } = especificadoresDe(
      readFileSync(atual.arquivo, "utf8"),
    );
    computados += quantos;

    for (const especificador of modulos) {
      if (DRIVERS_DE_BANCO.has(especificador)) {
        const aresta = `${origem} -> ${especificador}`;
        arestas.add(aresta);
        if (!exemplos.has(aresta))
          exemplos.set(
            aresta,
            [...atual.cadeia, especificador].join("\n    → "),
          );
        continue;
      }

      const alvo = resolverRelativo(atual.arquivo, especificador);
      if (!alvo) continue;

      const destino = comoRepositorio(alvo);
      if (CLIENTES_DE_BANCO.has(destino)) {
        const aresta = `${origem} -> ${destino}`;
        arestas.add(aresta);
        if (!exemplos.has(aresta))
          exemplos.set(aresta, [...atual.cadeia, destino].join("\n    → "));
        continue;
      }

      fila.push({ arquivo: alvo, cadeia: [...atual.cadeia, destino] });
    }
  }

  return {
    arestas: [...arestas].sort(),
    exemplos,
    computados,
    visitados: visitados.size,
  };
}

describe("guarda de banco no código de renderização", () => {
  const varredura = varrer();

  test("a varredura alcança o grafo de src/app", () => {
    expect(varredura.visitados).toBeGreaterThan(50);
  });

  test("nenhum import dinâmico com caminho computado escapa da análise", () => {
    expect(varredura.computados).toBe(0);
  });

  test("o acoplamento com o banco é exatamente o conhecido", () => {
    const relatorio = varredura.arestas
      .map((aresta) => `  ${aresta}\n    ${varredura.exemplos.get(aresta)}`)
      .join("\n");
    expect(
      varredura.arestas,
      `Acoplamentos encontrados:\n${relatorio}`,
    ).toEqual([...ACOPLAMENTOS_CONHECIDOS].sort());
  });

  test("a lista de proibidos cobre clientes e drivers", () => {
    for (const cliente of CLIENTES_DE_BANCO) {
      expect(existsSync(join(RAIZ, cliente))).toBe(true);
    }
    expect(DRIVERS_DE_BANCO.has("pg")).toBe(true);
  });
});
