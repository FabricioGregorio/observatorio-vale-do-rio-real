import Link from "next/link";

import { TabelaAnexos } from "../../componentes/acervo/TabelaAnexos";
import { ReguaDeCreditos } from "../../componentes/institucional/ReguaDeCreditos";
import {
  ACOMPANHAMENTO,
  agruparPorTipo,
  COLETIVO,
  EDITAL,
  LINHA_DO_EDITAL,
  montarEntregas,
  NOME_OFICIAL,
  PENDENCIAS_DECLARADAS,
  PERIODO_DE_COLETA,
  POR_QUE,
  SINTESE,
} from "../../componentes/prestacao/conteudo";
import { listarAnexosPublicos } from "../../dados/consultas/anexos";
import { listarEpisodiosPublicos } from "../../dados/consultas/podobservar";
import { metadadosDaRota } from "../../lib/site-url";
import { urlDoZipDeAnexos } from "../../lib/zip-anexos";
import "./prestacao.css";

/**
 * Sala do Avaliador — a página mais importante do site (doc 01 §4).
 *
 * Tudo que a FUNCAP precisa em um lugar, sem login e sem link quebrado. É a
 * tradução para a web do PDF "Links de Referência", e resolve o risco técnico
 * nº 1 do projeto: endereços de Drive e Figma que quebram, mudam de permissão
 * e não sobrevivem a uma auditoria (doc 01 §0.2).
 *
 * ## O que mudou nesta rodada
 *
 * A página era a tabela de anexos e três links. A tabela continua sendo o
 * centro dela — é o que um avaliador abre primeiro —, mas ela agora chega
 * depois do que um leitor que não é o avaliador precisa para entender o que
 * está vendo: quem executou, com que recurso, em que período, o que foi
 * entregue e o que ainda falta.
 *
 * A decisão humana de 2026-09-17 é o que autoriza isso: o site voltou a ser
 * também peça de divulgação, e não só repositório. Uma página de comprovação
 * legível por quem não conhece o edital não conflita com rastreabilidade —
 * são os mesmos endereços permanentes, os mesmos hashes, a mesma tabela.
 *
 * ## Nada é digitado que possa ser contado
 *
 * Toda medida exibida sai da estrutura que a declara (`prestacao/conteudo.ts`).
 * A página não mantém a sua própria lista de números, de URLs, de títulos de
 * documento nem de estados públicos.
 *
 * Gerada em build. O banco não é consultado em tempo de requisição (ADR-001).
 */

export const metadata = metadadosDaRota({
  pathname: "/prestacao-de-contas",
  titulo: "Prestação de Contas — Sala do Avaliador",
  descricao:
    "A comprovação pública do Observatório do Vale do Rio Real: entregas, " +
    "documentos e evidências, com endereço permanente, data de publicação e " +
    "hash SHA-256 por arquivo.",
});

