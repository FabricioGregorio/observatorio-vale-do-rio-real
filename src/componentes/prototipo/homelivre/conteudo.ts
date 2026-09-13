import type { Route } from "next";

import {
  CAMINHO_DAS_MARCAS,
  MARCA_COLETIVO,
  SIMBOLO_OBSERVATORIO,
} from "../../../dados/hero/derivados";

/**
 * Conteúdo do experimento `/dev/home-livre`.
 *
 * ## Estado editorial
 *
 * Tudo que é **frase nova** neste experimento é proposta de texto e depende
 * de aprovação humana antes de qualquer uso público. Os fatos por trás de cada
 * frase estão em `FONTES`, e a página os mostra num bloco recolhível por seção.
 *
 * Nenhum número é escrito à mão para ser exibido como indicador: os valores de
 * dados vêm de `src/dados/indicadores/derivados.ts`, e as contagens de
 * território são derivadas de `recorte.ts` no componente.
 *
 * ## O que é marcação de substituição
 *
 * Onde o material real não está no repositório, o campo é `null` e a página
 * mostra a lacuna como lacuna. Nenhum título, capa, duração ou link é
 * sugerido.
 */

/** Nome oficial. Mesmo texto do Hero público (Direção Visual §8.4). */
export const NOME_OFICIAL =
  "Observatório de Cultura e Economia Criativa da Região do Vale do Rio Real";

export const COLETIVO = "Coletivo Cultural “Tobias, sou Eu!”";

/** Doc 01, cabeçalho: “Fomento”. */
export const EDITAL = "Edital de Chamamento Público PNAB nº 02/2025";
export const EDITAL_CURTO = "Edital PNAB nº 02/2025";
export const LINHA_DO_EDITAL = "Observatórios de Cultura e Economia Criativa";

/** Doc 01, cabeçalho: “Avaliação / prestação de contas”. */
export const ACOMPANHAMENTO = "FUNCAP — Sergipe";

export type Fonte = {
  readonly afirmacao: string;
  readonly base: string;
};

export type EstadoDoMaterial = "publicado" | "restrito" | "pendente";

export const ROTULO_DO_ESTADO: Readonly<Record<EstadoDoMaterial, string>> = {
  publicado: "Público",
  restrito: "Restrito",
  pendente: "Em revisão",
};

/**
 * Relatório Técnico — Recanto da Serra (A02).
 *
 * Lido de `https://observatoriotobiassoueu.com.br/anexos.json` em 2026-09-13.
 * No experimento o endereço está fixo; numa integração real ele viria de
 * `listarAnexosPublicos()`, em build, como na Sala do Avaliador.
 */
export const RELATORIO_DO_RECANTO = {
  codigo: "A02",
  titulo: "Relatório Técnico — Recanto da Serra",
  url: "https://acervo.observatoriotobiassoueu.com.br/arquivos/analise-de-dados/a02-relatorio-tecnico-recanto-da-serra-publico-v1.pdf",
  bytes: 756_239,
  licenca: "CC BY-SA 4.0",
  sha256: "b314cd7a5330276ecccc0c7cfe7dfe6461da721055318c15957db5cd7848961a",
} as const;

export type ItemReunido = {
  readonly material: string;
  readonly estado: EstadoDoMaterial;
};

export type Equipamento = {
  readonly id: "recanto-da-serra" | "borda-da-mata";
  readonly nome: string;
  readonly lugar: string;
  readonly reunido: readonly ItemReunido[];
};

/**
 * Os dois equipamentos de Tobias Barreto.
 *
 * Nomes completos: recorte dos indicadores (`indicadores/derivados.ts`).
 * “Povoado Jacaré”: resumo executivo do A02 público. Os materiais listados
 * são os do inventário e da auditoria H3; o estado é o documental vigente.
 */
