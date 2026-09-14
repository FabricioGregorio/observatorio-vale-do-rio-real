/**
 * Deriva uma camada geográfica local do laboratório territorial — Tarefas 18 e 19.
 *
 * Uso:
 *
 *   pnpm exec tsx scripts/derivar-entorno-local.ts \
 *     --entorno=<jacare|borda-da-mata|serra-dos-macacos|ilha-grande> \
 *     --osm=<resposta Overpass em JSON> \
 *     --localidades=<SE_localidades_2022.gpkg> \
 *     [--consulta=<arquivo com a consulta Overpass>] [--obtido-em=<AAAA-MM-DD>]
 *
 * As entradas **não** são versionadas (pesam MB e são reobtidas da fonte).
 *
 * ## Dois destinos
 *
 * - **Jacaré** (enquadramento fixo, não revela posição): o derivado é
 *   versionável e sua procedência vive em `local/procedencia.ts`.
 * - **Demais** (enquadramento centrado na coordenada confirmada): o derivado
 *   revelaria a posição. Ele e sua procedência vão para `local/entornos/`,
 *   excluído do Git. O script **aborta antes de gravar** se o Git não estiver
 *   ignorando o destino.
 *
 * O centro vem sempre de confirmação humana direta; OSM e IBGE fornecem só o
 * contexto.
 *
 * ## Método
 *
 * 1. Recorta pelo enquadramento do entorno, com folga de 0,01°.
 * 2. Vias (OSM): `motorway`, `trunk`, `primary`, `secondary` e vias com código
 *    viram `rodovia`; `tertiary` sem código e `unclassified` viram `estrada`;
 *    `residential` vira `urbana`. `track` e demais classes ficam fora. Só se
 *    guarda código (`ref`) e revestimento — **nome de via não é copiado**.
 * 3. Cursos d'água (OSM): só `river` e `stream` **com nome**.
 * 4. Localidades (IBGE 2022): as do enquadramento, lidas das colunas
 *    `LAT_LOCALIDADE` e `LONG_LOCALIDADE`, sem repetir código.
 * 5. Filtro de nomes (`nomePodeEntrarNoEntorno`): nome que compartilhe radical
 *    com o de um lugar de campo fica fora.
 * 6. Linhas simplificadas por Douglas-Peucker (tolerância ≈ 13 m) e
 *    coordenadas arredondadas a 5 casas (≈ 1 m).
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { z } from "zod";

import {
  carregarCoordenadasConfirmadas,
  FONTE_DA_COORDENADA,
} from "../src/componentes/prototipo/territoriovivo/local/coordenadas";
import {
  type EnquadramentoGeografico,
  type EntornoLocal,
  FONTES_DAS_CAMADAS,
  nomePodeEntrarNoEntorno,
  validarEntornoLocal,
} from "../src/componentes/prototipo/territoriovivo/local/entorno";
import {
  ENTORNOS,
  enquadramentoDoEntorno,
} from "../src/componentes/prototipo/territoriovivo/local/entornos";

type Ponto = [number, number];

function argumento(nome: string): string {
  const valor = opcional(nome);
  if (valor === undefined) throw new Error(`Informe --${nome}=<valor>.`);
  return valor;
}

function opcional(nome: string): string | undefined {
  const valor = process.argv
    .find((a) => a.startsWith(`--${nome}=`))
    ?.slice(nome.length + 3);
  return valor === undefined || valor === "" ? undefined : valor;
}

const sha256 = (dado: Buffer | string) =>
  createHash("sha256").update(dado).digest("hex");

/* ---------- entorno, enquadramento e trava de privacidade ---------- */

const idDoEntorno = argumento("entorno");
const definicao = ENTORNOS.find((e) => e.id === idDoEntorno);
if (definicao === undefined) {
  throw new Error(
    `Entorno desconhecido: ${idDoEntorno}. Use: ${ENTORNOS.map((e) => e.id).join(", ")}.`,
  );
}

let E: EnquadramentoGeografico;
if (definicao.enquadramentoFixo !== null) {
  E = definicao.enquadramentoFixo;
} else {
  const posicao = carregarCoordenadasConfirmadas().get(definicao.lugar);
  if (posicao === undefined) {
    throw new Error(
      `Sem coordenada confirmada para ${definicao.lugar}: o entorno centrado não pode ser derivado.`,
    );
  }
  E = enquadramentoDoEntorno(definicao, posicao);
}

