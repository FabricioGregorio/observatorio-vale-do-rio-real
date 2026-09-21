import { useId } from "react";

import { classificarDestino } from "../../lib/destino-de-link";

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
 * `meta` é a linha secundária dos botões da Home (formato, tamanho, licença):
 * vem depois da seta, para que a seta acompanhe o rótulo e não a linha técnica.
 */
export function LinkDeDestino({
  href,
  children,
  className,
  meta,
  style,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  meta?: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const aviso = useId();
  const destino = classificarDestino(href);
  if (destino === "interno") {
    return (
      <a className={className} href={href} style={style}>
        {children}
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
        aria-describedby={aviso}
        className={className}
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
        {children} <span aria-hidden="true">↗</span>
        {meta}
      </a>
    </>
  );
}
