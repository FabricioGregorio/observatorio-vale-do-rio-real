/**
 * Relações entre peças do site — declaradas, nunca inferidas.
 *
 * ## A pergunta que cada relação responde
 *
 * "Por que estas duas coisas estão ligadas?" A resposta precisa estar num
 * dado que o site já publica, e é por isso que este módulo quase não declara
 * nada: ele lê as relações que já existem e só as reúne.
 *
 * - entrevista → instituição ou lugar, município e registro da escuta:
 *   `ENTREVISTAS` e `REGISTROS_DA_ESCUTA`, as mesmas de `/pesquisa`;
 * - documento → lugar: `MATERIAIS_POR_LUGAR`, a mesma das fichas de lugar;
 * - fotografia → lugar: o grupo do mapa B01 e o `lugarCanonicoId` dele;
 * - fotografia → data do registro: o manifesto dos derivados, pela
 *   igualdade de SHA-256 com o objeto publicado — a mesma data que
 *   `/campo` e a Home já exibem;
 * - documento → Dados: `CONJUNTO_NO_ACERVO` e `FONTES_DESTACADAS` de `/dados`;
 * - conjunto fotográfico → Diário de Campo: `CONJUNTO_NO_ACERVO` de `/campo`.
 *
 * A única tabela nova é `RELACOES_DOS_EPISODIOS`, porque o snapshot dos
 * episódios não tem campo de relação. Cada linha carrega a `evidencia`: o
 * trecho literal do resumo publicado do episódio que a sustenta. Um teste
 * confere que o trecho está lá. Palavra que só aparece na transcrição não
 * vira relação.
 *
 * Não há similaridade de texto, etiqueta, nem recomendação: relação que não
 * se prova fica de fora.
 */
import { CONJUNTO_NO_ACERVO as CONJUNTO_FOTOGRAFICO } from "../../componentes/campo/conteudo";
import {
  CONJUNTO_NO_ACERVO as CONJUNTO_DOS_INDICADORES,
  FONTES_DESTACADAS,
} from "../../componentes/dados/conteudo";
import { ENTREVISTAS } from "../../componentes/home/conteudo";
import { REGISTROS_DA_ESCUTA } from "../../componentes/pesquisa/conteudoDaPesquisa";
import type { AnexoPublico } from "../anexo-publico";
import {
  ancoraDoLugarNoCampo,
  fichaNoAcervo,
  type IdDoLugarDeCampo,
  MATERIAIS_POR_LUGAR,
} from "../materiais-de-campo";
import { DERIVADOS_DOS_LUGARES } from "../pesquisa/derivados";
import { REFERENCIAS_TERRITORIAIS } from "../territorio/referencias";
import { mapaB01 } from "./mapa-b01";

export type Relacionado = {
  /** Que tipo de ligação é — "Lugar", "Episódio", "Pesquisa". */
  readonly categoria: string;
  readonly rotulo: string;
  readonly href: string;
};

export type LinhaDeContexto = {
  readonly termo: string;
  readonly valor: string;
};

/** O mínimo de um episódio publicado que uma relação precisa. */
export type EpisodioDeReferencia = {
  readonly slug: string;
  readonly temporadaNumero: number;
  readonly numero: number;
  readonly titulo: string;
  readonly resumo: string;
};

export function hrefDoEpisodio(episodio: EpisodioDeReferencia): string {
  return `/podobservar/t${episodio.temporadaNumero}/${episodio.slug}`;
}

type RelacaoDeEpisodio =
  | {
      readonly tipo: "lugar";
      readonly lugar: IdDoLugarDeCampo;
      readonly evidencia: string;
    }
  | {
      readonly tipo: "documento";
      readonly documento: string;
      readonly evidencia: string;
    }
  | {
      readonly tipo: "pagina";
      readonly categoria: string;
      readonly rotulo: string;
      readonly href: string;
      readonly evidencia: string;
    };

/**
 * O que cada episódio publicado apresenta, pelo resumo publicado dele.
 *
 * O resumo vem do bloco "Tema:" do PDF de cada episódio
 * (`podobservar-temporada-1.ts`), e é o texto que a página do episódio já
 * exibe. A entrevista ligada ao EP02 e ao EP03 é a do Acervo com a mesma
 * pessoa e o mesmo lugar que o resumo nomeia — `ENTREVISTAS` liga o
 * documento ao lugar.
 */
export const RELACOES_DOS_EPISODIOS: Readonly<
  Record<string, readonly RelacaoDeEpisodio[]>
