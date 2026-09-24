/**
 * Par manifesto + anexo, como o empacotador do ZIP o consome.
 *
 * O tipo nasceu em `consultas/anexos.ts`, ao lado da consulta que o produzia a
 * partir de `vw_anexo_publico`. A consulta foi removida com o PostgreSQL; o
 * tipo não tem nada de banco — é a forma do dado que `lib/zip-publico.ts`
 * recebe — e por isso ficou, num módulo que só declara tipos.
 *
 * Quem **produz** estas evidências é o fluxo editorial de publicação, que será
 * redesenhado no Lote C: a seleção do que entra no pacote passa a ser
 * pertencimento ao catálogo canônico de `acervo.json`, e não o gate do
 * manifesto que a view alimentava.
 */
import type { EvidenciaManifesto } from "../lib/manifesto-evidencias";
import type { AnexoPublico } from "./anexo-publico";

export type EvidenciaDeAnexo = {
  manifesto: EvidenciaManifesto;
  anexo: Omit<
    AnexoPublico,
    "codigo" | "estado" | "revisaoPrivacidade" | "derivadoDe"
  >;
  /** Compatibilidade histórica; nunca concede autorização pública. */
  publicadoLegado: boolean;
};
