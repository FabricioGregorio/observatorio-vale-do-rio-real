-- Migração 0001 — Fundação
-- Extensões, tipos enumerados, funções utilitárias.
-- Referência: docs/02-arquitetura-banco.md §§3-4
--
-- Não inclui tabelas — esta migração cria apenas a infraestrutura base.
-- PostGIS omitido conforme §6.2: "não instale por antecipação".

-- ─── Extensões (doc 02 §4) ─────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS pgcrypto;--> statement-breakpoint
CREATE EXTENSION IF NOT EXISTS citext;--> statement-breakpoint
CREATE EXTENSION IF NOT EXISTS unaccent;--> statement-breakpoint

-- ─── Funções utilitárias (doc 02 §4) ───────────────────────────────

-- unaccent() não é IMMUTABLE; sem este invólucro não é possível
-- indexar nem usar em coluna gerada.
CREATE OR REPLACE FUNCTION sem_acento(texto text)
RETURNS text LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT AS
$$ SELECT public.unaccent('public.unaccent', texto) $$;--> statement-breakpoint

CREATE OR REPLACE FUNCTION set_atualizado_em()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END $$;--> statement-breakpoint

-- ─── Tipos enumerados (doc 02 §3, gerados pelo Drizzle Kit) ────────

CREATE TYPE "public"."situacao_equipamento" AS ENUM('ativo', 'intermitente', 'desativado', 'potencial');--> statement-breakpoint
CREATE TYPE "public"."status_meta" AS ENUM('alcancada', 'superada', 'em_desenvolvimento', 'nao_iniciada', 'substituida');--> statement-breakpoint
CREATE TYPE "public"."status_moderacao" AS ENUM('pendente', 'aprovado', 'rejeitado', 'spam');--> statement-breakpoint
CREATE TYPE "public"."status_publicacao" AS ENUM('rascunho', 'em_revisao', 'publicado', 'arquivado');--> statement-breakpoint
CREATE TYPE "public"."tipo_consentimento" AS ENUM('uso_imagem', 'uso_audio', 'dados_pessoais', 'publicacao_entrevista');--> statement-breakpoint
CREATE TYPE "public"."tipo_documento" AS ENUM('relatorio_tecnico', 'diagnostico_interno', 'relato_campo', 'formulario_modelo', 'relatorio_parcial', 'documento_final', 'modelagem_estatistica', 'entrevista_transcricao', 'plano_aula', 'identidade_visual', 'painel_dados', 'outro');--> statement-breakpoint
CREATE TYPE "public"."tipo_equipamento" AS ENUM('ecoparque', 'museu', 'centro_cultural', 'comunidade', 'rota_turistica', 'orgao_publico');--> statement-breakpoint
CREATE TYPE "public"."tipo_formulario" AS ENUM('rotina_funcionamento', 'publico_consumidor');--> statement-breakpoint
CREATE TYPE "public"."tipo_midia" AS ENUM('pdf', 'audio', 'imagem', 'video', 'planilha', 'apresentacao', 'dataset', 'outro');--> statement-breakpoint
CREATE TYPE "public"."tipo_pessoa" AS ENUM('pesquisador', 'ator_chave', 'agente_publico', 'lideranca_comunitaria', 'colaborador');