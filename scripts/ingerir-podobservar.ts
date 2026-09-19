/**
 * Ingestão privada dos masters do PodObservar e criação dos episódios — P0.2B2.
 *
 * O que este script faz, nesta ordem:
 *
 * 1. confere que cada master no disco tem o SHA-256 do plano — divergência é
 *    bloqueador, não aviso;
 * 2. extrai e limpa a transcrição candidata de cada PDF;
 * 3. envia cada master ao bucket **privado**, por streaming e multipart;
 * 4. registra um `arquivo` privado por master;
 * 5. cria a temporada 1 e os três episódios em `rascunho`.
 *
 * O que ele **não** faz, por decisão de arquitetura (ADR-021):
 *
 * - não publica episódio (`status` fica em `rascunho`);
 * - não cria `documento_arquivo` — master de podcast não pertence ao acervo;
 * - não gera `url_publica`, URL assinada ou qualquer endereço público;
 * - não toca os originais em `OBSERVATORIO_FONTES_DIR`.
 *
 * Idempotente: reexecutar não duplica objeto nem linha. Master já ingerido com
 * o mesmo SHA-256 é reconhecido e pulado; master existente com outro conteúdo
 * **para a execução** em vez de sobrescrever.
 *
 * Uso:
 *   pnpm tsx scripts/ingerir-podobservar.ts --conferir   (só audita, não escreve)
 *   pnpm tsx scripts/ingerir-podobservar.ts --executar
 */
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Pool, type PoolClient } from "pg";

import {
  EPISODIOS_TEMPORADA_1,
  type EpisodioPlanejado,
  TEMPORADA_1,
} from "../src/dados/podobservar-temporada-1";
import {
  conferirEnvio,
  decidirIngestao,
  podeCompensar,
} from "../src/lib/ingestao-master";
import {
  descreverObjetoPrivado,
  enviarMasterPrivado,
  hashDeArquivo,
} from "../src/lib/storage-privado-grande";
import {
  contemMarcacaoInterna,
  limparTranscricao,
  preservouConteudo,
  type RemocaoEditorial,
} from "../src/lib/transcricao-podobservar";

class Bloqueador extends Error {}

function exigir(nome: string): string {
  const v = process.env[nome]?.trim();
  if (!v) throw new Bloqueador(`${nome} ausente. Consulte .env.example.`);
  return v;
}

function log(...partes: unknown[]): void {
  console.log("[podobservar]", ...partes);
}

/** Texto bruto do PDF, com layout preservado. O original não é tocado. */
function extrairPdf(caminhoPdf: string): string {
  const destino = join(
    mkdtempSync(join(tmpdir(), "podobservar-")),
    "transcricao.txt",
  );
  try {
    execFileSync("pdftotext", [
      "-layout",
      "-enc",
      "UTF-8",
      caminhoPdf,
      destino,
    ]);
  } catch {
    throw new Bloqueador(
      "pdftotext não disponível. É o extrator usado na auditoria da P0.2B1; " +
        "trocar de extrator mudaria o texto e exigiria nova revisão editorial.",
    );
  }
  return readFileSync(destino, "utf8");
}

type TranscricaoPreparada = {
  texto: string;
  remocoes: RemocaoEditorial[];
  palavras: number;
};

function prepararTranscricao(
  raiz: string,
  ep: EpisodioPlanejado,
): TranscricaoPreparada {
  const caminho = resolve(raiz, ep.transcricaoPdf);
  if (!existsSync(caminho))
    throw new Bloqueador(`Transcrição ausente: ${ep.transcricaoPdf}`);

  const bruto = extrairPdf(caminho);
  const { texto, remocoes, total } = limparTranscricao(bruto);

  if (contemMarcacaoInterna(texto))
    throw new Bloqueador(`Marcação interna sobrevivente em ${ep.slug}.`);
  if (!preservouConteudo(bruto, texto))
    throw new Bloqueador(
      `Limpeza alterou conteúdo em ${ep.slug}; nenhuma fala pode mudar.`,
    );
  if (texto.trim().length === 0)
    throw new Bloqueador(`Transcrição vazia em ${ep.slug}.`);

  log(
    `  transcrição ${ep.slug}: ${texto.length} caracteres, ${total} marcação(ões) interna(s) removida(s)`,
  );
  for (const r of remocoes) log(`    − ${r.marcacao} ×${r.ocorrencias}`);

  return {
    texto,
    remocoes,
    palavras: texto.split(/\s+/).filter(Boolean).length,
  };
}

