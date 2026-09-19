import { type Browser, expect, test } from "@playwright/test";

const ORCAMENTO_INICIAL = 500_000;

async function cargaFria(browser: Browser, largura: number): Promise<number> {
  const contexto = await browser.newContext({
    baseURL: "http://localhost:3100",
    deviceScaleFactor: 1,
    viewport: { width: largura, height: 900 },
  });
  const pagina = await contexto.newPage();
  const cdp = await contexto.newCDPSession(pagina);
  await cdp.send("Network.enable");
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });

  await pagina.goto("/", { waitUntil: "networkidle" });
  await pagina.evaluate(() => document.fonts.ready);
  await pagina.waitForTimeout(1_000);

  const bytes = await pagina.evaluate(() =>
    [
      ...performance.getEntriesByType("navigation"),
      ...performance.getEntriesByType("resource"),
    ].reduce((total, entrada) => {
      const recurso = entrada as PerformanceResourceTiming;
      return total + recurso.transferSize;
    }, 0),
  );
  await contexto.close();
  return bytes;
}

for (const [nome, largura] of [
  ["desktop", 1440],
  ["mobile", 375],
] as const) {
  test(`Home respeita 500.000 B em cinco cargas frias ${nome}`, async ({
    browser,
  }) => {
    const medicoes: number[] = [];
    for (let tentativa = 0; tentativa < 5; tentativa += 1) {
      medicoes.push(await cargaFria(browser, largura));
    }
    console.log(`[performance:${nome}] ${medicoes.join(", ")} B`);
    expect(Math.max(...medicoes)).toBeLessThanOrEqual(ORCAMENTO_INICIAL);
  });
}
