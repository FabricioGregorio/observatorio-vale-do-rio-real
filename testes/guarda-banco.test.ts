/**
 * Guardas contra a reintrodução do PostgreSQL.
 *
 * Até 2026-09-24 estas guardas perguntavam se o **site** alcançava um cliente
 * de banco. Faziam sentido enquanto o banco existia e o objetivo era mantê-lo
 * fora das páginas. Com o Lote B.1 o banco saiu do repositório inteiro, e a
 * pergunta mudou: não é mais "o site chega lá?", é "isso voltou?".
 *
 * Quatro perguntas, dois métodos:
 *
 * 1. **grafo** — o código de renderização pública alcança um cliente, um
 *    schema ou uma consulta de banco?
 * 2. **grafo** — a camada publicada, que o site lê, alcança qualquer uma
 *    dessas coisas, inclusive por `import type`?
 * 3. **texto** — algum arquivo do código ativo versionado carrega vocabulário
 *    de banco: `DATABASE_URL`, `new Pool(`, import de `pg` ou de Drizzle,
 *    caminho para `db/schema`, nome de view?
 * 4. **ausência física** — os arquivos, comandos e dependências que
 *    sustentavam o banco continuam fora do repositório?
 *
 * ## O que conta como "código ativo"
 *
 * O que o Git versiona sob `src/`, `scripts/` e `testes/`. A lista sai de
 * `git ls-files`, e não de uma varredura do disco, por duas razões: rascunho
 * não rastreado não é código do projeto, e artefato ignorado — `.next/`,
 * `tmp/`, `node_modules/` — não é fonte. Se o Git não puder responder, o
 * teste falha em vez de passar por omissão.
 *
 * `db/migrations/` fica **fora** da varredura de texto, e é a única exclusão
 * por diretório: aquilo é histórico morto, SQL que registra como o banco foi
 * construído e que nenhum comando deste repositório executa. A guarda 4
 * confirma que continua morto.
 *
 * ## Os limites do varredor de grafo, declarados em vez de escondidos
 *
 * Ele segue especificadores de módulo com expressão regular, incluindo
 * `import(...)` dinâmico e `require(...)`, e resolve cada um contra o disco.
 * Não é análise de AST: a versão de TypeScript deste repositório não expõe
 * mais a API clássica do compilador, e montar um analisador próprio seria
 * infraestrutura desproporcional.
 *
 * - um especificador **computado** (`import(variavel)`) não pode ser
 *   resolvido. Em vez de ignorá-lo, a varredura o conta e o teste falha: uma
 *   parte do grafo que não dá para analisar não é o mesmo que uma parte
 *   limpa;
 * - um `from "..."` dentro de comentário ou string contaria como import. Isso
 *   produz falso **positivo**, barulhento e fácil de diagnosticar, e nunca
 *   falso negativo, que seria silencioso;
 * - `import type` é registrado à parte e **encerra** a travessia, porque é
 *   apagado na compilação: o módulo não é carregado. As arestas de tipo
 *   continuam visíveis e travadas por lista exata.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { describe, expect, test } from "vitest";

const RAIZ = process.cwd();

/** Captura a cláusula antes do `from`, para distinguir `import type`. */
const ESTATICO =
  /(?:^|[\s;})])((?:import|export)\s[^;]*?)from\s*["']([^"']+)["']/g;
