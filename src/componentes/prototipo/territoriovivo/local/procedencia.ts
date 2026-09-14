import type { FonteTerritorial } from "../../../../dados/territorio/fontes";
import { FONTE_DA_COORDENADA, type IdDoLugar } from "./referencias";

/**
 * Procedência das camadas geográficas locais — Tarefas 18, 19 e 20.
 *
 * Mesma disciplina de `src/dados/territorio/fontes.ts` (origem, data, licença,
 * atribuição, SHA-256), com o que um dado **recortado e transformado** exige a
 * mais: lugar, área extraída, método e tamanho.
 *
 * As entradas não são versionadas: pesam MB e são reobtidas na fonte. Seus
 * hashes ficam aqui para que um novo download possa ser comparado ao usado.
 * Os quatro derivados são versionados, e `testes/territorio-vivo-local.test.ts`
 * confere hash e tamanho de cada um.
 *
 * ## Dado externo × dado próprio
 *
 * Os derivados contêm **só** dado externo (IBGE e OSM), e cada camada declara a
 * própria fonte dentro do arquivo. O ponto de cada lugar, o município e a
 * localidade confirmados vivem em `referencias.ts`. Nos entornos centrados, o
 * centro do enquadramento é a coordenada confirmada — que não vem do OSM.
 *
 * ## Trilha
 *
 * Até a Tarefa 19, os derivados centrados (Borda, Serra, Ilha) e sua
 * procedência ficavam em arquivos locais fora do Git. Com a publicação
 * autorizada em 2026-09-14, passaram para cá (Tarefa 20).
 */

export type ProcedenciaLocal = FonteTerritorial & {
  readonly papel: "entrada" | "derivado";
  /** Lugar a que o derivado pertence; `null` para entrada compartilhada. */
  readonly lugar: IdDoLugar | null;
  /** Recorte geográfico aplicado, em graus decimais (WGS84/SIRGAS 2000). */
  readonly area: string;
  /** O que foi feito com o dado entre a fonte e o arquivo. */
  readonly metodo: string;
  /** Tamanho em bytes (LF, no caso dos derivados). */
  readonly bytes: number;
};

const LICENCA_IBGE =
  "Dado público do IBGE, publicado sob a Política de Dados Abertos do Executivo Federal (Decreto nº 8.777/2016). O pacote não declara licença específica — mesma ressalva registrada em src/dados/territorio/LEIA-ME.md.";

const LICENCA_OSM =
  "Open Database License (ODbL) 1.0. Exige atribuição visível e, para o banco de dados derivado, compartilhamento pela mesma licença.";

const LICENCA_DO_DERIVADO = `${LICENCA_OSM} As localidades são dado do IBGE (${LICENCA_IBGE.split(".")[0]}), identificadas pelo código IBGE e pela chave "fontes" do próprio arquivo.`;

const ATRIBUICAO_DO_DERIVADO =
  "Localidades: IBGE — Localidades do Brasil, Censo 2022. Vias e cursos d'água: © contribuidores do OpenStreetMap — ODbL 1.0.";

const FILTRO_DE_VIAS =
  '(way["highway"~"^(motorway|trunk|primary|secondary|tertiary|unclassified|track|residential)$"];way["waterway"~"^(river|stream)$"];node["place"~"^(town|village|hamlet|locality)$"];);out geom tags;';

const METODO_BASE =
  "Recorte pelo enquadramento, com folga de 0,01°; vias classificadas em rodovia, estrada e urbana, sem nome, só código e revestimento; track descartado; só cursos d'água com nome; localidades lidas das colunas LAT/LONG_LOCALIDADE, sem código repetido; nomes que compartilham radical com o de um lugar de campo excluídos, salvo a localidade IBGE correspondente à localidade confirmada do lugar; Douglas-Peucker com tolerância de 0,00012° (≈ 13 m); coordenadas com 5 casas; validação Zod; formato Biome.";

