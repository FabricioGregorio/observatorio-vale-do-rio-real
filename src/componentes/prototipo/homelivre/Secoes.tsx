import Link from "next/link";
import {
  CARCARA_DA_IDENTIDADE,
  PASTA_PUBLICA_DOS_GRAFISMOS,
} from "../../../dados/grafismos/derivados";
import {
  ALT_DO_HERO,
  CAMINHO_DAS_MARCAS,
  CAMINHO_PUBLICO,
  DERIVADOS_DO_HERO,
  MARCA_COLETIVO,
  SIMBOLO_OBSERVATORIO,
} from "../../../dados/hero/derivados";
import { INDICADORES } from "../../../dados/indicadores/derivados";
import { exibirIndicador } from "../../../dados/indicadores/formato";
import {
  DERIVADOS_DA_PESQUISA,
  PASTA_PUBLICA_DA_PESQUISA,
} from "../../../dados/pesquisa/derivados";
import { RECORTE_TERRITORIAL } from "../../../dados/territorio/recorte";
import { MENU_RODAPE } from "../../../lib/navegacao";
import { CentralAcessibilidade } from "../CentralAcessibilidade";
import { REGISTROS_DE_APOIO } from "../dadosvivos/selecaoEditorial";
import { ITENS_COM_DESTINO } from "../menuAlvo";
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
import { Capitulo, Fontes, Pendente } from "./Estrutura";
import { MapaDoRecorte } from "./MapaDoRecorte";

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

