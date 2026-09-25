import type { Route } from "next";
import { tipoPublico } from "../../dados/editorial/tipos-publicos";
import { ActionLink } from "../ui/ActionLink";
import type { Correspondencia, DocumentoDoIndice } from "./busca";

export type { DocumentoDoIndice } from "./busca";

export function ListaDocumentosPublicos({
  documentos,
  correspondencias,
  motivos,
  consulta = "",
}: {
  documentos: readonly DocumentoDoIndice[];
  /** Arquivos que a busca apontou, por slug do documento pai. */
  correspondencias?: ReadonlyMap<string, Correspondencia>;
  /** Contexto que explica o resultado, quando o título não explica. */
  motivos?: ReadonlyMap<string, readonly string[]>;
  /** `q` e `tipo` em forma de query, para o documento saber voltar. */
  consulta?: string;
}) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {documentos.map((documento, indice) => {
        const correspondencia = correspondencias?.get(documento.slug);
        const motivo = motivos?.get(documento.slug);
        const rotulo = `acervo-correspondencia-${documento.slug}`;
        return (
          <article
            key={documento.slug}
            className="acervo-card flex flex-col gap-3 border p-6"
          >
            <div className="flex items-baseline justify-between gap-3">
              <p className="meta-ficha">
                {tipoPublico(documento.tipo, documento.slug)}
              </p>
              <span className="meta-ficha" aria-hidden="true">
                {String(indice + 1).padStart(2, "0")}
              </span>
            </div>
            <h3 id={`acervo-documento-${documento.slug}`} className="text-xl">
              {documento.titulo}
            </h3>
            {documento.resumo ? (
              <p className="max-w-prose">{documento.resumo}</p>
            ) : null}
            {/*
              Por que este documento apareceu, quando o título não diz: a
              instituição, o lugar ou o município que o site já publica para
              ele. Em palavras de quem lê — nada de campo, índice ou termo.
            */}
            {motivo ? (
              <p className="acervo-motivo text-sm">
                <span className="meta-ficha">Encontrado por</span>{" "}
                {motivo.join(" · ")}
              </p>
            ) : null}
            {/*
              O acerto que veio de um arquivo aparece dentro do documento pai,
              e não como documento: o arquivo leva à própria ficha, o
              documento continua levando à dele, logo abaixo.
            */}
            {correspondencia ? (
              <div className="acervo-correspondencia border-t pt-3">
                <p className="meta-ficha" id={rotulo}>
                  Encontrado neste documento
                </p>
                <ul aria-labelledby={rotulo} className="mt-2 grid gap-1">
                  {correspondencia.arquivos.map((arquivo) => (
                    <li key={arquivo.id}>
                      <ActionLink
                        variant="document"
                        href={
                          `/acervo/${documento.slug}/arquivo/${arquivo.id}` as Route
                        }
                        id={`acervo-link-${arquivo.id}`}
                        aria-labelledby={`acervo-link-${arquivo.id} acervo-documento-${documento.slug}`}
                      >
                        {arquivo.titulo}
                      </ActionLink>
                    </li>
                  ))}
                </ul>
                {correspondencia.alemDosExibidos > 0 ? (
                  <p className="meta-ficha mt-2">
                    E mais {correspondencia.alemDosExibidos}{" "}
                    {correspondencia.alemDosExibidos === 1
                      ? "arquivo correspondente"
                      : "arquivos correspondentes"}{" "}
                    na ficha do documento.
                  </p>
                ) : null}
              </div>
            ) : null}
            <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
              <p className="meta-ficha">
                {documento.quantidade}{" "}
                {documento.quantidade === 1 ? "arquivo" : "arquivos"}
              </p>
              <ActionLink
                variant="document"
                href={
                  `/acervo/${documento.slug}${consulta ? `?${consulta}` : ""}` as Route
                }
                id={`acervo-link-${documento.slug}`}
                aria-labelledby={`acervo-link-${documento.slug} acervo-documento-${documento.slug}`}
              >
                Abrir documento
              </ActionLink>
            </div>
          </article>
        );
      })}
    </div>
  );
}
