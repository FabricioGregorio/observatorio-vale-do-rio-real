import { expect, test } from "@playwright/test";

const ROTAS_EDITORIAIS = [
  ["/observatorio", "O Observatório"],
  ["/pesquisa", "A Pesquisa"],
  ["/dados", "Dados"],
  ["/campo", "Diário de Campo"],
  ["/podobservar", "PodObservar"],
  ["/educacao", "Educação"],
  ["/imprensa", "Imprensa"],
  ["/acessibilidade", "Acessibilidade"],
  ["/privacidade", "Privacidade"],
  ["/contato", "Contato"],
] as const;

for (const [rota, titulo] of ROTAS_EDITORIAIS) {
  test(`${rota} tem título único e descritivo`, async ({ page }) => {
    await page.goto(rota);
    await expect(page).toHaveTitle(
      `${titulo} — Observatório do Vale do Rio Real`,
    );
  });
}
