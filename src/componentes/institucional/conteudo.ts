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
  /**
   * Trecho do texto que é, ele mesmo, o caminho: quando o texto manda a
   * pessoa a outra página, o nome da página vira link ali, no contexto. O
   * trecho precisa existir literalmente em `texto`; se não existir, a página
   * falha em build em vez de perder o link em silêncio.
   */
  readonly destino?: { readonly trecho: string; readonly href: string };
};

/* ──────────────────────────────── privacidade ─────────────────────────── */

export const PRIVACIDADE_SINTESE =
  "Este site não usa cookies e não pede nenhum dado seu. Ele mede audiência " +
  "de forma agregada, para saber quantas pessoas leem cada página, e essa " +
  "medição não identifica ninguém. As preferências de tema, movimento e " +
  "tamanho do texto ficam no seu navegador e não saem dali.";

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
    prova: "Ativa em todas as páginas do site",
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
      "Três preferências locais: tema, redução de animações e tamanho do texto. Elas ficam no seu aparelho para as próximas visitas e nunca são enviadas a lugar nenhum. Você pode restaurá-las na Central de Acessibilidade ou limpar os dados do site. A medição de audiência não grava nada aqui.",
    prova: "Central de Acessibilidade, no cabeçalho",
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
    destino: { trecho: "página de Contato", href: "/contato" },
  },
];
