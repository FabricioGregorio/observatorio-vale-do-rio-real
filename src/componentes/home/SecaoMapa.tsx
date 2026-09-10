import { montarDadosDoMapa } from "../../dados/territorio/mapa";
import { PONTOS_DE_VISITA_PREVISTOS } from "../../dados/territorio/pontos";
import { TerritorioCartografico } from "../territorio/TerritorioCartografico";

/**
 * Seção Território na Home — integração H2.1.
 *
 * Server Component. É aqui que o dado é lido e validado, em tempo de build, e
 * entregue ao mapa por props: o `MapaTerritorio` não busca nada, e a Home não
 * sabe como o dado é montado.
 *
 * Reutiliza a composição aprovada do laboratório com o Preset B refinado. A
 * geometria permanece server-side e somente a ilha de interação já existente
 * hidrata mapa, índice e painel.
 */
export function SecaoMapa() {
  const dados = montarDadosDoMapa(PONTOS_DE_VISITA_PREVISTOS);

  return (
    <div className="mx-auto w-full max-w-6xl px-4">
      <TerritorioCartografico dados={dados} />
    </div>
  );
}
