/**
 * Conteúdo editorial de `/pesquisa`.
 *
 * ## De onde sai cada afirmação
 *
 * - **Transcrições revisadas do PodObservar**, públicas em `/podobservar`, e
 *   revisadas em 18/09/2026. O EP01 sustenta o objetivo, o recorte, o percurso
 *   de campo e a troca de Itabaianinha por Tomar do Geru; o EP02 sustenta o
 *   método — a figura do ator-chave, os dois formulários, a rotina de visita,
 *   a divisão de papéis e o compromisso ético; o EP03 sustenta a leitura do
 *   período de baixa visitação no Borda da Mata. Nada aqui é cópia literal.
 * - **`dados/indicadores/derivados.ts`** — janela de coleta, meses completos e
 *   os valores auditados. Nenhum número é escrito à mão nesta página.
 * - **`dados/territorio/recorte.ts` e `referencias.ts`** — municípios do
 *   recorte e os quatro lugares de campo.
 * - **`componentes/home/conteudo.ts`** — as oito entrevistas, identificadas
 *   por instituição ou lugar.
 * - **`dados/materiais-de-campo.ts`**, resolvido contra `vw_anexo_publico` em
 *   build — o estado real de cada material.
 *
 * ## O que esta página não faz
 *
 * Não inventa metodologia, não publica número sem procedência e não descreve
 * resultado que a fonte não sustente. Indicador com pendência metodológica
 * aberta não entra aqui pelo mesmo motivo que não entrou em `derivados.ts`:
 * a contagem de visitantes e a de pessoas distintas continuam fora.
 *
 * Os papéis da equipe aparecem como papéis — agente de campo, analista de
 * dados, coordenação de pesquisa —, que é como as próprias transcrições os
 * apresentam. Isso é escolha de foco desta página, e não regra do site:
 * nomear pessoa é decisão editorial, tomada caso a caso.
 */

import {
  FIM_DA_COLETA,
  INICIO_DA_COLETA,
  MESES_DE_COLETA,
} from "../../dados/indicadores/derivados";

import {
  type Entrevista as EntrevistaDaPesquisa,
  ENTREVISTAS as LISTA_DE_ENTREVISTAS,
} from "../home/conteudo";

export {
  INDICADORES,
  MESES_DE_COLETA,
} from "../../dados/indicadores/derivados";
export { ENTREVISTAS } from "../home/conteudo";

