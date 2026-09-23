import { ActionLink } from "../componentes/ui/ActionLink";

/**
 * Página 404.
 *
 * Oferece dois caminhos, como a Tarefa 03 exige: a Prestação de Contas, que é
 * a página mais importante do site, e a busca. A busca ainda não existe como
 * rota — enquanto isso o caminho oferecido é o índice de dados, sem prometer
 * uma página que não está no ar.
 */
export default function NaoEncontrado() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-16">
      <h1>Página não encontrada</h1>
      <p>
        O endereço pedido não existe neste site. Se você chegou por um link
        antigo, ele pode ter sido movido.
      </p>
      <nav aria-label="Caminhos a partir do erro">
        <ul className="flex list-none flex-col gap-2 p-0">
          <li>
            <ActionLink
              variant="text"
              href="/prestacao-de-contas"
              className="underline"
              style={{ color: "var(--color-link)" }}
            >
              Prestação de Contas — anexos e evidências públicas
            </ActionLink>
          </li>
          <li>
            <ActionLink
              variant="text"
              href="/dados"
              className="underline"
              style={{ color: "var(--color-link)" }}
            >
              Portal de dados abertos
            </ActionLink>
          </li>
          <li>
            <ActionLink
              variant="text"
              href="/"
              className="underline"
              style={{ color: "var(--color-link)" }}
            >
              Página inicial
            </ActionLink>
          </li>
        </ul>
      </nav>
    </div>
  );
}