const entradaOsm = (
  lugar: IdDoLugar,
  descricao: string,
  caixa: string,
  sha256: string,
  bytes: number,
): ProcedenciaLocal => ({
  papel: "entrada",
  lugar,
  arquivo: `${lugar}.osm.json (não versionado)`,
  descricao,
  origem: `https://overpass-api.de/api/interpreter — consulta: [out:json][timeout:170][bbox:${caixa}];${FILTRO_DE_VIAS}`,
  obtidoEm: "2026-09-14",
  licenca: LICENCA_OSM,
  atribuicao: "© contribuidores do OpenStreetMap",
  // Base OSM da resposta: 2026-09-14T21:49:02Z. Arquivo salvo sem alteração.
  sha256DaResposta: sha256,
  sha256DoArquivo: sha256,
  area: `bbox (lat mín., lon mín., lat máx., lon máx.): ${caixa}`,
  metodo: "Resposta bruta, gravada sem transformação.",
  bytes,
});

const derivadoCentrado = (
  lugar: IdDoLugar,
  descricao: string,
  area: string,
  sha256: string,
  bytes: number,
): ProcedenciaLocal => ({
  papel: "derivado",
  lugar,
  arquivo: `entornos/${lugar}.json`,
  descricao,
  origem: `scripts/derivar-entorno-local.ts --entorno=${lugar} --osm=<entrada OSM do lugar> --localidades=<GeoPackage IBGE>`,
  obtidoEm: "2026-09-14",
  licenca: LICENCA_DO_DERIVADO,
  atribuicao: ATRIBUICAO_DO_DERIVADO,
  // O derivado não é resposta de rede: não há hash de resposta.
  sha256DaResposta: null,
  sha256DoArquivo: sha256,
  area: `${area} — centrado na coordenada confirmada (${FONTE_DA_COORDENADA}), com o tamanho do entorno de Jacaré.`,
  metodo: METODO_BASE,
  bytes,
});

