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
  "externa e não tem selo de certificação. Os recursos disponíveis e as " +
  "limitações conhecidas estão descritos abaixo.";

export const ACESSIBILIDADE_RECURSOS: readonly ItemDeclarado[] = [
  {
    titulo: "Navegação inteira por teclado",
    texto:
      "Todo link, botão e controle é alcançável por Tab, na ordem em que aparece na página. O primeiro elemento de cada página é um link para pular direto ao conteúdo, sem percorrer o menu.",
    prova: "Experimente percorrer esta página com a tecla Tab",
  },
  {
    titulo: "Foco sempre visível",
    texto:
      "O elemento em foco recebe um contorno de 3 px que muda de cor conforme o tema, para não desaparecer sobre fundo escuro. Nenhum estilo do site remove o indicador de foco.",
    prova: "Use Tab para ver o contorno nos links e controles",
  },
  {
    titulo: "Contraste conferido, não estimado",
    texto:
      "As combinações de cor de texto e fundo são medidas e precisam alcançar a razão mínima de 4,5:1 do nível AA. Cor nunca é o único canal de informação: nos gráficos, série e categoria se distinguem também por forma e por texto escrito ao lado.",
    prova: null,
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
    prova: "Ative a redução de movimento nas preferências do seu aparelho",
  },
  {
    titulo: "Estrutura semântica de verdade",
    texto:
      "Cada página tem um único h1 e uma hierarquia de títulos sem saltos. As tabelas são tabelas, com cabeçalho declarado; as listas são listas; cada região da página tem nome acessível. Em telas estreitas a tabela de anexos vira ficha por CSS, sem trocar a marcação — a semântica não se perde no caminho.",
    prova: null,
  },
  {
    titulo: "Toda imagem com texto alternativo",
    texto:
      "Nenhuma imagem é publicada sem alternativa textual. As fotografias de campo trazem, além do texto alternativo, legenda visível e crédito de autoria quando ele é conhecido.",
    prova: "Fotografias de campo com legenda e texto alternativo no Acervo",
  },
  {
    titulo: "Todo áudio com transcrição",
    texto:
      "Nenhum áudio é publicado sem transcrição vinculada. Os episódios do PodObservar trazem transcrição revisada e integral, legível na própria página — quem não pode ouvir, lê o mesmo conteúdo.",
    prova: "Transcrição integral na página de cada episódio",
  },
  {
    titulo: "O mapa funciona pelo teclado, e o conteúdo existe sem ele",
    texto:
      "O percurso pelos lugares do Território é uma lista de abas com uma única parada de Tab: as setas andam entre os lugares e o estado selecionado é anunciado. Sem JavaScript, a página do Território continua trazendo o conteúdo essencial em texto, e a leitura dos municípios do recorte está sempre disponível em lista.",
    prova: "Lista de lugares e municípios na página Território",
  },
  {
    titulo: "Leitura em zoom, e em tela pequena",
    texto:
      "As páginas são conferidas em 320, 375, 768, 1024, 1440 px sem rolagem horizontal, e a tipografia dos números cresce com a largura do próprio bloco, para não estourar a caixa em zoom de 200%.",
    prova: null,
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
      "Nenhuma entidade independente avaliou o site. Os recursos descritos aqui não equivalem a uma certificação de acessibilidade.",
    prova: null,
  },
  {
    titulo: "Ajuste de tamanho de texto e alto contraste não existem",
    texto:
      "A Central de Acessibilidade não oferece controle de tamanho de texto nem modo dedicado de alto contraste. O zoom do próprio navegador continua disponível em todas as páginas.",
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
  "Este site não usa cookies e não pede nenhum dado seu. Ele mede audiência " +
  "de forma agregada, para saber quantas pessoas leem cada página, e essa " +
  "medição não identifica ninguém. O que ele guarda no seu navegador é uma " +
  "preferência de tema, e ela não sai dali.";

export const PRIVACIDADE_ABERTURA =
  "Veja quais dados este site usa durante a navegação, o que fica no seu " +
  "aparelho e o que acontece ao abrir links para outros serviços.";

export const PRIVACIDADE_NAVEGACAO: readonly ItemDeclarado[] = [
  {
    titulo: "Nenhum cookie",
    texto:
      "O site não grava cookie nenhum — nem de sessão, nem de preferência, nem de terceiro. A medição de audiência descrita abaixo também funciona sem cookie. Por isso não existe aviso de cookies aqui: não há nada a consentir.",
    prova: null,
  },
  {
    titulo: "Uma medição de audiência, agregada e sem cookie",
    texto:
      "O site usa o Vercel Web Analytics, do mesmo serviço que hospeda estas páginas, para saber quantas pessoas leem o material publicado e quais páginas elas procuram. A cada acesso são registrados o horário, a página visitada, o endereço que trouxe você até aqui, uma localização aproximada derivada da rede — o painel do projeto trabalha sobretudo no nível de país —, o tipo de aparelho, o navegador e o sistema operacional. São esses os dados que o serviço disponibiliza, e eles são lidos em conjunto, como contagem.",
    prova: "Componente Analytics, no layout raiz do site",
  },
  {
    titulo: "O que essa medição não recebe",
    texto:
      "Ela não recebe seu nome, e-mail, telefone ou endereço residencial, não usa GPS nem localização exata, não cria perfil seu e não acompanha sua navegação fora deste site. Não há cookie nem identificador que sobreviva à visita: quem acessa é distinguido por um código derivado do próprio pedido de rede, que o serviço descarta depois de 24 horas. O projeto não configurou nenhum evento personalizado e não envia nada além da visualização de página.",
    prova: null,
  },
  {
    titulo: "Nenhum outro analytics e nenhum rastreador de publicidade",
    texto:
      "Não há Google Analytics, pixel de rede social, tag manager, mapa de calor nem gravação de sessão. A medição descrita acima é a única, e nada do que ela reúne é vendido, cruzado com outra base ou usado para anúncio.",
    prova: null,
  },
  {
    titulo: "Todo código vem deste domínio",
    texto:
      "O script da medição de audiência é servido por um endereço deste próprio site, e não por um domínio de terceiro. As fontes tipográficas também são servidas daqui: nenhuma requisição sai para o Google enquanto você lê. Fora esses dois, nenhum outro código executa no seu navegador.",
    prova: null,
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
    prova: "Links de escuta na página de cada episódio",
  },
  {
    titulo: "O que fica gravado no seu navegador",
    texto:
      "Uma única chave de armazenamento local, com a sua escolha de tema — claro, escuro ou seguir o sistema. Ela existe para que a escolha sobreviva à próxima visita, fica no seu aparelho, nunca é enviada a lugar nenhum e desaparece quando você limpa os dados do site. A medição de audiência não grava nada aqui.",
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
      "Como em qualquer site, o servidor que entrega as páginas processa o endereço de IP e o tipo de navegador de quem as pede — é o mínimo técnico para que uma página chegue até você. O projeto não tem acesso a esses registros brutos, não os cruza com nada e não os publica. A medição de audiência fica de outro lado dessa fronteira: ela não guarda o IP, e é dele que deriva, já convertida em código descartável, a localização aproximada que o painel mostra.",
    prova: null,
  },
  {
    titulo: "O site é gerado antes de você chegar",
    texto:
      "As páginas chegam prontas ao seu navegador. Nenhuma consulta ao banco de dados acontece enquanto você navega, e nenhuma informação sua chega a ele.",
    prova: null,
  },
];

export const PRIVACIDADE_PESQUISA: readonly ItemDeclarado[] = [
  {
    titulo: "Dados de quem participou da pesquisa",
    texto:
      "O acervo publica material produzido em campo entre 2025 e 2026: relatórios, fotografias, entrevistas gravadas com transcrição e planilhas de resposta. Os arquivos públicos passaram por revisão de privacidade e por uma verificação automatizada de CPF, telefone e marca de assinatura.",
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
