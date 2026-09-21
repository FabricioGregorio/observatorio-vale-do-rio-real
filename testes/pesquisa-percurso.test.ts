import { describe, expect, test } from "vitest";

import { ENTREVISTAS } from "../src/componentes/home/conteudo";
import {
  ATOR_CHAVE,
  agruparEntrevistas,
  CHAVE_DE_EVIDENCIAS,
  ESCUTA,
  ESCUTA_PUBLICA,
  ESCUTA_RESTRITA,
  FECHO,
  INDICADORES,
  INSTRUMENTOS,
  LEITURA,
  LIMITES,
  NOTA_DOS_MESES,
  OBJETIVO,
  OBJETIVO_DEPOIS_DA_PERGUNTA,
  PAPEIS,
  PERCURSO,
  PERGUNTA,
  PERIODO_DA_COLETA,
  REGISTROS_DA_ESCUTA,
  SINTESE,
} from "../src/componentes/pesquisa/conteudoDaPesquisa";
import { REGISTROS_RESERVADOS } from "../src/dados/indicadores/selecaoEditorial";

/**
 * O percurso de `/pesquisa` — invariantes do caderno.
 *
 * A composição desta página afirma três coisas novas sobre a pesquisa: que
 * cada etapa aconteceu em lugares determinados, que cada etapa produziu um
 * tipo de evidência e que cada instrumento sustenta indicadores nomeados.
 * Nenhuma das três pode ser decoração de layout — todas precisam continuar
 * saindo do texto que a própria página serve.
 *
 * É o mesmo princípio das fichas de material: o que a página exibe é
 * derivado, e o que não tem origem não é exibido.
 */

describe("a pergunta de partida sai do próprio objetivo", () => {
  test("é recortada, e não escrita uma segunda vez", () => {
    const abertura = OBJETIVO[0] ?? "";
    expect(PERGUNTA.endsWith("?")).toBe(true);
    // O corpo da pergunta é literalmente o da abertura do objetivo.
    const corpo = PERGUNTA.slice(0, -1);
    expect(abertura.toLowerCase()).toContain(
      `${corpo.charAt(0).toLowerCase()}${corpo.slice(1)}`.toLowerCase(),
    );
  });

  test("o objetivo exibido continua de onde a pergunta parou", () => {
    expect(OBJETIVO_DEPOIS_DA_PERGUNTA).toHaveLength(OBJETIVO.length - 1);
    expect(OBJETIVO_DEPOIS_DA_PERGUNTA).not.toContain(OBJETIVO[0]);
    expect(OBJETIVO_DEPOIS_DA_PERGUNTA.join(" ")).not.toContain(
      "pergunta concreta",
    );
  });
});

describe("a margem de cada etapa é derivada da própria etapa", () => {
  test("todo lugar da margem é nomeado nos parágrafos da etapa", () => {
    for (const etapa of PERCURSO) {
      const corpo = etapa.paragrafos.join(" ");
      expect(etapa.onde.length, etapa.titulo).toBeGreaterThan(0);
      for (const lugar of etapa.onde) {
        expect(corpo, `${etapa.numeral} · ${lugar}`).toContain(lugar);
      }
    }
  });

  test("a ausência declarada nomeia o município que a etapa já cita", () => {
    for (const etapa of PERCURSO) {
      if (etapa.semRegistro === null) continue;
      const corpo = etapa.paragrafos.join(" ");
      expect(corpo, etapa.numeral).toContain(
        "sem evidência de pesquisa de campo",
      );
      const municipio = etapa.semRegistro.split(" ")[0] ?? "";
      expect(corpo, municipio).toContain(municipio);
    }
  });

  test("uma etapa sem campo declara a ausência em vez de ficar vazia", () => {
    const semCampo = PERCURSO.filter(
      (etapa) => !etapa.evidencias.includes("campo"),
    );
    expect(semCampo.length).toBeGreaterThan(0);
    for (const etapa of semCampo) {
      expect(
        etapa.semRegistro !== null || etapa.evidencias.length > 0,
        etapa.titulo,
      ).toBe(true);
    }
  });
});

