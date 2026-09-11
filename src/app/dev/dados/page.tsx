import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CabecalhoPrototipo } from "../../../componentes/prototipo/CabecalhoPrototipo";
import { PainelDeDados } from "../../../componentes/prototipo/dados/PainelDeDados";

export const metadata: Metadata = {
  title: "Protótipo — Dados e indicadores",
  robots: { index: false, follow: false },
};

type InterromperCom404 = () => never;

/** Rota de laboratório: em produção, interrompe o render com o 404 nativo. */
export function exigirAmbienteDeDesenvolvimentoDosDados(
  ambiente: string | undefined,
  interromper: InterromperCom404 = notFound,
): void {
  if (ambiente === "production") interromper();
}

export default function PrototipoDosDados() {
  exigirAmbienteDeDesenvolvimentoDosDados(process.env.NODE_ENV);

  return (
    <div className="flex flex-col">
      <style>{`
        body > header, body > footer { display: none; }
        .dados-lab__abertura {
          background: var(--color-fundo-inverso);
          color: var(--color-texto-inverso);
          padding-block: clamp(8rem, 16vw, 13rem) clamp(4rem, 9vw, 7rem);
        }
        .dados-lab__abertura .meta-ficha { color: var(--hero-metadado); }
        .dados-lab__abertura h1 { font-size: clamp(var(--text-3xl), 6vw, var(--text-5xl)); max-width: 17ch; }
        .dados-lab__abertura p:last-child { max-width: 58ch; }
        .dados-lab__separador { border-block: 1px solid var(--color-borda); padding-block: clamp(3rem, 6vw, 5rem); }
      `}</style>
      <CabecalhoPrototipo />

      <div>
        <header className="dados-lab__abertura">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4">
            <p className="meta-ficha">H4 · laboratório visual · somente DEV</p>
            <h1>Dados e indicadores — duas hierarquias</h1>
            <p>
              O mesmo conjunto de oito indicadores auditados em dois
              tratamentos. A página compara composição; não publica indicador
              pendente, não integra a Home e não aprova copy.
            </p>
          </div>
        </header>

        <div className="mx-auto w-full max-w-6xl px-4">
          <PainelDeDados composicao="declaracao" />
        </div>

        <div className="dados-lab__separador">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4">
            <p className="meta-ficha">Comparação A/B</p>
            <p>
              A próxima composição usa os mesmos valores brutos, a mesma base, o
              mesmo recorte e a mesma precisão. Muda a hierarquia e a densidade.
            </p>
          </div>
        </div>

        <div className="mx-auto w-full max-w-6xl px-4">
          <PainelDeDados composicao="painel" />
        </div>
      </div>
    </div>
  );
}
