import { CartaoCaminho } from "./CartaoCaminho";
import type { Caminho } from "./caminhos";

/**
 * Caminhos prioritários da Home (Tarefa 10A).
 *
 * É a resposta ao critério de navegação do doc 01 §2: cada público chega ao
 * seu destino em no máximo dois cliques a partir da Home. Por isso é `<nav>`
 * com rótulo próprio, e não uma vitrine de cartões.
 *
 * A lista vem por props para que o conjunto de destinos seja verificável em
 * teste sem renderização.
 */
const ID_TITULO = "caminhos-prioritarios";

export function CaminhosPrioritarios({
  caminhos,
}: {
  caminhos: readonly Caminho[];
}) {
  return (
    <nav aria-labelledby={ID_TITULO} className="flex flex-col gap-4">
      <h2 id={ID_TITULO} className="text-xl">
        Caminhos prioritários
      </h2>

      <ul className="grid list-none gap-4 p-0 sm:grid-cols-2">
        {caminhos.map((caminho) => (
          <CartaoCaminho caminho={caminho} key={caminho.href} />
        ))}
      </ul>
    </nav>
  );
}
