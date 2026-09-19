import Image from "next/image";
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

/**
 * Folha da seção. Ela viaja dentro do HTML de toda visita, então comentário
 * aqui é peso de rede: o porquê de cada regra fica neste bloco, que o build
 * descarta, e a folha fica só com o que o navegador precisa ler.
 *
 * - `__tracado`: mesma família gráfica da cartografia do Território — curva de
 *   nível que também lê como onda. Puro CSS, sem JS e sem imagem.
 * - No desktop a coluna de texto acompanha a altura do card, e a cadência com
 *   o CTA descem para o pé dela (`margin-top:auto`). Ancorados no topo,
 *   deixavam um vazio do tamanho da capa embaixo do texto — a seção parecia
 *   desmontada, não arejada.
 * - `--pod-ficha` é usada na ficha **e** no pé do véu. É isso que faz a arte
 *   terminar dentro da peça em vez de parar numa borda; uma variável só
 *   impede que as duas se separem numa edição futura.
 * - `__palco` é quadrado e a capa ocupa o palco inteiro. O `max-width:none`
 *   na capa é o ponto central do refinamento: a redefinição global de imagem
 *   fluida vinha estrangulando a arte dentro do recuo do card, e era daí que
 *   vinha a impressão de imagem solta numa moldura grande demais.
 * - O véu é opaco só na faixa onde o selo pousa e some antes da metade. A capa
 *   é a peça; cobri-la para ganhar contraste seria resolver o problema errado.
 *   O topo fica intacto, inclusive o letreiro que a própria arte traz.
 * - Sobre a arte o rótulo abre mão do tom suave e usa o texto cheio. Medido
 *   com o véu aplicado sobre a capa do EP03, o tom suave dava 3,87:1 no tema
 *   escuro; suave é um luxo de superfície sólida, não de fotografia.
 */
const CSS = `
.hl-pod-secao{background:var(--color-fundo-inverso);color:var(--color-texto-inverso);border-top:0;position:relative;overflow:clip}
.hl-pod-secao>.hl-quadro{position:relative;isolation:isolate}
.hl-pod-secao .meta-ficha,.hl-pod-secao .hl-num{color:color-mix(in srgb,var(--color-texto-inverso) 85%,var(--color-fundo-inverso))}
.home-observatorio .hl-pod-secao a{color:var(--color-texto-inverso)}
.hl-pod-secao__tracado{position:absolute;inset:0 0 0 auto;width:min(62%,44rem);opacity:.22;pointer-events:none;background:repeating-radial-gradient(ellipse at 96% 38%,transparent 0 2.4rem,var(--color-texto-inverso) 2.45rem 2.5rem,transparent 2.55rem 4.2rem);mask-image:linear-gradient(to left,#000 10%,transparent 78%)}
.hl-pod-grade{display:grid;gap:2.5rem;margin-top:2rem}
.hl-pod-secao__chamada{font-size:var(--text-sm);letter-spacing:.06em;text-transform:uppercase;margin-top:2rem;padding-top:1rem;border-top:1px solid color-mix(in srgb,var(--color-texto-inverso) 35%,var(--color-fundo-inverso))}
.hl-pod-recente{--pod-ficha:color-mix(in srgb,var(--color-texto-inverso) 7%,var(--color-fundo-inverso));border:1px solid color-mix(in srgb,var(--color-texto-inverso) 38%,var(--color-fundo-inverso));background:var(--pod-ficha);overflow:clip;max-width:26rem}
.hl-pod-recente__palco{position:relative;aspect-ratio:1;container-type:inline-size}
.hl-pod-recente__capa{position:absolute;inset:0;display:block;width:100%;height:100%;max-width:none;object-fit:cover}
.hl-pod-recente__palco::after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(to top,var(--pod-ficha) 0 21%,color-mix(in srgb,var(--pod-ficha) 88%,transparent) 32%,color-mix(in srgb,var(--pod-ficha) 32%,transparent) 43%,transparent 53%)}
.hl-pod-recente__rotulo{font-size:var(--text-sm);letter-spacing:.08em;text-transform:uppercase;color:color-mix(in srgb,var(--color-texto-inverso) 82%,var(--color-fundo-inverso))}
.hl-pod-recente__numero{font-family:var(--font-display);line-height:1;margin:0;font-size:clamp(var(--text-3xl),6vw,var(--text-5xl))}
.hl-pod-recente__selo{position:absolute;z-index:1;inset:auto 1.5rem 1.125rem;display:flex;flex-direction:column;gap:.25rem}
.hl-pod-recente__selo .hl-pod-recente__rotulo{color:var(--color-texto-inverso)}
.hl-pod-recente__selo .hl-pod-recente__numero{font-size:clamp(var(--text-4xl),14cqw,var(--text-6xl))}
.hl-pod-recente__ficha{padding:1.25rem 1.5rem 1.5rem}
.hl-pod-recente__ficha .hl-pod-recente__rotulo{margin:0 0 .5rem}
.hl-pod-recente__ficha .hl-pod-recente__numero{margin:0 0 .25rem}
.hl-pod-recente h3{margin:0;font-size:var(--text-xl);text-wrap:balance}
.hl-pod-recente__meta{margin-top:.5rem;font-size:var(--text-sm);color:color-mix(in srgb,var(--color-texto-inverso) 82%,var(--color-fundo-inverso))}
.hl-pod-recente__acoes{display:flex;flex-wrap:wrap;gap:1rem 1.5rem;margin-top:1.25rem}
.hl-pod-vazio{border:1px dashed color-mix(in srgb,var(--color-texto-inverso) 45%,var(--color-fundo-inverso));padding:1.5rem}
.hl-pod-vazio p{margin:0}
@media (min-width:60rem){
.hl-pod-grade{grid-template-columns:minmax(0,1fr) minmax(0,22rem);gap:4rem;align-items:stretch}
.hl-pod-grade>.hl-texto{display:flex;flex-direction:column}
.hl-pod-grade>.hl-texto .hl-pod-secao__chamada{margin-top:auto}
.hl-pod-recente{max-width:none}
}
`;

