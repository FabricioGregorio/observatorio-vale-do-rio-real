/**
 * Fundação territorial — Tarefa 10B.1.
 *
 * Dois tipos de verificação:
 *
 * 1. os componentes desta etapa somem quando não há dado aprovado, em vez de
 *    virar caixa vazia;
 * 2. não existe dado territorial inventado no repositório.
 *
 * O segundo é o que realmente importa aqui. A etapa foi criada justamente para
 * receber mapa, fotos e logos depois; o risco é alguém — pessoa ou agente —
 * preencher a estrutura com GeoJSON de exemplo, foto de banco de imagem ou
 * logo aproximada só para "ver funcionando". Num site de prestação de contas
 * isso não é protótipo, é dado falso.
 */
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { CreditosInstitucionais } from "../src/componentes/institucional/CreditosInstitucionais";
import { FichaMunicipio } from "../src/componentes/mapa/FichaMunicipio";
import {
  idDaFicha,
  nomeAcessivelDoMunicipio,
} from "../src/componentes/mapa/identificacao";
import { MapaTerritorio } from "../src/componentes/mapa/MapaTerritorio";
import { FONTES_TERRITORIAIS } from "../src/dados/territorio/fontes";
import {
  type MunicipioDoMapa,
  montarDadosDoMapa,
} from "../src/dados/territorio/mapa";
import { PONTOS_DE_VISITA_PREVISTOS } from "../src/dados/territorio/pontos";
import { RECORTE_TERRITORIAL } from "../src/dados/territorio/recorte";
import type { PontoDeVisita } from "../src/dados/territorio/tipos";
import {
  CAMINHO_DA_MALHA,
  carregarMalhaMunicipal,
  carregarNomesDeMunicipios,
  MUNICIPIOS_DE_SERGIPE,
  validarMalhaMunicipal,
} from "../src/dados/territorio/validacao";

/** Município de teste. Não é dado do projeto: só exercita o contrato. */
const municipioDeTeste: MunicipioDoMapa = {
  codigoIbge: "2800000",
  nome: "Município de teste",
  relacoesTerritoriais: [],
  evidenciasDePesquisa: [],
  caminho: "M0 0L1 0L1 1Z",
};

const pontoDeTeste: PontoDeVisita = {
  id: "p1",
  nome: "Ponto de teste",
  tipo: null,
  municipioId: "2800000",
  coordenadas: null,
  imagem: null,
  descricao: null,
};

describe("componentes do mapa", () => {
  test("o mapa some quando não há município", () => {
    expect(
      MapaTerritorio({
        dados: {
          projecao: {
            largura: 1000,
            altura: 1000,
            envelope: { lonMin: -1, lonMax: 1, latMin: -1, latMax: 1 },
          },
          municipios: [],
          pontosPosicionados: [],
          pontosSemPosicao: [],
        },
      }),
    ).toBeNull();
  });

  test("a ficha some quando não há evidência nem ponto relacionado", () => {
    expect(
      FichaMunicipio({ municipio: municipioDeTeste, pontos: [] }),
    ).toBeNull();
  });

  test("a ficha aparece quando há evidência documental", () => {
    const saida = FichaMunicipio({
      municipio: {
        ...municipioDeTeste,
        relacoesTerritoriais: ["pesquisa-campo"],
        evidenciasDePesquisa: ["Entrevista — teste"],
      },
      pontos: [],
    });
    expect(saida).not.toBeNull();
  });

  test("a ficha aparece quando há ponto relacionado", () => {
    const saida = FichaMunicipio({
      municipio: municipioDeTeste,
      pontos: [pontoDeTeste],
    });
    expect(saida).not.toBeNull();
  });

  test("os créditos somem enquanto não houver marca aprovada", () => {
    expect(CreditosInstitucionais({ marcas: [] })).toBeNull();
  });
});

