import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

import {
  ENTREVISTAS,
  entrevistasPublicas,
} from "../src/componentes/home/conteudo";
import {
  MUNICIPIOS_DE_COMPARACAO,
  MUNICIPIOS_DO_VALE,
  O_QUE_FAZ,
  ORIGEM,
  PERMANENCIA,
  PRODUTOS,
  TERRITORIO,
  VINCULOS,
} from "../src/componentes/observatorio/conteudo";
import {
  ATOR_CHAVE,
  ESCUTA,
  INSTRUMENTOS,
  LEITURA,
  LIMITES,
  NOTA_DOS_MESES,
  OBJETIVO,
  PERCURSO,
  PERIODO_DA_COLETA,
} from "../src/componentes/pesquisa/conteudoDaPesquisa";
import type { ArquivosPublicados } from "../src/dados/materiais-de-campo";

/**
 * `/observatorio` e `/pesquisa` — invariantes editoriais do Lote 1.
 *
 * O que estes testes protegem não é layout: é a diferença entre uma página
 * institucional e um placeholder plausível. Num site de prestação de contas,
 * texto de ocasião é problema de integridade da pesquisa, não de UI
 * do produto.
 */

const FONTES = {
  observatorio: "src/componentes/observatorio/conteudo.ts",
  pesquisa: "src/componentes/pesquisa/conteudoDaPesquisa.ts",
  rotaObservatorio: "src/app/observatorio/page.tsx",
  rotaPesquisa: "src/app/pesquisa/page.tsx",
} as const;

function ler(caminho: string): string {
  return readFileSync(caminho, "utf8");
}

/**
 * Fonte sem comentário.
 *
 * As regras abaixo olham o que a página **serve**, e comentário não é
 * servido. Sem esta limpeza, um bloco de documentação que cite a data da
 * coleta ou a frase de restrição reprovaria a própria explicação de por que
 * elas não podem aparecer no conteúdo.
 */
function semComentarios(fonte: string): string {
  return fonte
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, " ")
    .replace(/^\s*\/\/.*$/gm, " ");
}

/** Todo texto que as duas páginas servem, num array só. */
const TEXTOS_PUBLICOS: readonly string[] = [
  ...O_QUE_FAZ.map((p) => `${p.verbo} ${p.texto}`),
  ...ORIGEM.flatMap((m) => [m.quando, m.titulo, ...m.paragrafos]),
  ...VINCULOS.map((v) => `${v.papel} ${v.nome} ${v.texto}`),
  ...TERRITORIO,
  ...PRODUTOS.map((p) => `${p.nome} ${p.texto} ${p.acao}`),
  ...PERMANENCIA,
  ...OBJETIVO,
  ...ATOR_CHAVE,
  ...INSTRUMENTOS.flatMap((i) => [
    i.nome,
    i.quemPreenche,
    i.quando,
    ...i.registra,
  ]),
  ...PERCURSO.flatMap((e) => [e.titulo, ...e.paragrafos]),
  ...ESCUTA,
  ...LEITURA,
  ...LIMITES.map((l) => `${l.titulo} ${l.texto}`),
  NOTA_DOS_MESES,
];

describe("ausência de texto provisório", () => {
  /*
    A frase do stub é o alvo principal: ela existiu nas duas rotas até este
    lote, e uma regressão de merge a traria de volta sem quebrar mais nada.
  */
  const PROIBIDOS = [
    "Esta seção ainda não tem conteúdo publicado",
    "lorem ipsum",
    "em breve",
    "vem aí",
    "a definir",
    "texto provisório",
    "placeholder",
    "TODO:",
    "TBD",
    "xxx",
  ];

  test("nenhuma marcação de rascunho no conteúdo servido", () => {
    for (const texto of TEXTOS_PUBLICOS) {
      for (const proibido of PROIBIDOS) {
        expect(texto.toLowerCase(), texto.slice(0, 60)).not.toContain(
          proibido.toLowerCase(),
        );
      }
    }
  });

  test("as duas rotas deixaram de ser stub", () => {
    for (const rota of [FONTES.rotaObservatorio, FONTES.rotaPesquisa]) {
      const fonte = ler(rota);
      expect(fonte, rota).not.toContain("Esta seção ainda não tem conteúdo");
      expect(fonte, rota).not.toContain("Stub de rota");
    }
  });

  test("todo parágrafo tem corpo de verdade, e não uma linha de espera", () => {
    /*
      `ORIGEM[].quando` fica fora: ele é rótulo de tempo — "2025" —, e exigir
      corpo de parágrafo dele obrigaria a inflar uma data.
    */
    const rotulos = new Set(ORIGEM.map((m) => m.quando));
    for (const texto of TEXTOS_PUBLICOS) {
      if (rotulos.has(texto)) {
        expect(texto.trim(), texto).not.toBe("");
        continue;
      }
      expect(texto.trim().length, texto).toBeGreaterThan(8);
    }
  });
});

