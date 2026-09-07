import { createHash } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { modoReal } from "../scripts/espelhar-anexos";
import {
  executarLote,
  executarOperacao,
} from "../scripts/lib/executar-espelhamento";
import {
  lerFonte,
  metadados,
  type OperacaoPrivada,
  validarLote,
} from "../scripts/lib/plano-espelhamento";
import { LOTE_PRIVADO_INICIAL } from "../src/dados/lote-privado-inicial";
import { PersistenciaDesfeita } from "../src/lib/espelhamento-privado";
import {
  consultarObjetoPrivado,
  enviarObjetoPrivado,
  removerObjetoCriado,
} from "../src/lib/storage-privado";

vi.mock("../src/lib/storage-privado", () => ({
  bucketPrivado: () => "observatorio-privado",
  consultarObjetoPrivado: vi.fn(),
  enviarObjetoPrivado: vi.fn(),
  removerObjetoCriado: vi.fn(),
}));

const corpo = Buffer.from(
  "%PDF-1.7\nArquivo exclusivo de teste, sem conteúdo do acervo.",
);
const hash = (b: Buffer) => createHash("sha256").update(b).digest("hex");
function operacao(): OperacaoPrivada {
  return {
    codigo: "A02",
    caminho: "teste.pdf",
    chave: "arquivos/analise-de-dados/teste-v1.pdf",
    ...metadados(corpo, "teste.pdf"),
    principal: true,
    slugDocumento: "documento-de-teste",
    bucket: "observatorio-privado",
    visibilidade: "privado",
    urlPublica: null,
    origemUrl: null,
    origemSistema: "upload",
    fonteHash: "fixture unitária",
    hashHistoricoAnterior: "nao_disponivel",
  };
}
function lote(): OperacaoPrivada[] {
  return LOTE_PRIVADO_INICIAL.map(
    ([codigo, caminho, chave, sha256, principal]) => ({
      ...operacao(),
      codigo,
      caminho,
      chave,
      sha256,
      principal,
      mimeType: caminho.endsWith(".pdf")
        ? "application/pdf"
        : caminho.endsWith(".png")
          ? "image/png"
          : "image/svg+xml",
    }),
  );
}

let raiz: string;
let remoto: { corpo: Buffer; execucao: string | null } | null;
let registrado: boolean;
const eventos: string[] = [];
const banco = {
  conferirContexto: vi.fn(async () => (registrado ? 1 : 0)),
  consultar: vi.fn(
    async (): Promise<"ausente" | "completo"> =>
      registrado ? "completo" : "ausente",
  ),
  persistir: vi.fn(async () => {
    eventos.push("persistir");
    registrado = true;
  }),
  reconciliar: vi.fn(
    async (): Promise<"confirmada" | "desfeita" | "incerta"> =>
      registrado ? "confirmada" : "desfeita",
  ),
};

beforeEach(async () => {
  vi.clearAllMocks();
  eventos.length = 0;
  remoto = null;
  registrado = false;
  raiz = await mkdtemp(join(tmpdir(), "executor-unitario-"));
  await writeFile(join(raiz, "teste.pdf"), corpo);
  banco.persistir.mockImplementation(async () => {
    eventos.push("persistir");
    registrado = true;
  });
  banco.reconciliar.mockImplementation(async () =>
    registrado ? "confirmada" : "desfeita",
  );
  vi.mocked(consultarObjetoPrivado).mockImplementation(async () => {
    eventos.push("ler_remoto");
    return remoto
      ? {
          sha256: hash(remoto.corpo),
          bytes: remoto.corpo.length,
          etag: "opaco",
          execucao: remoto.execucao,
        }
      : null;
  });
  vi.mocked(enviarObjetoPrivado).mockImplementation(
    async (_chave, bytes, _mime, _sha, execucao) => {
      if (remoto) throw new Error("Precondição recusada");
      eventos.push("put");
      remoto = { corpo: Buffer.from(bytes), execucao: execucao ?? null };
    },
  );
  vi.mocked(removerObjetoCriado).mockImplementation(
    async (_chave, execucao) => {
      if (remoto?.execucao !== execucao)
        throw new Error("Não pertence à execução");
      eventos.push("delete");
      remoto = null;
    },
  );
});
afterEach(async () => {
  await rm(raiz, { recursive: true, force: true });
});