export const EQUIPAMENTOS: readonly Equipamento[] = [
  {
    id: "recanto-da-serra",
    nome: "Ecoparque e Museu Recanto da Serra",
    lugar: "Povoado Jacaré · Tobias Barreto (SE)",
    reunido: [
      { material: "Relatório técnico", estado: "publicado" },
      { material: "Entrevista gravada", estado: "restrito" },
      {
        material: "Formulários de funcionamento e de visitantes",
        estado: "restrito",
      },
      { material: "Fotografias de campo", estado: "pendente" },
    ],
  },
  {
    id: "borda-da-mata",
    nome: "Centro Cultural e Museu Borda da Mata",
    lugar: "Tobias Barreto (SE)",
    reunido: [
      { material: "Relatório técnico", estado: "restrito" },
      { material: "Entrevista gravada", estado: "restrito" },
      {
        material: "Formulários de funcionamento e de visitantes",
        estado: "restrito",
      },
      { material: "Fotografias de campo", estado: "pendente" },
    ],
  },
];

/**
 * Fotografias de campo do Borda da Mata no corpus: H3-F001 a H3-F007 da
 * auditoria H3. Nenhuma tem derivado público; três têm sinal de pessoa
 * identificável e quatro não foram decodificadas (HEIC).
 */
export const FOTOGRAFIAS_DO_BORDA_NO_ACERVO = 7;

export type Entrevista = {
  readonly numero: string;
  readonly onde: string;
  /** `null` quando o município não está consolidado em documento. */
  readonly municipio: string | null;
};

/**
 * As oito entrevistas, identificadas por instituição ou lugar — nunca por
 * pessoa. Numeração e rótulos: `MAPA_FONTES_CANONICAS_2026-09-05.md` §4.
 * Município de Ilha Grande segue não consolidado (`pontos.ts`).
 */
export const ENTREVISTAS: readonly Entrevista[] = [
  { numero: "01", onde: "Secretaria de Cultura", municipio: "Tobias Barreto" },
  {
    numero: "02",
    onde: "Centro Cultural e Museu Borda da Mata",
    municipio: "Tobias Barreto",
  },
  { numero: "03", onde: "Fundação de Cultura", municipio: "São Cristóvão" },
  { numero: "04", onde: "Diretoria de Turismo", municipio: "São Cristóvão" },
  { numero: "05", onde: "Recanto da Serra", municipio: "Tobias Barreto" },
  { numero: "06", onde: "Prefeitura", municipio: "Tobias Barreto" },
  {
    numero: "07",
    onde: "Secretaria Municipal de Cultura",
    municipio: "Tomar do Geru",
  },
  { numero: "08", onde: "Ilha Grande", municipio: null },
];

export type EpisodioPendente = {
  readonly numero: number;
  readonly titulo: null;
  readonly duracao: null;
  readonly url: null;
  readonly transcricao: null;
};

/**
 * PodObservar.
 *
 * `episodiosPublicados` e `plataformas` vêm da instrução do responsável em
 * 2026-09-13. Títulos, capas, durações, links e transcrições **não** estão no
 * repositório, e por isso são `null`: o experimento mostra a estrutura, não
 * conteúdo sugerido.
 */
export const PODOBSERVAR = {
  episodiosPublicados: 3,
  plataformas: ["Spotify", "YouTube"],
  episodios: [1, 2, 3].map(
    (numero): EpisodioPendente => ({
      numero,
      titulo: null,
      duracao: null,
      url: null,
      transcricao: null,
    }),
  ),
} as const;

export type DestinoDoProduto =
  | { readonly tipo: "externo"; readonly href: string }
  | { readonly tipo: "rota"; readonly href: Route }
  | { readonly tipo: "ancora"; readonly href: `#${string}` };

export type MarcaNaRegua = {
  readonly nome: string;
  /** Asset já versionado. `null` quando o arquivo oficial não está no repo. */
  readonly arquivo: string | null;
  readonly largura: number | null;
  readonly altura: number | null;
  /** Onde o arquivo oficial foi localizado no corpus, fora do Git. */
  readonly noCorpus: string | null;
};

export type GrupoDaRegua = {
  readonly grupo: "projeto" | "apoio" | "fomento";
  readonly rotulo: string;
  readonly marcas: readonly MarcaNaRegua[];
};

