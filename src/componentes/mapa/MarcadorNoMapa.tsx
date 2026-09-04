import type { PontoNoMapa } from "../../dados/territorio/mapa";

/**
 * Marcador de um ponto de visita no mapa — Tarefa 10B.3.3.
 *
 * Só é renderizado para ponto com **coordenada conferida**. Hoje nenhum dos
 * quatro pontos tem, então nenhum marcador aparece: quem decide onde o
 * marcador cai é a fonte, não uma estimativa sobre o mapa. Marcador no lugar
 * errado, num site de prestação de contas, é afirmação falsa sobre onde a
 * pesquisa esteve.
 *
 * O raio é fixo em unidades do `viewBox`, então acompanha a escala do mapa.
 */
export function MarcadorNoMapa({ posicionado }: { posicionado: PontoNoMapa }) {
  return (
    <g>
      <title>{posicionado.ponto.nome}</title>
      <circle className="p" cx={posicionado.x} cy={posicionado.y} r={6} />
    </g>
  );
}