/** `2025-07-21` → `21/07/2025`. Mesma regra de exibição dos indicadores. */
function exibirData(iso: string): string {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

export const PERIODO_DA_COLETA = `${exibirData(INICIO_DA_COLETA)} a ${exibirData(FIM_DA_COLETA)}`;

/**
 * A janela de coleta toca seis meses do calendário e fecha cinco meses
 * completos. As duas leituras são verdadeiras e medem coisas diferentes:
 * `derivados.ts` registra que é por isso que a série mensal tem seis linhas
 * para cinco meses de coleta. Dizer as duas, com a razão, evita a contradição
 * aparente entre "seis meses de acompanhamento" e "cinco meses de coleta".
 */
export const NOTA_DOS_MESES = `A janela vai de ${exibirData(INICIO_DA_COLETA)} a ${exibirData(FIM_DA_COLETA)}: ${MESES_DE_COLETA} meses completos, distribuídos por seis meses do calendário. É por isso que a série mensal tem seis linhas.`;

export const SINTESE =
  "Cinco meses acompanhando de perto dois equipamentos culturais de Tobias " +
  "Barreto, quatro lugares visitados em campo e oito entrevistas com quem " +
  "mantém esses espaços e com quem responde pela política cultural nos " +
  "municípios.";

export const OBJETIVO: readonly string[] = [
  "A pesquisa partiu de uma pergunta concreta: como se sustenta um equipamento turístico e cultural que funciona sem financiamento público ou privado, e o que ele movimenta ao redor de si.",
  "Para respondê-la, o Observatório acompanhou dois equipamentos culturais de Tobias Barreto e mediu a economia solidária que se forma em torno deles — quanto entra, quanto sai, onde a despesa é executada e quem é contratado.",
  "Em paralelo, construiu parâmetros de comparação entre políticas públicas municipais de cultura, ouvindo gestores de três municípios em contextos sociopolíticos diferentes. Um levantamento de informações turísticas e culturais na base de dados do Estado de Sergipe complementou o material reunido em campo.",
];

const MARCA_DA_PERGUNTA = "pergunta concreta: ";

/**
 * A pergunta de partida, recortada do próprio `OBJETIVO`.
 *
 * Ela não é escrita duas vezes: a abertura da página exibe este recorte e o
 * corpo do objetivo segue a partir do parágrafo seguinte. Se a redação do
 * objetivo deixar de enunciar a pergunta, isto falha em build em vez de
 * servir uma abertura vazia.
 */
function recortarPergunta(paragrafo: string): string {
  const corte = paragrafo.indexOf(MARCA_DA_PERGUNTA);
  if (corte < 0) {
    throw new Error(
      "O objetivo da pesquisa não enuncia a pergunta de partida.",
    );
  }
  const corpo = paragrafo.slice(corte + MARCA_DA_PERGUNTA.length).trim();
  return `${corpo.charAt(0).toUpperCase()}${corpo.slice(1).replace(/\.$/, "")}?`;
}

export const PERGUNTA = recortarPergunta(OBJETIVO[0] ?? "");

/** O objetivo a partir de onde a pergunta já foi feita. */
export const OBJETIVO_DEPOIS_DA_PERGUNTA: readonly string[] = OBJETIVO.slice(1);

/**
 * Os papéis da equipe, como as transcrições os apresentam. A lista descreve
 * função na pesquisa, e não vínculo de trabalho nem quantidade de pessoas:
 * o número de contratações do projeto é dado do edital, não desta página.
 */
export const PAPEIS: readonly {
  readonly papel: string;
  readonly texto: string;
}[] = [
  {
    papel: "Coordenação de pesquisa",
    texto:
      "Desenhou o recorte, conduziu as entrevistas com gestores públicos e respondeu pelos encaminhamentos metodológicos.",
  },
  {
    papel: "Agentes de campo",
    texto:
      "Frequentaram os equipamentos em rotina de visitação, acompanharam o preenchimento dos formulários e registraram o que os formulários não alcançam.",
  },
  {
    papel: "Análise de dados",
    texto:
      "Organizou as respostas, manteve o fluxo da coleta em dia e fez a decupagem que transformou registro diário em série e em indicador.",
  },
  {
    papel: "Ator-chave",
    texto:
      "Em cada equipamento, a pessoa responsável pelo espaço, em contato permanente com o Observatório. É quem preenche o registro diário e quem abre as portas do território à pesquisa.",
  },
];

export const ATOR_CHAVE: readonly string[] = [
  "O ator-chave é a peça central do método. A pesquisa entendeu, desde o desenho, que compreender o funcionamento desses lugares exigiria alguém em contato simultâneo com o Observatório e com o equipamento — alguém que fornecesse as informações que sustentam a decupagem dos dados, a leitura do sistema organizacional do espaço e a análise da economia solidária ao redor dele.",
  "Foram dois atores-chave, um em cada equipamento acompanhado. O do Recanto da Serra, agente cultural com atuação na cidade, fez também as pontes que levaram a pesquisa à comunidade da Serra dos Macacos e ao outro equipamento.",
  "A escolha tem uma consequência metodológica que a pesquisa assume: o registro diário é declarado por quem mantém o lugar. Foi para não depender só dele que os agentes de campo mantiveram visitação rotineira — para enxergar, com os próprios olhos, transformações que o formulário não capta.",
];

export type Instrumento = {
  readonly id: string;
  readonly nome: string;
  readonly quemPreenche: string;
  readonly quando: string;
  readonly registra: readonly string[];
  /**
   * Indicadores auditados que este instrumento sustenta, por id do dataset.
   *
   * A ligação é declarada, e não inferida do nome: `H4-006` conta dias de
   * operação relatados pelo responsável do equipamento, e `H4-007` conta as
   * contratações que o mesmo registro anota com data e valor — os dois saem
   * da rotina de funcionamento. O formulário do visitante fica com a lista
   * vazia de propósito: as contagens de público têm pendência metodológica
   * aberta e por isso não estão publicadas em lugar nenhum do site.
   */
  readonly indicadores: readonly string[];
  /**
   * Para que serve o formulário, em uma frase, quando ele não sustenta
   * indicador publicado.
   *
   * O texto é sobre a pesquisa, e não sobre o site: diz o que o instrumento
   * ajuda a compreender, e não por qual caminho interno um número deixou de
   * ser publicado.
   */
  readonly serventia: string | null;
};

export const INSTRUMENTOS: readonly Instrumento[] = [
  {
    id: "rotina",
    nome: "Formulário de rotina de funcionamento",
    quemPreenche: "O ator-chave do equipamento",
    quando: "A cada entrada ou saída de recurso, houvesse visita ou não",
    registra: [
      "compras e insumos, com onde e com quem foram comprados",
      "contratações do dia, com data e valor",
      "serviços de manutenção do espaço",
      "receita de taxa de funcionamento e de consumo no local",
    ],
    indicadores: ["H4-006", "H4-007"],
    serventia: null,
  },
  {
    id: "consumidor",
    nome: "Formulário do público consumidor",
    quemPreenche: "O próprio visitante",
    quando: "Durante a visita, a partir de QR Code disponível no equipamento",
    registra: [
      "faixa etária",
      "cidade de origem",
      "motivo da visita",
      "opinião sobre o espaço",
    ],
    indicadores: [],
    serventia:
      "Este formulário ajuda a compreender o perfil das visitas: a faixa etária de quem chegou, de onde veio, o que foi buscar no espaço e como avaliou a experiência.",
  },
];

/**
 * As quatro naturezas de evidência que a pesquisa produziu em campo.
 *
 * Não é taxonomia nova: são os dois instrumentos de coleta declarados acima,
 * as entrevistas gravadas e a presença da própria equipe no lugar — as mesmas
 * quatro coisas que `LEITURA` diz terem sido lidas em conjunto. A chave
 * existe para que o percurso possa dizer, etapa a etapa, o que ficou dela,
 * sem transformar isso em rótulo decorativo.
 */
export type TipoDeEvidencia =
  | "registro"
  | "formulario"
  | "entrevista"
  | "campo";

export type Evidencia = {
  readonly id: TipoDeEvidencia;
  readonly nome: string;
  readonly texto: string;
};

export const CHAVE_DE_EVIDENCIAS: readonly Evidencia[] = [
  {
    id: "registro",
    nome: "Registro diário",
    texto:
      "O formulário de rotina, preenchido pelo ator-chave a cada entrada ou saída de recurso — houvesse visita ou não.",
  },
  {
    id: "formulario",
    nome: "Formulário do visitante",
    texto:
      "Respondido por quem visita, a partir de QR Code disponível no próprio equipamento.",
  },
  {
    id: "entrevista",
    nome: "Entrevista gravada",
    texto:
      "Conversa registrada com quem mantém os lugares visitados e com quem responde pela política cultural nos municípios.",
  },
  {
    id: "campo",
    nome: "Trabalho de campo",
    texto:
      "A presença da equipe no lugar: visitação rotineira, reconhecimento do território e a oficina de devolução.",
  },
];

export type Etapa = {
  readonly numeral: string;
  readonly titulo: string;
  readonly paragrafos: readonly string[];
  /** Lugares nomeados pela própria etapa, na ordem em que ela os nomeia. */
  readonly onde: readonly string[];
  /** Naturezas de evidência que os parágrafos da etapa registram. */
  readonly evidencias: readonly TipoDeEvidencia[];
  /** Ausência declarada pela própria etapa, quando existe. */
  readonly semRegistro: string | null;
};

/**
 * O percurso, na ordem em que aconteceu (EP01). A troca de Itabaianinha por
 * Tomar do Geru está aqui como etapa, e não como nota de rodapé: alteração de
 * percurso é resultado de pesquisa, não defeito de execução.
 *
 * ## De onde sai `onde` e `evidencias`
 *
 * Nenhum dos dois campos classifica a etapa por fora. `onde` repete os
 * lugares que os próprios parágrafos nomeiam, na ordem em que aparecem.
 * `evidencias` lista a natureza do que cada etapa **diz** ter produzido:
 *
 * - I — "os formulários eram preenchidos dia a dia" cobre os dois
 *   instrumentos; "rotina mensal de visitação" e o reconhecimento da Serra
 *   dos Macacos são trabalho de campo.
 * - II — as entrevistas com a fundação de cultura e a diretoria de turismo
 *   estão escritas na etapa; a travessia de barco até Ilha Grande é campo.
 * - III — a entrevista de Tomar do Geru é a que fecha, na etapa IV, o
 *   comparativo "entre os três municípios", e tem documento próprio no
 *   acervo. Itabaianinha não tem evidência de campo, e a etapa já declara
 *   isso: a ausência aparece como ausência, não como lacuna de layout.
 * - IV — a oficina na Serra dos Macacos é campo; as entrevistas com a
 *   secretaria de cultura e com a prefeitura de Tobias Barreto estão escritas
 *   na etapa.
 */
export const PERCURSO: readonly Etapa[] = [
  {
    numeral: "I",
    titulo: "Dentro dos dois equipamentos, mês a mês",
    paragrafos: [
      "O acompanhamento do Recanto da Serra e do Museu Borda da Mata foi contínuo, em rotina mensal de visitação, enquanto os formulários eram preenchidos dia a dia. O Recanto registrava em ritmo semanal e, em alguns períodos, quase diário — foi essa regularidade que mostrou, cedo, que a coleta seguia no caminho certo.",
      "No mesmo intervalo, a equipe fez o reconhecimento da Serra dos Macacos — comunidade agrícola entre serras, alcançada por estrada de terra e por uma ponte de madeira sobre o Riacho do Caripau.",
    ],
    onde: ["Recanto da Serra", "Museu Borda da Mata", "Serra dos Macacos"],
    evidencias: ["registro", "formulario", "campo"],
    semRegistro: null,
  },
  {
    numeral: "II",
    titulo: "A comparação de políticas públicas",
    paragrafos: [
      "A segunda etapa levou a pesquisa a São Cristóvão, onde foram entrevistadas a fundação municipal de cultura e a diretoria de turismo. De lá, a equipe seguiu de barco para Ilha Grande, povoação do município com cultura pesqueira própria e a tradição do samba de coco preservada ali.",
      "Ilha Grande entrou no percurso porque a própria página oficial da prefeitura a apresentava como território ecoturístico aberto à visitação — e era essa política anunciada que a pesquisa foi conferir.",
    ],
    onde: ["São Cristóvão", "Ilha Grande"],
    evidencias: ["entrevista", "campo"],
    semRegistro: null,
  },
  {
    numeral: "III",
    titulo: "De Itabaianinha para Tomar do Geru",
    paragrafos: [
      "O terceiro ponto de comparação seria Itabaianinha, onde a pesquisa encontrou uma rota turística desativada, a Rota de Pedra Branca. As tentativas de contato com o governo municipal não tiveram sucesso, e o município permaneceu no recorte sem evidência de pesquisa de campo.",
      "O destino passou a ser Tomar do Geru: igreja histórica tombada, economia baseada na mineração de pedra e uma formação sociocultural ligada aos Kiriris. A mudança deu à pesquisa um eixo que ela não tinha — a conexão entre preservação da natureza e cultura dos povos originários.",
    ],
    onde: ["Itabaianinha", "Tomar do Geru"],
    evidencias: ["entrevista"],
    semRegistro:
      "Itabaianinha permaneceu no recorte sem evidência de pesquisa de campo.",
  },
  {
    numeral: "IV",
    titulo: "A devolução na Serra dos Macacos",
    paragrafos: [
      "O estudo se encerrou onde tinha começado a se abrir: numa oficina de montagem de equipamento cultural com a própria comunidade da Serra dos Macacos, feita para exercitar a autonomia local diante das oportunidades que o território oferece.",
      "Em Tobias Barreto, a pesquisa também entrevistou a secretaria municipal de cultura e a prefeitura, fechando o comparativo entre os três municípios.",
    ],
    onde: ["Serra dos Macacos", "Tobias Barreto"],
    evidencias: ["campo", "entrevista"],
    semRegistro: null,
  },
];

/**
 * O estado das entrevistas **não** é afirmado aqui: a página o resolve contra
 * `vw_anexo_publico`, entrevista por entrevista, e escreve a frase de acordo.
 * Estes parágrafos dizem só o que independe do estado.
 */
export const ESCUTA: readonly string[] = [
  "As entrevistas foram gravadas com quem mantém os lugares visitados e com quem responde pela política cultural nos municípios. Elas não ilustram o que os formulários já diziam: em praticamente todas apareceu um tema que nenhum formulário media — visibilidade. Um equipamento cultural só é visitado se, antes disso, se souber que ele existe.",
  "As entrevistas podem ser consultadas pelo lugar ou pela instituição relacionada. No acervo, cada documento reúne áudio, transcrição e data de publicação.",
];

/**
 * Os dois registros da escuta.
 *
 * A divisão não é criada aqui: `ESCUTA` já diz que as entrevistas foram
 * gravadas "com quem mantém os lugares visitados e com quem responde pela
 * política cultural nos municípios". Isto apenas diz qual das duas pontas
 * cada entrevista ocupa, por slug de documento — nunca por semelhança de
 * nome. Uma entrevista que não esteja em nenhuma das listas derruba o
 * agrupamento em build, em vez de sumir da página.
 */
export type RegistroDaEscuta = {
  readonly id: "lugares" | "gestao";
  readonly titulo: string;
  readonly texto: string;
  readonly documentos: readonly string[];
};

export const REGISTROS_DA_ESCUTA: readonly RegistroDaEscuta[] = [
  {
    id: "lugares",
    titulo: "Nos lugares visitados",
    texto:
      "Com quem mantém o espaço aberto e com quem vive o território em que ele está.",
    documentos: [
      "entrevista-oviedo-e-neide-abreu",
      "entrevista-pedro-menezes",
      "entrevista-lideranca-ilha-grande",
    ],
  },
  {
    id: "gestao",
    titulo: "Na gestão pública municipal",
    texto:
      "Com quem responde pela política cultural e de turismo em cada um dos municípios comparados.",
    documentos: [
      "entrevista-josenilson-bispo",
      "entrevista-paola-santana",
      "entrevista-marcio-andre",
      "entrevista-prefeito-tobias-barreto",
      "entrevista-laerte-aguiar",
    ],
  },
];

/**
 * Frase de estado quando todas as entrevistas têm arquivo público.
 *
 * Diz a quem lê o que pode fazer com elas — ouvir e ler por inteiro, sem
 * barreira de acesso. A redação anterior descrevia o caminho interno pelo
 * qual um documento ganha endereço público, que é assunto de quem opera o
 * site, e não de quem veio conhecer a pesquisa.
 */
export const ESCUTA_PUBLICA =
  "Elas podem ser ouvidas e lidas por inteiro, sem cadastro e sem pedido de acesso.";

/**
 * As entrevistas repartidas nos dois registros, sem perder nenhuma.
 *
 * O fail-closed é o mesmo das fichas de material: se uma entrevista nova
 * entrar em `ENTREVISTAS` sem ser classificada, o agrupamento falha em vez de
 * publicar uma escuta incompleta como se estivesse inteira.
 */
export function agruparEntrevistas(): readonly {
  readonly registro: RegistroDaEscuta;
  readonly entrevistas: readonly EntrevistaDaPesquisa[];
}[] {
  const classificados = new Set(
    REGISTROS_DA_ESCUTA.flatMap((registro) => registro.documentos),
  );
  const sobrando = LISTA_DE_ENTREVISTAS.filter(
    (entrevista) => !classificados.has(entrevista.documento),
  );
  if (sobrando.length > 0) {
    throw new Error(
      `Entrevista sem registro de escuta: ${sobrando
        .map((entrevista) => entrevista.documento)
        .join(", ")}.`,
    );
  }
  return REGISTROS_DA_ESCUTA.map((registro) => ({
    registro,
    entrevistas: LISTA_DE_ENTREVISTAS.filter((entrevista) =>
      registro.documentos.includes(entrevista.documento),
    ),
  }));
}

/**
 * Frase de estado enquanto nenhuma tem arquivo público.
 *
 * A primeira oração é a mesma da Home, e é o que liga as duas superfícies:
 * uma não pode dizer "restrito" enquanto a outra diz "público". O que saiu foi
 * a segunda, que explicava o trâmite de publicação em vez de dizer a quem lê
 * o que esperar.
 */
export const ESCUTA_RESTRITA =
  "Os áudios e as transcrições seguem restritos. Cada entrevista entra no acervo, com áudio e transcrição, assim que puder ser aberta ao público.";

export const LEITURA: readonly string[] = [
  "A leitura quantitativa não aparece isolada do campo. Os registros, formulários e indicadores foram analisados junto às entrevistas, às visitas e à observação dos lugares pesquisados. Essa combinação permite compreender não apenas números, mas também trajetórias, práticas culturais e relações construídas no território.",
  "Os formulários mostraram que o dinheiro circulava pelos equipamentos e não parava neles: cada visita puxava compra de alimento produzido na região, contratação de morador, aquisição de artesanato e pagamento de serviço local. As entrevistas explicaram por que isso acontece, e a observação direta mostrou o que nenhum dos dois alcança — a mudança da paisagem e da oferta a cada retorno da equipe.",
];

export type Limite = {
  readonly titulo: string;
  readonly texto: string;
};

/**
 * Limites declarados. Não são ressalvas de rodapé: são parte do resultado, e
 * as três primeiras saem das próprias transcrições, onde a equipe as enuncia.
 */
export const LIMITES: readonly Limite[] = [
  {
    titulo: "A janela cai na baixa temporada",
    texto:
      "O período coletado corresponde a um momento de baixa visitação nos dois equipamentos. No Borda da Mata isso pesa mais: foram onze visitantes registrados nos cinco meses. A leitura econômica do período precisa ser lida com essa janela à vista.",
  },
  {
    titulo: "O registro é declarado por quem mantém o lugar",
    texto:
      "O formulário de rotina é preenchido pelo ator-chave. A visitação rotineira dos agentes de campo existe para contrapor esse registro à observação direta, mas a pesquisa não audita caixa: ela lê o que foi declarado.",
  },
  {
    titulo: "Os dados falam antes das expectativas",
    texto:
      "A pesquisa assumiu como compromisso não confirmar o que gostaria de encontrar. Havia o receio de que a baixa temporada fizesse o Recanto parecer financeiramente inviável — e a decisão foi publicar o que o período mostrasse, não o que a hipótese pedia.",
  },
  {
    titulo: "Desenvolvimento turístico não é conclusão automática",
    texto:
      "A hipótese inicial de replicar um equipamento turístico e cultural na Serra dos Macacos foi revista durante o percurso. Onde há potencial turístico costuma haver também risco de predação do território e de sobreposição do interesse econômico à preservação da cultura camponesa, do patrimônio e da natureza. O dilema acompanhou a pesquisa até o fim e não foi resolvido por ela.",
  },
];

export const FECHO: readonly string[] = [
  "O que a pesquisa reuniu não fica guardado. Relatórios técnicos, fotografias de campo, formulários e entrevistas compõem um acervo com endereço permanente, e cada peça aparece aqui com o estado real que tem hoje — pública, restrita ou em revisão.",
];
