import type { Route } from "next";
import { tipoPublico } from "../../dados/editorial/tipos-publicos";
import { ActionLink } from "../ui/ActionLink";

export type DocumentoDoIndice = {
  slug: string;
  titulo: string;
  tipo: string;
  resumo: string | null;
  quantidade: number;
};

export function ListaDocumentosPublicos({
  documentos,
}: {
  documentos: readonly DocumentoDoIndice[];
}) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {documentos.map((documento, indice) => (
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
          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
            <p className="meta-ficha">
              {documento.quantidade}{" "}
              {documento.quantidade === 1 ? "arquivo" : "arquivos"}
            </p>
            <ActionLink
              variant="document"
              href={`/acervo/${documento.slug}` as Route}
              id={`acervo-link-${documento.slug}`}
              aria-labelledby={`acervo-link-${documento.slug} acervo-documento-${documento.slug}`}
            >
              Abrir documento
            </ActionLink>
          </div>
        </article>
      ))}
    </div>
  );
}
