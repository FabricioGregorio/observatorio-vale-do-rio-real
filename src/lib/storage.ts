/**
 * Acesso ao armazenamento de objetos — Cloudflare R2 pela API S3-compatível.
 *
 * O provedor é decisão de infraestrutura; o código fala S3 e nada
 * mais. Trocar de provedor é mudar endpoint e credencial, não código.
 * Credenciais vêm sempre do ambiente, nunca do código.
 *
 */
import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

import { exigirConfiguracao as exigir } from "./storage-configuracao";

let clienteMemo: S3Client | null = null;

/** Política aprovada para a primeira publicação pública; deliberadamente sem `immutable`. */
export const CACHE_CONTROL_PUBLICO = "public, max-age=86400";

/** Cliente S3 apontado para o R2. Criado sob demanda, uma vez por processo. */
export function cliente(): S3Client {
  if (clienteMemo) return clienteMemo;
  clienteMemo = new S3Client({
    region: "auto",
    endpoint: exigir("STORAGE_PUBLIC_ENDPOINT"),
    credentials: {
      accessKeyId: exigir("STORAGE_PUBLIC_ACCESS_KEY"),
      secretAccessKey: exigir("STORAGE_PUBLIC_SECRET"),
    },
  });
  return clienteMemo;
}

/** URL pública do objeto, sob o domínio próprio. */
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
      new HeadObjectCommand({
        Bucket: exigir("STORAGE_PUBLIC_BUCKET"),
        Key: chave,
      }),
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
      Bucket: exigir("STORAGE_PUBLIC_BUCKET"),
      Key: chave,
      Body: corpo,
      ContentType: mimeType,
      CacheControl: CACHE_CONTROL_PUBLICO,
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
    new GetObjectCommand({
      Bucket: exigir("STORAGE_PUBLIC_BUCKET"),
      Key: chave,
    }),
  );
  if (!r.Body) throw new Error(`Objeto ${chave} veio sem corpo.`);
  return Buffer.from(await r.Body.transformToByteArray());
}

/** `true` quando as quatro variáveis de acesso ao R2 estão definidas. */
export function credenciaisDeStoragePresentes(): boolean {
  return [
    "STORAGE_PUBLIC_ENDPOINT",
    "STORAGE_PUBLIC_BUCKET",
    "STORAGE_PUBLIC_ACCESS_KEY",
    "STORAGE_PUBLIC_SECRET",
  ].every((nome) => Boolean(process.env[nome]));
}
