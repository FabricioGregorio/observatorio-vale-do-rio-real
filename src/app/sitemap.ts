import type { MetadataRoute } from "next";

import { listarDocumentosPublicos } from "../dados/consultas/acervo";
import { urlDoSite } from "../lib/site-url";

const ROTAS_PUBLICAS = [
  "/",
  "/observatorio",
  "/pesquisa",
  "/territorio",
  "/dados",
  "/campo",
  "/podobservar",
  "/acervo",
  "/prestacao-de-contas",
  "/imprensa",
  "/acessibilidade",
  "/privacidade",
  "/contato",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const documentos = await listarDocumentosPublicos();
  return [
    ...ROTAS_PUBLICAS.map((pathname) => ({ url: urlDoSite(pathname).href })),
    ...documentos.map((documento) => ({
      url: urlDoSite(`/acervo/${documento.slug}`).href,
    })),
    ...documentos.flatMap((documento) =>
      documento.arquivos.map((arquivo) => ({
        url: urlDoSite(`/acervo/${documento.slug}/arquivo/${arquivo.arquivoId}`)
          .href,
      })),
    ),
  ];
}
