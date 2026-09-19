import { Home as ComposicaoDaHome } from "../componentes/home/Home";
import { listarArquivosPorDocumento } from "../dados/consultas/anexos";
import { obterEpisodioMaisRecente } from "../dados/consultas/podobservar";
import { metadadosDaRota } from "../lib/site-url";

export const metadata = metadadosDaRota({
  pathname: "/",
  titulo: "Observatório do Vale do Rio Real",
  descricao: "Arquivo público do Observatório do Vale do Rio Real.",
});

/**
 * Home do Observatório — a página inicial do site.
 *
 * Esta rota é só a casca pública: a composição inteira vive em
 * `src/componentes/home/`. Não há segunda Home, rota alternativa nem variante
 * de abertura — `/` é o único endereço dela.
 *
 * Server Component. As duas consultas acontecem em build e vêm das mesmas
 * funções que servem as outras rotas: `vw_anexo_publico` decide o estado das
 * fichas dos lugares, e `vw_episodio_publico` decide qual episódio a seção do
 * PodObservar mostra — nenhuma das duas é lista escrita à mão. O
 * `<main id="conteudo">` vive no layout raiz: aqui vai só o conteúdo.
 */
export default async function Home() {
  const [publicados, recente] = await Promise.all([
    listarArquivosPorDocumento(),
    obterEpisodioMaisRecente(),
  ]);
  return <ComposicaoDaHome publicados={publicados} recente={recente} />;
}
