/**
 * Dataset derivado dos indicadores — H4.0.
 *
 * ## O que este arquivo é, e o que ele não é
 *
 * Não é cópia da planilha. É o conjunto mínimo de **valores agregados** que a
 * seção precisa para existir, com a procedência de cada um registrada ao lado.
 * A planilha de origem tem 17 abas; nenhuma linha individual foi copiada.
 *
 * ## Fonte de cálculo é interna; fonte pública é outra coisa
 *
 * A unidade documental que sustenta estes números continua **RESTRITA** como
 * conjunto: ela inclui abas que nomeiam pessoas. Uma fonte restrita pode
 * sustentar internamente uma agregação — é o que acontece aqui — mas isso não
 * autoriza publicar o identificador documental, o título interno, o nome do
 * arquivo, a aba ou o código de origem.
 *
 * Por isso cada indicador tem dois campos separados:
 *
 * - `fontePublica`, que **pode** ser renderizado;
 * - `procedencia`, que **nunca** é renderizado e existe para auditoria interna
 *   e para os testes de conferência. Mesmo padrão de `pesquisa/derivados.ts`,
 *   onde o nome do original também fica no módulo e fora do HTML.
 *
 * ## Nenhum valor foi inferido
 *
 * Todo valor abaixo está declarado na fonte. Quando o valor também pode ser
 * recalculado a partir de outros valores deste mesmo arquivo, a conferência
 * está descrita em `procedencia.conferencia` e coberta por teste.
 *
 * Indicadores com pendência metodológica aberta na própria fonte — contagem de
 * visitantes com uma visita em conciliação, contagem de pessoas remuneradas
 * distintas com definição em aberto, gênero inferido pelo prenome — **não
 * entram aqui**. A matriz completa, com APTOS, PENDENTES e NÃO PUBLICAR, está
 * em `docs/frontend/H4_DADOS_INDICADORES_PROTOTIPO.md`.
 */

export type UnidadeDoIndicador = "percentual" | "reais" | "contagem" | "fator";

/** Rastro interno. Nunca renderizado: ver o cabeçalho deste arquivo. */
export type ProcedenciaDoIndicador = {
  readonly aba: string;
  readonly linha: number;
  /** Código do indicador dentro da fonte, quando existe. */
  readonly codigoNaFonte: string | null;
  /** Como reconferir o valor. */
  readonly conferencia: string;
};

export type IndicadorDerivado = {
  /** Namespace próprio da H4. Não é código do inventário do edital. */
  readonly id: string;
  readonly titulo: string;
  readonly valorBruto: number;
  readonly unidade: UnidadeDoIndicador;
  readonly casasDecimais: number;
  /** Universo sobre o qual o valor foi apurado. `null` quando não se aplica. */
  readonly base: string | null;
  readonly periodo: string;
  readonly recorte: string;
  /** Regra de cálculo em linguagem pública. */
  readonly regra: string;
  readonly notaMetodologica: string | null;
  readonly fontePublica: string;
  readonly procedencia: ProcedenciaDoIndicador;
};

const PERIODO = "21/07/2025 a 21/12/2025";
const RECORTE =
  "Ecoparque e Museu Recanto da Serra e Centro Cultural e Museu Borda da Mata, em Tobias Barreto (SE)";
const FONTE_PUBLICA = "Levantamento próprio do Observatório";

/**
 * Despesa com localidade e valor identificados, em reais.
 *
 * É a base do indicador de retenção municipal, e **não** é a despesa total: a
 * diferença são as despesas que o formulário declarou apenas como total do dia,
 * sem localidade ou sem valor por item.
 */
export const DESPESA_IDENTIFICADA_TOTAL = 16_055.8;

/** Parcela da despesa identificada executada dentro do município. */
export const DESPESA_IDENTIFICADA_NO_MUNICIPIO = 14_995.8;