describe("a chave de evidências não é decorativa", () => {
  test("toda evidência usada no percurso está na chave", () => {
    const naChave = new Set(CHAVE_DE_EVIDENCIAS.map((e) => e.id));
    for (const etapa of PERCURSO) {
      for (const id of etapa.evidencias) {
        expect(naChave.has(id), `${etapa.numeral} · ${id}`).toBe(true);
      }
    }
  });

  test("toda evidência da chave é usada por alguma etapa", () => {
    const usadas = new Set(PERCURSO.flatMap((etapa) => etapa.evidencias));
    for (const evidencia of CHAVE_DE_EVIDENCIAS) {
      expect(usadas.has(evidencia.id), evidencia.nome).toBe(true);
    }
  });

  test("cada marca tem nome e explicação escritos", () => {
    expect(new Set(CHAVE_DE_EVIDENCIAS.map((e) => e.id)).size).toBe(
      CHAVE_DE_EVIDENCIAS.length,
    );
    for (const evidencia of CHAVE_DE_EVIDENCIAS) {
      expect(evidencia.nome.length, evidencia.id).toBeGreaterThan(5);
      expect(evidencia.texto.length, evidencia.id).toBeGreaterThan(40);
    }
  });
});

describe("os instrumentos declaram o que produziram", () => {
  test("todo indicador declarado existe no conjunto auditado", () => {
    const auditados = new Set<string>(
      INDICADORES.map((indicador) => indicador.id),
    );
    const disponiveis = new Set<string>(
      REGISTROS_RESERVADOS.map((indicador) => indicador.id),
    );
    for (const instrumento of INSTRUMENTOS) {
      for (const id of instrumento.indicadores) {
        expect(auditados.has(id), `${instrumento.id} · ${id}`).toBe(true);
        expect(disponiveis.has(id), `${instrumento.id} · ${id}`).toBe(true);
      }
    }
  });

  /*
    A contagem de visitantes tem pendência metodológica aberta na própria
    fonte e não entrou no conjunto auditado. O formulário do público não pode
    ganhar indicador por simetria de layout.
  */
  test("o formulário do público não reivindica indicador nenhum", () => {
    const consumidor = INSTRUMENTOS.find(
      (instrumento) => instrumento.id === "consumidor",
    );
    expect(consumidor?.indicadores).toEqual([]);
  });

  test("nenhum indicador é reivindicado por dois instrumentos", () => {
    const reivindicados = INSTRUMENTOS.flatMap(
      (instrumento) => instrumento.indicadores,
    );
    expect(new Set(reivindicados).size).toBe(reivindicados.length);
  });
});

describe("a escuta se reparte sem perder entrevista", () => {
  test("as oito entrevistas entram em um registro, e só em um", () => {
    const grupos = agruparEntrevistas();
    const numeros = grupos.flatMap((grupo) =>
      grupo.entrevistas.map((entrevista) => entrevista.numero),
    );
    expect(numeros).toHaveLength(ENTREVISTAS.length);
    expect(new Set(numeros).size).toBe(ENTREVISTAS.length);
  });

  test("cada registro tem entrevista e explica o seu recorte", () => {
    for (const { registro, entrevistas } of agruparEntrevistas()) {
      expect(entrevistas.length, registro.titulo).toBeGreaterThan(0);
      expect(registro.texto.length, registro.titulo).toBeGreaterThan(40);
    }
  });

  test("um documento classificado que não existe derruba o agrupamento", () => {
    const declarados = REGISTROS_DA_ESCUTA.flatMap((r) => r.documentos);
    const reais = new Set(ENTREVISTAS.map((e) => e.documento));
    // Nenhum slug inventado: classificar o que não existe é afirmar escuta.
    for (const documento of declarados) {
      expect(reais.has(documento), documento).toBe(true);
    }
    expect(declarados).toHaveLength(ENTREVISTAS.length);
  });
});

/**
 * Linguagem pública do corpus de `/pesquisa`.
 *
 * A rodada visual de 2026-09-21 reintroduziu, em três lugares, frases que
 * explicavam como a equipe publica e classifica material em vez de explicar a
 * pesquisa: a pendência de um indicador, o trâmite que dá endereço público a
 * um documento e a razão da forma da interface. As três saíram.
 *
 * O critério que este bloco aplica é o mesmo que as removeu: a frase explica
 * a pesquisa a quem lê, ou explica como o site foi construído, conferido e
 * publicado? Na segunda hipótese, ela não chega ao público.
 *
 * O que **não** entra aqui é transparência metodológica real. Baixa
 * temporada, registro declarado pelo ator-chave, ausência de auditoria de
 * caixa, hipótese revista no percurso e limites de leitura continuam ditos
 * com todas as letras — higienizar a ponto de apagá-los seria o erro oposto.
 */
