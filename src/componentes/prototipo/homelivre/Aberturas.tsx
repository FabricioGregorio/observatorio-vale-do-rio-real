import Link from "next/link";

import {
  ALT_DO_HERO,
  CAMINHO_DAS_MARCAS,
  CAMINHO_PUBLICO,
  DERIVADOS_DO_HERO,
  LARGURA_DA_COMPOSICAO_HORIZONTAL,
  MARCA_COLETIVO,
} from "../../../dados/hero/derivados";
import { RECORTE_TERRITORIAL } from "../../../dados/territorio/recorte";
import {
  CTA_DA_PESQUISA,
  FONTES_DA_B2,
  FONTES_DAS_VARIACOES,
  INICIATIVA,
  NOME_CURTO,
  NOME_OFICIAL_EM_PARTES,
  NOTA_DA_FOTOGRAFIA,
  PROPOSTA_DESCRITOR,
  PROPOSTA_LEDE,
  PROPOSTA_PROPOSITO,
  ROTULO_DA_VARIANTE,
  SUMARIO,
  TERRITORIO,
  VARIANTES_DA_ABERTURA,
  type VarianteDaAbertura,
} from "./abertura";
import {
  COLETIVO,
  EDITAL_CURTO,
  ENTREVISTAS,
  EQUIPAMENTOS,
  NOME_OFICIAL,
} from "./conteudo";
import { Fontes } from "./Estrutura";
import { FragmentoDoVale } from "./FragmentoDoVale";

/**
 * Três variações da abertura do experimento. Server Components, sem estado:
 * a variação chega pela URL e a página inteira é renderizada no servidor.
 *
 * As três usam os mesmos fatos e as mesmas propostas de texto. O que muda é a
 * hierarquia, a relação entre fotografia e tipografia, e o lugar da
 * Prestação de Contas:
 *
 * - A mantém um link discreto;
 * - B tira a Prestação de Contas da abertura (o topo e a seção VII continuam);
 * - C a leva para o sumário, como capítulo da página.
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

/* -------------------------------------------------------------------------- */

