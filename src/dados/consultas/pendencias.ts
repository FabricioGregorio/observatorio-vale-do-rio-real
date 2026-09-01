/**
 * Consulta da trava de publicação — Tarefa 09.
 *
 * Lê `vw_pendencia_publicacao`, criada pela migração 0003 (doc 02 §13).
 *
 * Diferença deliberada em relação a `consultas/anexos.ts`: lá a ausência de
 * `DATABASE_URL` degrada para lista vazia, porque a página **exibe** dados e
 * exibir de menos é aceitável. Aqui não há degradação — quem chama **atesta**
 * uma ausência de pendências, e devolver `[]` sem ter consultado seria afirmar
 * que está tudo certo sem ter olhado. A decisão de o que fazer sem credencial
 * pertence a `scripts/verificar-pendencias.ts`, que a toma antes de chamar.
 *
 * O cliente é importado sob demanda porque `src/dados/cliente.ts` lança no topo
 * quando `DATABASE_URL` falta: um import estático quebraria o script antes de
 * ele conseguir emitir a própria mensagem.
 *
 * Credencial: `DATABASE_URL`, o role da aplicação, sem DDL. A consulta só lê.
 * `DATABASE_URL_MIGRACAO` é exclusiva de DDL (doc 03 §6.8, ADR-007).
 */
import { vwPendenciaPublicacao } from "../../../db/schema";

export type Pendencia = {
  slug: string | null;
  titulo: string | null;
  pendencia: string | null;
};

/** Linhas da trava. Vazio significa: consultado e limpo. */
export async function listarPendenciasDePublicacao(): Promise<Pendencia[]> {
  const { db } = await import("../cliente");
  return db.select().from(vwPendenciaPublicacao);
}
