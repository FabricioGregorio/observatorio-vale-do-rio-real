/**
 * Classificação documental aprovada — estado e revisão de privacidade por item.
 *
 * Por que isto é um módulo versionado e não uma coluna do inventário: o
 * `Status` da planilha tem quatro valores de outro vocabulário — `Disponível`,
 * `Pendente`, `A confirmar`, `A corrigir` — e o mapeamento para os cinco
 * estados documentais **não é 1 para 1**. `B02` é `Disponível` e é `RESTRITO`;
 * `A02` também é `Disponível` e é `ESPELHAVEL`. O que distingue os dois é a
 * auditoria, não a planilha.
 *
 * Fonte de cada valor: `docs/carga/PLANO_CARGA_DRY_RUN_v2_2026-09-06.md`,
 * aprovado no Prompt 3.2. Alterar um estado aqui é decisão humana; o
 * carregador não infere nada.
 *
 * Nenhum item é `PUBLICAVEL`. A promoção exige revisão de privacidade
 * concluída, e nenhuma foi concluída ainda — o CHECK
 * `documento_publicavel_exige_revisao` da migração 0004 impede a combinação
 * inconsistente no próprio banco.
 */

export type EstadoDocumental =
  | "PUBLICAVEL"
  | "RESTRITO"
  | "ESPELHAVEL"
  | "IMPEDIDO"
  | "PENDENTE";

export type RevisaoPrivacidade = "pendente" | "concluida" | "bloqueada";

export type MetodoDerivacao =
  | "transcricao_leitura_visual"
  | "ocr_estatistico"
  | "redacao_versao_publica"
  | "extracao_secao"
  | "conversao_formato";

export type ClassificacaoItem = {
  readonly estado: EstadoDocumental;
  readonly revisao: RevisaoPrivacidade;
  /** Código do documento original, quando este é derivado. */
  readonly derivadoDe?: string;
  readonly metodo?: MetodoDerivacao;
  /** Por que este estado, em uma linha. Não vai para o banco. */
  readonly razao: string;
};

