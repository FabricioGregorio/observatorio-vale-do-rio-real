import { z } from "zod";

import { mapaB01, reconciliarMapaB01 } from "../editorial/mapa-b01";
import { tipoPublico } from "../editorial/tipos-publicos";
import { type AnexoPublico, listarAnexosPublicos } from "./anexos";

export type DocumentoDoAcervo = {
  slug: string;
  titulo: string;
  tipo: string;
  resumo: string | null;
  licenca: string;
  arquivos: AnexoPublico[];
};

/** A fonte de autorização é sempre a lista já filtrada pela view e manifesto. */
export function organizarDocumentosPublicos(
  anexos: readonly AnexoPublico[],
): DocumentoDoAcervo[] {
  const documentos = new Map<string, DocumentoDoAcervo>();
  for (const arquivo of anexos) {
    const documento = documentos.get(arquivo.slug);
    if (documento) documento.arquivos.push(arquivo);
    else
      documentos.set(arquivo.slug, {
        slug: arquivo.slug,
        titulo: arquivo.titulo,
        tipo: arquivo.tipo,
        resumo: arquivo.resumo,
        licenca: arquivo.licenca,
        arquivos: [arquivo],
      });
  }
  return [...documentos.values()];
}

export function validarAcervoPublico(anexos: readonly AnexoPublico[]) {
  const ids = new Set(anexos.map((item) => item.arquivoId));
  if (ids.size !== anexos.length)
    throw new Error("Acervo: arquivo documental duplicado.");
  const documentos = organizarDocumentosPublicos(anexos);
  if (documentos.length !== 16)
    throw new Error(
      `Acervo: esperado 16 documentos; recebidos ${documentos.length}.`,
    );
  reconciliarMapaB01(anexos);
  return documentos;
}

/**
 * Os documentos públicos, sempre validados.
 *
 * Enquanto a fonte era o banco, a validação integral rodava só em produção:
 * uma máquina de desenvolvimento sem credencial recebia lista vazia, e exigir
 * 16 documentos dela seria exigir que ninguém programasse sem banco.
 *
 * Com o snapshot versionado essa assimetria perdeu sentido — e virou risco. O
 * acervo agora é o mesmo arquivo em toda máquina, então um `acervo.json`
 * editado errado precisa falhar no primeiro `pnpm teste`, e não só no build de
 * produção. Validar sempre também é o que permite a esta camada não ler
 * variável de ambiente alguma.
 */
export async function listarDocumentosPublicos(): Promise<DocumentoDoAcervo[]> {
  return validarAcervoPublico(await listarAnexosPublicos());
}

export function selecionarDocumentoPublico(
  documentos: readonly DocumentoDoAcervo[],
  slug: string,
): DocumentoDoAcervo | null {
  return documentos.find((documento) => documento.slug === slug) ?? null;
}

export function selecionarArquivoPublico(
  documentos: readonly DocumentoDoAcervo[],
  slug: string,
  arquivoId: string,
): AnexoPublico | null {
  if (!z.uuid().safeParse(arquivoId).success) return null;
  const documento = selecionarDocumentoPublico(documentos, slug);
  return (
    documento?.arquivos.find((arquivo) => arquivo.arquivoId === arquivoId) ??
    null
  );
}

/**
 * Título humano das abas do anexo de indicadores (A11-00 a A11-16).
 *
 * O rótulo publicado dessas peças é o nome do arquivo sem hífen —
 * "serie mensal", "dicionario dados" —, e era isso que a interface exibia.
 * Aqui só entra a aba cujo título se recupera **sem interpretação**:
 * acento e maiúscula restituídos, e no máximo a preposição que a leitura
 * exige ("Dicionário dos dados"). Aba cujo nome precisaria de escolha
 * editorial para virar título — "indicadores solidaria" é economia
 * solidária? "publico mensuracao" é mensuração do público? — fica de fora
 * e continua exibida como está publicada, até que alguém decida.
 */
const TITULOS_DAS_ABAS_A11: Readonly<Record<string, string>> = {
  capa: "Capa",
  sumario: "Sumário",
  "painel executivo": "Painel executivo",
  "serie mensal": "Série mensal",
  localidades: "Localidades",
  fornecedores: "Fornecedores",
  atividades: "Atividades",
  conciliacao: "Conciliação",
  "nota metodologica": "Nota metodológica",
  "perfil visitantes": "Perfil dos visitantes",
  "grupos institucionais": "Grupos institucionais",
  "dicionario dados": "Dicionário dos dados",
};

/** `A02 — relatório técnico integral`, `A11-05 — serie mensal`, `B04 — …`. */
const ROTULO_COM_IDENTIFICADOR = /^([A-D]\d{2}(?:-\d{2})?) — (.+)$/;

