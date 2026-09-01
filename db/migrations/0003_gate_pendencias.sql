-- Migração 0003 — Trava de publicação (gate de pendências)
-- Referência: docs/02-arquitetura-banco.md §13 e docs/03-guia-implementacao.md §6
--
-- Fatiamento por dependência (decidido em 2026-09-01, registrado em
-- docs/tarefas/09-gate-de-pendencias.md):
--
-- A view do doc 02 §13 tem dois ramos em UNION ALL. Só o primeiro é executável
-- hoje. O segundo lê a tabela `entrevista`, que não existe: a migração 0002
-- criou arquivo, municipio, pessoa, equipamento, consentimento, documento e
-- documento_arquivo, e nenhuma delas é entrevista. `consentimento` existe; é a
-- outra ponta do LEFT JOIN que falta. Um CREATE VIEW com esse ramo falharia
-- aqui mesmo, com `relation "entrevista" does not exist`.
--
-- `entrevista` é o item 3 da §16 do doc 02 — item 17 do backlog do doc 03 §10,
-- Fase 3. Nada dela foi antecipado: o requisito continua inteiro, apenas
-- fatiado pela dependência que o bloqueia.
--
-- O ramo do áudio entra depois por CREATE OR REPLACE VIEW. UNION ALL acrescenta
-- linhas, não colunas: a lista continua (slug, titulo, pendencia), nos mesmos
-- tipos e na mesma ordem, que é a condição que o PostgreSQL impõe ao REPLACE.
-- Por isso o literal leva `::text` explícito — a forma do resultado é contrato,
-- não detalhe, e não deve depender da resolução de tipo de um literal `unknown`.
--
-- LEFT JOIN, e não JOIN: o documento sem arquivo principal é justamente o caso
-- que se quer denunciar. A vw_anexo_publico usa JOIN e por isso o esconde da
-- Sala do Avaliador; aqui ele precisa aparecer.
--
-- View não é expressável em Drizzle e vai em SQL bruto (doc 03 §6.2). Em
-- db/schema.ts ela é declarada com .existing(), que não gera DDL.

CREATE VIEW vw_pendencia_publicacao AS
SELECT d.slug,
       d.titulo,
       'anexo obrigatório sem arquivo espelhado'::text AS pendencia
FROM documento d
LEFT JOIN documento_arquivo da ON da.documento_id = d.id AND da.principal
LEFT JOIN arquivo a            ON a.id = da.arquivo_id AND a.espelhado_em IS NOT NULL
WHERE d.exigido_pelo_edital AND d.status = 'publicado' AND a.id IS NULL;
