import { expect, test } from "@playwright/test";

/**
 * O Acervo e `/anexos.json` descrevem o mesmo corpus.
 *
 * ## De onde este arquivo veio
 *
 * Chamava-se `prestacao-acervo.spec.ts` e apurava a correspondência contra a
 * tabela da Prestação de Contas, que listava os anexos todos numa página só.
 * Por decisão humana de 2026-09-23 aquela área deixou de existir e o Acervo
 * passou a ser o único ponto público de consulta documental.
 *
 * A afirmação que importa não mudou de conteúdo, só de superfície: **todo
 * arquivo declarado no inventário legível por máquina é alcançável por
 * navegação pública**. Antes isso se verificava numa tabela; agora se
 * verifica percorrendo o Acervo, que é o percurso que uma pessoa faz.
 *
 * O total não é constante de teste: ele vem de `/anexos.json`, que deriva de
 * `vw_anexo_publico` no mesmo build. Fixar um número aqui foi o que fez a
 * suíte continuar exigindo oito depois da publicação de 2026-09-16 — um
 * contrato histórico disfarçado de invariante.
 */

type InventarioPublico = {
  total: number;
  anexos: Array<{
    slug: string;
    arquivo_id: string;
    link_permanente: string;
  }>;
};

/** Os `href` de uma página servida, sem renderizar nada. */
function extrairHrefs(html: string, padrao: RegExp): string[] {
  return [...html.matchAll(padrao)].map((achado) => achado[0]);
}

test.describe("o Acervo alcança todo o corpus público", () => {
  test("cada arquivo do inventário é alcançável pelo índice do Acervo", async ({
    request,
  }) => {
    const json = (await (
      await request.get("/anexos.json")
    ).json()) as InventarioPublico;
    expect(json.anexos).toHaveLength(json.total);

    /*
      Passo 1 — o índice lista um documento por slug do inventário. Nenhum
      documento canônico fica fora da primeira tela de quem chega ao Acervo.
    */
    const indice = await (await request.get("/acervo")).text();
    const slugsDoInventario = new Set(json.anexos.map((a) => a.slug));
    for (const slug of slugsDoInventario) {
      expect(indice, slug).toContain(`/acervo/${slug}`);
    }

    /*
      Passo 2 — as fichas de arquivo de cada documento. A união delas tem de
      ser exatamente o conjunto de identificadores do inventário: nenhum
      arquivo público sem ficha, e nenhuma ficha que o inventário não declare.

      Esta é a asserção que substitui a contagem de linhas da tabela antiga, e
      ela é mais forte: a tabela provava que os arquivos estavam listados; o
      percurso prova que estão listados **onde se chega navegando**.
    */
    const alcancados = new Set<string>();
    for (const slug of slugsDoInventario) {
      const resposta = await request.get(`/acervo/${slug}`);
      expect(resposta.status(), slug).toBe(200);
      const html = await resposta.text();
      for (const href of extrairHrefs(
        html,
        /\/acervo\/[a-z0-9-]+\/arquivo\/[0-9a-f-]{36}/g,
      )) {
        alcancados.add(href.split("/arquivo/")[1] ?? "");
      }
    }

    expect([...alcancados].sort()).toEqual(
      json.anexos.map((a) => a.arquivo_id).sort(),
    );
  });

  test("a ficha do arquivo oferece o download pelo endereço do próprio site", async ({
    request,
  }) => {
    const json = (await (
      await request.get("/anexos.json")
    ).json()) as InventarioPublico;
    const amostra = json.anexos.slice(0, 5);
    expect(amostra.length).toBeGreaterThan(0);

    for (const anexo of amostra) {
      const html = await (
        await request.get(`/acervo/${anexo.slug}/arquivo/${anexo.arquivo_id}`)
      ).text();
      expect(html, anexo.arquivo_id).toContain(`/baixar/${anexo.arquivo_id}`);
      /*
        Chave privada, host do bucket e endereço de desenvolvimento do R2 não
        podem aparecer numa superfície pública: o site existe justamente para
        substituir endereços que dependem de conta de terceiro.
      */
      expect(html).not.toMatch(/r2\.dev|r2\.cloudflarestorage|STORAGE_PRIVATE/);
    }
  });
});

test.describe("o inventário legível por máquina", () => {
  test("o acervo público reúne os documentos autorizados e só eles", async ({
    request,
  }) => {
    const resposta = await request.get("/anexos.json");
    expect(resposta.ok()).toBe(true);
    expect(resposta.headers()["content-type"]).toContain("application/json");

    const corpo = await resposta.text();
    const json = JSON.parse(corpo) as {
      total: number;
      anexos: Array<{ slug: string; link_permanente: string }>;
    };
    expect(json.anexos).toHaveLength(json.total);

    const porSlug = new Map<string, number>();
    for (const anexo of json.anexos) {
      porSlug.set(anexo.slug, (porSlug.get(anexo.slug) ?? 0) + 1);
      expect(anexo.link_permanente).toMatch(
        /^https:\/\/acervo\.observatoriotobiassoueu\.com\.br\/arquivos\//,
      );
    }

    // Uma entrada documental por original; WebPs não duplicam as 59 fotos.
    expect(Object.fromEntries([...porSlug].sort())).toEqual({
      "anexo-indicadores-etapa-1": 18,
      "entrevista-josenilson-bispo": 2,
      "entrevista-laerte-aguiar": 2,
      "entrevista-lideranca-ilha-grande": 2,
      "entrevista-marcio-andre": 2,
      "entrevista-oviedo-e-neide-abreu": 2,
      "entrevista-paola-santana": 2,
      "entrevista-pedro-menezes": 2,
      "entrevista-prefeito-tobias-barreto": 2,
      "formulario-publico-consumidor": 2,
      "formulario-rotina-de-funcionamento": 1,
      "fotografias-visitas-i-vii": 59,
      "identidade-visual": 8,
      "relatorio-tecnico-borda-da-mata": 1,
      "relatorio-tecnico-recanto-da-serra": 1,
      "relatorio-tecnico-serra-dos-macacos": 1,
    });

    // O que a decisão humana manteve fora, continua fora.
    expect(corpo).not.toContain("relato-participacao-expedicao");
    expect(corpo).not.toContain("entrevista-cultura-itabaianinha");
    expect(corpo).not.toContain("STORAGE_PRIVATE");
    expect(corpo).not.toContain("chave_storage");
    expect(corpo).not.toContain("r2.dev");
    expect(corpo).not.toContain("r2.cloudflarestorage");
  });
});
