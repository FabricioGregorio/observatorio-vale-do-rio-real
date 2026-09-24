/**
 * Contrato dos arquivos de `src/dados/publicado/`.
 *
 * Tudo aqui é sobre **forma**, nunca sobre conteúdo do acervo. Não existe
 * neste arquivo nenhuma asserção do tipo "107 anexos" ou "16 documentos": os
 * fixtures abaixo são exemplos mínimos para exercitar o schema, e tratá-los
 * como se fossem o acervo seria transformar invenção em verdade.
 *
 * Os números canônicos pertencem a `validarAcervoPublico`, que já os exige, e
 * ao teste do snapshot real — que só pode existir quando o snapshot real
 * existir, isto é, depois que o banco voltar a ser legível.
 *
 * Sem banco, sem rede, sem disco.
 */
import { describe, expect, test } from "vitest";
import { FOTO_DA_PLACA } from "../src/dados/pesquisa/excecao-placa";
import {
  acervoPublicadoSchema,
  anexoPublicadoSchema,
  episodioPublicadoSchema,
  episodiosPublicadosSchema,
  PADRAO_CHAVE_ZIP,
  releaseSchema,
} from "../src/dados/publicado/tipos";

const HASH_QUALQUER = "b".repeat(64);

function anexo(ajustes: Record<string, unknown> = {}) {
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
    tipo: "relatorio_tecnico",
    resumo: null,
    dataReferencia: null,
    licenca: "CC BY-SA 4.0",
    linkPermanente: "https://arquivos.exemplo.test/exemplo-v1.pdf",
    linkOrigem: null,
    mimeType: "application/pdf",
    bytes: 1024,
    sha256: HASH_QUALQUER,
    publicadoEm: "2026-01-02T12:00:00.000Z",
    nomeOriginal: "exemplo.pdf",
    previewUrl: null,
    previewArquivoId: null,
    previewSha256: null,
    ...ajustes,
  };
}

function episodio(ajustes: Record<string, unknown> = {}) {
  return {
    slug: "exemplo",
    temporadaNumero: 1,
    temporadaTitulo: "Temporada",
    numero: 1,
    titulo: "Exemplo",
    resumo: "Resumo.",
    publicadoEm: "2026-01-02T12:00:00.000Z",
    duracaoSeg: 600,
    transcricao: "Transcrição.",
    explicito: false,
    urlSpotify: "https://open.spotify.com/episode/exemplo",
    urlYoutube: null,
    capaUrl: null,
    capaLarguraPx: null,
    capaAlturaPx: null,
    ...ajustes,
  };
}

function release(ajustes: Record<string, unknown> = {}) {
  return {
    id: "2026-09-23-abcdef01",
    gerado_em: "2026-09-23",
    lotes_declarados: ["2026-09-16"],
    migracao: "0012",
    totais: { documentos: 1, anexos: 1, episodios: 1 },
    sha256: { acervo: HASH_QUALQUER, episodios: "c".repeat(64) },
    zip: null,
    ...ajustes,
  };
}