describe("ausência de dado territorial inventado", () => {
  test("os dados territoriais presentes são os dois arquivos oficiais", () => {
    const dados = readdirSync("src/dados/territorio")
      .filter((nome) => /\.(geojson|json)$/i.test(nome))
      .sort();
    expect(dados).toEqual([
      "municipios-sergipe-nomes.json",
      "municipios-sergipe.geojson",
    ]);
  });

  /**
   * O teste que vale a partir do momento em que alguém trouxer o primeiro
   * arquivo: dado territorial sem procedência registrada não entra. Hoje ele
   * passa por vacuidade — e é justamente para deixar de passar por vacuidade
   * sem ninguém perceber que ele existe.
   */
  test("todo arquivo de dado presente tem procedência completa", () => {
    const presentes = new Set(readdirSync("src/dados/territorio"));

    for (const fonte of FONTES_TERRITORIAIS) {
      if (!presentes.has(fonte.arquivo)) continue;
      expect(fonte.origem, `${fonte.arquivo} sem origem`).not.toBeNull();
      expect(fonte.obtidoEm, `${fonte.arquivo} sem data`).not.toBeNull();
      expect(fonte.licenca, `${fonte.arquivo} sem licença`).not.toBeNull();
      expect(
        fonte.atribuicao,
        `${fonte.arquivo} sem atribuição`,
      ).not.toBeNull();
      expect(fonte.sha256, `${fonte.arquivo} sem hash`).not.toBeNull();
    }
  });

  test("todo arquivo de dado presente está declarado em fontes.ts", () => {
    const declarados = new Set(
      FONTES_TERRITORIAIS.map((fonte) => fonte.arquivo),
    );
    const naoDeclarados = readdirSync("src/dados/territorio").filter(
      (nome) => /\.(geojson|json)$/i.test(nome) && !declarados.has(nome),
    );
    expect(naoDeclarados).toEqual([]);
  });

  test("public/media está vazia de mídia", () => {
    const midia = /\.(png|jpe?g|webp|avif|gif|svg|geojson|mp3|mp4|pdf)$/i;
    const encontrados: string[] = [];

    function varrer(dir: string) {
      for (const nome of readdirSync(dir)) {
        const caminho = join(dir, nome);
        if (statSync(caminho).isDirectory()) varrer(caminho);
        else if (midia.test(nome)) encontrados.push(caminho);
      }
    }
    varrer("public");

    expect(encontrados).toEqual([]);
  });

  test("as cinco pastas de mídia previstas existem", () => {
    const pastas = readdirSync("public/media", { withFileTypes: true })
      .filter((entrada) => entrada.isDirectory())
      .map((entrada) => entrada.name)
      .sort();
    expect(pastas).toEqual(["campo", "logos", "mapa", "pessoas", "territorio"]);
  });
});

