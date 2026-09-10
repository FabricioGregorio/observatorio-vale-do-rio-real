import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CabecalhoPrototipo } from "../../../componentes/prototipo/CabecalhoPrototipo";
import { PesquisaEmCampoPrototipo } from "../../../componentes/prototipo/pesquisa/PesquisaEmCampoPrototipo";

export const metadata: Metadata = {
  title: "Protótipo — Pesquisa em Campo",
  robots: { index: false, follow: false },
};

type InterromperCom404 = () => never;

/** Rota de laboratório: em produção, interrompe o render com o 404 nativo. */
export function exigirAmbienteDeDesenvolvimentoDaPesquisa(
  ambiente: string | undefined,
  interromper: InterromperCom404 = notFound,
): void {
  if (ambiente === "production") interromper();
}

export default function PrototipoDaPesquisa() {
  exigirAmbienteDeDesenvolvimentoDaPesquisa(process.env.NODE_ENV);

  return (
    <div className="flex flex-col">
      <style>{`
        body > header, body > footer { display: none; }
        .pesquisa-lab__abertura {
          background: var(--color-fundo-inverso);
          color: var(--color-texto-inverso);
          padding-block: clamp(8rem, 16vw, 13rem) clamp(4rem, 9vw, 7rem);
        }
        .pesquisa-lab__abertura .meta-ficha { color: var(--hero-metadado); }
        .pesquisa-lab__abertura h1 { font-size: clamp(var(--text-3xl), 6vw, var(--text-5xl)); max-width: 15ch; }
        .pesquisa-lab__abertura p:last-child { max-width: 58ch; }
        .pesquisa-lab__separador { border-block: 1px solid var(--color-borda); padding-block: clamp(3rem, 6vw, 5rem); }
      `}</style>
      <CabecalhoPrototipo />

      <div>
        <header className="pesquisa-lab__abertura">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4">
            <p className="meta-ficha">H3 · laboratório visual · somente DEV</p>
            <h1>Pesquisa em Campo — duas densidades editoriais</h1>
            <p>
              O mesmo conjunto de três fotografias seguras em dois tratamentos.
              A página compara composição; não publica copy nem altera a Home.
            </p>
          </div>
        </header>

        <div className="mx-auto w-full max-w-6xl px-4">
          <PesquisaEmCampoPrototipo composicao="documental-aberto" />
        </div>

        <div className="pesquisa-lab__separador">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4">
            <p className="meta-ficha">Comparação A/B</p>
            <p>
              A próxima composição mantém conteúdo, fotografias e hierarquia;
              muda apenas a densidade da camada documental.
            </p>
          </div>
        </div>

        <div className="mx-auto w-full max-w-6xl px-4">
          <PesquisaEmCampoPrototipo composicao="caderno-tecnico" />
        </div>
      </div>
    </div>
  );
}
