import Link from "next/link";

/**
 * Página 404.
 *
 * Oferece dois caminhos, como a Tarefa 03 exige: a Sala do Avaliador, que é a
 * página mais importante do site, e a busca. A busca ainda não existe como
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
            <Link href="/prestacao-de-contas">
              Sala do Avaliador — todos os anexos da prestação de contas
            </Link>
          </li>
          <li>
            <Link href="/dados">Portal de dados abertos</Link>
          </li>
          <li>
            <Link href="/">Página inicial</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