export const PROCEDENCIA_DO_ENTORNO: readonly ProcedenciaLocal[] = [
  {
    papel: "entrada",
    lugar: "recanto-da-serra",
    arquivo: "osm-entorno.json (não versionado)",
    descricao:
      "Resposta da Overpass API com vias (motorway a residential, e track), cursos d'água (river, stream) e nós de localidade (place) do entorno de Jacaré e da sede de Tobias Barreto.",
    origem: `https://overpass-api.de/api/interpreter — consulta: [out:json][timeout:170][bbox:-11.24,-38.16,-10.94,-37.92];${FILTRO_DE_VIAS}`,
    obtidoEm: "2026-09-13",
    licenca: LICENCA_OSM,
    atribuicao: "© contribuidores do OpenStreetMap",
    // Base OSM da resposta: 2026-09-13T18:46:41Z. Arquivo salvo sem alteração.
    sha256DaResposta:
      "aa29bef282e944c10dc22b6e6d79b166fd49fe56642dbac104292f774596efc4",
    sha256DoArquivo:
      "aa29bef282e944c10dc22b6e6d79b166fd49fe56642dbac104292f774596efc4",
    area: "lat −11,24 a −10,94; lon −38,16 a −37,92",
    metodo: "Resposta bruta, gravada sem transformação.",
    bytes: 3_707_012,
  },
  {
    papel: "entrada",
    lugar: null,
    arquivo:
      "Localidades_UFs_gpkg.zip → SE/SE_localidades_2022.gpkg (não versionado)",
    descricao:
      "IBGE — Localidades do Brasil, Censo 2022, pacote por UF em GeoPackage. Usada só a tabela de Sergipe, para os quatro entornos.",
    origem:
      "https://geoftp.ibge.gov.br/organizacao_do_territorio/estrutura_territorial/localidades/Localidades_do_Brasil/2022/Localidades_UFs_gpkg.zip",
    obtidoEm: "2026-09-13",
    licenca: LICENCA_IBGE,
    atribuicao: "Fonte: IBGE — Localidades do Brasil, Censo 2022.",
    // Hash do ZIP como chegou (Last-Modified do servidor: 2025-11-19).
    sha256DaResposta:
      "f537128dbf9bd0170c9133426d91287947d8edbbbed3f4b9d8db91ae97fd5c00",
    // Hash do GeoPackage de Sergipe extraído do ZIP.
    sha256DoArquivo:
      "1b2ea0f829652cb8c07b2d493ed9c112eb4d779b3f2b4b2fc882a31d8185bf7a",
    area: "Sergipe inteiro (2.296 localidades); nada recortado nesta etapa.",
    metodo: "ZIP extraído; GeoPackage lido sem alteração.",
    bytes: 610_304,
  },
  {
    papel: "derivado",
    lugar: "recanto-da-serra",
    arquivo: "entorno-jacare.json",
    descricao:
      "Camada local do entorno do Povoado Jacaré: 22 localidades (IBGE), 83 trechos de cursos d'água com nome e 1.953 trechos de via (OSM).",
    origem:
      "scripts/derivar-entorno-local.ts --entorno=jacare --osm=<entrada OSM de Jacaré> --localidades=<GeoPackage IBGE>",
    obtidoEm: "2026-09-13",
    licenca: LICENCA_DO_DERIVADO,
    atribuicao: ATRIBUICAO_DO_DERIVADO,
    sha256DaResposta: null,
    // SHA-256 do conteúdo com fim de linha LF (ver o teste). Sem alteração
    // desde a Tarefa 18.
    sha256DoArquivo:
      "da190f24591d9abfa468c9835d07084c4dce2fcbb790f94bad2b28de768fd289",
    area: "lat −11,215 a −10,985; lon −38,1185 a −37,9475 (ENQUADRAMENTO_DO_ENTORNO_JACARE, fixo, definido pela localidade e pela sede).",
    metodo: METODO_BASE,
    bytes: 492_749,
  },
  entradaOsm(
    "borda-da-mata",
    "Resposta da Overpass API com vias, cursos d'água e nós de localidade do entorno do Museu Borda da Mata.",
    "-11.2728,-38.0019,-10.9828,-37.7709",
    "00af586282aa4dd137e16b3efe8e3b56a381201c8358fa3330b8511a27ca86b1",
    3_139_821,
  ),
  derivadoCentrado(
    "borda-da-mata",
    "Camada local do entorno do Museu Borda da Mata: 25 localidades (IBGE, incluindo o povoado Borda da Mata como localidade do lugar), 55 trechos de cursos d'água com nome e 875 trechos de via (OSM).",
    "lat −11,242754 a −11,012754; lon −37,97193 a −37,80093",
    "87d6321c299e09bfc02a9231d20343c3053aea46c5a82dc1115eefbef3de7f7e",
    301_155,
  ),
  entradaOsm(
    "serra-dos-macacos",
    "Resposta da Overpass API com vias, cursos d'água e nós de localidade do entorno da Serra dos Macacos.",
    "-11.0261,-38.1022,-10.7361,-37.8712",
    "dd1ab3338606bb569a16c445cb34012c52595e6195b4fcbf8f6ff98cb5be1fa7",
    2_435_563,
  ),
  derivadoCentrado(
    "serra-dos-macacos",
    "Camada local do entorno da Serra dos Macacos: 23 localidades (IBGE), 25 trechos de cursos d'água com nome e 506 trechos de via (OSM).",
    "lat −10,9961 a −10,7661; lon −38,0722 a −37,9012",
    "3157bad3cd44f5019aa22bfa6c2561f054e4d287da409546b29b5894137cb1ae",
    175_903,
  ),
  entradaOsm(
    "ilha-grande",
    "Resposta da Overpass API com vias, cursos d'água e nós de localidade do entorno de Ilha Grande.",
    "-11.2089,-37.3241,-10.9189,-37.0931",
    "faae69e57f3011e0b9b6d1dbf7e2acef7f350a43f105cfb8a1e2fbc5dcfb6fe4",
    4_072_798,
  ),
  derivadoCentrado(
    "ilha-grande",
    "Camada local do entorno de Ilha Grande: 51 localidades (IBGE), 20 trechos de cursos d'água com nome e 2.233 trechos de via (OSM).",
    "lat −11,1789 a −10,9489; lon −37,2941 a −37,1231",
    "586772c4e08fe05b59163a9ef6637aae0a3680b9d6b86bf9ab2323a2dac442a1",
    471_391,
  ),
];
