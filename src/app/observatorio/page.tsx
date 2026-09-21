import type { Route } from "next";
import Link from "next/link";
import { LinkDeDestino } from "../../componentes/layout/LinkDeDestino";
import {
  ABERTURA_DO_TERRITORIO,
  EDITAL,
  EPISODIO_DA_ORIGEM,
  MUNICIPIOS_DE_COMPARACAO,
  MUNICIPIOS_DO_VALE,
  NOME_OFICIAL,
  O_QUE_FAZ,
  ORIGEM,
  PERMANENCIA,
  PRODUTOS,
  SINTESE,
  TERRITORIO,
  VINCULOS,
} from "../../componentes/observatorio/conteudo";
import {
  CAMINHO_DAS_MARCAS,
  MARCA_COLETIVO,
  SIMBOLO_OBSERVATORIO,
} from "../../dados/hero/derivados";
import { metadadosDaRota } from "../../lib/site-url";
import "./observatorio.css";

export const metadata = metadadosDaRota({
  pathname: "/observatorio",
  titulo: "O Observatório — Observatório do Vale do Rio Real",
  descricao:
    "O que é o Observatório de Cultura e Economia Criativa da Região do " +
    "Vale do Rio Real, por que ele foi criado, sua relação com o território " +
    "e com o Coletivo Cultural “Tobias, sou Eu!”, e o que ele publica.",
});

/**
 * `/observatorio` — a página institucional.
 *
 * ## A divisão de trabalho com `/pesquisa`
 *
 * Esta rota responde **quem é, por que existe e o que publica**. O percurso
 * da investigação — objetivo, método, campo, instrumentos e limites — é de
 * `/pesquisa`, e os dois textos não se repetem: aqui a pesquisa aparece uma
 * vez, como um dos produtos, com a ponte para a página que a detalha.
 *
 * ## Composição
 *
 * Coluna editorial de leitura corrida, com uma **margem de ficha** à esquerda
 * nas larguras de desktop: rótulo em mono de um lado, texto do outro, como
 * numa pasta de documentação. É a mesma família gráfica da Home — filete,
 * numeral, meta-ficha — sem repetir a estrutura de capítulos numerados dela.
 *
 * Server Component, sem consulta ao banco: todo o conteúdo é editorial ou
 * derivado da camada territorial versionada.
 */
