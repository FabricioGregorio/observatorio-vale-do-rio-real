import { createHash, randomUUID } from "node:crypto";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { describe, expect, test } from "vitest";
import {
  baixarObjeto,
  cliente,
  enviarObjeto,
  urlPublica,
} from "../src/lib/storage";
import { exigirConfiguracao as exigir } from "../src/lib/storage-configuracao";
import {
  baixarObjetoPrivado,
  clientePrivado,
  enviarObjetoPrivado,
} from "../src/lib/storage-privado";

const nomes = [
  "STORAGE_PUBLIC_ENDPOINT",
  "STORAGE_PUBLIC_BUCKET",
  "STORAGE_PUBLIC_ACCESS_KEY",
  "STORAGE_PUBLIC_SECRET",
  "STORAGE_PUBLIC_URL",
  "STORAGE_PRIVATE_ENDPOINT",
  "STORAGE_PRIVATE_BUCKET",
  "STORAGE_PRIVATE_ACCESS_KEY",
  "STORAGE_PRIVATE_SECRET",
];
const configurado = nomes.every((nome) => Boolean(process.env[nome]?.trim()));
const hash = (corpo: Buffer) =>
  createHash("sha256").update(corpo).digest("hex");
function status(erro: unknown): number | undefined {
  return (erro as { $metadata?: { httpStatusCode?: number } })?.$metadata
    ?.httpStatusCode;
}
async function seguro(acao: () => Promise<void>): Promise<void> {
  try {
    await acao();
  } catch (erro) {
    // Nunca repassar erro do SDK, URL, corpo ou detalhes de credenciais ao runner.
    throw new Error(
      `Validação storage falhou; HTTP S3=${status(erro) ?? "não disponível"}. Consulte as etapas sanitizadas acima.`,
    );
  }
}
async function anonimo(url: string, corpo: Buffer, rotulo: string) {
  const resposta = await fetch(url, {
    redirect: "manual",
    signal: AbortSignal.timeout(15000),
  });
  const bytes = Buffer.from(await resposta.arrayBuffer());
  const tipo = resposta.headers.get("content-type")?.split(";")[0] ?? "ausente";
  const natureza = bytes.equals(corpo)
    ? "objeto real"
    : bytes.length === 0
      ? "vazio"
      : /^\s*</.test(bytes.toString("utf8"))
        ? "XML/HTML"
        : "outro corpo";
  console.log(
    rotulo,
    JSON.stringify({
      http: resposta.status,
      tipo: /^[\w.+/-]+$/.test(tipo) ? tipo : "omitido",
      natureza,
      redirect: resposta.status >= 300 && resposta.status < 400,
    }),
  );
  return { resposta, bytes };
}
async function limpar(s3: S3Client, bucket: string, chave: string) {
  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: chave }));
  let codigo: number | undefined;
  try {
    await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: chave }));
  } catch (erro) {
    codigo = status(erro);
  }
  expect(codigo).toBe(404);
  console.log("Limpeza autenticada confirmada: 404");
}