export function PodObservarNaHome({
  recente,
}: {
  /** `null` enquanto nenhum episódio passou pelo gate público. */
  recente: EpisodioPublico | null;
}) {
  const temPalco = Boolean(
    recente?.capaUrl && recente.capaLarguraPx && recente.capaAlturaPx,
  );

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
            {/*
             * O palco só existe quando há arte. Sem capa, o selo e o numeral
             * descem para a ficha: um quadrado vazio com um "03" solto seria
             * uma moldura fingindo que a peça está inteira.
             *
             * `alt=""`: a capa repete, em desenho, o que o `h3` ao lado já
             * diz — número e título do episódio. Descrevê-la faria o leitor
             * de tela ouvir a mesma informação duas vezes.
             */}
            {temPalco ? (
              <div className="hl-pod-recente__palco">
                <Image
                  alt=""
                  className="hl-pod-recente__capa"
                  height={recente.capaAlturaPx as number}
                  loading="lazy"
                  /*
                   * Sem `vw` de propósito. Quando o `sizes` traz uma medida
                   * de viewport, o Next monta o `srcset` só com os
                   * `deviceSizes`, cujo menor degrau é 640 — e a capa, que
                   * cabe em 384, passava a chegar em 640. Foram 31,8 kB a
                   * mais na carga inicial, orçamento que a Home não tem.
                   * Em medidas fixas ele considera também os `imageSizes`.
                   */
                  sizes="(min-width: 60rem) 352px, (min-width: 26rem) 416px, 352px"
                  src={recente.capaUrl as string}
                  width={recente.capaLarguraPx as number}
                />
                <div className="hl-pod-recente__selo">
                  <p className="hl-pod-recente__rotulo">
                    Episódio mais recente
                  </p>
                  <p aria-hidden="true" className="hl-pod-recente__numero">
                    {numeroDoEpisodio(recente.numero)}
                  </p>
                </div>
              </div>
            ) : null}
            <div className="hl-pod-recente__ficha">
              {temPalco ? null : (
                <>
                  <p className="hl-pod-recente__rotulo">
                    Episódio mais recente
                  </p>
                  <p aria-hidden="true" className="hl-pod-recente__numero">
                    {numeroDoEpisodio(recente.numero)}
                  </p>
                </>
              )}
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
            </div>
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