export function Topo() {
  return (
    <div className="hl-topo">
      <div className="hl-quadro hl-topo__linha">
        <Link className="hl-topo__marca" href="/" prefetch={false}>
          <img
            alt=""
            height={SIMBOLO_OBSERVATORIO.altura}
            src={`${CAMINHO_DAS_MARCAS}/${SIMBOLO_OBSERVATORIO.arquivo}`}
            width={SIMBOLO_OBSERVATORIO.largura}
          />
          <span>Observatório do Vale do Rio Real</span>
        </Link>
        <nav aria-label="Principal" className="hl-topo__nav">
          <ul>
            {ITENS_COM_DESTINO.map((item) =>
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
        <div className="hl-topo__util">
          <CentralAcessibilidade />
          <Link
            className="hl-botao hl-botao--cheio hl-botao--curto"
            href="/prestacao-de-contas"
            prefetch={false}
          >
            Prestação de Contas
          </Link>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

export function Abertura() {
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

        <Fontes itens={FONTES.abertura} />
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

export function Origem() {
  return (
    <Capitulo
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
          <img
            alt={CARCARA_DA_IDENTIDADE.alt}
            aria-hidden="true"
            height={CARCARA_DA_IDENTIDADE.altura}
            src={`${PASTA_PUBLICA_DOS_GRAFISMOS}/${CARCARA_DA_IDENTIDADE.arquivo}`}
            width={CARCARA_DA_IDENTIDADE.largura}
          />
          <p className="meta-ficha">{CARCARA_DA_IDENTIDADE.legenda}</p>
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

      <Fontes itens={FONTES.origem} />
    </Capitulo>
  );
}

/* -------------------------------------------------------------------------- */

const ROTULO_DA_RELACAO = {
  "vale-rio-real": "recorte do Vale",
  "pesquisa-campo": "pesquisa de campo",
  comparacao: "referência de comparação",
} as const;

export function Territorio() {
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
          </ul>

          <dl className="hl-municipios">
            {RECORTE_TERRITORIAL.map((municipio) => (
              <div key={municipio.codigoIbge}>
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
            Grande e Serra dos Macacos também estão no acervo da pesquisa, mas
            ainda sem município consolidado — por isso não aparecem no mapa.
          </p>
        </div>

        <div className="hl-mapa">
          <MapaDoRecorte />
        </div>
      </div>

      <Fontes itens={FONTES.territorio} />
    </Capitulo>
  );
}

/* -------------------------------------------------------------------------- */

function MateriaisReunidos({ equipamento }: { equipamento: Equipamento }) {
  return (
    <ul
      aria-label={`O que a pesquisa reuniu sobre ${equipamento.nome}`}
      className="hl-reuniu"
    >
      {equipamento.reunido.map((item) => (
        <li key={item.material}>
          <span>{item.material}</span>
          <span className="hl-estado" data-estado={item.estado}>
            {ROTULO_DO_ESTADO[item.estado]}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function Lugares() {
  const recanto = EQUIPAMENTOS[0] as Equipamento;
  const borda = EQUIPAMENTOS[1] as Equipamento;

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
          <div className="hl-equip__imagem">
            <img
              alt={ALT_DO_HERO}
              decoding="async"
              height={FOTO_VERTICAL.altura}
              loading="lazy"
              src={`${CAMINHO_PUBLICO}/${FOTO_VERTICAL.arquivo}`}
              width={FOTO_VERTICAL.largura}
            />
          </div>
          <div className="hl-equip__corpo">
            <p className="meta-ficha">{recanto.lugar}</p>
            <h3 id="hl-recanto">{recanto.nome}</h3>
            <p>
              Segundo o relatório técnico publicado, o espaço é equipamento
              cultural e motor da economia criativa e solidária da região do
              Vale do Rio Real.
            </p>
            <MateriaisReunidos equipamento={recanto} />
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
            <Pendente>
              Fotografia acima: mesma do topo da página; atribuição a confirmar
            </Pendente>
          </div>
        </article>

        <article aria-labelledby="hl-borda" className="hl-equip">
          <div className="hl-equip__imagem hl-equip__imagem--vazia">
            <ol
              aria-label={`${FOTOGRAFIAS_DO_BORDA_NO_ACERVO} fotografias de campo no acervo, nenhuma liberada para publicação`}
              className="hl-folha"
            >
              {Array.from(
                { length: FOTOGRAFIAS_DO_BORDA_NO_ACERVO },
                (_, i) => {
                  const numero = String(i + 1).padStart(2, "0");
                  return (
                    <li key={numero}>
                      <span aria-hidden="true">{numero}</span>
                    </li>
                  );
                },
              )}
              <li className="hl-folha__nota">
                <span>
                  {FOTOGRAFIAS_DO_BORDA_NO_ACERVO} fotografias no acervo ·
                  nenhuma liberada
                </span>
              </li>
            </ol>
          </div>
          <div className="hl-equip__corpo">
            <p className="meta-ficha">{borda.lugar}</p>
            <h3 id="hl-borda">{borda.nome}</h3>
            <p>
              O relatório técnico do Borda da Mata existe no acervo, mas segue
              restrito: contém dados pessoais que precisam ser tratados antes de
              qualquer publicação. As fotografias de campo também aguardam
              revisão.
            </p>
            <MateriaisReunidos equipamento={borda} />
            <p className="hl-nota">
              Nenhum documento do Borda da Mata está público ainda. Esta ficha
              diz o que existe, sem antecipar o conteúdo.
            </p>
          </div>
        </article>
      </div>

      <p className="hl-ponte">Os números a seguir vêm destes dois lugares.</p>

      <Fontes itens={FONTES.equipamentos} />
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

      <Fontes itens={FONTES.leitura} />
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

      <Fontes itens={FONTES.escuta} />
    </Capitulo>
  );
}

/* -------------------------------------------------------------------------- */

export function Produtos() {
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
          <Link href="/prestacao-de-contas" prefetch={false}>
            Ver no acervo
          </Link>
        </li>
        <li>
          <span className="hl-estado" data-estado="restrito">
            Restrito
          </span>
          <h3>Relatórios técnicos — Borda da Mata e Serra dos Macacos</h3>
          <p>No acervo, ainda não públicos.</p>
        </li>
        <li>
          <span className="hl-estado" data-estado="restrito">
            Restrito
          </span>
          <h3>Entrevistas e formulários</h3>
          <p>
            {ENTREVISTAS.length} entrevistas e as planilhas de resposta, usadas
            apenas em agregado.
          </p>
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

      <Fontes itens={FONTES.produtos} />
    </Capitulo>
  );
}

/* -------------------------------------------------------------------------- */

export function Conferencia() {
  return (
    <Capitulo
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

      <Fontes itens={FONTES.conferir} />
    </Capitulo>
  );
}

/* -------------------------------------------------------------------------- */

export function Creditos() {
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

        <Fontes itens={FONTES.creditos} />
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
