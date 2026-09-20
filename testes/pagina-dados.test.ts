import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

import {
  ADVERTENCIA_DE_AMOSTRA,
  ATIVIDADES,
  CONTEXTO_DOS_DADOS,
  FONTES_DESTACADAS,
  INDICADORES,
  LIMITES,
  NOTA_DA_SERIE,
  PERIODO,
  RECORTE,
  RETENCAO_RECALCULADA,
} from "../src/componentes/dados/conteudo";

/**
 * `/dados` — invariantes da página, não do dataset.
 *
 * O dataset já tem suíte própria em `testes/indicadores.test.ts`, que confere
 * a aritmética, a conciliação da série e a ausência de identificador restrito
 * nos campos renderizáveis. O que se protege aqui é o que a **página** faz com
 * ele: não reescrever número, não soltar percentual do denominador, não
 * publicar procedência e não apresentar a amostra como se fosse o Vale.
 */

const FONTES_DE_CODIGO = ["src/componentes/dados", "src/app/dados"] as const;

function arquivos(pasta: string): string[] {
  return readdirSync(pasta, { withFileTypes: true }).flatMap((entrada) => {
    const caminho = join(pasta, entrada.name);
    if (entrada.isDirectory()) return arquivos(caminho);
    return /\.tsx?$/.test(entrada.name) ? [caminho] : [];
  });
}

/** Comentário não vai para o HTML; a trava olha o código servido. */
function semComentarios(fonte: string): string {
  return fonte.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");
}

const CODIGO = FONTES_DE_CODIGO.flatMap((pasta) =>
  arquivos(pasta).map((caminho) => ({
    caminho,
    fonte: semComentarios(readFileSync(caminho, "utf8")),
  })),
);

describe("a amostra é declarada antes de qualquer número", () => {
  test("a advertência nomeia o limite da leitura", () => {
    expect(ADVERTENCIA_DE_AMOSTRA).toContain("não descrevem o Vale");
    expect(ADVERTENCIA_DE_AMOSTRA).toContain("Tobias Barreto");
  });

  test("os oito indicadores declaram o mesmo recorte, que é o que a capa serve", () => {
    const recortes = new Set(INDICADORES.map((indicador) => indicador.recorte));
    expect(recortes.size).toBe(1);
    expect(RECORTE).toBe(INDICADORES[0]?.recorte);
    expect(RECORTE).not.toBe("");
  });

  test("nenhum limite ficou sem corpo", () => {
    expect(LIMITES.length).toBeGreaterThanOrEqual(3);
    for (const limite of LIMITES) {
      expect(limite.titulo.length, limite.titulo).toBeGreaterThan(8);
      expect(limite.texto.length, limite.titulo).toBeGreaterThan(80);
    }
  });

  /*
    Guarda de conteúdo rejeitado, e não de redação aprovada. A revisão
    editorial de 2026-09-20 tirou daqui um item genérico — "Como ler estes
    dados" — que repetia, em linguagem vaga, o que os outros três dizem com
    precisão. Travar o texto dele palavra por palavra prenderia a página a uma
    formulação que a própria equipe recusou; o que precisa ficar travado é o
    que não pode voltar.
  */
  test("os limites nomeiam o recorte, e o item genérico não volta", () => {
    const titulos = LIMITES.map((limite) => limite.titulo);
    expect(titulos).not.toContain("Como ler estes dados");
    expect(titulos).not.toContain(
      "Nem tudo o que a fonte calcula foi publicado",
    );

    const corpo = LIMITES.map((limite) => limite.texto).join(" ");
    expect(corpo).toContain("Recanto da Serra");
    expect(corpo).toContain("Borda da Mata");
    expect(corpo).toContain("baixa visitação");
  });
});

