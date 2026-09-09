/**
 * Procedência dos dados territoriais — Tarefas 10B.2 e 10B.2.1.
 *
 * Registra **de onde** cada arquivo territorial deve vir, antes de qualquer
 * arquivo existir. É a mesma disciplina que a Sala do Avaliador aplica aos
 * anexos: origem declarada, data de obtenção e SHA-256 para conferência
 * (doc 01 §4). Dado de mapa sem procedência registrada é tão indefensável
 * numa auditoria quanto anexo sem espelho.
 *
 * Nenhum arquivo foi baixado. `obtidoEm`, `licenca` e os dois hashes são `null`
 * porque não existe artefato — não porque a informação foi esquecida.
 */

/** Um arquivo territorial esperado em `src/dados/territorio/`. */
export type FonteTerritorial = {
  /** Nome do arquivo, quando ele existir nesta pasta. */
  readonly arquivo: string;
  readonly descricao: string;
  /** Endereço exato de onde o arquivo deve ser obtido. */
  readonly origem: string | null;
  /** Data ISO da obtenção. `null` enquanto o arquivo não existir. */
  readonly obtidoEm: string | null;
  /** Licença ou condição de uso declarada pela fonte. */
  readonly licenca: string | null;
  /** Texto de atribuição a exibir onde o dado for publicado. */
  readonly atribuicao: string | null;
  /**
   * SHA-256 da **resposta da fonte**, exatamente como ela chegou pela rede.
   *
   * Prova a procedência: é este valor que liga o arquivo ao que o IBGE
   * devolveu naquela data.
   */
  readonly sha256DaResposta: string | null;
  /**
   * SHA-256 do **arquivo como está versionado** neste repositório.
   *
   * Os dois hashes divergem quando o arquivo é reformatado ao ser salvo — foi
   * o que aconteceu com a lista de nomes, gravada com indentação de dois
   * espaços enquanto a API responde compacta. Registrar só um dos dois torna o
   * registro inconferível: quem baixa o repositório não consegue validar o
   * arquivo que tem em mãos.
   *
   * `testes/territorio.test.ts` confere este valor contra o arquivo real.
   */
  readonly sha256DoArquivo: string | null;
};

/**
 * Fonte oficial: **IBGE — API de malhas territoriais, versão 4**, e API de
 * localidades, versão 1.
 *
 * Verificadas em 2026-09-03 por requisição de leitura, sem gravar nada no
 * repositório. O que foi medido:
 *
 * | malha por município | bytes | com gzip |
 * |---|---|---|
 * | `qualidade=minima` | 34.077 | — |
 * | `qualidade=intermediaria` | 92.720 | 20.039 |
 * | `qualidade=maxima` | 432.106 | — |
 *
 * **Qualidade intermediária é a escolhida** (decisão do responsável, 10B.2.1):
 * equilíbrio entre precisão do contorno e peso. Os 20 kB que efetivamente
 * trafegam cabem com folga no orçamento de 500 kB da Home (doc 01 §7), o que
 * importa para o público rural e escolar em rede fraca.
 *
 * A malha **não traz o nome** do município: cada feature vem só com
 * `properties.codarea`. Por isso existe um segundo arquivo, de nomes, sem o
 * qual a camada base não consegue rotular os 75 municípios.
 */
export const FONTES_TERRITORIAIS: readonly FonteTerritorial[] = [
  {
    arquivo: "municipios-sergipe.geojson",
    descricao:
      "Camada base: os 75 municípios de Sergipe com fronteira oficial, cada um um feature com o código em properties.codarea.",
    origem:
      "https://servicodados.ibge.gov.br/api/v4/malhas/estados/28?formato=application/vnd.geo+json&qualidade=intermediaria&intrarregiao=municipio",
    obtidoEm: "2026-09-03",
    licenca:
      "Dado público do IBGE, publicado sob a Política de Dados Abertos do Executivo Federal (Decreto nº 8.777/2016). A API não declara licença específica — ver a ressalva em LEIA-ME.md desta pasta.",
    atribuicao: "Fonte: IBGE — Malhas Territoriais, malha municipal.",
    sha256DaResposta:
      "a5fd01bff5670857f444a1f15a7a54daf3c4512a05a274de22fee12bfee2561b",
    // O arquivo foi salvo sem reformatação: os dois hashes coincidem.
    sha256DoArquivo:
      "a5fd01bff5670857f444a1f15a7a54daf3c4512a05a274de22fee12bfee2561b",
  },
  {
    arquivo: "municipios-sergipe-nomes.json",
    descricao:
      "Código e nome dos 75 municípios. Necessário porque a malha só traz o código; sem isto a camada base não tem como rotular município nenhum.",
    origem:
      "https://servicodados.ibge.gov.br/api/v1/localidades/estados/SE/municipios",
    obtidoEm: "2026-09-03",
    licenca:
      "Dado público do IBGE, publicado sob a Política de Dados Abertos do Executivo Federal (Decreto nº 8.777/2016). A API não declara licença específica — ver a ressalva em LEIA-ME.md desta pasta.",
    atribuicao: "Fonte: IBGE — API de localidades.",
    // A API responde JSON compacto; o arquivo foi salvo com indentação de dois
    // espaços. Os dois hashes divergem por isso, e não por diferença de
    // conteúdo: reserializar o arquivo em forma compacta reproduz exatamente o
    // hash da resposta. Até a Fase H1 só o primeiro estava registrado, e o
    // registro era inconferível contra o arquivo do repositório.
    sha256DaResposta:
      "2678c3b209f60db7337e410458f8ce43ea76abae4f0f45a960de33117f5801c5",
    sha256DoArquivo:
      "b304f78ef0a2c06117b38af86c1897f448763eef4b14f953eefa0dddeb984701",
  },
  {
    arquivo: "sergipe.geojson",
    descricao:
      "Contorno externo do estado, malha única. Opcional: serve para desenhar a borda de Sergipe por cima da camada de municípios.",
    origem:
      "https://servicodados.ibge.gov.br/api/v4/malhas/estados/28?formato=application/vnd.geo+json&qualidade=intermediaria",
    obtidoEm: null,
    licenca: null,
    atribuicao: null,
    sha256DaResposta: null,
    sha256DoArquivo: null,
  },
  {
    arquivo: "pontos-visita.json",
    descricao:
      "Pontos de visita de campo. Não vem do IBGE: depende de coordenada conferida em campo ou de fonte documental do próprio projeto.",
    origem: null,
    obtidoEm: null,
    licenca: null,
    atribuicao: null,
    sha256DaResposta: null,
    sha256DoArquivo: null,
  },
];