export default function PaginaObservatorio() {
  return (
    <div className="obs">
      <header className="obs-abertura">
        <div aria-hidden="true" className="obs-abertura__tracado" />
        <div className="obs-abertura__interior">
          <p className="meta-ficha meta-ficha--inversa">
            Observatório de Cultura e Economia Criativa
          </p>
          <h1>O Observatório</h1>
          <p className="obs-abertura__sintese">{SINTESE}</p>
          <p className="obs-abertura__nome">{NOME_OFICIAL}</p>
        </div>
      </header>

      <div className="obs-corpo">
        <section aria-labelledby="obs-pratica-titulo" className="obs-secao">
          <p className="meta-ficha obs-secao__rotulo">O que é</p>
          <div className="obs-secao__corpo">
            <h2 id="obs-pratica-titulo">
              Um observatório é um jeito de olhar com método
            </h2>
            <p className="obs-guia">
              A palavra costuma sugerir telescópio, e o símbolo do projeto não
              desmente. Mas o que este Observatório observa são equipamentos
              culturais em funcionamento — e observá-los exige voltar muitas
              vezes ao mesmo lugar.
            </p>
            <dl className="obs-praticas">
              {O_QUE_FAZ.map((pratica) => (
                <div className="obs-pratica" key={pratica.verbo}>
                  <dt>{pratica.verbo}</dt>
                  <dd>{pratica.texto}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section aria-labelledby="obs-origem-titulo" className="obs-secao">
          <p className="meta-ficha obs-secao__rotulo">Origem</p>
          <div className="obs-secao__corpo">
            <h2 id="obs-origem-titulo">
              O Observatório não começou num edital
            </h2>
            <p className="obs-guia">
              Ele começou numa cidade do interior de Sergipe, dois anos antes, e
              chegou ao edital já com uma pergunta na mão.
            </p>
            <ol className="obs-origem">
              {ORIGEM.map((momento) => (
                <li className="obs-momento" key={momento.titulo}>
                  <p className="meta-ficha obs-momento__quando">
                    {momento.quando}
                  </p>
                  <h3>{momento.titulo}</h3>
                  {momento.paragrafos.map((paragrafo) => (
                    <p key={paragrafo}>{paragrafo}</p>
                  ))}
                </li>
              ))}
            </ol>
            <p className="obs-nota">
              A origem do Coletivo e do Observatório é contada por inteiro no
              primeiro episódio do PodObservar, com transcrição revisada.{" "}
              <Link
                /* Mesmo padrão do Acervo para rota dinâmica com typedRoutes. */
                href={`/podobservar/${EPISODIO_DA_ORIGEM}` as Route}
                prefetch={false}
              >
                Ouvir ou ler o EP01
              </Link>
              .
            </p>
          </div>
        </section>

        <section aria-labelledby="obs-coletivo-titulo" className="obs-secao">
          <p className="meta-ficha obs-secao__rotulo">Quem realiza</p>
          <div className="obs-secao__corpo">
            <h2 id="obs-coletivo-titulo">Três vínculos, e nenhum implícito</h2>
            <p className="obs-guia">
              Um projeto financiado por edital público responde a três perguntas
              antes de qualquer outra: quem faz, com que recurso e a quem presta
              contas.
            </p>
            <ol className="obs-vinculos">
              {VINCULOS.map((vinculo) => (
                <li className="obs-vinculo" key={vinculo.papel}>
                  <p className="meta-ficha">{vinculo.papel}</p>
                  {vinculo.papel === "Realização" ? (
                    <span className="obs-vinculo__selo">
                      <img
                        alt={MARCA_COLETIVO.alt}
                        decoding="async"
                        height={MARCA_COLETIVO.altura}
                        loading="lazy"
                        src={`${CAMINHO_DAS_MARCAS}/${MARCA_COLETIVO.arquivo}`}
                        width={MARCA_COLETIVO.largura}
                      />
                    </span>
                  ) : null}
                  <h3>{vinculo.nome}</h3>
                  <p>{vinculo.texto}</p>
                </li>
              ))}
            </ol>
            <p className="obs-nota">O nome completo do fomento é {EDITAL}.</p>
          </div>
        </section>

        <section aria-labelledby="obs-territorio-titulo" className="obs-secao">
          <p className="meta-ficha obs-secao__rotulo">Território</p>
          <div className="obs-secao__corpo">
            <h2 id="obs-territorio-titulo">
              O território que o Observatório escolheu olhar
            </h2>
            <p className="obs-definicao">{ABERTURA_DO_TERRITORIO}</p>
            {TERRITORIO.map((paragrafo) => (
              <p key={paragrafo}>{paragrafo}</p>
            ))}
            <div className="obs-recorte">
              <div>
                <p className="meta-ficha">Municípios do recorte, em Sergipe</p>
                <ul>
                  {MUNICIPIOS_DO_VALE.map((municipio) => (
                    <li key={municipio.codigoIbge}>{municipio.nome}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="meta-ficha">Referência de comparação</p>
                <ul>
                  {MUNICIPIOS_DE_COMPARACAO.map((municipio) => (
                    <li key={municipio.codigoIbge}>{municipio.nome}</li>
                  ))}
                </ul>
                <p className="obs-recorte__nota">
                  Dentro da pesquisa e fora do Vale: entrou como terceiro ponto
                  de comparação de políticas públicas de cultura.
                </p>
              </div>
            </div>
            <p className="obs-nota">
              <Link href="/territorio" prefetch={false}>
                Ver o recorte no mapa interativo
              </Link>
              , com os quatro lugares visitados em campo.
            </p>
          </div>
        </section>

        <section aria-labelledby="obs-produtos-titulo" className="obs-secao">
          <p className="meta-ficha obs-secao__rotulo">O que publicamos</p>
          <div className="obs-secao__corpo">
            <h2 id="obs-produtos-titulo">
              {PRODUTOS.length} entradas para o mesmo acervo
            </h2>
            <p className="obs-guia">
              As seções do site não são assuntos diferentes: são formas
              diferentes de chegar ao mesmo material. Quem prefere escutar
              começa pelo podcast; quem quer o documento vai direto ao acervo.
            </p>
            <ul className="obs-produtos">
              {PRODUTOS.map((produto) => (
                <li className="obs-produto" key={produto.id}>
                  <h3>{produto.nome}</h3>
                  <p>{produto.texto}</p>
                  <p className="obs-produto__acao">
                    <Link href={produto.href} prefetch={false}>
                      {produto.acao}
                    </Link>
                  </p>
                </li>
              ))}
            </ul>
            {/*
              Esta nota dizia que Dados e Diário de Campo ainda não tinham
              conteúdo. Deixou de ser verdade em 2026-09-20, e os dois entraram
              na lista acima. O que sobra de ausência declarada é o Caderno de
              Estudos, que é entregável administrativo e tem lugar próprio na
              Prestação de Contas — não é seção do site.
            */}
            <p className="obs-nota">
              As páginas institucionais curtas — acessibilidade, privacidade,
              contato — estão no rodapé de cada página. O que o projeto ainda
              não produziu é declarado como ausência na{" "}
              <Link href="/prestacao-de-contas" prefetch={false}>
                Prestação de Contas
              </Link>
              , nunca preenchido com conteúdo de ocasião.
            </p>
          </div>
        </section>

        <section
          aria-labelledby="obs-permanencia-titulo"
          className="obs-secao obs-secao--fecho"
        >
          <p className="meta-ficha obs-secao__rotulo">Memória e acesso</p>
          <div className="obs-secao__corpo">
            <h2 id="obs-permanencia-titulo">
              Publicar e guardar são a mesma tarefa
            </h2>
            {PERMANENCIA.map((paragrafo) => (
              <p key={paragrafo}>{paragrafo}</p>
            ))}
            <p className="obs-acoes">
              <Link
                className="obs-botao"
                href="/prestacao-de-contas"
                prefetch={false}
              >
                Abrir a Prestação de Contas
              </Link>
              <LinkDeDestino
                className="obs-botao obs-botao--vazado"
                href="/anexos.json"
              >
                anexos.json
              </LinkDeDestino>
            </p>
          </div>
        </section>
      </div>

      <aside className="obs-assinatura">
        <img
          alt=""
          decoding="async"
          height={SIMBOLO_OBSERVATORIO.altura}
          loading="lazy"
          src={`${CAMINHO_DAS_MARCAS}/${SIMBOLO_OBSERVATORIO.arquivo}`}
          width={SIMBOLO_OBSERVATORIO.largura}
        />
        <div>
          <p className="meta-ficha">Primeira pesquisa</p>
          <p>
            O percurso completo da investigação — objetivo, campo, instrumentos
            e limites — está em{" "}
            <Link href="/pesquisa" prefetch={false}>
              A Pesquisa
            </Link>
            .
          </p>
        </div>
      </aside>
    </div>
  );
}
