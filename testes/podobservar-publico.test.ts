import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { PodObservarNaHome } from "../src/componentes/home/PodObservar";
import { analisarTranscricao } from "../src/componentes/podobservar/analiseDaTranscricao";
import { CadernoDeEscuta } from "../src/componentes/podobservar/CadernoDeEscuta";
import {
  dataCurta,
  dataMaquina,
  duracaoLegivel,
  duracaoMaquina,
  numeroDoEpisodio,
} from "../src/componentes/podobservar/formato";
import {
  NOTA_DA_TRANSCRICAO,
  Transcricao,
} from "../src/componentes/podobservar/Transcricao";
import type { EpisodioPublico } from "../src/dados/consultas/podobservar";

/**
 * Experiência pública do PodObservar — P0.3.
 *
 * O que estes testes protegem não é aparência: é a política de distribuição sobrevivendo ao
 * próximo refactor. O site divulga e não reproduz, e a diferença entre as duas
 * coisas é um `<iframe>` que alguém acrescenta de boa-fé. Aqui isso falha.
 *
 * As superfícies são renderizadas com fixtures, não com a view real: no
 * momento em que esta fase foi escrita os três episódios estavam em rascunho e
 * `vw_episodio_publico` tinha zero linhas. Um teste que dependesse do banco
 * passaria por vacuidade — e deixaria de passar no dia em que os episódios
 * fossem publicados, que é exatamente quando ele precisa valer.
 */

function episodio(over: Partial<EpisodioPublico> = {}): EpisodioPublico {
  return {
    slug: "01-o-que-e-o-vale-do-rio-real",
    temporadaNumero: 1,
    temporadaTitulo: "1ª Temporada",
    numero: 1,
    titulo: "#01 Episódio - O que é o Vale do Rio Real?",
    resumo: "O primeiro episódio apresenta o Observatório.",
    publicadoEm: new Date("2026-08-31T15:00:00Z"),
    duracaoSeg: 1433,
    transcricao: "[00:00]\n[vinheta de abertura]\nLAURA AGUIAR\nOi, gente!",
    explicito: false,
    urlSpotify: "https://open.spotify.com/episode/4I2y3ku1E62PjxtDNWo8Uf",
    urlYoutube: "https://www.youtube.com/watch?v=CcNdxMkuFcI",
    capaUrl: null,
    capaLarguraPx: null,
    capaAlturaPx: null,
    ...over,
  };
}

const html = (no: Parameters<typeof renderToStaticMarkup>[0]) =>
  renderToStaticMarkup(no);

describe("caderno de escuta", () => {
  test("destaca a primeira entrada e preserva destinos e texto de cada episódio", () => {
    const recente = episodio({ numero: 4, slug: "04-entre-dados-e-fatos" });
    const anterior = episodio();
    const marcacao = html(
      createElement(CadernoDeEscuta, { episodios: [recente, anterior] }),
    );
    expect(marcacao.match(/<article /g)).toHaveLength(2);
    expect(marcacao.indexOf("titulo-04-entre-dados-e-fatos")).toBeLessThan(
      marcacao.indexOf("titulo-01-o-que-e-o-vale-do-rio-real"),
    );
    expect(marcacao.match(/data-acao="primary"/g)).toHaveLength(1);
    for (const ep of [recente, anterior]) {
      expect(marcacao).toContain(ep.resumo);
      expect(marcacao).toContain(ep.urlSpotify);
      expect(marcacao).toContain(`/podobservar/t1/${ep.slug}`);
    }
    expect(marcacao).toContain(anterior.urlYoutube);
    expect(marcacao).not.toMatch(/<(audio|iframe|video)\b/);
  });

  test("um único episódio sem capa ou YouTube mantém a leitura e a escuta", () => {
    const marcacao = html(
      createElement(CadernoDeEscuta, {
        episodios: [episodio({ urlYoutube: null })],
      }),
    );
    expect(marcacao.match(/<article /g)).toHaveLength(1);
    expect(marcacao).toContain("Ouvir no Spotify");
    expect(marcacao).toContain("Ler transcrição e detalhes");
    expect(marcacao).not.toContain("Assistir no YouTube");
    expect(marcacao).not.toContain("Percorrer episódios");
    expect(marcacao).not.toContain("Continue a escuta.");
  });

  test("lista vazia não anuncia episódio recente nem oferece índice vazio", () => {
    const marcacao = html(createElement(CadernoDeEscuta, { episodios: [] }));
    expect(marcacao).toContain("Nenhum episódio publicado no site até agora.");
    expect(marcacao).not.toContain("Episódio mais recente");
    expect(marcacao).not.toContain("<article");
    expect(marcacao).not.toContain("Percorrer episódios");
    expect(marcacao.match(/<h1[ >]/g)).toHaveLength(1);
  });
});

