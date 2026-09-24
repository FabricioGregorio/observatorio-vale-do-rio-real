import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { serializarAnexos } from "../src/app/anexos.json/route";
import { ListaMateriaisPublicos } from "../src/componentes/acervo/ListaMateriaisPublicos";
import type { AnexoPublico } from "../src/dados/consultas/anexos";
import { LOTE_PUBLICACAO } from "../src/dados/lote-publicacao";
import {
  montarRotulo,
  separarCredito,
} from "../src/dados/pesquisa/credito-fotografico";
import { DERIVADOS_DOS_LUGARES } from "../src/dados/pesquisa/derivados";

/**
 * Decisão humana de 2026-09-16: as duas fotografias de autoria de terceiro
 * continuam públicas, e o crédito é obrigatório. O que estes testes protegem é
 * a atribuição — não a presença das fotos, que é decisão editorial, mas o fato
 * de que **nenhuma superfície pode exibir a foto sem o crédito** enquanto a
 * outra exibe.
 */

const AUTORIA = [
  {
    chave:
      "arquivos/comprovacao-de-campo/b01-diretor-turismo-sao-cristovao-marcio-ramos-foto-por-dani-santos-v1.webp",
    autor: "Dani Santos",
    credito: "Foto: Dani Santos",
  },
  {
    chave:
      "arquivos/comprovacao-de-campo/b01-fundacao-cultura-sao-cristovao-paola-rodrigues-foto-por-iago-de-andrade-santos-v1.webp",
    autor: "Iago de Andrade Santos",
    credito: "Foto: Iago de Andrade Santos",
  },
] as const;

function anexo(over: Partial<AnexoPublico> = {}): AnexoPublico {
  return {
    arquivoId: "11111111-1111-4111-8111-111111111111",
    codigo: "12",
    estado: "PUBLICAVEL",
    revisaoPrivacidade: "concluida",
    derivadoDe: [],
    arquivoOrigemId: null,
    arquivoRelacao: null,
    arquivoDerivacaoMetodo: null,
    ordemAnexo: 12,
    slug: "fotografias-visitas-i-vii",
    rotuloArquivo: null,
    principal: false,
    titulo: "Fotografias de comprovação — Visitas I a VII",
    tipo: "outro",
    resumo: null,
    dataReferencia: null,
    licenca: "CC BY-SA 4.0",
    linkPermanente: "https://acervo.exemplo/foto.webp",
    linkOrigem: null,
    mimeType: "image/webp",
    bytes: 1000,
    sha256: "0".repeat(64),
    publicadoEm: null,
    ...over,
  };
}

describe("composição e leitura do crédito", () => {
  test("sem autor, o rótulo passa intacto e não inventa crédito", () => {
    expect(montarRotulo("B01 · foto.jpg", null)).toBe("B01 · foto.jpg");
    expect(separarCredito("B01 · foto.jpg")).toEqual({
      rotulo: "B01 · foto.jpg",
      credito: null,
    });
  });

  test("com autor, compor e separar é ida e volta sem perda", () => {
    for (const { autor, credito } of AUTORIA) {
      const rotulo = montarRotulo("B01 · foto.jpg", autor);
      expect(separarCredito(rotulo)).toEqual({
        rotulo: "B01 · foto.jpg",
        credito,
      });
    }
  });

  test("rótulo ausente ou crédito vazio não produz atribuição falsa", () => {
    expect(separarCredito(null).credito).toBeNull();
    expect(separarCredito("B01 · foto.jpg — Foto:   ").credito).toBeNull();
  });
});

describe("as duas fotografias de terceiro no lote publicado", () => {
  test("continuam no lote, com autoria declarada", () => {
    for (const { chave, autor } of AUTORIA) {
      const entrada = LOTE_PUBLICACAO.find((e) => e.chave === chave);
      expect(entrada, chave).toBeDefined();
      expect(entrada?.autor).toBe(autor);
      expect(entrada?.codigo).toBe("B01");
    }
  });

  test("são exatamente duas; nenhuma outra entrada declara autoria", () => {
    const comAutor = LOTE_PUBLICACAO.filter((e) => e.autor !== null);
    expect(comAutor.map((e) => e.autor).sort()).toEqual([
      "Dani Santos",
      "Iago de Andrade Santos",
    ]);
  });

  test("o rótulo gravado nunca leva o crédito embutido no texto base", () => {
    for (const entrada of LOTE_PUBLICACAO) {
      expect(separarCredito(entrada.rotulo).credito, entrada.chave).toBeNull();
    }
  });
});

describe("o crédito chega a cada superfície pública", () => {
  test("Acervo: crédito em linha própria, fora do texto do link", () => {
    const html = renderToStaticMarkup(
      createElement(ListaMateriaisPublicos, {
        anexos: [
          anexo({
            rotuloArquivo: montarRotulo(
              "B01 · marcio-ramos.jpg",
              "Dani Santos",
            ),
          }),
        ],
      }),
    );
    expect(html).toContain("Foto: Dani Santos");
    // O link mostra a identidade do arquivo; o crédito fica fora dele.
    // O arquivo abre em nova guia: a seta decorativa fecha o texto do link.
    expect(html).toMatch(
      />B01 · marcio-ramos\.jpg <span aria-hidden="true">↗<\/span><\/a>/,
    );
    expect(html).not.toMatch(/<a[^>]*>[^<]*Foto: Dani Santos/);
  });

  test("/anexos.json: crédito é campo próprio, não texto colado no rótulo", () => {
    const json = serializarAnexos(
      [
        anexo({
          rotuloArquivo: montarRotulo(
            "B01 · paola-rodrigues.jpeg",
            "Iago de Andrade Santos",
          ),
        }),
      ],
      "2026-09-24",
    );
    expect(json.anexos[0]?.credito).toBe("Foto: Iago de Andrade Santos");
    expect(json.anexos[0]?.rotulo_arquivo).toBe("B01 · paola-rodrigues.jpeg");
  });

  /**
   * Nenhuma das duas está hoje no recorte das fichas. O contrato é que, se
   * alguma entrar, ela chega com o crédito junto — a Home não pode exibir uma
   * fotografia creditada sem a atribuição que o Acervo já conhece.
   */
  test("fichas: toda foto do recorte declara o par autor/crédito", () => {
    for (const foto of DERIVADOS_DOS_LUGARES) {
      expect(foto, foto.arquivo).toHaveProperty("autor");
      expect(foto, foto.arquivo).toHaveProperty("credito");
      if (foto.autor) expect(foto.credito).toBe(`Foto: ${foto.autor}`);
      else expect(foto.credito).toBeNull();
    }
  });
});
