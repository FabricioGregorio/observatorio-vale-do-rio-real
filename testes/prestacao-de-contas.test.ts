import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

import {
  PENDENCIA_DAS_MARCAS,
  REGUA_DE_CREDITOS,
} from "../src/componentes/institucional/creditos";
import {
  agruparPorTipo,
  INDICADORES_AUDITADOS,
  LUGARES_DE_CAMPO,
  MUNICIPIOS_DO_RECORTE,
  montarEntregas,
  PENDENCIAS_DECLARADAS,
  POR_QUE,
  SINTESE,
} from "../src/componentes/prestacao/conteudo";
import type { AnexoPublico } from "../src/dados/consultas/anexos";
import { INDICADORES } from "../src/dados/indicadores/derivados";
import { MATERIAIS_POR_LUGAR } from "../src/dados/materiais-de-campo";

/**
 * `/prestacao-de-contas` — invariantes da página de comprovação.
 *
 * Esta é a página do doc 01 §4, a que a FUNCAP abre. O que os testes abaixo
 * protegem não é composição: é a diferença entre comprovar e afirmar. Uma
 * página de prestação de contas que declare aprovação não documentada, ou que
 * exiba um número divergente do inventário que ela mesma lista, produz
 * ressalva — e ressalva aqui é consequência financeira, não bug de interface.
 */

const FONTES = {
  rota: "src/app/prestacao-de-contas/page.tsx",
  conteudo: "src/componentes/prestacao/conteudo.ts",
  creditos: "src/componentes/institucional/creditos.ts",
  regua: "src/componentes/institucional/ReguaDeCreditos.tsx",
  rodape: "src/componentes/layout/Rodape.tsx",
} as const;

function ler(caminho: string): string {
  return readFileSync(caminho, "utf8");
}

/** Fonte sem comentário: as regras olham o que a página **serve**. */
function semComentarios(fonte: string): string {
  return fonte
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, " ")
    .replace(/^\s*\/\/.*$/gm, " ");
}

/** Um anexo mínimo: só os campos que o agrupamento lê. */
function anexo(
  slug: string,
  tipo: string,
  id: string,
): Pick<AnexoPublico, "slug" | "tipo" | "arquivoId"> {
  return { slug, tipo, arquivoId: id };
}

const AMOSTRA = [
  anexo("relatorio-a", "relatorio_tecnico", "1"),
  anexo("relatorio-b", "relatorio_tecnico", "2"),
  anexo("anexo-indicadores-etapa-1", "painel_dados", "3"),
  anexo("anexo-indicadores-etapa-1", "painel_dados", "4"),
  anexo("anexo-indicadores-etapa-1", "painel_dados", "5"),
  anexo("fotografias-visitas-i-vii", "outro", "6"),
] as unknown as readonly AnexoPublico[];

describe("agrupamento do acervo por natureza", () => {
  test("conta documento uma vez e arquivo por objeto", () => {
    const grupos = agruparPorTipo(AMOSTRA);
    const porTipo = new Map(grupos.map((g) => [g.tipo, g]));

    expect(porTipo.get("Relatório técnico")).toEqual({
      tipo: "Relatório técnico",
      documentos: 2,
      arquivos: 2,
    });
    expect(porTipo.get("Dados e indicadores")).toEqual({
      tipo: "Dados e indicadores",
      documentos: 1,
      arquivos: 3,
    });
  });

  /*
    O rótulo do conjunto fotográfico não sai do enum: ele é a exceção que
    `tipos-publicos.ts` trata por slug. Se a página tivesse a sua própria
    tradução, esta linha apareceria como "outro".
  */
  test("usa o mesmo vocabulário público do Acervo", () => {
    const tipos = agruparPorTipo(AMOSTRA).map((g) => g.tipo);
    expect(tipos).toContain("Registro fotográfico");
    expect(tipos).not.toContain("outro");
  });

  /**
   * A soma dos documentos agrupados é a contagem que a página exibe. Se ela
   * divergisse do total de arquivos listados na tabela, a página afirmaria
   * duas coisas diferentes sobre o mesmo acervo.
   */
  test("a soma dos grupos fecha com a entrada", () => {
    const grupos = agruparPorTipo(AMOSTRA);
    const arquivos = grupos.reduce((soma, g) => soma + g.arquivos, 0);
    const documentos = grupos.reduce((soma, g) => soma + g.documentos, 0);
    expect(arquivos).toBe(AMOSTRA.length);
    expect(documentos).toBe(new Set(AMOSTRA.map((a) => a.slug)).size);
  });

  test("acervo vazio não inventa grupo", () => {
    expect(agruparPorTipo([])).toEqual([]);
  });
});

