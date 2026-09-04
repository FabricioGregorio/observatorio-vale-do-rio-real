/**
 * Contratos de dados do território — Tarefa 10B.1.
 *
 * Este arquivo define **apenas forma**. Não há um único dado real ou
 * provisório aqui: nem geometria, nem coordenada, nem nome de local. Os
 * arquivos `sergipe.geojson`, `vale-rio-real.geojson` e `pontos-visita.json`
 * previstos em 10B.0 v1.2 §3 só nascem quando houver fonte aprovada, na
 * etapa 10B.2.
 *
 * Todo campo que depende de conteúdo humano ou de fonte oficial é
 * `| null` de propósito. Ausência é `null` com estado vazio explícito, nunca
 * um valor plausível (AGENTS.md).
 *
 * **Validação pendente.** O contrato exige validar entrada externa com Zod, e
 * um `.geojson` lido do disco é entrada externa. `zod` não está instalado e
 * esta etapa não autoriza dependência nova: a validação entra em 10B.2, junto
 * com os arquivos, e depende de autorizar o pacote.
 */

/**
 * Par `[longitude, latitude]`, na ordem que o RFC 7946 exige — longitude
 * primeiro. Invertê-la é o erro clássico de quem escreve GeoJSON à mão.
 */
export type Posicao = readonly [longitude: number, latitude: number];

/**
 * Geometria de município no formato GeoJSON (RFC 7946).
 *
 * As chaves ficam em inglês porque são de um formato padronizado, não do
 * domínio: `type` e `coordinates` são o que vem escrito dentro de qualquer
 * `.geojson`. Traduzi-las obrigaria a converter todo arquivo antes de ler, o
 * que é exatamente o tipo de camada que o doc 03 §5 manda evitar.
 */
export type GeometriaGeoJson =
  | {
      readonly type: "Polygon";
      readonly coordinates: readonly (readonly Posicao[])[];
    }
  | {
      readonly type: "MultiPolygon";
      readonly coordinates: readonly (readonly (readonly Posicao[])[])[];
    };

/**
 * Relação de um município com o trabalho do Observatório.
 *
 * São camadas conceituais **independentes**, e é por isso que substituíram o
 * antigo booleano `pesquisado`: um município pode pertencer ao recorte
 * territorial sem ter sido visitado, e pode ter sido estudado sem pertencer ao
 * recorte. Um único booleano forçava essas duas coisas a serem a mesma, e a
 * primeira consequência prática seria pintar São Cristóvão como se fosse Vale
 * do Rio Real.
 *
 * - `vale-rio-real` — pertence ao recorte territorial usado pelo projeto;
 * - `pesquisa-campo` — foi objeto de pesquisa de campo;
 * - `comparacao` — entra como referência de comparação de políticas públicas.
 *
 * Acrescentar uma camada nova é acrescentar um membro aqui; nenhum campo do
 * município muda.
 */
export type RelacaoTerritorial =
  | "vale-rio-real"
  | "pesquisa-campo"
  | "comparacao";

/**
 * Onde está o tipo de município.
 *
 * Até a Tarefa 10B.2.2 este arquivo declarava `Municipio` e
 * `InformacoesMunicipio`, e também `FeatureGeoJson` e `ColecaoDeFeatures`. Os
 * quatro foram **removidos na 10B.3.3**, quando o Cenário C entrou:
 *
 * - o município do mapa é `MunicipioDoMapa`, em `mapa.ts`, montado a partir da
 *   malha, dos nomes oficiais e do recorte editorial. Quando houver texto
 *   editorial aprovado para um município, o campo entra lá;
 * - a forma do GeoJSON é definida pelos esquemas Zod de `validacao.ts`, que
 *   validam de verdade em tempo de build.
 *
 * Foram removidos, e não mantidos "para depois", porque duas definições da
 * mesma entidade divergem — é a lição que o doc 03 §4 registra sobre listas
 * duplicadas, e neste projeto ela já custou uma rodada.
 */

/**
 * Fotografia de campo.
 *
 * `alt` é obrigatório na tipagem, sem opcional: o tipo impede o esquecimento
 * antes de o teste pegar (doc 03 §5). `creditos` idem — foto de campo tem
 * autoria, e publicar sem crédito é problema de direitos, não de layout.
 */
export type ImagemDeCampo = {
  /** Caminho sob `public/media/campo/`, servido a partir de `/media/campo/`. */
  readonly caminho: string;
  readonly alt: string;
  readonly creditos: string;
};

/**
 * Ponto de visita de campo.
 *
 * O vocabulário de `tipo` **não está decidido** e por isso é `string | null`,
 * não uma união fechada: o doc 01 §5 tipifica equipamento como ecoparque,
 * museu, comunidade ou rota, enquanto 10B.0 v1.2 §8 exemplifica "natureza".
 * Fechar a união agora seria escolher, sozinho, uma classificação de lugares
 * reais — decisão de pesquisa, não de código. Fica para quem tem a fonte.
 */
export type PontoDeVisita = {
  readonly id: string;
  readonly nome: string;
  readonly tipo: string | null;
  /**
   * Código do IBGE do município, o mesmo `codigoIbge` de `MunicipioDoMapa`.
   *
   * `null` quando o município do ponto ainda não foi declarado em documento.
   * É o caso de Serra dos Macacos e de Ilha Grande: nenhum documento lido os
   * associa a um município, e deduzir por nome ou por proximidade seria
   * inventar localização (10B.2.2).
   */
  readonly municipioId: string | null;
  /** `null` até haver coordenada conferida. Sem coordenada, não vira marcador. */
  readonly coordenadas: Posicao | null;
  /** `null` até haver fotografia real, com direitos e texto alternativo. */
  readonly imagem: ImagemDeCampo | null;
  /** `null` até haver descrição escrita por pessoa. */
  readonly descricao: string | null;
};
