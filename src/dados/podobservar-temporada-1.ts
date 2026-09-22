/**
 * Plano aprovado da 1ª temporada do PodObservar — P0.2B2.
 *
 * Metadados humanos: decisão da fase P0.2B2 (títulos oficiais, slugs, URLs,
 * normalização de `publicado_em`). Metadados técnicos: auditoria da P0.2B1,
 * medidos na fonte canônica e reconferidos antes de cada ingestão.
 *
 * O plano é declarado, nunca inferido do nome do arquivo. O executor recusa
 * qualquer master cujo SHA-256 no disco divirja do que está aqui.
 *
 * Nada neste arquivo autoriza publicação. Os episódios nascem em `rascunho`, e
 * o gate de `vw_episodio_publico` continua sendo a única porta pública.
 */

/**
 * Formatos de master aceitos, com a extensão que a chave de storage e o arquivo
 * de origem precisam ter. EP01–03 chegaram em WAV; o EP04, em MP3 — que é
 * guardado como veio, sem conversão: o master é o arquivo entregue pela
 * equipe, e converter criaria um segundo "original" sem motivo.
 */
export const FORMATOS_DE_MASTER = {
  "audio/wav": ".wav",
  "audio/mpeg": ".mp3",
} as const;

/** Bucket privado, `arquivo.visibilidade = 'privado'`, sem `url_publica`. */
export type MasterPodObservar = {
  /** Caminho relativo dentro de `OBSERVATORIO_FONTES_DIR`. */
  origem: string;
  chave: string;
  sha256: string;
  bytes: number;
  mimeType: keyof typeof FORMATOS_DE_MASTER;
  duracaoSeg: number;
  nomeOriginal: string;
};

export type EpisodioPlanejado = {
  numero: number;
  slug: string;
  titulo: string;
  /**
   * PROPOSTA da P0.2B1, derivada do bloco `Tema:` que a própria equipe
   * escreveu no PDF da transcrição. **Pendente de aprovação humana.**
   *
   * `episodio.resumo` é `NOT NULL`, então um episódio não existe
   * nem em rascunho sem resumo. Gravar o candidato em rascunho não o torna
   * verdade final: rascunho é exatamente o estado em que um texto espera
   * revisão, e nada em rascunho é público.
   */
  resumoCandidato: string;
  /** Caminho relativo do PDF de transcrição em `OBSERVATORIO_FONTES_DIR`. */
  transcricaoPdf: string;
  urlSpotify: string;
  urlYoutube: string | null;
  /**
   * Meio-dia local de Sergipe (America/Maceio, UTC−3), conforme decisão
   * humana da P0.2B2.
   *
   * É **normalização técnica para preservar a data editorial**, não afirmação
   * de que o episódio saiu às 12:00. Guardar `00:00:00Z` faria a data
   * renderizar como o dia anterior em qualquer fuso negativo; meio-dia local
   * rende a data correta de UTC−11 a UTC+11. Episódios futuros usam o
   * instante real quando conhecido.
   */
  publicadoEm: string;
  master: MasterPodObservar;
};

export const TEMPORADA_1 = {
  numero: 1,
  /** Fonte documental: cabeçalho dos PDFs, "PodObservar — 1ª Temporada". */
  titulo: "1ª Temporada",
  ano: 2026,
  descricao: null,
  capaId: null,
} as const;

