import { createHash } from "node:crypto";
import { beforeEach, describe, expect, test, vi } from "vitest";
import {
  espelharComCompensacao,
  PersistenciaDesfeita,
} from "../src/lib/espelhamento-privado";
import {
  consultarObjetoPrivado,
  enviarObjetoPrivado,
  removerObjetoCriado,
} from "../src/lib/storage-privado";

vi.mock("../src/lib/storage-privado", () => ({
  consultarObjetoPrivado: vi.fn(),
  enviarObjetoPrivado: vi.fn(),
  removerObjetoCriado: vi.fn(),
}));

const corpo = Buffer.from("conteúdo exclusivo do teste unitário");
const entrada = {
  chave: "arquivos/publicidade/teste-v1.pdf",
  corpo,
  mimeType: "application/pdf",
  sha256: createHash("sha256").update(corpo).digest("hex"),
};
const remoto = {
  sha256: entrada.sha256,
  bytes: corpo.length,
  etag: '"identificador-opaco"',
  execucao: null,
};
const consultar = vi.mocked(consultarObjetoPrivado);
const enviar = vi.mocked(enviarObjetoPrivado);
const remover = vi.mocked(removerObjetoCriado);

beforeEach(() => {
  vi.resetAllMocks();
  consultar.mockResolvedValue(null);
  enviar.mockResolvedValue();
  remover.mockResolvedValue();
});

describe("compensação privada sem rede ou PostgreSQL", () => {
  test("criação: só persiste depois de ler e conferir o corpo remoto", async () => {
    const ordem: string[] = [];
    consultar
      .mockImplementationOnce(async () => {
        ordem.push("consulta");
        return null;
      })
      .mockImplementationOnce(async () => {
        ordem.push("verificacao");
        return remoto;
      });
    enviar.mockImplementation(async () => {
      ordem.push("upload");
    });
    const resultado = await espelharComCompensacao(entrada, async () => {
      ordem.push("persistencia");
    });
    expect(resultado).toBe("criado_agora");
    expect(ordem).toEqual([
      "consulta",
      "upload",
      "verificacao",
      "persistencia",
    ]);
    expect(remover).not.toHaveBeenCalled();
  });

  test("objeto idêntico preexistente não é enviado nem apagado", async () => {
    consultar.mockResolvedValue(remoto);
    expect(await espelharComCompensacao(entrada, async () => {})).toBe(
      "preexistente",
    );
    expect(enviar).not.toHaveBeenCalled();
    expect(remover).not.toHaveBeenCalled();
  });

  test.each([
    { ...remoto, sha256: "0".repeat(64) },
    { ...remoto, bytes: corpo.length + 1 },
  ])(
    "colisão divergente bloqueia persistência e escrita remota",
    async (objeto) => {
      consultar.mockResolvedValue(objeto);
      const persistir = vi.fn();
      await expect(espelharComCompensacao(entrada, persistir)).rejects.toThrow(
        "Integridade",
      );
      expect(persistir).not.toHaveBeenCalled();
      expect(enviar).not.toHaveBeenCalled();
      expect(remover).not.toHaveBeenCalled();
    },
  );

  test("hash local divergente impede qualquer acesso remoto", async () => {
    await expect(
      espelharComCompensacao({ ...entrada, sha256: "0".repeat(64) }, vi.fn()),
    ).rejects.toThrow("Hash local");
    expect(consultar).not.toHaveBeenCalled();
  });

  test("falha após criação e rollback confirmado remove só a criação identificada", async () => {
    consultar.mockResolvedValueOnce(null).mockResolvedValueOnce(remoto);
    await expect(
      espelharComCompensacao(entrada, async () => {
        throw new PersistenciaDesfeita("rollback confirmado");
      }),
    ).rejects.toThrow("ausência confirmada");
    expect(remover).toHaveBeenCalledWith(
      entrada.chave,
      enviar.mock.calls[0]?.[4],
    );
  });

  test("falha no banco nunca apaga objeto preexistente", async () => {
    consultar.mockResolvedValue(remoto);
    await expect(
      espelharComCompensacao(entrada, async () => {
        throw new PersistenciaDesfeita("rollback confirmado");
      }),
    ).rejects.toThrow("rollback confirmado");
    expect(remover).not.toHaveBeenCalled();
  });

  test("resultado incerto de COMMIT preserva objeto para reconciliação", async () => {
    consultar.mockResolvedValueOnce(null).mockResolvedValueOnce(remoto);
    await expect(
      espelharComCompensacao(entrada, async () => {
        throw new Error("conexão perdida durante COMMIT");
      }),
    ).rejects.toThrow("Persistência incerta");
    expect(remover).not.toHaveBeenCalled();
  });

  test("falha de compensação interrompe e reporta possível órfão", async () => {
    consultar.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    remover.mockRejectedValue(new Error("serviço indisponível"));
    await expect(espelharComCompensacao(entrada, vi.fn())).rejects.toThrow(
      "Possível objeto órfão",
    );
  });

  test("corrupção remota após criação compensa sem persistir", async () => {
    consultar
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ ...remoto, sha256: "0".repeat(64) });
    const persistir = vi.fn();
    await expect(espelharComCompensacao(entrada, persistir)).rejects.toThrow(
      "ausência confirmada",
    );
    expect(persistir).not.toHaveBeenCalled();
    expect(remover).toHaveBeenCalledOnce();
  });

  test("PUT sem resposta mas com marca da execução pode ser compensado", async () => {
    consultar.mockResolvedValueOnce(null);
    enviar.mockImplementation(
      async (_chave, _corpo, _mime, _hash, execucao) => {
        consultar.mockResolvedValue({ ...remoto, execucao: execucao ?? null });
        throw new Error("resposta perdida");
      },
    );
    await expect(espelharComCompensacao(entrada, vi.fn())).rejects.toThrow(
      "ausência confirmada",
    );
    expect(remover).toHaveBeenCalledOnce();
  });

  test("corrida entre GET e PUT preserva criação de outra execução", async () => {
    consultar
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ ...remoto, execucao: "outra" });
    enviar.mockRejectedValue(new Error("precondição recusada"));
    const persistir = vi.fn();
    await expect(espelharComCompensacao(entrada, persistir)).rejects.toThrow(
      "PUT sem confirmação",
    );
    expect(persistir).not.toHaveBeenCalled();
    expect(remover).not.toHaveBeenCalled();
  });
});
