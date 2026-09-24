import type { Route } from "next";
import Link from "next/link";

import {
  ABERTURA,
  CAMINHO_DAS_FOTOS,
  CONJUNTO_NO_ACERVO,
  FOTOGRAFIAS_NO_CONJUNTO,
  GRUPOS_EDITORIAIS,
  LUGARES_VISITADOS,
  montarBlocosDeLugar,
  montarGruposDoConjunto,
  ROTULO_DA_NATUREZA,
  SINTESE,
} from "../../componentes/campo/conteudo";
import {
  AberturaDocumental,
  Documento,
  SecaoDocumental,
} from "../../componentes/institucional/Documento";
import { MESES_DE_COLETA } from "../../dados/indicadores/derivados";
import { exibirDataDaFotografia } from "../../dados/pesquisa/derivados";
import { listarAnexosPublicos } from "../../dados/publicado/anexos";
import { metadadosDaRota } from "../../lib/site-url";

export const metadata = metadadosDaRota({
  pathname: "/campo",
  titulo: "Diário de Campo — Observatório do Vale do Rio Real",
  descricao:
    "O registro fotográfico da pesquisa de campo do Observatório do Vale do " +
    "Rio Real, lugar a lugar, com legenda, crédito e procedência.",
});

/**
 * `/campo` — Diário de Campo.
 *
 * ## O lugar dela entre as outras três
 *
 * `/pesquisa` responde **como**; `/territorio` responde **onde**; esta
 * responde **o que ficou registrado**. É a única superfície editorial em que
 * as fotografias de campo aparecem como imagem — o Acervo as publica como
 * catálogo, uma linha por arquivo, que é o que um catálogo deve ser.
 *
 * As entrevistas **não** entram aqui: elas estão inteiras em `/pesquisa`, com
 * estado resolvido contra o acervo. Duas superfícies afirmando a mesma coisa é
 * como uma passa a divergir da outra.
 *
 * ## Só fotografia já versionada
 *
 * A galeria serve os derivados de `public/media/pesquisa` — os mesmos bytes
 * que a Home e o Território já usam. Puxar as 59 do acervo encheria a página
 * de imagens remotas de centenas de kB cada; recodificá-las produziria uma
 * segunda verdade sobre a mesma fotografia. Tudo abaixo da primeira dobra
 * carrega com `loading="lazy"`.
 *
 * O lugar sem derivado local continua na página, com a sua contagem no
 * conjunto e o caminho para o acervo: omiti-lo afirmaria que não houve
 * registro, e houve.
 *
 * ## O critério de publicação
 *
 * O conjunto só é apresentado quando ele **está** no acervo público, resolvido
 * em build contra `vw_anexo_publico`. Sem isso a página mostra o estado vazio
 * e não constrói link nenhum por convenção de nome.
 */
