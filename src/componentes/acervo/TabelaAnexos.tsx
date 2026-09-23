import type { AnexoPublico } from "../../dados/consultas/anexos";
import { formatoPublico } from "../../dados/editorial/tipos-publicos";
import { separarCredito } from "../../dados/pesquisa/credito-fotografico";
import { FOTO_DA_PLACA } from "../../dados/pesquisa/excecao-placa";
import { ActionLink } from "../ui/ActionLink";

/**
 * Tabela mestre da Prestação de Contas.
 *
 * É `<table>` de verdade, com `<caption>` e `<th scope>`: o avaliador precisa
 * navegar por leitor de tela e imprimir. Em telas estreitas a mesma tabela vira
 * lista de fichas por CSS — sem trocar a marcação, para não perder a semântica.
 *
 * O hash de conferência de cada arquivo continua verificado internamente (ver
 * `/anexos.json` e `/baixar/[arquivoId]`); a tabela pública mostra só o que
 * uma pessoa precisa para achar e abrir o documento.
 */

/** Bytes em unidade legível, sem inventar precisão. */
export function tamanhoLegivel(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} kB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

/** Data ISO. */
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
          Não há anexos públicos disponíveis neste momento. Isso não significa
          que a prestação de contas esteja concluída. O Caderno de Estudos
          continua PENDENTE porque ainda não existe; ele não é um anexo
          indisponível nem deve receber link provisório. A tabela será exibida
          somente para arquivos que tenham passado pelos gates documental, de
          privacidade e de publicação.
        </p>
      </div>
    );
  }

  return (
    /*
      `<section>` nomeada: dá à região rolável um nome de landmark, para quem
      navega por leitor de tela saber onde entrou. Sem `tabindex` de propósito —
      um contêiner rolável só precisa virar parada de teclado quando não tem
      conteúdo focável dentro, e aqui toda linha tem os links "Abrir"/"Baixar",
      inclusive quando a rolagem chega ao fim: tabular por eles já rola a
      tabela inteira. A `<table>`, o `<caption>` e os `th[scope]` seguem
      intactos.
    */
    <section
      className="relative w-full max-w-full overflow-x-auto"
      aria-label="Tabela de anexos — rolável na horizontal"
    >
      <table className="w-full border-collapse text-left">
        <caption className="mb-3 text-left">
          Anexos da prestação de contas: {anexos.length}{" "}
          {anexos.length === 1 ? "item" : "itens"}, com link permanente para
          consulta e download.
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
            <tr key={anexo.linkPermanente}>
              <th
                scope="row"
                className="border-b p-2 text-left font-normal align-top"
                style={{ borderColor: "var(--color-borda)" }}
              >
                <span className="block">{anexo.titulo}</span>
                {anexo.rotuloArquivo ? (
                  <span className="meta-ficha block">
                    {separarCredito(anexo.rotuloArquivo).rotulo}
                    {anexo.principal ? " · arquivo principal" : ""}
                  </span>
                ) : null}
                {separarCredito(anexo.rotuloArquivo).credito ? (
                  <span className="meta-ficha block">
                    {separarCredito(anexo.rotuloArquivo).credito}
                  </span>
                ) : null}
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
                {formatoPublico(anexo.mimeType)}
                <span className="block">{tamanhoLegivel(anexo.bytes)}</span>
              </td>
              <td
                className="border-b p-2 align-top"
                style={{ borderColor: "var(--color-borda)" }}
              >
                <ActionLink
                  variant="document"
                  href={anexo.linkPermanente}
                  className="underline"
                  style={{ color: "var(--color-link)" }}
                >
                  {anexo.arquivoId === FOTO_DA_PLACA.arquivoPublicoId
                    ? "Abrir versão pública"
                    : "Abrir original"}
                </ActionLink>
                <ActionLink
                  variant="document"
                  href={`/baixar/${anexo.arquivoId}`}
                  className="ml-3 underline"
                  style={{ color: "var(--color-link)" }}
                >
                  {anexo.arquivoId === FOTO_DA_PLACA.arquivoPublicoId
                    ? "Baixar versão pública"
                    : "Baixar original"}
                </ActionLink>
              </td>
              <td
                className="border-b p-2 align-top"
                style={{ borderColor: "var(--color-borda)" }}
              >
                {anexo.linkOrigem ? (
                  <ActionLink
                    variant="document"
                    href={anexo.linkOrigem}
                    className="underline"
                    style={{ color: "var(--color-link)" }}
                  >
                    Origem
                  </ActionLink>
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
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
