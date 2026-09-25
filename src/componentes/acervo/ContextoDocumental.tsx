import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import type {
  LinhaDeContexto,
  Relacionado,
} from "../../dados/editorial/relacoes";

/**
 * O que se sabe da peça, em termo e valor — para quem chegou direto nela.
 *
 * Só dado estruturado: nenhuma frase é escrita aqui. Linha sem valor não
 * existe, e lista vazia não desenha nada.
 */
export function DadosDaPeca({
  linhas,
  rotulo,
  children,
}: {
  linhas: readonly LinhaDeContexto[];
  rotulo: string;
  /** Linhas que precisam de marcação própria, como uma data com `<time>`. */
  children?: ReactNode;
}) {
  if (linhas.length === 0 && !children) return null;
  return (
    <dl aria-label={rotulo} className="acervo-contexto">
      {linhas.map((linha) => (
        <div key={linha.termo}>
          <dt className="meta-ficha">{linha.termo}</dt>
          <dd>{linha.valor}</dd>
        </div>
      ))}
      {children}
    </dl>
  );
}

/** Uma linha de `DadosDaPeca` com conteúdo marcado. */
export function LinhaDaPeca({
  termo,
  children,
}: {
  termo: string;
  children: ReactNode;
}) {
  return (
    <div>
      <dt className="meta-ficha">{termo}</dt>
      <dd>{children}</dd>
    </div>
  );
}

/**
 * Páginas ligadas a esta peça por relação declarada. A categoria diz por que
 * a ligação existe ("Lugar", "Episódio"); sem relação, sem bloco.
 */
export function Relacionados({
  itens,
  id,
}: {
  itens: readonly Relacionado[];
  id: string;
}) {
  if (itens.length === 0) return null;
  return (
    <section aria-labelledby={id} className="acervo-relacionados border-t pt-6">
      <h2 className="text-xl" id={id}>
        Relacionado
      </h2>
      <ul className="mt-3 grid list-none gap-2 p-0">
        {itens.map((item) => (
          <li key={item.href}>
            <span className="meta-ficha">{item.categoria}</span>{" "}
            <Link href={item.href as Route} prefetch={false}>
              {item.rotulo}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
