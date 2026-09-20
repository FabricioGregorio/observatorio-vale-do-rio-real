/**
 * Conteúdo editorial de `/dados`.
 *
 * ## Nenhum número mora aqui
 *
 * Toda grandeza exibida na página vem de `dados/indicadores/derivados.ts` —
 * os oito indicadores auditados, a série mensal, as atividades, a janela de
 * coleta e as duas pontas da despesa identificada. Este módulo só escreve as
 * frases que dão contexto a elas.
 *
 * `procedencia` **nunca** é renderizada: ela nomeia aba, linha e código
 * interno da fonte de cálculo, e o cabeçalho de `derivados.ts` proíbe
 * publicá-los. O que a página serve é `fontePublica`.
 *
 * ## O que esta página não afirma
 *
 * Que os números descrevem o Vale do Rio Real. Eles descrevem **dois
 * equipamentos culturais de Tobias Barreto**, num recorte de cinco meses que
 * cai em período de baixa visitação. A frase de recorte vem do próprio
 * dataset, em `recorte`, e é repetida em cada ficha de indicador — não é
 * decoração: é o denominador da leitura inteira.
 *
 * Indicador com pendência metodológica aberta na fonte continua fora, como em
 * `derivados.ts`: contagem de visitantes e contagem de pessoas distintas não
 * aparecem, e o detalhamento por localidade dos trabalhadores contratados
 * também não.
 */

import {
  CONTEXTO_DOS_DADOS,
  DESPESA_IDENTIFICADA_NO_MUNICIPIO,
  DESPESA_IDENTIFICADA_TOTAL,
  FIM_DA_COLETA,
  INDICADORES,
  INICIO_DA_COLETA,
  MESES_DE_COLETA,
  SERIE_MENSAL,
} from "../../dados/indicadores/derivados";

export {
  ATIVIDADES,
  CONTEXTO_DOS_DADOS,
  DESPESA_IDENTIFICADA_NO_MUNICIPIO,
  DESPESA_IDENTIFICADA_TOTAL,
  INDICADORES,
  MESES_DE_COLETA,
  SERIE_MENSAL,
} from "../../dados/indicadores/derivados";