/** Confere o binário local contra o plano antes de qualquer rede. */
async function conferirMaster(
  raiz: string,
  ep: EpisodioPlanejado,
): Promise<string> {
  const caminho = resolve(raiz, ep.master.origem);
  if (!existsSync(caminho))
    throw new Bloqueador(`Master ausente: ${ep.master.origem}`);

  const bytes = statSync(caminho).size;
  if (bytes !== ep.master.bytes)
    throw new Bloqueador(
      `BLOQUEADOR — ${ep.master.origem}: ${bytes} bytes no disco, ${ep.master.bytes} no plano.`,
    );

  const sha = await hashDeArquivo(caminho);
  if (sha !== ep.master.sha256)
    throw new Bloqueador(
      `BLOQUEADOR — ${ep.master.origem}: SHA-256 divergente do plano auditado.`,
    );

  log(`  master ${ep.master.nomeOriginal}: ${bytes} bytes, SHA-256 confere`);
  return caminho;
}

/**
 * Sobe o master e registra o `arquivo`, com compensação.
 *
 * Só remove do bucket o que esta execução criou: objeto preexistente não é
 * nosso para apagar, mesmo que o registro no banco falhe.
 */
async function ingerirMaster(
  pool: Pool,
  ep: EpisodioPlanejado,
  caminhoLocal: string,
  bucket: string,
): Promise<string> {
  const { chave, sha256, bytes, mimeType, duracaoSeg, nomeOriginal } =
    ep.master;

  const jaRegistrado = await pool.query<{ id: string; sha256: string }>(
    `select id, sha256 from arquivo where bucket = $1 and chave_storage = $2`,
    [bucket, chave],
  );
  const existente = jaRegistrado.rows[0];
  if (existente) {
    if (existente.sha256 !== sha256)
      throw new Bloqueador(
        `${chave} já registrado no banco com outro SHA-256. Decisão humana.`,
      );
    log(`  arquivo já registrado: ${chave}`);
    return existente.id;
  }

  const remoto = await descreverObjetoPrivado(chave);
  const decisao = decidirIngestao(ep.master, remoto);
  if (decisao.acao === "parar") throw new Bloqueador(decisao.motivo);

  const execucao = randomUUID();
  let criadoAgora = false;

  if (decisao.acao === "enviar") {
    log(`  enviando ${chave} (${(bytes / 1024 ** 2).toFixed(0)} MiB)…`);
    let ultimo = 0;
    await enviarMasterPrivado(
      chave,
      caminhoLocal,
      mimeType,
      sha256,
      execucao,
      (enviados) => {
        const pct = Math.floor((enviados / bytes) * 100);
        if (pct >= ultimo + 20) {
          ultimo = pct;
          log(`    ${pct}%`);
        }
      },
    );
    criadoAgora = true;

    const confirmado = await descreverObjetoPrivado(chave);
    const prova = conferirEnvio(ep.master, confirmado, execucao);
    if (!prova.ok) throw new Bloqueador(prova.motivo);
    log(`  envio confirmado por HeadObject: ${chave}`);
  } else {
    log(`  objeto já presente e equivalente: ${chave}`);
  }

  const cliente = await pool.connect();
  try {
    await cliente.query("begin");
    const { rows } = await cliente.query<{ id: string }>(
      `insert into arquivo (chave_storage, bucket, visibilidade, url_publica,
                            nome_original, tipo_midia, mime_type, bytes,
                            sha256, duracao_seg, origem_sistema, espelhado_em)
       values ($1, $2, 'privado', null, $3, 'audio', $4, $5, $6, $7,
               'upload', now())
       returning id`,
      [chave, bucket, nomeOriginal, mimeType, bytes, sha256, duracaoSeg],
    );
    await cliente.query("commit");
    const id = rows[0]?.id;
    if (!id) throw new Bloqueador(`arquivo não registrado: ${chave}`);
    log(`  arquivo registrado: ${id}`);
    return id;
  } catch (erro) {
    await cliente.query("rollback").catch(() => {});
    if (criadoAgora) {
      const atual = await descreverObjetoPrivado(chave).catch(() => null);
      if (podeCompensar(atual, execucao)) {
        log(
          `  compensando: objeto ${chave} criado nesta execução será mantido`,
        );
        log("  PARAR: remover manualmente após conferência, ou reexecutar.");
      }
    }
    throw erro;
  } finally {
    cliente.release();
  }
}

async function criarTemporada(cliente: PoolClient): Promise<string> {
  const existente = await cliente.query<{ id: string }>(
    `select id from temporada where numero = $1`,
    [TEMPORADA_1.numero],
  );
  const id = existente.rows[0]?.id;
  if (id) {
    log(`temporada ${TEMPORADA_1.numero} já existe: ${id}`);
    return id;
  }
  const { rows } = await cliente.query<{ id: string }>(
    `insert into temporada (numero, titulo, ano, descricao, capa_id)
     values ($1, $2, $3, null, null) returning id`,
    [TEMPORADA_1.numero, TEMPORADA_1.titulo, TEMPORADA_1.ano],
  );
  const novo = rows[0]?.id;
  if (!novo) throw new Bloqueador("temporada não criada");
  log(`temporada ${TEMPORADA_1.numero} criada: ${novo}`);
  return novo;
}

