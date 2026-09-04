import { montarDadosDoMapa } from "../../dados/territorio/mapa";
import { PONTOS_DE_VISITA_PREVISTOS } from "../../dados/territorio/pontos";
import { MapaTerritorio } from "../mapa/MapaTerritorio";

/**
 * Seção do mapa na Home — Tarefa 10B.3.3.
 *
 * Server Component. É aqui que o dado é lido e validado, em tempo de build, e
 * entregue ao mapa por props: o `MapaTerritorio` não busca nada, e a Home não
 * sabe como o dado é montado.
 *
 * O título "Mapa vivo do território" vem do 10B.0 v1.1 §2, aprovado, e foi
 * confirmado pelo responsável. Nenhuma redação nova.
 *
 * Esta é a **integração mínima** da Tarefa 10B.3.3: o suficiente para o mapa
 * existir na página e ser verificável. As demais seções previstas para a Home
 * — apresentação, caderno de campo, créditos — continuam fora, porque
 * dependem de conteúdo bloqueado.
 */
const ID_TITULO = "mapa-vivo-do-territorio";

export function SecaoMapa() {
  const dados = montarDadosDoMapa(PONTOS_DE_VISITA_PREVISTOS);

  return (
    <section aria-labelledby={ID_TITULO} className="flex flex-col gap-4">
      <h2 className="text-xl" id={ID_TITULO}>
        Mapa vivo do território
      </h2>
      <MapaTerritorio dados={dados} />
    </section>
  );
}