describe("a leitura de dados permanece ligada à escuta", () => {
  /*
    O primeiro parágrafo é redação aprovada e continua travado. O resto da
    seção é aberto de propósito: a revisão editorial de 2026-09-20 acrescentou
    um segundo parágrafo com o que as transcrições sustentam, e uma igualdade
    exata da lista inteira impediria qualquer acréscimo sustentado por fonte.
    O que a guarda trava é o texto rejeitado.
  */
  test("o texto editorial final substitui a abordagem anterior", () => {
    expect(LEITURA[0]).toBe(
      "A leitura quantitativa não aparece isolada do campo. Os registros, formulários e indicadores foram analisados junto às entrevistas, às visitas e à observação dos lugares pesquisados. Essa combinação permite compreender não apenas números, mas também trajetórias, práticas culturais e relações construídas no território.",
    );
    expect(ler(FONTES.rotaPesquisa)).toContain(
      "Dados e escuta fazem parte da mesma pesquisa",
    );
    expect(LEITURA.join(" ")).not.toContain(
      "Nem tudo o que a planilha calcula foi publicado",
    );
  });
});

describe("números e territórios são derivados, nunca escritos", () => {
  /*
    A regra do lote: quando o número já existe consolidado no projeto, a
    página o deriva. Um literal aqui é exatamente o caminho pelo qual a Home
    passou a afirmar "3 episódios publicados" enquanto o repositório não os
    tinha.
  */
  test("o módulo da pesquisa não carrega data nem contagem literais", () => {
    const fonte = semComentarios(ler(FONTES.pesquisa));
    for (const literal of ["21/07/2025", "21/12/2025", "2025-07-21"]) {
      // Só as interpolações derivadas de `INICIO_DA_COLETA` e `FIM_DA_COLETA`
      // podem produzir a data; o texto-fonte não pode contê-la.
      expect(fonte, literal).not.toContain(literal);
    }
  });

  test("o período exibido vem das duas datas da coleta", () => {
    expect(PERIODO_DA_COLETA).toBe("21/07/2025 a 21/12/2025");
    expect(NOTA_DOS_MESES).toContain(PERIODO_DA_COLETA.split(" a ")[0] ?? "");
  });

  test("os municípios do recorte vêm da camada territorial", () => {
    const fonte = semComentarios(ler(FONTES.observatorio));
    expect(MUNICIPIOS_DO_VALE.length).toBe(5);
    expect(MUNICIPIOS_DE_COMPARACAO.map((m) => m.nome)).toEqual([
      "São Cristóvão",
    ]);
    for (const municipio of MUNICIPIOS_DO_VALE) {
      expect(fonte, municipio.nome).not.toContain(`"${municipio.nome}"`);
    }
  });
});

