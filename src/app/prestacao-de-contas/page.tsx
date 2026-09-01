import type { Metadata } from "next";
import Link from "next/link";

import { TabelaAnexos } from "../../componentes/acervo/TabelaAnexos";
import { listarAnexosPublicos } from "../../dados/consultas/anexos";
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

export const metadata: Metadata = {
  title: "Prestação de Contas — Sala do Avaliador",
  description:
    "Todos os anexos da prestação de contas, com link permanente, data e hash SHA-256.",
};

export default async function SalaDoAvaliador() {
  const anexos = await listarAnexosPublicos();
  const zip = urlDoZipDeAnexos();

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
          <li>
            {zip ? (
              <a href={zip} style={{ color: "var(--color-link)" }}>
                Baixar tudo (.zip)
              </a>
            ) : (
              <span className="meta-ficha">
                Pacote .zip ainda não publicado
              </span>
            )}
          </li>
          <li>
            <a href="/anexos.json" style={{ color: "var(--color-link)" }}>
              /anexos.json — versão legível por máquina
            </a>
          </li>
          <li>
            <Link href="/prestacao-de-contas/imprimir">Versão imprimível</Link>
          </li>
        </ul>
      </nav>

      <TabelaAnexos anexos={anexos} />
    </div>
  );
}
