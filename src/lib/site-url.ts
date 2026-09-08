import type { Metadata } from "next";
import { z } from "zod";

const SITE_URL_LOCAL = "https://observatoriotobiassoueu.com.br";

const origemSchema = z
  .url()
  .transform((valor) => new URL(valor))
  .refine((url) => url.protocol === "https:", {
    message: "SITE_URL deve usar HTTPS.",
  })
  .refine(
    (url) => url.pathname === "/" && !url.search && !url.hash && !url.username,
    { message: "SITE_URL deve conter somente a origem canônica do site." },
  );

/**
 * Origem canônica server-side do site institucional.
 *
 * Em produção, a configuração é obrigatória para impedir que um deploy gere
 * metadados silenciosamente com origem local ou de preview. Development e
 * test usam a origem pública decidida como fallback determinístico.
 */
export function obterSiteUrl(
  valor: string | undefined = process.env.SITE_URL,
  ambiente: string | undefined = process.env.NODE_ENV,
): URL {
  if (!valor?.trim() && ambiente === "production") {
    throw new Error(
      "SITE_URL ausente: builds de produção exigem a origem canônica do site.",
    );
  }

  const url = origemSchema.parse(valor?.trim() || SITE_URL_LOCAL);
  return new URL(url.origin);
}
export function urlDoSite(pathname: string): URL {
  return new URL(pathname, obterSiteUrl());
}

type OpcoesMetadados = {
  pathname: string;
  titulo: string;
  descricao?: string;
  robots?: Metadata["robots"];
};

/** Metadados absolutos de uma rota, sempre derivados da mesma SITE_URL. */
export function metadadosDaRota({
  pathname,
  titulo,
  descricao,
  robots,
}: OpcoesMetadados): Metadata {
  const url = urlDoSite(pathname);

  return {
    title: titulo,
    ...(descricao ? { description: descricao } : {}),
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      siteName: "Observatório do Vale do Rio Real",
      title: titulo,
      ...(descricao ? { description: descricao } : {}),
      url,
    },
    ...(robots ? { robots } : {}),
  };
}
