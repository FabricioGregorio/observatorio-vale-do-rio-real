import Link from "next/link";
import {
  ALT_DO_HERO,
  CAMINHO_DAS_MARCAS,
  CAMINHO_PUBLICO,
  DERIVADOS_DO_HERO,
  ICONE_OBSERVATORIO_CABECALHO,
  MARCA_COLETIVO,
} from "../../../dados/hero/derivados";
import { INDICADORES } from "../../../dados/indicadores/derivados";
import { exibirIndicador } from "../../../dados/indicadores/formato";
import {
  type ArquivosPublicados,
  type MaterialResolvido,
  resolverMateriaisDoLugar,
} from "../../../dados/materiais-de-campo";
import {
  DERIVADOS_DA_PESQUISA,
  DERIVADOS_DOS_LUGARES,
  PASTA_PUBLICA_DA_PESQUISA,
} from "../../../dados/pesquisa/derivados";
import { RECORTE_TERRITORIAL } from "../../../dados/territorio/recorte";
import type { RelacaoTerritorial } from "../../../dados/territorio/tipos";
import {
  ID_CABECALHO_HOME,
  MENU_PRINCIPAL,
  MENU_RODAPE,
} from "../../../lib/navegacao";
import { MenuMobile, NavegacaoDoCabecalho } from "../../layout/MenuMobile";
import { MapaInterativo } from "../../mapa/MapaInterativo";
import { CentralAcessibilidade } from "../CentralAcessibilidade";
import { REGISTROS_DE_APOIO } from "../dadosvivos/selecaoEditorial";
import { ITENS_COM_DESTINO } from "../menuAlvo";
import type { ContextoDaHome } from "./abertura";
import {
  ACOMPANHAMENTO,
  COLETIVO,
  EDITAL,
  EDITAL_CURTO,
  ENTREVISTAS,
  EQUIPAMENTOS,
  type Equipamento,
  FONTES,
  FOTOGRAFIAS_DO_BORDA_NO_ACERVO,
  LINHA_DO_EDITAL,
  NOME_OFICIAL,
  PODOBSERVAR,
  REGUA_DE_MARCAS,
  RELATORIO_DO_RECANTO,
  ROTULO_DO_ESTADO,
} from "./conteudo";
import { Capitulo, Fontes, Pendente, type PropsDeSecao } from "./Estrutura";
import {
  GrafismoRioReal,
  GrafismoSerra,
  GrafismoTerritorial,
} from "./GrafismosTerritoriais";
import {
  ID_DA_LISTA_DO_RECORTE,
  ID_DO_MAPA,
  ID_DO_PAINEL_DO_MAPA,
  ID_DO_QUADRO_DO_MAPA,
  MapaDoRecorte,
} from "./MapaDoRecorte";
import { DEFINICOES, type Recorte } from "./recortes";

/**
 * Seções do experimento `/dev/home-livre`, na ordem narrativa:
 *
 *   Abertura → I Origem → II Território → III Lugares → IV Leitura →
 *   V Escuta → VI Produtos → VII Conferência → Créditos
 *
 * Todas são Server Components. A única ilha cliente da página é a Central de
 * Acessibilidade já existente, reutilizada sem alteração no topo.
 */

const MUNICIPIOS_DO_VALE = RECORTE_TERRITORIAL.filter((m) =>
  m.relacoesTerritoriais.includes("vale-rio-real"),
);
const MUNICIPIOS_DE_COMPARACAO = RECORTE_TERRITORIAL.filter((m) =>
  m.relacoesTerritoriais.includes("comparacao"),
);

const FOTO_VERTICAL = DERIVADOS_DO_HERO.find((d) =>
  d.arquivo.includes("mobile"),
) as (typeof DERIVADOS_DO_HERO)[number];

function tamanhoEmKb(bytes: number): string {
  return `${Math.round(bytes / 1000)} kB`;
}

/* -------------------------------------------------------------------------- */

/**
 * Barra superior da Home v2.
 *
 * No laboratório ela continua exibindo a demonstração histórica da H1
 * (`ITENS_COM_DESTINO`). Servindo `/`, usa a navegação canônica de sete itens
 * da ADR-017 e ganha o menu de telas estreitas: abaixo de 1024px a lista
 * horizontal sai de cena e quem navega por teclado usa o mesmo `MenuMobile`
 * do resto do site — o contrato verificado em
 * `testes/a11y/navegacao-publica.spec.ts`.
 */
