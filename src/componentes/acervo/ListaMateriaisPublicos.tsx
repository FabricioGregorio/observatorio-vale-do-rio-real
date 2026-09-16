import type { AnexoPublico } from "../../dados/consultas/anexos";
import { tamanhoLegivel } from "./TabelaAnexos";

export type GrupoDeMateriaisPublicos = {
  slug: string;
  titulo: string;
  resumo: string | null;
  licenca: string;
  arquivos: AnexoPublico[];
};

/** Agrupa objetos físicos sem colapsar documentos multiarquivo. */
export function agruparMateriaisPublicos(
  anexos: readonly AnexoPublico[],
): GrupoDeMateriaisPublicos[] {
  const grupos = new Map<string, GrupoDeMateriaisPublicos>();

  for (const anexo of anexos) {
    const existente = grupos.get(anexo.slug);
    if (existente) {
      existente.arquivos.push(anexo);
      continue;
    }
    grupos.set(anexo.slug, {
      slug: anexo.slug,
      titulo: anexo.titulo,
      resumo: anexo.resumo,
      licenca: anexo.licenca,
      arquivos: [anexo],
    });
  }

  return [...grupos.values()];
}

function rotuloDoArquivo(anexo: AnexoPublico, indice: number): string {
  return anexo.rotuloArquivo ?? `Arquivo ${indice + 1}`;
}

export function ListaMateriaisPublicos({ anexos }: { anexos: AnexoPublico[] }) {
  const grupos = agruparMateriaisPublicos(anexos);

  if (grupos.length === 0) {
    return (
      <p
        className="border p-6"
        style={{
          borderColor: "var(--color-borda)",
          backgroundColor: "var(--color-fundo-elevado)",
          borderRadius: "var(--radius-ficha)",
        }}
      >
        Não há materiais públicos disponíveis neste momento. Somente arquivos
        que concluíram as revisões documental, de privacidade e de publicação
        aparecem aqui.
      </p>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {grupos.map((grupo) => (
        <section
          aria-labelledby={`acervo-${grupo.slug}`}
          className="flex flex-col gap-4 border p-6"
          key={grupo.slug}
          style={{
            borderColor: "var(--color-borda)",
            backgroundColor: "var(--color-fundo-elevado)",
            borderRadius: "var(--radius-ficha)",
          }}
        >
          <div className="flex flex-col gap-2">
            <p className="meta-ficha">
              {grupo.arquivos.length}{" "}
              {grupo.arquivos.length === 1
                ? "arquivo público"
                : "arquivos públicos"}
            </p>
            <h2 id={`acervo-${grupo.slug}`}>{grupo.titulo}</h2>
            {grupo.resumo ? <p>{grupo.resumo}</p> : null}
          </div>

          <ul className="flex list-none flex-col gap-3 p-0">
            {grupo.arquivos.map((anexo, indice) => (
              <li
                className="flex flex-col gap-1 border-t pt-3"
                key={anexo.linkPermanente}
                style={{ borderColor: "var(--color-borda)" }}
              >
                <a
                  className="font-semibold underline focus-visible:outline-destaque"
                  href={anexo.linkPermanente}
                  style={{ color: "var(--color-link)" }}
                >
                  {rotuloDoArquivo(anexo, indice)}
                </a>
                <span className="meta-ficha">
                  {anexo.mimeType} · {tamanhoLegivel(anexo.bytes)}
                </span>
              </li>
            ))}
          </ul>

          <p className="meta-ficha mt-auto">Licença: {grupo.licenca}</p>
        </section>
      ))}
    </div>
  );
}
