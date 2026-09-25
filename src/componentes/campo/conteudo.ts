import {
  gruposB01NaOrdemTerritorial,
  mapaB01,
} from "../../dados/editorial/mapa-b01";
import { DERIVADOS_DOS_LUGARES } from "../../dados/pesquisa/derivados";
import {
  type IdDoLugar,
  REFERENCIAS_TERRITORIAIS,
} from "../../dados/territorio/referencias";

/**
 * Conteúdo do Diário de Campo.
 *
 * ## A divisão de trabalho, e por que ela não é arbitrária
 *
 * Três rotas tocam o campo, e cada uma responde a uma pergunta diferente:
 *
 * - `/pesquisa` — **como** se pesquisou: objetivo, instrumentos, percurso,
 *   quem foi ouvido, limites declarados;
 * - `/territorio` — **onde**: o recorte sobre a malha oficial, a posição
 *   confirmada de cada lugar, a ficha do material reunido em cada um;
 * - `/campo` — **o que ficou registrado**: as fotografias.
 *
 * Esta é a única superfície editorial do site onde o registro fotográfico
 * aparece como imagem e não como lista de links. O Acervo publica as 59
 * fotografias em dez grupos, mas as publica como um catálogo — uma linha por
 * arquivo, com endereço e hash —, que é o que um catálogo deve ser.
 *
 * Por isso esta página **não** repete as entrevistas: elas estão inteiras em
 * `/pesquisa`, com estado resolvido contra o acervo. Repetir a lista aqui
 * criaria duas superfícies afirmando o mesmo, que é como uma passa a divergir
 * da outra.
 *
 * ## Nenhuma contagem é escrita
 *
 * Lugares, grupos editoriais e fotografias saem de `mapaB01`, do recorte
 * territorial e dos manifestos de derivados. Nada aqui é digitado.
 */

export const SINTESE =
  "O registro fotográfico da pesquisa de campo: o que a equipe viu nos " +
  "lugares visitados, com legenda, crédito e procedência de cada imagem.";

export const ABERTURA: readonly string[] = [
  "Chegar a alguns destes lugares fez parte da pesquisa. Estrada de terra, ponte de madeira sobre riacho e, no caso de Ilha Grande, travessia de barco — o percurso não é anedota de bastidor, é condição de acesso ao equipamento cultural, e é uma das coisas que o campo veio medir.",
  "A visitação foi mensal, e é por isso que estas imagens existem. Entre uma visita e a seguinte a paisagem mudava: um museu que estava em obra abria à visitação, um terreno dos fundos virava área de observação da natureza, um chalé ganhava alicerce. O formulário registra quanto entrou e quanto saiu; a fotografia registra o que o formulário não alcança.",
  "Por isso as imagens abaixo são comprovação documental, e não ilustração. Cada uma tem texto alternativo, procedência declarada e crédito quando a autoria é de terceiro. As que aparecem aqui são uma seleção; o conjunto inteiro está no acervo, arquivo por arquivo.",
];

/** Slug do conjunto fotográfico no acervo. */
export const CONJUNTO_NO_ACERVO = "fotografias-visitas-i-vii";

/** Total de fotografias do conjunto, contado onde ele é declarado. */
export const FOTOGRAFIAS_NO_CONJUNTO = mapaB01.arquivos.length;

/** Grupos editoriais do conjunto, contados onde são declarados. */
export const GRUPOS_EDITORIAIS = mapaB01.grupos.length;

export const LUGARES_VISITADOS = REFERENCIAS_TERRITORIAIS.length;

export type FotoDoCampo = {
  readonly arquivo: string;
  /** Hash dos bytes servidos; é por ele que a foto encontra a sua ficha. */
  readonly sha256: string;
  readonly largura: number;
  readonly altura: number;
  readonly alt: string;
  readonly credito: string | null;
  /** ISO 8601, ou `null` quando nenhuma fonte data a fotografia. */
  readonly data: string | null;
};

export type BlocoDeLugar = {
  readonly id: IdDoLugar;
  readonly nome: string;
  readonly localidade: string;
  readonly municipio: string;
  readonly fotos: readonly FotoDoCampo[];
  /** Fotografias do lugar no conjunto público, incluindo as não exibidas. */
  readonly noConjunto: number;
};

/** Caminho público das fotografias já derivadas e versionadas. */
export const CAMINHO_DAS_FOTOS = "/media/pesquisa";

/**
 * Os lugares com o que existe de fotografia **local** para cada um.
 *
 * Só entram aqui derivados que o repositório já publica em
 * `public/media/pesquisa` — os mesmos bytes que a Home e o Território servem.
 * Buscar as 59 do acervo encheria a página de imagens remotas de até 800 kB
 * cada; servir outra codificação seria produzir uma segunda verdade sobre a
 * mesma fotografia.
 *
 * Lugar sem derivado local **não some**: ele aparece com a sua contagem no
 * conjunto e o caminho para o acervo. Omiti-lo afirmaria que não houve
 * registro, e houve.
 */
export function montarBlocosDeLugar(): readonly BlocoDeLugar[] {
  const locais: readonly (FotoDoCampo & { readonly lugar: IdDoLugar })[] = [
    ...DERIVADOS_DOS_LUGARES.map((foto) => ({
      arquivo: foto.arquivo,
      sha256: foto.sha256,
      largura: foto.largura,
      altura: foto.altura,
      alt: foto.alt,
      credito: foto.credito,
      data: foto.data,
      lugar: foto.lugar as IdDoLugar,
    })),
  ];

  return REFERENCIAS_TERRITORIAIS.map((referencia) => {
    const grupo = mapaB01.grupos.find(
      (candidato) => candidato.lugarCanonicoId === referencia.id,
    );
    return {
      id: referencia.id,
      nome: referencia.nome,
      localidade: referencia.localidade,
      municipio: referencia.municipio,
      fotos: locais
        .filter((foto) => foto.lugar === referencia.id)
        .map(({ arquivo, sha256, largura, altura, alt, credito, data }) => ({
          arquivo,
          sha256,
          largura,
          altura,
          alt,
          credito,
          data,
        })),
      noConjunto:
        grupo === undefined
          ? 0
          : mapaB01.arquivos.filter((item) => item.grupoId === grupo.id).length,
    };
  });
}

export type GrupoDoConjunto = {
  readonly id: string;
  readonly titulo: string;
  readonly natureza: "LUGAR" | "PESSOA" | "CONTEXTO_INSTITUCIONAL";
  readonly descricao: string | null;
  readonly fotografias: number;
};

/** Rótulo público de cada natureza editorial. Mesmo vocabulário do Acervo. */
export const ROTULO_DA_NATUREZA: Readonly<
  Record<GrupoDoConjunto["natureza"], string>
> = {
  LUGAR: "Lugar visitado",
  PESSOA: "Encontro de campo",
  CONTEXTO_INSTITUCIONAL: "Contexto institucional",
};

/** Os dez grupos editoriais, na ordem territorial que o Acervo já adota. */
export function montarGruposDoConjunto(): readonly GrupoDoConjunto[] {
  return gruposB01NaOrdemTerritorial().map((grupo) => ({
    id: grupo.id,
    titulo: grupo.tituloPublico,
    natureza: grupo.natureza,
    descricao: grupo.descricao,
    fotografias: mapaB01.arquivos.filter((item) => item.grupoId === grupo.id)
      .length,
  }));
}
