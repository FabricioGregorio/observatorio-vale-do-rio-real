/**
 * Gate de pendências de publicação — Tarefa 09.
 *
 * Consulta `vw_pendencia_publicacao` e quebra o build se ela retornar qualquer
 * linha. É a tradução em pipeline do risco de maior impacto do projeto: publicar
 * um anexo exigido pelo edital sem espelho local, e portanto sem garantia de que
 * o arquivo continuará existindo (doc 02 §13, doc 03 §6 e §7).
 *
 * Esta fatia cobre só o ramo do anexo. O ramo do áudio público sem consentimento
 * depende da tabela `entrevista`, que ainda não existe, e entra na view por
 * CREATE OR REPLACE VIEW numa migração futura — sem exigir mudança aqui, porque
 * o script não interpreta o texto da pendência: ele imprime o que a view disser.
 * Ver docs/tarefas/09-gate-de-pendencias.md.
 *
 * Sem `DATABASE_URL`:
 *
 * - fora do CI: informa "não verificado" e termina com sucesso, para não
 *   quebrar o `pnpm verificar` de quem não tem credencial;
 * - em CI: erro, com código 1. Ali a ausência da variável é defeito de
 *   configuração, e um gate que não conseguiu verificar nunca deve dizer
 *   "limpo" — garantia falsa é pior do que gate nenhum.
 *
 * O script apenas denuncia. Corrigir a pendência está fora do escopo.
 *
 * Uso:
 *   pnpm pendencias
 */

import type { Pendencia } from "../src/dados/consultas/pendencias";

export type Diagnostico = { codigo: 0 | 1; mensagem: string };

const COLUNAS = ["slug", "titulo", "pendencia"] as const;

/** Vazio vira travessão: célula em branco esconde que o dado não veio. */
function celula(valor: string | null): string {
  return valor ?? "—";
}

/**
 * Tabela de largura fixa, legível no log do CI sem ferramenta nenhuma.
 * Quem lê isso está com o build quebrado e com pressa.
 */
export function formatarTabela(linhas: Pendencia[]): string {
  const corpo = linhas.map((l) => [
    celula(l.slug),
    celula(l.titulo),
    celula(l.pendencia),
  ]);
  const larguras = COLUNAS.map((nome, i) =>
    Math.max(nome.length, ...corpo.map((c) => (c[i] ?? "").length)),
  );
  const linha = (celulas: readonly string[]) =>
    celulas
      .map((c, i) => c.padEnd(larguras[i] ?? 0))
      .join("  ")
      .trimEnd();

  return [
    linha(COLUNAS),
    larguras.map((l) => "-".repeat(l)).join("  "),
    ...corpo.map(linha),
  ].join("\n");
}

/** Decisão do gate quando a consulta aconteceu. */
export function resultado(linhas: Pendencia[]): Diagnostico {
  if (linhas.length === 0) {
    return {
      codigo: 0,
      mensagem:
        "Nenhuma pendência de publicação: todo anexo exigido pelo edital e " +
        "publicado tem arquivo espelhado.",
    };
  }

  const plural = linhas.length === 1 ? "pendência" : "pendências";
  return {
    codigo: 1,
    mensagem:
      `${linhas.length} ${plural} de publicação — o build está bloqueado.\n\n` +
      `${formatarTabela(linhas)}\n\n` +
      "Cada linha é um documento publicado que o edital exige e que não tem " +
      "arquivo espelhado. Rode o espelhamento ou despublique o documento.",
  };
}

/** Decisão do gate quando não há credencial para consultar. */
export function semCredencial(ehCi: boolean): Diagnostico {
  const recado =
    "DATABASE_URL ausente: as pendências de publicação NÃO foram verificadas.";

  return ehCi
    ? {
        codigo: 1,
        mensagem:
          `${recado} Em CI isso é erro de configuração — o workflow define a ` +
          "variável no serviço de banco. Um gate que não consultou não pode " +
          "reportar que está limpo.",
      }
    : {
        codigo: 0,
        mensagem:
          `${recado} Seguindo assim fora do CI, onde nem toda máquina tem ` +
          "credencial. Nada foi consultado: este resultado não atesta nada.",
      };
}

/**
 * `CI` é definida por todo provedor de integração contínua, GitHub incluído.
 *
 * Recebe o valor, e não o ambiente inteiro: `NodeJS.ProcessEnv` obriga quem
 * chama a satisfazer as chaves que o Next declara como obrigatórias, o que
 * complicaria o teste sem ganhar nada — a função lê uma variável só.
 */
export function emCi(ci: string | undefined = process.env.CI): boolean {
  return Boolean(ci) && ci !== "false";
}

async function principal(): Promise<Diagnostico> {
  if (!process.env.DATABASE_URL) return semCredencial(emCi());

  const { listarPendenciasDePublicacao } = await import(
    "../src/dados/consultas/pendencias"
  );
  return resultado(await listarPendenciasDePublicacao());
}

if (process.argv[1]?.includes("verificar-pendencias")) {
  principal()
    .then(({ codigo, mensagem }) => {
      if (codigo === 0) console.log(`[pendencias] ${mensagem}`);
      else console.error(`[pendencias] ${mensagem}`);
      process.exit(codigo);
    })
    .catch((erro) => {
      console.error(
        `[pendencias] falha ao consultar a trava: ${
          erro instanceof Error ? erro.message : String(erro)
        }`,
      );
      process.exit(1);
    });
}
