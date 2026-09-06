/**
 * Cliente de manutenção — credencial com DML e sem DDL.
 *
 * Este módulo é exclusivo de scripts de manutenção. A variável é deliberadamente
 * independente de DATABASE_URL e DATABASE_URL_MIGRACAO: ausência não faz fallback.
 */
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "../../db/schema";

function exigirUrlManutencao(): string {
  const url = process.env.DATABASE_URL_MANUTENCAO;
  if (!url) {
    throw new Error(
      "DATABASE_URL_MANUTENCAO não definida. " +
        "Scripts de manutenção não fazem fallback para outra credencial. " +
        "Consulte .env.example.",
    );
  }
  return url;
}

const pool = new Pool({ connectionString: exigirUrlManutencao() });

/** Instância Drizzle para scripts que fazem DML, sem permissão de DDL. */
export const dbManutencao = drizzle(pool, { schema });
