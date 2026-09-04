import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./testes/a11y",
  use: {
    /*
      `localhost`, e não `127.0.0.1`, de propósito.

      O `next dev` bloqueia acesso cross-origin aos seus recursos de
      desenvolvimento, e considera `localhost` a sua origem. Apontando para
      `127.0.0.1`, o HMR era bloqueado e **a página nunca hidratava**: todo
      Client Component ficava inerte nos testes. Passou despercebido enquanto
      nenhum teste dependia de comportamento no navegador; apareceu na primeira
      vez que um dependeu, na navegação por teclado do mapa.
    */
    baseURL: "http://localhost:3000",
    ...devices["Desktop Chrome"],
  },
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
  },
});
