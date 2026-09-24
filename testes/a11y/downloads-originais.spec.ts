import { expect, test } from "@playwright/test";

/**
 * O download do acervo, ponta a ponta, contra o site servido.
 *
 * Até 2026-09-24 este arquivo baixava os bytes de cada categoria pela rota
 * `/baixar/[arquivoId]`, que os buscava no storage e os reconferia por
 * requisição. A rota virou redirecionamento declarado: o site responde 308 e
 * o objeto vem do storage direto para quem pediu.
 *
 * O que se prova aqui, portanto, mudou de lugar — e ficou mais forte:
 *
 * - o site responde 308, e não 200 com corpo;
 * - o destino é exatamente o link canônico daquele arquivo, com o marcador
 *   de download e nada mais;
 * - id desconhecido e valor malformado não redirecionam para lugar nenhum.
 *
 * Nenhuma requisição sai para o storage: a prova é sobre o que o site diz,
 * não sobre o que o CDN entrega. A integridade dos objetos é conferida no
 * gate de publicação, por `pnpm auditar-publicacao`.
 */

type Anexo = {
  arquivo_id: string;
  slug: string;
  rotulo_arquivo: string | null;
  mime_type: string;
  bytes: number;
  sha256: string;
  link_permanente: string;
  nome_original: string | null;
};

const MARCADOR = "?baixar=1";

test("cada categoria documental redireciona para o seu objeto canônico", async ({
  request,
}) => {
  const inventario = (await (await request.get("/anexos.json")).json()) as {
    anexos: Anexo[];
  };
  const escolher = (slug: string, predicado: (item: Anexo) => boolean) => {
    const item = inventario.anexos.find(
      (anexo) => anexo.slug === slug && predicado(anexo),
    );
    if (!item) throw new Error(`Categoria ausente: ${slug}`);
    return item;
  };
  const amostras = [
    escolher(
      "relatorio-tecnico-recanto-da-serra",
      (a) => a.mime_type === "application/pdf",
    ),
    escolher("formulario-rotina-de-funcionamento", (a) =>
      a.mime_type.includes("spreadsheet"),
    ),
    escolher("anexo-indicadores-etapa-1", (a) =>
      a.mime_type.includes("spreadsheet"),
    ),
    escolher(
      "entrevista-josenilson-bispo",
      (a) =>
        a.mime_type === "application/pdf" &&
        Boolean(a.rotulo_arquivo?.toLowerCase().includes("transcri")),
    ),
    escolher("identidade-visual", (a) => a.mime_type === "image/svg+xml"),
    escolher("fotografias-visitas-i-vii", (a) => a.mime_type === "image/jpeg"),
    escolher("fotografias-visitas-i-vii", (a) => a.mime_type === "image/heic"),
    escolher(
      "fotografias-visitas-i-vii",
      (a) => a.arquivo_id === "ab0c3f75-194e-4d8f-b698-6fcdadb0020f",
    ),
  ];
  expect(new Set(amostras.map((a) => a.arquivo_id)).size).toBe(8);

  // O original com placa continua fora do inventário público.
  expect(
    inventario.anexos.some(
      (a) =>
        a.sha256 ===
        "d5683e3b98523d36c81e7f2bb9bf8020c361393dc416b6af27fcffd0eccb225c",
    ),
  ).toBe(false);

  for (const item of amostras) {
    const resposta = await request.get(`/baixar/${item.arquivo_id}`, {
      maxRedirects: 0,
    });

    expect(resposta.status(), item.slug).toBe(308);
    expect(resposta.headers().location, item.slug).toBe(
      `${item.link_permanente}${MARCADOR}`,
    );
    /*
      Redirecionar não é entregar. O corpo de um 308 do Next é a nota curta
      de redirecionamento, não o arquivo: fica em algumas centenas de bytes e
      não tem o tipo do objeto.
    */
    expect((await resposta.body()).length, item.slug).toBeLessThan(1024);
    expect(resposta.headers()["content-type"] ?? "", item.slug).not.toContain(
      item.mime_type,
    );
  }
});

test("id desconhecido e valor malformado não redirecionam", async ({
  request,
}) => {
  const casos = [
    // UUID bem formado que não está no acervo.
    "00000000-0000-4000-8000-000000000000",
    // Valores malformados: nada disso casa com um redirect declarado.
    "nao-e-uuid",
    "b3962918-8248-45b9-92f2-5fab3ff5375",
    "b3962918-8248-45b9-92f2-5fab3ff53751x",
    "..%2F..%2Fetc%2Fpasswd",
  ];

  for (const caso of casos) {
    const resposta = await request.get(`/baixar/${caso}`, { maxRedirects: 0 });
    expect(resposta.status(), caso).toBe(404);
    expect(resposta.headers().location, caso).toBeUndefined();
  }
});