/* ------------------------------------------------------------------ */

describe("formatação pública", () => {
  test("a data renderiza o dia editorial de Sergipe, não a véspera", () => {
    // `publicado_em` é meio-dia local; formatar em UTC daria o mesmo dia, mas
    // formatar sem fuso explícito num runner a leste daria 01/09.
    expect(dataCurta(new Date("2026-08-31T15:00:00Z"))).toBe("31/08/2026");
    expect(dataCurta(new Date("2026-09-07T15:00:00Z"))).toBe("07/09/2026");
    expect(dataCurta(new Date("2026-09-14T15:00:00Z"))).toBe("14/09/2026");
  });

  test("o dateTime de máquina também usa o fuso do território", () => {
    expect(dataMaquina(new Date("2026-08-31T15:00:00Z"))).toBe("2026-08-31");
  });

  test("a duração é dita por extenso, não como dois-pontos ambíguo", () => {
    expect(duracaoLegivel(1433)).toBe("23 min 53 s");
    expect(duracaoLegivel(1938)).toBe("32 min 18 s");
    expect(duracaoLegivel(1907)).toBe("31 min 47 s");
    expect(duracaoLegivel(1800)).toBe("30 min");
    expect(duracaoLegivel(3723)).toBe("1 h 02 min 03 s");
  });

  test("a duração de máquina é ISO-8601", () => {
    expect(duracaoMaquina(1433)).toBe("PT23M53S");
    expect(duracaoMaquina(3723)).toBe("PT1H2M3S");
  });

  test("o número do episódio é escrito como a identidade editorial escreve", () => {
    expect(numeroDoEpisodio(1)).toBe("01");
    expect(numeroDoEpisodio(12)).toBe("12");
  });
});

/* ------------------------------------------------------------------ */

describe("análise da transcrição", () => {
  const texto = [
    "[00:00]",
    "[vinheta de abertura do PodObservar]",
    "LAURA AGUIAR — APRESENTADORA",
    "Oi, oi, gente! Eu sou Laura Aguiar e esse é o PodObservar, o podcast do",
    "Observatório de Cultura e Economia Criativa do Vale do Rio Real.",
    "",
    "[02:45]",
    "PEDRO MENEZES",
    "A casa de taipa foi construída na década de 1930.",
    "[risos]",
  ].join("\n");

  const blocos = analisarTranscricao(texto);

  test("classifica tempo, som, locutor e fala", () => {
    expect(blocos.map((b) => b.tipo)).toEqual([
      "tempo",
      "som",
      "locutor",
      "fala",
      "tempo",
      "locutor",
      "fala",
      "som",
    ]);
  });

  /**
   * O PDF de origem quebra na margem, no meio da frase. Renderizar cada
   * quebra como parágrafo produziria um texto picado e ilegível — e a
   * transcrição existe para ser lida por quem não pode ouvir.
   */
  test("linhas de fala consecutivas formam um parágrafo só", () => {
    const fala = blocos.find((b) => b.tipo === "fala");
    expect(fala).toMatchObject({
      tipo: "fala",
      texto:
        "Oi, oi, gente! Eu sou Laura Aguiar e esse é o PodObservar, o podcast do " +
        "Observatório de Cultura e Economia Criativa do Vale do Rio Real.",
    });
  });

  test("separa nome e função do locutor", () => {
    expect(blocos[2]).toEqual({
      tipo: "locutor",
      nome: "LAURA AGUIAR",
      funcao: "APRESENTADORA",
    });
    expect(blocos[5]).toEqual({
      tipo: "locutor",
      nome: "PEDRO MENEZES",
      funcao: null,
    });
  });

  test("fala inteiramente em maiúsculas com pontuação não vira locutor", () => {
    const [bloco] = analisarTranscricao("ISSO É UM ABSURDO!");
    expect(bloco?.tipo).toBe("fala");
  });

  test("rótulo longo com função continua sendo locutor", () => {
    const [bloco] = analisarTranscricao(
      "OVIÊDO ABREU — GESTOR DO CENTRO CULTURAL E MUSEU BORDA DA MATA",
    );
    expect(bloco).toMatchObject({ tipo: "locutor", nome: "OVIÊDO ABREU" });
  });

  test("texto vazio não produz bloco", () => {
    expect(analisarTranscricao("")).toEqual([]);
    expect(analisarTranscricao("\n\n  \n")).toEqual([]);
  });
});

