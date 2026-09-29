import type { Route } from "next";
import Link from "next/link";
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
import { ActionLink } from "../../componentes/ui/ActionLink";
import {
  CAMINHO_DAS_MARCAS,
  MARCA_COLETIVO,
  SIMBOLO_OBSERVATORIO,
} from "../../dados/hero/derivados";
import { metadadosDaRota } from "../../lib/site-url";
import { FotografiaDoObservatorio } from "./FotografiaDoObservatorio";
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
 * Atlas de uma presença: identidade, território, prática e arquivo.
 * Conteúdo factual na fonte editorial existente; composição restrita à rota.
 * Server Component, sem estado, consulta ao banco ou JavaScript de animação.
 * O método detalhado continua em /pesquisa, com a ponte no final da leitura.
 */
export default function PaginaObservatorio() {
  return (
    <div className="obs">
      <header className="obs-abertura obs-margens">
        <div className="obs-abertura__registro">
          <p className="meta-ficha">Cultura e economia criativa</p>
          <p className="meta-ficha">Vale do Rio Real</p>
        </div>
        <h1>
          <span className="obs-abertura__artigo">O </span>Observatório
        </h1>
        <div className="obs-abertura__paisagem">
          <FotografiaDoObservatorio
            abertura
            arquivo="serra-dos-macacos-serras-e-nuvens.webp"
          />
          <div aria-hidden="true" className="obs-abertura__margem">
            Território / observação / memória
          </div>
        </div>
        <div className="obs-abertura__nota">
          <p className="obs-abertura__sintese">{SINTESE}</p>
          <p className="meta-ficha obs-abertura__nome">{NOME_OFICIAL}</p>
          <ActionLink variant="text" href="#obs-territorio">
            Percorrer o Observatório
          </ActionLink>
        </div>
      </header>

      <section
        aria-labelledby="obs-territorio-titulo"
        className="obs-territorio"
        id="obs-territorio"
      >
        <div className="obs-margens">
          <p className="obs-capitulo meta-ficha">
            <span>01</span> O território
          </p>
          <div className="obs-territorio__cabeca">
            <h2 id="obs-territorio-titulo">
              O território que o Observatório escolheu olhar
            </h2>
            <p className="obs-definicao">{ABERTURA_DO_TERRITORIO}</p>
          </div>
          <div className="obs-territorio__miolo">
            <div className="obs-texto">
              {TERRITORIO.map((paragrafo) => (
                <p key={paragrafo}>{paragrafo}</p>
              ))}
              <p className="obs-territorio__acao">
                <ActionLink variant="text" href="/territorio">
                  Ver o recorte no mapa interativo
                </ActionLink>
                <span>Com os quatro lugares visitados em campo.</span>
              </p>
            </div>
            <div className="obs-recorte">
              <p className="meta-ficha">Municípios do recorte, em Sergipe</p>
              <ul className="obs-recorte__lugares">
                {MUNICIPIOS_DO_VALE.map((municipio) => (
                  <li key={municipio.codigoIbge}>{municipio.nome}</li>
                ))}
              </ul>
              <div className="obs-recorte__comparacao">
                <p className="meta-ficha">Referência de comparação</p>
                <ul>
                  {MUNICIPIOS_DE_COMPARACAO.map((municipio) => (
                    <li key={municipio.codigoIbge}>{municipio.nome}</li>
                  ))}
                </ul>
                <p>
                  Dentro da pesquisa e fora do Vale: entrou como terceiro ponto
                  de comparação de políticas públicas de cultura.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="obs-pratica-titulo"
        className="obs-pratica-secao obs-margens obs-capitulo-espaco"
      >
        <p className="obs-capitulo meta-ficha">
          <span>02</span> O que é / o que faz
        </p>
        <div className="obs-pratica-secao__cabeca">
          <h2 id="obs-pratica-titulo">
            Um observatório é um jeito de olhar com método
          </h2>
          <p className="obs-guia">
            A palavra costuma sugerir telescópio, e o símbolo do projeto não
            desmente. Mas o que este Observatório observa são equipamentos
            culturais em funcionamento — e observá-los exige voltar muitas vezes
            ao mesmo lugar.
          </p>
        </div>
        <div className="obs-pratica-secao__miolo">
          <FotografiaDoObservatorio arquivo="borda-conversa-oviedo-neide.webp" />
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

      <section
        aria-labelledby="obs-origem-titulo"
        className="obs-origem-secao obs-margens obs-capitulo-espaco"
      >
        <p className="obs-capitulo meta-ficha">
          <span>03</span> A origem
        </p>
        <div className="obs-origem-secao__cabeca">
          <h2 id="obs-origem-titulo">O Observatório não começou num edital</h2>
          <p className="obs-guia">
            Ele começou numa cidade do interior de Sergipe, dois anos antes, e
            chegou ao edital já com uma pergunta na mão.
          </p>
        </div>
        <ol className="obs-origem">
          {ORIGEM.map((momento) => (
            <li className="obs-momento" key={momento.titulo}>
              <p className="obs-momento__quando">{momento.quando}</p>
              <div>
                <h3>{momento.titulo}</h3>
                {momento.paragrafos.map((paragrafo) => (
                  <p key={paragrafo}>{paragrafo}</p>
                ))}
              </div>
            </li>
          ))}
        </ol>
        <p className="obs-nota obs-origem__nota">
          A origem do Coletivo e do Observatório é contada por inteiro no
          primeiro episódio do PodObservar, com transcrição revisada.{" "}
          <Link
            href={`/podobservar/${EPISODIO_DA_ORIGEM}` as Route}
            prefetch={false}
          >
            Ouvir ou ler o EP01
          </Link>
          .
        </p>
      </section>

      <section
        aria-labelledby="obs-produtos-titulo"
        className="obs-publicacoes"
      >
        <div className="obs-margens obs-capitulo-espaco">
          <p className="obs-capitulo meta-ficha">
            <span>04</span> O que publicamos
          </p>
          <div className="obs-publicacoes__cabeca">
            <h2 id="obs-produtos-titulo">
              {PRODUTOS.length} entradas para o mesmo acervo
            </h2>
            <p className="obs-guia">
              As seções do site não são assuntos diferentes: são formas
              diferentes de chegar ao mesmo material. Quem prefere escutar
              começa pelo podcast; quem quer o documento vai direto ao acervo.
            </p>
          </div>
          <ul className="obs-produtos">
            {PRODUTOS.map((produto, indice) => (
              <li
                className={`obs-produto obs-produto--${produto.id}`}
                key={produto.id}
              >
                <span aria-hidden="true" className="obs-produto__numero">
                  {String(indice + 1).padStart(2, "0")}
                </span>
                <h3>{produto.nome}</h3>
                <p>{produto.texto}</p>
                <div className="obs-produto__acao">
                  <ActionLink variant="text" href={produto.href}>
                    {produto.acao}
                  </ActionLink>
                </div>
              </li>
            ))}
          </ul>
          <p className="obs-nota">
            As páginas de Privacidade e Contato estão no rodapé. A Central de
            Acessibilidade fica no cabeçalho de cada página. O que o projeto
            ainda não produziu não aparece aqui como seção nem é preenchido com
            conteúdo de ocasião.
          </p>
        </div>
      </section>

      <section
        aria-labelledby="obs-coletivo-titulo"
        className="obs-vinculos-secao obs-margens obs-capitulo-espaco"
      >
        <p className="obs-capitulo meta-ficha">
          <span>05</span> Quem realiza
        </p>
        <div className="obs-vinculos-secao__cabeca">
          <h2 id="obs-coletivo-titulo">Três vínculos, e nenhum implícito</h2>
          <p className="obs-guia">
            Um projeto financiado por edital público responde a três perguntas
            antes de qualquer outra: quem faz, com que recurso e a quem presta
            contas.
          </p>
        </div>
        <ol className="obs-vinculos">
          {VINCULOS.map((vinculo) => (
            <li className="obs-vinculo" key={vinculo.papel}>
              <p className="meta-ficha">{vinculo.papel}</p>
              <div className="obs-vinculo__identidade">
                {vinculo.papel === "Realização" ? (
                  <img
                    alt={MARCA_COLETIVO.alt}
                    decoding="async"
                    height={MARCA_COLETIVO.altura}
                    loading="lazy"
                    src={`${CAMINHO_DAS_MARCAS}/${MARCA_COLETIVO.arquivo}`}
                    width={MARCA_COLETIVO.largura}
                  />
                ) : null}
                <h3>{vinculo.nome}</h3>
              </div>
              <p>{vinculo.texto}</p>
            </li>
          ))}
        </ol>
        <p className="obs-nota">O nome completo do fomento é {EDITAL}.</p>
      </section>

      <section
        aria-labelledby="obs-permanencia-titulo"
        className="obs-permanencia"
      >
        <div className="obs-margens obs-capitulo-espaco">
          <p className="obs-capitulo meta-ficha">
            <span>06</span> Memória e acesso
          </p>
          <div className="obs-permanencia__miolo">
            <h2 id="obs-permanencia-titulo">
              Publicar e guardar são a mesma tarefa
            </h2>
            <div className="obs-texto">
              {PERMANENCIA.map((paragrafo) => (
                <p key={paragrafo}>{paragrafo}</p>
              ))}
              <ActionLink variant="primary" href="/acervo">
                Ver o Acervo
              </ActionLink>
            </div>
          </div>
        </div>
      </section>

      <aside className="obs-assinatura obs-margens">
        <img
          alt=""
          decoding="async"
          height={SIMBOLO_OBSERVATORIO.altura}
          loading="lazy"
          src={`${CAMINHO_DAS_MARCAS}/${SIMBOLO_OBSERVATORIO.arquivo}`}
          width={SIMBOLO_OBSERVATORIO.largura}
        />
        <div>
          <p className="meta-ficha">Continuar explorando / Primeira pesquisa</p>
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
