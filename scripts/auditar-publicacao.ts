/**
 * Auditoria da publicação — o gate remoto do release.
 *
 * Confere, objeto a objeto, que o que o storage serve é o que o snapshot
 * declara. É a contraparte do desenho de `/baixar`: o site deixou de
 * reconferir cada download porque **esta** verificação acontece antes de o
 * release existir. Integridade é da publicação, não da requisição.
 *
 * ## O que é conferido
 *
 * Primeiro, sem rede: as garantias do corpus canônico — 107 anexos, 16
 * documentos, nenhum derivado antigo ao lado do original, nenhum preview
 * como entrada, a fotografia com placa só na versão tarjada, o Caderno de
 * Estudos ausente do catálogo. Um corpus que não satisfaz isso não é
 * auditado: é recusado antes de transferir o primeiro byte.
 *
 * Depois, por objeto: status HTTP, `Content-Type`, bytes e **SHA-256 dos
 * bytes recebidos**. O hash é calculado por stream, pedaço a pedaço, e nunca
 * se acumula o objeto inteiro em memória — há PDF de 12 MB e áudio de
 * centenas neste acervo.
 *
 * ## Modos
 *
 *     pnpm auditar-publicacao             # integral: baixa e reconfere tudo
 *     pnpm auditar-publicacao --tripwire  # barato: só HEAD
 *
 * O modo integral é o do cutover e o de qualquer objeto novo ou substituído.
 * O tripwire é complementar: confere existência, `Content-Length` e
 * `Content-Type` sem transferir corpo. Ele **não** substitui o hash — um
 * objeto trocado por outro do mesmo tamanho e tipo passa pelo tripwire, e é
 * exatamente por isso que ele não é prova de integridade.
 *
 * `ETag` não é usado como prova: é identificador opaco, e tratá-lo como MD5
 * é uma suposição sobre a implementação do storage que ninguém garantiu.
 *
 * ## O que este comando não é
 *
 * Não roda em `build`, `dev` nem `teste`. É operação de manutenção, remota e
 * explícita, e o build continua sem tocar a rede.
 */
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";
import { validarAcervoPublico } from "../src/dados/publicado/acervo";
import { conferirCorpusCanonico } from "../src/dados/publicado/canonicidade";
import { ORIGEM_DO_ACERVO } from "../src/dados/publicado/downloads";
import { lerAcervoPublicado, lerRelease } from "../src/dados/publicado/leitura";

/** Objetos conferidos em paralelo. Quatro é o padrão do projeto. */
const TRABALHADORES = 4;

type Alvo = {
  readonly nome: string;
  readonly url: string;
  readonly bytes: number;
  readonly mimeType: string;
  readonly sha256: string;
};

type Resultado = {
  readonly nome: string;
  readonly ok: boolean;
  readonly detalhe: string;
  readonly bytes: number;
};

function exigirOrigem(url: string, nome: string): void {
  if (!url.startsWith(`${ORIGEM_DO_ACERVO}/`)) {
    throw new Error(`${nome}: URL fora do acervo público — ${url}`);
  }
}

/** SHA-256 e bytes do corpo, sem nunca materializar o objeto inteiro. */
async function conferirPorStream(alvo: Alvo): Promise<Resultado> {
  const resposta = await fetch(alvo.url, { redirect: "error" });
  if (resposta.status !== 200) {
    return {
      nome: alvo.nome,
      ok: false,
      detalhe: `HTTP ${resposta.status}`,
      bytes: 0,
    };
  }

  const tipo = resposta.headers.get("content-type")?.split(";")[0]?.trim();
  const hash = createHash("sha256");
  let recebidos = 0;

  const corpo = resposta.body;
  if (!corpo) {
    return { nome: alvo.nome, ok: false, detalhe: "sem corpo", bytes: 0 };
  }
  const leitor = corpo.getReader();
  while (true) {
    const { done, value } = await leitor.read();
    if (done) break;
    if (value) {
      hash.update(value);
      recebidos += value.byteLength;
    }
  }

  const sha = hash.digest("hex");
  const divergencias: string[] = [];
  if (recebidos !== alvo.bytes) {
    divergencias.push(`bytes ${recebidos} ≠ ${alvo.bytes}`);
  }
  if (sha !== alvo.sha256) divergencias.push(`sha256 ${sha} ≠ ${alvo.sha256}`);
  if (tipo !== alvo.mimeType) {
    divergencias.push(`mime ${tipo} ≠ ${alvo.mimeType}`);
  }

  return {
    nome: alvo.nome,
    ok: divergencias.length === 0,
    detalhe: divergencias.join("; "),
    bytes: recebidos,
  };
}

/**
 * Conferência barata: existência, tamanho e tipo, sem transferir corpo.
 *
 * Serve para objeto já comprovado integralmente — acusa sumiço, truncamento
 * e troca de tipo. Não acusa troca de conteúdo do mesmo tamanho, e o
 * relatório diz isso em vez de deixar a impressão de que hash foi conferido.
 *
 * `Accept-Encoding: identity` não é detalhe. O CDN comprime o que é
 * comprimível — SVG, aqui — e, quando comprime, responde sem
 * `Content-Length` e com `ETag` fraco. Sem pedir a forma original, os três
 * SVG do acervo apareciam como divergência de tamanho num objeto que está
 * íntegro: um alarme falso que ensina a ignorar o alarme.
 */
