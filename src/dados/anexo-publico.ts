/**
 * Contrato público de um arquivo do acervo.
 *
 * Módulo sem dependência alguma: nem I/O, nem `process.env`. Só tipos.
 *
 * ## Por que existe separado
 *
 * O tipo nasceu ao lado da consulta que o produzia a partir da projeção
 * pública do PostgreSQL. A consulta saiu com o banco; o contrato ficou, e
 * `dados/publicado/tipos.ts` o **valida** a partir do arquivo em disco.
 * Manter a forma do resultado num módulo próprio é o que permite ao schema
 * e ao consumidor concordarem sem que nenhum dos dois importe o outro.
 *
 * ## A definição é uma só
 *
 * Não existe uma segunda versão "de snapshot" deste tipo: as asserções no
 * fim de `publicado/tipos.ts` comparam o schema do arquivo com **este**
 * tipo — é o que torna erro de compilação um campo existir de um lado e não
 * do outro.
 *
 * ## O que este módulo não faz
 *
 * Não lê, não filtra e não conhece a fotografia com a placa. A leitura e a
 * validação estão em `publicado/`. Aqui só se declara a forma do resultado.
 */

export type AnexoPublico = {
  arquivoId: string;
  codigo: string;
  estado: "PUBLICAVEL";
  revisaoPrivacidade: "concluida";
  derivadoDe: string[];
  arquivoOrigemId: string | null;
  arquivoRelacao: "derivado" | "replica" | null;
  arquivoDerivacaoMetodo:
    | "transcricao_leitura_visual"
    | "ocr_estatistico"
    | "redacao_versao_publica"
    | "tarjamento_privacidade"
    | "sanitizacao_metadados"
    | "extracao_secao"
    | "conversao_formato"
    | null;
  ordemAnexo: number | null;
  slug: string;
  rotuloArquivo: string | null;
  principal: boolean;
  titulo: string;
  tipo: string;
  resumo: string | null;
  dataReferencia: string | null;
  licenca: string;
  linkPermanente: string;
  linkOrigem: string | null;
  mimeType: string;
  bytes: number;
  sha256: string;
  publicadoEm: Date | null;
  nomeOriginal?: string | null;
  /** Asset de apresentação de uma fotografia cujo arquivo documental é o original. */
  previewUrl?: string;
  previewArquivoId?: string;
  previewSha256?: string;
};