describe("executor local com storage e banco controlados", () => {
  test("padrão seguro e rejeição de flags ambíguas/desconhecidas", () => {
    expect(modoReal([])).toBe(false);
    expect(modoReal(["--dry-run"])).toBe(false);
    expect(modoReal(["--executar"])).toBe(true);
    expect(() => modoReal(["--dry-run", "--executar"])).toThrow();
    expect(() => modoReal(["--execute"])).toThrow();
  });

  test("sucesso, integridade anterior à persistência e segunda execução sem INSERT/PUT", async () => {
    await executarOperacao(operacao(), raiz, banco);
    expect(remoto?.corpo.equals(corpo)).toBe(true);
    expect(registrado).toBe(true);
    const indicePut = eventos.indexOf("put");
    expect(
      eventos.slice(indicePut + 1, eventos.indexOf("persistir")),
    ).toContain("ler_remoto");
    expect(await executarOperacao(operacao(), raiz, banco)).toBe(
      "ja_espelhado",
    );
    expect(enviarObjetoPrivado).toHaveBeenCalledOnce();
    expect(banco.persistir).toHaveBeenCalledOnce();
  });

  test("colisão igual registra sem sobrescrever", async () => {
    remoto = { corpo, execucao: "anterior" };
    expect(await executarOperacao(operacao(), raiz, banco)).toBe(
      "registrar_preexistente",
    );
    expect(enviarObjetoPrivado).not.toHaveBeenCalled();
    expect(registrado).toBe(true);
  });

  test("colisão diferente impede upload e persistência", async () => {
    remoto = { corpo: Buffer.from("diferente"), execucao: "anterior" };
    await expect(executarOperacao(operacao(), raiz, banco)).rejects.toThrow(
      "Colisão",
    );
    expect(enviarObjetoPrivado).not.toHaveBeenCalled();
    expect(banco.persistir).not.toHaveBeenCalled();
  });

  test("falha de upload não cria registro", async () => {
    vi.mocked(enviarObjetoPrivado).mockRejectedValueOnce(new Error("rede"));
    await expect(executarOperacao(operacao(), raiz, banco)).rejects.toThrow(
      "PUT sem confirmação",
    );
    expect(registrado).toBe(false);
    expect(removerObjetoCriado).not.toHaveBeenCalled();
  });

  test("banco falha com rollback confirmado: criação própria é compensada", async () => {
    banco.persistir.mockRejectedValueOnce(new PersistenciaDesfeita("recusado"));
    await expect(executarOperacao(operacao(), raiz, banco)).rejects.toThrow(
      "ausência confirmada",
    );
    expect(remoto).toBeNull();
    expect(registrado).toBe(false);
  });

  test("falha de compensação reporta possível órfão e interrompe", async () => {
    banco.persistir.mockRejectedValueOnce(new PersistenciaDesfeita("recusado"));
    vi.mocked(removerObjetoCriado).mockRejectedValueOnce(new Error("rede"));
    await expect(executarOperacao(operacao(), raiz, banco)).rejects.toThrow(
      "órfão",
    );
    expect(remoto).not.toBeNull();
    expect(registrado).toBe(false);
  });

  test("resposta do COMMIT perdida, mas banco confirmou: reconcilia e preserva", async () => {
    banco.persistir.mockImplementationOnce(async () => {
      registrado = true;
      throw new Error("COMMIT sem resposta");
    });
    await executarOperacao(operacao(), raiz, banco);
    expect(banco.reconciliar).toHaveBeenCalledOnce();
    expect(removerObjetoCriado).not.toHaveBeenCalled();
    expect(registrado).toBe(true);
    expect(remoto).not.toBeNull();
  });

  test("COMMIT incerto, transação terminou sem registro: reconcilia antes de compensar", async () => {
    banco.persistir.mockRejectedValueOnce(new Error("COMMIT sem resposta"));
    banco.reconciliar.mockImplementationOnce(async () => {
      eventos.push("reconciliar");
      return "desfeita";
    });
    await expect(executarOperacao(operacao(), raiz, banco)).rejects.toThrow(
      "ausência confirmada",
    );
    expect(eventos.indexOf("reconciliar")).toBeLessThan(
      eventos.indexOf("delete"),
    );
    expect(remoto).toBeNull();
  });

  test("banco inacessível na reconciliação nunca autoriza delete", async () => {
    banco.persistir.mockRejectedValueOnce(new Error("COMMIT sem resposta"));
    banco.reconciliar.mockResolvedValueOnce("incerta");
    await expect(executarOperacao(operacao(), raiz, banco)).rejects.toThrow(
      "Persistência incerta",
    );
    expect(removerObjetoCriado).not.toHaveBeenCalled();
  });

  test("mudança física após preparar plano bloqueia antes do R2", async () => {
    await writeFile(join(raiz, "teste.pdf"), Buffer.from("%PDF-1.7\nalterado"));
    await expect(executarOperacao(operacao(), raiz, banco)).rejects.toThrow(
      "Fonte mudou",
    );
    expect(consultarObjetoPrivado).not.toHaveBeenCalled();
  });

  test("D01 tem oito papéis neutros e nenhum principal presumido", () => {
    const d01 = validarLote(lote()).filter((op) => op.codigo === "D01");
    expect(d01).toHaveLength(8);
    expect(d01.every((op) => !op.principal)).toBe(true);
    const adulterado = lote();
    const op = adulterado[2];
    if (op) op.principal = true;
    expect(() => validarLote(adulterado)).toThrow("diverge");
  });

  test.each([9, 11])(
    "lote de %i operações bloqueia antes de qualquer acesso",
    async (n) => {
      const plano = n === 9 ? lote().slice(1) : [...lote(), operacao()];
      await expect(executarLote(plano, raiz, banco, true)).rejects.toThrow();
      expect(banco.conferirContexto).not.toHaveBeenCalled();
      expect(consultarObjetoPrivado).not.toHaveBeenCalled();
    },
  );

  test("dry-run de dez operações não escreve no storage nem no banco", async () => {
    expect(await executarLote(lote(), raiz, banco)).toHaveLength(10);
    expect(enviarObjetoPrivado).not.toHaveBeenCalled();
    expect(banco.persistir).not.toHaveBeenCalled();
  });

  test("caminho absoluto fora da fonte é recusado", async () => {
    await expect(lerFonte(raiz, join(raiz, "teste.pdf"))).rejects.toThrow(
      "fora da fonte",
    );
  });
});