async function conferirPorHead(alvo: Alvo): Promise<Resultado> {
  const resposta = await fetch(alvo.url, {
    method: "HEAD",
    redirect: "error",
    headers: { "accept-encoding": "identity" },
  });
  if (resposta.status !== 200) {
    return {
      nome: alvo.nome,
      ok: false,
      detalhe: `HTTP ${resposta.status}`,
      bytes: 0,
    };
  }

  const cabecalhoTamanho = resposta.headers.get("content-length");
  const tipo = resposta.headers.get("content-type")?.split(";")[0]?.trim();
  const divergencias: string[] = [];
  /*
    Sem `Content-Length` não há o que comparar — e afirmar divergência seria
    inventar uma. O caso é declarado, não escondido: o objeto existe e o tipo
    confere, mas o tamanho não foi conferível neste modo.
  */
  if (cabecalhoTamanho === null) {
    divergencias.push("sem content-length: tamanho não conferível por HEAD");
  } else if (Number(cabecalhoTamanho) !== alvo.bytes) {
    divergencias.push(`content-length ${cabecalhoTamanho} ≠ ${alvo.bytes}`);
  }
  if (tipo !== alvo.mimeType) {
    divergencias.push(`mime ${tipo} ≠ ${alvo.mimeType}`);
  }

  return {
    nome: alvo.nome,
    ok: divergencias.length === 0,
    detalhe: divergencias.join("; "),
    bytes: 0,
  };
}

async function emParalelo(
  alvos: readonly Alvo[],
  conferir: (alvo: Alvo) => Promise<Resultado>,
): Promise<Resultado[]> {
  const resultados: Resultado[] = [];
  let proximo = 0;
  let concluidos = 0;

  async function trabalhador() {
    while (proximo < alvos.length) {
      const alvo = alvos[proximo++];
      if (!alvo) return;
      try {
        resultados.push(await conferir(alvo));
      } catch (erro) {
        resultados.push({
          nome: alvo.nome,
          ok: false,
          detalhe: erro instanceof Error ? erro.message : String(erro),
          bytes: 0,
        });
      }
      concluidos += 1;
      if (concluidos % 10 === 0 || concluidos === alvos.length) {
        console.log(`  … ${concluidos}/${alvos.length}`);
      }
    }
  }

  await Promise.all(Array.from({ length: TRABALHADORES }, () => trabalhador()));
  return resultados;
}

export async function principal(
  argumentos: readonly string[] = process.argv.slice(2),
): Promise<void> {
  const tripwire = argumentos.includes("--tripwire");
  const desconhecidos = argumentos.filter((a) => a !== "--tripwire");
  if (desconhecidos.length > 0) {
    throw new Error(`Argumento desconhecido: ${desconhecidos.join(", ")}`);
  }

  const acervo = lerAcervoPublicado();
  const release = lerRelease();

  console.log("— garantias do corpus, sem rede —");
  validarAcervoPublico(acervo);
  const corpus = conferirCorpusCanonico(acervo);
  console.log(
    `  ${corpus.anexos} anexos · ${corpus.documentos} documentos · ` +
      `${corpus.comPreview} com preview de apresentação`,
  );
  console.log("  fotografia com placa: só a versão pública tarjada");
  console.log("  Caderno de Estudos: ausente do catálogo, como deve ser");

  const alvos: Alvo[] = acervo.map((anexo) => {
    exigirOrigem(anexo.linkPermanente, anexo.arquivoId);
    return {
      nome: `${anexo.slug}/${anexo.arquivoId.slice(0, 8)}`,
      url: anexo.linkPermanente,
      bytes: anexo.bytes,
      mimeType: anexo.mimeType,
      sha256: anexo.sha256,
    };
  });

  /*
    O pacote do acervo entra na mesma auditoria quando existe. Ele é parte do
    release: um ZIP que sumiu ou mudou é tão grave quanto um documento que
    sumiu, e o botão "Baixar tudo" aponta para ele.
  */
  if (release.zip) {
    const url = `${ORIGEM_DO_ACERVO}/${release.zip.chave}`;
    alvos.push({
      nome: "pacote/zip",
      url,
      bytes: release.zip.bytes,
      mimeType: "application/zip",
      sha256: release.zip.sha256,
    });
  }

  console.log(
    `\n— ${tripwire ? "tripwire (HEAD)" : "auditoria integral"}: ` +
      `${alvos.length} objetos —`,
  );
  const resultados = await emParalelo(
    alvos,
    tripwire ? conferirPorHead : conferirPorStream,
  );

  const falhas = resultados.filter((r) => !r.ok);
  const transferidos = resultados.reduce((soma, r) => soma + r.bytes, 0);

  console.log(`\n— resultado —`);
  console.log(
    `  conferidos: ${resultados.length - falhas.length}/${alvos.length}`,
  );
  if (!tripwire) {
    console.log(
      `  bytes auditados: ${transferidos.toLocaleString("pt-BR")} ` +
        `(${(transferidos / 1024 / 1024).toFixed(1)} MiB)`,
    );
  } else {
    console.log(
      "  tripwire não confere conteúdo: existência, tamanho e tipo apenas",
    );
  }
  console.log(`  release: ${release.id}`);

  if (falhas.length > 0) {
    console.error(`\n— ${falhas.length} divergência(s) —`);
    for (const falha of falhas)
      console.error(`  ${falha.nome}: ${falha.detalhe}`);
    process.exitCode = 1;
    return;
  }
  console.log("\nPublicação íntegra.");
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
