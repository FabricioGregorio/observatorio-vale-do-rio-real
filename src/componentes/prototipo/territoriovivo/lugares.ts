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
import type { IdDoEntorno } from "./local/entornos";
import {
  FONTE_DA_COORDENADA,
  type IdDoLugar,
  type ReferenciaCartografica,
  referenciaDe,
} from "./local/referencias";

export { IDS_DOS_LUGARES, type IdDoLugar } from "./local/referencias";

/**
 * Lugares de campo do laboratório territorial.
 *
 * ## Regra deste arquivo
 *
 * Só entra aqui o que já é **público** ou foi autorizado pelo responsável.
 * Achados em fontes restritas — transcrições, relatórios não publicados,
 * planilhas — ficam fora do código e fora da interface. Onde a informação
 * pública não existe, o campo é `null` e a ficha não mostra a seção.
 *
 * ## Território × documentos
 *
 * Nome, município, localidade e posição vêm de `local/referencias.ts`, a fonte
 * única autorizada em 2026-09-14. A autorização é **territorial**: não muda o
 * estado de nenhum material desta lista.
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

/** Segundo nível de mapa: o entorno geográfico do lugar. */
export type CamadaLocalDoLugar = {
  readonly entorno: IdDoEntorno;
  /**
   * Localidade do IBGE correspondente à localidade confirmada. É
   * **contexto**, desenhada com símbolo próprio; nunca a posição do lugar.
   */
  readonly localidadeIbge: string | null;
  /** Entidade cartográfica próxima; não é a localização do lugar. */
  readonly referenciaCartografica: ReferenciaCartografica | null;
};

export type LugarDeCampo = {
  readonly id: IdDoLugar;
  readonly nome: string;
  readonly nomeCompleto: string | null;
  readonly tipo: ComFonte | null;
  /** Código IBGE do município, de `referencias.ts`. */
  readonly municipioId: string | null;
  readonly localidade: ComFonte | null;
  readonly descricao: ComFonte | null;
  readonly materiais: readonly Material[];
  readonly dados: readonly DadoDoLugar[];
  readonly fotos: readonly FotoDoLugar[];
  /** Referência publicada. A rota externa sai da posição confirmada. */
  readonly comoChegar: { readonly referencia: ComFonte | null } | null;
  readonly camadaLocal: CamadaLocalDoLugar | null;
  /** Lacuna editorial de localização (município/localidade não publicados). */
  readonly lacunaDeLocalizacao: string | null;
};

const A02 = {
  titulo: "Relatório Técnico — Recanto da Serra (A02)",
  url: "https://acervo.observatoriotobiassoueu.com.br/arquivos/analise-de-dados/a02-relatorio-tecnico-recanto-da-serra-publico-v1.pdf",
} as const;

function nomeDoPonto(id: IdDoLugar): string | null {
  return PONTOS_DE_VISITA_PREVISTOS.find((p) => p.id === id)?.nome ?? null;
}

/** Campos territoriais comuns, todos da fonte única. */
function territorio(id: IdDoLugar, entorno: IdDoEntorno) {
  const r = referenciaDe(id);
  return {
    id,
    nome: r.nome,
    municipioId: r.municipioIbge,
    localidade: { texto: r.localidade, fonte: FONTE_DA_COORDENADA },
    camadaLocal: {
      entorno,
      localidadeIbge: r.localidadeIbge,
      referenciaCartografica: r.referenciaCartografica,
    },
  } as const;
}

const FOTO_VERTICAL = DERIVADOS_DO_HERO.find((d) =>
  d.arquivo.includes("mobile"),
) as (typeof DERIVADOS_DO_HERO)[number];

/** Recorte dos indicadores H4: os dois equipamentos, com nome completo. */
const RECORTE_H4 = INDICADORES[0].recorte;

const RECANTO = territorio("recanto-da-serra", "jacare");
const SERRA = territorio("serra-dos-macacos", "serra-dos-macacos");
const REFERENCIA_DA_SERRA =
  referenciaDe("serra-dos-macacos").referenciaTerritorial;

export const LUGARES_DE_CAMPO: readonly LugarDeCampo[] = [
  {
    ...RECANTO,
    nomeCompleto: "Ecoparque e Museu Recanto da Serra",
    tipo: { texto: "Equipamento cultural", fonte: A02.titulo },
    // A localidade já constava do A02; o responsável a confirmou.
    localidade: {
      texto: RECANTO.localidade.texto,
      fonte: `${A02.titulo}; ${FONTE_DA_COORDENADA}`,
    },
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
    },
    lacunaDeLocalizacao: null,
  },
  {
    ...territorio("borda-da-mata", "borda-da-mata"),
    nomeCompleto: nomeDoPonto("borda-da-mata"),
    tipo: {
      texto: "Equipamento cultural",
      fonte: `Recorte dos indicadores: ${RECORTE_H4}`,
    },
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
    ...SERRA,
    nomeCompleto: null,
    tipo: null,
    descricao: null,
    materiais: [
      { material: "Relato técnico (A04)", estado: "restrito", href: null },
    ],
    dados: [],
    fotos: [],
    comoChegar:
      REFERENCIA_DA_SERRA === null
        ? null
        : {
            referencia: {
              texto: REFERENCIA_DA_SERRA,
              fonte: FONTE_DA_COORDENADA,
            },
          },
    lacunaDeLocalizacao: null,
  },
  {
    ...territorio("ilha-grande", "ilha-grande"),
    nomeCompleto: null,
    tipo: null,
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
    lacunaDeLocalizacao: null,
  },
];
