/**
 * Conteúdo das páginas institucionais curtas.
 *
 * ## A regra deste arquivo
 *
 * **Toda afirmação aqui é verificável no próprio código ou num documento do
 * projeto**, e cada uma carrega a prova ao lado, em `prova`. A prova aparece
 * na tela: numa declaração de acessibilidade ou de privacidade, a afirmação
 * sozinha é indistinguível de texto genérico copiado de outro site — que é
 * exatamente o que estas páginas não podem ser.
 *
 * Nenhuma delas promete conformidade, certificação, selo ou auditoria externa.
 * O site não tem nenhum dos três, e declarar conformidade que não existe é,
 * numa prestação de contas, a mesma classe de problema que um número
 * inventado.
 *
 * Identificação institucional não é redigitada: vem de `home/conteudo.ts`.
 */

export {
  ACOMPANHAMENTO,
  COLETIVO,
  EDITAL,
  EDITAL_CURTO,
  LINHA_DO_EDITAL,
  NOME_OFICIAL,
} from "../home/conteudo";

export type ItemDeclarado = {
  readonly titulo: string;
  readonly texto: string;
  /** Onde a afirmação pode ser conferida. `null` quando é fato de navegação. */
  readonly prova: string | null;
};

/* ─────────────────────────────── acessibilidade ───────────────────────── */

export const ACESSIBILIDADE_SINTESE =
  "O que este site faz por quem navega com teclado, com leitor de tela, com " +
  "pouca visão, com pouca banda ou sem poder ouvir — descrito recurso a " +
  "recurso, com a forma de conferir cada um.";

export const ACESSIBILIDADE_ABERTURA =
  "Esta não é uma declaração de conformidade. O site não passou por auditoria " +
  "externa e não tem selo de certificação. O que existe é um conjunto de " +
  "recursos implementados e verificados por testes automatizados que rodam a " +
  "cada alteração, e é isso que está descrito abaixo.";

