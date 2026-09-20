import type { Route } from "next";

import type { AnexoPublico } from "../../dados/consultas/anexos";
import { tipoPublico } from "../../dados/editorial/tipos-publicos";
import {
  FIM_DA_COLETA,
  INDICADORES,
  INICIO_DA_COLETA,
  MESES_DE_COLETA,
} from "../../dados/indicadores/derivados";
import { MATERIAIS_POR_LUGAR } from "../../dados/materiais-de-campo";
import { RECORTE_TERRITORIAL } from "../../dados/territorio/recorte";

/**
 * Conteúdo da Prestação de Contas.
 *
 * ## A regra que organiza este arquivo
 *
 * **Nada que possa ser derivado é escrito.** Número de documentos, de
 * arquivos, de indicadores, de lugares de campo e de municípios sai das
 * estruturas que já os declaram — a view pública, o dataset de indicadores, a
 * tabela de materiais por lugar, o recorte territorial. O que fica escrito
 * aqui é só o que nenhuma estrutura contém: as frases.
 *
 * O motivo é o de sempre nesta base, e aqui ele é mais caro que o usual. Uma
 * página de prestação de contas que afirme "16 documentos" num parágrafo e
 * liste 15 na tabela abaixo não tem um defeito de interface: tem uma
 * divergência entre duas afirmações públicas sobre execução de recurso
 * público.
 *
 * ## O que esta página não afirma
 *
 * Não afirma situação financeira, valor executado, saldo, parecer, aprovação
 * nem encerramento de prestação de contas. Nada disso está documentalmente
 * confirmado no corpus do projeto, e afirmar qualquer um deles seria
 * exatamente o dado fictício que o `AGENTS.md` proíbe. A página afirma o que
 * o site pode provar: o que foi entregue, onde está e como conferir.
 */

export {
  ACOMPANHAMENTO,
  COLETIVO,
  EDITAL,
  EDITAL_CURTO,
  LINHA_DO_EDITAL,
  NOME_OFICIAL,
} from "../home/conteudo";

