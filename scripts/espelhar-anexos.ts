/**
 * Espelhamento de anexos — Tarefa 06.
 *
 * Tira cada anexo da dependência do Google Drive e do Figma: baixa o binário,
 * calcula o SHA-256, sobe ao R2 com chave estável e registra os metadados em
 * `arquivo`. O link de origem fica como redundância, nunca como fonte primária.
 *
 * Fluxo (doc da tarefa):
 *   origem → download para temporário → validação → SHA-256 → upload R2
 *          → persistência no PostgreSQL → registro de espelhamento
 *
 * Não cria nem popula `documento` / `documento_arquivo` — isso é a Tarefa 07.
 * Sequencial de propósito: determinismo e auditabilidade acima de throughput.
 *
 * Uso:
 *   pnpm tsx scripts/espelhar-anexos.ts --dry-run
 *   pnpm tsx scripts/espelhar-anexos.ts --csv caminho/inventario.csv
 */
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { eq } from "drizzle-orm";

import { arquivo } from "../db/schema";
import { db } from "../src/dados/cliente";
import {
  backoffMs,
  categoriaDoItem,
  chaveStorage,
  ehRetentavel,
  exigeCapturaManual,
  extensaoDeMime,
  type ItemInventario,
  lerInventario,
  origemSistemaDoItem,
  pendenciaDeOrigem,
  resolverMime,
  slugDoItem,
  type TipoMidia,
  tipoMidiaDeMime,
} from "../src/lib/espelhamento";
import { consultarObjeto, enviarObjeto, urlPublica } from "../src/lib/storage";

const TIMEOUT_MS = 60_000;
const MAX_TENTATIVAS = 3;
/** A Tarefa 06 sempre espelha a primeira versão. Versões posteriores: Tarefa 07. */
const VERSAO = 1;

type Categoria =
  | "sucesso"
  | "no_op"
  | "falha_download"
  | "origem_sem_link"
  | "erro_validacao"
  | "conflito_hash"
  | "erro_r2"
  | "erro_postgres";

type Registro = { id: string; categoria: Categoria; detalhe: string };

const ROTULOS: Record<Categoria, string> = {
  sucesso: "espelhados",
  no_op: "já espelhados (no-op)",
  falha_download: "falha de download",
  origem_sem_link: "origem sem link",
  erro_validacao: "erro de validação",
  conflito_hash: "conflito de hash/conteúdo",
  erro_r2: "erro de R2",
  erro_postgres: "erro de PostgreSQL",
};

const mensagem = (e: unknown) => (e instanceof Error ? e.message : String(e));

/**
 * Baixa a URL para um arquivo temporário e devolve o `Content-Type` observado
 * na resposta — sem requisição extra. Até 3 tentativas com backoff; erro
 * não-retentável interrompe na hora. O temporário é sempre removido pelo
 * chamador — nunca sobra download parcial.
 */