describe("schema fechado do acervo publicado", () => {
  test("aceita a forma canônica", () => {
    expect(anexoPublicadoSchema.safeParse(anexo()).success).toBe(true);
  });

  test("recusa propriedade desconhecida", () => {
    expect(
      anexoPublicadoSchema.safeParse({ ...anexo(), comentario: "extra" })
        .success,
    ).toBe(false);
  });

  test.each([
    ["chaveStorage", "arquivos/privado/master.wav"],
    ["visibilidade", "privado"],
    ["audioId", "44444444-4444-4444-8444-444444444444"],
    ["consentimentoId", "55555555-5555-4555-8555-555555555555"],
    ["pessoaId", "66666666-6666-4666-8666-666666666666"],
  ])("recusa o campo privado %s", (chave, valor) => {
    expect(
      anexoPublicadoSchema.safeParse({ ...anexo(), [chave]: valor }).success,
    ).toBe(false);
  });

  test("recusa chave ausente em vez de assumir null", () => {
    const { resumo: _removido, ...semResumo } = anexo();
    expect(anexoPublicadoSchema.safeParse(semResumo).success).toBe(false);
  });

  test("recusa estado ou revisão que não passaram pelo gate", () => {
    expect(
      anexoPublicadoSchema.safeParse(anexo({ estado: "RESTRITO" })).success,
    ).toBe(false);
    expect(
      anexoPublicadoSchema.safeParse(anexo({ revisaoPrivacidade: "pendente" }))
        .success,
    ).toBe(false);
  });

  test("recusa proveniência vazia", () => {
    expect(
      anexoPublicadoSchema.safeParse(anexo({ derivadoDe: [] })).success,
    ).toBe(false);
  });

  test("recusa instante sem milissegundos", () => {
    expect(
      anexoPublicadoSchema.safeParse(
        anexo({ publicadoEm: "2026-01-02T12:00:00Z" }),
      ).success,
    ).toBe(false);
  });

  test("recusa tipo fora do enum canônico", () => {
    expect(
      anexoPublicadoSchema.safeParse(anexo({ tipo: "tipo_inventado" })).success,
    ).toBe(false);
  });

  test("recusa arquivo repetido no conjunto", () => {
    expect(acervoPublicadoSchema.safeParse([anexo(), anexo()]).success).toBe(
      false,
    );
  });

  test("aceita conjunto com identidades distintas", () => {
    const outro = anexo({
      arquivoId: "22222222-2222-4222-8222-222222222222",
      codigo: "2",
      principal: false,
    });
    expect(acervoPublicadoSchema.safeParse([anexo(), outro]).success).toBe(
      true,
    );
  });
});

describe("guarda da fotografia com a placa", () => {
  test("recusa o original privado como arquivo documental", () => {
    const resultado = anexoPublicadoSchema.safeParse(
      anexo({ sha256: FOTO_DA_PLACA.sha256Original }),
    );
    expect(resultado.success).toBe(false);
    expect(JSON.stringify(resultado.error?.issues)).toMatch(
      /Original com placa/,
    );
  });

  test("recusa o original privado como asset de apresentação", () => {
    expect(
      anexoPublicadoSchema.safeParse(
        anexo({
          previewSha256: FOTO_DA_PLACA.sha256Original,
          previewUrl: "https://arquivos.exemplo.test/preview.webp",
          previewArquivoId: "77777777-7777-4777-8777-777777777777",
        }),
      ).success,
    ).toBe(false);
  });

  test("a versão pública tarjada é a única representação aceita", () => {
    expect(
      anexoPublicadoSchema.safeParse(
        anexo({
          arquivoId: FOTO_DA_PLACA.arquivoPublicoId,
          sha256: HASH_QUALQUER,
        }),
      ).success,
    ).toBe(false);

    expect(
      anexoPublicadoSchema.safeParse(
        anexo({
          arquivoId: FOTO_DA_PLACA.arquivoPublicoId,
          sha256: FOTO_DA_PLACA.sha256Publico,
          mimeType: "image/webp",
          linkPermanente: "https://arquivos.exemplo.test/tarjada-v1.webp",
        }),
      ).success,
    ).toBe(true);
  });
});

