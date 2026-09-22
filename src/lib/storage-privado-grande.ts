/**
 * Caminho privado para objetos grandes — masters do PodObservar.
 *
 * `storage-privado.ts` existe e continua válido para o acervo documental: ele
 * recebe `Buffer`, faz um `PutObject` único e confere o objeto baixando-o
 * inteiro. O maior objeto já ingerido por aquele caminho tem 108 MB. Os
 * masters do podcast têm 379–513 MB, e por ali cada um custaria o arquivo
 * inteiro em memória para subir, mais o arquivo inteiro de novo para conferir.
 *
 * Este módulo troca as três suposições que não escalam:
 *
 * 1. **Streaming no lugar de `Buffer`.** `Upload` do `@aws-sdk/lib-storage`
 *    consome um `ReadStream` e envia em partes; a memória fica limitada a
 *    `PARTE_BYTES × CONCORRENCIA`, não ao tamanho do arquivo.
 * 2. **`HeadObject` no lugar de `GetObject`.** Conferir existência e tamanho
 *    não exige baixar meio gigabyte. O SHA-256 é calculado no arquivo local,
 *    por streaming, antes do envio, e viaja como metadado do objeto.
 * 3. **Abort automático.** `leavePartsOnError: false` faz o SDK abortar o
 *    multipart pendente quando o envio falha, para não deixar partes pagas e
 *    invisíveis no bucket.
 *
 * O que **não** muda: o objeto é privado, sem ACL, sem `url_publica` e sem URL
 * assinada. Nada aqui gera endereço público, e esse é o contrato.
 */

import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { HeadObjectCommand, type S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { bucketPrivado, clientePrivado } from "./storage-privado";

/**
 * 32 MiB por parte, duas em voo.
 *
 * O limite de 10.000 partes por multipart torna 32 MiB suficiente para ~312
 * GB — folga larga para masters de meia hora. Com concorrência 2, o teto de
 * memória do envio fica em ~64 MiB, independentemente do tamanho do arquivo.
 */
const PARTE_BYTES = 32 * 1024 * 1024;
const CONCORRENCIA = 2;

export type ObjetoPrivadoDescrito = {
  bytes: number;
  etag: string;
  /** SHA-256 declarado no metadado pelo envio que criou o objeto. */
  sha256: string | null;
  /** Marca de propriedade da execução que criou o objeto. */
  execucao: string | null;
};

/**
 * SHA-256 do arquivo local sem carregá-lo em memória.
 *
 * É este o hash que prova integridade. O ETag do S3 **não** serve: em
 * multipart ele é hash de hashes das partes, e depende do tamanho de parte
 * escolhido — dois envios corretos do mesmo arquivo podem ter ETags
 * diferentes.
 */
export async function hashDeArquivo(caminho: string): Promise<string> {
  const hash = createHash("sha256");
  const fluxo = createReadStream(caminho);
  for await (const bloco of fluxo) hash.update(bloco as Buffer);
  return hash.digest("hex");
}

/** `null` quando a chave não existe. Nunca baixa o corpo. */
export async function descreverObjetoPrivado(
  chave: string,
): Promise<ObjetoPrivadoDescrito | null> {
  const cliente = clientePrivado();
  try {
    const resposta = await cliente.send(
      new HeadObjectCommand({ Bucket: bucketPrivado(), Key: chave }),
    );
    return {
      bytes: resposta.ContentLength ?? -1,
      etag: resposta.ETag ?? "",
      sha256: resposta.Metadata?.sha256 ?? null,
      execucao: resposta.Metadata?.execucao ?? null,
    };
  } catch (erro) {
    const nome = erro instanceof Error ? erro.name : "";
    if (nome === "NotFound" || nome === "NoSuchKey") return null;
    throw erro;
  } finally {
    cliente.destroy();
  }
}

/**
 * Envia o arquivo local como objeto privado, por multipart e streaming.
 *
 * `sha256` e `execucao` vão como metadado do objeto: o primeiro permite provar
 * equivalência numa reexecução sem baixar o corpo, e o segundo é o que
 * autoriza a compensação a remover apenas o que esta execução criou.
 *
 * Não confere existência prévia: quem chama decide isso, porque a decisão de
 * idempotência precisa ser auditável fora do caminho de rede.
 */
export async function enviarMasterPrivado(
  chave: string,
  caminhoLocal: string,
  mimeType: string,
  sha256: string,
  execucao: string,
  aoProgredir?: (enviados: number) => void,
): Promise<void> {
  const cliente: S3Client = clientePrivado();
  try {
    const envio = new Upload({
      client: cliente,
      params: {
        Bucket: bucketPrivado(),
        Key: chave,
        Body: createReadStream(caminhoLocal),
        ContentType: mimeType,
        Metadata: { sha256, execucao },
      },
      queueSize: CONCORRENCIA,
      partSize: PARTE_BYTES,
      // Falha não deixa partes órfãs pagas e invisíveis no bucket.
      leavePartsOnError: false,
    });
    if (aoProgredir) {
      envio.on("httpUploadProgress", (p) => aoProgredir(p.loaded ?? 0));
    }
    await envio.done();
  } finally {
    cliente.destroy();
  }
}