async function baixarParaTemporario(
  url: string,
  destino: string,
): Promise<string | null> {
  let ultimoErro: unknown;

  for (let tentativa = 1; tentativa <= MAX_TENTATIVAS; tentativa++) {
    try {
      const resposta = await fetch(url, {
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!resposta.ok) {
        const erro = new Error(
          `HTTP ${resposta.status} ${resposta.statusText}`,
        );
        if (!ehRetentavel(resposta.status)) throw erro;
        ultimoErro = erro;
      } else {
        const bytes = Buffer.from(await resposta.arrayBuffer());
        await writeFile(destino, bytes);
        return resposta.headers.get("content-type");
      }
    } catch (erro) {
      if (erro instanceof Error && erro.message.startsWith("HTTP ")) throw erro;
      ultimoErro = erro;
    }
    if (tentativa < MAX_TENTATIVAS) {
      await new Promise((r) => setTimeout(r, backoffMs(tentativa)));
    }
  }
  throw new Error(
    `falhou após ${MAX_TENTATIVAS} tentativas: ${mensagem(ultimoErro)}`,
  );
}

/** Processa um item. Nunca lança: devolve o registro para o relatório. */
async function processarItem(
  item: ItemInventario,
  dryRun: boolean,
): Promise<Registro> {
  const reg = (categoria: Categoria, detalhe: string): Registro => ({
    id: item.id,
    categoria,
    detalhe,
  });

  // 1. Origem utilizável? Nunca adivinhar URL, nunca descartar o item.
  if (exigeCapturaManual(item)) {
    return reg(
      "origem_sem_link",
      "origem Figma: captura estática em PDF/PNG é ato humano (doc 01 §6)",
    );
  }
  const pendencia = pendenciaDeOrigem(item);
  if (pendencia) return reg("origem_sem_link", pendencia.motivo);

  // 2. Identidade do objeto, antes de qualquer rede.
  let categoria: ReturnType<typeof categoriaDoItem>;
  let slug: string;
  let origemSistema: string;
  try {
    categoria = categoriaDoItem(item);
    slug = slugDoItem(item);
    origemSistema = origemSistemaDoItem(item);
    if (!slug) throw new Error("slug vazio após normalização");
  } catch (erro) {
    return reg("erro_validacao", mensagem(erro));
  }

  // 3. Idempotência: já registrado com este mesmo destino ⇒ não baixa de novo.
  const chaveProvavel = `arquivos/${categoria}/${slug}-v${VERSAO}.`;
  try {
    const existentes = await db
      .select({
        chave: arquivo.chaveStorage,
        sha: arquivo.sha256,
        em: arquivo.espelhadoEm,
      })
      .from(arquivo)
      .where(eq(arquivo.origemUrl, item.linkAtual));
    const jaFeito = existentes.find(
      (e) => e.chave.startsWith(chaveProvavel) && e.em !== null,
    );
    if (jaFeito) {
      return reg(
        "no_op",
        `já espelhado em ${jaFeito.chave} (sha ${jaFeito.sha.slice(0, 12)}…)`,
      );
    }
  } catch (erro) {
    return reg("erro_postgres", `consulta de idempotência: ${mensagem(erro)}`);
  }

  if (dryRun) {
    return reg(
      "sucesso",
      `[dry-run] baixaria ${item.linkAtual} → ${chaveProvavel}<ext>`,
    );
  }

  // 4. Download para temporário, hash, validação de tipo.
  const pasta = await mkdtemp(join(tmpdir(), "espelhar-"));
  const temporario = join(pasta, "download");
  let corpo: Buffer;
  let sha256: string;
  let mimeType: string;
  let tipoMidia: TipoMidia;
  let chave: string;

  try {
    let contentType: string | null;
    try {
      contentType = await baixarParaTemporario(item.linkAtual, temporario);
    } catch (erro) {
      return reg("falha_download", mensagem(erro));
    }

    try {
      corpo = await readFile(temporario);
      if (corpo.byteLength === 0) throw new Error("arquivo vazio (bytes = 0)");
      sha256 = createHash("sha256").update(corpo).digest("hex");
      mimeType = resolverMime(contentType, item.linkAtual);
      tipoMidia = tipoMidiaDeMime(mimeType);
      chave = chaveStorage(categoria, slug, VERSAO, extensaoDeMime(mimeType));
    } catch (erro) {
      return reg("erro_validacao", mensagem(erro));
    }

    // 5. Upload, sem sobrescrever conteúdo diferente e sem apagar nada.
    try {
      const objeto = await consultarObjeto(chave);
      // Objeto já presente só é aceito se o sha bater. Sem metadado de sha não
      // dá para provar que o conteúdo é o mesmo, e registrar em `arquivo` um
      // hash não verificado contradiz o propósito de auditoria da ADR-003 §6.
      if (objeto && objeto.sha256 !== sha256) {
        const encontrado = objeto.sha256
          ? `sha ${objeto.sha256.slice(0, 12)}…, diferente do baixado ${sha256.slice(0, 12)}…`
          : "sem metadado de sha256, conteúdo não verificável";
        return reg(
          "conflito_hash",
          `objeto ${chave} já existe com ${encontrado}. Nada foi sobrescrito.`,
        );
      }
      if (!objeto) await enviarObjeto(chave, corpo, mimeType, sha256);
    } catch (erro) {
      return reg("erro_r2", mensagem(erro));
    }

    // 6. Persistência. Falha aqui NÃO apaga o objeto: fica para reconciliação.
    try {
      await db.insert(arquivo).values({
        chaveStorage: chave,
        urlPublica: urlPublica(chave),
        nomeOriginal: item.item || null,
        tipoMidia,
        mimeType,
        bytes: corpo.byteLength,
        sha256,
        origemUrl: item.linkAtual,
        origemSistema,
        espelhadoEm: new Date(),
      });
    } catch (erro) {
      return reg(
        "erro_postgres",
        `objeto ${chave} está no R2 mas não foi registrado — reconciliar. ${mensagem(erro)}`,
      );
    }

    return reg(
      "sucesso",
      `${chave} (${corpo.byteLength} bytes, sha ${sha256.slice(0, 12)}…)`,
    );
  } finally {
    await rm(pasta, { recursive: true, force: true });
  }
}

function relatorio(registros: Registro[]): void {
  const porCategoria = new Map<Categoria, Registro[]>();
  for (const r of registros) {
    const lista = porCategoria.get(r.categoria) ?? [];
    lista.push(r);
    porCategoria.set(r.categoria, lista);
  }

  console.log(`\nInventário: ${registros.length} itens\n`);
  for (const categoria of Object.keys(ROTULOS) as Categoria[]) {
    const lista = porCategoria.get(categoria) ?? [];
    console.log(`${ROTULOS[categoria]}: ${lista.length}`);
    for (const r of lista) console.log(`  ${r.id.padEnd(5)} ${r.detalhe}`);
  }

  const falhas = registros.filter(
    (r) =>
      r.categoria !== "sucesso" &&
      r.categoria !== "no_op" &&
      r.categoria !== "origem_sem_link",
  );
  console.log(`\nfalhas técnicas: ${falhas.length}`);
}

async function principal(): Promise<void> {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes("--dry-run");
  const iCsv = argv.indexOf("--csv");
  const caminhoCsv =
    iCsv >= 0 ? (argv[iCsv + 1] ?? "") : "inventario-de-anexos.csv";
  if (!caminhoCsv) throw new Error("--csv exige um caminho.");

  let csv: string;
  try {
    csv = await readFile(caminhoCsv, "utf8");
  } catch {
    throw new Error(
      `Não foi possível ler "${caminhoCsv}". Exporte a aba Inventário do ` +
        "inventario-de-anexos.xlsx como CSV (artefato intermediário, não versionado).",
    );
  }

  const itens = lerInventario(csv);
  const registros: Registro[] = [];
  for (const item of itens) {
    registros.push(await processarItem(item, dryRun));
  }
  relatorio(registros);
}

principal().catch((erro) => {
  console.error(mensagem(erro));
  process.exit(1);
});
