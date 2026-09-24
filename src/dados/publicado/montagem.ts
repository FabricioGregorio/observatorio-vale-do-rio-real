/**
 * Montagem dos três arquivos do snapshot — pura, sem banco, sem disco.
 *
 * O código vivia em `scripts/gerar-snapshot-publicado.ts`, ao lado da extração
 * que lia as projeções públicas do PostgreSQL. A extração foi removida com o
 * banco; a montagem não tem nada a ver com ele — recebe dados já em memória e
 * devolve texto — e por isso ficou, num módulo que qualquer fluxo editorial
 * futuro pode chamar.
 *
 * A propriedade que este módulo existe para sustentar continua sendo:
 *
 *     mesmos dados + mesma data editorial = mesmos bytes
 *
 * Nada aqui lê variável de ambiente, abre arquivo, consulta relógio ou fala
 * com a rede.
 */
import { z } from "zod";

import type { AnexoPublico } from "../anexo-publico";
import type { EpisodioPublico } from "../podobservar-publico";
import {
  calcularIdDoRelease,
  conferirRelease,
  exigirDataEditorial,
  serializarCanonico,
  sha256DeTexto,
} from "./release";
import {
  acervoPublicadoSchema,
  episodiosPublicadosSchema,
  NOME_ACERVO,
  NOME_EPISODIOS,
  NOME_RELEASE,
  type Release,
  releaseSchema,
} from "./tipos";

/** Bloqueio nomeado: a montagem para e diz por quê, em vez de produzir menos. */
export class FalhaDeGeracao extends Error {}

/* ─────────────────────────── linha de comando ─────────────────────────── */

export type Opcoes = {
  readonly escrever: boolean;
  readonly dataEditorial: string;
};

/**
 * Opções de um comando que publica: a data é obrigatória, a escrita é sempre
 * explícita e argumento desconhecido é recusado em vez de ignorado.
 *
 * Num comando que publica, argumento estranho costuma ser erro de digitação
 * em algo que importa.
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

/** Um arquivo do conjunto: nome simples, sem diretório, e conteúdo em texto. */
export type ArquivoDoSnapshot = {
  readonly nome: string;
  readonly conteudo: string;
};

export type EntradaDoSnapshot = {
  readonly anexos: readonly AnexoPublico[];
  readonly episodios: readonly EpisodioPublico[];
  readonly dataEditorial: string;
  /**
   * Lotes formalmente registrados e relacionados à história da publicação.
   * Não é cobertura de proveniência objeto a objeto — ver `releaseSchema`.
   */
  readonly lotesDeclarados: readonly string[];
  /** `null` enquanto o pacote daquele release não existir (Lote C). */
  readonly zip: Release["zip"];
};

export type SnapshotMontado = {
  readonly release: Release;
  readonly arquivos: readonly ArquivoDoSnapshot[];
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
 * Monta os três arquivos a partir dos dados já reunidos.
 *
 * Pura de propósito: recebe dados, devolve texto. É o que permite provar a
 * reprodutibilidade — mesmos dados e mesma data editorial produzindo os
 * mesmos bytes — sem banco e sem disco.
 *
 * As invariantes do acervo canônico (dezesseis documentos, as fotografias de
 * B01 reconciliadas com o mapa editorial) **não** são conferidas aqui: elas
 * pertencem ao acervo real, não ao formato, e `validarAcervoPublico` já as
 * aplica sobre os dados.
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
