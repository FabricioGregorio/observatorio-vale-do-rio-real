import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CentralAcessibilidade } from "../../../componentes/prototipo/CentralAcessibilidade";
import { CSS_DA_LINGUAGEM } from "../../../componentes/prototipo/linguagem/estilos";
import { PresetVisual } from "../../../componentes/prototipo/linguagem/PresetVisual";
import { RevelacaoVisual } from "../../../componentes/prototipo/linguagem/RevelacaoVisual";
import { montarDadosDoMapa } from "../../../dados/territorio/mapa";

export const metadata: Metadata = {
  title: "Laboratório — Sistema gráfico vivo",
  robots: { index: false, follow: false },
};

export function exigirDesenvolvimentoVisual(
  ambiente: string | undefined,
  interromper: () => never = notFound,
): void {
  if (ambiente === "production") interromper();
}

export default function LaboratorioVisual() {
  exigirDesenvolvimentoVisual(process.env.NODE_ENV);
  const dados = montarDadosDoMapa();
  return (
    <div className="linguagem-visual" id="linguagem-visual">
      <style>{CSS_DA_LINGUAGEM}</style>
      <div className="lv-abertura">
        <p className="meta-ficha">
          H3.5 · laboratório de linguagem · somente DEV
        </p>
        <h1>Sistema gráfico vivo</h1>
        <p>
          Território, registro e leitura. Duas intensidades para o mesmo
          conteúdo.
        </p>
        <div className="lv-controles">
          <fieldset>
            <legend className="meta-ficha">Comparar tratamentos</legend>
            <label>
              <input defaultChecked name="preset" type="radio" value="A" /> A —
              Contido
            </label>
            <label>
              <input name="preset" type="radio" value="B" /> B — Vivo
            </label>
          </fieldset>
          <CentralAcessibilidade />
        </div>
      </div>
      <PresetVisual dados={dados} preset="A" />
      <PresetVisual dados={dados} preset="B" />
      <RevelacaoVisual />
    </div>
  );
}
