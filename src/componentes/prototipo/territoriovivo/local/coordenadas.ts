import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";

import { IDS_DOS_LUGARES, type IdDoLugar } from "../lugares";

/**
 * Coordenadas confirmadas dos lugares de campo — Tarefa 19.
 *
 * ## Autoridade
 *
 * As quatro coordenadas vêm de **confirmação humana direta** do responsável,
 * em 2026-09-14. Não são candidatas, não vêm de relatório restrito, e **não**
 * vêm do IBGE nem do OpenStreetMap: essas fontes descrevem só a cartografia
 * de contexto (`entorno.ts`), nunca a posição de um lugar.
 *
 * ## Por que os números não estão neste arquivo
 *
 * O repositório tem remoto público, e a exposição pública das coordenadas
 * **não** foi autorizada — nem no site, nem no Git. Os valores ficam num
 * arquivo local (`*.local.json`), excluído do Git por `.git/info/exclude`.
 * Sem esse arquivo, o laboratório volta ao estado anterior: nenhum pin.
 *
 * O esquema exige `publicacaoPublicaAutorizada: false` e
 * `remotoPublicoAutorizado: false`. Mudar isso é decisão humana registrada, não
 * ajuste de código.
 */

export const FONTE_DA_COORDENADA = "confirmação humana direta — 2026-09-14";

export const CAMINHO_DAS_COORDENADAS_CONFIRMADAS = join(
  "src",
  "componentes",
  "prototipo",
  "territoriovivo",
  "local",
  "coordenadas-confirmadas.local.json",
);

const esquemaPar = z
  .object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  })
  .strict();

export const esquemaCoordenadasConfirmadas = z
  .object({
    fonteDaCoordenada: z.literal(FONTE_DA_COORDENADA),
    confirmadoEm: z.literal("2026-09-14"),
    publicacaoPublicaAutorizada: z.literal(false),
    remotoPublicoAutorizado: z.literal(false),
    lugares: z.partialRecord(z.enum(IDS_DOS_LUGARES), esquemaPar),
  })
  .strict();

/** Posição de um lugar, com a origem da informação presa ao próprio valor. */
export type PosicaoConfirmada = {
  readonly latitude: number;
  readonly longitude: number;
  readonly coordenadaConfirmada: true;
  readonly fonteDaCoordenada: typeof FONTE_DA_COORDENADA;
  /** Só laboratório DEV. Publicar exige decisão humana própria. */
  readonly publicacaoPublicaAutorizada: false;
};

export function validarCoordenadasConfirmadas(
  bruto: unknown,
): ReadonlyMap<IdDoLugar, PosicaoConfirmada> {
  const dado = esquemaCoordenadasConfirmadas.parse(bruto);
  const mapa = new Map<IdDoLugar, PosicaoConfirmada>();
  for (const id of IDS_DOS_LUGARES) {
    const par = dado.lugares[id];
    if (par === undefined) continue;
    mapa.set(id, {
      latitude: par.latitude,
      longitude: par.longitude,
      coordenadaConfirmada: true,
      fonteDaCoordenada: dado.fonteDaCoordenada,
      publicacaoPublicaAutorizada: false,
    });
  }
  return mapa;
}

/**
 * Lê as coordenadas do arquivo local. Ausente o arquivo, devolve mapa vazio —
 * e o laboratório não desenha pin nenhum. Tempo de build; não vai ao cliente.
 */
export function carregarCoordenadasConfirmadas(
  caminho: string = CAMINHO_DAS_COORDENADAS_CONFIRMADAS,
): ReadonlyMap<IdDoLugar, PosicaoConfirmada> {
  if (!existsSync(caminho)) return new Map();
  return validarCoordenadasConfirmadas(
    JSON.parse(readFileSync(caminho, "utf8")),
  );
}
