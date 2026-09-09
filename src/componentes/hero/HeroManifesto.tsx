import {
  CAMINHO_DAS_MARCAS,
  MARCA_COLETIVO,
  MARCA_OBSERVATORIO,
} from "../../dados/hero/derivados";
import { FotografiaHero } from "./FotografiaHero";

/**
 * Hero — Manifesto. Fase H1, **protótipo**.
 *
 * Server Component. Nenhum estado, nenhum evento: o Hero é conteúdo, e
 * conteúdo não precisa de JavaScript.
 *
 * ## As duas variantes
 *
 * A diferença entre elas é **uma só**: quem carrega visualmente o nome do
 * Observatório.
 *
 * - `wordmark` — a marca oficial é o elemento visual principal. Aproxima-se ao
 *   máximo da identidade existente sem inventar fonte, porque usa o próprio
 *   vetor.
 * - `tipografia` — o nome é construído em Archivo, e a marca oficial aparece
 *   menor, ao lado. Não finge que Archivo é a fonte da logo: são coisas
 *   declaradamente diferentes, convivendo.
 *
 * Tudo o mais é idêntico: mesma fotografia, mesmos tokens, mesma hierarquia
 * institucional, mesma navegação. É o que torna a comparação honesta.
 *
 * ## O `h1` existe nas duas
 *
 * Na variante `wordmark`, o nome aparece visualmente como imagem — mas o `h1`
 * está no DOM, com o nome oficial por extenso, escondido visualmente e
 * disponível para leitor de tela e para busca. **Nome de instituição não pode
 * depender de imagem carregar.**
 *
 * ## Overlay
 *
 * Não é uma cor chapada. A fotografia tem luminância média em toda a altura —
 * medido: 0,40 a 0,45 —, então texto branco sobre ela reprova em qualquer
 * ponto. Mas escurecer o quadro inteiro por igual apagaria a fotografia, que é
 * documento.
 *
 * A solução é a que a instrução da H1 §13 autoriza: **gradiente**. Um véu
 * uniforme e discreto garante o piso de contraste; por cima dele, um gradiente
 * que adensa só onde o texto se assenta. A parte alta da fotografia — a copa,
 * o céu, as placas — continua legível como fotografia.
 */

export type VarianteDoHero = "wordmark" | "tipografia";

/** Nome oficial. Texto aprovado na Direção Visual §8.4; não se reescreve. */
const NOME_OFICIAL =
  "Observatório de Cultura e Economia Criativa da Região do Vale do Rio Real";

/** Autoria. Texto institucional da instrução da H1 §12. */
const AUTORIA = "Uma iniciativa do Coletivo Cultural “Tobias, sou Eu!”";

/**
 * Metadado da primeira dobra.
 *
 * Só o que é documentalmente sustentado. `SERGIPE / BRASIL` vem do recorte
 * territorial em `src/dados/territorio/recorte.ts`. **Não há data, não há
 * coordenada e não há contagem** — nada disso está confirmado para esta
 * fotografia, e metadado inventado num site de prestação de contas é
 * afirmação falsa (Direção Visual §1.6).
 */
const METADADO = "SERGIPE / BRASIL";

export function HeroManifesto({
  variante,
  id,
}: {
  variante: VarianteDoHero;
  id?: string;
}) {
  const tituloId = `hero-titulo-${variante}`;

  return (
    <section
      aria-labelledby={tituloId}
      className="relative isolate flex w-full flex-col justify-end overflow-hidden"
      id={id}
      style={{ minHeight: "92svh" }}
    >
      <FotografiaHero />

      {/*
        Duas camadas, e cada uma tem uma função distinta.

        A primeira é o véu uniforme: garante o piso de contraste em qualquer
        ponto do quadro, inclusive onde a fotografia é mais clara.

        A segunda adensa de baixo para cima, e só até a metade. É ela que
        sustenta o texto sem escurecer as placas nem a copa — a fotografia
        continua reconhecível, que é a prioridade da instrução §13.
      */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ backgroundColor: "var(--hero-veu)" }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to top, var(--hero-base) 0%, var(--hero-meio) 38%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 pt-24 pb-10 sm:gap-6 sm:pb-16">
        <p className="meta-ficha" style={{ color: "var(--hero-metadado)" }}>
          {METADADO}
        </p>

        {variante === "wordmark" ? (
          <>
            {/*
              A marca é o elemento visual; o `h1` continua existindo no DOM com
              o nome por extenso. `sr-only` não é atalho: é o que garante que
              leitor de tela e indexação recebam o nome mesmo que a imagem não
              carregue.
            */}
            <h1 className="sr-only" id={tituloId}>
              {NOME_OFICIAL}
            </h1>
            <img
              alt=""
              aria-hidden="true"
              className="h-auto w-full max-w-64 sm:max-w-md"
              height={MARCA_OBSERVATORIO.altura}
              src={`${CAMINHO_DAS_MARCAS}/${MARCA_OBSERVATORIO.arquivo}`}
              width={MARCA_OBSERVATORIO.largura}
            />
          </>
        ) : (
          <div className="flex flex-col gap-4">
            {/*
              A marca oficial vem **antes** do título, pequena, como assinatura
              de abertura. Depois dele ela competiria com o próprio nome que
              acabou de ser lido — duas vezes a mesma informação, uma embaixo da
              outra. Aqui ela assina e sai da frente.

              Ela não tenta imitar o lettering com Archivo: são declaradamente
              coisas diferentes, e é justamente essa diferença que a variante B
              coloca em avaliação.
            */}
            <img
              alt={MARCA_OBSERVATORIO.alt}
              className="h-auto w-32 sm:w-48"
              height={MARCA_OBSERVATORIO.altura}
              src={`${CAMINHO_DAS_MARCAS}/${MARCA_OBSERVATORIO.arquivo}`}
              width={MARCA_OBSERVATORIO.largura}
            />
            <h1
              className="max-w-3xl text-2xl sm:text-3xl lg:text-4xl"
              id={tituloId}
              style={{ color: "var(--hero-texto)" }}
            >
              {NOME_OFICIAL}
            </h1>
          </div>
        )}

        {/*
          Autoria do Coletivo: o nome por extenso, em Literata, com a marca
          oficial ao lado. O texto vem primeiro de propósito — o Coletivo é
          idealizador e realizador, não um selo de patrocínio, e por isso a
          autoria se lê como frase, não como régua de logos.
        */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <p
            className="text-lg"
            style={{
              color: "var(--hero-texto)",
              fontFamily: "var(--font-leitura)",
            }}
          >
            {AUTORIA}
          </p>
          <img
            alt={MARCA_COLETIVO.alt}
            className="h-auto w-20 sm:w-28"
            height={MARCA_COLETIVO.altura}
            src={`${CAMINHO_DAS_MARCAS}/${MARCA_COLETIVO.arquivo}`}
            width={MARCA_COLETIVO.largura}
          />
        </div>
      </div>
    </section>
  );
}
