/**
 * Geração do snapshot público — Lote A: estrutura, sem execução contra o Neon.
 *
 * Produz os três arquivos de `src/dados/publicado/` a partir das projeções
 * públicas do banco. É **ação editorial deliberada**: não roda no build, não
 * roda no `dev`, não roda no `teste`, e não tem padrão de data.
 *
 * ## Uso
 *
 *     pnpm gerar-snapshot --data 2026-09-23              # ensaio; não grava
 *     pnpm gerar-snapshot --data 2026-09-23 --escrever   # grava
 *
 * ## As três consultas, e por que são só três
 *
 * O build de hoje chama `listarAnexosPublicos()` uma vez por rota — cerca de
 * 370 vezes, porque `generateMetadata` e o corpo de cada página consultam
 * separadamente e nada memoriza o resultado. Foi esse padrão que esgotou a
 * cota de transferência do provedor de hospedagem do banco. Aqui a mesma
 * função é chamada **uma vez**, e o resultado inteiro vira arquivo.
 *
 * Este script não escreve SQL próprio. Ele chama as duas funções de listagem
 * que o site já usa, e são elas que emitem, juntas, exatamente três consultas:
 *
 * 1. `vw_anexo_publico` com `espelhado = true`;
 * 2. `arquivo.nome_original` **restrito aos ids devolvidos pela consulta 1**;
 * 3. `vw_episodio_publico`.
 *
 * A consulta 2 é a única que toca uma tabela em vez de uma projeção pública, e
 * por isso tem regra dura: ela nunca varre `arquivo` por conta própria. O
 * conjunto de ids é exatamente o que a view já autorizou, e a projeção é
 * apenas `id` e `nome_original` — ver `listarEvidenciasDeAnexos` em
 * `src/dados/consultas/anexos.ts`, onde a restrição está implementada. Não se
 * reescreve aqui o que já está escrito lá: uma segunda implementação da mesma
 * consulta é uma segunda chance de ampliá-la sem querer.
 *
 * ## Regra de ouro
 *
 * Sem `DATABASE_URL`, este script **falha**. Não degrada para lista vazia, não
 * usa fixture, não reconstrói a partir de artefato anterior. As funções de
 * listagem devolvem `[]` quando não há credencial fora de produção — o que é
 * correto para uma página que exibe e catastrófico para um gerador que
 * declara. Um snapshot vazio gravado em silêncio afirmaria ao público que o
 * acervo não tem documentos.
 */

import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { loadEnvFile } from "node:process";
import { z } from "zod";

import type { AnexoPublico } from "../src/dados/consultas/anexos";
import type { EpisodioPublico } from "../src/dados/consultas/podobservar";
import { IDS_DOS_LOTES } from "../src/dados/lotes-de-publicacao";
import {
  calcularIdDoRelease,
  conferirRelease,
  exigirDataEditorial,
  serializarCanonico,
  sha256DeTexto,
} from "../src/dados/publicado/release";
import {
  acervoPublicadoSchema,
  DIRETORIO_PUBLICADO,
  episodiosPublicadosSchema,
  NOME_ACERVO,
  NOME_EPISODIOS,
  NOME_RELEASE,
  type Release,
  releaseSchema,
} from "../src/dados/publicado/tipos";
import {
  type ArquivoDoConjunto,
  escreverConjuntoAtomico,
  type ResultadoDoConjunto,
} from "./lib/escrita-atomica";

/** Bloqueio nomeado: o gerador para e diz por quê, em vez de produzir menos. */
export class FalhaDeGeracao extends Error {}

export const CAMINHO_JOURNAL = "db/migrations/meta/_journal.json";

/* ─────────────────────────── linha de comando ─────────────────────────── */

const journalSchema = z.object({
  entries: z
    .array(z.object({ idx: z.number().int(), tag: z.string().min(1) }))
    .min(1),
});

/**
 * Prefixo numérico da última migração aplicada, lido do journal do Drizzle.
 *
 * É derivado, nunca digitado: o journal é o registro de quais migrações
 * existem, e escrever `"0012"` à mão no gerador garantiria apenas que o
 * manifesto continuaria dizendo `0012` depois da migração seguinte.
 */
export function migracaoDoJournal(journal: unknown): string {
  const { entries } = journalSchema.parse(journal);
  const ultima = [...entries].sort((a, b) => a.idx - b.idx).at(-1);
  const prefixo = /^(\d{4})_/.exec(ultima?.tag ?? "");
  if (!prefixo?.[1]) {
    throw new FalhaDeGeracao(
      `Última migração do journal sem prefixo numérico: ${ultima?.tag}.`,
    );
  }
  return prefixo[1];
}

export type Opcoes = {
  readonly escrever: boolean;
  readonly dataEditorial: string;
};

/**
 * Opções da execução. A data é obrigatória; a escrita é sempre explícita.
 *
 * Argumento desconhecido é recusado, como em `publicar-acervo.ts`: num
 * comando que publica, argumento estranho costuma ser erro de digitação em
 * algo que importa.
 */
