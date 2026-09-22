/**
 * Gate de pendências de publicação — Tarefa 09.
 *
 * Consulta `vw_pendencia_publicacao` e quebra o build se ela retornar qualquer
 * linha. É a tradução em pipeline do risco de maior impacto do projeto: publicar
 * um anexo exigido pelo edital sem espelho local, e portanto sem garantia de que
 * o arquivo continuará existindo.
 *
 * Esta fatia cobre só o ramo do anexo. O ramo do áudio público sem consentimento
 * depende da tabela `entrevista`, que ainda não existe, e entra na view por
 * CREATE OR REPLACE VIEW numa migração futura — sem exigir mudança aqui, porque
 * o script não interpreta o texto da pendência: ele imprime o que a view disser.
 *
 * Sem `DATABASE_URL`: erro, com código 1, em qualquer ambiente.
 *
 * Até aqui o script distinguia CI de máquina local e, fora do CI, terminava
 * com sucesso dizendo que não havia verificado nada. A intenção era não
 * quebrar o `pnpm verificar` de quem não tem credencial; o efeito foi um gate
 * obrigatório capaz de sair verde sem ter consultado o banco. Como
 * `pnpm verificar` é o gate que autoriza liberação, "não consultei, portanto
 * zero" passou a valer como atestado — que é exatamente a garantia falsa que
 * o desenho original queria evitar.
 *
 * A credencial vem do ambiente ou de `.env.local`, na mesma convenção do
 * `vitest.config.ts`: o que o ambiente já definiu tem precedência, então o CI,
 * que injeta a variável pelo serviço de banco, não é afetado. Quem tem a
 * máquina configurada passa a ser verificado de verdade — antes o arquivo
 * existia, e o script simplesmente não olhava para ele.
 *
 * O script apenas denuncia. Corrigir a pendência está fora do escopo.
 *
 * Uso:
 *   pnpm pendencias
 */

import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";

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
        "Nenhuma pendência de publicação: nenhum documento apresentado como " +
        "publicável está sem arquivo espelhado, e status e estado documental " +
        "concordam.",
    };
  }

  const plural = linhas.length === 1 ? "pendência" : "pendências";
  return {
    codigo: 1,
    mensagem:
      `${linhas.length} ${plural} de publicação — o build está bloqueado.\n\n` +
      `${formatarTabela(linhas)}\n\n` +
      "Cada linha é uma anomalia entre os documentos que o banco apresenta " +
      "como publicáveis; a coluna `pendencia` diz qual. Nem toda linha é " +
      "item exigido pelo edital — a view também denuncia estado PUBLICAVEL " +
      "sem arquivo espelhado e divergência entre status e estado documental. " +
      "Trate a causa apontada; não altere dados para calar o gate.",
  };
}

/**
 * Decisão do gate quando não há credencial para consultar.
 *
 * Sempre 1. Um gate obrigatório que não conseguiu executar a verificação não
 * tem resultado para dar — e "sem resultado" não é "limpo".
 */
export function semCredencial(): Diagnostico {
  return {
    codigo: 1,
    mensagem:
      "DATABASE_URL ausente: as pendências de publicação NÃO foram " +
      "verificadas, e por isso o gate falha. Defina a credencial de leitura " +
      "da aplicação no ambiente ou em `.env.local` — ver `.env.example`. Em " +
      "CI a variável vem do serviço de banco do workflow. Nada foi " +
      "consultado: nenhum resultado aqui atestaria coisa alguma.",
  };
}

/**
 * Carrega `.env.local` quando ele existe, como faz o `vitest.config.ts`.
 *
 * O `tsx` não lê arquivo de ambiente sozinho — o Next e o Vitest leem, e era
 * só por isso que este gate se dizia "sem credencial" numa máquina que tinha
 * a credencial ali do lado. `loadEnvFile` não sobrescreve o que o ambiente já
 * definiu, então o CI continua mandando no valor.
 *
 * O caminho é relativo ao diretório de trabalho, e não ao arquivo: é assim
 * que o resto do projeto o resolve, e é o que torna possível provar, de fora,
 * que o gate falha onde não há configuração nenhuma.
 */
function carregarAmbienteLocal(): void {
  if (existsSync(".env.local")) loadEnvFile(".env.local");
}

async function principal(): Promise<Diagnostico> {
  carregarAmbienteLocal();
  if (!process.env.DATABASE_URL) return semCredencial();

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
