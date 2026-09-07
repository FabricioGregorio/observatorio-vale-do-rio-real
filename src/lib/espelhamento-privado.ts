import { createHash, randomUUID } from "node:crypto";
import { z } from "zod";
import {
  consultarObjetoPrivado,
  enviarObjetoPrivado,
  removerObjetoCriado,
} from "./storage-privado";

/** Erro operacional cuja mensagem não contém credenciais ou dados do SDK. */
export class FalhaEspelhamento extends Error {}

/** Só usar após o PostgreSQL confirmar o ROLLBACK da transação. */
export class PersistenciaDesfeita extends Error {}

const objetoSchema = z.object({
  chave: z
    .string()
    .regex(/^arquivos\/[a-z0-9-]+\/[a-z0-9-]+-v[1-9][0-9]*\.[a-z0-9]+$/),
  corpo: z.instanceof(Buffer).refine((b) => b.length > 0),
  mimeType: z.string().min(1),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
});

/** Fluxo sequencial: prova remota antes de persistir; falha interrompe o lote. */
export async function espelharComCompensacao(
  entrada: z.infer<typeof objetoSchema>,
  persistir: () => Promise<void>,
  reconciliar?: () => Promise<"confirmada" | "desfeita" | "incerta">,
): Promise<"criado_agora" | "preexistente"> {
  const { chave, corpo, mimeType, sha256 } = objetoSchema.parse(entrada);
  if (createHash("sha256").update(corpo).digest("hex") !== sha256)
    throw new FalhaEspelhamento(`Hash local divergente: ${chave}.`);

  const execucao = randomUUID(); // Marca de propriedade, nunca parte da chave.
  let criadoAgora = false;
  let persistenciaIniciada = false;
  try {
    let remoto = await consultarObjetoPrivado(chave);
    if (!remoto) {
      try {
        await enviarObjetoPrivado(chave, corpo, mimeType, sha256, execucao);
        criadoAgora = true;
      } catch {
        // Timeout pode ter acontecido depois da criação. Somente a marca
        // autenticada permite atribuir o objeto a esta execução.
        try {
          remoto = await consultarObjetoPrivado(chave);
        } catch {
          throw new FalhaEspelhamento(
            `PUT e leitura sem confirmação: ${chave}; possível órfão. PARAR.`,
          );
        }
        criadoAgora = remoto?.execucao === execucao;
        throw new FalhaEspelhamento(
          `PUT sem confirmação: ${chave}; interromper e reconciliar.`,
        );
      }
      remoto = await consultarObjetoPrivado(chave);
    }
    if (!remoto || remoto.sha256 !== sha256 || remoto.bytes !== corpo.length)
      throw new FalhaEspelhamento(`Integridade remota divergente: ${chave}.`);
    persistenciaIniciada = true;
    await persistir();
    return criadoAgora ? "criado_agora" : "preexistente";
  } catch (erro) {
    if (persistenciaIniciada && !(erro instanceof PersistenciaDesfeita)) {
      const estado = await reconciliar?.().catch(() => "incerta");
      // A reconciliação do banco aguarda o término da transação anterior.
      // Só depois conferimos novamente os bytes remotos autenticados.
      const remoto = await consultarObjetoPrivado(chave).catch(() => null);
      const integro =
        remoto?.sha256 === sha256 && remoto?.bytes === corpo.length;
      if (estado === "confirmada" && integro)
        return criadoAgora ? "criado_agora" : "preexistente";
      if (estado !== "desfeita" || !integro)
        throw new FalhaEspelhamento(
          `Persistência incerta: ${chave}; preservado para reconciliação.`,
        );
    }
    if (criadoAgora) {
      try {
        await removerObjetoCriado(chave, execucao);
      } catch {
        throw new FalhaEspelhamento(
          `Possível objeto órfão: ${chave}; compensação não confirmada. PARAR.`,
        );
      }
      throw new FalhaEspelhamento(
        `Falha em ${chave}; criação desta execução removida e ausência confirmada.`,
      );
    }
    throw erro;
  }
}
