import { PesquisaEmCampoPrototipo } from "../prototipo/pesquisa/PesquisaEmCampoPrototipo";

/**
 * Entrada pública da seção Pesquisa em Campo.
 *
 * Mantém a implementação compartilhada com o laboratório, mas fixa a
 * composição A — Documental aberto, aprovada na H3.1, e remove do conteúdo
 * público todos os rótulos de desenvolvimento.
 */
export function PesquisaEmCampo() {
  return (
    <PesquisaEmCampoPrototipo composicao="documental-aberto" contexto="home" />
  );
}
