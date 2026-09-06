/**
 * Carga documental canônica — Prompt 3.2.
 *
 * Carrega `documento` a partir do inventário derivado, aplicando a
 * classificação aprovada em `src/dados/classificacao-documental.ts`.
 *
 * O que este script **não** faz, por decisão e não por omissão:
 *
 * - não cria `pessoa` nem `consentimento` — carga própria, não autorizada;
 * - não cria `arquivo` nem `documento_arquivo` — `arquivo.url_publica` é
 *   `NOT NULL UNIQUE` e não existe URL própria antes do espelhamento;
 *   inventar uma seria fabricar prova documental;
 * - não faz upload, não gera ZIP, não publica;
 * - não promove nada a `PUBLICAVEL`.
 *
 * Credencial: `DATABASE_URL_MANUTENCAO`, via `src/dados/clienteManutencao.ts`.
 * Nunca `DATABASE_URL` (só leitura) nem `DATABASE_URL_MIGRACAO` (só DDL).
 *
 * Tudo roda em transação. As invariantes são conferidas **dentro** dela, e o
 * COMMIT só acontece se todas passarem.
 *
 * Uso:
 *   pnpm tsx scripts/carregar-documentos.ts              # dry-run (padrão)
 *   pnpm tsx scripts/carregar-documentos.ts --executar   # grava
 */

import { readFile } from "node:fs/promises";

import { eq, sql } from "drizzle-orm";

import { documento } from "../db/schema";
import {
  CLASSIFICACAO,
  classificacaoDe,
  DISTRIBUICAO_ESPERADA,
  type EstadoDocumental,
  TOTAL_ESPERADO,
} from "../src/dados/classificacao-documental";
import { lerInventario } from "../src/lib/espelhamento";
import { exigirDerivacaoAtual } from "../src/lib/inventario-derivado";
import { calcularOrdemAnexo, camposDoItem } from "./catalogar-documentos";

type Alvo = {
  codigo: string;
  slug: string;
  titulo: string;
  tipo: ReturnType<typeof camposDoItem>["tipo"];
  exigidoPeloEdital: boolean;
  natureza: ReturnType<typeof camposDoItem>["natureza"];
  ordemAnexo: number;
  estado: EstadoDocumental;
  revisao: "pendente" | "concluida" | "bloqueada";
  derivadoDe?: string;
  metodo?: string;
};

/** Falha de invariante: motivo do ROLLBACK, sempre nomeado. */
class InvarianteViolada extends Error {}

export function montarAlvos(csv: string): Alvo[] {
  const itens = lerInventario(csv);
  const ordens = calcularOrdemAnexo(itens);
  return itens.map((item) => {
    const campos = camposDoItem(item, ordens.get(item.id) ?? 0);
    const c = classificacaoDe(item.id);
    return {
      codigo: item.id,
      ...campos,
      estado: c.estado,
      revisao: c.revisao,
      ...(c.derivadoDe ? { derivadoDe: c.derivadoDe } : {}),
      ...(c.metodo ? { metodo: c.metodo } : {}),
    };
  });
}