/** Seletor DEV. Links simples: nenhuma ilha cliente. */
export function SeletorDeAbertura({ ativa }: { ativa: VarianteDaAbertura }) {
  return (
    <nav aria-label="Variações da abertura (DEV)" className="ab-seletor">
      <span>Abertura em teste</span>
      <ul>
        {VARIANTES_DA_ABERTURA.map((variante) => (
          <li key={variante}>
            <a
              aria-current={variante === ativa ? "page" : undefined}
              href={`/dev/home-livre?hero=${variante}`}
            >
              {ROTULO_DA_VARIANTE[variante]}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/* -------------------------------------------------------------------------- */

function NotaDaFotografia({ className }: { className?: string }) {
  return (
    <span className={className ? `ab-nota ${className}` : "ab-nota"}>
      <strong>{NOTA_DA_FOTOGRAFIA.titulo}</strong>
      <span className="ab-nota__meta">
        {NOTA_DA_FOTOGRAFIA.conjunto} · {NOTA_DA_FOTOGRAFIA.data}
      </span>
      <span className="ab-nota__pendente">{NOTA_DA_FOTOGRAFIA.pendente}</span>
    </span>
  );
}

/** Assinatura em linha: realização → fomento → território. */
function Assinatura({ className }: { className?: string }) {
  return (
    <p className={className ? `ab-assinatura ${className}` : "ab-assinatura"}>
      <span>
        {INICIATIVA} {COLETIVO}
      </span>
      <span aria-hidden="true" className="ab-seta">
        →
      </span>
      <span>
        <span className="sr-only">Fomento: </span>
        {EDITAL_CURTO}
      </span>
      <span aria-hidden="true" className="ab-seta">
        →
      </span>
      <span>
        <span className="sr-only">Território: </span>
        {TERRITORIO}
      </span>
    </p>
  );
}

function CtaDaPesquisa() {
  return (
    <a className="hl-botao hl-botao--cheio ab-botao" href="#hl-lugares">
      {CTA_DA_PESQUISA}
      <span aria-hidden="true">↓</span>
    </a>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * B2 — refinamento da B (rodada 3).
 *
 * Mesmos fatos, mesma hierarquia de título e mesma ausência de véu. O que muda
 * é o encaixe: a folha deixa de ser cartão sobre a foto e passa a ser o próprio
 * papel da página recortando a fotografia desde a borda esquerda da janela. A
 * legenda sai de cima da imagem e vira linha documental logo abaixo dela. As
 * contagens diminuem para prova rápida, e o parágrafo de apoio sai.
 */
export function AberturaB2() {
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
            <span className="ab-nota__pendente">
              {NOTA_DA_FOTOGRAFIA.pendente}
            </span>
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

        <div className="ab-b2__lado">
          <ul aria-label="A pesquisa em números" className="ab-b2__provas">
            {provas.map((p) => (
              <li key={p.rotulo}>
                <strong>{p.valor}</strong>
                <span>{p.rotulo}</span>
              </li>
            ))}
          </ul>
          <Assinatura className="ab-b2__assinatura" />
        </div>
      </div>

      <div className="hl-quadro">
        <Fontes itens={FONTES_DA_B2} />
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * A — Editorial institucional.
 *
 * Nome curto em escala protagonista; nome oficial logo abaixo, como linha
 * institucional. A fotografia sangra até a borda direita da janela e a nota
 * documental avança sobre a grade do texto. Origem cabe numa assinatura.
 */
export function AberturaA() {
  return (
    <section
      aria-labelledby="ab-a-titulo"
      className="ab-secao ab-a"
      data-abertura="a"
    >
      <div className="ab-a__cab">
        <p className="meta-ficha">{PROPOSTA_DESCRITOR}</p>
        <h1 className="ab-a__titulo" id="ab-a-titulo">
          {NOME_CURTO}
        </h1>
        <p className="ab-a__oficial">
          <span className="meta-ficha">Nome oficial</span>
          <span>{NOME_OFICIAL}</span>
        </p>
      </div>

      <figure className="ab-a__foto">
        <img
          alt={ALT_DO_HERO}
          decoding="async"
          fetchPriority="high"
          height={VERTICAL.altura}
          src={`${CAMINHO_PUBLICO}/${VERTICAL.arquivo}`}
          width={VERTICAL.largura}
        />
        <figcaption>
          <NotaDaFotografia />
        </figcaption>
      </figure>

      <div className="ab-a__texto">
        <p className="ab-a__proposito">{PROPOSTA_PROPOSITO}</p>
        <div className="ab-cta">
          <CtaDaPesquisa />
          <Link
            className="ab-discreto"
            href="/prestacao-de-contas"
            prefetch={false}
          >
            ou confira a Prestação de Contas
          </Link>
        </div>
        <p className="ab-a__lede">{PROPOSTA_LEDE}</p>
        <div className="ab-a__assinatura">
          <span className="hl-selo ab-selo">
            <img
              alt={MARCA_COLETIVO.alt}
              height={MARCA_COLETIVO.altura}
              src={`${CAMINHO_DAS_MARCAS}/${MARCA_COLETIVO.arquivo}`}
              width={MARCA_COLETIVO.largura}
            />
          </span>
          <Assinatura />
        </div>
        <Fontes itens={FONTES_DAS_VARIACOES} />
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * B — Fotográfica/documental.
 *
 * A fotografia ocupa a largura da janela. O nome oficial, partido em
 * hierarquia, pousa sobre ela numa folha de papel — sem véu sobre a imagem.
 * Contagens derivadas dizem por que continuar. Sem Prestação de Contas aqui.
 */
export function AberturaB() {
  const contagens = [
    {
      valor: EQUIPAMENTOS.length,
      rotulo: "equipamentos culturais acompanhados em Tobias Barreto",
    },
    { valor: ENTREVISTAS.length, rotulo: "entrevistas gravadas" },
    { valor: MUNICIPIOS_DO_VALE, rotulo: "municípios no recorte do Vale" },
  ];

  return (
    <section
      aria-labelledby="ab-b-titulo"
      className="ab-secao ab-b"
      data-abertura="b"
    >
      <figure className="ab-b__foto">
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
        <figcaption className="hl-quadro ab-b__legenda">
          <NotaDaFotografia />
        </figcaption>
      </figure>

      <div className="hl-quadro ab-b__base">
        <div className="ab-b__folha">
          <h1 className="ab-b__titulo" id="ab-b-titulo">
            <span className="ab-b__t1">{NOME_OFICIAL_EM_PARTES[0]}</span>{" "}
            <span className="ab-b__t2">{NOME_OFICIAL_EM_PARTES[1]}</span>{" "}
            <span className="ab-b__t3">{NOME_OFICIAL_EM_PARTES[2]}</span>
          </h1>
          <p className="ab-b__proposito">{PROPOSTA_PROPOSITO}</p>
          <div className="ab-cta">
            <CtaDaPesquisa />
          </div>
        </div>

        <div className="ab-b__lado">
          <ul className="ab-contagens">
            {contagens.map((c) => (
              <li key={c.rotulo}>
                <strong>{c.valor}</strong>
                <span>{c.rotulo}</span>
              </li>
            ))}
          </ul>
          <p className="ab-b__lede">{PROPOSTA_LEDE}</p>
          <Assinatura />
        </div>
      </div>

      <div className="hl-quadro">
        <Fontes itens={FONTES_DAS_VARIACOES} />
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * C — Tipográfica/cartográfica.
 *
 * O território é letreiro; o nome oficial vive num cartucho, como título de
 * folha de mapa. O fragmento do recorte e a fotografia entram como provas, e
 * o sumário diz o que vem a seguir — Prestação de Contas incluída.
 */
export function AberturaC() {
  return (
    <section
      aria-labelledby="ab-c-titulo"
      className="ab-secao hl-quadro ab-c"
      data-abertura="c"
    >
      <p className="ab-c__regua">
        <span>Sergipe · Brasil</span>
        <span>{PROPOSTA_DESCRITOR}</span>
      </p>

      <p aria-hidden="true" className="ab-c__letreiro">
        <span>Vale do</span>
        <span>Rio Real</span>
      </p>

      <div className="ab-c__grade">
        <div className="ab-c__coluna">
          <div className="ab-c__cartucho">
            <p className="meta-ficha">Observatório · nome oficial</p>
            <h1 id="ab-c-titulo">{NOME_OFICIAL}</h1>
          </div>
          <p className="ab-c__proposito">{PROPOSTA_PROPOSITO}</p>
          <div className="ab-cta">
            <CtaDaPesquisa />
          </div>
          <dl className="ab-c__rota">
            <div>
              <dt>Realização</dt>
              <dd>{COLETIVO}</dd>
            </div>
            <div>
              <dt>Fomento</dt>
              <dd>{EDITAL_CURTO}</dd>
            </div>
            <div>
              <dt>Território</dt>
              <dd>{TERRITORIO}</dd>
            </div>
          </dl>
          <p className="ab-c__lede">{PROPOSTA_LEDE}</p>
        </div>

        <FragmentoDoVale />

        <div className="ab-c__coluna">
          <figure className="ab-c__prova">
            <img
              alt={ALT_DO_HERO}
              decoding="async"
              fetchPriority="high"
              height={VERTICAL.altura}
              src={`${CAMINHO_PUBLICO}/${VERTICAL.arquivo}`}
              width={VERTICAL.largura}
            />
            <figcaption>
              <NotaDaFotografia />
            </figcaption>
          </figure>
          <nav aria-label="Nesta página" className="ab-c__sumario">
            <p className="meta-ficha">Nesta página</p>
            <ol>
              {SUMARIO.map((item) => (
                <li key={item.href}>
                  <a href={item.href}>
                    <span className="ab-c__sumario-n">{item.numero}</span>
                    {item.rotulo}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>

      <Fontes itens={FONTES_DAS_VARIACOES} />
    </section>
  );
}
