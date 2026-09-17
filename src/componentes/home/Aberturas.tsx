import {
  ALT_DO_HERO,
  CAMINHO_PUBLICO,
  DERIVADOS_DO_HERO,
  LARGURA_DA_COMPOSICAO_HORIZONTAL,
} from "../../dados/hero/derivados";
import { RECORTE_TERRITORIAL } from "../../dados/territorio/recorte";
import {
  CTA_DA_PESQUISA,
  NOME_OFICIAL_EM_PARTES,
  NOTA_DA_FOTOGRAFIA,
  PROPOSTA_PROPOSITO,
} from "./abertura";
import { ENTREVISTAS, EQUIPAMENTOS } from "./conteudo";

/**
 * Abertura da Home.
 *
 * Server Component, sem estado: a página inteira é renderizada no servidor.
 * A fotografia ocupa toda a abertura; título, chamada e legenda compõem a
 * camada editorial sobre ela, em fluxo também no mobile.
 *
 * A composição das quatro explorações de abertura terminou com a B2 aprovada;
 * o seletor `?hero=` e as demais variantes saíram junto com o laboratório.
 */

const DESKTOP = DERIVADOS_DO_HERO.find((d) =>
  d.arquivo.includes("desktop"),
) as (typeof DERIVADOS_DO_HERO)[number];
const VERTICAL = DERIVADOS_DO_HERO.find((d) =>
  d.arquivo.includes("mobile"),
) as (typeof DERIVADOS_DO_HERO)[number];

const MUNICIPIOS_DO_VALE = RECORTE_TERRITORIAL.filter((m) =>
  m.relacoesTerritoriais.includes("vale-rio-real"),
).length;

function CtaDaPesquisa() {
  return (
    <a className="hl-botao hl-botao--cheio ab-botao" href="#hl-lugares">
      {CTA_DA_PESQUISA}
      <span aria-hidden="true">↓</span>
    </a>
  );
}

/* -------------------------------------------------------------------------- */

/** Síntese quantitativa após a apresentação institucional, fora da fotografia. */
export function FaixaDaPesquisa() {
  const provas = [
    {
      valor: EQUIPAMENTOS.length,
      rotulo: "equipamentos culturais acompanhados em Tobias Barreto",
    },
    { valor: ENTREVISTAS.length, rotulo: "entrevistas gravadas" },
    { valor: MUNICIPIOS_DO_VALE, rotulo: "municípios no recorte do Vale" },
  ];

  return (
    <section
      className="hl-faixa-pesquisa hl-quadro"
      aria-labelledby="hl-numeros-titulo"
      id="hl-numeros"
    >
      <h2 className="meta-ficha" id="hl-numeros-titulo">
        A pesquisa em números
      </h2>
      <ul
        className="hl-faixa-pesquisa__lista"
        aria-label="A pesquisa em números"
      >
        {provas.map((prova) => (
          <li key={prova.rotulo}>
            <strong>{prova.valor}</strong>
            <span>{prova.rotulo}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function AberturaB2() {
  return (
    <section
      aria-labelledby="ab-b2-titulo"
      className="ab-secao ab-b2"
      data-abertura="b2"
    >
      <figure className="ab-b2__foto">
        <picture>
          <source
            height={DESKTOP.altura}
            media={`(min-width: ${LARGURA_DA_COMPOSICAO_HORIZONTAL}px)`}
            srcSet={`${CAMINHO_PUBLICO}/${DESKTOP.arquivo}`}
            width={DESKTOP.largura}
          />
          <img
            alt={ALT_DO_HERO}
            decoding="async"
            fetchPriority="high"
            height={VERTICAL.altura}
            src={`${CAMINHO_PUBLICO}/${VERTICAL.arquivo}`}
            width={VERTICAL.largura}
          />
        </picture>
        <figcaption className="ab-b2__legenda">
          <span className="ab-b2__linha">
            <span className="ab-b2__legenda-titulo">
              {NOTA_DA_FOTOGRAFIA.titulo}
            </span>
            <span>{NOTA_DA_FOTOGRAFIA.conjunto}</span>
          </span>
          <span className="ab-b2__linha">
            <span>{NOTA_DA_FOTOGRAFIA.data}</span>
          </span>
        </figcaption>
      </figure>

      <div className="ab-b2__base">
        <div className="ab-b2__folha">
          <h1 className="ab-b2__titulo" id="ab-b2-titulo">
            <span className="ab-b2__t1">{NOME_OFICIAL_EM_PARTES[0]}</span>{" "}
            <span className="ab-b2__t2">{NOME_OFICIAL_EM_PARTES[1]}</span>{" "}
            <span className="ab-b2__t3">{NOME_OFICIAL_EM_PARTES[2]}</span>
          </h1>
          <p className="ab-b2__proposito">{PROPOSTA_PROPOSITO}</p>
          <div className="ab-cta">
            <CtaDaPesquisa />
          </div>
        </div>
      </div>
    </section>
  );
}
