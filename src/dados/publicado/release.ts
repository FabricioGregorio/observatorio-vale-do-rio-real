/**
 * Identidade e integridade de um release documental.
 *
 * Tudo aqui é função pura. Nada lê banco, nada lê arquivo, nada consulta o
 * relógio. É deliberado: são exatamente estas funções que decidem se duas
 * gerações do mesmo conteúdo produzem os mesmos bytes, e uma função que
 * consulta o relógio nunca produz.
 *
 * ## A regra que este módulo existe para sustentar
 *
 *     mesmos dados + mesma data editorial = mesmos bytes
 *
 * Três coisas podiam quebrá-la e são tratadas uma a uma:
 *
 * - **ordem das propriedades**: `serializarCanonico` ordena as chaves por
 *   unidade de código, recursivamente, então a ordem em que o objeto foi
 *   construído deixa de importar;
 * - **locale do sistema**: a ordenação usa `<` e `>`, nunca `localeCompare`,
 *   que ordena diferente em locales diferentes;
 * - **relógio e fuso**: a data é recebida como argumento e validada em UTC.
 *   Nenhuma função aqui chama `Date.now()` nem `new Date()` sem argumento.
 */
import { createHash } from "node:crypto";

/** SHA-256 em hexadecimal do texto, em UTF-8. */
export function sha256DeTexto(texto: string): string {
  return createHash("sha256").update(texto, "utf8").digest("hex");
}

const PADRAO_DATA = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * A data editorial da publicação, validada.
 *
 * Não existe padrão e não existe "hoje". Quem publica escreve a data na linha
 * de comando, pela mesma razão que `lotes-de-publicacao.ts` exige `--lote`:
 * num site documental, um executor que adivinha o que está publicando é pior
 * que um executor que não roda. E, como a data entra no identificador do
 * release, deixá-la vir do relógio faria duas gerações do mesmo conteúdo
 * produzirem releases diferentes — que é justamente o que não pode acontecer.
 *
 * A conferência é de calendário, não só de formato: `2026-02-30` casa com a
 * expressão regular e não existe. A construção é em UTC para que a validação
 * não mude de resultado conforme o fuso da máquina que roda o gerador.
 */
export function exigirDataEditorial(valor: string | undefined | null): string {
  const bruto = valor?.trim();
  if (!bruto) {
    throw new Error(
      "Data editorial ausente. Informe --data AAAA-MM-DD: a data da publicação " +
        "é declarada por quem publica, e não lida do relógio da máquina.",
    );
  }

  const partes = PADRAO_DATA.exec(bruto);
  if (!partes?.[1] || !partes[2] || !partes[3]) {
    throw new Error(`Data editorial inválida: ${bruto}. Use AAAA-MM-DD.`);
  }

  const ano = Number(partes[1]);
  const mes = Number(partes[2]);
  const dia = Number(partes[3]);
  const emUtc = new Date(Date.UTC(ano, mes - 1, dia));
  const existe =
    emUtc.getUTCFullYear() === ano &&
    emUtc.getUTCMonth() === mes - 1 &&
    emUtc.getUTCDate() === dia;

  if (!existe) {
    throw new Error(`Data editorial inexistente no calendário: ${bruto}.`);
  }
  return bruto;
}

/**
 * Valor pronto para virar JSON determinístico.
 *
 * `undefined`, função, símbolo, `bigint`, `Date` e número não finito são
 * recusados em vez de convertidos. `JSON.stringify` descartaria os três
 * primeiros em silêncio — uma chave sumiria do snapshot sem erro — e
 * converteria `Date` por `toJSON`, escondendo uma conversão de fuso dentro da
 * serialização. Aqui a conversão é responsabilidade de quem monta o objeto,
 * declarada e visível.
 */
