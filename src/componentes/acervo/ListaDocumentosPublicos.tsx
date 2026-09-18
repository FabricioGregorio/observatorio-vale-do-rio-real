import type { Route } from "next";
import Link from "next/link";

import type { DocumentoDoAcervo } from "../../dados/consultas/acervo";
import { tipoPublico } from "../../dados/editorial/tipos-publicos";

export function ListaDocumentosPublicos({
  documentos,
}: {
  documentos: readonly DocumentoDoAcervo[];
}) {
  if (documentos.length === 0)
    return <p>Não há documentos públicos disponíveis neste momento.</p>;
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {documentos.map((documento) => (
        <section
          key={documento.slug}
          className="flex flex-col gap-3 border p-6"
          style={{
            borderColor: "var(--color-borda)",
            backgroundColor: "var(--color-fundo-elevado)",
            borderRadius: "var(--radius-ficha)",
          }}
        >
          <p className="meta-ficha">
            {tipoPublico(documento.tipo, documento.slug)}
          </p>
          <h2>
            <Link
              href={`/acervo/${documento.slug}` as Route}
              className="underline focus-visible:outline-destaque"
            >
              {documento.titulo}
            </Link>
          </h2>
          {documento.resumo ? <p>{documento.resumo}</p> : null}
          <p className="meta-ficha">
            {documento.arquivos.length}{" "}
            {documento.arquivos.length === 1
              ? "arquivo público"
              : "arquivos públicos"}
          </p>
        </section>
      ))}
    </div>
  );
}
