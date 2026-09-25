import {
  ALT_DO_HERO,
  CAMINHO_PUBLICO,
  DERIVADO_MOBILE_DO_HERO,
  DERIVADOS_DESKTOP_DO_HERO,
  LARGURA_DA_COMPOSICAO_HORIZONTAL,
  SIZES_DESKTOP_DO_HERO,
  SRCSET_DESKTOP_DO_HERO,
} from "../../dados/hero/derivados";
import { MESES_DE_COLETA } from "../../dados/indicadores/derivados";
import { ActionLink } from "../ui/ActionLink";
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

/** As larguras desktop têm a mesma proporção; a primeira reserva a caixa. */
const DESKTOP =
  DERIVADOS_DESKTOP_DO_HERO[0] as (typeof DERIVADOS_DESKTOP_DO_HERO)[number];
const VERTICAL = DERIVADO_MOBILE_DO_HERO;

/**
 * O rótulo promete a área Pesquisa, e o destino é ela. Até 2026-09-25 o botão
 * descia para `#hl-lugares`, uma seção da própria Home: quem esperava o
 * percurso da investigação encontrava dois cards de lugar. O sinal de rota
 * sai do sistema de ações, que o deduz do `href`.
 */
function CtaDaPesquisa() {
  return (
    <ActionLink variant="primary" className="ab-botao" href="/pesquisa">
      {CTA_DA_PESQUISA}
    </ActionLink>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Síntese quantitativa após a apresentação institucional, fora da fotografia.
 *
 * Os três valores são derivados, nenhum é escrito aqui. `MESES_DE_COLETA` sai
 * das duas datas da coleta declaradas em `dados/indicadores/derivados.ts`, que
 * é o módulo que já era dono do período dos oito indicadores — a faixa não
 * abre uma segunda leitura da mesma fonte.
 *
 * O recorte do Vale saiu desta faixa por decisão editorial de 2026-09-17. Ele
 * continua apresentado onde é cartografia e não estatística: na nota do mapa,
 * no painel de leitura, na leitura em texto dos municípios e no catálogo de
 * produtos do capítulo VI.
 */
export function FaixaDaPesquisa() {
  const provas = [
    {
      valor: EQUIPAMENTOS.length,
      rotulo: "equipamentos culturais acompanhados em Tobias Barreto",
    },
    { valor: ENTREVISTAS.length, rotulo: "entrevistas gravadas" },
    { valor: MESES_DE_COLETA, rotulo: "meses de coleta de dados" },
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
            sizes={SIZES_DESKTOP_DO_HERO}
            srcSet={SRCSET_DESKTOP_DO_HERO}
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
