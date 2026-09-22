/**
 * Grava o crédito de autoria das fotografias de terceiro.
 *
 * A decisão humana de 2026-09-16 manteve públicas as duas fotografias com
 * autoria de terceiro e tornou o crédito obrigatório. Elas já estavam
 * publicadas; o que faltava era a atribuição chegar à exibição.
 *
 * O crédito vive dentro de `documento_arquivo.rotulo`, na forma que
 * `montarRotulo` compõe. Não há coluna de autoria por objeto físico no
 * modelo, e criar uma é mudança de schema, pendente de decisão humana. Ver
 * `src/dados/pesquisa/credito-fotografico.ts`. Nenhuma tabela paralela foi
 * criada.
 *
 * Idempotente: roda sobre `montarRotulo(base, autor)` e o segundo uso não
 * altera linha nenhuma. Não toca em storage, hash, URL ou classificação.
 *
 *     node --import tsx scripts/gravar-creditos-fotograficos.ts
 *     node --import tsx scripts/gravar-creditos-fotograficos.ts --executar
 */
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { loadEnvFile } from "node:process";
import { pathToFileURL } from "node:url";
import { z } from "zod";

import { LOTE_PUBLICACAO } from "../src/dados/lote-publicacao";
import {
  montarRotulo,
  separarCredito,
} from "../src/dados/pesquisa/credito-fotografico";

type Conexao = {
  query(sql: string, valores?: unknown[]): Promise<{ rows: unknown[] }>;
  release(destruir?: boolean): void;
};

async function principal(): Promise<void> {
  const executar =
    z
      .array(z.enum(["--dry-run", "--executar"]))
      .max(1)
      .parse(process.argv.slice(2))[0] === "--executar";
  if (existsSync(".env.local")) loadEnvFile(".env.local");

  const comAutor = LOTE_PUBLICACAO.filter((e) => e.autor !== null);
  if (comAutor.length === 0)
    throw new Error("Nenhuma entrada do lote declara autoria.");

  const { poolManutencao, encerrarManutencao } = await import(
    "../src/dados/clienteManutencao"
  );
  const c = (await poolManutencao.connect()) as unknown as Conexao;
  let destruir = false;
  try {
    await c.query("begin");
    let gravados = 0;
    for (const entrada of comAutor) {
      const rotulo = montarRotulo(entrada.rotulo, entrada.autor);
      const linhas = z
        .array(z.object({ rotulo: z.string(), slug: z.string() }))
        .parse(
          (
            await c.query(
              `update documento_arquivo da
                  set rotulo = $1
                 from arquivo a, documento d
                where a.id = da.arquivo_id
                  and d.id = da.documento_id
                  and a.chave_storage = $2
                  and a.visibilidade = 'publico'
                  and da.rotulo is distinct from $1
              returning da.rotulo, d.slug::text`,
              [rotulo, entrada.chave],
            )
          ).rows,
        );
      gravados += linhas.length;
      const { credito } = separarCredito(rotulo);
      console.log(
        JSON.stringify({
          chave: entrada.chave,
          autor: entrada.autor,
          credito,
          documento: linhas[0]?.slug ?? "(já gravado)",
          acao: linhas.length ? "gravado" : "sem alteração",
        }),
      );
    }

    // Conferência: todo rótulo público com crédito é exatamente os dois.
    const comCredito = z
      .array(z.object({ rotulo: z.string() }))
      .parse(
        (
          await c.query(
            `select da.rotulo
               from documento_arquivo da
               join arquivo a on a.id = da.arquivo_id
              where a.visibilidade = 'publico'
                and da.rotulo like '%— Foto: %'
              order by da.rotulo`,
          )
        ).rows,
      )
      .map((l) => separarCredito(l.rotulo).credito);
    console.log(
      `gravados=${gravados} creditos_publicos=${JSON.stringify(comCredito)}`,
    );

    await c.query(executar ? "commit" : "rollback");
    console.log(executar ? "COMMIT" : "ROLLBACK — use --executar para aplicar");
  } catch (erro) {
    destruir = true;
    await c.query("rollback").catch(() => {});
    throw erro;
  } finally {
    c.release(destruir);
    await encerrarManutencao();
  }
}

if (
  process.argv[1] &&
  pathToFileURL(resolve(process.argv[1])).href === import.meta.url
) {
  principal().catch((erro) => {
    console.error(erro instanceof Error ? erro.message : erro);
    process.exitCode = 1;
  });
}
