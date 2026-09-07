import { createHash } from "node:crypto";
import { unzipSync } from "fflate";
import { describe, expect, test } from "vitest";

import type { EvidenciaDeAnexo } from "../src/dados/consultas/anexos";
import { evidenciaManifestoSchema } from "../src/lib/manifesto-evidencias";
import { gerarZipPublico } from "../src/lib/zip-publico";

const hash = "a".repeat(64);
function evidencia(
  estado:
    | "PUBLICAVEL"
    | "RESTRITO"
    | "ESPELHAVEL"
    | "IMPEDIDO"
    | "PENDENTE"
    | null,
  revisao: "concluida" | "pendente" | null,
): EvidenciaDeAnexo {
  return {
    manifesto: evidenciaManifestoSchema.parse({
      codigo: "A01",
      natureza: "item_exigido" as const,
      obrigatorio: true,
      entregavel: "Objeto de teste",
      estado,
      revisao_privacidade: revisao,
      url: "https://publico.example/arquivos/a01.txt",
      sha256: hash,
      doi: null,
      observacao: null,
      derivado_de: ["documento:A01"],
      arquivo_existe: true,
    }),
    anexo: {
      ordemAnexo: 1,
      slug: "a01",
      rotuloArquivo: "Arquivo de teste",
      principal: true,
      titulo: "Objeto de teste",
      tipo: "outro",
      resumo: null,
      dataReferencia: null,
      licenca: "CC0",
      linkPermanente: "https://publico.example/arquivos/a01.txt",
      linkOrigem: "teste",
      mimeType: "text/plain",
      bytes: 9,
      sha256: hash,
      publicadoEm: null,
      arquivoOrigemId: null,
      arquivoRelacao: null,
      arquivoDerivacaoMetodo: null,
    },
    publicadoLegado: true,
  };
}

describe("fluxo usado pelo gerador do ZIP público", () => {
  test("0 elegíveis não chama upload", async () => {
    let uploads = 0;
    const resultado = await gerarZipPublico(
      [
        evidencia("RESTRITO", "concluida"),
        evidencia("ESPELHAVEL", "concluida"),
        evidencia("IMPEDIDO", "concluida"),
        evidencia("PENDENTE", "concluida"),
        evidencia(null, "concluida"),
        evidencia("PUBLICAVEL", "pendente"),
      ],
      {
        baixar: async () => Buffer.from("inacessível"),
        enviar: async () => {
          uploads += 1;
        },
      },
      "prestacao-de-contas/anexos.zip",
      "https://publico.example",
    );
    expect(resultado).toEqual({ estado: "sem_candidatos", quantidade: 0 });
    expect(uploads).toBe(0);
  });

  test("PUBLICAVEL com revisão concluída baixa, verifica hash e envia ZIP", async () => {
    const corpo = Buffer.from("conteúdo");
    const item = evidencia("PUBLICAVEL", "concluida");
    item.manifesto.sha256 = createHash("sha256").update(corpo).digest("hex");
    let recebido: Buffer | null = null;
    const resultado = await gerarZipPublico(
      [item],
      {
        baixar: async () => corpo,
        enviar: async (_chave, bytes) => {
          recebido = bytes;
        },
      },
      "prestacao-de-contas/anexos.zip",
      "https://publico.example",
    );
    expect(resultado.estado).toBe("publicado");
    expect(recebido).not.toBeNull();
    if (!recebido) throw new Error("ZIP não recebido no teste");
    const arquivo = unzipSync(recebido)["a01/a01.txt"];
    expect(arquivo).toBeDefined();
    expect(Buffer.from(arquivo as Uint8Array)).toEqual(corpo);
  });

  test.each([
    ["PUBLICAVEL", "pendente"],
    ["RESTRITO", "concluida"],
    ["PENDENTE", "concluida"],
    ["ESPELHAVEL", "concluida"],
    ["IMPEDIDO", "concluida"],
    [null, "concluida"],
  ] as const)("%s + revisão %s fica fora", (estado, revisao) => {
    const item = evidencia(estado, revisao);
    return expect(
      gerarZipPublico(
        [item],
        { baixar: async () => Buffer.from("x"), enviar: async () => {} },
        "destino.zip",
        "https://publico.example",
      ),
    ).resolves.toEqual({ estado: "sem_candidatos", quantidade: 0 });
  });
});
