/**
 * Preferência de tema — Fase H0.
 *
 * Módulo **puro**: sem `"use client"`, sem React, sem acesso direto a
 * `window`. Ele descreve as regras do tema; quem as aplica é o CSS de
 * `tokens.css` e o script mínimo que o layout injeta no `<head>`.
 *
 * ## Por que não existe Client Component aqui
 *
 * A H0 entrega a **fundação**, não a Central de Acessibilidade. O tema já
 * funciona por completo sem JavaScript: `tokens.css` resolve claro, escuro e
 * `prefers-color-scheme` na própria cascata. O que precisa de navegador é
 * apenas ler a escolha manual salva antes da primeira pintura — e isso é um
 * script inline de ~130 bytes, não um componente.
 *
 * Sem interface para trocar o tema, um provedor de estado não teria o que
 * prover. A UI entra na H4, e vai importar estas funções em vez de
 * reimplementá-las.
 *
 * ## Três estados, não dois
 *
 * `sistema` não é "claro". É a ausência de escolha manual, e é o padrão: na
 * primeira visita o site segue o sistema operacional (decisão humana,
 * Direção Visual §5.4). Só depois de uma escolha explícita o site passa a
 * contrariar o sistema — e é isso que `data-tema` no `<html>` significa.
 */

/** Chave do armazenamento local. Namespaced para não colidir. */
export const CHAVE_TEMA = "observatorio-tema";

/** Atributo que o `<html>` recebe quando há escolha manual. */
export const ATRIBUTO_TEMA = "data-tema";

export const TEMAS = ["sistema", "claro", "escuro"] as const;

export type Tema = (typeof TEMAS)[number];

/**
 * Padrão do projeto. `sistema` porque a primeira visita segue
 * `prefers-color-scheme`, sem perguntar nada.
 */
export const TEMA_PADRAO: Tema = "sistema";

export function ehTema(valor: unknown): valor is Tema {
  return (
    typeof valor === "string" && (TEMAS as readonly string[]).includes(valor)
  );
}

/**
 * Interpreta o que veio do armazenamento local.
 *
 * Valor ausente, corrompido, de outra versão ou escrito por outra aba cai em
 * `sistema`. Nunca lança: armazenamento é entrada externa, e entrada externa
 * inválida vira o padrão, não uma exceção no caminho de renderização.
 */
export function temaArmazenado(bruto: string | null | undefined): Tema {
  return ehTema(bruto) ? bruto : TEMA_PADRAO;
}

/**
 * Valor do atributo `data-tema` para um tema.
 *
 * `sistema` devolve `null` — e `null` significa **remover o atributo**, não
 * escrever a string "sistema". Sem atributo, a media query de
 * `prefers-color-scheme` volta a decidir, que é exatamente o que "sistema"
 * quer dizer. Um atributo com valor desconhecido não casaria com nenhum
 * seletor e o efeito seria o mesmo por acidente; aqui é por contrato.
 */
export function atributoDoTema(tema: Tema): "claro" | "escuro" | null {
  return tema === "sistema" ? null : tema;
}

/**
 * Script que roda **antes da primeira pintura**, no `<head>`.
 *
 * É a única forma de evitar o flash: os Server Components não têm como saber
 * o que este navegador salvou, então o HTML sai sempre sem `data-tema`. Se a
 * escolha manual só fosse aplicada depois da hidratação, quem escolheu escuro
 * veria um lampejo claro em toda navegação.
 *
 * Restrições que o script respeita:
 *
 * - **síncrono e inline**, senão a pintura acontece antes dele;
 * - **`try/catch` obrigatório**: `localStorage` não devolve vazio em modo
 *   restrito — ele **lança**. Sem o `catch`, a página inteira quebraria para
 *   quem bloqueia armazenamento;
 * - **só escreve o atributo quando há escolha manual**. Em `sistema` não toca
 *   no DOM, e o CSS decide sozinho;
 * - **nenhuma rede, nenhum cookie, nenhum rastreio** — o que o projeto
 *   proíbe é script de terceiro que rastreie; este é próprio e local.
 *
 * A string é montada a partir das constantes acima de propósito: a chave e os
 * valores existem em um lugar só, e o teste que confere isso impede que o
 * script e o módulo divirjam em silêncio.
 */
export const SCRIPT_TEMA_INICIAL = `try{var d=document.documentElement,t=localStorage.getItem(${JSON.stringify(
  CHAVE_TEMA,
)});if(t==="claro"||t==="escuro")d.setAttribute(${JSON.stringify(
  ATRIBUTO_TEMA,
)},t)}catch(e){}`;