describe("schema fechado dos episódios publicados", () => {
  test("aceita a forma canônica", () => {
    expect(episodioPublicadoSchema.safeParse(episodio()).success).toBe(true);
  });

  test("recusa propriedade desconhecida", () => {
    expect(
      episodioPublicadoSchema.safeParse({ ...episodio(), audioUrl: "x" })
        .success,
    ).toBe(false);
  });

  /*
    A regra do destino de escuta não é reescrita aqui: o schema do snapshot
    reaproveita os campos de `episodioPublicoSchema`. Este teste existe para
    provar que o reaproveitamento funciona — se alguém trocar a herança por uma
    cópia frouxa, ele falha.
  */
  test("herda a exigência de que o destino de escuta seja do Spotify", () => {
    expect(
      episodioPublicadoSchema.safeParse(
        episodio({ urlSpotify: "https://exemplo.test/episodio" }),
      ).success,
    ).toBe(false);
  });

  test("recusa transcrição vazia", () => {
    expect(
      episodioPublicadoSchema.safeParse(episodio({ transcricao: "" })).success,
    ).toBe(false);
  });

  test("recusa o mesmo episódio duas vezes na mesma temporada", () => {
    expect(
      episodiosPublicadosSchema.safeParse([episodio(), episodio()]).success,
    ).toBe(false);
  });

  test("o mesmo slug em temporadas diferentes são episódios diferentes", () => {
    expect(
      episodiosPublicadosSchema.safeParse([
        episodio(),
        episodio({ temporadaNumero: 2 }),
      ]).success,
    ).toBe(true);
  });
});

describe("schema do manifesto de release", () => {
  test("aceita release sem pacote produzido", () => {
    expect(releaseSchema.safeParse(release()).success).toBe(true);
  });

  test("recusa propriedade desconhecida", () => {
    expect(
      releaseSchema.safeParse({ ...release(), commit_fonte: "4a42ffd" })
        .success,
    ).toBe(false);
  });

  test("aceita pacote endereçado pelo conteúdo", () => {
    const chave = `acervo/pacotes/anexos-${"d".repeat(12)}.zip`;
    expect(PADRAO_CHAVE_ZIP.test(chave)).toBe(true);
    expect(
      releaseSchema.safeParse(
        release({ zip: { chave, sha256: HASH_QUALQUER, bytes: 1 } }),
      ).success,
    ).toBe(true);
  });

  test("recusa chave de pacote sobrescrevível", () => {
    expect(
      releaseSchema.safeParse(
        release({
          zip: {
            chave: "prestacao-de-contas/anexos.zip",
            sha256: HASH_QUALQUER,
            bytes: 1,
          },
        }),
      ).success,
    ).toBe(false);
  });

  test("recusa pacote simulado com valores vazios", () => {
    expect(
      releaseSchema.safeParse(
        release({ zip: { chave: "", sha256: "0".repeat(64), bytes: 0 } }),
      ).success,
    ).toBe(false);
  });

  /*
    O campo se chama `lotes_declarados` e não `lotes` porque a diferença é
    de conteúdo, não de estilo: no corpus de setembro de 2026 a maior parte
    dos objetos públicos veio da migração para os originais, que não gera
    lote declarado. `lotes` convidaria à leitura "todo objeto do release veio
    de um destes", que é falsa. O nome longo fecha essa porta.
  */
  test("o campo de lotes tem o nome que declara o próprio limite", () => {
    const { lotes_declarados, ...semCampo } = release();
    expect(lotes_declarados).toEqual(["2026-09-16"]);
    expect(releaseSchema.safeParse(semCampo).success).toBe(false);
    expect(
      releaseSchema.safeParse({ ...semCampo, lotes: lotes_declarados }).success,
    ).toBe(false);
  });

  test("exige ao menos um lote declarado", () => {
    expect(
      releaseSchema.safeParse(release({ lotes_declarados: [] })).success,
    ).toBe(false);
  });

  test("recusa campo de cobertura ou de exceções no manifesto", () => {
    for (const extra of [
      { cobertura: "45/107" },
      { objetos_sem_lote: 62 },
      { excecoes: [] },
    ]) {
      expect(releaseSchema.safeParse({ ...release(), ...extra }).success).toBe(
        false,
      );
    }
  });

  test("recusa data editorial com hora", () => {
    expect(
      releaseSchema.safeParse(
        release({ gerado_em: "2026-09-23T00:00:00.000Z" }),
      ).success,
    ).toBe(false);
  });
});
