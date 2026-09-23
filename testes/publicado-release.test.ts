/**
 * Identidade do release, serialização canônica e reprodutibilidade.
 *
 * A propriedade que estes testes defendem é uma só:
 *
 *     mesmos dados + mesma data editorial = mesmos bytes
 *
 * Ela é o que permite dizer que dois builds do mesmo commit publicam a mesma
 * coisa, e o que faz `git diff src/dados/publicado/` ser leitura de uma
 * publicação em vez de ruído. Sem banco, sem rede, sem disco.
 */
import { describe, expect, test } from "vitest";
import {
  migracaoDoJournal,
  montarSnapshot,
  opcoes,
} from "../scripts/gerar-snapshot-publicado";
import type { AnexoPublico } from "../src/dados/consultas/anexos";
import type { EpisodioPublico } from "../src/dados/consultas/podobservar";
import {
  calcularIdDoRelease,
  conferirRelease,
  exigirDataEditorial,
  ReleaseIncoerente,
  serializarCanonico,
  sha256DeTexto,
} from "../src/dados/publicado/release";
import { NOME_RELEASE } from "../src/dados/publicado/tipos";

const DATA = "2026-09-23";

const ANEXO: AnexoPublico = {
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
  tipo: "relatorio_tecnico",
  resumo: null,
  dataReferencia: null,
  licenca: "CC BY-SA 4.0",
  linkPermanente: "https://arquivos.exemplo.test/exemplo-v1.pdf",
  linkOrigem: null,
  mimeType: "application/pdf",
  bytes: 1024,
  sha256: "b".repeat(64),
  publicadoEm: new Date("2026-01-02T12:00:00.000Z"),
  nomeOriginal: "exemplo.pdf",
};

const EPISODIO: EpisodioPublico = {
  slug: "exemplo",
  temporadaNumero: 1,
  temporadaTitulo: "Temporada",
  numero: 1,
  titulo: "Exemplo",
  resumo: "Resumo.",
  publicadoEm: new Date("2026-01-03T15:00:00.000Z"),
  duracaoSeg: 600,
  transcricao: "Transcrição.",
  explicito: false,
  urlSpotify: "https://open.spotify.com/episode/exemplo",
  urlYoutube: null,
  capaUrl: null,
  capaLarguraPx: null,
  capaAlturaPx: null,
};

function montar(ajustes: Partial<Parameters<typeof montarSnapshot>[0]> = {}) {
  return montarSnapshot({
    anexos: [ANEXO],
    episodios: [EPISODIO],
    dataEditorial: DATA,
    lotesDeclarados: ["2026-09-16"],
    migracao: "0012",
    zip: null,
    ...ajustes,
  });
}

describe("data editorial", () => {
  test("é obrigatória e explica por quê", () => {
    expect(() => exigirDataEditorial(undefined)).toThrow(/--data AAAA-MM-DD/);
    expect(() => exigirDataEditorial("   ")).toThrow(/ausente/);
  });

  test("nunca assume hoje", () => {
    const hoje = new Date().toISOString().slice(0, 10);
    let capturada: string | null = null;
    try {
      exigirDataEditorial(null);
    } catch (erro) {
      capturada = erro instanceof Error ? erro.message : String(erro);
    }
    expect(capturada).not.toContain(hoje);
  });

  test("recusa formato fora de AAAA-MM-DD", () => {
    for (const valor of ["23/09/2026", "2026-9-23", "2026-09-23T00:00:00Z"]) {
      expect(() => exigirDataEditorial(valor)).toThrow(/inválida/);
    }
  });

  test("recusa data que o calendário não tem", () => {
    expect(() => exigirDataEditorial("2026-02-30")).toThrow(/inexistente/);
    expect(() => exigirDataEditorial("2026-13-01")).toThrow(/inexistente/);
  });

  test("aceita 29 de fevereiro em ano bissexto", () => {
    expect(exigirDataEditorial("2028-02-29")).toBe("2028-02-29");
  });
});

