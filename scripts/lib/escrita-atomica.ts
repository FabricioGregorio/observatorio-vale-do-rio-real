/**
 * Escrita de um conjunto de arquivos que precisam entrar juntos.
 *
 * O caso que este módulo existe para impedir: uma publicação interrompida no
 * meio deixar `acervo.json` novo ao lado de `episodios.json` velho, com um
 * `release.json` que não descreve nem um nem outro. Num site documental isso
 * não é um arquivo corrompido — é uma afirmação falsa sobre o que foi
 * publicado.
 *
 * ## A ordem das operações
 *
 * 1. valida os três conteúdos **por inteiro**, antes de tocar em disco;
 * 2. calcula tamanho e SHA-256 de cada um;
 * 3. sem `escrever`, para aqui e devolve o plano — nenhum byte é gravado;
 * 4. grava tudo num diretório temporário **dentro do destino**, portanto no
 *    mesmo volume, que é o que permite renomear em vez de copiar;
 * 5. renomeia um a um para o destino, **na ordem recebida**;
 * 6. relê cada arquivo do destino e confere o SHA-256.
 *
 * ## O limite honesto disto
 *
 * Renomear N arquivos não é uma operação atômica; nenhum sistema de arquivos
 * oferece isso para um conjunto. O que se garante é mais fraco e suficiente:
 * **nada é tocado antes de tudo estar validado**, e uma interrupção no meio
 * da etapa 5 é sempre *detectável*, nunca silenciosa — desde que quem chama
 * ponha o manifesto por último, porque é ele que carrega o hash dos outros.
 * `conferirRelease` é o outro lado dessa garantia.
 *
 * Não se persegue aqui uma atomicidade verdadeira com troca de diretório: ela
 * custaria uma janela em que o destino não existe, para proteger contra uma
 * falha entre dois `rename` no mesmo diretório. A conferência é mais barata e
 * cobre o mesmo risco.
 */
import { createHash } from "node:crypto";
import {
  mkdir,
  mkdtemp,
  readFile,
  rename,
  rm,
  unlink,
  writeFile,
} from "node:fs/promises";
import { join } from "node:path";

export type ArquivoDoConjunto = {
  /** Nome simples do arquivo, sem diretório. */
  readonly nome: string;
  readonly conteudo: string;
};

export type ArquivoPlanejado = {
  readonly nome: string;
  readonly bytes: number;
  readonly sha256: string;
  /** `false` quando o destino já tem exatamente este conteúdo. */
  readonly mudou: boolean;
};

export type ResultadoDoConjunto = {
  /** `false` em ensaio: o plano foi calculado e nada foi gravado. */
  readonly escrito: boolean;
  readonly destino: string;
  readonly arquivos: readonly ArquivoPlanejado[];
};

/** Falha de escrita do conjunto; nomeia sempre o arquivo e o motivo. */
export class FalhaDeEscrita extends Error {}

const NOME_SIMPLES = /^[a-z0-9][a-z0-9.-]*$/;

function sha256De(conteudo: string): string {
  return createHash("sha256").update(conteudo, "utf8").digest("hex");
}

function validarConjunto(arquivos: readonly ArquivoDoConjunto[]): void {
  if (arquivos.length === 0) {
    throw new FalhaDeEscrita("Conjunto vazio: não há o que publicar.");
  }

  const vistos = new Set<string>();
  for (const arquivo of arquivos) {
    if (!NOME_SIMPLES.test(arquivo.nome)) {
      throw new FalhaDeEscrita(
        `Nome de arquivo inaceitável: ${arquivo.nome}. ` +
          "O conjunto grava nomes simples dentro do destino, nunca caminhos.",
      );
    }
    if (vistos.has(arquivo.nome)) {
      throw new FalhaDeEscrita(
        `Arquivo repetido no conjunto: ${arquivo.nome}.`,
      );
    }
    vistos.add(arquivo.nome);

    if (arquivo.conteudo.length === 0) {
      throw new FalhaDeEscrita(
        `Conteúdo vazio para ${arquivo.nome}. ` +
          "Publicar arquivo vazio é publicar a afirmação de que não há nada.",
      );
    }
  }
}

/** Conteúdo atual do destino, ou `null` quando o arquivo ainda não existe. */
async function conteudoAtual(caminho: string): Promise<string | null> {
  try {
    return await readFile(caminho, "utf8");
  } catch {
    return null;
  }
}

/**
 * Substitui o destino pelo temporário.
 *
 * No Windows o `rename` do Node já troca um arquivo existente; o `unlink`
 * antes de repetir cobre o caso em que a plataforma recusa. A segunda
 * tentativa só acontece depois de uma falha real, então o caminho normal
 * continua sendo um único `rename`.
 */
async function substituir(origem: string, destino: string): Promise<void> {
  try {
    await rename(origem, destino);
  } catch {
    await unlink(destino).catch(() => undefined);
    await rename(origem, destino);
  }
}

/**
 * Grava o conjunto, ou apenas calcula o plano.
 *
 * O manifesto do release deve ser o **último** item de `arquivos`: é o que
 * mantém um estado parcial detectável.
 */
export async function escreverConjuntoAtomico(
  destino: string,
  arquivos: readonly ArquivoDoConjunto[],
  opcoes: { readonly escrever: boolean },
): Promise<ResultadoDoConjunto> {
  validarConjunto(arquivos);

  const planejados: ArquivoPlanejado[] = [];
  for (const arquivo of arquivos) {
    const atual = await conteudoAtual(join(destino, arquivo.nome));
    planejados.push({
      nome: arquivo.nome,
      bytes: Buffer.byteLength(arquivo.conteudo, "utf8"),
      sha256: sha256De(arquivo.conteudo),
      mudou: atual !== arquivo.conteudo,
    });
  }

  if (!opcoes.escrever) {
    return { escrito: false, destino, arquivos: planejados };
  }

  await mkdir(destino, { recursive: true });
  const temporario = await mkdtemp(join(destino, ".parcial-"));

  try {
    for (const arquivo of arquivos) {
      await writeFile(join(temporario, arquivo.nome), arquivo.conteudo, "utf8");
    }
    for (const arquivo of arquivos) {
      await substituir(
        join(temporario, arquivo.nome),
        join(destino, arquivo.nome),
      );
    }
  } finally {
    await rm(temporario, { recursive: true, force: true });
  }

  for (const planejado of planejados) {
    const gravado = await conteudoAtual(join(destino, planejado.nome));
    if (gravado === null || sha256De(gravado) !== planejado.sha256) {
      throw new FalhaDeEscrita(
        `${planejado.nome} não confere depois da gravação. ` +
          "A publicação está incompleta em disco e não deve ser commitada.",
      );
    }
  }

  return { escrito: true, destino, arquivos: planejados };
}
