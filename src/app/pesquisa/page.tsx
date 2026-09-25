import type { Route } from "next";
import Link from "next/link";
import { entrevistasPublicas } from "../../componentes/home/conteudo";
import {
  ATOR_CHAVE,
  agruparEntrevistas,
  CHAVE_DE_EVIDENCIAS,
  ENTREVISTAS,
  ESCUTA,
  ESCUTA_PUBLICA,
  ESCUTA_RESTRITA,
  type Evidencia,
  FECHO,
  INDICADORES,
  INDICE_DA_PESQUISA,
  INSTRUMENTOS,
  LEITURA,
  LIMITES,
  NOTA_DOS_MESES,
  OBJETIVO_DEPOIS_DA_PERGUNTA,
  PAPEIS,
  PERCURSO,
  PERGUNTA,
  PERIODO_DA_COLETA,
  SINTESE,
  type TipoDeEvidencia,
} from "../../componentes/pesquisa/conteudoDaPesquisa";
import { MarcaDeEvidencia } from "../../componentes/pesquisa/MarcaDeEvidencia";
import { ActionLink } from "../../componentes/ui/ActionLink";
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
import { listarArquivosPorDocumento } from "../../dados/publicado/anexos";
import { REFERENCIAS_TERRITORIAIS } from "../../dados/territorio/referencias";
import { metadadosDaRota } from "../../lib/site-url";
import "./pesquisa.css";

export const metadata = metadadosDaRota({
  pathname: "/pesquisa",
  titulo: "A Pesquisa — Observatório do Vale do Rio Real",
  descricao:
    "O percurso da primeira pesquisa do Observatório do Vale do Rio Real: " +
    "a pergunta de partida, os instrumentos de coleta, as quatro etapas de " +
    "campo, as entrevistas, o período e os limites declarados.",
});

/**
 * `/pesquisa` — o percurso da investigação.
 *
 * ## A divisão de trabalho com as páginas vizinhas
 *
 * `/observatorio` responde quem é o Observatório; `/territorio`, onde a
 * pesquisa esteve; `/dados`, o que os números dizem; `/campo`, o que ficou
 * registrado em fotografia. Esta responde **como o conhecimento foi
 * produzido** — com que pergunta, com que instrumentos, em que ordem e com
 * que limites.
 *
 * ## Composição: caderno de percurso
 *
 * A abertura é a pergunta, não a ficha: quem chega lê primeiro o que a
 * pesquisa foi saber, e só depois o expediente que a sustenta. O núcleo é o
 * percurso, um fio vertical em que cada etapa carrega, na margem, os lugares
 * que ela nomeia e a natureza da evidência que produziu — as mesmas quatro
 * marcas declaradas na chave logo acima. Uma etapa registra ausência de campo
 * e a mostra como ausência.
 *
 * Nada aqui repete a composição de `/dados` (medidas abertas, série mensal)
 * nem a de `/territorio` (carta com margem cartográfica). O vocabulário
 * comum são os tokens, o filete, o mono de metadado e a escala editorial.
 *
 * ## Dados
 *
 * Server Component. O estado de cada material e de cada entrevista vem de
 * `acervo.json`, lido em build pela mesma função que abastece a Home, o
 * Território e o Acervo. Material que não estiver no acervo publicado cai
 * para o estado declarado e nenhum link aparece — nunca um link inventado.
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
 * As duas fotografias da página explicam procedimento: uma mostra o interior
 * de um equipamento acompanhado — o que o registro diário observa —, a outra
 * mostra uma entrevista sendo gravada em campo. Nenhuma está aqui para
 * quebrar texto.
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
        sizes="(min-width: 48rem) 22rem, 100vw"
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

/** Marca e nome de uma evidência, sempre juntos. */
function SeloDeEvidencia({ evidencia }: { evidencia: Evidencia }) {
  return (
    <>
      <MarcaDeEvidencia tipo={evidencia.id} />
      <span>{evidencia.nome}</span>
    </>
  );
}

function evidenciaPor(id: TipoDeEvidencia): Evidencia {
  const encontrada = CHAVE_DE_EVIDENCIAS.find(
    (evidencia) => evidencia.id === id,
  );
  if (encontrada === undefined) {
    throw new Error(`Evidência sem entrada na chave: ${id}.`);
  }
  return encontrada;
}