export default async function PaginaCampo() {
  const anexos = await listarAnexosPublicos();
  const conjuntoPublico = anexos.some(
    (anexo) => anexo.slug === CONJUNTO_NO_ACERVO,
  );

  const lugares = montarBlocosDeLugar();
  const grupos = montarGruposDoConjunto();

  const ficha = [
    { termo: "Lugares visitados", valor: `${LUGARES_VISITADOS}` },
    { termo: "Coleta em campo", valor: `${MESES_DE_COLETA} meses, em 2025` },
    {
      termo: "Fotografias no conjunto",
      valor: `${FOTOGRAFIAS_NO_CONJUNTO}, em ${GRUPOS_EDITORIAIS} grupos`,
    },
    {
      termo: "Estado",
      valor: conjuntoPublico
        ? "Conjunto publicado no acervo"
        : "Conjunto ainda sem ficha pública no acervo",
    },
  ];

  return (
    <Documento>
      <AberturaDocumental
        rotulo="Registro da pesquisa de campo"
        sintese={SINTESE}
        titulo="Diário de Campo"
      >
        <div className="doc-leitura">
          {ABERTURA.map((paragrafo) => (
            <p key={paragrafo}>{paragrafo}</p>
          ))}
        </div>
        <dl className="doc-ficha">
          {ficha.map((linha) => (
            <div key={linha.termo}>
              <dt>{linha.termo}</dt>
              <dd>{linha.valor}</dd>
            </div>
          ))}
        </dl>
      </AberturaDocumental>

      {lugares.map((lugar) => (
        <SecaoDocumental
          id={`campo-${lugar.id}`}
          key={lugar.id}
          rotulo={`${lugar.localidade} · ${lugar.municipio}`}
          titulo={lugar.nome}
        >
          {lugar.fotos.length === 0 ? (
            <p className="doc-guia">
              {lugar.noConjunto === 0
                ? "Este lugar ainda não tem fotografia no conjunto público."
                : `As ${lugar.noConjunto} fotografias deste lugar estão no conjunto publicado no acervo, e podem ser vistas ali, uma a uma.`}
            </p>
          ) : (
            <>
              <p className="doc-guia">
                {lugar.fotos.length === lugar.noConjunto
                  ? `${lugar.fotos.length} fotografias, todas as que o conjunto reúne deste lugar.`
                  : `${lugar.fotos.length} de ${lugar.noConjunto} fotografias que o conjunto reúne deste lugar.`}
              </p>
              <ul className="doc-galeria">
                {lugar.fotos.map((foto) => (
                  <li key={foto.arquivo}>
                    <figure className="doc-foto">
                      {/*
                        Sem `next/image`: o derivado já tem largura fixa,
                        dimensão declarada e bytes conferidos por manifesto.
                        Um segundo pipeline de otimização recodificaria a
                        mesma fotografia e quebraria a igualdade byte a byte
                        com o objeto do acervo.
                      */}
                      <img
                        alt={foto.alt}
                        decoding="async"
                        height={foto.altura}
                        loading="lazy"
                        src={`${CAMINHO_DAS_FOTOS}/${foto.arquivo}`}
                        width={foto.largura}
                      />
                      {/*
                        A legenda visível repete o texto alternativo, porque a
                        descrição é a mesma para quem vê e para quem não vê — o
                        manifesto guarda uma só, e inventar uma segunda seria
                        escrever legenda por estimativa.

                        Ela vai `aria-hidden` para não ser anunciada duas
                        vezes: o leitor de tela já recebeu esse texto pelo
                        `alt` da imagem. O crédito fica fora da marcação
                        oculta, porque atribuição de autoria precisa ser lida.
                      */}
                      <figcaption>
                        <span aria-hidden="true">{foto.alt}</span>
                        {foto.data === null ? null : (
                          <span className="doc-foto__data">
                            {exibirDataDaFotografia(foto.data)}
                          </span>
                        )}
                        {foto.credito === null ? null : (
                          <span className="doc-foto__credito">
                            {foto.credito}
                          </span>
                        )}
                      </figcaption>
                    </figure>
                  </li>
                ))}
              </ul>
            </>
          )}
        </SecaoDocumental>
      ))}

      <SecaoDocumental
        id="campo-conjunto"
        rotulo="O conjunto"
        titulo={`As ${FOTOGRAFIAS_NO_CONJUNTO} fotografias, em ${GRUPOS_EDITORIAIS} grupos`}
      >
        <p className="doc-guia">
          O acervo organiza o conjunto em grupos editoriais: os lugares
          visitados, os encontros de campo e o contexto institucional. Cada
          fotografia tem ali a sua ficha, com endereço permanente.
        </p>
        <ul className="doc-cartoes">
          {grupos.map((grupo) => (
            <li className="doc-cartao" key={grupo.id}>
              <p className="meta-ficha doc-cartao__medida">
                {ROTULO_DA_NATUREZA[grupo.natureza]}
              </p>
              <h3>{grupo.titulo}</h3>
              <p className="meta-ficha">
                {grupo.fotografias}{" "}
                {grupo.fotografias === 1 ? "fotografia" : "fotografias"}
              </p>
              {grupo.descricao === null ? null : <p>{grupo.descricao}</p>}
            </li>
          ))}
        </ul>
        {conjuntoPublico ? (
          <p className="doc-guia">
            <Link
              /* Mesmo padrão do Acervo para rota dinâmica com typedRoutes. */
              href={`/acervo/${CONJUNTO_NO_ACERVO}` as Route}
              prefetch={false}
            >
              Abrir o conjunto completo no acervo
            </Link>
          </p>
        ) : (
          <p className="doc-guia">
            O conjunto ainda não tem ficha pública no acervo. Enquanto não
            tiver, esta página não oferece um caminho que levaria a lugar
            nenhum.
          </p>
        )}
      </SecaoDocumental>

      <aside className="doc-fecho">
        <p className="meta-ficha">O que está em outras páginas</p>
        <p>
          O método que produziu estes registros — objetivo, instrumentos,
          percurso, quem foi ouvido e limites declarados — está em{" "}
          <Link href="/pesquisa" prefetch={false}>
            A Pesquisa
          </Link>
          , que traz também as entrevistas gravadas. Onde cada lugar fica, na
          posição confirmada e sobre a malha oficial, está no{" "}
          <Link href="/territorio" prefetch={false}>
            Território
          </Link>
          . Os arquivos, um a um, ficam no{" "}
          <Link href="/acervo" prefetch={false}>
            Acervo
          </Link>
          .
        </p>
      </aside>
    </Documento>
  );
}
