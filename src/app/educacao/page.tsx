import type { Route } from "next";
import Link from "next/link";

import {
  EDUCACAO_ABERTURA,
  EDUCACAO_CAMINHOS,
  EDUCACAO_COMO_USAR,
  EDUCACAO_SINTESE,
} from "../../componentes/institucional/conteudo";
import {
  AberturaDocumental,
  Documento,
  ItemVerificavel,
  SecaoDocumental,
} from "../../componentes/institucional/Documento";
import { metadadosDaRota } from "../../lib/site-url";

export const metadata = metadadosDaRota({
  pathname: "/educacao",
  titulo: "Educação — Observatório do Vale do Rio Real",
  descricao:
    "Como usar em sala de aula o acervo aberto do Observatório: dados com " +
    "método declarado, entrevistas com transcrição, cartografia e fotografias.",
});

/**
 * `/educacao` — orientação de uso, e não um programa.
 *
 * ## O que esta página deliberadamente não é
 *
 * A arquitetura previa uma trilha educativa com glossário, plano de aula e
 * ações em escolas e rádios. **Nada disso foi produzido.** Uma página que
 * anunciasse oficina, curso ou material didático inexistente seria conteúdo
 * fictício — a mesma classe de problema que um número inventado, e num site
 * de prestação de contas ela custa o mesmo.
 *
 * ## O que ela é
 *
 * O acervo **existe** e é aberto: dados com regra de cálculo declarada,
 * entrevistas com transcrição integral, cartografia sobre a malha oficial,
 * relatórios técnicos e fotografias de campo — sobre lugares que estudantes da
 * região reconhecem. Isso já é material de aula; o que faltava era um caminho
 * de entrada por disciplina.
 *
 * Então a página orienta acesso, e cada caminho aponta para uma rota que
 * existe e tem conteúdo. Nenhum item promete material novo.
 *
 * Server Component sem consulta ao banco: os destinos são rotas do próprio
 * site, não objetos do acervo.
 */
export default function PaginaEducacao() {
  return (
    <Documento>
      <AberturaDocumental
        rotulo="Uso educativo do acervo"
        sintese={EDUCACAO_SINTESE}
        titulo="Educação"
      >
        <p className="doc-abertura__nota">{EDUCACAO_ABERTURA}</p>
      </AberturaDocumental>

      <SecaoDocumental
        id="ed-caminhos"
        rotulo="Por onde entrar"
        titulo="Cinco caminhos, conforme o que se quer ensinar"
      >
        <ul className="doc-cartoes">
          {EDUCACAO_CAMINHOS.map((caminho) => (
            <li className="doc-cartao" key={caminho.id}>
              <p className="meta-ficha doc-cartao__medida">
                {caminho.disciplina}
              </p>
              <h3>{caminho.titulo}</h3>
              <p>{caminho.texto}</p>
              <p className="doc-cartao__acao">
                <Link href={caminho.href as Route} prefetch={false}>
                  {caminho.acao}
                </Link>
              </p>
            </li>
          ))}
        </ul>
      </SecaoDocumental>

      <SecaoDocumental
        id="ed-como-usar"
        rotulo="Como usar"
        titulo="Quatro coisas que valem para qualquer um dos caminhos"
      >
        <ul className="doc-itens">
          {EDUCACAO_COMO_USAR.map((item) => (
            <ItemVerificavel
              key={item.titulo}
              prova={item.prova}
              texto={item.texto}
              titulo={item.titulo}
            />
          ))}
        </ul>
      </SecaoDocumental>

      <aside className="doc-fecho">
        <p className="meta-ficha">Sobre o que ainda não existe</p>
        <p>
          Glossário, plano de aula e ações em escolas estavam previstos na
          arquitetura do site e não foram produzidos. Enquanto não existirem,
          esta página não os anuncia. O que o projeto entregou de fato está
          listado, item a item, na{" "}
          <Link href="/prestacao-de-contas" prefetch={false}>
            Prestação de Contas
          </Link>
          .
        </p>
      </aside>
    </Documento>
  );
}
