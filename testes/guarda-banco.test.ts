/**
 * Guardas de acoplamento com PostgreSQL.
 *
 * Três perguntas, um varredor:
 *
 * 1. o código de renderização pública chega a um cliente de banco?
 * 2. o contrato público do episódio chega a `db/schema`, ao Drizzle ou às
 *    consultas?
 * 3. a camada publicada inteira — `src/dados/publicado/**`, que o site vai
 *    ler — chega a qualquer uma dessas coisas?
 *
 * O varredor segue os **especificadores de módulo** com expressão regular,
 * incluindo `import(...)` dinâmico e `require(...)`, e resolve cada um contra
 * o disco. É mais forte que procurar uma palavra no texto: um acoplamento só
 * é registrado quando o caminho resolve para um arquivo que existe e que está
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
 *   escolhido nessa direção de propósito;
 * - `import type` é registrado à parte e **encerra** a travessia, porque é
 *   apagado na compilação: o módulo não é carregado, e nada além dele passa a
 *   ser alcançável por causa daquela aresta. Tratá-lo como import de valor
 *   atribuiria à origem dependências que ela não tem em tempo de execução —
 *   que era justamente o que fazia a camada publicada parecer acoplada ao
 *   cliente de banco através de um tipo. As arestas de tipo continuam
 *   visíveis e travadas por lista exata, não ignoradas.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { describe, expect, test } from "vitest";

const RAIZ = process.cwd();

/** Módulos que abrem `Pool` de PostgreSQL. */
const CLIENTES_DE_BANCO = [
  "src/dados/cliente.ts",
  "src/dados/clienteManutencao.ts",
  "db/cliente.ts",
];

/** Captura a cláusula antes do `from`, para distinguir `import type`. */
const ESTATICO =
  /(?:^|[\s;})])((?:import|export)\s[^;]*?)from\s*["']([^"']+)["']/g;
