/**
 * Corrige somente título e resumo dos documentos A09/A10.
 *
 * O inventário chamava os dois de "Formulário modelo", mas os objetos
 * efetivamente preservados e publicados são planilhas de respostas. O modo
 * padrão abre transação, mostra o plano e desfaz; `--executar` confirma o DML.
 */
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { loadEnvFile } from "node:process";
import { pathToFileURL } from "node:url";
import { z } from "zod";

export const SEMANTICA_FORMULARIOS = [
  {
    codigo: "A09",
    slug: "formulario-rotina-de-funcionamento",
    titulo: "Respostas do formulário de funcionamento",
    resumo:
      "Planilha com respostas sobre funcionamento, gastos, contratação temporária, atividades, visitantes e receitas dos espaços pesquisados.",
  },
  {
    codigo: "A10",
    slug: "formulario-publico-consumidor",
    titulo: "Respostas do formulário de visitantes",
    resumo:
      "Duas planilhas com respostas sobre origem, perfil, recorrência, motivações, atividades, consumo e percepção de visitantes do Recanto da Serra e do Borda da Mata.",
  },
] as const;

const documentoSchema = z.object({
  slug: z.string(),
  titulo: z.string(),
  resumo: z.string().nullable(),
});

async function principal(): Promise<void> {
  const executar =
    z
      .array(z.enum(["--dry-run", "--executar"]))
      .max(1)
      .parse(process.argv.slice(2))[0] === "--executar";
  if (existsSync(".env.local")) loadEnvFile(".env.local");

  const { poolManutencao, encerrarManutencao } = await import(
    "../src/dados/clienteManutencao"
  );
  const conexao = await poolManutencao.connect();
  try {
    await conexao.query("begin");
    let alterados = 0;
    for (const esperado of SEMANTICA_FORMULARIOS) {
      const linhas = z.array(documentoSchema).parse(
        (
          await conexao.query(
            `select slug::text, titulo, resumo
               from documento where slug = $1 for update`,
            [esperado.slug],
          )
        ).rows,
      );
      const atual = linhas[0];
      if (!atual || linhas.length !== 1)
        throw new Error(`${esperado.codigo} não é único no banco.`);
      const alterar =
        atual.titulo !== esperado.titulo || atual.resumo !== esperado.resumo;
      if (alterar) {
        await conexao.query(
          `update documento
              set titulo = $2, resumo = $3, atualizado_em = now()
            where slug = $1`,
          [esperado.slug, esperado.titulo, esperado.resumo],
        );
        alterados += 1;
      }
      console.log(
        JSON.stringify({
          codigo: esperado.codigo,
          slug: esperado.slug,
          titulo_anterior: atual.titulo,
          titulo_esperado: esperado.titulo,
          acao: alterar ? "atualizar" : "sem alteração",
        }),
      );
    }
    if (executar) {
      await conexao.query("commit");
      console.log(`COMMIT — documentos alterados=${alterados}`);
    } else {
      await conexao.query("rollback");
      console.log(`ROLLBACK — documentos que seriam alterados=${alterados}`);
    }
  } catch (erro) {
    await conexao.query("rollback").catch(() => {});
    throw erro;
  } finally {
    conexao.release();
    await encerrarManutencao();
  }
}

if (
  process.argv[1] &&
  pathToFileURL(resolve(process.argv[1])).href === import.meta.url
) {
  principal().catch((erro: unknown) => {
    console.error(erro instanceof Error ? erro.message : erro);
    process.exitCode = 1;
  });
}