export const ACESSIBILIDADE_RECURSOS: readonly ItemDeclarado[] = [
  {
    titulo: "Navegação inteira por teclado",
    texto:
      "Todo link, botão e controle é alcançável por Tab, na ordem em que aparece na página. O primeiro elemento de cada página é um link para pular direto ao conteúdo, sem percorrer o menu.",
    prova: "Verificado em testes de teclado a cada alteração",
  },
  {
    titulo: "Foco sempre visível",
    texto:
      "O elemento em foco recebe um contorno de 3 px que muda de cor conforme o tema, para não desaparecer sobre fundo escuro. Nenhum estilo do site remove o indicador de foco.",
    prova: "Contorno medido em tema claro e escuro por teste automatizado",
  },
  {
    titulo: "Contraste conferido, não estimado",
    texto:
      "As combinações de cor de texto e fundo são medidas e precisam alcançar a razão mínima de 4,5:1 do nível AA. Cor nunca é o único canal de informação: nos gráficos, série e categoria se distinguem também por forma e por texto escrito ao lado.",
    prova: "Razão de contraste calculada em teste, nos dois temas",
  },
  {
    titulo: "Tema claro, escuro ou o do seu sistema",
    texto:
      "A Central de Acessibilidade, no alto de cada página, permite escolher entre claro, escuro e seguir o sistema operacional. A escolha fica gravada no seu navegador e vale nas próximas visitas. Sem JavaScript, o site continua respeitando a preferência do sistema.",
    prova:
      "Central de Acessibilidade · painel com foco preso e fechamento por Esc",
  },
  {
    titulo: "Menos animação quando você pede menos",
    texto:
      "Se o seu sistema estiver configurado para reduzir movimento, o site zera as transições — não há um ajuste a ligar aqui, porque a preferência do sistema já basta. A Central relata o que ela leu do seu sistema.",
    prova: "Durações zeradas sob prefers-reduced-motion, verificado por teste",
  },
  {
    titulo: "Estrutura semântica de verdade",
    texto:
      "Cada página tem um único h1 e uma hierarquia de títulos sem saltos. As tabelas são tabelas, com cabeçalho declarado; as listas são listas; cada região da página tem nome acessível. Em telas estreitas a tabela de anexos vira ficha por CSS, sem trocar a marcação — a semântica não se perde no caminho.",
    prova: "Varredura axe nas rotas principais, em tema claro e escuro",
  },
  {
    titulo: "Toda imagem com texto alternativo",
    texto:
      "Nenhuma imagem é publicada sem alternativa textual: é regra de contrato do projeto, não recomendação. As fotografias de campo trazem, além do alt, legenda visível e crédito de autoria quando ele é conhecido.",
    prova: "Regra do AGENTS.md, conferida na revisão de cada publicação",
  },
  {
    titulo: "Todo áudio com transcrição",
    texto:
      "Nenhum áudio é publicado sem transcrição vinculada. Os episódios do PodObservar trazem transcrição revisada e integral, legível na própria página — quem não pode ouvir, lê o mesmo conteúdo.",
    prova:
      "Regra do AGENTS.md; a consulta pública recusa episódio sem transcrição",
  },
  {
    titulo: "O mapa funciona pelo teclado, e o conteúdo existe sem ele",
    texto:
      "O percurso pelos lugares do Território é uma lista de abas com uma única parada de Tab: as setas andam entre os lugares e o estado selecionado é anunciado. Sem JavaScript, a página do Território continua trazendo o conteúdo essencial em texto, e a leitura dos municípios do recorte está sempre disponível em lista.",
    prova: "Testado com teclado e com JavaScript desligado",
  },
  {
    titulo: "Leitura em zoom, e em tela pequena",
    texto:
      "As páginas são conferidas em 320, 375, 768, 1024, 1440 px sem rolagem horizontal, e a tipografia dos números cresce com a largura do próprio bloco, para não estourar a caixa em zoom de 200%.",
    prova: "Larguras verificadas por teste, nos dois temas",
  },
  {
    titulo: "Página pensada para imprimir",
    texto:
      "A Prestação de Contas tem versão imprimível: cabeçalho e rodapé saem da folha, o fundo fica branco e cada link aparece com o endereço por extenso, porque no papel um link sem endereço visível é um link perdido.",
    prova: "/prestacao-de-contas/imprimir",
  },
  {
    titulo: "Nada que dispute a sua atenção",
    texto:
      "Não há áudio ou vídeo que comece sozinho, carrossel que gire, janela que apareça por cima nem contagem regressiva. As fontes são servidas pelo próprio site, então o texto não fica invisível esperando um download de terceiro.",
    prova: null,
  },
];

export const ACESSIBILIDADE_LIMITES: readonly ItemDeclarado[] = [
  {
    titulo: "Não há auditoria externa nem selo",
    texto:
      "Os recursos acima foram implementados e são verificados automaticamente, mas nenhuma entidade independente avaliou o site. Nenhuma afirmação aqui equivale a certificação.",
    prova: null,
  },
  {
    titulo: "Ajuste de tamanho de texto e alto contraste não existem",
    texto:
      "A Central de Acessibilidade mostra apenas os controles que funcionam. Escala de texto e alto contraste dedicado ainda não foram implementados, e um botão desligado seria pior do que a ausência — prometeria a quem mais depende do recurso. O zoom do próprio navegador continua funcionando em toda página.",
    prova: null,
  },
  {
    titulo: "Um dos relatórios é digitalizado",
    texto:
      "O relatório técnico do Centro Cultural e Museu Borda da Mata é um PDF digitalizado, sem camada de texto: um leitor de tela não o alcança. Por isso o acervo publica, ao lado dele, uma versão textual acessível do mesmo conteúdo.",
    prova: "A03 — versão textual acessível, no Acervo",
  },
  {
    titulo: "Os arquivos do acervo são do formato em que foram produzidos",
    texto:
      "Planilhas e PDFs de terceiros são publicados como foram entregues, para que sirvam como prova documental. A acessibilidade interna desses arquivos é a que eles tinham na origem.",
    prova: null,
  },
];