describe("serialização canônica", () => {
  test("a ordem em que o objeto foi construído não muda os bytes", () => {
    const a = serializarCanonico({ b: 1, a: 2, c: { z: 3, y: 4 } });
    const b = serializarCanonico({ c: { y: 4, z: 3 }, a: 2, b: 1 });
    expect(a).toBe(b);
  });

  test("preserva a ordem dos arrays, que é conteúdo", () => {
    expect(serializarCanonico([3, 1, 2])).not.toBe(
      serializarCanonico([1, 2, 3]),
    );
  });

  test("recua com dois espaços e termina em nova linha", () => {
    const texto = serializarCanonico({ a: 1 });
    expect(texto).toBe('{\n  "a": 1\n}\n');
  });

  test("recusa Date em vez de convertê-lo em silêncio", () => {
    expect(() => serializarCanonico({ quando: new Date(0) })).toThrow(/Date/);
  });

  test("recusa undefined em vez de deixar a chave sumir", () => {
    expect(() => serializarCanonico({ a: undefined })).toThrow(
      /não serializável/,
    );
  });

  test("recusa número não finito", () => {
    expect(() => serializarCanonico({ a: Number.NaN })).toThrow(/não finito/);
    expect(() => serializarCanonico({ a: Number.POSITIVE_INFINITY })).toThrow(
      /não finito/,
    );
  });
});

describe("identificador do release", () => {
  test("é determinístico", () => {
    const a = calcularIdDoRelease(DATA, "a".repeat(64), "b".repeat(64));
    const b = calcularIdDoRelease(DATA, "a".repeat(64), "b".repeat(64));
    expect(a).toBe(b);
    expect(a).toMatch(/^2026-09-23-[a-f0-9]{8}$/);
  });

  test("muda quando o conteúdo muda", () => {
    expect(calcularIdDoRelease(DATA, "a".repeat(64), "b".repeat(64))).not.toBe(
      calcularIdDoRelease(DATA, "a".repeat(64), "c".repeat(64)),
    );
  });

  test("muda quando a data editorial muda", () => {
    expect(calcularIdDoRelease(DATA, "a".repeat(64), "b".repeat(64))).not.toBe(
      calcularIdDoRelease("2026-09-24", "a".repeat(64), "b".repeat(64)),
    );
  });

  test("não depende do relógio nem de valor aleatório", () => {
    const antes = calcularIdDoRelease(DATA, "a".repeat(64), "b".repeat(64));
    const depois = calcularIdDoRelease(DATA, "a".repeat(64), "b".repeat(64));
    expect(antes).toBe(depois);
  });

  test("pode ser recalculado a partir do manifesto sozinho", () => {
    const { release } = montar();
    expect(
      calcularIdDoRelease(
        release.gerado_em,
        release.sha256.acervo,
        release.sha256.episodios,
      ),
    ).toBe(release.id);
  });
});

describe("conferência do manifesto", () => {
  test("aceita o conjunto coerente", () => {
    const { release, arquivos } = montar();
    const acervo = arquivos[0]?.conteudo ?? "";
    const episodios = arquivos[1]?.conteudo ?? "";
    expect(() => conferirRelease(release, acervo, episodios)).not.toThrow();
  });

  test("detecta arquivo de dados trocado", () => {
    const { release, arquivos } = montar();
    const episodios = arquivos[1]?.conteudo ?? "";
    expect(() => conferirRelease(release, "[]\n", episodios)).toThrow(
      ReleaseIncoerente,
    );
  });

  test("detecta manifesto adulterado", () => {
    const { release, arquivos } = montar();
    const acervo = arquivos[0]?.conteudo ?? "";
    const episodios = arquivos[1]?.conteudo ?? "";
    const adulterado = { ...release, id: "2026-09-23-00000000" };
    expect(() => conferirRelease(adulterado, acervo, episodios)).toThrow(
      /incompatível com o conteúdo/,
    );
  });
});

