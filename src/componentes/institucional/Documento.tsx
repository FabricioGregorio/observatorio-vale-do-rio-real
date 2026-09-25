import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import "./documental.css";

/**
 * Casca das páginas institucionais curtas.
 *
 * Seis rotas com a mesma forma — abertura, seções rotuladas, fecho — escritas
 * seis vezes seriam seis lugares para a estrutura divergir, e num site de
 * prestação de contas divergência de forma vira divergência de leitura. A
 * folha está em `documental.css`.
 *
 * O componente não decide conteúdo: ele só garante que rótulo, título e corpo
 * fiquem sempre na mesma relação, e que a seção sempre tenha nome acessível.
 */

export function Documento({ children }: { readonly children: ReactNode }) {
  return <div className="doc">{children}</div>;
}

export function AberturaDocumental({
  rotulo,
  titulo,
  sintese,
  children,
}: {
  readonly rotulo: string;
  readonly titulo: string;
  readonly sintese: string;
  readonly children?: ReactNode;
}) {
  return (
    <header className="doc-abertura">
      <p className="meta-ficha">{rotulo}</p>
      <h1>{titulo}</h1>
      <p className="doc-abertura__sintese">{sintese}</p>
      {children}
    </header>
  );
}

/**
 * Uma seção com rótulo de ficha e nome acessível.
 *
 * `id` é obrigatório: ele vira o `aria-labelledby` do `<section>`, e seção sem
 * nome acessível é região anônima para quem navega por landmarks.
 */
export function SecaoDocumental({
  id,
  rotulo,
  titulo,
  children,
}: {
  readonly id: string;
  readonly rotulo: string;
  readonly titulo: string;
  readonly children: ReactNode;
}) {
  return (
    <section aria-labelledby={`${id}-titulo`} className="doc-secao">
      <p className="meta-ficha doc-secao__rotulo">{rotulo}</p>
      <div className="doc-secao__corpo">
        <h2 id={`${id}-titulo`}>{titulo}</h2>
        {children}
      </div>
    </section>
  );
}

/** O texto com o trecho indicado transformado em link interno. */
function comDestino(
  texto: string,
  destino: { readonly trecho: string; readonly href: string },
): ReactNode {
  const inicio = texto.indexOf(destino.trecho);
  if (inicio < 0) {
    throw new Error(`Trecho de destino ausente do texto: ${destino.trecho}.`);
  }
  const fim = inicio + destino.trecho.length;
  return (
    <>
      {texto.slice(0, inicio)}
      <Link href={destino.href as Route} prefetch={false}>
        {destino.trecho}
      </Link>
      {texto.slice(fim)}
    </>
  );
}

/**
 * Item de afirmação: o que o site faz, e como isso é verificável.
 *
 * `prova` não é enfeite. Numa declaração de acessibilidade ou de privacidade,
 * a afirmação sem a prova é exatamente o texto genérico que estas páginas
 * existem para não ser.
 */
export function ItemVerificavel({
  titulo,
  texto,
  prova,
  destino,
}: {
  readonly titulo: string;
  readonly texto: string;
  readonly prova: string | null;
  readonly destino?: { readonly trecho: string; readonly href: string };
}) {
  return (
    <li className="doc-item">
      <h3>{titulo}</h3>
      <p>{destino === undefined ? texto : comDestino(texto, destino)}</p>
      {prova === null ? null : (
        <p className="doc-item__prova meta-ficha">{prova}</p>
      )}
    </li>
  );
}
