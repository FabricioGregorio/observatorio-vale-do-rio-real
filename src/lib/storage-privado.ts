/** API autenticada privada. Não gera URL pública nem configura ACL. */
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { exigirConfiguracao as exigir } from "./storage-configuracao";

export function clientePrivado(): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: exigir("STORAGE_PRIVATE_ENDPOINT"),
    credentials: {
      accessKeyId: exigir("STORAGE_PRIVATE_ACCESS_KEY"),
      secretAccessKey: exigir("STORAGE_PRIVATE_SECRET"),
    },
  });
}

export async function enviarObjetoPrivado(
  chave: string,
  corpo: Buffer,
  mimeType: string,
  sha256: string,
): Promise<void> {
  const cliente = clientePrivado();
  try {
    await cliente.send(
      new PutObjectCommand({
        Bucket: exigir("STORAGE_PRIVATE_BUCKET"),
        Key: chave,
        Body: corpo,
        ContentType: mimeType,
        Metadata: { sha256 },
        IfNoneMatch: "*",
      }),
    );
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
