import Link from "next/link";

import type { EpisodioPublico } from "../../dados/consultas/podobservar";
import {
  dataCurta,
  dataMaquina,
  duracaoLegivel,
  duracaoMaquina,
  numeroDoEpisodio,
} from "../podobservar/formato";
import { OuvirNoSpotify } from "../podobservar/LinkDeEscuta";
import { Capitulo } from "./Estrutura";

/**
 * II · PodObservar — seção da Home.
 *
 * Entra entre Origem e Território porque é ali que a narrativa da página
 * pede: depois de dizer de onde o Observatório vem, e antes de abrir o mapa,
 * o podcast é a porta de entrada mais acessível da pesquisa. Era o argumento
 * da própria ADR-021 — o site divulga, e a escuta acontece no Spotify.
 *
 * **A Home não conhece a quantidade de episódios.** Recebe o mais recente por
 * prop, vindo de `obterEpisodioMaisRecente()`, e nada aqui menciona "3". Com
 * o EP04, esta seção passa a mostrar o EP04 sem uma linha de código mudar.
 *
 * Sem player, sem embed, sem iframe: o único destino de escuta é um link
 * externo para o Spotify.
 */

/** Cadência editorial, não regra de publicação. Nada agenda por segunda. */
const CADENCIA = "Novo episódio toda segunda-feira.";

const CSS = `
.hl-pod-secao{background:var(--color-fundo-inverso);color:var(--color-texto-inverso);border-top:0;position:relative;overflow:clip}
.hl-pod-secao>.hl-quadro{position:relative;isolation:isolate}
.hl-pod-secao .meta-ficha,.hl-pod-secao .hl-num{color:color-mix(in srgb,var(--color-texto-inverso) 85%,var(--color-fundo-inverso))}
.home-observatorio .hl-pod-secao a{color:var(--color-texto-inverso)}

/* Traçado: mesma família gráfica da cartografia do Território — curva de
   nível que também lê como onda. Puro CSS, sem JS e sem imagem. */
.hl-pod-secao__tracado{position:absolute;inset:0 0 0 auto;width:min(62%,44rem);opacity:.22;pointer-events:none;
  background:repeating-radial-gradient(ellipse at 96% 38%,transparent 0 2.4rem,var(--color-texto-inverso) 2.45rem 2.5rem,transparent 2.55rem 4.2rem);
  mask-image:linear-gradient(to left,#000 10%,transparent 78%)}

.hl-pod-grade{display:grid;gap:2.5rem;margin-top:2rem}
@media (min-width:60rem){.hl-pod-grade{grid-template-columns:minmax(0,1fr) minmax(0,22rem);gap:4rem;align-items:start}}

.hl-pod-secao__chamada{font-size:var(--text-sm);letter-spacing:.06em;text-transform:uppercase;
  margin-top:2rem;padding-top:1rem;border-top:1px solid color-mix(in srgb,var(--color-texto-inverso) 35%,var(--color-fundo-inverso))}

.hl-pod-recente{border:1px solid color-mix(in srgb,var(--color-texto-inverso) 38%,var(--color-fundo-inverso));padding:1.5rem}
.hl-pod-recente__rotulo{font-size:var(--text-sm);letter-spacing:.08em;text-transform:uppercase;
  color:color-mix(in srgb,var(--color-texto-inverso) 82%,var(--color-fundo-inverso))}
.hl-pod-recente__numero{font-family:var(--font-display);font-size:clamp(var(--text-3xl),6vw,var(--text-5xl));line-height:1;margin-top:.75rem}
.hl-pod-recente h3{margin-top:.5rem;font-size:var(--text-xl);text-wrap:balance}
.hl-pod-recente__meta{margin-top:.75rem;font-size:var(--text-sm);
  color:color-mix(in srgb,var(--color-texto-inverso) 82%,var(--color-fundo-inverso))}
.hl-pod-recente__acoes{display:flex;flex-wrap:wrap;gap:1rem 1.5rem;margin-top:1.5rem}

.hl-pod-vazio{border:1px dashed color-mix(in srgb,var(--color-texto-inverso) 45%,var(--color-fundo-inverso));padding:1.5rem}
.hl-pod-vazio p{margin:0}
`;

export function PodObservarNaHome({
  recente,
}: {
  /** `null` enquanto nenhum episódio passou pelo gate público. */
  recente: EpisodioPublico | null;
}) {
  return (
    <Capitulo
      className="hl-pod-secao"
      id="hl-podobservar"
      numero="II"
      rotulo="PodObservar"
      titulo="A pesquisa também se escuta."
    >
      <style>{CSS}</style>
      <div aria-hidden="true" className="hl-pod-secao__tracado" />

      <div className="hl-pod-grade">
        <div className="hl-texto">
          <p>
            O PodObservar leva a pesquisa do Observatório para o áudio, reunindo
            vozes, entrevistas, dados e experiências do território em uma
            linguagem clara e acessível.
          </p>
          <p className="hl-pod-secao__chamada">{CADENCIA}</p>
          <p className="hl-pod-recente__acoes">
            <Link href="/podobservar">Conhecer o PodObservar →</Link>
          </p>
        </div>

        {recente ? (
          <article
            aria-labelledby="hl-pod-recente-titulo"
            className="hl-pod-recente"
          >
            <p className="hl-pod-recente__rotulo">Episódio mais recente</p>
            <p aria-hidden="true" className="hl-pod-recente__numero">
              {numeroDoEpisodio(recente.numero)}
            </p>
            <h3 id="hl-pod-recente-titulo">
              <span className="sr-only">Episódio {recente.numero}: </span>
              {recente.titulo}
            </h3>
            <p className="hl-pod-recente__meta">
              <time dateTime={dataMaquina(recente.publicadoEm)}>
                {dataCurta(recente.publicadoEm)}
              </time>
              {" · "}
              <time dateTime={duracaoMaquina(recente.duracaoSeg)}>
                {duracaoLegivel(recente.duracaoSeg)}
              </time>
            </p>
            <p className="hl-pod-recente__acoes">
              <OuvirNoSpotify
                href={recente.urlSpotify}
                id="hl-pod-recente-nova-guia"
              />
            </p>
          </article>
        ) : (
          /*
           * Estado vazio honesto: nenhum episódio inventado, nenhum "em
           * breve" com data. A seção continua apresentando o PodObservar e
           * apontando para a página — que é onde a escuta começa quando o
           * primeiro episódio for publicado.
           */
          <div className="hl-pod-vazio">
            <p className="hl-pod-recente__rotulo">Episódio mais recente</p>
            <p className="hl-pod-recente__meta">
              Nenhum episódio publicado no site até agora.
            </p>
          </div>
        )}
      </div>
    </Capitulo>
  );
}
