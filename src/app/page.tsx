import { HeroManifesto } from "../componentes/hero/HeroManifesto";
import { CaminhosPrioritarios } from "../componentes/home/CaminhosPrioritarios";
import { ChamadaAcervo } from "../componentes/home/ChamadaAcervo";
import { CAMINHOS_PRIORITARIOS } from "../componentes/home/caminhos";
import { SecaoMapa } from "../componentes/home/SecaoMapa";
import { PesquisaEmCampo } from "../componentes/pesquisa/PesquisaEmCampo";
import { CabecalhoPrototipo } from "../componentes/prototipo/CabecalhoPrototipo";
import { metadadosDaRota } from "../lib/site-url";

export const metadata = metadadosDaRota({
  pathname: "/",
  titulo: "Observatório do Vale do Rio Real",
  descricao: "Arquivo público do Observatório do Vale do Rio Real.",
});

/**
 * Home — fatia estrutural (Tarefa 10A) com Hero Manifesto integrado (H1/H2).
 *
 * A estrutura planejada da Home tem cinco seções:
 *
 *   Hero Manifesto → Território → Pesquisa em Campo → Caminhos prioritários →
 *   Acervo
 *
 * Duas delas **não** são renderizadas nesta fatia, e a ausência é deliberada:
 *
 * - **Apresentação** do Observatório e do Coletivo "Tobias, sou Eu!" depende
 *   de texto humano aprovado. Não existe fonte para escrevê-la, e converter os
 *   documentos de arquitetura em copy pública seria inventar apresentação
 *   institucional.
 * A regra da fatia é explícita: seção que depende integralmente de conteúdo
 * bloqueado é omitida, não preenchida com texto plausível nem renderizada
 * vazia. O painel de indicadores segue igualmente ausente — a tabela
 * `indicador` só chega na Tarefa 13, e número provisório é proibido.
 *
 * A seção **Território** usa a composição H2 aprovada: SVG renderizado no
 * servidor, Preset B refinado e uma ilha cliente pequena para sincronizar
 * mapa, índice e painel. Nenhum comparativo numérico é publicado.
 *
 * A seção **Pesquisa em Campo** usa a composição H3 aprovada — A, Documental
 * aberto. São três fotografias derivadas de originais sem pessoa
 * identificável, servidas abaixo da dobra, sem `preload` e sem `priority`.
 * Nenhuma delas tem data confirmada, e nenhuma data é inferida.
 *
 * Server Component, sem consulta a banco. O `<main id="conteudo">` vive no
 * layout raiz: aqui vai só o conteúdo.
 */
export default function Home() {
  return (
    <div id="home-com-hero">
      {/*
        O layout raiz ainda serve o cabeçalho legado às demais rotas. Nesta
        página ele é substituído pela casca aprovada do Hero; a regra está
        escopada à presença da própria Home e não afeta nenhuma outra rota.
      */}
      <style>{`body:has(#home-com-hero)>header:not(.cabecalho-prototipo){display:none}`}</style>
      <CabecalhoPrototipo contexto="home" />
      <HeroManifesto variante="tipografia" id="hero-home" />

      <SecaoMapa />

      <div className="mx-auto w-full max-w-6xl px-4">
        <PesquisaEmCampo />
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 pb-12">
        <CaminhosPrioritarios caminhos={CAMINHOS_PRIORITARIOS} />
        <ChamadaAcervo />
      </div>
    </div>
  );
}
