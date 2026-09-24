import { createHash } from "node:crypto";
import { zipSync } from "fflate";

import type { EvidenciaDeAnexo } from "../dados/evidencia-de-anexo";
import { podePublicar } from "./manifesto-evidencias";
import { nomeNoPacote } from "./zip-anexos";

type Dependencias = {
  baixar: (chave: string) => Promise<Buffer>;
  enviar: (
    chave: string,
    corpo: Buffer,
    mime: string,
    sha256: string,
  ) => Promise<void>;
};

export type ResultadoZipPublico =
  | { estado: "sem_candidatos"; quantidade: 0 }
  | { estado: "publicado"; quantidade: number; sha256: string };

function chaveDaUrl(url: string, base: string): string {
  return url.startsWith(`${base}/`) ? url.slice(base.length + 1) : url;
}

/** Gera ZIP apenas a partir do gate canônico do Manifesto. */
export async function gerarZipPublico(
  evidencias: readonly EvidenciaDeAnexo[],
  dependencias: Dependencias,
  chaveDestino: string,
  baseUrl: string,
): Promise<ResultadoZipPublico> {
  const elegiveis = evidencias.filter(
    ({ manifesto }) =>
      podePublicar(manifesto) && manifesto.url?.startsWith(`${baseUrl}/`),
  );
  if (elegiveis.length === 0) {
    return { estado: "sem_candidatos", quantidade: 0 };
  }

  const conteudo: Record<string, Uint8Array> = {};
  for (const { manifesto, anexo } of elegiveis) {
    const bytes = await dependencias.baixar(
      chaveDaUrl(manifesto.url as string, baseUrl),
    );
    const sha = createHash("sha256").update(bytes).digest("hex");
    if (sha !== manifesto.sha256) {
      throw new Error(
        `hash divergente para ${manifesto.codigo}; ZIP não publicado.`,
      );
    }
    const nome = nomeNoPacote(anexo.slug, manifesto.url as string);
    if (conteudo[nome]) {
      throw new Error(`nome duplicado no ZIP público: ${nome}.`);
    }
    conteudo[nome] = new Uint8Array(bytes);
  }

  const pacote = Buffer.from(zipSync(conteudo, { level: 0 }));
  const sha256 = createHash("sha256").update(pacote).digest("hex");
  await dependencias.enviar(chaveDestino, pacote, "application/zip", sha256);
  return { estado: "publicado", quantidade: elegiveis.length, sha256 };
}
