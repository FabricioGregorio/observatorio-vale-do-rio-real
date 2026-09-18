import { createHash } from "node:crypto";
import { unzipSync } from "fflate";
import { Pool, type PoolClient } from "pg";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { serializarAnexos } from "../src/app/anexos.json/route";
import { TabelaAnexos } from "../src/componentes/acervo/TabelaAnexos";
import {
  adaptarLinhasDaView,
  type LinhaAnexoPublico,
  selecionarAnexosPublicos,
} from "../src/dados/consultas/anexos";
import { manifestoPublico } from "../src/lib/manifesto-evidencias";
import { gerarZipPublico } from "../src/lib/zip-publico";

const urlManutencao = process.env.DATABASE_URL_MANUTENCAO;
const bucketPublico = process.env.STORAGE_PUBLIC_BUCKET;
const urlPublica = process.env.STORAGE_PUBLIC_URL?.replace(/\/+$/, "");

const A02_ORIGINAL =
  "18b7bbb11b6157af525c7e1c88b7e385763dadc094bb60fdf6f3a27d9c2aff91";
const A02_PUBLICO =
  "b314cd7a5330276ecccc0c7cfe7dfe6461da721055318c15957db5cd7848961a";
const D01_08 =
  "3721a0e64c4ecf3e928206e5f9f9c1042303c2c5e9f205e38e9b095f85dcfdfe";

const candidatosD01 = [
  [
    "30e62b84e725fd2cace825a6805a094481272b315e5d85187aa5614382016337",
    "b8842594544c579a9fc508a912b9a913030013eb6de16704a007c7fefcc323f5",
    "d01-01-logo-oficial-tobias-sou-eu-publico-v1.png",
    257102,
    "derivado",
  ],
  [
    "14e3b886621e0d493e808dfd28e46c3886743997b30b06f7d09ea3940a5a59a2",
    "882810f458c2bb92d51c24dad691bb2553d0373125e70884e25856571ca2f551",
    "d01-02-logo-publico-v1.pdf",
    12943416,
    "derivado",
  ],
  [
    "efd532d88beeccce71a3e92c6705b582676f2965d90fb7599fde9383381ef940",
    "a52ccb2202f19b93e383e22295ff68e781ba3dbb5403983168c40b47c332659e",
    "d01-03-horizontal-monocromatica-escura-publico-v1.png",
    129763,
    "derivado",
  ],
  [
    "8bda07efbe684aaae64cb28ff3b69b10cb572058aa9c4dfb04dbb670c6cef1dc",
    "8bda07efbe684aaae64cb28ff3b69b10cb572058aa9c4dfb04dbb670c6cef1dc",
    "d01-04-horizontal-monocromatica-escura-v1.svg",
    31520,
    "replica",
  ],
  [
    "6b230265d3c50b864bed83c5d3e7ddd02bd01998a92de818fefae487afc2571b",
    "ec8c13aee802c5baaac15a11a5c8813ff5cb6733107bcae6c9c82dd79b6426a4",
    "d01-05-icon-publico-v1.png",
    100975,
    "derivado",
  ],
  [
    "f19d71e2ed22bfc1aac44be4760a07517d1f88cb2186cf6b59cdcbfa97d11883",
    "f19d71e2ed22bfc1aac44be4760a07517d1f88cb2186cf6b59cdcbfa97d11883",
    "d01-06-icon-v1.svg",
    704574,
    "replica",
  ],
  [
    "d98a0eff2803f1819c8ab28cdd8ee61589ceba1f3ad97fe7d2911897e11f5116",
    "9af5c7b249456496cf0a6a66a67a4262c1959be04eed93f9197ec02fc9e25846",
    "d01-07-logo-e-texto-publico-v1.png",
    400824,
    "derivado",
  ],
] as const;

async function comRollback<T>(acao: (cliente: PoolClient) => Promise<T>) {
  if (!urlManutencao) throw new Error("DATABASE_URL_MANUTENCAO ausente.");
  const pool = new Pool({ connectionString: urlManutencao });
  const cliente = await pool.connect();
  try {
    await cliente.query("begin");
    return await acao(cliente);
  } finally {
    await cliente.query("rollback");
    cliente.release();
    await pool.end();
  }
}