const EFEITO = /(?:^|[\s;})])import\s*["']([^"']+)["']/g;
const DINAMICO = /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g;
const REQUERIDO = /\brequire\s*\(\s*["']([^"']+)["']\s*\)/g;
const COMPUTADO = /\bimport\s*\(\s*(?!["'])/g;

/** `import type { X } from` e `export type { X } from`; nada mais. */
const SOMENTE_TIPO = /^(?:import|export)\s+type\s/;

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
 * dele. Por isso a distinção existe, e por isso um import de tipo **encerra**
 * a travessia em `varrer` em vez de continuar por dentro do módulo.
 *
 * `import { type X, Y }` não conta como import de tipo: `Y` é valor, e o
 * módulo é carregado. Só a forma com `type` logo após a palavra-chave é
 * inteiramente apagada.
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

type Proibicao = {
  /** Caminhos de repositório que não podem ser alcançados. */
  readonly arquivos: (caminho: string) => boolean;
  /** Pacotes externos que não podem ser importados. */
  readonly pacotes: (especificador: string) => boolean;
};

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

function varrer(entradas: readonly string[], proibicao: Proibicao): Varredura {
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
        if (proibicao.pacotes(especificador))
          registrar(especificador, somenteTipo);
        continue;
      }

      const alvo = resolverRelativo(atual.arquivo, especificador);
      if (!alvo) continue;

      const destino = comoRepositorio(alvo);
      if (proibicao.arquivos(destino)) {
        registrar(destino, somenteTipo);
        continue;
      }

      /*
        Import de tipo encerra a travessia. O módulo não é carregado em tempo
        de execução, então nada que ele importe passa a ser alcançável por
        causa desta aresta. Continuar por dentro dele atribuiria à origem
        dependências que ela não tem — e era exatamente esse o erro que faria
        a camada publicada parecer acoplada ao cliente de banco através de um
        `import type`.
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

/* ───────────────── 1. o app não chega a um cliente de banco ──────────── */

/**
 * Acoplamentos que a arquitetura de hoje tem e o Lote B remove.
 *
 * Cada entrada é a aresta que introduz a dependência: quem importa → o que é
 * importado. Ao migrar os consumidores para o snapshot, esta lista vai a `[]`.
 *
 * A igualdade é exata, e não "está contido", para que remover um acoplamento
 * também exija atualizar esta lista — é o que torna o progresso do Lote B
 * visível no diff em vez de silencioso.
 */
/**
 * Vazia, e é para continuar vazia.
 *
 * Até o Lote B esta lista tinha duas entradas: o grafo de `src/app` alcançava
 * `cliente.ts` por `consultas/anexos.ts` e `consultas/podobservar.ts`. Com o
 * site lendo o snapshot versionado, nenhuma página chega ao banco — e a forma
 * honesta de travar isso não é manter uma permissão que cresce, é exigir
 * conjunto vazio. Acrescentar um item aqui é reintroduzir o banco no site, e
 * deve custar uma conversa, não uma linha.
 */
const ACOPLAMENTOS_CONHECIDOS: readonly string[] = [];

describe("guarda de banco no código de renderização", () => {
  const varredura = varrer(arquivosDe(join(RAIZ, "src", "app")), {
    arquivos: (caminho) => CLIENTES_DE_BANCO.includes(caminho),
    pacotes: (especificador) =>
      especificador === "pg" || especificador === "drizzle-orm/node-postgres",
  });

  test("a varredura alcança o grafo de src/app", () => {
    expect(varredura.visitados).toBeGreaterThan(50);
  });

  test("nenhum import dinâmico com caminho computado escapa da análise", () => {
    expect(varredura.computados).toBe(0);
  });

  test("o acoplamento com o banco é exatamente o conhecido", () => {
    expect(
      varredura.arestas,
      `Acoplamentos encontrados:\n${relatar(varredura)}`,
    ).toEqual([...ACOPLAMENTOS_CONHECIDOS].sort());
  });

  test("a lista de proibidos cobre os clientes existentes", () => {
    for (const cliente of CLIENTES_DE_BANCO) {
      expect(existsSync(join(RAIZ, cliente))).toBe(true);
    }
  });
});

/* ──────── 2. o contrato público do episódio é livre de banco ─────────── */

/**
 * `dados/podobservar-publico.ts` existe para que a camada de snapshot possa
 * validar um episódio sem arrastar `db/schema` junto. Se ele voltar a
 * depender do banco — direta ou transitivamente —, o motivo da extração
 * desaparece em silêncio. Este teste é o que impede isso.
 *
 * O grafo desejado:
 *
 *     podobservar-publico.ts
 *        ↑                ↑
 *     consultas/      publicado/
 */
describe("contrato público do episódio sem dependência de banco", () => {
  const varredura = varrer(
    [join(RAIZ, "src", "dados", "podobservar-publico.ts")],
    {
      arquivos: (caminho) =>
        CLIENTES_DE_BANCO.includes(caminho) ||
        caminho === "db/schema.ts" ||
        caminho.startsWith("src/dados/consultas/"),
      pacotes: (especificador) =>
        especificador === "pg" || especificador.startsWith("drizzle-orm"),
    },
  );

  test("não alcança schema, Drizzle, consultas nem cliente", () => {
    expect(
      varredura.arestas,
      `Dependências proibidas:\n${relatar(varredura)}`,
    ).toEqual([]);
  });

  /*
    A asserção é sobre `process.env`, não sobre a palavra `DATABASE_URL`: o
    cabeçalho do módulo cita a variável justamente para declarar que não a lê,
    e um teste que procurasse o nome acusaria a própria documentação. Ler
    ambiente nenhum é a garantia mais forte e a que não tem falso positivo.
  */
  test("não lê variável de ambiente alguma", () => {
    const fonte = readFileSync(
      join(RAIZ, "src", "dados", "podobservar-publico.ts"),
      "utf8",
    );
    expect(fonte).not.toMatch(/process\.env/);
  });

  test("a definição é uma só: a consulta reexporta, não redefine", () => {
    const consulta = readFileSync(
      join(RAIZ, "src", "dados", "consultas", "podobservar.ts"),
      "utf8",
    );
    expect(consulta).toMatch(/from "\.\.\/podobservar-publico"/);
    expect(consulta).not.toMatch(/episodioPublicoSchema\s*=\s*z\.object/);
  });
});

/* ──────────── 3. a camada publicada é um grafo puro ──────────────────── */

/**
 * `src/dados/publicado/**` é o que o site vai ler no Lote B. Ele não pode
 * alcançar `db/schema`, Drizzle, cliente de banco nem consultas — não por
 * higiene, mas porque cada uma dessas arestas arrasta código de banco para o
 * grafo de uma página estática.
 *
 * ## Zero nas duas categorias
 *
 * Até 2026-09-23 restava uma aresta: `publicado/tipos.ts` importava
 * `AnexoPublico` de `consultas/anexos.ts` com `import type`. Era apagada na
 * compilação e não trazia `drizzle-orm/pg-core` para lugar nenhum — mas era
 * uma seta de `publicado/` para `consultas/` no diagrama, e uma seta dessas
 * convida, com o tempo, a uma segunda que não seja de tipo.
 *
 * O tipo foi para `dados/anexo-publico.ts`, puro, do qual os dois lados
 * dependem. As duas asserções no fim de `publicado/tipos.ts` continuam
 * comparando o schema do arquivo com o mesmo `AnexoPublico` — a definição
 * não foi duplicada, foi movida.
 *
 * A lista está vazia e a igualdade é exata. Uma aresta de tipo nova precisa
 * ser escrita aqui para passar, e não entra em silêncio.
 */
const ARESTAS_DE_TIPO_CONHECIDAS: readonly string[] = [];

describe("camada publicada sem dependência de banco", () => {
  const varredura = varrer(
    arquivosDe(join(RAIZ, "src", "dados", "publicado")),
    {
      arquivos: (caminho) =>
        CLIENTES_DE_BANCO.includes(caminho) ||
        caminho === "db/schema.ts" ||
        caminho.startsWith("src/dados/consultas/"),
      pacotes: (especificador) =>
        especificador === "pg" || especificador.startsWith("drizzle-orm"),
    },
  );

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
    ).toEqual([...ARESTAS_DE_TIPO_CONHECIDAS].sort());
  });

  /*
    A varredura precisa mesmo alcançar o contrato do anexo, e não passar
    ao largo dele. Sem esta conferência, mover `AnexoPublico` para um lugar
    que a varredura não visita faria os dois testes acima passarem sem
    provar nada.
  */
  test("a varredura alcança o módulo puro do contrato do anexo", () => {
    expect(
      readFileSync(join(RAIZ, "src", "dados", "publicado", "tipos.ts"), "utf8"),
    ).toMatch(/from "\.\.\/anexo-publico"/);
    expect(varredura.visitados).toBeGreaterThanOrEqual(3);
  });

  test("nenhum import dinâmico com caminho computado escapa da análise", () => {
    expect(varredura.computados).toBe(0);
  });

  test("a camada não lê variável de ambiente alguma", () => {
    for (const arquivo of arquivosDe(join(RAIZ, "src", "dados", "publicado"))) {
      expect(
        readFileSync(arquivo, "utf8"),
        comoRepositorio(arquivo),
      ).not.toMatch(/process\.env/);
    }
  });

  test("a definição do anexo é uma só: a consulta reexporta, não redefine", () => {
    const consulta = readFileSync(
      join(RAIZ, "src", "dados", "consultas", "anexos.ts"),
      "utf8",
    );
    expect(consulta).toMatch(/from "\.\.\/anexo-publico"/);
    expect(consulta).not.toMatch(/type AnexoPublico = \{/);
  });

  test("o módulo puro do anexo não importa nada", () => {
    const { referencias } = referenciasDe(
      readFileSync(join(RAIZ, "src", "dados", "anexo-publico.ts"), "utf8"),
    );
    expect(referencias).toEqual([]);
  });
});

/* ──────── 4. o vocabulário do banco não reaparece no grafo público ─────── */

/**
 * As três guardas acima seguem **arestas de módulo**: elas acusam quando o
 * site alcança um cliente de banco. Esta quarta olha o **texto** de cada
 * arquivo que o site alcança, e existe para o caso que as outras não pegam —
 * alguém escrever `new Pool(...)`, ler `DATABASE_URL` ou montar SQL contra
 * `vw_anexo_publico` dentro de um arquivo que já está no grafo, sem importar
 * nada novo de lugar nenhum.
 *
 * Duas decisões tornam o teste utilizável em vez de barulhento.
 *
 * **Comentários são removidos antes da comparação.** Este repositório
 * documenta o que fez: dezenas de arquivos explicam, em prosa, que já não
 * consultam `vw_anexo_publico` ou que não leem `DATABASE_URL`. Procurar as
 * palavras no texto bruto acusaria justamente a documentação de ter virado o
 * problema que ela descreve. O que se quer proibir é código.
 *
 * **Os padrões são estreitos.** `pg` casa só como especificador de módulo,
 * nunca como as duas letras no meio de uma palavra; `vw_` casa só como
 * prefixo de identificador. As cadeias de texto continuam valendo, porque é
 * dentro de uma que um `import("pg")` se esconderia.
 *
 * Não há lista de exceções, e é essa a intenção: o conjunto esperado é
 * **vazio**. Um acoplamento novo não se resolve acrescentando o arquivo a uma
 * permissão; resolve-se tirando o banco do arquivo.
 */
describe("vocabulário de banco no texto do grafo público", () => {
  const PROIBIDOS: readonly [string, RegExp][] = [
    ["DATABASE_URL", /\bDATABASE_URL\b/],
    ["import de pg", /(?:from|import|require)\s*\(?\s*["']pg["']/],
    ["drizzle", /["']drizzle-orm(?:\/[^"']*)?["']/],
    ["db/", /["'][^"']*\bdb\/(?:schema|cliente)\b/],
    ["new Pool", /\bnew\s+Pool\s*\(/],
    ["view vw_", /\bvw_[a-z]/],
    ["view do schema", /\bvw(?:Anexo|Episodio)Publico\b/],
  ];

  /**
   * Remove comentário de bloco e de linha. O `(?<!:)` poupa o `//` de uma URL
   * dentro de uma cadeia de texto, que não é comentário e cortaria o resto da
   * linha junto.
   */
  const semComentarios = (texto: string): string =>
    texto.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(?<!:)\/\/.*$/gm, " ");

  const varredura = varrer(arquivosDe(join(RAIZ, "src", "app")), {
    arquivos: () => false,
    pacotes: () => false,
  });

  test("a varredura alcança o grafo inteiro de src/app", () => {
    expect(varredura.alcancados.length).toBeGreaterThan(50);
    expect(varredura.computados).toBe(0);
  });

  test("nenhum arquivo alcançado pelo site carrega vocabulário de banco", () => {
    const achados: string[] = [];
    for (const arquivo of varredura.alcancados) {
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
