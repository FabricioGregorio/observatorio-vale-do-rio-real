/**
 * Correção dos vínculos da publicação de 2026-09-16.
 *
 * ## O que deu errado
 *
 * A primeira execução de `publicar-acervo.ts` resolvia o documento de destino
 * por **posição de linha no CSV** do inventário, tratando-a como se fosse
 * `ordem_anexo`. As duas coisas não coincidem: `A11`, `B13` e `B14` foram
 * acrescentados ao fim da planilha e no banco ocupam a posição semântica que
 * lhes cabe (11, 24 e 25). O resultado é que 94 dos 100 vínculos apontaram
 * para o documento errado, sem que nenhuma constraint acusasse — ligar um PDF
 * de indicadores ao "Manual de marcas" é perfeitamente válido para o schema.
 *
 * Os cem objetos no R2 estavam certos desde o início: chave, conteúdo, MIME e
 * hash foram conferidos por releitura autenticada. O erro foi só relacional, e
 * por isso a correção não toca em storage.
 *
 * ## O que esta correção faz, numa transação
 *
 * 1. zera `principal` nos vínculos do lote — `idx_doc_arquivo_principal` é
 *    unique e não deferível, e mover um vínculo por vez criaria dois
 *    principais no mesmo documento no meio do caminho;
 * 2. repõe cada vínculo no documento certo, resolvido por slug;
 * 3. devolve a `PENDENTE`/`rascunho` os cinco documentos promovidos por
 *    engano, todos sem nenhum arquivo público ao fim do passo 2;
 * 4. promove os quatro que faltaram;
 * 5. repõe os doze `principal` declarados no lote.
 *
 * Idempotente: rodar de novo não move nada e não promove nada.
 *
 *     node --import tsx scripts/corrigir-vinculos-publicacao.ts
 *     node --import tsx scripts/corrigir-vinculos-publicacao.ts --executar
 */
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { loadEnvFile } from "node:process";
import { pathToFileURL } from "node:url";
import { z } from "zod";

import { LOTE_PUBLICACAO } from "../src/dados/lote-publicacao";

/** Código do inventário → slug canônico de `documento`. */
export const SLUG_DO_CODIGO: Readonly<Record<string, string>> = {
  A02: "relatorio-tecnico-recanto-da-serra",
  A03: "relatorio-tecnico-borda-da-mata",
  A04: "relatorio-tecnico-serra-dos-macacos",
  A09: "formulario-rotina-de-funcionamento",
  A10: "formulario-publico-consumidor",
  A11: "anexo-indicadores-etapa-1",
  B01: "fotografias-visitas-i-vii",
  B02: "entrevista-josenilson-bispo",
  B03: "entrevista-oviedo-e-neide-abreu",
  B04: "entrevista-pedro-menezes",
  B05: "entrevista-paola-santana",
  B06: "entrevista-lideranca-ilha-grande",
  B08: "entrevista-prefeito-tobias-barreto",
  B13: "entrevista-laerte-aguiar",
  B14: "entrevista-marcio-andre",
  D01: "identidade-visual",
};

/**
 * Promovidos por engano. Os cinco estavam `PENDENTE` / `pendente` /
 * `rascunho`, com `publicado_em` nulo, e é a esse estado que voltam. O
 * `not exists` garante que nenhum documento com arquivo público seja
 * rebaixado, mesmo que esta lista fique desatualizada.
 */
export const REVERTER = [
  "entrevista-cultura-itabaianinha",
  "documento-final",
  "instagram",
  "termos-de-consentimento",
  "manual-de-marcas",
] as const;

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

  const { poolManutencao, encerrarManutencao } = await import(
    "../src/dados/clienteManutencao"
  );
  const c = (await poolManutencao.connect()) as unknown as Conexao;
  let destruir = false;
  try {
    await c.query("begin");
    const idPorSlug = new Map(
      z
        .array(z.object({ id: z.string(), slug: z.string() }))
        .parse(
          (await c.query("select id::text, slug::text from documento")).rows,
        )
        .map((d) => [d.slug, d.id]),
    );

    const chaves = LOTE_PUBLICACAO.map((e) => e.chave);
    await c.query(
      `update documento_arquivo da
          set principal = false
         from arquivo a
        where a.id = da.arquivo_id and a.chave_storage = any($1::text[])`,
      [chaves],
    );

    let movidos = 0;
    for (const entrada of LOTE_PUBLICACAO) {
      const slug = SLUG_DO_CODIGO[entrada.codigo];
      const destino = slug === undefined ? undefined : idPorSlug.get(slug);
      if (!destino) throw new Error(`Slug ausente para ${entrada.codigo}.`);
      movidos += (
        await c.query(
          `update documento_arquivo da
              set documento_id = $1
             from arquivo a
            where a.id = da.arquivo_id
              and a.chave_storage = $2
              and a.visibilidade = 'publico'
              and da.documento_id <> $1
          returning da.arquivo_id`,
          [destino, entrada.chave],
        )
      ).rows.length;
    }

    const revertidos = (
      await c.query(
        `update documento
            set estado_documental = 'PENDENTE',
                revisao_privacidade = 'pendente',
                status = 'rascunho',
                publicado_em = null,
                atualizado_em = now()
          where slug = any($1::citext[])
            and status = 'publicado'
            and not exists (
              select 1 from documento_arquivo da
                join arquivo a on a.id = da.arquivo_id
               where da.documento_id = documento.id
                 and a.visibilidade = 'publico')
        returning slug::text`,
        [REVERTER],
      )
    ).rows.length;

    const promovidos = (
      await c.query(
        `update documento
            set estado_documental = 'PUBLICAVEL',
                revisao_privacidade = 'concluida',
                status = 'publicado',
                publicado_em = coalesce(publicado_em, now()),
                atualizado_em = now()
          where slug = any($1::citext[])
            and (estado_documental <> 'PUBLICAVEL' or status <> 'publicado')
        returning slug::text`,
        [Object.values(SLUG_DO_CODIGO)],
      )
    ).rows.length;

    const principais = LOTE_PUBLICACAO.filter((e) => e.principal).map(
      (e) => e.chave,
    );
    const repostos = (
      await c.query(
        `update documento_arquivo da
            set principal = true
           from arquivo a
          where a.id = da.arquivo_id and a.chave_storage = any($1::text[])
        returning da.arquivo_id`,
        [principais],
      )
    ).rows.length;
    if (repostos !== principais.length)
      throw new Error(
        `Principais repostos: ${repostos} de ${principais.length}.`,
      );

    const conferencia = z
      .array(z.object({ slug: z.string(), n: z.coerce.number() }))
      .parse(
        (
          await c.query(`
            select d.slug::text, count(*)::int n
              from documento d
              join documento_arquivo da on da.documento_id = d.id
              join arquivo a on a.id = da.arquivo_id
             where a.visibilidade = 'publico'
             group by 1 order by 1`)
        ).rows,
      );
    const [total] = z
      .array(z.object({ n: z.coerce.number() }))
      .parse(
        (await c.query("select count(*)::int n from vw_anexo_publico")).rows,
      );

    for (const linha of conferencia)
      console.log(`${String(linha.n).padStart(3)}  ${linha.slug}`);
    console.log(
      `movidos=${movidos} revertidos=${revertidos} promovidos=${promovidos} ` +
        `principais=${repostos} vw_anexo_publico=${total?.n}`,
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