/** `2025-07-21` → `21/07/2025`. Mesma forma de exibição do módulo de dados. */
function exibirData(iso: string): string {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

export const PERIODO_DE_COLETA = `${exibirData(INICIO_DA_COLETA)} a ${exibirData(FIM_DA_COLETA)}`;

/** Os quatro lugares visitados em campo, contados onde eles são declarados. */
export const LUGARES_DE_CAMPO = Object.keys(MATERIAIS_POR_LUGAR).length;

/** Municípios do recorte, em Sergipe — sem a referência de comparação. */
export const MUNICIPIOS_DO_RECORTE = RECORTE_TERRITORIAL.filter((municipio) =>
  municipio.relacoesTerritoriais.includes("vale-rio-real"),
).length;

export const INDICADORES_AUDITADOS = INDICADORES.length;

export const SINTESE =
  "O que o projeto entregou, onde cada entrega está publicada e como conferir " +
  "a integridade de cada arquivo — sem login, sem pedido de acesso e sem " +
  "endereço que dependa de conta de terceiro.";

/**
 * Por que a página existe, em três parágrafos.
 *
 * O primeiro é o risco que o doc 01 §0.2 identifica como o maior do projeto; o
 * segundo é a resposta arquitetural a ele; o terceiro é o limite do que a
 * página afirma, dito antes que alguém precise perguntar.
 */
export const POR_QUE: readonly string[] = [
  "Projetos financiados por edital costumam comprovar execução com uma lista de endereços de pasta compartilhada, formulário e painel de protótipo. Esses endereços mudam de permissão, quebram e não sobrevivem a uma consulta feita dois anos depois — que é justamente quando uma prestação de contas costuma ser reaberta.",
  "Aqui cada arquivo tem endereço próprio neste domínio, data de publicação e hash SHA-256. O mesmo inventário existe em formato legível por máquina e em versão imprimível, e a tabela ao fim desta página é gerada do registro de publicação, não digitada.",
  "O que esta página não faz: ela não declara situação financeira, parecer técnico nem prestação de contas encerrada. Nenhuma dessas informações está documentalmente confirmada, e um site de comprovação é o pior lugar possível para uma afirmação aproximada.",
];

export type Entrega = {
  readonly id: string;
  readonly titulo: string;
  /** Medida da entrega, derivada. `null` quando não há o que contar. */
  readonly medida: string | null;
  readonly texto: string;
  readonly href: Route;
  readonly acao: string;
};

/**
 * Entregas realizadas, com a medida de cada uma derivada da sua própria fonte.
 *
 * A função recebe o que só existe em build — o acervo resolvido e os episódios
 * públicos — e devolve a lista completa. Nada é contado duas vezes: o número
 * de documentos vem da consulta, o de indicadores do dataset, o de lugares da
 * tabela de materiais e o de municípios do recorte territorial.
 *
 * Contagem ausente vira `null`, e a ficha aparece sem medida. Numa compilação
 * sem `DATABASE_URL` isso é o esperado; escrever "0 documentos" seria afirmar
 * que o acervo está vazio, que é outra coisa.
 */
export function montarEntregas({
  documentos,
  arquivos,
  episodios,
}: {
  readonly documentos: number;
  readonly arquivos: number;
  readonly episodios: number;
}): readonly Entrega[] {
  return [
    {
      id: "campo",
      titulo: "Pesquisa de campo",
      medida: `${LUGARES_DE_CAMPO} lugares · ${MESES_DE_COLETA} meses de coleta`,
      texto:
        "Visitas continuadas a equipamentos culturais e turísticos do recorte, com relatório técnico, entrevistas gravadas, formulários e registro fotográfico por lugar.",
      href: "/pesquisa",
      acao: "Ver o percurso da pesquisa",
    },
    {
      id: "indicadores",
      titulo: "Levantamento de indicadores",
      medida: `${INDICADORES_AUDITADOS} indicadores auditados`,
      texto:
        "Cada indicador é publicado com a regra de cálculo, a base sobre a qual foi apurado, o período e o recorte. Nenhum valor aparece sem o seu denominador.",
      href: "/dados",
      acao: "Consultar os dados",
    },
    {
      id: "territorio",
      titulo: "Cartografia do recorte",
      medida: `${MUNICIPIOS_DO_RECORTE} municípios`,
      texto:
        "O recorte territorial sobre a malha oficial de Sergipe, com os lugares visitados em campo na posição confirmada e a ficha do material reunido em cada um.",
      href: "/territorio",
      acao: "Abrir a cartografia",
    },
    {
      id: "acervo",
      titulo: "Acervo documental público",
      medida:
        documentos === 0
          ? null
          : `${documentos} documentos · ${arquivos} arquivos`,
      texto:
        "Relatórios técnicos, planilhas de resposta, anexo de indicadores, fotografias de campo, entrevistas e peças de identidade, cada arquivo com endereço permanente.",
      href: "/acervo",
      acao: "Percorrer o acervo",
    },
    {
      id: "podobservar",
      titulo: "PodObservar",
      medida: episodios === 0 ? null : `${episodios} episódios publicados`,
      texto:
        "O podcast do Observatório, com transcrição revisada e integral de cada episódio — áudio sem transcrição vinculada não é publicado aqui.",
      href: "/podobservar",
      acao: "Ouvir e ler os episódios",
    },
    {
      id: "site",
      titulo: "Site público do Observatório",
      medida: null,
      texto:
        "O repositório permanente e a peça de divulgação da pesquisa: o que o Observatório é, o que investigou e o que encontrou, em domínio próprio.",
      href: "/observatorio",
      acao: "Conhecer o Observatório",
    },
  ];
}

/**
 * Entregáveis e validações ainda pendentes.
 *
 * Enquanto o Caderno de Estudos não existir, ele aparece **como pendência
 * declarada** — plano §1. Nenhum conteúdo provisório é criado e nenhuma data
 * é escrita: não há previsão documentada no corpus, e inventar uma seria pior
 * do que a ausência. Uma prestação de contas que omite a própria lacuna é o
 * que produz ressalva.
 *
 * O manual de aplicação de marcas saiu desta lista em 2026-09-20: os três
 * manuais oficiais foram localizados, lidos e aplicados, e a régua de marcas
 * que esta mesma página exibe desmentia, na tela seguinte, a pendência
 * declarada aqui. Ver `institucional/creditos.ts`.
 */
export const PENDENCIAS_DECLARADAS: readonly {
  readonly item: string;
  readonly texto: string;
}[] = [
  {
    item: "Caderno de Estudos",
    texto:
      "Entregável administrativo previsto e ainda não produzido. Não recebe link provisório nem versão de ocasião, e nenhuma data de entrega está declarada no material do projeto.",
  },
];

export type GrupoDocumental = {
  readonly tipo: string;
  readonly documentos: number;
  readonly arquivos: number;
};

/**
 * Documentos públicos agrupados por tipo, para a visão de conjunto.
 *
 * O rótulo de cada tipo vem de `editorial/tipos-publicos.ts`, o mesmo que o
 * Acervo usa — duas traduções do mesmo enum seriam duas listas para manter.
 * A ordem é por volume, e o desempate é alfabético para que a saída seja
 * estável entre compilações.
 */
export function agruparPorTipo(
  anexos: readonly AnexoPublico[],
): readonly GrupoDocumental[] {
  const porSlug = new Map<string, { tipo: string; arquivos: number }>();
  for (const anexo of anexos) {
    const registro = porSlug.get(anexo.slug);
    if (registro) registro.arquivos += 1;
    else
      porSlug.set(anexo.slug, {
        tipo: tipoPublico(anexo.tipo, anexo.slug),
        arquivos: 1,
      });
  }

  const porTipo = new Map<string, { documentos: number; arquivos: number }>();
  for (const { tipo, arquivos } of porSlug.values()) {
    const registro = porTipo.get(tipo) ?? { documentos: 0, arquivos: 0 };
    registro.documentos += 1;
    registro.arquivos += arquivos;
    porTipo.set(tipo, registro);
  }

  return [...porTipo.entries()]
    .map(([tipo, contagem]) => ({ tipo, ...contagem }))
    .sort((a, b) => b.arquivos - a.arquivos || a.tipo.localeCompare(b.tipo));
}
