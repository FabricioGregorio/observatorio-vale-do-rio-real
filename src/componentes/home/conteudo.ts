/**
 * Conteúdo da Home.
 *
 * ## Estado editorial
 *
 * Toda frase aqui foi aprovada para uso público. As bases factuais de cada
 * seção estão registradas nos documentos da fase, não no código: o bloco
 * recolhível de fontes citava caminho de repositório e documento restrito e
 * saiu junto com o laboratório.
 *
 * Nenhum número é escrito à mão para ser exibido como indicador: os valores de
 * dados vêm de `src/dados/indicadores/derivados.ts`, e as contagens de
 * território são derivadas de `recorte.ts` no componente.
 *
 * ## O que é marcação de substituição
 *
 * Onde o material real não está no repositório, o campo é `null` e a página
 * mostra a lacuna como lacuna. Nenhum título, capa, duração ou link é
 * sugerido.
 */

/** Nome oficial. Mesmo texto do Hero público (Direção Visual §8.4). */
export const NOME_OFICIAL =
  "Observatório de Cultura e Economia Criativa da Região do Vale do Rio Real";

export const COLETIVO = "Coletivo Cultural “Tobias, sou Eu!”";

/** Doc 01, cabeçalho: “Fomento”. */
export const EDITAL = "Edital de Chamamento Público PNAB nº 02/2025";
export const EDITAL_CURTO = "Edital PNAB nº 02/2025";
export const LINHA_DO_EDITAL = "Observatórios de Cultura e Economia Criativa";

/** Doc 01, cabeçalho: “Avaliação / prestação de contas”. */
export const ACOMPANHAMENTO = "FUNCAP — Sergipe";

/**
 * Estado e rótulo dos materiais vivem em `dados/materiais-de-campo.ts`, que é
 * a fonte única compartilhada com as fichas do Território. Aqui só se
 * reexporta: manter uma segunda tabela de rótulos na Home foi exatamente o
 * que fez a ficha do Borda da Mata afirmar "restrito" depois de o relatório
 * ter sido publicado.
 */
export {
  type EstadoDoMaterial,
  ROTULO_DO_ESTADO,
} from "../../dados/materiais-de-campo";

/**
 * Relatório Técnico — Recanto da Serra (A02).
 *
 * Lido de `https://observatoriotobiassoueu.com.br/anexos.json` em 2026-09-13.
 * O endereço está fixo aqui; numa integração completa ele viria de
 * `listarAnexosPublicos()`, em build, como na Sala do Avaliador.
 */
export const RELATORIO_DO_RECANTO = {
  codigo: "A02",
  titulo: "Relatório Técnico — Recanto da Serra",
  url: "https://acervo.observatoriotobiassoueu.com.br/arquivos/analise-de-dados/a02-relatorio-tecnico-recanto-da-serra-publico-v1.pdf",
  bytes: 756_239,
  licenca: "CC BY-SA 4.0",
  sha256: "b314cd7a5330276ecccc0c7cfe7dfe6461da721055318c15957db5cd7848961a",
} as const;

export type Equipamento = {
  readonly id: "recanto-da-serra" | "borda-da-mata";
  readonly nome: string;
  readonly lugar: string;
};

/**
 * Os dois equipamentos de Tobias Barreto — identidade apenas.
 *
 * Nomes completos: recorte dos indicadores (`indicadores/derivados.ts`).
 * “Povoado Jacaré”: resumo executivo do A02 público. O que a pesquisa reuniu
 * sobre cada um **não** está aqui: é resolvido contra `vw_anexo_publico` por
 * `resolverMateriaisDoLugar`, e o `id` é a chave dessa resolução.
 */
export const EQUIPAMENTOS: readonly Equipamento[] = [
  {
    id: "recanto-da-serra",
    nome: "Ecoparque e Museu Recanto da Serra",
    lugar: "Povoado Jacaré · Tobias Barreto (SE)",
  },
  {
    id: "borda-da-mata",
    nome: "Centro Cultural e Museu Borda da Mata",
    lugar: "Tobias Barreto (SE)",
  },
];

/**
 * Fotografias de campo do Borda da Mata no corpus: H3-F001 a H3-F007 da
 * auditoria H3. Desde 2026-09-16 as sete têm derivado web público, dentro de
 * B01; a contagem permanece porque a ficha a cita.
 */
export const FOTOGRAFIAS_DO_BORDA_NO_ACERVO = 7;

export type Entrevista = {
  readonly numero: string;
  readonly onde: string;
  /** `null` quando o município não está consolidado em documento. */
  readonly municipio: string | null;
};

/**
 * As oito entrevistas, identificadas por instituição ou lugar — nunca por
 * pessoa. Numeração e rótulos: `MAPA_FONTES_CANONICAS_2026-09-05.md` §4.
 * Município de Ilha Grande segue não consolidado (`pontos.ts`).
 */
export const ENTREVISTAS: readonly Entrevista[] = [
  { numero: "01", onde: "Secretaria de Cultura", municipio: "Tobias Barreto" },
  {
    numero: "02",
    onde: "Centro Cultural e Museu Borda da Mata",
    municipio: "Tobias Barreto",
  },
  { numero: "03", onde: "Fundação de Cultura", municipio: "São Cristóvão" },
  { numero: "04", onde: "Diretoria de Turismo", municipio: "São Cristóvão" },
  { numero: "05", onde: "Recanto da Serra", municipio: "Tobias Barreto" },
  { numero: "06", onde: "Prefeitura", municipio: "Tobias Barreto" },
  {
    numero: "07",
    onde: "Secretaria Municipal de Cultura",
    municipio: "Tomar do Geru",
  },
  { numero: "08", onde: "Ilha Grande", municipio: null },
];
