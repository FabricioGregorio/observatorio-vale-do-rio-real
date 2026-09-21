import Link from "next/link";

import {
  ACOMPANHAMENTO,
  COLETIVO,
  CONTATO_ABERTURA,
  CONTATO_CANAIS,
  CONTATO_PENDENCIA,
  CONTATO_SINTESE,
  EDITAL,
  NOME_OFICIAL,
} from "../../componentes/institucional/conteudo";
import {
  AberturaDocumental,
  Documento,
  ItemVerificavel,
  SecaoDocumental,
} from "../../componentes/institucional/Documento";
import { metadadosDaRota } from "../../lib/site-url";

export const metadata = metadadosDaRota({
  pathname: "/contato",
  titulo: "Contato — Observatório do Vale do Rio Real",
  descricao:
    "Identificação institucional do Observatório do Vale do Rio Real e o " +
    "que existe hoje como forma de chegar ao projeto.",
});

/**
 * `/contato` — o que existe, dito sem preencher a lacuna.
 *
 * A auditoria de completude editorial registrou que **nenhum canal
 * institucional publicável foi localizado** no repositório nem na fonte
 * canônica: o campo de e-mail do banco é interno e nunca renderizado, o
 * domínio não recebe correio, e o perfil do Instagram não deve virar canal
 * oficial por inferência.
 *
 * Um e-mail publicado aqui teria de existir e ter alguém do outro lado.
 * Inventar um não seria um detalhe de interface: seria criar um endereço para
 * onde mensagens sobre um projeto de recurso público iriam se perder.
 *
 * Então a página faz três coisas que são verdadeiras: identifica o projeto,
 * mostra o que já funciona sem intermediário — o acervo aberto, que responde
 * à razão mais comum de alguém escrever —, e **declara a lacuna** em vez de
 * escondê-la. O perfil do Instagram aparece pelo que ele é, registrado no
 * inventário, e com a ressalva de que não é canal de atendimento.
 *
 * Server Component sem consulta ao banco e **sem formulário**: não há
 * destinatário, e um formulário sem destinatário é pior que um endereço
 * inventado.
 */
export default function PaginaContato() {
  const identificacao = [
    { termo: "Projeto", valor: NOME_OFICIAL },
    { termo: "Realização", valor: COLETIVO },
    { termo: "Fomento", valor: EDITAL },
    { termo: "Prestação de contas", valor: ACOMPANHAMENTO },
  ];

  return (
    <Documento>
      <AberturaDocumental
        rotulo="Contato institucional"
        sintese={CONTATO_SINTESE}
        titulo="Contato"
      >
        <p className="doc-abertura__nota">{CONTATO_ABERTURA}</p>
      </AberturaDocumental>

      <SecaoDocumental
        id="ct-identificacao"
        rotulo="Identificação"
        titulo="De quem é este projeto"
      >
        <dl className="doc-ficha">
          {identificacao.map((linha) => (
            <div key={linha.termo}>
              <dt>{linha.termo}</dt>
              <dd>{linha.valor}</dd>
            </div>
          ))}
        </dl>
        <p className="doc-guia">
          O histórico do Coletivo e a origem do Observatório estão em{" "}
          <Link href="/observatorio" prefetch={false}>
            O Observatório
          </Link>
          .
        </p>
      </SecaoDocumental>

      <SecaoDocumental
        id="ct-canais"
        rotulo="O que existe"
        titulo="Como chegar ao projeto hoje"
      >
        <ul className="doc-itens">
          {CONTATO_CANAIS.map((canal) => (
            <ItemVerificavel
              key={canal.titulo}
              prova={canal.prova}
              texto={canal.texto}
              titulo={canal.titulo}
            />
          ))}
        </ul>
      </SecaoDocumental>

      <SecaoDocumental
        id="ct-pendencia"
        rotulo="O que falta"
        titulo="Canal de atendimento ainda não disponível"
      >
        <div className="doc-leitura">
          <p>{CONTATO_PENDENCIA}</p>
        </div>
      </SecaoDocumental>
    </Documento>
  );
}
