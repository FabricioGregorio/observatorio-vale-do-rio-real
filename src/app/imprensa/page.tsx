import type { Route } from "next";
import Link from "next/link";
import {
  COLETIVO,
  EDITAL,
  IMPRENSA_ABERTURA,
  IMPRENSA_DESCRICAO,
  IMPRENSA_LINHA_FINA,
  IMPRENSA_SINTESE,
  IMPRENSA_USO,
  LINHA_DO_EDITAL,
  NOME_OFICIAL,
} from "../../componentes/institucional/conteudo";
import {
  AberturaDocumental,
  Documento,
  ItemVerificavel,
  SecaoDocumental,
} from "../../componentes/institucional/Documento";
import { listarAnexosPublicos } from "../../dados/consultas/anexos";
import { listarEpisodiosPublicos } from "../../dados/consultas/podobservar";
import {
  CAMINHO_DAS_MARCAS,
  MARCA_COLETIVO,
  SIMBOLO_OBSERVATORIO,
} from "../../dados/hero/derivados";
import {
  INDICADORES,
  MESES_DE_COLETA,
} from "../../dados/indicadores/derivados";
import { metadadosDaRota } from "../../lib/site-url";

export const metadata = metadadosDaRota({
  pathname: "/imprensa",
  titulo: "Imprensa — Observatório do Vale do Rio Real",
  descricao:
    "Descrição institucional, materiais públicos e orientação de uso para " +
    "quem vai escrever sobre o Observatório do Vale do Rio Real.",
});

/** Slug do documento de identidade visual no acervo. */
const IDENTIDADE_VISUAL = "identidade-visual";

/**
 * `/imprensa` — o kit que um kit de imprensa deveria ser.
 *
 * ## O que ela é
 *
 * Uma página para quem vai escrever sobre o projeto: o nome oficial como ele
 * deve ser grafado, uma linha-fina e um parágrafo prontos para citação, os
 * números com o recorte colado neles, e os endereços do material público.
 *
 * ## O que ela não é
 *
 * Não é press release. Nenhum texto aqui anuncia lançamento, resultado ou
 * declaração que não tenha acontecido. Não há material sob embargo, não há
 * assessoria intermediando e não há contato de imprensa — nenhum foi
 * designado, e a página de Contato diz isso em vez de inventar um.
 *
 * ## Os números vêm da mesma fonte que o resto do site
 *
 * Indicadores, meses de coleta, documentos, arquivos e episódios são
 * derivados. Um kit de imprensa com número próprio é a forma mais eficiente
 * de espalhar uma divergência: ela sai daqui citada por terceiros.
 *
 * Gerada em build, como as demais rotas que leem o acervo.
 */
