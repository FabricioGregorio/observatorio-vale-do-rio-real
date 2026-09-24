import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { defineConfig } from "vitest/config";

/*
  `.env.local` é carregado porque alguns testes dependem de configuração que
  não é segredo de renderização: `OBSERVATORIO_FONTES_DIR` para conferir o
  hash da planilha de indicadores contra a fonte fora do repositório, e as
  variáveis `STORAGE_*` para os testes de integração com o R2.

  Até 2026-09-24 havia aqui um bloco que apagava três credenciais de
  PostgreSQL depois da carga: carregar `.env.local` entregava a credencial aos
  testes de integração, o `skipIf` deles nunca disparava, e `pnpm teste` abria
  conexão com o banco remoto a cada execução. O bloco saiu junto com o banco —
  não há mais o que apagar, porque não há mais código que leia essas
  variáveis. A suíte roda offline por construção, e não por precaução.
*/
if (existsSync(".env.local")) loadEnvFile(".env.local");

export default defineConfig({
  test: {
    include: ["testes/**/*.test.ts"],
  },
});