describe("nenhum número é reescrito pela página", () => {
  /*
    A retenção é recalculada a partir das duas pontas da despesa identificada,
    para que as três grandezas exibidas lado a lado não possam divergir. Se o
    recálculo deixar de bater com o indicador publicado, é a página que está
    mentindo, e não o dataset.
  */
  test("a retenção recalculada bate com o indicador publicado", () => {
    const publicado = INDICADORES.find(
      (indicador) => indicador.id === "H4-001",
    );
    expect(publicado).toBeDefined();
    expect(RETENCAO_RECALCULADA).toBeCloseTo(publicado?.valorBruto ?? -1, 9);
  });

  test("período e nota da série derivam das datas da coleta", () => {
    expect(PERIODO).toBe("21/07/2025 a 21/12/2025");
    expect(NOTA_DA_SERIE).toContain(PERIODO);
  });

  test("o módulo de conteúdo não escreve valor monetário nem percentual", () => {
    const fonte = CODIGO.find(({ caminho }) =>
      caminho.endsWith(join("dados", "conteudo.ts")),
    );
    expect(fonte).toBeDefined();
    expect(fonte?.fonte).not.toMatch(/R\$\s?\d/);
    expect(fonte?.fonte).not.toMatch(/\d+,\d+\s?%/);
    expect(fonte?.fonte).not.toMatch(/\b1[456]\.\d{3},\d{2}\b/);
  });
});

describe("percentual nunca aparece sem denominador", () => {
  test("toda atividade cabe dentro dos registros de funcionamento", () => {
    for (const atividade of ATIVIDADES) {
      expect(atividade.diasComAtividade, atividade.nome).toBeLessThanOrEqual(
        CONTEXTO_DOS_DADOS.registrosDeFuncionamento,
      );
    }
  });

  test("a tabela de atividades escreve a base ao lado da proporção", () => {
    const fonte = CODIGO.find(({ caminho }) =>
      caminho.endsWith("Atividades.tsx"),
    );
    expect(fonte?.fonte).toContain("formatarPercentual(proporcao)");
    expect(fonte?.fonte).toContain("totalDeRegistros");
  });
});

describe("procedência interna não alcança o HTML", () => {
  /*
    `procedencia` nomeia aba, linha e código da fonte de cálculo. O cabeçalho
    de `indicadores/derivados.ts` proíbe publicá-los, e a proibição precisa
    valer também para quem consome o dataset — é a página que renderiza.
  */
  test.each(["procedencia", "codigoNaFonte", "sha256DaFonte", "conferencia"])(
    "nenhum arquivo de /dados referencia %s",
    (campo) => {
      const reincidentes = CODIGO.filter(({ fonte }) =>
        fonte.includes(campo),
      ).map(({ caminho }) => caminho);
      expect(reincidentes).toEqual([]);
    },
  );
});

describe("as fontes destacadas são declaradas, e resolvidas depois", () => {
  test("nenhum rótulo se repete", () => {
    const rotulos = FONTES_DESTACADAS.map((fonte) => fonte.rotulo);
    expect(new Set(rotulos).size).toBe(rotulos.length);
  });

  test("cada rótulo vem com uma descrição própria", () => {
    for (const fonte of FONTES_DESTACADAS) {
      expect(fonte.descricao.length, fonte.rotulo).toBeGreaterThan(30);
    }
  });

  /*
    A planilha integral de indicadores fica fora do destaque enquanto a
    contradição entre o cabeçalho de `derivados.ts` — que a declara restrita
    por nomear pessoas — e a publicação dela no acervo não for resolvida por
    decisão humana. Ela continua acessível pela ficha do conjunto.
  */
  test("a planilha integral não é destacada nesta página", () => {
    const rotulos = FONTES_DESTACADAS.map((fonte) => fonte.rotulo);
    expect(rotulos).not.toContain("A11 — planilha de indicadores, 17 abas");
  });

  test("nenhum link é construído por convenção de nome", () => {
    for (const { caminho, fonte } of CODIGO) {
      expect(fonte, caminho).not.toContain("acervo.observatoriotobiassoueu");
      expect(fonte, caminho).not.toContain("/arquivos/");
    }
  });
});
