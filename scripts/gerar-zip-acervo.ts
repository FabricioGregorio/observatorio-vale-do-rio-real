/**
 * Empacotamento do "Baixar tudo em ZIP" — Lote C.
 *
 * Monta o pacote do acervo **a partir da cópia local do corpus**, não do
 * storage: os 107 objetos já existem em disco, byte a byte, e baixá-los de
 * volta para reempacotá-los seria transferir 588 MiB para produzir algo que
 * o disco já tem. Cada arquivo local é conferido contra `acervo.json` antes
 * de entrar — bytes e SHA-256 — e um que não confira interrompe tudo.
 *
 * ## Uso
 *
 *     pnpm empacotar-acervo                    # gera e confere, não publica
 *     pnpm empacotar-acervo --duas-vezes       # prova o determinismo
 *     pnpm empacotar-acervo --publicar         # gera, confere e envia ao R2
 *
 * A publicação exige a flag literal. Sem ela o processo nunca chama o
 * storage — é o que impede compilação, CI ou invocação acidental de causar
 * `PutObject`.
 *
 * ## Como os arquivos locais são encontrados
 *
 * Por conteúdo, nunca por nome. O índice varre duas raízes locais — a pasta
 * de fontes canônicas (`OBSERVATORIO_FONTES_DIR`, fora do repositório) e o
 * `public/` do próprio repositório —, considera apenas os arquivos cujo
 * tamanho bate com algum objeto do acervo e calcula o SHA-256 desses.
 * Filtrar por tamanho primeiro evita hashear tudo para achar 107.
 *
 * As duas raízes existem porque o corpus mora nas duas: a identidade visual
 * do Observatório é servida pelo site **e** publicada no acervo, e a cópia
 * versionada dela é o `public/`. Um objeto que não for resolvido em nenhuma
 * das duas interrompe a geração: o pacote não aceita aproximação.
 *
 * ## Determinismo
 *
 * Mesmo conjunto de bytes, mesmo pacote. A ordem das entradas é a do caminho
 * interno, o instante gravado em cada uma é fixo, e nada do relógio, do
 * sistema de arquivos ou da ordem de varredura entra no resultado. É o que
 * permite endereçar o pacote pelo próprio hash.
 */
import { createHash } from "node:crypto";
import {
  createReadStream,
  createWriteStream,
  existsSync,
  mkdirSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
} from "node:fs";
import { join } from "node:path";
import { loadEnvFile } from "node:process";
import { pathToFileURL } from "node:url";

import { Zip, ZipPassThrough } from "fflate";
import { validarAcervoPublico } from "../src/dados/publicado/acervo";
import { conferirCorpusCanonico } from "../src/dados/publicado/canonicidade";
import { ORIGEM_DO_ACERVO } from "../src/dados/publicado/downloads";
import { lerAcervoPublicado } from "../src/dados/publicado/leitura";
import {
  chaveDoPacote,
  type EntradaDoPacote,
  entradasDoPacote,
  INSTANTE_DO_PACOTE,
  PacoteIncoerente,
} from "../src/lib/pacote-acervo";
import {
  consultarObjeto,
  credenciaisDeStoragePresentes,
  enviarArquivoGrande,
} from "../src/lib/storage";

const MIME_DO_PACOTE = "application/zip";

/** Pastas que nunca contêm original do acervo e custam caro para varrer. */
const IGNORADAS = new Set([".git", "node_modules", ".next", "$RECYCLE.BIN"]);

function fontesCanonicas(): string {
  const raiz = process.env.OBSERVATORIO_FONTES_DIR?.trim();
  if (!raiz || !existsSync(raiz)) {
    throw new Error(
      "OBSERVATORIO_FONTES_DIR ausente ou inexistente: o pacote é montado a " +
        "partir da cópia local do corpus, fora do repositório.",
    );
  }
  return raiz;
}

/** As raízes locais onde o corpus pode estar, em ordem estável. */
function raizesLocais(): string[] {
  return [fontesCanonicas(), join(process.cwd(), "public")].filter((raiz) =>
    existsSync(raiz),
  );
}

function* arquivosDe(diretorio: string): Generator<string> {
  for (const entrada of readdirSync(diretorio, { withFileTypes: true })) {
    if (IGNORADAS.has(entrada.name)) continue;
    const caminho = join(diretorio, entrada.name);
    if (entrada.isDirectory()) yield* arquivosDe(caminho);
    else if (entrada.isFile()) yield caminho;
  }
}

async function hashDeArquivo(caminho: string): Promise<string> {
  const hash = createHash("sha256");
  for await (const pedaco of createReadStream(caminho)) hash.update(pedaco);
  return hash.digest("hex");
}

/**
 * Resolve cada entrada do pacote para um arquivo local com os mesmos bytes.
 *
 * Devolve o mapa `sha256 → caminho`. Arquivos com o mesmo conteúdo em lugares
 * diferentes são equivalentes por definição; vence o primeiro em ordem
 * alfabética, para que duas execuções escolham o mesmo.
 */