export default async function PaginaPesquisa() {
  const publicados = await listarArquivosPorDocumento();
  const publicas = entrevistasPublicas(publicados);
  const registrosDeEscuta = agruparEntrevistas();

  /*
    O expediente só exibe indicador que o dataset já publica. Um número
    ausente some da linha em vez de virar traço: a régua desta página é a
    mesma das fichas de material.
  */
  const medidaDoIndicador = (id: string) => {
    const indicador = REGISTROS_RESERVADOS.find(
      (candidato) => candidato.id === id,
    );
    return indicador === undefined
      ? null
      : { titulo: indicador.titulo, valor: exibirIndicador(indicador) };
  };

  const registrosDeFuncionamento = medidaDoIndicador("H4-006");
  const contratacoes = medidaDoIndicador("H4-007");

  const expediente = [
    { termo: "Período de coleta", valor: PERIODO_DA_COLETA },
    {
      termo: "Objeto",
      valor:
        "Equipamentos turísticos e culturais em funcionamento, e a economia solidária ao redor deles",
    },
    {
      termo: "Lugares em campo",
      valor: REFERENCIAS_TERRITORIAIS.map((lugar) => lugar.nome).join(" · "),
    },
    { termo: "Fonte", valor: "Levantamento próprio do Observatório" },
  ];

  const medidas = [
    { termo: "Entrevistas gravadas", valor: `${ENTREVISTAS.length}` },
    { termo: "Instrumentos de coleta", valor: `${INSTRUMENTOS.length}` },
    ...(registrosDeFuncionamento === null
      ? []
      : [
          {
            termo: "Registros de funcionamento",
            valor: registrosDeFuncionamento.valor,
          },
        ]),
    ...(contratacoes === null
      ? []
      : [{ termo: "Contratações registradas", valor: contratacoes.valor }]),
    { termo: "Indicadores", valor: `${INDICADORES.length}` },
  ];

  return (
    <div className="pq">
      <header className="pq-abertura">
        <p className="meta-ficha pq-abertura__chamada">
          Primeira pesquisa do Observatório
        </p>
        <div className="pq-abertura__texto">
          <h1>A Pesquisa</h1>
          <p className="pq-abertura__sintese">{SINTESE}</p>
        </div>

        <div className="pq-pergunta">
          <p className="meta-ficha">A pergunta de partida</p>
          <p className="pq-pergunta__texto">{PERGUNTA}</p>
        </div>

        <dl className="pq-expediente">
          {expediente.map((linha) => (
            <div key={linha.termo}>
              <dt>{linha.termo}</dt>
              <dd>{linha.valor}</dd>
            </div>
          ))}
        </dl>

        <dl className="pq-medidas">
          {medidas.map((medida) => (
            <div key={medida.termo}>
              <dt>{medida.termo}</dt>
              <dd>{medida.valor}</dd>
            </div>
          ))}
        </dl>

        <p className="pq-abertura__nota">{NOTA_DOS_MESES}</p>
      </header>

      <nav aria-label="Partes da pesquisa" className="pq-indice">
        {INDICE_DA_PESQUISA.map((item) => (
          <a href={`#${item.alvo}`} key={item.alvo}>
            {item.rotulo}
          </a>
        ))}
      </nav>

      <section aria-labelledby="pq-objetivo-titulo" className="pq-secao">
        <h2 id="pq-objetivo-titulo">O que a pesquisa foi buscar</h2>
        <div className="pq-leitura">
          {OBJETIVO_DEPOIS_DA_PERGUNTA.map((paragrafo) => (
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
        </div>
      </section>

      <section aria-labelledby="pq-instrumentos-titulo" className="pq-secao">
        <h2 id="pq-instrumentos-titulo">Os instrumentos de coleta</h2>
        <p className="pq-leitura">
          A coleta se apoia em dois formulários. Um é preenchido por quem mantém
          o lugar aberto; o outro, por quem o visita. Os campos abaixo são os
          que cada um pede — nem mais, nem menos.
        </p>

        <ul className="pq-instrumentos">
          {INSTRUMENTOS.map((instrumento, indice) => {
            const rotulo = `pq-instrumento-${instrumento.id}`;
            const produzidos = instrumento.indicadores.flatMap((id) => {
              const medida = medidaDoIndicador(id);
              return medida === null ? [] : [{ id, ...medida }];
            });

            return (
              <li className="pq-instrumento" key={instrumento.id}>
                <p aria-hidden="true" className="pq-instrumento__ordem">
                  {`0${indice + 1}`}
                </p>
                <h3 id={rotulo}>{instrumento.nome}</h3>

                <dl className="pq-instrumento__ficha">
                  <div>
                    <dt>Quem preenche</dt>
                    <dd>{instrumento.quemPreenche}</dd>
                  </div>
                  <div>
                    <dt>Quando</dt>
                    <dd>{instrumento.quando}</dd>
                  </div>
                </dl>

                {/*
                  Os campos aparecem como campos: rótulo e a linha em branco
                  que o formulário de papel teria ao lado. A linha é desenho,
                  não dado — nenhuma resposta é exibida, e não há resposta
                  nenhuma guardada aqui.
                */}
                <p className="meta-ficha pq-instrumento__secao">
                  O que o formulário registra
                </p>
                <ul aria-labelledby={rotulo} className="pq-campos">
                  {instrumento.registra.map((campo) => (
                    <li key={campo}>
                      <span>{campo}</span>
                      <span aria-hidden="true" className="pq-campos__linha" />
                    </li>
                  ))}
                </ul>

                {instrumento.serventia === null ? null : (
                  <p className="pq-instrumento__nota">
                    {instrumento.serventia}
                  </p>
                )}

                {produzidos.length === 0 ? null : (
                  <>
                    <p className="meta-ficha pq-instrumento__secao">
                      O que este registro produziu
                    </p>
                    <dl className="pq-produzido">
                      {produzidos.map((medida) => (
                        <div key={medida.id}>
                          <dt>{medida.titulo}</dt>
                          <dd>{medida.valor}</dd>
                        </div>
                      ))}
                    </dl>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="pq-percurso-titulo" className="pq-secao">
        <h2 id="pq-percurso-titulo">O percurso, na ordem em que aconteceu</h2>
        <p className="pq-leitura">
          A pesquisa saiu de dois equipamentos culturais e atravessou quatro
          etapas. Cada uma registra os lugares que alcançou e a natureza do que
          ficou dela.
        </p>

        <div className="pq-chave">
          <p className="meta-ficha" id="pq-chave-titulo">
            Chave de evidências
          </p>
          <dl aria-labelledby="pq-chave-titulo">
            {CHAVE_DE_EVIDENCIAS.map((evidencia) => (
              <div key={evidencia.id}>
                <dt>
                  <SeloDeEvidencia evidencia={evidencia} />
                </dt>
                <dd>{evidencia.texto}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="pq-percurso">
          <ol className="pq-etapas">
            {PERCURSO.map((etapa) => (
              <li className="pq-etapa" key={etapa.numeral}>
                <p aria-hidden="true" className="pq-etapa__numeral">
                  {etapa.numeral}
                </p>
                <h3 className="pq-etapa__titulo">{etapa.titulo}</h3>

                <div className="pq-etapa__texto">
                  {etapa.paragrafos.map((paragrafo) => (
                    <p key={paragrafo}>{paragrafo}</p>
                  ))}
                  {etapa.semRegistro === null ? null : (
                    <p className="pq-etapa__ausencia">{etapa.semRegistro}</p>
                  )}
                  {etapa.numeral === "I" ? (
                    <Prancha
                      arquivo="recanto-interior-bodega.webp"
                      legenda="Acervo exposto em um dos equipamentos acompanhados"
                    />
                  ) : null}
                </div>

                <div className="pq-etapa__margem">
                  <div>
                    <p className="meta-ficha">Onde</p>
                    <ul className="pq-etapa__onde">
                      {etapa.onde.map((lugar) => (
                        <li key={lugar}>{lugar}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="meta-ficha">O que ficou</p>
                    <ul className="pq-etapa__evidencias">
                      {etapa.evidencias.map((id) => (
                        <li key={id}>
                          <SeloDeEvidencia evidencia={evidenciaPor(id)} />
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </li>
            ))}
          </ol>

          <div className="pq-fecho-do-percurso">
            <p className="meta-ficha">Da coleta à leitura</p>
            <p>
              O que as quatro etapas reuniram — registro diário, formulário do
              visitante, entrevista e trabalho de campo — passou a ser lido em
              conjunto. É a última parte do percurso, e a que produziu o que
              está publicado.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="pq-escuta-titulo" className="pq-secao">
        <h2 id="pq-escuta-titulo">Quem a pesquisa ouviu</h2>
        <div className="pq-escuta">
          <div className="pq-leitura">
            <p>
              {/*
                Contagem e frase de estado vêm da resolução contra o acervo
                publicado, nunca de texto fixo: publicar "restrito"
                sobre documento já público, ou o contrário, é afirmação falsa
                num site que existe para comprovar execução.
              */}
              {publicas.length === ENTREVISTAS.length
                ? `As ${ENTREVISTAS.length} entrevistas gravadas estão públicas no acervo, com áudio e transcrição.`
                : `São ${ENTREVISTAS.length} entrevistas gravadas; ${publicas.length} estão públicas no acervo, com áudio e transcrição.`}{" "}
              {publicas.length === 0 ? ESCUTA_RESTRITA : ESCUTA_PUBLICA}
            </p>
            {ESCUTA.map((paragrafo) => (
              <p key={paragrafo}>{paragrafo}</p>
            ))}
            <Prancha
              arquivo="borda-entrevista-campo.webp"
              legenda="Entrevista de campo no equipamento acompanhado"
            />
          </div>

          <div className="pq-registros">
            {registrosDeEscuta.map(({ registro, entrevistas }) => {
              const rotulo = `pq-registro-${registro.id}`;

              return (
                <div className="pq-registro" key={registro.id}>
                  <p className="meta-ficha">{entrevistas.length} entrevistas</p>
                  <h3 id={rotulo}>{registro.titulo}</h3>
                  <p className="pq-registro__texto">{registro.texto}</p>
                  <ol aria-labelledby={rotulo} className="pq-entrevistas">
                    {entrevistas.map((entrevista) => {
                      const publica = publicas.includes(entrevista);

                      return (
                        <li key={entrevista.numero}>
                          <span className="pq-entrevistas__n">
                            {entrevista.numero}
                          </span>
                          <span className="pq-entrevistas__onde">
                            {publica ? (
                              <Link
                                /* Mesmo padrão do Acervo para rota dinâmica com typedRoutes. */
                                href={
                                  `/acervo/${entrevista.documento}` as Route
                                }
                                prefetch={false}
                              >
                                {entrevista.onde}
                              </Link>
                            ) : (
                              entrevista.onde
                            )}
                          </span>
                          {entrevista.municipio === null ? null : (
                            <span className="meta-ficha">
                              {entrevista.municipio}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section aria-labelledby="pq-leitura-titulo" className="pq-secao">
        <h2 id="pq-leitura-titulo">
          Dados e escuta fazem parte da mesma pesquisa
        </h2>

        <div className="pq-cruzamento">
          <p className="meta-ficha" id="pq-cruzamento-titulo">
            O que se cruzou na leitura
          </p>
          <ul aria-labelledby="pq-cruzamento-titulo">
            {CHAVE_DE_EVIDENCIAS.map((evidencia) => (
              <li key={evidencia.id}>
                <SeloDeEvidencia evidencia={evidencia} />
              </li>
            ))}
          </ul>
        </div>

        <div className="pq-leitura">
          {LEITURA.map((paragrafo) => (
            <p key={paragrafo}>{paragrafo}</p>
          ))}
        </div>
        <p className="pq-ponte">
          A leitura quantitativa publicada — o que o recurso movimentou, onde a
          despesa foi executada e o que os números deliberadamente não dizem —
          está em{" "}
          <Link href="/dados" prefetch={false}>
            Dados
          </Link>
          .
        </p>
      </section>

      <section aria-labelledby="pq-limites-titulo" className="pq-secao">
        <h2 id="pq-limites-titulo">Limites declarados</h2>
        <p className="pq-leitura">
          Nenhum deles foi descoberto depois. Todos estavam à vista durante a
          pesquisa, e é assim que entram no resultado.
        </p>
        <ol className="pq-limites">
          {LIMITES.map((limite, indice) => (
            <li key={limite.titulo}>
              <p aria-hidden="true" className="pq-limites__ordem">
                {`0${indice + 1}`}
              </p>
              <h3>{limite.titulo}</h3>
              <p>{limite.texto}</p>
            </li>
          ))}
        </ol>
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
                        <ActionLink variant="document" href={item.href}>
                          {item.material}
                        </ActionLink>
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

        {/*
          A ação secundária daqui levava à Prestação de Contas. Com a consulta
          documental centralizada no Acervo, ela apontaria para o mesmo lugar
          que a ação primária ao lado — dois botões, um destino.
        */}
        <p className="pq-acoes">
          <ActionLink variant="primary" href="/acervo">
            Ver o Acervo
          </ActionLink>
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
          . As fotografias de cada visita estão no{" "}
          <Link href="/campo" prefetch={false}>
            Diário de Campo
          </Link>
          , e a pesquisa também é contada em áudio, com transcrição revisada, no{" "}
          <Link href="/podobservar" prefetch={false}>
            PodObservar
          </Link>
          .
        </p>
      </aside>
    </div>
  );
}
