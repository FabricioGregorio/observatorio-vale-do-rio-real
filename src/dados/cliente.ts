/**
 * Cliente de banco da aplicação — credencial SEM permissão de DDL.
 *
 * Único ponto de acesso ao banco para consultas da aplicação.
 * Importado exclusivamente por src/dados/consultas/*.
 * Migrações, seed e importação usam db/cliente.ts com DATABASE_URL_MIGRACAO.
 *
 * Driver: node-postgres (`pg`), protocolo wire padrão do PostgreSQL. Funciona
 * contra o PostgreSQL local em Docker, contra o serviço do CI e contra o
 * provedor de hospedagem, sem nenhum recurso proprietário — o provedor é uma
 * decisão de infraestrutura (ADR-004), não uma dependência do código.
 * TLS é responsabilidade da URL de conexão (`?sslmode=require` quando o
 * provedor exigir), e não de configuração fixa aqui.
 *
 * Referências:
 * - doc 03 §2 (estrutura de pastas: src/dados/cliente.ts)
 * - doc 03 §6 (regra de ouro: apenas src/dados/consultas/* importa o cliente)
 * - doc 03 §13 (variáveis de ambiente)
 * - ADR-002 (dois usuários de banco; PostgreSQL portável)
 * - ADR-004 (Neon apenas como provedor de hospedagem)
 */
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "../../db/schema";

const urlBanco = process.env.DATABASE_URL;

if (!urlBanco) {
  throw new Error(
    "DATABASE_URL não definida. " +
      "Este cliente requer a credencial da aplicação (sem DDL). " +
      "Consulte .env.example.",
  );
}

const pool = new Pool({ connectionString: urlBanco });

/** Instância Drizzle da aplicação — usar apenas em src/dados/consultas/. */
export const db = drizzle(pool, { schema });
