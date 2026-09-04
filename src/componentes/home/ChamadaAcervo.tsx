import Link from "next/link";

/**
 * Acervo público — fechamento da Home (Tarefa 10A).
 *
 * Aponta para as formas de leitura do acervo que não estão no menu principal:
 * o contrato legível por máquina em `/anexos.json` e a versão imprimível da
 * tabela de anexos. As duas já existem e são endereços do próprio domínio,
 * o que é justamente a função primária do site (doc 01 §0.2).
 *
 * Sem quantidade de documentos: o número sai do acervo, nunca do código.
 *
 * `/anexos.json` é rota de handler, não página; por isso usa `<a>`, como já
 * faz a Sala do Avaliador.
 */
const ID_TITULO = "acervo-publico";

export function ChamadaAcervo() {
  return (
    <section
      aria-labelledby={ID_TITULO}
      className="flex flex-col gap-4"
      style={{ maxWidth: "var(--largura-leitura)" }}
    >
      <h2 id={ID_TITULO} className="text-xl">
        Acervo público
      </h2>

      <p>
        Os anexos da prestação de contas também estão disponíveis em formato
        legível por máquina e em versão imprimível.
      </p>

      <ul className="flex list-none flex-col gap-2 p-0">
        <li>
          <a
            href="/anexos.json"
            className="underline"
            style={{ color: "var(--color-link)" }}
          >
            /anexos.json — versão legível por máquina
          </a>
        </li>
        <li>
          <Link
            href="/prestacao-de-contas/imprimir"
            className="underline"
            style={{ color: "var(--color-link)" }}
          >
            Versão imprimível da tabela de anexos
          </Link>
        </li>
      </ul>
    </section>
  );
}
