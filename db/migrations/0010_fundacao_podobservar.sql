CREATE TABLE "episodio" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" "citext" NOT NULL,
	"temporada_id" uuid NOT NULL,
	"numero" integer NOT NULL,
	"titulo" text NOT NULL,
	"resumo" text NOT NULL,
	"audio_id" uuid NOT NULL,
	"duracao_seg" integer NOT NULL,
	"transcricao" text NOT NULL,
	"capa_id" uuid,
	"explicito" boolean DEFAULT false NOT NULL,
	"url_spotify" text,
	"url_youtube" text,
	"status" "status_publicacao" DEFAULT 'rascunho' NOT NULL,
	"publicado_em" timestamp with time zone,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"busca" "tsvector" GENERATED ALWAYS AS (to_tsvector('portuguese', sem_acento(coalesce(titulo,'') || ' ' || coalesce(resumo,'') || ' ' || coalesce(transcricao,'')))) STORED,
	CONSTRAINT "episodio_slug_unique" UNIQUE("slug"),
	CONSTRAINT "episodio_temporada_id_numero_key" UNIQUE("temporada_id","numero")
);
--> statement-breakpoint
CREATE TABLE "temporada" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"numero" integer NOT NULL,
	"titulo" text NOT NULL,
	"descricao" text,
	"ano" integer,
	"capa_id" uuid,
	CONSTRAINT "temporada_numero_unique" UNIQUE("numero")
);
--> statement-breakpoint
ALTER TABLE "episodio" ADD CONSTRAINT "episodio_temporada_id_temporada_id_fk" FOREIGN KEY ("temporada_id") REFERENCES "public"."temporada"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "episodio" ADD CONSTRAINT "episodio_audio_id_arquivo_id_fk" FOREIGN KEY ("audio_id") REFERENCES "public"."arquivo"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "episodio" ADD CONSTRAINT "episodio_capa_id_arquivo_id_fk" FOREIGN KEY ("capa_id") REFERENCES "public"."arquivo"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "temporada" ADD CONSTRAINT "temporada_capa_id_arquivo_id_fk" FOREIGN KEY ("capa_id") REFERENCES "public"."arquivo"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_episodio_busca" ON "episodio" USING gin ("busca");--> statement-breakpoint
CREATE INDEX "idx_episodio_publicado" ON "episodio" USING btree ("publicado_em") WHERE "episodio"."status" = 'publicado';--> statement-breakpoint

-- ═══════════════════════════════════════════════════════════════════
-- SQL bruto: trigger e view (doc 03 §6.2)
-- ═══════════════════════════════════════════════════════════════════
--
-- Fundação técnica do PodObservar, doc 02 §9. Subconjunto deliberado: só
-- `temporada` e `episodio`. `episodio_capitulo` e `episodio_referencia`
-- continuam normativos no doc 02 e ficam para depois — o segundo referencia
-- `entrevista` e `entrevista_trecho`, que ainda não existem no schema.
--
-- Migração aditiva. Não cria episódio, não cria arquivo, não publica nada:
-- ao fim, `temporada`, `episodio` e `vw_episodio_publico` têm zero linhas, e
-- isso é o estado correto.
--
-- `status_publicacao` vem da migração 0001 e é reutilizado: não há enum novo.

-- ─── 1. Trigger de atualizado_em ──────────────────────────────────
-- Doc 02 §4: toda tabela com `atualizado_em` recebe o trigger. `episodio`
-- tem; `temporada` não tem a coluna no doc 02 §9 e por isso não recebe.
-- A função set_atualizado_em() vem da migração 0001 e não é recriada aqui.

CREATE TRIGGER trg_atualizado_em BEFORE UPDATE ON episodio
FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();--> statement-breakpoint

-- ─── 2. vw_episodio_publico: o gate editorial ─────────────────────
--
-- Mesmo princípio fail-closed de `vw_anexo_publico` (migrações 0002/0006/
-- 0007/0009): o que autoriza a exposição pública está no banco, nunca num
-- WHERE do frontend. São seis condições, e nenhuma é dispensável.
--
--   1. status = 'publicado'      — rascunho, em_revisao e arquivado não vazam;
--   2. publicado_em IS NOT NULL  — sem data declarada não há publicação;
--   3. publicado_em <= now()     — episódio datado no futuro ainda não é público;
--   4. áudio com visibilidade = 'publico';
--   5. áudio com url_publica presente;
--   6. áudio com espelhado_em preenchido.
--
-- As três últimas são JOIN interno, e não filtro opcional. Um episódio cujo
-- áudio ainda está no bucket privado não ganha linha pública com URL nula:
-- é a mesma recusa da 0006, onde `arquivo_visibilidade_coerente` amarrou
-- visibilidade e URL como um só fato. O site não concatena URL pública; lê a
-- que o objeto declara.
--
-- A capa entra por LEFT JOIN com os mesmos predicados públicos — capa privada
-- apaga `capa_url`, e não o episódio, porque `capa_id` é anulável no doc 02 §9.
--
-- `temporada_numero` é coluna pública porque a rota é
-- `/podobservar/t1/[episodio]`: a consulta valida temporada e slug juntos, e
-- slug certo com temporada errada resolve para inexistência — sem revelar que
-- o episódio existe em outra temporada.
--
-- Fora da projeção, deliberadamente: id, temporada_id, audio_id, capa_id,
-- status, criado_em, atualizado_em, busca, bucket, chave_storage.

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
       au.url_publica AS audio_url,
       au.mime_type   AS audio_mime_type,
       au.bytes       AS audio_bytes,
       cp.url_publica AS capa_url,
       cp.largura_px  AS capa_largura_px,
       cp.altura_px   AS capa_altura_px
FROM episodio e
JOIN temporada t     ON t.id = e.temporada_id
JOIN arquivo au      ON au.id = e.audio_id
                    AND au.visibilidade = 'publico'
                    AND au.url_publica IS NOT NULL
                    AND au.espelhado_em IS NOT NULL
LEFT JOIN arquivo cp ON cp.id = e.capa_id
                    AND cp.visibilidade = 'publico'
                    AND cp.url_publica IS NOT NULL
                    AND cp.espelhado_em IS NOT NULL
WHERE e.status = 'publicado'
  AND e.publicado_em IS NOT NULL
  AND e.publicado_em <= now()
ORDER BY e.publicado_em DESC, e.numero DESC;
