import type { MunicipioDoMapa } from "../../dados/territorio/mapa";
import type { IdDoLugar } from "../../dados/territorio/referencias";
import type { RelacaoTerritorial } from "../../dados/territorio/tipos";

/**
 * Alvos exploráveis do mapa da Home, e o texto editorial de cada um.
 *
 * A Home não transforma os 75 municípios de Sergipe em opções: o estado inteiro
 * é **contexto**. O que se explora são os recortes que o Observatório declarou e
 * os quatro lugares onde a pesquisa esteve em campo.
 *
 * ## Uma verdade editorial só
 *
 * Este arquivo é a **única** tabela que liga identificador territorial → rótulo
 * acessível → conteúdo da coluna. O mapa lê daqui o `aria-label` de cada opção;
 * a coluna lê daqui o sobretítulo, o título e os parágrafos. Não existe um
 * segundo lugar onde o nome de um alvo possa divergir do texto que ele abre.
 *
 * Município e localidade **não** são escritos aqui: vêm de `recorte.ts` e de
 * `referencias.ts`, que continuam sendo a fonte de quem pertence a quê.
 *
 * ## De onde sai o texto
 *
 * Das transcrições revisadas do PodObservar — a chamada e os episódios 01 a 03,
 * revisados em 18/09/2026. Nada aqui é cópia literal, e nada afirma o que as
 * transcrições não sustentam. Os lugares têm volumes diferentes de texto porque
 * têm volumes diferentes de fonte: Ilha Grande aparece uma vez, no EP01, e é
 * esse o tamanho da ficha dela. Simetria inventada seria dado fictício.
 *
 * Nenhuma pessoa é nomeada, como em toda a Home.
 */

export const RECORTES = ["vale", "comparacao"] as const;
export type Recorte = (typeof RECORTES)[number];

/** Identificador de qualquer alvo selecionável: um recorte ou um lugar. */
export type AlvoTerritorial = Recorte | IdDoLugar;

export type ConteudoEditorial = {
  readonly chave: AlvoTerritorial;
  /** Nome acessível da opção dentro do SVG. */
  readonly rotulo: string;
  /** Sobretítulo da coluna. */
  readonly sobretitulo: string;
  readonly titulo: string;
  readonly paragrafos: readonly string[];
};

export type DefinicaoDeRecorte = ConteudoEditorial & {
  readonly chave: Recorte;
  readonly relacao: RelacaoTerritorial;
};

/**
 * O que a coluna mostra antes de qualquer interação, e para onde ela volta
 * quando a seleção é limpa.
 *
 * É o Vale, e não um estado vazio: a seção se chama *Cartografia viva do Vale
 * do Rio Real*, e o Vale é o assunto dela. Um "selecione algo no mapa" como
 * primeiro texto entregaria a página em branco a quem chega — e, sem
 * JavaScript, entregaria para sempre.
 */
export const ALVO_PADRAO = "vale" satisfies AlvoTerritorial;

export const DEFINICOES: readonly DefinicaoDeRecorte[] = [
  {
    chave: "vale",
    relacao: "vale-rio-real",
    rotulo: "Recorte do Vale do Rio Real",
    sobretitulo: "Recorte do Vale do Rio Real",
    titulo: "Uma região que se reconhece pelo que circula nela",
    paragrafos: [
      "O Vale do Rio Real atravessa Sergipe e a Bahia. Suas cidades não se reconhecem vizinhas só por dividirem o mesmo rio — chamado Itanhi antes de a família real portuguesa acampar em suas margens —, mas por laços herdados dos povos originários e das antigas rotas de sertanejos e tropeiros.",
      "Cada uma entra no recorte com vocação própria: Tobias Barreto, tida na região como sua capital, é terra do bordado rechiliê; Itabaianinha se projeta pela moda; Poço Verde é celeiro agrícola; Tomar do Geru é o município das pedras; Cristinápolis guarda a memória dos Kiriris.",
      "Fazedores de cultura dos dois estados se articulam por conta própria, no Movimento Turístico Cultural do Vale do Rio Real. O Observatório pesquisa dentro desse recorte — não foi ele quem o desenhou.",
    ],
  },
  {
    chave: "comparacao",
    relacao: "comparacao",
    rotulo: "Referência de comparação, fora do Vale",
    sobretitulo: "Referência de comparação",
    titulo: "São Cristóvão, fora do Vale e dentro da pesquisa",
    paragrafos: [
      "São Cristóvão não pertence ao Vale. Entrou na pesquisa como terceiro ponto de comparação em políticas públicas de cultura: é a quarta cidade mais antiga do Brasil, tem centro histórico preservado pelo IPHAN e, com a retomada do FASC, seu festival de artes, voltou ao foco dos pesquisadores de cultura do estado.",
      "Foi de lá que a pesquisa seguiu de barco para Ilha Grande.",
    ],
  },
];