async function criarEpisodio(
  cliente: PoolClient,
  temporadaId: string,
  ep: EpisodioPlanejado,
  audioId: string,
  transcricao: string,
): Promise<void> {
  const existente = await cliente.query(
    `select 1 from episodio where slug = $1`,
    [ep.slug],
  );
  if (existente.rowCount) {
    log(`episódio ${ep.slug} já existe; não alterado`);
    return;
  }
  await cliente.query(
    `insert into episodio (slug, temporada_id, numero, titulo, resumo,
                           audio_id, duracao_seg, transcricao, capa_id,
                           explicito, url_spotify, url_youtube,
                           status, publicado_em)
     values ($1, $2, $3, $4, $5, $6, $7, $8, null, false, $9, $10,
             'rascunho', $11)`,
    [
      ep.slug,
      temporadaId,
      ep.numero,
      ep.titulo,
      ep.resumoCandidato,
      audioId,
      ep.master.duracaoSeg,
      transcricao,
      ep.urlSpotify,
      ep.urlYoutube,
      ep.publicadoEm,
    ],
  );
  log(`episódio ${ep.numero} criado em rascunho: ${ep.slug}`);
}

async function principal(executar: boolean): Promise<void> {
  const raiz = exigir("OBSERVATORIO_FONTES_DIR");
  const bucket = exigir("STORAGE_PRIVATE_BUCKET");
  const url = exigir("DATABASE_URL_MANUTENCAO");

  log(executar ? "modo: EXECUTAR" : "modo: CONFERIR (nada é escrito)");

  log("1. conferindo masters e transcrições contra o plano auditado");
  const preparados = [];
  for (const ep of EPISODIOS_TEMPORADA_1) {
    log(` episódio ${ep.numero} — ${ep.slug}`);
    const caminho = await conferirMaster(raiz, ep);
    const transcricao = prepararTranscricao(raiz, ep);
    preparados.push({ ep, caminho, transcricao });
  }

  if (!executar) {
    log("conferência concluída. Nada foi enviado, nada foi gravado.");
    return;
  }

  const pool = new Pool({ connectionString: url });
  try {
    log("2. ingestão privada dos masters");
    const audioIds = new Map<string, string>();
    for (const { ep, caminho } of preparados) {
      log(` episódio ${ep.numero}`);
      audioIds.set(ep.slug, await ingerirMaster(pool, ep, caminho, bucket));
    }

    log("3. temporada e episódios em rascunho");
    const cliente = await pool.connect();
    try {
      await cliente.query("begin");
      const temporadaId = await criarTemporada(cliente);
      for (const { ep, transcricao } of preparados) {
        const audioId = audioIds.get(ep.slug);
        if (!audioId) throw new Bloqueador(`audio_id ausente para ${ep.slug}`);
        await criarEpisodio(
          cliente,
          temporadaId,
          ep,
          audioId,
          transcricao.texto,
        );
      }
      await cliente.query("commit");
    } catch (erro) {
      await cliente.query("rollback").catch(() => {});
      throw erro;
    } finally {
      cliente.release();
    }

    log("4. conferência final");
    const { rows } = await pool.query(
      `select (select count(*) from temporada) temporada,
              (select count(*) from episodio) episodio,
              (select count(*) from episodio where status = 'rascunho') rascunho,
              (select count(*) from vw_episodio_publico) publicos,
              (select count(*) from vw_anexo_publico) anexos,
              (select count(*) from vw_pendencia_publicacao) pendencias,
              (select count(*) from documento_arquivo da
                 join arquivo a on a.id = da.arquivo_id
                where a.chave_storage like 'arquivos/podobservar/%') vinculos_acervo`,
    );
    log(JSON.stringify(rows[0]));
  } finally {
    await pool.end();
  }
}

if (process.argv[1]?.includes("ingerir-podobservar")) {
  const executar = process.argv.includes("--executar");
  if (!executar && !process.argv.includes("--conferir")) {
    console.error("Use --conferir (audita) ou --executar (ingere).");
    process.exit(2);
  }
  principal(executar)
    .then(() => process.exit(0))
    .catch((erro) => {
      console.error(
        `[podobservar] ${erro instanceof Error ? erro.message : String(erro)}`,
      );
      process.exit(1);
    });
}
