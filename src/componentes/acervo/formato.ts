/**
 * Formatação pública do Acervo — tamanho de arquivo.
 *
 * ## De onde isto veio
 *
 * Estas funções moravam em `TabelaAnexos.tsx`, a tabela mestre da Prestação
 * de Contas, e o Acervo as importava de lá. Com a Prestação removida em
 * 2026-09-23, a tabela deixou de ter consumidor e saiu; o que ela emprestava
 * ao Acervo ficou, num módulo que não finge ser componente.
 *
 * Saiu junto um `dataIso` que formatava a data de publicação com
 * `toISOString()` — dia em UTC, e não o dia editorial do território. A data
 * que o Acervo agora exibe usa `podobservar/formato.ts`, que resolve o fuso
 * de Sergipe explicitamente. Duas implementações de data pública é como se
 * produz duas datas para o mesmo arquivo.
 */

/** Bytes em unidade legível, sem inventar precisão. */
export function tamanhoLegivel(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} kB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}
