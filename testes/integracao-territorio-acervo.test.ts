import { describe, expect, test } from "vitest";

import { metadata as metadataAcervo } from "../src/app/acervo/page";
import {
  GET,
  generateStaticParams,
} from "../src/app/territorio/camada-local/[lugar]/route";
import { metadata as metadataTerritorio } from "../src/app/territorio/page";
import { agruparMateriaisPublicos } from "../src/componentes/acervo/ListaMateriaisPublicos";
import type { AnexoPublico } from "../src/dados/consultas/anexos";

function anexo(slug: string, indice: number): AnexoPublico {
  return {
    arquivoId: `00000000-0000-4000-8000-${String(indice).padStart(12, "0")}`,
    codigo: String(indice),
    estado: "PUBLICAVEL",
    revisaoPrivacidade: "concluida",
    derivadoDe: [`documento:${slug}`],
    arquivoOrigemId: null,
    arquivoRelacao: null,
    arquivoDerivacaoMetodo: null,
    ordemAnexo: indice,
    slug,
    rotuloArquivo: `Arquivo ${indice}`,
    principal: indice === 1,
    titulo: slug === "a02" ? "Relatório A02" : "Identidade visual D01",
    tipo: "documento",
    resumo: null,
    dataReferencia: null,
    licenca: "Licença pública",
    linkPermanente: `https://arquivos.example/${slug}-${indice}`,
    linkOrigem: null,
    mimeType: "application/pdf",
    bytes: 1024,
    sha256: "a".repeat(64),
    publicadoEm: null,
  };
}

describe("integração pública de Território", () => {
  test("expõe canonical e Open Graph públicos", () => {
    expect(metadataTerritorio.alternates?.canonical?.toString()).toBe(
      "https://observatoriotobiassoueu.com.br/territorio",
    );
    expect(metadataTerritorio.openGraph?.url?.toString()).toBe(
      "https://observatoriotobiassoueu.com.br/territorio",
    );
  });

  test("gera exatamente as quatro camadas aprovadas", () => {
    expect(generateStaticParams()).toEqual([
      { lugar: "recanto-da-serra" },
      { lugar: "borda-da-mata" },
      { lugar: "serra-dos-macacos" },
      { lugar: "ilha-grande" },
    ]);
  });

  test("serve SVG público e recusa lugar inexistente", async () => {
    const resposta = await GET(new Request("https://example.test"), {
      params: Promise.resolve({ lugar: "serra-dos-macacos" }),
    });
    expect(resposta.status).toBe(200);
    expect(resposta.headers.get("content-type")).toContain("image/svg+xml");
    expect(await resposta.text()).toContain("<svg");

    const ausente = await GET(new Request("https://example.test"), {
      params: Promise.resolve({ lugar: "nao-existe" }),
    });
    expect(ausente.status).toBe(404);
  });
});

describe("integração pública do Acervo", () => {
  test("expõe canonical e Open Graph públicos", () => {
    expect(metadataAcervo.alternates?.canonical?.toString()).toBe(
      "https://observatoriotobiassoueu.com.br/acervo",
    );
    expect(metadataAcervo.openGraph?.url?.toString()).toBe(
      "https://observatoriotobiassoueu.com.br/acervo",
    );
  });

  test("agrupa A02 e os sete objetos de D01 sem colapsar arquivos", () => {
    const grupos = agruparMateriaisPublicos([
      anexo("a02", 1),
      ...Array.from({ length: 7 }, (_, indice) => anexo("d01", indice + 1)),
    ]);

    expect(grupos.map((grupo) => grupo.slug)).toEqual(["a02", "d01"]);
    expect(grupos.map((grupo) => grupo.arquivos.length)).toEqual([1, 7]);
    expect(grupos.flatMap((grupo) => grupo.arquivos)).toHaveLength(8);
  });
});
