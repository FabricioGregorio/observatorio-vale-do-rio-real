import { expect, test } from "@playwright/test";

test("a página inicial responde", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
