/**
 * Acesso ao armazenamento de objetos — Cloudflare R2 pela API S3-compatível.
 *
 * O provedor é decisão de infraestrutura (ADR-006); o código fala S3 e nada
 * mais. Trocar de provedor é mudar endpoint e credencial, não código.
 * Credenciais vêm sempre do ambiente, nunca do código.
 *
 * Referências:
 * - ADR-003 (todo binário vive em storage de objetos, com URL própria e hash)
 * - ADR-006 (Cloudflare R2, API S3, variáveis STORAGE_*)
 * - doc 03 §13 (variáveis de ambiente)
 */
import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

function exigir(nome: string): string {
  const valor = process.env[nome];
  if (!valor) {
    throw new Error(`${nome} não definida. Consulte .env.example.`);
  }
  return valor;
}

let clienteMemo: S3Client | null = null;

/** Cliente S3 apontado para o R2. Criado sob demanda, uma vez por processo. */
export function cliente(): S3Client {
  if (clienteMemo) return clienteMemo;
  clienteMemo = new S3Client({
    region: "auto",
    endpoint: exigir("STORAGE_ENDPOINT"),
    credentials: {
      accessKeyId: exigir("STORAGE_ACCESS_KEY"),
      secretAccessKey: exigir("STORAGE_SECRET"),
    },
  });
  return clienteMemo;
}

/** URL pública do objeto, sob o domínio próprio (doc 01 §6). */
export function urlPublica(chave: string): string {
  const base = exigir("STORAGE_PUBLIC_URL").replace(/\/+$/, "");
  return `${base}/${chave}`;
}

/** Metadados de um objeto já presente no bucket, ou `null` se não existir. */
export async function consultarObjeto(
  chave: string,
): Promise<{ sha256: string | null; bytes: number | null } | null> {
  try {
    const r = await cliente().send(
      new HeadObjectCommand({ Bucket: exigir("STORAGE_BUCKET"), Key: chave }),
    );
    return {
      sha256: r.Metadata?.sha256 ?? null,
      bytes: typeof r.ContentLength === "number" ? r.ContentLength : null,
    };
  } catch (erro) {
    const status = (erro as { $metadata?: { httpStatusCode?: number } })
      .$metadata?.httpStatusCode;
    if (status === 404) return null;
    throw erro;
  }
}

/**
 * Envia o objeto. O SHA-256 vai como metadado para que uma execução futura
 * possa detectar conflito de conteúdo sem baixar o arquivo de volta.
 * Nunca apaga nem sobrescreve por conta própria — quem decide é o chamador.
 */
export async function enviarObjeto(
  chave: string,
  corpo: Buffer,
  mimeType: string,
  sha256: string,
): Promise<void> {
  await cliente().send(
    new PutObjectCommand({
      Bucket: exigir("STORAGE_BUCKET"),
      Key: chave,
      Body: corpo,
      ContentType: mimeType,
      Metadata: { sha256 },
    }),
  );
}

/**
 * Baixa um objeto inteiro para memória. Usado pelo empacotamento do
 * "Baixar tudo (.zip)", que roda em build sobre um acervo de projeto de
 * pesquisa — volume pequeno o bastante para não justificar streaming.
 */
export async function baixarObjeto(chave: string): Promise<Buffer> {
  const r = await cliente().send(
    new GetObjectCommand({ Bucket: exigir("STORAGE_BUCKET"), Key: chave }),
  );
  if (!r.Body) throw new Error(`Objeto ${chave} veio sem corpo.`);
  return Buffer.from(await r.Body.transformToByteArray());
}

/** `true` quando as quatro variáveis de acesso ao R2 estão definidas. */
export function credenciaisDeStoragePresentes(): boolean {
  return [
    "STORAGE_ENDPOINT",
    "STORAGE_BUCKET",
    "STORAGE_ACCESS_KEY",
    "STORAGE_SECRET",
  ].every((nome) => Boolean(process.env[nome]));
}
