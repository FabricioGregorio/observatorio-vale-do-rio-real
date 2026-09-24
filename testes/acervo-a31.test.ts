import { Pool } from "pg";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import PaginaArquivo from "../src/app/acervo/[documento]/arquivo/[arquivoId]/page";
import { serializarAnexos } from "../src/app/anexos.json/route";
import sitemap from "../src/app/sitemap";
import {
  type AnexoPublico,
  listarAnexosPublicos,
} from "../src/dados/consultas/anexos";
import {
  gruposB01NaOrdemTerritorial,
  mapaB01,
  reconciliarMapaB01,
} from "../src/dados/editorial/mapa-b01";
import { formatoPublico } from "../src/dados/editorial/tipos-publicos";
import {
  organizarDocumentosPublicos,
  selecionarArquivoPublico,
  validarAcervoPublico,
} from "../src/dados/publicado/acervo";
import { IDS_DOS_LUGARES } from "../src/dados/territorio/referencias";

/** Anexo sintético: só para exercitar a serialização sem tocar o banco. */
function exemploDeAnexo(over: Partial<AnexoPublico> = {}): AnexoPublico {
  return {
    arquivoId: "00000000-0000-4000-8000-000000000000",
    codigo: "02",
    estado: "PUBLICAVEL",
    revisaoPrivacidade: "concluida",
    derivadoDe: [],
    arquivoOrigemId: null,
    arquivoRelacao: null,
    arquivoDerivacaoMetodo: null,
    ordemAnexo: 2,
    slug: "relatorio-tecnico-recanto-da-serra",
    rotuloArquivo: null,
    principal: true,
    titulo: "Relatório Técnico — Recanto da Serra",
    tipo: "relatorio_tecnico",
    resumo: null,
    dataReferencia: null,
    licenca: "CC BY-SA 4.0",
    linkPermanente: "https://acervo.exemplo/a02.pdf",
    linkOrigem: null,
    mimeType: "application/pdf",
    bytes: 1000,
    sha256: "0".repeat(64),
    publicadoEm: null,
    ...over,
  };
}