/* ------------------------------------------------------------------ */

describe("renderização da transcrição", () => {
  const marcacao = html(
    createElement(Transcricao, {
      texto:
        "[00:00]\n[risos]\nLAURA AGUIAR — APRESENTADORA\nBom dia a todos.\n\n[03:18]\nFim.",
    }),
  );

  test("preserva timestamps, marcações sonoras, locutores e falas", () => {
    expect(marcacao).toContain("00:00");
    expect(marcacao).toContain("03:18");
    expect(marcacao).toContain("risos");
    expect(marcacao).toContain("LAURA AGUIAR");
    expect(marcacao).toContain("APRESENTADORA");
    expect(marcacao).toContain("Bom dia a todos.");
  });

  test("timestamps não viram controle de reprodução", () => {
    expect(marcacao).not.toContain("<button");
    expect(marcacao).not.toContain("<audio");
    expect(marcacao).not.toContain("play");
    expect(marcacao).not.toMatch(/href="[^"]*#t=/);
  });

  /** Texto do banco entra escapado pela árvore do React, nunca como HTML. */
  test("conteúdo é escapado, não interpretado como marcação", () => {
    const perigoso = html(
      createElement(Transcricao, {
        texto: "[00:00]\nLAURA AGUIAR\nDisse <script>alert(1)</script> e saiu.",
      }),
    );
    expect(perigoso).not.toContain("<script>");
    expect(perigoso).toContain("&lt;script&gt;");
  });
});

/* ------------------------------------------------------------------ */

describe("seção do PodObservar na Home", () => {
  const comEpisodio = html(
    createElement(PodObservarNaHome, { recente: episodio() }),
  );
  const semEpisodio = html(createElement(PodObservarNaHome, { recente: null }));

  test("é o capítulo II, entre Origem e Território", () => {
    expect(comEpisodio).toContain(">II<");
    expect(comEpisodio).toContain("PodObservar");
    expect(comEpisodio).toContain("A pesquisa também se escuta.");
  });

  test("traz a cadência como informação editorial", () => {
    expect(comEpisodio).toContain("Novo episódio toda segunda-feira.");
  });

  test("mostra o episódio mais recente com data e duração reais", () => {
    expect(comEpisodio).toContain("Episódio mais recente");
    expect(comEpisodio).toContain("#01 Episódio - O que é o Vale do Rio Real?");
    expect(comEpisodio).toContain("31/08/2026");
    expect(comEpisodio).toContain("23 min 53 s");
  });

  /** A Home não sabe que existem três. Com o EP04, mostra o EP04. */
  test("não contém quantidade de episódios escrita à mão", () => {
    expect(comEpisodio).not.toMatch(/\b3 epis[oó]dios\b/i);
    expect(semEpisodio).not.toMatch(/\b\d+ epis[oó]dios publicados\b/i);
  });

  test("o CTA do Spotify é externo, com aviso de nova guia", () => {
    expect(comEpisodio).toContain(
      'href="https://open.spotify.com/episode/4I2y3ku1E62PjxtDNWo8Uf"',
    );
    expect(comEpisodio).toContain('target="_blank"');
    expect(comEpisodio).toMatch(
      /rel="(?=[^"]*noopener)(?=[^"]*noreferrer)[^"]*"/,
    );
    expect(comEpisodio).toContain("Abre em nova guia.");
    expect(comEpisodio).toContain("Ouvir no Spotify");
  });

  test("o CTA interno fica na mesma guia e não usa seta de saída", () => {
    expect(comEpisodio).toContain('href="/podobservar"');
    expect(comEpisodio).toContain("Ver PodObservar");
    const interno = comEpisodio.slice(
      comEpisodio.indexOf('href="/podobservar"'),
    );
    expect(interno.slice(0, 200)).not.toContain("_blank");
    expect(interno.slice(0, 200)).not.toContain("↗");
  });

  test("sem episódio público, o estado vazio é honesto e não inventa nada", () => {
    expect(semEpisodio).toContain(
      "Nenhum episódio publicado no site até agora.",
    );
    expect(semEpisodio).toContain("A pesquisa também se escuta.");
    expect(semEpisodio).toContain('href="/podobservar"');
    expect(semEpisodio).not.toContain("open.spotify.com");
    expect(semEpisodio).not.toContain("em breve");
  });

  test("a seta externa é decorativa para leitor de tela", () => {
    expect(comEpisodio).toContain('<span aria-hidden="true">↗</span>');
  });
});

/* ------------------------------------------------------------------ */