export function opcoes(argv: readonly string[]): Opcoes {
  const posicao = argv.indexOf("--data");
  const restante =
    posicao === -1
      ? [...argv]
      : [...argv.slice(0, posicao), ...argv.slice(posicao + 2)];

  const modo = z
    .array(z.enum(["--dry-run", "--escrever"]))
    .max(1)
    .parse(restante);

  return {
    escrever: modo[0] === "--escrever",
    dataEditorial: exigirDataEditorial(
      posicao === -1 ? undefined : argv[posicao + 1],
    ),
  };
}

/* ───────────────────────────── montagem pura ──────────────────────────── */

export type EntradaDoSnapshot = {
  readonly anexos: readonly AnexoPublico[];
  readonly episodios: readonly EpisodioPublico[];
  readonly dataEditorial: string;
  /**
   * Lotes formalmente registrados e relacionados à história da publicação.
   * Não é cobertura de proveniência objeto a objeto — ver `releaseSchema`.
   */
  readonly lotesDeclarados: readonly string[];
  readonly migracao: string;
  /** `null` enquanto o pacote daquele release não existir (Lote C). */
  readonly zip: Release["zip"];
};

export type SnapshotMontado = {
  readonly release: Release;
  readonly arquivos: readonly ArquivoDoConjunto[];
};

/**
 * Converte uma entrada do acervo para a forma de disco.
 *
 * Duas conversões, ambas explícitas: `Date` vira texto ISO, e campo opcional
 * ausente vira `null`. Nenhuma das duas pode ficar implícita — a primeira
 * esconderia uma decisão de fuso dentro da serialização, e a segunda faria a
 * chave sumir do arquivo, mudando os bytes sem mudar o conteúdo.
 */
function emFormaDeDisco(anexo: AnexoPublico) {
  return {
    arquivoId: anexo.arquivoId,
    codigo: anexo.codigo,
    estado: anexo.estado,
    revisaoPrivacidade: anexo.revisaoPrivacidade,
    derivadoDe: [...anexo.derivadoDe],
    derivadoDeDocumento: anexo.derivadoDeDocumento,
    arquivoOrigemId: anexo.arquivoOrigemId,
    arquivoRelacao: anexo.arquivoRelacao,
    arquivoDerivacaoMetodo: anexo.arquivoDerivacaoMetodo,
    ordemAnexo: anexo.ordemAnexo,
    slug: anexo.slug,
    rotuloArquivo: anexo.rotuloArquivo,
    principal: anexo.principal,
    titulo: anexo.titulo,
    tipo: anexo.tipo,
    resumo: anexo.resumo,
    dataReferencia: anexo.dataReferencia,
    licenca: anexo.licenca,
    linkPermanente: anexo.linkPermanente,
    linkOrigem: anexo.linkOrigem,
    mimeType: anexo.mimeType,
    bytes: anexo.bytes,
    sha256: anexo.sha256,
    publicadoEm: anexo.publicadoEm?.toISOString() ?? null,
    nomeOriginal: anexo.nomeOriginal ?? null,
    previewUrl: anexo.previewUrl ?? null,
    previewArquivoId: anexo.previewArquivoId ?? null,
    previewSha256: anexo.previewSha256 ?? null,
  };
}

/**
 * Monta os três arquivos a partir do que já foi extraído.
 *
 * Pura de propósito: recebe dados, devolve texto. É o que permite provar a
 * reprodutibilidade — mesmos dados e mesma data editorial produzindo os
 * mesmos bytes — sem banco e sem disco.
 *
 * As invariantes do acervo canônico (dezesseis documentos, as 59 fotografias
 * de B01 reconciliadas com o mapa editorial) **não** são conferidas aqui:
 * elas pertencem ao acervo real, não ao formato, e `validarAcervoPublico` já
 * as aplica em `principal`, sobre os dados que vieram do banco.
 *
 * O manifesto é o último arquivo da lista, e isso é contratual: é o que
 * mantém detectável uma publicação interrompida no meio.
 */
export function montarSnapshot(entrada: EntradaDoSnapshot): SnapshotMontado {
  const acervo = acervoPublicadoSchema.parse(
    entrada.anexos.map(emFormaDeDisco),
  );
  const episodios = episodiosPublicadosSchema.parse(
    entrada.episodios.map((episodio) => ({
      ...episodio,
      publicadoEm: episodio.publicadoEm.toISOString(),
    })),
  );

  const acervoSerializado = serializarCanonico(acervo);
  const episodiosSerializado = serializarCanonico(episodios);
  const sha256DoAcervo = sha256DeTexto(acervoSerializado);
  const sha256DosEpisodios = sha256DeTexto(episodiosSerializado);

  const release = releaseSchema.parse({
    id: calcularIdDoRelease(
      entrada.dataEditorial,
      sha256DoAcervo,
      sha256DosEpisodios,
    ),
    gerado_em: exigirDataEditorial(entrada.dataEditorial),
    lotes_declarados: [...entrada.lotesDeclarados],
    migracao: entrada.migracao,
    totais: {
      documentos: new Set(acervo.map((anexo) => anexo.slug)).size,
      anexos: acervo.length,
      episodios: episodios.length,
    },
    sha256: { acervo: sha256DoAcervo, episodios: sha256DosEpisodios },
    zip: entrada.zip,
  } satisfies Release);

  const releaseSerializado = serializarCanonico(release);
  conferirRelease(release, acervoSerializado, episodiosSerializado);

  return {
    release,
    arquivos: [
      { nome: NOME_ACERVO, conteudo: acervoSerializado },
      { nome: NOME_EPISODIOS, conteudo: episodiosSerializado },
      { nome: NOME_RELEASE, conteudo: releaseSerializado },
    ],
  };
}