/* ──────────────────────────────── privacidade ─────────────────────────── */

export const PRIVACIDADE_SINTESE =
  "Este site não usa cookies, não tem analytics, não carrega script de " +
  "terceiro e não pede nenhum dado seu. O que ele guarda no seu navegador é " +
  "uma preferência de tema, e ela não sai dali.";

export const PRIVACIDADE_ABERTURA =
  "O texto abaixo descreve o funcionamento real do site, conferido no código " +
  "que o gera. Ele não é modelo genérico de política de privacidade, e não faz " +
  "promessa que o código não sustente.";

export const PRIVACIDADE_NAVEGACAO: readonly ItemDeclarado[] = [
  {
    titulo: "Nenhum cookie",
    texto:
      "O site não grava cookie nenhum — nem de sessão, nem de preferência, nem de terceiro. Por isso também não existe aviso de cookies: não há nada a consentir.",
    prova: "Nenhuma escrita de cookie no código que gera as páginas",
  },
  {
    titulo: "Nenhum analytics e nenhum rastreador",
    texto:
      "Não há Google Analytics, pixel, tag manager, mapa de calor, gravação de sessão ou qualquer medição de audiência. O projeto não sabe quantas pessoas visitaram uma página, e essa é uma escolha, não um esquecimento.",
    prova:
      "Regra de contrato do projeto: nenhum script de terceiro que rastreie",
  },
  {
    titulo: "Nenhum script de terceiro",
    texto:
      "Todo código executado no seu navegador vem deste domínio. As fontes tipográficas são baixadas no momento em que o site é compilado e servidas daqui: nenhuma requisição sai para o Google enquanto você lê.",
    prova: "Fontes auto-hospedadas no build; sem CDN de terceiro",
  },
  {
    titulo: "Nenhum formulário e nenhum login",
    texto:
      "Não existe cadastro, área restrita, newsletter, caixa de comentário ou campo de busca que envie dados para fora. A busca do Acervo filtra a lista que já veio com a página, no seu próprio navegador.",
    prova: null,
  },
  {
    titulo: "Nenhum player incorporado",
    texto:
      "O site não incorpora player do Spotify, do YouTube ou de qualquer outra plataforma. Esses players carregam scripts e gravam cookies de terceiro, e isso conflitaria com tudo que está escrito acima. Os episódios são apresentados aqui com texto e transcrição, e a escuta acontece na plataforma, por link.",
    prova: "Decisão registrada: apresentação aqui, escuta na plataforma",
  },
  {
    titulo: "O que fica gravado no seu navegador",
    texto:
      "Uma única chave de armazenamento local, com a sua escolha de tema — claro, escuro ou seguir o sistema. Ela existe para que a escolha sobreviva à próxima visita, fica no seu aparelho, nunca é enviada a lugar nenhum e desaparece quando você limpa os dados do site.",
    prova: "Chave observatorio-tema, em armazenamento local",
  },
];

