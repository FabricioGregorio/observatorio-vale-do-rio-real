import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

/**
 * Guarda contra CSV desatualizado.
 *
 * `inventario-de-anexos.xlsx` é a fonte canônica versionada; o CSV é artefato
 * derivado por `scripts/derivar-inventario.py`. O risco que isto elimina é
 * concreto: editar o XLSX, esquecer de regerar o CSV, e carregar o banco com a
 * versão antiga sem ninguém perceber.
 *
 * O derivador grava o SHA-256 do XLSX ao lado do CSV. Quem consome o CSV
 * compara os dois antes de usá-lo. Divergência é erro, não aviso — carga
 * silenciosa com dado velho é exatamente o que não pode acontecer numa
 * prestação de contas.
 *
 */

export const CAMINHO_XLSX = "inventario-de-anexos.xlsx";
export const CAMINHO_CSV = "inventario-de-anexos.csv";
export const CAMINHO_SIDECAR = "inventario-de-anexos.csv.origem";

export type EstadoDerivacao =
  | { situacao: "atual"; sha256: string }
  | { situacao: "desatualizado"; registrado: string | null; atual: string }
  | { situacao: "sem_sidecar"; atual: string }
  | { situacao: "sem_fonte" };

/** SHA-256 de um arquivo, ou `null` se ele não existir. */
async function sha256(caminho: string): Promise<string | null> {
  try {
    return createHash("sha256")
      .update(await readFile(caminho))
      .digest("hex");
  } catch {
    return null;
  }
}

/** Compara o CSV derivado com a fonte canônica. Não lança. */
export async function conferirDerivacao(
  caminhoXlsx = CAMINHO_XLSX,
  caminhoSidecar = CAMINHO_SIDECAR,
): Promise<EstadoDerivacao> {
  const atual = await sha256(caminhoXlsx);
  if (atual === null) return { situacao: "sem_fonte" };

  let registrado: string | null = null;
  try {
    registrado = (await readFile(caminhoSidecar, "utf8")).trim();
  } catch {
    return { situacao: "sem_sidecar", atual };
  }

  return registrado === atual
    ? { situacao: "atual", sha256: atual }
    : { situacao: "desatualizado", registrado, atual };
}

/** Mensagem para humano, sem inventar instrução que não existe. */
export function explicarDerivacao(estado: EstadoDerivacao): string {
  const regenerar = "Rode: python scripts/derivar-inventario.py";
  switch (estado.situacao) {
    case "atual":
      return `Inventário derivado está atual (${estado.sha256.slice(0, 12)}…).`;
    case "desatualizado":
      return (
        "O CSV do inventário está DESATUALIZADO em relação ao XLSX.\n" +
        `  registrado no sidecar: ${estado.registrado ?? "(vazio)"}\n` +
        `  XLSX agora:            ${estado.atual}\n` +
        regenerar
      );
    case "sem_sidecar":
      return (
        `${CAMINHO_SIDECAR} não existe, então não há como saber se o CSV ` +
        `corresponde ao XLSX atual.\n${regenerar}`
      );
    case "sem_fonte":
      return `Fonte canônica ausente: ${CAMINHO_XLSX}.`;
  }
}

/**
 * Falha se o CSV não corresponder ao XLSX.
 *
 * Chamada por todo script que carrega o inventário. Prefere abortar a carregar
 * dado velho.
 */
export async function exigirDerivacaoAtual(
  caminhoXlsx = CAMINHO_XLSX,
  caminhoSidecar = CAMINHO_SIDECAR,
): Promise<void> {
  const estado = await conferirDerivacao(caminhoXlsx, caminhoSidecar);
  if (estado.situacao !== "atual") {
    throw new Error(explicarDerivacao(estado));
  }
}
