import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";

/**
 * Página de referência visual (Tarefa 02).
 *
 * Não é página pública: existe para conferir, numa tela só, o que o
 * `tokens.css` define. Fica fora do índice de busca e não entra no sitemap.
 *
 * Os valores exibidos são **lidos do próprio `tokens.css` em tempo de build**,
 * não copiados para cá. Duplicar os hex neste arquivo violaria a regra do doc
 * 03 §3 — nenhum valor de cor vive fora do arquivo de tokens — e deixaria as
 * duas listas divergirem em silêncio.
 */

export const metadata: Metadata = {
  title: "Referência visual — tokens",
  robots: { index: false, follow: false },
};

// ─── Leitura dos tokens ────────────────────────────────────────────

const CAMINHO_TOKENS = join(process.cwd(), "src", "estilos", "tokens.css");

/** Todas as custom properties declaradas no bloco `@theme`. */
function lerTokens(): Map<string, string> {
  const css = readFileSync(CAMINHO_TOKENS, "utf8");
  const tokens = new Map<string, string>();
  for (const m of css.matchAll(/^\s*(--[a-z0-9-]+):\s*([^;]+);/gim)) {
    const nome = m[1]?.trim();
    const valor = m[2]?.trim();
    if (nome && valor) tokens.set(nome, valor);
  }
  return tokens;
}

/** Resolve `var(--outro-token)` até chegar a um valor literal. */
function resolver(
  tokens: Map<string, string>,
  nome: string,
  saltos = 0,
): string {
  const valor = tokens.get(nome);
  if (!valor || saltos > 10) return valor ?? "";
  const ref = valor.match(/^var\((--[a-z0-9-]+)\)$/i);
  return ref?.[1] ? resolver(tokens, ref[1], saltos + 1) : valor;
}

// ─── Contraste (WCAG 2.1) ──────────────────────────────────────────

function canais(hex: string): [number, number, number] {
  const h = hex.replace("#", "").trim();
  const par = (i: number) => Number.parseInt(h.slice(i, i + 2), 16) / 255;
  return [par(0), par(2), par(4)];
}

/** Luminância relativa, conforme a definição da WCAG 2.1. */
function luminancia(hex: string): number {
  const [r, g, b] = canais(hex).map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  ) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Razão de contraste entre duas cores, de 1:1 a 21:1. */
export function razaoDeContraste(frente: string, fundo: string): number {
  const a = luminancia(frente);
  const b = luminancia(fundo);
  const [claro, escuro] = a > b ? [a, b] : [b, a];
  return (claro + 0.05) / (escuro + 0.05);
}

type Veredito = { rotulo: string; aprovado: boolean };

/** AA exige 4.5:1 para texto normal e 3:1 para texto grande e componentes. */
function veredito(razao: number): Veredito {
  if (razao >= 4.5) return { rotulo: "AA — texto normal", aprovado: true };
  if (razao >= 3)
    return { rotulo: "AA — só texto grande ou UI", aprovado: false };
  return { rotulo: "reprova", aprovado: false };
}

// ─── Conteúdo da página ────────────────────────────────────────────

/** Pares realmente usados pelos componentes, em papéis semânticos. */
const PARES: { frente: string; fundo: string; uso: string }[] = [
  { frente: "--color-texto", fundo: "--color-fundo", uso: "corpo de texto" },
  {
    frente: "--color-texto-suave",
    fundo: "--color-fundo",
    uso: "metadado de ficha",
  },
  { frente: "--color-link", fundo: "--color-fundo", uso: "links" },
  { frente: "--color-acento", fundo: "--color-fundo", uso: "acento textual" },
  {
    frente: "--color-texto",
    fundo: "--color-fundo-elevado",
    uso: "texto em ficha",
  },
  {
    frente: "--color-link",
    fundo: "--color-fundo-elevado",
    uso: "link em ficha",
  },
  {
    frente: "--color-texto-inverso",
    fundo: "--color-fundo-inverso",
    uso: "cabeçalho e rodapé",
  },
  {
    frente: "--color-destaque",
    fundo: "--color-fundo-inverso",
    uso: "destaque sobre escuro",
  },
  {
    frente: "--color-texto",
    fundo: "--color-destaque",
    uso: "texto sobre marcador de destaque",
  },
  {
    frente: "--color-destaque",
    fundo: "--color-fundo",
    uso: "PROIBIDO — destaque como texto sobre claro",
  },
];

