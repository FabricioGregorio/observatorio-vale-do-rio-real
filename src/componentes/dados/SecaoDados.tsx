import { DadosVivos } from "../prototipo/dadosvivos/DadosVivos";
import { CSS_DOS_DADOS_VIVOS } from "../prototipo/dadosvivos/estilos";
import { CSS_DA_LINGUAGEM } from "../prototipo/linguagem/estilos";
import { RevelacaoVisual } from "../prototipo/linguagem/RevelacaoVisual";

/** Raiz da seção: a `RevelacaoVisual` observa só o que está dentro dela. */
const RAIZ = "secao-dados-home";

/**
 * Entrada pública da seção Dados — "Onde o recurso circula" (H4.1).
 *
 * Mantém a implementação compartilhada com o laboratório e fixa o contexto da
 * Home, que remove do conteúdo público os rótulos de desenvolvimento. Nenhum
 * número, rótulo, ordem ou copy é redefinido aqui: a autoridade factual é a
 * H4.0, a editorial é a H4.5.2 e a visual é a H3.5.1.
 *
 * ## Por que a classe `dados-vivos` importa
 *
 * As regras de revelação e as de `prefers-reduced-motion` são escopadas em
 * `.dados-vivos …`. Sem essa classe na raiz, a seção perderia as duas — e a
 * segunda é requisito de acessibilidade, não acabamento.
 *
 * ## Por que a largura não é do Tailwind
 *
 * `.dados-vivos` já define `max-width: var(--largura-conteudo)` e centraliza.
 * Envolvê-la no `max-w-6xl px-4` que as outras seções usam restringiria duas
 * vezes, e as passagens perderiam a sangria que a gramática lhes dá.
 *
 * ## A ilha cliente
 *
 * `RevelacaoVisual` é a mesma ilha da H3.5.1, sem implementação nova: só as
 * propriedades `raiz` e `escopo` mudam. Ela **acrescenta** a entrada de 240 ms
 * aprovada e não é condição de leitura — a animação só se aplica sob
 * `[data-revelado]`, atributo que ela mesma põe. Sem JavaScript, o conteúdo
 * nasce e permanece visível por completo.
 */
export function SecaoDados() {
  return (
    <div className="dados-vivos" id={RAIZ}>
      <style>{CSS_DA_LINGUAGEM}</style>
      <style>{CSS_DOS_DADOS_VIVOS}</style>

      <DadosVivos contexto="home" />

      <RevelacaoVisual escopo="" raiz={RAIZ} />
    </div>
  );
}
