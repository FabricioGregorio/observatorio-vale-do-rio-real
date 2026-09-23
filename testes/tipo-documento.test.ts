/**
 * Identidade do vocabulário `tipo_documento`.
 *
 * Os doze valores existiam em duas cópias — o `pgEnum` de `db/schema.ts` e a
 * constante de `scripts/catalogar-documentos.ts` — e a camada do snapshot
 * precisava de uma terceira. Agora há uma definição e três consumidores.
 *
 * Estes testes travam três coisas ao mesmo tempo: que a lista é exatamente a
 * que a migração 0001 criou, que os três consumidores enxergam a **mesma**
 * lista, e que o schema público aceita e recusa exatamente esses valores.
 *
 * Importar `db/schema` aqui não abre conexão: o módulo só declara tabelas e
 * tipos. O cliente vive em `db/cliente.ts`, que ninguém importa daqui.
 */
import { describe, expect, test } from "vitest";
import { tipoDocumento } from "../db/schema";
import { TIPOS_DOCUMENTO as TIPOS_NO_CATALOGADOR } from "../scripts/catalogar-documentos";
import { anexoPublicadoSchema } from "../src/dados/publicado/tipos";
import { TIPOS_DOCUMENTO } from "../src/dados/tipo-documento";

/**
 * A lista esperada, escrita à mão aqui de propósito.
 *
 * É o único lugar do repositório onde os doze valores aparecem duplicados, e
 * a duplicação é o teste: se alguém alterar `tipo-documento.ts` sem alterar o
 * banco, esta lista acusa. Um teste que comparasse a definição consigo mesma
 * não travaria nada.
 */
const ESPERADOS = [
  "relatorio_tecnico",
  "diagnostico_interno",
  "relato_campo",
  "formulario_modelo",
  "relatorio_parcial",
  "documento_final",
  "modelagem_estatistica",
  "entrevista_transcricao",
  "plano_aula",
  "identidade_visual",
  "painel_dados",
  "outro",
] as const;

function anexoCom(tipo: string) {
  return {
    arquivoId: "11111111-1111-4111-8111-111111111111",
    codigo: "1",
    estado: "PUBLICAVEL",
    revisaoPrivacidade: "concluida",
    derivadoDe: ["documento:exemplo"],
    derivadoDeDocumento: null,
    arquivoOrigemId: null,
    arquivoRelacao: null,
    arquivoDerivacaoMetodo: null,
    ordemAnexo: 1,
    slug: "exemplo",
    rotuloArquivo: null,
    principal: true,
    titulo: "Exemplo",
    tipo,
    resumo: null,
    dataReferencia: null,
    licenca: "CC BY-SA 4.0",
    linkPermanente: "https://arquivos.exemplo.test/exemplo-v1.pdf",
    linkOrigem: null,
    mimeType: "application/pdf",
    bytes: 1024,
    sha256: "b".repeat(64),
    publicadoEm: "2026-01-02T12:00:00.000Z",
    nomeOriginal: "exemplo.pdf",
    previewUrl: null,
    previewArquivoId: null,
    previewSha256: null,
  };
}

describe("vocabulário de tipo de documento", () => {
  test("a definição pura contém exatamente os doze valores da migração 0001", () => {
    expect(TIPOS_DOCUMENTO).toEqual(ESPERADOS);
  });

  test("o pgEnum consome a mesma lista, na mesma ordem", () => {
    expect(tipoDocumento.enumValues).toEqual([...ESPERADOS]);
  });

  test("o nome do tipo no PostgreSQL não mudou", () => {
    expect(tipoDocumento.enumName).toBe("tipo_documento");
  });

  test("o catalogador consome a mesma lista", () => {
    expect(TIPOS_NO_CATALOGADOR).toBe(TIPOS_DOCUMENTO);
  });

  test("nenhum valor aparece repetido", () => {
    expect(new Set(TIPOS_DOCUMENTO).size).toBe(TIPOS_DOCUMENTO.length);
  });
});

describe("o schema público aceita e recusa o mesmo vocabulário", () => {
  test.each(ESPERADOS)("aceita %s", (tipo) => {
    expect(anexoPublicadoSchema.safeParse(anexoCom(tipo)).success).toBe(true);
  });

  test.each(["relatorio", "RELATORIO_TECNICO", "", "outro_tipo"])(
    "recusa %s",
    (tipo) => {
      expect(anexoPublicadoSchema.safeParse(anexoCom(tipo)).success).toBe(
        false,
      );
    },
  );
});
