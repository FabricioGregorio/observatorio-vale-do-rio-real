import Link from "next/link";

import {
  PRIVACIDADE_ABERTURA,
  PRIVACIDADE_FRONTEIRAS,
  PRIVACIDADE_NAVEGACAO,
  PRIVACIDADE_PESQUISA,
  PRIVACIDADE_SINTESE,
} from "../../componentes/institucional/conteudo";
import {
  AberturaDocumental,
  Documento,
  ItemVerificavel,
  SecaoDocumental,
} from "../../componentes/institucional/Documento";
import { metadadosDaRota } from "../../lib/site-url";

export const metadata = metadadosDaRota({
  pathname: "/privacidade",
  titulo: "Privacidade — Observatório do Vale do Rio Real",
  descricao:
    "Este site não usa cookies e mede audiência de forma agregada, sem " +
    "identificar ninguém. O que ele guarda, o que ele não guarda e como o " +
    "material da pesquisa foi tratado.",
});

/**
 * `/privacidade` — o funcionamento real do site, e não um modelo.
 *
 * ## Por que não é uma política genérica
 *
 * A política de privacidade padrão descreve coleta de dados, base legal,
 * compartilhamento com parceiros e uso de cookies — e quase nada disso existe
 * aqui. Copiar o modelo produziria um documento que **afirma coisas falsas
 * sobre este site**, o que é pior do que não ter página nenhuma.
 *
 * Cada afirmação abaixo foi conferida no código que gera estas páginas:
 * nenhuma escrita de cookie, nenhum formulário, nenhum player incorporado, e
 * uma única chave de armazenamento local com a preferência de tema.
 *
 * ## A revisão de 2026-09-21 — medição de audiência
 *
 * Até esta data a página declarava "nenhuma medição de audiência". Deixou de
 * ser verdade quando o Vercel Web Analytics foi instrumentado no layout raiz
 * (ver `src/app/layout.tsx`), e a declaração foi corrigida no
 * mesmo commit que instrumentou — nunca depois.
 *
 * O que a página passou a dizer é o que o serviço documenta e nada além:
 * contagem agregada, sem cookie, sem identificador persistente, com o
 * visitante distinguido por um hash do próprio pedido descartado em 24 horas.
 * Não se afirma cidade, porque o painel do projeto é lido no nível de país;
 * não se afirma conformidade jurídica com a LGPD, porque isso é parecer, não
 * fato conferível no código.
 *
 * ## A divisão em quatro
 *
 * Navegação, fronteiras com terceiros, material da pesquisa e o que ainda
 * falta decidir. Misturar "o site não usa cookies" com "as entrevistas têm
 * consentimento verbal gravado" num bloco só faria as duas coisas parecerem
 * da mesma natureza, e elas não são.
 *
 * Server Component sem consulta ao banco.
 */
export default function PaginaPrivacidade() {
  return (
    <Documento>
      <AberturaDocumental
        rotulo="Privacidade e dados"
        sintese={PRIVACIDADE_SINTESE}
        titulo="Privacidade"
      >
        <p className="doc-abertura__nota">{PRIVACIDADE_ABERTURA}</p>
      </AberturaDocumental>

      <SecaoDocumental
        id="pv-navegacao"
        rotulo="Sua navegação"
        titulo="O que acontece enquanto você lê este site"
      >
        <ul className="doc-itens">
          {PRIVACIDADE_NAVEGACAO.map((item) => (
            <ItemVerificavel
              key={item.titulo}
              prova={item.prova}
              texto={item.texto}
              titulo={item.titulo}
            />
          ))}
        </ul>
      </SecaoDocumental>

      <SecaoDocumental
        id="pv-fronteiras"
        rotulo="Fronteiras"
        titulo="Onde o site termina e outra coisa começa"
      >
        <ul className="doc-itens">
          {PRIVACIDADE_FRONTEIRAS.map((item) => (
            <ItemVerificavel
              key={item.titulo}
              prova={item.prova}
              texto={item.texto}
              titulo={item.titulo}
            />
          ))}
        </ul>
      </SecaoDocumental>

      <SecaoDocumental
        id="pv-pesquisa"
        rotulo="Material da pesquisa"
        titulo="Os dados de quem participou, e como eles foram tratados"
      >
        <p className="doc-guia">
          Esta seção não é sobre você que navega: é sobre as pessoas que
          participaram da pesquisa de campo e cujo material está publicado no
          acervo.
        </p>
        <ul className="doc-itens">
          {PRIVACIDADE_PESQUISA.map((item) => (
            <ItemVerificavel
              key={item.titulo}
              prova={item.prova}
              texto={item.texto}
              titulo={item.titulo}
            />
          ))}
        </ul>
        <p className="doc-guia">
          O que está publicado e sob que autorização pode ser conferido peça a
          peça no{" "}
          <Link href="/acervo" prefetch={false}>
            Acervo
          </Link>
          .
        </p>
      </SecaoDocumental>
    </Documento>
  );
}
