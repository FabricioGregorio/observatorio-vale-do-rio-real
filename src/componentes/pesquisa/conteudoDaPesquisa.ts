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
 *   por instituição ou lugar, nunca por pessoa.
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
 * Não nomeia pessoas. Os papéis da equipe aparecem como papéis — agente de
 * campo, analista de dados, coordenação de pesquisa —, que é como as próprias
 * transcrições os apresentam.
 */

import {
  FIM_DA_COLETA,
  INICIO_DA_COLETA,
  MESES_DE_COLETA,
} from "../../dados/indicadores/derivados";

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
  },
];

export type Etapa = {
  readonly numeral: string;
  readonly titulo: string;
  readonly paragrafos: readonly string[];
};

/**
 * O percurso, na ordem em que aconteceu (EP01). A troca de Itabaianinha por
 * Tomar do Geru está aqui como etapa, e não como nota de rodapé: alteração de
 * percurso é resultado de pesquisa, não defeito de execução.
 */
export const PERCURSO: readonly Etapa[] = [
  {
    numeral: "I",
    titulo: "Seis meses dentro dos dois equipamentos",
    paragrafos: [
      "O acompanhamento do Recanto da Serra e do Museu Borda da Mata foi contínuo, em rotina de visitação, enquanto os formulários eram preenchidos dia a dia. O Recanto registrava em ritmo semanal e, em alguns períodos, quase diário.",
      "No mesmo intervalo, a equipe fez o reconhecimento da Serra dos Macacos — comunidade agrícola entre serras, alcançada por estrada de terra e por uma ponte de madeira sobre o Riacho do Caripau.",
    ],
  },
  {
    numeral: "II",
    titulo: "A comparação de políticas públicas",
    paragrafos: [
      "A segunda etapa levou a pesquisa a São Cristóvão, onde foram entrevistadas a fundação municipal de cultura e a diretoria de turismo. De lá, a equipe seguiu de barco para Ilha Grande, povoação do município com cultura pesqueira própria e a tradição do samba de coco preservada ali.",
      "Ilha Grande entrou no percurso porque a própria página oficial da prefeitura a apresentava como território ecoturístico aberto à visitação — e era essa política anunciada que a pesquisa foi conferir.",
    ],
  },
  {
    numeral: "III",
    titulo: "De Itabaianinha para Tomar do Geru",
    paragrafos: [
      "O terceiro ponto de comparação seria Itabaianinha, onde a pesquisa encontrou uma rota turística desativada, a Rota de Pedra Branca. As tentativas de contato com o governo municipal não tiveram sucesso, e o município permaneceu no recorte sem evidência de pesquisa de campo.",
      "O destino passou a ser Tomar do Geru: igreja histórica tombada, economia baseada na mineração de pedra e uma formação sociocultural ligada aos Kiriris. A mudança deu à pesquisa um eixo que ela não tinha — a conexão entre preservação da natureza e cultura dos povos originários.",
    ],
  },
  {
    numeral: "IV",
    titulo: "A devolução na Serra dos Macacos",
    paragrafos: [
      "O estudo se encerrou onde tinha começado a se abrir: numa oficina de montagem de equipamento cultural com a própria comunidade da Serra dos Macacos, feita para exercitar a autonomia local diante das oportunidades que o território oferece.",
      "Em Tobias Barreto, a pesquisa também entrevistou a secretaria municipal de cultura e a prefeitura, fechando o comparativo entre os três municípios.",
    ],
  },
];

/**
 * O estado das entrevistas **não** é afirmado aqui: a página o resolve contra
 * `vw_anexo_publico`, entrevista por entrevista, e escreve a frase de acordo.
 * Estes parágrafos dizem só o que independe do estado.
 */
export const ESCUTA: readonly string[] = [
  "As entrevistas foram gravadas com quem mantém os lugares visitados e com quem responde pela política cultural nos municípios. Elas não ilustram o que os formulários já diziam: em praticamente todas apareceu um tema que nenhum formulário media — visibilidade. Um equipamento cultural só é visitado se, antes disso, se souber que ele existe.",
  "Esta página identifica cada entrevista pela instituição ou pelo lugar, e não por pessoa. A ficha de cada documento, com áudio, transcrição, data de publicação e hash, está no acervo.",
];

/** Frase de estado quando todas as entrevistas têm arquivo público. */
export const ESCUTA_PUBLICA =
  "Nenhuma delas foi publicada por associação: cada documento passou pelo mesmo gate dos demais arquivos do site, que exige revisão de privacidade concluída antes de existir endereço público.";

/** Frase de estado enquanto nenhuma tem arquivo público. */
export const ESCUTA_RESTRITA =
  "Os áudios e as transcrições seguem restritos. Eles entram no site quando cada entrevista passar pela revisão de privacidade — e não antes.";

export const LEITURA: readonly string[] = [
  "O registro diário virou série mensal, e a série virou indicador. Cada indicador publicado declara a regra de cálculo, a base sobre a qual foi apurado, o período e o recorte — e diz também o que não mede.",
  "Nem tudo o que a planilha calcula foi publicado. Indicador com pendência metodológica aberta na própria fonte ficou de fora: a contagem de visitantes tem uma visita em conciliação, e a contagem de pessoas distintas tem definição em aberto. O detalhamento por localidade dos trabalhadores contratados também não é publicado — há localidades com uma única pessoa, e o cruzamento permitiria identificá-la.",
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
