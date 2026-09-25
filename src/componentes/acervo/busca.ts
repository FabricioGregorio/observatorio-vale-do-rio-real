/**
 * Busca do Acervo — a regra de recuperação, sem interface e sem dado.
 *
 * ## O que ela respeita
 *
 * O Acervo é consultado por documento: 16 documentos, que reúnem 107
 * arquivos. A busca continua devolvendo documentos. Quando o acerto vem de um
 * arquivo — "série mensal" é uma aba do anexo de indicadores, e não um
 * documento —, o resultado é o **documento pai**, com o arquivo apontado
 * dentro dele. Nenhum arquivo sobe a documento, e nenhum documento aparece
 * duas vezes.
 *
 * ## O que ela lê
 *
 * O que `indiceDeBusca.ts` monta em build: título, resumo e tipo do
 * documento; o contexto que o próprio site já publica sobre ele (pessoa,
 * instituição, lugar, município, o nome do material); e, por arquivo, o
 * título público e o contexto do arquivo. Nada disso é palavra-chave
 * inventada: é o vocabulário que Pesquisa, Território e Campo já usam.
 *
 * ## Como compara
 *
 * Sem distinção de caixa nem de acento: "oviedo" encontra "Oviêdo", "sao
 * cristovao" encontra "São Cristóvão". A grafia exibida não muda — a
 * normalização existe só na comparação. Cada palavra da consulta precisa
 * aparecer em algum lugar do documento ou dos seus arquivos.
 *
 * Módulo puro e sem dependência de dado: é o que o componente cliente
 * importa, e por isso não pode arrastar para o bundle os módulos que montam
 * o índice.
 */

/** Um arquivo do documento, no mínimo necessário para achá-lo e abri-lo. */
export type ArquivoDoIndice = {
  readonly id: string;
  readonly titulo: string;
  /** Texto adicional de recuperação do arquivo: grupo, identificador. */
  readonly contexto: string | null;
};

export type DocumentoDoIndice = {
  readonly slug: string;
  readonly titulo: string;
  readonly tipo: string;
  readonly resumo: string | null;
  readonly quantidade: number;
  /** Termos que o site já associa publicamente a este documento. */
  readonly contexto: readonly string[];
  readonly arquivos: readonly ArquivoDoIndice[];
};

/** Arquivos do documento que correspondem à consulta. */
export type Correspondencia = {
  readonly arquivos: readonly ArquivoDoIndice[];
  /** Quantos correspondem além dos exibidos. */
  readonly alemDosExibidos: number;
};

export type ResultadoDaBusca = {
  readonly documento: DocumentoDoIndice;
  readonly correspondencia: Correspondencia | null;
};

/** Quantos arquivos correspondentes aparecem por documento. */
export const ARQUIVOS_EXIBIDOS = 3;

/**
 * O índice na forma em que atravessa para o cliente.
 *
 * O mesmo conteúdo de `DocumentoDoIndice[]`, sem repetição: cada termo de
 * contexto é escrito uma vez, em `termos`, e documentos e arquivos apontam
 * para ele por posição; arquivo é tupla, e não objeto com chave repetida
 * 107 vezes. Não muda o que a busca sabe — `expandirIndice` devolve
 * exatamente o índice original —, só o que pesa no HTML do Acervo.
 */
export type IndiceCompacto = {
  readonly termos: readonly string[];
  readonly documentos: readonly (readonly [
    slug: string,
    titulo: string,
    tipo: string,
    resumo: string | null,
    contexto: readonly number[],
    arquivos: readonly (readonly [
      id: string,
      titulo: string,
      contexto: number,
    ])[],
  ])[];
};

export function compactarIndice(
  documentos: readonly DocumentoDoIndice[],
): IndiceCompacto {
  const termos: string[] = [];
  const posicao = new Map<string, number>();
  const termo = (valor: string) => {
    let i = posicao.get(valor);
    if (i === undefined) {
      i = termos.push(valor) - 1;
      posicao.set(valor, i);
    }
    return i;
  };
  return {
    termos,
    documentos: documentos.map((d) => [
      d.slug,
      d.titulo,
      d.tipo,
      d.resumo,
      d.contexto.map(termo),
      d.arquivos.map(
        (a) =>
          [
            a.id,
            a.titulo,
            a.contexto === null ? -1 : termo(a.contexto),
          ] as const,
      ),
    ]),
  };
}

