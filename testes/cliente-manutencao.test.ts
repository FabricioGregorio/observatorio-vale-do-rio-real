import { afterEach, describe, expect, test, vi } from "vitest";

describe("cliente de manutenção", () => {
  afterEach(() => vi.unstubAllEnvs());

  test("não faz fallback quando DATABASE_URL_MANUTENCAO está ausente", async () => {
    vi.stubEnv("DATABASE_URL", "postgres://app.example.invalid/app");
    vi.stubEnv(
      "DATABASE_URL_MIGRACAO",
      "postgres://migration.example.invalid/app",
    );
    vi.stubEnv("DATABASE_URL_MANUTENCAO", "");

    await expect(import("../src/dados/clienteManutencao")).rejects.toThrow(
      "DATABASE_URL_MANUTENCAO não definida",
    );
  });
});
