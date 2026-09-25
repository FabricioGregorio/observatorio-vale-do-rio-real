import { ActionLink } from "../componentes/ui/ActionLink";

/**
 * Página 404.
 *
 * Oferece caminhos de recuperação, como a Tarefa 03 exige. O primeiro era a
 * Prestação de Contas; desde 2026-09-23 é o Acervo, que passou a ser o único
 * lugar de consulta documental do site — e é onde quem chegou por um link
 * antigo de documento tem chance de achar o que procurava.
 *
 * A busca continua fora: ela não existe como rota, e oferecer uma página que
 * não está no ar é o defeito que esta página serve para reparar.
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
            <ActionLink variant="text" href="/acervo">
              Acervo — documentos e registros públicos
            </ActionLink>
          </li>
          <li>
            <ActionLink variant="text" href="/dados">
              Dados
            </ActionLink>
          </li>
          <li>
            <ActionLink variant="text" href="/">
              Página inicial
            </ActionLink>
          </li>
        </ul>
      </nav>
    </div>
  );
}