describe("montagem do snapshot", () => {
  test("mesma entrada e mesma data produzem os mesmos bytes", () => {
    const primeiro = montar();
    const segundo = montar();
    expect(segundo.arquivos.map((a) => a.conteudo)).toEqual(
      primeiro.arquivos.map((a) => a.conteudo),
    );
    expect(segundo.release.id).toBe(primeiro.release.id);
  });

  test("data editorial diferente muda o release, não os dados", () => {
    const primeiro = montar();
    const segundo = montar({ dataEditorial: "2026-09-24" });
    expect(segundo.arquivos[0]?.conteudo).toBe(primeiro.arquivos[0]?.conteudo);
    expect(segundo.arquivos[1]?.conteudo).toBe(primeiro.arquivos[1]?.conteudo);
    expect(segundo.release.id).not.toBe(primeiro.release.id);
  });

  test("o manifesto é o último arquivo do conjunto", () => {
    const { arquivos } = montar();
    expect(arquivos.at(-1)?.nome).toBe(NOME_RELEASE);
  });

  test("os totais são contados, não declarados", () => {
    const outro: AnexoPublico = {
      ...ANEXO,
      arquivoId: "22222222-2222-4222-8222-222222222222",
      slug: "outro-exemplo",
      codigo: "2",
      principal: false,
    };
    const { release } = montar({ anexos: [ANEXO, outro] });
    expect(release.totais).toEqual({
      documentos: 2,
      anexos: 2,
      episodios: 1,
    });
  });

  test("o hash gravado é o do arquivo gravado", () => {
    const { release, arquivos } = montar();
    expect(release.sha256.acervo).toBe(
      sha256DeTexto(arquivos[0]?.conteudo ?? ""),
    );
    expect(release.sha256.episodios).toBe(
      sha256DeTexto(arquivos[1]?.conteudo ?? ""),
    );
  });

  test("declara a ausência do pacote em vez de simulá-la", () => {
    expect(montar().release.zip).toBeNull();
  });

  test("a data editorial é exigida também na montagem", () => {
    expect(() => montar({ dataEditorial: "" })).toThrow(/ausente/);
  });

  test("converte o instante para ISO com milissegundos", () => {
    const acervo = JSON.parse(montar().arquivos[0]?.conteudo ?? "[]");
    expect(acervo[0].publicadoEm).toBe("2026-01-02T12:00:00.000Z");
  });

  test("campo opcional ausente vira null explícito, nunca chave faltante", () => {
    const semNome: AnexoPublico = { ...ANEXO };
    delete (semNome as { nomeOriginal?: string | null }).nomeOriginal;
    const acervo = JSON.parse(
      montar({ anexos: [semNome] }).arquivos[0]?.conteudo ?? "[]",
    );
    expect(Object.hasOwn(acervo[0], "nomeOriginal")).toBe(true);
    expect(acervo[0].nomeOriginal).toBeNull();
  });
});

describe("linha de comando do gerador", () => {
  test("exige a data", () => {
    expect(() => opcoes([])).toThrow(/--data AAAA-MM-DD/);
  });

  test("é ensaio por padrão", () => {
    expect(opcoes(["--data", DATA])).toEqual({
      escrever: false,
      dataEditorial: DATA,
    });
  });

  test("grava somente com a flag explícita", () => {
    expect(opcoes(["--data", DATA, "--escrever"]).escrever).toBe(true);
    expect(opcoes(["--data", DATA, "--dry-run"]).escrever).toBe(false);
  });

  test("recusa argumento desconhecido", () => {
    expect(() => opcoes(["--data", DATA, "--forca"])).toThrow();
    expect(() => opcoes(["--data", DATA, "--escrever", "--dry-run"])).toThrow();
  });
});

describe("migração declarada no manifesto", () => {
  test("é lida do journal, não digitada", () => {
    expect(
      migracaoDoJournal({
        entries: [
          { idx: 1, tag: "0001_fundacao" },
          { idx: 12, tag: "0012_tripwire_podobservar" },
        ],
      }),
    ).toBe("0012");
  });

  test("usa a maior entrada, não a última do array", () => {
    expect(
      migracaoDoJournal({
        entries: [
          { idx: 12, tag: "0012_tripwire_podobservar" },
          { idx: 2, tag: "0002_nucleo_prestacao_contas" },
        ],
      }),
    ).toBe("0012");
  });

  test("recusa journal sem entradas", () => {
    expect(() => migracaoDoJournal({ entries: [] })).toThrow();
  });
});
