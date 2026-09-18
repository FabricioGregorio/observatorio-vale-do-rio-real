import type { Metadata, Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createElement } from "react";

import { InformacoesTecnicas } from "../../../../../componentes/acervo/InformacoesTecnicas";
import {
  listarDocumentosPublicos,
  selecionarArquivoPublico,
  selecionarDocumentoPublico,
  tituloDoArquivoPublico,
} from "../../../../../dados/consultas/acervo";
import { mapaB01 } from "../../../../../dados/editorial/mapa-b01";
import { metadadosDaRota } from "../../../../../lib/site-url";

type Props = { params: Promise<{ documento: string; arquivoId: string }> };
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await listarDocumentosPublicos()).flatMap((documento) =>
    documento.arquivos.map((arquivo) => ({
      documento: documento.slug,
      arquivoId: arquivo.arquivoId,
    })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { documento: slug, arquivoId } = await params;
  const documentos = await listarDocumentosPublicos();
  const arquivo = selecionarArquivoPublico(documentos, slug, arquivoId);
  if (!arquivo) notFound();
  return metadadosDaRota({
    pathname: `/acervo/${slug}/arquivo/${arquivoId}`,
    titulo: `${tituloDoArquivoPublico(arquivo)} — Acervo`,
  });
}

export default async function PaginaArquivo({ params }: Props) {
  const { documento: slug, arquivoId } = await params;
  const documentos = await listarDocumentosPublicos();
  const documento = selecionarDocumentoPublico(documentos, slug);
  const arquivo = selecionarArquivoPublico(documentos, slug, arquivoId);
  if (!documento || !arquivo) notFound();

  const editorial =
    slug === "fotografias-visitas-i-vii"
      ? mapaB01.arquivos.find((item) => item.arquivoId === arquivoId)
      : null;
  if (slug === "fotografias-visitas-i-vii" && !editorial) notFound();
  const titulo = tituloDoArquivoPublico(arquivo);
  const imagemB01 =
    editorial &&
    ["image/webp", "image/png", "image/svg+xml"].includes(arquivo.mimeType);
  const audio = ["audio/mp4", "audio/mpeg", "audio/x-m4a"].includes(
    arquivo.mimeType,
  );
  const transcricao = audio
    ? documento.arquivos.find(
        (item) =>
          item.arquivoId !== arquivoId &&
          item.mimeType === "application/pdf" &&
          item.rotuloArquivo?.toLocaleLowerCase("pt-BR").includes("transcri"),
      )
    : null;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-12">
      <nav aria-label="Caminho da página" className="meta-ficha">
        <Link href="/acervo">Acervo</Link> /{" "}
        <Link href={`/acervo/${slug}` as Route}>{documento.titulo}</Link> /{" "}
        <span aria-current="page">{titulo}</span>
      </nav>
      <header className="flex flex-col gap-3">
        <p className="meta-ficha">{documento.titulo}</p>
        <h1>{titulo}</h1>
        <p className="meta-ficha">Formato: {arquivo.mimeType}</p>
      </header>
      {imagemB01 && editorial ? (
        <figure className="flex flex-col gap-3">
          <img
            src={arquivo.linkPermanente}
            width={editorial.largura}
            height={editorial.altura}
            alt={editorial.alt}
            loading="lazy"
            className="h-auto max-w-full"
          />
          {editorial.legenda || editorial.credito ? (
            <figcaption>
              {editorial.legenda ? <span>{editorial.legenda}</span> : null}
              {editorial.credito ? (
                <span className="block meta-ficha">
                  Foto: {editorial.credito}
                </span>
              ) : null}
            </figcaption>
          ) : null}
        </figure>
      ) : null}
      {audio && transcricao ? (
        <div className="flex flex-col gap-3">
          {createElement("audio", {
            controls: true,
            preload: "none",
            src: arquivo.linkPermanente,
            "aria-label": `Ouvir ${titulo}`,
            "aria-describedby": "transcricao-publica",
          })}
          <Link
            id="transcricao-publica"
            className="underline"
            href={`/acervo/${slug}/arquivo/${transcricao.arquivoId}` as Route}
          >
            Abrir transcrição pública deste documento
          </Link>
        </div>
      ) : null}
      <p>
        <a
          className="underline focus-visible:outline-destaque"
          href={arquivo.linkPermanente}
        >
          Abrir arquivo público
        </a>
      </p>
      <p className="meta-ficha">Licença: {documento.licenca}</p>
      <InformacoesTecnicas arquivo={arquivo} />
    </div>
  );
}