const EFEITO = /(?:^|[\s;})])import\s*["']([^"']+)["']/g;
const DINAMICO = /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g;
const REQUERIDO = /\brequire\s*\(\s*["']([^"']+)["']\s*\)/g;
const COMPUTADO = /\bimport\s*\(\s*(?!["'])/g;

/** `import type { X } from` e `export type { X } from`; nada mais. */
const SOMENTE_TIPO = /^(?:import|export)\s+type\s/;

/** Pacotes de banco. Nenhum deles está instalado — e é para continuar assim. */
const PACOTES_DE_BANCO = (especificador: string): boolean =>
  especificador === "pg" ||
  especificador === "postgres" ||
  especificador === "pg-connection-string" ||
  especificador.startsWith("drizzle-orm") ||
  especificador.startsWith("drizzle-kit") ||
  especificador.startsWith("@neondatabase/");

/**
 * Caminhos que não podem voltar a existir nem ser alcançados.
 *
 * A regra é por **forma**, não por lista de arquivos conhecidos: qualquer
 * coisa sob `db/` que não seja migração, qualquer coisa sob
 * `src/dados/consultas/`, e os dois clientes de banco pelos seus nomes. Uma
 * lista de nomes exatos envelheceria no dia em que alguém recriasse o cliente
 * com outro nome.
 */
const CAMINHOS_DE_BANCO = (caminho: string): boolean =>
  (caminho.startsWith("db/") && !caminho.startsWith("db/migrations/")) ||
  caminho.startsWith("src/dados/consultas/") ||
  /(?:^|\/)cliente(?:Manutencao)?\.ts$/.test(caminho) ||
  /(?:^|\/)drizzle\.config\.ts$/.test(caminho);

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

type Referencia = {
  readonly especificador: string;
  readonly somenteTipo: boolean;
};

/**
 * Referências a outros módulos, classificadas.
 *
 * `import type { X } from "y"` é apagado na compilação: não cria dependência
 * em tempo de execução, e nada além de `y` passa a ser carregado por causa
 * dele. `import { type X, Y }` não conta como import de tipo: `Y` é valor, e
 * o módulo é carregado.
 */
function referenciasDe(texto: string): {
  referencias: Referencia[];
  computados: number;
} {
  const referencias: Referencia[] = [];

  for (const achado of texto.matchAll(ESTATICO)) {
    const clausula = achado[1];
    const especificador = achado[2];
    if (clausula && especificador)
      referencias.push({
        especificador,
        somenteTipo: SOMENTE_TIPO.test(clausula.trimStart()),
      });
  }

  for (const padrao of [EFEITO, DINAMICO, REQUERIDO]) {
    for (const achado of texto.matchAll(padrao)) {
      if (achado[1])
        referencias.push({ especificador: achado[1], somenteTipo: false });
    }
  }

  return { referencias, computados: [...texto.matchAll(COMPUTADO)].length };
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
  /** Arestas que existem em tempo de execução. */
  readonly arestas: string[];
  /** Arestas apagadas na compilação: `import type`. Não carregam módulo. */
  readonly arestasDeTipo: string[];
  readonly exemplos: ReadonlyMap<string, string>;
  readonly computados: number;
  readonly visitados: number;
  /** Cada arquivo alcançado, em caminho de repositório. */
  readonly alcancados: readonly string[];
};

function varrer(entradas: readonly string[]): Varredura {
  const visitados = new Set<string>();
  const arestas = new Set<string>();
  const arestasDeTipo = new Set<string>();
  const exemplos = new Map<string, string>();
  let computados = 0;

  const fila = entradas.map((arquivo) => ({
    arquivo,
    cadeia: [comoRepositorio(arquivo)],
  }));

  while (fila.length > 0) {
    const atual = fila.shift();
    if (!atual || visitados.has(atual.arquivo)) continue;
    visitados.add(atual.arquivo);

    const origem = comoRepositorio(atual.arquivo);
    const { referencias, computados: quantos } = referenciasDe(
      readFileSync(atual.arquivo, "utf8"),
    );
    computados += quantos;

    const registrar = (destino: string, somenteTipo: boolean) => {
      const aresta = `${origem} -> ${destino}`;
      (somenteTipo ? arestasDeTipo : arestas).add(aresta);
      if (!exemplos.has(aresta))
        exemplos.set(aresta, [...atual.cadeia, destino].join("\n    → "));
    };

    for (const { especificador, somenteTipo } of referencias) {
      if (!especificador.startsWith(".")) {
        if (PACOTES_DE_BANCO(especificador))
          registrar(especificador, somenteTipo);
        continue;
      }

      const alvo = resolverRelativo(atual.arquivo, especificador);
      if (!alvo) continue;

      const destino = comoRepositorio(alvo);
      if (CAMINHOS_DE_BANCO(destino)) {
        registrar(destino, somenteTipo);
        continue;
      }

      /*
        Import de tipo encerra a travessia. O módulo não é carregado em tempo
        de execução, então nada que ele importe passa a ser alcançável por
        causa desta aresta.
      */
      if (somenteTipo) continue;

      fila.push({ arquivo: alvo, cadeia: [...atual.cadeia, destino] });
    }
  }

  return {
    arestas: [...arestas].sort(),
    arestasDeTipo: [...arestasDeTipo].sort(),
    exemplos,
    computados,
    visitados: visitados.size,
    alcancados: [...visitados].map(comoRepositorio).sort(),
  };
}

function relatar(varredura: Varredura, arestas = varredura.arestas): string {
  return arestas
    .map((aresta) => `  ${aresta}\n    ${varredura.exemplos.get(aresta)}`)
    .join("\n");
}

/* ───────────── 1. o site não alcança cliente, schema nem consulta ────────── */

describe("guarda de banco no código de renderização", () => {
  const varredura = varrer(arquivosDe(join(RAIZ, "src", "app")));

  test("a varredura alcança o grafo de src/app", () => {
    expect(varredura.visitados).toBeGreaterThan(50);
  });

  test("nenhum import dinâmico com caminho computado escapa da análise", () => {
    expect(varredura.computados).toBe(0);
  });

  /*
    Conjunto vazio, e a igualdade é exata. Não existe lista de acoplamentos
    tolerados: acrescentar um item aqui seria reintroduzir o banco no site, e
    isso deve custar uma conversa, não uma linha.
  */
  test("nenhum acoplamento com banco, de nenhum tipo", () => {
    expect(
      varredura.arestas,
      `Acoplamentos encontrados:\n${relatar(varredura)}`,
    ).toEqual([]);
    expect(
      varredura.arestasDeTipo,
      `Arestas de tipo:\n${relatar(varredura, varredura.arestasDeTipo)}`,
    ).toEqual([]);
  });
});

/* ──────────── 2. a camada publicada é um grafo puro ──────────────────── */

/**
 * `src/dados/publicado/**` é o que o site lê. Ele não pode alcançar cliente,
 * schema nem consulta — não por higiene, mas porque cada uma dessas arestas
 * arrastaria código de banco para o grafo de uma página estática.
 *
 * As duas listas são vazias e as igualdades são exatas. Uma aresta de tipo
 * nova precisa ser escrita aqui para passar, e não entra em silêncio.
 */
describe("camada publicada sem dependência de banco", () => {
  const publicado = join(RAIZ, "src", "dados", "publicado");
  const varredura = varrer(arquivosDe(publicado));

  test("nenhuma dependência em tempo de execução", () => {
    expect(
      varredura.arestas,
      `Dependências de runtime proibidas:\n${relatar(varredura)}`,
    ).toEqual([]);
  });

  test("nenhuma dependência apagada na compilação tampouco", () => {
    expect(
      varredura.arestasDeTipo,
      `Arestas de tipo:\n${relatar(varredura, varredura.arestasDeTipo)}`,
    ).toEqual([]);
  });

  /*
    A varredura precisa mesmo alcançar o contrato do anexo, e não passar ao
    largo dele. Sem esta conferência, mover `AnexoPublico` para um lugar que a
    varredura não visita faria os testes acima passarem sem provar nada.
  */
  test("a varredura alcança o módulo puro do contrato do anexo", () => {
    expect(readFileSync(join(publicado, "tipos.ts"), "utf8")).toMatch(
      /from "\.\.\/anexo-publico"/,
    );
    expect(varredura.visitados).toBeGreaterThanOrEqual(3);
  });

  test("nenhum import dinâmico com caminho computado escapa da análise", () => {
    expect(varredura.computados).toBe(0);
  });

  test("a camada não lê variável de ambiente alguma", () => {
    for (const arquivo of arquivosDe(publicado)) {
      expect(
        readFileSync(arquivo, "utf8"),
        comoRepositorio(arquivo),
      ).not.toMatch(/process\.env/);
    }
  });

  test("o módulo puro do anexo não importa nada", () => {
    const { referencias } = referenciasDe(
      readFileSync(join(RAIZ, "src", "dados", "anexo-publico.ts"), "utf8"),
    );
    expect(referencias).toEqual([]);
  });

  test("o contrato público do episódio também não lê ambiente", () => {
    const fonte = readFileSync(
      join(RAIZ, "src", "dados", "podobservar-publico.ts"),
      "utf8",
    );
    expect(fonte).not.toMatch(/process\.env/);
  });
});

/* ──────── 3. o vocabulário de banco não aparece no código ativo ────────── */

/**
 * As guardas acima seguem arestas de módulo. Esta olha o **texto** de cada
 * arquivo versionado e existe para o caso que as outras não pegam: alguém
 * escrever `new Pool(...)`, ler uma credencial ou montar SQL contra uma view
 * dentro de um arquivo que já está no grafo, sem importar nada novo.
 *
 * Duas decisões tornam o teste utilizável em vez de barulhento.
 *
 * **Comentários são removidos antes da comparação.** Este repositório
 * documenta o que fez: vários arquivos explicam, em prosa, que já não
 * consultam view nenhuma e que não leem credencial. Procurar as palavras no
 * texto bruto acusaria justamente a documentação de ter virado o problema que
 * ela descreve. O que se quer proibir é código.
 *
 * **Os padrões são estreitos.** `pg` casa só como especificador de módulo,
 * nunca como as duas letras no meio de uma palavra; `vw_` casa só como
 * prefixo de identificador. As cadeias de texto continuam valendo, porque é
 * dentro de uma que um `import("pg")` se esconderia.
 *
 * Este arquivo é a única exceção, e não é permissão: é onde os padrões estão
 * escritos. Um teste que se acusasse a si mesmo por definir a proibição não
 * mediria nada.
 */
describe("vocabulário de banco no código ativo", () => {
  const PROIBIDOS: readonly [string, RegExp][] = [
    ["DATABASE_URL", /\bDATABASE_URL\b/],
    ["import de pg", /(?:from|import|require)\s*\(?\s*["']pg["']/],
    ["drizzle", /["']drizzle-(?:orm|kit)(?:\/[^"']*)?["']/],
    ["@neondatabase", /["']@neondatabase\//],
    ["db/", /["'][^"']*\bdb\/(?:schema|cliente)\b/],
    ["consultas/", /["'][^"']*\bdados\/consultas\//],
    ["new Pool", /\bnew\s+Pool\s*\(/],
    ["view vw_", /\bvw_[a-z]/],
    ["view do schema", /\bvw(?:Anexo|Episodio)Publico\b/],
    ["URL de PostgreSQL", /\bpostgres(?:ql)?:\/\//],
  ];

  /**
   * Remove comentário de bloco e de linha. O `(?<!:)` poupa o `//` de uma URL
   * dentro de uma cadeia de texto, que não é comentário e cortaria o resto da
   * linha junto.
   */
  const semComentarios = (texto: string): string =>
    texto.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(?<!:)\/\/.*$/gm, " ");

  const ESTE_ARQUIVO = "testes/guarda-banco.test.ts";

  /**
   * O código ativo, segundo o Git.
   *
   * Rascunho não rastreado não é código do projeto — e o arquivo de trabalho
   * do proprietário, que o repositório não versiona, não é assunto de uma
   * guarda de arquitetura.
   */
  const versionados = execFileSync(
    "git",
    ["ls-files", "src", "scripts", "testes"],
    { cwd: RAIZ, encoding: "utf8" },
  )
    .split("\n")
    .map((linha) => linha.trim())
    .filter((linha) => /\.(?:ts|tsx|mjs|cjs|js)$/.test(linha))
    .filter((linha) => linha !== ESTE_ARQUIVO)
    /*
      O índice do Git ainda lista o que foi removido do disco e não foi
      registrado. A varredura é sobre a árvore de trabalho: arquivo que não
      existe não carrega vocabulário nenhum.
    */
    .filter((linha) => existsSync(join(RAIZ, linha)));

  test("a lista de arquivos ativos é plausível", () => {
    expect(versionados.length).toBeGreaterThan(100);
    expect(versionados).toContain("src/dados/publicado/leitura.ts");
    expect(versionados).toContain("testes/publicado-contrato.test.ts");
  });

  test("nenhum arquivo ativo carrega vocabulário de banco", () => {
    const achados: string[] = [];
    for (const arquivo of versionados) {
      const texto = semComentarios(readFileSync(join(RAIZ, arquivo), "utf8"));
      for (const [nome, padrao] of PROIBIDOS) {
        if (padrao.test(texto)) achados.push(`${arquivo}: ${nome}`);
      }
    }
    expect(
      achados,
      `Vocabulário de banco encontrado:\n${achados.join("\n")}`,
    ).toEqual([]);
  });
});

/* ──────────── 4. o que foi removido continua fora ────────────────────── */

/**
 * A ausência também é contrato.
 *
 * As guardas de grafo e de texto pegam o banco **voltando pela porta da
 * frente**: um import, uma credencial, um `new Pool`. Esta pega o caminho
 * mais provável de reintrodução — alguém restaurar um arquivo do histórico,
 * ou reinstalar a dependência "só para uma consulta rápida".
 */
describe("o banco continua fora do repositório", () => {
  const AUSENTES = [
    "db/schema.ts",
    "db/cliente.ts",
    "drizzle.config.ts",
    "src/dados/cliente.ts",
    "src/dados/clienteManutencao.ts",
    "src/dados/consultas",
  ];

  test.each(AUSENTES)("%s não existe", (caminho) => {
    expect(existsSync(join(RAIZ, caminho))).toBe(false);
  });

  const pacote = JSON.parse(
    readFileSync(join(RAIZ, "package.json"), "utf8"),
  ) as {
    scripts: Record<string, string>;
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
  };

  test("nenhuma dependência de PostgreSQL está declarada", () => {
    const declaradas = [
      ...Object.keys(pacote.dependencies),
      ...Object.keys(pacote.devDependencies),
    ];
    for (const nome of declaradas) {
      expect(PACOTES_DE_BANCO(nome), nome).toBe(false);
      expect(nome, nome).not.toBe("@types/pg");
    }
  });

  /*
    Um comando que só quebra é pior do que comando nenhum: ele parece uma
    operação disponível. `migrar`, `gerar-migracao`, `pendencias`,
    `gerar-snapshot` e `seed` saíram com o banco que executavam.
  */
  test("nenhum comando do pacote invoca banco ou migração", () => {
    for (const [nome, comando] of Object.entries(pacote.scripts)) {
      expect(nome, nome).not.toMatch(/migra|seed|pendencias/i);
      expect(comando, nome).not.toMatch(/drizzle|psql|postgres|migrate/i);
    }
  });

  /**
   * As migrações continuam em `db/migrations/` como histórico: elas registram
   * como o banco foi construído, e apagar isso apagaria a história da
   * publicação. O que não pode existir é qualquer forma de executá-las.
   */
  test("db/ guarda apenas o histórico de migrações", () => {
    const conteudo = readdirSync(join(RAIZ, "db"));
    expect(conteudo.filter((nome) => nome.endsWith(".ts"))).toEqual([]);
    expect(conteudo).toContain("migrations");
  });
});
