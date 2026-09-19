/**
 * Testes do gate de pendências (Tarefa 09).
 *
 * Duas partes, deliberadamente separadas:
 *
 * - as funções puras rodam sempre, sem banco;
 * - a integração roda apenas com `DATABASE_URL` e `DATABASE_URL_MANUTENCAO`, contra um PostgreSQL de
 *   verdade. Nenhum banco falso e nenhum mock de PostgreSQL: a view é SQL, e um
 *   mock provaria só que o mock funciona. Sem credencial o Vitest marca o bloco
 *   como skipped, e a ausência de cobertura fica visível em vez de silenciosa.
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

import {
  formatarTabela,
  resultado,
  semCredencial,
} from "../scripts/verificar-pendencias";
import type { Pendencia } from "../src/dados/consultas/pendencias";

const pendencia = (parcial: Partial<Pendencia> = {}): Pendencia => ({
  slug: "relatorio-parcial",
  titulo: "Relatório Parcial",
  pendencia: "anexo obrigatório sem arquivo espelhado",
  ...parcial,
});

describe("tabela legível", () => {
  test("traz cabeçalho, separador e uma linha por pendência", () => {
    const saida = formatarTabela([pendencia(), pendencia({ slug: "outro" })]);
    const linhas = saida.split("\n");

    expect(linhas).toHaveLength(4);
    expect(linhas[0]).toContain("slug");
    expect(linhas[0]).toContain("titulo");
    expect(linhas[0]).toContain("pendencia");
    expect(linhas[1]).toMatch(/^-+ {2}-+ {2}-+$/);
    expect(linhas[2]).toContain("relatorio-parcial");
    expect(linhas[3]).toContain("outro");
  });

  test("alinha as colunas pelo valor mais largo", () => {
    const saida = formatarTabela([
      pendencia({ slug: "curto" }),
      pendencia({ slug: "um-slug-bem-mais-comprido" }),
    ]);
    const [, , primeira, segunda] = saida.split("\n");

    expect(primeira?.indexOf("Relatório Parcial")).toBe(
      segunda?.indexOf("Relatório Parcial"),
    );
  });

  test("valor ausente vira travessão, nunca célula em branco", () => {
    expect(formatarTabela([pendencia({ titulo: null })])).toContain("—");
  });
});

describe("decisão do gate após consultar", () => {
  test("limpo sai com 0 e diz o que foi conferido", () => {
    const { codigo, mensagem } = resultado([]);

    expect(codigo).toBe(0);
    expect(mensagem).toContain("Nenhuma pendência");
    expect(mensagem).toContain("espelhado");
  });

  test("com pendência sai com 1 e mostra a tabela", () => {
    const { codigo, mensagem } = resultado([pendencia()]);

    expect(codigo).toBe(1);
    expect(mensagem).toContain("1 pendência");
    expect(mensagem).toContain("relatorio-parcial");
    expect(mensagem).toContain("bloqueado");
  });

  test("concorda em número", () => {
    expect(resultado([pendencia(), pendencia()]).mensagem).toContain(
      "2 pendências",
    );
  });

  /**
   * A view tem três ramos e só o primeiro filtra `exigido_pelo_edital`. Dizer
   * que toda linha é item do edital descreve errado as outras duas — foi o que
   * aconteceu com `identidade-visual`, que não é exigido e caiu pelo ramo do
   * estado documental (Tarefa 11).
   */
  test("não afirma que toda linha é item exigido pelo edital", () => {
    const { mensagem } = resultado([
      pendencia({
        slug: "identidade-visual",
        pendencia: "estado PUBLICAVEL sem arquivo espelhado",
      }),
    ]);

    expect(mensagem).not.toMatch(/documento publicado que o edital exige/);
    expect(mensagem).toContain("Nem toda linha é item exigido pelo edital");
  });
});

