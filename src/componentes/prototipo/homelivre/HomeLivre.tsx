import type { JSX } from "react";

import type { ArquivosPublicados } from "../../../dados/materiais-de-campo";
import {
  AberturaA,
  AberturaB,
  AberturaB2,
  AberturaC,
  SeletorDeAbertura,
} from "./Aberturas";
import type { ContextoDaHome, VarianteDaAbertura } from "./abertura";
import type { PropsDeSecao } from "./Estrutura";
import { CSS_DA_HOME_LIVRE } from "./estilos";
import { CSS_DAS_ABERTURAS } from "./estilosAberturas";
import {
  Abertura,
  Conferencia,
  Creditos,
  Escuta,
  Leitura,
  Lugares,
  Origem,
  Produtos,
  RodapeLivre,
  Territorio,
  Topo,
} from "./Secoes";

/**
 * Experimento — Home livre.
 *
 * Hipótese testada: a Home deve contar o **projeto** antes de demonstrar
 * território e indicadores. A ordem responde, nesta sequência, às perguntas
 * de quem chega: o que é, quem faz e com que recurso (abertura e origem),
 * onde (território), onde de fato a pesquisa se aprofundou (os dois
 * equipamentos de Tobias Barreto), o que ela mediu ali, quem foi ouvido, o
 * que foi produzido e como tudo isso se confere.
 *
 * ## Onde isto é servido
 *
 * Desde 2026-09-16, por decisão humana, esta é a Home oficial em
 * desenvolvimento: `/` a renderiza com `contexto="publico"`. O laboratório
 * `/dev/home-livre` continua existindo como harness de regressão, com
 * `contexto="dev"`, e segue respondendo 404 em produção. Não há duas Homes —
 * há uma implementação e duas cascas.
 *
 * ## Isolamento
 *
 * O layout raiz continua servindo cabeçalho e rodapé legados. Como em
 * `/dev/hero`, eles são escondidos só enquanto esta composição está
 * renderizada. Os estilos vivem sob `.home-livre` e não alcançam nenhum outro
 * componente.
 */
const CSS_DE_ISOLAMENTO = "body > header, body > footer { display: none; }";

/**
 * Rodada 2: só a abertura varia (`?hero=atual|a|b|c`). Do fim da abertura em
 * diante, o que é renderizado é o mesmo em qualquer variação.
 */
const ABERTURAS: Readonly<
  Record<VarianteDaAbertura, (props: PropsDeSecao) => JSX.Element>
> = {
  atual: Abertura,
  a: AberturaA,
  b: AberturaB,
  b2: AberturaB2,
  c: AberturaC,
};

export function HomeLivre({
  abertura = "b2",
  contexto = "dev",
  publicados = new Map(),
}: {
  abertura?: VarianteDaAbertura;
  contexto?: ContextoDaHome;
  /**
   * Arquivos públicos por documento, buscados pela rota em build. É a mesma
   * fonte que abastece `/territorio` e o Acervo; sem ela as fichas caem para
   * o estado declarado e nenhum link aparece.
   */
  publicados?: ArquivosPublicados;
}) {
  const AberturaEscolhida = ABERTURAS[abertura];

  return (
    <div className="home-livre" data-contexto={contexto} id="home-livre">
      <style>{CSS_DE_ISOLAMENTO}</style>
      <style>{CSS_DA_HOME_LIVRE}</style>
      <style>{CSS_DAS_ABERTURAS}</style>

      {contexto === "dev" ? (
        <>
          <p className="hl-dev">
            Experimento controlado · /dev/home-livre · somente DEV · textos
            novos em avaliação editorial · marcas tracejadas indicam material
            pendente
          </p>
          <SeletorDeAbertura ativa={abertura} />
        </>
      ) : null}

      <Topo contexto={contexto} />
      <AberturaEscolhida contexto={contexto} />
      <Origem contexto={contexto} />
      <Territorio contexto={contexto} />
      <Lugares contexto={contexto} publicados={publicados} />
      <Leitura contexto={contexto} />
      <Escuta contexto={contexto} />
      <Produtos contexto={contexto} publicados={publicados} />
      <Conferencia contexto={contexto} />
      <Creditos contexto={contexto} />
      <RodapeLivre />
    </div>
  );
}
