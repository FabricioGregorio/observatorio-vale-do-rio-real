/**
 * Primeiro espelhamento privado — lote fechado A02=1, A04=1, D01=8.
 * Padrão: dry-run. --executar requer autorização humana incluindo confirmação
 * de r2.dev desativado e ausência de custom domain público. O código não
 * atesta configurações administrativas da conta Cloudflare.
 */
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { realpath } from "node:fs/promises";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { loadEnvFile } from "node:process";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";
import { z } from "zod";
import { FalhaEspelhamento } from "../src/lib/espelhamento-privado";
import { bucketPrivado } from "../src/lib/storage-privado";
import { BancoEspelhamento } from "./lib/banco-espelhamento";
import { executarLote } from "./lib/executar-espelhamento";
import { prepararPlano } from "./lib/plano-espelhamento";

export function modoReal(argv: string[]): boolean {
  const flags = z
    .array(z.enum(["--dry-run", "--executar"]))
    .max(1)
    .parse(argv);
  return flags[0] === "--executar";
}

async function principal(): Promise<void> {
  const executar = modoReal(process.argv.slice(2));
  if (existsSync(".env.local")) loadEnvFile(".env.local");
  if (bucketPrivado() !== "observatorio-privado")
    throw new Error("Bucket privado inesperado.");
  const raiz = await realpath(
    z.string().min(1).parse(process.env.OBSERVATORIO_FONTES_DIR),
  );
  const rel = relative(await realpath(process.cwd()), raiz);
  if (!isAbsolute(rel) && rel !== ".." && !rel.startsWith(`..${sep}`))
    throw new Error("Fonte canônica precisa estar fora do repositório.");
  // Derivação atual em memória: não consome CSV persistido nem escreve sidecar.
  const { stdout: csv } = await promisify(execFile)(
    "python",
    ["-B", "scripts/derivar-inventario.py", "--stdout"],
    { encoding: "utf8", maxBuffer: 1024 * 1024 },
  );
  const plano = await prepararPlano(raiz, csv);
  const { poolManutencao, encerrarManutencao } = await import(
    "../src/dados/clienteManutencao"
  );
  const banco = new BancoEspelhamento(() => poolManutencao.connect());
  try {
    const acao = () =>
      executarLote(plano, raiz, banco, executar, (op, operacao) => {
        console.log(
          JSON.stringify({
            codigo: op.codigo,
            arquivo_relativo: op.caminho,
            sha256: op.sha256,
            bytes: op.bytes,
            MIME: op.mimeType,
            bucket: op.bucket,
            object_key: op.chave,
            papel: op.principal ? "principal" : "neutro (principal=false)",
            visibilidade: op.visibilidade,
            url_publica: op.urlPublica,
            fonte_confirmacao_hash: op.fonteHash,
            hash_historico_anterior: op.hashHistoricoAnterior,
            acao: operacao,
          }),
        );
      });
    if (executar) await banco.comExclusividade(acao);
    else await acao();
    console.log(
      `${executar ? "Execução" : "DRY-RUN"}: 10 operações; A02=1; A04=1; D01=8.`,
    );
    if (!executar)
      console.log(
        "Nenhum upload ou INSERT. Aguardar autorização humana e confirmação administrativa do bucket.",
      );
  } finally {
    await encerrarManutencao();
  }
}

if (
  process.argv[1] &&
  pathToFileURL(resolve(process.argv[1])).href === import.meta.url
) {
  principal().catch((erro: unknown) => {
    // Erros de SDK/SQL/Zod podem carregar endpoints, URLs ou valores de entrada.
    console.error(
      erro instanceof FalhaEspelhamento
        ? erro.message
        : "Espelhamento interrompido. Conferir fonte, plano, banco e acesso privado; não repetir com --executar sem resolver a falha.",
    );
    process.exitCode = 1;
  });
}
