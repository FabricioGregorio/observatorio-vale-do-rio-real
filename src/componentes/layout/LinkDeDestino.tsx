import { useId } from "react";

import { classificarDestino } from "../../lib/destino-de-link";

/**
 * Sinal de percurso de um link que fica na mesma guia. A saída para outra
 * guia tem sinal próprio (↗), que não é opção: sai da política de destino.
 *
 *   seguir  →  continuidade para outra rota do site
 *   voltar  ←  retorno ao nível de cima; vem antes do rótulo
 *   descer  ↓  deslocamento para mais abaixo na mesma página
 */
export type SinalDePercurso = "seguir" | "voltar" | "descer";

const GLIFO: Record<SinalDePercurso | "externo", string> = {
  seguir: "→",
  voltar: "←",
  descer: "↓",
  externo: "↗",
};

/**
 * Link cujo comportamento de guia sai da política de `destino-de-link.ts`.
 *
 * Serve a todo `href` que não se sabe de antemão — o que vem do banco, do
 * manifesto ou de um material que pode ser tanto arquivo quanto ficha do
 * Acervo. Documento e site externo abrem em nova guia; rota do Observatório
 * fica na mesma guia, sem atributo nenhum a mais.
 *
 * Na nova guia a convenção é a do Acervo e do PodObservar: `rel="noopener
 * noreferrer"` (mais `external` quando o destino é outro site) e
 * `referrerpolicy="no-referrer"`, como os links de rota de `/territorio` já
 * faziam; um aviso "Abre em nova guia." ligado por `aria-describedby`; e
 * a seta ↗ fora da árvore de acessibilidade — quem usa leitor de tela recebe o
 * aviso, não um caractere lido como "seta nordeste".
 *
 * O caractere da seta continua no HTML, e `data-sinal` no link diz qual é.
 * Dentro de uma ação (`.acao`), `acoes.css` desenha a seta com o traço do
 * sistema e guarda o caractere como reserva — é ele que aparece em modo de
 * alto contraste, onde fundo desenhado não é pintado.
 *
 * `meta` é a linha secundária dos botões da Home (formato, tamanho, licença):
 * vem depois da seta, para que a seta acompanhe o rótulo e não a linha técnica.
 */
export function LinkDeDestino({
  href,
  children,
  className,
  meta,
  style,
  download,
  sinal,
  ...atributos
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  meta?: React.ReactNode;
  style?: React.CSSProperties;
  sinal?: SinalDePercurso;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  const aviso = useId();
  const destino = classificarDestino(href);
  const baixar = download !== undefined && download !== false;
  if (destino === "interno" || baixar) {
    const percurso = baixar ? undefined : sinal;
    const glifo = percurso ? (
      <span aria-hidden="true">{GLIFO[percurso]}</span>
    ) : null;
    return (
      <a
        {...atributos}
        className={className}
        data-sinal={percurso}
        href={href}
        style={style}
        download={download}
      >
        {percurso === "voltar" ? glifo : null}
        {children}
        {percurso === "voltar" ? null : glifo}
        {meta}
      </a>
    );
  }
  return (
    <>
      <span className="sr-only" id={aviso}>
        Abre em nova guia.
      </span>
      <a
        {...atributos}
        aria-describedby={[atributos["aria-describedby"], aviso]
          .filter(Boolean)
          .join(" ")}
        className={className}
        data-sinal="externo"
        href={href}
        referrerPolicy="no-referrer"
        rel={
          destino === "externo"
            ? "noopener noreferrer external"
            : "noopener noreferrer"
        }
        style={style}
        target="_blank"
      >
        {children} <span aria-hidden="true">{GLIFO.externo}</span>
        {meta}
      </a>
    </>
  );
}
