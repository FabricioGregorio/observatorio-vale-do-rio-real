import { createHash } from "node:crypto";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { afterEach, describe, expect, test, vi } from "vitest";
import {
  consultarObjetoPrivado,
  enviarObjetoPrivado,
  removerObjetoCriado,
} from "../src/lib/storage-privado";

const simulado = vi.hoisted(() => ({
  send: vi.fn<
    (
      comando:
        | PutObjectCommand
        | GetObjectCommand
        | HeadObjectCommand
        | DeleteObjectCommand,
    ) => Promise<unknown>
  >(),
  destroy: vi.fn<() => void>(),
}));
vi.mock("@aws-sdk/client-s3", async (importOriginal) => {
  const original = await importOriginal<typeof import("@aws-sdk/client-s3")>();
  return {
    ...original,
    S3Client: class {
      send = simulado.send;
      destroy = simulado.destroy;
    },
  };
});

const chave = "arquivos/publicidade/teste-v1.pdf";
const corpo = Buffer.from("somente teste unitário");
const hash = createHash("sha256").update(corpo).digest("hex");
const ausente = (nome: string) =>
  Object.assign(new Error(nome), { name: nome });
const resposta = (execucao = "esta") => ({
  Body: { transformToByteArray: async () => corpo },
  ETag: '"não-é-sha256"',
  Metadata: { sha256: "metadado-falso", execucao },
});

afterEach(() => {
  vi.resetAllMocks();
  vi.unstubAllEnvs();
});

function simularCliente() {
  vi.stubEnv("STORAGE_PRIVATE_ENDPOINT", "https://storage.invalid");
  vi.stubEnv("STORAGE_PRIVATE_BUCKET", "bucket-unitario");
  vi.stubEnv("STORAGE_PRIVATE_ACCESS_KEY", "teste");
  vi.stubEnv("STORAGE_PRIVATE_SECRET", "teste");
  return simulado;
}

describe("contrato S3 privado — nenhum acesso de rede", () => {
  test("PUT é condicional, sem ACL e com identificação da criação", async () => {
    const { send, destroy } = simularCliente();
    send.mockResolvedValue({});
    await enviarObjetoPrivado(chave, corpo, "application/pdf", hash, "esta");
    expect(send.mock.calls[0]?.[0]).toBeInstanceOf(PutObjectCommand);
    expect(send.mock.calls[0]?.[0].input).toEqual({
      Bucket: "bucket-unitario",
      Key: chave,
      Body: corpo,
      ContentType: "application/pdf",
      Metadata: { sha256: hash, execucao: "esta" },
      IfNoneMatch: "*",
    });
    expect(send.mock.calls[0]?.[0].input).not.toHaveProperty("CacheControl");
    expect(destroy).toHaveBeenCalledOnce();
  });

  test("GET recalcula SHA-256 e bytes; ignora hash declarado e ETag", async () => {
    const { send } = simularCliente();
    send.mockResolvedValue(resposta());
    expect(await consultarObjetoPrivado(chave)).toEqual({
      sha256: hash,
      bytes: corpo.length,
      etag: '"não-é-sha256"',
      execucao: "esta",
    });
    expect(send.mock.calls[0]?.[0]).toBeInstanceOf(GetObjectCommand);
  });

  test("chave ausente retorna null, mas acesso negado não vira ausência", async () => {
    const { send, destroy } = simularCliente();
    send.mockRejectedValueOnce(ausente("NoSuchKey"));
    expect(await consultarObjetoPrivado(chave)).toBeNull();
    send.mockRejectedValueOnce(ausente("AccessDenied"));
    await expect(consultarObjetoPrivado(chave)).rejects.toThrow("AccessDenied");
    expect(destroy).toHaveBeenCalledTimes(2);
  });

  test("compensação confirma propriedade, DELETE condicional e HEAD ausente", async () => {
    const { send } = simularCliente();
    send
      .mockResolvedValueOnce(resposta())
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce(ausente("NotFound"));
    await removerObjetoCriado(chave, "esta");
    expect(send.mock.calls[1]?.[0]).toBeInstanceOf(DeleteObjectCommand);
    expect(send.mock.calls[1]?.[0].input).toEqual({
      Bucket: "bucket-unitario",
      Key: chave,
      IfMatch: '"não-é-sha256"',
    });
    expect(send.mock.calls[2]?.[0]).toBeInstanceOf(HeadObjectCommand);
  });

  test("outra execução nunca é apagada", async () => {
    const { send } = simularCliente();
    send.mockResolvedValueOnce(resposta("outra"));
    await expect(removerObjetoCriado(chave, "esta")).rejects.toThrow(
      "recusada",
    );
    expect(send).toHaveBeenCalledOnce();
  });

  test("DELETE 200 não basta quando HEAD ainda encontra o objeto", async () => {
    const { send } = simularCliente();
    send
      .mockResolvedValueOnce(resposta())
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({});
    await expect(removerObjetoCriado(chave, "esta")).rejects.toThrow(
      "ainda existe",
    );
  });
});
