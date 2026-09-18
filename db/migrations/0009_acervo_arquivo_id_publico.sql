-- Amplia somente a projeção pública existente. As 24 colunas anteriores,
-- joins, gates e ordenação da migração 0007 permanecem idênticos.
-- CREATE OR REPLACE preserva grants e não há views dependentes (auditoria A3.1).
CREATE OR REPLACE VIEW vw_anexo_publico AS
SELECT d.ordem_anexo,
       d.slug,
       d.titulo,
       d.tipo,
       d.resumo,
       d.data_referencia,
       d.licenca,
       a.url_publica    AS link_permanente,
       a.origem_url     AS link_origem,
       a.mime_type,
       a.bytes,
       a.sha256,
       d.publicado_em,
       (a.espelhado_em IS NOT NULL) AS espelhado,
       d.natureza,
       d.exigido_pelo_edital AS obrigatorio,
       d.estado_documental,
       d.revisao_privacidade,
       o.slug           AS derivado_de_slug,
       da.principal,
       da.rotulo        AS rotulo_arquivo,
       COALESCE(a.derivado_de_id, a.replica_de_id) AS arquivo_origem_id,
       CASE
         WHEN a.derivado_de_id IS NOT NULL THEN 'derivado'::text
         WHEN a.replica_de_id IS NOT NULL THEN 'replica'::text
         ELSE NULL::text
       END AS arquivo_relacao,
       a.derivacao_metodo AS arquivo_derivacao_metodo,
       a.id AS arquivo_id
FROM documento d
JOIN documento_arquivo da ON da.documento_id = d.id
JOIN arquivo a            ON a.id = da.arquivo_id
LEFT JOIN documento o     ON o.id = d.derivado_de_id
WHERE d.estado_documental = 'PUBLICAVEL'
  AND d.revisao_privacidade = 'concluida'
  AND d.status = 'publicado'
  AND d.arquivado_em IS NULL
  AND a.espelhado_em IS NOT NULL
  AND a.visibilidade = 'publico'
  AND a.url_publica IS NOT NULL
ORDER BY d.ordem_anexo NULLS LAST,
         d.titulo,
         da.principal DESC,
         da.versao DESC,
         a.chave_storage;
