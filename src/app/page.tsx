import { HomeLivre } from "../componentes/prototipo/homelivre/HomeLivre";
import { metadadosDaRota } from "../lib/site-url";

export const metadata = metadadosDaRota({
  pathname: "/",
  titulo: "Observatório do Vale do Rio Real",
  descricao: "Arquivo público do Observatório do Vale do Rio Real.",
});

/**
 * Home — candidata editorial v2, promovida a página inicial.
 *
 * Decisão humana de 2026-09-16: a Home v2 deixou de ser alternativa
 * experimental e passou a ser a Home oficial em desenvolvimento. A Home
 * estrutural H0–H4.1 que esta rota servia até aqui continua publicada em
 * produção como baseline de rollback, e seus componentes seguem versionados —
 * o que ela deixou de ser é linha concorrente.
 *
 * Esta rota é só a casca pública: a composição inteira vem de `HomeLivre`, a
 * mesma que `/dev/home-livre` renderiza como harness de regressão. Copiar a
 * Home para publicá-la recriaria as duas estruturas visuais divergentes que a
 * decisão veio encerrar, então o que muda entre os dois lugares é um
 * parâmetro: `contexto="publico"` troca a demonstração de menu da H1 pela
 * navegação canônica de sete itens e retira os rótulos de desenvolvimento.
 *
 * A abertura fica na B2 aprovada. `?hero=` é instrumento de laboratório e não
 * é lido aqui: a Home pública não tem variante.
 *
 * Server Component, sem consulta a banco. O `<main id="conteudo">` vive no
 * layout raiz: aqui vai só o conteúdo.
 */
export default function Home() {
  return <HomeLivre abertura="b2" contexto="publico" />;
}