> = {
  "01-o-que-e-o-vale-do-rio-real": [
    {
      tipo: "pagina",
      categoria: "Observatório",
      rotulo: "O Observatório",
      href: "/observatorio",
      evidencia:
        "apresenta o Observatório de Cultura e Economia Criativa da Região do Vale do Rio Real",
    },
    {
      tipo: "pagina",
      categoria: "Pesquisa",
      rotulo: "A Pesquisa",
      href: "/pesquisa",
      evidencia: "deu origem à pesquisa",
    },
  ],
  "02-conheca-o-recanto-da-serra": [
    {
      tipo: "lugar",
      lugar: "recanto-da-serra",
      evidencia: "Ecoparque e Museu Recanto da Serra",
    },
    {
      tipo: "documento",
      documento: "entrevista-pedro-menezes",
      evidencia: "Pedro Menezes",
    },
    {
      tipo: "pagina",
      categoria: "Pesquisa",
      rotulo: "O método da pesquisa",
      href: "/pesquisa#pq-metodo-titulo",
      evidencia: "apresenta o método de pesquisa do Observatório",
    },
  ],
  "03-conheca-o-museu-borda-da-mata": [
    {
      tipo: "lugar",
      lugar: "borda-da-mata",
      evidencia: "Centro Cultural e Museu Borda da Mata",
    },
    {
      tipo: "documento",
      documento: "entrevista-oviedo-e-neide-abreu",
      evidencia: "Neide e Oviêdo Abreu",
    },
  ],
  "04-entre-dados-e-fatos": [
    {
      tipo: "pagina",
      categoria: "Dados",
      rotulo: "Dados",
      href: "/dados",
      evidencia: "análise dos dados coletados",
    },
    {
      tipo: "lugar",
      lugar: "serra-dos-macacos",
      evidencia: "Serra dos Macacos",
    },
  ],
};

function referencia(id: string) {
  const lugar = REFERENCIAS_TERRITORIAIS.find((r) => r.id === id);
  if (lugar === undefined)
    throw new Error(`Relações: lugar sem referência ${id}.`);
  return lugar;
}

function lugarNoCampo(id: IdDoLugarDeCampo): Relacionado {
  return {
    categoria: "Lugar",
    rotulo: `${referencia(id).nome} no Diário de Campo`,
    href: ancoraDoLugarNoCampo(id),
  };
}

/**
 * O que um episódio apresenta, já resolvido contra o que está publicado:
 * documento sem ficha pública não vira link.
 */
export function relacionadosDoEpisodio(
  slug: string,
  titulosPublicados: ReadonlyMap<string, string>,
): Relacionado[] {
  return (RELACOES_DOS_EPISODIOS[slug] ?? []).flatMap((relacao) => {
    if (relacao.tipo === "lugar") return [lugarNoCampo(relacao.lugar)];
    if (relacao.tipo === "pagina")
      return [
        {
          categoria: relacao.categoria,
          rotulo: relacao.rotulo,
          href: relacao.href,
        },
      ];
    const titulo = titulosPublicados.get(relacao.documento);
    return titulo === undefined
      ? []
      : [
          {
            categoria: "Entrevista",
            rotulo: titulo,
            href: fichaNoAcervo(relacao.documento),
          },
        ];
  });
}

/** Lugares que declaram este documento entre os seus materiais. */
function lugaresDoDocumento(slug: string): IdDoLugarDeCampo[] {
  return (
    Object.entries(MATERIAIS_POR_LUGAR) as [
      IdDoLugarDeCampo,
      (typeof MATERIAIS_POR_LUGAR)[IdDoLugarDeCampo],
    ][]
  )
    .filter(([, materiais]) => materiais.some((m) => m.documento === slug))
    .map(([id]) => id);
}

function unicos(valores: readonly string[]): string[] {
  return [...new Set(valores)];
}

/**
 * Contexto de uma ficha de documento: o que se sabe dele por dado
 * estruturado, e as páginas ligadas a ele por relação declarada.
 *
 * Nada aqui é resumo, biografia ou interpretação. Documento sem dado
 * estruturado — a identidade visual, por exemplo — volta vazio, e a ficha
 * mostra só o que já mostrava.
 */
