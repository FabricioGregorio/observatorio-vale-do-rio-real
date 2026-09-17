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
import {
  DEFINICAO_VALE_DO_RIO_REAL,
  RECORTE_TERRITORIAL,
} from "../../dados/territorio/recorte";
import { MENU_RODAPE } from "../../lib/navegacao";
import {
  GrafismoRioReal,
  GrafismoSerra,
} from "../grafismos/GrafismosTerritoriais";
import { MapaInterativo } from "../mapa/MapaInterativo";
import { REFERENCIAS_TERRITORIAIS } from "../prototipo/territoriovivo/local/referencias";
import {
  ACOMPANHAMENTO,
  COLETIVO,
  EDITAL,
  EDITAL_CURTO,
  ENTREVISTAS,
  EQUIPAMENTOS,
  type Equipamento,
  FOTOGRAFIAS_DO_BORDA_NO_ACERVO,
  LINHA_DO_EDITAL,
  NOME_OFICIAL,
  PODOBSERVAR,
  RELATORIO_DO_RECANTO,
  ROTULO_DO_ESTADO,
} from "./conteudo";
import { Capitulo, Pendente } from "./Estrutura";
import {
  CLASSE_DO_MAPA,
  CSS_CARTOGRAFICO,
  ID_DA_LISTA_DO_RECORTE,
  ID_DO_MAPA,
  ID_DO_PAINEL_DO_MAPA,
  MapaDoRecorte,
} from "./MapaDoRecorte";
import { DEFINICOES, recorteDoMunicipio } from "./recortes";

/**
 * Seções da Home, na ordem narrativa:
 *
 *   I Origem → II Território → III Lugares → IV Leitura → V Escuta →
 *   VI Produtos → VII Conferência
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

const ID_DO_BOTAO_VOLTAR = "hl-mapa-voltar";
const ID_DO_TITULO_DA_LEITURA = "hl-territorio-leitura";
const ID_DO_TITULO_DOS_PONTOS = "hl-territorio-pontos";

/**
 * II Território — cartografia editorial.
 *
 * Composição em duas colunas: o mapa emoldurado à esquerda, com nota
 * cartográfica e legenda; o eixo editorial à direita, com a leitura em
 * camadas, o painel contextual e os pontos de pesquisa. A leitura em texto dos
 * municípios fecha a seção, em largura inteira, e é ela a alternativa completa
 * quando não há JavaScript.
 *
 * A Home é a **síntese** da cartografia: dois alvos editoriais, não 75
 * municípios clicáveis. A exploração profunda é de `/territorio`.
 */