async function resolverCorpusLocal(
  entradas: readonly EntradaDoPacote[],
): Promise<Map<string, string>> {
  const raizes = raizesLocais();
  const porTamanho = new Map<number, EntradaDoPacote[]>();
  for (const entrada of entradas) {
    porTamanho.set(entrada.bytes, [
      ...(porTamanho.get(entrada.bytes) ?? []),
      entrada,
    ]);
  }

  const candidatos: string[] = [];
  let vistos = 0;
  for (const raiz of raizes) {
    for (const caminho of arquivosDe(raiz)) {
      vistos += 1;
      if (porTamanho.has(statSync(caminho).size)) candidatos.push(caminho);
    }
  }
  candidatos.sort();
  console.log(
    `  ${vistos.toLocaleString("pt-BR")} arquivos locais varridos; ` +
      `${candidatos.length} com tamanho de objeto do acervo`,
  );

  const pendentes = new Set(entradas.map((entrada) => entrada.sha256));
  const encontrados = new Map<string, string>();
  for (const caminho of candidatos) {
    if (pendentes.size === 0) break;
    const sha = await hashDeArquivo(caminho);
    if (pendentes.has(sha)) {
      encontrados.set(sha, caminho);
      pendentes.delete(sha);
    }
  }

  if (pendentes.size > 0) {
    const faltando = entradas
      .filter((entrada) => pendentes.has(entrada.sha256))
      .map((entrada) => `  ${entrada.caminho} (sha ${entrada.sha256})`)
      .join("\n");
    throw new PacoteIncoerente(
      `${pendentes.size} objeto(s) do acervo sem cópia local byte-idêntica:\n${faltando}\n` +
        "O pacote não é gerado com aproximação.",
    );
  }
  return encontrados;
}

/**
 * Escreve o pacote em disco e devolve hash e tamanho.
 *
 * Os arquivos entram por stream, um de cada vez: nem o maior objeto nem o
 * pacote inteiro passam pela memória.
 */
async function escreverPacote(
  entradas: readonly EntradaDoPacote[],
  locais: ReadonlyMap<string, string>,
  destino: string,
): Promise<{ sha256: string; bytes: number }> {
  const saida = createWriteStream(destino);
  const hash = createHash("sha256");
  let total = 0;

  const fim = new Promise<void>((resolver, rejeitar) => {
    saida.on("error", rejeitar);
    saida.on("finish", () => resolver());
  });

  const zip = new Zip((erro, pedaco, ultimo) => {
    if (erro) {
      saida.destroy(erro);
      return;
    }
    hash.update(pedaco);
    total += pedaco.byteLength;
    saida.write(pedaco);
    if (ultimo) saida.end();
  });

  for (const entrada of entradas) {
    const origem = locais.get(entrada.sha256);
    if (!origem)
      throw new PacoteIncoerente(`Sem origem local: ${entrada.caminho}`);

    const fluxoZip = new ZipPassThrough(entrada.caminho);
    fluxoZip.mtime = INSTANTE_DO_PACOTE;
    // Sistema de origem fixo: o pacote não anuncia em que máquina foi feito.
    fluxoZip.os = 0;
    zip.add(fluxoZip);

    let enviados = 0;
    for await (const pedaco of createReadStream(origem)) {
      const bytes = pedaco as Buffer;
      enviados += bytes.byteLength;
      fluxoZip.push(new Uint8Array(bytes), false);
    }
    fluxoZip.push(new Uint8Array(0), true);

    if (enviados !== entrada.bytes) {
      throw new PacoteIncoerente(
        `${entrada.caminho}: cópia local com ${enviados} bytes, acervo declara ${entrada.bytes}.`,
      );
    }
  }

  zip.end();
  await fim;
  return { sha256: hash.digest("hex"), bytes: total };
}

export type Opcoes = {
  readonly publicar: boolean;
  readonly duasVezes: boolean;
};

export function opcoes(argv: readonly string[]): Opcoes {
  const conhecidos = new Set(["--publicar", "--duas-vezes"]);
  const desconhecidos = argv.filter((a) => !conhecidos.has(a));
  if (desconhecidos.length > 0) {
    throw new Error(`Argumento desconhecido: ${desconhecidos.join(", ")}`);
  }
  return {
    publicar: argv.includes("--publicar"),
    duasVezes: argv.includes("--duas-vezes"),
  };
}