export default async function PaginaImprensa() {
  const [anexos, episodios] = await Promise.all([
    listarAnexosPublicos(),
    listarEpisodiosPublicos(),
  ]);

  const documentos = new Set(anexos.map((anexo) => anexo.slug)).size;
  const identidadePublicada = anexos.some(
    (anexo) => anexo.slug === IDENTIDADE_VISUAL,
  );

  const ficha = [
    { termo: "Nome oficial", valor: NOME_OFICIAL },
    { termo: "Realização", valor: COLETIVO },
    { termo: "Fomento", valor: EDITAL },
    { termo: "Linha do edital", valor: LINHA_DO_EDITAL },
    { termo: "Coleta em campo", valor: `${MESES_DE_COLETA} meses, em 2025` },
    {
      termo: "Indicadores publicados",
      valor: `${INDICADORES.length}, com regra de cálculo declarada`,
    },
    ...(documentos === 0
      ? []
      : [
          {
            termo: "Acervo público",
            valor: `${documentos} documentos · ${anexos.length} arquivos`,
          },
        ]),
    ...(episodios.length === 0
      ? []
      : [
          {
            termo: "PodObservar",
            valor: `${episodios.length} episódios com transcrição integral`,
          },
        ]),
  ];

  return (
    <Documento>
      <AberturaDocumental
        rotulo="Para imprensa e divulgação"
        sintese={IMPRENSA_SINTESE}
        titulo="Imprensa"
      >
        <p className="doc-abertura__nota">{IMPRENSA_ABERTURA}</p>
      </AberturaDocumental>

      <SecaoDocumental
        id="im-ficha"
        rotulo="Ficha"
        titulo="Identificação, como ela deve ser grafada"
      >
        <dl className="doc-ficha">
          {ficha.map((linha) => (
            <div key={linha.termo}>
              <dt>{linha.termo}</dt>
              <dd>{linha.valor}</dd>
            </div>
          ))}
        </dl>
      </SecaoDocumental>

      <SecaoDocumental
        id="im-textos"
        rotulo="Para citar"
        titulo="Descrição pronta, em dois tamanhos"
      >
        <div className="doc-leitura">
          <h3>Linha-fina</h3>
          <p>{IMPRENSA_LINHA_FINA}</p>
          <h3>Parágrafo</h3>
          <p>{IMPRENSA_DESCRICAO}</p>
        </div>
      </SecaoDocumental>

      <SecaoDocumental
        id="im-materiais"
        rotulo="Materiais"
        titulo="O que está público, e onde"
      >
        <ul className="doc-cartoes">
          <li className="doc-cartao">
            <h3>Acervo</h3>
            {documentos === 0 ? null : (
              <p className="meta-ficha doc-cartao__medida">
                {documentos} documentos · {anexos.length} arquivos
              </p>
            )}
            <p>
              Relatórios técnicos, fotografias de campo, entrevistas com áudio e
              transcrição, planilhas de resposta e peças de identidade. Cada
              arquivo com endereço permanente e licença declarada.
            </p>
            <p className="doc-cartao__acao">
              <Link href="/acervo" prefetch={false}>
                Percorrer o acervo
              </Link>
            </p>
          </li>
          <li className="doc-cartao">
            <h3>Dados</h3>
            <p className="meta-ficha doc-cartao__medida">
              {INDICADORES.length} indicadores auditados
            </p>
            <p>
              Cada valor com regra de cálculo, base, período e recorte. A página
              declara também o que os dados não dizem.
            </p>
            <p className="doc-cartao__acao">
              <Link href="/dados" prefetch={false}>
                Consultar os dados
              </Link>
            </p>
          </li>
          <li className="doc-cartao">
            <h3>A pesquisa</h3>
            <p>
              O percurso da investigação: objetivo, recorte, quem foi a campo,
              com que instrumentos, em que período e com que limites.
            </p>
            <p className="doc-cartao__acao">
              <Link href="/pesquisa" prefetch={false}>
                Ver o percurso
              </Link>
            </p>
          </li>
          <li className="doc-cartao">
            <h3>PodObservar</h3>
            {episodios.length === 0 ? null : (
              <p className="meta-ficha doc-cartao__medida">
                {episodios.length} episódios
              </p>
            )}
            <p>
              A pesquisa contada em áudio, com transcrição revisada e integral
              de cada episódio — citação exata sem transcrever de ouvido.
            </p>
            <p className="doc-cartao__acao">
              <Link href="/podobservar" prefetch={false}>
                Ouvir e ler
              </Link>
            </p>
          </li>
        </ul>
      </SecaoDocumental>

      <SecaoDocumental
        id="im-identidade"
        rotulo="Identidade"
        titulo="As marcas do projeto"
      >
        <p className="doc-guia">
          As duas marcas abaixo são as que este site usa. Os arquivos oficiais
          de identidade visual — versões, variantes de cor e ícone — estão
          publicados no acervo, como qualquer outro anexo.
        </p>
        <ul className="doc-galeria">
          <li>
            <figure className="doc-foto">
              <img
                alt={SIMBOLO_OBSERVATORIO.alt}
                decoding="async"
                height={SIMBOLO_OBSERVATORIO.altura}
                loading="lazy"
                src={`${CAMINHO_DAS_MARCAS}/${SIMBOLO_OBSERVATORIO.arquivo}`}
                width={SIMBOLO_OBSERVATORIO.largura}
              />
              <figcaption>Símbolo do Observatório</figcaption>
            </figure>
          </li>
          <li>
            <figure className="doc-foto">
              <img
                alt={MARCA_COLETIVO.alt}
                decoding="async"
                height={MARCA_COLETIVO.altura}
                loading="lazy"
                src={`${CAMINHO_DAS_MARCAS}/${MARCA_COLETIVO.arquivo}`}
                width={MARCA_COLETIVO.largura}
              />
              <figcaption>Marca do Coletivo, que realiza o projeto</figcaption>
            </figure>
          </li>
        </ul>
        {identidadePublicada ? (
          <p className="doc-guia">
            <Link
              /* Mesmo padrão do Acervo para rota dinâmica com typedRoutes. */
              href={`/acervo/${IDENTIDADE_VISUAL}` as Route}
              prefetch={false}
            >
              Abrir a ficha de identidade visual no acervo
            </Link>
          </p>
        ) : null}
      </SecaoDocumental>

      <SecaoDocumental
        id="im-uso"
        rotulo="Uso"
        titulo="Como citar sem distorcer"
      >
        <ul className="doc-itens">
          {IMPRENSA_USO.map((item) => (
            <ItemVerificavel
              key={item.titulo}
              prova={item.prova}
              texto={item.texto}
              titulo={item.titulo}
            />
          ))}
        </ul>
        <p className="doc-guia">
          Não há contato de imprensa designado. A página de{" "}
          <Link href="/contato" prefetch={false}>
            Contato
          </Link>{" "}
          registra o que existe e o que falta decidir; a{" "}
          <Link href="/prestacao-de-contas" prefetch={false}>
            Prestação de Contas
          </Link>{" "}
          traz o inventário completo com hash por arquivo.
        </p>
      </SecaoDocumental>
    </Documento>
  );
}