describe("recorte territorial e camadas", () => {
  test("o Vale do Rio Real tem exatamente os cinco municípios definidos", () => {
    const vale = RECORTE_TERRITORIAL.filter((municipio) =>
      municipio.relacoesTerritoriais.includes("vale-rio-real"),
    ).map((municipio) => municipio.nome);

    expect(vale).toEqual([
      "Tobias Barreto",
      "Tomar do Geru",
      "Itabaianinha",
      "Cristinápolis",
      "Poço Verde",
    ]);
  });

  /**
   * O erro que este teste existe para impedir: pintar São Cristóvão como se
   * fosse Vale do Rio Real. Ele entra como referência de comparação de
   * políticas públicas, e confundir as duas coisas é afirmação territorial
   * falsa.
   */
  test("São Cristóvão é comparação, nunca Vale do Rio Real", () => {
    const saoCristovao = RECORTE_TERRITORIAL.find(
      (municipio) => municipio.nome === "São Cristóvão",
    );

    expect(saoCristovao?.relacoesTerritoriais).toContain("comparacao");
    expect(saoCristovao?.relacoesTerritoriais).not.toContain("vale-rio-real");
  });

  test("cada código do IBGE tem sete dígitos e começa por 28, de Sergipe", () => {
    for (const municipio of RECORTE_TERRITORIAL) {
      expect(municipio.codigoIbge, municipio.nome).toMatch(/^28\d{5}$/);
    }
  });

  test("nenhum município aparece duas vezes no recorte", () => {
    const codigos = RECORTE_TERRITORIAL.map((m) => m.codigoIbge);
    expect(new Set(codigos).size).toBe(codigos.length);
  });

  test("a camada de pesquisa de campo tem os três municípios com evidência", () => {
    const pesquisados = RECORTE_TERRITORIAL.filter((municipio) =>
      municipio.relacoesTerritoriais.includes("pesquisa-campo"),
    ).map((municipio) => municipio.nome);

    expect(pesquisados).toEqual([
      "Tobias Barreto",
      "Tomar do Geru",
      "São Cristóvão",
    ]);
  });

  /**
   * O invariante que sustenta a camada: num site de prestação de contas,
   * afirmar que um município foi pesquisado é afirmação verificável. A relação
   * e a evidência andam juntas — não dá para acrescentar uma sem a outra.
   */
  test("pesquisa de campo e evidência documental andam juntas", () => {
    for (const municipio of RECORTE_TERRITORIAL) {
      const afirmado =
        municipio.relacoesTerritoriais.includes("pesquisa-campo");
      const temEvidencia = municipio.evidenciasDePesquisa.length > 0;
      expect(afirmado, municipio.nome).toBe(temEvidencia);
    }
  });

  /**
   * Pertencer ao recorte e ter sido pesquisado continuam independentes:
   * Itabaianinha, Cristinápolis e Poço Verde estão no Vale sem evidência de
   * pesquisa de campo, e São Cristóvão foi pesquisado sem estar no Vale.
   */
  test("recorte e pesquisa continuam camadas independentes", () => {
    const noValeSemPesquisa = RECORTE_TERRITORIAL.filter(
      (municipio) =>
        municipio.relacoesTerritoriais.includes("vale-rio-real") &&
        !municipio.relacoesTerritoriais.includes("pesquisa-campo"),
    ).map((municipio) => municipio.nome);

    expect(noValeSemPesquisa).toEqual([
      "Itabaianinha",
      "Cristinápolis",
      "Poço Verde",
    ]);

    const saoCristovao = RECORTE_TERRITORIAL.find(
      (municipio) => municipio.nome === "São Cristóvão",
    );
    expect(saoCristovao?.relacoesTerritoriais).toContain("pesquisa-campo");
    expect(saoCristovao?.relacoesTerritoriais).not.toContain("vale-rio-real");
  });

  test("os quatro locais de visita da documentação estão previstos", () => {
    expect(PONTOS_DE_VISITA_PREVISTOS.map((ponto) => ponto.nome)).toEqual([
      "Recanto da Serra",
      "Centro Cultural e Museu Borda da Mata",
      "Serra dos Macacos",
      "Ilha Grande",
    ]);
  });

  test("nenhum ponto tem coordenada, foto, tipo ou descrição", () => {
    expect(PONTOS_DE_VISITA_PREVISTOS).toHaveLength(4);
    for (const ponto of PONTOS_DE_VISITA_PREVISTOS) {
      expect(ponto.coordenadas, ponto.nome).toBeNull();
      expect(ponto.imagem, ponto.nome).toBeNull();
      expect(ponto.tipo, ponto.nome).toBeNull();
      expect(ponto.descricao, ponto.nome).toBeNull();
    }
  });

  /**
   * A instrução da 10B.2.2 proibiu inventar o município de Ilha Grande.
   * Serra dos Macacos está na mesma situação: nenhum documento lido o associa
   * a um município. Os dois ficam `null`, e este teste impede que alguém
   * "resolva" a lacuna por dedução.
   */
  test("ponto sem município declarado continua sem município", () => {
    const semMunicipio = PONTOS_DE_VISITA_PREVISTOS.filter(
      (ponto) => ponto.municipioId === null,
    ).map((ponto) => ponto.nome);

    expect(semMunicipio).toEqual(["Serra dos Macacos", "Ilha Grande"]);
  });

  test("ponto com município aponta para município do recorte", () => {
    const codigos = new Set(
      RECORTE_TERRITORIAL.map((municipio) => municipio.codigoIbge),
    );

    for (const ponto of PONTOS_DE_VISITA_PREVISTOS) {
      if (ponto.municipioId === null) continue;
      expect(codigos.has(ponto.municipioId), ponto.nome).toBe(true);
    }
  });
});

