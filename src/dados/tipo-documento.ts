/**
 * Vocabulário canônico de `tipo_documento`.
 *
 * Um módulo sem dependência alguma: nem `process.env`, nem I/O, nem nada
 * além de uma lista de literais.
 *
 * ## Por que existe
 *
 * Os mesmos doze valores já estiveram escritos três vezes — no enum do
 * schema PostgreSQL, no catalogador e na camada do snapshot. Listas iguais
 * em arquivos diferentes divergem por acidente: alguém acrescenta um tipo
 * num lugar e o outro continua recusando o valor novo com
 * "esperado um de:" listando onze.
 *
 * A partir daqui a lista é uma só, e os consumidores a leem:
 *
 *      tipo-documento.ts
 *          ↑        ↑
 *  catalogo-       publicado/tipos
 *  documental
 *
 * É isso que permite a `dados/publicado/` validar o campo `tipo` contra o
 * vocabulário canônico sem importar nada de fora da camada pura.
 *
 * ## O que este módulo não é
 *
 * Não é rótulo de interface. O texto que o visitante lê — "Relatório
 * técnico", "Entrevista" — vive em `editorial/tipos-publicos.ts`, que mapeia
 * estes identificadores para português. Aqui só existe o identificador.
 *
 * ## Alterar esta lista é alterar o acervo
 *
 * Os valores são exatamente os que o modelo documental fixou e que
 * `acervo.json` já usa. Acrescentar, remover ou reordenar aqui muda o que o
 * contrato público aceita — e um tipo fora do vocabulário derruba a leitura
 * do snapshot inteiro, que é o comportamento desejado: vocabulário novo é
 * decisão editorial declarada, não efeito colateral de um erro de digitação.
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
