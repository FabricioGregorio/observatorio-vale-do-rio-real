import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CabecalhoPrototipo } from "../../../componentes/prototipo/CabecalhoPrototipo";
import { TerritorioPrototipo } from "../../../componentes/prototipo/territorio/TerritorioPrototipo";
import { montarDadosDoMapa } from "../../../dados/territorio/mapa";
import { PONTOS_DE_VISITA_PREVISTOS } from "../../../dados/territorio/pontos";

export const metadata: Metadata = {
  title: "Protótipo — Território",
  robots: { index: false, follow: false },
};

type InterromperCom404 = () => never;

/** Rota de laboratório: em produção, interrompe o render com o 404 nativo. */
export function exigirAmbienteDeDesenvolvimentoDoTerritorio(
  ambiente: string | undefined,
  interromper: InterromperCom404 = notFound,
): void {
  if (ambiente === "production") interromper();
}

export default function PrototipoDoTerritorio() {
  exigirAmbienteDeDesenvolvimentoDoTerritorio(process.env.NODE_ENV);

  const dados = montarDadosDoMapa(PONTOS_DE_VISITA_PREVISTOS);

  return (
    <div className="flex flex-col">
      <style>{`body > header, body > footer { display: none; }`}</style>
      <CabecalhoPrototipo />

      <div className="mx-auto flex w-full max-w-6xl flex-col px-4">
        <header className="flex max-w-3xl flex-col gap-3 py-12">
          <p className="meta-ficha">H2 · laboratório visual · somente DEV</p>
          <h1 className="text-3xl">Território — comparação de profundidade</h1>
          <p>
            A mesma cartografia, os mesmos dados e a mesma interação em dois
            tratamentos de volume. Esta página não altera a Home pública.
          </p>
        </header>

        <TerritorioPrototipo dados={dados} profundidade="minima" />
        <TerritorioPrototipo dados={dados} profundidade="moderada" />
      </div>
    </div>
  );
}
