import { existsSync } from "node:fs";

import {
  type MunicipioDoMapa,
  montarDadosDoMapa,
} from "../../../../dados/territorio/mapa";
import {
  type Caixa,
  type CaixaComCentro,
  caixaDoCaminho,
  type Enquadramento,
  enquadrar,
  expandir,
  kmPorUnidade,
  projetarContinuo,
  seCruzam,
  unirCaixas,
} from "../geometria";
import {
  type IdDoLugar,
  LUGARES_DE_CAMPO,
  type LugarDeCampo,
} from "../lugares";
import type { EnquadramentoGeografico } from "./entorno";
import {
  type DefinicaoDeEntorno,
  definicaoDoEntorno,
  enquadramentoDoEntorno,
} from "./entornos";
import {
  carregarCoordenadasConfirmadas,
  type PosicaoConfirmada,
} from "./referencias";

/**
 * Base espacial do laboratório — compartilhada pela página e pela rota que
 * serve as camadas locais sob demanda. Tempo de build; sem JSX.
 *
 * A página só precisa de números leves: vista do Vale, posição projetada de
 * cada pin, enquadramento regional e enquadramento local. O conteúdo pesado
 * das camadas locais (vias, cursos d'água, localidades) **não** passa por aqui.
 */

export type CamadaLocalDisponivel = {
  readonly definicao: DefinicaoDeEntorno;
  readonly geografico: EnquadramentoGeografico;
  /** Enquadramento da malha que coincide com a camada local. */
  readonly enquadramento: Enquadramento;
};

export type LugarNoMapa = LugarDeCampo & {
  readonly posicao: PosicaoConfirmada | null;
  /** Posição projetada, em unidades da malha. */
  readonly xy: readonly [number, number] | null;
  /** O ponto cai dentro da vista dos cinco municípios do Vale. */
  readonly dentroDoVale: boolean;
  /** Aproximação regional (2×) centrada no ponto. */
  readonly regional: Enquadramento | null;
  /** `null` quando não há derivado local disponível. */
  readonly local: CamadaLocalDisponivel | null;
};

export type LugarPosicionado = LugarNoMapa & {
  readonly posicao: PosicaoConfirmada;
  readonly xy: readonly [number, number];
  readonly regional: Enquadramento;
};

export function estaPosicionado(lugar: LugarNoMapa): lugar is LugarPosicionado {
  return lugar.posicao !== null && lugar.xy !== null && lugar.regional !== null;
}

export type BaseDoTerritorio = {
  readonly dados: ReturnType<typeof montarDadosDoMapa>;
  readonly caixaDe: (codigo: string) => CaixaComCentro;
  readonly vista: Caixa;
  readonly vw: number;
  readonly vh: number;
  readonly fs: number;
  readonly raio: number;
  readonly kmU: number;
  readonly doVale: readonly MunicipioDoMapa[];
  /** Municípios que cruzam a vista do Vale ou alguma janela regional. */
  readonly visiveis: readonly MunicipioDoMapa[];
  readonly lugares: readonly LugarNoMapa[];
};

export function montarBaseDoTerritorio(opcoes?: {
  readonly coordenadas?: ReadonlyMap<IdDoLugar, PosicaoConfirmada>;
}): BaseDoTerritorio {
  const dados = montarDadosDoMapa();
  const caixas = new Map(
    dados.municipios.map((m) => [m.codigoIbge, caixaDoCaminho(m.caminho)]),
  );
  const caixaDe = (codigo: string) => {
    const caixa = caixas.get(codigo);
    if (caixa === undefined) throw new Error(`Município sem caixa: ${codigo}`);
    return caixa;
  };

  const doVale = dados.municipios.filter((m) =>
    m.relacoesTerritoriais.includes("vale-rio-real"),
  );
  const vista = expandir(
    unirCaixas(doVale.map((m) => caixaDe(m.codigoIbge))),
    0.08,
  );
  const vw = vista.x1 - vista.x0;
  const vh = vista.y1 - vista.y0;
  const coordenadas = opcoes?.coordenadas ?? carregarCoordenadasConfirmadas();

  const janelaEm = ([x, y]: readonly [number, number]): Caixa => ({
    x0: x - vw / 4,
    y0: y - vh / 4,
    x1: x + vw / 4,
    y1: y + vh / 4,
  });

  const lugares = LUGARES_DE_CAMPO.map((lugar): LugarNoMapa => {
    const posicao = coordenadas.get(lugar.id) ?? null;
    if (posicao === null) {
      return {
        ...lugar,
        posicao,
        xy: null,
        dentroDoVale: false,
        regional: null,
        local: null,
      };
    }
    const xy = projetarContinuo(
      posicao.longitude,
      posicao.latitude,
      dados.projecao,
    );
    const dentroDoVale =
      xy[0] >= vista.x0 &&
      xy[0] <= vista.x1 &&
      xy[1] >= vista.y0 &&
      xy[1] <= vista.y1;

    let local: CamadaLocalDisponivel | null = null;
    if (lugar.camadaLocal !== null) {
      const definicao = definicaoDoEntorno(lugar.camadaLocal.entorno);
      if (existsSync(definicao.caminho)) {
        const geografico = enquadramentoDoEntorno(definicao, posicao);
        const [ax, ay] = projetarContinuo(
          geografico.lonMin,
          geografico.latMax,
          dados.projecao,
        );
        const [bx, by] = projetarContinuo(
          geografico.lonMax,
          geografico.latMin,
          dados.projecao,
        );
        local = {
          definicao,
          geografico,
          enquadramento: enquadrar({ x0: ax, y0: ay, x1: bx, y1: by }, vista),
        };
      }
    }

    return {
      ...lugar,
      posicao,
      xy,
      dentroDoVale,
      regional: enquadrar(janelaEm(xy), vista),
      local,
    };
  });

  const janelas: Caixa[] = [
    vista,
    ...lugares.flatMap((l) => (l.xy !== null ? [janelaEm(l.xy)] : [])),
  ];
  const visiveis = dados.municipios.filter((m) =>
    janelas.some((j) => seCruzam(caixaDe(m.codigoIbge), j)),
  );

  return {
    dados,
    caixaDe,
    vista,
    vw,
    vh,
    fs: vw * 0.028,
    raio: vw * 0.024,
    kmU: kmPorUnidade(dados.projecao),
    doVale,
    visiveis,
    lugares,
  };
}
