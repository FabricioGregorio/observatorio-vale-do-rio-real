import { AberturaObservatorio } from "../componentes/home/AberturaObservatorio";
import { CaminhosPrioritarios } from "../componentes/home/CaminhosPrioritarios";
import { ChamadaAcervo } from "../componentes/home/ChamadaAcervo";
import { CAMINHOS_PRIORITARIOS } from "../componentes/home/caminhos";
import { SecaoMapa } from "../componentes/home/SecaoMapa";
import { metadadosDaRota } from "../lib/site-url";

export const metadata = metadadosDaRota({
  pathname: "/",
  titulo: "Observatório do Vale do Rio Real",
  descricao: "Arquivo público do Observatório do Vale do Rio Real.",
});

/**
 * Home — fatia estrutural (Tarefa 10A).
 *
 * A estrutura planejada da Home tem cinco seções:
 *
 *   Abertura → Caminhos prioritários → Apresentação → Território → Acervo
 *
 * Duas delas **não** são renderizadas nesta fatia, e a ausência é deliberada:
 *
 * - **Apresentação** do Observatório e do Coletivo "Tobias, sou Eu!" depende
 *   de texto humano aprovado. Não existe fonte para escrevê-la, e converter os
 *   documentos de arquitetura em copy pública seria inventar apresentação
 *   institucional.
 * - **Território** depende do comparativo entre Tobias Barreto, Itabaianinha e
 *   São Cristóvão, que não tem fonte oficial comparável aprovada. Sem ele,
 *   sobraria uma caixa sem conteúdo.
 *
 * A regra da fatia é explícita: seção que depende integralmente de conteúdo
 * bloqueado é omitida, não preenchida com texto plausível nem renderizada
 * vazia. O painel de indicadores segue igualmente ausente — a tabela
 * `indicador` só chega na Tarefa 13, e número provisório é proibido.
 *
 * O **mapa vivo do território** entrou na Tarefa 10B.3.3, entre os caminhos e o
 * acervo. É SVG renderizado no servidor, a partir da malha oficial do IBGE, sem
 * JavaScript, sem WebGL e sem serviço externo — Cenário C da auditoria
 * 10B.3.2. Integração mínima: só o mapa, nada das outras seções previstas.
 *
 * Server Component, sem consulta a banco. O `<main id="conteudo">` vive no
 * layout raiz: aqui vai só o conteúdo.
 */
export default function Home() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-12">
      <AberturaObservatorio />
      <CaminhosPrioritarios caminhos={CAMINHOS_PRIORITARIOS} />
      <SecaoMapa />
      <ChamadaAcervo />
    </div>
  );
}
