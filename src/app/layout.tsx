import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono, Literata } from "next/font/google";
import { Cabecalho } from "../componentes/layout/Cabecalho";
import { CSS_DO_CABECALHO } from "../componentes/layout/estilosCabecalho";
import { PularConteudo } from "../componentes/layout/PularConteudo";
import { Rodape } from "../componentes/layout/Rodape";
import { ID_CONTEUDO } from "../lib/navegacao";
import { metadadosDaRota, obterSiteUrl } from "../lib/site-url";
import { SCRIPT_TEMA_INICIAL } from "../lib/tema";
import "../estilos/tokens.css";

/**
 * Fontes do projeto (doc 03 §3).
 *
 * `next/font` baixa e auto-hospeda os arquivos no build: nenhuma requisição sai
 * para o Google em tempo de execução, o que atende ao "sem rastreadores de
 * terceiros" do doc 01 §7.
 *
 * O nome da variável CSS de cada fonte é exatamente o token que o
 * `tokens.css` já declara — `--font-display`, `--font-leitura`, `--font-mono`.
 * Assim as classes aplicadas no `<html>` sobrescrevem os valores do `@theme`
 * com a família auto-hospedada, e o `tokens.css` não precisa ser tocado: a
 * lista original continua valendo como fallback se a fonte não carregar.
 *
 * **Só o subset `latin`.** A auditoria 10B.3.2 mediu: `latin-ext` custava
 * 94.136 bytes por visita, um quarto do peso da Home, e não é necessário para o
 * português. As faixas Unicode do CSS gerado mostram que a face `latin` cobre
 * `U+??` — U+0000 a U+00FF —, e todo diacrítico do português vive entre U+00C0 e
 * U+00FC: á à â ã ç é ê í ó ô õ ú ü e as maiúsculas. A mesma face traz
 * `U+2000-206F`, que cobre travessão, reticências e aspas tipográficas da copy.
 * `latin-ext` serve a línguas do Leste Europeu.
 *
 * Ressalva registrada: nome próprio com caractere fora do Latin-1, numa citação
 * bibliográfica por exemplo, cai na fonte de fallback naquele glifo.
 */
const archivo = Archivo({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

const literata = Literata({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-leitura",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: obterSiteUrl(),
  ...metadadosDaRota({
    pathname: "/",
    titulo: "Observatório do Vale do Rio Real",
    descricao: "Arquivo público do Observatório do Vale do Rio Real.",
  }),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${archivo.variable} ${literata.variable} ${plexMono.variable}`}
      /*
        O script abaixo escreve `data-tema` no `<html>` antes da hidratação,
        e o servidor não tem como prever o que este navegador salvou. Sem
        `suppressHydrationWarning`, o React reclamaria de um atributo que ele
        não renderizou. A supressão vale **só para este elemento** e não
        alcança nada dentro dele.
      */
      suppressHydrationWarning
    >
      <head>
        {/*
          Preferência manual de tema, aplicada antes da primeira pintura.

          É o único script inline do projeto, e a exceção é justificada: sem
          ele, quem escolheu o tema escuro veria um lampejo claro a cada
          navegação, porque o HTML sai do servidor sem saber da escolha.

          Não faz rede, não grava cookie e não rastreia nada — o que o
          `AGENTS.md` proíbe é script de terceiro que rastreie. O conteúdo vem
          de `src/lib/tema.ts`, para que a chave de armazenamento exista em um
          lugar só.

          Sem escolha manual salva, o script não toca no DOM e o
          `prefers-color-scheme` do `tokens.css` decide sozinho — que é o
          comportamento aprovado para a primeira visita.
        */}
        {/*
          `dangerouslySetInnerHTML` é o único jeito de emitir um script inline
          síncrono aqui. O conteúdo é uma constante do próprio projeto, sem
          nenhuma entrada externa interpolada — o risco que o nome do atributo
          adverte não existe neste uso.
        */}
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA_INICIAL }} />
      </head>
      <body className="flex min-h-screen flex-col">
        <style>{CSS_DO_CABECALHO}</style>
        <PularConteudo />
        <Cabecalho />
        {/*
          O `<main>` vive aqui, e não em cada página: assim o alvo do link de
          pular existe em toda rota, e nenhuma página precisa lembrar de
          declarar o id. As páginas devolvem só o conteúdo.
        */}
        <main id={ID_CONTEUDO} className="flex-1">
          {children}
        </main>
        <Rodape />
        {/*
          Vercel Web Analytics — medição agregada de audiência.

          Por que isto não viola o "sem rastreador de terceiro" do `AGENTS.md`
          e da `/privacidade`:

          - **Sem cookie e sem armazenamento.** O script não escreve cookie,
            `localStorage` nem `sessionStorage`. A única chave gravada por este
            site continua sendo a preferência de tema (`src/lib/tema.ts`).
          - **Sem identificador de pessoa.** Não há `userId`, e-mail, nome,
            fingerprint próprio nem evento com dado pessoal. Nenhum evento
            customizado é emitido: só a visualização de página automática.
          - **Mesma origem.** O `src` é sempre um caminho deste domínio:
            `/_vercel/insights/script.js` por padrão, ou o caminho por build do
            *Resilient Intake* da versão 2, que a Vercel injeta em
            `NEXT_PUBLIC_VERCEL_OBSERVABILITY_CLIENT_CONFIG`. Em nenhum dos dois
            casos sai requisição para um host de terceiro enquanto a pessoa lê.
          - **Identificação por hash do pedido, descartada em 24 h.** É o
            mecanismo documentado pela Vercel para contar visitante sem cookie
            e sem identificador persistente.

          O doc 01 §7 já previa "analytics sem cookies" como requisito de
          privacidade; esta é a execução dele. Decisão registrada na ADR-022.

          O componente vem com `"use client"` de fábrica e devolve `null`: não
          renderiza marcação, não desloca layout e não converte nada em volta
          dele em Client Component. Fica ao fim do `<body>`, depois do rodapé,
          para não competir com a pintura do conteúdo.
        */}
        <Analytics />
      </body>
    </html>
  );
}
