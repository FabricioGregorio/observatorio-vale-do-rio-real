import type { MunicipioDoMapa } from "../../dados/territorio/mapa";
import type { RelacaoTerritorial } from "../../dados/territorio/tipos";

/**
 * Recortes exploráveis do mapa da Home.
 *
 * A Home não transforma os 75 municípios de Sergipe em opções: o estado inteiro
 * é **contexto**, e o que se explora são os recortes que o Observatório
 * declarou. São dois, e a distinção entre eles é editorial antes de ser
 * visual — São Cristóvão foi pesquisado como referência de comparação e não
 * pertence ao Vale, o que precisa continuar inequívoco nos dois estados.
 *
 * O que o desenho distingue — Sergipe, Vale, pesquisa e comparação — não
 * depende de seleção nenhuma: são camadas, desenhadas sempre. Selecionar um
 * recorte acrescenta ênfase e abre a leitura em texto; não é o que revela a
 * informação.
 */

export const RECORTES = ["vale", "comparacao"] as const;
export type Recorte = (typeof RECORTES)[number];

export type DefinicaoDeRecorte = {
  readonly chave: Recorte;
  /** Nome acessível da opção no mapa. */
  readonly rotulo: string;
  /** Título do painel contextual. */
  readonly titulo: string;
  /** Uma frase; nenhuma copy nova de campanha. */
  readonly resumo: string;
  readonly relacao: RelacaoTerritorial;
};

export const DEFINICOES: readonly DefinicaoDeRecorte[] = [
  {
    chave: "vale",
    relacao: "vale-rio-real",
    rotulo: "Recorte do Vale do Rio Real",
    titulo: "Recorte do Vale do Rio Real",
    resumo:
      "Os municípios que o Observatório reúne sob o recorte do Vale. Não é divisão administrativa oficial.",
  },
  {
    chave: "comparacao",
    relacao: "comparacao",
    rotulo: "Referência de comparação, fora do Vale",
    titulo: "Referência de comparação",
    resumo:
      "Pesquisado como comparação de políticas públicas, não como parte do Vale.",
  },
];

/** Municípios de um recorte, na ordem em que a malha os entrega. */
export function municipiosDoRecorte(
  municipios: readonly MunicipioDoMapa[],
  recorte: DefinicaoDeRecorte,
): readonly MunicipioDoMapa[] {
  return municipios.filter((municipio) =>
    municipio.relacoesTerritoriais.includes(recorte.relacao),
  );
}

/**
 * A qual recorte explorável um município pertence.
 *
 * `comparacao` vem primeiro de propósito: São Cristóvão tem também
 * `pesquisa-campo`, e em nenhuma hipótese ele pode cair no recorte do Vale.
 */
export function recorteDoMunicipio(
  relacoes: readonly RelacaoTerritorial[],
): Recorte | undefined {
  if (relacoes.includes("comparacao")) return "comparacao";
  if (relacoes.includes("vale-rio-real")) return "vale";
  return undefined;
}
