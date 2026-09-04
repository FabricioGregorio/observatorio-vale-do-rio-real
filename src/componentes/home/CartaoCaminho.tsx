import Link from "next/link";

import type { Caminho } from "./caminhos";

/**
 * Cartão de um caminho prioritário da Home (Tarefa 10A).
 *
 * Recebe tudo por props e não busca nada — componente de acervo não consulta
 * banco (doc 03 §5).
 *
 * O link é sublinhado além de colorido: a distância de contraste entre a tinta
 * de link e a de texto não chega a 3:1, então cor sozinha não distingue o
 * link (WCAG 1.4.1).
 *
 * Quando o destino ainda não publicou conteúdo, o cartão declara o estado em
 * vez de descrever o que não existe. O caminho continua visível de propósito:
 * o critério de aceite da Tarefa 10 exige caminhos para Sala do Avaliador,
 * PodObservar e A Pesquisa, e a rota existe — o que falta é o conteúdo dela.
 */
export function CartaoCaminho({ caminho }: { caminho: Caminho }) {
  return (
    <li>
      <article
        className="flex h-full flex-col gap-2 border p-4"
        style={{
          borderColor: "var(--color-borda)",
          backgroundColor: "var(--color-fundo-elevado)",
          borderRadius: "var(--radius-ficha)",
        }}
      >
        <h3 className="text-lg">
          <Link
            href={caminho.href}
            className="underline"
            style={{ color: "var(--color-link)" }}
          >
            {caminho.rotulo}
          </Link>
        </h3>

        {caminho.descricao === null ? (
          <p className="meta-ficha">Em preparação</p>
        ) : (
          <p>{caminho.descricao}</p>
        )}
      </article>
    </li>
  );
}
