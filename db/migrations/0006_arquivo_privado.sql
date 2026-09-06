CREATE TYPE "public"."visibilidade_arquivo" AS ENUM('privado', 'publico');--> statement-breakpoint
ALTER TABLE "arquivo" ALTER COLUMN "url_publica" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "arquivo" ADD COLUMN "bucket" text NOT NULL;--> statement-breakpoint
ALTER TABLE "arquivo" ADD COLUMN "visibilidade" "visibilidade_arquivo" DEFAULT 'privado' NOT NULL;
--> statement-breakpoint

-- ═══════════════════════════════════════════════════════════════════
-- SQL bruto: CHECK e view (doc 03 §6.2)
-- ═══════════════════════════════════════════════════════════════════
--
-- Contexto. O modelo anterior nao conseguia representar um arquivo privado:
-- `url_publica` era NOT NULL, e nao havia bucket nem visibilidade. Toda linha
-- de `arquivo` precisava afirmar uma URL publica, o que forcaria inventar uma
-- URL — ou usar o endpoint S3 como se fosse URL publica. As duas coisas sao
-- falsidade em prova documental.
--
-- Espelhar nao e publicar. Um documento ESPELHAVEL com revisao pendente pode
-- ter o binario copiado para storage controlado; nao pode ganhar acesso
-- publico.

-- ─── 1. Visibilidade e URL sao um so fato ─────────────────────────
-- Publico exige URL; privado exige a ausencia dela. Escrito como igualdade
-- para que nenhum dos dois lados possa divergir em silencio.

ALTER TABLE "arquivo"
  ADD CONSTRAINT "arquivo_visibilidade_coerente"
  CHECK (("visibilidade" = 'publico') = ("url_publica" IS NOT NULL));--> statement-breakpoint

-- Bucket vazio e o mesmo que bucket ausente.
ALTER TABLE "arquivo"
  ADD CONSTRAINT "arquivo_bucket_nao_vazio"
  CHECK (length(btrim("bucket")) > 0);--> statement-breakpoint

CREATE INDEX "idx_arquivo_visibilidade" ON "arquivo" ("visibilidade");--> statement-breakpoint

-- ─── 2. vw_anexo_publico: arquivo privado nunca aparece ───────────
--
-- A 0004 ja exigia estado PUBLICAVEL, revisao concluida e espelhamento. Isso
-- nao bastava: com `url_publica` agora anulavel, um arquivo privado vinculado
-- a um documento publicavel emitiria `link_permanente` nulo. A view passa a
-- exigir explicitamente visibilidade publica e URL presente.
--
-- CREATE OR REPLACE preserva as 19 colunas em nome, tipo e ordem.

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
       o.slug           AS derivado_de_slug
FROM documento d
JOIN documento_arquivo da ON da.documento_id = d.id AND da.principal
JOIN arquivo a            ON a.id = da.arquivo_id
LEFT JOIN documento o     ON o.id = d.derivado_de_id
WHERE d.estado_documental = 'PUBLICAVEL'
  AND d.revisao_privacidade = 'concluida'
  AND d.status = 'publicado'
  AND d.arquivado_em IS NULL
  AND a.espelhado_em IS NOT NULL
  AND a.visibilidade = 'publico'
  AND a.url_publica IS NOT NULL
ORDER BY d.ordem_anexo NULLS LAST, d.titulo;
