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
const ACOPLAMENTOS_CONHECIDOS: readonly string[] = [
  "src/dados/consultas/anexos.ts -> src/dados/cliente.ts",
  "src/dados/consultas/podobservar.ts -> src/dados/cliente.ts",
];

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
 * ## A distinção que este bloco depende
 *
 * `publicado/tipos.ts` importa `AnexoPublico` de `consultas/anexos.ts` com
 * `import type`. Essa forma é apagada na compilação: o módulo não é
 * carregado, e `drizzle-orm/pg-core` não entra em lugar nenhum por causa
 * dela. Por isso a aresta aparece em `arestasDeTipo`, e não em `arestas`.
 *
 * Ela existe de propósito. É `AnexoPublico` que as duas asserções de tipo no
 * fim de `publicado/tipos.ts` usam para tornar erro de compilação qualquer
 * divergência entre o snapshot e o contrato de leitura. Removê-la exigiria ou
 * duplicar a interface — que é o que aquelas asserções existem para impedir —
 * ou extrair `AnexoPublico` para um módulo próprio, que é trabalho de outro
 * lote.
 *
 * A lista é exata, como a do bloco 1: uma aresta de tipo nova precisa ser
 * escrita aqui para passar, e não entra em silêncio.
 */
const ARESTAS_DE_TIPO_CONHECIDAS: readonly string[] = [
  "src/dados/publicado/tipos.ts -> src/dados/consultas/anexos.ts",
];

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

  test("as arestas apagadas na compilação são exatamente as conhecidas", () => {
    expect(
      varredura.arestasDeTipo,
      `Arestas de tipo:\n${relatar(varredura, varredura.arestasDeTipo)}`,
    ).toEqual([...ARESTAS_DE_TIPO_CONHECIDAS].sort());
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
});
