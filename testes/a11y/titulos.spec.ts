import { expect, test } from "@playwright/test";

import { ROTAS_PUBLICAS } from "./rotas";

/**
 * Título próprio por rota.
 *
 * A lista vivia aqui e passou a viver em `rotas.ts`, junto das demais suítes
 * que a usam: uma rota nova precisava ser lembrada em três arquivos, e foi
 * assim que seis rotas ficaram sem cobertura enquanto eram stub.
 */
for (const [rota, titulo] of ROTAS_PUBLICAS) {
  test(`${rota} tem título único e descritivo`, async ({ page }) => {
    await page.goto(rota);
    await expect(page).toHaveTitle(titulo);
  });
}
