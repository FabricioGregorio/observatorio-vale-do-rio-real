import {
  ALT_DO_HERO,
  CAMINHO_PUBLICO,
  DERIVADOS_DO_HERO,
} from "../../../dados/hero/derivados";
import { INDICADORES } from "../../../dados/indicadores/derivados";
import {
  DERIVADOS_DA_PESQUISA,
  PASTA_PUBLICA_DA_PESQUISA,
} from "../../../dados/pesquisa/derivados";
import { PONTOS_DE_VISITA_PREVISTOS } from "../../../dados/territorio/pontos";

/**
 * Lugares de campo do laboratório territorial.
 *
 * ## Regra deste arquivo
 *
 * Só entra aqui o que já é **público** ou já está versionado no repositório.
 * Achados em fontes restritas — transcrições, relatórios não publicados,
 * planilhas — ficam fora do código e fora da interface: o repositório tem
 * remoto público, e um comentário também é publicação. Onde a informação
 * pública não existe, o campo é `null` e a ficha simplesmente não mostra a
 * seção.
 *
 * Os quatro lugares são os confirmados pelo responsável como visitados em
 * campo (2026-09-13). Os identificadores e os municípios vêm de `pontos.ts`.
 * **Nenhuma coordenada**: o mapa marca municípios, não pontos.
 */

export type EstadoDoMaterial = "publico" | "restrito" | "pendente";

export const ROTULO_DO_ESTADO: Readonly<Record<EstadoDoMaterial, string>> = {
  publico: "Público",
  restrito: "Restrito",
  pendente: "Em revisão",
};

export type Material = {
  readonly material: string;
  readonly estado: EstadoDoMaterial;
  /** Só existe para material público. */
  readonly href: string | null;
};

export type ComFonte = {
  readonly texto: string;
  readonly fonte: string;
};

export type DadoDoLugar = {
  readonly rotulo: string;
  readonly valor: string;
  readonly fonte: string;
};

export type FotoDoLugar = {
  readonly src: string;
  readonly largura: number;
  readonly altura: number;
  readonly alt: string;
  readonly legenda: string;
  /** Marca visível de atribuição ainda não encerrada. */
  readonly pendencia: string | null;
};

export type LugarDeCampo = {
  readonly id:
    | "recanto-da-serra"
    | "borda-da-mata"
    | "serra-dos-macacos"
    | "ilha-grande";
  readonly nome: string;
  readonly nomeCompleto: string | null;
  readonly tipo: ComFonte | null;
  /** Código IBGE, igual ao de `pontos.ts`. `null` quando não publicado. */
  readonly municipioId: string | null;
  readonly localidade: ComFonte | null;
  readonly descricao: ComFonte | null;
  readonly materiais: readonly Material[];
  readonly dados: readonly DadoDoLugar[];
  readonly fotos: readonly FotoDoLugar[];
  readonly comoChegar: {
    readonly referencia: ComFonte | null;
    /** Sempre `null` até haver coordenada confirmada e decisão de publicá-la. */
    readonly coordenadas: null;
  } | null;
  /** Por que o mapa não aproxima este lugar. `null` quando aproxima. */
  readonly lacunaDeLocalizacao: string | null;
};

const A02 = {
  titulo: "Relatório Técnico — Recanto da Serra (A02)",
  url: "https://acervo.observatoriotobiassoueu.com.br/arquivos/analise-de-dados/a02-relatorio-tecnico-recanto-da-serra-publico-v1.pdf",
} as const;

function municipioDoPonto(id: LugarDeCampo["id"]): string | null {
  return (
    PONTOS_DE_VISITA_PREVISTOS.find((p) => p.id === id)?.municipioId ?? null
  );
}

function nomeDoPonto(id: LugarDeCampo["id"]): string | null {
  return PONTOS_DE_VISITA_PREVISTOS.find((p) => p.id === id)?.nome ?? null;
}

const FOTO_VERTICAL = DERIVADOS_DO_HERO.find((d) =>
  d.arquivo.includes("mobile"),
) as (typeof DERIVADOS_DO_HERO)[number];

/** Recorte dos indicadores H4: os dois equipamentos, com nome completo. */
const RECORTE_H4 = INDICADORES[0].recorte;

