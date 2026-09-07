ALTER TYPE "public"."metodo_derivacao" ADD VALUE 'tarjamento_privacidade' BEFORE 'extracao_secao';--> statement-breakpoint
ALTER TYPE "public"."metodo_derivacao" ADD VALUE 'sanitizacao_metadados' BEFORE 'extracao_secao';--> statement-breakpoint

-- `arquivo` representa um objeto físico. Antes de trocar a identidade de
-- localização, falhar explicitamente se o estado atual já violar o novo par.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "arquivo"
    GROUP BY "bucket", "chave_storage"
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION 'colisão existente em arquivo(bucket, chave_storage)';
  END IF;
END
$$;--> statement-breakpoint

ALTER TABLE "arquivo" DROP CONSTRAINT "arquivo_chave_storage_unique";--> statement-breakpoint
ALTER TABLE "arquivo" ADD COLUMN "replica_de_id" uuid;--> statement-breakpoint
ALTER TABLE "arquivo" ADD CONSTRAINT "arquivo_bucket_chave_key" UNIQUE("bucket","chave_storage");--> statement-breakpoint
ALTER TABLE "arquivo" ADD CONSTRAINT "arquivo_replica_nao_reflexiva" CHECK ("arquivo"."replica_de_id" IS NULL OR "arquivo"."replica_de_id" <> "arquivo"."id");--> statement-breakpoint
ALTER TABLE "arquivo" ADD CONSTRAINT "arquivo_proveniencia_unica" CHECK (num_nonnulls("arquivo"."derivado_de_id", "arquivo"."replica_de_id") <= 1);--> statement-breakpoint

ALTER TABLE "arquivo"
  ADD CONSTRAINT "arquivo_replica_de_id_fkey"
  FOREIGN KEY ("replica_de_id") REFERENCES "arquivo"("id") ON DELETE RESTRICT;--> statement-breakpoint

CREATE INDEX "idx_arquivo_replica_de" ON "arquivo" ("replica_de_id")
  WHERE "replica_de_id" IS NOT NULL;--> statement-breakpoint

-- A view preserva as 19 colunas anteriores em nome, tipo e ordem, acrescenta
-- a proveniência do objeto ao fim e deixa de confundir `principal` com
-- autorização pública. Todo vínculo cujo documento e arquivo passam no gate
-- canônico produz uma linha.
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
       a.derivacao_metodo AS arquivo_derivacao_metodo
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