/** Confere as invariantes do §8 sobre o que está no banco agora. */
async function conferirInvariantes(
  db: {
    execute: (q: ReturnType<typeof sql>) => Promise<{ rows: unknown[] }>;
  },
  alvos: Alvo[],
): Promise<string[]> {
  const conferidas: string[] = [];
  const falhar = (m: string): never => {
    throw new InvarianteViolada(m);
  };

  const um = async <T>(q: ReturnType<typeof sql>): Promise<T> =>
    (await db.execute(q)).rows[0] as T;

  const { total } = await um<{ total: number }>(
    sql`select count(*)::int as total from documento`,
  );
  if (total !== TOTAL_ESPERADO) {
    falhar(`documentos = ${total}, esperado ${TOTAL_ESPERADO}`);
  }
  conferidas.push(`total de documentos = ${total}`);

  const nat = (await db.execute(
    sql`select natureza, count(*)::int as n from documento group by 1`,
  )) as { rows: { natureza: string; n: number }[] };
  const esperadoNat = {
    item_exigido: 28,
    evidencia_complementar: 3,
    item_nao_exigido: 2,
  } as const;
  for (const [k, v] of Object.entries(esperadoNat)) {
    const achado = nat.rows.find((r) => r.natureza === k)?.n ?? 0;
    if (achado !== v) falhar(`natureza ${k} = ${achado}, esperado ${v}`);
    conferidas.push(`natureza ${k} = ${achado}`);
  }

  const est = (await db.execute(
    sql`select estado_documental as e, count(*)::int as n from documento group by 1`,
  )) as { rows: { e: EstadoDocumental; n: number }[] };
  let soma = 0;
  for (const [k, v] of Object.entries(DISTRIBUICAO_ESPERADA)) {
    const achado = est.rows.find((r) => r.e === k)?.n ?? 0;
    if (achado !== v) falhar(`estado ${k} = ${achado}, esperado ${v}`);
    soma += achado;
    conferidas.push(`estado ${k} = ${achado}`);
  }
  if (soma !== TOTAL_ESPERADO) falhar(`soma dos estados = ${soma}`);
  conferidas.push(`soma dos estados = ${soma}`);

  // itens nomeados no §8
  const porSlug = new Map(alvos.map((a) => [a.codigo, a.slug]));
  const conferirItem = async (
    codigo: string,
    esperado: {
      estado: EstadoDocumental;
      exigido: boolean;
      natureza: string;
      derivadoDe?: string;
    },
  ) => {
    const slug = porSlug.get(codigo);
    if (!slug) falhar(`${codigo} não está entre os alvos`);
    const linha = await um<{
      estado_documental: EstadoDocumental;
      exigido_pelo_edital: boolean;
      natureza: string;
      titulo: string;
      pai: string | null;
    }>(sql`
      select d.estado_documental, d.exigido_pelo_edital, d.natureza, d.titulo,
             o.slug as pai
        from documento d
        left join documento o on o.id = d.derivado_de_id
       where d.slug = ${slug}
    `);
    if (!linha) falhar(`${codigo} não encontrado no banco`);
    if (linha.estado_documental !== esperado.estado) {
      falhar(
        `${codigo} estado = ${linha.estado_documental}, esperado ${esperado.estado}`,
      );
    }
    if (linha.exigido_pelo_edital !== esperado.exigido) {
      falhar(`${codigo} exigido = ${linha.exigido_pelo_edital}`);
    }
    if (linha.natureza !== esperado.natureza) {
      falhar(
        `${codigo} natureza = ${linha.natureza}, esperado ${esperado.natureza}`,
      );
    }
    if (esperado.derivadoDe) {
      const paiEsperado = porSlug.get(esperado.derivadoDe);
      if (linha.pai !== paiEsperado) {
        falhar(`${codigo} derivado_de = ${linha.pai}, esperado ${paiEsperado}`);
      }
      conferidas.push(`${codigo} derivado de ${esperado.derivadoDe}`);
    }
    conferidas.push(`${codigo} = ${esperado.estado} / ${esperado.natureza}`);
    return linha;
  };

  const b07 = await conferirItem("B07", {
    estado: "PENDENTE",
    exigido: true,
    natureza: "item_exigido",
  });
  if (/tomar do geru/i.test(b07.titulo)) {
    falhar("B07 foi reclassificado como Tomar do Geru");
  }
  conferidas.push("B07 não foi substituído por Tomar do Geru");

  for (const codigo of ["B13", "B14", "A11"]) {
    await conferirItem(codigo, {
      estado: "RESTRITO",
      exigido: false,
      natureza: "evidencia_complementar",
    });
  }
  await conferirItem("A01", {
    estado: "IMPEDIDO",
    exigido: true,
    natureza: "item_exigido",
  });
  await conferirItem("D02", {
    estado: "PENDENTE",
    exigido: false,
    natureza: "item_nao_exigido",
  });
  await conferirItem("E01", {
    estado: "PENDENTE",
    exigido: true,
    natureza: "item_exigido",
  });
  await conferirItem("A05", {
    estado: "PENDENTE",
    exigido: true,
    natureza: "item_exigido",
    derivadoDe: "A02",
  });
  await conferirItem("A06", {
    estado: "PENDENTE",
    exigido: true,
    natureza: "item_exigido",
    derivadoDe: "A03",
  });

  // A11 não substitui A01: os dois existem, com naturezas diferentes
  const { n: a01a11 } = await um<{ n: number }>(sql`
    select count(*)::int as n from documento
     where slug in (${porSlug.get("A01")}, ${porSlug.get("A11")})
  `);
  if (a01a11 !== 2) falhar(`A01 e A11 juntos = ${a01a11}, esperado 2`);
  conferidas.push("A01 e A11 coexistem");

  const { n: dup } = await um<{ n: number }>(sql`
    select coalesce(sum(c - 1), 0)::int as n
      from (select count(*)::int as c from documento group by slug having count(*) > 1) t
  `);
  if (dup !== 0) falhar(`slugs duplicados = ${dup}`);
  conferidas.push("slugs duplicados = 0");

  // §9 fail-closed
  const { n: publico } = await um<{ n: number }>(
    sql`select count(*)::int as n from vw_anexo_publico`,
  );
  if (publico !== 0) falhar(`vw_anexo_publico = ${publico}, esperado 0`);
  conferidas.push("vw_anexo_publico = 0");

  const { n: pub } = await um<{ n: number }>(
    sql`select count(*)::int as n from documento where estado_documental = 'PUBLICAVEL'`,
  );
  if (pub !== 0) falhar(`PUBLICAVEL = ${pub}, esperado 0`);
  conferidas.push("PUBLICAVEL = 0");

  const { n: legado } = await um<{ n: number }>(
    sql`select count(*)::int as n from documento where status = 'publicado'`,
  );
  if (legado !== 0) falhar(`status legado 'publicado' = ${legado}`);
  conferidas.push("status legado 'publicado' = 0");

  // §6 e §10: nada de arquivo, pessoa, consentimento
  for (const tabela of [
    "arquivo",
    "documento_arquivo",
    "pessoa",
    "consentimento",
  ]) {
    const { n } = await um<{ n: number }>(
      sql`select count(*)::int as n from ${sql.raw(tabela)}`,
    );
    if (n !== 0) falhar(`${tabela} = ${n}, esperado 0 nesta carga`);
    conferidas.push(`${tabela} = 0`);
  }

  return conferidas;
}

