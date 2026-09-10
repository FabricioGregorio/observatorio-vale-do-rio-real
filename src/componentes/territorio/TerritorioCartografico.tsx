import type { DadosDoMapa } from "../../dados/territorio/mapa";
import { TerritorioPrototipo } from "../prototipo/territorio/TerritorioPrototipo";

/**
 * Entrada pública da composição territorial aprovada.
 *
 * Mantém a implementação compartilhada com o laboratório, mas fixa o Preset B
 * refinado e remove do conteúdo público todos os rótulos de desenvolvimento.
 */
export function TerritorioCartografico({ dados }: { dados: DadosDoMapa }) {
  return (
    <TerritorioPrototipo
      contexto="home"
      dados={dados}
      profundidade="moderada"
    />
  );
}
