/**
 * Vocabulário canônico de `tipo_documento`.
 *
 * Um módulo sem dependência alguma: nem `db/schema`, nem Drizzle, nem cliente
 * de banco, nem consultas, nem `process.env`. Só uma lista de literais.
 *
 * ## Por que existe
 *
 * Os mesmos doze valores estavam escritos duas vezes — no `pgEnum` de
 * `db/schema.ts` e em `scripts/catalogar-documentos.ts` — e a camada do
 * snapshot precisava de uma terceira. Duas listas iguais em arquivos
 * diferentes divergem por acidente: alguém acrescenta um tipo ao enum do
 * banco, a migração passa, e o catalogador continua recusando o valor novo
 * com "esperado um de:" listando onze.
 *
 * A partir daqui a lista é uma só, e os três consumidores a leem:
 *
 *     tipo-documento.ts
 *       ↑        ↑        ↑
 *  db/schema  catalogar  publicado/tipos
 *
 * Note a direção. `db/schema.ts` passa a **consumir** este módulo em vez de
 * declarar a lista, e é isso que permite a `dados/publicado/` validar o campo
 * `tipo` contra o vocabulário canônico sem importar nada da camada de banco —
 * que era o ponto: um módulo de contrato público não deve arrastar
 * `drizzle-orm/pg-core` junto só para saber quais são os doze valores.
 *
 * ## O que este módulo não é
 *
 * Não é rótulo de interface. O texto que o visitante lê — "Relatório
 * técnico", "Entrevista" — vive em `editorial/tipos-publicos.ts`, que mapeia
 * estes identificadores para português. Aqui só existe o identificador.
 *
 * ## Alterar esta lista é alterar o banco
 *
 * Os valores são exatamente os do tipo `tipo_documento` criado pela migração
 * 0001. Acrescentar, remover ou reordenar aqui **não** muda o PostgreSQL:
 * muda apenas o que o código aceita, e passa a divergir do banco em silêncio.
 * Qualquer mudança real de vocabulário é migração versionada primeiro, e esta
 * lista depois.
 */

/** Ordem idêntica à do tipo `tipo_documento` no PostgreSQL. */
export const TIPOS_DOCUMENTO = [
  "relatorio_tecnico",
  "diagnostico_interno",
  "relato_campo",
  "formulario_modelo",
  "relatorio_parcial",
  "documento_final",
  "modelagem_estatistica",
  "entrevista_transcricao",
  "plano_aula",
  "identidade_visual",
  "painel_dados",
  "outro",
] as const;

export type TipoDocumento = (typeof TIPOS_DOCUMENTO)[number];