export const LUGARES_DE_CAMPO: readonly LugarDeCampo[] = [
  {
    id: "recanto-da-serra",
    nome: "Recanto da Serra",
    nomeCompleto: "Ecoparque e Museu Recanto da Serra",
    tipo: { texto: "Equipamento cultural", fonte: A02.titulo },
    municipioId: municipioDoPonto("recanto-da-serra"),
    localidade: { texto: "Povoado Jacaré", fonte: A02.titulo },
    descricao: {
      texto:
        "O relatório técnico publicado descreve o espaço como equipamento cultural e motor da economia criativa e solidária da região do Vale do Rio Real.",
      fonte: A02.titulo,
    },
    materiais: [
      { material: "Relatório técnico", estado: "publico", href: A02.url },
      { material: "Entrevista gravada", estado: "restrito", href: null },
      {
        material: "Formulários de funcionamento e de visitantes",
        estado: "restrito",
        href: null,
      },
      { material: "Fotografias de campo", estado: "pendente", href: null },
    ],
    dados: [
      {
        rotulo: "Receita registrada, 21/07 a 21/12/2025",
        valor: "R$ 15.500,00",
        fonte: A02.titulo,
      },
      {
        rotulo: "Despesa registrada, 21/07 a 21/12/2025",
        valor: "R$ 15.912,00",
        fonte: A02.titulo,
      },
    ],
    fotos: [
      {
        src: `${CAMINHO_PUBLICO}/${FOTO_VERTICAL.arquivo}`,
        largura: FOTO_VERTICAL.largura,
        altura: FOTO_VERTICAL.altura,
        alt: ALT_DO_HERO,
        legenda: "Caminho de chegada · conjunto de campo do Recanto da Serra",
        pendencia: "Atribuição formal de local pendente",
      },
    ],
    comoChegar: {
      referencia: {
        texto:
          "O relatório registra que não há alternativa de transporte do centro de Tobias Barreto até o Recanto da Serra.",
        fonte: A02.titulo,
      },
      coordenadas: null,
    },
    lacunaDeLocalizacao: null,
  },
  {
    id: "borda-da-mata",
    nome: "Museu Borda da Mata",
    nomeCompleto: nomeDoPonto("borda-da-mata"),
    tipo: {
      texto: "Equipamento cultural",
      fonte: `Recorte dos indicadores: ${RECORTE_H4}`,
    },
    municipioId: municipioDoPonto("borda-da-mata"),
    localidade: null,
    descricao: null,
    materiais: [
      { material: "Relatório técnico", estado: "restrito", href: null },
      { material: "Entrevista gravada", estado: "restrito", href: null },
      {
        material: "Formulários de funcionamento e de visitantes",
        estado: "restrito",
        href: null,
      },
      { material: "Fotografias de campo", estado: "pendente", href: null },
    ],
    dados: [],
    fotos: [],
    comoChegar: null,
    lacunaDeLocalizacao: null,
  },
  {
    id: "serra-dos-macacos",
    nome: "Serra dos Macacos",
    nomeCompleto: null,
    tipo: null,
    municipioId: municipioDoPonto("serra-dos-macacos"),
    localidade: null,
    descricao: null,
    materiais: [
      { material: "Relato técnico (A04)", estado: "restrito", href: null },
    ],
    dados: [],
    fotos: [],
    comoChegar: null,
    lacunaDeLocalizacao:
      "O município e a localidade deste lugar ainda não foram publicados. O mapa não o posiciona.",
  },
  {
    id: "ilha-grande",
    nome: "Ilha Grande",
    nomeCompleto: null,
    tipo: null,
    municipioId: municipioDoPonto("ilha-grande"),
    localidade: null,
    descricao: null,
    materiais: [
      { material: "Entrevista gravada", estado: "restrito", href: null },
      { material: "Fotografias de campo", estado: "publico", href: null },
    ],
    dados: [],
    fotos: DERIVADOS_DA_PESQUISA.map((foto) => ({
      src: `${PASTA_PUBLICA_DA_PESQUISA}/${foto.arquivo}`,
      largura: foto.largura,
      altura: foto.altura,
      alt: foto.alt,
      legenda: `${foto.titulo} · data não informada`,
      pendencia: null,
    })),
    comoChegar: null,
    lacunaDeLocalizacao:
      "O município deste lugar ainda não está consolidado em documento público. O mapa não o posiciona.",
  },
];
