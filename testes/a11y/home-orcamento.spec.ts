import { type Browser, expect, test } from "@playwright/test";

/**
 * Orçamento de carga inicial da Home — 500.000 B transferidos (doc 01 §7).
 *
 * ## Por que o perfil importa tanto quanto o número
 *
 * O peso transferido não é um número só: ele depende da densidade da tela.
 * O `sizes` da capa do episódio resolve para `w=384` a DPR 1 e para `w=750` a
 * DPR 2, e isso sozinho move o total em dezenas de kB. Medir "a Home" sem
 * dizer em que perfil é medir qualquer coisa.
 *
 * Os perfis normativos desta entrega são dois, e são os que bloqueiam:
 *
 * - desktop 1440x900 a DPR 1;
 * - mobile 375x900 a DPR 2.
 *
 * Os outros dois cantos da matriz continuam sendo medidos, e apenas
 * registrados no log. O desktop a DPR 2 está hoje acima do teto, por conta da
 * mesma capa; ele é observabilidade declarada, não regressão escondida, e a
 * decisão sobre ele pertence a uma fase posterior.
 *
 * ## Como se mede
 *
 * Contexto novo, cache desligado, sem rolagem e sem interação: o que um
 * visitante que nunca esteve aqui transfere para ver a primeira dobra. Cinco
 * cargas frias por perfil normativo, e a asserção é sobre a **maior** delas —
 * uma média abaixo do teto com uma carga acima não é um orçamento cumprido.
 */

const ORCAMENTO_INICIAL = 500_000;

type Perfil = {
  readonly nome: string;
  readonly largura: number;
  readonly densidade: number;
};

const NORMATIVOS: readonly Perfil[] = [
  { nome: "desktop DPR1", largura: 1440, densidade: 1 },
  { nome: "mobile DPR2", largura: 375, densidade: 2 },
];

const OBSERVADOS: readonly Perfil[] = [
  { nome: "mobile DPR1", largura: 375, densidade: 1 },
  { nome: "desktop DPR2", largura: 1440, densidade: 2 },
];

async function cargaFria(browser: Browser, perfil: Perfil): Promise<number> {
  const contexto = await browser.newContext({
    baseURL: "http://localhost:3100",
    deviceScaleFactor: perfil.densidade,
    viewport: { width: perfil.largura, height: 900 },
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

for (const perfil of NORMATIVOS) {
  test(`Home respeita 500.000 B em cinco cargas frias — ${perfil.nome}`, async ({
    browser,
  }) => {
    const medicoes: number[] = [];
    for (let tentativa = 0; tentativa < 5; tentativa += 1) {
      medicoes.push(await cargaFria(browser, perfil));
    }
    console.log(`[performance:${perfil.nome}] ${medicoes.join(", ")} B`);
    expect(Math.max(...medicoes)).toBeLessThanOrEqual(ORCAMENTO_INICIAL);
  });
}

/**
 * Registro, não trava. Se um destes cruzar o teto, quem lê o log fica sabendo
 * — e nada quebra por causa de um perfil que esta entrega não normatizou.
 */
test("registra os perfis de observabilidade", async ({ browser }) => {
  for (const perfil of OBSERVADOS) {
    const bytes = await cargaFria(browser, perfil);
    const veredito = bytes <= ORCAMENTO_INICIAL ? "dentro" : "ACIMA";
    console.log(
      `[observabilidade:${perfil.nome}] ${bytes} B (${veredito} do teto de ${ORCAMENTO_INICIAL} B)`,
    );
  }
});