describe("malha municipal do IBGE", () => {
  const malha = carregarMalhaMunicipal();

  test("traz os 75 municípios de Sergipe, sem faltar nenhum", () => {
    expect(MUNICIPIOS_DE_SERGIPE).toBe(75);
    expect(malha.features).toHaveLength(75);
  });

  test("todo código é do formato do IBGE e é de Sergipe", () => {
    for (const feature of malha.features) {
      expect(feature.properties.codarea).toMatch(/^28\d{5}$/);
    }
  });

  test("nenhum código se repete", () => {
    const codigos = malha.features.map((feature) => feature.properties.codarea);
    expect(new Set(codigos).size).toBe(codigos.length);
  });

  test("os seis municípios do recorte existem na malha", () => {
    const codigos = new Set(
      malha.features.map((feature) => feature.properties.codarea),
    );
    for (const municipio of RECORTE_TERRITORIAL) {
      expect(codigos.has(municipio.codigoIbge), municipio.nome).toBe(true);
    }
  });

  /**
   * O arquivo é dado externo dentro do repositório. O hash registrado em
   * `fontes.ts` é o que permite provar, depois, que é o mesmo arquivo que veio
   * do IBGE — a mesma conferência que a Sala do Avaliador faz com os anexos.
   */
  test("o arquivo confere com o SHA-256 registrado", () => {
    const fonte = FONTES_TERRITORIAIS.find(
      (item) => item.arquivo === "municipios-sergipe.geojson",
    );
    const hash = createHash("sha256")
      .update(readFileSync(CAMINHO_DA_MALHA))
      .digest("hex");

    expect(fonte?.sha256).toBe(hash);
  });

  test("a origem registrada é a malha intermediária por município", () => {
    const fonte = FONTES_TERRITORIAIS.find(
      (item) => item.arquivo === "municipios-sergipe.geojson",
    );
    expect(fonte?.origem).toContain("servicodados.ibge.gov.br");
    expect(fonte?.origem).toContain("qualidade=intermediaria");
    expect(fonte?.origem).toContain("intrarregiao=municipio");
    expect(fonte?.obtidoEm).toBe("2026-09-03");
  });
});

describe("a validação falha alto, não em silêncio", () => {
  const malha = carregarMalhaMunicipal();

  test("recusa malha incompleta", () => {
    const truncada = {
      ...malha,
      features: malha.features.slice(0, 60),
    };
    expect(() => validarMalhaMunicipal(truncada)).toThrow(
      /Malha incompleta: 60/,
    );
  });

  test("recusa código de município repetido", () => {
    const primeira = malha.features[0];
    const repetida = {
      ...malha,
      features: malha.features.map((feature, indice) =>
        indice === 1 && primeira ? primeira : feature,
      ),
    };
    expect(() => validarMalhaMunicipal(repetida)).toThrow(/repetido/);
  });

  test("recusa anel aberto", () => {
    const [primeira, ...resto] = malha.features;
    if (primeira === undefined) throw new Error("malha vazia");
    const anel =
      primeira.geometry.type === "Polygon"
        ? primeira.geometry.coordinates[0]
        : primeira.geometry.coordinates[0]?.[0];
    if (anel === undefined) throw new Error("sem anel");

    const aberta = {
      ...malha,
      features: [
        {
          ...primeira,
          geometry: {
            type: "Polygon" as const,
            coordinates: [anel.slice(0, -1)],
          },
        },
        ...resto,
      ],
    };
    expect(() => validarMalhaMunicipal(aberta)).toThrow();
  });

  test("recusa codarea fora do formato do IBGE", () => {
    const [primeira, ...resto] = malha.features;
    if (primeira === undefined) throw new Error("malha vazia");
    const errada = {
      ...malha,
      features: [{ ...primeira, properties: { codarea: "28" } }, ...resto],
    };
    expect(() => validarMalhaMunicipal(errada)).toThrow();
  });

  test("recusa arquivo que não é FeatureCollection", () => {
    expect(() => validarMalhaMunicipal({ type: "Feature" })).toThrow();
    expect(() => validarMalhaMunicipal(null)).toThrow();
  });
});

