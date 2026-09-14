import { montarCamadaLocal } from "./camada";
import { estaPosicionado, montarBaseDoTerritorio } from "./composicao";
import { carregarEntorno } from "./entorno";
import { svgDaCamadaLocal } from "./svg";

/**
 * Serviço das camadas locais sob demanda — usado só pela rota DEV.
 *
 * Monta, para um lugar, o SVG do entorno: contexto de IBGE e OSM (derivado
 * local) mais os pins nas coordenadas confirmadas. A página nunca chama isto.
 */

export function lugaresComCamadaLocal(): readonly string[] {
  return montarBaseDoTerritorio()
    .lugares.filter((l) => estaPosicionado(l) && l.local !== null)
    .map((l) => l.id);
}

export function svgDoEntornoDoLugar(id: string): string | null {
  const base = montarBaseDoTerritorio();
  const lugar = base.lugares.find((l) => l.id === id);
  if (lugar === undefined || !estaPosicionado(lugar) || lugar.local === null) {
    return null;
  }
  const { definicao, geografico } = lugar.local;
  const entorno = carregarEntorno(definicao.caminho, {
    enquadramento: geografico,
    localidadesObrigatorias: definicao.localidadesObrigatorias,
  });
  const camada = montarCamadaLocal({
    projecao: base.dados.projecao,
    vista: base.vista,
    fs: base.fs,
    raio: base.raio,
    entorno,
    geografico,
    municipios: base.dados.municipios,
    lugarSelecionado: lugar.id,
    pins: base.lugares.filter(estaPosicionado).map((l) => ({
      id: l.id,
      nome: l.nome,
      posicao: [l.posicao.longitude, l.posicao.latitude] as const,
    })),
    localidadeDoLugar: lugar.camadaLocal?.localidadeIbge ?? null,
  });
  return svgDaCamadaLocal(camada, base.vista, lugar.id);
}
