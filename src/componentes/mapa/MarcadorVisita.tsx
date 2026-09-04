import type { PontoDeVisita } from "../../dados/territorio/tipos";

/**
 * Um ponto de visita na lista — Tarefa 10B.3.3.
 *
 * Forma textual do ponto, que é o que existe hoje: nenhum dos quatro tem
 * coordenada aprovada, então nenhum vira marcador no desenho. Esta lista é o
 * que impede que eles desapareçam em silêncio — inclusive Serra dos Macacos e
 * Ilha Grande, que também não têm município declarado e por isso não caberiam
 * numa lista organizada por município.
 *
 * Tipo e descrição só aparecem se vierem preenchidos. Nada é inventado.
 */
export function MarcadorVisita({ ponto }: { ponto: PontoDeVisita }) {
  return (
    <li className="flex flex-col">
      <span>{ponto.nome}</span>
      {ponto.tipo === null ? null : (
        <span className="meta-ficha">{ponto.tipo}</span>
      )}
      {ponto.descricao === null ? null : <span>{ponto.descricao}</span>}
    </li>
  );
}