export default async function SalaDoAvaliador() {
  const [anexos, episodios] = await Promise.all([
    listarAnexosPublicos(),
    listarEpisodiosPublicos(),
  ]);

  const grupos = agruparPorTipo(anexos);
  const documentos = grupos.reduce((soma, g) => soma + g.documentos, 0);
  const entregas = montarEntregas({
    documentos,
    arquivos: anexos.length,
    episodios: episodios.length,
  });

  const zip = anexos.length > 0 ? urlDoZipDeAnexos() : null;

  const identificacao = [
    { termo: "Projeto", valor: NOME_OFICIAL },
    { termo: "Executor", valor: COLETIVO },
    { termo: "Fomento", valor: EDITAL },
    { termo: "Linha do edital", valor: LINHA_DO_EDITAL },
    { termo: "Prestação de contas", valor: ACOMPANHAMENTO },
    { termo: "Período de coleta em campo", valor: PERIODO_DE_COLETA },
  ];

  return (
    <div className="pc">
      <header className="pc-abertura">
        <p className="meta-ficha">Comprovação pública da execução</p>
        <h1>Prestação de Contas</h1>
        <p className="pc-abertura__sintese">{SINTESE}</p>
        {/*
          A identificação abre a página porque é a primeira pergunta de quem
          audita: de que projeto estamos falando, de quem é e sob qual edital.
          `dl` e não tabela — são pares termo/valor, não uma matriz.
        */}
        <dl className="pc-identificacao">
          {identificacao.map((linha) => (
            <div key={linha.termo}>
              <dt>{linha.termo}</dt>
              <dd>{linha.valor}</dd>
            </div>
          ))}
        </dl>
      </header>

      <section aria-labelledby="pc-porque-titulo" className="pc-secao">
        <p className="meta-ficha pc-secao__rotulo">
          Por que esta página existe
        </p>
        <div className="pc-secao__corpo">
          <h2 id="pc-porque-titulo">
            Comprovação que sobrevive a uma consulta futura
          </h2>
          <div className="pc-leitura">
            {POR_QUE.map((paragrafo) => (
              <p key={paragrafo}>{paragrafo}</p>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="pc-entregas-titulo" className="pc-secao">
        <p className="meta-ficha pc-secao__rotulo">Entregas</p>
        <div className="pc-secao__corpo">
          <h2 id="pc-entregas-titulo">O que foi entregue, e onde está</h2>
          <p className="pc-guia">
            Cada entrega abaixo tem uma superfície pública correspondente neste
            domínio. As medidas são derivadas do próprio registro de publicação:
            nenhuma delas é escrita à mão.
          </p>
          <ul className="pc-entregas">
            {entregas.map((entrega) => (
              <li className="pc-entrega" key={entrega.id}>
                <h3>{entrega.titulo}</h3>
                {entrega.medida === null ? null : (
                  <p className="meta-ficha pc-entrega__medida">
                    {entrega.medida}
                  </p>
                )}
                <p>{entrega.texto}</p>
                <p className="pc-entrega__acao">
                  <Link href={entrega.href} prefetch={false}>
                    {entrega.acao}
                  </Link>
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="pc-conjunto-titulo" className="pc-secao">
        <p className="meta-ficha pc-secao__rotulo">Documentos</p>
        <div className="pc-secao__corpo">
          <h2 id="pc-conjunto-titulo">O acervo, por natureza de documento</h2>
          {grupos.length === 0 ? (
            <p className="pc-leitura">
              Esta versão da página foi gerada sem acesso ao registro de
              publicação, e por isso o quadro por natureza não aparece. Falta o
              quadro, não os documentos: a lista oficial é a do site publicado.
            </p>
          ) : (
            <>
              <p className="pc-guia">
                A mesma lista da tabela ao fim da página, vista por natureza. Um
                documento pode ter muitos arquivos — o anexo de indicadores tem
                dezoito, o conjunto fotográfico tem dezenas.
              </p>
              <table className="pc-conjunto">
                <caption className="meta-ficha">
                  {documentos} documentos · {anexos.length} arquivos públicos
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Natureza</th>
                    <th scope="col">Documentos</th>
                    <th scope="col">Arquivos</th>
                  </tr>
                </thead>
                <tbody>
                  {grupos.map((grupo) => (
                    <tr key={grupo.tipo}>
                      <th scope="row">{grupo.tipo}</th>
                      <td>{grupo.documentos}</td>
                      <td>{grupo.arquivos}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </section>

      <section aria-labelledby="pc-pendencias-titulo" className="pc-secao">
        <p className="meta-ficha pc-secao__rotulo">Pendências</p>
        <div className="pc-secao__corpo">
          <h2 id="pc-pendencias-titulo">O que ainda não existe</h2>
          <p className="pc-guia">
            Os itens abaixo ainda não têm arquivo disponível. Quando houver
            material publicado, o acesso aparecerá nesta página.
          </p>
          <dl className="pc-pendencias">
            {PENDENCIAS_DECLARADAS.map((pendencia) => (
              <div key={pendencia.item}>
                <dt>{pendencia.item}</dt>
                <dd>{pendencia.texto}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section
        aria-labelledby="pc-evidencias-titulo"
        className="pc-secao pc-secao--larga"
      >
        <p className="meta-ficha pc-secao__rotulo">Evidências</p>
        <div className="pc-secao__corpo">
          <h2 id="pc-evidencias-titulo">
            Todos os anexos, com hash e endereço permanente
          </h2>
          <p className="pc-guia">
            Endereço permanente neste domínio, data de publicação e hash SHA-256
            para conferência de integridade. Sem login, sem pedido de permissão.
          </p>

          <nav aria-label="Formatos da Sala do Avaliador">
            <ul className="pc-recursos">
              {/*
                Enquanto o pacote não estiver publicado e declarado, o item não
                existe — nem como link, nem como aviso. Oferecer o download de
                um objeto que responde 404 é o oposto do que a Sala do Avaliador
                existe para fazer (doc 01 §0.2).
              */}
              {zip ? (
                <li>
                  <a href={zip}>Baixar tudo (.zip)</a>
                </li>
              ) : null}
              <li>
                <a href="/anexos.json">
                  <code>/anexos.json</code> — versão legível por máquina
                </a>
              </li>
              <li>
                <Link href="/prestacao-de-contas/imprimir" prefetch={false}>
                  Versão imprimível
                </Link>
              </li>
            </ul>
          </nav>

          <TabelaAnexos anexos={anexos} />
        </div>
      </section>

      <section aria-labelledby="pc-creditos-titulo" className="pc-secao">
        <p className="meta-ficha pc-secao__rotulo">Créditos</p>
        <div className="pc-secao__corpo">
          <h2 id="pc-creditos-titulo">Quem financia, apoia e acompanha</h2>
          {/*
            Mesma régua do rodapé, mesma fonte de verdade — entidades, rótulos,
            ordem e ativos saem de `institucional/creditos.ts`. O que muda aqui
            é só a escala: numa página de comprovação, a régua de marcas é
            parte do que se comprova.
          */}
          <div className="pc-painel-marcas">
            <ReguaDeCreditos destaque />
          </div>
        </div>
      </section>
    </div>
  );
}