describe("fundação do Acervo A3.1", () => {
  test("mapa versionado conserva os quatro lugares na ordem canônica e os dois créditos", () => {
    expect(mapaB01.grupos).toHaveLength(10);
    expect(mapaB01.arquivos).toHaveLength(59);
    expect(
      gruposB01NaOrdemTerritorial()
        .slice(0, 4)
        .map((g) => g.lugarCanonicoId),
    ).toEqual(IDS_DOS_LUGARES);
    expect(
      mapaB01.arquivos.find(
        (a) => a.arquivoId === "d0af646c-e6b0-423d-9edc-d5ffc74b246a",
      )?.credito,
    ).toBe("Dani Santos");
    expect(
      mapaB01.arquivos.find(
        (a) => a.arquivoId === "0780c902-bb26-4004-ac50-86247c139cc2",
      )?.credito,
    ).toBe("Iago de Andrade Santos");
    expect(
      mapaB01.arquivos.every(
        (a) => a.alt.trim() && a.largura > 0 && a.altura > 0,
      ),
    ).toBe(true);
    expect(new Set(mapaB01.arquivos.map((a) => a.arquivoId)).size).toBe(59);
  });

  test.skipIf(!process.env.DATABASE_URL)(
    "reconcilia anexos canônicos, 16 documentos e B01 58 fotos + 1 SVG",
    async () => {
      const anexos = await listarAnexosPublicos();
      expect(validarAcervoPublico(anexos)).toHaveLength(16);
      const b01 = reconciliarMapaB01(anexos);
      expect([b01.publicos.length, b01.webp, b01.svg]).toEqual([59, 58, 1]);
      expect(
        organizarDocumentosPublicos(anexos).flatMap((d) => d.arquivos),
      ).toHaveLength(107);
      const audios = anexos.filter((a) =>
        ["audio/mp4", "audio/mpeg", "audio/x-m4a"].includes(a.mimeType),
      );
      expect(audios.length).toBeGreaterThan(0);
      for (const audio of audios) {
        expect(
          anexos.some(
            (a) =>
              a.slug === audio.slug &&
              a.mimeType === "application/pdf" &&
              a.rotuloArquivo?.toLocaleLowerCase("pt-BR").includes("transcri"),
          ),
        ).toBe(true);
      }
      const primeiroAudio = audios[0];
      if (!primeiroAudio) throw new Error("Nenhum áudio público");
      const paginaAudio = renderToStaticMarkup(
        await PaginaArquivo({
          params: Promise.resolve({
            documento: primeiroAudio.slug,
            arquivoId: primeiroAudio.arquivoId,
          }),
        }),
      );
      expect(paginaAudio).toContain("<audio");
      expect(paginaAudio).toContain('preload="none"');
      expect(paginaAudio).not.toContain("autoplay");
      expect(paginaAudio).toContain(
        "Abrir transcrição pública deste documento",
      );

      const correto = b01.publicos[0];
      expect(correto).toBeDefined();
      if (!correto) throw new Error("B01 vazio");
      const documentos = organizarDocumentosPublicos(anexos);
      expect(
        selecionarArquivoPublico(documentos, correto.slug, correto.arquivoId),
      ).toEqual(correto);
      expect(
        selecionarArquivoPublico(documentos, "slug-errado", correto.arquivoId),
      ).toBeNull();
      expect(
        selecionarArquivoPublico(documentos, correto.slug, "uuid-invalido"),
      ).toBeNull();
      expect(
        selecionarArquivoPublico(
          documentos,
          "documento-inexistente",
          correto.arquivoId,
        ),
      ).toBeNull();

      const divergente = anexos.map((a) =>
        a.arquivoId === correto.arquivoId
          ? { ...a, sha256: "0".repeat(64) }
          : a,
      );
      expect(() => reconciliarMapaB01(divergente)).toThrow(/SHA divergente/);
      expect(() =>
        reconciliarMapaB01(
          anexos.filter((a) => a.arquivoId !== correto.arquivoId),
        ),
      ).toThrow(/59 objetos/);

      const urls = (await sitemap()).map((item) => item.url);
      expect(urls.filter((url) => url.includes("/acervo/"))).toHaveLength(123);
      expect(urls.every((url) => !url.includes("?"))).toBe(true);
    },
  );

  test.skipIf(!process.env.DATABASE_URL_MIGRACAO)(
    "view expõe somente UUIDs públicos, inclusive assets técnicos",
    async () => {
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL_MIGRACAO,
      });
      try {
        const resultado = await pool.query(`
        select count(*)::int as total,
               count(*) filter (where v.arquivo_id is null)::int as sem_id,
               count(*) filter (where a.visibilidade <> 'publico'
                 or d.estado_documental <> 'PUBLICAVEL'
                 or d.revisao_privacidade <> 'concluida'
                 or d.status <> 'publicado'
                 or d.arquivado_em is not null)::int as fora_gate
        from vw_anexo_publico v
        join arquivo a on a.id = v.arquivo_id
        join documento d on d.slug = v.slug
      `);
        expect(resultado.rows[0]).toMatchObject({
          sem_id: 0,
          fora_gate: 0,
        });
        expect(resultado.rows[0].total).toBeGreaterThanOrEqual(109);
        const privado = await pool.query(
          "select id::text from arquivo where visibilidade <> 'publico' limit 1",
        );
        const idPrivado = privado.rows[0]?.id as string | undefined;
        if (idPrivado) {
          const anexos = await listarAnexosPublicos();
          expect(anexos.some((a) => a.arquivoId === idPrivado)).toBe(false);
        }
      } finally {
        await pool.end();
      }
    },
  );
});

