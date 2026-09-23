/**
 * Conteúdo editorial de `/observatorio`.
 *
 * ## De onde sai cada afirmação
 *
 * Três fontes, e só três:
 *
 * 1. **`componentes/home/conteudo.ts`** — executor, fomento e quem recebe a
 *    comprovação da execução. Os valores vêm reexportados de lá, que continua
 *    sendo a fonte única deles: repetir a string aqui criaria dois nomes
 *    oficiais possíveis.
 * 2. **Transcrição revisada do EP01 do PodObservar**, pública em
 *    `/podobservar/t1/01-o-que-e-o-vale-do-rio-real`. É a fonte de tudo o que
 *    esta página diz sobre a origem do Coletivo e sobre como o Observatório
 *    nasceu. Nada aqui é cópia literal da transcrição.
 * 3. **`dados/territorio/recorte.ts`**, para a definição do Vale e para os
 *    municípios — derivados em tempo de render, nunca escritos à mão.
 *
 * ## O que esta página não diz
 *
 * Não descreve produto que ainda não existe como rota concluída, e não
 * repete o crédito institucional:
 * a régua de marcas de fomento tem fonte única em `institucional/creditos.ts`
 * e aparece no rodapé de toda rota. Um segundo bloco aproximado aqui seria
 * pior que o silêncio.
 */

import {
  RECORTE_TERRITORIAL,
  RESUMO_PUBLICO_DO_VALE,
} from "../../dados/territorio/recorte";
import {
  ACOMPANHAMENTO,
  COLETIVO,
  EDITAL_CURTO,
  LINHA_DO_EDITAL,
} from "../home/conteudo";

export {
  ACOMPANHAMENTO,
  COLETIVO,
  EDITAL,
  EDITAL_CURTO,
  LINHA_DO_EDITAL,
  NOME_OFICIAL,
} from "../home/conteudo";

/**
 * Chamada da abertura. Diz o que o Observatório é antes de dizer quem o faz —
 * quem chega pelo menu ainda não sabe nem uma coisa nem outra.
 */
export const SINTESE =
  "Um observatório de cultura e economia criativa que acompanhou, de dentro, " +
  "o funcionamento de equipamentos turísticos e culturais do Vale do Rio Real " +
  "— e publica aqui o que encontrou.";

/**
 * O que um observatório de cultura faz, dito no que este fez de fato.
 *
 * Cada item corresponde a uma prática documentada na pesquisa: visita
 * continuada e formulário (EP02), entrevista com gestores públicos
 * (`ENTREVISTAS`), leitura quantitativa (`indicadores/derivados.ts`) e
 * publicação em endereço próprio (Acervo).
 */
export const O_QUE_FAZ: readonly {
  readonly verbo: string;
  readonly texto: string;
}[] = [
  {
    verbo: "Observa",
    texto:
      "Acompanha equipamentos culturais no tempo em que eles funcionam, e não " +
      "só no dia da visita: registro diário de entrada e saída de recursos, " +
      "feito por quem mantém o lugar.",
  },
  {
    verbo: "Escuta",
    texto:
      "Entrevista quem mantém os espaços e quem responde pela política " +
      "cultural nos municípios, para confrontar o que os formulários medem " +
      "com o que só a conversa alcança.",
  },
  {
    verbo: "Lê",
    texto:
      "Organiza o que foi coletado em indicadores com regra de cálculo, base " +
      "e período declarados — cada número diz também o que não mede.",
  },
  {
    verbo: "Publica",
    texto:
      "Devolve o material ao território e ao público em endereço próprio, " +
      "estável, sem login e sem pedido de acesso.",
  },
];

/**
 * Origem — do Coletivo ao Observatório.
 *
 * Toda a cronologia sai do EP01. A ordem dos três blocos é a ordem dos fatos:
 * o Coletivo existe antes do edital, e o Observatório nasce do encontro dos
 * dois. Inverter isso faria o projeto parecer criado para o edital.
 */
