import { createHash } from "node:crypto";
import {
  type AnexoPublico,
  listarAnexosPublicos,
} from "../../../dados/publicado/anexos";

export const dynamic = "force-dynamic";

let consulta: { ate: number; valor: Promise<AnexoPublico[]> } | null = null;

function anexosRecentes(): Promise<AnexoPublico[]> {
  if (consulta && Date.now() < consulta.ate) return consulta.valor;
  const valor = listarAnexosPublicos();
  consulta = { ate: Date.now() + 60_000, valor };
  valor.catch(() => {
    if (consulta?.valor === valor) consulta = null;
  });
  return valor;
}

async function arquivoAutorizado(arquivoId: string) {
  if (!/^[a-f0-9-]{36}$/i.test(arquivoId)) return null;
  return (
    (await anexosRecentes()).find((item) => item.arquivoId === arquivoId) ??
    null
  );
}

export async function HEAD(
  _request: Request,
  { params }: { params: Promise<{ arquivoId: string }> },
) {
  const arquivo = await arquivoAutorizado((await params).arquivoId);
  if (!arquivo) return new Response(null, { status: 404 });
  return new Response(null, {
    headers: {
      "Content-Type": arquivo.mimeType,
      "Content-Length": String(arquivo.bytes),
      "Cache-Control": "private, no-store",
    },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ arquivoId: string }> },
) {
  const { arquivoId } = await params;
  const arquivo = await arquivoAutorizado(arquivoId);
  if (!arquivo) return new Response(null, { status: 404 });

  const base = process.env.STORAGE_PUBLIC_URL?.replace(/\/+$/, "");
  if (!base || !arquivo.linkPermanente.startsWith(`${base}/`)) {
    throw new Error("Download fora do storage público configurado.");
  }
  const resposta = await fetch(arquivo.linkPermanente, { cache: "no-store" });
  if (!resposta.ok) return new Response(null, { status: 502 });
  const bytes = new Uint8Array(await resposta.arrayBuffer());
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  if (bytes.byteLength !== arquivo.bytes || sha256 !== arquivo.sha256) {
    throw new Error(`Integridade divergente no download ${arquivoId}.`);
  }
  const nome =
    arquivo.nomeOriginal ||
    decodeURIComponent(
      new URL(arquivo.linkPermanente).pathname.split("/").pop() || "arquivo",
    );
  const nomeSeguro = nome.replace(/[\r\n"\\]/g, "_");
  return new Response(bytes, {
    headers: {
      "Content-Type": arquivo.mimeType,
      "Content-Length": String(bytes.byteLength),
      "Content-Disposition": `attachment; filename="${nomeSeguro.replace(/[^\x20-\x7e]/g, "_")}"; filename*=UTF-8''${encodeURIComponent(nomeSeguro)}`,
      "Cache-Control": "private, no-store",
    },
  });
}
