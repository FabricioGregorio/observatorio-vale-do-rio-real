/**
 * Cliente de banco para scripts — credencial COM permissão de DDL.
 *
 * Destinado exclusivamente aos scripts de manutenção do banco que vivem nesta
 * pasta (doc 03 §2): migração, `db/seed.ts` e `db/importar-formularios.ts`.
 * NÃO importar dentro de src/ — a aplicação usa src/dados/cliente.ts com
 * DATABASE_URL (sem DDL), e a regra de ouro do doc 03 §6 continua valendo:
 * apenas src/dados/consultas/* acessa o banco em código de aplicação.
 *
 * Driver: node-postgres (`pg`), o mesmo da aplicação e o primeiro que o
 * Drizzle Kit seleciona ao aplicar migrações — um único driver, um único
 * comportamento de conexão em todo o projeto.
 * TLS é responsabilidade da URL de conexão (`?sslmode=require` quando o
 * provedor exigir), e não de configuração fixa aqui.
 *
 * Referências:
 * - doc 03 §2 (db/seed.ts e db/importar-formularios.ts)
 * - doc 03 §6 (banco: da documentação ao código)
 * - doc 03 §13 (variáveis de ambiente)
 * - ADR-002 (dois usuários de banco; PostgreSQL portável)
 * - ADR-004 (Neon apenas como provedor de hospedagem)
 */
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

const urlMigracao = process.env.DATABASE_URL_MIGRACAO;

if (!urlMigracao) {
  throw new Error(
    "DATABASE_URL_MIGRACAO não definida. " +
      "Este cliente requer a credencial de migração (com DDL). " +
      "Consulte .env.example.",
  );
}

const pool = new Pool({ connectionString: urlMigracao });

/** Instância Drizzle para scripts de migração/seed/importação. */
export const dbMigracao = drizzle(pool, { schema });
