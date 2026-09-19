/**
 * Decisão de ingestão de um master privado — a parte que não fala com a rede.
 *
 * Idempotência e recusa de sobrescrita são regras, não efeitos colaterais do
 * código de upload. Aqui elas são funções puras, testáveis sem storage e sem
 * banco, e o executor em `scripts/` apenas obedece ao que elas decidem.
 *
 * A regra central do §9 da fase: **nunca substituir master existente em
 * silêncio**. Se a chave já existe e não é possível *provar* que o objeto
 * remoto é o mesmo arquivo, a decisão é parar e devolver a escolha ao humano.
 */
import type { ObjetoPrivadoDescrito } from "./storage-privado-grande";

/** Um master aprovado para ingestão. Os valores vêm do plano versionado. */
export type MasterPlanejado = {
  /** Caminho relativo dentro de `OBSERVATORIO_FONTES_DIR`. */
  origem: string;
  chave: string;
  sha256: string;
  bytes: number;
  mimeType: string;
  duracaoSeg: number;
};

export type Decisao =
  | { acao: "enviar" }
  | { acao: "ja_ingerido" }
  | { acao: "parar"; motivo: string };

/**
 * O que fazer com uma chave, dado o que existe remotamente.
 *
 * Três saídas, e nenhuma delas sobrescreve:
 *
 * - **enviar** — a chave não existe;
 * - **ja_ingerido** — existe e é provadamente o mesmo arquivo (bytes iguais e
 *   SHA-256 declarado igual);
 * - **parar** — existe e a equivalência não pode ser provada.
 *
 * O objeto antigo pode não ter metadado `sha256` — foi enviado por outro
 * caminho, ou por uma versão anterior deste. Bytes iguais **não** provam
 * conteúdo igual, e ETag não é SHA-256: em multipart ele é hash de hashes das
 * partes e muda com o tamanho de parte. Nesses casos a resposta é parar.
 */
export function decidirIngestao(
  plano: MasterPlanejado,
  remoto: ObjetoPrivadoDescrito | null,
): Decisao {
  if (!remoto) return { acao: "enviar" };

  if (remoto.sha256 === null) {
    return {
      acao: "parar",
      motivo:
        `${plano.chave} já existe sem SHA-256 declarado no metadado. ` +
        "Equivalência não demonstrável sem baixar o objeto; decisão humana.",
    };
  }
  if (remoto.sha256 !== plano.sha256) {
    return {
      acao: "parar",
      motivo:
        `${plano.chave} já existe com outro conteúdo ` +
        `(remoto ${remoto.sha256.slice(0, 12)}…, plano ${plano.sha256.slice(0, 12)}…). ` +
        "Master existente nunca é substituído em silêncio.",
    };
  }
  if (remoto.bytes !== plano.bytes) {
    return {
      acao: "parar",
      motivo:
        `${plano.chave} declara o mesmo SHA-256 e tamanho diferente ` +
        `(remoto ${remoto.bytes}, plano ${plano.bytes}). Metadado não confiável.`,
    };
  }
  return { acao: "ja_ingerido" };
}

/**
 * Confere o que o envio produziu, sem baixar o corpo.
 *
 * `HeadObject` devolve tamanho e metadado. O SHA-256 remoto é o que **este**
 * envio declarou, então ele prova que o objeto no bucket é o que pretendíamos
 * enviar — a prova de que os bytes lidos do disco correspondem ao hash já foi
 * feita antes do envio, lendo o arquivo local.
 */
export function conferirEnvio(
  plano: MasterPlanejado,
  remoto: ObjetoPrivadoDescrito | null,
  execucao: string,
): { ok: true } | { ok: false; motivo: string } {
  if (!remoto)
    return { ok: false, motivo: `${plano.chave} ausente após o envio.` };
  if (remoto.bytes !== plano.bytes)
    return {
      ok: false,
      motivo: `${plano.chave}: ${remoto.bytes} bytes remotos, ${plano.bytes} esperados.`,
    };
  if (remoto.sha256 !== plano.sha256)
    return {
      ok: false,
      motivo: `${plano.chave}: SHA-256 remoto não confere com o plano.`,
    };
  if (remoto.execucao !== execucao)
    return {
      ok: false,
      motivo: `${plano.chave} pertence a outra execução; não tocar.`,
    };
  return { ok: true };
}

/**
 * Compensação só age sobre o que esta execução criou.
 *
 * Objeto preexistente jamais é removido, mesmo que o registro no banco tenha
 * falhado: ele não é nosso para apagar.
 */
export function podeCompensar(
  remoto: ObjetoPrivadoDescrito | null,
  execucao: string,
): boolean {
  return remoto !== null && remoto.execucao === execucao;
}
