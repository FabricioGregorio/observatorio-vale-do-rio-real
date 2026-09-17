import type { DadosDoMapa, MunicipioDoMapa } from "../../dados/territorio/mapa";
import type { RelacaoTerritorial } from "../../dados/territorio/tipos";

/**
 * Recortes exploráveis do mapa da Home.
 *
 * A Home não transforma os 75 municípios de Sergipe em opções: o estado inteiro
 * é **contexto**, e o que se explora são os recortes que o Observatório
 * declarou. São dois, e a distinção entre eles é editorial antes de ser
 * visual — São Cristóvão foi pesquisado como referência de comparação e não
 * pertence ao Vale, o que precisa continuar inequívoco nos dois estados.
 *
 * O enquadramento de cada recorte é calculado **em tempo de build**, a partir
 * da mesma geometria já projetada. Em runtime não há cálculo geométrico
 * nenhum: a ilha troca um atributo e o CSS aplica a transformação pronta.
 */

export const RECORTES = ["vale", "comparacao"] as const;
export type Recorte = (typeof RECORTES)[number];

export type DefinicaoDeRecorte = {
  readonly chave: Recorte;
  /** Nome acessível da opção no mapa. */
  readonly rotulo: string;
  /** Título do painel contextual. */
  readonly titulo: string;
  /** Uma frase; nenhuma copy nova de campanha. */
  readonly resumo: string;
  readonly relacao: RelacaoTerritorial;
};

export const DEFINICOES: readonly DefinicaoDeRecorte[] = [
  {
    chave: "vale",
    relacao: "vale-rio-real",
    rotulo: "Recorte do Vale do Rio Real",
    titulo: "Recorte do Vale do Rio Real",
    resumo:
      "Os municípios que o Observatório reúne sob o recorte do Vale. Não é divisão administrativa oficial.",
  },
  {
    chave: "comparacao",
    relacao: "comparacao",
    rotulo: "Referência de comparação, fora do Vale",
    titulo: "Referência de comparação",
    resumo:
      "Pesquisado como comparação de políticas públicas, não como parte do Vale.",
  },
];

/** Municípios de um recorte, na ordem em que a malha os entrega. */
export function municipiosDoRecorte(
  municipios: readonly MunicipioDoMapa[],
  recorte: DefinicaoDeRecorte,
): readonly MunicipioDoMapa[] {
  return municipios.filter((municipio) =>
    municipio.relacoesTerritoriais.includes(recorte.relacao),
  );
}

type Caixa = { minX: number; minY: number; maxX: number; maxY: number };

/**
 * Caixa envolvente de um conjunto de caminhos.
 *
 * O `d` produzido por `caminhoDaGeometria` é só `M`/`L`/`Z` com coordenadas já
 * projetadas — ler os números com uma expressão regular é exato aqui, e evita
 * carregar a geometria de origem uma segunda vez.
 */
function caixaDos(caminhos: readonly string[]): Caixa | null {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  let houve = false;

  for (const caminho of caminhos) {
    const numeros = caminho.match(/-?\d+(?:\.\d+)?/g);
    if (numeros === null) continue;
    for (let i = 0; i + 1 < numeros.length; i += 2) {
      const x = Number(numeros[i]);
      const y = Number(numeros[i + 1]);
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
      houve = true;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }

  return houve ? { minX, minY, maxX, maxY } : null;
}

/**
 * Ampliação máxima. Sem teto, um recorte pequeno viraria um salto de escala
 * desproporcional — e o pedido é reenquadramento moderado, não voo de câmera.
 */
const ESCALA_MAXIMA = 3.2;

/** Folga ao redor do recorte, para ele não encostar na borda do desenho. */
const FOLGA = 1.35;

/** Centro da caixa envolvente de um caminho. Basta para posicionar rótulo. */
export function centroDoCaminho(
  caminho: string,
): { x: number; y: number } | null {
  const caixa = caixaDos([caminho]);
  if (caixa === null) return null;
  return {
    x: Math.round(((caixa.minX + caixa.maxX) / 2) * 10) / 10,
    y: Math.round(((caixa.minY + caixa.maxY) / 2) * 10) / 10,
  };
}

/** Corpo do rótulo em unidades de usuário, antes da ampliação do recorte. */
const CORPO_DO_ROTULO = 26;

export type EnquadramentoDoRecorte = {
  /** Valor pronto de `transform`, guardado numa custom property. */
  readonly transformacao: string;
  /**
   * Corpo do rótulo já dividido pela ampliação. Sem isso o nome do município
   * cresceria junto com o mapa e cobriria o desenho que ele deveria explicar.
   */
  readonly corpoDoRotulo: number;
};

/**
 * Transformação CSS que reenquadra o palco sobre um recorte.
 *
 * Volta pronta como valor de `transform`, guardada numa custom property.
 *
 * Quem recebe a transformação é o invólucro HTML do desenho, e não um `<g>`
 * dentro do SVG: transformar elemento HTML tem comportamento previsível em
 * qualquer motor, e transiciona sem surpresa. Por isso o deslocamento sai em
 * **porcentagem do próprio quadro** — a porcentagem se resolve contra a
 * caixa do invólucro, que é exatamente o desenho, e o resultado independe da
 * largura em que a página for servida.
 *
 * `transform-origin` é o canto superior esquerdo, então a conta é a de
 * sempre: escala, e depois desloca o centro do recorte para o centro do
 * desenho.
 */
export function enquadramentoDoRecorte(
  dados: DadosDoMapa,
  recorte: DefinicaoDeRecorte,
): EnquadramentoDoRecorte | null {
  const membros = municipiosDoRecorte(dados.municipios, recorte);
  const caixa = caixaDos(membros.map((municipio) => municipio.caminho));
  if (caixa === null) return null;

  const largura = Math.max(caixa.maxX - caixa.minX, 1) * FOLGA;
  const altura = Math.max(caixa.maxY - caixa.minY, 1) * FOLGA;
  const escala = Math.min(
    ESCALA_MAXIMA,
    dados.projecao.largura / largura,
    dados.projecao.altura / altura,
  );

  const centroX = (caixa.minX + caixa.maxX) / 2;
  const centroY = (caixa.minY + caixa.maxY) / 2;
  const x = dados.projecao.largura / 2 - escala * centroX;
  const y = dados.projecao.altura / 2 - escala * centroY;

  const arredondar = (valor: number) => Math.round(valor * 100) / 100;
  const porCento = (valor: number, total: number) =>
    arredondar((valor / total) * 100);

  return {
    transformacao: `translate(${porCento(x, dados.projecao.largura)}%, ${porCento(y, dados.projecao.altura)}%) scale(${arredondar(escala)})`,
    corpoDoRotulo: Math.round((CORPO_DO_ROTULO / escala) * 10) / 10,
  };
}
