import type { ReactNode } from "react";

import type { Fonte } from "./conteudo";

/**
 * Peças de estrutura do experimento: capítulo, fontes e marcação de pendência.
 *
 * Server Components. Nenhum estado: o bloco de fontes usa `<details>`, que já
 * é acessível por teclado e funciona sem JavaScript.
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

export function Fontes({ itens }: { itens: readonly Fonte[] }) {
  return (
    <details className="hl-fontes">
      <summary>Fontes desta seção · experimento</summary>
      <dl>
        {itens.map((item) => (
          <div key={item.afirmacao}>
            <dt>{item.afirmacao}</dt>
            <dd>{item.base}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}

/** Marca visível de algo que depende de confirmação ou de material real. */
export function Pendente({ children }: { children: ReactNode }) {
  return <span className="hl-pendente">{children}</span>;
}
