import Link from "next/link";

import { CAMINHO_DAS_MARCAS, MARCA_COLETIVO } from "../../dados/hero/derivados";
import { INDICADORES } from "../../dados/indicadores/derivados";
import { exibirIndicador } from "../../dados/indicadores/formato";
import { REGISTROS_DE_APOIO } from "../../dados/indicadores/selecaoEditorial";
import {
  type ArquivosPublicados,
  type MaterialResolvido,
  resolverMateriaisDoLugar,
} from "../../dados/materiais-de-campo";
import {
  DERIVADOS_DA_PESQUISA,
  DERIVADOS_DOS_LUGARES,
  PASTA_PUBLICA_DA_PESQUISA,
} from "../../dados/pesquisa/derivados";
import { RECORTE_TERRITORIAL } from "../../dados/territorio/recorte";
import { REFERENCIAS_TERRITORIAIS } from "../../dados/territorio/referencias";
import { MENU_RODAPE } from "../../lib/navegacao";
import {
  GrafismoRioReal,
  GrafismoSerra,
} from "../grafismos/GrafismosTerritoriais";
import { MapaInterativo } from "../mapa/MapaInterativo";
import {
  ACOMPANHAMENTO,
  COLETIVO,
  EDITAL,
  EDITAL_CURTO,
  ENTREVISTAS,
  EQUIPAMENTOS,
  type Equipamento,
  entrevistasPublicas,
  FOTOGRAFIAS_DO_BORDA_NO_ACERVO,
  LINHA_DO_EDITAL,
  NOME_OFICIAL,
  RELATORIO_DO_RECANTO,
  ROTULO_DO_ESTADO,
} from "./conteudo";
import { Capitulo } from "./Estrutura";
import {
  CLASSE_DO_MAPA,
  CSS_CARTOGRAFICO,
  ID_DA_LISTA_DO_RECORTE,
  ID_DO_MAPA,
  ID_DO_PAINEL_DO_MAPA,
  MapaDoRecorte,
} from "./MapaDoRecorte";
import {
  ALVO_PADRAO,
  ALVOS_EDITORIAIS,
  type ConteudoEditorial,
  recorteDoMunicipio,
} from "./recortes";

/**
 * Seções da Home, na ordem narrativa:
 *
 *   I Origem → II PodObservar → III Território → IV Lugares → V Leitura →
 *   VI Escuta → VII Produtos → VIII Conferência
 *
 * II vive em `PodObservar.tsx`, porque depende da view pública e recebe o
 * episódio mais recente por prop. As demais são estáticas e ficam aqui.
 *
 * Todas são Server Components. A única ilha cliente da página é o mapa do
 * recorte; o cabeçalho e a Central de Acessibilidade vivem no layout raiz.
 */

const MUNICIPIOS_DO_VALE = RECORTE_TERRITORIAL.filter((m) =>
  m.relacoesTerritoriais.includes("vale-rio-real"),
);
const MUNICIPIOS_DE_COMPARACAO = RECORTE_TERRITORIAL.filter((m) =>
  m.relacoesTerritoriais.includes("comparacao"),
);

function tamanhoEmKb(bytes: number): string {
  return `${Math.round(bytes / 1000)} kB`;
}

/* -------------------------------------------------------------------------- */

export function Origem() {
  return (
    <Capitulo
      className="hl-capitulo--rio"
      id="hl-origem"
      numero="I"
      rotulo="Origem"
      titulo="Um coletivo, um edital público e um território"
    >
      <div className="hl-origem">
        <div className="hl-texto">
          <p>
            O Observatório é uma iniciativa do {COLETIVO}, que o idealizou e o
            realiza. O projeto é financiado pelo {EDITAL}, dedicado a
            observatórios de cultura e economia criativa, e presta contas da sua
            execução à FUNCAP, em Sergipe.
          </p>
          <p>
            Por isso este site tem duas funções que não se separam: publicar a
            pesquisa em domínio público e guardar a prova documental do que foi
            feito.
          </p>
        </div>
      </div>

      <ol className="hl-cadeia">
        <li className="hl-elo">
          <p className="meta-ficha">Realização</p>
          <div className="hl-elo__nome">
            <span className="hl-selo">
              <img
                alt={MARCA_COLETIVO.alt}
                height={MARCA_COLETIVO.altura}
                src={`${CAMINHO_DAS_MARCAS}/${MARCA_COLETIVO.arquivo}`}
                width={MARCA_COLETIVO.largura}
              />
            </span>
            <h3>{COLETIVO}</h3>
          </div>
          <p>Idealiza e realiza o Observatório.</p>
        </li>
        <li className="hl-elo">
          <p className="meta-ficha">Fomento</p>
          <h3>{EDITAL_CURTO}</h3>
          <p>
            Linha {LINHA_DO_EDITAL}. Financia a pesquisa e a publicação dos seus
            resultados.
          </p>
        </li>
        <li className="hl-elo">
          <p className="meta-ficha">Prestação de contas</p>
          <h3>{ACOMPANHAMENTO}</h3>
          <p>
            Recebe a comprovação da execução — a mesma que este site guarda.
          </p>
        </li>
      </ol>

      <GrafismoRioReal />
    </Capitulo>
  );
}

