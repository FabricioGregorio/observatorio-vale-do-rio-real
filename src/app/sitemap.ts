import type { MetadataRoute } from "next";

import { listarDocumentosPublicos } from "../dados/publicado/acervo";
import { listarEpisodiosPublicos } from "../dados/publicado/podobservar";
import { urlDoSite } from "../lib/site-url";

/**
 * As rotas indexáveis do site.
 *
 * `/prestacao-de-contas` e `/prestacao-de-contas/imprimir` saíram em
 * 2026-09-23: elas respondem com redirect permanente para `/acervo`, e um
 * redirect não é página. Anunciá-lo no sitemap pediria ao buscador que
 * indexasse um endereço cujo conteúdo canônico já está listado aqui.
 */
export const ROTAS_PUBLICAS = [
  "/",
  "/observatorio",
  "/pesquisa",
  "/territorio",
  "/dados",
  "/campo",
  "/podobservar",
  "/acervo",
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
      em `episodios.json`, então não há o que filtrar aqui — anunciar no
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
