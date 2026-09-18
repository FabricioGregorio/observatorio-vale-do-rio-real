import { ListaDocumentosPublicos } from "../../componentes/acervo/ListaDocumentosPublicos";
import { listarDocumentosPublicos } from "../../dados/consultas/acervo";
import { metadadosDaRota } from "../../lib/site-url";

export const metadata = metadadosDaRota({
  pathname: "/acervo",
  titulo: "Acervo — Observatório do Vale do Rio Real",
  descricao: "Materiais públicos do Observatório do Vale do Rio Real.",
});

export default async function PaginaAcervo() {
  const documentos = await listarDocumentosPublicos();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12">
      <header className="flex max-w-3xl flex-col gap-3">
        <p className="meta-ficha">Repositório público</p>
        <h1>Acervo</h1>
        <p>
          Materiais do Observatório que concluíram as revisões documental, de
          privacidade e de publicação, organizados para consulta pública.
        </p>
      </header>

      <ListaDocumentosPublicos documentos={documentos} />

      <aside
        className="border-l-4 p-5"
        style={{ borderColor: "var(--color-destaque)" }}
        aria-labelledby="acervo-prestacao"
      >
        <h2 id="acervo-prestacao">Acervo e prestação de contas</h2>
        <p>
          Esta página reúne os materiais para consulta pública. A Prestação de
          Contas mantém a documentação de conferência do projeto, com datas,
          origem e hashes de integridade.
        </p>
      </aside>
    </div>
  );
}
