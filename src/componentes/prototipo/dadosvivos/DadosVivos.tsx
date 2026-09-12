import Image from "next/image";
import {
  CARCARA_DA_IDENTIDADE,
  PASTA_PUBLICA_DOS_GRAFISMOS,
} from "../../../dados/grafismos/derivados";
import {
  CONTEXTO_DOS_DADOS,
  INDICADORES,
  type IndicadorDerivado,
} from "../../../dados/indicadores/derivados";
import { exibirIndicador } from "../../../dados/indicadores/formato";
import { FaixaDeRegistros } from "./FaixaDeRegistros";
import { SerieViva } from "./SerieViva";
import { REGISTROS_DE_APOIO } from "./selecaoEditorial";

/**
 * Seção Dados no sistema gráfico vivo — H4.5.
 *
 * ## O que esta composição é
 *
 * O encontro entre duas autoridades. A **H4.0 é a autoridade factual**: os oito
 * indicadores, seus valores brutos, bases, períodos, recortes, regras e
 * arredondamentos vêm dela e não foram tocados. A **H3.5.1 é a autoridade
 * visual**: a gramática de grafismos, o guia de densidade, a linha de
 * continuidade, as passagens e a disciplina de movimento vêm dela.
 *
 * Nada aqui é dado novo. Nenhum número foi recalculado, nenhuma base foi
 * reformulada, nenhuma fonte restrita chegou ao HTML. O que muda é composição.
 *
 * ## Por que a H4.0 continua intacta em `/dev/dados`
 *
 * Comparar composição exige ter as duas. A rota original não foi alterada: ela
 * continua sendo o registro do que a H4.0 decidiu, e esta rota é a proposta de
 * como aquilo se parece dentro da linguagem. Os dois leem o mesmo módulo de
 * dados, então divergir de número é impossível por construção.
 *
 * ## O que a H4.5.1 tirou daqui
 *
 * O ranking de atividades saiu desta composição. Ele não foi apagado nem
 * alterado: continua existindo em `RankingEditorial`, e o laboratório o exibe
 * **fora** da área candidata à Home, como material reservado para a futura
 * página de dados. A separação é conceitual antes de ser visual: a Home
 * interpreta e convida, a página de dados aprofunda e consulta. Dezesseis
 * linhas de atividade com barra são consulta.
 *
 * Com isso, o limiar editorial de dez dias — que era o critério do recorte —
 * também deixou de aparecer na composição candidata. Nenhum limiar novo foi
 * inventado para substituí-lo.
 */

function porId(id: string): IndicadorDerivado {
  const achado = INDICADORES.find((indicador) => indicador.id === id);
  if (achado === undefined) throw new Error(`indicador ausente: ${id}`);
  return achado;
}

/**
 * Ficha de contexto da seção.
 *
 * Período, recorte e fonte pública são constantes do dataset: valem para os
 * oito indicadores. Repeti-los em cada registro seria ruído com aparência de
 * rigor, então eles sobem uma vez, aqui, e cada indicador guarda só o que é
 * dele.
 */
function FichaDeContexto() {
  return (
    <dl className="dv-ficha lv-g-documental">
      <div>
        <dt>Período</dt>
        <dd>{CONTEXTO_DOS_DADOS.periodo}</dd>
      </div>
      <div>
        <dt>Recorte</dt>
        <dd>{CONTEXTO_DOS_DADOS.recorte}</dd>
      </div>
      <div>
        <dt>Fonte</dt>
        <dd>{CONTEXTO_DOS_DADOS.fontePublica}</dd>
      </div>
    </dl>
  );
}

/** Ficha do indicador protagonista: o que só ele tem. */
function FichaDoProtagonista({ indicador }: { indicador: IndicadorDerivado }) {
  return (
    <dl className="dv-ficha lv-g-documental">
      {indicador.base === null ? null : (
        <div>
          <dt>Base</dt>
          <dd>{indicador.base}</dd>
        </div>
      )}
      <div>
        <dt>Cálculo</dt>
        <dd>{indicador.regra}</dd>
      </div>
      {indicador.notaMetodologica === null ? null : (
        <div>
          <dt>Limite</dt>
          <dd>{indicador.notaMetodologica}</dd>
        </div>
      )}
    </dl>
  );
}

