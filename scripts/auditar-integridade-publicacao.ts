/**
 * Reconciliação independente da publicação pública.
 *
 * Não importa nem chama os executores de publicação/correção. A expectativa
 * nasce do inventário derivado, do manifesto JSON de 2026-09-16 e do registro
 * declarativo da primeira publicação. Cada origem local é relida e hasheada.
 */

import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile, realpath, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { loadEnvFile } from "node:process";
import { promisify } from "node:util";
import { z } from "zod";

const executar = promisify(execFile);

const entradaSchema = z.object({
  codigo: z.string(),
  origem: z.string(),
  chave: z.string(),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  bytes: z.number().int().positive(),
  mimeType: z.string(),
  principal: z.boolean().optional(),
  derivadoDeChave: z.string().nullable().optional(),
  derivacaoMetodo: z.string().nullable().optional(),
});

type Entrada = z.infer<typeof entradaSchema>;

const linhaBancoSchema = z.object({
  documento_id: z.string(),
  slug: z.string(),
  titulo: z.string(),
  estado_documental: z.string(),
  arquivo_id: z.string(),
  chave_storage: z.string(),
  url_publica: z.string(),
  sha256: z.string(),
  bytes: z.coerce.number(),
  mime_type: z.string(),
  principal: z.boolean(),
  derivado_de_id: z.string().nullable(),
  derivacao_metodo: z.string().nullable(),
  replica_de_id: z.string().nullable(),
});

const documentoSchema = z.object({
  slug: z.string(),
  titulo: z.string(),
  estado_documental: z.string(),
  revisao_privacidade: z.string(),
  status: z.string(),
  publicado_em: z.coerce.string().nullable(),
});

const arquivoPrivadoSchema = z.object({
  arquivo_id: z.string(),
  chave_storage: z.string(),
  sha256: z.string(),
  documento_slug: z.string(),
  documento_titulo: z.string(),
  estado_documental: z.string(),
});

function lerCsv(texto: string): string[][] {
  const linhas: string[][] = [];
  let linha: string[] = [];
  let campo = "";
  let aspas = false;
  const entrada = texto.replace(/^\uFEFF/, "");
  for (let i = 0; i < entrada.length; i++) {
    const caractere = entrada[i];
    if (aspas) {
      if (caractere === '"' && entrada[i + 1] === '"') {
        campo += '"';
        i += 1;
      } else if (caractere === '"') {
        aspas = false;
      } else {
        campo += caractere;
      }
    } else if (caractere === '"') {
      aspas = true;
    } else if (caractere === ",") {
      linha.push(campo);
      campo = "";
    } else if (caractere === "\n") {
      linha.push(campo);
      linhas.push(linha);
      linha = [];
      campo = "";
    } else if (caractere !== "\r") {
      campo += caractere;
    }
  }
  if (campo || linha.length) {
    linha.push(campo);
    linhas.push(linha);
  }
  return linhas.filter((campos) => campos.some((valor) => valor.trim()));
}

function slugsDoInventario(csv: string): Map<string, string> {
  const linhas = lerCsv(csv);
  const cabecalho = linhas[0] ?? [];
  const indiceCodigo = cabecalho.indexOf("ID");
  const indiceSlug = cabecalho.indexOf("Slug proposto");
  if (indiceCodigo < 0 || indiceSlug < 0)
    throw new Error("Inventário sem ID ou Slug proposto.");
  const pares = linhas.slice(1).map((linha) => {
    const codigo = linha[indiceCodigo]?.trim();
    const slug = linha[indiceSlug]?.trim();
    if (!codigo || !slug) throw new Error("Inventário com código/slug vazio.");
    return [codigo, slug] as const;
  });
  if (pares.length !== 33)
    throw new Error(`Inventário com ${pares.length} linhas.`);
  return new Map(pares);
}

function entradasDaPrimeiraPublicacao(markdown: string): Entrada[] {
  const linhas = markdown.split(/\r?\n/);
  const entradas: Entrada[] = [];
  for (const linha of linhas) {
    if (!/^\| (A02|D01-0[1-7]) \|/.test(linha)) continue;
    const colunas = linha
      .split("|")
      .slice(1, -1)
      .map((valor) => valor.trim());
    const [
      codigoBruto,
      origemBruta,
      shaBruto,
      bytesBruto,
      mimeBruto,
      chaveBruta,
    ] = colunas;
    if (
      !codigoBruto ||
      !origemBruta ||
      !shaBruto ||
      !bytesBruto ||
      !mimeBruto ||
      !chaveBruta
    )
      throw new Error(`Linha incompleta na primeira publicação: ${linha}`);
    const codigo = codigoBruto.startsWith("D01") ? "D01" : codigoBruto;
    const limpar = (valor: string) => valor.replaceAll("`", "");
    entradas.push({
      codigo,
      origem: limpar(origemBruta),
      chave: limpar(chaveBruta),
      sha256: limpar(shaBruto),
      bytes: Number(limpar(bytesBruto).replaceAll(".", "")),
      mimeType: limpar(mimeBruto),
    });
  }
  return z.array(entradaSchema).length(8).parse(entradas);
}

