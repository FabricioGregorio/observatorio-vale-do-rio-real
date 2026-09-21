import type { Route } from "next";
import Link from "next/link";

import { Atividades } from "../../componentes/dados/Atividades";
import {
  ADVERTENCIA_DE_AMOSTRA,
  CONJUNTO_NO_ACERVO,
  DESPESA_IDENTIFICADA_NO_MUNICIPIO,
  DESPESA_IDENTIFICADA_TOTAL,
  FONTE_PUBLICA,
  FONTES_DESTACADAS,
  INDICADORES,
  LEITURA_DA_RETENCAO,
  LIMITES,
  NOTA_DA_SERIE,
  NOTA_DAS_ATIVIDADES,
  O_QUE_FOI_MEDIDO,
  PERIODO,
  RECORTE,
  RETENCAO_RECALCULADA,
  SINTESE,
} from "../../componentes/dados/conteudo";
import { FichaDoIndicador } from "../../componentes/dados/Indicadores";
import { SerieMensal } from "../../componentes/dados/SerieMensal";
import { LinkDeDestino } from "../../componentes/layout/LinkDeDestino";
import {
  type AnexoPublico,
  listarAnexosPublicos,
} from "../../dados/consultas/anexos";
import {
  formatarPercentual,
  formatarReais,
} from "../../dados/indicadores/formato";
import { metadadosDaRota } from "../../lib/site-url";
import "./dados.css";

export const metadata = metadadosDaRota({
  pathname: "/dados",
  titulo: "Dados — Observatório do Vale do Rio Real",
  descricao:
    "Os dados consolidados do Observatório do Vale do Rio Real: indicadores " +
    "auditados, série mensal, atividades registradas, limites declarados e " +
    "acesso às fontes públicas.",
});

/**
 * `/dados` — os dados consolidados como evidência documental.
 *
 * ## O que esta página é
 *
 * A superfície de consulta do levantamento: os oito indicadores auditados com
 * regra, base, período e recorte declarados; a série mensal; as atividades
 * registradas; os limites da leitura; e o acesso às fontes públicas. A Home
 * mostra o recorte editorial de um indicador — aqui está o conjunto.
 *
 * ## O que ela não faz
 *
 * Não estende a amostra. Dois equipamentos culturais de Tobias Barreto, cinco
 * meses, um período de baixa visitação: a advertência abre a página, e o
 * recorte volta em cada ficha de indicador, porque ele é o denominador da
 * leitura inteira.
 *
 * Não publica `procedencia` — aba, linha e código interno da fonte de cálculo
 * ficam fora do HTML, como manda o cabeçalho de `indicadores/derivados.ts`.
 *
 * Não desenha gráfico decorativo. As duas figuras — o dot plot da série e as
 * barras das atividades — respondem a perguntas que a tabela sozinha responde
 * pior, e as duas têm tabela equivalente, sempre no DOM.
 *
 * ## Dados
 *
 * Server Component. Os números vêm do dataset versionado; a lista de fontes
 * públicas é resolvida contra `vw_anexo_publico` em build, pela mesma consulta
 * da Sala do Avaliador. Sem `DATABASE_URL` a seção de fontes fica vazia e
 * declara isso — nenhum link é construído por convenção de nome.
 */

function tamanho(bytes: number): string {
  return bytes >= 1_000_000
    ? `${(bytes / 1_000_000).toFixed(1).replace(".", ",")} MB`
    : `${Math.round(bytes / 1000)} kB`;
}

const FORMATO: Readonly<Record<string, string>> = {
  "application/pdf": "PDF",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX",
};

function formatoDe(anexo: AnexoPublico): string {
  return FORMATO[anexo.mimeType] ?? anexo.mimeType;
}