export const ORIGEM: readonly {
  readonly quando: string;
  readonly titulo: string;
  readonly paragrafos: readonly string[];
}[] = [
  {
    quando: "Junho de 2024",
    titulo: "Um coletivo cultural em Tobias Barreto",
    paragrafos: [
      "Artistas, fazedores de cultura, produtores culturais e pesquisadores da cidade se reuniram em torno de uma convicção comum: a de que a cultura, junto da arte, da educação e da pesquisa, contribui para a transformação social.",
      "Depois de meses de conversas e de coleta de assinaturas, o manifesto do Coletivo foi lançado. Desde então vieram oficinas artísticas em escolas públicas, o Sarau Cultural Tobias, Sou Eu — realizado no aniversário do poeta Tobias Barreto de Menezes e hoje em sua quarta edição — e reuniões com representantes públicos e organizações da sociedade civil.",
    ],
  },
  {
    quando: "Antes do projeto",
    titulo: "Dois lugares conhecidos pelo boca a boca",
    paragrafos: [
      "O Recanto da Serra e o Museu Borda da Mata eram nomes que circulavam na região havia anos, sem que o Coletivo os tivesse visitado. A primeira visita aconteceu já em meio à formação do grupo.",
      "O que chamou atenção não foi a paisagem: foi a dimensão do trabalho acumulado ali, a organização do espaço e o sinal, no zelo com o lugar, de que ele era muito visitado. A pesquisa começou como inquietação antes de existir como projeto.",
    ],
  },
  {
    quando: "2025",
    titulo: "Um edital para observatórios",
    paragrafos: [
      "Com os primeiros editais da Política Nacional Aldir Blanc em Sergipe, apareceu uma linha destinada à criação de observatórios de cultura e economia criativa. O projeto foi inscrito, e o Observatório passou a existir.",
      "O recorte não parou no Recanto da Serra. O Vale do Rio Real, apresentado pela própria região como ecossistema turístico e cultural, tornou-se o horizonte da primeira pesquisa.",
    ],
  },
];

/**
 * Os três vínculos institucionais, na ordem em que respondem às perguntas de
 * quem chega: quem faz, com que recurso, e para quem se presta contas.
 *
 * Mesma cadeia do capítulo I da Home — e de propósito: é a estrutura
 * institucional do projeto, que não pode ser contada de dois jeitos. O que
 * muda aqui é a profundidade do texto, não o fato.
 */
export const VINCULOS: readonly {
  readonly papel: string;
  readonly nome: string;
  readonly texto: string;
}[] = [
  {
    papel: "Realização",
    nome: COLETIVO,
    texto:
      "Idealiza e realiza o Observatório. A equipe da pesquisa é do próprio Coletivo.",
  },
  {
    papel: "Fomento",
    nome: EDITAL_CURTO,
    texto: `Financia a pesquisa e a publicação dos seus resultados, na linha ${LINHA_DO_EDITAL}.`,
  },
  {
    papel: "Acompanhamento",
    nome: ACOMPANHAMENTO,
    texto:
      "Recebe a comprovação da execução do objeto — a mesma que este site publica em endereço permanente.",
  },
];

/**
 * Abertura do território — a linha editorial aprovada, e não a metodológica.
 *
 * Até 2026-09-20 esta página servia `DEFINICAO_VALE_DO_RIO_REAL`, que define o
 * Vale por negação administrativa. A equipe já tinha recusado essa formulação
 * para o texto público; a trava existia só para a seção III da Home, e esta
 * rota passou por fora dela.
 */
export const ABERTURA_DO_TERRITORIO = RESUMO_PUBLICO_DO_VALE;

/** Municípios do recorte, derivados — nunca listados à mão. */
export const MUNICIPIOS_DO_VALE = RECORTE_TERRITORIAL.filter((municipio) =>
  municipio.relacoesTerritoriais.includes("vale-rio-real"),
);

export const MUNICIPIOS_DE_COMPARACAO = RECORTE_TERRITORIAL.filter(
  (municipio) => municipio.relacoesTerritoriais.includes("comparacao"),
);

/**
 * O território como ele é vivido e pesquisado — base factual nas transcrições
 * revisadas do PodObservar, EP01.
 *
 * Redação própria, e não cópia da seção III da Home. As duas contam o mesmo
 * território e respondem a perguntas diferentes: a Home abre a cartografia e
 * enumera a vocação de cada cidade; aqui a pergunta é **por que este recorte**
 * é o território do Observatório. Enumerar de novo o bordado, a moda, o
 * celeiro, as pedras e os Kiriris seria repetir a Home sem acrescentar.
 *
 * `Itanhi`, e não `Itanhy`: grafia decidida pela equipe para o texto
 * editorial do site. A transcrição, que é documento, permanece como está no
 * corpus.
 */
export const TERRITORIO: readonly string[] = [
  "O rio foi chamado Itanhi pelos povos originários, e passou a Real depois que a família real portuguesa acampou em suas margens. Dessa história, e das antigas rotas comerciais de sertanejos e tropeiros, vêm os laços que as cidades do recorte reconhecem entre si.",
  "Quando o Observatório chegou, fazedores de cultura dos dois estados já se articulavam por conta própria, no Movimento Turístico Cultural do Vale do Rio Real. O recorte que a pesquisa percorre é esse: construído no território, e não desenhado de fora.",
  "Cada cidade entra nele com vocação própria, e é no mapa que essa diferença se lê lugar a lugar — junto dos quatro pontos onde a pesquisa esteve em campo.",
];