export const EPISODIOS_TEMPORADA_1: readonly EpisodioPlanejado[] = [
  {
    numero: 1,
    slug: "01-o-que-e-o-vale-do-rio-real",
    titulo: "#01 Episódio - O que é o Vale do Rio Real?",
    resumoCandidato:
      "O primeiro episódio apresenta o Observatório de Cultura e Economia " +
      "Criativa da Região do Vale do Rio Real e o Coletivo Cultural Tobias, " +
      "Sou Eu, que o criou. A apresentadora Laura Aguiar conta como o edital " +
      "da Política Nacional Aldir Blanc deu origem à pesquisa e apresenta o " +
      "enredo da primeira temporada, com os equipamentos turísticos e " +
      "culturais que serão visitados.",
    transcricaoPdf: "podcast/ep-01/Transcrição do episódio 1.pdf",
    urlSpotify: "https://open.spotify.com/episode/4I2y3ku1E62PjxtDNWo8Uf",
    urlYoutube: "https://www.youtube.com/watch?v=CcNdxMkuFcI",
    publicadoEm: "2026-08-31T15:00:00Z",
    master: {
      origem: "podcast/ep-01/ep-01.wav",
      chave:
        "arquivos/podobservar/t1-ep-01-o-que-e-o-vale-do-rio-real-master-v1.wav",
      sha256:
        "cb9c8a2e0d75dc07e9616b37f9e31bce9cc8e8c351e5556a30e4f3c775cd54f1",
      bytes: 379159020,
      mimeType: "audio/wav",
      duracaoSeg: 1433,
      nomeOriginal: "ep-01.wav",
    },
  },
  {
    numero: 2,
    slug: "02-conheca-o-recanto-da-serra",
    titulo: "#02 Episódio - Conheça o Recanto da Serra",
    resumoCandidato:
      "Episódio dedicado ao Ecoparque e Museu Recanto da Serra, no povoado " +
      "Jacaré, em Tobias Barreto. Pedro Menezes, cordelista e responsável " +
      "pelo espaço, conta a história da propriedade desde a casa de taipa " +
      "dos anos 1930 até a abertura ao público em 2008. O episódio também " +
      "apresenta o método de pesquisa do Observatório e a figura do " +
      "ator-chave.",
    transcricaoPdf: "podcast/ep-02/Transcrição episódio 2.pdf",
    urlSpotify: "https://open.spotify.com/episode/4aoFqfd4DrmSHIBVjK1vS7",
    urlYoutube: null,
    publicadoEm: "2026-09-07T15:00:00Z",
    master: {
      origem: "podcast/ep-02/ep-02.wav",
      chave:
        "arquivos/podobservar/t1-ep-02-conheca-o-recanto-da-serra-master-v1.wav",
      sha256:
        "55eae70b65d5cc121b21a4c29e77465276c7881e923d89a110f76bb0be77935d",
      bytes: 512696970,
      mimeType: "audio/wav",
      duracaoSeg: 1938,
      nomeOriginal: "ep-02.wav",
    },
  },
  {
    numero: 3,
    slug: "03-conheca-o-museu-borda-da-mata",
    titulo: "#03 Episódio - Conheça o Museu Borda da Mata",
    resumoCandidato:
      "Episódio sobre o Centro Cultural e Museu Borda da Mata, no povoado " +
      "Borda da Mata, em Tobias Barreto, construído por Neide e Oviêdo " +
      "Abreu. A conversa percorre a trajetória do casal, o acervo da Garagem " +
      "Cultural e a relação entre preservação da memória nordestina, turismo " +
      "cultural e economia solidária.",
    transcricaoPdf: "podcast/ep-03/Transcrição episódio 3.pdf",
    urlSpotify: "https://open.spotify.com/episode/0TC3BYaFKQvwQBMhzT0kQR",
    urlYoutube: null,
    publicadoEm: "2026-09-14T15:00:00Z",
    master: {
      origem: "podcast/ep-03/ep-03.wav",
      chave:
        "arquivos/podobservar/t1-ep-03-conheca-o-museu-borda-da-mata-master-v1.wav",
      sha256:
        "3bb8e8de3ded0803b33d9b262a079984b86fe0ba19b07236268c01a00ce5f2d8",
      bytes: 504638484,
      mimeType: "audio/wav",
      duracaoSeg: 1907,
      nomeOriginal: "ep-03.wav",
    },
  },
  {
    numero: 4,
    slug: "04-entre-dados-e-fatos",
    titulo: "#04 Episódio - Entre dados e fatos",
    /**
     * Derivado do bloco `Tema:` do PDF do EP04, como os três anteriores, e
     * aprovado para publicação pela decisão humana de 2026-09-21.
     */
    resumoCandidato:
      "Episódio de apresentação e análise dos dados coletados durante cinco " +
      "meses de pesquisa no Ecoparque e Museu Recanto da Serra e no Centro " +
      "Cultural e Museu Borda da Mata. A conversa aborda visitação, " +
      "funcionamento, economia solidária, sustentabilidade e preservação da " +
      "memória, e as possibilidades de desenvolvimento turístico e cultural " +
      "da Serra dos Macacos.",
    transcricaoPdf: "podcast/ep-04/Transcrição episódio 4.pdf",
    /** Conferido na página oficial do programa no Spotify em 2026-09-21. */
    urlSpotify: "https://open.spotify.com/episode/7Johkhb6BqDx1gVolyz8iE",
    urlYoutube: null,
    /** Data humana 21/09/2026, na mesma convenção de meio-dia local. */
    publicadoEm: "2026-09-21T15:00:00Z",
    master: {
      origem: "podcast/ep-04/ep04-v2.mp3",
      chave: "arquivos/podobservar/t1-ep-04-entre-dados-e-fatos-master-v1.mp3",
      sha256:
        "833bba2178cfb578a9e2ccb56ccd0c4256e6a947ce64c1fc861a66a030d1789d",
      bytes: 50495795,
      mimeType: "audio/mpeg",
      /**
       * 60.282 quadros MPEG-1 Layer III a 44,1 kHz = 1574,71 s, contados
       * quadro a quadro (o quadro Xing/Info fica de fora). Arredondado ao
       * segundo mais próximo, como os WAV anteriores (EP01: 1432,94 → 1433).
       */
      duracaoSeg: 1575,
      nomeOriginal: "ep04-v2.mp3",
    },
  },
];

/**
 * A chamada/trailer **não** é episódio (decisão humana da P0.2B1, item 6).
 *
 * Declarado aqui para que a ausência seja afirmação, e não esquecimento: quem
 * ler o plano vê que `chamada/` foi considerada e deixada de fora, em vez de
 * supor que passou despercebida.
 */
export const FORA_DO_CATALOGO = ["podcast/chamada/"] as const;