export default async function PaginaDados() {
  const anexos = await listarAnexosPublicos();

  /*
    Resolução por rótulo exato. Rótulo que não existir no acervo não vira
    linha: é o mesmo fail-closed das fichas de material — sem registro, sem
    link.
  */
  const fontes = FONTES_DESTACADAS.flatMap((destaque) => {
    const anexo = anexos.find(
      (candidato) => candidato.rotuloArquivo === destaque.rotulo,
    );
    return anexo === undefined ? [] : [{ ...destaque, anexo }];
  });
  const licencas = [...new Set(fontes.map(({ anexo }) => anexo.licenca))];
  const licenca = licencas.length === 1 ? licencas[0] : null;

  const ficha = [
    { termo: "Período de coleta", valor: PERIODO },
    { termo: "Recorte", valor: RECORTE },
    { termo: "Indicadores auditados", valor: `${INDICADORES.length}` },
    { termo: "Fonte", valor: FONTE_PUBLICA },
    ...(licenca === null ? [] : [{ termo: "Licença", valor: licenca }]),
  ];

  return (
    <div className="dd">
      <header className="dd-abertura">
        <p className="meta-ficha">Dados da pesquisa</p>
        <h1>Dados</h1>
        <p className="dd-abertura__sintese">{SINTESE}</p>
        <p className="dd-advertencia">{ADVERTENCIA_DE_AMOSTRA}</p>
        <dl className="dd-ficha dd-ficha--capa">
          {ficha.map((linha) => (
            <div key={linha.termo}>
              <dt>{linha.termo}</dt>
              <dd>{linha.valor}</dd>
            </div>
          ))}
        </dl>
      </header>

      <nav aria-label="Nesta página" className="dd-indice">
        <a href="#dd-indicadores-titulo">Indicadores</a>
        <a href="#dd-serie-secao-titulo">Mês a mês</a>
        <a href="#dd-atividades-titulo">Atividades</a>
        <a href="#dd-fontes-titulo">Fontes</a>
      </nav>

      <section aria-labelledby="dd-medido-titulo" className="dd-secao">
        <h2 id="dd-medido-titulo">O que foi medido</h2>
        <div className="dd-leitura">
          {O_QUE_FOI_MEDIDO.map((paragrafo) => (
            <p key={paragrafo}>{paragrafo}</p>
          ))}
        </div>
        <p className="dd-ponte">
          Quem mantém cada equipamento é chamado, na pesquisa, de ator-chave — e
          é dele o registro que sustenta estas páginas. Por que o método foi
          desenhado assim, e o que isso implica, está em{" "}
          <Link href="/pesquisa" prefetch={false}>
            A Pesquisa
          </Link>
          .
        </p>
      </section>

      <section aria-labelledby="dd-indicadores-titulo" className="dd-secao">
        <h2 id="dd-indicadores-titulo">
          Os {INDICADORES.length} indicadores auditados
        </h2>
        <p className="dd-leitura">
          Cada um traz, no mesmo bloco, a regra de cálculo, a base sobre a qual
          foi apurado, o período e o recorte. Nenhum valor é apresentado sem o
          seu denominador.
        </p>
        <div className="dd-indicadores">
          {[
            "H4-001",
            "H4-003",
            "H4-004",
            "H4-002",
            "H4-005",
            "H4-006",
            "H4-007",
            "H4-008",
          ]
            .map((id) => INDICADORES.find((indicador) => indicador.id === id))
            .filter((indicador) => indicador !== undefined)
            .map((indicador) => (
              <FichaDoIndicador indicador={indicador} key={indicador.id} />
            ))}
        </div>
      </section>

      <section aria-labelledby="dd-retencao-titulo" className="dd-secao">
        <h2 id="dd-retencao-titulo">Onde a despesa foi executada</h2>
        <div className="dd-retencao">
          <div className="dd-leitura">
            {LEITURA_DA_RETENCAO.map((paragrafo) => (
              <p key={paragrafo}>{paragrafo}</p>
            ))}
          </div>
          {/*
            A fração é escrita como fração: as duas pontas aparecem em reais,
            e o percentual vem depois delas. Um percentual sozinho no topo da
            seção seria exatamente o KPI que esta página não é.
          */}
          <dl className="dd-fracao">
            <div>
              <dt>Executada dentro de Tobias Barreto</dt>
              <dd>{formatarReais(DESPESA_IDENTIFICADA_NO_MUNICIPIO)}</dd>
            </div>
            <div>
              <dt>Despesa com localidade e valor identificados</dt>
              <dd>{formatarReais(DESPESA_IDENTIFICADA_TOTAL)}</dd>
            </div>
            <div className="dd-fracao__resultado">
              <dt>Retenção municipal da despesa identificada</dt>
              <dd>{formatarPercentual(RETENCAO_RECALCULADA)}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section aria-labelledby="dd-serie-secao-titulo" className="dd-secao">
        <h2 id="dd-serie-secao-titulo">Mês a mês</h2>
        <SerieMensal />
        <p className="dd-nota">{NOTA_DA_SERIE}</p>
      </section>

      <section aria-labelledby="dd-atividades-titulo" className="dd-secao">
        <h2 id="dd-atividades-titulo">O que os equipamentos ofereceram</h2>
        <p className="dd-leitura">
          A contagem é de dias com a atividade registrada, e não de pessoas: um
          dia em que o equipamento abriu a trilha conta uma vez, tenha recebido
          uma pessoa ou vinte.
        </p>
        <Atividades />
        <p className="dd-nota">{NOTA_DAS_ATIVIDADES}</p>
      </section>

      <section aria-labelledby="dd-limites-titulo" className="dd-secao">
        <h2 id="dd-limites-titulo">O que estes dados não dizem</h2>
        <ul className="dd-limites">
          {LIMITES.map((limite) => (
            <li key={limite.titulo}>
              <h3>{limite.titulo}</h3>
              <p>{limite.texto}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="dd-fontes-titulo" className="dd-secao">
        <h2 id="dd-fontes-titulo">As fontes, abertas</h2>
        {fontes.length === 0 ? (
          <p className="dd-leitura">
            Nenhum arquivo do conjunto está listado aqui nesta versão da página.
            A ficha completa continua no acervo.
          </p>
        ) : (
          <>
            <p className="dd-leitura">
              Os arquivos que sustentam esta página estão publicados em endereço
              permanente, sem login e sem pedido de acesso. O hash SHA-256 de
              cada um está na Sala do Avaliador e em <code>/anexos.json</code>.
            </p>
            <ul className="dd-fontes">
              {fontes.map(({ rotulo, descricao, anexo }) => (
                <li key={rotulo}>
                  <LinkDeDestino href={anexo.linkPermanente}>
                    {anexo.rotuloArquivo ?? anexo.titulo}
                  </LinkDeDestino>
                  <p>{descricao}</p>
                  <p className="meta-ficha">
                    {formatoDe(anexo)} · {tamanho(anexo.bytes)} ·{" "}
                    {anexo.licenca}
                  </p>
                </li>
              ))}
            </ul>
          </>
        )}
        <p className="dd-ponte">
          O conjunto completo do anexo de indicadores, com todas as suas peças,
          tem ficha própria no{" "}
          <Link
            /* Mesmo padrão do Acervo para rota dinâmica com typedRoutes. */
            href={`/acervo/${CONJUNTO_NO_ACERVO}` as Route}
            prefetch={false}
          >
            acervo
          </Link>
          , e todos os anexos do projeto estão listados na{" "}
          <Link href="/prestacao-de-contas" prefetch={false}>
            Sala do Avaliador
          </Link>
          .
        </p>
      </section>

      <aside className="dd-ponte-final">
        <p className="meta-ficha">Onde estes dados foram colhidos</p>
        <p>
          O percurso que produziu estes registros — quem preencheu, com que
          instrumento e em que etapa do campo — está em{" "}
          <Link href="/pesquisa" prefetch={false}>
            A Pesquisa
          </Link>
          . Os dois equipamentos e os quatro lugares visitados estão desenhados
          no{" "}
          <Link href="/territorio" prefetch={false}>
            Território
          </Link>
          , e os relatórios técnicos, as fotografias e as entrevistas ficam no{" "}
          <Link href="/acervo" prefetch={false}>
            Acervo
          </Link>
          .
        </p>
      </aside>
    </div>
  );
}
