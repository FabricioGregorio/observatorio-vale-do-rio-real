/**
 * Materiais de campo dos quatro lugares — fonte única de estado.
 *
 * ## Por que este módulo existe
 *
 * Até 2026-09-16 o estado de cada material estava escrito duas vezes à mão:
 * em `homelivre/conteudo.ts`, para as fichas da Home, e em
 * `territoriovivo/lugares.ts`, para as fichas do Território. Duas listas
 * separadas divergem, e num site de prestação de contas divergir significa
 * afirmar que algo é público onde não é — ou o contrário.
 *
 * Aqui só se **declara** qual documento do inventário sustenta cada material.
 * Se aquele documento tem arquivo público em `vw_anexo_publico`, o material é
 * público e ganha o link real; se não tem, ele conserva o estado declarado
 * como fallback. Nenhum estado `publico` pode existir sem URL correspondente,
 * porque o estado é calculado a partir da URL, não ao lado dela.
 *
 * Este módulo é puro: quem consulta o banco é `consultas/anexos.ts`, em build.
 */

export type EstadoDoMaterial = "publico" | "restrito" | "pendente";

export const ROTULO_DO_ESTADO: Readonly<Record<EstadoDoMaterial, string>> = {
  publico: "Público",
  restrito: "Restrito",
  pendente: "Em revisão",
};

export type IdDoLugarDeCampo =
  | "recanto-da-serra"
  | "borda-da-mata"
  | "serra-dos-macacos"
  | "ilha-grande";

/** Um objeto físico público de um documento, como a view o devolve. */
export type ArquivoPublicado = {
  readonly url: string;
  readonly rotulo: string | null;
  readonly principal: boolean;
  readonly mimeType: string;
  readonly bytes: number;
};

/** Arquivos públicos indexados pelo slug do documento. */
export type ArquivosPublicados = ReadonlyMap<
  string,
  readonly ArquivoPublicado[]
>;

/**
 * Declaração de um material: o rótulo editorial, os documentos que o
 * sustentam e o estado que ele mantém enquanto nenhum deles estiver público.
 */
export type MaterialDeclarado = {
  readonly material: string;
  readonly documentos: readonly string[];
  readonly estadoSemPublicacao: Exclude<EstadoDoMaterial, "publico">;
};

/** Material já resolvido contra o que está publicado. */
export type MaterialResolvido = {
  readonly material: string;
  readonly estado: EstadoDoMaterial;
  /** Só existe para material público. */
  readonly href: string | null;
  /** Quantos objetos físicos públicos sustentam este material. */
  readonly arquivosPublicos: number;
};

/**
 * O que cada lugar reuniu, por documento do inventário canônico.
 *
 * Os slugs são os de `documento.slug`; a correspondência com os códigos A/B/D
 * está no inventário (`inventario-de-anexos.xlsx`, coluna `Slug proposto`).
 */
export const MATERIAIS_POR_LUGAR: Readonly<
  Record<IdDoLugarDeCampo, readonly MaterialDeclarado[]>
> = {
  "recanto-da-serra": [
    {
      material: "Relatório técnico",
      documentos: ["relatorio-tecnico-recanto-da-serra"],
      estadoSemPublicacao: "restrito",
    },
    {
      material: "Entrevista gravada",
      documentos: ["entrevista-pedro-menezes"],
      estadoSemPublicacao: "restrito",
    },
    {
      material: "Formulários de funcionamento e de visitantes",
      documentos: [
        "formulario-rotina-de-funcionamento",
        "formulario-publico-consumidor",
      ],
      estadoSemPublicacao: "restrito",
    },
    {
      material: "Fotografias de campo",
      documentos: ["fotografias-visitas-i-vii"],
      estadoSemPublicacao: "pendente",
    },
  ],
  "borda-da-mata": [
    {
      material: "Relatório técnico",
      documentos: ["relatorio-tecnico-borda-da-mata"],
      estadoSemPublicacao: "restrito",
    },
    {
      material: "Entrevista gravada",
      documentos: ["entrevista-oviedo-e-neide-abreu"],
      estadoSemPublicacao: "restrito",
    },
    {
      material: "Formulários de funcionamento e de visitantes",
      documentos: [
        "formulario-rotina-de-funcionamento",
        "formulario-publico-consumidor",
      ],
      estadoSemPublicacao: "restrito",
    },
    {
      material: "Fotografias de campo",
      documentos: ["fotografias-visitas-i-vii"],
      estadoSemPublicacao: "pendente",
    },
  ],
  // A Serra dos Macacos foi visitada, mas não é equipamento acompanhado: o
  // relato técnico é o único material do acervo que a descreve.
  "serra-dos-macacos": [
    {
      material: "Relato técnico (A04)",
      documentos: ["relatorio-tecnico-serra-dos-macacos"],
      estadoSemPublicacao: "restrito",
    },
  ],
  "ilha-grande": [
    {
      material: "Entrevista gravada",
      documentos: ["entrevista-lideranca-ilha-grande"],
      estadoSemPublicacao: "restrito",
    },
    {
      material: "Fotografias de campo",
      documentos: ["fotografias-visitas-i-vii"],
      estadoSemPublicacao: "pendente",
    },
  ],
};

/**
 * Link preferido de um documento: o arquivo `principal` quando existe, senão
 * o primeiro da view, que já vem ordenada. Nunca devolve uma URL inventada.
 */
export function linkPreferido(
  arquivos: readonly ArquivoPublicado[],
): string | null {
  return (arquivos.find((a) => a.principal) ?? arquivos[0])?.url ?? null;
}

/** Âncora do documento no Acervo, na forma que `ListaMateriaisPublicos` gera. */
export function ancoraNoAcervo(slug: string): string {
  return `/acervo#acervo-${slug}`;
}

/**
 * Resolve a declaração contra o que está efetivamente publicado.
 *
 * Um material com vários arquivos e nenhum `principal` — as 59 fotografias de
 * campo são o caso — **não** aponta para um arquivo qualquer. Apontaria para o
 * primeiro da ordenação, que é uma foto do Borda da Mata mesmo na ficha do
 * Recanto: um link tecnicamente válido e editorialmente falso. Nesse caso o
 * destino é o conjunto no Acervo, onde os 59 aparecem agrupados.
 */
export function resolverMaterial(
  declarado: MaterialDeclarado,
  publicados: ArquivosPublicados,
): MaterialResolvido {
  const comArquivos = declarado.documentos.filter(
    (slug) => (publicados.get(slug) ?? []).length > 0,
  );
  const arquivos = comArquivos.flatMap((slug) => publicados.get(slug) ?? []);
  const primeiro = comArquivos[0];
  let href: string | null = null;
  if (primeiro !== undefined) {
    const temPrincipal = arquivos.some((a) => a.principal);
    href =
      arquivos.length === 1 || temPrincipal
        ? linkPreferido(arquivos)
        : ancoraNoAcervo(primeiro);
  }
  return {
    material: declarado.material,
    estado: href === null ? declarado.estadoSemPublicacao : "publico",
    href,
    arquivosPublicos: arquivos.length,
  };
}

export function resolverMateriaisDoLugar(
  id: IdDoLugarDeCampo,
  publicados: ArquivosPublicados,
): readonly MaterialResolvido[] {
  return MATERIAIS_POR_LUGAR[id].map((d) => resolverMaterial(d, publicados));
}
