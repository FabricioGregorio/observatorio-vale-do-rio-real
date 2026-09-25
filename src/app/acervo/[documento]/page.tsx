import type { Metadata, Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  DadosDaPeca,
  Relacionados,
} from "../../../componentes/acervo/ContextoDocumental";
import { tamanhoLegivel } from "../../../componentes/acervo/formato";
import {
  RetornoAoAcervo,
  RetornoSemContexto,
} from "../../../componentes/acervo/RetornoAoAcervo";
import { ActionLink } from "../../../componentes/ui/ActionLink";
import {
  gruposB01NaOrdemTerritorial,
  mapaB01,
} from "../../../dados/editorial/mapa-b01";
import { contextoDoDocumento } from "../../../dados/editorial/relacoes";
import {
  formatoPublico,
  tipoPublico,
} from "../../../dados/editorial/tipos-publicos";
import {
  apresentarArquivoPublico,
  listarDocumentosPublicos,
  selecionarDocumentoPublico,
} from "../../../dados/publicado/acervo";
import { listarEpisodiosPublicos } from "../../../dados/publicado/podobservar";
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
  const todos = await listarDocumentosPublicos();
  const documento = selecionarDocumentoPublico(todos, slug);
  if (!documento) notFound();
  const tipos = [...new Set(todos.map((d) => d.tipo))];
  const b01 = slug === "fotografias-visitas-i-vii";
  /*
    Fotografia é o que não é o elemento gráfico. Contar por `image/webp` era
    correto enquanto todo o conjunto era derivado para a web; com os originais
    publicados, o mesmo filtro passou a devolver 1 — a única WebP que restou é
    a versão tarjada da foto da placa.
  */
  const graficos = b01
    ? documento.arquivos.filter((item) => item.mimeType === "image/svg+xml")
        .length
    : 0;
  const fotografias = b01 ? documento.arquivos.length - graficos : 0;
  const contexto = contextoDoDocumento(
    slug,
    await listarEpisodiosPublicos(),
    documento.arquivos,
  );

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

      {/*
        Para quem chegou direto nesta ficha: o que o site já sabe do
        documento, por dado estruturado — instituição, lugar, município. Sem
        frase escrita para a ocasião; sem dado, sem bloco.
      */}
      <DadosDaPeca linhas={contexto.linhas} rotulo="Sobre este documento" />

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
                    {entradas.map((entrada) => {
                      const arquivo = documento.arquivos.find(
                        (item) =>
                          (item.previewArquivoId ?? item.arquivoId) ===
                          entrada.arquivoId,
                      );
                      if (!arquivo)
                        throw new Error(
                          `B01: arquivo ausente ${entrada.arquivoId}`,
                        );
                      return (
                        <li
                          key={arquivo.arquivoId}
                          className="acervo-linha-arquivo border-t py-3"
                        >
                          <ActionLink
                            variant="document"
                            href={
                              `/acervo/${slug}/arquivo/${arquivo.arquivoId}` as Route
                            }
                          >
                            {entrada.tituloPublico}
                          </ActionLink>
                        </li>
                      );
                    })}
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
            {documento.arquivos.map((arquivo) => {
              const { titulo, identificador } =
                apresentarArquivoPublico(arquivo);
              return (
                <li
                  key={arquivo.arquivoId}
                  className="acervo-ficha min-w-0 border p-5"
                >
                  <h3
                    id={`acervo-arquivo-${arquivo.arquivoId}`}
                    className="text-lg"
                  >
                    {titulo}
                  </h3>
                  <p className="meta-ficha mt-2">
                    {identificador ? `${identificador} · ` : ""}
                    {formatoPublico(arquivo.mimeType)} ·{" "}
                    {tamanhoLegivel(arquivo.bytes)}
                  </p>
                  <ActionLink
                    variant="document"
                    className="mt-4"
                    href={
                      `/acervo/${slug}/arquivo/${arquivo.arquivoId}` as Route
                    }
                    id={`acervo-link-${arquivo.arquivoId}`}
                    aria-labelledby={`acervo-link-${arquivo.arquivoId} acervo-arquivo-${arquivo.arquivoId}`}
                  >
                    Abrir arquivo e informações
                  </ActionLink>
                </li>
              );
            })}
          </ul>
        </section>
      )}
      <Relacionados id="acervo-relacionados" itens={contexto.relacionados} />
      {/*
        O retorno devolve a busca de onde a pessoa veio, se veio de uma: o
        card do resultado leva `q` e `tipo` na URL da ficha. Sem query —
        entrada direta, nova aba, Google —, o destino é `/acervo`. O
        fallback é o mesmo link sem contexto, e é ele que existe sem JS.
      */}
      <p>
        <Suspense fallback={<RetornoSemContexto />}>
          <RetornoAoAcervo tipos={tipos} />
        </Suspense>
      </p>
    </div>
  );
}
