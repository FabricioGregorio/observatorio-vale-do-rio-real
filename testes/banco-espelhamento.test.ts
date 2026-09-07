import { describe, expect, test, vi } from "vitest";
import {
  BancoEspelhamento,
  type Conexao,
} from "../scripts/lib/banco-espelhamento";
import type { OperacaoPrivada } from "../scripts/lib/plano-espelhamento";
import { PersistenciaDesfeita } from "../src/lib/espelhamento-privado";

const documentoId = "10000000-0000-4000-8000-000000000001";
const arquivoId = "20000000-0000-4000-8000-000000000001";
const op: OperacaoPrivada = {
  codigo: "D01",
  caminho: "fixture.svg",
  chave: "arquivos/publicidade/fixture-v1.svg",
  sha256: "a".repeat(64),
  bytes: 20,
  mimeType: "image/svg+xml",
  bucket: "observatorio-privado",
  visibilidade: "privado",
  urlPublica: null,
  principal: false,
  slugDocumento: "fixture",
  origemUrl: null,
  origemSistema: "upload",
  fonteHash: "fixture unitária",
  hashHistoricoAnterior: "nao_disponivel",
};

// Servidor controlado conserva somente o estado confirmado. Falhas são
// injetadas na fronteira SQL para testar atomicidade e resposta perdida.
function servidor(
  falha: "nenhuma" | "vinculo" | "commit_resposta" | "rollback" = "nenhuma",
) {
  let confirmado = false;
  let arquivoPendente = false;
  let vinculoPendente = false;
  const eventos: string[] = [];
  const conexoes: Conexao[] = [];
  const conectar = vi.fn(async (): Promise<Conexao> => {
    const c = {
      release: vi.fn(),
      query: vi.fn(
        async (
          sql: string,
          valores?: unknown[],
        ): Promise<{ rows: unknown[] }> => {
          eventos.push(sql);
          if (sql.includes("pg_try_advisory_xact_lock"))
            return { rows: [{ obtido: true }] };
          if (sql.includes("from documento where slug"))
            return {
              rows: [
                {
                  id: documentoId,
                  estado_documental: "ESPELHAVEL",
                  revisao_privacidade: "pendente",
                  status: "rascunho",
                  arquivado_em: null,
                },
              ],
            };
          if (sql.includes("from arquivo a"))
            return {
              rows: confirmado
                ? [
                    {
                      bucket: op.bucket,
                      visibilidade: "privado",
                      url_publica: null,
                      sha256: op.sha256,
                      bytes: String(op.bytes),
                      mime_type: op.mimeType,
                      origem_url: null,
                      origem_sistema: op.origemSistema,
                      espelhado: true,
                      slug: op.slugDocumento,
                      principal: false,
                      versao: 1,
                    },
                  ]
                : [],
            };
          if (sql.startsWith("insert into arquivo")) {
            expect(sql).toContain("'privado',NULL");
            expect(valores).toEqual([
              op.bucket,
              op.chave,
              "fixture.svg",
              "imagem",
              op.mimeType,
              op.bytes,
              op.sha256,
              null,
              op.origemSistema,
            ]);
            arquivoPendente = true;
            return { rows: [{ id: arquivoId }] };
          }
          if (sql.startsWith("insert into documento_arquivo")) {
            expect(valores).toEqual([documentoId, arquivoId, false]);
            if (falha === "vinculo" || falha === "rollback")
              throw new Error("INSERT recusado");
            vinculoPendente = true;
          }
          if (sql === "commit") {
            confirmado = arquivoPendente && vinculoPendente;
            if (falha === "commit_resposta")
              throw new Error("Resposta perdida depois do COMMIT");
          }
          if (sql === "rollback") {
            if (falha === "rollback") throw new Error("Conexão interrompida");
            arquivoPendente = false;
            vinculoPendente = false;
          }
          return { rows: [] };
        },
      ),
    };
    conexoes.push(c);
    return c;
  });
  return {
    banco: new BancoEspelhamento(conectar),
    conectar,
    conexoes,
    eventos,
    confirmado: () => confirmado,
  };
}

