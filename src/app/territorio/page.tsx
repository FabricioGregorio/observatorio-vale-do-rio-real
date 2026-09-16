import { TerritorioVivo } from "../../componentes/prototipo/territoriovivo/TerritorioVivo";
import { metadadosDaRota } from "../../lib/site-url";

export const metadata = metadadosDaRota({
  pathname: "/territorio",
  titulo: "Território — Observatório do Vale do Rio Real",
  descricao:
    "Uma leitura espacial dos lugares, equipamentos e evidências que fizeram parte da pesquisa do Observatório.",
});

export default function PaginaTerritorio() {
  return <TerritorioVivo baseDasCamadas="/territorio/camada-local" />;
}
