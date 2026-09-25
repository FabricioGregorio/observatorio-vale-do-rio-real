/**
 * As garantias do corpus público — o que precisa ser verdade antes de publicar.
 *
 * `validarAcervoPublico` já confere o que o Acervo precisa para renderizar:
 * dezesseis documentos, nenhum arquivo repetido, B01 reconciliado com o mapa
 * editorial. As garantias daqui são de outra natureza — são as que impedem
 * que o corpus **cresça errado**: um derivado antigo voltando ao lado do
 * original, um preview virando entrada própria, o original com placa
 * atravessando a fronteira, ou um documento anunciado sem existir.
 *
 * Todas são puras e funcionam sobre o snapshot versionado. Elas rodam na
 * suíte e rodam de novo na auditoria de publicação, antes de qualquer objeto
 * ser empacotado: um ZIP construído sobre um corpus que não satisfaz estas
 * regras distribuiria o erro em vez de acusá-lo.
 */
import type { AnexoPublico } from "../anexo-publico";
import { FOTO_DA_PLACA } from "../pesquisa/excecao-placa";

/** O tamanho do corpus público no cutover de setembro de 2026. */
export const TOTAL_CANONICO = 107;

/** Documentos distintos no mesmo corpus. */
export const TOTAL_DE_DOCUMENTOS = 16;

/** Falha de canonicidade: o corpus não pode ser publicado como está. */
export class CorpusIncoerente extends Error {}

function exigir(condicao: boolean, mensagem: string): void {
  if (!condicao) throw new CorpusIncoerente(mensagem);
}

/**
 * Confere as garantias do corpus canônico.
 *
 * Lança na primeira violação, com o motivo por extenso. Não devolve aviso e
 * não tem modo permissivo: quem chama está prestes a publicar.
 */
export function conferirCorpusCanonico(acervo: readonly AnexoPublico[]): {
  anexos: number;
  documentos: number;
  comPreview: number;
} {
  exigir(
    acervo.length === TOTAL_CANONICO,
    `Corpus público com ${acervo.length} anexos; esperado ${TOTAL_CANONICO}.`,
  );

  const ids = new Set(acervo.map((anexo) => anexo.arquivoId));
  exigir(ids.size === acervo.length, "Corpus público com arquivoId repetido.");

  const documentos = new Set(acervo.map((anexo) => anexo.slug));
  exigir(
    documentos.size === TOTAL_DE_DOCUMENTOS,
    `Corpus público com ${documentos.size} documentos; esperado ${TOTAL_DE_DOCUMENTOS}.`,
  );

  /*
    Derivado documental antigo não volta para o lado do original.

    Enquanto A05 e A06 eram publicados ao lado de A02 e A03, o acervo
    mostrava o mesmo conteúdo duas vezes e o visitante tinha de adivinhar
    qual era o documento. A regra é simples: se o original está público, o
    derivado dele não é entrada própria.
  */
  for (const anexo of acervo) {
    if (anexo.arquivoRelacao === "derivado" && anexo.arquivoOrigemId) {
      exigir(
        !ids.has(anexo.arquivoOrigemId),
        `Derivado ${anexo.arquivoId} publicado ao lado do original ${anexo.arquivoOrigemId}.`,
      );
    }
  }

  /*
    Preview é metadado da entrada, não entrada.

    Os 57 previews fotográficos existem para a apresentação — o arquivo
    documental continua sendo o original. Um preview que ganhasse entrada
    própria viraria o 108º arquivo do acervo e entraria no pacote como se
    fosse documento.
  */
  const urls = new Set(acervo.map((anexo) => anexo.linkPermanente));
  let comPreview = 0;
  for (const anexo of acervo) {
    if (!anexo.previewUrl) continue;
    comPreview += 1;
    exigir(
      !urls.has(anexo.previewUrl),
      `Preview de ${anexo.arquivoId} também está publicado como entrada.`,
    );
    exigir(
      anexo.previewArquivoId === undefined || !ids.has(anexo.previewArquivoId),
      `Preview de ${anexo.arquivoId} tem entrada própria no acervo.`,
    );
    /*
      A fotografia canônica é o original; o preview é que é WebP. O inverso
      — canônico em WebP com preview apontando para o original — significaria
      que o acervo trocou o documento pela miniatura.
    */
    exigir(
      anexo.mimeType !== "image/webp",
      `Entrada WebP com preview próprio: ${anexo.arquivoId}.`,
    );
  }

  /*
    A fotografia com placa de veículo.

    O original é privado e não tem representação pública. A única forma
    autorizada é a versão tarjada, com hash declarado. As duas asserções são
    complementares: a primeira impede o original de entrar, a segunda impede
    que a entrada pública seja substituída por outra imagem qualquer.
  */
  exigir(
    !acervo.some((anexo) => anexo.sha256 === FOTO_DA_PLACA.sha256Original),
    "Original com placa presente no corpus público.",
  );
  exigir(
    !acervo.some(
      (anexo) => anexo.previewSha256 === FOTO_DA_PLACA.sha256Original,
    ),
    "Original com placa presente como preview.",
  );
  const tarjada = acervo.find(
    (anexo) => anexo.arquivoId === FOTO_DA_PLACA.arquivoPublicoId,
  );
  exigir(
    tarjada !== undefined,
    "Versão pública tarjada ausente do corpus público.",
  );
  exigir(
    tarjada?.sha256 === FOTO_DA_PLACA.sha256Publico,
    "Versão pública tarjada com hash diferente do autorizado.",
  );

  /*
    O Caderno de Estudos ainda não existe.

    Ele é anunciado no Acervo como "em elaboração", em texto, sem arquivo e
    sem endereço. Uma entrada no catálogo significaria um documento publicado
    — e publicar um documento que não existe é a única coisa que um acervo
    documental não pode fazer.
  */
  exigir(
    !acervo.some(
      (anexo) =>
        /caderno[- ]de[- ]estudos/i.test(anexo.slug) ||
        /caderno de estudos/i.test(anexo.titulo),
    ),
    "Caderno de Estudos presente no catálogo antes de existir.",
  );

  return {
    anexos: acervo.length,
    documentos: documentos.size,
    comPreview,
  };
}