export type ApresentacaoDoArquivo = {
  /** O que a pessoa lê como nome da peça. */
  readonly titulo: string;
  /** Código documental do inventário, exibido à parte; `null` quando não há. */
  readonly identificador: string | null;
};

/**
 * Título e identificador de um arquivo, separados — só para apresentação.
 *
 * O rótulo publicado junta os dois ("A11-16 — dicionario dados"), e o
 * código na frente fazia o título parecer nome de arquivo. A interface passa
 * a mostrar "Dicionário dos dados" como título e "A11-16" como identificador.
 * Nada muda no snapshot, na chave do arquivo, no slug ou no `arquivoId`: é a
 * leitura do rótulo, e não o rótulo.
 *
 * - Fotografia do conjunto B01: o título editorial do mapa, sem código.
 * - Aba do A11: o título da tabela acima; aba fora da tabela conserva o
 *   rótulo inteiro, código incluído, porque separar só o código deixaria à
 *   mostra um título que ninguém escreveu.
 * - Demais rótulos com código ("B04 — áudio da entrevista"): a descrição já
 *   é texto escrito para ler, e só ganha a maiúscula inicial.
 * - Rótulo sem descrição ("D01-04") ou ausente: fica como está.
 */
export function apresentarArquivoPublico(
  arquivo: AnexoPublico,
): ApresentacaoDoArquivo {
  if (arquivo.slug === "fotografias-visitas-i-vii") {
    const entrada = mapaB01.arquivos.find(
      (item) =>
        item.arquivoId === (arquivo.previewArquivoId ?? arquivo.arquivoId),
    );
    if (!entrada)
      throw new Error(`B01: entrada editorial ausente ${arquivo.arquivoId}.`);
    return { titulo: entrada.tituloPublico, identificador: null };
  }
  const rotulo =
    arquivo.rotuloArquivo?.split(" — Foto: ")[0]?.trim() || arquivo.titulo;
  const partes = ROTULO_COM_IDENTIFICADOR.exec(rotulo);
  const identificador = partes?.[1];
  const descricao = partes?.[2]?.trim();
  if (identificador === undefined || !descricao)
    return { titulo: rotulo, identificador: null };
  if (identificador.startsWith("A11-")) {
    const titulo = TITULOS_DAS_ABAS_A11[descricao];
    return titulo === undefined
      ? { titulo: rotulo, identificador: null }
      : { titulo, identificador };
  }
  return {
    titulo: `${descricao.charAt(0).toLocaleUpperCase("pt-BR")}${descricao.slice(1)}`,
    identificador,
  };
}

export function tituloDoArquivoPublico(arquivo: AnexoPublico): string {
  return apresentarArquivoPublico(arquivo).titulo;
}

/**
 * Como o documento se identifica para quem lê, sem repetir o tipo.
 *
 * O título público de um documento costuma abrir pelo próprio tipo —
 * "Entrevista — Pedro Menezes (05/04/2026)", "Relatório Técnico — Recanto da
 * Serra". Quando o que vem antes do travessão é exatamente o tipo público do
 * documento (`tipoPublico`), a identificação é o que vem depois; em qualquer
 * outro caso, é o título inteiro. Não há interpretação: só se retira um
 * prefixo que o próprio dado estruturado confirma.
 */
export function identificacaoDoDocumento(
  documento: Pick<DocumentoDoAcervo, "slug" | "tipo" | "titulo">,
): string {
  const [prefixo, ...resto] = documento.titulo.split(" — ");
  const tipo = tipoPublico(documento.tipo, documento.slug);
  return resto.length > 0 &&
    prefixo?.toLocaleLowerCase("pt-BR") === tipo.toLocaleLowerCase("pt-BR")
    ? resto.join(" — ")
    : documento.titulo;
}

/**
 * Título da página (`<title>`) da ficha de um arquivo.
 *
 * O título público do arquivo basta quando é único no acervo. Quando se
 * repete — "Transcrição da entrevista" existe em oito documentos —, a página
 * ganha a identificação do documento pai: "Transcrição da entrevista — Pedro
 * Menezes (05/04/2026)". O H1 e a migalha não mudam; eles já mostram o
 * documento na própria página.
 */
export function tituloDaPaginaDoArquivo(
  arquivo: AnexoPublico,
  documentos: readonly DocumentoDoAcervo[],
): string {
  const titulo = tituloDoArquivoPublico(arquivo);
  const repeticoes = documentos
    .flatMap((documento) => documento.arquivos)
    .filter((outro) => tituloDoArquivoPublico(outro) === titulo).length;
  const documento = documentos.find((d) => d.slug === arquivo.slug);
  return repeticoes > 1 && documento !== undefined
    ? `${titulo} — ${identificacaoDoDocumento(documento)}`
    : titulo;
}
