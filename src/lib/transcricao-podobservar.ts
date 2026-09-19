/**
 * Limpeza editorial da transcrição candidata do PodObservar.
 *
 * Os PDFs de transcrição são fonte candidata, não conteúdo publicável. A
 * auditoria da P0.2B1 encontrou seis marcações internas que não podem chegar
 * ao público: quatro de checagem editorial e duas de estrutura de edição. A
 * decisão humana desta fase fechou a lista, e ela é fechada de propósito —
 * remover por heurística ("qualquer colchete suspeito") apagaria as marcações
 * sonoras, que são acessibilidade e fazem parte da narrativa.
 *
 * O que esta função **nunca** faz: alterar fala, acrescentar frase, corrigir
 * texto, reordenar bloco. Ela só remove marcações da lista fechada e devolve
 * o relatório do que removeu, para que a revisão humana confira item a item.
 */

/**
 * Marcações internas, na forma exata em que aparecem nos PDFs.
 *
 * `[nome completo não confirmado]` e `[sobrenome não confirmado]` são notas de
 * checagem sobre o participante Luiz. A decisão humana é identificá-lo apenas
 * como `LUIZ`, sem inventar sobrenome — então a nota sai e nada entra no lugar.
 *
 * `[Nota de continuidade da gravação]` é nota de produção. As outras três são
 * andaime de edição: rotulam blocos do roteiro de montagem, não som.
 */
export const MARCACOES_INTERNAS = [
  "[nome completo não confirmado]",
  "[sobrenome não confirmado]",
  "[Nota de continuidade da gravação]",
  "[continuação do bloco]",
  "[bloco sobre educação]",
  "[resultados da pesquisa]",
] as const;

/**
 * Fragmentos que não podem sobrar depois da limpeza.
 *
 * Rede de segurança independente da lista acima. Se um dia uma marcação
 * aparecer com pontuação diferente, ou quebrada de um jeito que o padrão não
 * preveja, o texto ainda carrega estas palavras — e a ingestão para antes de
 * gravar em vez de publicar nota interna.
 */
const RESIDUOS_PROIBIDOS = [
  "não confirmado",
  "Nota de continuidade",
  "continuação do bloco",
  "bloco sobre educação",
  "resultados da pesquisa",
] as const;

/**
 * Casa a marcação mesmo quebrada por quebra de linha.
 *
 * O PDF do episódio 01 traz `[nome completo` no fim de uma linha e `não
 * confirmado]` no começo da seguinte. Comparação literal não encontrava isso,
 * e a nota interna atravessaria a limpeza inteira sem ser vista — inclusive
 * pela verificação que deveria detê-la.
 *
 * Cada espaço da marcação vira `\s+`, que atravessa quebra de linha. O resto
 * é escapado: continua sendo lista fechada, e não um padrão genérico de
 * colchete que apagaria `[risos]` e as vinhetas junto.
 */
function padraoDaMarcacao(marcacao: string): RegExp {
  const escapado = marcacao
    .split(/\s+/)
    .map((parte) => parte.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("\\s+");
  return new RegExp(escapado, "g");
}

export type RemocaoEditorial = {
  marcacao: string;
  ocorrencias: number;
};

export type TranscricaoLimpa = {
  texto: string;
  remocoes: RemocaoEditorial[];
  /** Soma das ocorrências removidas; zero significa nada a limpar. */
  total: number;
};

/**
 * Normaliza o espaço deixado pela remoção.
 *
 * Tirar `[sobrenome não confirmado]` de `"… e Luiz [sobrenome não
 * confirmado]"` deixa um espaço final pendurado; tirar `[bloco sobre
 * educação]`, que ocupa a linha inteira, deixa uma linha em branco a mais.
 * Nenhum dos dois é falha grave, mas transcrição é texto que alguém vai ler:
 * o resultado precisa parecer escrito, não recortado.
 *
 * Só mexe em espaço em branco. Nenhum caractere de conteúdo é tocado.
 */
function normalizarEspacos(texto: string): string {
  return texto
    .split("\n")
    .map((linha) => linha.replace(/[ \t]+/g, " ").trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trimEnd();
}

/**
 * Remove as marcações internas e relata o que saiu.
 *
 * A comparação é literal, não por expressão regular sobre colchetes: só sai o
 * que está na lista fechada. `[risos]`, `[vinheta de transição]`, `[som de
 * carro em estrada de terra]` e os timestamps permanecem — são acessibilidade
 * e estrutura de leitura.
 */
export function limparTranscricao(bruto: string): TranscricaoLimpa {
  const remocoes: RemocaoEditorial[] = [];
  let texto = bruto;

  for (const marcacao of MARCACOES_INTERNAS) {
    const ocorrencias = (texto.match(padraoDaMarcacao(marcacao)) ?? []).length;
    if (ocorrencias > 0) {
      remocoes.push({ marcacao, ocorrencias });
      texto = texto.replace(padraoDaMarcacao(marcacao), "");
    }
  }

  return {
    texto: normalizarEspacos(texto),
    remocoes,
    total: remocoes.reduce((soma, r) => soma + r.ocorrencias, 0),
  };
}

/**
 * Nenhuma marcação interna sobrou.
 *
 * Usada como asserção antes de gravar: a limpeza é verificada, não presumida.
 */
export function contemMarcacaoInterna(texto: string): boolean {
  return (
    MARCACOES_INTERNAS.some((m) => padraoDaMarcacao(m).test(texto)) ||
    RESIDUOS_PROIBIDOS.some((r) => texto.includes(r))
  );
}

/**
 * A limpeza não inventou nem alterou fala.
 *
 * A verificação é sobre as palavras: retirar as marcações e todo o espaço em
 * branco dos dois lados deve produzir exatamente a mesma sequência de
 * caracteres. Se algo divergir, a limpeza fez mais do que remover.
 */
export function preservouConteudo(bruto: string, limpo: string): boolean {
  const semMarcacoes = MARCACOES_INTERNAS.reduce(
    (t, m) => t.replace(padraoDaMarcacao(m), ""),
    bruto,
  );
  const comparavel = (t: string) => t.replace(/\s+/g, "");
  return comparavel(semMarcacoes) === comparavel(limpo);
}