function ordenarRecursivamente(valor: unknown, caminho: string): unknown {
  if (valor === null) return null;

  if (Array.isArray(valor)) {
    return valor.map((item, indice) =>
      ordenarRecursivamente(item, `${caminho}[${indice}]`),
    );
  }

  if (valor instanceof Date) {
    throw new Error(
      `Serialização canônica recebeu Date em ${caminho}. ` +
        "Converta para texto ISO-8601 antes: a conversão é decisão de quem " +
        "monta o dado, não efeito da serialização.",
    );
  }

  const tipo = typeof valor;

  if (tipo === "object") {
    const entradas = Object.entries(valor as Record<string, unknown>).sort(
      ([a], [b]) => (a < b ? -1 : a > b ? 1 : 0),
    );
    const saida: Record<string, unknown> = {};
    for (const [chave, item] of entradas) {
      saida[chave] = ordenarRecursivamente(item, `${caminho}.${chave}`);
    }
    return saida;
  }

  if (tipo === "number") {
    if (!Number.isFinite(valor)) {
      throw new Error(`Número não finito em ${caminho}.`);
    }
    return valor;
  }

  if (tipo === "string" || tipo === "boolean") return valor;

  throw new Error(
    `Valor não serializável (${tipo}) em ${caminho}. ` +
      "O snapshot só aceita objeto, array, texto, número finito, booleano e null.",
  );
}

/**
 * JSON canônico: chaves ordenadas, dois espaços de recuo, nova linha ao fim.
 *
 * Os dois espaços e a quebra final não são estética — são o que faz
 * `git diff` mostrar uma publicação linha a linha em vez de uma linha só de
 * cem mil caracteres. A ordem dos **arrays** é preservada: nos arquivos de
 * dados ela vem do `ORDER BY` das views e é parte do conteúdo, não acidente.
 */
export function serializarCanonico(valor: unknown): string {
  return `${JSON.stringify(ordenarRecursivamente(valor, "$"), null, 2)}\n`;
}

/**
 * Identificador do release: data editorial e hash curto do conteúdo.
 *
 * O hash curto deriva dos dois hashes de conteúdo já registrados no
 * manifesto, e não dos arquivos. A consequência é útil: o `id` pode ser
 * recalculado a partir do `release.json` sozinho, sem abrir `acervo.json` nem
 * `episodios.json` — e um manifesto adulterado para apontar outro conteúdo
 * deixa de bater com o próprio `id`.
 *
 * Não entra nada que mude entre duas execuções iguais: nem instante de
 * execução, nem commit — que sequer existe quando o arquivo é escrito —, nem
 * valor aleatório.
 */
export function calcularIdDoRelease(
  dataEditorial: string,
  sha256DoAcervo: string,
  sha256DosEpisodios: string,
): string {
  const data = exigirDataEditorial(dataEditorial);
  const curto = sha256DeTexto(`${sha256DoAcervo}${sha256DosEpisodios}`).slice(
    0,
    8,
  );
  return `${data}-${curto}`;
}

/** Falha de integridade entre o manifesto e os arquivos de dados. */
export class ReleaseIncoerente extends Error {}

/**
 * Confere o manifesto contra os dois arquivos de dados que ele descreve.
 *
 * É esta função que torna um snapshot parcial **detectável**. A escrita grava
 * o manifesto por último, de propósito: se a publicação for interrompida no
 * meio, ou o `release.json` não chegou, ou ele descreve um conteúdo que não
 * está em disco. Nos dois casos a conferência acusa, e em nenhum o site passa
 * a servir metade de uma publicação nova achando que está inteira.
 */
export function conferirRelease(
  release: { id: string; sha256: { acervo: string; episodios: string } },
  acervoSerializado: string,
  episodiosSerializado: string,
): void {
  const shaAcervo = sha256DeTexto(acervoSerializado);
  const shaEpisodios = sha256DeTexto(episodiosSerializado);

  if (release.sha256.acervo !== shaAcervo) {
    throw new ReleaseIncoerente(
      `release.json descreve acervo.json com sha256 ${release.sha256.acervo}, ` +
        `mas o arquivo tem ${shaAcervo}.`,
    );
  }
  if (release.sha256.episodios !== shaEpisodios) {
    throw new ReleaseIncoerente(
      `release.json descreve episodios.json com sha256 ${release.sha256.episodios}, ` +
        `mas o arquivo tem ${shaEpisodios}.`,
    );
  }

  const esperado = calcularIdDoRelease(
    release.id.slice(0, 10),
    shaAcervo,
    shaEpisodios,
  );
  if (release.id !== esperado) {
    throw new ReleaseIncoerente(
      `release.json tem id ${release.id}, incompatível com o conteúdo (${esperado}).`,
    );
  }
}
