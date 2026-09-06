CREATE TYPE "public"."evidencia_consentimento" AS ENUM('localizada', 'nao_localizada', 'pendente_verificacao');--> statement-breakpoint
CREATE TYPE "public"."modalidade_consentimento" AS ENUM('verbal_gravado', 'termo_assinado', 'eletronico');--> statement-breakpoint
ALTER TABLE "consentimento" ALTER COLUMN "concedido_em" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "consentimento" ADD COLUMN "data_incerta" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "consentimento" ADD COLUMN "modalidade" "modalidade_consentimento" NOT NULL;--> statement-breakpoint
ALTER TABLE "consentimento" ADD COLUMN "evidencia" "evidencia_consentimento" DEFAULT 'pendente_verificacao' NOT NULL;--> statement-breakpoint
ALTER TABLE "consentimento" ADD COLUMN "evidencia_documento_id" uuid;
--> statement-breakpoint

-- ═══════════════════════════════════════════════════════════════════
-- SQL bruto: FK e CHECKs que o Drizzle Kit não expressa (doc 03 §6.2)
-- ═══════════════════════════════════════════════════════════════════
--
-- Contexto: `pessoa_id` continua NOT NULL. Consentimento é por PESSOA, não
-- por entrevista — a entrevista 02 tem dois entrevistados, a 04 tem dois, a 07
-- tem dois. Oito entrevistas produzem onze participantes. Manter `pessoa_id`
-- obrigatório é o que impede o modelo de fingir que "a entrevista consentiu".
--
-- Nenhuma view referencia `consentimento` nem `pessoa`, então esta migração
-- não altera nenhuma view pública. Verificado antes de escrever.

-- ─── Evidência compartilhada entre pessoas ────────────────────────
-- Várias linhas de consentimento podem apontar para o mesmo documento: é
-- assim que uma única gravação sustenta a autorização de dois entrevistados
-- sem duplicar a evidência.

ALTER TABLE "consentimento"
  ADD CONSTRAINT "consentimento_evidencia_documento_fkey"
  FOREIGN KEY ("evidencia_documento_id") REFERENCES "documento"("id")
  ON DELETE RESTRICT;--> statement-breakpoint

CREATE INDEX "idx_consentimento_evidencia" ON "consentimento" ("evidencia_documento_id")
  WHERE "evidencia_documento_id" IS NOT NULL;--> statement-breakpoint

-- ─── Data ausente tem de ser declarada ────────────────────────────
-- `concedido_em` passou a aceitar NULL porque em quatro entrevistas a data
-- não é declarada em nenhum arquivo do acervo, e NOT NULL obrigava a
-- inventá-la. Mas NULL silencioso seria trocar um problema por outro: a
-- lacuna precisa ser afirmada.

ALTER TABLE "consentimento"
  ADD CONSTRAINT "consentimento_data_declarada"
  CHECK ("concedido_em" IS NOT NULL OR "data_incerta");--> statement-breakpoint

-- Afirmar incerteza E data ao mesmo tempo é contradição.
ALTER TABLE "consentimento"
  ADD CONSTRAINT "consentimento_data_coerente"
  CHECK (NOT ("concedido_em" IS NOT NULL AND "data_incerta"));--> statement-breakpoint

-- ─── Verbal gravado não tem termo assinado ────────────────────────
-- O acervo não tem termo assinado. Esta constraint impede que uma linha
-- afirme modalidade verbal e ao mesmo tempo aponte para um termo.

ALTER TABLE "consentimento"
  ADD CONSTRAINT "consentimento_verbal_sem_termo"
  CHECK ("modalidade" <> 'verbal_gravado' OR "termo_id" IS NULL);--> statement-breakpoint

-- ─── Termo assinado precisa do termo ──────────────────────────────
-- Simétrica da anterior: afirmar termo assinado sem apontar o arquivo é
-- afirmação sem prova. Fica para quando houver termo espelhado.

ALTER TABLE "consentimento"
  ADD CONSTRAINT "consentimento_termo_exige_arquivo"
  CHECK ("modalidade" <> 'termo_assinado' OR "termo_id" IS NOT NULL);
