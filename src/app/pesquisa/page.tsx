import type { Route } from "next";
import Link from "next/link";
import { entrevistasPublicas } from "../../componentes/home/conteudo";
import {
  ATOR_CHAVE,
  ENTREVISTAS,
  ESCUTA,
  ESCUTA_PUBLICA,
  ESCUTA_RESTRITA,
  FECHO,
  INDICADORES,
  INSTRUMENTOS,
  LEITURA,
  LIMITES,
  NOTA_DOS_MESES,
  OBJETIVO,
  PAPEIS,
  PERCURSO,
  PERIODO_DA_COLETA,
  SINTESE,
} from "../../componentes/pesquisa/conteudoDaPesquisa";
import { listarArquivosPorDocumento } from "../../dados/consultas/anexos";
import { exibirIndicador } from "../../dados/indicadores/formato";
import { REGISTROS_RESERVADOS } from "../../dados/indicadores/selecaoEditorial";
import {
  type IdDoLugarDeCampo,
  ROTULO_DO_ESTADO,
  resolverMateriaisDoLugar,
} from "../../dados/materiais-de-campo";
import {
  DERIVADOS_DOS_LUGARES,
  PASTA_PUBLICA_DA_PESQUISA,
} from "../../dados/pesquisa/derivados";
import { REFERENCIAS_TERRITORIAIS } from "../../dados/territorio/referencias";
import { metadadosDaRota } from "../../lib/site-url";
import "./pesquisa.css";

export const metadata = metadadosDaRota({
  pathname: "/pesquisa",
  titulo: "A Pesquisa — Observatório do Vale do Rio Real",
  descricao:
    "O percurso da primeira pesquisa do Observatório do Vale do Rio Real: " +
    "objetivo, recorte territorial, pesquisa de campo, entrevistas, " +
    "instrumentos de coleta, período e limites declarados.",
});

/**
 * `/pesquisa` — o percurso da investigação.
 *
 * ## A divisão de trabalho com `/observatorio`
 *
 * A página institucional responde quem é o Observatório, por que existe e o
 * que publica. Esta responde **o que foi investigado, como, onde, quando e
 * com que limites**. Os dois textos se cruzam uma vez, em ponte explícita, e
 * não repetem parágrafo.
 *
 * ## Composição
 *
 * Caderno de pesquisa: ficha técnica na abertura, percurso numerado num fio
 * vertical, fichas de instrumento lado a lado e uma lista de limites que tem o
 * mesmo peso tipográfico dos resultados — porque limite declarado é resultado.
 * Nada aqui reproduz a estrutura de capítulos da Home nem a margem de ficha de
 * `/observatorio`.
 *
 * ## Dados
 *
 * Server Component. O estado de cada material vem de `vw_anexo_publico`,
 * buscado em build pela mesma consulta que abastece a Home, o Território e o
 * Acervo. Sem `DATABASE_URL`, os materiais caem para o estado declarado e
 * nenhum link aparece — nunca um link inventado.
 */

const LUGARES_COM_MATERIAL = REFERENCIAS_TERRITORIAIS.map(
  (lugar) => lugar.id,
) satisfies readonly IdDoLugarDeCampo[];

/** Fotografia do manifesto, pelo nome do arquivo derivado. */
function fotoPor(arquivo: string) {
  return DERIVADOS_DOS_LUGARES.find((foto) => foto.arquivo === arquivo) ?? null;
}

/**
 * Prancha fotográfica do caderno.
 *
 * O crédito não é escrito aqui: vem do manifesto, que é a mesma fonte do
 * Acervo. Uma página não pode perder a atribuição que outra conhece.
 */
function Prancha({ arquivo, legenda }: { arquivo: string; legenda: string }) {
  const foto = fotoPor(arquivo);
  if (foto === null) return null;

  return (
    <figure className="pq-prancha">
      <img
        alt={foto.alt}
        decoding="async"
        height={foto.altura}
        loading="lazy"
        sizes="(min-width: 64rem) 22rem, 100vw"
        src={`${PASTA_PUBLICA_DA_PESQUISA}/${foto.arquivo}`}
        width={foto.largura}
      />
      <figcaption>
        <span>{legenda}</span>
        <span className="meta-ficha">{foto.local}</span>
        {foto.credito === null ? null : (
          <span className="meta-ficha">{foto.credito}</span>
        )}
      </figcaption>
    </figure>
  );
}

