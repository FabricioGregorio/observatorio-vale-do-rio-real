import { TerritorioVivo } from "../../componentes/territorio/cartografia/TerritorioVivo";
import { listarArquivosPorDocumento } from "../../dados/publicado/anexos";
import { metadadosDaRota } from "../../lib/site-url";

export const metadata = metadadosDaRota({
  pathname: "/territorio",
  titulo: "Território — Observatório do Vale do Rio Real",
  descricao:
    "Uma leitura espacial dos lugares, equipamentos e evidências que fizeram parte da pesquisa do Observatório.",
});

/**
 * O estado de cada material das fichas vem de `acervo.json`, lido aqui em
 * build. Nenhuma exceção local: o Território e a Home leem a mesma fonte pela
 * mesma função.
 */
export default async function PaginaTerritorio() {
  return (
    <TerritorioVivo
      baseDasCamadas="/territorio/camada-local"
      publicados={await listarArquivosPorDocumento()}
    />
  );
}
