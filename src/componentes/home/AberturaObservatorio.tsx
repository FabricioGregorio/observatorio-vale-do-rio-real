import Link from "next/link";

/**
 * Abertura da Home — ficha-mestra do Observatório (Tarefa 10A).
 *
 * Não é hero: sem gradiente, sem carrossel, sem foto genérica, sem número
 * grande decorativo (doc 03 §3). Traz o nome oficial, o estado real do acervo
 * e a ação principal — abrir a Sala do Avaliador, a página mais importante do
 * site (doc 01 §4).
 *
 * Todo o texto daqui já existia aprovado no repositório: "Arquivo público" vem
 * da descrição do site em `layout.tsx`, e a frase de estado é a mesma que a
 * Home provisória trazia. Nenhuma apresentação institucional foi escrita: ela
 * depende de texto humano e permanece bloqueada nesta fatia.
 */
export function AberturaObservatorio() {
  return (
    <header
      className="flex flex-col gap-4"
      style={{ maxWidth: "var(--largura-leitura)" }}
    >
      <p className="meta-ficha">Arquivo público</p>

      <h1 className="text-3xl">Observatório do Vale do Rio Real</h1>

      <p>O acervo público está em preparação.</p>

      <p>
        <Link
          href="/prestacao-de-contas"
          className="inline-block px-4 py-2 font-semibold"
          style={{
            backgroundColor: "var(--color-fundo-inverso)",
            color: "var(--color-texto-inverso)",
            borderRadius: "var(--radius-ficha)",
          }}
        >
          Abrir a Prestação de Contas
        </Link>
      </p>
    </header>
  );
}