describe("as duas páginas não dizem a mesma coisa", () => {
  /*
    A divisão é de escopo: `/observatorio` é identidade, propósito, estrutura
    e produtos; `/pesquisa` é investigação, método, campo e percurso. Se um
    parágrafo inteiro aparecer nas duas, a divisão deixou de existir.
  */
  test("nenhum parágrafo é compartilhado entre os dois módulos", () => {
    const daInstitucional = new Set([
      ...ORIGEM.flatMap((m) => m.paragrafos),
      ...TERRITORIO,
      ...PERMANENCIA,
      ...O_QUE_FAZ.map((p) => p.texto),
    ]);
    const daPesquisa = [
      ...OBJETIVO,
      ...ATOR_CHAVE,
      ...PERCURSO.flatMap((e) => e.paragrafos),
      ...ESCUTA,
      ...LIMITES.map((l) => l.texto),
    ];
    for (const paragrafo of daPesquisa) {
      expect(daInstitucional.has(paragrafo), paragrafo.slice(0, 50)).toBe(
        false,
      );
    }
  });

  test("cada uma aponta para a outra", () => {
    const institucional = semComentarios(ler(FONTES.rotaObservatorio));
    const pesquisa = semComentarios(ler(FONTES.rotaPesquisa));
    expect(institucional).toContain('href="/pesquisa"');
    expect(pesquisa).toContain('href="/observatorio"');
  });
});

describe("produtos anunciados existem como rota concluída", () => {
  /*
    Anunciar destino vazio numa página institucional é promessa falsa. A lista
    é fechada de propósito: incluir uma rota aqui exige antes concluí-la.

    `/dados` entrou com os indicadores consolidados e `/campo` com o registro
    fotográfico de campo, ambas em 2026-09-20. As duas deixaram de ser stub, e
    a condição que o comentário anterior impunha foi cumprida na ordem certa —
    primeiro a rota, depois a lista. `rotas-publicas.spec.ts` confere, contra
    o site servido, que nenhuma delas se anuncia incompleta.
  */
  const CONCLUIDAS = [
    "/pesquisa",
    "/territorio",
    "/dados",
    "/campo",
    "/podobservar",
    "/acervo",
  ];

  test("nenhum produto aponta para rota em preparação", () => {
    expect(PRODUTOS.map((p) => p.href).sort()).toEqual([...CONCLUIDAS].sort());
  });

  test("todo produto tem nome, texto e chamada próprios", () => {
    const acoes = PRODUTOS.map((p) => p.acao);
    expect(new Set(acoes).size).toBe(PRODUTOS.length);
    expect(new Set(PRODUTOS.map((p) => p.id)).size).toBe(PRODUTOS.length);
  });
});

describe("entrevistas: estado resolvido, nunca afirmado", () => {
  test("cada entrevista declara um documento do acervo, sem repetição", () => {
    expect(ENTREVISTAS).toHaveLength(8);
    const slugs = ENTREVISTAS.map((e) => e.documento);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs)
      expect(slug, slug).toMatch(/^entrevista-[a-z-]+$/);
  });

  test("sem arquivo público, nenhuma entrevista é dada como pública", () => {
    expect(entrevistasPublicas(new Map())).toHaveLength(0);
  });

  test("uma entrevista só entra na contagem com arquivo por trás", () => {
    const primeira = ENTREVISTAS[0];
    if (primeira === undefined) throw new Error("lista de entrevistas vazia");
    const publicados: ArquivosPublicados = new Map([
      [
        primeira.documento,
        [
          {
            url: "https://acervo.observatoriotobiassoueu.com.br/arquivos/x.pdf",
            rotulo: null,
            principal: true,
            mimeType: "application/pdf",
            bytes: 1,
          },
        ],
      ],
      // Documento presente mas sem arquivo não é publicação.
      [ENTREVISTAS[1]?.documento ?? "", []],
    ]);
    expect(entrevistasPublicas(publicados).map((e) => e.numero)).toEqual([
      primeira.numero,
    ]);
  });

  test("o texto de estado não é escrito à mão em nenhuma das duas páginas", () => {
    for (const caminho of [
      FONTES.rotaPesquisa,
      "src/componentes/home/Secoes.tsx",
    ]) {
      const fonte = semComentarios(ler(caminho));
      const afirmacoes = fonte.match(/seguem restritos/g) ?? [];
      // A frase só pode existir dentro do ramo em que nada está público.
      expect(afirmacoes.length, caminho).toBeLessThanOrEqual(1);
    }
    expect(ESCUTA.join(" ")).not.toContain("seguem restritos");
  });
});
