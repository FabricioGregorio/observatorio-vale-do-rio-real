import type { Projecao } from "../../../../dados/territorio/projecao";
import { aneisDaGeometria } from "../../../../dados/territorio/projecao";
import { carregarMalhaMunicipal } from "../../../../dados/territorio/validacao";
import {
  aplicar,
  type Caixa,
  caminhoRelativo,
  type Enquadramento,
  enquadrar,
  kmPorUnidade,
  projetarContinuo,
  seCruzam,
} from "../geometria";
import type { EnquadramentoGeografico, EntornoLocal } from "./entorno";

/**
 * Composição da camada local — funções puras, sem JSX.
 *
 * ## Duas origens, nunca misturadas
 *
 * - **Contexto** (vias, cursos d'água, localidades, limites): IBGE e OSM, pelo
 *   derivado local.
 * - **Pins** (lugares da pesquisa): coordenadas de confirmação humana direta,
 *   recebidas por parâmetro. Nenhum pin é posicionado por dado do IBGE ou do
 *   OSM, e nenhuma localidade substitui um pin.
 *
 * ## Rótulos
 *
 * Posicionados em build, por ordem de importância: pin selecionado, demais
 * pins, localidade do lugar, sede, povoados, outras localidades e códigos de
 * rodovia. Rótulo que não cabe sem sobrepor é omitido — exceto o do pin
 * selecionado, que sempre aparece.
 */

type Posicao = readonly [number, number];

export type ClasseDeLocalidade = "sede" | "povoado" | "outra";

export type Rotulo = Caixa & {
  readonly texto: string;
  readonly fonte: number;
};

export type RotuloDeLocalidade = {
  readonly codigoIbge: string;
  readonly texto: string;
  readonly classe: ClasseDeLocalidade;
  readonly x: number;
  readonly y: number;
  readonly lado: "direita" | "esquerda";
  readonly tx: number;
  readonly fonte: number;
  readonly marca: number;
  readonly tipo: "sede" | "localidade" | "referencia-cartografica";
};

export type EscudoDeRodovia = Caixa & {
  readonly ref: string;
  readonly fonte: number;
};

export type MunicipioNoEntorno = {
  readonly codigoIbge: string;
  readonly caminho: string;
  readonly doVale: boolean;
  readonly pesquisaDeCampo: boolean;
};

export type PinLocal = {
  readonly id: string;
  readonly nome: string;
  readonly x: number;
  readonly y: number;
  readonly raio: number;
  readonly selecionado: boolean;
  readonly rotulo: Rotulo | null;
};

export type ReferenciaLocal = {
  readonly codigoIbge: string;
  readonly x: number;
  readonly y: number;
  readonly raio: number;
  readonly rotulo: Rotulo | null;
};

export type CamadaLocal = {
  readonly enquadramento: Enquadramento;
  readonly kmPorUnidade: number;
  readonly municipios: readonly MunicipioNoEntorno[];
  readonly caminhos: {
    readonly rios: string;
    readonly riachos: string;
    readonly urbanas: string;
    readonly estradas: string;
    readonly rodoviasPavimentadas: string;
    readonly rodoviasSemPavimento: string;
  };
  readonly localidades: readonly RotuloDeLocalidade[];
  readonly omitidas: number;
  readonly escudos: readonly EscudoDeRodovia[];
  readonly pins: readonly PinLocal[];
  readonly referencia: ReferenciaLocal | null;
};

/** Distância aproximada em km entre duas posições próximas, em graus. */
export function kmEntre(a: Posicao, b: Posicao): number {
  const lat = ((a[1] + b[1]) / 2) * (Math.PI / 180);
  return Math.hypot(
    (b[0] - a[0]) * Math.cos(lat) * 111.32,
    (b[1] - a[1]) * 110.57,
  );
}

