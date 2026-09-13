import type { JSX } from "react";
import {
  AberturaA,
  AberturaB,
  AberturaB2,
  AberturaC,
  SeletorDeAbertura,
} from "./Aberturas";
import type { VarianteDaAbertura } from "./abertura";
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
 * ## Isolamento
 *
 * O layout raiz continua servindo cabeçalho e rodapé legados. Como em
 * `/dev/hero`, eles são escondidos só enquanto esta rota está renderizada, e
 * esta rota responde 404 em produção. Os estilos do experimento vivem sob
 * `.home-livre` e não alcançam nenhum outro componente.
 */
const CSS_DE_ISOLAMENTO = "body > header, body > footer { display: none; }";

/**
 * Rodada 2: só a abertura varia (`?hero=atual|a|b|c`). Do fim da abertura em
 * diante, o que é renderizado é o mesmo em qualquer variação.
 */
const ABERTURAS: Readonly<Record<VarianteDaAbertura, () => JSX.Element>> = {
  atual: Abertura,
  a: AberturaA,
  b: AberturaB,
  b2: AberturaB2,
  c: AberturaC,
};

export function HomeLivre({
  abertura = "b2",
}: {
  abertura?: VarianteDaAbertura;
}) {
  const AberturaEscolhida = ABERTURAS[abertura];

  return (
    <div className="home-livre" id="home-livre">
      <style>{CSS_DE_ISOLAMENTO}</style>
      <style>{CSS_DA_HOME_LIVRE}</style>
      <style>{CSS_DAS_ABERTURAS}</style>

      <p className="hl-dev">
        Experimento controlado · /dev/home-livre · somente DEV · textos novos em
        avaliação editorial · marcas tracejadas indicam material pendente
      </p>
      <SeletorDeAbertura ativa={abertura} />

      <Topo />
      <AberturaEscolhida />
      <Origem />
      <Territorio />
      <Lugares />
      <Leitura />
      <Escuta />
      <Produtos />
      <Conferencia />
      <Creditos />
      <RodapeLivre />
    </div>
  );
}