export const PRIVACIDADE_FRONTEIRAS: readonly ItemDeclarado[] = [
  {
    titulo: "Links para fora",
    texto:
      "Algumas páginas levam a sites de terceiros — as plataformas de escuta do PodObservar e, nas fichas do Território, um link opcional de rota no OpenStreetMap ou no Google Maps. Nada desses sites é carregado dentro do nosso; o link só abre quando você clica, em nova aba. A partir daí vale a política de privacidade deles, não a nossa.",
    prova: null,
  },
  {
    titulo: "Arquivos do acervo",
    texto:
      "Os documentos, fotografias e áudios ficam num subdomínio próprio do projeto, e são servidos abertamente, sem login e sem pedido de acesso. Baixar um arquivo é uma requisição comum de rede, como qualquer outra deste site.",
    prova: "acervo.observatoriotobiassoueu.com.br",
  },
  {
    titulo: "Infraestrutura, e o que ela inevitavelmente vê",
    texto:
      "Como em qualquer site, o servidor que entrega as páginas processa o endereço de IP e o tipo de navegador de quem as pede — é o mínimo técnico para que uma página chegue até você. O projeto não usa esses registros para medir audiência, não os cruza com nada e não os publica.",
    prova: null,
  },
  {
    titulo: "O site é gerado antes de você chegar",
    texto:
      "As páginas são compiladas uma vez, com os dados já resolvidos, e entregues prontas. Nenhuma consulta ao banco de dados acontece enquanto você navega, e nenhuma informação sua chega perto dele.",
    prova: "Busca de dados em tempo de compilação, por decisão de arquitetura",
  },
];

export const PRIVACIDADE_PESQUISA: readonly ItemDeclarado[] = [
  {
    titulo: "Dados de quem participou da pesquisa",
    texto:
      "O acervo publica material produzido em campo entre 2025 e 2026: relatórios, fotografias, entrevistas gravadas com transcrição e planilhas de resposta. Esse material é objeto de decisão humana documentada sobre o que pode ser publicado, e passou por varredura automatizada de CPF, telefone e marca de assinatura antes de ir ao ar.",
    prova:
      "Registro de publicação do acervo, com o inventário arquivo por arquivo",
  },
  {
    titulo: "Consentimento das entrevistas",
    texto:
      "O consentimento das pessoas entrevistadas é verbal e gravado, registrado junto da própria gravação. Não existe termo assinado separado, e o projeto não afirma que exista.",
    prova: null,
  },
  {
    titulo: "Formulários de visitantes",
    texto:
      "Os formulários aplicados em campo não coletam nome, documento, telefone ou e-mail: a base é anônima na origem.",
    prova: null,
  },
  {
    titulo: "Se algo aqui lhe diz respeito",
    texto:
      "Se você identificar no acervo um material que lhe diga respeito e queira tratar disso, o caminho é o contato institucional do projeto, na página de Contato.",
    prova: null,
  },
];

/* ─────────────────────────────────── contato ──────────────────────────── */

export const CONTATO_SINTESE =
  "O Observatório ainda não tem um canal de atendimento designado para o " +
  "site. Esta página diz o que existe de fato, e o que não existe.";

export const CONTATO_ABERTURA =
  "Um endereço de e-mail ou um formulário publicados aqui teriam de ser reais, " +
  "com alguém do outro lado. Nenhum foi designado até agora, e inventar um " +
  "seria pior do que a ausência: a mensagem se perderia sem que ninguém " +
  "soubesse. Enquanto isso não se resolve, esta página lista o que já " +
  "funciona sem intermediário.";

export const CONTATO_CANAIS: readonly ItemDeclarado[] = [
  {
    titulo: "O acervo não precisa de pedido",
    texto:
      "A razão mais comum para escrever a um projeto como este é pedir acesso a um documento. Aqui não é preciso: todo material público tem endereço permanente, sem login e sem autorização. Se você procura um arquivo, ele está no Acervo ou listado na Prestação de Contas, com hash para conferência.",
    prova: null,
  },
  {
    titulo: "Perfil público no Instagram",
    texto:
      "O Observatório mantém o perfil @obs_tobiassoueu, que abre publicamente. Ele é superfície de divulgação, registrada no inventário do projeto — não é canal de atendimento nem endereço para correspondência de prestação de contas, e o projeto não se compromete com prazo de resposta por ali.",
    prova: "Item D02 do inventário do edital",
  },
  {
    titulo: "Prestação de contas do edital",
    texto:
      "A comprovação da execução deste projeto é apresentada à FUNCAP, em Sergipe. Quem avalia encontra na Prestação de Contas todos os anexos com endereço permanente, data de publicação e hash SHA-256, além da versão legível por máquina e da versão imprimível.",
    prova: null,
  },
];

