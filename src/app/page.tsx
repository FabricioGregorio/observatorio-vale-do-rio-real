import { Home as ComposicaoDaHome } from "../componentes/home/Home";
import { listarArquivosPorDocumento } from "../dados/consultas/anexos";
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
 * Server Component. A única consulta é a dos arquivos públicos, em build, pela
 * mesma função que serve `/territorio` e o Acervo: o estado das fichas dos
 * lugares é consequência do que está em `vw_anexo_publico`, nunca uma lista
 * escrita à mão. O `<main id="conteudo">` vive no layout raiz: aqui vai só o
 * conteúdo.
 */
export default async function Home() {
  return <ComposicaoDaHome publicados={await listarArquivosPorDocumento()} />;
}
