import type { MetadataRoute } from "next";

import { listarDocumentosPublicos } from "../dados/consultas/acervo";
import { listarEpisodiosPublicos } from "../dados/consultas/podobservar";
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
  "/acessibilidade",
  "/privacidade",
  "/contato",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [documentos, episodios] = await Promise.all([
    listarDocumentosPublicos(),
    listarEpisodiosPublicos(),
  ]);
  return [
    ...ROTAS_PUBLICAS.map((pathname) => ({ url: urlDoSite(pathname).href })),
    /*
      Somente episódios que passaram pelo gate: a mesma fonte que gera as
      páginas. Rascunho, em revisão, arquivado e datado no futuro não estão
      em `vw_episodio_publico`, então não há o que filtrar aqui — anunciar no
      sitemap uma URL que responde 404 seria pior do que não anunciar.
    */
    ...episodios.map((episodio) => ({
      url: urlDoSite(
        `/podobservar/t${episodio.temporadaNumero}/${episodio.slug}`,
      ).href,
    })),
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
