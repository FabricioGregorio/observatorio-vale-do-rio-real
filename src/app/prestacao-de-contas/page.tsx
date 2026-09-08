import Link from "next/link";

import { TabelaAnexos } from "../../componentes/acervo/TabelaAnexos";
import { listarAnexosPublicos } from "../../dados/consultas/anexos";
import { metadadosDaRota } from "../../lib/site-url";
import { urlDoZipDeAnexos } from "../../lib/zip-anexos";

/**
 * Sala do Avaliador — a página mais importante do site (doc 01 §4).
 *
 * Tudo que a FUNCAP precisa em um lugar, sem login e sem link quebrado. É a
 * tradução para a web do PDF "Links de Referência", e resolve o risco técnico
 * nº 1 do projeto: endereços de Drive e Figma que quebram, mudam de permissão
 * e não sobrevivem a uma auditoria (doc 01 §0.2).
 *
 * Gerada em build. O banco não é consultado em tempo de requisição (ADR-001).
 */

export const metadata = metadadosDaRota({
  pathname: "/prestacao-de-contas",
  titulo: "Prestação de Contas — Sala do Avaliador",
  descricao:
    "Todos os anexos da prestação de contas, com link permanente, data e hash SHA-256.",
});

export default async function SalaDoAvaliador() {
  const anexos = await listarAnexosPublicos();
  const zip = anexos.length > 0 ? urlDoZipDeAnexos() : null;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12">
      <header className="flex flex-col gap-3">
        <h1>Prestação de Contas</h1>
        <p>
          Todos os anexos do projeto, com endereço permanente neste domínio,
          data de publicação e hash SHA-256 para conferência de integridade. Sem
          login, sem pedido de permissão.
        </p>
      </header>

      <nav aria-label="Recursos da Sala do Avaliador">
        <ul className="flex list-none flex-wrap gap-x-6 gap-y-2 p-0">
          {/*
            Enquanto o pacote não estiver publicado e declarado, o item não
            existe — nem como link, nem como aviso. Oferecer o download de um
            objeto que responde 404 é o oposto do que a Sala do Avaliador
            existe para fazer (doc 01 §0.2). Os oito anexos individuais são
            independentes disto e continuam listados abaixo.
          */}
          {zip ? (
            <li>
              <a
                href={zip}
                className="underline"
                style={{ color: "var(--color-link)" }}
              >
                Baixar tudo (.zip)
              </a>
            </li>
          ) : null}
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
              Versão imprimível
            </Link>
          </li>
        </ul>
      </nav>

      <TabelaAnexos anexos={anexos} />
    </div>
  );
}
