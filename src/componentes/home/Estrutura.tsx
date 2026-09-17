import type { ReactNode } from "react";

/**
 * Peças de estrutura da Home: capítulo e marcação de pendência.
 *
 * Server Components, sem estado.
 *
 * O bloco `Fontes` que acompanhava cada capítulo saiu com o laboratório: ele
 * citava caminho de repositório, código de fase e identificador de documento
 * restrito, e nunca foi renderizado no conteúdo público.
 */

export function Capitulo({
  id,
  numero,
  rotulo,
  titulo,
  antes,
  className,
  children,
}: {
  id: string;
  numero: string;
  rotulo: string;
  titulo: string;
  /** Linha editorial curta que precede o título. */
  antes?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby={`${id}-titulo`}
      className={className ? `hl-capitulo ${className}` : "hl-capitulo"}
      id={id}
    >
      <div className="hl-quadro">
        <p className="hl-rotulo">
          <span className="hl-num">{numero}</span>
          <span className="meta-ficha">{rotulo}</span>
        </p>
        {antes ? <p className="hl-antes">{antes}</p> : null}
        <h2 id={`${id}-titulo`}>{titulo}</h2>
        {children}
      </div>
    </section>
  );
}

/** Marca visível de algo que depende de confirmação ou de material real. */
export function Pendente({ children }: { children: ReactNode }) {
  return <span className="hl-pendente">{children}</span>;
}