/* -------------------------------------------------------------------------- */

const ROTULO_DA_RELACAO = {
  "vale-rio-real": "recorte do Vale",
  "pesquisa-campo": "pesquisa de campo",
  comparacao: "referência de comparação",
} as const;

const ID_DO_TITULO_DOS_PONTOS = "hl-territorio-pontos";

/**
 * Linha territorial de um alvo — municípios do recorte, ou onde fica o lugar.
 *
 * Nenhum dos dois é escrito à mão: o recorte deriva de `RECORTE_TERRITORIAL`
 * pelo mesmo filtro que alimenta o mapa, e o lugar deriva de
 * `REFERENCIAS_TERRITORIAIS`, que é a fonte de município e localidade desde a
 * Tarefa 20. A tabela editorial não repete nenhum dos dois.
 */
function notaTerritorialDe(chave: ConteudoEditorial["chave"]): string {
  const lugar = REFERENCIAS_TERRITORIAIS.find(
    (referencia) => referencia.id === chave,
  );
  if (lugar !== undefined) return `${lugar.localidade} · ${lugar.municipio}`;

  return RECORTE_TERRITORIAL.filter(
    (municipio) => recorteDoMunicipio(municipio.relacoesTerritoriais) === chave,
  )
    .map((municipio) => municipio.nome)
    .join(" · ");
}

/**
 * III Território — cartografia editorial.
 *
 * Composição em duas colunas: o mapa emoldurado à esquerda, com nota
 * cartográfica e legenda; a coluna editorial à direita. A leitura em texto dos
 * municípios fecha a seção, em largura inteira.
 *
 * ## A coluna responde ao mapa
 *
 * A coluna inteira é contextual: sobretítulo, título, parágrafos e linha
 * territorial mudam junto com o que está selecionado no desenho. São seis
 * alvos — os dois recortes declarados e os quatro lugares de campo —, todos
 * vindos de `ALVOS_EDITORIAIS`, que é a única tabela que liga identificador,
 * rótulo do mapa e texto. Mapa e coluna não têm como divergir de nome.
 *
 * Nada disso nasce no cliente: o servidor escreve os seis blocos, e a ilha só
 * decide qual deles está visível. Sem JavaScript, a coluna mostra o alvo
 * padrão — o Vale, que é o assunto da seção — e continua sendo texto completo.
 *
 * A Home é a **síntese** da cartografia. A exploração dos 75 municípios, com
 * camadas e fichas, é de `/territorio`.
 */