export const INDICADORES = [
  {
    id: "H4-001",
    titulo: "Retenção municipal da despesa",
    valorBruto: 0.933_980_243_9,
    unidade: "percentual",
    casasDecimais: 1,
    base: "R$ 16.055,80 de despesa com localidade e valor identificados",
    periodo: PERIODO,
    recorte: RECORTE,
    regra:
      "Despesa executada dentro de Tobias Barreto dividida pela despesa identificada total.",
    notaMetodologica:
      "A despesa declarada apenas como total do dia, sem localidade ou sem valor por item, fica fora da base.",
    fontePublica: FONTE_PUBLICA,
    procedencia: {
      aba: "03_Indicadores_Solidaria",
      linha: 5,
      codigoNaFonte: "ES01",
      conferencia:
        "DESPESA_IDENTIFICADA_NO_MUNICIPIO / DESPESA_IDENTIFICADA_TOTAL",
    },
  },
  {
    id: "H4-002",
    titulo: "Valor movimentado por dia de funcionamento",
    valorBruto: 469.063,
    unidade: "reais",
    casasDecimais: 2,
    base: "40 registros de funcionamento",
    periodo: PERIODO,
    recorte: RECORTE,
    regra:
      "Despesa total do período dividida pelo número de registros de funcionamento.",
    notaMetodologica: null,
    fontePublica: FONTE_PUBLICA,
    procedencia: {
      aba: "03_Indicadores_Solidaria",
      linha: 30,
      codigoNaFonte: "ES26",
      conferencia: "despesa total / registros de funcionamento",
    },
  },
  {
    id: "H4-003",
    titulo: "Despesa total no período",
    valorBruto: 18_762.52,
    unidade: "reais",
    casasDecimais: 2,
    base: null,
    periodo: PERIODO,
    recorte: RECORTE,
    regra: "Compras e insumos somados às contratações de trabalho.",
    notaMetodologica: null,
    fontePublica: FONTE_PUBLICA,
    procedencia: {
      aba: "02_Painel_Executivo",
      linha: 18,
      codigoNaFonte: null,
      conferencia: "soma da coluna de despesa da série mensal",
    },
  },
  {
    id: "H4-004",
    titulo: "Receita registrada no período",
    valorBruto: 15_700,
    unidade: "reais",
    casasDecimais: 2,
    base: null,
    periodo: PERIODO,
    recorte: RECORTE,
    regra: "Soma do valor arrecadado declarado nos registros diários.",
    notaMetodologica: null,
    fontePublica: FONTE_PUBLICA,
    procedencia: {
      aba: "02_Painel_Executivo",
      linha: 15,
      codigoNaFonte: null,
      conferencia: "soma da coluna de receita da série mensal",
    },
  },
  {
    id: "H4-005",
    titulo: "Participação do trabalho na despesa",
    valorBruto: 0.406_128_814_3,
    unidade: "percentual",
    casasDecimais: 1,
    base: "R$ 18.762,52 de despesa total",
    periodo: PERIODO,
    recorte: RECORTE,
    regra:
      "Despesa com contratações dividida pela soma de compras e contratações.",
    notaMetodologica: null,
    fontePublica: FONTE_PUBLICA,
    procedencia: {
      aba: "03_Indicadores_Solidaria",
      linha: 7,
      codigoNaFonte: "ES03",
      conferencia: "contratações da série mensal / despesa total",
    },
  },
  {
    id: "H4-006",
    titulo: "Registros de funcionamento coletados",
    valorBruto: 40,
    unidade: "contagem",
    casasDecimais: 0,
    base: null,
    periodo: PERIODO,
    recorte: RECORTE,
    regra:
      "Cada registro corresponde a um dia de operação relatado pelo responsável do equipamento.",
    notaMetodologica: null,
    fontePublica: FONTE_PUBLICA,
    procedencia: {
      aba: "02_Painel_Executivo",
      linha: 6,
      codigoNaFonte: null,
      conferencia: "soma da coluna de registros da série mensal",
    },
  },
  {
    id: "H4-007",
    titulo: "Contratações de trabalho registradas",
    valorBruto: 84,
    unidade: "contagem",
    casasDecimais: 0,
    base: null,
    periodo: PERIODO,
    recorte: RECORTE,
    regra:
      "Cada contratação corresponde a uma pessoa contratada em um dia de registro.",
    notaMetodologica:
      "É contagem de contratações, não de pessoas: a mesma pessoa pode aparecer em dias diferentes.",
    fontePublica: FONTE_PUBLICA,
    procedencia: {
      aba: "02_Painel_Executivo",
      linha: 22,
      codigoNaFonte: null,
      conferencia: "soma da coluna de contratações da série mensal",
    },
  },
  {
    id: "H4-008",
    titulo: "Localidades alcançadas pela renda do trabalho",
    valorBruto: 12,
    unidade: "contagem",
    casasDecimais: 0,
    base: null,
    periodo: PERIODO,
    recorte: RECORTE,
    regra:
      "Contagem distinta de localidades de origem declaradas pelos trabalhadores contratados.",
    notaMetodologica:
      "O detalhamento por localidade não é publicado: há localidades com uma única pessoa, e o cruzamento permitiria identificá-la.",
    fontePublica: FONTE_PUBLICA,
    procedencia: {
      aba: "03_Indicadores_Solidaria",
      linha: 20,
      codigoNaFonte: "ES16",
      conferencia: "contagem distinta na aba de localidades",
    },
  },
] as const satisfies readonly IndicadorDerivado[];

export type MesDaSerie = {
  readonly rotulo: string;
  readonly receita: number;
  readonly despesa: number;
  readonly registros: number;
  readonly contratacoes: number;
};

