-- ═══════════════════════════════════════════════════════════════════
-- Migração 0012 — Tripwire de publicação do PodObservar
-- Referência: docs/02-arquitetura-banco.md §13; ADR-021; P0.2B1 §T
-- ═══════════════════════════════════════════════════════════════════
--
-- A P0.2A.2 deixou um risco registrado: o gate de `vw_episodio_publico` é
-- fail-closed, e um episódio marcado como publicado que não satisfaça alguma
-- das cinco condições simplesmente **desaparece em silêncio**. Num site de
-- prestação de contas, sumiço silencioso é pior do que erro ruidoso.
--
-- O projeto já tem o mecanismo certo, e ele não precisa de script novo.
-- `vw_pendencia_publicacao` tem contrato `(slug, titulo, pendencia)`, e o doc
-- 02 §13 diz que essa forma é contrato justamente "para permitir acrescentar
-- ramos por CREATE OR REPLACE VIEW sem quebrar o consumidor nem perder
-- permissões". `scripts/verificar-pendencias.ts` não interpreta o texto da
-- pendência: imprime o que a view disser e quebra o build com qualquer linha.
-- `pnpm pendencias` já está dentro de `pnpm verificar` e já é bloqueante no CI.
--
-- Esta migração portanto acrescenta ramos, e mais nada. Nenhuma tabela é
-- tocada, nenhuma coluna muda, `vw_episodio_publico` e `vw_anexo_publico`
-- ficam como estão. CREATE OR REPLACE preserva os grants.
--
-- Nenhum ramo conta episódios. A pergunta é existencial por linha, então
-- funciona com 3 episódios ou com 40 — a quantidade muda toda semana.
--
-- ─── Dependência nova, declarada de propósito ─────────────────────
--
-- O primeiro ramo consulta `vw_episodio_publico`. Isso cria dependência de
-- view para view: a partir daqui, `DROP VIEW vw_episodio_publico` exige tratar
-- `vw_pendencia_publicacao` antes — o que a 0011 não precisou fazer.
--
-- É deliberado. Replicar o predicado do gate aqui deixaria o tripwire livre
-- para divergir da view que ele deveria vigiar, e um vigia que copia a regra
-- em vez de observar o resultado não detecta exatamente a falha que importa.
-- A pergunta certa é "o episódio está mesmo na projeção pública?", e só a
-- própria projeção responde isso.

CREATE OR REPLACE VIEW vw_pendencia_publicacao AS
SELECT d.slug, d.titulo, 'anexo obrigatório sem arquivo espelhado'::text AS pendencia
FROM documento d
WHERE d.exigido_pelo_edital
  AND d.status = 'publicado'
  AND NOT EXISTS (
    SELECT 1 FROM documento_arquivo da
    JOIN arquivo a ON a.id = da.arquivo_id
    WHERE da.documento_id = d.id AND a.espelhado_em IS NOT NULL
  )
UNION ALL
SELECT d.slug, d.titulo, 'estado PUBLICAVEL sem arquivo espelhado'::text
FROM documento d
WHERE d.estado_documental = 'PUBLICAVEL'
  AND NOT EXISTS (
    SELECT 1 FROM documento_arquivo da
    JOIN arquivo a ON a.id = da.arquivo_id
    WHERE da.documento_id = d.id AND a.espelhado_em IS NOT NULL
  )
UNION ALL
SELECT d.slug, d.titulo, 'status publicado divergente do estado documental'::text
FROM documento d
WHERE d.status = 'publicado' AND d.estado_documental <> 'PUBLICAVEL'

-- ─── Ramos do PodObservar (0012) ──────────────────────────────────

-- Rede geral: qualquer episódio apresentado como publicado que não chegue à
-- projeção pública, seja qual for a causa — inclusive causa futura que estes
-- ramos ainda não saibam nomear.
UNION ALL
SELECT e.slug, e.titulo, 'episódio publicado ausente do gate público'::text
FROM episodio e
WHERE e.status = 'publicado'
  AND NOT EXISTS (
    SELECT 1 FROM vw_episodio_publico v WHERE v.slug = e.slug
  )

-- Os quatro ramos seguintes nomeiam a causa. Quem lê isto está com o build
-- quebrado e com pressa: "ausente do gate" diz que há problema, e estes dizem
-- qual é. Um episódio defeituoso aparece no ramo geral e no específico, de
-- propósito — a redundância custa uma linha e economiza uma investigação.
UNION ALL
SELECT e.slug, e.titulo, 'episódio publicado sem publicado_em'::text
FROM episodio e
WHERE e.status = 'publicado' AND e.publicado_em IS NULL
UNION ALL
SELECT e.slug, e.titulo, 'episódio publicado com data no futuro'::text
FROM episodio e
WHERE e.status = 'publicado' AND e.publicado_em > now()
UNION ALL
SELECT e.slug, e.titulo, 'episódio publicado sem url_spotify'::text
FROM episodio e
WHERE e.status = 'publicado'
  AND (e.url_spotify IS NULL OR length(btrim(e.url_spotify)) = 0)
UNION ALL
SELECT e.slug, e.titulo, 'episódio publicado com transcrição em branco'::text
FROM episodio e
WHERE e.status = 'publicado' AND length(btrim(e.transcricao)) = 0

-- Master de podcast não pertence ao acervo documental.
--
-- A ADR-021 mantém o master privado, e `vw_episodio_publico` não tem caminho
-- até ele. Mas existe uma porta lateral que aquela view não controla: vincular
-- o `arquivo` a um `documento` faz o objeto entrar por `vw_anexo_publico`, que
-- é outro gate, com outras regras. A P0.2B1 registrou isso como o único risco
-- residual de exposição, e ele é operacional, não técnico — ninguém impede o
-- vínculo, então o tripwire denuncia.
UNION ALL
SELECT a.chave_storage::citext,
       'master do PodObservar'::text,
       'master de podcast vinculado a documento'::text
FROM arquivo a
WHERE a.chave_storage LIKE 'arquivos/podobservar/%'
  AND EXISTS (
    SELECT 1 FROM documento_arquivo da WHERE da.arquivo_id = a.id
  )

-- Master de podcast nunca é público.
UNION ALL
SELECT a.chave_storage::citext,
       'master do PodObservar'::text,
       'master de podcast com visibilidade pública'::text
FROM arquivo a
WHERE a.chave_storage LIKE 'arquivos/podobservar/%'
  AND (a.visibilidade <> 'privado' OR a.url_publica IS NOT NULL)

ORDER BY 1;
