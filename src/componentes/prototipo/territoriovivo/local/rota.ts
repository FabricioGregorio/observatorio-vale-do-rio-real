import type { PosicaoConfirmada } from "./coordenadas";

/**
 * Destinos de "Abrir rota" — arquitetura da ação (Tarefa 19).
 *
 * Só links explícitos, acionados pelo visitante. Nada é carregado antes do
 * clique: sem iframe, sem script, sem prefetch (âncora comum, não `Link`).
 * O link abre em nova aba com `rel="noopener noreferrer"` e
 * `referrerPolicy="no-referrer"`, para o serviço não receber a página de
 * origem.
 *
 * | Critério | OpenStreetMap | Google Maps |
 * |---|---|---|
 * | rastreio antes do clique | nenhum | nenhum (é só um link) |
 * | rastreio depois do clique | baixo; sem conta | alto; cookies e perfil |
 * | celular | site; não abre app nativo por padrão | abre o app instalado |
 * | familiaridade do público | menor | maior |
 * | cálculo de rota | OSRM/GraphHopper; bom em rodovia, fraco em estrada vicinal | melhor cobertura rural |
 *
 * **Decisão do laboratório:** oferecer os dois, OpenStreetMap primeiro, com
 * aviso de serviço externo. O destino definitivo é decisão humana.
 *
 * Só existe destino quando existe coordenada confirmada — e só no DEV, até a
 * publicação ser autorizada.
 */

export type DestinoDeRota = {
  readonly servico: "OpenStreetMap" | "Google Maps";
  readonly href: string;
};

export function destinosDeRota(
  posicao: PosicaoConfirmada,
): readonly DestinoDeRota[] {
  const lat = String(posicao.latitude);
  const lon = String(posicao.longitude);
  return [
    {
      servico: "OpenStreetMap",
      href: `https://www.openstreetmap.org/directions?route=%3B${lat}%2C${lon}`,
    },
    {
      servico: "Google Maps",
      href: `https://www.google.com/maps/dir/?api=1&destination=${lat}%2C${lon}`,
    },
  ];
}