export function montarCamadaLocal(opcoes: {
  readonly projecao: Projecao;
  readonly vista: Caixa;
  readonly fs: number;
  readonly raio: number;
  readonly entorno: EntornoLocal;
  readonly geografico: EnquadramentoGeografico;
  readonly municipios: readonly {
    readonly codigoIbge: string;
    readonly relacoesTerritoriais: readonly string[];
  }[];
  readonly lugarSelecionado: string;
  readonly pins: readonly {
    readonly id: string;
    readonly nome: string;
    readonly posicao: Posicao;
  }[];
  readonly localidadeDoLugar: string | null;
  readonly referenciaCartograficaDoLugar: {
    readonly codigoIbge: string;
    readonly rotulo: string;
  } | null;
}): CamadaLocal {
  const { projecao, vista, fs, raio, entorno, geografico: g } = opcoes;
  const vw = vista.x1 - vista.x0;
  const vh = vista.y1 - vista.y0;

  const [ax, ay] = projetarContinuo(g.lonMin, g.latMax, projecao);
  const [bx, by] = projetarContinuo(g.lonMax, g.latMin, projecao);
  const e = enquadrar({ x0: ax, y0: ay, x1: bx, y1: by }, vista);
  const p = ([lon, lat]: Posicao) => {
    const [x, y] = projetarContinuo(lon, lat, projecao);
    return aplicar(e, x, y);
  };
  const linha = (pontos: readonly Posicao[]) => caminhoRelativo(pontos.map(p));
  const juntar = (lista: readonly { readonly pontos: readonly Posicao[] }[]) =>
    lista.map((item) => linha(item.pontos)).join("");

  /* ---------- municípios que tocam o entorno ---------- */
  const relacoes = new Map(
    opcoes.municipios.map((m) => [m.codigoIbge, m.relacoesTerritoriais]),
  );
  const folga = 0.02;
  const municipios: MunicipioNoEntorno[] = [];
  for (const feature of carregarMalhaMunicipal().features) {
    const aneis = aneisDaGeometria(feature.geometry);
    let lonMin = Number.POSITIVE_INFINITY;
    let lonMax = Number.NEGATIVE_INFINITY;
    let latMin = Number.POSITIVE_INFINITY;
    let latMax = Number.NEGATIVE_INFINITY;
    for (const anel of aneis) {
      for (const [lon, lat] of anel) {
        lonMin = Math.min(lonMin, lon);
        lonMax = Math.max(lonMax, lon);
        latMin = Math.min(latMin, lat);
        latMax = Math.max(latMax, lat);
      }
    }
    if (
      lonMax < g.lonMin - folga ||
      lonMin > g.lonMax + folga ||
      latMax < g.latMin - folga ||
      latMin > g.latMax + folga
    ) {
      continue;
    }
    const rel = relacoes.get(feature.properties.codarea) ?? [];
    municipios.push({
      codigoIbge: feature.properties.codarea,
      caminho: aneis.map((anel) => `${linha(anel)}Z`).join(""),
      doVale: rel.includes("vale-rio-real"),
      pesquisaDeCampo: rel.includes("pesquisa-campo"),
    });
  }

  const rodovias = entorno.vias.filter((v) => v.classe === "rodovia");
  const caminhos = {
    rios: juntar(entorno.cursosDagua.filter((c) => c.classe === "rio")),
    riachos: juntar(entorno.cursosDagua.filter((c) => c.classe === "riacho")),
    urbanas: juntar(entorno.vias.filter((v) => v.classe === "urbana")),
    estradas: juntar(entorno.vias.filter((v) => v.classe === "estrada")),
    rodoviasPavimentadas: juntar(
      rodovias.filter((v) => v.pavimentada !== false),
    ),
    rodoviasSemPavimento: juntar(
      rodovias.filter((v) => v.pavimentada === false),
    ),
  };

  /* ---------- áreas reservadas ---------- */
  const margem = vw * 0.03;
  const interior: Caixa = {
    x0: vista.x0 + margem,
    y0: vista.y0 + margem,
    x1: vista.x1 - margem,
    y1: vista.y1 - margem,
  };
  const ocupadas: Caixa[] = [
    {
      x0: vista.x1 - vw * 0.12,
      y0: vista.y0,
      x1: vista.x1,
      y1: vista.y0 + vh * 0.1,
    },
    {
      x0: vista.x0,
      y0: vista.y1 - vh * 0.1,
      x1: vista.x0 + vw * 0.34,
      y1: vista.y1,
    },
  ];
  const cabe = (c: Caixa) =>
    c.x0 >= interior.x0 &&
    c.x1 <= interior.x1 &&
    c.y0 >= interior.y0 &&
    c.y1 <= interior.y1 &&
    !ocupadas.some((o) => seCruzam(o, c));
  const lados = (
    x: number,
    y: number,
    afastamento: number,
    largura: number,
    altura: number,
  ) => {
    const direita: Caixa = {
      x0: x + afastamento,
      y0: y - altura / 2,
      x1: x + afastamento + largura,
      y1: y + altura / 2,
    };
    const esquerda: Caixa = {
      ...direita,
      x0: x - afastamento - largura,
      x1: x - afastamento,
    };
    return { direita, esquerda };
  };

  /* ---------- pins: coordenadas confirmadas ---------- */
  const ordenados = [...opcoes.pins].sort(
    (a, b) =>
      Number(b.id === opcoes.lugarSelecionado) -
      Number(a.id === opcoes.lugarSelecionado),
  );
  const pins: PinLocal[] = [];
  for (const pin of ordenados) {
    const [x, y] = p(pin.posicao);
    if (x < vista.x0 || x > vista.x1 || y < vista.y0 || y > vista.y1) continue;
    const selecionado = pin.id === opcoes.lugarSelecionado;
    const r = raio * (selecionado ? 0.85 : 0.6);
    ocupadas.push({ x0: x - r, y0: y - r * 3, x1: x + r, y1: y });
    const fonte = selecionado ? fs * 0.9 : fs * 0.72;
    const texto = selecionado ? `▸ ${pin.nome}` : pin.nome;
    const largura =
      texto.length * fonte * 0.6 + (selecionado ? fonte * 0.9 : 0);
    const altura = fonte * (selecionado ? 1.6 : 1.2);
    const { direita, esquerda } = lados(x, y - r * 2, r * 1.4, largura, altura);
    const lado = cabe(direita)
      ? direita
      : cabe(esquerda)
        ? esquerda
        : selecionado
          ? direita
          : null;
    if (lado !== null) ocupadas.push(lado);
    if (selecionado) {
      /*
        Folga em volta do pin selecionado e da sua etiqueta, reservada depois
        de posicionar a etiqueta. No celular, o CSS aumenta os nomes de povoado
        e os códigos de rodovia (estilos.ts); sem a folga, um vizinho calculado
        com a fonte do desktop podia encostar na etiqueta.
      */
      const folga = fs * 0.5;
      const comFolga = (c: Caixa): Caixa => ({
        x0: c.x0 - folga,
        y0: c.y0 - folga,
        x1: c.x1 + folga,
        y1: c.y1 + folga,
      });
      ocupadas.push(comFolga({ x0: x - r, y0: y - r * 3, x1: x + r, y1: y }));
      if (lado !== null) ocupadas.push(comFolga(lado));
    }
    pins.push({
      id: pin.id,
      nome: pin.nome,
      x,
      y,
      raio: r,
      selecionado,
      rotulo: lado === null ? null : { ...lado, texto, fonte },
    });
  }

  /* ---------- localidade do lugar (IBGE), distinta do pin ---------- */
  const localDoLugar =
    opcoes.localidadeDoLugar === null
      ? undefined
      : entorno.localidades.find(
          (l) => l.codigoIbge === opcoes.localidadeDoLugar,
        );
  let referencia: ReferenciaLocal | null = null;
  if (localDoLugar !== undefined) {
    const [x, y] = p(localDoLugar.posicao);
    const r = raio * 0.8;
    ocupadas.push({ x0: x - r, y0: y - r, x1: x + r, y1: y + r });
    const fonte = fs * 0.74;
    const texto = `${localDoLugar.nome} · localidade`;
    const { direita, esquerda } = lados(
      x,
      y,
      r * 1.3,
      texto.length * fonte * 0.58,
      fonte * 1.3,
    );
    const lado = cabe(direita) ? direita : cabe(esquerda) ? esquerda : null;
    if (lado !== null) ocupadas.push(lado);
    referencia = {
      codigoIbge: localDoLugar.codigoIbge,
      x,
      y,
      raio: r,
      rotulo: lado === null ? null : { ...lado, texto, fonte },
    };
  }

  /* ---------- demais localidades ---------- */
  const ordem = (categoria: string) =>
    categoria === "Cidade" ? 0 : categoria === "Povoado" ? 1 : 2;
  const candidatas = entorno.localidades
    .filter((l) => l.codigoIbge !== localDoLugar?.codigoIbge)
    .sort(
      (a, b) =>
        Number(
          b.codigoIbge === opcoes.referenciaCartograficaDoLugar?.codigoIbge,
        ) -
          Number(
            a.codigoIbge === opcoes.referenciaCartograficaDoLugar?.codigoIbge,
          ) ||
        ordem(a.categoria) - ordem(b.categoria) ||
        a.codigoIbge.localeCompare(b.codigoIbge),
    );
  const postas: Posicao[] =
    localDoLugar === undefined ? [] : [localDoLugar.posicao];
  const localidades: RotuloDeLocalidade[] = [];
  let omitidas = 0;
  for (const l of candidatas) {
    if (postas.some((q) => kmEntre(q, l.posicao) < 0.45)) {
      omitidas += 1;
      continue;
    }
    const nivel = ordem(l.categoria);
    const ehReferenciaCartografica =
      l.codigoIbge === opcoes.referenciaCartograficaDoLugar?.codigoIbge;
    const classe: ClasseDeLocalidade =
      nivel === 0 ? "sede" : nivel === 1 ? "povoado" : "outra";
    const fonte = nivel === 0 ? fs * 0.92 : nivel === 1 ? fs * 0.76 : fs * 0.7;
    const texto = ehReferenciaCartografica
      ? (opcoes.referenciaCartograficaDoLugar?.rotulo ?? l.nome)
      : nivel === 0
        ? `${l.nome} · sede`
        : l.nome;
    const [x, y] = p(l.posicao);
    const marca = raio * (nivel === 0 ? 0.62 : 0.42);
    const caixaMarca: Caixa = {
      x0: x - marca,
      y0: y - marca,
      x1: x + marca,
      y1: y + marca,
    };
    if (!cabe(caixaMarca)) {
      omitidas += 1;
      continue;
    }
    const { direita, esquerda } = lados(
      x,
      y - fonte * 0.11,
      marca * 1.9,
      texto.length * fonte * 0.58,
      fonte * 1.22,
    );
    const lado = cabe(direita) ? direita : cabe(esquerda) ? esquerda : null;
    if (lado === null) {
      omitidas += 1;
      continue;
    }
    ocupadas.push(caixaMarca, lado);
    postas.push(l.posicao);
    localidades.push({
      codigoIbge: l.codigoIbge,
      texto,
      classe,
      x,
      y,
      lado: lado === direita ? "direita" : "esquerda",
      tx: lado === direita ? lado.x0 : lado.x1,
      fonte,
      marca,
      tipo: ehReferenciaCartografica
        ? "referencia-cartografica"
        : classe === "sede"
          ? "sede"
          : "localidade",
    });
  }

  /* ---------- códigos de rodovia ---------- */
  const fe = fs * 0.6;
  const porCodigo = new Map<string, [number, number][]>();
  for (const via of rodovias) {
    if (via.ref === null) continue;
    for (const ponto of via.pontos) {
      const [x, y] = p(ponto);
      if (
        x < interior.x0 ||
        x > interior.x1 ||
        y < interior.y0 ||
        y > interior.y1
      ) {
        continue;
      }
      const lista = porCodigo.get(via.ref) ?? [];
      lista.push([x, y]);
      porCodigo.set(via.ref, lista);
    }
  }
  const escudos: EscudoDeRodovia[] = [];
  for (const [ref, pontos] of [...porCodigo].sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    if (pontos.length < 3) continue;
    const cx = pontos.reduce((soma, q) => soma + q[0], 0) / pontos.length;
    const cy = pontos.reduce((soma, q) => soma + q[1], 0) / pontos.length;
    const largura = ref.length * fe * 0.62 + fe * 0.9;
    const altura = fe * 1.5;
    const perto = [...pontos].sort(
      (a, b) =>
        Math.hypot(a[0] - cx, a[1] - cy) - Math.hypot(b[0] - cx, b[1] - cy),
    );
    for (const [x, y] of perto.slice(0, 60)) {
      const caixa = {
        x0: x - largura / 2,
        y0: y - altura / 2,
        x1: x + largura / 2,
        y1: y + altura / 2,
      };
      if (cabe(caixa)) {
        ocupadas.push(caixa);
        escudos.push({ ...caixa, ref, fonte: fe });
        break;
      }
    }
  }

  return {
    enquadramento: e,
    kmPorUnidade: kmPorUnidade(projecao) / e.s,
    municipios,
    caminhos,
    localidades,
    omitidas,
    escudos,
    pins,
    referencia,
  };
}
