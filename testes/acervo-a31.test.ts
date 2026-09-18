import { Pool } from "pg";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import PaginaArquivo from "../src/app/acervo/[documento]/arquivo/[arquivoId]/page";
import sitemap from "../src/app/sitemap";
import {
  organizarDocumentosPublicos,
  selecionarArquivoPublico,
  validarAcervoPublico,
} from "../src/dados/consultas/acervo";
import { listarAnexosPublicos } from "../src/dados/consultas/anexos";
import {
  gruposB01NaOrdemTerritorial,
  mapaB01,
  reconciliarMapaB01,
} from "../src/dados/editorial/mapa-b01";
import { IDS_DOS_LUGARES } from "../src/dados/territorio/referencias";

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
    "reconcilia 109 objetos, 16 documentos e B01 58 WebP + 1 SVG",
    async () => {
      const anexos = await listarAnexosPublicos();
      expect(validarAcervoPublico(anexos)).toHaveLength(16);
      const b01 = reconciliarMapaB01(anexos);
      expect([b01.publicos.length, b01.webp, b01.svg]).toEqual([59, 58, 1]);
      expect(
        organizarDocumentosPublicos(anexos).flatMap((d) => d.arquivos),
      ).toHaveLength(109);
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
      expect(urls.filter((url) => url.includes("/acervo/"))).toHaveLength(125);
      expect(urls.every((url) => !url.includes("?"))).toBe(true);
    },
  );

  test.skipIf(!process.env.DATABASE_URL_MIGRACAO)(
    "view nova expõe somente UUIDs públicos e preserva 109 linhas",
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
          total: 109,
          sem_id: 0,
          fora_gate: 0,
        });
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