/** `2025-07-21` → `21/07/2025`. Mesma regra de exibição dos indicadores. */
function exibirData(iso: string): string {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

export const PERIODO = `${exibirData(INICIO_DA_COLETA)} a ${exibirData(FIM_DA_COLETA)}`;

/**
 * Recorte dos indicadores, lido do próprio dataset.
 *
 * Os oito declaram o mesmo valor; a página lê o do primeiro e um teste confere
 * que não há divergência. Escrever a frase aqui abriria a porta para a página
 * afirmar um recorte que o dataset não sustenta.
 */
export const RECORTE = INDICADORES[0]?.recorte ?? "";

export const FONTE_PUBLICA = CONTEXTO_DOS_DADOS.fontePublica;

export const SINTESE =
  "O que dois equipamentos culturais de Tobias Barreto registraram, dia a " +
  "dia, durante cinco meses: o que entrou, o que saiu, onde a despesa foi " +
  "executada e quem foi contratado.";

/**
 * A advertência de amostra, dita antes de qualquer número.
 *
 * Ela abre a página de propósito. Um conjunto de indicadores apresentado sem
 * denominador vira, na leitura de quem passa, retrato de uma região — e não é
 * isso que a pesquisa mediu.
 */
export const ADVERTENCIA_DE_AMOSTRA =
  "Estes números não descrevem o Vale do Rio Real. Descrevem dois equipamentos culturais de Tobias Barreto, entre julho e dezembro de 2025, a partir do que seus responsáveis registraram.";

export const O_QUE_FOI_MEDIDO: readonly string[] = [
  "A cada entrada ou saída de recurso, o responsável por cada equipamento preencheu um registro: o que comprou e de quem, quem contratou e por quanto, que serviço pagou, quanto entrou em taxa de funcionamento e em consumo no local. Foi desse registro diário que saiu tudo o que está nesta página.",
  "Em paralelo, um formulário disponível por QR Code no próprio equipamento recolheu faixa etária, cidade de origem, motivo da visita e opinião de quem visitou. Ele sustenta a leitura de perfil, e não a leitura econômica.",
];

/**
 * Como ler a série mensal sem tropeçar na contagem de meses.
 *
 * A janela fecha cinco meses completos e toca seis meses do calendário. As
 * duas leituras são verdadeiras e medem coisas diferentes; `derivados.ts`
 * registra exatamente isso, e é por isso que a tabela tem seis linhas.
 */
export const NOTA_DA_SERIE = `A janela de coleta vai de ${PERIODO}: ${MESES_DE_COLETA} meses completos, distribuídos por ${SERIE_MENSAL.length} meses do calendário. Julho e dezembro entram parciais, e é por isso que a série tem ${SERIE_MENSAL.length} linhas para ${MESES_DE_COLETA} meses de coleta.`;

/**
 * A retenção municipal, dita com o denominador na frente.
 *
 * `formatarPercentual` desenha o valor; esta frase garante que ele nunca
 * apareça sozinho. Percentual sem base é o defeito que a direção editorial
 * deste lote proíbe por nome.
 */
export const LEITURA_DA_RETENCAO: readonly string[] = [
  "Nem toda despesa do período pôde ser localizada: parte dela foi declarada apenas como total do dia, sem localidade ou sem valor por item. Essa parte fica fora da conta.",
  "O que sobra — a despesa com localidade e valor identificados — é a base sobre a qual a retenção municipal é medida. O indicador diz que fração dela foi executada dentro de Tobias Barreto. Ele não mede lucro, não mede impacto e não descreve o que aconteceu fora dessa base.",
];

export const NOTA_DAS_ATIVIDADES =
  "A coluna de visitantes alcançados por atividade existe na fonte e não entra aqui: ela conta a mesma pessoa em cada atividade que fez, e a soma das linhas ultrapassaria o público do período.";

export type Limite = {
  readonly titulo: string;
  readonly texto: string;
};

/**
 * Os limites da leitura. Não são ressalva de rodapé: são o que impede a
 * página de ser lida como retrato de uma região.
 *
 * Os dois primeiros saem do próprio `derivados.ts`; o terceiro, das
 * transcrições revisadas do PodObservar (EP02 e EP03), que registram a janela
 * de baixa visitação; o quarto é a consequência direta do desenho do método,
 * descrito em `/pesquisa`.
 */
export const LIMITES: readonly Limite[] = [
  {
    titulo: "A amostra são dois equipamentos",
    texto:
      "Nenhum número aqui foi apurado fora do Recanto da Serra e do Centro Cultural e Museu Borda da Mata. Eles não representam os cinco municípios do recorte nem o conjunto dos equipamentos culturais do Vale.",
  },
  {
    titulo: "Nem tudo o que a fonte calcula foi publicado",
    texto:
      "Indicador com pendência metodológica aberta ficou fora: a contagem de visitantes tem uma visita em conciliação e a contagem de pessoas distintas tem definição em aberto. O detalhamento por localidade de quem foi contratado também não é publicado — há localidades com uma única pessoa, e o cruzamento permitiria identificá-la.",
  },
  {
    titulo: "A janela cai na baixa temporada",
    texto:
      "Os cinco meses coletados correspondem a um período de baixa visitação nos dois equipamentos. A leitura econômica precisa ser feita com essa janela à vista, e não projetada sobre o ano.",
  },
  {
    titulo: "O registro é declarado por quem mantém o lugar",
    texto:
      "A pesquisa não audita caixa: ela lê o que foi declarado no formulário de rotina, acompanhado de perto pelos agentes de campo. É um registro de operação, não uma demonstração contábil.",
  },
];

/**
 * Arquivos públicos que a página destaca, pelo rótulo exato com que o acervo
 * os publica.
 *
 * Declarado, e resolvido contra `vw_anexo_publico` em build: rótulo que não
 * existir no acervo simplesmente não vira linha. Nenhum link é construído a
 * partir de convenção de nome — a URL, a licença, o tamanho e o hash vêm do
 * registro, como na Sala do Avaliador.
 *
 * A planilha integral de indicadores **não** está nesta seleção. Ela é
 * pública no acervo e continua acessível pela ficha do conjunto, linkada ao
 * lado; o que esta página destaca são as peças que explicam o método e as
 * respostas dos formulários. Ver a dúvida registrada no relatório do lote.
 */
export const FONTES_DESTACADAS: readonly {
  readonly rotulo: string;
  readonly descricao: string;
}[] = [
  {
    rotulo: "A11-16 — dicionario dados",
    descricao:
      "O que cada campo significa, em que unidade e com que regra foi apurado.",
  },
  {
    rotulo: "A11-11 — nota metodologica",
    descricao:
      "As decisões de apuração, o que entrou em cada base e o que ficou de fora.",
  },
  {
    rotulo: "A11-02 — painel executivo",
    descricao: "A consolidação de onde saem a série mensal e os totais.",
  },
  {
    rotulo: "A11-05 — serie mensal",
    descricao: "Receita, despesa, registros e contratações mês a mês.",
  },
  {
    rotulo: "A09 — respostas de rotina de funcionamento",
    descricao:
      "As respostas do formulário preenchido pelos responsáveis dos dois equipamentos.",
  },
  {
    rotulo: "A10 — respostas de visitantes, Recanto da Serra",
    descricao: "As respostas do formulário do público consumidor, por QR Code.",
  },
  {
    rotulo: "A10 — respostas de visitantes, Borda da Mata",
    descricao: "As respostas do formulário do público consumidor, por QR Code.",
  },
];

/** Documento do acervo que reúne o conjunto completo dos indicadores. */
export const CONJUNTO_NO_ACERVO = "anexo-indicadores-etapa-1";

/** Razão entre as duas pontas da despesa identificada, recalculada aqui. */
export const RETENCAO_RECALCULADA =
  DESPESA_IDENTIFICADA_NO_MUNICIPIO / DESPESA_IDENTIFICADA_TOTAL;
