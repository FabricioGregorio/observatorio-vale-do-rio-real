import Link from "next/link";

import {
  ACESSIBILIDADE_ABERTURA,
  ACESSIBILIDADE_LIMITES,
  ACESSIBILIDADE_RECURSOS,
  ACESSIBILIDADE_SINTESE,
} from "../../componentes/institucional/conteudo";
import {
  AberturaDocumental,
  Documento,
  ItemVerificavel,
  SecaoDocumental,
} from "../../componentes/institucional/Documento";
import { metadadosDaRota } from "../../lib/site-url";

export const metadata = metadadosDaRota({
  pathname: "/acessibilidade",
  titulo: "Acessibilidade — Observatório do Vale do Rio Real",
  descricao:
    "Os recursos de acessibilidade implementados neste site, recurso a " +
    "recurso, com a forma de conferir cada um — e os limites declarados.",
});

/**
 * `/acessibilidade` — declaração de acessibilidade.
 *
 * ## Por que ela é assim
 *
 * A forma usual desta página é um parágrafo de intenção e uma citação da
 * WCAG. Isso não ajuda ninguém: quem chega aqui quer saber se consegue usar o
 * site com a ferramenta que usa. Então cada item afirma **um recurso** e diz
 * **como ele é conferido** — e os limites vêm logo depois, na mesma forma,
 * porque o que o site não faz é informação tão útil quanto o que ele faz.
 *
 * ## O que ela não afirma
 *
 * Conformidade, certificação ou auditoria externa. Nenhuma das três existe.
 * Declarar conformidade não verificada num site de prestação de contas é a
 * mesma classe de problema que um número inventado.
 *
 * Server Component sem consulta ao banco: todo o conteúdo é editorial e
 * verificável no próprio repositório.
 */
export default function PaginaAcessibilidade() {
  return (
    <Documento>
      <AberturaDocumental
        rotulo="Declaração de acessibilidade"
        sintese={ACESSIBILIDADE_SINTESE}
        titulo="Acessibilidade"
      >
        <p className="doc-abertura__nota">{ACESSIBILIDADE_ABERTURA}</p>
      </AberturaDocumental>

      <SecaoDocumental
        id="ac-recursos"
        rotulo="O que existe"
        titulo="Recursos implementados, e como cada um é conferido"
      >
        <ul className="doc-itens">
          {ACESSIBILIDADE_RECURSOS.map((recurso) => (
            <ItemVerificavel
              key={recurso.titulo}
              prova={recurso.prova}
              texto={recurso.texto}
              titulo={recurso.titulo}
            />
          ))}
        </ul>
      </SecaoDocumental>

      <SecaoDocumental
        id="ac-limites"
        rotulo="Limites"
        titulo="O que este site ainda não faz"
      >
        <p className="doc-guia">
          Declarar o limite é parte da declaração. Um recurso ausente e nomeado
          é melhor que um recurso prometido e inexistente.
        </p>
        <ul className="doc-itens">
          {ACESSIBILIDADE_LIMITES.map((limite) => (
            <ItemVerificavel
              key={limite.titulo}
              prova={limite.prova}
              texto={limite.texto}
              titulo={limite.titulo}
            />
          ))}
        </ul>
      </SecaoDocumental>

      <SecaoDocumental
        id="ac-barreira"
        rotulo="Encontrou uma barreira"
        titulo="Como relatar um problema de acesso"
      >
        <div className="doc-leitura">
          <p>
            O Observatório ainda não designou um canal de atendimento para o
            site, e esta página não inventa um: uma barreira relatada para um
            endereço que ninguém lê é uma barreira que continua de pé. A página
            de{" "}
            <Link href="/contato" prefetch={false}>
              Contato
            </Link>{" "}
            registra exatamente o que existe hoje e o que falta decidir.
          </p>
          <p>
            Se a barreira for o acesso a um documento, ela provavelmente já está
            resolvida sem pedido nenhum: todo material público do projeto tem
            endereço permanente, sem login e sem autorização, no{" "}
            <Link href="/acervo" prefetch={false}>
              Acervo
            </Link>{" "}
            e na{" "}
            <Link href="/prestacao-de-contas" prefetch={false}>
              Prestação de Contas
            </Link>
            .
          </p>
        </div>
      </SecaoDocumental>
    </Documento>
  );
}
