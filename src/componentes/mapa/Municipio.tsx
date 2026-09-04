import type { MunicipioDoMapa } from "../../dados/territorio/mapa";
import type { PontoDeVisita } from "../../dados/territorio/tipos";
import { FichaMunicipio } from "./FichaMunicipio";
import { idDaFicha, rotulosDasRelacoes } from "./identificacao";

/**
 * Um município na lista territorial — Tarefa 10B.3.3.
 *
 * Server Component. Esta lista é a **alternativa textual** do mapa, e não um
 * apêndice dele: é o que funciona sem JavaScript, sem WebGL e por leitor de
 * tela, e sem JavaScript é o único caminho para a informação.
 *
 * O `data-codigo` é como a ilha de interação encontra a entrada do município
 * selecionado no mapa para realçá-la. O `id` continua existindo para permitir
 * link direto a um município de fora da página, e vem de `identificacao.ts`
 * para que os dois lados nunca divirjam.
 *
 * Município sem vínculo declarado diz isso em texto. Não é lacuna: é
 * informação — "município de Sergipe, sem vínculo declarado com a pesquisa"
 * (Consolidação 10B.2.1 §2).
 */
export function Municipio({
  municipio,
  pontos,
}: {
  municipio: MunicipioDoMapa;
  pontos: readonly PontoDeVisita[];
}) {
  const rotulos = rotulosDasRelacoes(municipio.relacoesTerritoriais);

  return (
    <li
      className="f flex break-inside-avoid flex-col gap-1 border p-2"
      data-codigo={municipio.codigoIbge}
      id={idDaFicha(municipio.codigoIbge)}
      style={{
        borderColor: "var(--color-borda)",
        borderRadius: "var(--radius-ficha)",
      }}
    >
      <p className="font-semibold">{municipio.nome}</p>

      {rotulos.length === 0 ? (
        <p className="meta-ficha">Sem vínculo declarado</p>
      ) : (
        <p className="meta-ficha">{rotulos.join(" · ")}</p>
      )}

      <FichaMunicipio municipio={municipio} pontos={pontos} />
    </li>
  );
}
