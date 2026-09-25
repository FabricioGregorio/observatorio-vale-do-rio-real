import { type Browser, expect, test } from "@playwright/test";

/**
 * Orçamento de carga inicial da Home — 700.000 B transferidos no desktop,
 * 500.000 B no mobile.
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
 * registrados no log. O desktop a DPR 2 recebe a variante de 1672 px da Hero e
 * a capa em `w=750`; ele é observabilidade declarada, não regressão escondida,
 * e a decisão sobre travá-lo pertence a uma fase posterior.
 *
 * ## Por que o desktop tem teto próprio
 *
 * A Home abre com uma fotografia editorial em tela cheia. Os 500.000 B
 * originais foram calibrados para o derivado anterior, de 119 kB; a fotografia
 * atual, em AVIF q55, custa 265.333 B em 1440 — e a q32 que caberia no teto antigo
 * retinha só 56% do detalhe fino dela. Qualidade fotográfica não se reduz em
 * silêncio para caber num número: o desktop passou a 700.000 B por decisão
 * explícita, e o mobile continua em 500.000 B. Cada variante da Hero tem, além
 * disso, o próprio teto — 300.000 B no desktop, 120.000 B no mobile — conferido
 * aqui sobre o que foi transferido e em `testes/hero-derivados.test.ts` sobre
 * os arquivos.
 *
 * ## Como se mede
 *
 * Contexto novo, cache desligado, sem rolagem e sem interação: o que um
 * visitante que nunca esteve aqui transfere para ver a primeira dobra. Cinco
 * cargas frias por perfil normativo, e a asserção é sobre a **maior** delas —
 * uma média abaixo do teto com uma carga acima não é um orçamento cumprido.
 */

const ORCAMENTO_DESKTOP = 700_000;
const ORCAMENTO_MOBILE = 500_000;
const TETO_HERO_DESKTOP = 300_000;
const TETO_HERO_MOBILE = 120_000;

type Perfil = {
  readonly nome: string;
  readonly largura: number;
  readonly densidade: number;
  readonly orcamento: number;
  readonly tetoHero: number;
};

const DESKTOP = { orcamento: ORCAMENTO_DESKTOP, tetoHero: TETO_HERO_DESKTOP };
const MOBILE = { orcamento: ORCAMENTO_MOBILE, tetoHero: TETO_HERO_MOBILE };

const NORMATIVOS: readonly Perfil[] = [
  { nome: "desktop DPR1", largura: 1440, densidade: 1, ...DESKTOP },
  { nome: "mobile DPR2", largura: 375, densidade: 2, ...MOBILE },
];

const OBSERVADOS: readonly Perfil[] = [
  { nome: "mobile DPR1", largura: 375, densidade: 1, ...MOBILE },
  { nome: "desktop DPR2", largura: 1440, densidade: 2, ...DESKTOP },
];

type Carga = { readonly total: number; readonly hero: number };

async function cargaFria(browser: Browser, perfil: Perfil): Promise<Carga> {
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

  const carga = await pagina.evaluate(() => {
    const entradas = [
      ...performance.getEntriesByType("navigation"),
      ...performance.getEntriesByType("resource"),
    ] as PerformanceResourceTiming[];
    return {
      total: entradas.reduce((soma, e) => soma + e.transferSize, 0),
      hero: entradas
        .filter((e) => e.name.includes("/media/campo/hero-"))
        .reduce((soma, e) => soma + e.transferSize, 0),
    };
  });
  await contexto.close();
  return carga;
}

for (const perfil of NORMATIVOS) {
  test(`Home respeita ${perfil.orcamento} B em cinco cargas frias — ${perfil.nome}`, async ({
    browser,
  }) => {
    const medicoes: Carga[] = [];
    for (let tentativa = 0; tentativa < 5; tentativa += 1) {
      medicoes.push(await cargaFria(browser, perfil));
    }
    console.log(
      `[performance:${perfil.nome}] ${medicoes.map((m) => m.total).join(", ")} B (Hero ${medicoes.map((m) => m.hero).join(", ")} B)`,
    );
    expect(Math.max(...medicoes.map((m) => m.total))).toBeLessThanOrEqual(
      perfil.orcamento,
    );
    // Uma carga sem Hero não é carga da Home: o teto dela não pode passar vazio.
    expect(Math.min(...medicoes.map((m) => m.hero))).toBeGreaterThan(0);
    expect(Math.max(...medicoes.map((m) => m.hero))).toBeLessThanOrEqual(
      perfil.tetoHero,
    );
  });
}

/**
 * Registro, não trava. Se um destes cruzar o teto, quem lê o log fica sabendo
 * — e nada quebra por causa de um perfil que esta entrega não normatizou.
 */
test("registra os perfis de observabilidade", async ({ browser }) => {
  for (const perfil of OBSERVADOS) {
    const { total, hero } = await cargaFria(browser, perfil);
    const veredito = total <= perfil.orcamento ? "dentro" : "ACIMA";
    console.log(
      `[observabilidade:${perfil.nome}] ${total} B, Hero ${hero} B (${veredito} do teto de ${perfil.orcamento} B)`,
    );
  }
});