export function Territorio() {
  return (
    <Capitulo
      antes="Cada povoação do recorte guarda uma fonte histórica e social própria"
      className="hl-capitulo--territorio"
      id="hl-territorio"
      numero="III"
      rotulo="Território"
      titulo="Cartografia viva do Vale do Rio Real"
    >
      <style>{CSS_CARTOGRAFICO}</style>

      <div className={`${CLASSE_DO_MAPA} territorio-cartografico`}>
        <div className="territorio-cartografico__grade">
          <MapaDoRecorte />

          <aside className="territorio-cartografico__editorial">
            {/*
              A coluna editorial da seção. Os seis blocos são servidos prontos;
              o padrão vem visível e os outros cinco vêm com `hidden`, e é a
              ilha que troca qual aparece. `data-painel-padrao` diz a ela para
              onde voltar quando a seleção é limpa — sem isso, Esc deixaria a
              coluna vazia.

              Base factual de todo o texto: transcrições revisadas do
              PodObservar. Ver `recortes.ts`.
            */}
            <section
              aria-label="Leitura do território"
              aria-live="polite"
              className="territorio-cartografico__painel hl-texto"
              data-painel-padrao={ALVO_PADRAO}
              id={ID_DO_PAINEL_DO_MAPA}
            >
              {ALVOS_EDITORIAIS.map((alvo) => {
                /*
                  A linha territorial só entra quando acrescenta: em São
                  Cristóvão ela repetiria o próprio título, e repetir é peso
                  sem informação numa Home que tem orçamento de bytes.
                */
                const nota = notaTerritorialDe(alvo.chave);
                const repetida = nota === "" || alvo.titulo.includes(nota);

                return (
                  <div
                    data-painel-de={alvo.chave}
                    hidden={alvo.chave !== ALVO_PADRAO}
                    key={alvo.chave}
                  >
                    <p className="meta-ficha">{alvo.sobretitulo}</p>
                    <h3>{alvo.titulo}</h3>
                    {alvo.paragrafos.map((paragrafo) => (
                      <p key={paragrafo}>{paragrafo}</p>
                    ))}
                    {repetida ? null : (
                      <p className="territorio-cartografico__painel-lista">
                        {nota}
                      </p>
                    )}
                  </div>
                );
              })}
            </section>

            {/*
              Servido com `hidden`: só a ilha revela. Sem JavaScript não há o
              que selecionar, e convidar para uma exploração que não acontece
              seria promessa falsa. O texto da coluna, esse, está lá nos dois
              casos.
            */}
            <p
              className="territorio-cartografico__convite meta-ficha"
              data-revelavel
              hidden
            >
              Selecione um recorte ou um ponto de pesquisa no mapa para mudar
              esta leitura.
            </p>

            {/*
              A Home mostra a síntese; a cartografia com camadas, zoom e fichas
              é de /territorio. O destino é o mesmo que a navegação principal
              oferece, dito aqui no ponto em que a leitura do mapa termina.
            */}
            <p className="territorio-cartografico__ponte">
              <Link
                className="territorio-cartografico__ir"
                href="/territorio"
                prefetch={false}
              >
                Ver o mapa interativo completo
              </Link>
            </p>

            <section
              aria-labelledby={ID_DO_TITULO_DOS_PONTOS}
              className="territorio-cartografico__pontos"
            >
              <h3 id={ID_DO_TITULO_DOS_PONTOS}>Pontos de pesquisa</h3>
              <p>
                Os quatro lugares visitados em campo, na posição confirmada pelo
                responsável e desenhada no mapa. Chegar até eles fez parte da
                pesquisa: estrada de terra, ponte de madeira sobre riacho e, no
                caso de Ilha Grande, travessia de barco.
              </p>
              <ul>
                {REFERENCIAS_TERRITORIAIS.map((lugar) => (
                  <li key={lugar.id}>
                    <span className="territorio-cartografico__lugar-nome">
                      {lugar.nome}
                    </span>
                    <span className="meta-ficha">
                      {lugar.localidade} · {lugar.municipio}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>

        <details className="territorio-cartografico__indice">
          <summary>Leitura em texto — municípios do recorte</summary>
          <p>
            {MUNICIPIOS_DE_COMPARACAO.map((m) => m.nome).join(", ")} entra como
            comparação de políticas públicas, não como parte do Vale. A Serra
            dos Macacos, em Tobias Barreto, e Ilha Grande, povoado de São
            Cristóvão, também fazem parte da pesquisa e aparecem como lugares
            visitados no mapa.
          </p>
          <dl
            className="territorio-cartografico__lista"
            id={ID_DA_LISTA_DO_RECORTE}
          >
            {RECORTE_TERRITORIAL.map((municipio) => (
              <div
                className="territorio-cartografico__item"
                data-recorte={recorteDoMunicipio(
                  municipio.relacoesTerritoriais,
                )}
                key={municipio.codigoIbge}
              >
                <dt>{municipio.nome}</dt>
                <dd className="meta-ficha">
                  {municipio.relacoesTerritoriais
                    .map((relacao) => ROTULO_DA_RELACAO[relacao])
                    .join(" · ")}
                </dd>
                {municipio.nome === "Tobias Barreto" ? (
                  <dd>onde ficam o Recanto da Serra e o Borda da Mata</dd>
                ) : null}
              </div>
            ))}
          </dl>
        </details>

        <MapaInterativo
          chave="recorte"
          idDaLista={ID_DA_LISTA_DO_RECORTE}
          idDoPainel={ID_DO_PAINEL_DO_MAPA}
          idDoSvg={ID_DO_MAPA}
          rotuloDaLista="Recortes do mapa"
          seletorDasOpcoes="g[data-recorte]"
          seletorDoQueRevelar="#hl-territorio [data-revelavel]"
        />
      </div>
    </Capitulo>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * O estado de cada material vem resolvido contra `vw_anexo_publico`. Material
 * público vira link para o arquivo real; sem URL não existe estado público.
 */
function MateriaisReunidos({
  equipamento,
  materiais,
}: {
  equipamento: Equipamento;
  materiais: readonly MaterialResolvido[];
}) {
  /*
   * O rótulo passou a ser visível. Antes ele existia só como `aria-label`: o
   * leitor de tela sabia o que aquela lista era e quem lê na tela via uma
   * pilha de linhas sem título, logo depois do texto do lugar. Um `id`
   * compartilhado dá o mesmo nome às duas leituras, sem duplicá-lo.
   */
  const idDoRotulo = `hl-reuniu-${equipamento.id}`;

  return (
    <div className="hl-reuniu">
      <p className="meta-ficha" id={idDoRotulo}>
        O que a pesquisa reuniu
      </p>
      <ul aria-labelledby={idDoRotulo}>
        {materiais.map((item) => (
          <li key={item.material}>
            {item.href === null ? (
              <span>{item.material}</span>
            ) : (
              <a href={item.href}>{item.material}</a>
            )}
            <span className="hl-estado" data-estado={item.estado}>
              {ROTULO_DO_ESTADO[item.estado]}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Fotografia principal da ficha, do recorte derivado das fotos de campo. */
function fotoDaFicha(local: "Recanto da Serra" | "Borda da Mata") {
  const doLugar = DERIVADOS_DOS_LUGARES.filter((f) => f.local === local);
  return doLugar.find((f) => f.principal) ?? doLugar[0] ?? null;
}

/**
 * Fotografia da ficha, com o crédito de autoria quando existe.
 *
 * O crédito vem do mesmo manifesto que alimenta o Acervo. A Home não pode
 * perder uma atribuição que o Acervo conhece, e por isso ela não é escrita
 * aqui: é lida do derivado.
 */
function FotoDaFicha({
  foto,
}: {
  foto: (typeof DERIVADOS_DOS_LUGARES)[number] | null;
}) {
  if (foto === null) return <div className="hl-equip__imagem" />;
  return (
    <figure className="hl-equip__imagem">
      <img
        alt={foto.alt}
        decoding="async"
        height={foto.altura}
        loading="lazy"
        src={`${PASTA_PUBLICA_DA_PESQUISA}/${foto.arquivo}`}
        width={foto.largura}
      />
      {foto.credito === null ? null : (
        <figcaption className="hl-credito">{foto.credito}</figcaption>
      )}
    </figure>
  );
}

export function Lugares({
  publicados = new Map(),
}: {
  publicados?: ArquivosPublicados;
}) {
  const recanto = EQUIPAMENTOS[0] as Equipamento;
  const borda = EQUIPAMENTOS[1] as Equipamento;
  const fotos = {
    recanto: fotoDaFicha("Recanto da Serra"),
    borda: fotoDaFicha("Borda da Mata"),
  };
  const materiais = {
    recanto: resolverMateriaisDoLugar("recanto-da-serra", publicados),
    borda: resolverMateriaisDoLugar("borda-da-mata", publicados),
  };
  const relatorioDoBorda = materiais.borda.find(
    (m) => m.material === "Relatório técnico",
  );

  return (
    <Capitulo
      id="hl-lugares"
      numero="IV"
      rotulo="Lugares"
      titulo="Dois lugares no centro da pesquisa"
    >
      <p className="hl-texto hl-intro">
        Em Tobias Barreto, dois equipamentos culturais foram acompanhados de
        perto. Entre julho e dezembro de 2025, seus responsáveis registraram em
        formulário o funcionamento de cada dia: o que entrou, o que saiu e quem
        foi contratado.
      </p>

      {/*
       * Os dois cards têm a mesma anatomia, na mesma ordem: fotografia,
       * localidade, nome, o que é o lugar, a nota documental, a lista de
       * materiais e o CTA. Era essa simetria que faltava — um card abria
       * descrevendo o lugar e o outro abria descrevendo o estado de um PDF,
       * e os botões pousavam em alturas diferentes porque nada os prendia ao
       * pé da ficha. O pé agora é um bloco só (`hl-equip__pe`), empurrado
       * para baixo pelo CSS; a altura dos dois passa a ser a mesma qualquer
       * que seja o tamanho do texto acima.
       *
       * As descrições saem das transcrições revisadas do PodObservar (EP02,
       * Recanto; EP03, Borda da Mata) e não nomeiam ninguém, como no resto
       * da Home.
       */}
      <div className="hl-dupla">
        <article aria-labelledby="hl-recanto" className="hl-equip">
          <FotoDaFicha foto={fotos.recanto} />
          <div className="hl-equip__corpo">
            <p className="meta-ficha">{recanto.lugar}</p>
            <h3 id="hl-recanto">{recanto.nome}</h3>
            <p>
              Aberto à visitação em 2008, reúne museus, trilhas, biblioteca,
              área de reflorestamento e uma cozinha abastecida pela produção da
              região.
            </p>
            <p className="hl-nota">
              Segundo o relatório técnico publicado, o espaço é equipamento
              cultural e motor da economia criativa e solidária da região do
              Vale do Rio Real.
            </p>
            <div className="hl-equip__pe">
              <MateriaisReunidos
                equipamento={recanto}
                materiais={materiais.recanto}
              />
              <a
                className="hl-botao hl-botao--cheio"
                href={RELATORIO_DO_RECANTO.url}
              >
                Ler o relatório técnico
                <span className="hl-botao__meta">
                  PDF · {tamanhoEmKb(RELATORIO_DO_RECANTO.bytes)} ·{" "}
                  {RELATORIO_DO_RECANTO.licenca}
                </span>
              </a>
            </div>
          </div>
        </article>

        <article aria-labelledby="hl-borda" className="hl-equip">
          <FotoDaFicha foto={fotos.borda} />
          <div className="hl-equip__corpo">
            <p className="meta-ficha">{borda.lugar}</p>
            <h3 id="hl-borda">{borda.nome}</h3>
            <p>
              Um centro cultural que divide o endereço com a casa de quem o
              mantém: a Garagem Cultural guarda discos, livros e varais de
              cordel, e a casa de taipa preserva a memória do trabalho no campo.
            </p>
            <p className="hl-nota">
              O relatório técnico é um PDF digitalizado de sete páginas, sem
              camada de texto. A decisão de 2026-09-16 autorizou sua publicação
              integral, junto das fotografias de campo, da entrevista e dos
              formulários do equipamento.
            </p>
            <div className="hl-equip__pe">
              <MateriaisReunidos
                equipamento={borda}
                materiais={materiais.borda}
              />
              {relatorioDoBorda?.href === undefined ||
              relatorioDoBorda.href === null ? (
                <p className="hl-nota">
                  Nenhum documento do Borda da Mata está público ainda. Esta
                  ficha diz o que existe, sem antecipar o conteúdo.
                </p>
              ) : (
                <a
                  className="hl-botao hl-botao--cheio"
                  href={relatorioDoBorda.href}
                >
                  Ler o relatório técnico
                  <span className="hl-botao__meta">
                    PDF digitalizado · {FOTOGRAFIAS_DO_BORDA_NO_ACERVO}{" "}
                    fotografias de campo no acervo
                  </span>
                </a>
              )}
            </div>
          </div>
        </article>
      </div>

      <p className="hl-ponte">Os números a seguir vêm destes dois lugares.</p>
    </Capitulo>
  );
}

/* -------------------------------------------------------------------------- */

export function Leitura() {
  const protagonista = INDICADORES[0];

  return (
    <Capitulo
      antes="Os registros da pesquisa também permitem uma leitura quantitativa do território"
      className="hl-leitura"
      id="hl-leitura"
      numero="V"
      rotulo="Leitura"
      titulo="Onde o recurso circula"
    >
      <p className="hl-texto hl-intro">
        Os números desta seção vêm do levantamento próprio do Observatório em
        dois equipamentos culturais de Tobias Barreto, entre julho e dezembro de
        2025. Eles descrevem quanto entrou, quanto saiu e onde a despesa foi
        executada. Não descrevem lucro, impacto nem o que aconteceu fora do que
        foi registrado.
      </p>

      <div className="hl-protagonista">
        <div>
          <p className="hl-numero">{exibirIndicador(protagonista)}</p>
          <p className="hl-numero__rotulo">{protagonista.titulo}</p>
        </div>
        <div className="hl-protagonista__leitura">
          <h3>O que este número mede, e o que não mede</h3>
          <p>
            O indicador mede a parcela da despesa identificada que foi executada
            dentro do município. Ele não mede lucro, não mede impacto e não
            descreve o que aconteceu fora das despesas com localidade
            identificada.
          </p>
          <dl className="hl-ficha">
            <div>
              <dt>Base</dt>
              <dd>{protagonista.base}</dd>
            </div>
            <div>
              <dt>Regra</dt>
              <dd>{protagonista.regra}</dd>
            </div>
            <div>
              <dt>Período</dt>
              <dd>{protagonista.periodo}</dd>
            </div>
            <div>
              <dt>Recorte</dt>
              <dd>{protagonista.recorte}</dd>
            </div>
            <div>
              <dt>Fonte</dt>
              <dd>{protagonista.fontePublica}</dd>
            </div>
          </dl>
        </div>
      </div>

      <dl className="hl-apoios">
        {REGISTROS_DE_APOIO.map(({ indicador, rotulo }) => (
          <div className="hl-apoio" key={indicador.id}>
            <dt>{rotulo}</dt>
            <dd className="hl-apoio__valor">{exibirIndicador(indicador)}</dd>
            <dd className="hl-apoio__regra">{indicador.regra}</dd>
          </div>
        ))}
      </dl>

      <p className="hl-ponte">
        Esta leitura apresenta um recorte. O levantamento completo preserva o
        detalhamento das atividades registradas
      </p>
    </Capitulo>
  );
}

/* -------------------------------------------------------------------------- */

export function Escuta({
  publicados = new Map(),
}: {
  publicados?: ArquivosPublicados;
}) {
  const publicas = entrevistasPublicas(publicados);

  return (
    <Capitulo
      id="hl-escuta"
      numero="VI"
      rotulo="Escuta"
      titulo="Quem a pesquisa ouviu"
    >
      <div className="hl-escuta">
        <div className="hl-texto">
          {/*
           * Ilha Grande saiu da lista de municípios: é povoado de São
           * Cristóvão, e enfileirá-la ao lado de três municípios afirmava uma
           * geografia que a transcrição do EP01 desmente.
           */}
          <p>
            Foram {ENTREVISTAS.length} entrevistas gravadas, com gestores
            públicos e com quem mantém os lugares visitados, em Tobias Barreto,
            Tomar do Geru e São Cristóvão — da sede do município ao povoado de
            Ilha Grande.
          </p>
          {/*
            Estado resolvido, e não declarado. A frase anterior — "os áudios e
            as transcrições seguem restritos" — continuou no ar depois de as
            oito serem publicadas, porque nada ligava esta lista aos
            documentos do acervo. Agora liga, e a Home não tem como afirmar
            restrição sobre material público.
          */}
          {publicas.length === 0 ? (
            <p>
              Os áudios e as transcrições seguem restritos. As vozes entram no
              site quando cada entrevista passar pela revisão de privacidade.
            </p>
          ) : (
            <p>
              {publicas.length === ENTREVISTAS.length
                ? "As oito estão públicas no acervo, com áudio e transcrição."
                : `${publicas.length} de ${ENTREVISTAS.length} já estão públicas no acervo, com áudio e transcrição.`}{" "}
              Nenhuma foi publicada por associação: cada documento passou pelo
              mesmo gate dos demais arquivos do site, que exige revisão de
              privacidade concluída antes de existir endereço público.
            </p>
          )}
          <p className="hl-metodo">
            A pesquisa reúne fotografia, entrevista gravada e formulário de
            resposta. Nem todo lugar recebeu as três.
          </p>
        </div>

        <ol className="hl-entrevistas" aria-label="Entrevistas gravadas">
          {ENTREVISTAS.map((entrevista) => (
            <li key={entrevista.numero}>
              <span className="hl-entrevistas__n">{entrevista.numero}</span>
              <span className="hl-entrevistas__onde">{entrevista.onde}</span>
              <span className="meta-ficha">
                {entrevista.municipio ?? "município não consolidado"}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div className="hl-ilha">
        <div className="hl-ilha__texto">
          <h3>Também em campo: Ilha Grande</h3>
          <p>
            Povoado de São Cristóvão, alcançado de barco, com cultura pesqueira
            própria e a tradição do samba de coco preservada ali. Estes são os
            registros fotográficos da visita.
          </p>
        </div>
        <ul className="hl-ilha__fotos">
          {DERIVADOS_DA_PESQUISA.map((foto) => (
            <li key={foto.id}>
              <figure>
                <img
                  alt={foto.alt}
                  decoding="async"
                  height={foto.altura}
                  loading="lazy"
                  src={`${PASTA_PUBLICA_DA_PESQUISA}/${foto.arquivo}`}
                  width={foto.largura}
                />
                <figcaption>
                  <strong>{foto.titulo}</strong>
                  <span className="meta-ficha">
                    {foto.local} · data não informada
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </Capitulo>
  );
}

/* -------------------------------------------------------------------------- */

export function resolverEstadoDosProdutos(publicados: ArquivosPublicados) {
  const materiais = [
    ...resolverMateriaisDoLugar("recanto-da-serra", publicados),
    ...resolverMateriaisDoLugar("borda-da-mata", publicados),
    ...resolverMateriaisDoLugar("serra-dos-macacos", publicados),
    ...resolverMateriaisDoLugar("ilha-grande", publicados),
  ];
  const relatoriosPublicos = materiais
    .filter((item) => /relat[oó]rio|relato técnico/i.test(item.material))
    .every((item) => item.estado === "publico");
  const entrevistasEFormulariosPublicos = materiais
    .filter((item) => /entrevista|formulários/i.test(item.material))
    .every((item) => item.estado === "publico");
  return { relatoriosPublicos, entrevistasEFormulariosPublicos };
}

export function Produtos({
  publicados = new Map(),
}: {
  publicados?: ArquivosPublicados;
}) {
  const { relatoriosPublicos, entrevistasEFormulariosPublicos } =
    resolverEstadoDosProdutos(publicados);

  return (
    <Capitulo
      id="hl-produtos"
      numero="VII"
      rotulo="Produtos"
      titulo="O que o Observatório produziu"
    >
      {/*
        O bloco do PodObservar saiu daqui na P0.3.
        Ele repetia "3 episódios publicados" como literal e prometia títulos,
        durações e links que não existiam no repositório. O podcast passou a
        ser a seção II da Home, alimentada pela view pública — aparece uma vez
        só, na narrativa, e com dado real.
      */}
      <ul className="hl-catalogo">
        <li>
          <span className="hl-estado" data-estado="publicado">
            Público
          </span>
          <h3>{RELATORIO_DO_RECANTO.titulo}</h3>
          <p>
            PDF no acervo permanente, com licença {RELATORIO_DO_RECANTO.licenca}{" "}
            e hash SHA-256.
          </p>
          <a href={RELATORIO_DO_RECANTO.url}>Abrir o PDF</a>
        </li>
        <li>
          <span className="hl-estado" data-estado="publicado">
            Público
          </span>
          <h3>Leitura quantitativa</h3>
          <p>
            {INDICADORES.length} indicadores auditados;{" "}
            {REGISTROS_DE_APOIO.length + 1} nesta página.
          </p>
          <a href="#hl-leitura">Ir para a leitura</a>
        </li>
        <li>
          <span className="hl-estado" data-estado="publicado">
            Público
          </span>
          <h3>Mapa do recorte</h3>
          <p>
            {MUNICIPIOS_DO_VALE.length} municípios no recorte do Vale, sobre a
            malha oficial de Sergipe.
          </p>
          <a href="#hl-territorio">Ir para o território</a>
        </li>
        <li>
          <span className="hl-estado" data-estado="publicado">
            Público
          </span>
          <h3>Identidade visual</h3>
          <p>Marca, símbolo e peças do projeto no acervo público.</p>
          {/*
            Apontava para /prestacao-de-contas enquanto /acervo não existia. A
            rota passou a existir na integração de 2026-09-16 e o destino
            passou a ser o que o rótulo sempre disse. A copy não mudou.
          */}
          <Link href="/acervo" prefetch={false}>
            Ver no acervo
          </Link>
        </li>
        <li>
          <span
            className="hl-estado"
            data-estado={relatoriosPublicos ? "publicado" : "restrito"}
          >
            {relatoriosPublicos ? "Público" : "Restrito"}
          </span>
          <h3>Relatórios técnicos — Borda da Mata e Serra dos Macacos</h3>
          <p>
            {relatoriosPublicos
              ? "Relatórios integrais disponíveis no acervo."
              : "No acervo, ainda não públicos."}
          </p>
          {relatoriosPublicos ? (
            <Link href="/acervo" prefetch={false}>
              Ver no acervo
            </Link>
          ) : null}
        </li>
        <li>
          <span
            className="hl-estado"
            data-estado={
              entrevistasEFormulariosPublicos ? "publicado" : "restrito"
            }
          >
            {entrevistasEFormulariosPublicos ? "Público" : "Restrito"}
          </span>
          <h3>Entrevistas e formulários</h3>
          <p>
            {entrevistasEFormulariosPublicos
              ? `${ENTREVISTAS.length} entrevistas e as planilhas de respostas estão disponíveis no acervo.`
              : `${ENTREVISTAS.length} entrevistas e as planilhas de respostas aguardam publicação.`}
          </p>
          {entrevistasEFormulariosPublicos ? (
            <Link href="/acervo" prefetch={false}>
              Ver no acervo
            </Link>
          ) : null}
        </li>
      </ul>

      {/*
        Só continua aqui o que de fato está em preparação. `/podobservar`
        saiu com a página do podcast; `/pesquisa` saiu com a página do
        percurso. Manter uma rota concluída nesta lista é afirmar sobre o
        próprio site algo que ele desmente na tela seguinte.
      */}
      <nav aria-label="Seções em preparação" className="hl-secoes">
        <p className="meta-ficha">Seções do site em preparação</p>
        <ul>
          <li>
            <Link href="/dados" prefetch={false}>
              Dados
            </Link>
          </li>
          <li>
            <Link href="/campo" prefetch={false}>
              Diário de Campo
            </Link>
          </li>
        </ul>
      </nav>
    </Capitulo>
  );
}

/* -------------------------------------------------------------------------- */

export function Conferencia() {
  return (
    <Capitulo
      className="hl-capitulo--serra"
      id="hl-conferencia"
      numero="VIII"
      rotulo="Conferência"
      titulo="Tudo o que está aqui pode ser conferido"
    >
      <div className="hl-conferencia">
        <div className="hl-texto">
          <p>
            Os anexos do projeto têm endereço permanente neste domínio, data de
            publicação e hash SHA-256 para conferência de integridade. Sem
            login, sem pedido de permissão.
          </p>
          <div className="hl-acoes">
            <Link
              className="hl-botao hl-botao--cheio"
              href="/prestacao-de-contas"
              prefetch={false}
            >
              Abrir a Prestação de Contas
            </Link>
            <a className="hl-botao" href="/anexos.json">
              anexos.json
            </a>
            <Link
              className="hl-botao"
              href="/prestacao-de-contas/imprimir"
              prefetch={false}
            >
              Versão imprimível
            </Link>
          </div>
        </div>

        <figure className="hl-hash">
          <figcaption className="meta-ficha">
            {RELATORIO_DO_RECANTO.codigo} · SHA-256
          </figcaption>
          <code>{RELATORIO_DO_RECANTO.sha256}</code>
        </figure>
      </div>

      <GrafismoSerra />
    </Capitulo>
  );
}

/* -------------------------------------------------------------------------- */

export function RodapeDaHome() {
  return (
    <div className="hl-rodape">
      <div className="hl-quadro hl-rodape__linha">
        <p>{NOME_OFICIAL}</p>
        <nav aria-label="Rodapé">
          <ul>
            {MENU_RODAPE.map((item) => (
              <li key={item.href}>
                <Link href={item.href} prefetch={false}>
                  {item.rotulo}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
