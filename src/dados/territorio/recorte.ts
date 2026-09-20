import type { RelacaoTerritorial } from "./tipos";

/**
 * Recorte territorial do projeto — Tarefas 10B.2.1 e 10B.2.2.
 *
 * Camada **editorial** sobre a camada base. A base são os 75 municípios de
 * Sergipe, que vêm da malha oficial do IBGE; este arquivo diz apenas quais
 * deles têm vínculo com o trabalho do Observatório, e qual vínculo.
 *
 * As definições vieram do responsável pelo projeto em 2026-09-03. Nada aqui
 * foi deduzido de mapa, de nome de rio ou de proximidade geográfica.
 *
 * Município que não está nesta lista aparece no mapa como município de
 * Sergipe, sem vínculo declarado. Isso é informação, não lacuna.
 */

/**
 * Delimitação metodológica do recorte — **nota interna, não renderizável**.
 *
 * O Vale do Rio Real é uma região socioeconômica associada ao curso superior e
 * médio do rio Real, e não uma divisão administrativa oficial. O projeto não
 * cria divisão geográfica nova: destaca os municípios do recorte que utiliza.
 * Isso continua verdadeiro e continua sendo o que sustenta esta camada.
 *
 * O que mudou é onde a frase pode aparecer. A equipe recusou definir o Vale
 * por negação administrativa em texto público: o território é apresentado como
 * vivido e pesquisado, e a precisão metodológica, quando precisa existir, é
 * secundária. A recusa já estava travada para a seção III da Home
 * (`testes/territorio-editorial.test.ts`) e não alcançava `/territorio` nem
 * `/observatorio`, que serviam esta string literalmente.
 *
 * Para texto público use `RESUMO_PUBLICO_DO_VALE`. Um teste confere que
 * nenhuma superfície pública volta a renderizar esta constante.
 */
export const DEFINICAO_VALE_DO_RIO_REAL =
  "Região socioeconômica associada ao curso superior e médio do rio Real. Não é divisão administrativa oficial.";

/**
 * O Vale como território vivido, na linha editorial aprovada para a seção III
 * da Home e sustentada pelas transcrições revisadas do PodObservar.
 *
 * Diz o que liga as cidades — o rio, as rotas que as atravessaram, o que
 * circula entre elas —, sem definir o recorte por aquilo que ele não é. É a
 * única frase de abertura do Vale que pode ser servida ao público.
 */
export const RESUMO_PUBLICO_DO_VALE =
  "Um território de travessia: cidades de Sergipe e da Bahia ligadas pelo rio, pelas rotas antigas que as atravessaram e pelo que circula entre elas hoje.";

export type MunicipioDoRecorte = {
  /**
   * Código do IBGE. É **identificador técnico**: serve para casar o município
   * com o feature certo da malha, onde ele aparece em `properties.codarea`.
   * Não é indicador, não é métrica e não mede nada.
   */
  readonly codigoIbge: string;
  readonly nome: string;
  readonly relacoesTerritoriais: readonly RelacaoTerritorial[];
  /**
   * Evidência documental que sustenta a relação `pesquisa-campo`.
   *
   * Existe porque, num site de prestação de contas, afirmar que um município
   * foi pesquisado é afirmação verificável: ou há entrevista e visita por
   * trás, ou não há. Vazio quando o município não tem essa relação — e um
   * teste garante que as duas coisas andam juntas, para que ninguém acrescente
   * a relação sem acrescentar a evidência.
   *
   * O texto é o fornecido pelo responsável em 2026-09-03. As entrevistas ainda
   * não existem como entidade publicada: isso é da Fase 3. Quando existirem,
   * estas linhas viram referências a elas.
   */
  readonly evidenciasDePesquisa: readonly string[];
};

/**
 * Municípios com vínculo declarado.
 *
 * Códigos conferidos em 2026-09-03 contra
 * `servicodados.ibge.gov.br/api/v1/localidades/estados/SE/municipios`, que
 * devolve os 75 municípios de Sergipe. Nenhum foi escrito de memória.
 *
 * São Cristóvão acumula `pesquisa-campo` e `comparacao`, e **não**
 * `vale-rio-real`: foi pesquisado, e entra como referência de comparação de
 * políticas públicas. Tratá-lo como parte do Vale seria afirmação territorial
 * falsa — é exatamente o caso que motivou trocar o booleano por camadas.
 *
 * Itabaianinha, Cristinápolis e Poço Verde pertencem ao recorte e **não**
 * carregam `pesquisa-campo`: não há evidência documental de pesquisa de campo
 * neles entre as fornecidas. Ausência de evidência é registrada como ausência,
 * não preenchida por simetria com os vizinhos.
 */
export const RECORTE_TERRITORIAL: readonly MunicipioDoRecorte[] = [
  {
    codigoIbge: "2807402",
    nome: "Tobias Barreto",
    relacoesTerritoriais: ["vale-rio-real", "pesquisa-campo"],
    evidenciasDePesquisa: [
      "Entrevista — Secretaria de Cultura",
      "Entrevista — Prefeitura",
      "Centro Cultural e Museu Borda da Mata",
      "Recanto da Serra",
    ],
  },
  {
    codigoIbge: "2807501",
    nome: "Tomar do Geru",
    relacoesTerritoriais: ["vale-rio-real", "pesquisa-campo"],
    evidenciasDePesquisa: ["Entrevista — Secretaria Municipal de Cultura"],
  },
  {
    codigoIbge: "2803005",
    nome: "Itabaianinha",
    relacoesTerritoriais: ["vale-rio-real"],
    evidenciasDePesquisa: [],
  },
  {
    codigoIbge: "2801702",
    nome: "Cristinápolis",
    relacoesTerritoriais: ["vale-rio-real"],
    evidenciasDePesquisa: [],
  },
  {
    codigoIbge: "2805505",
    nome: "Poço Verde",
    relacoesTerritoriais: ["vale-rio-real"],
    evidenciasDePesquisa: [],
  },
  {
    codigoIbge: "2806701",
    nome: "São Cristóvão",
    relacoesTerritoriais: ["pesquisa-campo", "comparacao"],
    evidenciasDePesquisa: ["Entrevistas — Fundação de Cultura e Turismo"],
  },
];
