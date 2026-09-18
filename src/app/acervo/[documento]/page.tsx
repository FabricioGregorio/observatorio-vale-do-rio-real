import type { Metadata, Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  listarDocumentosPublicos,
  selecionarDocumentoPublico,
  tituloDoArquivoPublico,
} from "../../../dados/consultas/acervo";
import {
  gruposB01NaOrdemTerritorial,
  mapaB01,
} from "../../../dados/editorial/mapa-b01";
import { tipoPublico } from "../../../dados/editorial/tipos-publicos";
import { metadadosDaRota } from "../../../lib/site-url";

type Props = { params: Promise<{ documento: string }> };
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await listarDocumentosPublicos()).map(({ slug }) => ({
    documento: slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { documento: slug } = await params;
  const documento = selecionarDocumentoPublico(
    await listarDocumentosPublicos(),
    slug,
  );
  if (!documento) notFound();
  return metadadosDaRota({
    pathname: `/acervo/${slug}`,
    titulo: `${documento.titulo} — Acervo`,
    ...(documento.resumo ? { descricao: documento.resumo } : {}),
  });
}

export default async function PaginaDocumento({ params }: Props) {
  const { documento: slug } = await params;
  const documento = selecionarDocumentoPublico(
    await listarDocumentosPublicos(),
    slug,
  );
  if (!documento) notFound();
  const b01 = slug === "fotografias-visitas-i-vii";
  const fotografias = b01
    ? documento.arquivos.filter((item) => item.mimeType === "image/webp").length
    : 0;
  const graficos = b01
    ? documento.arquivos.filter((item) => item.mimeType === "image/svg+xml")
        .length
    : 0;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12">
      <nav aria-label="Caminho da página" className="meta-ficha">
        <Link href="/acervo">Acervo</Link> /{" "}
        <span aria-current="page">{documento.titulo}</span>
      </nav>
      <header className="flex flex-col gap-3">
        <p className="meta-ficha">{tipoPublico(documento.tipo, slug)}</p>
        <h1>{documento.titulo}</h1>
        {documento.resumo ? <p>{documento.resumo}</p> : null}
        <p>
          {documento.arquivos.length} arquivos públicos
          {b01
            ? ` · ${fotografias} fotografias e ${graficos} elemento gráfico`
            : ""}
        </p>
        <p className="meta-ficha">Licença: {documento.licenca}</p>
      </header>
      {b01 ? (
        <div className="flex flex-col gap-8">
          {gruposB01NaOrdemTerritorial().map((grupo) => {
            const entradas = mapaB01.arquivos
              .filter((item) => item.grupoId === grupo.id)
              .sort((a, b) => a.ordem - b.ordem);
            return (
              <section key={grupo.id} className="flex flex-col gap-3">
                <h2>{grupo.tituloPublico}</h2>
                {grupo.descricao ? <p>{grupo.descricao}</p> : null}
                <ul className="flex list-none flex-col gap-2 p-0">
                  {entradas.map((entrada) => (
                    <li key={entrada.arquivoId}>
                      <Link
                        className="underline focus-visible:outline-destaque"
                        href={
                          `/acervo/${slug}/arquivo/${entrada.arquivoId}` as Route
                        }
                      >
                        {entrada.tituloPublico}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      ) : (
        <section className="flex flex-col gap-3">
          <h2>Arquivos públicos</h2>
          <ul className="flex list-none flex-col gap-3 p-0">
            {documento.arquivos.map((arquivo) => (
              <li key={arquivo.arquivoId}>
                <Link
                  className="underline focus-visible:outline-destaque"
                  href={`/acervo/${slug}/arquivo/${arquivo.arquivoId}` as Route}
                >
                  {tituloDoArquivoPublico(arquivo)}
                </Link>
                <span className="meta-ficha"> · {arquivo.mimeType}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
