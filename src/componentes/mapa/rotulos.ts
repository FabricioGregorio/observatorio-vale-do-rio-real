import type { RelacaoTerritorial } from "../../dados/territorio/tipos";

/**
 * Rótulos das camadas territoriais — Tarefa 10B.2.1.
 *
 * Texto de interface, e por isso vive junto dos componentes, não junto dos
 * dados. Fica num módulo próprio porque a lista de municípios e a ficha
 * precisam dizer a mesma coisa: o mesmo nome atravessa o fluxo inteiro
 * (doc 03 §3).
 *
 * A redação vem da definição do responsável, não de interpretação.
 */
export const ROTULO_DA_RELACAO: Readonly<Record<RelacaoTerritorial, string>> = {
  "vale-rio-real": "Vale do Rio Real",
  "pesquisa-campo": "Pesquisa de campo",
  comparacao: "Comparação de políticas públicas",
};
