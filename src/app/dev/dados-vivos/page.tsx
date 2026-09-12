import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CentralAcessibilidade } from "../../../componentes/prototipo/CentralAcessibilidade";
import { DadosVivos } from "../../../componentes/prototipo/dadosvivos/DadosVivos";
import { CSS_DOS_DADOS_VIVOS } from "../../../componentes/prototipo/dadosvivos/estilos";
import { CSS_DA_LINGUAGEM } from "../../../componentes/prototipo/linguagem/estilos";
import { RevelacaoVisual } from "../../../componentes/prototipo/linguagem/RevelacaoVisual";

export const metadata: Metadata = {
  title: "Laboratório — Dados vivos",
  robots: { index: false, follow: false },
};

/** Rota de laboratório: em produção, interrompe o render com o 404 nativo. */
export function exigirDesenvolvimentoDosDadosVivos(
  ambiente: string | undefined,
  interromper: () => never = notFound,
): void {
  if (ambiente === "production") interromper();
}

export default function LaboratorioDosDadosVivos() {
  exigirDesenvolvimentoDosDadosVivos(process.env.NODE_ENV);

  return (
    <div className="dados-vivos" id="laboratorio-dados-vivos">
      {/*
        Dois blocos: a gramática da H3.5.1 tal como ela existe, e a camada da
        H4.5. Importar o primeiro em vez de reimplementá-lo é o que mantém uma
        definição só para as quatro famílias de grafismo — mudar a passagem num
        lugar muda nos dois laboratórios. Regras que não encontram elemento
        nesta rota simplesmente não se aplicam.
      */}
      <style>{CSS_DA_LINGUAGEM}</style>
      <style>{CSS_DOS_DADOS_VIVOS}</style>

      <div className="lv-abertura">
        <p className="meta-ficha">H4.5 · laboratório de dados · somente DEV</p>
        <h1>Dados vivos</h1>
        <p>
          Os oito indicadores auditados na H4.0, sem um número alterado, dentro
          do sistema gráfico consolidado na H3.5.1. O que muda é composição.
        </p>
        <div className="lv-controles">
          <p className="lv-recomendado">
            Autoridade factual: H4.0. Autoridade visual: H3.5.1.
            <br />A composição original continua intacta em{" "}
            <a className="lv-link" href="/dev/dados">
              /dev/dados <span aria-hidden="true">↗</span>
            </a>
          </p>
          <CentralAcessibilidade />
        </div>
      </div>

      <DadosVivos />
      <RevelacaoVisual escopo="" raiz="laboratorio-dados-vivos" />
    </div>
  );
}
