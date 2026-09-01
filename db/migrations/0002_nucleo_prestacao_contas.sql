-- Migração 0002 — Núcleo da prestação de contas
-- Separação entre obra intelectual (documento) e binário (arquivo), com as
-- entidades de apoio de que documento depende.
-- Referência: docs/02-arquitetura-banco.md §5, §§6.1-6.3, §13 e §16
--
-- Ordem topológica (doc 02 §16):
--   arquivo → municipio → pessoa → equipamento → consentimento
--   → documento → documento_arquivo → índices → view → triggers
--
-- As FKs são declaradas em ALTER TABLE separados, como o Drizzle Kit gera.
-- A ordem dos CREATE TABLE segue a §16 por legibilidade; a execução não
-- depende dela porque nenhuma FK é inline.
--
-- View e triggers não são expressáveis em Drizzle e vão em SQL bruto,
-- como as extensões e funções da 0001 (doc 03 §6.2).
-- A função set_atualizado_em() vem da migração 0001 e não é recriada aqui.

-- ─── 1. arquivo (doc 02 §5) ────────────────────────────────────────

CREATE TABLE "arquivo" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chave_storage" text NOT NULL,
	"url_publica" text NOT NULL,
	"nome_original" text,
	"tipo_midia" "tipo_midia" NOT NULL,
	"mime_type" text NOT NULL,
	"bytes" bigint NOT NULL,
	"sha256" char(64) NOT NULL,
	"duracao_seg" integer,
	"largura_px" integer,
	"altura_px" integer,
	"origem_url" text,
	"origem_sistema" text,
	"espelhado_em" timestamp with time zone,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "arquivo_chave_storage_unique" UNIQUE("chave_storage"),
	CONSTRAINT "arquivo_url_publica_unique" UNIQUE("url_publica"),
	CONSTRAINT "arquivo_bytes_check" CHECK ("arquivo"."bytes" > 0)
);
--> statement-breakpoint

-- ─── 2. municipio (doc 02 §6.1) ────────────────────────────────────

CREATE TABLE "municipio" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" "citext" NOT NULL,
	"nome" text NOT NULL,
	"uf" char(2) DEFAULT 'SE' NOT NULL,
	"codigo_ibge" char(7),
	"regiao" text,
	"populacao" integer,
	"sintese" text,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "municipio_slug_unique" UNIQUE("slug"),
	CONSTRAINT "municipio_codigo_ibge_unique" UNIQUE("codigo_ibge")
);
--> statement-breakpoint

-- ─── 3. pessoa (doc 02 §6.3) — referencia arquivo ──────────────────

CREATE TABLE "pessoa" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" "citext",
	"nome" text NOT NULL,
	"tipo" "tipo_pessoa" NOT NULL,
	"cargo" text,
	"instituicao" text,
	"bio_curta" text,
	"foto_id" uuid,
	"exibir_no_site" boolean DEFAULT false NOT NULL,
	"contato_email" "citext",
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pessoa_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint

-- ─── 4. equipamento (doc 02 §6.2) — referencia municipio e pessoa ──

CREATE TABLE "equipamento" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" "citext" NOT NULL,
	"nome" text NOT NULL,
	"nome_curto" text,
	"tipo" "tipo_equipamento" NOT NULL,
	"situacao" "situacao_equipamento" DEFAULT 'ativo' NOT NULL,
	"municipio_id" uuid NOT NULL,
	"povoado" text,
	"latitude" numeric(9, 6),
	"longitude" numeric(9, 6),
	"ator_chave_id" uuid,
	"sintese" text,
	"historico" text,
	"destaque_home" boolean DEFAULT false NOT NULL,
	"status" "status_publicacao" DEFAULT 'rascunho' NOT NULL,
	"publicado_em" timestamp with time zone,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "equipamento_slug_unique" UNIQUE("slug"),
	CONSTRAINT "coordenadas_completas" CHECK (("equipamento"."latitude" IS NULL) = ("equipamento"."longitude" IS NULL))
);
--> statement-breakpoint

-- ─── 5. consentimento (doc 02 §6.3) — referencia pessoa e arquivo ──

CREATE TABLE "consentimento" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pessoa_id" uuid NOT NULL,
	"tipo" "tipo_consentimento" NOT NULL,
	"concedido_em" date NOT NULL,
	"escopo" text NOT NULL,
	"termo_id" uuid,
	"revogado_em" date,
	"observacao" text,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "consentimento_pessoa_id_tipo_key" UNIQUE("pessoa_id","tipo")
);
--> statement-breakpoint

-- ─── 6. documento (doc 02 §5) — referencia equipamento e municipio ─

CREATE TABLE "documento" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" "citext" NOT NULL,
	"titulo" text NOT NULL,
	"tipo" "tipo_documento" NOT NULL,
	"resumo" text,
	"autoria" text[],
	"data_referencia" date,
	"equipamento_id" uuid,
	"municipio_id" uuid,
	"licenca" text DEFAULT 'CC BY-SA 4.0' NOT NULL,
	"exigido_pelo_edital" boolean DEFAULT false NOT NULL,
	"ordem_anexo" integer,
	"status" "status_publicacao" DEFAULT 'rascunho' NOT NULL,
	"publicado_em" timestamp with time zone,
	"arquivado_em" timestamp with time zone,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"busca" "tsvector" GENERATED ALWAYS AS (to_tsvector('portuguese', sem_acento(coalesce(titulo,'') || ' ' || coalesce(resumo,'')))) STORED,
	CONSTRAINT "documento_slug_unique" UNIQUE("slug"),
	CONSTRAINT "publicado_exige_data" CHECK ("documento"."status" <> 'publicado' OR "documento"."publicado_em" IS NOT NULL)
);
--> statement-breakpoint