/**
 * Régua de marcas — hierarquia pedida pelo responsável em 2026-09-13:
 * projeto; depois FUNCAP e Governo do Estado de Sergipe; na extrema direita
 * PNAB seguida de MinC/Governo Federal, com Governo Federal fechando.
 *
 * **Conceitual.** Nenhuma marca de terceiro é copiada: os arquivos oficiais
 * existem no corpus (classificação da auditoria de fontes canônicas), mas não
 * no repositório, e a publicação depende de validação técnica / nada opor.
 */
export const REGUA_DE_MARCAS: readonly GrupoDaRegua[] = [
  {
    grupo: "projeto",
    rotulo: "Projeto",
    marcas: [
      {
        nome: "Observatório",
        arquivo: `${CAMINHO_DAS_MARCAS}/${SIMBOLO_OBSERVATORIO.arquivo}`,
        largura: SIMBOLO_OBSERVATORIO.largura,
        altura: SIMBOLO_OBSERVATORIO.altura,
        noCorpus: null,
      },
      {
        nome: COLETIVO,
        arquivo: `${CAMINHO_DAS_MARCAS}/${MARCA_COLETIVO.arquivo}`,
        largura: MARCA_COLETIVO.largura,
        altura: MARCA_COLETIVO.altura,
        noCorpus: null,
      },
    ],
  },
  {
    grupo: "apoio",
    rotulo: "Apoio / parceria",
    marcas: [
      {
        nome: "FUNCAP",
        arquivo: null,
        largura: null,
        altura: null,
        noCorpus: "marcas-15 a marcas-18",
      },
      {
        nome: "Governo do Estado de Sergipe",
        arquivo: null,
        largura: null,
        altura: null,
        noCorpus: "marcas-19 a marcas-23",
      },
    ],
  },
  {
    grupo: "fomento",
    rotulo: "Fomento",
    marcas: [
      {
        nome: "PNAB",
        arquivo: null,
        largura: null,
        altura: null,
        noCorpus: "marcas-09 a marcas-14",
      },
      {
        nome: "Ministério da Cultura · Governo Federal",
        arquivo: null,
        largura: null,
        altura: null,
        noCorpus: "marcas-02 a marcas-08 e marcas-prancheta-1",
      },
    ],
  },
];

