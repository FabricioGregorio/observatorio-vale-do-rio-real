import type { Metadata, Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { tamanhoLegivel } from "../../../componentes/acervo/TabelaAnexos";
import {
  listarDocumentosPublicos,
  selecionarDocumentoPublico,
  tituloDoArquivoPublico,
} from "../../../dados/consultas/acervo";
import {
  gruposB01NaOrdemTerritorial,
  mapaB01,
} from "../../../dados/editorial/mapa-b01";
import {
  formatoPublico,
  tipoPublico,
} from "../../../dados/editorial/tipos-publicos";
import { metadadosDaRota } from "../../../lib/site-url";
import "../acervo.css";

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
    <div className="acervo mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 md:py-16">
      <nav aria-label="Caminho da página" className="acervo-caminho text-sm">
        <Link href="/acervo">Acervo</Link> <span aria-hidden="true">/</span>{" "}
        <span aria-current="page">{documento.titulo}</span>
      </nav>
      <header className="acervo-abertura relative overflow-hidden border-b pb-9">
        <div className="acervo-tracado" aria-hidden="true" />
        <p className="meta-ficha relative">
          {tipoPublico(documento.tipo, slug)}
        </p>
        <h1 className="relative mt-4 max-w-4xl text-3xl md:text-4xl">
          {documento.titulo}
        </h1>
        {documento.resumo ? (
          <p className="relative mt-5 max-w-prose">{documento.resumo}</p>
        ) : null}
        <p className="meta-ficha relative mt-7">
          {documento.arquivos.length}{" "}
          {documento.arquivos.length === 1
            ? "arquivo público"
            : "arquivos públicos"}
          {b01
            ? ` · ${fotografias} fotografias e ${graficos} elemento gráfico`
            : ""}
        </p>
        {documento.licenca ? (
          <p className="relative mt-2 text-sm">Licença: {documento.licenca}</p>
        ) : null}
      </header>

      {b01 ? (
        <div className="flex flex-col gap-10">
          <div className="max-w-prose">
            <h2 className="text-2xl">Conjunto de registros</h2>
            <p className="mt-2">
              As evidências estão reunidas em dez grupos editoriais. Abra um
              registro para ver a imagem e as informações do arquivo.
            </p>
          </div>
          {gruposB01NaOrdemTerritorial().map((grupo, indice) => {
            const entradas = mapaB01.arquivos
              .filter((item) => item.grupoId === grupo.id)
              .sort((a, b) => a.ordem - b.ordem);
            return (
              <section
                key={grupo.id}
                className="acervo-secao grid gap-4 border-t pt-7 md:grid-cols-[4rem_minmax(0,1fr)]"
              >
                <span className="acervo-numero text-xl" aria-hidden="true">
                  {String(indice + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <p className="meta-ficha">
                    {grupo.natureza === "LUGAR"
                      ? "Lugar"
                      : grupo.natureza === "PESSOA"
                        ? "Pessoa"
                        : "Contexto institucional"}{" "}
                    · {entradas.length}{" "}
                    {entradas.length === 1 ? "registro" : "registros"}
                  </p>
                  <h3 className="mt-2 text-2xl">{grupo.tituloPublico}</h3>
                  {grupo.descricao ? (
                    <p className="mt-3 max-w-prose">{grupo.descricao}</p>
                  ) : null}
                  <ul className="mt-6 grid list-none gap-0 p-0">
                    {entradas.map((entrada) => (
                      <li
                        key={entrada.arquivoId}
                        className="acervo-linha-arquivo border-t py-3"
                      >
                        <Link
                          className="acervo-link"
                          href={
                            `/acervo/${slug}/arquivo/${entrada.arquivoId}` as Route
                          }
                        >
                          {entrada.tituloPublico}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <section className="max-w-4xl">
          <h2 className="text-2xl">
            {documento.arquivos.length === 1
              ? "Arquivo público"
              : "Conjunto de arquivos"}
          </h2>
          <p className="mt-2">
            {documento.arquivos.length === 1
              ? "Consulte a evidência e suas informações."
              : "Todos os arquivos públicos deste documento estão disponíveis para consulta."}
          </p>
          <ul className="mt-6 grid list-none gap-4 p-0">
            {documento.arquivos.map((arquivo) => (
              <li
                key={arquivo.arquivoId}
                className="acervo-ficha min-w-0 border p-5"
              >
                <h3
                  id={`acervo-arquivo-${arquivo.arquivoId}`}
                  className="text-lg"
                >
                  {tituloDoArquivoPublico(arquivo)}
                </h3>
                <p className="meta-ficha mt-2">
                  {formatoPublico(arquivo.mimeType)} ·{" "}
                  {tamanhoLegivel(arquivo.bytes)}
                </p>
                <Link
                  className="acervo-link mt-4 inline-block"
                  href={`/acervo/${slug}/arquivo/${arquivo.arquivoId}` as Route}
                  id={`acervo-link-${arquivo.arquivoId}`}
                  aria-labelledby={`acervo-link-${arquivo.arquivoId} acervo-arquivo-${arquivo.arquivoId}`}
                >
                  Ver arquivo e informações <span aria-hidden="true">↗</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      <p>
        <Link href="/acervo" className="acervo-link">
          ← Voltar ao índice do Acervo
        </Link>
      </p>
    </div>
  );
}
