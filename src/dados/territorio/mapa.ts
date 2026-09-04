import {
  calcularEnvelope,
  caminhoDaGeometria,
  criarProjecao,
  type Projecao,
  posicaoNoSvg,
} from "./projecao";
import { RECORTE_TERRITORIAL } from "./recorte";
import type {
  GeometriaGeoJson,
  PontoDeVisita,
  RelacaoTerritorial,
} from "./tipos";
import { carregarMalhaMunicipal, carregarNomesDeMunicipios } from "./validacao";

/**
 * Montagem dos dados do mapa — Tarefa 10B.3.3.
 *
 * Junta as três fontes, cada uma no seu papel:
 *
 * - **geometria** vem da malha oficial do IBGE, casada por `properties.codarea`;
 * - **nome** vem da API de localidades do IBGE, casada pelo mesmo código;
 * - **relações e evidências** vêm de `recorte.ts`, que é a camada editorial
 *   definida pelo responsável.
 *
 * Nenhum nome de município e nenhum código é escrito aqui: este arquivo só
 * cruza. É o que evita a duplicação que a instrução da tarefa proíbe — existe um
 * lugar só para cada fato.
 *
 * Roda em **tempo de build**: lê arquivos do disco, então não pode ser
 * importado por Client Component.
 */

/** Largura do `viewBox`. A altura sai da projeção, não é arbitrada. */
export const LARGURA_DO_MAPA = 1000;

/** Um município pronto para desenhar. */
export type MunicipioDoMapa = {
  readonly codigoIbge: string;
  readonly nome: string;
  readonly relacoesTerritoriais: readonly RelacaoTerritorial[];
  readonly evidenciasDePesquisa: readonly string[];
  /** Atributo `d` do `<path>`, já projetado. */
  readonly caminho: string;
};

/** Um ponto de visita que pode ser desenhado, porque tem coordenada. */
export type PontoNoMapa = {
  readonly ponto: PontoDeVisita;
  readonly x: number;
  readonly y: number;
};

export type DadosDoMapa = {
  readonly projecao: Projecao;
  readonly municipios: readonly MunicipioDoMapa[];
  /** Pontos com coordenada conferida. Hoje vazio. */
  readonly pontosPosicionados: readonly PontoNoMapa[];
  /** Pontos sem coordenada: aparecem na lista, não no desenho. */
  readonly pontosSemPosicao: readonly PontoDeVisita[];
};

/**
 * Monta os dados do mapa.
 *
 * `pontos` entra por parâmetro, e não por importação direta, para que o teste
 * possa exercitar ponto com e sem coordenada sem depender do estado atual do
 * projeto — hoje nenhum dos quatro tem coordenada aprovada.
 */
export function montarDadosDoMapa(
  pontos: readonly PontoDeVisita[] = [],
): DadosDoMapa {
  const malha = carregarMalhaMunicipal();
  const nomes = carregarNomesDeMunicipios();

  const geometrias: GeometriaGeoJson[] = malha.features.map(
    (feature) => feature.geometry,
  );
  const projecao = criarProjecao(calcularEnvelope(geometrias), LARGURA_DO_MAPA);

  const porCodigo = new Map(
    RECORTE_TERRITORIAL.map((item) => [item.codigoIbge, item]),
  );

  const municipios = malha.features.map((feature): MunicipioDoMapa => {
    const codigoIbge = feature.properties.codarea;
    const nome = nomes.get(codigoIbge);
    if (nome === undefined) {
      // Falha alta de propósito: município sem nome não tem nome acessível, e
      // desenhar um polígono anônimo seria pior que não desenhar.
      throw new Error(`Município sem nome na lista do IBGE: ${codigoIbge}.`);
    }

    const doRecorte = porCodigo.get(codigoIbge);
    return {
      codigoIbge,
      nome,
      relacoesTerritoriais: doRecorte?.relacoesTerritoriais ?? [],
      evidenciasDePesquisa: doRecorte?.evidenciasDePesquisa ?? [],
      caminho: caminhoDaGeometria(feature.geometry, projecao),
    };
  });

  /*
    Ordem alfabética, e não a ordem em que a malha veio.

    A navegação por setas do mapa e a lista textual precisam percorrer os
    municípios na mesma sequência, e essa sequência precisa ser previsível para
    quem usa teclado: "próximo" tem de significar algo. Ordem de código do IBGE
    não significa nada para quem lê.

    A ordem de desenho muda junto, o que é irrelevante visualmente: os
    polígonos não se sobrepõem, só compartilham fronteira.
  */
  municipios.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

  const codigosConhecidos = new Set(municipios.map((m) => m.codigoIbge));
  for (const item of RECORTE_TERRITORIAL) {
    if (!codigosConhecidos.has(item.codigoIbge)) {
      throw new Error(
        `Município do recorte ausente da malha: ${item.nome} (${item.codigoIbge}).`,
      );
    }
  }

  const pontosPosicionados: PontoNoMapa[] = [];
  const pontosSemPosicao: PontoDeVisita[] = [];
  for (const ponto of pontos) {
    if (ponto.coordenadas === null) {
      pontosSemPosicao.push(ponto);
      continue;
    }
    const [x, y] = posicaoNoSvg(ponto.coordenadas, projecao);
    pontosPosicionados.push({ ponto, x, y });
  }

  return { projecao, municipios, pontosPosicionados, pontosSemPosicao };
}