/** Base factual de cada seção. Mostrada só no experimento. */
export const FONTES = {
  abertura: [
    {
      afirmacao: "Nome oficial",
      base: "Direção Visual §8.4; mesmo texto do Hero público.",
    },
    {
      afirmacao: "Realização, fomento e prestação de contas",
      base: "docs/01-arquitetura-informacao.md, cabeçalho; AGENTS.md.",
    },
    {
      afirmacao: "Municípios do recorte",
      base: "Contagem derivada de src/dados/territorio/recorte.ts.",
    },
    {
      afirmacao: "Fotografia",
      base: "Derivado público do Hero. O SHA-256 do original (37cf8d2e…) é idêntico ao de um arquivo da pasta de campo da visita ao Recanto da Serra — conferido em 2026-09-13. A atribuição de local ainda não tem decisão humana.",
    },
    {
      afirmacao: "Frase de abertura",
      base: "Texto novo do experimento. Sustentação: entrevistas com gestores e equipamentos (inventário, série B) e formulários de funcionamento. Requer aprovação editorial.",
    },
  ],
  origem: [
    {
      afirmacao: "Coletivo idealiza e realiza",
      base: "Instrução H1 §12, registrada em HeroManifesto.tsx.",
    },
    {
      afirmacao: "Financiamento pelo edital e prestação de contas à FUNCAP/SE",
      base: "AGENTS.md; handoff de 2026-09-12 §4.",
    },
    {
      afirmacao: "Publicar em domínio público; site como prova documental",
      base: "docs/01 §1 (objetivos O1 e O2) e §0. São objetivos do sistema: confirmar como texto institucional.",
    },
    {
      afirmacao: "Carcará",
      base: "Grafismo da identidade (src/dados/grafismos/derivados.ts). Não é registro de fauna.",
    },
  ],
  territorio: [
    {
      afirmacao: "Definição do Vale e vínculos por município",
      base: "src/dados/territorio/recorte.ts — definições do responsável em 2026-09-03.",
    },
    {
      afirmacao: "Malha",
      base: "IBGE, 75 municípios; src/dados/territorio/fontes.ts.",
    },
    {
      afirmacao: "Ilha Grande e Serra dos Macacos fora do mapa",
      base: "src/dados/territorio/pontos.ts: município e coordenada nulos. A04 (relato técnico da Serra dos Macacos) existe no acervo.",
    },
  ],
  equipamentos: [
    {
      afirmacao:
        "Povoado Jacaré; “equipamento cultural e motor da economia criativa e solidária”",
      base: "Resumo executivo do A02, documento público no acervo.",
    },
    {
      afirmacao: "A03 restrito por dado pessoal",
      base: "Derivado de leitura visual de A03: contém nomes de trabalhadores remunerados.",
    },
    {
      afirmacao: "Sete fotografias do Borda da Mata, nenhuma liberada",
      base: "Auditoria H3, registros H3-F001 a H3-F007.",
    },
    {
      afirmacao: "Período e formulários preenchidos pelos responsáveis",
      base: "src/dados/indicadores/derivados.ts (período e regra de H4-006).",
    },
  ],
  leitura: [
    {
      afirmacao: "Valores, bases, regras, período, recorte e fonte",
      base: "src/dados/indicadores/derivados.ts (H4.0). Nenhum valor recalculado.",
    },
    {
      afirmacao: "Título, entrada, leitura do dado e saída",
      base: "Copy aprovada na H4.5.2; título aprovado em 2026-09-12.",
    },
    {
      afirmacao: "Seleção de apoio e rótulos",
      base: "selecaoEditorial.ts — mesma seleção da Home pública.",
    },
  ],
  escuta: [
    {
      afirmacao: "Oito entrevistas e seus lugares",
      base: "MAPA_FONTES_CANONICAS_2026-09-05.md §4.",
    },
    {
      afirmacao:
        "Áudios e transcrições restritos; vozes condicionadas ao consentimento",
      base: "ESTADO_ATUAL_PROJETO.md (consentimento por participante) e handoff §21.",
    },
    {
      afirmacao: "Método e fotografias de Ilha Grande",
      base: "Copy aprovada na H3; src/dados/pesquisa/derivados.ts.",
    },
  ],
  produtos: [
    {
      afirmacao: "A02 e identidade visual públicos",
      base: "/anexos.json de produção, lido em 2026-09-13.",
    },
    {
      afirmacao: "PodObservar com três episódios no Spotify e no YouTube",
      base: "Informação do responsável nesta sessão (2026-09-13). O material não está no repositório; C04 continua PENDENTE no inventário.",
    },
    {
      afirmacao:
        "Relatórios do Borda da Mata e da Serra dos Macacos; planilhas",
      base: "Inventário e mapa de fontes canônicas: A03 restrito, A04 espelhável e não público, três planilhas de respostas.",
    },
  ],
  conferir: [
    {
      afirmacao: "Endereço permanente, data e hash; sem login",
      base: "Texto da Sala do Avaliador (src/app/prestacao-de-contas/page.tsx).",
    },
    {
      afirmacao: "Hash exibido",
      base: "SHA-256 do A02 em /anexos.json.",
    },
  ],
  creditos: [
    {
      afirmacao: "Ordem da régua",
      base: "Instrução do responsável em 2026-09-13. Não autoriza publicação.",
    },
    {
      afirmacao: "Arquivos oficiais localizados",
      base: "AUDITORIA_FONTES_CANONICAS_2026-09-05.md, classificação das 34 marcas.",
    },
    {
      afirmacao: "E02",
      base: "PENDENTE no inventário: os arquivos existem, as regras de ordem e proporção não.",
    },
  ],
} as const satisfies Record<string, readonly Fonte[]>;
