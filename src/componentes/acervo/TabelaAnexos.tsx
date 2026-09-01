import type { AnexoPublico } from "../../dados/consultas/anexos";

/**
 * Tabela mestre da Sala do Avaliador (doc 01 §4).
 *
 * É `<table>` de verdade, com `<caption>` e `<th scope>`: o avaliador precisa
 * navegar por leitor de tela e imprimir. Em telas estreitas a mesma tabela vira
 * lista de fichas por CSS — sem trocar a marcação, para não perder a semântica.
 *
 * O SHA-256 aparece truncado, com o valor integral disponível para cópia.
 */

/** Primeiros 12 caracteres — o suficiente para conferência visual. */
export function hashTruncado(sha256: string): string {
  return `${sha256.slice(0, 12)}…`;
}

/** Bytes em unidade legível, sem inventar precisão. */
export function tamanhoLegivel(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} kB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

/** Data ISO, como o doc 01 §4 pede. */
export function dataIso(valor: Date | string | null): string {
  if (!valor) return "—";
  const d = typeof valor === "string" ? new Date(valor) : valor;
  return Number.isNaN(d.getTime())
    ? "—"
    : (d.toISOString().split("T")[0] ?? "—");
}

const COLUNAS = [
  "Item do edital",
  "Formato",
  "Link permanente",
  "Link de origem",
  "Publicado em",
  "SHA-256",
] as const;

export function TabelaAnexos({ anexos }: { anexos: AnexoPublico[] }) {
  if (anexos.length === 0) {
    return (
      <div
        className="border p-6"
        style={{
          borderColor: "var(--color-borda)",
          backgroundColor: "var(--color-fundo-elevado)",
          borderRadius: "var(--radius-ficha)",
        }}
      >
        <p>
          Nenhum anexo publicado e espelhado até o momento. A tabela aparece
          aqui assim que os arquivos forem espelhados e os documentos
          publicados.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <caption className="mb-3 text-left">
          Anexos da prestação de contas: {anexos.length}{" "}
          {anexos.length === 1 ? "item" : "itens"}, com link permanente e hash
          de integridade.
        </caption>
        <thead>
          <tr>
            {COLUNAS.map((coluna) => (
              <th
                key={coluna}
                scope="col"
                className="meta-ficha border-b p-2 align-bottom"
                style={{ borderColor: "var(--color-borda)" }}
              >
                {coluna}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {anexos.map((anexo) => (
            <tr key={anexo.slug}>
              <th
                scope="row"
                className="border-b p-2 text-left font-normal align-top"
                style={{ borderColor: "var(--color-borda)" }}
              >
                <span className="block">{anexo.titulo}</span>
                {anexo.resumo ? (
                  <span
                    className="block"
                    style={{ color: "var(--color-texto-suave)" }}
                  >
                    {anexo.resumo}
                  </span>
                ) : null}
              </th>
              <td
                className="meta-ficha border-b p-2 align-top"
                style={{ borderColor: "var(--color-borda)" }}
              >
                {anexo.mimeType}
                <span className="block">{tamanhoLegivel(anexo.bytes)}</span>
              </td>
              <td
                className="border-b p-2 align-top"
                style={{ borderColor: "var(--color-borda)" }}
              >
                <a
                  href={anexo.linkPermanente}
                  style={{ color: "var(--color-link)" }}
                >
                  Baixar
                </a>
              </td>
              <td
                className="border-b p-2 align-top"
                style={{ borderColor: "var(--color-borda)" }}
              >
                {anexo.linkOrigem ? (
                  <a
                    href={anexo.linkOrigem}
                    style={{ color: "var(--color-link)" }}
                  >
                    Origem
                  </a>
                ) : (
                  <span className="meta-ficha">—</span>
                )}
              </td>
              <td
                className="meta-ficha border-b p-2 align-top"
                style={{ borderColor: "var(--color-borda)" }}
              >
                {dataIso(anexo.publicadoEm)}
              </td>
              <td
                className="border-b p-2 align-top"
                style={{ borderColor: "var(--color-borda)" }}
              >
                {/*
                  O valor integral fica no DOM, dentro de <code>, para copiar e
                  conferir. O truncado é só apresentação.
                */}
                <span className="meta-ficha" aria-hidden="true">
                  {hashTruncado(anexo.sha256)}
                </span>
                <code className="sr-only">{anexo.sha256}</code>
                <details>
                  <summary className="meta-ficha">Ver hash integral</summary>
                  <code className="meta-ficha break-all">{anexo.sha256}</code>
                </details>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
