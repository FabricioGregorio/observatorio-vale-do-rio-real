CREATE TYPE "public"."estado_documental" AS ENUM('PUBLICAVEL', 'RESTRITO', 'ESPELHAVEL', 'IMPEDIDO', 'PENDENTE');--> statement-breakpoint
CREATE TYPE "public"."metodo_derivacao" AS ENUM('transcricao_leitura_visual', 'ocr_estatistico', 'redacao_versao_publica', 'extracao_secao', 'conversao_formato');--> statement-breakpoint
CREATE TYPE "public"."natureza_documento" AS ENUM('item_exigido', 'evidencia_complementar', 'item_nao_exigido');--> statement-breakpoint
CREATE TYPE "public"."revisao_privacidade" AS ENUM('pendente', 'concluida', 'bloqueada');--> statement-breakpoint
ALTER TABLE "arquivo" ADD COLUMN "derivado_de_id" uuid;--> statement-breakpoint
ALTER TABLE "arquivo" ADD COLUMN "derivacao_metodo" "metodo_derivacao";--> statement-breakpoint
ALTER TABLE "arquivo" ADD COLUMN "derivacao_em" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "documento" ADD COLUMN "natureza" "natureza_documento" DEFAULT 'item_nao_exigido' NOT NULL;--> statement-breakpoint
ALTER TABLE "documento" ADD COLUMN "estado_documental" "estado_documental" DEFAULT 'PENDENTE' NOT NULL;--> statement-breakpoint
ALTER TABLE "documento" ADD COLUMN "revisao_privacidade" "revisao_privacidade" DEFAULT 'pendente' NOT NULL;--> statement-breakpoint
ALTER TABLE "documento" ADD COLUMN "derivado_de_id" uuid;--> statement-breakpoint
ALTER TABLE "documento" ADD COLUMN "derivacao_metodo" "metodo_derivacao";--> statement-breakpoint
ALTER TABLE "documento" ADD COLUMN "derivacao_em" timestamp with time zone;
--> statement-breakpoint

-- ═══════════════════════════════════════════════════════════════════
-- SQL bruto: o que o Drizzle Kit não expressa (doc 03 §6.2)
-- ═══════════════════════════════════════════════════════════════════

-- ─── 1. Chaves estrangeiras autorreferentes ───────────────────────
-- Original ↔ derivado. ON DELETE RESTRICT de propósito: apagar um original
-- que tem derivado precisa ser ato deliberado, nunca cascata.

ALTER TABLE "arquivo"
  ADD CONSTRAINT "arquivo_derivado_de_id_fkey"
  FOREIGN KEY ("derivado_de_id") REFERENCES "arquivo"("id") ON DELETE RESTRICT;--> statement-breakpoint

ALTER TABLE "documento"
  ADD CONSTRAINT "documento_derivado_de_id_fkey"
  FOREIGN KEY ("derivado_de_id") REFERENCES "documento"("id") ON DELETE RESTRICT;--> statement-breakpoint

CREATE INDEX "idx_arquivo_derivado_de" ON "arquivo" ("derivado_de_id")
  WHERE "derivado_de_id" IS NOT NULL;--> statement-breakpoint

CREATE INDEX "idx_documento_derivado_de" ON "documento" ("derivado_de_id")
  WHERE "derivado_de_id" IS NOT NULL;--> statement-breakpoint

-- ─── 2. Fail-closed no nível do banco ─────────────────────────────
-- A regra do plano §4 deixa de depender de disciplina de aplicação:
-- PUBLICAVEL sem revisão concluída passa a ser impossível de gravar.

ALTER TABLE "documento"
  ADD CONSTRAINT "documento_publicavel_exige_revisao"
  CHECK (
    "estado_documental" <> 'PUBLICAVEL'
    OR "revisao_privacidade" = 'concluida'
  );--> statement-breakpoint

-- Natureza e exigido_pelo_edital não podem divergir. `exigido_pelo_edital`
-- continua existindo — a natureza acrescenta a distinção que o booleano
-- perdia entre evidência complementar e item não exigido.
ALTER TABLE "documento"
  ADD CONSTRAINT "documento_natureza_coerente"
  CHECK (("natureza" = 'item_exigido') = "exigido_pelo_edital");--> statement-breakpoint

