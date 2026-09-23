import { createHash } from "node:crypto";
import { unzipSync } from "fflate";
import { Pool } from "pg";
import { describe, expect, test } from "vitest";

import { serializarAnexos } from "../src/app/anexos.json/route";
import {
  adaptarLinhasDaView,
  type LinhaAnexoPublico,
  selecionarAnexosPublicos,
} from "../src/dados/consultas/anexos";
import { gerarZipPublico } from "../src/lib/zip-publico";

describe.skipIf(!process.env.DATABASE_URL_MANUTENCAO)(
  "coleção canônica em banco e ZIP",
  () => {
    test("A02 e D01 projetam um anexo por original, sem derivado concorrente", async () => {
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL_MANUTENCAO,
      });
      try {
        const linhas = await pool.query<LinhaAnexoPublico>(`
          select ordem_anexo as "ordemAnexo", slug, titulo, tipo, resumo,
                 data_referencia as "dataReferencia", licenca,
                 link_permanente as "linkPermanente", link_origem as "linkOrigem",
                 mime_type as "mimeType", bytes, sha256,
                 publicado_em as "publicadoEm", espelhado, natureza, obrigatorio,
                 estado_documental as "estadoDocumental",
                 revisao_privacidade as "revisaoPrivacidade",
                 derivado_de_slug as "derivadoDeSlug", principal,
                 rotulo_arquivo as "rotuloArquivo",
                 arquivo_origem_id as "arquivoOrigemId",
                 arquivo_relacao as "arquivoRelacao",
                 arquivo_derivacao_metodo as "arquivoDerivacaoMetodo",
                 arquivo_id as "arquivoId"
            from vw_anexo_publico
           where slug in ('identidade-visual', 'relatorio-tecnico-recanto-da-serra')
        `);
        const evidencias = adaptarLinhasDaView(linhas.rows);
        const anexos = selecionarAnexosPublicos(evidencias);
        expect(
          anexos.filter((x) => x.slug === "identidade-visual"),
        ).toHaveLength(8);
        expect(
          anexos.filter((x) => x.slug === "relatorio-tecnico-recanto-da-serra"),
        ).toHaveLength(1);
        expect(serializarAnexos(anexos).total).toBe(9);

        const base = process.env.STORAGE_PUBLIC_URL?.replace(/\/+$/, "");
        if (!base) throw new Error("STORAGE_PUBLIC_URL ausente");
        const corpos = new Map<string, Buffer>();
        const artificiais = evidencias.map((e, indice) => {
          const bytes = Buffer.from(`teste ${indice}`);
          const chave = e.manifesto.url?.slice(base.length + 1);
          if (!chave) throw new Error("Chave ausente");
          corpos.set(chave, bytes);
          return {
            ...e,
            manifesto: {
              ...e.manifesto,
              sha256: createHash("sha256").update(bytes).digest("hex"),
            },
          };
        });
        let pacote: Buffer | null = null;
        const zip = await gerarZipPublico(
          artificiais,
          {
            baixar: async (chave) => {
              const bytes = corpos.get(chave);
              if (!bytes) throw new Error(`Chave ausente: ${chave}`);
              return bytes;
            },
            enviar: async (_chave, bytes) => {
              pacote = bytes;
            },
          },
          "prestacao-de-contas/anexos.zip",
          base,
        );
        expect(zip.estado).toBe("publicado");
        if (!pacote) throw new Error("ZIP ausente");
        expect(Object.keys(unzipSync(pacote)).length).toBe(9);
      } finally {
        await pool.end();
      }
    });

    test("uma réplica não pode apontar para si", async () => {
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL_MANUTENCAO,
      });
      const c = await pool.connect();
      try {
        await c.query("begin");
        const origem = (
          await c.query<{ id: string }>(
            `
          insert into arquivo (chave_storage,bucket,visibilidade,tipo_midia,
            mime_type,bytes,sha256,espelhado_em)
          values ('zz/origem.svg','bucket-teste','privado','imagem',
            'image/svg+xml',10,$1,now()) returning id`,
            ["f".repeat(64)],
          )
        ).rows[0];
        if (!origem) throw new Error("Origem ausente");
        await c.query("savepoint autorreferencia");
        await expect(
          c.query("update arquivo set replica_de_id=id where id=$1", [
            origem.id,
          ]),
        ).rejects.toMatchObject({
          constraint: "arquivo_replica_nao_reflexiva",
        });
        await c.query("rollback to savepoint autorreferencia");
      } finally {
        await c.query("rollback");
        c.release();
        await pool.end();
      }
    });
  },
);
