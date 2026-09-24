/**
 * Identidade do vocabulário de tipo de documento.
 *
 * Os doze valores já existiram em três cópias — o enum do schema PostgreSQL,
 * a constante do catalogador e a camada do snapshot. O schema saiu com o
 * banco; restam uma definição, em `src/dados/tipo-documento.ts`, e dois
 * consumidores.
 *
 * Estes testes travam duas coisas: que a lista é exatamente a que o modelo
 * documental fixou, e que o schema público aceita e recusa exatamente esses
 * valores.
 */
import { describe, expect, test } from "vitest";
import { TIPOS_DOCUMENTO as TIPOS_NO_CATALOGO } from "../src/dados/catalogo-documental";
import { anexoPublicadoSchema } from "../src/dados/publicado/tipos";
import { TIPOS_DOCUMENTO } from "../src/dados/tipo-documento";

/**
 * A lista esperada, escrita à mão aqui de propósito.
 *
 * É o único lugar do repositório onde os doze valores aparecem duplicados, e
 * a duplicação é o teste: alterar `tipo-documento.ts` passa a exigir alterar
 * também esta lista. Um teste que comparasse a definição consigo mesma não
 * travaria nada.
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
  test("a definição pura contém exatamente os doze valores canônicos", () => {
    expect(TIPOS_DOCUMENTO).toEqual(ESPERADOS);
  });

  test("o catálogo documental consome a mesma lista", () => {
    expect(TIPOS_NO_CATALOGO).toBe(TIPOS_DOCUMENTO);
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