-- ─── 3. Integridade da derivação ──────────────────────────────────
-- Derivado sem método declarado não é rastreável; método sem pai não
-- significa nada. E nada deriva de si mesmo.

ALTER TABLE "documento"
  ADD CONSTRAINT "documento_derivacao_completa"
  CHECK (num_nonnulls("derivado_de_id", "derivacao_metodo") <> 1);--> statement-breakpoint

ALTER TABLE "documento"
  ADD CONSTRAINT "documento_derivacao_nao_reflexiva"
  CHECK ("derivado_de_id" IS NULL OR "derivado_de_id" <> "id");--> statement-breakpoint

ALTER TABLE "arquivo"
  ADD CONSTRAINT "arquivo_derivacao_completa"
  CHECK (num_nonnulls("derivado_de_id", "derivacao_metodo") <> 1);--> statement-breakpoint

ALTER TABLE "arquivo"
  ADD CONSTRAINT "arquivo_derivacao_nao_reflexiva"
  CHECK ("derivado_de_id" IS NULL OR "derivado_de_id" <> "id");--> statement-breakpoint

-- ─── 4. vw_anexo_publico: fail-closed ─────────────────────────────
--
-- A 0002 autorizava publicação por `d.status = 'publicado'` sozinho. Isso
-- deixa de bastar. O gate público passa a exigir, simultaneamente:
--
--   estado_documental = 'PUBLICAVEL'
--   revisao_privacidade = 'concluida'
--   arquivo efetivamente espelhado
--
-- `status = 'publicado'` continua exigido, como fluxo editorial, mas já não
-- autoriza nada por conta própria.
--
-- CREATE OR REPLACE preserva permissões e dependências. As 14 colunas
-- originais mantêm nome, tipo e ordem; as novas são acrescentadas ao fim,
-- que é o único acréscimo que o PostgreSQL aceita aqui.

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
ORDER BY d.ordem_anexo NULLS LAST, d.titulo;--> statement-breakpoint

-- ─── 5. vw_pendencia_publicacao: dois ramos novos ─────────────────
--
-- A 0003 já denunciava anexo exigido e publicado sem espelho. Mantido. O que
-- se acrescenta são as inconsistências que o modelo novo torna possíveis.
--
-- A forma do resultado é contrato: slug, titulo, pendencia, nesta ordem e
-- com estes tipos — condição do CREATE OR REPLACE. O ramo do áudio continua
-- reservado para quando `entrevista` existir.

CREATE OR REPLACE VIEW vw_pendencia_publicacao AS
-- Ramo original da 0003, reproduzido literalmente. Não reescrever o que já
-- funciona: o que esta migração faz é acrescentar ramos.
SELECT d.slug,
       d.titulo,
       'anexo obrigatório sem arquivo espelhado'::text AS pendencia
FROM documento d
LEFT JOIN documento_arquivo da ON da.documento_id = d.id AND da.principal
LEFT JOIN arquivo a            ON a.id = da.arquivo_id AND a.espelhado_em IS NOT NULL
WHERE d.exigido_pelo_edital AND d.status = 'publicado' AND a.id IS NULL

UNION ALL

-- Ramo novo: estado documental publicável sem espelho.
SELECT d.slug,
       d.titulo,
       'estado PUBLICAVEL sem arquivo espelhado'::text AS pendencia
FROM documento d
LEFT JOIN documento_arquivo da ON da.documento_id = d.id AND da.principal
LEFT JOIN arquivo a            ON a.id = da.arquivo_id AND a.espelhado_em IS NOT NULL
WHERE d.estado_documental = 'PUBLICAVEL' AND a.id IS NULL

UNION ALL

-- Ramo novo: os dois campos discordam. Um dos dois está errado, e o gate
-- precisa dizer qual documento é.
SELECT d.slug,
       d.titulo,
       'status publicado divergente do estado documental'::text AS pendencia
FROM documento d
WHERE d.status = 'publicado'
  AND d.estado_documental <> 'PUBLICAVEL'

ORDER BY 1;
