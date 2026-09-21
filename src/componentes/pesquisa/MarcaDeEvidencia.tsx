import type { TipoDeEvidencia } from "./conteudoDaPesquisa";

/**
 * A marca gráfica de uma natureza de evidência.
 *
 * ## Por que forma, e não cor
 *
 * As quatro marcas se distinguem pelo desenho — quadrado cheio, quadrado
 * vazado, círculo e triângulo —, e a cor só reforça. Quem não separa as
 * cores continua separando as marcas, e é a mesma regra que a cartografia do
 * Território aplica aos seus símbolos.
 *
 * ## Por que sem nome acessível
 *
 * A marca nunca aparece sozinha: em todo lugar onde ela é usada, o nome da
 * evidência está escrito ao lado, em texto. Dar nome acessível ao desenho
 * faria o leitor de tela anunciar a mesma coisa duas vezes.
 *
 * A cor vem de `color` na folha da rota, e o desenho a herda por
 * `currentColor` — nenhum valor de cor é escrito aqui.
 */
export function MarcaDeEvidencia({ tipo }: { tipo: TipoDeEvidencia }) {
  return (
    <svg
      aria-hidden="true"
      className="pq-marca"
      data-evidencia={tipo}
      focusable="false"
      viewBox="0 0 12 12"
    >
      {tipo === "registro" ? (
        <rect fill="currentColor" height="9" width="9" x="1.5" y="1.5" />
      ) : null}
      {tipo === "formulario" ? (
        <rect
          fill="none"
          height="8"
          stroke="currentColor"
          strokeWidth="2"
          width="8"
          x="2"
          y="2"
        />
      ) : null}
      {tipo === "entrevista" ? (
        <circle cx="6" cy="6" fill="currentColor" r="4.5" />
      ) : null}
      {tipo === "campo" ? (
        <path
          d="M6 1.6 11 10.4H1z"
          fill="none"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      ) : null}
    </svg>
  );
}