async function inserirCandidato(
  cliente: PoolClient,
  origemSha: string,
  destinoSha: string,
  nome: string,
  bytes: number,
  relacao: "derivado" | "replica",
) {
  const origem = await cliente.query<{ id: string }>(
    "select id from arquivo where sha256 = $1",
    [origemSha],
  );
  const origemId = origem.rows[0]?.id;
  if (!origemId) throw new Error(`Origem ausente: ${origemSha}`);
  const chave = `arquivos/teste-publicacao/${nome}`;
  return cliente.query<{ id: string }>(
    `insert into arquivo (
       chave_storage, bucket, visibilidade, url_publica, nome_original,
       tipo_midia, mime_type, bytes, sha256, origem_url, origem_sistema,
       espelhado_em, derivado_de_id, replica_de_id, derivacao_metodo,
       derivacao_em
     )
     select $1, $2, 'publico', $3, $4, tipo_midia, mime_type, $5, $6,
            origem_url, origem_sistema, now(),
            case when $7 = 'derivado' then id else null end,
            case when $7 = 'replica' then id else null end,
            case when $7 = 'derivado'
              then 'sanitizacao_metadados'::metodo_derivacao else null end,
            case when $7 = 'derivado' then now() else null end
       from arquivo where id = $8
     returning id`,
    [
      chave,
      bucketPublico,
      `${urlPublica}/${chave}`,
      nome,
      bytes,
      destinoSha,
      relacao,
      origemId,
    ],
  );
}

async function linhasPublicas(cliente: PoolClient) {
  return cliente.query<LinhaAnexoPublico>(`
    select ordem_anexo as "ordemAnexo", slug, titulo, tipo, resumo,
           data_referencia as "dataReferencia", licenca,
           link_permanente as "linkPermanente",
           link_origem as "linkOrigem", mime_type as "mimeType", bytes,
           sha256, publicado_em as "publicadoEm", espelhado, natureza,
           obrigatorio, estado_documental as "estadoDocumental",
           revisao_privacidade as "revisaoPrivacidade",
           derivado_de_slug as "derivadoDeSlug", principal,
           rotulo_arquivo as "rotuloArquivo",
           arquivo_origem_id as "arquivoOrigemId",
           arquivo_relacao as "arquivoRelacao",
           arquivo_derivacao_metodo as "arquivoDerivacaoMetodo",
           arquivo_id as "arquivoId"
      from vw_anexo_publico
     where slug in ('identidade-visual', 'relatorio-tecnico-recanto-da-serra')
     order by slug, link_permanente
  `);
}