const ESCALA = [
  "--text-xs",
  "--text-sm",
  "--text-base",
  "--text-lg",
  "--text-xl",
  "--text-2xl",
  "--text-3xl",
  "--text-4xl",
  "--text-5xl",
];

export default function ReferenciaVisual() {
  const tokens = lerTokens();
  const cores = [...tokens.keys()].filter((n) => n.startsWith("--color-"));

  return (
    // O <main id="conteudo"> vive no layout raiz desde a Tarefa 03.
    <div className="mx-auto flex max-w-5xl flex-col gap-12 px-4 py-10">
      <header className="flex flex-col gap-2">
        <h1>Referência visual</h1>
        <p style={{ color: "var(--color-texto-suave)" }}>
          Tudo abaixo é lido de <code>src/estilos/tokens.css</code> em tempo de
          build. Página interna, fora do índice de busca e do sitemap.
        </p>
      </header>

      {/* ─── Paleta ─────────────────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <h2>Paleta</h2>
        <ul className="grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 lg:grid-cols-4">
          {cores.map((nome) => {
            const valor = resolver(tokens, nome);
            return (
              <li
                key={nome}
                className="flex flex-col gap-2 border p-3"
                style={{
                  borderColor: "var(--color-borda)",
                  backgroundColor: "var(--color-fundo-elevado)",
                  borderRadius: "var(--radius-ficha)",
                }}
              >
                <span
                  className="block h-12 w-full border"
                  style={{
                    backgroundColor: `var(${nome})`,
                    borderColor: "var(--color-borda)",
                  }}
                />
                <span className="meta-ficha">
                  {nome.replace("--color-", "")}
                </span>
                <code className="meta-ficha">{valor}</code>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ─── Contraste calculado ────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <h2>Contraste calculado</h2>
        <p style={{ color: "var(--color-texto-suave)" }}>
          Razão calculada aqui pela fórmula da WCAG 2.1, a partir dos valores
          dos tokens — não copiada de comentário.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">
              Razão de contraste de cada par de cores em uso
            </caption>
            <thead>
              <tr>
                {["Par", "Uso", "Razão", "Amostra", "Veredito"].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="meta-ficha border-b p-2"
                    style={{ borderColor: "var(--color-borda)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PARES.map(({ frente, fundo, uso }) => {
                const hexFrente = resolver(tokens, frente);
                const hexFundo = resolver(tokens, fundo);
                const razao = razaoDeContraste(hexFrente, hexFundo);
                const { rotulo, aprovado } = veredito(razao);
                return (
                  <tr key={`${frente}|${fundo}`}>
                    <td
                      className="meta-ficha border-b p-2"
                      style={{ borderColor: "var(--color-borda)" }}
                    >
                      {frente.replace("--color-", "")} sobre{" "}
                      {fundo.replace("--color-", "")}
                    </td>
                    <td
                      className="border-b p-2"
                      style={{ borderColor: "var(--color-borda)" }}
                    >
                      {uso}
                    </td>
                    <td
                      className="meta-ficha border-b p-2"
                      style={{ borderColor: "var(--color-borda)" }}
                    >
                      {razao.toFixed(2)}:1
                    </td>
                    <td
                      className="border-b p-2"
                      style={{ borderColor: "var(--color-borda)" }}
                    >
                      <span
                        className="inline-block px-2 py-1"
                        style={{
                          color: `var(${frente})`,
                          backgroundColor: `var(${fundo})`,
                        }}
                      >
                        Aa texto
                      </span>
                    </td>
                    <td
                      className="border-b p-2"
                      style={{ borderColor: "var(--color-borda)" }}
                    >
                      <strong>{aprovado ? "passa" : "não passa"}</strong> —{" "}
                      {rotulo}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p>
          O último par existe para deixar a regra visível:{" "}
          <code>--color-destaque</code> nunca é cor de texto sobre fundo claro.
          Sobre claro ele serve como preenchimento, borda ou marcador, com o
          texto em <code>--color-texto</code> por cima — que é o penúltimo par.
        </p>
      </section>

      {/* ─── Tipografia ─────────────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <h2>Escala tipográfica</h2>
        <ul className="flex list-none flex-col gap-3 p-0">
          {ESCALA.map((nome) => (
            <li key={nome} className="flex flex-wrap items-baseline gap-3">
              <span className="meta-ficha">
                {nome.replace("--text-", "")} · {tokens.get(nome)}
              </span>
              <span style={{ fontSize: `var(${nome})` }}>
                Vale do Rio Real — ação, çã, õe
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <h2>Famílias</h2>
        <p style={{ fontFamily: "var(--font-display)" }}>
          Display · Archivo — títulos e numerais de ficha. Ação, coração, São
          Cristóvão.
        </p>
        <p style={{ fontFamily: "var(--font-leitura)" }}>
          Leitura · Literata — documento final, transcrições, texto longo. Ação,
          coração, São Cristóvão.
        </p>
        <p style={{ fontFamily: "var(--font-mono)" }}>
          Mono · IBM Plex Mono — metadados, datas, hashes. 0faa4397902fe6fd
        </p>
      </section>

      {/* ─── Utilitários de ficha ───────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <h2>Utilitários de ficha</h2>
        <div
          className="flex flex-col gap-2 border p-4"
          style={{
            borderColor: "var(--color-borda)",
            backgroundColor: "var(--color-fundo-elevado)",
            borderRadius: "var(--radius-ficha)",
          }}
        >
          <span className="numeral-ficha">VII</span>
          <span className="meta-ficha">visita · 11/04/2026 · Ilha Grande</span>
          <p>
            A numeração é real e informativa — nunca decorativa. O numeral acima
            é a sétima visita de campo, não um enfeite.
          </p>
        </div>
      </section>

      {/* ─── Foco ───────────────────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <h2>Estados de foco</h2>
        <p style={{ color: "var(--color-texto-suave)" }}>
          Percorra só por <kbd className="meta-ficha">Tab</kbd>: todo elemento
          interativo mostra contorno de 3px em <code>--color-foco</code>.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <a href="#conteudo" style={{ color: "var(--color-link)" }}>
            Link de exemplo
          </a>
          <button
            type="button"
            className="border px-3 py-2"
            style={{
              borderColor: "var(--color-borda)",
              backgroundColor: "var(--color-fundo-elevado)",
              borderRadius: "var(--radius-ficha)",
            }}
          >
            Botão de exemplo
          </button>
          <label className="flex items-center gap-2">
            <span className="meta-ficha">Campo</span>
            <input
              type="text"
              className="border px-2 py-1"
              style={{
                borderColor: "var(--color-borda)",
                backgroundColor: "var(--color-fundo-elevado)",
                borderRadius: "var(--radius-ficha)",
              }}
            />
          </label>
          <details>
            <summary className="meta-ficha">Detalhe recolhível</summary>
            <p>Conteúdo revelado.</p>
          </details>
        </div>
        <p>
          A classe <code>.pular-conteudo</code> também vive no{" "}
          <code>tokens.css</code> e só aparece ao receber foco. Ela é usada pelo
          layout base, na Tarefa 03.
        </p>
      </section>
    </div>
  );
}
