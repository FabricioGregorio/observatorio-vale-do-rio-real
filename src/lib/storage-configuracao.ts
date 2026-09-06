import { z } from "zod";

/** Valida sem incluir valores de ambiente nas mensagens de erro. */
export function exigirConfiguracao(nome: string): string {
  const resultado = z.string().trim().min(1).safeParse(process.env[nome]);
  if (!resultado.success)
    throw new Error(`${nome} ausente. Consulte .env.example.`);
  return resultado.data;
}
