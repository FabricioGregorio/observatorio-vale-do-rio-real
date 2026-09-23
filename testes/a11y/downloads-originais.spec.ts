import { createHash } from "node:crypto";
import { expect, test } from "@playwright/test";

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

test("download entrega os bytes, MIME e nome originais de cada categoria", async ({
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
  expect(
    inventario.anexos.some(
      (a) =>
        a.sha256 ===
        "d5683e3b98523d36c81e7f2bb9bf8020c361393dc416b6af27fcffd0eccb225c",
    ),
  ).toBe(false);

  for (const item of amostras) {
    const resposta = await request.get(`/baixar/${item.arquivo_id}`);
    expect(resposta.status(), item.slug).toBe(200);
    const corpo = await resposta.body();
    expect(corpo.length, item.slug).toBe(item.bytes);
    expect(createHash("sha256").update(corpo).digest("hex"), item.slug).toBe(
      item.sha256,
    );
    expect(resposta.headers()["content-type"], item.slug).toContain(
      item.mime_type,
    );
    expect(resposta.headers()["content-disposition"], item.slug).toContain(
      "attachment;",
    );
    if (item.nome_original) {
      expect(resposta.headers()["content-disposition"], item.slug).toContain(
        encodeURIComponent(item.nome_original),
      );
    }
    const origem = await request.head(item.link_permanente);
    expect(origem.status(), item.slug).toBe(200);
    expect(origem.headers()["content-type"], item.slug).toContain(
      item.mime_type,
    );
  }
});
