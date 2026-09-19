/**
 * Formatação pública do PodObservar — data e duração.
 *
 * Funções puras, sem dependência de React e sem acesso a banco, para que o
 * contrato seja testável sem renderizar nada.
 */

/**
 * Fuso do território pesquisado.
 *
 * `publicado_em` guarda meio-dia local de Sergipe (decisão da P0.2B2), e
 * formatar sem fuso explícito usaria o da máquina que faz o build — que em CI
 * é UTC. Não é detalhe: sem isto, o episódio de 31/08 renderizaria 31/08 aqui
 * e poderia renderizar outro dia num runner configurado de outro jeito. Em
 * prestação de contas, a data é afirmação.
 */
const FUSO = "America/Maceio";

const DATA_CURTA = new Intl.DateTimeFormat("pt-BR", {
  timeZone: FUSO,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const DATA_LONGA = new Intl.DateTimeFormat("pt-BR", {
  timeZone: FUSO,
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** `31/08/2026` — para listas e metadados compactos. */
export function dataCurta(quando: Date): string {
  return DATA_CURTA.format(quando);
}

/** `31 de agosto de 2026` — para a abertura da página do episódio. */
export function dataLonga(quando: Date): string {
  return DATA_LONGA.format(quando);
}

/**
 * `AAAA-MM-DD` no fuso do território, para o atributo `dateTime` de `<time>`.
 *
 * `toISOString()` devolveria o dia em UTC, que pode não ser o dia editorial.
 */
export function dataMaquina(quando: Date): string {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: FUSO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(quando);
  return partes;
}

/**
 * `23 min 53 s`.
 *
 * Preferido a `23:53` porque leitor de tela anuncia dois-pontos de formas
 * diferentes, e "vinte e três, cinquenta e três" não diz se são minutos,
 * segundos ou horas. O valor de máquina vai no `dateTime`.
 */
export function duracaoLegivel(segundos: number): string {
  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  const resto = segundos % 60;
  const partes: string[] = [];
  if (horas > 0) partes.push(`${horas} h`);
  partes.push(`${horas > 0 ? String(minutos).padStart(2, "0") : minutos} min`);
  if (resto > 0) partes.push(`${String(resto).padStart(2, "0")} s`);
  return partes.join(" ");
}

/** Duração ISO-8601 para `<time dateTime>` — `PT23M53S`. */
export function duracaoMaquina(segundos: number): string {
  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  const resto = segundos % 60;
  return `PT${horas > 0 ? `${horas}H` : ""}${minutos}M${resto}S`;
}

/** `01`, `02`, … — o número como a identidade editorial o escreve. */
export function numeroDoEpisodio(numero: number): string {
  return String(numero).padStart(2, "0");
}
