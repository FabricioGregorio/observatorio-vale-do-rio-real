-- ═══════════════════════════════════════════════════════════════════
-- Migração 0011 — Política de distribuição do PodObservar
-- Referência: ADR-021; docs/02-arquitetura-banco.md §9 (com a exceção
-- registrada pela ADR-021); docs/03-guia-implementacao.md §6.2
-- ═══════════════════════════════════════════════════════════════════
--
-- Decisão humana posterior à 0010: o público não ouve os episódios pelo site.
-- O site é descoberta, apresentação editorial, metadata e transcrição; o
-- Spotify é o destino primário de escuta.
--
-- A 0010 traduziu docs/02 §9 literalmente e exigia áudio público para o
-- episódio existir: JOIN em `arquivo` com visibilidade pública, URL presente e
-- espelhamento, e `audio_url`, `audio_mime_type` e `audio_bytes` na projeção.
-- Isso deixou de corresponder à política.
--
-- O que **não** muda: `episodio.audio_id` continua NOT NULL, com FK para
-- `arquivo`. O Observatório continua dono do master — custódia, integridade,
-- hash, duração, preservação, cadeia documental. A mudança é só de
-- distribuição: o visitante não recebe o áudio pelo site.
--
-- Migração de estrutura pública apenas. Nenhum INSERT, UPDATE ou DELETE.
-- Nenhuma tabela alterada. `vw_anexo_publico` não é tocada.
--
-- ─── Checklist de migração destrutiva (doc 03 §6) ─────────────────
--
-- [x] A coluna é usada por alguma view? Nenhuma coluna é removida de tabela.
--     O objeto derrubado é a própria view `vw_episodio_publico`, criada pela
--     0010. Nada depende dela no banco: não há view, matview, regra ou coluna
--     gerada que a referencie. `mv_busca` ainda não existe.
-- [x] A alteração toca função usada por coluna gerada? Não. `sem_acento()` e
--     `episodio.busca` permanecem intactos.
-- [x] A migração altera ou remove trigger ou view? Remove a view e a recria
--     explicitamente, no mesmo arquivo e na ordem correta. `trg_atualizado_em`
--     em `episodio` não é tocado.
-- [x] A tabela tem `trg_atualizado_em`? Sim, `episodio` — e nem a tabela nem a
--     coluna `atualizado_em` são renomeadas.
--
-- Por que DROP e não CREATE OR REPLACE: `CREATE OR REPLACE VIEW` acrescenta
-- colunas ao fim, e **não** remove colunas existentes — o PostgreSQL recusa
-- com "cannot drop columns from view". Esta migração precisa justamente
-- remover três colunas, então a substituição é DROP + CREATE.
--
-- Consequência de privilégio: DROP descarta os grants da view. Eles voltam no
-- CREATE pelo mesmo caminho que os concedeu na 0010 — o ALTER DEFAULT
-- PRIVILEGES do dono do schema, que dá SELECT a `app_observatorio` e DML a
-- `manutencao_observatorio`. Nenhum GRANT explícito é emitido aqui, como em
-- todas as migrações deste projeto, e nenhum ALTER ROLE é executado.

DROP VIEW vw_episodio_publico;--> statement-breakpoint

-- ─── vw_episodio_publico: gate editorial, sem áudio ───────────────
--
-- Cinco condições, e nenhuma dispensável:
--
--   1. status = 'publicado'      — rascunho, em_revisao e arquivado não vazam;
--   2. publicado_em IS NOT NULL  — sem data declarada não há publicação;
--   3. publicado_em <= now()     — episódio datado no futuro ainda não é público;
--   4. transcricao não vazia     — acessibilidade é pré-requisito, e a coluna
--                                  ser NOT NULL não impede string em branco;
--   5. url_spotify presente e não vazia.
--
-- A quinta é a tradução da nova política. Na ausência de player próprio, um
-- episódio publicado sem destino de escuta seria um anúncio sem objeto: a
-- página prometeria um episódio que ninguém consegue ouvir. `url_spotify`
-- **não** vira NOT NULL na tabela, porque rascunho e episódio em revisão
-- existem legitimamente antes da publicação externa. A obrigação é do momento
-- da publicação, e o lugar dela é o gate.
--
-- `arquivo` não é mais juntado pelo áudio. Não é omissão de colunas: é a
-- remoção do caminho. A partir desta view não existe rota até o master — nem
-- URL, nem MIME, nem bytes, nem `audio_id`, nem bucket, nem chave de storage.
-- O áudio privado deixa de bloquear o episódio, e continua inalcançável.
--
-- A capa segue por LEFT JOIN com os predicados públicos de `arquivo`: capa
-- privada apaga `capa_url`, e não o episódio, porque `capa_id` é anulável no
-- doc 02 §9 e nenhum documento normativo a exige para publicar.
--
-- `temporada_numero` continua público porque a rota é
-- `/podobservar/t1/[episodio]`: a consulta valida temporada e slug juntos, e
-- slug certo em temporada errada resolve para inexistência.

CREATE VIEW vw_episodio_publico AS
SELECT e.slug,
       t.numero       AS temporada_numero,
       t.titulo       AS temporada_titulo,
       e.numero,
       e.titulo,
       e.resumo,
       e.publicado_em,
       e.duracao_seg,
       e.transcricao,
       e.explicito,
       e.url_spotify,
       e.url_youtube,
       cp.url_publica AS capa_url,
       cp.largura_px  AS capa_largura_px,
       cp.altura_px   AS capa_altura_px
FROM episodio e
JOIN temporada t     ON t.id = e.temporada_id
LEFT JOIN arquivo cp ON cp.id = e.capa_id
                    AND cp.visibilidade = 'publico'
                    AND cp.url_publica IS NOT NULL
                    AND cp.espelhado_em IS NOT NULL
WHERE e.status = 'publicado'
  AND e.publicado_em IS NOT NULL
  AND e.publicado_em <= now()
  AND length(btrim(e.transcricao)) > 0
  AND e.url_spotify IS NOT NULL
  AND length(btrim(e.url_spotify)) > 0
ORDER BY e.publicado_em DESC, e.numero DESC;
