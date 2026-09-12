-- Gate de pendências alinhado ao modelo multiarquivo — Tarefa 11, ADR-016.
--
-- O defeito: os dois ramos que verificam existência de arquivo perguntavam
-- "existe o vínculo marcado `principal`, e o arquivo dele está espelhado?" em
-- vez de "existe algum arquivo espelhado associado a este documento?". Desde a
-- migração 0007 a publicação é multiarquivo e `documento_arquivo.principal` é
-- apenas o arquivo representativo do documento — não é autorização pública nem
-- requisito de elegibilidade. Um documento com sete arquivos públicos válidos,
-- nenhum deles marcado `principal`, era denunciado como se não tivesse arquivo
-- nenhum.
--
-- Por que `NOT EXISTS` e não apenas remover `AND da.principal`: o anti-join
-- `LEFT JOIN ... AND da.principal` + `a.id IS NULL` devolve no máximo uma linha
-- por documento porque o índice parcial `idx_doc_arquivo_principal` garante no
-- máximo um vínculo principal. Sem a condição `da.principal`, o mesmo anti-join
-- passaria a produzir uma linha por vínculo, denunciando o documento por causa
-- de um arquivo não espelhado mesmo quando outro arquivo já satisfaz o
-- requisito — trocaria um falso positivo por outro. `NOT EXISTS` é uma pergunta
-- sobre o documento inteiro e devolve no máximo uma linha por ramo.
--
-- O que esta migração deliberadamente NÃO muda:
--
--   * o requisito de arquivo destes dois ramos continua sendo
--     `espelhado_em IS NOT NULL`. Eles denunciam ausência de espelho local
--     (doc 02 §13); elegibilidade pública é contrato de `vw_anexo_publico`,
--     que esta migração não toca. Exigir visibilidade pública aqui seria
--     endurecer o gate além da decisão aprovada e criaria falso positivo novo
--     para o estado legítimo "PUBLICAVEL com espelho ainda privado";
--   * as condições de documento de cada ramo — `exigido_pelo_edital`,
--     `status`, `estado_documental` — ficam idênticas;
--   * o terceiro ramo é reproduzido literalmente: não depende de `principal`
--     e não faz parte do defeito;
--   * a forma do resultado — `slug`, `titulo`, `pendencia`, nesta ordem e com
--     estes tipos — é contrato do `CREATE OR REPLACE VIEW` e da declaração
--     `.existing()` em `db/schema.ts`. Por isso não há `DROP VIEW`: a
--     substituição preserva permissões e nenhum objeto dependente precisa ser
--     recriado.
--
-- Nenhuma tabela, coluna, índice, constraint, enum, função, trigger ou linha é
-- criada, alterada ou removida. Esta migração substitui o corpo de uma view.

CREATE OR REPLACE VIEW vw_pendencia_publicacao AS
-- Ramo da 0003: anexo exigido pelo edital, publicado, sem nenhum arquivo
-- espelhado.
SELECT d.slug,
       d.titulo,
       'anexo obrigatório sem arquivo espelhado'::text AS pendencia
FROM documento d
WHERE d.exigido_pelo_edital
  AND d.status = 'publicado'
  AND NOT EXISTS (
    SELECT 1
    FROM documento_arquivo da
    JOIN arquivo a ON a.id = da.arquivo_id
    WHERE da.documento_id = d.id
      AND a.espelhado_em IS NOT NULL
  )

UNION ALL

-- Ramo da 0004: estado documental publicável sem nenhum arquivo espelhado.
SELECT d.slug,
       d.titulo,
       'estado PUBLICAVEL sem arquivo espelhado'::text AS pendencia
FROM documento d
WHERE d.estado_documental = 'PUBLICAVEL'
  AND NOT EXISTS (
    SELECT 1
    FROM documento_arquivo da
    JOIN arquivo a ON a.id = da.arquivo_id
    WHERE da.documento_id = d.id
      AND a.espelhado_em IS NOT NULL
  )

UNION ALL

-- Ramo da 0004, reproduzido sem alteração: os dois campos discordam e o gate
-- precisa dizer qual documento é.
SELECT d.slug,
       d.titulo,
       'status publicado divergente do estado documental'::text AS pendencia
FROM documento d
WHERE d.status = 'publicado'
  AND d.estado_documental <> 'PUBLICAVEL'

ORDER BY 1;
