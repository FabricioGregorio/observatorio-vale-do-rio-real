import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CentralAcessibilidade } from "../../../componentes/prototipo/CentralAcessibilidade";
import { DadosVivos } from "../../../componentes/prototipo/dadosvivos/DadosVivos";
import { CSS_DOS_DADOS_VIVOS } from "../../../componentes/prototipo/dadosvivos/estilos";
import { FaixaDeRegistros } from "../../../componentes/prototipo/dadosvivos/FaixaDeRegistros";
import { RankingEditorial } from "../../../componentes/prototipo/dadosvivos/RankingEditorial";
import { REGISTROS_RESERVADOS } from "../../../componentes/prototipo/dadosvivos/selecaoEditorial";
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
          H4.5.2 · laboratório de dados · somente DEV
        </p>
        <h1>Dados vivos</h1>
        <p>
          Os oito indicadores auditados na H4.0, sem um número alterado, dentro
          do sistema gráfico consolidado na H3.5.1. O que muda é composição.
        </p>
        <div className="lv-controles">
          <CentralAcessibilidade />
          <p className="lv-recomendado">
            A seleção de quatro indicadores de apoio é{" "}
            <strong>decisão editorial fechada</strong> na H4.5.2. Os três que
            saíram continuam auditados e publicáveis, e aparecem abaixo, no
            material reservado. Nenhum indicador foi invalidado.
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
        O que saiu da composição candidata continua aqui, inteiro e sem
        alteração: os três indicadores de operação e o ranking de atividades.
        Home interpreta e convida; página de dados aprofunda e consulta. Nada
        foi apagado, e é esta seção que prova isso.
      */}
      <section aria-labelledby="reservado" className="dv-laboratorio">
        <h2 id="reservado">Material reservado para a página de Dados</h2>
        <p>
          Nada aqui foi invalidado, rebaixado ou removido do dataset. São os
          mesmos valores auditados na H4.0, fora da leitura resumida da Home por
          decisão de hierarquia editorial, e não por problema de dado.
        </p>

        <div className="dv-reservados">
          <h3>Indicadores de operação</h3>
          <p>
            Respondem como os equipamentos funcionaram, e não para onde o
            recurso foi. São os primeiros de que uma página de consulta precisa,
            e os últimos de que a Home precisa.
          </p>
          <FaixaDeRegistros
            registros={REGISTROS_RESERVADOS.map((indicador) => ({
              indicador,
              rotulo: indicador.titulo,
            }))}
            variante="reservados"
          />
        </div>

        <div className="dv-reservados">
          <h3>Atividades acionadas</h3>
          <p>
            O recorte por limiar de dias continua valendo aqui, e o ranking
            completo com as dezesseis atividades continua reservado para a
            futura página de dados.
          </p>
          <RankingEditorial />
        </div>
      </section>

      <RevelacaoVisual escopo="" raiz="laboratorio-dados-vivos" />
    </div>
  );
}
