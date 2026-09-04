import type { MunicipioDoMapa } from "../../dados/territorio/mapa";
import type { RelacaoTerritorial } from "../../dados/territorio/tipos";
import { ROTULO_DA_RELACAO } from "./rotulos";

/**
 * Identificação e nomes acessíveis do mapa — Tarefa 10B.3.3.
 *
 * Vive num módulo próprio porque o polígono no SVG e a entrada na lista
 * territorial precisam usar **o mesmo** id e o **mesmo** nome acessível. Se
 * cada um montasse o seu, o link do mapa deixaria de encontrar a ficha na
 * primeira vez que alguém mudasse um dos dois lados.
 */

/** Id da entrada de um município na lista territorial. */
export function idDaFicha(codigoIbge: string): string {
  return `ficha-${codigoIbge}`;
}

/** Rótulos das relações, na ordem em que o modelo as declara. */
export function rotulosDasRelacoes(
  relacoes: readonly RelacaoTerritorial[],
): readonly string[] {
  return relacoes.map((relacao) => ROTULO_DA_RELACAO[relacao]);
}

/**
 * Nome acessível de um município.
 *
 * Município sem vínculo declarado é dito como tal, e não deixado sem
 * qualificação: "sem vínculo declarado com a pesquisa" é informação, e é o que
 * o modelo de camadas decidiu (Consolidação 10B.2.1 §2).
 */
export function nomeAcessivelDoMunicipio(municipio: MunicipioDoMapa): string {
  const rotulos = rotulosDasRelacoes(municipio.relacoesTerritoriais);
  if (rotulos.length === 0) {
    return `${municipio.nome} — sem vínculo declarado com a pesquisa`;
  }
  return `${municipio.nome} — ${rotulos.join(", ")}`;
}
