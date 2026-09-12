import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CentralAcessibilidade } from "../../../componentes/prototipo/CentralAcessibilidade";
import { DadosVivos } from "../../../componentes/prototipo/dadosvivos/DadosVivos";
import { CSS_DOS_DADOS_VIVOS } from "../../../componentes/prototipo/dadosvivos/estilos";
import { RankingEditorial } from "../../../componentes/prototipo/dadosvivos/RankingEditorial";
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

      {/*
        Cabeçalho, controles e ressalvas vivem aqui, **antes** da área
        candidata. A H4.5.1 tirou de dentro da composição tudo que fosse
        vocabulário de laboratório: quem olhar a pré-visualização vê o que
        poderia ir para a Home, e não um protótipo se explicando.
      */}
      <div className="lv-abertura">
        <p className="meta-ficha">
          H4.5.1 · laboratório de dados · somente DEV
        </p>
        <h1>Dados vivos</h1>
        <p>
          Os oito indicadores auditados na H4.0, sem um número alterado, dentro
          do sistema gráfico consolidado na H3.5.1. O que muda é composição.
        </p>
        <div className="lv-controles">
          <fieldset>
            <legend className="meta-ficha">Indicadores de apoio</legend>
            <label>
              <input
                defaultChecked
                name="variante"
                type="radio"
                value="completa"
              />{" "}
              Completa — sete
            </label>
            <label>
              <input name="variante" type="radio" value="reduzida" /> Reduzida —
              quatro
            </label>
          </fieldset>
          <CentralAcessibilidade />
          <p className="lv-recomendado">
            A versão reduzida é <strong>ensaio de composição</strong>, e não
            escolha editorial. Ela mostra os quatro primeiros indicadores do
            dataset, em ordem de arquivo, só para medir quanta faixa a Home
            aguenta. Nenhum indicador foi eleito, descartado ou hierarquizado:
            essa decisão continua humana e segue aberta.
            <br />
            Autoridade factual: H4.0. Autoridade visual: H3.5.1. A composição
            original continua intacta em{" "}
            <a className="lv-link" href="/dev/dados">
              /dev/dados <span aria-hidden="true">↗</span>
            </a>
          </p>
        </div>
      </div>

      <p className="dv-preview__marca">Início da composição candidata à Home</p>
      <div className="dv-preview">
        <DadosVivos />
      </div>
      <p className="dv-preview__marca">Fim da composição candidata à Home</p>

      {/*
        O ranking saiu da composição candidata e continua aqui, inteiro e sem
        alteração. Home interpreta e convida; página de dados aprofunda e
        consulta. Dezesseis linhas de atividade com barra são consulta, e é por
        isso que elas ficam deste lado da marca.
      */}
      <section aria-labelledby="reservado" className="dv-laboratorio">
        <h2 id="reservado">Material reservado para a página de Dados</h2>
        <p>
          O ranking de atividades continua existindo, com o mesmo recorte e o
          mesmo limiar declarado da H4.5. Ele saiu da composição candidata à
          Home por decisão de composição, e não por problema de dado. O ranking
          completo, com as dezesseis atividades, continua reservado para a
          futura página de dados.
        </p>
        <RankingEditorial />
      </section>

      <RevelacaoVisual escopo="" raiz="laboratorio-dados-vivos" />
    </div>
  );
}