export default async function PaginaPesquisa() {
  const publicados = await listarArquivosPorDocumento();
  const publicas = entrevistasPublicas(publicados);
  const registrosDeFuncionamento = REGISTROS_RESERVADOS.find(
    (indicador) => indicador.id === "H4-006",
  );
  const contratacoes = REGISTROS_RESERVADOS.find(
    (indicador) => indicador.id === "H4-007",
  );

  const ficha = [
    {
      termo: "Objeto",
      valor:
        "Equipamentos turísticos e culturais em funcionamento, e a economia solidária ao redor deles",
    },
    { termo: "Período de coleta", valor: PERIODO_DA_COLETA },
    {
      termo: "Lugares em campo",
      valor: REFERENCIAS_TERRITORIAIS.map((lugar) => lugar.nome).join(" · "),
    },
    { termo: "Entrevistas gravadas", valor: `${ENTREVISTAS.length}` },
    ...(registrosDeFuncionamento === undefined
      ? []
      : [
          {
            termo: "Registros de funcionamento",
            valor: exibirIndicador(registrosDeFuncionamento),
          },
        ]),
    ...(contratacoes === undefined
      ? []
      : [
          {
            termo: "Contratações registradas",
            valor: exibirIndicador(contratacoes),
          },
        ]),
    {
      termo: "Indicadores auditados",
      valor: `${INDICADORES.length}`,
    },
    { termo: "Fonte", valor: "Levantamento próprio do Observatório" },
  ];

  return (
    <div className="pq">
      <header className="pq-abertura">
        <p className="meta-ficha">Primeira pesquisa do Observatório</p>
        <h1>A Pesquisa</h1>
        <p className="pq-abertura__sintese">{SINTESE}</p>

        <dl className="pq-ficha">
          {ficha.map((linha) => (
            <div key={linha.termo}>
              <dt>{linha.termo}</dt>
              <dd>{linha.valor}</dd>
            </div>
          ))}
        </dl>
        <p className="pq-abertura__nota">{NOTA_DOS_MESES}</p>
      </header>

      <section aria-labelledby="pq-objetivo-titulo" className="pq-secao">
        <h2 id="pq-objetivo-titulo">O que a pesquisa foi buscar</h2>
        <div className="pq-leitura">
          {OBJETIVO.map((paragrafo) => (
            <p key={paragrafo}>{paragrafo}</p>
          ))}
        </div>
        <p className="pq-ponte">
          O recorte territorial em que tudo isso acontece — cinco municípios do
          Vale, mais São Cristóvão como comparação — está desenhado no{" "}
          <Link href="/territorio" prefetch={false}>
            mapa interativo do Território
          </Link>
          .
        </p>
      </section>

      <section aria-labelledby="pq-metodo-titulo" className="pq-secao">
        <h2 id="pq-metodo-titulo">
          Como se observa um equipamento cultural por dentro
        </h2>
        <div className="pq-metodo">
          <div className="pq-leitura">
            <h3>A figura do ator-chave</h3>
            {ATOR_CHAVE.map((paragrafo) => (
              <p key={paragrafo}>{paragrafo}</p>
            ))}
          </div>
          {/*
            As duas pranchas desta página são fotografias sem pessoa
            identificável. Não é exigência do gate — as 59 fotografias de B01
            estão públicas no acervo, com revisão de privacidade concluída,
            e várias delas mostram a equipe em campo. É a mesma linha
            editorial que a Home já segue nas fichas dos lugares: no corpo das
            páginas entram o lugar e o acervo; as pessoas aparecem no acervo,
            onde cada arquivo tem ficha e procedência.
          */}
          <Prancha
            arquivo="borda-geladeira-discos.webp"
            legenda="Acervo de discos guardado no equipamento acompanhado"
          />
        </div>

        <div className="pq-papeis">
          <p className="meta-ficha">Papéis na pesquisa</p>
          <dl>
            {PAPEIS.map((papel) => (
              <div key={papel.papel}>
                <dt>{papel.papel}</dt>
                <dd>{papel.texto}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="pq-instrumentos">
          <p className="meta-ficha">Instrumentos de coleta</p>
          <ul>
            {INSTRUMENTOS.map((instrumento) => (
              <li className="pq-instrumento" key={instrumento.id}>
                <h3>{instrumento.nome}</h3>
                <dl>
                  <div>
                    <dt>Quem preenche</dt>
                    <dd>{instrumento.quemPreenche}</dd>
                  </div>
                  <div>
                    <dt>Quando</dt>
                    <dd>{instrumento.quando}</dd>
                  </div>
                </dl>
                <p className="meta-ficha">O que registra</p>
                <ul className="pq-instrumento__itens">
                  {instrumento.registra.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="pq-percurso-titulo" className="pq-secao">
        <h2 id="pq-percurso-titulo">O percurso, na ordem em que aconteceu</h2>
        <div className="pq-percurso">
          <ol className="pq-etapas">
            {PERCURSO.map((etapa) => (
              <li className="pq-etapa" key={etapa.numeral}>
                <p aria-hidden="true" className="numeral-ficha">
                  {etapa.numeral}
                </p>
                <h3>{etapa.titulo}</h3>
                {etapa.paragrafos.map((paragrafo) => (
                  <p key={paragrafo}>{paragrafo}</p>
                ))}
              </li>
            ))}
          </ol>
          <Prancha
            arquivo="recanto-interior-bodega.webp"
            legenda="Acervo exposto em um dos equipamentos acompanhados"
          />
        </div>
      </section>

      <section aria-labelledby="pq-escuta-titulo" className="pq-secao">
        <h2 id="pq-escuta-titulo">Quem a pesquisa ouviu</h2>
        <div className="pq-escuta">
          <div className="pq-leitura">
            <p>
              {/*
                Contagem e frase de estado vêm da resolução contra
                `vw_anexo_publico`, nunca de texto fixo: publicar "restrito"
                sobre documento já público, ou o contrário, é afirmação falsa
                num site de prestação de contas.
              */}
              {publicas.length === ENTREVISTAS.length
                ? `As ${ENTREVISTAS.length} entrevistas gravadas estão públicas no acervo, com áudio e transcrição.`
                : `São ${ENTREVISTAS.length} entrevistas gravadas; ${publicas.length} estão públicas no acervo, com áudio e transcrição.`}{" "}
              {publicas.length === 0 ? ESCUTA_RESTRITA : ESCUTA_PUBLICA}
            </p>
            {ESCUTA.map((paragrafo) => (
              <p key={paragrafo}>{paragrafo}</p>
            ))}
          </div>
          <ol aria-label="Entrevistas gravadas" className="pq-entrevistas">
            {ENTREVISTAS.map((entrevista) => {
              const publica = publicas.includes(entrevista);

              return (
                <li key={entrevista.numero}>
                  <span className="pq-entrevistas__n">{entrevista.numero}</span>
                  <span className="pq-entrevistas__onde">
                    {publica ? (
                      <Link
                        /* Mesmo padrão do Acervo para rota dinâmica com typedRoutes. */
                        href={`/acervo/${entrevista.documento}` as Route}
                        prefetch={false}
                      >
                        {entrevista.onde}
                      </Link>
                    ) : (
                      entrevista.onde
                    )}
                  </span>
                  <span className="meta-ficha">
                    {entrevista.municipio ?? "município não consolidado"}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section aria-labelledby="pq-leitura-titulo" className="pq-secao">
        <h2 id="pq-leitura-titulo">Como os dados foram lidos</h2>
        <div className="pq-leitura">
          {LEITURA.map((paragrafo) => (
            <p key={paragrafo}>{paragrafo}</p>
          ))}
        </div>
        <p className="pq-ponte">
          A leitura quantitativa publicada — o que o recurso movimentou e onde
          ele foi executado — está na{" "}
          <a href="/#hl-leitura">seção Onde o recurso circula</a>, na página
          inicial.
        </p>
      </section>

      <section aria-labelledby="pq-limites-titulo" className="pq-secao">
        <h2 id="pq-limites-titulo">Limites declarados</h2>
        <p className="pq-leitura">
          Nenhum deles foi descoberto depois. Todos estavam à vista durante a
          pesquisa, e é assim que entram no resultado.
        </p>
        <ul className="pq-limites">
          {LIMITES.map((limite) => (
            <li key={limite.titulo}>
              <h3>{limite.titulo}</h3>
              <p>{limite.texto}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="pq-materiais-titulo" className="pq-secao">
        <h2 id="pq-materiais-titulo">O que a pesquisa reuniu, lugar a lugar</h2>
        <div className="pq-leitura">
          {FECHO.map((paragrafo) => (
            <p key={paragrafo}>{paragrafo}</p>
          ))}
        </div>

        <ul className="pq-materiais">
          {LUGARES_COM_MATERIAL.map((id) => {
            const lugar = REFERENCIAS_TERRITORIAIS.find(
              (referencia) => referencia.id === id,
            );
            const materiais = resolverMateriaisDoLugar(id, publicados);
            const rotulo = `pq-materiais-${id}`;

            return (
              <li key={id}>
                <p className="meta-ficha">
                  {lugar?.localidade} · {lugar?.municipio}
                </p>
                <h3 id={rotulo}>{lugar?.nome}</h3>
                <ul aria-labelledby={rotulo} className="pq-material">
                  {materiais.map((item) => (
                    <li key={item.material}>
                      {item.href === null ? (
                        <span>{item.material}</span>
                      ) : (
                        <a href={item.href}>{item.material}</a>
                      )}
                      <span className="pq-estado" data-estado={item.estado}>
                        {ROTULO_DO_ESTADO[item.estado]}
                      </span>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>

        <p className="pq-acoes">
          <Link className="pq-botao" href="/acervo" prefetch={false}>
            Percorrer o acervo
          </Link>
          <Link
            className="pq-botao pq-botao--vazado"
            href="/prestacao-de-contas"
            prefetch={false}
          >
            Ver a Prestação de Contas
          </Link>
        </p>
      </section>

      <aside className="pq-ponte-final">
        <p className="meta-ficha">Quem faz</p>
        <p>
          Quem conduziu esta pesquisa, com que recurso e a quem presta contas
          está em{" "}
          <Link href="/observatorio" prefetch={false}>
            O Observatório
          </Link>
          . A pesquisa também é contada em áudio, com transcrição revisada, no{" "}
          <Link href="/podobservar" prefetch={false}>
            PodObservar
          </Link>
          .
        </p>
      </aside>
    </div>
  );
}
