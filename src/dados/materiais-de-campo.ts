/**
 * Materiais de campo dos quatro lugares — fonte única de estado.
 *
 * ## Por que este módulo existe
 *
 * Até 2026-09-16 o estado de cada material estava escrito duas vezes à mão:
 * em `componentes/home/conteudo.ts`, para as fichas da Home, e em
 * `territoriovivo/lugares.ts`, para as fichas do Território. Duas listas
 * separadas divergem, e num site de prestação de contas divergir significa
 * afirmar que algo é público onde não é — ou o contrário.
 *
 * Aqui só se **declara** qual documento do inventário sustenta cada material.
 * Se aquele documento tem arquivo público em `acervo.json`, o material é
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
 * Declaração de um material: o rótulo editorial, o documento que o sustenta e
 * o estado que ele mantém enquanto o documento não estiver público.
 *
 * Um material, um documento. Até 2026-09-25 "Formulários de funcionamento e
 * de visitantes" declarava dois documentos e entregava um só destino — o
 * primeiro —, e o rótulo prometia o que o clique não dava. Dois documentos são
 * dois materiais, cada um com o seu destino.
 *
 * `destino` diz onde o material é consultado no site:
 *
 * - `ficha` (padrão): a ficha do documento no Acervo, que oferece os arquivos
 *   reais — abrir, baixar, ouvir, ler a transcrição.
 * - `campo`: a seção do lugar no Diário de Campo. Serve às fotografias, cujo
 *   conjunto reúne os quatro lugares: a ficha do conjunto não é "as
 *   fotografias deste lugar", e a seção do lugar em `/campo` é.
 */
export type MaterialDeclarado = {
  readonly material: string;
  readonly documento: string;
  readonly estadoSemPublicacao: Exclude<EstadoDoMaterial, "publico">;
  readonly destino?: "ficha" | "campo";
};

/** Material já resolvido contra o que está publicado. */
export type MaterialResolvido = {
  readonly material: string;
  readonly estado: EstadoDoMaterial;
  /**
   * Só existe para material público. É sempre uma página do site — a ficha
   * do documento ou a seção do lugar —, nunca o binário: quem clica no nome
   * de um material escolhe ali o que abrir.
   */
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
      documento: "relatorio-tecnico-recanto-da-serra",
      estadoSemPublicacao: "restrito",
    },
    {
      material: "Entrevista gravada",
      documento: "entrevista-pedro-menezes",
      estadoSemPublicacao: "restrito",
    },
    {
      material: "Respostas de funcionamento",
      documento: "formulario-rotina-de-funcionamento",
      estadoSemPublicacao: "restrito",
    },
    {
      material: "Respostas de visitantes",
      documento: "formulario-publico-consumidor",
      estadoSemPublicacao: "restrito",
    },
    {
      material: "Fotografias de campo",
      documento: "fotografias-visitas-i-vii",
      estadoSemPublicacao: "pendente",
      destino: "campo",
    },
  ],
  "borda-da-mata": [
    {
      material: "Relatório técnico",
      documento: "relatorio-tecnico-borda-da-mata",
      estadoSemPublicacao: "restrito",
    },
    {
      material: "Entrevista gravada",
      documento: "entrevista-oviedo-e-neide-abreu",
      estadoSemPublicacao: "restrito",
    },
    {
      material: "Respostas de funcionamento",
      documento: "formulario-rotina-de-funcionamento",
      estadoSemPublicacao: "restrito",
    },
    {
      material: "Respostas de visitantes",
      documento: "formulario-publico-consumidor",
      estadoSemPublicacao: "restrito",
    },
    {
      material: "Fotografias de campo",
      documento: "fotografias-visitas-i-vii",
      estadoSemPublicacao: "pendente",
      destino: "campo",
    },
  ],
  // A Serra dos Macacos foi visitada, mas não é equipamento acompanhado: o
  // relato técnico a descreve, e as oito fotografias do lugar estão no
  // conjunto fotográfico publicado em 2026-09-18.
  "serra-dos-macacos": [
    {
      material: "Relato técnico (A04)",
      documento: "relatorio-tecnico-serra-dos-macacos",
      estadoSemPublicacao: "restrito",
    },
    {
      material: "Fotografias de campo",
      documento: "fotografias-visitas-i-vii",
      estadoSemPublicacao: "pendente",
      destino: "campo",
    },
  ],
  "ilha-grande": [
    {
      material: "Entrevista gravada",
      documento: "entrevista-lideranca-ilha-grande",
      estadoSemPublicacao: "restrito",
    },
    {
      material: "Fotografias de campo",
      documento: "fotografias-visitas-i-vii",
      estadoSemPublicacao: "pendente",
      destino: "campo",
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

/** Ficha pública do documento no Acervo — a rota que `/acervo/[documento]` gera. */
export function fichaNoAcervo(slug: string): string {
  return `/acervo/${slug}`;
}

/**
 * Seção do lugar no Diário de Campo.
 *
 * `/campo` monta a seção com este id e o título com o sufixo `-titulo`; a
 * âncora aponta para o título, que é o que existe com `id` na página. As duas
 * pontas leem daqui, e por isso não têm como divergir — como divergiram a
 * âncora do Acervo e a lista que a gerava, removida sem que o link soubesse.
 */
export function secaoDoLugarNoCampo(id: IdDoLugarDeCampo): string {
  return `campo-${id}`;
}

export function ancoraDoLugarNoCampo(id: IdDoLugarDeCampo): string {
  return `/campo#${secaoDoLugarNoCampo(id)}-titulo`;
}

/**
 * Resolve a declaração contra o que está efetivamente publicado.
 *
 * O destino é sempre uma página do site, nunca o binário. Um rótulo como
 * "Entrevista gravada" levava direto ao PDF da transcrição — o arquivo
 * `principal` do documento —, e quem queria ouvir caía num texto. A ficha
 * oferece o áudio e a transcrição lado a lado, com abrir e baixar.
 *
 * As fotografias levam à seção do lugar em `/campo`, e não ao conjunto: as 59
 * reúnem os quatro lugares, e "Fotografias de campo" na ficha do Recanto é
 * uma promessa sobre o Recanto.
 */
export function resolverMaterial(
  declarado: MaterialDeclarado,
  publicados: ArquivosPublicados,
  lugar: IdDoLugarDeCampo | null = null,
): MaterialResolvido {
  const arquivos = publicados.get(declarado.documento) ?? [];
  let href: string | null = null;
  if (arquivos.length > 0) {
    href =
      declarado.destino === "campo" && lugar !== null
        ? ancoraDoLugarNoCampo(lugar)
        : fichaNoAcervo(declarado.documento);
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
  return MATERIAIS_POR_LUGAR[id].map((d) =>
    resolverMaterial(d, publicados, id),
  );
}