export function Territorio() {
  return (
    <Capitulo
      className="hl-capitulo--territorio"
      id="hl-territorio"
      numero="II"
      rotulo="Território"
      titulo="Cartografia viva do Vale do Rio Real"
    >
      <style>{CSS_CARTOGRAFICO}</style>

      <div className={`${CLASSE_DO_MAPA} territorio-cartografico`}>
        <div className="territorio-cartografico__grade">
          <MapaDoRecorte />

          <aside className="territorio-cartografico__editorial">
            <div className="territorio-cartografico__introducao hl-texto">
              <p className="meta-ficha">Leitura cartográfica</p>
              <h3>Território em camadas</h3>
              <p>
                A cartografia apresenta os 75 municípios de Sergipe e distingue
                as relações territoriais declaradas no projeto: o recorte do
                Vale, os municípios com pesquisa de campo e a referência de
                comparação.
              </p>
              <p>
                {DEFINICAO_VALE_DO_RIO_REAL} O Observatório não cria fronteira
                nova, destaca os municípios do recorte que utiliza.
              </p>
            </div>

            {/*
              Servidos com `hidden`. Quem revela é a ilha, ao montar: sem
              JavaScript não há orientação prometendo exploração, nem botão que
              não faz nada. Ver MapaInterativo.
            */}
            <section
              aria-labelledby={ID_DO_TITULO_DA_LEITURA}
              aria-live="polite"
              className="territorio-cartografico__painel"
              data-revelavel
              hidden
              id={ID_DO_PAINEL_DO_MAPA}
            >
              <p className="meta-ficha" id={ID_DO_TITULO_DA_LEITURA}>
                Leitura do território
              </p>

              <p data-painel-vazio>
                Selecione um recorte no mapa para ler o que ele reúne.
              </p>

              {DEFINICOES.map((definicao) => (
                <div
                  data-painel-de={definicao.chave}
                  hidden
                  key={definicao.chave}
                >
                  <h4>{definicao.titulo}</h4>
                  <p>{definicao.resumo}</p>
                  <p className="territorio-cartografico__painel-lista">
                    {RECORTE_TERRITORIAL.filter(
                      (municipio) =>
                        recorteDoMunicipio(municipio.relacoesTerritoriais) ===
                        definicao.chave,
                    )
                      .map((municipio) => municipio.nome)
                      .join(" · ")}
                  </p>
                  <Link href="/territorio" prefetch={false}>
                    Cartografia Viva
                  </Link>
                </div>
              ))}

              <button
                className="territorio-cartografico__voltar"
                id={ID_DO_BOTAO_VOLTAR}
                type="button"
              >
                Ver Sergipe inteiro
              </button>
            </section>

            <section
              aria-labelledby={ID_DO_TITULO_DOS_PONTOS}
              className="territorio-cartografico__pontos"
            >
              <h3 id={ID_DO_TITULO_DOS_PONTOS}>Pontos de pesquisa</h3>
              <p>
                Os quatro lugares visitados em campo, na posição confirmada pelo
                responsável e desenhada no mapa.
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
            comparação de políticas públicas, não como parte do Vale. Ilha
            Grande e Serra dos Macacos também fazem parte da pesquisa e aparecem
            como lugares visitados no mapa.
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
          idDoBotaoVoltar={ID_DO_BOTAO_VOLTAR}
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
  return (
    <ul
      aria-label={`O que a pesquisa reuniu sobre ${equipamento.nome}`}
      className="hl-reuniu"
    >
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
      numero="III"
      rotulo="Lugares"
      titulo="Dois lugares no centro da pesquisa"
    >
      <p className="hl-texto hl-intro">
        Em Tobias Barreto, dois equipamentos culturais foram acompanhados de
        perto. Entre julho e dezembro de 2025, seus responsáveis registraram em
        formulário o funcionamento de cada dia: o que entrou, o que saiu e quem
        foi contratado.
      </p>

      <div className="hl-dupla">
        <article aria-labelledby="hl-recanto" className="hl-equip">
          <FotoDaFicha foto={fotos.recanto} />
          <div className="hl-equip__corpo">
            <p className="meta-ficha">{recanto.lugar}</p>
            <h3 id="hl-recanto">{recanto.nome}</h3>
            <p>
              Segundo o relatório técnico publicado, o espaço é equipamento
              cultural e motor da economia criativa e solidária da região do
              Vale do Rio Real.
            </p>
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
        </article>

        <article aria-labelledby="hl-borda" className="hl-equip">
          <FotoDaFicha foto={fotos.borda} />
          <div className="hl-equip__corpo">
            <p className="meta-ficha">{borda.lugar}</p>
            <h3 id="hl-borda">{borda.nome}</h3>
            <p>
              O relatório técnico do Borda da Mata é um PDF digitalizado de sete
              páginas, sem camada de texto. A decisão de 2026-09-16 autorizou
              sua publicação integral, junto das fotografias de campo, da
              entrevista e dos formulários do equipamento.
            </p>
            <MateriaisReunidos
              equipamento={borda}
              materiais={materiais.borda}
            />
            {relatorioDoBorda?.href === undefined ||
            relatorioDoBorda.href === null ? (
              <p className="hl-nota">
                Nenhum documento do Borda da Mata está público ainda. Esta ficha
                diz o que existe, sem antecipar o conteúdo.
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
      numero="IV"
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

export function Escuta() {
  return (
    <Capitulo
      id="hl-escuta"
      numero="V"
      rotulo="Escuta"
      titulo="Quem a pesquisa ouviu"
    >
      <div className="hl-escuta">
        <div className="hl-texto">
          <p>
            Foram {ENTREVISTAS.length} entrevistas gravadas, com gestores
            públicos e com quem mantém os lugares visitados, em Tobias Barreto,
            Tomar do Geru, São Cristóvão e Ilha Grande.
          </p>
          <p>
            Os áudios e as transcrições seguem restritos. As vozes entram no
            site quando a relação entre cada participante, sua entrevista e o
            consentimento gravado estiver registrada.
          </p>
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
            Registros fotográficos de Ilha Grande, um dos lugares onde a
            pesquisa esteve.
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
      numero="VI"
      rotulo="Produtos"
      titulo="O que o Observatório produziu"
    >
      <article aria-labelledby="hl-pod" className="hl-pod">
        <div>
          <p className="meta-ficha">Podcast</p>
          <h3 id="hl-pod">PodObservar</h3>
          <p className="hl-pod__fato">
            {PODOBSERVAR.episodiosPublicados} episódios publicados no{" "}
            {PODOBSERVAR.plataformas.join(" e no ")}.
          </p>
          <p>No site, cada episódio precisará vir com transcrição integral.</p>
          <Pendente>
            Informação do responsável · títulos, capas e links ainda não estão
            no repositório
          </Pendente>
        </div>

        <ol className="hl-episodios" aria-label="Episódios do PodObservar">
          {PODOBSERVAR.episodios.map((episodio) => (
            <li className="hl-episodio" key={episodio.numero}>
              <span className="hl-episodio__n" aria-hidden="true">
                {String(episodio.numero).padStart(2, "0")}
              </span>
              <span>
                <span className="sr-only">Episódio {episodio.numero}: </span>
                <span className="hl-episodio__vazio">
                  Título, duração, link e transcrição a inserir
                </span>
              </span>
            </li>
          ))}
        </ol>
      </article>

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

      <nav aria-label="Seções em preparação" className="hl-secoes">
        <p className="meta-ficha">Seções do site em preparação</p>
        <ul>
          <li>
            <Link href="/pesquisa" prefetch={false}>
              Pesquisa
            </Link>
          </li>
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
          <li>
            <Link href="/podobservar" prefetch={false}>
              PodObservar
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
      numero="VII"
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
