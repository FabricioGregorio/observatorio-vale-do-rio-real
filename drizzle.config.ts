import { defineConfig } from "drizzle-kit";

/**
 * Configuração do Drizzle Kit.
 *
 * Usa DATABASE_URL_MIGRACAO (credencial com DDL) para gerar e aplicar
 * migrações. A aplicação usa DATABASE_URL (sem DDL) — ver src/dados/cliente.ts.
 *
 * Driver
 * ------
 * `dialect: "postgresql"` sem `driver` faz o Drizzle Kit resolver o pacote
 * instalado; com `pg` presente ele usa node-postgres, o mesmo driver dos dois
 * clientes. Protocolo wire padrão: funciona contra PostgreSQL local em Docker,
 * contra o serviço do CI e contra o provedor de hospedagem, sem recurso
 * proprietário. TLS vem da URL de conexão (`?sslmode=require` quando exigido).
 *
 * Numeração das migrações
 * -----------------------
 * `prefix: "index"` é o único modo que produz numeração sequencial estável
 * (os demais são "timestamp", "supabase", "unix" e "none"). O índice sai de
 * `lastEntryInJournal.idx + 1`, com zero-padding de quatro dígitos, e o mesmo
 * prefixo nomeia o snapshot em meta/. O contrato do projeto começa em 0001, e
 * não em 0000, então o journal está sementeado com `idx: 1` — a partir daí o
 * próprio Drizzle Kit continua a sequência (0002, 0003, ...) sem intervenção.
 * Declarado explicitamente, e não por omissão, para que a numeração das
 * migrações não dependa do valor padrão da ferramenta.
 *
 * Referências:
 * - doc 02 §1 e §15 (migrações versionadas em /db/migrations)
 * - doc 03 §6 (banco: da documentação ao código)
 * - doc 03 §13 (variáveis de ambiente)
 * - ADR-002 (dois usuários de banco; PostgreSQL portável)
 * - ADR-004 (Neon apenas como provedor de hospedagem)
 */
const urlMigracao = process.env.DATABASE_URL_MIGRACAO;

if (!urlMigracao) {
  throw new Error(
    "DATABASE_URL_MIGRACAO não definida. " +
      "O Drizzle Kit requer a credencial de migração (com DDL). " +
      "Consulte .env.example.",
  );
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./db/schema.ts",
  out: "./db/migrations",
  migrations: {
    prefix: "index",
  },
  dbCredentials: {
    url: urlMigracao,
  },
});
