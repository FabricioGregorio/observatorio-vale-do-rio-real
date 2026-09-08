import { createHash } from "node:crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { afterEach, describe, expect, test, vi } from "vitest";
import { CACHE_CONTROL_PUBLICO, enviarObjeto } from "../src/lib/storage";

const simulado = vi.hoisted(() => ({
  send: vi.fn<(comando: PutObjectCommand) => Promise<unknown>>(),
}));

vi.mock("@aws-sdk/client-s3", async (importOriginal) => {
  const original = await importOriginal<typeof import("@aws-sdk/client-s3")>();
  return {
    ...original,
    S3Client: class {
      send = simulado.send;
    },
  };
});

afterEach(() => {
  vi.resetAllMocks();
  vi.unstubAllEnvs();
});

describe("contrato S3 público — nenhum acesso de rede", () => {
  test("PUT envia cache de um dia, MIME real e nenhuma ACL manual", async () => {
    vi.stubEnv("STORAGE_PUBLIC_ENDPOINT", "https://storage.invalid");
    vi.stubEnv("STORAGE_PUBLIC_BUCKET", "bucket-publico-unitario");
    vi.stubEnv("STORAGE_PUBLIC_ACCESS_KEY", "teste");
    vi.stubEnv("STORAGE_PUBLIC_SECRET", "teste");
    simulado.send.mockResolvedValue({});

    const chave = "arquivos/publicidade/exemplo-v1.pdf";
    const corpo = Buffer.from("somente teste unitário");
    const sha256 = createHash("sha256").update(corpo).digest("hex");

    await enviarObjeto(chave, corpo, "application/pdf", sha256);

    const comando = simulado.send.mock.calls[0]?.[0];
    expect(comando).toBeInstanceOf(PutObjectCommand);
    expect(comando?.input).toEqual({
      Bucket: "bucket-publico-unitario",
      Key: chave,
      Body: corpo,
      ContentType: "application/pdf",
      CacheControl: "public, max-age=86400",
      Metadata: { sha256 },
    });
    expect(comando?.input).not.toHaveProperty("ACL");
    expect(CACHE_CONTROL_PUBLICO).not.toContain("immutable");
  });
});
