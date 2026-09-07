import {
  espelharComCompensacao,
  FalhaEspelhamento,
} from "../../src/lib/espelhamento-privado";
import { consultarObjetoPrivado } from "../../src/lib/storage-privado";
import type { BancoEspelhamento } from "./banco-espelhamento";
import {
  lerFonte,
  metadados,
  type OperacaoPrivada,
  validarLote,
} from "./plano-espelhamento";

type Banco = Pick<
  BancoEspelhamento,
  "consultar" | "persistir" | "reconciliar" | "conferirContexto"
>;
export type Acao =
  | "upload_privado_e_registro"
  | "registrar_preexistente"
  | "ja_espelhado";

export async function observar(
  op: OperacaoPrivada,
  banco: Banco,
): Promise<Acao> {
  const remoto = await consultarObjetoPrivado(op.chave);
  const registro = await banco.consultar(op);
  if (remoto && (remoto.sha256 !== op.sha256 || remoto.bytes !== op.bytes))
    throw new FalhaEspelhamento(`Colisão de conteúdo: ${op.chave}.`);
  if (registro === "completo") {
    if (!remoto)
      throw new FalhaEspelhamento(
        `Banco aponta para objeto ausente: ${op.chave}.`,
      );
    return "ja_espelhado";
  }
  return remoto ? "registrar_preexistente" : "upload_privado_e_registro";
}

export async function executarOperacao(
  op: OperacaoPrivada,
  raiz: string,
  banco: Banco,
): Promise<Acao> {
  // Releitura imediatamente antes da operação. Mudança após o dry-run aborta.
  const corpo = await lerFonte(raiz, op.caminho);
  const atual = metadados(corpo, op.caminho);
  if (
    atual.sha256 !== op.sha256 ||
    atual.bytes !== op.bytes ||
    atual.mimeType !== op.mimeType
  )
    throw new FalhaEspelhamento(
      `Fonte mudou após preparar o plano: ${op.caminho}.`,
    );
  const acao = await observar(op, banco);
  if (acao === "ja_espelhado") return acao;
  await espelharComCompensacao(
    { chave: op.chave, corpo, sha256: op.sha256, mimeType: op.mimeType },
    () => banco.persistir(op),
    () => banco.reconciliar(op),
  );
  if ((await observar(op, banco)) !== "ja_espelhado")
    throw new FalhaEspelhamento(`Persistência não confirmada: ${op.chave}.`);
  return acao;
}

export async function executarLote(
  entrada: unknown,
  raiz: string,
  banco: Banco,
  executar = false,
  relatar: (op: OperacaoPrivada, acao: Acao) => void = () => {},
): Promise<Acao[]> {
  const lote = validarLote(entrada);
  const existentes = await banco.conferirContexto();
  const acoes: Acao[] = [];
  // Preflight do lote inteiro: nenhuma escrita antes de conferir as dez chaves.
  for (const op of lote) acoes.push(await observar(op, banco));
  if (acoes.filter((a) => a === "ja_espelhado").length !== existentes)
    throw new FalhaEspelhamento(
      "Banco contém arquivos fora do lote ou vínculos divergentes.",
    );
  for (const [i, op] of lote.entries()) {
    const acao = executar ? await executarOperacao(op, raiz, banco) : acoes[i];
    if (!acao) throw new FalhaEspelhamento("Operação ausente no lote.");
    relatar(op, acao);
  }
  if (executar && (await banco.conferirContexto()) !== 10)
    throw new FalhaEspelhamento(
      "Contagem final diferente de dez arquivos/vínculos privados.",
    );
  return acoes;
}