describe("segurança: o site divulga, não reproduz", () => {
  /**
   * Comentário fora, código dentro.
   *
   * A primeira versão deste teste lia o arquivo inteiro e reprovava os
   * próprios comentários que dizem "sem player, sem embed, sem download" — a
   * documentação da regra acusada de violá-la. O que precisa ser vigiado é o
   * que executa; a prosa que explica a proibição é justamente o que se quer
   * manter.
   */
  function semComentarios(fonte: string): string {
    return fonte
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .split("\n")
      .filter((linha) => !/^\s*(\/\/|\*)/.test(linha))
      .join("\n");
  }

  const superficies = [
    "src/componentes/podobservar/CadernoDeEscuta.tsx",
    "src/app/podobservar/page.tsx",
    "src/app/podobservar/[temporada]/[episodio]/page.tsx",
    "src/componentes/home/PodObservar.tsx",
    "src/componentes/podobservar/LinkDeEscuta.tsx",
    "src/componentes/podobservar/Transcricao.tsx",
  ];

  for (const caminho of superficies) {
    test(`${caminho} não reproduz nem entrega áudio`, () => {
      const fonte = semComentarios(readFileSync(caminho, "utf8"));
      for (const proibido of [
        "<audio",
        "<iframe",
        "dangerouslySetInnerHTML",
        "spotify.com/embed",
        "youtube.com/embed",
        "youtube-nocookie",
        "audioUrl",
        "audioBytes",
        "audioMimeType",
        "chave_storage",
        "chaveStorage",
        "download",
        ".wav",
        ".mp3",
        ".m4a",
      ]) {
        expect(fonte, `${caminho} contém ${proibido}`).not.toContain(proibido);
      }
    });
  }

  test("a marcação renderizada não carrega player, embed nem áudio", () => {
    const marcacao =
      html(createElement(PodObservarNaHome, { recente: episodio() })) +
      html(createElement(Transcricao, { texto: "[00:00]\nLAURA\nOi." }));
    for (const proibido of ["<audio", "<iframe", "<video", "<embed"]) {
      expect(marcacao).not.toContain(proibido);
    }
  });

  /**
   * O tipo público não tem campo de áudio, então nem o pior descuido de
   * interface conseguiria imprimir a URL do master: ela não existe deste lado.
   */
  test("o tipo público continua sem qualquer campo de áudio", () => {
    const chaves = Object.keys(episodio());
    for (const proibido of ["audioUrl", "audioBytes", "audioMimeType"]) {
      expect(chaves).not.toContain(proibido);
    }
  });
});

/* ------------------------------------------------------------------ */

describe("nota metodológica da transcrição", () => {
  test("vive no código, não repetida em cada linha do banco", () => {
    expect(NOTA_DA_TRANSCRICAO).toContain("transcrição revisada");
    expect(NOTA_DA_TRANSCRICAO).toContain("a partir do áudio publicado");
    expect(NOTA_DA_TRANSCRICAO).toContain("identificação dos");
    expect(NOTA_DA_TRANSCRICAO).toContain("elementos sonoros relevantes");
    expect(NOTA_DA_TRANSCRICAO).toContain("sem alterar");
  });
});

/* ------------------------------------------------------------------ */

describe("o bloco antigo do PodObservar saiu da Home", () => {
  test("a constante literal de episódios não existe mais", () => {
    const conteudo = readFileSync("src/componentes/home/conteudo.ts", "utf8");
    expect(conteudo).not.toContain("PODOBSERVAR");
    expect(conteudo).not.toContain("EpisodioPendente");
    expect(conteudo).not.toContain("episodiosPublicados");
  });

  test("a numeração dos capítulos acomoda a seção nova", () => {
    const secoes = readFileSync("src/componentes/home/Secoes.tsx", "utf8");
    const numeros = [...secoes.matchAll(/numero="([IVX]+)"/g)].map((m) => m[1]);
    // II é do PodObservar, que vive em PodObservar.tsx.
    expect(numeros).toEqual(["I", "III", "IV", "V", "VI", "VII", "VIII"]);
    expect(secoes).not.toContain("PODOBSERVAR");
  });

  test("a Home compõe a seção entre Origem e Território", () => {
    const home = readFileSync("src/componentes/home/Home.tsx", "utf8");
    const origem = home.indexOf("<Origem />");
    const pod = home.indexOf("<PodObservarNaHome");
    const territorio = home.indexOf("<Territorio />");
    expect(origem).toBeGreaterThan(-1);
    expect(pod).toBeGreaterThan(origem);
    expect(territorio).toBeGreaterThan(pod);
  });
});