async function principal(argv: string[]): Promise<number> {
  const executar = argv.includes("--executar");
  const modo = executar ? "EXECUÇÃO" : "DRY-RUN";
  console.log(`[carga] modo: ${modo}`);

  await exigirDerivacaoAtual();
  const alvos = montarAlvos(await readFile("inventario-de-anexos.csv", "utf8"));
  console.log(`[carga] alvos no inventário derivado: ${alvos.length}`);

  if (alvos.length !== TOTAL_ESPERADO) {
    console.error(
      `[carga] inventário tem ${alvos.length} itens, esperado ${TOTAL_ESPERADO}.`,
    );
    return 1;
  }
  if (Object.keys(CLASSIFICACAO).length !== TOTAL_ESPERADO) {
    console.error("[carga] a classificação aprovada não cobre os 33 itens.");
    return 1;
  }

  const { dbManutencao: db } = await import("../src/dados/clienteManutencao");

  const existentes = await db.select({ slug: documento.slug }).from(documento);
  const jaTem = new Set(existentes.map((e) => e.slug));
  const aInserir = alvos.filter((a) => !jaTem.has(a.slug));
  const jaPresentes = alvos.filter((a) => jaTem.has(a.slug));

  console.log(`[carga] no banco agora:     ${existentes.length}`);
  console.log(`[carga] INSERT:             ${aInserir.length}`);
  console.log(`[carga] SEM ALTERAÇÃO:      ${jaPresentes.length}`);
  console.log(
    `[carga] UPDATE:             0 (esta carga não altera existente)`,
  );

  if (!executar) {
    console.log("\n[carga] dry-run: nada foi gravado.");
    if (aInserir.length === 0) {
      console.log("[carga] os 33 documentos já existem — carga idempotente.");
    }
    return 0;
  }

  if (aInserir.length === 0) {
    console.log("\n[carga] nada a inserir. Nenhuma transação aberta.");
    return 0;
  }

  try {
    await db.transaction(async (tx) => {
      for (const a of aInserir) {
        await tx.insert(documento).values({
          slug: a.slug,
          titulo: a.titulo,
          tipo: a.tipo,
          exigidoPeloEdital: a.exigidoPeloEdital,
          natureza: a.natureza,
          estadoDocumental: a.estado,
          revisaoPrivacidade: a.revisao,
          ordemAnexo: a.ordemAnexo,
        });
      }

      // derivação depois, quando todos os pais já existem
      for (const a of aInserir) {
        if (!a.derivadoDe || !a.metodo) continue;
        const paiSlug = alvos.find((x) => x.codigo === a.derivadoDe)?.slug;
        if (!paiSlug) {
          throw new InvarianteViolada(
            `${a.codigo} declara derivar de ${a.derivadoDe}, que não está no inventário`,
          );
        }
        const [pai] = await tx
          .select({ id: documento.id })
          .from(documento)
          .where(eq(documento.slug, paiSlug));
        if (!pai) {
          throw new InvarianteViolada(`pai ${a.derivadoDe} não encontrado`);
        }
        await tx
          .update(documento)
          .set({
            derivadoDeId: pai.id,
            derivacaoMetodo: a.metodo as "extracao_secao",
            derivacaoEm: new Date(),
          })
          .where(eq(documento.slug, a.slug));
      }

      const conferidas = await conferirInvariantes(tx, alvos);
      console.log(
        `\n[carga] invariantes conferidas na transação: ${conferidas.length}`,
      );
      for (const c of conferidas) console.log(`  ok  ${c}`);
    });
  } catch (e) {
    if (e instanceof InvarianteViolada) {
      console.error(`\n[carga] ROLLBACK — invariante violada: ${e.message}`);
    } else {
      console.error(
        `\n[carga] ROLLBACK — ${e instanceof Error ? e.message : String(e)}`,
      );
    }
    return 1;
  }

  console.log("\n[carga] COMMIT. Conferindo o estado persistido:");
  const conferidas = await conferirInvariantes(db, alvos);
  console.log(
    `[carga] invariantes conferidas após o commit: ${conferidas.length}`,
  );
  return 0;
}

if (process.argv[1]?.includes("carregar-documentos")) {
  principal(process.argv.slice(2))
    .then((c) => process.exit(c))
    .catch((e) => {
      console.error(
        `[carga] falha: ${e instanceof Error ? e.message : String(e)}`,
      );
      process.exit(1);
    });
}
