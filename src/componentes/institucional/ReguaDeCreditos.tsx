import { PENDENCIA_DAS_MARCAS, REGUA_DE_CREDITOS } from "./creditos";

/**
 * Crédito institucional em texto, na ordem normativa.
 *
 * É lista ordenada porque a ordem é conteúdo: ascendente em importância, com
 * a assinatura federal fechando à direita (ou embaixo, quando a coluna é
 * estreita). Um leitor de tela precisa ouvir "4 de 4 — Assinatura federal" e
 * não uma sequência de nomes soltos. Ver `creditos.ts`.
 *
 * O separador do selo de programa de governo é `aria-hidden`: ele é regra de
 * aplicação gráfica, e repeti-lo em voz seria ruído. O que importa para quem
 * ouve é a ordem, e a ordem já está na lista.
 *
 * Sem `"use client"`, sem estado e sem imagem — o bloco de marcas é outro
 * componente (`CreditosInstitucionais`) e continua pendente do manual.
 */
export function ReguaDeCreditos({
  inversa = false,
}: {
  /** Sobre fundo escuro — rodapé do layout raiz. */
  readonly inversa?: boolean;
}) {
  return (
    <div className={inversa ? "regua regua--inversa" : "regua"}>
      <ol className="regua__niveis">
        {REGUA_DE_CREDITOS.map((nivel) => (
          <li className="regua__nivel" key={nivel.id}>
            {nivel.separadorAntes ? (
              <span aria-hidden="true" className="regua__separador" />
            ) : null}
            <p
              className={
                inversa
                  ? "meta-ficha meta-ficha--inversa regua__papel"
                  : "meta-ficha regua__papel"
              }
            >
              {nivel.papel}
            </p>
            <ul className="regua__instituicoes">
              {nivel.instituicoes.map((instituicao) => (
                <li key={instituicao}>{instituicao}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
      <p className="regua__pendencia">{PENDENCIA_DAS_MARCAS}</p>
    </div>
  );
}
