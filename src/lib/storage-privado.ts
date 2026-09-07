/** API autenticada privada. Não gera URL pública nem configura ACL. */
import { createHash } from "node:crypto";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { exigirConfiguracao as exigir } from "./storage-configuracao";

export function clientePrivado(): S3Client {
  return new S3Client({
    // Uma falha de rede no PUT exige reconciliação; não repetir às cegas.
    maxAttempts: 1,
    region: "auto",
    endpoint: exigir("STORAGE_PRIVATE_ENDPOINT"),
    credentials: {
      accessKeyId: exigir("STORAGE_PRIVATE_ACCESS_KEY"),
      secretAccessKey: exigir("STORAGE_PRIVATE_SECRET"),
    },
  });
}

/**
 * Nome do bucket privado, para registrar em `arquivo.bucket`.
 *
 * O banco precisa dizer em qual bucket o objeto está: `chave_storage`
 * sozinha é ambígua com dois buckets.
 */
export function bucketPrivado(): string {
  return exigir("STORAGE_PRIVATE_BUCKET");
}

export async function enviarObjetoPrivado(
  chave: string,
  corpo: Buffer,
  mimeType: string,
  sha256: string,
  execucao?: string,
): Promise<void> {
  const cliente = clientePrivado();
  try {
    await cliente.send(
      new PutObjectCommand({
        Bucket: exigir("STORAGE_PRIVATE_BUCKET"),
        Key: chave,
        Body: corpo,
        ContentType: mimeType,
        Metadata: execucao ? { sha256, execucao } : { sha256 },
        IfNoneMatch: "*",
      }),
    );
  } finally {
    cliente.destroy();
  }
}

export type ObjetoPrivado = {
  sha256: string;
  bytes: number;
  etag: string;
  execucao: string | null;
};

/** Hash calculado do corpo remoto, nunca do ETag ou do metadado declarado. */
export async function consultarObjetoPrivado(
  chave: string,
): Promise<ObjetoPrivado | null> {
  const cliente = clientePrivado();
  try {
    const resposta = await cliente.send(
      new GetObjectCommand({ Bucket: bucketPrivado(), Key: chave }),
    );
    if (!resposta.Body) throw new Error("Objeto privado sem corpo.");
    const corpo = await resposta.Body.transformToByteArray();
    if (!resposta.ETag) throw new Error("Objeto privado sem identificador.");
    return {
      sha256: createHash("sha256").update(corpo).digest("hex"),
      bytes: corpo.byteLength,
      etag: resposta.ETag,
      execucao: resposta.Metadata?.execucao ?? null,
    };
  } catch (erro) {
    if (erro instanceof Error && erro.name === "NoSuchKey") return null;
    throw erro;
  } finally {
    cliente.destroy();
  }
}

/** Compensa apenas criação identificada nesta execução e confirma a ausência. */
export async function removerObjetoCriado(
  chave: string,
  execucao: string,
): Promise<void> {
  const atual = await consultarObjetoPrivado(chave);
  if (!atual) return;
  if (atual.execucao !== execucao)
    throw new Error(
      `Compensação recusada: ${chave} pertence a outra execução.`,
    );
  const cliente = clientePrivado();
  try {
    await cliente.send(
      new DeleteObjectCommand({
        Bucket: bucketPrivado(),
        Key: chave,
        // ETag é condição de exclusão, não prova de integridade.
        IfMatch: atual.etag,
      }),
    );
    try {
      await cliente.send(
        new HeadObjectCommand({ Bucket: bucketPrivado(), Key: chave }),
      );
    } catch (erro) {
      if (erro instanceof Error && erro.name === "NotFound") return;
      throw erro;
    }
    throw new Error(`Compensação não confirmada: ${chave} ainda existe.`);
  } finally {
    cliente.destroy();
  }
}

export async function baixarObjetoPrivado(chave: string): Promise<Buffer> {
  const cliente = clientePrivado();
  try {
    const resposta = await cliente.send(
      new GetObjectCommand({
        Bucket: exigir("STORAGE_PRIVATE_BUCKET"),
        Key: chave,
      }),
    );
    if (!resposta.Body) throw new Error("Objeto privado sem corpo.");
    return Buffer.from(await resposta.Body.transformToByteArray());
  } finally {
    cliente.destroy();
  }
}