export function expandirIndice(indice: IndiceCompacto): DocumentoDoIndice[] {
  const termo = (i: number) => indice.termos[i] ?? "";
  return indice.documentos.map(
    ([slug, titulo, tipo, resumo, contexto, arquivos]) => ({
      slug,
      titulo,
      tipo,
      resumo,
      quantidade: arquivos.length,
      contexto: contexto.map(termo),
      arquivos: arquivos.map(([id, tituloDoArquivo, c]) => ({
        id,
        titulo: tituloDoArquivo,
        contexto: c < 0 ? null : termo(c),
      })),
    }),
  );
}

/**
 * Forma de comparação: sem acento, sem caixa, espaços únicos.
 *
 * NFD separa a letra da marca diacrítica, e a classe `\p{M}` remove a marca.
 * "Oviêdo" vira "oviedo"; "ç" vira "c". É só para comparar.
 */
export function normalizarBusca(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/\s+/g, " ")
    .trim();
}

function palavras(busca: string): string[] {
  const normalizada = normalizarBusca(busca);
  return normalizada ? normalizada.split(" ") : [];
}

function textoDoArquivo(arquivo: ArquivoDoIndice): string {
  return normalizarBusca(`${arquivo.titulo} ${arquivo.contexto ?? ""}`);
}

/**
 * Busca sobre os documentos, com filtro de tipo.
 *
 * O filtro vale sobre o documento, antes de tudo: um arquivo nunca faz
 * aparecer um documento de outro tipo.
 *
 * Um documento entra quando toda palavra da consulta aparece nele ou em algum
 * dos seus arquivos. Os arquivos apontados são:
 *
 * - se o documento sozinho não cobre a consulta, os arquivos que cobrem o que
 *   falta — é o caso de "série mensal" dentro do anexo de indicadores;
 * - se o documento já cobre a consulta, os arquivos que a cobrem sozinhos —
 *   "Recanto" encontra o formulário de visitantes pelo documento, e aponta a
 *   planilha do Recanto dentro dele.
 */
export function buscarNoAcervo(
  documentos: readonly DocumentoDoIndice[],
  busca: string,
  tipo: string,
): ResultadoDaBusca[] {
  const termos = palavras(busca);
  const resultados: ResultadoDaBusca[] = [];
  for (const documento of documentos) {
    if (tipo && documento.tipo !== tipo) continue;
    if (termos.length === 0) {
      resultados.push({ documento, correspondencia: null });
      continue;
    }
    const doDocumento = normalizarBusca(
      [documento.titulo, documento.resumo ?? "", ...documento.contexto].join(
        " ",
      ),
    );
    const faltando = termos.filter((termo) => !doDocumento.includes(termo));
    const exigidos = faltando.length > 0 ? faltando : termos;
    const textos = documento.arquivos.map(textoDoArquivo);
    if (faltando.some((termo) => !textos.some((t) => t.includes(termo))))
      continue;
    let arquivos = documento.arquivos.filter((_, i) =>
      exigidos.every((termo) => textos[i]?.includes(termo)),
    );
    // O que falta está repartido entre arquivos: aponta cada um que contribui.
    if (arquivos.length === 0 && faltando.length > 0)
      arquivos = documento.arquivos.filter((_, i) =>
        faltando.some((termo) => textos[i]?.includes(termo)),
      );
    resultados.push({
      documento,
      correspondencia:
        arquivos.length === 0
          ? null
          : {
              arquivos: arquivos.slice(0, ARQUIVOS_EXIBIDOS),
              alemDosExibidos: Math.max(0, arquivos.length - ARQUIVOS_EXIBIDOS),
            },
    });
  }
  return resultados;
}
