import type { Metadata } from "next";

import { TabelaAnexos } from "../../../componentes/acervo/TabelaAnexos";
import { listarAnexosPublicos } from "../../../dados/consultas/anexos";

/**
 * Versão imprimível da Sala do Avaliador (doc 01 §4).
 *
 * Mesma tabela, mesma consulta — sem navegação e sem elemento que não faça
 * sentido no papel. A folha de estilo de impressão esconde cabeçalho e rodapé
 * do site e imprime os links de forma legível.
 */

export const metadata: Metadata = {
  title: "Prestação de Contas — versão imprimível",
  robots: { index: false, follow: true },
};

export default async function VersaoImprimivel() {
  const anexos = await listarAnexosPublicos();
  const hoje = new Date().toISOString().split("T")[0];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      {/*
        Impressão: o cabeçalho e o rodapé do site saem da folha, o fundo fica
        branco e as URLs dos links aparecem por extenso — no papel, um link sem
        endereço visível é um link perdido.
      */}
      <style>{`
        @media print {
          body > header,
          body > footer,
          .pular-conteudo {
            display: none !important;
          }
          body {
            background: #fff;
          }
          a[href^="http"]::after {
            content: " (" attr(href) ")";
            font-size: 0.8em;
            word-break: break-all;
          }
          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
          }
          details {
            display: none;
          }
        }
      `}</style>

      <header className="flex flex-col gap-2">
        <h1>Prestação de Contas — anexos</h1>
        <p className="meta-ficha">
          Observatório do Vale do Rio Real · versão imprimível · gerada em{" "}
          {hoje}
        </p>
      </header>

      <TabelaAnexos anexos={anexos} />
    </div>
  );
}