describe("dados do mapa", () => {
  const dados = montarDadosDoMapa(PONTOS_DE_VISITA_PREVISTOS);

  test("desenha os 75 municípios de Sergipe", () => {
    expect(dados.municipios).toHaveLength(MUNICIPIOS_DE_SERGIPE);
  });

  /**
   * "Individualmente identificável" é o requisito do item 1 da tarefa: cada
   * município precisa de código único, geometria própria e um id de destino
   * que não colida com o de outro.
   */
  test("cada município é identificável individualmente", () => {
    const codigos = new Set<string>();
    const ids = new Set<string>();

    for (const municipio of dados.municipios) {
      expect(municipio.codigoIbge, municipio.nome).toMatch(/^28\d{5}$/);
      expect(municipio.caminho.startsWith("M"), municipio.nome).toBe(true);
      expect(municipio.caminho.endsWith("Z"), municipio.nome).toBe(true);
      codigos.add(municipio.codigoIbge);
      ids.add(idDaFicha(municipio.codigoIbge));
    }

    expect(codigos.size).toBe(MUNICIPIOS_DE_SERGIPE);
    expect(ids.size).toBe(MUNICIPIOS_DE_SERGIPE);
  });

  test("todo município tem nome acessível", () => {
    for (const municipio of dados.municipios) {
      const nome = nomeAcessivelDoMunicipio(municipio);
      expect(nome.length, municipio.codigoIbge).toBeGreaterThan(0);
      expect(nome).toContain(municipio.nome);
    }
  });

  /**
   * Nome de município não pode sair de lugar nenhum além da lista oficial do
   * IBGE. Este teste é a garantia de que ninguém "completou" um nome à mão.
   */
  test("todo nome vem da lista oficial do IBGE", () => {
    const oficiais = carregarNomesDeMunicipios();
    for (const municipio of dados.municipios) {
      expect(oficiais.get(municipio.codigoIbge)).toBe(municipio.nome);
    }
  });

  test("o Vale do Rio Real tem os cinco municípios definidos", () => {
    const vale = dados.municipios
      .filter((municipio) =>
        municipio.relacoesTerritoriais.includes("vale-rio-real"),
      )
      .map((municipio) => municipio.nome)
      .sort();

    expect(vale).toEqual([
      "Cristinápolis",
      "Itabaianinha",
      "Poço Verde",
      "Tobias Barreto",
      "Tomar do Geru",
    ]);
  });

  test("São Cristóvão não pertence ao Vale, nem no mapa", () => {
    const saoCristovao = dados.municipios.find(
      (municipio) => municipio.nome === "São Cristóvão",
    );
    expect(saoCristovao?.relacoesTerritoriais).not.toContain("vale-rio-real");
    expect(saoCristovao?.relacoesTerritoriais).toContain("comparacao");
    expect(saoCristovao?.relacoesTerritoriais).toContain("pesquisa-campo");
  });

  test("os 69 municípios fora do recorte não ganham vínculo", () => {
    const semVinculo = dados.municipios.filter(
      (municipio) => municipio.relacoesTerritoriais.length === 0,
    );
    expect(semVinculo).toHaveLength(
      MUNICIPIOS_DE_SERGIPE - RECORTE_TERRITORIAL.length,
    );
  });

  /**
   * Nenhum dos quatro pontos tem coordenada aprovada, então nenhum é
   * desenhado — e todos continuam listados. É o que impede que Serra dos
   * Macacos e Ilha Grande desapareçam do mapa em silêncio.
   */
  test("ponto sem coordenada não é desenhado, mas continua listado", () => {
    expect(dados.pontosPosicionados).toEqual([]);
    expect(dados.pontosSemPosicao).toHaveLength(4);
  });

  test("ponto com coordenada é posicionado dentro do viewBox", () => {
    const comCoordenada: PontoDeVisita = {
      ...pontoDeTeste,
      coordenadas: [-37.5, -10.5],
    };
    const comPonto = montarDadosDoMapa([comCoordenada]);

    expect(comPonto.pontosPosicionados).toHaveLength(1);
    const posicionado = comPonto.pontosPosicionados[0];
    expect(posicionado?.x).toBeGreaterThanOrEqual(0);
    expect(posicionado?.x).toBeLessThanOrEqual(comPonto.projecao.largura);
    expect(posicionado?.y).toBeGreaterThanOrEqual(0);
    expect(posicionado?.y).toBeLessThanOrEqual(comPonto.projecao.altura);
  });

  test("a projeção não é esticada: altura derivada da escala", () => {
    const { projecao } = dados;
    const vaoLon = projecao.envelope.lonMax - projecao.envelope.lonMin;
    const vaoLat = projecao.envelope.latMax - projecao.envelope.latMin;
    const latMedia =
      ((projecao.envelope.latMin + projecao.envelope.latMax) / 2) *
      (Math.PI / 180);
    const esperada =
      (vaoLat * projecao.largura) / (vaoLon * Math.cos(latMedia));

    expect(projecao.altura).toBeCloseTo(esperada, 6);
  });
});

describe("a malha recusa dado inconsistente com o recorte", () => {
  test("município do recorte ausente da malha derruba a montagem", () => {
    const malha = carregarMalhaMunicipal();
    const semTobias = {
      ...malha,
      features: malha.features.filter(
        (feature) => feature.properties.codarea !== "2807402",
      ),
    };
    // A malha truncada já reprova na validação de completude, que é a primeira
    // barreira; o teste registra que ela não passa em silêncio.
    expect(() => validarMalhaMunicipal(semTobias)).toThrow(/incompleta/);
  });
});