async function principal(
  argv: readonly string[] = process.argv.slice(2),
): Promise<void> {
  const { publicar, duasVezes } = opcoes(argv);
  if (existsSync(".env.local")) loadEnvFile(".env.local");

  const acervo = lerAcervoPublicado();
  validarAcervoPublico(acervo);
  const corpus = conferirCorpusCanonico(acervo);
  const entradas = entradasDoPacote(acervo);
  console.log(
    `— corpus: ${corpus.anexos} anexos · ${corpus.documentos} documentos —`,
  );
  console.log(`— pacote: ${entradas.length} entradas —`);

  console.log("\n— resolvendo a cópia local do corpus —");
  const locais = await resolverCorpusLocal(entradas);
  console.log(`  ${locais.size}/${entradas.length} resolvidos por conteúdo`);

  const pasta = join(fontesCanonicas(), "pacotes");
  mkdirSync(pasta, { recursive: true });

  console.log("\n— empacotando —");
  const provisorio = join(pasta, "anexos-em-preparo.zip");
  const primeiro = await escreverPacote(entradas, locais, provisorio);
  console.log(
    `  ${primeiro.bytes.toLocaleString("pt-BR")} bytes · sha ${primeiro.sha256}`,
  );

  if (duasVezes) {
    console.log("\n— segunda geração, para provar o determinismo —");
    const outro = join(pasta, "anexos-em-preparo-2.zip");
    const segundo = await escreverPacote(entradas, locais, outro);
    console.log(
      `  ${segundo.bytes.toLocaleString("pt-BR")} bytes · sha ${segundo.sha256}`,
    );
    if (
      segundo.sha256 !== primeiro.sha256 ||
      segundo.bytes !== primeiro.bytes
    ) {
      rmSync(outro, { force: true });
      throw new PacoteIncoerente(
        "Duas gerações do mesmo corpus produziram pacotes diferentes.",
      );
    }
    rmSync(outro, { force: true });
    console.log("  byte-idêntico.");
  }

  const chave = chaveDoPacote(primeiro.sha256);
  const destino = join(pasta, chave.split("/").pop() ?? "anexos.zip");
  renameSync(provisorio, destino);
  console.log(`\n— pacote pronto —`);
  console.log(`  chave:  ${chave}`);
  console.log(`  local:  ${destino}`);
  console.log(`  sha256: ${primeiro.sha256}`);
  console.log(`  bytes:  ${primeiro.bytes.toLocaleString("pt-BR")}`);
  console.log(`  url:    ${ORIGEM_DO_ACERVO}/${chave}?baixar=1`);

  if (!publicar) {
    console.log(
      "\nSem --publicar: nada foi enviado. O storage não foi consultado.",
    );
    return;
  }

  if (!credenciaisDeStoragePresentes()) {
    throw new Error("Credenciais do R2 ausentes: o pacote não foi publicado.");
  }

  console.log("\n— publicando —");
  const existente = await consultarObjeto(chave);
  if (existente) {
    /*
      Chave endereçada pelo conteúdo: se o objeto já está lá, ou é este mesmo
      pacote — e reenviar 588 MiB não muda nada — ou a chave foi ocupada por
      outro conteúdo, o que é grave e para tudo.
    */
    if (
      existente.bytes === primeiro.bytes &&
      existente.sha256 === primeiro.sha256
    ) {
      console.log("  objeto idêntico já publicado; nada a enviar.");
    } else {
      throw new PacoteIncoerente(
        `Chave ${chave} ocupada por conteúdo diferente ` +
          `(bytes ${existente.bytes}, sha ${existente.sha256}). Nada foi sobrescrito.`,
      );
    }
  } else {
    let ultimo = 0;
    await enviarArquivoGrande(
      chave,
      destino,
      MIME_DO_PACOTE,
      primeiro.sha256,
      (bytes) => {
        const parte = Math.floor((bytes / primeiro.bytes) * 10);
        if (parte > ultimo) {
          ultimo = parte;
          console.log(`  … ${parte * 10}%`);
        }
      },
    );
    console.log("  enviado.");
  }

  console.log("\n— conferindo o objeto remoto —");
  const url = `${ORIGEM_DO_ACERVO}/${chave}`;
  const resposta = await fetch(url, { redirect: "error" });
  if (resposta.status !== 200 || !resposta.body) {
    throw new PacoteIncoerente(
      `Pacote remoto respondeu HTTP ${resposta.status}.`,
    );
  }
  const tipo = resposta.headers.get("content-type")?.split(";")[0]?.trim();
  const hashRemoto = createHash("sha256");
  let bytesRemotos = 0;
  const leitor = resposta.body.getReader();
  while (true) {
    const { done, value } = await leitor.read();
    if (done) break;
    if (value) {
      hashRemoto.update(value);
      bytesRemotos += value.byteLength;
    }
  }
  const shaRemoto = hashRemoto.digest("hex");
  if (
    bytesRemotos !== primeiro.bytes ||
    shaRemoto !== primeiro.sha256 ||
    tipo !== MIME_DO_PACOTE
  ) {
    throw new PacoteIncoerente(
      `Pacote remoto divergente: bytes ${bytesRemotos}, sha ${shaRemoto}, mime ${tipo}.`,
    );
  }
  console.log(
    `  ${bytesRemotos.toLocaleString("pt-BR")} bytes · sha confere · ${tipo}`,
  );
  console.log("\nPacote publicado e conferido. Registre em release.json:");
  console.log(
    JSON.stringify(
      { chave, sha256: primeiro.sha256, bytes: primeiro.bytes },
      null,
      2,
    ),
  );
}

const caminhoExecutado = process.argv[1];
if (
  caminhoExecutado &&
  import.meta.url === pathToFileURL(caminhoExecutado).href
) {
  principal().catch((erro) => {
    console.error(erro instanceof Error ? erro.message : String(erro));
    process.exitCode = 1;
  });
}