describe("o corpus público não explica o funcionamento interno do site", () => {
  const PROIBIDOS: readonly {
    readonly padrao: RegExp;
    readonly porque: string;
  }[] = [
    {
      padrao: /pend[eê]ncia metodol[oó]gica/i,
      porque: "estado interno de um indicador não publicado",
    },
    {
      padrao: /conjunto auditado/i,
      porque: "recorte interno de publicação de indicadores",
    },
    {
      padrao: /revis[aã]o de privacidade/i,
      porque: "etapa interna do fluxo de publicação",
    },
    {
      padrao: /semelhan[cç]a de nome/i,
      porque: "critério interno de vinculação de arquivo",
    },
    {
      padrao: /endere[cç]o p[uú]blico depois/i,
      porque: "trâmite de publicação exposto a quem lê",
    },
    {
      padrao:
        /esta p[aá]gina (identifica|mostra|apresenta|exibe)|nesta p[aá]gina/i,
      porque: "justificativa da forma da interface",
    },
    {
      padrao: /decis[aã]o editorial|optamos|escolhemos/i,
      porque: "voz de quem produziu o site, e não da pesquisa",
    },
    {
      padrao: /publica[cç][aã]o autorizada|processo de publica[cç][aã]o/i,
      porque: "governança de publicação",
    },
    {
      padrao: /fonte da verdade|fonte de verdade/i,
      porque: "vocabulário de processo interno",
    },
    { padrao: /\bgate\b/i, porque: "nome interno do critério de publicação" },
    {
      padrao: /tempo de compila[cç][aã]o|\bno build\b/i,
      porque: "mecanismo de compilação exposto",
    },
    {
      padrao: /respons[aá]vel (confirmou|aprovou|autorizou|validou)/i,
      porque: "bastidor de aprovação",
    },
  ];

  /** Todo texto que o módulo entrega para a página servir. */
  const CORPUS: readonly string[] = [
    SINTESE,
    PERGUNTA,
    NOTA_DOS_MESES,
    PERIODO_DA_COLETA,
    ...OBJETIVO,
    ...ATOR_CHAVE,
    ...PAPEIS.map((papel) => `${papel.papel} ${papel.texto}`),
    ...INSTRUMENTOS.flatMap((instrumento) => [
      instrumento.nome,
      instrumento.quemPreenche,
      instrumento.quando,
      instrumento.serventia ?? "",
      ...instrumento.registra,
    ]),
    ...CHAVE_DE_EVIDENCIAS.flatMap((e) => [e.nome, e.texto]),
    ...PERCURSO.flatMap((etapa) => [
      etapa.titulo,
      ...etapa.paragrafos,
      ...etapa.onde,
      etapa.semRegistro ?? "",
    ]),
    ...REGISTROS_DA_ESCUTA.flatMap((r) => [r.titulo, r.texto]),
    ...ESCUTA,
    ESCUTA_PUBLICA,
    ESCUTA_RESTRITA,
    ...LEITURA,
    ...LIMITES.map((limite) => `${limite.titulo} ${limite.texto}`),
    ...FECHO,
  ];

  test("nenhuma frase do corpus descreve o funcionamento interno", () => {
    const achados: string[] = [];
    for (const texto of CORPUS) {
      for (const { padrao, porque } of PROIBIDOS) {
        const encontrado = padrao.exec(texto);
        if (encontrado !== null) {
          achados.push(
            `"${encontrado[0]}" — ${porque} — em: ${texto.slice(0, 70)}`,
          );
        }
      }
    }
    expect(achados).toEqual([]);
  });

  /*
    O oposto do bastidor também é erro. Estas quatro afirmações são limites
    reais da pesquisa e precisam continuar ditas.
  */
  test("os limites reais da pesquisa continuam escritos", () => {
    const limites = LIMITES.map((l) => `${l.titulo} ${l.texto}`).join(" ");
    expect(limites).toContain("baixa visitação");
    expect(limites).toContain("preenchido pelo ator-chave");
    expect(limites).toContain("não audita caixa");
    expect(limites).toContain("hipótese");
  });

  test("o formulário do visitante diz para que serve, em vez de por que não publica indicador", () => {
    const consumidor = INSTRUMENTOS.find(
      (instrumento) => instrumento.id === "consumidor",
    );
    expect(consumidor?.serventia).not.toBeNull();
    expect(consumidor?.serventia ?? "").toContain("perfil das visitas");
    // O instrumento que sustenta indicador não precisa de frase de serventia:
    // a régua do que ele produziu já está na ficha.
    const rotina = INSTRUMENTOS.find(
      (instrumento) => instrumento.id === "rotina",
    );
    expect(rotina?.serventia).toBeNull();
  });

  /*
    A primeira oração de `ESCUTA_RESTRITA` é o que liga esta página à Home:
    `institucional.spec.ts` compara as duas por ela, e as duas não podem
    divergir sobre as mesmas oito entrevistas.
  */
  test("a frase de restrição continua comparável com a da Home", () => {
    expect(ESCUTA_RESTRITA).toContain("seguem restritos");
    expect(ESCUTA.join(" ")).not.toContain("seguem restritos");
  });
});