describe("contrato machine-readable do inventário público", () => {
  const CAMPOS_PROIBIDOS = [
    "chave_storage",
    "documento_id",
    "visibilidade",
    "url_privada",
    "espelhado_em",
    "estado_documental",
    "revisao_privacidade",
  ];

  test("pagina_url e link_permanente são coisas diferentes, e nenhuma é escrita à mão", () => {
    const [item] = serializarAnexos(
      [
        exemploDeAnexo({
          slug: "relatorio-tecnico-recanto-da-serra",
          arquivoId: "b3962918-8248-45b9-92f2-5fab3ff53751",
          linkPermanente:
            "https://acervo.observatoriotobiassoueu.com.br/arquivos/analise-de-dados/a02.pdf",
        }),
      ],
      "2026-09-24",
    ).anexos;
    if (!item) throw new Error("Serialização vazia");

    // A ficha HTML para humanos…
    expect(item.pagina_url).toBe(
      "https://observatoriotobiassoueu.com.br/acervo/relatorio-tecnico-recanto-da-serra/arquivo/b3962918-8248-45b9-92f2-5fab3ff53751",
    );
    // …e o objeto binário, que continua intocado.
    expect(item.link_permanente).toBe(
      "https://acervo.observatoriotobiassoueu.com.br/arquivos/analise-de-dados/a02.pdf",
    );
    expect(item.arquivo_id).toBe("b3962918-8248-45b9-92f2-5fab3ff53751");
    expect(item.pagina_url).not.toBe(item.link_permanente);
  });

  test.skipIf(!process.env.DATABASE_URL)(
    "os anexos canônicos trazem arquivo_id e pagina_url, sem campo privado",
    async () => {
      const inventario = serializarAnexos(
        await listarAnexosPublicos(),
        "2026-09-24",
      );
      expect(inventario.total).toBe(107);
      expect(inventario.anexos).toHaveLength(107);

      const oficial = "https://observatoriotobiassoueu.com.br";
      const uuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

      for (const item of inventario.anexos) {
        expect(item.arquivo_id, item.slug).toMatch(uuid);
        // A página contextual é exatamente a rota que o Acervo publica.
        expect(item.pagina_url, item.arquivo_id).toBe(
          `${oficial}/acervo/${item.slug}/arquivo/${item.arquivo_id}`,
        );
        expect(item.link_permanente, item.arquivo_id).toMatch(/^https:\/\//);
        for (const proibido of CAMPOS_PROIBIDOS) {
          expect(proibido in item, `${proibido} vazou`).toBe(false);
        }
      }

      // Um UUID por arquivo: sem isso a relação com a página não é determinística.
      expect(new Set(inventario.anexos.map((a) => a.arquivo_id)).size).toBe(
        107,
      );
      // Homologação nunca entra no inventário público.
      expect(
        inventario.anexos.some((a) => a.pagina_url.includes("homologacao")),
      ).toBe(false);

      // Cada pagina_url resolve para o arquivo certo do documento certo.
      const documentos = organizarDocumentosPublicos(
        await listarAnexosPublicos(),
      );
      for (const item of inventario.anexos) {
        expect(
          selecionarArquivoPublico(documentos, item.slug, item.arquivo_id),
          item.pagina_url,
        ).not.toBeNull();
      }
    },
  );

  test("PNG deixou de vazar o MIME cru, e os demais rótulos não mudaram", () => {
    expect(formatoPublico("image/png")).toBe("Imagem PNG");
    expect(formatoPublico("application/pdf")).toBe("PDF");
    expect(
      formatoPublico(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ),
    ).toBe("Planilha XLSX");
    expect(formatoPublico("text/markdown")).toBe("Markdown");
    expect(formatoPublico("image/webp")).toBe("Fotografia WebP");
    expect(formatoPublico("image/svg+xml")).toBe("Elemento gráfico SVG");
    expect(formatoPublico("audio/mp4")).toBe("Áudio M4A");
    expect(formatoPublico("audio/x-m4a")).toBe("Áudio M4A");
    expect(formatoPublico("audio/mpeg")).toBe("Áudio MP3");
  });

  test.skipIf(!process.env.DATABASE_URL)(
    "nenhum MIME publicado cai no fallback técnico",
    async () => {
      const anexos = await listarAnexosPublicos();
      for (const mime of new Set(anexos.map((a) => a.mimeType))) {
        expect(formatoPublico(mime), mime).not.toBe(mime);
      }
    },
  );
});
