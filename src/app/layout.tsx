import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono, Literata } from "next/font/google";
import { Cabecalho } from "../componentes/layout/Cabecalho";
import { PularConteudo } from "../componentes/layout/PularConteudo";
import { Rodape } from "../componentes/layout/Rodape";
import { ID_CONTEUDO } from "../lib/navegacao";
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
 * `latin-ext` entra junto de `latin` por causa dos diacríticos do português.
 */
const archivo = Archivo({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-display",
});

const literata = Literata({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-leitura",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Observatório do Vale do Rio Real",
  description: "Arquivo público do Observatório do Vale do Rio Real.",
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
    >
      <body className="flex min-h-screen flex-col">
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
      </body>
    </html>
  );
}