export const CONTATO_PENDENCIA =
  "Canal de atendimento designado — endereço, responsável, finalidade e " +
  "expectativa de resposta — é decisão do Coletivo, e ainda não foi tomada. " +
  "Quando for, entra aqui. Esta página não inventa um enquanto isso.";

/* ─────────────────────────────────── imprensa ─────────────────────────── */

export const IMPRENSA_SINTESE =
  "O que é o Observatório, em duas linhas e em um parágrafo, com os " +
  "materiais públicos que podem ser citados, reproduzidos e conferidos.";

export const IMPRENSA_ABERTURA =
  "Tudo que está listado aqui já é público e tem endereço permanente. Não há " +
  "material sob embargo, não há assessoria intermediando e não é preciso " +
  "pedir autorização para usar o que está no acervo — a licença de cada " +
  "arquivo está declarada ao lado dele.";

/** Descrição curta, para citação direta. Deriva o nome oficial e o edital. */
export const IMPRENSA_LINHA_FINA =
  "Observatório de cultura e economia criativa que acompanhou, de dentro, o " +
  "funcionamento de equipamentos culturais e turísticos do Vale do Rio Real, " +
  "em Sergipe, e publica o que encontrou em domínio aberto.";

export const IMPRENSA_DESCRICAO =
  "O Observatório do Vale do Rio Real é uma iniciativa do Coletivo Cultural " +
  "“Tobias, sou Eu!”, financiada por edital público da Política Nacional " +
  "Aldir Blanc. Entre julho e dezembro de 2025, a pesquisa acompanhou dois " +
  "equipamentos culturais de Tobias Barreto em seu funcionamento diário, " +
  "esteve em campo em quatro lugares, gravou entrevistas com responsáveis por " +
  "equipamentos e por políticas públicas de cultura e reuniu registros " +
  "fotográficos, relatórios técnicos e indicadores econômicos. Todo o " +
  "material autorizado está publicado em endereço permanente, com hash de " +
  "integridade, e o podcast PodObservar conta a mesma pesquisa em áudio, com " +
  "transcrição integral.";

export const IMPRENSA_USO: readonly ItemDeclarado[] = [
  {
    titulo: "Citar os dados",
    texto:
      "Cada indicador é publicado com a regra de cálculo, a base sobre a qual foi apurado, o período e o recorte. Ao citar um número, cite também o recorte: os valores descrevem dois equipamentos culturais de Tobias Barreto em cinco meses, e não o Vale inteiro.",
    prova: null,
  },
  {
    titulo: "Usar as fotografias",
    texto:
      "As fotografias de campo estão no acervo com título, texto alternativo e, onde a autoria é de terceiro, o crédito obrigatório. Reproduza o crédito como ele aparece ao lado da imagem.",
    prova: null,
  },
  {
    titulo: "Citar o podcast",
    texto:
      "Cada episódio tem transcrição revisada e integral na própria página, o que permite citar trecho com exatidão sem transcrever de ouvido.",
    prova: null,
  },
  {
    titulo: "Licença",
    texto:
      "A licença vale por arquivo e está declarada na ficha de cada um, na Prestação de Contas e em /anexos.json.",
    prova: null,
  },
];

/* ─────────────────────────────────── educação ─────────────────────────── */

export const EDUCACAO_SINTESE =
  "O acervo do Observatório é material de aula pronto para uso: dados com " +
  "método declarado, entrevistas com transcrição, fotografias de campo e " +
  "relatórios sobre lugares que estudantes da região reconhecem.";

export const EDUCACAO_ABERTURA =
  "O projeto não oferece oficina, curso, plano de aula pronto nem visita " +
  "agendada — nada disso foi produzido, e esta página não inventa um programa " +
  "que não existe. O que existe é um acervo aberto, e o que segue é uma " +
  "orientação de como chegar a ele conforme o que se quer ensinar.";

