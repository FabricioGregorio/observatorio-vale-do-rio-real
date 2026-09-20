import type { EpisodioPublico } from "../../dados/consultas/podobservar";
import type { ArquivosPublicados } from "../../dados/materiais-de-campo";
import { AberturaB2, FaixaDaPesquisa } from "./Aberturas";
import { CSS_DA_HOME } from "./estilos";
import { CSS_DAS_ABERTURAS } from "./estilosAberturas";
import { PodObservarNaHome } from "./PodObservar";
import {
  Conferencia,
  Escuta,
  Leitura,
  Lugares,
  Origem,
  Produtos,
  RodapeDaHome,
  Territorio,
} from "./Secoes";

/**
 * Home do Observatório — composição oficial da rota `/`.
 *
 * A ordem responde, nesta sequência, às perguntas de quem chega: o que é, quem
 * faz e com que recurso (abertura e origem), onde (território), onde de fato a
 * pesquisa se aprofundou (os dois equipamentos de Tobias Barreto), o que ela
 * mediu ali, quem foi ouvido, o que foi produzido e como tudo isso se confere.
 *
 * O PodObservar entra logo depois da origem: é a porta de entrada mais
 * acessível da pesquisa, e quem chega pelo podcast chega antes do mapa.
 *
 * Server Component. A consulta dos arquivos públicos é feita em build pela
 * rota e chega aqui por props: nenhum componente consulta o banco.
 *
 * ## Isolamento do rodapé
 *
 * O layout raiz serve o rodapé de todas as rotas. A Home fecha com um rodapé
 * próprio, de linha única, e por isso esconde o do layout enquanto está
 * renderizada. Os estilos vivem sob `.home-observatorio` e não alcançam
 * nenhum outro componente.
 */
const CSS_DE_ISOLAMENTO = "body > footer { display: none; }";

export function Home({
  publicados = new Map(),
  recente = null,
}: {
  /**
   * Arquivos públicos por documento, buscados pela rota em build. É a mesma
   * fonte que abastece `/territorio` e o Acervo; sem ela as fichas dos lugares
   * caem para o estado declarado e nenhum link aparece.
   */
  publicados?: ArquivosPublicados;
  /**
   * Episódio mais recente já público, de `obterEpisodioMaisRecente()`. `null`
   * enquanto nenhum passou pelo gate — e a seção II tem estado vazio próprio
   * para isso, sem inventar episódio.
   */
  recente?: EpisodioPublico | null;
}) {
  return (
    <div className="home-observatorio" id="home">
      <style>{CSS_DE_ISOLAMENTO}</style>
      <style>{CSS_DA_HOME}</style>
      <style>{CSS_DAS_ABERTURAS}</style>

      <AberturaB2 />
      <Origem />
      <PodObservarNaHome recente={recente} />
      <FaixaDaPesquisa />
      <Territorio />
      <Lugares publicados={publicados} />
      <Leitura />
      <Escuta publicados={publicados} />
      <Produtos publicados={publicados} />
      <Conferencia />
      <RodapeDaHome />
    </div>
  );
}