/**
 * O que o site publica, e o que cada superfície é.
 *
 * `href` aponta apenas para rota concluída. Seção em preparação **não** entra
 * nesta lista: anunciar destino vazio numa página institucional é promessa
 * falsa, e o menu já dá acesso a tudo o que existe.
 *
 * Em 2026-09-20 a lista passou de quatro para seis. Dados e Diário de Campo
 * não entram por mudança de critério — entram porque deixaram de estar em
 * preparação: a primeira publicou os indicadores consolidados, a segunda o
 * registro fotográfico de campo. O critério é o mesmo de sempre.
 */
export type Produto = {
  readonly id: string;
  readonly nome: string;
  readonly href:
    | "/pesquisa"
    | "/territorio"
    | "/dados"
    | "/campo"
    | "/podobservar"
    | "/acervo";
  readonly texto: string;
  readonly acao: string;
};

export const PRODUTOS: readonly Produto[] = [
  {
    id: "pesquisa",
    nome: "A Pesquisa",
    href: "/pesquisa",
    texto:
      "O percurso da investigação: objetivo, recorte, quem foi a campo, com que instrumentos, em que período e com que limites declarados.",
    acao: "Ver o percurso da pesquisa",
  },
  {
    id: "territorio",
    nome: "Território",
    href: "/territorio",
    texto:
      "A cartografia viva do recorte, sobre a malha oficial de Sergipe, com os quatro lugares visitados em campo na posição confirmada e a ficha de cada um.",
    acao: "Ver Território",
  },
  {
    id: "dados",
    nome: "Dados",
    href: "/dados",
    texto:
      "Os indicadores auditados do levantamento, cada um com a sua regra de cálculo, a base sobre a qual foi apurado, o período, o recorte — e o que eles deliberadamente não dizem.",
    acao: "Ver Dados",
  },
  {
    id: "campo",
    nome: "Diário de Campo",
    href: "/campo",
    texto:
      "O registro fotográfico da pesquisa, lugar a lugar, com legenda, crédito e procedência de cada imagem — o que a equipe viu, e não ilustração escolhida depois.",
    acao: "Ver o registro de campo",
  },
  {
    id: "podobservar",
    nome: "PodObservar",
    href: "/podobservar",
    texto:
      "O podcast do Observatório: a pesquisa contada em áudio, com transcrição revisada e integral de cada episódio para quem prefere ler ou não pode ouvir.",
    acao: "Ouvir e ler os episódios",
  },
  {
    id: "acervo",
    nome: "Acervo",
    href: "/acervo",
    texto:
      "Os documentos e registros já liberados para publicação: relatórios técnicos, fotografias de campo e peças de identidade, cada arquivo com endereço próprio.",
    acao: "Ver Acervo",
  },
];

/**
 * Permanência — por que o site é também repositório.
 *
 * A base factual é a própria arquitetura do projeto: espelho local obrigatório
 * de todo anexo, hash SHA-256 por arquivo, inventário legível por máquina em
 * `/anexos.json`. Nada aqui promete DOI, Internet Archive ou ZIP, listados
 * como recomendação e como pendência, não como fato consumado.
 */
export const PERMANENCIA: readonly string[] = [
  "Boa parte do material de um projeto como este costuma viver em pasta compartilhada, link de edição e painel que depende de conta. Endereços assim mudam de permissão, quebram e não sobrevivem a uma consulta feita daqui a alguns anos.",
  "Cada arquivo publicado aqui tem endereço próprio neste domínio e data de publicação — sem login e sem pedido de acesso. O que ainda não pode ser publicado aparece como ausência declarada, nunca como texto de ocasião.",
];

/**
 * Episódio que conta a origem, na forma `t<temporada>/<slug>`.
 *
 * Apontar para `/podobservar` mandaria quem quer o EP01 procurá-lo numa
 * lista. O destino é a ficha do próprio episódio, que serve a apresentação,
 * os links de escuta e a transcrição revisada integral.
 *
 * Declarado, e não consultado: esta página não toca o banco. Um episódio
 * despublicado derrubaria a rota, e `pnpm build` acusa — `/podobservar/
 * [temporada]/[episodio]` é gerado a partir da view pública.
 */
export const EPISODIO_DA_ORIGEM = "t1/01-o-que-e-o-vale-do-rio-real";