/**
 * Os quatro lugares de campo, na ordem em que o mapa os desenha.
 *
 * `municipio` e `localidade` não aparecem nos parágrafos: a coluna os lê de
 * `referencias.ts` e os mostra como linha própria. Repeti-los aqui criaria duas
 * respostas possíveis para a mesma pergunta.
 */
export const LUGARES_EDITORIAIS: readonly ConteudoEditorial[] = [
  {
    chave: "recanto-da-serra",
    rotulo: "Recanto da Serra, ponto de pesquisa",
    sobretitulo: "Ponto de pesquisa",
    titulo: "Recanto da Serra",
    paragrafos: [
      "Ecoparque e museu no povoado Jacaré, chegando aos vinte anos. É o equipamento que deu origem à pesquisa: funciona sem financiamento público ou privado e movimenta a economia ao redor — alimento da região, artesanato, serviços e trabalho de moradores.",
      "Recebe escolas em visitas de estudo do meio, entre trilhas, museus a céu aberto e uma biblioteca de literatura nordestina. Está em fase final de formalização como organização social sem fins lucrativos.",
    ],
  },
  {
    chave: "borda-da-mata",
    rotulo: "Museu Borda da Mata, ponto de pesquisa",
    sobretitulo: "Ponto de pesquisa",
    titulo: "Museu Borda da Mata",
    paragrafos: [
      "Centro cultural e museu erguidos dentro da casa de uma família, no povoado Borda da Mata. Na Garagem Cultural, discos, livros e varais de cordel guardam a memória do lugar; ao lado, a Casa de Taipa Cineasta Dida Araújo preserva a cultura do campo.",
      "No período do levantamento, o espaço recebeu onze visitantes em cinco meses — e ainda assim ampliou estrutura e acervo. A visita é por agendamento.",
    ],
  },
  {
    chave: "serra-dos-macacos",
    rotulo: "Serra dos Macacos, ponto de pesquisa",
    sobretitulo: "Ponto de pesquisa",
    titulo: "Serra dos Macacos",
    paragrafos: [
      "Comunidade agrícola entre serras, na tríplice fronteira com Simão Dias e Poço Verde. O caminho passa por Caraíba, Caripau e Congongui e cruza uma ponte de madeira sobre o Riacho do Caripau, de menos de cinco anos: antes dela, a cheia interrompia o percurso das crianças para a escola.",
      "É uma das raras áreas preservadas de Mata Atlântica e abriga o Sítio Arqueológico de Pedra Grande, protegido pelo IPHAN, com pinturas rupestres de povos ameríndios nômades. A pesquisa se encerrou ali, numa oficina de equipamento cultural com a própria comunidade.",
    ],
  },
  {
    chave: "ilha-grande",
    rotulo: "Ilha Grande, ponto de pesquisa",
    sobretitulo: "Ponto de pesquisa",
    titulo: "Ilha Grande",
    paragrafos: [
      "Povoação de São Cristóvão, de rica cultura pesqueira, onde a mestra da comunidade mantém viva a tradição do samba de coco. Chegar até lá foi travessia de barco.",
      "Entrou no percurso porque a página oficial da prefeitura o apresentava como território ecoturístico, de preservação do samba de coco e aberto à visitação. Foi essa apresentação que levou a pesquisa até ele.",
    ],
  },
];

/** Todos os alvos selecionáveis, na ordem em que o mapa os oferece. */
export const ALVOS_EDITORIAIS: readonly ConteudoEditorial[] = [
  ...DEFINICOES,
  ...LUGARES_EDITORIAIS,
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

/**
 * A qual recorte um município pertence.
 *
 * `comparacao` vem primeiro de propósito: São Cristóvão tem também
 * `pesquisa-campo`, e em nenhuma hipótese ele pode cair no recorte do Vale.
 */
export function recorteDoMunicipio(
  relacoes: readonly RelacaoTerritorial[],
): Recorte | undefined {
  if (relacoes.includes("comparacao")) return "comparacao";
  if (relacoes.includes("vale-rio-real")) return "vale";
  return undefined;
}
