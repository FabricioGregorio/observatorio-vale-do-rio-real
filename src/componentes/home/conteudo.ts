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
import type { ArquivosPublicados } from "../../dados/materiais-de-campo";

export {
  type EstadoDoMaterial,
  ROTULO_DO_ESTADO,
} from "../../dados/materiais-de-campo";

/**
 * Relatório Técnico — Recanto da Serra (A02).
 *
 * Lido de `https://observatoriotobiassoueu.com.br/anexos.json` em 2026-09-13.
 * O endereço está fixo aqui; numa integração completa ele viria de
 * `listarAnexosPublicos()`, em build, como na Prestação de Contas.
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
 * “Povoado Jacaré”: resumo executivo do A02 público. “Povoado Borda da Mata”
 * entrou em 2026-09-19: a ficha dizia só “Tobias Barreto (SE)”, e as três
 * transcrições do PodObservar localizam o equipamento no povoado — a mesma
 * localidade que `territorio/referencias.ts` já publicava em `/territorio`.
 * O que a pesquisa reuniu sobre cada um **não** está aqui: é resolvido contra
 * `vw_anexo_publico` por `resolverMateriaisDoLugar`, e o `id` é a chave dessa
 * resolução.
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
    lugar: "Povoado Borda da Mata · Tobias Barreto (SE)",
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
  /**
   * `null` quando o município não está documentado. Hoje as oito estão; o
   * campo continua anulável porque é ele que impede a suposição — a entrevista
   * cujo município não estiver documentado simplesmente não exibe a linha, em
   * vez de exibir um município provável.
   *
   * A interface não escreve rótulo de ausência: "município não consolidado"
   * era texto de processo interno na tela de quem lê, e saiu da Home e de
   * `/pesquisa` na revisão editorial de 2026-09-20.
   */
  readonly municipio: string | null;
  /**
   * `documento.slug` do acervo que guarda esta entrevista.
   *
   * Existe para que o estado de cada uma seja **resolvido**, e não afirmado:
   * quem tem arquivo em `vw_anexo_publico` está público, quem não tem,
   * não está. Até 2026-09-19 a Home afirmava em texto fixo que os áudios e as
   * transcrições seguiam restritos; as oito já estavam públicas havia dias, e
   * a frase só não era desmentida por não haver nada ligando a ficha ao
   * documento. É esse elo que falta aqui.
   *
   * A correspondência é declarada, nunca inferida de nome: três delas já
   * apareciam em `dados/materiais-de-campo.ts`, pelos mesmos slugs.
   */
  readonly documento: string;
};

/**
 * As oito entrevistas, identificadas por instituição ou lugar — nunca por
 * pessoa. Numeração e rótulos: `MAPA_FONTES_CANONICAS_2026-09-05.md` §4.
 *
 * A 08 mostrava “município não consolidado”. A transcrição do EP01 do
 * PodObservar diz, sem ambiguidade, que Ilha Grande é povoação de São
 * Cristóvão — e é o mesmo município que `territorio/referencias.ts` publica
 * desde 2026-09-14 e que `/territorio` exibe na ficha do lugar. Corrigido em
 * 2026-09-19.
 */
export const ENTREVISTAS: readonly Entrevista[] = [
  {
    numero: "01",
    onde: "Secretaria de Cultura",
    municipio: "Tobias Barreto",
    documento: "entrevista-josenilson-bispo",
  },
  {
    numero: "02",
    onde: "Centro Cultural e Museu Borda da Mata",
    municipio: "Tobias Barreto",
    documento: "entrevista-oviedo-e-neide-abreu",
  },
  {
    numero: "03",
    onde: "Fundação de Cultura",
    municipio: "São Cristóvão",
    documento: "entrevista-paola-santana",
  },
  {
    numero: "04",
    onde: "Diretoria de Turismo",
    municipio: "São Cristóvão",
    documento: "entrevista-marcio-andre",
  },
  {
    numero: "05",
    onde: "Recanto da Serra",
    municipio: "Tobias Barreto",
    documento: "entrevista-pedro-menezes",
  },
  {
    numero: "06",
    onde: "Prefeitura",
    municipio: "Tobias Barreto",
    documento: "entrevista-prefeito-tobias-barreto",
  },
  {
    numero: "07",
    onde: "Secretaria Municipal de Cultura",
    municipio: "Tomar do Geru",
    documento: "entrevista-laerte-aguiar",
  },
  {
    numero: "08",
    onde: "Ilha Grande",
    municipio: "São Cristóvão",
    documento: "entrevista-lideranca-ilha-grande",
  },
];

/**
 * As entrevistas que têm arquivo público hoje.
 *
 * Estado resolvido contra `vw_anexo_publico`, nunca afirmado — o mesmo
 * princípio das fichas dos lugares, onde "público" só existe quando há URL
 * por trás. A Home e `/pesquisa` leem daqui, e por isso não têm como divergir
 * sobre a mesma entrevista.
 */
export function entrevistasPublicas(
  publicados: ArquivosPublicados,
): readonly Entrevista[] {
  return ENTREVISTAS.filter(
    (entrevista) => (publicados.get(entrevista.documento) ?? []).length > 0,
  );
}