export function DadosVivos() {
  const prefixo = "dados-vivos";
  const protagonista = porId("H4-001");

  return (
    <article className="dv-artigo" data-preset="H4.5">
      {/*
        Passagem H3 → H4. É a única da página que carrega assinatura de
        identidade, pela regra de frequência da H3.5.1: um carcará em escala
        editorial por página, e só em passagem.

        H4.5.2 — a copy mudou. A anterior dizia que o campo "volta aqui como
        quantidade declarada", e isso sugeria que os números derivam da
        observação de campo. Não derivam: eles saem de registros diários de
        funcionamento e de contratação preenchidos pelos responsáveis dos dois
        equipamentos. A frase nova diz que os registros **também** permitem uma
        leitura quantitativa, que é o que de fato acontece — a fotografia e a
        planilha são dois usos do mesmo trabalho de campo, e não um a
        consequência do outro.
      */}
      <div
        className="lv-g-transicao dv-passagem"
        data-passagem="medida"
        data-testid="passagem-campo-medida"
      >
        <div className="lv-fio lv-g-cartografico" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="lv-ponte">
          <p className="meta-ficha lv-g-documental">Campo → Medida</p>
          <p>
            Os registros da pesquisa também permitem uma leitura quantitativa do
            território
          </p>
        </div>
        <div className="lv-g-identidade dv-assinatura" aria-hidden="true">
          <Image
            alt={CARCARA_DA_IDENTIDADE.alt}
            src={`${PASTA_PUBLICA_DOS_GRAFISMOS}/${CARCARA_DA_IDENTIDADE.arquivo}`}
            width={CARCARA_DA_IDENTIDADE.largura}
            height={CARCARA_DA_IDENTIDADE.altura}
            unoptimized
            loading="lazy"
          />
        </div>
        {/*
          A legenda atravessa a ponte e a assinatura, e o fio que a encima é a
          linha em que a ave se apoia. Sem isso o carcará flutuava no canto
          como adesivo; com isso ele fica dentro da mesma grade que o texto.
        */}
        <p className="lv-origem meta-ficha lv-g-documental dv-assinatura__ficha">
          {CARCARA_DA_IDENTIDADE.legenda}
        </p>
      </div>

      <section
        aria-labelledby={`${prefixo}-titulo`}
        className="dv-secao"
        id={prefixo}
      >
        <div className="dv-abertura lv-revelar">
          <p className="meta-ficha lv-g-documental">03 — Dados</p>
          <p className="meta-ficha dv-proposta lv-g-documental">
            Título editorial · proposta
          </p>
          <h2 id={`${prefixo}-titulo`}>Onde o recurso circula</h2>
          <p className="dv-abertura__texto">
            Os números desta seção vêm do levantamento próprio do Observatório
            em dois equipamentos culturais de Tobias Barreto, entre julho e
            dezembro de 2025. Eles descrevem quanto entrou, quanto saiu e onde a
            despesa foi executada. Não descrevem lucro, impacto nem o que
            aconteceu fora do que foi registrado.
          </p>
          <FichaDeContexto />
        </div>

        <div className="dv-protagonista">
          <div className="dv-protagonista__numero lv-revelar">
            <p className="dv-numero">{exibirIndicador(protagonista)}</p>
            <p className="dv-numero__rotulo">{protagonista.titulo}</p>
            <span aria-hidden="true" className="dv-amarra lv-g-cartografico" />
          </div>

          <div className="dv-protagonista__leitura lv-revelar">
            <p className="meta-ficha lv-g-documental">Leitura do dado</p>
            <h3>O que este número mede, e o que não mede</h3>
            <p>
              O indicador mede a parcela da despesa identificada que foi
              executada dentro do município. Ele não mede lucro, não mede
              impacto e não descreve o que aconteceu fora das despesas com
              localidade identificada.
            </p>
            <FichaDoProtagonista indicador={protagonista} />
          </div>
        </div>

        <div className="dv-bloco">
          <p className="meta-ficha lv-g-documental">
            Demais indicadores do levantamento
          </p>
          <FaixaDeRegistros
            registros={REGISTROS_DE_APOIO}
            variante="candidata"
          />
        </div>

        <div className="dv-bloco">
          <SerieViva prefixo={prefixo} />
        </div>
      </section>

      {/*
        Passagem de saída, sem assinatura: a continuidade entre capítulos é
        feita pelo sistema cartográfico, e o teto de identidade da página já
        foi gasto na entrada.

        A H4.5.1 trocou a copy. A anterior dizia "por trás de cada contratação
        registrada existe alguém", e isso sugeria que as 84 contratações são 84
        pessoas. Não são: o próprio indicador declara que a mesma pessoa pode
        aparecer em dias diferentes, e a contagem de pessoas distintas continua
        PENDENTE na fonte. A frase nova não fala de pessoas — ela explica por
        que o detalhamento não está aqui.

        A cruz de registro saiu junto. Ela marcava um encontro sem carregar
        informação, e a H4.5 já a tinha registrado como o grafismo mais frágil
        da composição. Removida, e não substituída: o fio da família
        cartográfica já faz a ligação, e trocar um ornamento por outro não é
        refino.

        H4.5.2 — a copy foi reescrita de novo, por outro motivo. A anterior
        estava correta mas falava como nota interna de projeto: ela explicava
        uma decisão de composição ao leitor, que não participou dela. A nova
        diz a mesma coisa do ponto de vista de quem lê — esta leitura é um
        recorte, e o detalhamento existe e está preservado em outro lugar.
      */}
      <div
        className="lv-g-transicao dv-passagem"
        data-passagem="saida"
        data-testid="passagem-saida"
      >
        <div className="lv-fio lv-g-cartografico" aria-hidden="true">
          <span />
          <span />
        </div>
        <div className="lv-ponte">
          <p className="meta-ficha lv-g-documental">
            Medida → Conjunto completo
          </p>
          <p>
            Esta leitura apresenta um recorte. O levantamento completo preserva
            o detalhamento das atividades registradas
          </p>
        </div>
      </div>
    </article>
  );
}
