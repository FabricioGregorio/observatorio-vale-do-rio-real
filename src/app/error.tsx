"use client";

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
import Link from "next/link";

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
        para a Sala do Avaliador, que reúne os anexos da prestação de contas.
      </p>
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={reset}
          className="border px-3 py-2"
          style={{
            borderColor: "var(--color-borda)",
            backgroundColor: "var(--color-fundo-elevado)",
            borderRadius: "var(--radius-ficha)",
          }}
        >
          Tentar de novo
        </button>
        <Link href="/prestacao-de-contas">Ir para a Sala do Avaliador</Link>
      </div>
      {error.digest ? (
        <p className="meta-ficha">Código da ocorrência: {error.digest}</p>
      ) : null}
    </div>
  );
}