/**
 * Série mensal consolidada dos dois equipamentos.
 *
 * A coluna de pessoas distintas da fonte **não** entra aqui: a linha de total
 * dela soma as contagens mensais e chega a 60, que não é o número de pessoas
 * distintas do período. Somar contagem distinta mês a mês conta duas vezes
 * quem trabalhou em meses diferentes.
 */
export const SERIE_MENSAL = [
  {
    rotulo: "Jul/2025",
    receita: 200,
    despesa: 1_468,
    registros: 8,
    contratacoes: 7,
  },
  {
    rotulo: "Ago/2025",
    receita: 3_350,
    despesa: 4_400,
    registros: 9,
    contratacoes: 21,
  },
  {
    rotulo: "Set/2025",
    receita: 3_720,
    despesa: 4_867.8,
    registros: 8,
    contratacoes: 29,
  },
  {
    rotulo: "Out/2025",
    receita: 3_100,
    despesa: 2_010,
    registros: 7,
    contratacoes: 9,
  },
  {
    rotulo: "Nov/2025",
    receita: 4_650,
    despesa: 4_370,
    registros: 6,
    contratacoes: 12,
  },
  {
    rotulo: "Dez/2025",
    receita: 680,
    despesa: 1_646.72,
    registros: 2,
    contratacoes: 6,
  },
] as const satisfies readonly MesDaSerie[];

export type AtividadeOfertada = {
  readonly nome: string;
  readonly tipo: string;
  readonly diasComAtividade: number;
  readonly receita: "direta" | "indireta";
};

/**
 * Atividades acionadas no período, por número de dias com registro.
 *
 * A coluna de visitantes alcançados por atividade existe na fonte e **não**
 * entra aqui: ela conta a mesma pessoa em cada atividade que fez, então a soma
 * das linhas ultrapassa o público do período e convidaria à leitura errada.
 */
export const ATIVIDADES = [
  {
    nome: "Museus",
    tipo: "Patrimônio e memória",
    diasComAtividade: 23,
    receita: "indireta",
  },
  {
    nome: "Memorial Epifânio Dória",
    tipo: "Patrimônio e memória",
    diasComAtividade: 21,
    receita: "indireta",
  },
  {
    nome: "Visita à Igreja de Pedras",
    tipo: "Patrimônio natural e religioso",
    diasComAtividade: 21,
    receita: "indireta",
  },
  {
    nome: "Sala Sergipe da Mensagem de Silo",
    tipo: "Espiritualidade e humanismo",
    diasComAtividade: 19,
    receita: "indireta",
  },
  {
    nome: "Almoço",
    tipo: "Gastronomia regional",
    diasComAtividade: 14,
    receita: "direta",
  },
  {
    nome: "Banho no rio ou piscina",
    tipo: "Lazer e natureza",
    diasComAtividade: 13,
    receita: "indireta",
  },
  {
    nome: "Observação de pássaros",
    tipo: "Ecoturismo",
    diasComAtividade: 12,
    receita: "indireta",
  },
  {
    nome: "Veredas da Fé",
    tipo: "Turismo religioso",
    diasComAtividade: 10,
    receita: "indireta",
  },
  {
    nome: "Trilhas",
    tipo: "Ecoturismo",
    diasComAtividade: 8,
    receita: "indireta",
  },
  {
    nome: "Visita ao Vale Assombrado",
    tipo: "Turismo histórico-cultural",
    diasComAtividade: 7,
    receita: "indireta",
  },
  {
    nome: "Café da manhã",
    tipo: "Gastronomia regional",
    diasComAtividade: 6,
    receita: "direta",
  },
  {
    nome: "Chalés",
    tipo: "Hospedagem",
    diasComAtividade: 6,
    receita: "direta",
  },
  {
    nome: "Passeios alternativos",
    tipo: "Ecoturismo",
    diasComAtividade: 5,
    receita: "indireta",
  },
  {
    nome: "Janta",
    tipo: "Gastronomia regional",
    diasComAtividade: 4,
    receita: "direta",
  },
  {
    nome: "Veredas do cangaço",
    tipo: "Turismo histórico-cultural",
    diasComAtividade: 4,
    receita: "indireta",
  },
  {
    nome: "Atividades artísticas",
    tipo: "Produção artística",
    diasComAtividade: 1,
    receita: "indireta",
  },
] as const satisfies readonly AtividadeOfertada[];

export const CONTEXTO_DOS_DADOS = {
  periodo: PERIODO,
  recorte: RECORTE,
  fontePublica: FONTE_PUBLICA,
  registrosDeFuncionamento: 40,
  /** SHA-256 do workbook de origem, fora do repositório. */
  sha256DaFonte:
    "10143117a960f3a07a84d3f798029d1490399b90b6276e42763d6c5f7b52c7b1",
} as const;