describe.skipIf(!configurado)("integração real R2", () => {
  test(
    "público: upload, leituras, integridade e remoção",
    () =>
      seguro(async () => {
        const chave = `testes-infraestrutura/${randomUUID()}.txt`;
        const corpo = Buffer.from(`Teste descartável público ${randomUUID()}`);
        try {
          await enviarObjeto(chave, corpo, "text/plain", hash(corpo));
          expect(hash(await baixarObjeto(chave))).toBe(hash(corpo));
          const { resposta, bytes } = await anonimo(
            urlPublica(chave),
            corpo,
            "Público",
          );
          expect(resposta.status).toBe(200);
          expect(resposta.headers.get("content-type")).toContain("text/plain");
          expect(bytes.equals(corpo)).toBe(true);
          expect(hash(bytes)).toBe(hash(corpo));
        } finally {
          await limpar(cliente(), exigir("STORAGE_PUBLIC_BUCKET"), chave);
          const { resposta, bytes } = await anonimo(
            urlPublica(chave),
            corpo,
            "Público após remoção",
          );
          expect(bytes.equals(corpo)).toBe(false);
          expect([403, 404, 410]).toContain(resposta.status);
        }
      }),
    60000,
  );

  test(
    "privado: autenticado, anônimo e remoção",
    () =>
      seguro(async () => {
        const chave = `testes-infraestrutura/${randomUUID()}.txt`;
        const corpo = Buffer.from(`Teste descartável privado ${randomUUID()}`);
        const s3 = clientePrivado();
        try {
          await enviarObjetoPrivado(chave, corpo, "text/plain", hash(corpo));
          expect(hash(await baixarObjetoPrivado(chave))).toBe(hash(corpo));
          console.log("Privado autenticado: integridade confirmada");
          const url = `${exigir("STORAGE_PRIVATE_ENDPOINT").replace(/\/+$/, "")}/${encodeURIComponent(exigir("STORAGE_PRIVATE_BUCKET"))}/${chave}`;
          const { resposta, bytes } = await anonimo(
            url,
            corpo,
            "Privado anônimo API S3",
          );
          expect(bytes.includes(corpo)).toBe(false);
          // Redirect ou 200 intermediário bloqueia aprovação e exige investigação.
          // O endpoint S3 do R2 responde 400 InvalidArgument/Authorization para
          // requisição sem assinatura; é um erro intermediário, não o binário.
          expect([400, 401, 403, 404]).toContain(resposta.status);
          expect(resposta.headers.get("location")).toBeNull();
        } finally {
          try {
            await limpar(s3, exigir("STORAGE_PRIVATE_BUCKET"), chave);
          } finally {
            s3.destroy();
          }
        }
      }),
    60000,
  );

  test(
    "credenciais não leem objeto do outro bucket",
    () =>
      seguro(async () => {
        const chave = `testes-infraestrutura/${randomUUID()}.txt`;
        const corpo = Buffer.from(
          `Teste descartável isolamento ${randomUUID()}`,
        );
        const privado = clientePrivado();
        try {
          await enviarObjeto(chave, corpo, "text/plain", hash(corpo));
          await enviarObjetoPrivado(chave, corpo, "text/plain", hash(corpo));
          for (const [
            rotulo,
            endpoint,
            bucket,
            accessKeyId,
            secretAccessKey,
          ] of [
            [
              "pública contra privado",
              exigir("STORAGE_PRIVATE_ENDPOINT"),
              exigir("STORAGE_PRIVATE_BUCKET"),
              exigir("STORAGE_PUBLIC_ACCESS_KEY"),
              exigir("STORAGE_PUBLIC_SECRET"),
            ],
            [
              "privada contra público",
              exigir("STORAGE_PUBLIC_ENDPOINT"),
              exigir("STORAGE_PUBLIC_BUCKET"),
              exigir("STORAGE_PRIVATE_ACCESS_KEY"),
              exigir("STORAGE_PRIVATE_SECRET"),
            ],
          ] as const) {
            const cruzado = new S3Client({
              region: "auto",
              endpoint,
              credentials: { accessKeyId, secretAccessKey },
            });
            let negado = false;
            try {
              const leitura = await cruzado.send(
                new GetObjectCommand({ Bucket: bucket, Key: chave }),
              );
              await leitura.Body?.transformToByteArray();
            } catch (erro) {
              negado = status(erro) === 403;
            } finally {
              cruzado.destroy();
            }
            console.log(
              rotulo,
              negado ? "acesso negado HTTP 403" : "isolamento NÃO comprovado",
            );
            expect.soft(negado).toBe(true);
          }
        } finally {
          const resultados = await Promise.allSettled([
            limpar(cliente(), exigir("STORAGE_PUBLIC_BUCKET"), chave),
            limpar(privado, exigir("STORAGE_PRIVATE_BUCKET"), chave),
          ]);
          privado.destroy();
          expect(resultados.every((r) => r.status === "fulfilled")).toBe(true);
        }
      }),
    60000,
  );
});
