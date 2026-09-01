/**
 * Stub de rota — Tarefa 03.
 *
 * Existe para que o destino de navegação exista de fato: com
 * `typedRoutes: true`, um `<Link>` para rota inexistente reprova em
 * `pnpm tipos`. A alternativa seria `as Route`, que anularia a checagem, ou
 * desligar `typedRoutes` — ambas proibidas.
 *
 * Traz apenas estrutura: título e estado vazio explícito. **Nenhum conteúdo
 * institucional inventado** — texto de apresentação, missão ou dado de
 * pesquisa entram quando houver fonte, nunca por estimativa (AGENTS.md).
 */
export default function Pagina() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-12">
      <h1>O Observatório</h1>
      <p>Esta seção ainda não tem conteúdo publicado.</p>
    </div>
  );
}