-- ─── 7. documento_arquivo (doc 02 §5) ──────────────────────────────

CREATE TABLE "documento_arquivo" (
	"documento_id" uuid NOT NULL,
	"arquivo_id" uuid NOT NULL,
	"versao" integer DEFAULT 1 NOT NULL,
	"rotulo" text,
	"principal" boolean DEFAULT false NOT NULL,
	CONSTRAINT "documento_arquivo_documento_id_arquivo_id_pk" PRIMARY KEY("documento_id","arquivo_id")
);
--> statement-breakpoint

-- ─── Chaves estrangeiras ───────────────────────────────────────────

ALTER TABLE "pessoa" ADD CONSTRAINT "pessoa_foto_id_arquivo_id_fk" FOREIGN KEY ("foto_id") REFERENCES "public"."arquivo"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipamento" ADD CONSTRAINT "equipamento_municipio_id_municipio_id_fk" FOREIGN KEY ("municipio_id") REFERENCES "public"."municipio"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipamento" ADD CONSTRAINT "equipamento_ator_chave_id_pessoa_id_fk" FOREIGN KEY ("ator_chave_id") REFERENCES "public"."pessoa"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consentimento" ADD CONSTRAINT "consentimento_pessoa_id_pessoa_id_fk" FOREIGN KEY ("pessoa_id") REFERENCES "public"."pessoa"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consentimento" ADD CONSTRAINT "consentimento_termo_id_arquivo_id_fk" FOREIGN KEY ("termo_id") REFERENCES "public"."arquivo"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documento" ADD CONSTRAINT "documento_equipamento_id_equipamento_id_fk" FOREIGN KEY ("equipamento_id") REFERENCES "public"."equipamento"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documento" ADD CONSTRAINT "documento_municipio_id_municipio_id_fk" FOREIGN KEY ("municipio_id") REFERENCES "public"."municipio"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documento_arquivo" ADD CONSTRAINT "documento_arquivo_documento_id_documento_id_fk" FOREIGN KEY ("documento_id") REFERENCES "public"."documento"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documento_arquivo" ADD CONSTRAINT "documento_arquivo_arquivo_id_arquivo_id_fk" FOREIGN KEY ("arquivo_id") REFERENCES "public"."arquivo"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint

-- ─── Índices (doc 02 §5) ───────────────────────────────────────────

CREATE INDEX "idx_arquivo_sha256" ON "arquivo" USING btree ("sha256");--> statement-breakpoint
CREATE INDEX "idx_arquivo_tipo" ON "arquivo" USING btree ("tipo_midia");--> statement-breakpoint
CREATE INDEX "idx_documento_busca" ON "documento" USING gin ("busca");--> statement-breakpoint
CREATE INDEX "idx_documento_tipo" ON "documento" USING btree ("tipo") WHERE "documento"."status" = 'publicado';--> statement-breakpoint
CREATE INDEX "idx_documento_anexo" ON "documento" USING btree ("ordem_anexo") WHERE "documento"."exigido_pelo_edital" AND "documento"."status" = 'publicado';--> statement-breakpoint
-- garante no máximo um arquivo principal por documento
CREATE UNIQUE INDEX "idx_doc_arquivo_principal" ON "documento_arquivo" USING btree ("documento_id") WHERE "documento_arquivo"."principal";--> statement-breakpoint

-- ─── View de consumo (doc 02 §13) ──────────────────────────────────

-- Alimenta /prestacao-de-contas e /anexos.json
CREATE VIEW vw_anexo_publico AS
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
       (a.espelhado_em IS NOT NULL) AS espelhado
FROM documento d
JOIN documento_arquivo da ON da.documento_id = d.id AND da.principal
JOIN arquivo a            ON a.id = da.arquivo_id
WHERE d.status = 'publicado' AND d.arquivado_em IS NULL
ORDER BY d.ordem_anexo NULLS LAST, d.titulo;--> statement-breakpoint

-- ─── Triggers de atualizado_em (doc 02 §1 e §4) ────────────────────

-- Aplicado a toda tabela com atualizado_em. consentimento e
-- documento_arquivo não têm a coluna e por isso ficam de fora.

CREATE TRIGGER trg_atualizado_em BEFORE UPDATE ON arquivo
FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();--> statement-breakpoint

CREATE TRIGGER trg_atualizado_em BEFORE UPDATE ON municipio
FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();--> statement-breakpoint

CREATE TRIGGER trg_atualizado_em BEFORE UPDATE ON pessoa
FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();--> statement-breakpoint

CREATE TRIGGER trg_atualizado_em BEFORE UPDATE ON equipamento
FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();--> statement-breakpoint

CREATE TRIGGER trg_atualizado_em BEFORE UPDATE ON documento
FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();