function contarPorCodigo(entradas: readonly Entrada[]): Record<string, number> {
  return Object.fromEntries(
    [...new Set(entradas.map((entrada) => entrada.codigo))]
      .sort()
      .map((codigo) => [
        codigo,
        entradas.filter((entrada) => entrada.codigo === codigo).length,
      ]),
  );
}

function sha256(conteudo: Buffer): string {
  return createHash("sha256").update(conteudo).digest("hex");
}

async function principal(): Promise<void> {
  const validarUrls = process.argv.slice(2).includes("--validar-urls");
  if (existsSync(".env.local")) loadEnvFile(".env.local");
  const raiz = await realpath(
    z.string().min(1).parse(process.env.OBSERVATORIO_FONTES_DIR),
  );
  const urlBase = z
    .string()
    .url()
    .parse(process.env.STORAGE_PUBLIC_URL)
    .replace(/\/$/, "");

  const [{ stdout: csv }, manifestoBruto, primeiraPublicacao] =
    await Promise.all([
      executar("python", ["-B", "scripts/derivar-inventario.py", "--stdout"], {
        encoding: "utf8",
        maxBuffer: 4 * 1024 * 1024,
      }),
      readFile("src/dados/lote-publicacao-2026-09-16.json", "utf8"),
      readFile("docs/carga/DRY_RUN_PUBLICACAO_2026-09-07.md", "utf8"),
    ]);
  const manifestoB01 = z
    .array(
      z.object({
        arquivo: z.string(),
        derivado: z.boolean(),
        original: z.object({
          arquivo: z.string(),
          sha256: z.string(),
          duplicatas_byte_a_byte: z.array(z.string()),
        }),
      }),
    )
    .length(59)
    .parse(
      JSON.parse(
        await readFile(
          join(raiz, "derivados-publicos/B01/manifesto-b01.json"),
          "utf8",
        ),
      ),
    );
  const slugs = slugsDoInventario(csv);
  const loteNovo = z
    .array(entradaSchema)
    .length(101)
    .parse(JSON.parse(manifestoBruto));
  const esperados = [
    ...entradasDaPrimeiraPublicacao(primeiraPublicacao),
    ...loteNovo,
  ];
  if (esperados.length !== 109)
    throw new Error("Expectativa não soma 109 objetos.");

  const chaves = new Set<string>();
  const hashesLocais: Array<{
    chave: string;
    conforme: boolean;
    ausente: boolean;
  }> = [];
  for (const entrada of esperados) {
    if (chaves.has(entrada.chave))
      throw new Error(`Chave repetida: ${entrada.chave}`);
    chaves.add(entrada.chave);
    try {
      const conteudo = await readFile(join(raiz, entrada.origem));
      hashesLocais.push({
        chave: entrada.chave,
        conforme:
          conteudo.byteLength === entrada.bytes &&
          sha256(conteudo) === entrada.sha256,
        ausente: false,
      });
    } catch (erro) {
      if ((erro as NodeJS.ErrnoException).code !== "ENOENT") throw erro;
      hashesLocais.push({
        chave: entrada.chave,
        conforme: false,
        ausente: true,
      });
    }
  }

  const { poolManutencao, encerrarManutencao } = await import(
    "../src/dados/clienteManutencao"
  );
  try {
    const banco = z.array(linhaBancoSchema).parse(
      (
        await poolManutencao.query(
          `select d.id::text documento_id, d.slug::text slug, d.titulo,
                  d.estado_documental::text, a.id::text arquivo_id,
                  a.chave_storage, a.url_publica, a.sha256, a.bytes,
                  a.mime_type, da.principal, a.derivado_de_id::text,
                  a.derivacao_metodo::text, a.replica_de_id::text
             from vw_anexo_publico v
             join documento d on d.slug = v.slug
             join documento_arquivo da on da.documento_id = d.id
             join arquivo a on a.id = da.arquivo_id and a.url_publica = v.link_permanente
            order by d.ordem_anexo nulls last, a.chave_storage`,
        )
      ).rows,
    );
    const documentos = z.array(documentoSchema).parse(
      (
        await poolManutencao.query(
          `select slug::text, titulo, estado_documental::text,
                  revisao_privacidade::text, status::text,
                  publicado_em::text
             from documento order by ordem_anexo`,
        )
      ).rows,
    );
    const pendencias = Number(
      (
        await poolManutencao.query(
          "select count(*)::int n from vw_pendencia_publicacao",
        )
      ).rows[0]?.n ?? -1,
    );
    const contagensBanco = (
      await poolManutencao.query(
        `select
           (select count(*)::int from documento) documento,
           (select count(*)::int from arquivo) arquivo,
           (select count(*)::int from documento_arquivo) documento_arquivo,
           (select count(*)::int from vw_anexo_publico) vw_anexo_publico,
           (select count(*)::int from documento where estado_documental = 'PUBLICAVEL') publicaveis`,
      )
    ).rows[0] as Record<string, unknown> | undefined;
    const arquivosPrivados = z.array(arquivoPrivadoSchema).parse(
      (
        await poolManutencao.query(
          `select a.id::text arquivo_id, a.chave_storage, a.sha256,
                  d.slug::text documento_slug, d.titulo documento_titulo,
                  d.estado_documental::text
             from arquivo a
             join documento_arquivo da on da.arquivo_id = a.id
             join documento d on d.id = da.documento_id
            where a.visibilidade = 'privado'
            order by d.ordem_anexo, a.chave_storage`,
        )
      ).rows,
    );

    const porChave = new Map(
      banco.map((linha) => [linha.chave_storage, linha]),
    );
    const detalhes = esperados.map((esperado) => {
      const real = porChave.get(esperado.chave);
      const slugEsperado = slugs.get(esperado.codigo);
      const urlEsperada = `${urlBase}/${esperado.chave}`;
      const problemas: string[] = [];
      if (!real) problemas.push("ausente_no_banco");
      if (!slugEsperado) problemas.push("codigo_sem_slug_no_inventario");
      if (real && real.slug !== slugEsperado)
        problemas.push("documento_errado");
      if (real && real.sha256 !== esperado.sha256) problemas.push("sha256");
      if (real && real.bytes !== esperado.bytes) problemas.push("bytes");
      if (real && real.mime_type !== esperado.mimeType) problemas.push("mime");
      if (real && real.url_publica !== urlEsperada) problemas.push("url");
      if (
        real &&
        esperado.principal !== undefined &&
        real.principal !== esperado.principal
      )
        problemas.push("principal");
      if (real && esperado.derivadoDeChave) {
        const origem = porChave.get(esperado.derivadoDeChave);
        if (!origem) problemas.push("origem_derivacao_ausente");
        if (origem && real.derivado_de_id !== origem.arquivo_id)
          problemas.push("derivado_de_id");
        if (real.derivacao_metodo !== esperado.derivacaoMetodo)
          problemas.push("derivacao_metodo");
      }
      return {
        fonte_original: esperado.origem,
        codigo_documental: esperado.codigo,
        slug_esperado: slugEsperado ?? null,
        documento_id_real: real?.documento_id ?? null,
        arquivo_id_real: real?.arquivo_id ?? null,
        documento_arquivo: real
          ? {
              documento_id: real.documento_id,
              arquivo_id: real.arquivo_id,
              principal: real.principal,
            }
          : null,
        url_publica: real?.url_publica ?? null,
        sha256: real?.sha256 ?? null,
        mime: real?.mime_type ?? null,
        bytes: real?.bytes ?? null,
        problemas,
      };
    });
    const extras = banco.filter((linha) => !chaves.has(linha.chave_storage));
    const contagemEsperada = contarPorCodigo(esperados);
    const contagemReal = Object.fromEntries(
      Object.entries(contagemEsperada).map(([codigo]) => {
        const slug = slugs.get(codigo);
        return [codigo, banco.filter((linha) => linha.slug === slug).length];
      }),
    );
    const privados = documentos.filter(
      (documento) => documento.estado_documental !== "PUBLICAVEL",
    );
    const validacaoUrls: Array<{ chave: string; problemas: string[] }> = [];
    if (validarUrls) {
      for (const esperado of esperados) {
        const real = porChave.get(esperado.chave);
        const problemas: string[] = [];
        if (!real) {
          problemas.push("ausente_no_banco");
        } else {
          const resposta = await fetch(real.url_publica, { redirect: "error" });
          if (resposta.status !== 200)
            problemas.push(`http_${resposta.status}`);
          const conteudo = Buffer.from(await resposta.arrayBuffer());
          const tipo = resposta.headers
            .get("content-type")
            ?.split(";")[0]
            ?.trim();
          if (sha256(conteudo) !== esperado.sha256) problemas.push("sha256");
          if (conteudo.byteLength !== esperado.bytes) problemas.push("bytes");
          if (tipo !== esperado.mimeType) problemas.push("content-type");
          if (resposta.headers.get("cache-control") !== "public, max-age=86400")
            problemas.push("cache-control");
          const host = new URL(real.url_publica).hostname;
          if (
            host.endsWith("r2.dev") ||
            host.includes("r2.cloudflarestorage.com")
          )
            problemas.push("host_storage_direto");
        }
        validacaoUrls.push({ chave: esperado.chave, problemas });
      }
    }
    const relatorio = {
      gerado_em: new Date().toISOString(),
      metodo:
        "inventário CSV + manifestos declarativos + hash local + consulta relacional por slug/chave; sem importar executores",
      totais: {
        esperados: esperados.length,
        reais: banco.length,
        divergencias: detalhes.filter((item) => item.problemas.length).length,
        extras: extras.length,
        hashes_locais_divergentes: hashesLocais.filter(
          (item) => !item.conforme && !item.ausente,
        ).length,
        fontes_locais_ausentes: hashesLocais.filter((item) => item.ausente)
          .length,
        vw_pendencia_publicacao: pendencias,
      },
      banco: {
        documento: Number(contagensBanco?.documento ?? -1),
        arquivo: Number(contagensBanco?.arquivo ?? -1),
        documento_arquivo: Number(contagensBanco?.documento_arquivo ?? -1),
        vw_anexo_publico: Number(contagensBanco?.vw_anexo_publico ?? -1),
        documentos_publicaveis: Number(contagensBanco?.publicaveis ?? -1),
        arquivos_privados: arquivosPrivados.length,
      },
      contagem_por_documento: Object.keys(contagemEsperada)
        .sort()
        .map((codigo) => ({
          codigo,
          slug: slugs.get(codigo) ?? null,
          descricao:
            banco.find((linha) => linha.slug === slugs.get(codigo))?.titulo ??
            null,
          esperados: contagemEsperada[codigo] ?? 0,
          reais: contagemReal[codigo] ?? 0,
          diferenca:
            (contagemReal[codigo] ?? 0) - (contagemEsperada[codigo] ?? 0),
        })),
      documentos_nao_publicaveis: privados,
      arquivos_privados: arquivosPrivados,
      proveniencia_b01: {
        arquivos_encontrados:
          manifestoB01.length +
          manifestoB01.reduce(
            (total, item) =>
              total + item.original.duplicatas_byte_a_byte.length,
            0,
          ),
        conteudos_unicos: manifestoB01.length,
        derivados_webp: manifestoB01.filter((item) => item.derivado).length,
        derivados_com_pai_no_banco: banco.filter(
          (item) =>
            item.slug === slugs.get("B01") && item.derivado_de_id !== null,
        ).length,
        grupos_duplicados: manifestoB01
          .filter((item) => item.original.duplicatas_byte_a_byte.length)
          .map((item) => ({
            sha256: item.original.sha256,
            canonico: item.original.arquivo,
            duplicatas: item.original.duplicatas_byte_a_byte,
          })),
      },
      extras_publicos: extras,
      validacao_urls_anonimas: validarUrls
        ? {
            total: validacaoUrls.length,
            conformes: validacaoUrls.filter(
              (item) => item.problemas.length === 0,
            ).length,
            divergencias: validacaoUrls.filter(
              (item) => item.problemas.length > 0,
            ),
          }
        : null,
      objetos: detalhes,
    };
    const saida = resolve(
      "docs/carga/RECONCILIACAO_INDEPENDENTE_2026-09-16.json",
    );
    await writeFile(saida, `${JSON.stringify(relatorio, null, 2)}\n`, "utf8");
    console.log(JSON.stringify(relatorio.totais));
    for (const linha of relatorio.contagem_por_documento)
      console.log(
        `${linha.codigo}\t${linha.esperados}\t${linha.reais}\t${linha.diferenca}\t${linha.slug}`,
      );
    console.log(`arquivos_privados=${arquivosPrivados.length}`);
  } finally {
    await encerrarManutencao();
  }
}

principal().catch((erro: unknown) => {
  console.error(erro instanceof Error ? erro.message : erro);
  process.exitCode = 1;
});