describe("entregas derivadas, nunca escritas", () => {
  const entregas = montarEntregas({
    documentos: 16,
    arquivos: 109,
    episodios: 3,
  });

  test("toda medida vem da estrutura que a declara", () => {
    expect(LUGARES_DE_CAMPO).toBe(Object.keys(MATERIAIS_POR_LUGAR).length);
    expect(INDICADORES_AUDITADOS).toBe(INDICADORES.length);
    expect(MUNICIPIOS_DO_RECORTE).toBeGreaterThan(0);

    const acervo = entregas.find((e) => e.id === "acervo");
    expect(acervo?.medida).toBe("16 documentos · 109 arquivos");
  });

  /*
    Compilação sem `DATABASE_URL` devolve acervo vazio. "0 documentos" seria
    uma afirmação — a de que o acervo está vazio —, e é outra coisa. A ficha
    aparece sem medida.
  */
  test("contagem ausente vira ficha sem medida, não zero exibido", () => {
    const vazias = montarEntregas({
      documentos: 0,
      arquivos: 0,
      episodios: 0,
    });
    expect(vazias.find((e) => e.id === "acervo")?.medida).toBeNull();
    expect(vazias.find((e) => e.id === "podobservar")?.medida).toBeNull();
    for (const entrega of vazias) {
      expect(entrega.medida ?? "").not.toMatch(/\b0\b/);
    }
  });

  test("cada entrega aponta para uma superfície do próprio site", () => {
    for (const entrega of entregas) {
      expect(entrega.href, entrega.id).toMatch(/^\/[a-z-]+$/);
      expect(entrega.acao.length, entrega.id).toBeGreaterThan(0);
    }
    expect(new Set(entregas.map((e) => e.id)).size).toBe(entregas.length);
  });
});

