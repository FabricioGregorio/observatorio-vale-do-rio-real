import type { FonteTerritorial } from "../../../../dados/territorio/fontes";

/**
 * Procedência da camada geográfica local — Tarefa 18.
 *
 * Mesma disciplina de `src/dados/territorio/fontes.ts` (origem, data, licença,
 * atribuição, SHA-256), com dois campos a mais que um dado **recortado e
 * transformado** exige: a área extraída e o método.
 *
 * As entradas não são versionadas: pesam MB e são reobtidas na fonte. Seus
 * hashes ficam aqui para que um novo download possa ser comparado ao usado.
 * O derivado é versionado, e `testes/territorio-vivo-local.test.ts` confere o
 * seu hash.
 *
 * ## Dado externo × dado próprio
 *
 * O derivado contém **só** dado externo (IBGE e OSM), e cada camada declara a
 * própria fonte dentro do arquivo. Dado do Observatório — o nome do lugar, a
 * localidade citada no A02, a nota de que a localização não está publicada —
 * vive em `lugares.ts` e no componente, nunca misturado ao derivado.
 */

export type ProcedenciaLocal = FonteTerritorial & {
  readonly papel: "entrada" | "derivado";
  /** Recorte geográfico aplicado, em graus decimais (WGS84/SIRGAS 2000). */
  readonly area: string;
  /** O que foi feito com o dado entre a fonte e o arquivo. */
  readonly metodo: string;
};

const LICENCA_IBGE =
  "Dado público do IBGE, publicado sob a Política de Dados Abertos do Executivo Federal (Decreto nº 8.777/2016). O pacote não declara licença específica — mesma ressalva registrada em src/dados/territorio/LEIA-ME.md.";

const LICENCA_OSM =
  "Open Database License (ODbL) 1.0. Exige atribuição visível e, para o banco de dados derivado, compartilhamento pela mesma licença.";

export const PROCEDENCIA_DO_ENTORNO: readonly ProcedenciaLocal[] = [
  {
    papel: "entrada",
    arquivo: "osm-entorno.json (não versionado)",
    descricao:
      "Resposta da Overpass API com vias (motorway a residential, e track), cursos d'água (river, stream) e nós de localidade (place) do entorno de Jacaré e da sede de Tobias Barreto.",
    origem:
      'https://overpass-api.de/api/interpreter — consulta: [out:json][timeout:170][bbox:-11.24,-38.16,-10.94,-37.92];(way["highway"~"^(motorway|trunk|primary|secondary|tertiary|unclassified|track|residential)$"];way["waterway"~"^(river|stream)$"];node["place"~"^(town|village|hamlet|locality)$"];);out geom tags;',
    obtidoEm: "2026-09-13",
    licenca: LICENCA_OSM,
    atribuicao: "© contribuidores do OpenStreetMap",
    // Base OSM da resposta: 2026-09-13T18:46:41Z. Arquivo salvo sem alteração.
    sha256DaResposta:
      "aa29bef282e944c10dc22b6e6d79b166fd49fe56642dbac104292f774596efc4",
    sha256DoArquivo:
      "aa29bef282e944c10dc22b6e6d79b166fd49fe56642dbac104292f774596efc4",
    area: "lat −11,24 a −10,94; lon −38,16 a −37,92",
    metodo: "Resposta bruta, 3.707.012 bytes, gravada sem transformação.",
  },
  {
    papel: "entrada",
    arquivo:
      "Localidades_UFs_gpkg.zip → SE/SE_localidades_2022.gpkg (não versionado)",
    descricao:
      "IBGE — Localidades do Brasil, Censo 2022, pacote por UF em GeoPackage. Usada só a tabela de Sergipe.",
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
  },
  {
    papel: "derivado",
    arquivo: "entorno-jacare.json",
    descricao:
      "Camada local do entorno do Povoado Jacaré: 22 localidades (IBGE), 83 trechos de cursos d'água com nome e 1.953 trechos de via (OSM).",
    origem:
      "scripts/derivar-entorno-local.ts --osm=<entrada OSM acima> --localidades=<GeoPackage acima>",
    obtidoEm: "2026-09-13",
    licenca: `${LICENCA_OSM} As localidades são dado do IBGE (${LICENCA_IBGE.split(".")[0]}), identificadas pelo código IBGE e pela chave "fontes" do próprio arquivo.`,
    atribuicao:
      "Localidades: IBGE — Localidades do Brasil, Censo 2022. Vias e cursos d'água: © contribuidores do OpenStreetMap (ODbL).",
    // O derivado não é resposta de rede: não há hash de resposta.
    sha256DaResposta: null,
    // SHA-256 do conteúdo com fim de linha LF (ver o teste). O script grava
    // o arquivo já formatado pelo Biome: 492.749 bytes.
    sha256DoArquivo:
      "da190f24591d9abfa468c9835d07084c4dce2fcbb790f94bad2b28de768fd289",
    area: "lat −11,215 a −10,985; lon −38,1185 a −37,9475 (ENQUADRAMENTO_DO_ENTORNO_JACARE), com folga de 0,01° no recorte das linhas.",
    metodo:
      "Recorte pelo enquadramento; vias classificadas em rodovia, estrada e urbana, sem nome, só código e revestimento; track descartado; só cursos d'água com nome; localidades lidas das colunas LAT/LONG_LOCALIDADE, sem código repetido; nomes que compartilham radical com o de um lugar de campo excluídos (salvo Jacaré, público no A02); Douglas-Peucker com tolerância de 0,00012° (≈ 13 m); coordenadas com 5 casas; validação Zod.",
  },
];
