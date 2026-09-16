import type { MetadataRoute } from "next";

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

export default function sitemap(): MetadataRoute.Sitemap {
  return ROTAS_PUBLICAS.map((pathname) => ({
    url: urlDoSite(pathname).href,
  }));
}