describe.skipIf(!urlManutencao || !bucketPublico || !urlPublica)(
  "publicação multiarquivo integrada em rollback",
  () => {
    test("localização física e proveniência mantêm as invariantes", async () => {
      await comRollback(async (cliente) => {
        const chave = "zz/mesma-chave.svg";
        const hash = "f".repeat(64);
        const origem = await cliente.query<{ id: string }>(
          `insert into arquivo
             (chave_storage, bucket, visibilidade, url_publica, tipo_midia,
              mime_type, bytes, sha256, espelhado_em)
           values ($1, 'bucket-privado-teste', 'privado', null, 'imagem',
                   'image/svg+xml', 10, $2, now()) returning id`,
          [chave, hash],
        );
        await cliente.query(
          `insert into arquivo
             (chave_storage, bucket, visibilidade, url_publica, tipo_midia,
              mime_type, bytes, sha256, espelhado_em, replica_de_id)
           values ($1, 'bucket-publico-teste', 'publico', $2, 'imagem',
                   'image/svg+xml', 10, $3, now(), $4)`,
          [
            chave,
            "https://exemplo.invalid/replica.svg",
            hash,
            origem.rows[0]?.id,
          ],
        );

        await cliente.query("savepoint chave_duplicada");
        let constraint = "";
        try {
          await cliente.query(
            `insert into arquivo
               (chave_storage, bucket, visibilidade, url_publica, tipo_midia,
                mime_type, bytes, sha256, espelhado_em)
             values ($1, 'bucket-publico-teste', 'publico', $2, 'imagem',
                     'image/svg+xml', 10, $3, now())`,
            [chave, "https://exemplo.invalid/duplicada.svg", hash],
          );
        } catch (erro) {
          constraint = (erro as { constraint?: string }).constraint ?? "";
          await cliente.query("rollback to savepoint chave_duplicada");
        }
        expect(constraint).toBe("arquivo_bucket_chave_key");

        await cliente.query("savepoint replica_reflexiva");
        let autorreferencia = "";
        try {
          await cliente.query(
            "update arquivo set replica_de_id = id where id = $1",
            [origem.rows[0]?.id],
          );
        } catch (erro) {
          autorreferencia = (erro as { constraint?: string }).constraint ?? "";
          await cliente.query("rollback to savepoint replica_reflexiva");
        }
        expect(autorreferencia).toBe("arquivo_replica_nao_reflexiva");
      });
    });

    test("A02=1, D01=7 e todos os consumidores recebem os mesmos 8", async () => {
      await comRollback(async (cliente) => {
        // O banco real já contém a primeira publicação e a de 2026-09-16.
        // Para continuar exercitando o caminho completo de inserção,
        // reconstituímos o estado anterior às duas somente nesta transação,
        // sempre desfeita. O vínculo sai antes do arquivo porque
        // `documento_arquivo` referencia `arquivo` com ON DELETE RESTRICT.
        await cliente.query(`
          delete from documento_arquivo da
           using arquivo a
           where da.arquivo_id = a.id and a.visibilidade = 'publico'
        `);
        await cliente.query(`
          update documento
             set estado_documental = 'PENDENTE',
                 status = 'rascunho',
                 publicado_em = null
        `);
        await cliente.query(
          `
          delete from arquivo
           where visibilidade = 'publico'
             and bucket = $1
             and chave_storage like 'arquivos/%'
        `,
          [bucketPublico],
        );
        await cliente.query(
          `update documento
              set estado_documental='PUBLICAVEL', status='publicado',
                  publicado_em=coalesce(publicado_em, now())
            where slug in ('identidade-visual', 'relatorio-tecnico-recanto-da-serra')`,
        );
        const d01 = await cliente.query<{ id: string }>(
          "select id from documento where slug='identidade-visual'",
        );
        const a02 = await cliente.query<{ id: string }>(
          "select id from documento where slug='relatorio-tecnico-recanto-da-serra'",
        );
        const idsD01: string[] = [];
        for (const [origem, destino, nome, bytes, relacao] of candidatosD01) {
          const arquivo = await inserirCandidato(
            cliente,
            origem,
            destino,
            nome,
            bytes,
            relacao,
          );
          const id = arquivo.rows[0]?.id;
          if (!id) throw new Error(`Candidato sem id: ${nome}`);
          idsD01.push(id);
          await cliente.query(
            `insert into documento_arquivo
               (documento_id, arquivo_id, versao, rotulo, principal)
             values ($1, $2, 1, $3, false)`,
            [d01.rows[0]?.id, id, nome],
          );
        }

        const a02Arquivo = await inserirCandidato(
          cliente,
          A02_ORIGINAL,
          A02_PUBLICO,
          "a02-relatorio-tecnico-recanto-da-serra-publico-v1.pdf",
          756239,
          "derivado",
        );
        await cliente.query(
          `update arquivo set derivacao_metodo='tarjamento_privacidade'
            where id=$1`,
          [a02Arquivo.rows[0]?.id],
        );
        await cliente.query(
          `insert into documento_arquivo
             (documento_id, arquivo_id, versao, rotulo, principal)
           values ($1, $2, 1, 'Versão pública redigida', false)`,
          [a02.rows[0]?.id, a02Arquivo.rows[0]?.id],
        );

        let linhas = await linhasPublicas(cliente);
        expect(linhas.rows).toHaveLength(8);
        expect(
          linhas.rows.filter((l) => l.slug === "identidade-visual"),
        ).toHaveLength(7);
        expect(
          linhas.rows.filter(
            (l) => l.slug === "relatorio-tecnico-recanto-da-serra",
          ),
        ).toHaveLength(1);
        expect(linhas.rows.some((l) => l.sha256 === D01_08)).toBe(false);
        expect(linhas.rows.some((l) => l.sha256 === A02_ORIGINAL)).toBe(false);

        await cliente.query(
          "update documento_arquivo set principal=true where documento_id=$1 and arquivo_id=$2",
          [d01.rows[0]?.id, idsD01[0]],
        );
        linhas = await linhasPublicas(cliente);
        expect(linhas.rows).toHaveLength(8);

        const evidencias = adaptarLinhasDaView(linhas.rows);
        expect(
          manifestoPublico(evidencias.map((e) => e.manifesto)),
        ).toHaveLength(8);
        const anexos = selecionarAnexosPublicos(evidencias);
        expect(serializarAnexos(anexos).total).toBe(8);
        const sala = renderToStaticMarkup(
          createElement(TabelaAnexos, { anexos }),
        );
        expect((sala.match(/>Baixar<\/a>/g) ?? []).length).toBe(8);

        const corpos = new Map<string, Buffer>();
        const evidenciasZip = evidencias.map((e, indice) => {
          const corpo = Buffer.from(`conteúdo público ${indice}`);
          const sha256 = createHash("sha256").update(corpo).digest("hex");
          const chave = e.manifesto.url?.slice(
            (urlPublica as string).length + 1,
          );
          if (!chave) throw new Error("Chave pública ausente no teste.");
          corpos.set(chave, corpo);
          return {
            ...e,
            manifesto: { ...e.manifesto, sha256 },
            anexo: { ...e.anexo, sha256 },
          };
        });
        let pacote: Buffer | null = null;
        const zip = await gerarZipPublico(
          evidenciasZip,
          {
            baixar: async (chave) => {
              const corpo = corpos.get(chave);
              if (!corpo) throw new Error(`Corpo ausente: ${chave}`);
              return corpo;
            },
            enviar: async (_chave, corpo) => {
              pacote = corpo;
            },
          },
          "prestacao-de-contas/anexos.zip",
          urlPublica as string,
        );
        expect(zip.estado).toBe("publicado");
        if (!pacote) throw new Error("ZIP não produzido em memória.");
        expect(Object.keys(unzipSync(pacote)).length).toBe(8);
      });
    });
  },
);