export function Topo({ contexto = "dev" }: { contexto?: ContextoDaHome }) {
  const publico = contexto === "publico";
  const itens = publico ? MENU_PRINCIPAL : ITENS_COM_DESTINO;

  return (
    <header className="hl-topo" id={publico ? ID_CABECALHO_HOME : undefined}>
      <div className="hl-quadro hl-topo__linha">
        <Link className="hl-topo__marca" href="/" prefetch={false}>
          <img
            alt=""
            height={ICONE_OBSERVATORIO_CABECALHO.altura}
            src={`${CAMINHO_DAS_MARCAS}/${ICONE_OBSERVATORIO_CABECALHO.arquivo}`}
            width={ICONE_OBSERVATORIO_CABECALHO.largura}
          />
          <span>Observatório do Vale do Rio Real</span>
        </Link>
        {publico ? (
          <NavegacaoDoCabecalho />
        ) : (
          <nav aria-label="Principal" className="hl-topo__nav">
            <ul>
              {itens.map((item) =>
                item.href === null ? null : (
                  <li key={item.rotulo}>
                    <Link href={item.href} prefetch={false}>
                      {item.rotulo}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </nav>
        )}
        {publico ? (
          <nav
            aria-label="Principal (telas estreitas)"
            className="hl-topo__nav-estreita"
          >
            <MenuMobile classeResponsiva="" />
          </nav>
        ) : null}
        <div className="hl-topo__util">
          <CentralAcessibilidade />
          <Link
            className="hl-botao hl-botao--curto hl-topo__prestacao"
            href="/prestacao-de-contas"
            prefetch={false}
          >
            Prestação de contas <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

/* -------------------------------------------------------------------------- */

export function Abertura({ contexto = "dev" }: PropsDeSecao) {
  return (
    <section
      aria-labelledby="hl-abertura-titulo"
      className="hl-quadro hl-abertura"
    >
      <div className="hl-abertura__texto">
        <p className="meta-ficha">Vale do Rio Real · Sergipe · Brasil</p>
        <h1 id="hl-abertura-titulo">{NOME_OFICIAL}</h1>
        <p className="hl-lede">
          Uma pesquisa sobre cultura e economia criativa feita a partir do
          território — em equipamentos culturais, com gestores públicos e nos
          registros de quem mantém esses lugares funcionando.
        </p>

        <dl className="hl-tres">
          <div>
            <dt className="meta-ficha">Quem realiza</dt>
            <dd>{COLETIVO}</dd>
          </div>
          <div>
            <dt className="meta-ficha">Com que recurso</dt>
            <dd>
              {EDITAL_CURTO} — {LINHA_DO_EDITAL}
            </dd>
          </div>
          <div>
            <dt className="meta-ficha">Onde</dt>
            <dd>
              Vale do Rio Real, Sergipe — {MUNICIPIOS_DO_VALE.length} municípios
              no recorte
            </dd>
          </div>
        </dl>

        <div className="hl-acoes">
          <a className="hl-botao hl-botao--cheio" href="#hl-lugares">
            Ver o que a pesquisa encontrou
          </a>
          <Link
            className="hl-botao"
            href="/prestacao-de-contas"
            prefetch={false}
          >
            Conferir a prestação de contas
          </Link>
        </div>

        <Fontes contexto={contexto} itens={FONTES.abertura} />
      </div>

      <figure className="hl-abertura__foto">
        <img
          alt={ALT_DO_HERO}
          decoding="async"
          fetchPriority="high"
          height={FOTO_VERTICAL.altura}
          src={`${CAMINHO_PUBLICO}/${FOTO_VERTICAL.arquivo}`}
          width={FOTO_VERTICAL.largura}
        />
        <figcaption className="hl-legenda">
          <strong>Caminho de chegada</strong>
          <span className="meta-ficha">
            Registro do acervo do projeto · data não informada
          </span>
          <Pendente>
            Arquivo idêntico ao da pasta de campo do Recanto da Serra ·
            atribuição de local a confirmar
          </Pendente>
        </figcaption>
      </figure>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

export function Origem({ contexto = "dev" }: PropsDeSecao) {
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

        <aside className="hl-assinatura" aria-label="Assinatura visual">
          <GrafismoTerritorial tipo="carcara" variante="grande" />
          <p className="meta-ficha">Carcará · grafismo da identidade</p>
        </aside>
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

      <Fontes contexto={contexto} itens={FONTES.origem} />
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

/**
 * A qual recorte explorável o município pertence.
 *
 * `comparacao` vem primeiro de propósito: São Cristóvão tem também
 * `pesquisa-campo`, e em nenhuma hipótese ele pode cair no recorte do Vale.
 */
function recorteDoMunicipio(
  relacoes: readonly RelacaoTerritorial[],
): Recorte | undefined {
  if (relacoes.includes("comparacao")) return "comparacao";
  if (relacoes.includes("vale-rio-real")) return "vale";
  return undefined;
}

export function Territorio({ contexto = "dev" }: PropsDeSecao) {
  return (
    <Capitulo
      className="hl-capitulo--territorio"
      id="hl-territorio"
      numero="II"
      rotulo="Território"
      titulo="Um recorte, não uma fronteira"
    >
      <div className="hl-territorio">
        <div className="hl-texto">
          <p>
            O Vale do Rio Real é uma região socioeconômica associada ao curso
            superior e médio do rio Real. Não é divisão administrativa oficial:
            o Observatório não cria fronteira nova, destaca os municípios do
            recorte que utiliza.
          </p>

          <ul className="hl-legenda-mapa" aria-label="Legenda do mapa">
            <li>
              <span aria-hidden="true" data-amostra="vale campo" />
              Recorte do Vale, com pesquisa de campo
            </li>
            <li>
              <span aria-hidden="true" data-amostra="vale" />
              Recorte do Vale
            </li>
            <li>
              <span aria-hidden="true" data-amostra="comparacao" />
              Pesquisado como comparação, fora do Vale
            </li>
            <li>
              <span aria-hidden="true" data-amostra="lugar" />
              Lugar visitado, com posição confirmada
            </li>
          </ul>

          <dl className="hl-municipios" id={ID_DA_LISTA_DO_RECORTE}>
            {RECORTE_TERRITORIAL.map((municipio) => (
              <div
                data-recorte={recorteDoMunicipio(
                  municipio.relacoesTerritoriais,
                )}
                key={municipio.codigoIbge}
              >
                <dt>{municipio.nome}</dt>
                <dd>
                  {municipio.relacoesTerritoriais
                    .map((relacao) => ROTULO_DA_RELACAO[relacao])
                    .join(" · ")}
                  {municipio.nome === "Tobias Barreto" ? (
                    <span className="hl-municipios__nota">
                      onde ficam o Recanto da Serra e o Borda da Mata
                    </span>
                  ) : null}
                </dd>
              </div>
            ))}
          </dl>

          <p className="hl-nota">
            {MUNICIPIOS_DE_COMPARACAO.map((m) => m.nome).join(", ")} entra como
            comparação de políticas públicas, não como parte do Vale. Ilha
            Grande e Serra dos Macacos também fazem parte da pesquisa e aparecem
            como lugares visitados quando o recorte correspondente é
            selecionado.
          </p>
        </div>

        <div className="hl-mapa" id={ID_DO_QUADRO_DO_MAPA}>
          {/*
            Servidos com `hidden`. Quem revela e' a ilha, ao montar: sem
            JavaScript nao ha orientacao prometendo exploracao, nem botao que
            nao faz nada. Ver MapaInterativo.
          */}
          <p className="hl-mapa__orientacao" data-revelavel hidden>
            Selecione um recorte no mapa para ver os municipios que ele reune.
          </p>

          <MapaDoRecorte />

          <div
            aria-live="polite"
            className="hl-mapa__painel"
            data-revelavel
            hidden
            id={ID_DO_PAINEL_DO_MAPA}
          >
            <p data-painel-vazio>Nenhum recorte selecionado.</p>
            {DEFINICOES.map((definicao) => (
              <div
                data-painel-de={definicao.chave}
                hidden
                key={definicao.chave}
              >
                <p className="hl-mapa__painel-titulo">{definicao.titulo}</p>
                <p>{definicao.resumo}</p>
                <p className="hl-mapa__painel-lista">
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
          </div>

          <button
            className="hl-mapa__voltar"
            data-revelavel
            hidden
            id={ID_DO_BOTAO_VOLTAR}
            type="button"
          >
            Ver Sergipe inteiro
          </button>

          <MapaInterativo
            chave="recorte"
            idDaLista={ID_DA_LISTA_DO_RECORTE}
            idDoBotaoVoltar={ID_DO_BOTAO_VOLTAR}
            idDoEstado={ID_DO_QUADRO_DO_MAPA}
            idDoPainel={ID_DO_PAINEL_DO_MAPA}
            idDoSvg={ID_DO_MAPA}
            rotuloDaLista="Recortes do mapa"
            seletorDasOpcoes="g[data-recorte]"
            seletorDoQueRevelar={`#${ID_DO_QUADRO_DO_MAPA} [data-revelavel]`}
          />
        </div>
      </div>

      <Fontes contexto={contexto} itens={FONTES.territorio} />
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
  contexto = "dev",
  publicados = new Map(),
}: PropsDeSecao & { publicados?: ArquivosPublicados }) {
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
      className="hl-capitulo--bodega"
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

      <Fontes contexto={contexto} itens={FONTES.equipamentos} />
      <GrafismoTerritorial tipo="bodega" variante="fundo" />
    </Capitulo>
  );
}

/* -------------------------------------------------------------------------- */

export function Leitura({ contexto = "dev" }: PropsDeSecao) {
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

      <Fontes contexto={contexto} itens={FONTES.leitura} />
    </Capitulo>
  );
}

/* -------------------------------------------------------------------------- */

export function Escuta({ contexto = "dev" }: PropsDeSecao) {
  return (
    <Capitulo
      className="hl-capitulo--cactus"
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

      <Fontes contexto={contexto} itens={FONTES.escuta} />
      <GrafismoTerritorial tipo="cactus" variante="lateral" />
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
  contexto = "dev",
  publicados = new Map(),
}: PropsDeSecao & { publicados?: ArquivosPublicados }) {
  const { relatoriosPublicos, entrevistasEFormulariosPublicos } =
    resolverEstadoDosProdutos(publicados);

  return (
    <Capitulo
      className="hl-capitulo--patrimonio"
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

      <Fontes contexto={contexto} itens={FONTES.produtos} />
      <GrafismoTerritorial tipo="igreja-serra-dos-macacos" variante="canto" />
    </Capitulo>
  );
}

/* -------------------------------------------------------------------------- */

export function Conferencia({ contexto = "dev" }: PropsDeSecao) {
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

      <Fontes contexto={contexto} itens={FONTES.conferir} />
      <GrafismoSerra />
    </Capitulo>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Régua de marcas — **estudo conceitual, não conteúdo publicável.**
 *
 * O próprio bloco declara "Não publicar": os arquivos oficiais de apoio e
 * fomento não estão no repositório, os slots vazios anunciam material
 * pendente e as regras de ordem e proporção ainda dependem de validação. Numa
 * página de prestação de contas, publicar marca institucional em rascunho é
 * afirmação sobre terceiros que ninguém autorizou.
 *
 * Por isso a seção inteira fica fora da árvore pública, pelo mesmo critério
 * de `Fontes`. A atribuição institucional que o visitante precisa — quem
 * realiza, quem financia e a quem se presta contas — já está escrita em texto
 * no capítulo Origem, e não depende desta régua.
 */
export function Creditos({ contexto = "dev" }: PropsDeSecao) {
  if (contexto === "publico") return null;

  return (
    <section aria-labelledby="hl-creditos-titulo" className="hl-creditos">
      <div className="hl-quadro">
        <p className="meta-ficha" id="hl-creditos-titulo">
          Realização, apoio e fomento
        </p>

        <p className="hl-aviso">
          Estrutura conceitual da régua de marcas.{" "}
          <strong>Não publicar.</strong> As marcas de apoio e fomento não estão
          no repositório, e o layout depende de validação técnica / nada opor
          antes da publicação final.
        </p>

        <div className="hl-regua">
          {REGUA_DE_MARCAS.map((grupo) => (
            <div
              className="hl-regua__grupo"
              data-grupo={grupo.grupo}
              key={grupo.grupo}
            >
              <p className="meta-ficha">{grupo.rotulo}</p>
              <ul className="hl-regua__marcas">
                {grupo.marcas.map((marca) => (
                  <li className="hl-slot" key={marca.nome}>
                    {marca.arquivo !== null &&
                    marca.largura !== null &&
                    marca.altura !== null ? (
                      <img
                        alt={marca.nome}
                        height={marca.altura}
                        src={marca.arquivo}
                        width={marca.largura}
                      />
                    ) : (
                      <span className="hl-slot__vazio">
                        <strong>{marca.nome}</strong>
                        <span>arquivo oficial RGB pendente</span>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <ul className="hl-regras">
          <li>Arquivos oficiais em RGB, sem recriar marca.</li>
          <li>
            Fundo neutro; em fundo escuro, só versões vazadas ou monocromáticas
            oficialmente autorizadas.
          </li>
          <li>
            Proporções e áreas de proteção preservadas; alturas visuais
            equivalentes.
          </li>
          <li>Rótulo “Apoio / parceria” e posição do Coletivo a validar.</li>
        </ul>

        <Fontes contexto={contexto} itens={FONTES.creditos} />
      </div>
    </section>
  );
}

export function RodapeLivre() {
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
