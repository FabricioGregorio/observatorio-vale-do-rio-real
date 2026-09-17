import { INDICADORES } from "../../../dados/indicadores/derivados";
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
import { PONTOS_DE_VISITA_PREVISTOS } from "../../../dados/territorio/pontos";
import {
  FONTE_DA_COORDENADA,
  type IdDoLugar,
  type ReferenciaCartografica,
  referenciaDe,
} from "../../../dados/territorio/referencias";
import type { IdDoEntorno } from "./local/entornos";

export {
  IDS_DOS_LUGARES,
  type IdDoLugar,
} from "../../../dados/territorio/referencias";

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

export {
  type EstadoDoMaterial,
  ROTULO_DO_ESTADO,
} from "../../../dados/materiais-de-campo";

/** Material já resolvido contra `vw_anexo_publico`. Ver `materiais-de-campo`. */
export type Material = MaterialResolvido;

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
  /**
   * Crédito de autoria de terceiro, já pronto para exibição. Vem do mesmo
   * manifesto que alimenta o Acervo: a ficha não pode perder a atribuição que
   * o Acervo conhece.
   */
  readonly credito: string | null;
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

/**
 * Título do A02 para citação de fonte. A URL do relatório **não** mora aqui:
 * ela vem de `vw_anexo_publico`, como a de qualquer outro material.
 */
const A02_TITULO = "Relatório Técnico — Recanto da Serra (A02)";

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

/**
 * Fotografias públicas de um lugar, por identidade.
 *
 * As duas fontes de derivado são varridas com o mesmo critério — `lugar`, o id
 * declarado no manifesto e conferido contra a pasta de origem do corpus. Antes,
 * cada ficha citava o nome de exibição do lugar (`"Borda da Mata"`), Ilha
 * Grande recebia a lista inteira dos derivados da pesquisa sem filtro algum, e
 * Serra dos Macacos trazia `[]` escrito à mão. Nenhum dos três sobrevive a uma
 * fotografia nova no corpus; este filtro sobrevive.
 *
 * Lugar sem fotografia pública devolve lista vazia, e a ficha diz isso. Não há
 * substituição por fotografia de outro lugar, aqui nem em lugar nenhum.
 */
function fotografiasDoLugar(id: IdDoLugar): readonly FotoDoLugar[] {
  const dasFichas = DERIVADOS_DOS_LUGARES.filter(
    (foto) => foto.lugar === id,
  ).map((foto) => ({
    src: `${PASTA_PUBLICA_DA_PESQUISA}/${foto.arquivo}`,
    largura: foto.largura,
    altura: foto.altura,
    alt: foto.alt,
    legenda: `${foto.local} · fotografia de campo`,
    credito: foto.credito,
    pendencia: null,
  }));
  const daPesquisa = DERIVADOS_DA_PESQUISA.filter(
    (foto) => foto.lugar === id,
  ).map((foto) => ({
    src: `${PASTA_PUBLICA_DA_PESQUISA}/${foto.arquivo}`,
    largura: foto.largura,
    altura: foto.altura,
    alt: foto.alt,
    // `data: null` é declarado na fonte: a ausência é dito, não esquecimento.
    legenda: `${foto.titulo} · data não informada`,
    credito: null,
    pendencia: null,
  }));
  return [...dasFichas, ...daPesquisa];
}

/** Recorte dos indicadores H4: os dois equipamentos, com nome completo. */
const RECORTE_H4 = INDICADORES[0].recorte;

const RECANTO = territorio("recanto-da-serra", "jacare");
const SERRA = territorio("serra-dos-macacos", "serra-dos-macacos");
const REFERENCIA_DA_SERRA =
  referenciaDe("serra-dos-macacos").referenciaTerritorial;

/**
 * As quatro fichas, resolvidas contra o que está efetivamente publicado.
 *
 * `publicados` vem de `listarArquivosPorDocumento()`, em build. Nenhum estado
 * `publico` é escrito aqui: ele é consequência de existir URL na view. Com o
 * mapa vazio — máquina sem `DATABASE_URL` — as fichas caem para o estado
 * declarado em `materiais-de-campo.ts`, e nenhum link falso aparece.
 */
export function lugaresDeCampo(
  publicados: ArquivosPublicados,
): readonly LugarDeCampo[] {
  const materiais = (id: Parameters<typeof resolverMateriaisDoLugar>[0]) =>
    resolverMateriaisDoLugar(id, publicados);
  return [
    {
      ...RECANTO,
      nomeCompleto: "Ecoparque e Museu Recanto da Serra",
      tipo: { texto: "Equipamento cultural", fonte: A02_TITULO },
      // A localidade já constava do A02; o responsável a confirmou.
      localidade: {
        texto: RECANTO.localidade.texto,
        fonte: `${A02_TITULO}; ${FONTE_DA_COORDENADA}`,
      },
      descricao: {
        texto:
          "O relatório técnico publicado descreve o espaço como equipamento cultural e motor da economia criativa e solidária da região do Vale do Rio Real.",
        fonte: A02_TITULO,
      },
      materiais: materiais("recanto-da-serra"),
      dados: [
        {
          rotulo: "Receita registrada, 21/07 a 21/12/2025",
          valor: "R$ 15.500,00",
          fonte: A02_TITULO,
        },
        {
          rotulo: "Despesa registrada, 21/07 a 21/12/2025",
          valor: "R$ 15.912,00",
          fonte: A02_TITULO,
        },
      ],
      fotos: fotografiasDoLugar("recanto-da-serra"),
      comoChegar: {
        referencia: {
          texto:
            "O relatório registra que não há alternativa de transporte do centro de Tobias Barreto até o Recanto da Serra.",
          fonte: A02_TITULO,
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
      materiais: materiais("borda-da-mata"),
      dados: [],
      fotos: fotografiasDoLugar("borda-da-mata"),
      comoChegar: null,
      lacunaDeLocalizacao: null,
    },
    {
      ...SERRA,
      nomeCompleto: null,
      tipo: null,
      descricao: null,
      materiais: materiais("serra-dos-macacos"),
      dados: [],
      fotos: fotografiasDoLugar("serra-dos-macacos"),
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
      materiais: materiais("ilha-grande"),
      dados: [],
      fotos: fotografiasDoLugar("ilha-grande"),
      comoChegar: null,
      lacunaDeLocalizacao: null,
    },
  ];
}

/**
 * Fichas sem nenhum material publicado. É o piso: serve a testes de forma e
 * aos contextos sem banco, e nunca afirma publicação que não exista.
 */
export const LUGARES_SEM_PUBLICACAO = lugaresDeCampo(new Map());