describe("a página não afirma o que não pode provar", () => {
  const PUBLICO = [
    SINTESE,
    ...POR_QUE,
    ...PENDENCIAS_DECLARADAS.map((p) => `${p.item} ${p.texto}`),
    ...montarEntregas({ documentos: 16, arquivos: 109, episodios: 3 }).map(
      (e) => `${e.titulo} ${e.texto} ${e.acao}`,
    ),
    PENDENCIA_DAS_MARCAS,
  ].join(" | ");

  /**
   * Situação financeira e administrativa não está documentada em lugar nenhum
   * do corpus. Afirmá-la seria o dado fictício que o `AGENTS.md` proíbe, na
   * página onde ele custa mais caro.
   *
   * Os padrões são **afirmativos** de propósito. A página diz, em voz alta,
   * que não declara parecer nem prestação encerrada — e uma regra que
   * procurasse a palavra solta reprovaria justamente a frase que estabelece o
   * limite. O que não pode existir é a afirmação, não o termo.
   */
  test.each([
    /\b(foi|está|encontra-se)\s+(aprovad|homologad)/i,
    /prestação de contas\s+(está|foi|encontra-se)\s+(aprovada|encerrada|concluída)/i,
    /parecer\s+(favorável|técnico aprovado|de aprovação)/i,
    /\bsaldo\b/i,
    /\bvalor executado\b/i,
    /\bR\$\s?\d/,
  ])("nenhum texto público afirma %s", (padrao) => {
    expect(PUBLICO).not.toMatch(padrao);
  });

  /*
    A contrapartida da regra acima: o limite precisa continuar dito. Sem esta
    linha, apagar o parágrafo faria a suíte inteira passar.
  */
  test("o limite do que a página afirma continua escrito", () => {
    expect(POR_QUE.join(" ")).toMatch(
      /não declara situação financeira, parecer técnico nem prestação de contas encerrada/i,
    );
  });

  test("a lacuna do Caderno de Estudos continua declarada", () => {
    const caderno = PENDENCIAS_DECLARADAS.find(
      (p) => p.item === "Caderno de Estudos",
    );
    expect(caderno).toBeDefined();
    // Nenhuma data de entrega é escrita: não existe previsão documentada.
    expect(caderno?.texto).not.toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  /**
   * Número escrito à mão na rota é a falha que esta página não pode ter: ele
   * envelhece sem quebrar nada. Toda contagem exibida vem do módulo de
   * conteúdo, que a deriva.
   */
  test("a rota não escreve contagem própria", () => {
    const servido = semComentarios(ler(FONTES.rota));
    expect(servido).not.toMatch(/>\s*\d+\s+(documentos|arquivos|anexos)/);
    expect(servido).toContain("agruparPorTipo");
    expect(servido).toContain("montarEntregas");
  });
});

describe("régua de créditos institucionais", () => {
  const ordem = REGUA_DE_CREDITOS.map((n) => n.id);

  /**
   * A ordem é normativa, não composição: decisão humana registrada na tarefa
   * 16 §2, item 5, e manual federal §8.3 — ascendente em importância, com a
   * assinatura federal por último.
   */
  test("a ordem é a da decisão vigente", () => {
    expect(ordem).toEqual(["realizacao", "apoio", "politica", "federal"]);
  });

  test("a assinatura federal fecha a régua", () => {
    const ultimo = REGUA_DE_CREDITOS.at(-1);
    expect(ultimo?.id).toBe("federal");
    expect(ultimo?.instituicoes.at(-1)).toBe("Governo Federal");
  });

  /*
    O separador é o do selo de programa de governo. Ele existe entre a PNAB e
    a assinatura federal, e em nenhum outro lugar.
  */
  test("só a assinatura federal recebe separador", () => {
    const comSeparador = REGUA_DE_CREDITOS.filter((n) => n.separadorAntes);
    expect(comSeparador.map((n) => n.id)).toEqual(["federal"]);
  });

  test("Governo de Sergipe, e não a Secretaria", () => {
    const nomes = REGUA_DE_CREDITOS.flatMap((n) => n.instituicoes).join(" | ");
    expect(nomes).toContain("Governo de Sergipe");
    expect(nomes).not.toMatch(/Secretaria/i);
  });

  test("PNAB e FUNCAP aparecem com a grafia documentada", () => {
    const nomes = REGUA_DE_CREDITOS.flatMap((n) => n.instituicoes);
    expect(nomes).toContain("PNAB / Lei Aldir Blanc");
    expect(nomes).toContain(
      "FUNCAP — Fundação de Cultura e Arte Aperipê de Sergipe",
    );
  });

  /**
   * O manual de aplicação de marcas segue pendente, e nenhuma marca oficial
   * entra por estimativa. A régua é texto: se um `<img>` aparecer aqui, a
   * pendência foi resolvida por interpretação, que é exatamente o que não
   * pode acontecer com marca institucional.
   */
  test("nenhuma marca oficial é aplicada pela régua", () => {
    const fonte = ler(FONTES.regua);
    expect(fonte).not.toMatch(/<img/);
    expect(fonte).not.toMatch(/\.(svg|png|webp|jpe?g)/i);
  });

  test("a pendência do manual continua declarada na superfície", () => {
    expect(PENDENCIA_DAS_MARCAS).toMatch(/manual/i);
    expect(PENDENCIA_DAS_MARCAS).toMatch(/pendente/i);
    expect(semComentarios(ler(FONTES.regua))).toContain("PENDENCIA_DAS_MARCAS");
  });

  /*
    O rodapé compartilhado publica a mesma régua, e não uma segunda lista de
    nomes institucionais. Duas grafias do mesmo fomento em duas superfícies é
    divergência, não duplicação inofensiva.
  */
  test("o rodapé usa a régua, e não uma lista própria", () => {
    const fonte = semComentarios(ler(FONTES.rodape));
    expect(fonte).toContain("ReguaDeCreditos");
    expect(fonte).not.toMatch(/FUNCAP|PNAB|Ministério da Cultura/);
  });

  test("o nome do projeto não é redigitado na régua", () => {
    const fonte = semComentarios(ler(FONTES.creditos));
    expect(fonte).toContain('from "../home/conteudo"');
    expect(fonte).not.toContain("Observatório de Cultura e Economia Criativa");
  });
});
