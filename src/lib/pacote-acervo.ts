/**
 * O pacote do acervo — o que entra no "Baixar tudo em ZIP", e com que nome.
 *
 * Tudo aqui é puro: recebe o catálogo publicado e devolve a lista de entradas
 * do pacote. Não lê disco, não fala com storage e não empacota — quem faz
 * isso é `scripts/gerar-zip-acervo.ts`. A separação existe para que a regra
 * de seleção possa ser provada sem 588 MiB por perto.
 *
 * ## A seleção é por pertencimento, nunca por tipo de arquivo
 *
 * O pacote contém exatamente os arquivos representados pelas entradas de
 * `acervo.json` — as 107 de hoje, e o que houver amanhã. Não se filtra por
 * extensão nem por MIME, e a razão é concreta: **há um WebP canônico** entre
 * os originais. Uma regra do tipo "WebP é preview" o deixaria de fora do
 * pacote, e o acervo passaria a distribuir 106 documentos afirmando 107.
 *
 * Os previews ficam de fora por outro motivo, que não tem nada a ver com
 * formato: `previewUrl`, `previewArquivoId` e `previewSha256` são metadados
 * **dentro** de uma entrada, e não entradas. Nunca houve 164 objetos no
 * acervo; há 107, e 57 deles têm um asset de apresentação.
 *
 * ## O nome de cada arquivo dentro do pacote
 *
 *     <slug do documento>/<caminho da chave canônica dentro da categoria>
 *
 * O primeiro segmento agrupa por documento, que é como uma pessoa procura o
 * que baixou. O resto vem da chave do objeto no storage, sem invenção: é o
 * que garante unicidade sem recorrer a UUID no nome.
 *
 * O segundo segmento não é só o nome do arquivo porque dois nomes se repetem
 * no acervo — `principal-capa.jpg` existe em `ilha-grande/` e em
 * `serra-dos-macacos/`, duas fotografias diferentes do mesmo documento B01.
 * Preservar o caminho da chave resolve isso mantendo a leitura: a pasta do
 * lugar aparece no pacote como aparece no acervo.
 */
import type { AnexoPublico } from "../dados/anexo-publico";
import { ORIGEM_DO_ACERVO } from "../dados/publicado/downloads";

/** Uma entrada do pacote: o caminho interno e o objeto que ele carrega. */
export type EntradaDoPacote = {
  /** Caminho dentro do ZIP, sempre com `/`. */
  readonly caminho: string;
  readonly arquivoId: string;
  /** Chave do objeto no storage público, sem barra inicial. */
  readonly chave: string;
  readonly bytes: number;
  readonly sha256: string;
  readonly mimeType: string;
};

/** Falha de empacotamento: o pacote não pode ser gerado como está. */
export class PacoteIncoerente extends Error {}

/** Chave do objeto no storage, derivada do link canônico. */
export function chaveDoObjeto(linkPermanente: string): string {
  const url = new URL(linkPermanente);
  if (url.origin !== ORIGEM_DO_ACERVO) {
    throw new PacoteIncoerente(
      `Objeto fora do acervo público: ${linkPermanente}`,
    );
  }
  return decodeURIComponent(url.pathname.replace(/^\//, ""));
}

/**
 * Caminho de um anexo dentro do pacote.
 *
 * A chave canônica começa sempre em `arquivos/<categoria>/`. A categoria sai
 * do caminho porque o documento já é o primeiro segmento; o que fica depois
 * dela é preservado inteiro, inclusive subpastas.
 */
export function caminhoNoPacote(anexo: AnexoPublico): string {
  const chave = chaveDoObjeto(anexo.linkPermanente);
  const dentroDaCategoria = chave.replace(/^arquivos\/[^/]+\//, "");
  if (dentroDaCategoria === chave || dentroDaCategoria === "") {
    throw new PacoteIncoerente(`Chave fora do padrão do acervo: ${chave}`);
  }
  const caminho = `${anexo.slug}/${dentroDaCategoria}`;
  /*
    Nenhum segmento pode escapar do pacote. Um `..` num caminho de ZIP é o
    bug clássico de extração fora do diretório de destino, e o caminho aqui
    vem de dado — conferir é barato.
  */
  for (const segmento of caminho.split("/")) {
    if (segmento === "" || segmento === "." || segmento === "..") {
      throw new PacoteIncoerente(`Caminho inseguro no pacote: ${caminho}`);
    }
  }
  return caminho;
}

/**
 * As entradas do pacote, em ordem determinística.
 *
 * A ordem é o caminho interno comparado por unidade de código, e não a ordem
 * do catálogo: o pacote precisa sair igual mesmo que o acervo seja
 * reordenado, porque é o conteúdo que endereça o objeto.
 */
export function entradasDoPacote(
  acervo: readonly AnexoPublico[],
): EntradaDoPacote[] {
  const entradas = acervo.map((anexo) => ({
    caminho: caminhoNoPacote(anexo),
    arquivoId: anexo.arquivoId,
    chave: chaveDoObjeto(anexo.linkPermanente),
    bytes: anexo.bytes,
    sha256: anexo.sha256,
    mimeType: anexo.mimeType,
  }));

  const caminhos = new Set(entradas.map((entrada) => entrada.caminho));
  if (caminhos.size !== entradas.length) {
    const vistos = new Set<string>();
    const repetido = entradas.find((entrada) => {
      if (vistos.has(entrada.caminho)) return true;
      vistos.add(entrada.caminho);
      return false;
    });
    throw new PacoteIncoerente(
      `Dois arquivos com o mesmo caminho no pacote: ${repetido?.caminho}`,
    );
  }

  return entradas.sort((a, b) =>
    a.caminho < b.caminho ? -1 : a.caminho > b.caminho ? 1 : 0,
  );
}

/**
 * Chave do pacote no storage, endereçada pelo conteúdo.
 *
 * Doze caracteres do hash: o bastante para que uma colisão seja improvável
 * num acervo desta ordem de grandeza, e curto o bastante para caber num
 * endereço que alguém pode copiar. Conteúdo igual produz chave igual, então
 * republicar o mesmo pacote não gera objeto novo — e o pacote de um release
 * antigo continua no lugar quando o novo chega.
 */
export function chaveDoPacote(sha256: string): string {
  if (!/^[a-f0-9]{64}$/.test(sha256)) {
    throw new PacoteIncoerente(`SHA-256 inválido para o pacote: ${sha256}`);
  }
  return `acervo/pacotes/anexos-${sha256.slice(0, 12)}.zip`;
}

/**
 * Instante gravado em toda entrada do pacote.
 *
 * O formato ZIP guarda data e hora por arquivo. Usar o relógio faria duas
 * execuções do mesmo conteúdo produzirem pacotes diferentes — e a chave, que
 * é o hash, mudaria sem que nada tivesse mudado.
 *
 * O valor é **texto sem fuso**, e isso é deliberado. O campo do ZIP é o
 * MS-DOS de 1980: ano, mês, dia, hora, minuto e segundo, sem fuso nenhum. A
 * biblioteca converte com os campos locais da máquina, então um instante
 * absoluto — `Date.UTC(...)` — viraria um carimbo diferente em cada fuso, e
 * o mesmo corpus produziria pacotes diferentes no Brasil e na Alemanha.
 * Declarado como hora de parede, o carimbo é o mesmo em qualquer lugar.
 *
 * A data é a mais antiga que o formato aceita com folga: o começo de 1980,
 * ao meio-dia, longe de qualquer virada de horário de verão.
 */
export const INSTANTE_DO_PACOTE = "1980-01-02T12:00:00";
