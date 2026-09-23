"use client";

import { ActionLink } from "../componentes/ui/ActionLink";
/**
 * Fronteira de erro da aplicação.
 *
 * `"use client"` é exigência do Next: um error boundary precisa rodar no
 * navegador para capturar a falha e oferecer a tentativa de recuperação.
 *
 * A mensagem diz o que houve e o que fazer, sem pedir desculpas e sem expor
 * detalhe técnico ao visitante — o `digest` fica disponível para quem for
 * investigar nos registros do servidor.
 */
import { Button } from "../componentes/ui/Button";

export default function Erro({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-16">
      <h1>Esta página não pôde ser carregada</h1>
      <p>
        Houve uma falha ao montar o conteúdo. Você pode tentar de novo ou seguir
        para a Prestação de Contas, que reúne os anexos e as evidências públicas
        do projeto.
      </p>
      <div className="flex flex-wrap items-center gap-4">
        <Button onClick={reset}>Tentar de novo</Button>
        <ActionLink
          variant="text"
          href="/prestacao-de-contas"
          className="underline"
          style={{ color: "var(--color-link)" }}
        >
          Ir para a Prestação de Contas
        </ActionLink>
      </div>
      {error.digest ? (
        <p className="meta-ficha">Código da ocorrência: {error.digest}</p>
      ) : null}
    </div>
  );
}