/* ─────────────────────────────── extração ─────────────────────────────── */

/**
 * As três consultas. Importa o cliente sob demanda, nunca no topo.
 *
 * O import dinâmico não é estilo: `src/dados/cliente.ts` lança ao ser
 * carregado sem `DATABASE_URL`, e um import estático impediria este arquivo
 * de ser importado por um teste. É o mesmo motivo pelo qual
 * `consultas/pendencias.ts` também importa o cliente sob demanda.
 */
export async function extrair(): Promise<{
  anexos: AnexoPublico[];
  episodios: EpisodioPublico[];
}> {
  if (!process.env.DATABASE_URL?.trim()) {
    throw new FalhaDeGeracao(
      "DATABASE_URL ausente: o snapshot não pode ser gerado. " +
        "As funções de listagem devolvem lista vazia sem credencial, e gravar " +
        "esse vazio publicaria a afirmação de que o acervo não tem documentos. " +
        "Nenhum arquivo foi tocado.",
    );
  }

  const [{ listarAnexosPublicos }, { listarEpisodiosPublicos }] =
    await Promise.all([
      import("../src/dados/consultas/anexos"),
      import("../src/dados/consultas/podobservar"),
    ]);

  const anexos = await listarAnexosPublicos();
  const episodios = await listarEpisodiosPublicos();

  if (anexos.length === 0) {
    throw new FalhaDeGeracao(
      "A projeção pública devolveu nenhum anexo. Isso é falha de consulta ou " +
        "de publicação, nunca um acervo vazio a ser gravado.",
    );
  }

  return { anexos, episodios };
}

/* ──────────────────────────────── execução ────────────────────────────── */

async function principal(): Promise<ResultadoDoConjunto> {
  const { escrever, dataEditorial } = opcoes(process.argv.slice(2));
  if (existsSync(".env.local")) loadEnvFile(".env.local");

  const { anexos, episodios } = await extrair();

  /*
    Invariantes do acervo canônico, antes de qualquer escrita.

    `validarAcervoPublico` exige os dezesseis documentos e chama
    `reconciliarMapaB01`, que confere as 59 fotografias contra o mapa
    editorial. São as mesmas regras que o build aplica hoje em produção; aqui
    elas passam a rodar na publicação, que é onde um erro ainda pode ser
    corrigido sem o site ficar no ar errado.
  */
  const { validarAcervoPublico } = await import(
    "../src/dados/consultas/acervo"
  );
  const documentos = validarAcervoPublico(anexos);

  const montado = montarSnapshot({
    anexos,
    episodios,
    dataEditorial,
    lotesDeclarados: IDS_DOS_LOTES,
    migracao: migracaoDoJournal(
      JSON.parse(await readFile(CAMINHO_JOURNAL, "utf8")),
    ),
    /*
      O pacote é do Lote C. Até lá o release declara a ausência em vez de
      simulá-la: chave inventada apontaria para um objeto que não está no
      bucket, que foi exatamente o defeito do primeiro deployment.
    */
    zip: null,
  });

  const resultado = await escreverConjuntoAtomico(
    DIRETORIO_PUBLICADO,
    montado.arquivos,
    { escrever },
  );

  console.log(
    `[snapshot] release ${montado.release.id} — ` +
      `${documentos.length} documentos, ${montado.release.totais.anexos} anexos, ` +
      `${montado.release.totais.episodios} episódios`,
  );
  for (const arquivo of resultado.arquivos) {
    console.log(
      `[snapshot] ${arquivo.nome} — ${arquivo.bytes} B, ` +
        `sha ${arquivo.sha256.slice(0, 12)}…${arquivo.mudou ? "" : " (sem mudança)"}`,
    );
  }
  console.log(
    resultado.escrito
      ? `[snapshot] gravado em ${resultado.destino}. Confira o diff antes de commitar.`
      : "[snapshot] ensaio: nada foi gravado. Use --escrever para publicar.",
  );

  return resultado;
}

if (process.argv[1]?.includes("gerar-snapshot-publicado")) {
  principal().catch((erro: unknown) => {
    console.error(
      `[snapshot] ${erro instanceof Error ? erro.message : String(erro)}`,
    );
    process.exit(1);
  });
}