describe("decisão do gate sem credencial", () => {
  test("falha, em qualquer ambiente, e não afirma que está limpo", () => {
    const { codigo, mensagem } = semCredencial();

    expect(codigo).toBe(1);
    expect(mensagem).toContain("NÃO foram verificadas");
    expect(mensagem).toContain("o gate falha");
    expect(mensagem).not.toContain("Nenhuma pendência");
  });
});

/**
 * Prova negativa do gate, de fora do processo.
 *
 * A decisão pura acima diz o que a função devolve; esta diz o que o comando
 * faz. São coisas diferentes, e a que autoriza liberação é a segunda — foi
 * pelo caminho entre as duas que a garantia falsa passou antes, quando o
 * script terminava com sucesso fora do CI.
 *
 * O filho roda num diretório temporário e sem `DATABASE_URL`: nenhum
 * `.env.local` para achar, nenhuma credencial herdada. A falha tem que ser
 * imediata e legível — se ela dependesse de tentar conectar, o gate estaria
 * trocando uma garantia falsa por um timeout de rede.
 */
describe("o comando falha onde não há configuração", () => {
  test("sem DATABASE_URL e sem .env.local: sai diferente de zero, e rápido", () => {
    const vazio = mkdtempSync(join(tmpdir(), "gate-pendencias-"));
    const ambiente = { ...process.env };
    delete ambiente.DATABASE_URL;

    const inicio = Date.now();
    const filho = spawnSync(
      process.execPath,
      [
        resolve("node_modules/tsx/dist/cli.mjs"),
        resolve("scripts/verificar-pendencias.ts"),
      ],
      { cwd: vazio, env: ambiente, encoding: "utf8", timeout: 60_000 },
    );
    const duracao = Date.now() - inicio;

    expect(filho.status).not.toBe(0);

    const saida = `${filho.stdout}${filho.stderr}`;
    expect(saida).toContain("DATABASE_URL ausente");
    expect(saida).toContain("o gate falha");
    expect(saida).not.toContain("Nenhuma pendência");

    // Recusa por configuração, não por rede: nunca chegou a discar.
    expect(duracao).toBeLessThan(30_000);

    // A recusa nomeia a variável; nunca imprime o valor de nenhuma.
    expect(saida).not.toMatch(/postgres(ql)?:\/\//);

    rmSync(vazio, { recursive: true, force: true });
  });
});

/**
 * Integração: prova que a view denuncia o caso real e que o script falharia.
 * Só roda com banco; ver o cabeçalho deste arquivo.
 */
describe.skipIf(
  !process.env.DATABASE_URL || !process.env.DATABASE_URL_MANUTENCAO,
)("integração com a view (requer credenciais de leitura e manutenção)", () => {
  const SLUG = "teste-pendencia-gate-09";

  // Tipagem preguiçosa: os módulos são carregados dentro do beforeAll porque
  // Os clientes lançam erro quando a credencial correspondente não existe, e
  // o import estático rodaria mesmo com o bloco pulado.
  let db: Awaited<
    typeof import("../src/dados/clienteManutencao")
  >["dbManutencao"];
  let documento: typeof import("../db/schema")["documento"];
  let listar: typeof import("../src/dados/consultas/pendencias")["listarPendenciasDePublicacao"];
  let eq: typeof import("drizzle-orm")["eq"];

  async function limpar(): Promise<void> {
    await db.delete(documento).where(eq(documento.slug, SLUG));
  }

  beforeAll(async () => {
    ({ dbManutencao: db } = await import("../src/dados/clienteManutencao"));
    ({ documento } = await import("../db/schema"));
    ({ eq } = await import("drizzle-orm"));
    ({ listarPendenciasDePublicacao: listar } = await import(
      "../src/dados/consultas/pendencias"
    ));
    await limpar();
  });

  afterAll(async () => {
    await limpar();
  });

  test("documento exigido e publicado sem arquivo espelhado é denunciado", async () => {
    const antes = await listar();
    expect(antes.some((p) => p.slug === SLUG)).toBe(false);

    await db.insert(documento).values({
      slug: SLUG,
      titulo: "Documento de teste do gate",
      tipo: "relatorio_tecnico",
      exigidoPeloEdital: true,
      // A 0004 exige coerência: exigido_pelo_edital = true obriga
      // natureza = item_exigido. O default é o conservador.
      natureza: "item_exigido",
      status: "publicado",
      publicadoEm: new Date(),
    });

    const depois = await listar();
    const linha = depois.find((p) => p.slug === SLUG);

    expect(linha).toBeDefined();
    expect(linha?.pendencia).toBe("anexo obrigatório sem arquivo espelhado");
    expect(resultado(depois).codigo).toBe(1);
  });

  test("o mesmo documento em rascunho não é denunciado", async () => {
    await db
      .update(documento)
      .set({ status: "rascunho" })
      .where(eq(documento.slug, SLUG));

    const linhas = await listar();
    expect(linhas.some((p) => p.slug === SLUG)).toBe(false);
  });
});

/**
 * Gate existencial multiarquivo (Tarefa 11, migração 0008).
 *
 * A pendência de arquivo passou a perguntar "existe algum arquivo espelhado
 * vinculado a este documento?" em vez de "existe o vínculo marcado
 * `principal`, e o arquivo dele está espelhado?". Desde a ADR-016 e a migração
 * 0007, `principal` é só o arquivo representativo do documento — não é
 * autorização pública nem requisito de elegibilidade.
 *
 * Cada caso roda dentro de uma transação desfeita ao final, como nas validações
 * da 0007. O banco é o real e a view é a real — nenhum mock —, mas nada é
 * comitado: `testes/espelhamento-privado.test.ts` afere contagens globais do
 * acervo e o Vitest roda arquivos em paralelo, então fixture comitada aqui
 * apareceria lá como divergência. Consequência do isolamento: as consultas
 * passam pela conexão de manutenção da própria transação, e não por
 * `listarPendenciasDePublicacao()` — que já é exercida pelo bloco acima.
 */
describe.skipIf(
  !process.env.DATABASE_URL || !process.env.DATABASE_URL_MANUTENCAO,
)(
  "gate existencial multiarquivo (requer credenciais de leitura e manutenção)",
  () => {
    const PREFIXO = "teste-gate-11";

    let db: Awaited<
      typeof import("../src/dados/clienteManutencao")
    >["dbManutencao"];
    let documento: typeof import("../db/schema")["documento"];
    let arquivo: typeof import("../db/schema")["arquivo"];
    let documentoArquivo: typeof import("../db/schema")["documentoArquivo"];
    let vwAnexoPublico: typeof import("../db/schema")["vwAnexoPublico"];
    let vwPendenciaPublicacao: typeof import("../db/schema")["vwPendenciaPublicacao"];
    let eq: typeof import("drizzle-orm")["eq"];

    type Transacao = Parameters<Parameters<typeof db.transaction>[0]>[0];

    type ValoresDocumento = {
      exigidoPeloEdital?: boolean;
      natureza?: "item_exigido" | "evidencia_complementar" | "item_nao_exigido";
      estadoDocumental?:
        | "PUBLICAVEL"
        | "RESTRITO"
        | "ESPELHAVEL"
        | "IMPEDIDO"
        | "PENDENTE";
      revisaoPrivacidade?: "pendente" | "concluida" | "bloqueada";
      status?: "rascunho" | "em_revisao" | "publicado" | "arquivado";
      publicadoEm?: Date;
    };

    /** Desfaz a transação sem que o erro sentinela escape do teste. */
    class RollbackDeTeste extends Error {}

    async function emTransacaoDesfeita<T>(
      corpo: (tx: Transacao) => Promise<T>,
    ): Promise<T> {
      let valor: T | undefined;
      try {
        await db.transaction(async (tx) => {
          valor = await corpo(tx);
          throw new RollbackDeTeste();
        });
      } catch (erro) {
        if (!(erro instanceof RollbackDeTeste)) throw erro;
      }
      return valor as T;
    }

    const slugDe = (sufixo: string) => `${PREFIXO}-${sufixo}`;
    const urlDe = (sufixo: string) =>
      `https://exemplo.invalid/${PREFIXO}/${sufixo}`;

    /** Hex de 64 caracteres: `sha256` é `char(64)` e não é único. */
    let contador = 0;
    const hashDe = () => String(++contador).padStart(64, "0");

    async function criarDocumento(
      tx: Transacao,
      sufixo: string,
      valores: ValoresDocumento,
    ): Promise<string> {
      const [linha] = await tx
        .insert(documento)
        .values({
          slug: slugDe(sufixo),
          titulo: `Gate 11 — ${sufixo}`,
          tipo: "identidade_visual",
          ...valores,
        })
        .returning({ id: documento.id });

      if (!linha) throw new Error(`documento ${sufixo} não foi criado`);
      return linha.id;
    }

    async function criarArquivo(
      tx: Transacao,
      sufixo: string,
      { publico, espelhado }: { publico: boolean; espelhado: boolean },
    ): Promise<string> {
      const [linha] = await tx
        .insert(arquivo)
        .values({
          chaveStorage: `${PREFIXO}/${sufixo}`,
          bucket: PREFIXO,
          visibilidade: publico ? "publico" : "privado",
          urlPublica: publico ? urlDe(sufixo) : null,
          tipoMidia: "imagem",
          mimeType: "image/png",
          bytes: 1,
          sha256: hashDe(),
          espelhadoEm: espelhado ? new Date() : null,
        })
        .returning({ id: arquivo.id });

      if (!linha) throw new Error(`arquivo ${sufixo} não foi criado`);
      return linha.id;
    }

    async function vincular(
      tx: Transacao,
      documentoId: string,
      arquivoId: string,
      principal: boolean,
    ): Promise<void> {
      await tx
        .insert(documentoArquivo)
        .values({ documentoId, arquivoId, principal });
    }

    /** Só as pendências do documento deste caso, pelo texto. */
    async function pendenciasDe(
      tx: Transacao,
      sufixo: string,
    ): Promise<(string | null)[]> {
      const linhas = await tx
        .select()
        .from(vwPendenciaPublicacao)
        .where(eq(vwPendenciaPublicacao.slug, slugDe(sufixo)));
      return linhas.map((l) => l.pendencia);
    }

    beforeAll(async () => {
      ({ dbManutencao: db } = await import("../src/dados/clienteManutencao"));
      ({
        documento,
        arquivo,
        documentoArquivo,
        vwAnexoPublico,
        vwPendenciaPublicacao,
      } = await import("../db/schema"));
      ({ eq } = await import("drizzle-orm"));
    });

    test("Caso A — arquivo público elegível com principal=false não gera pendência", async () => {
      const pendencias = await emTransacaoDesfeita(async (tx) => {
        const doc = await criarDocumento(tx, "caso-a", {
          exigidoPeloEdital: false,
          natureza: "item_nao_exigido",
          estadoDocumental: "PUBLICAVEL",
          revisaoPrivacidade: "concluida",
          status: "publicado",
          publicadoEm: new Date(),
        });
        const arq = await criarArquivo(tx, "caso-a", {
          publico: true,
          espelhado: true,
        });
        await vincular(tx, doc, arq, false);

        return pendenciasDe(tx, "caso-a");
      });

      expect(pendencias).toEqual([]);
    });

    test("Caso B — documento publicável sem nenhum arquivo espelhado continua pendente", async () => {
      const pendencias = await emTransacaoDesfeita(async (tx) => {
        const doc = await criarDocumento(tx, "caso-b", {
          estadoDocumental: "PUBLICAVEL",
          revisaoPrivacidade: "concluida",
        });
        const arq = await criarArquivo(tx, "caso-b", {
          publico: false,
          espelhado: false,
        });
        await vincular(tx, doc, arq, false);

        return pendenciasDe(tx, "caso-b");
      });

      expect(pendencias).toEqual(["estado PUBLICAVEL sem arquivo espelhado"]);
    });

    test("Caso C — principal=true não limpa a pendência, e não principal elegível limpa", async () => {
      const { comPrincipal, comNaoPrincipal } = await emTransacaoDesfeita(
        async (tx) => {
          const doc = await criarDocumento(tx, "caso-c", {
            estadoDocumental: "PUBLICAVEL",
            revisaoPrivacidade: "concluida",
          });
          const inelegivel = await criarArquivo(tx, "caso-c-nao-espelhado", {
            publico: false,
            espelhado: false,
          });
          await vincular(tx, doc, inelegivel, true);

          const comPrincipal = await pendenciasDe(tx, "caso-c");

          const elegivel = await criarArquivo(tx, "caso-c-espelhado", {
            publico: true,
            espelhado: true,
          });
          await vincular(tx, doc, elegivel, false);

          return {
            comPrincipal,
            comNaoPrincipal: await pendenciasDe(tx, "caso-c"),
          };
        },
      );

      expect(comPrincipal).toEqual(["estado PUBLICAVEL sem arquivo espelhado"]);
      expect(comNaoPrincipal).toEqual([]);
    });

    test("Caso D — pendência de outra natureza sobrevive à correção", async () => {
      const pendencias = await emTransacaoDesfeita(async (tx) => {
        const doc = await criarDocumento(tx, "caso-d", {
          estadoDocumental: "ESPELHAVEL",
          status: "publicado",
          publicadoEm: new Date(),
        });
        const arq = await criarArquivo(tx, "caso-d", {
          publico: true,
          espelhado: true,
        });
        await vincular(tx, doc, arq, false);

        return pendenciasDe(tx, "caso-d");
      });

      expect(pendencias).toEqual([
        "status publicado divergente do estado documental",
      ]);
    });

    test("Caso D — o ramo do anexo exigido não foi relaxado", async () => {
      const pendencias = await emTransacaoDesfeita(async (tx) => {
        const doc = await criarDocumento(tx, "caso-d2", {
          exigidoPeloEdital: true,
          natureza: "item_exigido",
          status: "publicado",
          publicadoEm: new Date(),
        });
        const arq = await criarArquivo(tx, "caso-d2", {
          publico: false,
          espelhado: false,
        });
        await vincular(tx, doc, arq, false);

        return pendenciasDe(tx, "caso-d2");
      });

      expect(pendencias).toContain("anexo obrigatório sem arquivo espelhado");
    });

    test("Caso E — vw_anexo_publico publica o vínculo não principal e exclui o objeto privado", async () => {
      const linhas = await emTransacaoDesfeita(async (tx) => {
        const doc = await criarDocumento(tx, "caso-e", {
          estadoDocumental: "PUBLICAVEL",
          revisaoPrivacidade: "concluida",
          status: "publicado",
          publicadoEm: new Date(),
        });
        const publico = await criarArquivo(tx, "caso-e-publico", {
          publico: true,
          espelhado: true,
        });
        const privado = await criarArquivo(tx, "caso-e-privado", {
          publico: false,
          espelhado: true,
        });
        await vincular(tx, doc, publico, false);
        await vincular(tx, doc, privado, true);

        return tx
          .select()
          .from(vwAnexoPublico)
          .where(eq(vwAnexoPublico.slug, slugDe("caso-e")));
      });

      expect(linhas).toHaveLength(1);
      expect(linhas[0]?.linkPermanente).toBe(urlDe("caso-e-publico"));
      expect(linhas[0]?.principal).toBe(false);
    });
  },
);