function ignoradoPeloGit(caminho: string): boolean {
  try {
    execFileSync("git", ["check-ignore", "-q", caminho], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

if (!definicao.versionavel && !ignoradoPeloGit(definicao.caminho)) {
  throw new Error(
    `Destino ${definicao.caminho} não está ignorado pelo Git, e este entorno revela a posição confirmada. Nada foi gravado.`,
  );
}

const FOLGA = 0.01;
const CAIXA = {
  lonMin: E.lonMin - FOLGA,
  lonMax: E.lonMax + FOLGA,
  latMin: E.latMin - FOLGA,
  latMax: E.latMax + FOLGA,
};

/* ---------- geometria ---------- */

const arred = (n: number) => Number(n.toFixed(5));
const COS = Math.cos(((E.latMin + E.latMax) / 2) * (Math.PI / 180));
const TOLERANCIA_GRAUS = 0.00012;

function distanciaAoSegmento(p: Ponto, a: Ponto, b: Ponto): number {
  const px = p[0] * COS;
  const ax = a[0] * COS;
  const bx = b[0] * COS;
  const dx = bx - ax;
  const dy = b[1] - a[1];
  const comprimento = dx * dx + dy * dy;
  const t =
    comprimento === 0
      ? 0
      : Math.max(
          0,
          Math.min(1, ((px - ax) * dx + (p[1] - a[1]) * dy) / comprimento),
        );
  return Math.hypot(px - (ax + t * dx), p[1] - (a[1] + t * dy));
}

function simplificar(pontos: Ponto[]): Ponto[] {
  if (pontos.length <= 2) return pontos;
  const primeiro = pontos[0] as Ponto;
  const ultimo = pontos[pontos.length - 1] as Ponto;
  let maior = 0;
  let indice = 0;
  for (let i = 1; i < pontos.length - 1; i++) {
    const d = distanciaAoSegmento(pontos[i] as Ponto, primeiro, ultimo);
    if (d > maior) {
      maior = d;
      indice = i;
    }
  }
  if (maior <= TOLERANCIA_GRAUS) return [primeiro, ultimo];
  return [
    ...simplificar(pontos.slice(0, indice + 1)).slice(0, -1),
    ...simplificar(pontos.slice(indice)),
  ];
}

/** Trechos da linha cujos segmentos tocam a caixa de recorte. */
function recortar(pontos: Ponto[]): Ponto[][] {
  const trechos: Ponto[][] = [];
  let atual: Ponto[] = [];
  for (let i = 1; i < pontos.length; i++) {
    const a = pontos[i - 1] as Ponto;
    const b = pontos[i] as Ponto;
    const toca =
      Math.max(a[0], b[0]) >= CAIXA.lonMin &&
      Math.min(a[0], b[0]) <= CAIXA.lonMax &&
      Math.max(a[1], b[1]) >= CAIXA.latMin &&
      Math.min(a[1], b[1]) <= CAIXA.latMax;
    if (toca) {
      if (atual.length === 0) atual.push(a);
      atual.push(b);
    } else if (atual.length > 0) {
      trechos.push(atual);
      atual = [];
    }
  }
  if (atual.length > 0) trechos.push(atual);
  return trechos;
}

function preparar(pontos: Ponto[]): Ponto[][] {
  return recortar(pontos)
    .map((t) => simplificar(t).map(([x, y]) => [arred(x), arred(y)] as Ponto))
    .filter((t) => t.length >= 2);
}

/* ---------- OSM ---------- */

const esquemaOsm = z.object({
  osm3s: z.looseObject({ timestamp_osm_base: z.string() }),
  elements: z.array(
    z.looseObject({
      type: z.string(),
      tags: z.record(z.string(), z.string()).optional(),
      geometry: z
        .array(z.object({ lat: z.number(), lon: z.number() }))
        .optional(),
    }),
  ),
});

const PAVIMENTADA = new Set([
  "asphalt",
  "paved",
  "concrete",
  "sett",
  "paving_stones",
]);
const NAO_PAVIMENTADA = new Set([
  "unpaved",
  "dirt",
  "earth",
  "gravel",
  "ground",
  "sand",
  "compacted",
]);

function classeDaVia(
  highway: string,
  ref: string | undefined,
): EntornoLocal["vias"][number]["classe"] | null {
  if (["motorway", "trunk", "primary", "secondary"].includes(highway)) {
    return "rodovia";
  }
  if (highway === "tertiary") return ref !== undefined ? "rodovia" : "estrada";
  if (highway === "unclassified") return "estrada";
  if (highway === "residential") return "urbana";
  return null;
}

/* ---------- execução ---------- */

const caminhoOsm = argumento("osm");
const caminhoLocalidades = argumento("localidades");

const brutoOsm = readFileSync(caminhoOsm);
const osm = esquemaOsm.parse(JSON.parse(brutoOsm.toString("utf8")));

const vias: EntornoLocal["vias"][number][] = [];
const cursosDagua: EntornoLocal["cursosDagua"][number][] = [];

for (const el of osm.elements) {
  if (el.type !== "way" || el.geometry === undefined || el.tags === undefined) {
    continue;
  }
  const pontos = el.geometry.map((g) => [g.lon, g.lat] as Ponto);
  const { highway, waterway, ref, surface, name } = el.tags;

  if (highway !== undefined) {
    const classe = classeDaVia(highway, ref);
    if (classe === null) continue;
    const pavimentada =
      surface === undefined
        ? null
        : PAVIMENTADA.has(surface)
          ? true
          : NAO_PAVIMENTADA.has(surface)
            ? false
            : null;
    for (const trecho of preparar(pontos)) {
      vias.push({ classe, ref: ref ?? null, pavimentada, pontos: trecho });
    }
  } else if (
    (waterway === "river" || waterway === "stream") &&
    name !== undefined &&
    nomePodeEntrarNoEntorno(name)
  ) {
    for (const trecho of preparar(pontos)) {
      cursosDagua.push({
        classe: waterway === "river" ? "rio" : "riacho",
        nome: name,
        pontos: trecho,
      });
    }
  }
}

const banco = new DatabaseSync(caminhoLocalidades, { readOnly: true });
const linhas = banco
  .prepare(
    `select CD_LOCALIDADE, NM_LOCALIDADE, CT_LOCALIDADE, LAT_LOCALIDADE, LONG_LOCALIDADE
       from SE_localidades_2022
      where LONG_LOCALIDADE between ? and ? and LAT_LOCALIDADE between ? and ?`,
  )
  .all(E.lonMin, E.lonMax, E.latMin, E.latMax);

const esquemaLinhaIbge = z.object({
  CD_LOCALIDADE: z.string(),
  NM_LOCALIDADE: z.string(),
  CT_LOCALIDADE: z.string(),
  LAT_LOCALIDADE: z.number(),
  LONG_LOCALIDADE: z.number(),
});

const localidades = new Map<string, EntornoLocal["localidades"][number]>();
for (const bruta of linhas) {
  const l = esquemaLinhaIbge.parse(bruta);
  if (localidades.has(l.CD_LOCALIDADE)) continue;
  if (!nomePodeEntrarNoEntorno(l.NM_LOCALIDADE, l.CD_LOCALIDADE)) continue;
  localidades.set(l.CD_LOCALIDADE, {
    codigoIbge: l.CD_LOCALIDADE,
    nome: l.NM_LOCALIDADE,
    categoria: l.CT_LOCALIDADE,
    posicao: [arred(l.LONG_LOCALIDADE), arred(l.LAT_LOCALIDADE)],
  });
}
banco.close();

const primeiroPonto = (p: readonly (readonly [number, number])[]) =>
  `${p[0]?.[0]},${p[0]?.[1]}`;

const entorno: EntornoLocal = validarEntornoLocal(
  {
    versao: 1,
    enquadramento: E,
    fontes: FONTES_DAS_CAMADAS,
    localidades: [...localidades.values()].sort((a, b) =>
      a.codigoIbge.localeCompare(b.codigoIbge),
    ),
    cursosDagua: cursosDagua.sort((a, b) =>
      `${a.nome}${primeiroPonto(a.pontos)}`.localeCompare(
        `${b.nome}${primeiroPonto(b.pontos)}`,
      ),
    ),
    vias: vias.sort((a, b) =>
      `${a.classe}${a.ref ?? ""}${primeiroPonto(a.pontos)}`.localeCompare(
        `${b.classe}${b.ref ?? ""}${primeiroPonto(b.pontos)}`,
      ),
    ),
  },
  {
    enquadramento: E,
    localidadesObrigatorias: definicao.localidadesObrigatorias,
  },
);

/* Uma entidade por linha antes de formatar: arquivo conferível à mão. */
const bloco = (itens: readonly unknown[]) =>
  `[\n${itens.map((i) => `    ${JSON.stringify(i)}`).join(",\n")}\n  ]`;
const texto = `{
  "versao": 1,
  "enquadramento": ${JSON.stringify(entorno.enquadramento)},
  "fontes": ${JSON.stringify(entorno.fontes)},
  "localidades": ${bloco(entorno.localidades)},
  "cursosDagua": ${bloco(entorno.cursosDagua)},
  "vias": ${bloco(entorno.vias)}
}
`;
/*
  O derivado é gravado já no formato do Biome. Ele vive dentro de `src/`, que
  `pnpm lint` confere; reformatá-lo depois mudaria o SHA-256 registrado.
*/
const binarioDoBiome = createRequire(import.meta.url).resolve(
  "@biomejs/biome/bin/biome",
);
const formatar = (conteudo: string, caminho: string) =>
  execFileSync(
    process.execPath,
    [binarioDoBiome, "format", `--stdin-file-path=${caminho}`],
    { input: conteudo, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
  );

const formatado = formatar(texto, definicao.caminho);
mkdirSync(dirname(definicao.caminho), { recursive: true });
writeFileSync(definicao.caminho, formatado, "utf8");

const vertices = (lista: readonly { pontos: readonly unknown[] }[]) =>
  lista.reduce((n, i) => n + i.pontos.length, 0);

const relatorio = {
  entorno: definicao.id,
  lugar: definicao.lugar,
  versionavel: definicao.versionavel,
  centro:
    definicao.enquadramentoFixo === null
      ? `coordenada confirmada — ${FONTE_DA_COORDENADA}; não vem do OSM nem do IBGE`
      : "enquadramento fixo, definido pela localidade pública e pela sede",
  enquadramento: E,
  osm: {
    arquivo: caminhoOsm,
    consulta:
      opcional("consulta") === undefined
        ? null
        : readFileSync(opcional("consulta") as string, "utf8").trim(),
    obtidoEm: opcional("obtido-em") ?? null,
    baseOsm: osm.osm3s.timestamp_osm_base,
    sha256: sha256(brutoOsm),
    licenca: "ODbL 1.0 — © contribuidores do OpenStreetMap",
  },
  localidades: {
    arquivo: caminhoLocalidades,
    sha256: sha256(readFileSync(caminhoLocalidades)),
    fonte: "IBGE — Localidades do Brasil, Censo 2022",
  },
  metodo:
    "Ver cabeçalho de scripts/derivar-entorno-local.ts (recorte, classificação sem nome de via, filtro de nomes, Douglas-Peucker ≈ 13 m, 5 casas, validação Zod, formato Biome).",
  derivado: {
    arquivo: definicao.caminho,
    bytes: Buffer.byteLength(formatado),
    sha256: sha256(formatado),
    localidades: entorno.localidades.length,
    cursosDagua: entorno.cursosDagua.length,
    verticesCursos: vertices(entorno.cursosDagua),
    vias: entorno.vias.length,
    verticesVias: vertices(entorno.vias),
  },
};

/* Entorno centrado: a procedência também revela o enquadramento, então fica local. */
if (!definicao.versionavel) {
  const caminhoDaProcedencia = definicao.caminho.replace(
    /\.local\.json$/,
    ".procedencia.local.json",
  );
  if (!ignoradoPeloGit(caminhoDaProcedencia)) {
    throw new Error(
      `Procedência ${caminhoDaProcedencia} não está ignorada pelo Git. O derivado foi gravado; a procedência, não.`,
    );
  }
  writeFileSync(
    caminhoDaProcedencia,
    formatar(`${JSON.stringify(relatorio, null, 2)}\n`, caminhoDaProcedencia),
    "utf8",
  );
}

console.log(JSON.stringify(relatorio, null, 2));
