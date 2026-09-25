import type { Metadata, Route } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { createElement } from "react";
import {
  DadosDaPeca,
  LinhaDaPeca,
  Relacionados,
} from "../../../../../componentes/acervo/ContextoDocumental";
import { tamanhoLegivel } from "../../../../../componentes/acervo/formato";
import {
  dataCurta,
  dataMaquina,
} from "../../../../../componentes/podobservar/formato";
import { ActionLink } from "../../../../../componentes/ui/ActionLink";
import { mapaB01 } from "../../../../../dados/editorial/mapa-b01";
import { contextoDaFotografia } from "../../../../../dados/editorial/relacoes";
import {
  formatoPublico,
  tipoPublico,
} from "../../../../../dados/editorial/tipos-publicos";
import { exibirDataDaFotografia } from "../../../../../dados/pesquisa/derivados";
import { FOTO_DA_PLACA } from "../../../../../dados/pesquisa/excecao-placa";
import {
  apresentarArquivoPublico,
  listarDocumentosPublicos,
  selecionarArquivoPublico,
  selecionarDocumentoPublico,
  tituloDaPaginaDoArquivo,
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
    titulo: `${tituloDaPaginaDoArquivo(arquivo, documentos)} — Acervo`,
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
  const { titulo, identificador } = apresentarArquivoPublico(arquivo);
  const fotografia = editorial
    ? contextoDaFotografia(arquivo)
    : { linhas: [], registro: null, relacionados: [] };
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
          {identificador ? ` · ${identificador}` : ""}
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
      {/*
        Informações do arquivo, para quem chegou direto nesta ficha.

        Lugar e data do registro só aparecem quando um dado estruturado os
        sustenta: o grupo da fotografia no mapa B01 e a data do manifesto dos
        derivados, a mesma que `/campo` exibe. **Registro** é quando a
        fotografia foi feita; **publicação** é quando o arquivo entrou no
        acervo. São duas datas, com dois nomes, e uma nunca faz as vezes da
        outra.

        Data de publicação: o rodapé de toda rota, a abertura do Acervo e a
        seção de conferência da Home dizem que cada arquivo tem endereço
        próprio **e data de publicação**, e é aqui que ela se confere. Hash,
        MIME cru e identificador interno continuam fora da ficha, como a
        decisão de 2026-09-22 estabeleceu. A formatação vem de
        `podobservar/formato.ts`, que resolve o fuso de Sergipe
        explicitamente.
      */}
      <DadosDaPeca linhas={fotografia.linhas} rotulo="Informações do arquivo">
        {fotografia.registro ? (
          <LinhaDaPeca termo="Data do registro">
            <time dateTime={fotografia.registro}>
              {exibirDataDaFotografia(fotografia.registro)}
            </time>
          </LinhaDaPeca>
        ) : null}
        <LinhaDaPeca termo="Formato">
          {formatoPublico(arquivo.mimeType)}
        </LinhaDaPeca>
        <LinhaDaPeca termo="Tamanho">
          {tamanhoLegivel(arquivo.bytes)}
        </LinhaDaPeca>
        {documento.licenca ? (
          <LinhaDaPeca termo="Licença">{documento.licenca}</LinhaDaPeca>
        ) : null}
        {arquivo.publicadoEm ? (
          <LinhaDaPeca termo="Publicado em">
            <time dateTime={dataMaquina(arquivo.publicadoEm)}>
              {dataCurta(arquivo.publicadoEm)}
            </time>
          </LinhaDaPeca>
        ) : null}
      </DadosDaPeca>
      <Relacionados
        id="acervo-arquivo-relacionados"
        itens={fotografia.relacionados}
      />
      <p>
        <ActionLink variant="text" href={`/acervo/${slug}` as Route} voltar>
          Voltar ao documento
        </ActionLink>
      </p>
    </div>
  );
}