export function contextoDoDocumento(
  slug: string,
  episodios: readonly EpisodioDeReferencia[],
  arquivos: readonly Pick<AnexoPublico, "rotuloArquivo">[] = [],
): { linhas: LinhaDeContexto[]; relacionados: Relacionado[] } {
  const linhas: LinhaDeContexto[] = [];
  const relacionados: Relacionado[] = [];

  const entrevista = ENTREVISTAS.find((e) => e.documento === slug);
  const registro = REGISTROS_DA_ESCUTA.find((r) => r.documentos.includes(slug));
  if (entrevista !== undefined) {
    linhas.push({
      termo: registro?.id === "gestao" ? "Instituição" : "Lugar",
      valor: entrevista.onde,
    });
    if (entrevista.municipio !== null)
      linhas.push({ termo: "Município", valor: entrevista.municipio });
    if (registro !== undefined)
      linhas.push({ termo: "Escuta", valor: registro.titulo });
  }

  const lugares = lugaresDoDocumento(slug);
  if (slug === CONJUNTO_FOTOGRAFICO) {
    linhas.push({
      termo: "Lugares",
      valor: lugares.map((id) => referencia(id).nome).join(" · "),
    });
    linhas.push({
      termo: "Municípios",
      valor: unicos(lugares.map((id) => referencia(id).municipio)).join(" · "),
    });
    relacionados.push({
      categoria: "Diário de Campo",
      rotulo: "As fotografias, lugar a lugar",
      href: "/campo",
    });
  } else if (lugares.length > 0) {
    if (entrevista === undefined) {
      linhas.push({
        termo: lugares.length === 1 ? "Lugar" : "Lugares",
        valor: lugares
          .map((id) => `${referencia(id).nome} (${referencia(id).localidade})`)
          .join(" · "),
      });
      linhas.push({
        termo: "Município",
        valor: unicos(lugares.map((id) => referencia(id).municipio)).join(
          " · ",
        ),
      });
    }
    relacionados.push(...lugares.map(lugarNoCampo));
  }

  if (entrevista !== undefined)
    relacionados.push({
      categoria: "Pesquisa",
      rotulo: "Quem a pesquisa ouviu",
      href: "/pesquisa#pq-escuta-titulo",
    });

  for (const episodio of episodios)
    if (
      (RELACOES_DOS_EPISODIOS[episodio.slug] ?? []).some(
        (r) => r.tipo === "documento" && r.documento === slug,
      )
    )
      relacionados.push({
        categoria: "Episódio",
        rotulo: episodio.titulo,
        href: hrefDoEpisodio(episodio),
      });

  const fonteDeDados =
    slug === CONJUNTO_DOS_INDICADORES ||
    arquivos.some((a) =>
      FONTES_DESTACADAS.some((f) => f.rotulo === a.rotuloArquivo),
    );
  if (fonteDeDados)
    relacionados.push({
      categoria: "Dados",
      rotulo: "Os indicadores e as fontes em Dados",
      href: "/dados#dd-fontes-titulo",
    });

  return { linhas, relacionados };
}

/**
 * Ficha pública de uma fotografia exibida localmente (Diário de Campo).
 *
 * A correspondência é por identidade de bytes: o SHA-256 do derivado servido
 * pelo site é o mesmo do objeto publicado no Acervo (o mapa B01 guarda esse
 * hash e a publicação o confere). Além disso, o grupo da fotografia no mapa
 * precisa ser o mesmo lugar em que ela aparece. Faltando qualquer das duas
 * coisas, não há link — nunca por semelhança de nome de arquivo.
 */
export function fichaDaFotografiaExibida(
  foto: { readonly sha256: string; readonly lugar: string },
  anexos: readonly Pick<
    AnexoPublico,
    "slug" | "arquivoId" | "previewArquivoId"
  >[],
): { readonly href: string; readonly titulo: string } | null {
  const entrada = mapaB01.arquivos.find((item) => item.sha256 === foto.sha256);
  if (entrada === undefined) return null;
  const grupo = mapaB01.grupos.find((g) => g.id === entrada.grupoId);
  if (grupo?.lugarCanonicoId !== foto.lugar) return null;
  const publico = anexos.find(
    (a) =>
      a.slug === CONJUNTO_FOTOGRAFICO &&
      (a.previewArquivoId ?? a.arquivoId) === entrada.arquivoId,
  );
  return publico === undefined
    ? null
    : {
        href: `/acervo/${CONJUNTO_FOTOGRAFICO}/arquivo/${publico.arquivoId}`,
        titulo: entrada.tituloPublico,
      };
}

/**
 * Contexto de uma fotografia do conjunto: lugar ou grupo, e a data do
 * registro quando o manifesto a traz para a mesma imagem.
 *
 * `registro` é a data em que a fotografia foi feita; a data de publicação é
 * outra coisa, e continua vindo do arquivo publicado. As duas nunca se
 * substituem.
 */
export function contextoDaFotografia(arquivo: {
  readonly arquivoId: string;
  readonly previewArquivoId?: string | null | undefined;
}): {
  linhas: LinhaDeContexto[];
  registro: string | null;
  relacionados: Relacionado[];
} {
  const entrada = mapaB01.arquivos.find(
    (item) =>
      item.arquivoId === (arquivo.previewArquivoId ?? arquivo.arquivoId),
  );
  const grupo = mapaB01.grupos.find((g) => g.id === entrada?.grupoId);
  const linhas: LinhaDeContexto[] = [];
  const relacionados: Relacionado[] = [];
  if (grupo?.natureza === "LUGAR" && grupo.lugarCanonicoId !== null) {
    const lugar = referencia(grupo.lugarCanonicoId);
    linhas.push({
      termo: "Lugar",
      valor: `${lugar.nome} (${lugar.localidade})`,
    });
    linhas.push({ termo: "Município", valor: lugar.municipio });
    relacionados.push(lugarNoCampo(grupo.lugarCanonicoId));
  } else if (grupo !== undefined) {
    linhas.push({ termo: "Grupo no conjunto", valor: grupo.tituloPublico });
  }
  const derivado =
    entrada === undefined
      ? undefined
      : DERIVADOS_DOS_LUGARES.find((d) => d.sha256 === entrada.sha256);
  return { linhas, registro: derivado?.data ?? null, relacionados };
}
