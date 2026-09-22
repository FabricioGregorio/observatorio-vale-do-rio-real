import type { AnexoPublico } from "../../dados/consultas/anexos";
import { separarCredito } from "../../dados/pesquisa/credito-fotografico";
import { LinkDeDestino } from "../layout/LinkDeDestino";

/**
 * Tabela mestre da Prestação de Contas.
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
      `relative` não é decoração: é a correção do overflow horizontal em 375 px.

      Cada linha guarda o SHA-256 integral num `<code className="sr-only">`, que
      é `position: absolute`. Sem ancestral posicionado, o bloco container desses
      elementos é o `<html>`, e não este contêiner de rolagem — e um contêiner de
      rolagem só clipa descendentes para os quais ele participa do bloco
      container. Os oito `sr-only` escapavam do clip na coluna do hash, a ~628 px,
      e faziam `documentElement.scrollWidth` ir a 629 px numa viewport de 375 px.
      A tabela em si (621 px) sempre foi clipada corretamente: ela nunca foi a
      causa. Com `relative`, os `sr-only` passam a ser clipados aqui dentro e a
      página deixa de rolar na horizontal — a tabela continua rolando.

      `<section>` nomeada: dá à região rolável um nome de landmark, para quem
      navega por leitor de tela saber onde entrou. Sem `tabindex` de propósito —
      um contêiner rolável só precisa virar parada de teclado quando não tem
      conteúdo focável dentro, e aqui toda linha tem o link "Baixar" e o
      `<summary>` do hash integral, inclusive na última coluna: tabular por eles
      já rola a tabela até o fim. A `<table>`, o `<caption>` e os `th[scope]`
      seguem intactos.
    */
    <section
      className="relative w-full max-w-full overflow-x-auto"
      aria-label="Tabela de anexos — rolável na horizontal"
    >
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
                {anexo.mimeType}
                <span className="block">{tamanhoLegivel(anexo.bytes)}</span>
              </td>
              <td
                className="border-b p-2 align-top"
                style={{ borderColor: "var(--color-borda)" }}
              >
                <LinkDeDestino
                  href={anexo.linkPermanente}
                  className="underline"
                  style={{ color: "var(--color-link)" }}
                >
                  Baixar
                </LinkDeDestino>
              </td>
              <td
                className="border-b p-2 align-top"
                style={{ borderColor: "var(--color-borda)" }}
              >
                {anexo.linkOrigem ? (
                  <LinkDeDestino
                    href={anexo.linkOrigem}
                    className="underline"
                    style={{ color: "var(--color-link)" }}
                  >
                    Origem
                  </LinkDeDestino>
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
    </section>
  );
}
