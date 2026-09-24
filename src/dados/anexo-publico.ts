/**
 * Contrato público de um arquivo do acervo.
 *
 * Módulo sem dependência alguma: nem `db/schema`, nem Drizzle, nem cliente
 * PostgreSQL, nem consultas, nem `process.env`. Só tipos.
 *
 * ## Por que existe separado
 *
 * O tipo nasceu dentro de `consultas/anexos.ts`, ao lado da consulta que o
 * produz. Fazia sentido enquanto quem o consumia estava do lado do banco. Com
 * o snapshot versionado passam a existir dois lados — a consulta, que
 * **produz** este contrato a partir de `vw_anexo_publico`, e
 * `dados/publicado/tipos.ts`, que **valida** o mesmo contrato a partir do
 * arquivo em disco — e o segundo não deve depender, nem conceitualmente, da
 * camada de consultas.
 *
 * O grafo desejado, o mesmo de `podobservar-publico.ts`:
 *
 *     anexo-publico.ts
 *        ↑          ↑
 *    consultas   publicado
 *
 * A dependência era só `import type`, apagada na compilação e sem efeito em
 * tempo de execução. Ainda assim foi removida: uma seta de `publicado/` para
 * `consultas/` no diagrama convida, com o tempo, a uma segunda seta que não
 * seja de tipo.
 *
 * ## A definição é uma só
 *
 * `consultas/anexos.ts` reexporta o que está aqui, então nenhum consumidor
 * precisou mudar de import. Não existe uma segunda versão "de snapshot" deste
 * tipo, e as duas asserções no fim de `publicado/tipos.ts` continuam
 * comparando o schema do arquivo com **este** tipo — é o que torna erro de
 * compilação um campo existir de um lado e não do outro.
 *
 * ## O que este módulo não faz
 *
 * Não consulta, não adapta linha de view, não filtra e não conhece a
 * fotografia com a placa. `adaptarLinhasDaView`, `selecionarAnexosPublicos`,
 * `databaseUrlDisponivel` e o resto continuam em `consultas/anexos.ts`, onde
 * o acesso ao banco está. Aqui só se declara a forma do resultado.
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
