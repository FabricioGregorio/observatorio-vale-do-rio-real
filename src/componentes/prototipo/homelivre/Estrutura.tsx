import type { ReactNode } from "react";

import type { ContextoDaHome } from "./abertura";
import type { Fonte } from "./conteudo";

/**
 * Toda seção da Home v2 recebe o contexto, e por um motivo só: o bloco de
 * fontes é instrumento de laboratório. Ele cita caminho de repositório, código
 * de fase e identificador de documento restrito — material interno, que não
 * pode existir na árvore pública. Por isso `Fontes` **não renderiza** em
 * `publico`, em vez de ser escondido por CSS ou por `hidden`: esconder ainda
 * seria publicar.
 */
export type PropsDeSecao = { contexto?: ContextoDaHome };

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

export function Fontes({
  contexto = "dev",
  itens,
}: PropsDeSecao & { itens: readonly Fonte[] }) {
  if (contexto === "publico") return null;

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