describe("persistência atômica e reconciliação em conexão independente", () => {
  test("arquivo e vínculo neutro são confirmados juntos e reconhecidos posteriormente", async () => {
    const s = servidor();
    await s.banco.persistir(op);
    expect(s.confirmado()).toBe(true);
    expect(s.eventos.at(-1)).toBe("commit");
    expect(await s.banco.consultar(op)).toBe("completo");
    expect(s.conexoes[0]?.release).toHaveBeenCalledWith(false);
  });

  test("falha no vínculo desfaz também o arquivo antes de autorizar compensação", async () => {
    const s = servidor("vinculo");
    await expect(s.banco.persistir(op)).rejects.toBeInstanceOf(
      PersistenciaDesfeita,
    );
    expect(s.confirmado()).toBe(false);
    expect(s.eventos.at(-1)).toBe("rollback");
    expect(await s.banco.reconciliar(op)).toBe("desfeita");
  });

  test("COMMIT sem resposta destrói conexão e reconcilia após obter a mesma trava", async () => {
    const s = servidor("commit_resposta");
    await expect(s.banco.persistir(op)).rejects.toThrow("COMMIT incerto");
    expect(s.conexoes[0]?.release).toHaveBeenCalledWith(true);
    expect(await s.banco.reconciliar(op)).toBe("confirmada");
    expect(s.conectar).toHaveBeenCalledTimes(2);
    const consultas = vi.mocked(s.conexoes[1]?.query as Conexao["query"]).mock
      .calls;
    const trava = consultas.findIndex(([sql]) =>
      sql.includes("pg_advisory_xact_lock"),
    );
    const leitura = consultas.findIndex(([sql]) =>
      sql.includes("from arquivo a"),
    );
    expect(trava).toBeGreaterThan(-1);
    expect(leitura).toBeGreaterThan(trava);
    expect(consultas[trava]?.[1]).toEqual([op.chave]);
  });

  test("ROLLBACK sem resposta não autoriza exclusão", async () => {
    const s = servidor("rollback");
    await expect(s.banco.persistir(op)).rejects.toThrow("ROLLBACK incerto");
    expect(s.conexoes[0]?.release).toHaveBeenCalledWith(true);
    expect(await s.banco.reconciliar(op)).toBe("incerta");
  });

  test("tempo limite aguardando a transação antiga mantém reconciliação incerta", async () => {
    const c: Conexao = {
      release: vi.fn(),
      query: vi.fn(async (sql: string) => {
        if (sql.includes("pg_advisory_xact_lock"))
          throw new Error("lock timeout");
        return { rows: [] };
      }),
    };
    expect(await new BancoEspelhamento(async () => c).reconciliar(op)).toBe(
      "incerta",
    );
    expect(c.release).toHaveBeenCalledWith(true);
    expect(
      vi
        .mocked(c.query)
        .mock.calls.some(([sql]) => sql.includes("from arquivo a")),
    ).toBe(false);
  });

  test("trava do lote é transacional e liberada mesmo quando a execução falha", async () => {
    const s = servidor();
    await expect(
      s.banco.comExclusividade(async () => {
        throw new Error("interrompido");
      }),
    ).rejects.toThrow("interrompido");
    expect(s.eventos[0]).toBe("begin");
    expect(s.eventos[1]).toContain("pg_try_advisory_xact_lock");
    expect(s.eventos.at(-1)).toBe("rollback");
  });

  test("executor concorrente é recusado antes de executar ação", async () => {
    const c: Conexao = {
      release: vi.fn(),
      query: vi.fn(async () => ({ rows: [{ obtido: false }] })),
    };
    const acao = vi.fn();
    await expect(
      new BancoEspelhamento(async () => c).comExclusividade(acao),
    ).rejects.toThrow("Outro executor");
    expect(acao).not.toHaveBeenCalled();
    expect(c.release).toHaveBeenCalledWith(true);
  });
});
