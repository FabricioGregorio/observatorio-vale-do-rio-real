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
 * A classificação inicial veio de
 * `docs/carga/PLANO_CARGA_DRY_RUN_v2_2026-09-06.md`. Em 2026-09-16, decisão
 * humana posterior autorizou a publicação dos materiais da pesquisa e
 * concluiu a revisão de privacidade: somente CPF, telefone e assinatura
 * exigem versão pública tratada. Estados anteriores permanecem no histórico;
 * este módulo registra a decisão vigente.
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
    estado: "PUBLICAVEL",
    revisao: "concluida",
    razao:
      "relatório autorizado; auditoria não encontrou CPF, telefone ou assinatura",
  },
  A03: {
    estado: "PUBLICAVEL",
    revisao: "concluida",
    razao:
      "relatório autorizado; nomes de trabalhadores não impedem publicação",
  },
  A04: {
    estado: "PUBLICAVEL",
    revisao: "concluida",
    razao:
      "relato autorizado; auditoria não encontrou CPF, telefone ou assinatura",
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
    estado: "PUBLICAVEL",
    revisao: "concluida",
    razao: "planilha de respostas autorizada; sem CPF, telefone ou assinatura",
  },
  A10: {
    estado: "PUBLICAVEL",
    revisao: "concluida",
    razao:
      "planilhas de respostas autorizadas; sem CPF, telefone ou assinatura",
  },
  A11: {
    estado: "PUBLICAVEL",
    revisao: "concluida",
    razao: "conjunto autorizado; nomes comuns não impedem publicação",
  },

  // ─── Comprovação de campo ────────────────────────────────────────
  B01: {
    estado: "PUBLICAVEL",
    revisao: "concluida",
    razao:
      "fotografias de campo autorizadas; pessoas identificáveis podem permanecer",
  },
  B02: {
    estado: "PUBLICAVEL",
    revisao: "concluida",
    razao: "áudio e transcrição autorizados; sem CPF, telefone ou assinatura",
  },
  B03: {
    estado: "PUBLICAVEL",
    revisao: "concluida",
    razao: "áudio e transcrição autorizados; sem CPF, telefone ou assinatura",
  },
  B04: {
    estado: "PUBLICAVEL",
    revisao: "concluida",
    razao: "áudio e transcrição autorizados; sem CPF, telefone ou assinatura",
  },
  B05: {
    estado: "PUBLICAVEL",
    revisao: "concluida",
    razao: "áudio e transcrição autorizados; sem CPF, telefone ou assinatura",
  },
  B06: {
    estado: "PUBLICAVEL",
    revisao: "concluida",
    razao: "decisão humana posterior autoriza áudio e transcrição",
  },
  B07: {
    estado: "PENDENTE",
    revisao: "pendente",
    razao:
      "previsão de entrevista de Itabaianinha que não se realizou; sem arquivo",
  },
  B08: {
    estado: "PUBLICAVEL",
    revisao: "concluida",
    razao: "áudio e transcrição autorizados; sem CPF, telefone ou assinatura",
  },
  B09: { estado: "PENDENTE", revisao: "pendente", razao: "não produzido" },
  B10: { estado: "PENDENTE", revisao: "pendente", razao: "não produzido" },
  B11: { estado: "PENDENTE", revisao: "pendente", razao: "não produzido" },
  B12: { estado: "PENDENTE", revisao: "pendente", razao: "não produzido" },
  B13: {
    estado: "PUBLICAVEL",
    revisao: "concluida",
    razao: "evidência complementar autorizada; sem CPF, telefone ou assinatura",
  },
  B14: {
    estado: "PUBLICAVEL",
    revisao: "concluida",
    razao: "evidência complementar autorizada; sem CPF, telefone ou assinatura",
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
    estado: "PUBLICAVEL",
    revisao: "concluida",
    razao: "conjunto autorizado; oito arquivos revisados para publicação",
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

/** Distribuição esperada após a decisão humana de 2026-09-16. */
export const DISTRIBUICAO_ESPERADA: Readonly<Record<EstadoDocumental, number>> =
  {
    PUBLICAVEL: 16,
    IMPEDIDO: 1,
    RESTRITO: 0,
    ESPELHAVEL: 0,
    PENDENTE: 16,
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