export const CLASSIFICACAO: Readonly<Record<string, ClassificacaoItem>> = {
  // ─── Análise de dados ────────────────────────────────────────────
  A01: {
    estado: "IMPEDIDO",
    revisao: "pendente",
    razao:
      "painel no Figma devolve HTTP 403 anônimo; sem cópia local e sem arquivo para hash",
  },
  A02: {
    estado: "ESPELHAVEL",
    revisao: "pendente",
    razao: "relatório existe localmente, com hash conferido; falta espelhar",
  },
  A03: {
    estado: "RESTRITO",
    revisao: "pendente",
    razao: "PDF sem camada de texto e nomeia trabalhadores remunerados",
  },
  A04: {
    estado: "ESPELHAVEL",
    revisao: "pendente",
    razao: "relato existe localmente, com hash conferido; falta espelhar",
  },
  A05: {
    estado: "PENDENTE",
    revisao: "pendente",
    derivadoDe: "A02",
    metodo: "extracao_secao",
    razao: "derivável de A02; o artefato separado ainda não existe",
  },
  A06: {
    estado: "PENDENTE",
    revisao: "pendente",
    derivadoDe: "A03",
    metodo: "extracao_secao",
    razao: "derivável de A03; o artefato separado ainda não existe",
  },
  A07: { estado: "PENDENTE", revisao: "pendente", razao: "não produzido" },
  A08: { estado: "PENDENTE", revisao: "pendente", razao: "não produzido" },
  A09: {
    estado: "PENDENTE",
    revisao: "pendente",
    razao: "instrumento reconstituível dos cabeçalhos; PDF não produzido",
  },
  A10: {
    estado: "PENDENTE",
    revisao: "pendente",
    razao: "instrumento reconstituível dos cabeçalhos; PDF não produzido",
  },
  A11: {
    estado: "RESTRITO",
    revisao: "pendente",
    razao: "o conjunto inclui arquivos que nomeiam pessoas",
  },

  // ─── Comprovação de campo ────────────────────────────────────────
  B01: {
    estado: "RESTRITO",
    revisao: "pendente",
    razao:
      "fotografias de pessoas identificáveis, sem consentimento verificado",
  },
  B02: {
    estado: "RESTRITO",
    revisao: "pendente",
    razao: "áudio e transcrição de entrevista",
  },
  B03: {
    estado: "RESTRITO",
    revisao: "pendente",
    razao: "áudio e transcrição de entrevista",
  },
  B04: {
    estado: "RESTRITO",
    revisao: "pendente",
    razao: "áudio e transcrição de entrevista",
  },
  B05: {
    estado: "RESTRITO",
    revisao: "pendente",
    razao: "áudio e transcrição de entrevista",
  },
  B06: {
    estado: "RESTRITO",
    revisao: "pendente",
    razao:
      "áudio e transcrição; evidência de consentimento não localizada na transcrição",
  },
  B07: {
    estado: "PENDENTE",
    revisao: "pendente",
    razao:
      "previsão de entrevista de Itabaianinha que não se realizou; sem arquivo",
  },
  B08: {
    estado: "RESTRITO",
    revisao: "pendente",
    razao: "áudio e transcrição de entrevista",
  },
  B09: { estado: "PENDENTE", revisao: "pendente", razao: "não produzido" },
  B10: { estado: "PENDENTE", revisao: "pendente", razao: "não produzido" },
  B11: { estado: "PENDENTE", revisao: "pendente", razao: "não produzido" },
  B12: { estado: "PENDENTE", revisao: "pendente", razao: "não produzido" },
  B13: {
    estado: "RESTRITO",
    revisao: "pendente",
    razao: "evidência complementar: áudio e transcrição de entrevista",
  },
  B14: {
    estado: "RESTRITO",
    revisao: "pendente",
    razao: "evidência complementar: áudio e transcrição de entrevista",
  },

  // ─── Produto final ──────────────────────────────────────────────
  C01: {
    estado: "PENDENTE",
    revisao: "pendente",
    razao: "declarado como arquivo local, mas não localizado em lugar algum",
  },
  C02: { estado: "PENDENTE", revisao: "pendente", razao: "não produzido" },
  C03: { estado: "PENDENTE", revisao: "pendente", razao: "não produzido" },
  C04: { estado: "PENDENTE", revisao: "pendente", razao: "não produzido" },

  // ─── Publicidade ────────────────────────────────────────────────
  D01: {
    estado: "ESPELHAVEL",
    revisao: "pendente",
    razao: "identidade visual existe localmente; falta espelhar",
  },
  D02: {
    estado: "PENDENTE",
    revisao: "pendente",
    razao:
      "perfil vivo do Instagram; não há evidência estática preservada pelo Observatório",
  },

  // ─── Conformidade ───────────────────────────────────────────────
  E01: {
    estado: "PENDENTE",
    revisao: "pendente",
    razao:
      "consentimento é verbal gravado; não existe termo assinado no corpus e o registro consolidado não foi produzido",
  },
  E02: {
    estado: "PENDENTE",
    revisao: "pendente",
    razao: "manual de aplicação de marcas do edital não obtido",
  },
};

/** Distribuição esperada de estados, conforme o dry-run aprovado. */
export const DISTRIBUICAO_ESPERADA: Readonly<Record<EstadoDocumental, number>> =
  {
    PUBLICAVEL: 0,
    IMPEDIDO: 1,
    RESTRITO: 11,
    ESPELHAVEL: 3,
    PENDENTE: 18,
  };

export const TOTAL_ESPERADO = 33;

/** Classificação de um código, ou erro — nunca um estado presumido. */
export function classificacaoDe(codigo: string): ClassificacaoItem {
  const c = CLASSIFICACAO[codigo];
  if (!c) {
    throw new Error(
      `Item ${codigo} não tem classificação documental aprovada. ` +
        "Acrescente-a em src/dados/classificacao-documental.ts, com base em " +
        "decisão humana registrada — o carregador não infere estado.",
    );
  }
  return c;
}
