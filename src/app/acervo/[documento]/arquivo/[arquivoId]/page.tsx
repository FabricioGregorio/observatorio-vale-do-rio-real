import type { Metadata, Route } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { createElement } from "react";
import { tamanhoLegivel } from "../../../../../componentes/acervo/formato";
import {
  dataCurta,
  dataMaquina,
} from "../../../../../componentes/podobservar/formato";
import { ActionLink } from "../../../../../componentes/ui/ActionLink";
import { mapaB01 } from "../../../../../dados/editorial/mapa-b01";
import {
  formatoPublico,
  tipoPublico,
} from "../../../../../dados/editorial/tipos-publicos";
import { FOTO_DA_PLACA } from "../../../../../dados/pesquisa/excecao-placa";
import {
  listarDocumentosPublicos,
  selecionarArquivoPublico,
  selecionarDocumentoPublico,
  tituloDoArquivoPublico,
} from "../../../../../dados/publicado/acervo";
import { metadadosDaRota } from "../../../../../lib/site-url";
import "../../../acervo.css";

type Props = { params: Promise<{ documento: string; arquivoId: string }> };
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await listarDocumentosPublicos()).flatMap((documento) =>
    documento.arquivos.flatMap((arquivo) => [
      { documento: documento.slug, arquivoId: arquivo.arquivoId },
      ...(arquivo.previewArquivoId
        ? [{ documento: documento.slug, arquivoId: arquivo.previewArquivoId }]
        : []),
    ]),
  );
}

function resolverArquivo(
  documentos: Awaited<ReturnType<typeof listarDocumentosPublicos>>,
  slug: string,
  arquivoId: string,
) {
  return (
    selecionarArquivoPublico(documentos, slug, arquivoId) ??
    selecionarDocumentoPublico(documentos, slug)?.arquivos.find(
      (item) => item.previewArquivoId === arquivoId,
    ) ??
    null
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { documento: slug, arquivoId } = await params;
  const documentos = await listarDocumentosPublicos();
  const arquivo = resolverArquivo(documentos, slug, arquivoId);
  if (!arquivo) notFound();
  return metadadosDaRota({
    pathname: `/acervo/${slug}/arquivo/${arquivo.arquivoId}`,
    titulo: `${tituloDoArquivoPublico(arquivo)} — Acervo`,
  });
}

export default async function PaginaArquivo({ params }: Props) {
  const { documento: slug, arquivoId } = await params;
  const documentos = await listarDocumentosPublicos();
  const documento = selecionarDocumentoPublico(documentos, slug);
  const arquivo = resolverArquivo(documentos, slug, arquivoId);
  if (!documento || !arquivo) notFound();
  if (arquivo.arquivoId !== arquivoId)
    permanentRedirect(`/acervo/${slug}/arquivo/${arquivo.arquivoId}`);

  const editorial =
    slug === "fotografias-visitas-i-vii"
      ? mapaB01.arquivos.find(
          (item) => item.arquivoId === (arquivo.previewArquivoId ?? arquivoId),
        )
      : null;
  if (slug === "fotografias-visitas-i-vii" && !editorial) notFound();
  const titulo = tituloDoArquivoPublico(arquivo);
  const imagemB01 =
    editorial &&
    (Boolean(arquivo.previewUrl) ||
      ["image/webp", "image/png", "image/svg+xml"].includes(arquivo.mimeType));
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
          <Link href={`/acervo/${slug}` as Route}>{documento.titulo}</Link>
        </p>
      </header>
      <span id="acervo-arquivo-nova-guia" className="sr-only">
        Abre em nova guia.
      </span>
      {imagemB01 && editorial ? (
        <figure className="flex flex-col gap-3">
          <img
            src={arquivo.previewUrl ?? arquivo.linkPermanente}
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
            <ActionLink
              variant="document"
              id="transcricao-publica"
              href={`/acervo/${slug}/arquivo/${transcricao.arquivoId}` as Route}
            >
              Abrir transcrição pública deste documento
            </ActionLink>
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
        <ActionLink variant="document" href={arquivo.linkPermanente}>
          {arquivo.arquivoId === FOTO_DA_PLACA.arquivoPublicoId
            ? "Abrir versão pública"
            : "Abrir original"}{" "}
        </ActionLink>
        <ActionLink variant="document" href={`/baixar/${arquivo.arquivoId}`}>
          {arquivo.arquivoId === FOTO_DA_PLACA.arquivoPublicoId
            ? "Baixar versão pública"
            : "Baixar original"}
        </ActionLink>
      </p>
      {documento.licenca ? (
        <p className="text-sm">Licença: {documento.licenca}</p>
      ) : null}
      {/*
        Data de publicação.

        O rodapé de toda rota, a abertura do Acervo e a seção de conferência da
        Home dizem que cada arquivo tem endereço próprio **e data de
        publicação**. Até 2026-09-23 quem quisesse conferir a data ia à tabela
        da Prestação de Contas, a única superfície que a exibia. Com a página
        removida, a promessa ficaria sem lugar onde ser verificada — e uma
        afirmação pública sem superfície é o defeito que este site combate.

        É data, não detalhe de sistema: hash, MIME cru e identificador interno
        continuam fora da ficha, como a decisão de 2026-09-22 estabeleceu.

        A formatação vem de `podobservar/formato.ts`, que resolve o fuso de
        Sergipe explicitamente. `<time dateTime>` carrega a forma legível por
        máquina do mesmo instante.
      */}
      {arquivo.publicadoEm ? (
        <p className="text-sm">
          Publicado em{" "}
          <time dateTime={dataMaquina(arquivo.publicadoEm)}>
            {dataCurta(arquivo.publicadoEm)}
          </time>
        </p>
      ) : null}
      <p>
        <ActionLink variant="text" href={`/acervo/${slug}` as Route} voltar>
          Voltar ao documento
        </ActionLink>
      </p>
    </div>
  );
}