export type CaminhoEducativo = {
  readonly id: string;
  readonly disciplina: string;
  readonly titulo: string;
  readonly texto: string;
  readonly href: string;
  readonly acao: string;
};

export const EDUCACAO_CAMINHOS: readonly CaminhoEducativo[] = [
  {
    id: "matematica",
    disciplina: "Matemática e estatística",
    titulo: "Um conjunto de dados reais, com o método à vista",
    texto:
      "Cada indicador aparece com a sua regra de cálculo, a base sobre a qual foi apurado e o que ele deliberadamente não mede. Dá para discutir denominador, amostra pequena, período de baixa visitação e por que um percentual sem base é um número sem sentido — em cima de dados sobre a própria região.",
    href: "/dados",
    acao: "Ver os dados e seus limites",
  },
  {
    id: "geografia",
    disciplina: "Geografia",
    titulo: "O recorte desenhado sobre a malha oficial",
    texto:
      "Os municípios do recorte aparecem sobre a malha municipal do IBGE, com os lugares visitados em campo na posição confirmada. A leitura em texto está sempre disponível ao lado do mapa, para uso em sala sem depender de tela grande.",
    href: "/territorio",
    acao: "Abrir a cartografia",
  },
  {
    id: "historia",
    disciplina: "História e cultura local",
    titulo: "Fontes primárias sobre o próprio território",
    texto:
      "Entrevistas gravadas com responsáveis por equipamentos culturais e por políticas públicas, com transcrição integral, e relatórios técnicos sobre cada lugar. É material de fonte primária sobre memória, patrimônio e trabalho na região.",
    href: "/acervo",
    acao: "Percorrer o acervo",
  },
  {
    id: "linguagens",
    disciplina: "Linguagens",
    titulo: "A mesma pesquisa contada em áudio, e por escrito",
    texto:
      "O PodObservar conta a pesquisa em linguagem de comunicação popular, e cada episódio tem transcrição revisada. Comparar o que o áudio diz com o que o relatório técnico registra é um exercício de gênero textual com fonte de verdade.",
    href: "/podobservar",
    acao: "Ouvir e ler os episódios",
  },
  {
    id: "metodo",
    disciplina: "Método científico",
    titulo: "Uma pesquisa que mostra como foi feita",
    texto:
      "O percurso está publicado: objetivo, recorte, quem foi a campo, com que instrumentos, em que período e com que limites declarados. É um estudo de caso de pesquisa aplicada, do desenho à publicação dos resultados.",
    href: "/pesquisa",
    acao: "Ver o percurso da pesquisa",
  },
];

export const EDUCACAO_COMO_USAR: readonly ItemDeclarado[] = [
  {
    titulo: "Não é preciso pedir autorização",
    texto:
      "Todo material listado é público, com endereço permanente e sem login. A licença está declarada por arquivo, na ficha de cada um.",
    prova: null,
  },
  {
    titulo: "Cite o recorte junto com o número",
    texto:
      "Os dados descrevem dois equipamentos culturais de Tobias Barreto num período de cinco meses. Usado sem essa moldura, qualquer valor daqui vira uma afirmação maior do que a pesquisa sustenta — e reparar nisso já é parte do exercício.",
    prova: null,
  },
  {
    titulo: "Material que funciona sem internet em sala",
    texto:
      "Os arquivos podem ser baixados antes da aula. A Prestação de Contas tem versão imprimível, e os relatórios e planilhas são arquivos comuns, que abrem em qualquer computador.",
    prova: null,
  },
  {
    titulo: "Os áudios têm transcrição",
    texto:
      "Cada episódio do PodObservar traz a transcrição integral revisada, o que permite usar o conteúdo em sala sem depender de som, e distribuí-lo como texto.",
    prova: null,
  },
];
