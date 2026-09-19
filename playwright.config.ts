import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./testes/a11y",
  /* Laboratórios que, por contrato, respondem 404 em produção. Seus testes
     continuam no repositório, mas não pertencem ao gate da superfície pública. */
  testIgnore: [
    "**/dados-prototipo.spec.ts",
    "**/dados-vivos.spec.ts",
    "**/hero-prototipo.spec.ts",
    "**/linguagem-visual.spec.ts",
    "**/pesquisa-prototipo.spec.ts",
    "**/rota-estilos.spec.ts",
    "**/territorio-prototipo.spec.ts",
    "**/territorio-vivo.spec.ts",
  ],
  fullyParallel: true,
  workers: 4,
  retries: 0,
  use: {
    baseURL: "http://localhost:3100",
    ...devices["Desktop Chrome"],
    trace: "retain-on-failure",
  },
  webServer: {
    command: "pnpm start:e2e",
    url: "http://localhost:3100",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
