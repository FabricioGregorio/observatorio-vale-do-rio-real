import type { Metadata, Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createElement } from "react";

import { InformacoesTecnicas } from "../../../../../componentes/acervo/InformacoesTecnicas";
import { tamanhoLegivel } from "../../../../../componentes/acervo/TabelaAnexos";
import {
  listarDocumentosPublicos,
  selecionarArquivoPublico,
  selecionarDocumentoPublico,
  tituloDoArquivoPublico,
} from "../../../../../dados/consultas/acervo";
import { mapaB01 } from "../../../../../dados/editorial/mapa-b01";
import {
  formatoPublico,
  tipoPublico,
} from "../../../../../dados/editorial/tipos-publicos";
import { metadadosDaRota } from "../../../../../lib/site-url";
import "../../../acervo.css";

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
    <div className="acervo mx-auto flex max-w-4xl flex-col gap-9 px-4 py-10 md:py-16">
      <nav aria-label="Caminho da página" className="acervo-caminho text-sm">
        <Link href="/acervo">Acervo</Link> <span aria-hidden="true">/</span>{" "}
        <Link href={`/acervo/${slug}` as Route}>{documento.titulo}</Link>{" "}
        <span aria-hidden="true">/</span>{" "}
        <span aria-current="page">{titulo}</span>
      </nav>
      <header className="acervo-abertura relative overflow-hidden border-b pb-8">
        <div className="acervo-tracado" aria-hidden="true" />
        <p className="meta-ficha relative">
          {editorial
            ? arquivo.mimeType === "image/svg+xml"
              ? "Elemento gráfico"
              : "Fotografia"
            : tipoPublico(documento.tipo, slug)}
        </p>
        <h1 className="relative mt-4 text-3xl md:text-4xl">{titulo}</h1>
        <p className="relative mt-5 text-sm">
          Documento:{" "}
          <Link className="acervo-link" href={`/acervo/${slug}` as Route}>
            {documento.titulo}
          </Link>
        </p>
      </header>
      <span id="acervo-arquivo-nova-guia" className="sr-only">
        Abre em nova guia.
      </span>
      {imagemB01 && editorial ? (
        <figure className="flex flex-col gap-3">
          <img
            src={arquivo.linkPermanente}
            width={editorial.largura}
            height={editorial.altura}
            alt={editorial.alt}
            loading="lazy"
            className="acervo-imagem"
          />
          {editorial.legenda || editorial.credito ? (
            <figcaption className="max-w-prose">
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
      {audio ? (
        <div className="flex flex-col gap-3">
          {createElement("audio", {
            controls: true,
            preload: "none",
            src: arquivo.linkPermanente,
            "aria-label": `Ouvir ${titulo}`,
            className: "acervo-audio",
            ...(transcricao
              ? { "aria-describedby": "transcricao-publica" }
              : {}),
          })}
          {transcricao ? (
            <Link
              id="transcricao-publica"
              className="acervo-link"
              href={`/acervo/${slug}/arquivo/${transcricao.arquivoId}` as Route}
            >
              Abrir transcrição pública deste documento
            </Link>
          ) : null}
        </div>
      ) : null}
      {!imagemB01 && !audio ? (
        <div className="acervo-ficha border p-6">
          <p className="meta-ficha">Arquivo documental</p>
          <p className="mt-2">
            {formatoPublico(arquivo.mimeType)} · {tamanhoLegivel(arquivo.bytes)}
          </p>
        </div>
      ) : null}
      <p className="flex flex-wrap items-center gap-4">
        <a
          className="acervo-link"
          href={arquivo.linkPermanente}
          aria-describedby="acervo-arquivo-nova-guia"
          target="_blank"
          rel="noopener noreferrer"
        >
          Abrir arquivo público <span aria-hidden="true">↗</span>
        </a>
      </p>
      {documento.licenca ? (
        <p className="text-sm">Licença: {documento.licenca}</p>
      ) : null}
      <InformacoesTecnicas arquivo={arquivo} />
      <p>
        <Link href={`/acervo/${slug}` as Route} className="acervo-link">
          ← Voltar ao documento
        </Link>
      </p>
    </div>
  );
}
